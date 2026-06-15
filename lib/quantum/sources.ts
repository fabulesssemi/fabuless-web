// Quantum-specific RSS feeds — completely separate from lib/editorial/sources.ts
// Same RssItem type, different feed list, independent fetch function.
import type { RssItem } from "@/lib/editorial/sources";

export type { RssItem };

const QUANTUM_RSS_FEEDS: { url: string; source: string }[] = [
  // Dedicated quantum publications
  { url: "https://thequantuminsider.com/feed/",                                     source: "The Quantum Insider" },
  { url: "https://quantumcomputingreport.com/feed/",                                source: "Quantum Computing Report" },
  { url: "https://thequantuminsider.com/category/quantum-computing/feed/",          source: "The Quantum Insider" },

  // Science & tech publications (quantum-filtered client-side)
  { url: "https://spectrum.ieee.org/feeds/topic/quantum-computing.rss",             source: "IEEE Spectrum" },
  { url: "https://phys.org/rss-feed/physics-news/quantum-physics/",                source: "Phys.org" },
  { url: "https://www.sciencedaily.com/rss/matter_energy/quantum_physics.xml",      source: "ScienceDaily" },
  { url: "https://feeds.feedburner.com/mit-technology-review/fZXP",                source: "MIT Tech Review" },
  { url: "https://feeds.arstechnica.com/arstechnica/technology",                    source: "Ars Technica" },

  // arXiv quant-ph (research signal — use sparingly, very high volume)
  { url: "https://arxiv.org/rss/quant-ph",                                          source: "arXiv" },

  // Corporate quantum blogs
  { url: "https://research.ibm.com/blog/rss.xml",                                  source: "IBM Research" },
  { url: "https://blog.google/technology/research/rss/",                            source: "Google Research" },
];

async function fetchText(url: string): Promise<string | null> {
  try {
    const res = await fetch(url, {
      signal: AbortSignal.timeout(8000),
      headers: { "User-Agent": "Fabuless/1.0 (+https://fabuless.ai)" },
      next: { revalidate: 3600 },
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

function parseRss(xml: string, source: string, limit = 20): RssItem[] {
  const items: RssItem[] = [];
  const re = /<(?:item|entry)>([\s\S]*?)<\/(?:item|entry)>/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(xml)) !== null && items.length < limit) {
    const c = m[1];
    const title = cdataText(c.match(/<title[^>]*>([\s\S]*?)<\/title>/)?.[1] ?? "");
    const description = stripHtml(cdataText(
      c.match(/<description>([\s\S]*?)<\/description>/)?.[1] ??
      c.match(/<summary[^>]*>([\s\S]*?)<\/summary>/)?.[1] ?? ""
    )).slice(0, 400);
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

function isRecent(pubDate: string, maxDays = 30): boolean {
  if (!pubDate) return true;
  const t = new Date(pubDate).getTime();
  if (isNaN(t)) return true;
  return Date.now() - t <= maxDays * 86_400_000;
}

export async function fetchQuantumNewsItems(): Promise<RssItem[]> {
  const results = await Promise.all(
    QUANTUM_RSS_FEEDS.map(async ({ url, source }) => {
      const xml = await fetchText(url);
      if (!xml) return [];
      return parseRss(xml, source).filter((item) => isRecent(item.pubDate));
    })
  );
  return results.flat();
}
