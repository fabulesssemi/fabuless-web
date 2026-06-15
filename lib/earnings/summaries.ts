import rawData from "@/data/earnings-summaries.json";

export type EarningsSummary = {
  ticker: string;
  quarter: string;         // "Q1 FY27" or "Q1 2027"
  date: string;            // "2026-05-20" — earnings report date
  epsActual: number | null;
  epsEstimate: number | null;
  surprisePct: number | null;   // e.g. 12.5 = beat by 12.5%
  revActual: number | null;     // millions
  revEstimate: number | null;   // millions
  priceMoveDay: number | null;  // % stock move on earnings day
  summary: string;              // 3-sentence Claude-generated narrative
  keyQuote: string | null;      // key management quote from transcript
  transcriptUrl: string | null;
  generatedAt: string;          // ISO timestamp of when this was generated
};

// { "NVDA": [most-recent, ...], "AMD": [...] }
export type EarningsSummariesStore = Record<string, EarningsSummary[]>;

const store = rawData as EarningsSummariesStore;

/** Returns last N quarters for a ticker, most-recent first. */
export function getSummaries(ticker: string, limit = 3): EarningsSummary[] {
  return (store[ticker] ?? []).slice(0, limit);
}

/** All tickers that have at least one summary. */
export function tickersWithSummaries(): string[] {
  return Object.keys(store).filter((t) => store[t].length > 0);
}

export function getAllSummaries(): EarningsSummariesStore {
  return store;
}
