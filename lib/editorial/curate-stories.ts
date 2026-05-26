// ---------------------------------------------------------------------------
// Story curation — Claude picks the top semiconductor investment stories
// from all RSS items fetched this run. Output goes to the homepage Top Stories
// grid and is stored in Supabase so the page auto-updates without manual work.
// ---------------------------------------------------------------------------

import Anthropic from "@anthropic-ai/sdk";
import type { RssItem, PodcastFeed } from "./sources";
import type { AutoStory, AutoPodcast, HomepageContent } from "@/lib/homepage";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const CATEGORIES = ["Compute", "Capital Flows", "Geopolitics & Policy", "Memory & Networking", "Other"] as const;

const STORY_SCHEMA = `{
  "issueTitle": "a punchy 8-14 word editorial headline covering the 2-3 biggest themes from your picks — written like a newspaper front page. Example: 'Nvidia's China Risk, TSMC's Arizona Push, and Samsung's Memory Pivot'",
  "stories": [
    {
      "headline": "exact article headline from the input",
      "url": "exact url from the input — never invent",
      "source": "exact source name from the input",
      "category": "one of: Compute | Capital Flows | Geopolitics & Policy | Memory & Networking | Other",
      "oneliner": "one sharp analyst-style sentence — the investment implication, not a summary",
      "image": "image url from the input if available, otherwise null"
    }
  ]
}`;

/**
 * Ask Claude to pick the 6 most investment-relevant semiconductor stories
 * from the full RSS corpus. Returns a ready-to-save HomepageContent object.
 * Never throws — returns null on any failure.
 */
export async function generateTopStories(
  allNewsItems: RssItem[],
): Promise<HomepageContent | null> {
  if (allNewsItems.length === 0) return null;

  // Derive source names from URLs for Claude
  const storyLinesWithSource = allNewsItems
    .slice(0, 80)
    .map((item, i) => {
      let src = "Unknown";
      try { src = new URL(item.link).hostname.replace(/^www\./, ""); } catch { /* */ }
      const KNOWN: Record<string, string> = {
        "reuters.com": "Reuters", "cnbc.com": "CNBC",
        "nextplatform.com": "NextPlatform", "semiwiki.com": "SemiWiki",
        "benzinga.com": "Benzinga", "ft.com": "Financial Times",
        "bloomberg.com": "Bloomberg", "wsj.com": "WSJ",
        "marketwatch.com": "MarketWatch", "eetimes.com": "EE Times",
        "theinformation.com": "The Information",
      };
      src = KNOWN[src] ?? src;
      const img = item.image ? ` [image: ${item.image}]` : " [image: null]";
      return `${i + 1}. "${item.title}" | source: ${src} | url: ${item.link} | ${item.description.slice(0, 160)}${img}`;
    })
    .join("\n");

  const today = new Date().toISOString().slice(0, 10);
  const prompt = `You are a senior semiconductor investment editor at Fabuless, a briefing read by professional investors.

Today is ${today}. From the articles below, pick exactly 6 that are MOST significant for semiconductor equity investors this week.

RULES:
- Prefer stories with real investment implications: earnings, guidance, capex decisions, supply chain shifts, export controls, M&A, major technology milestones.
- Avoid generic market summaries, broad macro commentary, or stories that don't specifically affect semiconductor stocks.
- Return ONLY stories that appear in the input list — use the exact URL, headline, source, and image provided.
- SOURCE DIVERSITY: Pick from at least 4 different sources. No more than 1 story from the same source. If you must pick 2 from one source, the remaining 4 must all be from different sources.
- The "oneliner" must be one sharp sentence stating the investment implication (not a summary). Example: "A $10B TSMC commitment deepens AMD's single-supplier risk at peak cross-strait tension."
- If a story has an image url, include it. Otherwise set image to null.
- Assign the most accurate category from: ${CATEGORIES.join(" | ")}.
- After selecting stories, craft the "issueTitle": 8-14 words covering the 2-3 biggest themes, written as a punchy newspaper front-page headline with specific names (companies, technologies, events — not generic phrases like "chip industry dynamics").

Input articles (newest first):
${storyLinesWithSource}

Return ONLY a valid JSON object matching this schema (no markdown, no explanation):
${STORY_SCHEMA}`;

  try {
    const message = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 2048,
      messages: [{ role: "user", content: prompt }],
    });

    const raw = message.content.find((b) => b.type === "text")?.text ?? "";
    const jsonStr = raw.replace(/^```(?:json)?\s*/i, "").replace(/\s*```\s*$/, "").trim();
    const parsed: { issueTitle?: string; stories?: AutoStory[] } = JSON.parse(jsonStr);

    // Support both new object format and legacy array format
    const storiesArr: AutoStory[] = Array.isArray(parsed)
      ? (parsed as AutoStory[])
      : (parsed.stories ?? []);
    const generatedTitle: string = Array.isArray(parsed)
      ? ""
      : (parsed.issueTitle ?? "");

    if (storiesArr.length === 0) return null;

    // Validate each story has required fields
    const valid = storiesArr.filter(
      (s) => s.headline && s.url && s.source && s.category && s.oneliner,
    );

    if (valid.length === 0) return null;

    // Fallback title: week of today
    const weekOf = new Date().toLocaleDateString("en-US", {
      month: "long", day: "numeric", year: "numeric",
    });

    return {
      topStories: valid.slice(0, 6),
      podcasts: [], // filled in separately by generatePodcastPicks
      issueTitle: generatedTitle || `Week of ${weekOf}`,
      generatedAt: new Date().toISOString(),
    };
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Podcast pick curation
// ---------------------------------------------------------------------------

const PODCAST_SCHEMA = `[
  {
    "show": "exact show name from the input",
    "title": "exact episode title from the input",
    "url": "exact episode url from the input — never invent",
    "image": "image url from input or null",
    "oneliner": "one sentence: WHY semiconductor equity investors specifically should listen — name the company, theme, or investment angle covered"
  }
]`;

/**
 * For each podcast show, pick the single episode most relevant to semiconductor
 * investors — not necessarily the most recent. Returns one AutoPodcast per show.
 * Never throws — returns [] on any failure.
 */
export async function generatePodcastPicks(
  feeds: PodcastFeed[],
): Promise<AutoPodcast[]> {
  // Only process shows that have episodes
  const activeFeeds = feeds.filter((f) => f.episodes.length > 0);
  if (activeFeeds.length === 0) return [];

  const episodeLines = activeFeeds.flatMap(({ show, episodes }) =>
    episodes.slice(0, 10).map((ep, i) => {
      const img = ep.image ? ` [image: ${ep.image}]` : " [image: null]";
      return `[${show} — ep ${i + 1}] "${ep.title}" | ${ep.description.slice(0, 250)} | url: ${ep.link}${img}`;
    }),
  );

  const showNames = activeFeeds.map((f) => f.show).join(", ");
  const today = new Date().toISOString().slice(0, 10);

  const prompt = `You are a senior semiconductor investment editor at Fabuless.

Today is ${today}. Below are recent episodes from ${showNames}.

Your task: For EACH show, pick the ONE episode most relevant to semiconductor equity investors — prioritising episodes that cover chip companies (NVIDIA, AMD, TSMC, Broadcom, Micron, SK Hynix, ARM, Intel, Qualcomm, Marvell, ASML), AI compute, memory cycles, data center capex, export controls, foundry strategy, or chip supply chain. Do NOT just pick the most recent episode — pick the most investment-relevant.

RULES:
- Return exactly one object per show, in an array of ${activeFeeds.length} items.
- Use the exact show name, title, url, and image from the input. Never invent.
- The "oneliner" must state the specific investment angle: which companies are discussed and what the key insight is. Example: "Gavin Baker connects AI compute demand to TSMC capacity and explains why energy is now the binding constraint on the chip buildout."
- If a show has no semiconductor-relevant episode, pick the most broadly relevant one and note this in the oneliner.

Episodes:
${episodeLines.join("\n")}

Return ONLY a valid JSON array matching this schema (no markdown, no explanation):
${PODCAST_SCHEMA}`;

  try {
    const message = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 1024,
      messages: [{ role: "user", content: prompt }],
    });

    const raw = message.content.find((b) => b.type === "text")?.text ?? "";
    const jsonStr = raw.replace(/^```(?:json)?\s*/i, "").replace(/\s*```\s*$/, "").trim();
    const parsed: AutoPodcast[] = JSON.parse(jsonStr);

    if (!Array.isArray(parsed)) return [];

    return parsed.filter((p) => p.show && p.title && p.url && p.oneliner);
  } catch {
    return [];
  }
}
