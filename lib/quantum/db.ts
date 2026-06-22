import { createClient } from "@supabase/supabase-js";
import type { QuantumArticle } from "./articles";

const TABLE = "quantum_articles";

function getClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
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

  // Clear top_story on all articles not in this set, then set it on the ones that are
  const topIds = articles.filter((a) => a.topStory).map((a) => a.id);
  await supabase.from(TABLE).update({ top_story: false }).neq("id", "never-matches");
  if (topIds.length > 0) {
    await supabase.from(TABLE).update({ top_story: true }).in("id", topIds);
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
