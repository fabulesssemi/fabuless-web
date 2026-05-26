// Lightweight homepage content refresh — runs independently of the heavy
// company editorial pipeline. Only 2 Claude calls (stories + podcasts),
// fits easily within Vercel's 60s function limit.

import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { fetchAllNewsItems, fetchAllPodcastFeeds } from "@/lib/editorial/sources";
import { generateTopStories, generatePodcastPicks } from "@/lib/editorial/curate-stories";
import { saveHomepageContent } from "@/lib/homepage";

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

  // Fetch news + podcasts in parallel (no Claude yet — just HTTP)
  const [allNewsItems, podcastFeeds] = await Promise.all([
    fetchAllNewsItems(),
    fetchAllPodcastFeeds(10),
  ]);

  // Run story curation + podcast picking in parallel (2 Claude calls total)
  const [homepage, podcastPicks] = await Promise.all([
    generateTopStories(allNewsItems),
    generatePodcastPicks(podcastFeeds),
  ]);

  if (!homepage) {
    return NextResponse.json({
      ok: false,
      error: "Story generation returned null",
      newsItemsFetched: allNewsItems.length,
      podcastFeedsLoaded: podcastFeeds.filter((f) => f.episodes.length > 0).length,
    });
  }

  homepage.podcasts = podcastPicks;
  const { ok, error } = await saveHomepageContent(homepage);
  if (ok) revalidatePath("/");

  return NextResponse.json({
    ok,
    error,
    storiesCount: homepage.topStories.length,
    podcastPicksCount: podcastPicks.length,
    issueTitle: homepage.issueTitle,
    newsItemsFetched: allNewsItems.length,
    podcastFeedsLoaded: podcastFeeds.filter((f) => f.episodes.length > 0).length,
  });
}
