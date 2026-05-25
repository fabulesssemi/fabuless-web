import { unstable_cache } from "next/cache";
import { yahooProvider } from "./yahoo";
import type {
  AnalystConsensus,
  AnalystConsensusProvider,
  CompanyMarketData,
  CompanyProfile,
  CompanyProfileProvider,
  EarningsProvider,
  EarningsSnapshot,
  NewsItem,
  NewsProvider,
  Quote,
  QuoteProvider,
} from "./types";

// ---------------------------------------------------------------------------
// Provider registry — list providers per category in PRIORITY ORDER.
// To add Finnhub/FMP/Polygon later: implement the interface, import it, and
// push it onto the relevant array. No UI or page code changes required.
// ---------------------------------------------------------------------------
const profileProviders: CompanyProfileProvider[] = [yahooProvider];
const quoteProviders: QuoteProvider[] = [yahooProvider];
const earningsProviders: EarningsProvider[] = [yahooProvider];
const consensusProviders: AnalystConsensusProvider[] = [yahooProvider];
const newsProviders: NewsProvider[] = [yahooProvider];

// Belt-and-suspenders: providers already catch internally, but never let a
// rogue throw bubble up and break the page.
async function safe<T>(fn: () => Promise<T>): Promise<T | null> {
  try {
    return await fn();
  } catch {
    return null;
  }
}

// Merge partials from multiple providers. Earlier providers win per-field.
function mergePartials<T extends object>(
  parts: (Partial<T> | null)[],
): Partial<T> {
  const out: Record<string, unknown> = {};
  for (const part of parts) {
    if (!part) continue;
    for (const [k, v] of Object.entries(part)) {
      if (v !== undefined && v !== null && out[k] === undefined) out[k] = v;
    }
  }
  return out as Partial<T>;
}

async function collectProfile(symbol: string): Promise<CompanyProfile | null> {
  const parts = await Promise.all(
    profileProviders.map((p) => safe(() => p.getProfile(symbol))),
  );
  const merged = mergePartials<CompanyProfile>(parts);
  if (Object.keys(merged).length === 0) return null;
  return {
    ticker: merged.ticker ?? symbol,
    name: merged.name ?? symbol,
    ...merged,
  };
}

async function collectQuote(symbol: string): Promise<Quote | null> {
  const parts = await Promise.all(
    quoteProviders.map((p) => safe(() => p.getQuote(symbol))),
  );
  const merged = mergePartials<Quote>(parts);
  return Object.keys(merged).length === 0 ? null : merged;
}

async function collectEarnings(
  symbol: string,
): Promise<EarningsSnapshot | null> {
  const parts = await Promise.all(
    earningsProviders.map((p) => safe(() => p.getEarnings(symbol))),
  );
  const merged = mergePartials<EarningsSnapshot>(parts);
  return Object.keys(merged).length === 0 ? null : merged;
}

async function collectConsensus(
  symbol: string,
): Promise<AnalystConsensus | null> {
  const parts = await Promise.all(
    consensusProviders.map((p) => safe(() => p.getConsensus(symbol))),
  );
  const merged = mergePartials<AnalystConsensus>(parts);
  return Object.keys(merged).length === 0 ? null : merged;
}

async function collectNews(
  symbol: string,
  limit: number,
  keywords?: string[],
): Promise<NewsItem[]> {
  function applyKeywords(items: NewsItem[]): NewsItem[] {
    if (!keywords?.length) return items;
    return items.filter((item) =>
      keywords.some((kw) => (item.title ?? "").toLowerCase().includes(kw.toLowerCase())),
    );
  }

  function dedup(lists: (NewsItem[] | null)[], seen: Set<string>): NewsItem[] {
    const out: NewsItem[] = [];
    for (const list of lists) {
      for (const item of list ?? []) {
        if (!item.url || seen.has(item.url)) continue;
        seen.add(item.url);
        out.push(item);
      }
    }
    return out;
  }

  const seen = new Set<string>();

  // Primary search: by ticker symbol
  const primaryLists = await Promise.all(
    newsProviders.map((p) => safe(() => p.getNews(symbol, { limit: limit * 3 }))),
  );
  const primaryAll = dedup(primaryLists, seen);
  const primaryFiltered = applyKeywords(primaryAll);

  if (primaryFiltered.length > 0) {
    primaryFiltered.sort((a, b) => (b.publishedAt ?? "").localeCompare(a.publishedAt ?? ""));
    return primaryFiltered.slice(0, limit);
  }

  // Secondary search: if the ticker search returned items but none matched
  // keywords (e.g. Korean stocks, or tickers Yahoo maps to generic news),
  // try searching by the primary keyword phrase instead.
  // Never fall back to unfiltered results — that shows irrelevant articles.
  if (keywords?.length && primaryAll.length > 0) {
    const secondaryLists = await Promise.all(
      newsProviders.map((p) => safe(() => p.getNews(keywords[0], { limit: limit * 2 }))),
    );
    const secondaryAll = dedup(secondaryLists, seen);
    const secondaryFiltered = applyKeywords([...primaryAll, ...secondaryAll]);
    secondaryFiltered.sort((a, b) => (b.publishedAt ?? "").localeCompare(a.publishedAt ?? ""));
    return secondaryFiltered.slice(0, limit);
  }

  return [];
}

// Uncached aggregation. Runs every category in parallel and records which ones
// came back empty so the UI can show a graceful "unavailable" state.
async function fetchCompanyData(symbol: string, newsKeywords?: string[]): Promise<CompanyMarketData> {
  const [profile, quote, earnings, consensus, news] = await Promise.all([
    collectProfile(symbol),
    collectQuote(symbol),
    collectEarnings(symbol),
    collectConsensus(symbol),
    collectNews(symbol, 8, newsKeywords),
  ]);

  const failures: string[] = [];
  if (!profile) failures.push("profile");
  if (!quote) failures.push("quote");
  if (!earnings) failures.push("earnings");
  if (!consensus) failures.push("consensus");
  if (news.length === 0) failures.push("news");

  return { profile, quote, earnings, consensus, news, failures };
}

/**
 * Cached public entry point. Result is cached for 1 hour per symbol and tagged
 * `company:<symbol>` so it can be revalidated on demand later (e.g. after the
 * newsletter pipeline runs). Suitable for ISR pages.
 */
export function getCompanyData(symbol: string, newsKeywords?: string[]): Promise<CompanyMarketData> {
  const cached = unstable_cache(
    () => fetchCompanyData(symbol, newsKeywords),
    ["company-data", symbol],
    { tags: [`company:${symbol}`], revalidate: 3600 },
  );
  return cached();
}

/**
 * Lightweight quote-only fetch for list/index views. Cached 1 hour per symbol.
 * Never throws.
 */
export function getQuoteCached(symbol: string): Promise<Quote | null> {
  const cached = unstable_cache(
    () => collectQuote(symbol),
    ["company-quote", symbol],
    { tags: [`company:${symbol}`], revalidate: 3600 },
  );
  return cached();
}

export type { CompanyMarketData } from "./types";
