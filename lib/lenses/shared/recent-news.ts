/**
 * Fetches and filters live RSS news for lens queries.
 * Called in parallel with corpus retrieval — adds real-time context
 * so answers can reference current events the corpus doesn't cover.
 */

import { fetchAllNewsItems, filterByKeywords } from "@/lib/editorial/sources";

export interface RecentNewsItem {
  title: string;
  description: string;
  source: string;
  pubDate: string;
  link: string;
  formattedDate: string;
}

const STOP_WORDS = new Set([
  "the","a","an","is","are","was","were","be","been","have","has","had",
  "do","does","did","will","would","could","should","what","which","who",
  "when","where","why","how","that","this","these","those","and","or",
  "but","in","on","at","to","for","of","with","about","tell","me","think",
  "can","you","i","it","its","their","they","your","my","his","her","our",
  "just","also","very","really","some","any","all","more","most","like",
  "get","got","going","make","take","give","know","see","look","want",
  "need","said","say","says","view","views","risk","risks","impact",
]);

function extractKeywords(question: string): string[] {
  // Keep company names, tickers, and domain terms intact
  const words = question
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 2 && !STOP_WORDS.has(w));

  // Deduplicate
  return [...new Set(words)];
}

function sourceFromUrl(url: string): string {
  try {
    const host = new URL(url).hostname.replace("www.", "");
    const MAP: Record<string, string> = {
      "reuters.com":       "Reuters",
      "cnbc.com":          "CNBC",
      "nextplatform.com":  "The Next Platform",
      "semiwiki.com":      "SemiWiki",
      "benzinga.com":      "Benzinga",
      "eetimes.com":       "EE Times",
      "arstechnica.com":   "Ars Technica",
      "theregister.com":   "The Register",
      "tomshardware.com":  "Tom's Hardware",
    };
    for (const [domain, name] of Object.entries(MAP)) {
      if (host.includes(domain)) return name;
    }
    return host;
  } catch {
    return "News";
  }
}

function formatPubDate(raw: string): string {
  try {
    const d = new Date(raw);
    if (isNaN(d.getTime())) return raw;
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  } catch {
    return raw;
  }
}

/**
 * Fetch recent news relevant to the user's question.
 * Returns up to `maxItems` items, sorted newest-first.
 * Never throws — returns [] on any error.
 */
export async function fetchRecentNewsForQuery(
  question: string,
  maxItems = 4
): Promise<RecentNewsItem[]> {
  try {
    const keywords = extractKeywords(question);
    if (keywords.length === 0) return [];

    const allNews = await fetchAllNewsItems();
    const filtered = filterByKeywords(allNews, keywords);

    // Sort newest first
    filtered.sort((a, b) => {
      const da = new Date(a.pubDate).getTime() || 0;
      const db = new Date(b.pubDate).getTime() || 0;
      return db - da;
    });

    return filtered.slice(0, maxItems).map((item) => ({
      title: item.title,
      description: item.description,
      source: sourceFromUrl(item.link),
      pubDate: item.pubDate,
      formattedDate: formatPubDate(item.pubDate),
      link: item.link,
    }));
  } catch {
    return [];
  }
}

/**
 * Format recent news items as document blocks for the Claude Citations API.
 * These are prepended before corpus chunks so the model treats them as
 * the most current signal.
 */
export function buildNewsDocumentBlocks(newsItems: RecentNewsItem[]) {
  return newsItems.map((item) => ({
    type: "document" as const,
    source: {
      type: "text" as const,
      media_type: "text/plain" as const,
      data: `${item.title}\n\n${item.description}\n\nSource: ${item.source} | Published: ${item.formattedDate} | URL: ${item.link}`,
    },
    title: `[RECENT NEWS] ${item.source} — ${item.formattedDate}`,
    citations: { enabled: true },
  }));
}
