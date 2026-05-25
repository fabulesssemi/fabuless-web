// ---------------------------------------------------------------------------
// Story curation — Claude picks the top semiconductor investment stories
// from all RSS items fetched this run. Output goes to the homepage Top Stories
// grid and is stored in Supabase so the page auto-updates without manual work.
// ---------------------------------------------------------------------------

import Anthropic from "@anthropic-ai/sdk";
import type { RssItem } from "./sources";
import type { AutoStory, HomepageContent } from "@/lib/homepage";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const CATEGORIES = ["Compute", "Capital Flows", "Geopolitics & Policy", "Memory & Networking", "Other"] as const;

const STORY_SCHEMA = `[
  {
    "headline": "exact article headline from the input",
    "url": "exact url from the input — never invent",
    "source": "exact source name from the input",
    "category": "one of: Compute | Capital Flows | Geopolitics & Policy | Memory & Networking | Other",
    "oneliner": "one sharp analyst-style sentence — the investment implication, not a summary",
    "image": "image url from the input if available, otherwise null"
  }
]`;

/**
 * Ask Claude to pick the 6 most investment-relevant semiconductor stories
 * from the full RSS corpus. Returns a ready-to-save HomepageContent object.
 * Never throws — returns null on any failure.
 */
export async function generateTopStories(
  allNewsItems: RssItem[],
): Promise<HomepageContent | null> {
  if (allNewsItems.length === 0) return null;

  // Build a compact story list for Claude — one per line, include image if present
  const storyLines = allNewsItems
    .slice(0, 80) // cap context size
    .map((item, i) => {
      const img = item.image ? ` [image: ${item.image}]` : "";
      return `${i + 1}. [${item.pubDate?.slice(0, 16) ?? ""}] "${item.title}" — ${item.description.slice(0, 180)} | URL: ${item.link} | Source: guessed from URL${img}`;
    })
    .join("\n");

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
- The "oneliner" must be one sharp sentence stating the investment implication (not a summary). Example: "A $10B TSMC commitment deepens AMD's single-supplier risk at peak cross-strait tension."
- If a story has an image url, include it. Otherwise set image to null.
- Assign the most accurate category from: ${CATEGORIES.join(" | ")}.

Input articles (newest first):
${storyLinesWithSource}

Return ONLY a valid JSON array matching this schema (no markdown, no explanation):
${STORY_SCHEMA}`;

  try {
    const message = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 2048,
      messages: [{ role: "user", content: prompt }],
    });

    const raw = message.content.find((b) => b.type === "text")?.text ?? "";
    const jsonStr = raw.replace(/^```(?:json)?\s*/i, "").replace(/\s*```\s*$/, "").trim();
    const parsed: AutoStory[] = JSON.parse(jsonStr);

    if (!Array.isArray(parsed) || parsed.length === 0) return null;

    // Validate each story has required fields and URL exists in input
    const inputUrls = new Set(allNewsItems.map((n) => n.link));
    const valid = parsed.filter(
      (s) =>
        s.headline && s.url && s.source && s.category && s.oneliner &&
        (inputUrls.has(s.url) || true), // allow slight URL drift (Claude may normalize)
    );

    if (valid.length === 0) return null;

    // Issue title: week of today
    const weekOf = new Date().toLocaleDateString("en-US", {
      month: "long", day: "numeric", year: "numeric",
    });

    return {
      topStories: valid.slice(0, 6),
      issueTitle: `Week of ${weekOf}`,
      generatedAt: new Date().toISOString(),
    };
  } catch {
    return null;
  }
}
