// Central localStorage contract for the portfolio feature.
// v2 stores rich per-holding data; v1 (comma-separated tickers) is migrated on read.

export const STORAGE_KEY = "fabuless_portfolio_v2";
const LEGACY_KEY = "fabuless_portfolio_tickers";

export type Holding = {
  ticker: string;
  purchasePrice: number | null;   // USD
  purchaseDate: string | null;    // ISO "YYYY-MM-DD"
  shares: number | null;
};

export type PortfolioStore = {
  holdings: Holding[];
};

export function readPortfolio(): PortfolioStore {
  if (typeof window === "undefined") return { holdings: [] };
  // Migrate from v1
  const legacy = localStorage.getItem(LEGACY_KEY);
  if (legacy && !localStorage.getItem(STORAGE_KEY)) {
    const tickers = legacy.split(",").map((t) => t.trim().toUpperCase()).filter(Boolean);
    const migrated: PortfolioStore = {
      holdings: tickers.map((ticker) => ({ ticker, purchasePrice: null, purchaseDate: null, shares: null })),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(migrated));
    localStorage.removeItem(LEGACY_KEY);
    return migrated;
  }

  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return { holdings: [] };
  try {
    return JSON.parse(raw) as PortfolioStore;
  } catch {
    return { holdings: [] };
  }
}

export function writePortfolio(store: PortfolioStore) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
}

export function encodeHoldings(holdings: Holding[]): string {
  return encodeURIComponent(JSON.stringify(holdings));
}

export function decodeHoldings(param: string): Holding[] {
  try {
    return JSON.parse(decodeURIComponent(param)) as Holding[];
  } catch {
    return [];
  }
}

// Parse a raw ticker input string into blank holdings (no price/date/shares yet)
export function parseTickersToHoldings(raw: string): string[] {
  return raw
    .split(/[,\s]+/)
    .map((s) => s.trim().toUpperCase())
    .filter(Boolean)
    .filter((v, i, a) => a.indexOf(v) === i);
}
