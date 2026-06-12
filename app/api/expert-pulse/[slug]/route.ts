import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
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

interface ChunkRow { id: string; text: string; source?: string; date?: string; url?: string; similarity?: number; }

async function bestChunk(
  corpus: "baker" | "dylan" | "circuit",
  embedding: number[],
  keyword: string
): Promise<ChunkRow | null> {
  const supabase = getSupabase();
  const [vec, kw] = await Promise.all([
    supabase.rpc(`match_${corpus}_chunks`, { query_embedding: embedding, match_count: 8, date_from: null, date_to: null }),
    supabase.rpc(`keyword_search_${corpus}_chunks`, { query_text: keyword, match_count: 8, date_from: null, date_to: null }),
  ]);

  // Merge, dedupe, pick the one with highest vector similarity (most on-topic)
  const seen = new Set<string>();
  const rows: ChunkRow[] = [];
  for (const row of [...(vec.data ?? []), ...(kw.data ?? [])]) {
    if (!seen.has(row.id) && row.text?.trim().length > 40) {
      seen.add(row.id);
      rows.push(row);
    }
  }
  if (rows.length === 0) return null;

  // Prefer vector results (have similarity score); fall back to first keyword result
  const withScore = rows.filter(r => r.similarity != null).sort((a, b) => (b.similarity ?? 0) - (a.similarity ?? 0));
  const best = withScore[0] ?? rows[0];

  // Truncate to a clean sentence boundary, max ~200 chars
  const text = best.text.trim();
  const truncated = truncateToSentence(text, 220);

  return { ...best, text: truncated };
}

function truncateToSentence(text: string, maxLen: number): string {
  if (text.length <= maxLen) return text;
  // Try to cut at a sentence boundary
  const cut = text.slice(0, maxLen);
  const lastPeriod = Math.max(cut.lastIndexOf(". "), cut.lastIndexOf("! "), cut.lastIndexOf("? "));
  if (lastPeriod > maxLen * 0.5) return cut.slice(0, lastPeriod + 1);
  return cut.trimEnd() + "…";
}

const EXPERT_LABELS: Record<string, { name: string; description: string; accent: string }> = {
  baker:   { name: "Gary Black",   description: "Growth & AI Investing",        accent: "#B45309" },
  dylan:   { name: "Dylan Patel",  description: "Supply Chain & Infrastructure", accent: "#9A3412" },
  circuit: { name: "The Circuit",  description: "Earnings & Industry Dynamics",  accent: "#1C1917" },
};

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const meta = getCompanyMeta(slug);
  if (!meta) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const query = `${meta.name} ${meta.ticker} investment thesis`;
  const embedding = await embedQuery(query);

  const [baker, dylan, circuit] = await Promise.all([
    bestChunk("baker",   embedding, meta.name),
    bestChunk("dylan",   embedding, meta.name),
    bestChunk("circuit", embedding, meta.name),
  ]);

  const results = [
    baker   ? { corpus: "baker",   ...EXPERT_LABELS.baker,   quote: baker.text,   source: baker.source,   date: baker.date,   url: baker.url   } : null,
    dylan   ? { corpus: "dylan",   ...EXPERT_LABELS.dylan,   quote: dylan.text,   source: dylan.source,   date: dylan.date,   url: dylan.url   } : null,
    circuit ? { corpus: "circuit", ...EXPERT_LABELS.circuit, quote: circuit.text, source: circuit.source, date: circuit.date, url: circuit.url } : null,
  ].filter(Boolean);

  return NextResponse.json({ slug, company: meta.name, experts: results });
}
