import Anthropic from "@anthropic-ai/sdk";
import { DYLAN_PATEL_LENS_SYSTEM_PROMPT } from "./system-prompt";
import { runGuardrail } from "../shared/guardrail";
import { formatSourceName } from "../shared/format-source";
import { summarizeHistory, detectIntent, generateFollowUps } from "../shared/conversation";

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

export interface DylanPatelLensResponse {
  answer: string;
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
  usedChunks: TranscriptChunk[];   // returned so follow-up queries can reuse them
  intent: string;
}

const SUMMARY_THRESHOLD = 5;  // compress history after this many turns

export async function queryDylanPatelLens(
  userQuestion: string,
  relevantChunks: TranscriptChunk[],
  belowThreshold: boolean = false,
  conversationHistory: ConversationTurn[] = [],
  previousChunks: TranscriptChunk[] = []   // chunks from last turn, for follow-up reuse
): Promise<DylanPatelLensResponse> {

  // ── Intent detection ──────────────────────────────────────────────────────
  const intent = await detectIntent(userQuestion, conversationHistory);

  // ── Chunk selection based on intent ──────────────────────────────────────
  // clarification: skip retrieval entirely, use previous chunks
  // follow_up: blend new chunks with previous for richer context
  // new_topic: use fresh retrieved chunks only
  let chunksToUse: TranscriptChunk[];
  if (intent === "clarification" && previousChunks.length > 0) {
    chunksToUse = previousChunks;
  } else if (intent === "follow_up" && previousChunks.length > 0) {
    // Merge new + previous, dedupe by id, take top 8
    const seen = new Set<string>();
    chunksToUse = [...relevantChunks, ...previousChunks]
      .filter(c => { if (seen.has(c.id)) return false; seen.add(c.id); return true; })
      .slice(0, 8);
  } else {
    chunksToUse = relevantChunks;
  }

  if (chunksToUse.length === 0 || (belowThreshold && intent === "new_topic")) {
    return {
      answer: "The available source material doesn't cover this with enough depth to give a confident answer.",
      citations: [],
      isInference: false,
      guardrailPassed: true,
      unsupportedClaims: [],
      suggestedFollowUps: [],
      usedChunks: [],
      intent,
    };
  }

  // ── Conversation history management ──────────────────────────────────────
  // Summarize if history is long to keep token costs low
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
        text: DYLAN_PATEL_LENS_SYSTEM_PROMPT,
        cache_control: { type: "ephemeral" },
      },
    ],
    messages,
  } as any);

  let answer = "";
  const citations: DylanPatelLensResponse["citations"] = [];
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

  const isInference =
    answer.includes("doesn't address this directly") ||
    answer.includes("would likely") ||
    answer.includes("doesn't cover this");

  // Run guardrail and follow-up generation truly in parallel — guardrail is
  // expensive (Haiku call), follow-ups are also a Haiku call. Running both
  // concurrently saves ~300-500ms on inference answers.
  const [guardrailResult, suggestedFollowUps] = await Promise.all([
    isInference
      ? runGuardrail(answer, sortedChunks.map((c) => c.text))
      : Promise.resolve({ passed: true, unsupportedClaims: [] }),
    generateFollowUps(userQuestion, answer, "semiconductor supply chain and AI infrastructure"),
  ]);

  return {
    answer,
    citations,
    isInference,
    guardrailPassed: guardrailResult.passed,
    unsupportedClaims: guardrailResult.unsupportedClaims,
    suggestedFollowUps,
    usedChunks: sortedChunks,
    intent,
  };
}

export async function streamDylanPatelLens(
  userQuestion: string,
  relevantChunks: TranscriptChunk[],
  belowThreshold: boolean = false,
  conversationHistory: ConversationTurn[] = [],
  previousChunks: TranscriptChunk[] = [],
  onText: (text: string) => void
): Promise<DylanPatelLensResponse> {
  const intent = await detectIntent(userQuestion, conversationHistory);

  let chunksToUse: TranscriptChunk[];
  if (intent === "clarification" && previousChunks.length > 0) {
    chunksToUse = previousChunks;
  } else if (intent === "follow_up" && previousChunks.length > 0) {
    const seen = new Set<string>();
    chunksToUse = [...relevantChunks, ...previousChunks].filter(c => { if (seen.has(c.id)) return false; seen.add(c.id); return true; }).slice(0, 8);
  } else {
    chunksToUse = relevantChunks;
  }

  if (chunksToUse.length === 0 || (belowThreshold && intent === "new_topic")) {
    const msg = "The available source material doesn't cover this with enough depth to give a confident answer.";
    onText(msg);
    return { answer: msg, citations: [], isInference: false, guardrailPassed: true, unsupportedClaims: [], suggestedFollowUps: [], usedChunks: [], intent };
  }

  let historyMessages: Anthropic.MessageParam[] = [];
  if (conversationHistory.length >= SUMMARY_THRESHOLD) {
    const summary = await summarizeHistory(conversationHistory);
    historyMessages = [{ role: "user" as const, content: "Here is a summary of our conversation so far:" }, { role: "assistant" as const, content: summary }];
  } else {
    historyMessages = conversationHistory.flatMap((turn): Anthropic.MessageParam[] => [{ role: "user" as const, content: turn.question }, { role: "assistant" as const, content: turn.answer }]);
  }

  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  const sortedChunks = [...chunksToUse].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const documentBlocks = sortedChunks.map((chunk) => ({ type: "document" as const, source: { type: "text" as const, media_type: "text/plain" as const, data: chunk.text }, title: `${formatSourceName(chunk.source)} (${chunk.date})`, citations: { enabled: true } }));
  const messages: Anthropic.MessageParam[] = [...historyMessages, { role: "user", content: [...documentBlocks, { type: "text" as const, text: userQuestion }] }];

  const stream = anthropic.messages.stream({ model: "claude-sonnet-4-6", max_tokens: 2048, system: [{ type: "text", text: DYLAN_PATEL_LENS_SYSTEM_PROMPT, cache_control: { type: "ephemeral" } }], messages } as any);

  for await (const event of stream) {
    if (event.type === "content_block_delta" && (event.delta as any).type === "text_delta") onText((event.delta as any).text);
  }

  const finalMessage = await stream.finalMessage();
  let answer = "";
  const citations: DylanPatelLensResponse["citations"] = [];
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
      if (chunk && quote && !seenQuotes.has(quote)) { seenQuotes.add(quote); citations.push({ quote, source: formatSourceName(chunk.source), date: chunk.date, url: chunk.url }); }
    }
  }

  const isInference = answer.includes("doesn't address this directly") || answer.includes("would likely") || answer.includes("doesn't cover this");
  const [guardrailResult, suggestedFollowUps] = await Promise.all([
    isInference ? runGuardrail(answer, sortedChunks.map((c) => c.text)) : Promise.resolve({ passed: true, unsupportedClaims: [] }),
    generateFollowUps(userQuestion, answer, "semiconductor supply chain and AI infrastructure"),
  ]);

  return { answer, citations, isInference, guardrailPassed: guardrailResult.passed, unsupportedClaims: guardrailResult.unsupportedClaims, suggestedFollowUps, usedChunks: sortedChunks, intent };
}
