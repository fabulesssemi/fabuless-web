// Editorial generation via Claude Sonnet 4.6.
// Builds a grounded prompt from live analyst data + RSS context, then calls
// the API and parses the JSON response. Falls back to the static editorial
// if anything goes wrong — never throws.

import Anthropic from "@anthropic-ai/sdk";
import type { CompanyMeta, CompanyEditorial } from "@/lib/companies";
import type { AnalystView } from "@/lib/analyst/types";
import { filterByKeywords, fetchAllNewsItems, fetchPodcastEpisodes, type RssItem } from "./sources";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// ---------------------------------------------------------------------------
// Helpers for news enrichment
// ---------------------------------------------------------------------------

function sourceFromUrl(url: string): string | undefined {
  try {
    const host = new URL(url).hostname.replace(/^www\./, "");
    const KNOWN: Record<string, string> = {
      "reuters.com": "Reuters",
      "cnbc.com": "CNBC",
      "nextplatform.com": "NextPlatform",
      "semiwiki.com": "SemiWiki",
      "benzinga.com": "Benzinga",
    };
    return KNOWN[host] ?? host;
  } catch {
    return undefined;
  }
}

function isoFromPubDate(s: string): string | undefined {
  if (!s) return undefined;
  try {
    const d = new Date(s);
    return isNaN(d.getTime()) ? undefined : d.toISOString();
  } catch {
    return undefined;
  }
}

function fmtActions(view: AnalystView): string {
  const actions = view.recentActions?.slice(0, 8) ?? [];
  if (actions.length === 0) return "  None in the past 30 days.";
  return actions
    .map((a) => {
      const parts = [`  - ${a.firm}: ${a.action ?? "note"}`];
      if (a.toGrade) parts.push(`to ${a.toGrade}`);
      if (a.newTarget) parts.push(`(PT: $${a.newTarget})`);
      if (a.analyst) parts.push(`[${a.analyst}]`);
      if (a.date) parts.push(a.date.slice(0, 10));
      return parts.join(" ");
    })
    .join("\n");
}

function fmtNews(items: RssItem[]): string {
  if (items.length === 0) return "  No recent headlines found.";
  return items
    .slice(0, 12)
    .map((i) => `  - ${i.title}${i.description ? ` — ${i.description.slice(0, 150)}` : ""}`)
    .join("\n");
}

function fmtPodcasts(episodes: RssItem[], keywords: string[]): string {
  // Include episodes that mention the company, or just the most recent ones if none match
  const kw = keywords.map((k) => k.toLowerCase());
  const relevant = episodes.filter((e) =>
    kw.some((k) => `${e.title} ${e.description}`.toLowerCase().includes(k)),
  );
  const toShow = relevant.length > 0 ? relevant.slice(0, 3) : episodes.slice(0, 2);
  if (toShow.length === 0) return "  No recent podcast coverage found.";
  return toShow
    .map((e) => `  Episode: "${e.title}"\n  ${e.description.slice(0, 500)}`)
    .join("\n\n");
}

const OUTPUT_SCHEMA = `{
  "quickTake": "2-3 sentences on what the company does, why it matters in AI semis, and the core investment tension right now.",
  "ecosystemRole": "1-2 sentences on how it fits in the broader AI supply chain.",
  "investorFocus": "1-2 sentences on what the market is currently focused on — name the specific product, cycle, or risk driving the narrative.",
  "whyItMatters": {
    "business": "2-3 sentences on business model dynamics — moats, concentrations, key levers.",
    "investment": "2-3 sentences on what drives the stock — catalysts, risks, valuation context.",
    "ecosystem": "2-3 sentences on supply chain and ecosystem implications."
  },
  "keyThemes": [{"title": "short title", "detail": "1-2 sentences on the theme and why it matters"}],
  "bullCase": ["one sentence per point — specific, not generic"],
  "bearCase": ["one sentence per point — specific, not generic"],
  "guidanceCommentary": "1-2 sentences on what to watch and listen for on earnings calls.",
  "consensusBullThemes": ["short phrase"],
  "consensusBearThemes": ["short phrase"],
  "quarterlyGM": [{"q": "Q1 FY25", "gm": 78.4}, {"q": "Q2 FY25", "gm": 75.1}],
  "revenueSegments": [{"name": "Data Center", "pct": 88}, {"name": "Gaming", "pct": 8}],
  "fiscalLabel": "Q1 FY26"
}`;
// revenueSegments rules (for the prompt):
// - Extract from the most recent earnings report visible in the news/podcast data.
// - Use short names (≤14 chars). Percentages must be integers summing to 100.
// - fiscalLabel: the quarter or fiscal year these numbers come from, e.g. "Q2 FY25" or "FY2024".
// - Return null for BOTH fields if the news below does not contain enough segment data.

export async function generateEditorial(
  meta: CompanyMeta,
  analystView: AnalystView,
  baseline: CompanyEditorial,
  allNewsItems: RssItem[],
  podcastEpisodes: RssItem[],
): Promise<CompanyEditorial> {
  const companyNews = filterByKeywords(allNewsItems, meta.newsKeywords);

  // Build pinnedNews from the RSS items the pipeline already fetched and filtered.
  // These are guaranteed relevant (passed the keyword filter), from curated sources,
  // and will be stored in Supabase — auto-revalidating the company page each cron run.
  const freshPinnedNews = companyNews
    .filter((n) => n.link && n.title)
    .sort((a, b) => {
      // Prefer more recent items when pubDate is available
      const ta = a.pubDate ? new Date(a.pubDate).getTime() : 0;
      const tb = b.pubDate ? new Date(b.pubDate).getTime() : 0;
      return tb - ta;
    })
    .slice(0, 12)
    .map((n) => ({
      title: n.title,
      url: n.link,
      source: sourceFromUrl(n.link),
      publishedAt: isoFromPubDate(n.pubDate),
    }));
  const bs = analystView.buyShare != null ? `${analystView.buyShare.toFixed(0)}%` : "N/A";
  const pt = analystView.avgPriceTarget != null ? `$${analystView.avgPriceTarget.toFixed(0)}` : "N/A";
  const upside = analystView.impliedUpsidePct != null
    ? `${analystView.impliedUpsidePct > 0 ? "+" : ""}${analystView.impliedUpsidePct.toFixed(1)}%`
    : "N/A";

  const prompt = `You are a senior equity research analyst writing for Fabuless, a semiconductor investment intelligence service read by professional investors.

Your task: Generate timely, accurate editorial content for ${meta.name} (${meta.ticker}) — ${meta.sector}.

RULES:
- Every number you cite must come from the data below. Do not invent figures.
- Write like an analyst, not marketing copy. Be direct about risks.
- Be specific. "Buy share has risen to 84%" beats "analysts are increasingly bullish".
- If recent news or podcast commentary mentions something notable about this company, incorporate it.
- The keyThemes array should have 4–7 items. bullCase and bearCase should have 3–5 items each.
- consensusBullThemes and consensusBearThemes should be 2–4 short phrases (not full sentences) suitable for analyst-consensus badges.
- For quarterlyGM: extract the last 4–6 quarters of GAAP gross margin percentages from the earnings headlines and podcast notes below. Use format "Q1 FY26" (fiscal year label). gm is a number 0–100 (e.g. 74.1 not 0.741). Order oldest → newest. If you cannot find at least 2 confirmed quarters in the data below, return []. Never invent numbers.
- For revenueSegments + fiscalLabel: extract the most recent revenue-by-segment breakdown from the earnings data below. Short names (≤14 chars). All pct values must be integers summing to exactly 100. fiscalLabel is the period covered (e.g. "Q1 FY26" or "FY2024"). If the news below does not contain enough segment data, return null for both revenueSegments and fiscalLabel.

## Prior editorial baseline (for context and structural continuity — update as needed):
quickTake: ${baseline.quickTake}
ecosystemRole: ${baseline.ecosystemRole}
investorFocus: ${baseline.investorFocus}
Current key themes: ${baseline.keyThemes.map((t) => t.title).join(", ")}

## Live Analyst Data (as of today, ${new Date().toISOString().slice(0, 10)}):
- Buy share: ${bs} (${analystView.numberOfAnalysts ?? "?"} analysts)
- Average price target: ${pt} | Implied upside: ${upside}
- Sentiment direction: ${analystView.sentimentDirection ?? "stable"} (${analystView.sentimentScore ?? 0}pp change in buy share)
- Upgrades last 30d: ${analystView.upgrades30d ?? 0} | Downgrades last 30d: ${analystView.downgrades30d ?? 0}
- Recent rating actions:
${fmtActions(analystView)}

## Recent News Headlines (last 14 days):
${fmtNews(companyNews)}

## The Circuit & Chip Stock Investor Podcast (recent episodes):
${fmtPodcasts(podcastEpisodes, meta.newsKeywords)}

Return ONLY valid JSON matching this exact schema (no markdown, no explanation):
${OUTPUT_SCHEMA}`;

  try {
    const message = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 2048,
      messages: [{ role: "user", content: prompt }],
    });

    const raw = message.content.find((b) => b.type === "text")?.text ?? "";
    // Strip any markdown code fences if present
    const jsonStr = raw.replace(/^```(?:json)?\s*/i, "").replace(/\s*```\s*$/, "").trim();
    const parsed = JSON.parse(jsonStr);

    return {
      slug: meta.slug,
      quickTake: parsed.quickTake ?? baseline.quickTake,
      ecosystemRole: parsed.ecosystemRole ?? baseline.ecosystemRole,
      investorFocus: parsed.investorFocus ?? baseline.investorFocus,
      whyItMatters: {
        business: parsed.whyItMatters?.business ?? baseline.whyItMatters.business,
        investment: parsed.whyItMatters?.investment ?? baseline.whyItMatters.investment,
        ecosystem: parsed.whyItMatters?.ecosystem ?? baseline.whyItMatters.ecosystem,
      },
      keyThemes: Array.isArray(parsed.keyThemes) ? parsed.keyThemes : baseline.keyThemes,
      bullCase: Array.isArray(parsed.bullCase) ? parsed.bullCase : baseline.bullCase,
      bearCase: Array.isArray(parsed.bearCase) ? parsed.bearCase : baseline.bearCase,
      guidanceCommentary: parsed.guidanceCommentary ?? baseline.guidanceCommentary,
      consensusBullThemes: Array.isArray(parsed.consensusBullThemes)
        ? parsed.consensusBullThemes
        : baseline.consensusBullThemes,
      consensusBearThemes: Array.isArray(parsed.consensusBearThemes)
        ? parsed.consensusBearThemes
        : baseline.consensusBearThemes,
      // Use freshly extracted quarters if Claude found them, else keep existing
      quarterlyGM:
        Array.isArray(parsed.quarterlyGM) && parsed.quarterlyGM.length >= 2
          ? parsed.quarterlyGM
          : baseline.quarterlyGM,
      // Use freshly extracted segments if Claude found them and they sum to 100, else keep existing
      revenueSegments: (() => {
        const segs = parsed.revenueSegments;
        if (!Array.isArray(segs) || segs.length === 0) return baseline.revenueSegments;
        const sum = segs.reduce((acc: number, s: { pct: number }) => acc + (s.pct ?? 0), 0);
        return sum >= 98 && sum <= 102 ? segs : baseline.revenueSegments;
      })(),
      fiscalLabel: parsed.fiscalLabel ?? baseline.fiscalLabel,
      // Curated news — always use freshly fetched RSS items (never fall back to stale baseline).
      // If the pipeline found 0 relevant articles for this company, preserve any prior pinned news.
      pinnedNews: freshPinnedNews.length > 0 ? freshPinnedNews : baseline.pinnedNews,
      // Preserve structural fields from the curated static editorial
      supplyChain: baseline.supplyChain,
      related: baseline.related,
      updated: new Date().toISOString().slice(0, 10),
    };
  } catch {
    // Any failure (API error, JSON parse error) returns the baseline + fresh pinned news
    return {
      ...baseline,
      pinnedNews: freshPinnedNews.length > 0 ? freshPinnedNews : baseline.pinnedNews,
      updated: new Date().toISOString().slice(0, 10),
    };
  }
}
