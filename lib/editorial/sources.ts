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
  "https://www.chipstrat.com/feed",                           // Chipstrat (Austin Lyons) — semi strategy, sits between SemiAnalysis and Stratechery
  "https://www.benzinga.com/feeds/analyst-ratings/rss",
  "https://www.eetimes.com/feed/",                          // EE Times — deep semiconductor/IC industry coverage
  "https://www.tomshardware.com/feeds/all",                 // Tom's Hardware — GPU/chip news (images hotlink-blocked, filtered below)
  "https://feeds.feedburner.com/typepad/siliconleverage",   // Silicon Leverage — semiconductor analyst blog
  "https://feeds.arstechnica.com/arstechnica/technology",   // Ars Technica — reliable tech images, chip/AI coverage
  "https://www.theregister.com/headlines.atom",             // The Register — chip industry, strong semiconductor beat
  "https://wccftech.com/feed/",                             // WCCFtech — GPU/CPU/chip hardware news
  "https://www.digitimes.com/rss/daily.xml",               // Digitimes — Asia semiconductor supply chain, TSMC/fab focus
];

// CDN domains that hotlink-protect their images — browsers get 403 when the
// Referer is an external site. Treat image URLs from these domains as null so
// the pipeline filters those articles out of Top Stories automatically.
const HOTLINK_BLOCKED_IMAGE_DOMAINS = [
  "cdn.mos.cms.futurecdn.net", // Tom's Hardware, PC Gamer, etc. (Future Publishing CDN)
];

const PODCAST_FEEDS: { show: string; url: string }[] = [
  { show: "The Circuit",           url: "https://feeds.transistor.fm/the-circuit" },
  { show: "Chip Stock Investor",   url: "https://anchor.fm/s/e2cacf78/podcast/rss" },
  { show: "Invest Like the Best",  url: "https://feeds.megaphone.fm/investlikethebest" },
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

/** Return null if this image URL is from a known hotlink-protected CDN. */
function isHotlinkBlocked(url: string): boolean {
  try {
    const host = new URL(url).hostname;
    return HOTLINK_BLOCKED_IMAGE_DOMAINS.some((d) => host === d || host.endsWith(`.${d}`));
  } catch { return false; }
}

/** Extract an image URL from a feed item chunk (tries multiple RSS image conventions). */
function extractItemImage(chunk: string): string | null {
  const check = (url: string | undefined): string | null =>
    url && !isHotlinkBlocked(url) ? url : null;

  // <enclosure url="..." type="image/..."/>
  const enc = chunk.match(/<enclosure[^>]+url="([^"]+)"[^>]*type="image/i)?.[1];
  if (check(enc)) return enc!;
  // <media:content medium="image" url="..."> (attribute order varies)
  const mc1 = chunk.match(/<media:content[^>]+medium="image"[^>]+url="([^"]+)"/i)?.[1]
    ?? chunk.match(/<media:content[^>]+url="([^"]+)"[^>]*medium="image"/i)?.[1];
  if (check(mc1)) return mc1!;
  // <media:thumbnail url="..."/>
  const thumb = chunk.match(/<media:thumbnail[^>]+url="([^"]+)"/i)?.[1];
  if (check(thumb)) return thumb!;
  // <thumbnail url="..."/> (no namespace — used by CNBC and some others)
  const thumb2 = chunk.match(/<thumbnail[^>]+url="([^"]+)"/i)?.[1];
  if (check(thumb2)) return thumb2!;
  // Fallback: any media:content url (may be video; callers can filter)
  const mc2 = chunk.match(/<media:content[^>]+url="([^"]+)"/i)?.[1];
  if (check(mc2)) return mc2!;
  // <itunes:image href="..."/> — standard podcast episode artwork
  const itunesImg = chunk.match(/<itunes:image[^>]+href="([^"]+)"/i)?.[1];
  if (check(itunesImg)) return itunesImg!;
  // Last resort: first <img src="..."> inside content:encoded HTML
  const encoded = chunk.match(/<content:encoded>([\s\S]*?)<\/content:encoded>/i)?.[1] ?? "";
  const imgSrc = encoded.match(/<img[^>]+src="(https?:[^"]+)"/i)?.[1];
  if (check(imgSrc)) return imgSrc!;
  return null;
}

function parseRss(xml: string, limit = 60): RssItem[] {
  const items: RssItem[] = [];
  // Support both RSS (<item>) and Atom (<entry>) feeds.
  const itemRe = /<(?:item|entry)>([\s\S]*?)<\/(?:item|entry)>/g;
  let m: RegExpExecArray | null;
  while ((m = itemRe.exec(xml)) !== null && items.length < limit) {
    const chunk = m[1];
    const title = cdataText(chunk.match(/<title[^>]*>([\s\S]*?)<\/title>/)?.[1] ?? "");
    // Atom uses <summary> or <content> instead of <description>
    const description = stripHtml(
      cdataText(
        chunk.match(/<description>([\s\S]*?)<\/description>/)?.[1] ??
        chunk.match(/<summary[^>]*>([\s\S]*?)<\/summary>/)?.[1] ??
        chunk.match(/<content[^>]*>([\s\S]*?)<\/content>/)?.[1] ??
        "",
      ),
    ).slice(0, 400);
    // Atom uses <link href="..." rel="alternate"/> instead of a text-node <link>
    const link =
      cdataText(chunk.match(/<link>([\s\S]*?)<\/link>/)?.[1] ?? "") ||
      (chunk.match(/<link[^>]+href="([^"]+)"/i)?.[1] ?? "");
    // Atom uses <published> or <updated> instead of <pubDate>
    const pubDate =
      cdataText(chunk.match(/<pubDate>([\s\S]*?)<\/pubDate>/)?.[1] ?? "") ||
      (chunk.match(/<published>([\s\S]*?)<\/published>/)?.[1] ?? "") ||
      (chunk.match(/<updated>([\s\S]*?)<\/updated>/)?.[1] ?? "");
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
  return PODCAST_FEEDS.map(({ show }, i) => {
    const xml = xmlList[i];
    if (!xml) return { show, episodes: [] };
    // Channel-level show artwork — fallback for episodes without their own image
    const channelArtwork = xml.match(/<itunes:image[^>]+href="([^"]+)"/i)?.[1] ?? null;
    const episodes = parseRss(xml, limit).map((ep) => ({
      ...ep,
      image: ep.image ?? channelArtwork,
    }));
    return { show, episodes };
  });
}

/**
 * Flat list of recent episodes from all shows — used as editorial prompt context.
 * Kept for backward compatibility with generateEditorial().
 */
export async function fetchPodcastEpisodes(limit = 4): Promise<RssItem[]> {
  const feeds = await fetchAllPodcastFeeds(limit);
  return feeds.flatMap(({ episodes }) => episodes.slice(0, limit));
}

/**
 * Fetch the latest episode from each podcast show — used directly on the
 * homepage so the podcast section always reflects the most recent episode
 * without waiting for the weekly cron. Revalidates every 4 hours.
 */
export async function fetchLatestEpisodePerShow(): Promise<
  { show: string; title: string; url: string; image: string | null; description: string }[]
> {
  const xmlList = await Promise.all(
    PODCAST_FEEDS.map(({ url }) =>
      fetch(url, {
        signal: AbortSignal.timeout(8000),
        headers: { "User-Agent": "Fabuless/1.0 (+https://fabuless.ai)" },
        next: { revalidate: 14400 }, // 4 hours
      })
        .then((r) => (r.ok ? r.text() : null))
        .catch(() => null),
    ),
  );

  return PODCAST_FEEDS.map(({ show }, i) => {
    const xml = xmlList[i];
    if (!xml) return null;
    const channelArtwork = xml.match(/<itunes:image[^>]+href="([^"]+)"/i)?.[1] ?? null;
    const episodes = parseRss(xml, 1).map((ep) => ({
      ...ep,
      image: ep.image ?? channelArtwork,
    }));
    if (!episodes.length) return null;
    const ep = episodes[0];
    return { show, title: ep.title, url: ep.link, image: ep.image ?? null, description: ep.description };
  }).filter((x): x is NonNullable<typeof x> => x !== null);
}
