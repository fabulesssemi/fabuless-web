// Lightweight homepage content refresh — runs independently of the heavy
// company editorial pipeline. Only 2 Claude calls (stories + podcasts),
// fits easily within Vercel's 60s function limit.

import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { fetchAllNewsItems, fetchAllPodcastFeeds } from "@/lib/editorial/sources";
import { generateTopStories, generatePodcastPicks } from "@/lib/editorial/curate-stories";
import { saveHomepageContent, saveAndExpireArticles, saveRssArticles } from "@/lib/homepage";

import { requireCronAuth } from "@/lib/cron-auth";
import { sendOpsAlert } from "@/lib/alert";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function GET(request: Request) {
  const authErr = requireCronAuth(request);
  if (authErr) return authErr;

  // Fetch news + podcasts in parallel (no Claude yet — just HTTP)
  const [allNewsItems, podcastFeeds] = await Promise.all([
    fetchAllNewsItems(),
    fetchAllPodcastFeeds(10),
  ]);

  // Persist the raw RSS archive UNCONDITIONALLY — Claude-independent, and this
  // cron runs earliest in the day. Keeps rss_articles warm through a Claude outage.
  let rssSaved = false;
  try {
    await saveRssArticles(allNewsItems);
    rssSaved = true;
  } catch (e) {
    console.error("[homepage/refresh] saveRssArticles failed:", e);
  }

  // Run story curation + podcast picking in parallel (2 Claude calls total)
  const [homepage, podcastPicks] = await Promise.all([
    generateTopStories(allNewsItems),
    generatePodcastPicks(podcastFeeds),
  ]);

  if (!homepage) {
    await sendOpsAlert(
      "Homepage refresh — story generation returned null",
      `generateTopStories() returned null (${allNewsItems.length} news items ` +
        `fetched, raw RSS ${rssSaved ? "saved" : "SAVE FAILED"}). Likely the ` +
        `Anthropic API credit balance is exhausted; the homepage will show ` +
        `stale stories until this is fixed.`,
    );
    return NextResponse.json({
      ok: false,
      error: "Story generation returned null",
      rssSaved,
      newsItemsFetched: allNewsItems.length,
      podcastFeedsLoaded: podcastFeeds.filter((f) => f.episodes.length > 0).length,
    });
  }

  homepage.podcasts = podcastPicks;

  // Save issueTitle + podcasts to homepage_content (unchanged)
  // Save ranked articles to homepage_articles (rolling pool with expiry)
  const [{ ok, error }, articlesResult] = await Promise.all([
    saveHomepageContent(homepage),
    saveAndExpireArticles(homepage.topStories),
  ]);

  if (ok) revalidatePath("/");

  return NextResponse.json({
    ok,
    articlesOk: articlesResult.ok,
    articlesError: articlesResult.error,
    error,
    storiesCount: homepage.topStories.length,
    podcastPicksCount: podcastPicks.length,
    issueTitle: homepage.issueTitle,
    newsItemsFetched: allNewsItems.length,
    podcastFeedsLoaded: podcastFeeds.filter((f) => f.episodes.length > 0).length,
  });
}
