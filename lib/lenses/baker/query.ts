import Anthropic from "@anthropic-ai/sdk";
import { BAKER_LENS_SYSTEM_PROMPT } from "./system-prompt";
import { runGuardrail } from "../shared/guardrail";
import { formatSourceName } from "../shared/format-source";
import { summarizeHistory, detectIntent, generateFollowUps } from "../shared/conversation";
import { RecentNewsItem, buildNewsDocumentBlocks } from "../shared/recent-news";

export interface TranscriptChunk {
  id: string;
  text: string;
  source: string;
  date: string;
  url?: string;
}

export interface ConversationTurn {
  question: string;
  answer: string;
}

export type AnswerTier = "direct" | "inference" | "outside";

export interface BakerLensResponse {
  answer: string;
  answerTier: AnswerTier;
  citations: {
    quote: string;
    source: string;
    date: string;
    url?: string;
  }[];
  isInference: boolean;
  guardrailPassed: boolean;
  unsupportedClaims: string[];
  suggestedFollowUps: string[];
  usedChunks: TranscriptChunk[];
  intent: string;
}

function parseAnswerTier(answer: string): AnswerTier {
  const upper = answer.trimStart().toUpperCase();
  if (upper.startsWith("**BAKER LENS INFERENCE**") || upper.startsWith("BAKER LENS INFERENCE")) return "inference";
  if (upper.startsWith("**OUTSIDE COVERAGE**") || upper.startsWith("OUTSIDE COVERAGE")) return "outside";
  return "direct";
}

const SUMMARY_THRESHOLD = 5;

export async function queryBakerLens(
  userQuestion: string,
  relevantChunks: TranscriptChunk[],
  belowThreshold: boolean = false,
  conversationHistory: ConversationTurn[] = [],
  previousChunks: TranscriptChunk[] = []
): Promise<BakerLensResponse> {

  const intent = await detectIntent(userQuestion, conversationHistory);

  let chunksToUse: TranscriptChunk[];
  if (intent === "clarification" && previousChunks.length > 0) {
    chunksToUse = previousChunks;
  } else if (intent === "follow_up" && previousChunks.length > 0) {
    const seen = new Set<string>();
    chunksToUse = [...relevantChunks, ...previousChunks]
      .filter(c => { if (seen.has(c.id)) return false; seen.add(c.id); return true; })
      .slice(0, 8);
  } else {
    chunksToUse = relevantChunks;
  }

  // Only hard-exit if there is truly zero source material
  if (chunksToUse.length === 0) {
    const msg = "**OUTSIDE COVERAGE**\n\nThis question is outside the available source material. There isn't enough related content to form a useful inference.";
    return {
      answer: msg,
      answerTier: "outside",
      citations: [],
      isInference: false,
      guardrailPassed: true,
      unsupportedClaims: [],
      suggestedFollowUps: [],
      usedChunks: [],
      intent,
    };
  }

  let historyMessages: Anthropic.MessageParam[] = [];
  if (conversationHistory.length >= SUMMARY_THRESHOLD) {
    const summary = await summarizeHistory(conversationHistory);
    historyMessages = [
      { role: "user" as const, content: "Here is a summary of our conversation so far:" },
      { role: "assistant" as const, content: summary },
    ];
  } else {
    historyMessages = conversationHistory.flatMap((turn): Anthropic.MessageParam[] => [
      { role: "user" as const, content: turn.question },
      { role: "assistant" as const, content: turn.answer },
    ]);
  }

  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  const sortedChunks = [...chunksToUse].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const documentBlocks = sortedChunks.map((chunk) => ({
    type: "document" as const,
    source: { type: "text" as const, media_type: "text/plain" as const, data: chunk.text },
    title: `${formatSourceName(chunk.source)} (${chunk.date})`,
    citations: { enabled: true },
  }));

  const messages: Anthropic.MessageParam[] = [
    ...historyMessages,
    {
      role: "user",
      content: [
        ...documentBlocks,
        { type: "text" as const, text: userQuestion },
      ],
    },
  ];

  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 2048,
    system: [
      {
        type: "text",
        text: BAKER_LENS_SYSTEM_PROMPT,
        cache_control: { type: "ephemeral" },
      },
    ],
    messages,
  } as any);

  let answer = "";
  const citations: BakerLensResponse["citations"] = [];
  const seenQuotes = new Set<string>();

  for (const block of response.content) {
    if (block.type !== "text") continue;
    answer += block.text;

    const blockCitations = (block as any).citations;
    if (!Array.isArray(blockCitations)) continue;

    for (const citation of blockCitations) {
      const chunkIndex: number =
        citation.document_index ??
        citation.document_indices?.[0] ??
        -1;
      const chunk = sortedChunks[chunkIndex];
      const quote: string = citation.cited_text ?? citation.quote ?? "";

      if (chunk && quote && !seenQuotes.has(quote)) {
        seenQuotes.add(quote);
        citations.push({
          quote,
          source: formatSourceName(chunk.source),
          date: chunk.date,
          url: chunk.url,
        });
      }
    }
  }

  const answerTier = parseAnswerTier(answer);
  const isInference = answerTier === "inference";

  const [guardrailResult, suggestedFollowUps] = await Promise.all([
    isInference
      ? runGuardrail(answer, sortedChunks.map((c) => c.text))
      : Promise.resolve({ passed: true, unsupportedClaims: [] }),
    generateFollowUps(userQuestion, answer, "growth investing and semiconductor markets"),
  ]);

  return {
    answer,
    answerTier,
    citations,
    isInference,
    guardrailPassed: guardrailResult.passed,
    unsupportedClaims: guardrailResult.unsupportedClaims,
    suggestedFollowUps,
    usedChunks: sortedChunks,
    intent,
  };
}

export async function streamBakerLens(
  userQuestion: string,
  relevantChunks: TranscriptChunk[],
  belowThreshold: boolean = false,
  conversationHistory: ConversationTurn[] = [],
  previousChunks: TranscriptChunk[] = [],
  onText: (text: string) => void,
  recentNews: RecentNewsItem[] = []
): Promise<BakerLensResponse> {
  const intent = await detectIntent(userQuestion, conversationHistory);

  let chunksToUse: TranscriptChunk[];
  if (intent === "clarification" && previousChunks.length > 0) {
    chunksToUse = previousChunks;
  } else if (intent === "follow_up" && previousChunks.length > 0) {
    const seen = new Set<string>();
    chunksToUse = [...relevantChunks, ...previousChunks]
      .filter(c => { if (seen.has(c.id)) return false; seen.add(c.id); return true; })
      .slice(0, 8);
  } else {
    chunksToUse = relevantChunks;
  }

  if (chunksToUse.length === 0) {
    const msg = "**OUTSIDE COVERAGE**\n\nThis question is outside the available source material. There isn't enough related content to form a useful inference.";
    onText(msg);
    return { answer: msg, answerTier: "outside", citations: [], isInference: false, guardrailPassed: true, unsupportedClaims: [], suggestedFollowUps: [], usedChunks: [], intent };
  }

  let historyMessages: Anthropic.MessageParam[] = [];
  if (conversationHistory.length >= SUMMARY_THRESHOLD) {
    const summary = await summarizeHistory(conversationHistory);
    historyMessages = [
      { role: "user" as const, content: "Here is a summary of our conversation so far:" },
      { role: "assistant" as const, content: summary },
    ];
  } else {
    historyMessages = conversationHistory.flatMap((turn): Anthropic.MessageParam[] => [
      { role: "user" as const, content: turn.question },
      { role: "assistant" as const, content: turn.answer },
    ]);
  }

  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  const sortedChunks = [...chunksToUse].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const newsBlocks = buildNewsDocumentBlocks(recentNews);
  const documentBlocks = sortedChunks.map((chunk) => ({
    type: "document" as const,
    source: { type: "text" as const, media_type: "text/plain" as const, data: chunk.text },
    title: `${formatSourceName(chunk.source)} (${chunk.date})`,
    citations: { enabled: true },
  }));

  const messages: Anthropic.MessageParam[] = [
    ...historyMessages,
    { role: "user", content: [...newsBlocks, ...documentBlocks, { type: "text" as const, text: userQuestion }] },
  ];

  const stream = anthropic.messages.stream({
    model: "claude-sonnet-4-6",
    max_tokens: 2048,
    system: [{ type: "text", text: BAKER_LENS_SYSTEM_PROMPT, cache_control: { type: "ephemeral" } }],
    messages,
  } as any);

  for await (const event of stream) {
    if (event.type === "content_block_delta" && (event.delta as any).type === "text_delta") {
      onText((event.delta as any).text);
    }
  }

  const finalMessage = await stream.finalMessage();

  let answer = "";
  const citations: BakerLensResponse["citations"] = [];
  const seenQuotes = new Set<string>();

  for (const block of finalMessage.content) {
    if (block.type !== "text") continue;
    answer += block.text;
    const blockCitations = (block as any).citations;
    if (!Array.isArray(blockCitations)) continue;
    for (const citation of blockCitations) {
      const chunkIndex: number = citation.document_index ?? citation.document_indices?.[0] ?? -1;
      const chunk = sortedChunks[chunkIndex];
      const quote: string = citation.cited_text ?? citation.quote ?? "";
      if (chunk && quote && !seenQuotes.has(quote)) {
        seenQuotes.add(quote);
        citations.push({ quote, source: formatSourceName(chunk.source), date: chunk.date, url: chunk.url });
      }
    }
  }

  const answerTier = parseAnswerTier(answer);
  const isInference = answerTier === "inference";

  const [guardrailResult, suggestedFollowUps] = await Promise.all([
    isInference ? runGuardrail(answer, sortedChunks.map((c) => c.text)) : Promise.resolve({ passed: true, unsupportedClaims: [] }),
    generateFollowUps(userQuestion, answer, "growth investing and semiconductor markets"),
  ]);

  return { answer, answerTier, citations, isInference, guardrailPassed: guardrailResult.passed, unsupportedClaims: guardrailResult.unsupportedClaims, suggestedFollowUps, usedChunks: sortedChunks, intent };
}
