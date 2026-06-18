// Streaming answer generation for the Fabuless chatbot.
// Foundation = Claude's own knowledge. Retrieved chunks are injected as silent
// background context (no citations enabled, never quoted or attributed).

import Anthropic from "@anthropic-ai/sdk";
import { CHAT_SYSTEM_PROMPT } from "./system-prompt";
import type { ContextChunk, ChatTurn } from "./retrieve";

const SUMMARY_THRESHOLD = 6;
const MAX_HISTORY_TURNS = 6;

async function summarizeHistory(history: ChatTurn[]): Promise<string> {
  try {
    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    const transcript = history.map((t) => `Q: ${t.question}\nA: ${t.answer}`).join("\n\n");
    const res = await anthropic.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 400,
      messages: [{ role: "user", content: `Summarize this conversation in 3-4 sentences, preserving the topics and any stock views discussed:\n\n${transcript}` }],
    });
    return res.content[0]?.type === "text" ? res.content[0].text : "";
  } catch {
    return "";
  }
}

/** Stream a chat answer. Calls onText for each token. Returns the full answer. */
export async function streamChat(
  userQuestion: string,
  contextChunks: ContextChunk[],
  history: ChatTurn[],
  currentNews: string | null,
  onText: (text: string) => void,
): Promise<string> {
  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  // Build conversation history — summarize if it's gotten long.
  let historyMessages: Anthropic.MessageParam[] = [];
  if (history.length >= SUMMARY_THRESHOLD) {
    const summary = await summarizeHistory(history);
    if (summary) {
      historyMessages = [
        { role: "user", content: "Here is a summary of our conversation so far:" },
        { role: "assistant", content: summary },
      ];
    }
  } else {
    historyMessages = history.slice(-MAX_HISTORY_TURNS).flatMap((turn): Anthropic.MessageParam[] => [
      { role: "user", content: turn.question },
      { role: "assistant", content: turn.answer },
    ]);
  }

  // Current news injected first so Claude knows what's happening today.
  // RAG chunks follow as deeper background. Citations OFF on both.
  const newsBlock = currentNews
    ? [{
        type: "document" as const,
        source: { type: "text" as const, media_type: "text/plain" as const, data: currentNews },
        title: "Today's semiconductor news headlines",
        citations: { enabled: false },
      }]
    : [];
  const documentBlocks = [
    ...newsBlock,
    ...contextChunks.map((chunk) => ({
      type: "document" as const,
      source: { type: "text" as const, media_type: "text/plain" as const, data: chunk.text },
      title: "Background context",
      citations: { enabled: false },
    })),
  ];

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

  const stream = anthropic.messages.stream({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 1024,
    system: [{ type: "text", text: CHAT_SYSTEM_PROMPT, cache_control: { type: "ephemeral" } }],
    messages,
  } as any);

  let answer = "";
  for await (const event of stream) {
    if (event.type === "content_block_delta" && (event.delta as any).type === "text_delta") {
      const t = (event.delta as any).text as string;
      answer += t;
      onText(t);
    }
  }

  return answer;
}
