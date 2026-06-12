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
    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${process.env.COHERE_API_KEY}` },
    body: JSON.stringify({ model: "embed-english-v3.0", texts: [text], input_type: "search_query", embedding_types: ["float"] }),
  });
  const json = await response.json();
  return json.embeddings.float[0];
}

interface ChunkRow { id: string; text: string; source?: string; date?: string; url?: string; similarity?: number; }

const MIN_SIMILARITY = 0.5; // below this the corpus doesn't meaningfully cover the company

// Safety net: only accept chunks whose source belongs to the right corpus
const SOURCE_PREFIXES: Record<string, string[]> = {
  baker:   ["gavin baker", "invest like the best gavin", "all in podcast gavin", "baker", "capital allocators", "limitless", "antonio gracias gavin", "invested gavin", "rise of the gigafirm"],
  dylan:   ["semianalysis", "dylan patel", "dwarkesh", "lex fridman", "mad podcast dylan", "a16z dylan", "invest like the best dylan"],
  circuit: ["circuit ep"],
};

function sourceMatchesCorpus(source: string, corpus: string): boolean {
  const s = (source ?? "").toLowerCase();
  return (SOURCE_PREFIXES[corpus] ?? []).some((p) => s.includes(p));
}

async function getTopChunks(
  corpus: "baker" | "dylan" | "circuit",
  embedding: number[],
  keyword: string
): Promise<ChunkRow[]> {
  const supabase = getSupabase();
  const [vec, kw] = await Promise.all([
    supabase.rpc(`match_${corpus}_chunks`, { query_embedding: embedding, match_count: 10, date_from: null, date_to: null }),
    supabase.rpc(`keyword_search_${corpus}_chunks`, { query_text: keyword, match_count: 10, date_from: null, date_to: null }),
  ]);

  // Only include vector results that clear the similarity threshold
  const goodVec = (vec.data ?? []).filter((r: ChunkRow) => (r.similarity ?? 0) >= MIN_SIMILARITY);

  const seen = new Set<string>();
  const rows: ChunkRow[] = [];
  for (const row of [...goodVec, ...(goodVec.length > 0 ? (kw.data ?? []) : [])]) {
    if (!seen.has(row.id) && row.text?.trim().length > 60 && sourceMatchesCorpus(row.source, corpus)) {
      seen.add(row.id);
      rows.push(row);
      if (rows.length >= 8) break;
    }
  }
  return rows;
}

// Extract the single best verbatim sentence from the chunks — not synthesis, just selection.
async function extractBestQuote(
  anthropic: Anthropic,
  companyName: string,
  chunks: ChunkRow[]
): Promise<{ quote: string; chunkIndex: number } | null> {
  if (chunks.length === 0) return null;

  const resp = await anthropic.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 200,
    messages: [{
      role: "user",
      content: `You are finding the single best verbatim quote about ${companyName} from these source excerpts.

${chunks.map((c, i) => `[${i}] ${c.text}`).join("\n\n---\n\n")}

Rules:
- Pick ONE sentence that appears verbatim in the excerpts above — copy it exactly, word for word
- It must be a specific, substantive claim about ${companyName} — its business, competitive position, technology, or investment case
- Reject anything generic, vague, conversational filler, or that doesn't specifically discuss ${companyName}
- Reject incomplete thoughts or sentences that need context to make sense
- The quote must stand alone and be immediately useful to an investor

Respond with JSON: {"index": <chunk number 0-7>, "quote": "<exact verbatim sentence>"}
If no excerpt contains a genuinely useful, specific quote about ${companyName}, respond with: {"index": -1, "quote": ""}`,
    }],
  });

  const text = resp.content[0].type === "text" ? resp.content[0].text.trim() : "";
  try {
    const parsed = JSON.parse(text.replace(/```json\n?|\n?```/g, "").trim());
    if (parsed.index === -1 || !parsed.quote || parsed.quote.length < 20) return null;
    return { quote: parsed.quote, chunkIndex: parsed.index };
  } catch {
    return null;
  }
}

const EXPERT_LABELS: Record<string, { name: string; description: string; accent: string }> = {
  baker:   { name: "Gavin Baker",  description: "Growth & AI Investing",         accent: "#B45309" },
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

  const query = `${meta.name} ${meta.ticker} investment thesis competitive position`;
  const embedding = await embedQuery(query);
  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  const [bakerChunks, dylanChunks, circuitChunks] = await Promise.all([
    getTopChunks("baker",   embedding, meta.name),
    getTopChunks("dylan",   embedding, meta.name),
    getTopChunks("circuit", embedding, meta.name),
  ]);

  const [bakerResult, dylanResult, circuitResult] = await Promise.all([
    extractBestQuote(anthropic, meta.name, bakerChunks),
    extractBestQuote(anthropic, meta.name, dylanChunks),
    extractBestQuote(anthropic, meta.name, circuitChunks),
  ]);

  function buildEntry(corpus: "baker" | "dylan" | "circuit", result: { quote: string; chunkIndex: number } | null, chunks: ChunkRow[]) {
    if (!result) return null;
    const chunk = chunks[result.chunkIndex];
    return {
      corpus,
      ...EXPERT_LABELS[corpus],
      quote: result.quote,
      source: chunk?.source,
      date: chunk?.date,
      url: chunk?.url,
    };
  }

  const results = [
    buildEntry("baker",   bakerResult,   bakerChunks),
    buildEntry("dylan",   dylanResult,   dylanChunks),
    buildEntry("circuit", circuitResult, circuitChunks),
  ].filter(Boolean);

  return NextResponse.json({ slug, company: meta.name, experts: results });
}
