import { createClient } from "@supabase/supabase-js";
import type { QuantumArticle } from "./articles";

const TABLE = "quantum_articles";

function getClient() {
  const key = process.env.SUPABASE_SERVICE_KEY;
  if (!key) throw new Error("SUPABASE_SERVICE_KEY is not set");
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, key);
}

export async function saveQuantumArticles(articles: QuantumArticle[]): Promise<void> {
  const supabase = getClient();
  const rows = articles.map((a) => ({
    id: a.id,
    title: a.title,
    summary: a.summary,
    source: a.source,
    source_url: a.sourceUrl,
    published_at: a.publishedAt,
    category: a.category,
    companies: a.companies,
    image: a.image,
    top_story: a.topStory,
    generated_at: a.generatedAt,
  }));

  // Upsert in batches of 100
  for (let i = 0; i < rows.length; i += 100) {
    const { error } = await supabase
      .from(TABLE)
      .upsert(rows.slice(i, i + 100), { onConflict: "id" });
    if (error) throw new Error(`quantum_articles upsert failed: ${error.message}`);
  }

  // Reset all top_story flags, then mark only the current picks
  const topIds = articles.filter((a) => a.topStory).map((a) => a.id);
  const { error: clearErr } = await supabase.from(TABLE).update({ top_story: false }).not("id", "is", null);
  if (clearErr) throw new Error(`quantum top_story clear failed: ${clearErr.message}`);
  if (topIds.length > 0) {
    const { error: setErr } = await supabase.from(TABLE).update({ top_story: true }).in("id", topIds);
    if (setErr) throw new Error(`quantum top_story set failed: ${setErr.message}`);
  }
}

export async function loadQuantumArticlesFromDB(opts?: {
  limit?: number;
  cutoffHours?: number;
}): Promise<QuantumArticle[]> {
  const supabase = getClient();
  const { limit = 200, cutoffHours } = opts ?? {};

  let query = supabase
    .from(TABLE)
    .select("*")
    .order("published_at", { ascending: false })
    .limit(limit);

  if (cutoffHours) {
    const cutoff = new Date(Date.now() - cutoffHours * 60 * 60 * 1000).toISOString();
    query = query.gte("published_at", cutoff);
  }

  const { data, error } = await query;
  if (error) throw new Error(`quantum_articles fetch failed: ${error.message}`);

  return (data ?? []).map((row) => ({
    id: row.id,
    title: row.title,
    summary: row.summary,
    source: row.source,
    sourceUrl: row.source_url,
    publishedAt: row.published_at,
    category: row.category,
    companies: row.companies ?? [],
    image: row.image ?? null,
    topStory: row.top_story ?? false,
    generatedAt: row.generated_at,
  }));
}
