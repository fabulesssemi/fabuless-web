/**
 * Shared conversation management utilities.
 *
 * 1. summarizeHistory   — compress old turns into a paragraph after 5+ turns
 * 2. detectIntent       — classify message as new_topic / follow_up / clarification
 * 3. generateFollowUps  — suggest 2-3 natural next questions after an answer
 */

import Anthropic from "@anthropic-ai/sdk";
import { ConversationTurn } from "../baker/query";

export type Intent = "new_topic" | "follow_up" | "clarification";

const anthropic = () => new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// ─── 1. Conversation Summarization ───────────────────────────────────────────
// Called when history reaches 5+ turns. Compresses into one short paragraph
// so we don't keep passing an ever-growing context window to Claude.

export async function summarizeHistory(history: ConversationTurn[]): Promise<string> {
  const formatted = history
    .map((t, i) => `Turn ${i + 1}:\nQ: ${t.question}\nA: ${t.answer}`)
    .join("\n\n");

  const response = await anthropic().messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 256,
    messages: [{
      role: "user",
      content: `Summarize this conversation into 2-3 sentences capturing the key topics discussed and conclusions reached. Be specific — include company names, frameworks, and key facts mentioned.

${formatted}

Summary (2-3 sentences, specific and factual):`,
    }],
  });

  return response.content[0].type === "text" ? response.content[0].text.trim() : "";
}

// ─── 2. Intent Detection ─────────────────────────────────────────────────────
// Classifies the user's message before retrieval so we can optimize:
//   new_topic     → full retrieval pipeline
//   follow_up     → reuse previous chunks + light retrieval
//   clarification → skip retrieval, answer from conversation context only

export async function detectIntent(
  question: string,
  history: ConversationTurn[]
): Promise<Intent> {
  if (history.length === 0) return "new_topic";

  const lastTurn = history[history.length - 1];

  const response = await anthropic().messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 16,
    messages: [{
      role: "user",
      content: `Classify this user message into exactly one category.

Previous question: "${lastTurn.question}"
Previous answer (excerpt): "${lastTurn.answer.slice(0, 300)}..."
New message: "${question}"

Categories:
- new_topic: asks about a completely different subject, company, or concept
- follow_up: asks for more detail, deeper explanation, or expands on the previous topic
- clarification: asks what something means, to simplify, or to explain a term from the previous answer

Reply with ONLY one word: new_topic, follow_up, or clarification`,
    }],
  });

  const raw = response.content[0].type === "text"
    ? response.content[0].text.trim().toLowerCase()
    : "new_topic";

  if (raw.includes("follow_up") || raw.includes("follow up")) return "follow_up";
  if (raw.includes("clarification")) return "clarification";
  return "new_topic";
}

// ─── 3. Suggested Follow-up Questions ────────────────────────────────────────
// After each answer, generate 2-3 natural next questions the user might ask.
// Keeps the conversation going and guides users to the best questions.

export async function generateFollowUps(
  question: string,
  answer: string,
  domainContext: string  // e.g. "semiconductor supply chain" or "growth investing"
): Promise<string[]> {
  const response = await anthropic().messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 192,
    messages: [{
      role: "user",
      content: `Given this Q&A about ${domainContext}, suggest 2-3 natural follow-up questions a user might want to ask next. Make them specific, not generic.

Q: ${question}
A: ${answer.slice(0, 400)}...

Respond with ONLY a JSON array of 2-3 question strings. No explanation.
Example: ["What's AMD's position in this market?", "How does this affect TSMC's pricing power?"]`,
    }],
  });

  const text = response.content[0].type === "text" ? response.content[0].text.trim() : "[]";
  try {
    const questions = JSON.parse(text);
    if (Array.isArray(questions)) return questions.slice(0, 3);
  } catch {
    // parse failed — return empty
  }
  return [];
}
