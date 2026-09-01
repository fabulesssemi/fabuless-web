import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { COMPANY_UNIVERSE, getEditorial } from "@/lib/companies";
import { getAnalystView } from "@/lib/analyst";
import { generateEditorial } from "@/lib/editorial/generate";
import { saveEditorial } from "@/lib/editorial/supabase";
import { fetchAllNewsItems, fetchPodcastEpisodes, fetchAllPodcastFeeds } from "@/lib/editorial/sources";
import { generateTopStories, generatePodcastPicks } from "@/lib/editorial/curate-stories";
import { saveHomepageContent, saveAndExpireArticles, saveRssArticles } from "@/lib/homepage";

import { requireCronAuth } from "@/lib/cron-auth";
import { sendOpsAlert } from "@/lib/alert";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

export async function GET(request: Request) {
  const authErr = requireCronAuth(request);
  if (authErr) return authErr;

  // Fetch all RSS data + podcast feeds + analyst views in parallel.
  const [allNewsItems, podcastEpisodes, podcastFeeds, ...analystViews] = await Promise.all([
    fetchAllNewsItems(),
    fetchPodcastEpisodes(4),          // flat list for editorial prompt context
    fetchAllPodcastFeeds(10),         // structured per-show data for podcast picking
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
      const { ok, error: saveError } = await saveEditorial(editorial);
      if (ok) revalidatePath(`/companies/${meta.slug}`);
      return { ticker: meta.ticker, ok, saveError };
    }),
  );

  revalidatePath("/analyst-consensus");

  // Persist the raw RSS archive UNCONDITIONALLY — it does not depend on Claude.
  // Keeping this outside the `if (homepage)` block means a Claude outage no
  // longer freezes rss_articles, which the daily newsletter build reads from.
  let rssSaved = false;
  try {
    await saveRssArticles(allNewsItems);
    rssSaved = true;
  } catch (e) {
    console.error("[editorial/refresh] saveRssArticles failed:", e);
  }

  // Generate top stories + podcast picks in parallel, then save combined homepage content.
  let storiesOk = false;
  let podcastsGenerated = 0;
  try {
    const [homepage, podcastPicks] = await Promise.all([
      generateTopStories(allNewsItems),
      generatePodcastPicks(podcastFeeds),
    ]);
    if (homepage) {
      // Merge podcast picks into the homepage content
      homepage.podcasts = podcastPicks;
      podcastsGenerated = podcastPicks.length;
      const [{ ok }] = await Promise.all([
        saveHomepageContent(homepage),
        saveAndExpireArticles(homepage.topStories),
      ]);
      storiesOk = ok;
      if (ok) revalidatePath("/");
    } else {
      await sendOpsAlert(
        "Editorial refresh — story generation returned null",
        `generateTopStories() returned null (${allNewsItems.length} news items ` +
          `fetched, raw RSS ${rssSaved ? "saved" : "SAVE FAILED"}). Almost ` +
          `certainly the Anthropic API credit balance is exhausted. The homepage ` +
          `and newsletter will run on stale content until this is fixed.`,
      );
    }
  } catch (e) {
    await sendOpsAlert("Editorial refresh threw", String(e));
  }

  const succeeded = results.flatMap((r) =>
    r.status === "fulfilled" && r.value.ok ? [r.value.ticker] : [],
  );
  const errors = results.flatMap((r) => {
    if (r.status === "rejected") return [{ ticker: "?", error: String(r.reason) }];
    if (!r.value.ok) return [{ ticker: r.value.ticker, error: r.value.saveError ?? "unknown" }];
    return [];
  });

  return NextResponse.json({
    date: new Date().toISOString().slice(0, 10),
    succeeded,
    succeededCount: succeeded.length,
    failedCount: errors.length,
    errors,
    newsItemsFetched: allNewsItems.length,
    podcastEpisodesFetched: podcastEpisodes.length,
    topStoriesGenerated: storiesOk,
    podcastPicksGenerated: podcastsGenerated,
  });
}
