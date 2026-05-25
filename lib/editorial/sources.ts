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

const CIRCUIT_RSS = "https://feeds.transistor.fm/the-circuit";
const CHIP_STOCK_RSS = "https://feeds.transistor.fm/chip-stock-investor";

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

/** Fetch The Circuit + Chip Stock Investor podcast episodes (last N). */
export async function fetchPodcastEpisodes(limit = 4): Promise<RssItem[]> {
  const [circuitXml, chipStockXml] = await Promise.all([
    fetchText(CIRCUIT_RSS),
    fetchText(CHIP_STOCK_RSS),
  ]);
  const circuit = circuitXml ? parseRss(circuitXml, limit) : [];
  const chipStock = chipStockXml ? parseRss(chipStockXml, limit) : [];
  // Return the most recent N from each, show notes are in description
  return [...circuit.slice(0, limit), ...chipStock.slice(0, limit)];
}
