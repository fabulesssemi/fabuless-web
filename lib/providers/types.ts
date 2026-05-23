// ---------------------------------------------------------------------------
// Normalized internal data shapes
// ---------------------------------------------------------------------------
// Every provider (Yahoo today, Finnhub/FMP/Polygon later) must map its raw
// response into THESE shapes. The rest of the app only ever sees normalized
// data, so swapping or adding a provider never touches the UI.

export type CompanyProfile = {
  ticker: string;        // display ticker, e.g. "NVDA"
  name: string;          // "NVIDIA Corporation"
  exchange?: string;
  sector?: string;
  industry?: string;
  description?: string;
  website?: string;
  employees?: number;
  country?: string;
};

export type Quote = {
  price?: number;
  change?: number;
  changePercent?: number;   // percent, e.g. 2.7 means +2.7%
  currency?: string;
  marketCap?: number;
  peTrailing?: number;
  peForward?: number;
  fiftyTwoWeekHigh?: number;
  fiftyTwoWeekLow?: number;
  asOf?: string;            // ISO timestamp
};

export type EarningsSnapshot = {
  nextEarningsDate?: string;       // human-readable, e.g. "Wed May 27"
  revenueGrowthYoY?: number;       // fraction, e.g. 0.69 -> +69%
  grossMargin?: number;            // fraction, e.g. 0.75 -> 75%
  totalRevenue?: number;
  epsTrailing?: number;
  epsForward?: number;
  nextQuarterEpsEstimate?: number;
};

export type AnalystAction = {
  firm: string;
  action?: string;       // "up" | "down" | "init" | "main" | "reit"
  fromGrade?: string;
  toGrade?: string;
  date?: string;
};

export type AnalystConsensus = {
  rating?: string;                 // "Strong Buy" | "Buy" | "Hold" | ...
  numberOfAnalysts?: number;
  targetMean?: number;
  targetHigh?: number;
  targetLow?: number;
  upsidePercent?: number;          // computed vs current price
  distribution?: {
    strongBuy: number;
    buy: number;
    hold: number;
    sell: number;
    strongSell: number;
  };
  recentActions?: AnalystAction[];
};

export type NewsItem = {
  title: string;
  url: string;
  source?: string;
  publishedAt?: string;            // ISO timestamp
};

// ---------------------------------------------------------------------------
// Provider interfaces — one per data category, each can have many implementations
// ---------------------------------------------------------------------------
// Contract: a provider NEVER throws. On failure it returns null (or [] for
// news) so the registry can fall through to the next provider and the page
// still renders. Each returns Partial<T> so multiple providers can be merged.

export interface CompanyProfileProvider {
  readonly name: string;
  getProfile(ticker: string): Promise<Partial<CompanyProfile> | null>;
}

export interface QuoteProvider {
  readonly name: string;
  getQuote(ticker: string): Promise<Partial<Quote> | null>;
}

export interface EarningsProvider {
  readonly name: string;
  getEarnings(ticker: string): Promise<Partial<EarningsSnapshot> | null>;
}

export interface AnalystConsensusProvider {
  readonly name: string;
  getConsensus(ticker: string): Promise<Partial<AnalystConsensus> | null>;
}

export interface NewsProvider {
  readonly name: string;
  getNews(ticker: string, opts?: { limit?: number }): Promise<NewsItem[]>;
}

// The fully-assembled, normalized payload a page consumes.
export type CompanyMarketData = {
  profile: CompanyProfile | null;
  quote: Quote | null;
  earnings: EarningsSnapshot | null;
  consensus: AnalystConsensus | null;
  news: NewsItem[];
  // Which categories failed across every provider (for graceful UI degradation)
  failures: string[];
};
