import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { COMPANY_UNIVERSE, getEditorial } from "@/lib/companies";
import { getAnalystView } from "@/lib/analyst";
import { generateEditorial } from "@/lib/editorial/generate";
import { saveEditorial } from "@/lib/editorial/supabase";
import { fetchAllNewsItems, fetchPodcastEpisodes } from "@/lib/editorial/sources";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const auth = request.headers.get("authorization");
    if (auth !== `Bearer ${secret}`) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }
  }

  // Fetch RSS data + all analyst views in parallel first.
  const [allNewsItems, podcastEpisodes, ...analystViews] = await Promise.all([
    fetchAllNewsItems(),
    fetchPodcastEpisodes(4),
    ...COMPANY_UNIVERSE.map((meta) => getAnalystView(meta)),
  ]);

  // Generate + save all 12 companies in parallel.
  const results = await Promise.allSettled(
    COMPANY_UNIVERSE.map(async (meta, i) => {
      const analystView = analystViews[i];
      const baseline = getEditorial(meta.slug) ?? {
        slug: meta.slug, quickTake: "", ecosystemRole: "", investorFocus: "",
        whyItMatters: { business: "", investment: "", ecosystem: "" },
        keyThemes: [], bullCase: [], bearCase: [], supplyChain: {}, related: [], updated: "",
      };
      const editorial = await generateEditorial(meta, analystView, baseline, allNewsItems, podcastEpisodes);
      const { ok } = await saveEditorial(editorial);
      if (ok) revalidatePath(`/companies/${meta.slug}`);
      return { ticker: meta.ticker, ok };
    }),
  );

  revalidatePath("/analyst-consensus");

  const succeeded = results.flatMap((r) =>
    r.status === "fulfilled" && r.value.ok ? [r.value.ticker] : [],
  );
  const failed = results.flatMap((r) =>
    r.status === "rejected" || (r.status === "fulfilled" && !r.value.ok)
      ? [r.status === "fulfilled" ? r.value.ticker : "?"]
      : [],
  );

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
