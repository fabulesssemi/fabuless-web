import type { AnalystProvider, AnalystSnapshot } from "../types";

// ---------------------------------------------------------------------------
// FinnhubAnalystProvider — DROP-IN UPGRADE (dormant until a key is set).
// Add FINNHUB_API_KEY to .env.local (and Vercel) to activate. Provides richer
// recommendation trends, price targets, and rating actions for US tickers.
// On the free tier some endpoints (per-analyst names, per-action targets) are
// limited; this maps what's available and degrades gracefully.
// ---------------------------------------------------------------------------
const BASE = "https://finnhub.io/api/v1";

type FinnhubRec = {
  period: string;
  strongBuy: number;
  buy: number;
  hold: number;
  sell: number;
  strongSell: number;
};
type FinnhubPT = {
  targetHigh?: number;
  targetLow?: number;
  targetMean?: number;
  lastUpdated?: string;
};
type FinnhubAction = {
  gradeTime?: number; // unix seconds
  company?: string; // firm
  fromGrade?: string;
  toGrade?: string;
  action?: string;
};

async function getJson<T>(url: string): Promise<T | null> {
  try {
    const res = await fetch(url, { next: { revalidate: 3600 } });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

export class FinnhubAnalystProvider implements AnalystProvider {
  readonly name = "finnhub";

  isEnabled(): boolean {
    return Boolean(process.env.FINNHUB_API_KEY);
  }

  async getAnalyst(symbol: string): Promise<Partial<AnalystSnapshot> | null> {
    const key = process.env.FINNHUB_API_KEY;
    if (!key) return null;
    // Finnhub free tier covers US tickers only; skip foreign listings.
    if (symbol.includes(".")) return null;

    const q = `symbol=${encodeURIComponent(symbol)}&token=${key}`;
    const [recs, pt, actions] = await Promise.all([
      getJson<FinnhubRec[]>(`${BASE}/stock/recommendation?${q}`),
      getJson<FinnhubPT>(`${BASE}/stock/price-target?${q}`),
      getJson<FinnhubAction[]>(`${BASE}/stock/upgrade-downgrade?${q}`),
    ]);

    if (!recs && !pt && !actions) return null;

    const recTrend = (recs ?? []).map((r) => ({
      period: r.period,
      strongBuy: r.strongBuy ?? 0,
      buy: r.buy ?? 0,
      hold: r.hold ?? 0,
      sell: r.sell ?? 0,
      strongSell: r.strongSell ?? 0,
    }));

    const now = Date.now();
    const DAY = 86_400_000;
    const sorted = (actions ?? [])
      .slice()
      .sort((a, b) => (b.gradeTime ?? 0) - (a.gradeTime ?? 0));
    const within = (a: FinnhubAction, days: number) =>
      a.gradeTime != null && now - a.gradeTime * 1000 <= days * DAY;

    return {
      sources: [this.name],
      avgPriceTarget: pt?.targetMean ?? undefined,
      highPriceTarget: pt?.targetHigh ?? undefined,
      lowPriceTarget: pt?.targetLow ?? undefined,
      recTrend: recTrend.length ? recTrend : undefined,
      recentActions: sorted.slice(0, 12).map((a) => ({
        firm: a.company || "—",
        action: a.action || undefined,
        fromGrade: a.fromGrade || undefined,
        toGrade: a.toGrade || undefined,
        date:
          a.gradeTime != null
            ? new Date(a.gradeTime * 1000).toISOString()
            : undefined,
        source: this.name,
      })),
      actions7d: sorted.filter((a) => within(a, 7)).length || undefined,
      actions30d: sorted.filter((a) => within(a, 30)).length || undefined,
      upgrades30d:
        sorted.filter((a) => within(a, 30) && a.action === "up").length ||
        undefined,
      downgrades30d:
        sorted.filter((a) => within(a, 30) && a.action === "down").length ||
        undefined,
      lastUpdated: new Date().toISOString(),
    };
  }
}

export const finnhubAnalystProvider = new FinnhubAnalystProvider();
