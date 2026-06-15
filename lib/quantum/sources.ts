// Quantum-specific curated RSS sources — independent of lib/editorial/sources.ts
// Covers two lanes: (1) quantum tech/market, (2) consciousness/philosophy/worldview.
import type { RssItem } from "@/lib/editorial/sources";

export type { RssItem };

const QUANTUM_RSS_FEEDS: { url: string; source: string; lane: "tech" | "mind" | "news" }[] = [
  // ── Dedicated quantum publications ──────────────────────────────────────────
  { url: "https://thequantuminsider.com/feed/",          source: "The Quantum Insider",      lane: "tech" },
  { url: "https://thequantumdaily.com/feed/",            source: "The Quantum Daily",        lane: "tech" },
  { url: "https://quantumzeitgeist.com/feed/",           source: "Quantum Zeitgeist",        lane: "tech" },
  { url: "https://quantumcomputingreport.com/feed/",     source: "Quantum Computing Report", lane: "tech" },

  // ── Science journalism (quantum + consciousness) ─────────────────────────────
  { url: "https://www.quantamagazine.org/feed/",                          source: "Quanta Magazine",      lane: "tech" },
  { url: "https://www.technologyreview.com/feed/",                        source: "MIT Tech Review",      lane: "tech" },
  { url: "https://rss.sciam.com/ScientificAmerican-Global",               source: "Scientific American",  lane: "tech" },
  { url: "https://spectrum.ieee.org/feeds/feed.rss",                      source: "IEEE Spectrum",        lane: "tech" },
  { url: "https://www.newscientist.com/feed/home/",                       source: "New Scientist",        lane: "tech" },
  { url: "https://feeds.wired.com/wired/index",                           source: "Wired",                lane: "tech" },
  { url: "https://feeds.arstechnica.com/arstechnica/technology",          source: "Ars Technica",         lane: "tech" },

  // ── Consciousness / philosophy / worldview ───────────────────────────────────
  { url: "https://nautil.us/feed/",                     source: "Nautilus",                  lane: "mind" },
  { url: "https://aeon.co/feed.rss",                    source: "Aeon",                      lane: "mind" },
  { url: "https://bigthink.com/feed/",                  source: "Big Think",                 lane: "mind" },
  { url: "https://closertotruth.com/feed/",             source: "Closer to Truth",           lane: "mind" },
  { url: "https://noetic.org/feed/",                    source: "Noetic Sciences (IONS)",    lane: "mind" },
  { url: "https://deanradin.blogspot.com/feeds/posts/default", source: "Dean Radin",         lane: "mind" },

  // ── Major news (filter for quantum stories) ──────────────────────────────────
  { url: "https://rss.nytimes.com/services/xml/rss/nyt/Science.xml",      source: "NY Times Science",     lane: "news" },
  { url: "https://feeds.bbci.co.uk/news/science_and_environment/rss.xml", source: "BBC Science",          lane: "news" },
  { url: "https://www.theguardian.com/science/rss",                        source: "The Guardian",         lane: "news" },
  { url: "https://www.ft.com/technology?format=rss",                       source: "Financial Times",      lane: "news" },
];

async function fetchText(url: string): Promise<string | null> {
  try {
    const res = await fetch(url, {
      signal: AbortSignal.timeout(10000),
      headers: {
        "User-Agent": "Fabuless/1.0 (+https://fabuless.ai)",
        "Accept": "application/rss+xml, application/atom+xml, application/xml, text/xml",
      },
    });
    if (!res.ok) return null;
    return res.text();
  } catch { return null; }
}

function cdataText(raw: string): string {
  return raw.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1").trim();
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

function extractImage(chunk: string): string | null {
  return (
    chunk.match(/<media:thumbnail[^>]+url="([^"]+)"/i)?.[1] ??
    chunk.match(/<media:content[^>]+url="([^"]+)"/i)?.[1] ??
    chunk.match(/<enclosure[^>]+url="([^"]+)"[^>]*type="image/i)?.[1] ??
    null
  );
}

function parseRss(xml: string, source: string, limit = 25): RssItem[] {
  const items: RssItem[] = [];
  const re = /<(?:item|entry)>([\s\S]*?)<\/(?:item|entry)>/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(xml)) !== null && items.length < limit) {
    const c = m[1];
    const title = cdataText(c.match(/<title[^>]*>([\s\S]*?)<\/title>/)?.[1] ?? "");
    const description = stripHtml(cdataText(
      c.match(/<description>([\s\S]*?)<\/description>/)?.[1] ??
      c.match(/<summary[^>]*>([\s\S]*?)<\/summary>/)?.[1] ?? ""
    )).slice(0, 500);
    const link =
      cdataText(c.match(/<link>([\s\S]*?)<\/link>/)?.[1] ?? "") ||
      (c.match(/<link[^>]+href="([^"]+)"/i)?.[1] ?? "");
    const pubDate =
      cdataText(c.match(/<pubDate>([\s\S]*?)<\/pubDate>/)?.[1] ?? "") ||
      (c.match(/<published>([\s\S]*?)<\/published>/)?.[1] ?? "");
    const image = extractImage(c);
    if (title && link) items.push({ title, description, link, pubDate, source, image });
  }
  return items;
}

function isRecent(pubDate: string, maxDays = 7): boolean {
  if (!pubDate) return true;
  const t = new Date(pubDate).getTime();
  if (isNaN(t)) return true;
  return Date.now() - t <= maxDays * 86_400_000;
}

export async function fetchQuantumNewsItems(): Promise<RssItem[]> {
  const results = await Promise.all(
    QUANTUM_RSS_FEEDS.map(async ({ url, source }) => {
      const xml = await fetchText(url);
      if (!xml) {
        console.log(`  [skip] ${source} — no response`);
        return [];
      }
      const items = parseRss(xml, source).filter((item) => isRecent(item.pubDate));
      console.log(`  [${items.length}] ${source}`);
      return items;
    })
  );
  return results.flat();
}
