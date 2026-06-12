import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import Anthropic from "@anthropic-ai/sdk";
import { getCompanyMeta } from "@/lib/companies";

function getSupabase() {
  return createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

async function embedQuery(text: string): Promise<number[]> {
  const response = await fetch("https://api.cohere.com/v2/embed", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${process.env.COHERE_API_KEY}`,
    },
    body: JSON.stringify({
      model: "embed-english-v3.0",
      texts: [text],
      input_type: "search_query",
      embedding_types: ["float"],
    }),
  });
  const json = await response.json();
  return json.embeddings.float[0];
}

async function searchCorpus(
  corpus: "baker" | "dylan" | "circuit",
  embedding: number[],
  keyword: string
): Promise<string[]> {
  const supabase = getSupabase();
  const [vec, kw] = await Promise.all([
    supabase.rpc(`match_${corpus}_chunks`, {
      query_embedding: embedding,
      match_count: 5,
      date_from: null,
      date_to: null,
    }),
    supabase.rpc(`keyword_search_${corpus}_chunks`, {
      query_text: keyword,
      match_count: 5,
      date_from: null,
      date_to: null,
    }),
  ]);

  const seen = new Set<string>();
  const chunks: string[] = [];
  for (const row of [...(vec.data ?? []), ...(kw.data ?? [])]) {
    if (!seen.has(row.id) && row.text?.trim()) {
      seen.add(row.id);
      chunks.push(row.text.trim());
      if (chunks.length >= 4) break;
    }
  }
  return chunks;
}

const EXPERT_LABELS: Record<string, { name: string; description: string; accent: string }> = {
  baker: { name: "Gary Black", description: "Growth & AI Investing", accent: "#B45309" },
  dylan: { name: "Dylan Patel", description: "Supply Chain & Infrastructure", accent: "#9A3412" },
  circuit: { name: "The Circuit", description: "Earnings & Industry Dynamics", accent: "#1C1917" },
};

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const meta = getCompanyMeta(slug);
  if (!meta) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const company = meta;
  const query = `${company.name} ${company.ticker} investment thesis`;
  const embedding = await embedQuery(query);

  const [bakerChunks, dylanChunks, circuitChunks] = await Promise.all([
    searchCorpus("baker", embedding, meta.name),
    searchCorpus("dylan", embedding, meta.name),
    searchCorpus("circuit", embedding, meta.name),
  ]);

  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  async function synthesize(
    corpus: "baker" | "dylan" | "circuit",
    chunks: string[]
  ): Promise<string | null> {
    if (chunks.length === 0) return null;
    const label = EXPERT_LABELS[corpus];
    const resp = await anthropic.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 120,
      messages: [{
        role: "user",
        content: `You are synthesizing what ${label.name} (${label.description}) has said about ${company.name} (${company.ticker}).

Source excerpts:
${chunks.map((c, i) => `[${i + 1}] ${c}`).join("\n\n")}

Write ONE sentence (max 40 words) capturing the most specific, useful investment insight from these excerpts about ${company.name}.
- Be specific, not generic
- Use first person ("The view here is..." or just state the insight directly)
- No hedging, no "based on the excerpts"
- If the excerpts don't meaningfully cover ${company.name}, reply with exactly: NO_COVERAGE`,
      }],
    });
    const text = resp.content[0].type === "text" ? resp.content[0].text.trim() : "";
    if (text === "NO_COVERAGE" || text.length < 10) return null;
    return text;
  }

  const [bakerTake, dylanTake, circuitTake] = await Promise.all([
    synthesize("baker", bakerChunks),
    synthesize("dylan", dylanChunks),
    synthesize("circuit", circuitChunks),
  ]);

  const results = [
    bakerTake ? { corpus: "baker", ...EXPERT_LABELS.baker, take: bakerTake } : null,
    dylanTake ? { corpus: "dylan", ...EXPERT_LABELS.dylan, take: dylanTake } : null,
    circuitTake ? { corpus: "circuit", ...EXPERT_LABELS.circuit, take: circuitTake } : null,
  ].filter(Boolean);

  return NextResponse.json({ slug, company: meta.name, experts: results });
}
