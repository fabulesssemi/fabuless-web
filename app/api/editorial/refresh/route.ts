import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { COMPANY_UNIVERSE, getEditorial } from "@/lib/companies";
import { getAnalystView } from "@/lib/analyst";
import { generateEditorial } from "@/lib/editorial/generate";
import { saveEditorial } from "@/lib/editorial/supabase";
import { fetchAllNewsItems, fetchPodcastEpisodes } from "@/lib/editorial/sources";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const auth = request.headers.get("authorization");
    if (auth !== `Bearer ${secret}`) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }
  }

  // Fetch all RSS data once — shared across all 12 companies.
  const [allNewsItems, podcastEpisodes] = await Promise.all([
    fetchAllNewsItems(),
    fetchPodcastEpisodes(4),
  ]);

  const succeeded: string[] = [];
  const failed: string[] = [];

  // Sequential to stay well within Claude API rate limits.
  for (const meta of COMPANY_UNIVERSE) {
    try {
      const [analystView] = await Promise.all([getAnalystView(meta)]);
      const baseline = getEditorial(meta.slug) ?? { slug: meta.slug, quickTake: "", ecosystemRole: "", investorFocus: "", whyItMatters: { business: "", investment: "", ecosystem: "" }, keyThemes: [], bullCase: [], bearCase: [], supplyChain: {}, related: [], updated: "" };
      const editorial = await generateEditorial(
        meta,
        analystView,
        baseline,
        allNewsItems,
        podcastEpisodes,
      );
      const { ok } = await saveEditorial(editorial);
      if (ok) {
        succeeded.push(meta.ticker);
        revalidatePath(`/companies/${meta.slug}`);
      } else {
        failed.push(meta.ticker);
      }
    } catch {
      failed.push(meta.ticker);
    }
  }

  revalidatePath("/analyst-consensus");

  return NextResponse.json({
    date: new Date().toISOString().slice(0, 10),
    succeeded,
    succeededCount: succeeded.length,
    failed,
    failedCount: failed.length,
    newsItemsFetched: allNewsItems.length,
    podcastEpisodesFetched: podcastEpisodes.length,
  });
}
