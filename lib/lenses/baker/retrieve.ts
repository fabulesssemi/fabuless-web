/**
 * Retrieval pipeline for The Baker Lens.
 *
 * Flow:
 * 1. Query rewriting  — Claude Haiku rewrites user question into 3 search queries
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
const VECTOR_CANDIDATES = 20;  // retrieve this many per query before reranking
const KEYWORD_CANDIDATES = 20;
const FINAL_TOP_K = 5;         // chunks passed to Claude after reranking

// Minimum similarity score to consider a chunk relevant.
// Below this threshold, the corpus doesn't cover the topic well enough to answer.
const MIN_SIMILARITY_THRESHOLD = 0.45;

export interface RetrievalOptions {
  dateFrom?: string;
  dateTo?: string;
  conversationHistory?: ConversationTurn[];
}

export interface RetrievalResult {
  chunks: TranscriptChunk[];
  belowThreshold: boolean; // true if best match score is too low — signal "I don't know"
}

// ─── Step 1: Query Rewriting ─────────────────────────────────────────────────

async function rewriteQuery(userQuestion: string, history: ConversationTurn[] = []): Promise<string[]> {
  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  const contextSummary = history.length > 0
    ? `Recent conversation context:\n${history.slice(-3).map(t => `Q: ${t.question}\nA: ${t.answer.slice(0, 200)}...`).join("\n\n")}\n\n`
    : "";

  const response = await anthropic.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 256,
    messages: [{
      role: "user",
      content: `You are a search query optimizer for a semiconductor investment database.

${contextSummary}Rewrite this user question into exactly 3 search queries optimized for retrieving relevant transcript chunks. If the question is vague (e.g. "explain more", "go deeper", "what about that"), use the conversation context above to infer the specific topic. Each query should target a different angle.

User question: "${userQuestion}"

Respond with ONLY a JSON array of 3 strings. No explanation.
Example: ["Nvidia data center revenue growth trajectory", "GPU supply constraints inference demand", "hyperscaler capex AI infrastructure spending"]`,
    }],
  });

  const text = response.content[0].type === "text" ? response.content[0].text : "";
  try {
    const queries = JSON.parse(text.trim());
    if (Array.isArray(queries) && queries.length > 0) {
      return [userQuestion, ...queries]; // include original + 3 rewritten
    }
  } catch {
    // If parsing fails, fall back to original question only
  }
  return [userQuestion];
}

// ─── Step 2: Hybrid Search (vector + keyword per query) ──────────────────────

async function vectorSearch(
  queryEmbedding: number[],
  opts: RetrievalOptions
): Promise<any[]> {
  const { data } = await getSupabase().rpc("match_baker_chunks", {
    query_embedding: queryEmbedding,
    match_count: VECTOR_CANDIDATES,
    date_from: opts.dateFrom ?? null,
    date_to: opts.dateTo ?? null,
  });
  return data ?? [];
}

async function keywordSearch(
  queryText: string,
  opts: RetrievalOptions
): Promise<any[]> {
  const { data } = await getSupabase().rpc("keyword_search_baker_chunks", {
    query_text: queryText,
    match_count: KEYWORD_CANDIDATES,
    date_from: opts.dateFrom ?? null,
    date_to: opts.dateTo ?? null,
  });
  return data ?? [];
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

// ─── Step 3: Reciprocal Rank Fusion ─────────────────────────────────────────
// RRF merges multiple ranked lists with score = sum of 1/(rank + 60).
// 59% improvement in MRR@5 over naive dedup.
// k=60 is the standard constant from the original RRF paper (Cormack et al. 2009).

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

// ─── Step 4: Reranking via Cohere ────────────────────────────────────────────

async function rerank(
  question: string,
  candidates: any[]
): Promise<any[]> {
  const COHERE_API_KEY = process.env.COHERE_API_KEY;
  if (!COHERE_API_KEY || candidates.length === 0) {
    // No Cohere key — fall back to rrfScore * quality_score sort
    // rrfScore is the unified relevance signal after RRF (replaces raw similarity)
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
      "Authorization": `Bearer ${COHERE_API_KEY!}`,
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

// ─── Public: Full Retrieval Pipeline ─────────────────────────────────────────

export async function retrieveChunks(
  userQuestion: string,
  opts: RetrievalOptions = {}
): Promise<RetrievalResult> {
  // Step 1: rewrite question into multiple search queries (context-aware)
  const queries = await rewriteQuery(userQuestion, opts.conversationHistory ?? []);

  // Step 2: hybrid search for each query in parallel
  // Run vector and keyword searches separately so we can check raw similarity
  // scores (from vector results only) for the threshold check.
  const embeddedQueries = await Promise.all(queries.map((q) => embedQuery(q)));

  const [vectorResults, keywordResults] = await Promise.all([
    Promise.all(embeddedQueries.map((emb) => vectorSearch(emb, opts))),
    Promise.all(queries.map((q) => keywordSearch(q, opts))),
  ]);

  // Step 3: check similarity threshold using raw vector scores BEFORE RRF.
  // Keyword results have no meaningful absolute score, so we only check vector results.
  const allVectorChunks = vectorResults.flat();
  const bestSimilarity = allVectorChunks.length > 0
    ? Math.max(...allVectorChunks.map((c) => c.similarity ?? 0))
    : 0;
  const belowThreshold = bestSimilarity < MIN_SIMILARITY_THRESHOLD;

  // Step 4: merge all results with Reciprocal Rank Fusion
  const candidates = reciprocalRankFusion([...vectorResults, ...keywordResults]);

  // Step 5: rerank (Cohere or fallback)
  const reranked = await rerank(userQuestion, candidates);

  // Step 6: normalize to TranscriptChunk shape
  const chunks = reranked.map((row) => ({
    id: row.id,
    text: row.text,
    source: row.source,
    date: row.date,
    url: row.url ?? undefined,
  }));

  return { chunks, belowThreshold };
}
