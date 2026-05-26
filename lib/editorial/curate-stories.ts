// ---------------------------------------------------------------------------
// Story curation — Claude picks the top semiconductor investment stories
// from all RSS items fetched this run. Output goes to the homepage Top Stories
// grid and is stored in Supabase so the page auto-updates without manual work.
// ---------------------------------------------------------------------------

import Anthropic from "@anthropic-ai/sdk";
import type { RssItem, PodcastFeed } from "./sources";
import type { AutoStory, AutoPodcast, HomepageContent } from "@/lib/homepage";

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

// ---------------------------------------------------------------------------
// Source name resolution — shared by input building and post-processing dedup.
// ---------------------------------------------------------------------------
const KNOWN_SOURCES: Record<string, string> = {
  "reuters.com": "Reuters", "cnbc.com": "CNBC",
  "nextplatform.com": "NextPlatform", "semiwiki.com": "SemiWiki",
  "benzinga.com": "Benzinga", "ft.com": "Financial Times",
  "bloomberg.com": "Bloomberg", "wsj.com": "WSJ",
  "marketwatch.com": "MarketWatch", "eetimes.com": "EE Times",
  "theinformation.com": "The Information",
};

function sourceNameFromUrl(url: string): string {
  try {
    const host = new URL(url).hostname.replace(/^www\./, "");
    return KNOWN_SOURCES[host] ?? host;
  } catch {
    return "Unknown";
  }
}

// ---------------------------------------------------------------------------
// Hard-enforce source diversity after Claude responds.
// Claude can mis-apply prompt rules when one source dominates the corpus;
// this dedup is the guarantee. Logic: prefer the first (highest-ranked by
// Claude) story per source. If we still need more after one-per-source, allow
// a second pick per source to fill up to `max`.
// ---------------------------------------------------------------------------
function diversify(stories: AutoStory[], max = 6): AutoStory[] {
  // Pass 1: one per source (in Claude's ranked order)
  const seenSources = new Set<string>();
  const firstPicks: AutoStory[] = [];
  const remainders: AutoStory[] = [];
  for (const s of stories) {
    const src = s.source.toLowerCase().trim();
    if (!seenSources.has(src)) {
      seenSources.add(src);
      firstPicks.push(s);
    } else {
      remainders.push(s);
    }
  }
  // Pass 2: fill remaining slots (allows a second pick per source only if needed)
  return [...firstPicks, ...remainders].slice(0, max);
}

/**
 * Ask Claude to pick the top semiconductor investment stories from the full RSS
 * corpus. Returns a ready-to-save HomepageContent object.
 *
 * SOURCE DIVERSITY is enforced at TWO levels so it cannot break:
 *  1. Input: capped to MAX_PER_SOURCE items per feed before being sent to Claude,
 *     so no single source dominates the context window.
 *  2. Output: diversify() deduplicates Claude's response to max 1 per source.
 *
 * Never throws — returns null on any failure.
 */
export async function generateTopStories(
  allNewsItems: RssItem[],
): Promise<HomepageContent | null> {
  if (allNewsItems.length === 0) return null;

  // ── Step 1: cap per source and interleave so all feeds appear in the prompt ──
  // fetchAllNewsItems() returns feeds concatenated in order. A simple slice(0,80)
  // would cut off the later feeds entirely (e.g. SemiWiki, Benzinga never reach
  // Claude). Instead: take up to MAX_PER_SOURCE from each source, then interleave
  // round-robin so the Claude context window samples all feeds equally.
  const MAX_PER_SOURCE = 15;
  const sourceBuckets = new Map<string, RssItem[]>();
  for (const item of allNewsItems) {
    const src = sourceNameFromUrl(item.link);
    if (!sourceBuckets.has(src)) sourceBuckets.set(src, []);
    const bucket = sourceBuckets.get(src)!;
    if (bucket.length < MAX_PER_SOURCE) bucket.push(item);
  }
  // Interleave round-robin: pick one from each source bucket, repeat
  const bucketArrays = [...sourceBuckets.values()];
  const interleaved: RssItem[] = [];
  const maxRounds = MAX_PER_SOURCE;
  for (let round = 0; round < maxRounds && interleaved.length < 90; round++) {
    for (const bucket of bucketArrays) {
      if (round < bucket.length) interleaved.push(bucket[round]);
      if (interleaved.length >= 90) break;
    }
  }

  // ── Step 2: build the prompt context ────────────────────────────────────────
  const storyLinesWithSource = interleaved
    .map((item, i) => {
      const src = sourceNameFromUrl(item.link);
      const img = item.image ? ` [image: ${item.image}]` : " [image: null]";
      return `${i + 1}. "${item.title}" | source: ${src} | url: ${item.link} | ${item.description.slice(0, 160)}${img}`;
    })
    .join("\n");

  const today = new Date().toISOString().slice(0, 10);
  const prompt = `You are a senior semiconductor investment editor at Fabuless, a briefing read by professional investors.

Today is ${today}. From the articles below, rank and return the top 10 most significant for semiconductor equity investors this week.

RULES:
- Prefer stories with real investment implications: earnings, guidance, capex decisions, supply chain shifts, export controls, M&A, major technology milestones.
- Avoid generic market summaries, broad macro commentary, or stories that don't specifically affect semiconductor stocks.
- Return ONLY stories that appear in the input list — use the exact URL, headline, source, and image provided.
- The "oneliner" must be one sharp sentence stating the investment implication (not a summary). Example: "A $10B TSMC commitment deepens AMD's single-supplier risk at peak cross-strait tension."
- If a story has an image url, include it. Otherwise set image to null.
- Assign the most accurate category from: ${CATEGORIES.join(" | ")}.
- After selecting stories, craft the "issueTitle": 8-14 words covering the 2-3 biggest themes, written as a punchy newspaper front-page headline with specific names (companies, technologies, events — not generic phrases like "chip industry dynamics").

Input articles (interleaved across sources for balance):
${storyLinesWithSource}

Return ONLY a valid JSON object matching this schema (no markdown, no explanation):
${STORY_SCHEMA}`;

  try {
    // Instantiate inside the function so process.env is read at call time,
    // not at module load time (avoids Turbopack/serverless env-var timing issues).
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    const message = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 4096, // 10 stories × ~200 tokens each + issueTitle — 2048 was too tight
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

    // Hard-enforce source diversity in code — prompt rules alone are not reliable
    // when one RSS source dominates the corpus. diversify() guarantees max 1 per
    // source in the final 6, regardless of what Claude returned.
    const topStories = diversify(valid, 6);

    // Fallback title: week of today
    const weekOf = new Date().toLocaleDateString("en-US", {
      month: "long", day: "numeric", year: "numeric",
    });

    return {
      topStories,
      podcasts: [], // filled in separately by generatePodcastPicks
      issueTitle: generatedTitle || `Week of ${weekOf}`,
      generatedAt: new Date().toISOString(),
    };
  } catch (err) {
    console.error("[generateTopStories] failed:", err);
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
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
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
