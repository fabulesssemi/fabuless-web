// ---------------------------------------------------------------------------
// Story curation — Claude picks the top semiconductor investment stories
// from all RSS items fetched this run. Output goes to the homepage Top Stories
// grid and is stored in Supabase so the page auto-updates without manual work.
// ---------------------------------------------------------------------------

import Anthropic from "@anthropic-ai/sdk";
import type { RssItem, PodcastFeed } from "./sources";
import type { AutoStory, AutoPodcast, HomepageContent } from "@/lib/homepage";

const CATEGORIES = ["Compute", "Capital Flows", "Geopolitics & Policy", "Memory & Networking", "Other"] as const;

// Probe an image URL to detect portrait orientation without downloading the full image.
// Reads just enough bytes to parse width/height from PNG/JPEG/WebP/GIF headers.
async function probeImageAspect(url: string): Promise<{ width: number; height: number } | null> {
  try {
    const res = await fetch(url, { headers: { Range: "bytes=0-32767" }, signal: AbortSignal.timeout(3000) });
    if (!res.ok) return null;
    const buf = Buffer.from(await res.arrayBuffer());

    // PNG: signature 8 bytes, then IHDR chunk: 4 len + 4 "IHDR" + 4 width + 4 height
    if (buf[0] === 0x89 && buf[1] === 0x50) {
      const w = buf.readUInt32BE(16);
      const h = buf.readUInt32BE(20);
      return { width: w, height: h };
    }
    // JPEG: scan for SOF0/SOF2 marker (0xFF 0xC0 or 0xFF 0xC2)
    for (let i = 0; i < buf.length - 9; i++) {
      if (buf[i] === 0xff && (buf[i + 1] === 0xc0 || buf[i + 1] === 0xc2)) {
        const h = buf.readUInt16BE(i + 5);
        const w = buf.readUInt16BE(i + 7);
        return { width: w, height: h };
      }
    }
    // WebP: RIFF....WEBPVP8 header, width at offset 26 (10-bit), height at 28 (10-bit)
    if (buf.slice(0, 4).toString("ascii") === "RIFF" && buf.slice(8, 12).toString("ascii") === "WEBP") {
      const w = (buf[26] | ((buf[27] & 0x3f) << 8)) + 1;
      const h = (buf[28] | ((buf[29] & 0x3f) << 8)) + 1;
      return { width: w, height: h };
    }
    return null;
  } catch {
    return null;
  }
}

const STORY_SCHEMA = `{
  "issueTitle": "a punchy 8-14 word editorial headline covering the 2-3 biggest themes from your picks — written like a newspaper front page. Example: 'Nvidia's China Risk, TSMC's Arizona Push, and Samsung's Memory Pivot'",
  "stories": [
    {
      "rank": 1,
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
  "theinformation.com": "The Information", "tomshardware.com": "Tom's Hardware",
  "typepad.com": "Silicon Leverage", "feedburner.com": "Silicon Leverage",
  "arstechnica.com": "Ars Technica", "theregister.com": "The Register",
  "wccftech.com": "WCCFtech", "digitimes.com": "Digitimes",
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
// Pass 1: strictly one per source (best picks).
// Pass 2: if still under `target`, allow second picks from already-seen
//         sources to fill the grid — we always want at least `target` stories.
// Never exceeds `max` total.
// ---------------------------------------------------------------------------
// Multi-pass diversity: prefer 1 per source, then 2, then 3.
// Guarantees at most `maxPerSource` from any single domain.
function diversify(stories: AutoStory[], target = 15, maxPerSource = 3): AutoStory[] {
  const sourceCounts = new Map<string, number>();
  const added = new Set<string>();
  const result: AutoStory[] = [];

  for (let pass = 1; pass <= maxPerSource && result.length < target; pass++) {
    for (const s of stories) {
      if (result.length >= target) break;
      if (added.has(s.url)) continue;
      const src = s.source.toLowerCase().trim();
      const count = sourceCounts.get(src) ?? 0;
      if (count === pass - 1) {
        result.push(s);
        added.add(s.url);
        sourceCounts.set(src, count + 1);
      }
    }
  }

  return result;
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

  // ── Step 1: pre-filter to image-bearing articles only ───────────────────────
  // Stories without images are excluded from Top Stories entirely — the grid
  // requires a real photo. This also prevents recap/roundup pieces (which
  // rarely have article images) from dominating the picks.
  const withImages = allNewsItems.filter((item) => item.image !== null);

  // ── Step 2: cap per source and interleave so all feeds appear in the prompt ──
  // fetchAllNewsItems() returns feeds concatenated in order. A simple slice(0,80)
  // would cut off the later feeds entirely (e.g. SemiWiki, Benzinga never reach
  // Claude). Instead: take up to MAX_PER_SOURCE from each source, then interleave
  // round-robin so the Claude context window samples all feeds equally.
  const MAX_PER_SOURCE = 15;
  const sourceBuckets = new Map<string, RssItem[]>();
  for (const item of withImages) {
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

  if (interleaved.length === 0) return null;

  // ── Step 3: build the prompt context ────────────────────────────────────────
  const storyLinesWithSource = interleaved
    .map((item, i) => {
      const src = sourceNameFromUrl(item.link);
      return `${i + 1}. "${item.title}" | source: ${src} | url: ${item.link} | ${item.description.slice(0, 160)} [image: ${item.image}]`;
    })
    .join("\n");

  const today = new Date().toISOString().slice(0, 10);
  const prompt = `You are a senior semiconductor investment editor at Fabuless, a briefing read by professional investors.

Today is ${today}. From the articles below, rank and return the top 15 most significant for semiconductor equity investors. Assign each a "rank" integer from 1 (most important) to 15.

RULES:
- Prefer stories about SPECIFIC EVENTS: earnings reports, guidance changes, capex announcements, supply chain decisions, export control actions, M&A, major technology milestones, regulatory decisions.
- NEVER pick: weekly recaps ("what you missed"), opinion columns, newsletters, roundups, "top stories" digest pieces, or any article that summarizes other news rather than breaking its own story. These add no value to investors.
- NEVER pick articles with vague or clickbait headlines like "what you might have missed", "here's everything you need to know", "5 things to watch". Real news events have specific factual headlines.
- Return ONLY stories that appear in the input list — use the exact URL, headline, source, and image provided.
- The "oneliner" must be one sharp sentence stating the specific investment implication. Example: "A $10B TSMC commitment deepens AMD's single-supplier risk at peak cross-strait tension."
- Assign the most accurate category from: ${CATEGORIES.join(" | ")}.
- After selecting stories, craft the "issueTitle": 8-14 words covering the 2-3 biggest themes, written as a punchy newspaper front-page headline with specific company names and events.

Input articles (all have images, interleaved across sources for balance):
${storyLinesWithSource}

Return ONLY a valid JSON object matching this schema (no markdown, no explanation):
${STORY_SCHEMA}`;

  try {
    // Instantiate inside the function so process.env is read at call time,
    // not at module load time (avoids Turbopack/serverless env-var timing issues).
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    const message = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 6000, // 15 stories × ~200 tokens each + issueTitle
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

    // Assign rank from Claude's output (or fall back to array position)
    const withRanks = valid.map((s, i) => ({
      ...s,
      rank: (s as AutoStory & { rank?: number }).rank ?? i + 1,
    }));

    // Sort by rank ascending so diversify processes best stories first
    withRanks.sort((a, b) => (a.rank ?? 99) - (b.rank ?? 99));

    // Hard-enforce source diversity: target 15, max 2 per source
    const diversified = diversify(withRanks, 15, 2);

    // Demote Digitimes: never allow it in the first 4 slots (top story grid).
    // Move any Digitimes entries to the back of the list.
    const nonDigitimes = diversified.filter((s) => s.source.toLowerCase() !== "digitimes");
    const digitimesStories = diversified.filter((s) => s.source.toLowerCase() === "digitimes");
    const reordered = [...nonDigitimes, ...digitimesStories];

    // Filter images: null out portraits, headshots, and broken images.
    // Rules applied in order:
    //  1. URL pattern heuristics — reject known headshot/avatar/author URL patterns
    //  2. Aspect ratio — reject if height > width * 1.1 (portrait orientation)
    //  3. Broken fetch — null if the image can't be loaded at all
    const HEADSHOT_PATTERNS = [
      /\/author[s]?\//i, /\/byline\//i, /\/staff\//i, /\/people\//i,
      /\/person\//i, /\/contributor\//i, /\/headshot/i, /\/avatar/i,
      /\/profile[-_]?pic/i, /\/mugshot/i,
    ];

    const topStories = await Promise.all(
      reordered.map(async (s) => {
        if (!s.image) return s;

        // URL heuristic — reject obvious headshot paths before fetching
        if (HEADSHOT_PATTERNS.some((p) => p.test(s.image!))) {
          console.log(`[img-filter] headshot URL pattern nulled for: ${s.headline.slice(0, 60)}`);
          return { ...s, image: null };
        }

        try {
          const dims = await probeImageAspect(s.image);
          // Broken image — probe returned null (fetch failed / unrecognized format)
          if (!dims) {
            console.log(`[img-filter] unloadable image nulled for: ${s.headline.slice(0, 60)}`);
            return { ...s, image: null };
          }
          // Portrait orientation
          if (dims.height > dims.width * 1.1) {
            console.log(`[img-filter] portrait image nulled for: ${s.headline.slice(0, 60)}`);
            return { ...s, image: null };
          }
          // Very square and small — likely an icon or avatar, not an article photo
          if (dims.width < 200 && dims.height < 200) {
            console.log(`[img-filter] tiny image nulled for: ${s.headline.slice(0, 60)}`);
            return { ...s, image: null };
          }
        } catch {
          // Fetch threw — treat as broken
          console.log(`[img-filter] fetch error, image nulled for: ${s.headline.slice(0, 60)}`);
          return { ...s, image: null };
        }
        return s;
      })
    );

    // Push imageless stories to the back so the top 4 slots always have photos.
    // Re-number rank to match the new order — downstream (getHomepageArticles)
    // re-sorts by the persisted rank field, so leaving stale ranks here would
    // silently undo this reordering once written to Supabase.
    const withImagesFirst = [
      ...topStories.filter((s) => s.image),
      ...topStories.filter((s) => !s.image),
    ].map((s, i) => ({ ...s, rank: i + 1 }));

    // Fallback title: week of today
    const weekOf = new Date().toLocaleDateString("en-US", {
      month: "long", day: "numeric", year: "numeric",
    });

    return {
      topStories: withImagesFirst,
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
      model: "claude-haiku-4-5-20251001",
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
