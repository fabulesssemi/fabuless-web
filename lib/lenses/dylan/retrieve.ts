/**
 * Retrieval pipeline for The Dylan Patel Lens.
 * Identical architecture to Baker Lens — hits dylan_chunks table instead.
 *
 * Flow:
 * 1. Query rewriting  — Haiku rewrites user question into 3 search queries
 * 2. Hybrid search    — vector similarity + keyword (BM25) for each rewritten query
 * 3. Dedup + merge    — combine results, deduplicate by chunk id
 * 4. Reranking        — Cohere reranks merged candidates by true relevance
 * 5. Return top K     — final chunks passed to Claude for answer generation
 */

import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@supabase/supabase-js";
import { TranscriptChunk, ConversationTurn } from "./query";

function getSupabase() {
  return createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

const VECTOR_CANDIDATES = 20;
const KEYWORD_CANDIDATES = 20;
const FINAL_TOP_K = 8;
const MIN_SIMILARITY_THRESHOLD = 0.45;

export interface RetrievalOptions {
  dateFrom?: string;
  dateTo?: string;
  conversationHistory?: ConversationTurn[];
}

export interface RetrievalResult {
  chunks: TranscriptChunk[];
  belowThreshold: boolean;
}

async function rewriteQuery(userQuestion: string, history: ConversationTurn[] = []): Promise<string[]> {
  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  // Build context summary from recent history so vague follow-ups get grounded
  const contextSummary = history.length > 0
    ? `Recent conversation context:\n${history.slice(-3).map(t => `Q: ${t.question}\nA: ${t.answer.slice(0, 200)}...`).join("\n\n")}\n\n`
    : "";

  const response = await anthropic.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 256,
    messages: [{
      role: "user",
      content: `You are a search query optimizer for a semiconductor supply chain and AI infrastructure research database.

${contextSummary}Rewrite this user question into exactly 3 search queries optimized for retrieving relevant transcript and article chunks. If the question is vague (e.g. "explain more", "go deeper", "what about that"), use the conversation context above to infer what specific topic to search for. Each query should target a different angle.

User question: "${userQuestion}"

Respond with ONLY a JSON array of 3 strings. No explanation.
Example: ["TSMC CoWoS advanced packaging capacity constraints", "HBM memory supply Micron SK Hynix Samsung", "AI data center power delivery bottleneck hyperscaler capex"]`,
    }],
  });

  const text = response.content[0].type === "text" ? response.content[0].text : "";
  try {
    const queries = JSON.parse(text.trim());
    if (Array.isArray(queries) && queries.length > 0) {
      return [userQuestion, ...queries];
    }
  } catch {
    // fall back to original
  }
  return [userQuestion];
}

async function embedQuery(text: string): Promise<number[]> {
  const apiKey = process.env.COHERE_API_KEY;
  if (!apiKey) throw new Error("COHERE_API_KEY is not set");
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
  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Cohere embed failed: ${response.status} ${err}`);
  }
  const json = await response.json();
  return json.embeddings.float[0];
}

async function vectorSearch(queryEmbedding: number[], opts: RetrievalOptions): Promise<any[]> {
  const { data } = await getSupabase().rpc("match_dylan_chunks", {
    query_embedding: queryEmbedding,
    match_count: VECTOR_CANDIDATES,
    date_from: opts.dateFrom ?? null,
    date_to: opts.dateTo ?? null,
  });
  return data ?? [];
}

async function keywordSearch(queryText: string, opts: RetrievalOptions): Promise<any[]> {
  const { data } = await getSupabase().rpc("keyword_search_dylan_chunks", {
    query_text: queryText,
    match_count: KEYWORD_CANDIDATES,
    date_from: opts.dateFrom ?? null,
    date_to: opts.dateTo ?? null,
  });
  return data ?? [];
}

const RRF_K = 60;

function reciprocalRankFusion(rankedLists: any[][]): any[] {
  const scores = new Map<string, { row: any; score: number }>();
  for (const list of rankedLists) {
    list.forEach((row, rank) => {
      const rrfScore = 1 / (rank + RRF_K);
      if (!scores.has(row.id)) {
        scores.set(row.id, { row, score: rrfScore });
      } else {
        scores.get(row.id)!.score += rrfScore;
      }
    });
  }
  return Array.from(scores.values())
    .sort((a, b) => b.score - a.score)
    .map(({ row, score }) => ({ ...row, rrfScore: score }));
}

async function rerank(question: string, candidates: any[]): Promise<any[]> {
  const COHERE_API_KEY = process.env.COHERE_API_KEY;
  if (!COHERE_API_KEY || candidates.length === 0) {
    return candidates
      .sort((a, b) => {
        const scoreA = (a.rrfScore ?? 0) * (a.quality_score ?? 0.5);
        const scoreB = (b.rrfScore ?? 0) * (b.quality_score ?? 0.5);
        return scoreB - scoreA;
      })
      .slice(0, FINAL_TOP_K);
  }

  const response = await fetch("https://api.cohere.com/v2/rerank", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${COHERE_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "rerank-english-v3.0",
      query: question,
      documents: candidates.map((c) => c.text),
      top_n: Math.min(FINAL_TOP_K, candidates.length),
    }),
  });

  const json = await response.json();
  if (!json.results) return candidates.slice(0, FINAL_TOP_K);

  return json.results.map((r: any) => ({
    ...candidates[r.index],
    rerankScore: r.relevance_score,
  }));
}

export async function retrieveChunks(
  userQuestion: string,
  opts: RetrievalOptions = {}
): Promise<RetrievalResult> {
  const queries = await rewriteQuery(userQuestion, opts.conversationHistory ?? []);
  const embeddedQueries = await Promise.all(queries.map((q) => embedQuery(q)));

  const [vectorResults, keywordResults] = await Promise.all([
    Promise.all(embeddedQueries.map((emb) => vectorSearch(emb, opts))),
    Promise.all(queries.map((q) => keywordSearch(q, opts))),
  ]);

  const allVectorChunks = vectorResults.flat();
  const bestSimilarity = allVectorChunks.length > 0
    ? Math.max(...allVectorChunks.map((c) => c.similarity ?? 0))
    : 0;
  const belowThreshold = bestSimilarity < MIN_SIMILARITY_THRESHOLD;

  const candidates = reciprocalRankFusion([...vectorResults, ...keywordResults]);
  const reranked = await rerank(userQuestion, candidates);

  const chunks = reranked.map((row) => ({
    id: row.id,
    text: row.text,
    source: row.source,
    date: row.date,
    url: row.url ?? undefined,
  }));

  return { chunks, belowThreshold };
}
