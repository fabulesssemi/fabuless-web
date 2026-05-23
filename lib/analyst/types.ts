// ---------------------------------------------------------------------------
// Analyst Consensus — normalized data model
// ---------------------------------------------------------------------------
// Every analyst provider (Yahoo today; Finnhub/FMP/TipRanks later) maps its raw
// response into these shapes. UI and dashboard only ever see normalized data.

export type RatingDistribution = {
  strongBuy: number;
  buy: number;
  hold: number;
  sell: number;
  strongSell: number;
};

// One month of recommendation counts. Yahoo returns periods "0m","-1m","-2m","-3m".
export type RecTrendPoint = { period: string } & RatingDistribution;

export type EstimateRevisions = {
  // count of analysts revising EPS up/down recently
  epsUpLast7d?: number;
  epsUpLast30d?: number;
  epsDownLast7d?: number;
  epsDownLast30d?: number;
  // the consensus EPS estimate at different points in time (for the next quarter)
  epsCurrent?: number;
  eps7dAgo?: number;
  eps30dAgo?: number;
  eps90dAgo?: number;
};

export type AnalystAction = {
  firm: string;
  action?: string; // "up" | "down" | "init" | "main" | "reit"
  fromGrade?: string;
  toGrade?: string;
  date?: string; // ISO
  analyst?: string; // only from richer providers (Finnhub/FMP)
  oldTarget?: number; // only from richer providers
  newTarget?: number; // only from richer providers
  source: string; // which provider supplied this action
};

// The fully-assembled analyst picture for one company at one point in time.
export type AnalystSnapshot = {
  ticker: string;
  name: string;
  sources: string[]; // providers that contributed
  consensusRating?: string; // "Strong Buy" | "Buy" | "Hold" | ...
  numberOfAnalysts?: number;
  avgPriceTarget?: number;
  highPriceTarget?: number;
  lowPriceTarget?: number;
  currentPrice?: number;
  impliedUpsidePct?: number;
  distribution?: RatingDistribution;
  recTrend?: RecTrendPoint[];
  revisions?: EstimateRevisions;
  recentActions?: AnalystAction[];
  upgrades30d?: number;
  downgrades30d?: number;
  actions7d?: number;
  actions30d?: number;
  ptRaises30d?: number; // from per-action targets when available
  ptCuts30d?: number;
  lastUpdated: string; // ISO
};

// Change vs a previously-stored snapshot (from Supabase).
export type AnalystDelta = {
  priorSnapshotDate?: string;
  priorAvgPriceTarget?: number;
  ptChangeAbs?: number;
  ptChangePct?: number;
  priorBuyShare?: number;
  buyShareChange?: number; // percentage points
};

export type SentimentDirection = "improving" | "weakening" | "stable";
export type EstimateDirection = "rising" | "falling" | "stable";

// Snapshot + all derived intelligence the UI consumes.
export type AnalystView = AnalystSnapshot & {
  buyShare?: number; // 0-100, share of buy/strongBuy among rated
  delta?: AnalystDelta;
  sentimentDirection: SentimentDirection;
  sentimentScore: number; // net buy-share change over the rec-trend window (pp)
  estimateDirection: EstimateDirection;
  narrative: string;
  bullThemes: string[];
  bearThemes: string[];
  ptHistory?: { date: string; pt: number; price: number | null }[]; // for sparkline
};

// ---------------------------------------------------------------------------
// Provider contract — implementations NEVER throw; return null on failure and
// Partial<AnalystSnapshot> so multiple providers can be merged in priority order.
// ---------------------------------------------------------------------------
export interface AnalystProvider {
  readonly name: string;
  isEnabled(): boolean;
  getAnalyst(symbol: string): Promise<Partial<AnalystSnapshot> | null>;
}
