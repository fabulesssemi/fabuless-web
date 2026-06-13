/**
 * Combined retrieval for the Fabuless chatbot.
 *
 * Pulls supplementary context from the Baker + Circuit chunk tables (the Dylan
 * lens is retired). Unlike the old per-person lenses, this NEVER refuses: chunks
 * are optional enrichment on top of Claude's own knowledge. If nothing relevant
 * comes back, we simply return [] and let Claude answer from its own knowledge.
 *
 * Flow: query rewrite (Haiku) → hybrid vector+keyword search across both tables
 * → Reciprocal Rank Fusion → Cohere rerank → top K chunks.
 */

import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@supabase/supabase-js";

export interface ContextChunk {
  id: string;
  text: string;
  date: string;
}

export interface ChatTurn {
  question: string;
  answer: string;
}

function getSupabase() {
  return createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}

const VECTOR_CANDIDATES = 15;
const KEYWORD_CANDIDATES = 15;
const FINAL_TOP_K = 6; // blended chunks handed to Claude as background context
const RRF_K = 60;

// The two corpora we still retrieve from. Each entry maps to its Supabase RPCs.
const CORPORA = [
  { vector: "match_baker_chunks",   keyword: "keyword_search_baker_chunks" },
  { vector: "match_circuit_chunks", keyword: "keyword_search_circuit_chunks" },
] as const;

// ─── Query rewriting ─────────────────────────────────────────────────────────

async function rewriteQuery(userQuestion: string, history: ChatTurn[] = []): Promise<string[]> {
  try {
    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    const contextSummary = history.length > 0
      ? `Recent conversation:\n${history.slice(-3).map((t) => `Q: ${t.question}\nA: ${t.answer.slice(0, 160)}...`).join("\n\n")}\n\n`
      : "";

    const response = await anthropic.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 256,
      messages: [{
        role: "user",
        content: `You are a search query optimizer for a semiconductor investment knowledge base.

${contextSummary}Rewrite this question into exactly 3 search queries that target different angles. If the question is vague ("explain more", "go deeper"), use the conversation context to infer the topic.

Question: "${userQuestion}"

Respond with ONLY a JSON array of 3 strings. No explanation.`,
      }],
    });
    const text = response.content[0]?.type === "text" ? response.content[0].text : "";
    const queries = JSON.parse(text.trim());
    if (Array.isArray(queries) && queries.length > 0) return [userQuestion, ...queries];
  } catch {
    // fall through
  }
  return [userQuestion];
}

// ─── Embedding ───────────────────────────────────────────────────────────────

async function embedQuery(text: string): Promise<number[] | null> {
  const apiKey = process.env.COHERE_API_KEY;
  if (!apiKey) return null;
  try {
    const response = await fetch("https://api.cohere.com/v2/embed", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: "embed-english-v3.0",
        texts: [text],
        input_type: "search_query",
        embedding_types: ["float"],
      }),
    });
    if (!response.ok) return null;
    const json = await response.json();
    return json.embeddings.float[0];
  } catch {
    return null;
  }
}

// ─── Search helpers ──────────────────────────────────────────────────────────

async function vectorSearch(rpc: string, embedding: number[]): Promise<any[]> {
  try {
    const { data } = await getSupabase().rpc(rpc, {
      query_embedding: embedding,
      match_count: VECTOR_CANDIDATES,
      date_from: null,
      date_to: null,
    });
    return data ?? [];
  } catch {
    return [];
  }
}

async function keywordSearch(rpc: string, queryText: string): Promise<any[]> {
  try {
    const { data } = await getSupabase().rpc(rpc, {
      query_text: queryText,
      match_count: KEYWORD_CANDIDATES,
      date_from: null,
      date_to: null,
    });
    return data ?? [];
  } catch {
    return [];
  }
}

function reciprocalRankFusion(rankedLists: any[][]): any[] {
  const scores = new Map<string, { row: any; score: number }>();
  for (const list of rankedLists) {
    list.forEach((row, rank) => {
      const rrf = 1 / (rank + RRF_K);
      const key = String(row.id);
      if (!scores.has(key)) scores.set(key, { row, score: rrf });
      else scores.get(key)!.score += rrf;
    });
  }
  return Array.from(scores.values())
    .sort((a, b) => b.score - a.score)
    .map(({ row, score }) => ({ ...row, rrfScore: score }));
}

async function rerank(question: string, candidates: any[]): Promise<any[]> {
  const apiKey = process.env.COHERE_API_KEY;
  if (!apiKey || candidates.length === 0) {
    return candidates
      .sort((a, b) => (b.rrfScore ?? 0) - (a.rrfScore ?? 0))
      .slice(0, FINAL_TOP_K);
  }
  try {
    const response = await fetch("https://api.cohere.com/v2/rerank", {
      method: "POST",
      headers: { "Authorization": `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "rerank-english-v3.0",
        query: question,
        documents: candidates.map((c) => c.text),
        top_n: Math.min(FINAL_TOP_K, candidates.length),
      }),
    });
    const json = await response.json();
    if (!json.results) return candidates.slice(0, FINAL_TOP_K);
    return json.results.map((r: any) => candidates[r.index]);
  } catch {
    return candidates.slice(0, FINAL_TOP_K);
  }
}

// ─── Public ──────────────────────────────────────────────────────────────────

/**
 * Retrieve supplementary context chunks. Never throws, never refuses — returns
 * [] when nothing relevant is found, and the caller answers from Claude's own
 * knowledge alone.
 */
export async function retrieveContext(
  userQuestion: string,
  history: ChatTurn[] = [],
): Promise<ContextChunk[]> {
  try {
    const queries = await rewriteQuery(userQuestion, history);
    const embeddings = await Promise.all(queries.map((q) => embedQuery(q)));

    const rankedLists: any[][] = [];
    await Promise.all(
      CORPORA.map(async ({ vector, keyword }) => {
        const [vecLists, kwLists] = await Promise.all([
          Promise.all(embeddings.map((emb) => (emb ? vectorSearch(vector, emb) : Promise.resolve([])))),
          Promise.all(queries.map((q) => keywordSearch(keyword, q))),
        ]);
        rankedLists.push(...vecLists, ...kwLists);
      }),
    );

    const candidates = reciprocalRankFusion(rankedLists);
    if (candidates.length === 0) return [];

    const reranked = await rerank(userQuestion, candidates);
    return reranked.map((row) => ({
      id: String(row.id),
      text: row.text,
      date: row.date,
    }));
  } catch {
    return [];
  }
}
