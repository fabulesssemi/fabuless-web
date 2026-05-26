// RSS source fetching for editorial generation.
// All functions are graceful — never throw, return [] on any error.

export type RssItem = {
  title: string;
  description: string;
  pubDate: string;
  link: string;
  image: string | null; // extracted from enclosure / media:content / media:thumbnail
};

const RSS_FEEDS = [
  "https://feeds.reuters.com/reuters/technologyNews",
  "https://search.cnbc.com/rs/search/combinedcms/view.xml?partnerId=wrss01&id=19854910",
  "https://www.nextplatform.com/feed/",
  "https://semiwiki.com/feed/",
  "https://www.benzinga.com/feeds/analyst-ratings/rss",
];

const PODCAST_FEEDS: { show: string; url: string }[] = [
  { show: "The Circuit",           url: "https://feeds.transistor.fm/the-circuit" },
  { show: "Chip Stock Investor",   url: "https://feeds.transistor.fm/chip-stock-investor" },
  // Invest Like the Best — semiconductor episodes (power, wafers, AI capex) are highly relevant
  { show: "Invest Like the Best",  url: "https://feeds.megaphone.fm/FS3946346007" },
];

async function fetchText(url: string, timeoutMs = 8000): Promise<string | null> {
  try {
    const res = await fetch(url, {
      signal: AbortSignal.timeout(timeoutMs),
      headers: { "User-Agent": "Fabuless/1.0 (+https://fabuless.ai)" },
      next: { revalidate: 3600 },
    });
    if (!res.ok) return null;
    return res.text();
  } catch {
    return null;
  }
}

function cdataText(raw: string): string {
  return raw.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1").trim();
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

/** Extract an image URL from a feed item chunk (tries multiple RSS image conventions). */
function extractItemImage(chunk: string): string | null {
  // <enclosure url="..." type="image/..."/>
  const enc = chunk.match(/<enclosure[^>]+url="([^"]+)"[^>]*type="image/i)?.[1];
  if (enc) return enc;
  // <media:content medium="image" url="..."> (attribute order varies)
  const mc1 = chunk.match(/<media:content[^>]+medium="image"[^>]+url="([^"]+)"/i)?.[1]
    ?? chunk.match(/<media:content[^>]+url="([^"]+)"[^>]*medium="image"/i)?.[1];
  if (mc1) return mc1;
  // <media:thumbnail url="..."/>
  const thumb = chunk.match(/<media:thumbnail[^>]+url="([^"]+)"/i)?.[1];
  if (thumb) return thumb;
  // Fallback: any media:content url (may be video; callers can filter)
  const mc2 = chunk.match(/<media:content[^>]+url="([^"]+)"/i)?.[1];
  if (mc2) return mc2;
  return null;
}

function parseRss(xml: string, limit = 60): RssItem[] {
  const items: RssItem[] = [];
  const itemRe = /<item>([\s\S]*?)<\/item>/g;
  let m: RegExpExecArray | null;
  while ((m = itemRe.exec(xml)) !== null && items.length < limit) {
    const chunk = m[1];
    const title = cdataText(chunk.match(/<title>([\s\S]*?)<\/title>/)?.[1] ?? "");
    const description = stripHtml(
      cdataText(chunk.match(/<description>([\s\S]*?)<\/description>/)?.[1] ?? ""),
    ).slice(0, 400);
    const link = cdataText(chunk.match(/<link>([\s\S]*?)<\/link>/)?.[1] ?? "");
    const pubDate = cdataText(chunk.match(/<pubDate>([\s\S]*?)<\/pubDate>/)?.[1] ?? "");
    const image = extractItemImage(chunk);
    if (title) items.push({ title, description, link, pubDate, image });
  }
  return items;
}

export function filterByKeywords(items: RssItem[], keywords: string[]): RssItem[] {
  const kw = keywords.map((k) => k.toLowerCase());
  return items.filter((item) => {
    const text = `${item.title} ${item.description}`.toLowerCase();
    return kw.some((k) => text.includes(k));
  });
}

/** Fetch all configured news/analyst RSS feeds in parallel. Returns merged list. */
export async function fetchAllNewsItems(): Promise<RssItem[]> {
  const results = await Promise.all(
    RSS_FEEDS.map(async (url) => {
      const xml = await fetchText(url);
      if (!xml) return [];
      return parseRss(xml);
    }),
  );
  return results.flat();
}

export type PodcastFeed = { show: string; episodes: RssItem[] };

/**
 * Fetch all podcast feeds in parallel. Returns structured data per show,
 * including episodes from all 3 shows (The Circuit, Chip Stock Investor,
 * Invest Like the Best). Fetches up to `limit` episodes per show.
 * Graceful — missing/failing feeds return an empty episodes array.
 */
export async function fetchAllPodcastFeeds(limit = 10): Promise<PodcastFeed[]> {
  const xmlList = await Promise.all(
    PODCAST_FEEDS.map(({ url }) => fetchText(url)),
  );
  return PODCAST_FEEDS.map(({ show }, i) => ({
    show,
    episodes: xmlList[i] ? parseRss(xmlList[i]!, limit) : [],
  }));
}

/**
 * Flat list of recent episodes from all shows — used as editorial prompt context.
 * Kept for backward compatibility with generateEditorial().
 */
export async function fetchPodcastEpisodes(limit = 4): Promise<RssItem[]> {
  const feeds = await fetchAllPodcastFeeds(limit);
  return feeds.flatMap(({ episodes }) => episodes.slice(0, limit));
}
