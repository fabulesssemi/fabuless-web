import type { AnalystAction, AnalystProvider, AnalystSnapshot } from "../types";

// ---------------------------------------------------------------------------
// FMPAnalystProvider — DROP-IN UPGRADE (dormant until FMP_API_KEY is set).
// Add FMP_API_KEY to .env.local (and Vercel) to activate.
// Free tier: 250 calls/day. Covers US tickers only (skips .KS).
//
// Key value-add over Yahoo/Finnhub:
//   - /v4/price-target  → analyst NAME + firm + per-action price target
//   - /v3/upgrades-downgrades/{symbol} → firm + grade changes
// ---------------------------------------------------------------------------
const BASE = "https://financialmodelingprep.com/api";

type FMPPriceTarget = {
  symbol?: string;
  publishedDate?: string;
  analystName?: string;
  analystCompany?: string;
  priceTarget?: number;
  priceWhenPosted?: number;
};

type FMPGrade = {
  symbol?: string;
  publishedDate?: string;
  gradingCompany?: string;
  previousGrade?: string;
  newGrade?: string;
  action?: string; // "upgraded" | "downgraded" | "initiated" | "reiterated" | "maintained"
};

async function getJson<T>(url: string): Promise<T | null> {
  try {
    const res = await fetch(url, { next: { revalidate: 3600 } });
    if (!res.ok) return null;
    const data = await res.json();
    // FMP returns {"Error Message": "..."} for bad/paywalled requests
    if (data && typeof data === "object" && "Error Message" in data) return null;
    return data as T;
  } catch {
    return null;
  }
}

function normalizeAction(action?: string): string | undefined {
  if (!action) return undefined;
  const a = action.toLowerCase();
  if (a.includes("upgrade")) return "up";
  if (a.includes("downgrade")) return "down";
  if (a.includes("initiat")) return "init";
  if (a.includes("reiterat")) return "reit";
  if (a.includes("maintain")) return "main";
  return undefined;
}

export class FMPAnalystProvider implements AnalystProvider {
  readonly name = "fmp";

  isEnabled(): boolean {
    return Boolean(process.env.FMP_API_KEY);
  }

  async getAnalyst(symbol: string): Promise<Partial<AnalystSnapshot> | null> {
    const key = process.env.FMP_API_KEY;
    if (!key) return null;
    if (symbol.includes(".")) return null; // US tickers only

    const [targets, grades] = await Promise.all([
      getJson<FMPPriceTarget[]>(
        `${BASE}/v4/price-target?symbol=${encodeURIComponent(symbol)}&limit=15&apikey=${key}`,
      ),
      getJson<FMPGrade[]>(
        `${BASE}/v3/upgrades-downgrades/${encodeURIComponent(symbol)}?apikey=${key}`,
      ),
    ]);

    if (!targets && !grades) return null;

    const now = Date.now();
    const DAY = 86_400_000;
    const within = (dateStr?: string, days = 30) => {
      if (!dateStr) return false;
      return now - new Date(dateStr).getTime() <= days * DAY;
    };

    // Price-target actions — the main value-add (analyst name + PT)
    const ptActions: AnalystAction[] = (targets ?? [])
      .filter((t) => t.analystCompany)
      .map((t) => ({
        firm: t.analystCompany ?? "—",
        analyst: t.analystName || undefined,
        newTarget: t.priceTarget ?? undefined,
        date: t.publishedDate
          ? new Date(t.publishedDate).toISOString()
          : undefined,
        source: "fmp",
      }));

    // Grade actions — firm + grade change
    const gradeActions: AnalystAction[] = (grades ?? [])
      .filter((g) => g.gradingCompany)
      .slice(0, 20)
      .map((g) => ({
        firm: g.gradingCompany ?? "—",
        action: normalizeAction(g.action),
        fromGrade: g.previousGrade || undefined,
        toGrade: g.newGrade || undefined,
        date: g.publishedDate
          ? new Date(g.publishedDate).toISOString()
          : undefined,
        source: "fmp",
      }));

    // Merge: enrich grade actions with PT from same firm on same day
    const enriched = gradeActions.map((ga) => {
      const sameDay = ptActions.find(
        (pt) =>
          pt.firm === ga.firm &&
          pt.date?.slice(0, 10) === ga.date?.slice(0, 10),
      );
      return sameDay ? { ...ga, newTarget: sameDay.newTarget, analyst: sameDay.analyst } : ga;
    });

    // Include PT-only actions that don't have a matching grade action
    const gradeKeys = new Set(enriched.map((a) => `${a.firm}|${a.date?.slice(0, 10)}`));
    const ptOnly = ptActions.filter(
      (pt) => !gradeKeys.has(`${pt.firm}|${pt.date?.slice(0, 10)}`),
    );

    const recentActions = [...enriched, ...ptOnly]
      .sort((a, b) => (b.date ?? "").localeCompare(a.date ?? ""))
      .slice(0, 12);

    // 30-day counts from grade actions
    const recent30 = gradeActions.filter((a) => within(a.date, 30));
    const upgrades30d = recent30.filter((a) => a.action === "up").length || undefined;
    const downgrades30d = recent30.filter((a) => a.action === "down").length || undefined;

    // PT raises/cuts in 30d (from price target data)
    const ptRecent = ptActions.filter((a) => within(a.date, 30));
    const ptWithPrice = ptRecent.filter((a) => a.newTarget != null);
    // Can't compute raises/cuts without prior targets per action — just count total
    const ptRaises30d = ptWithPrice.length || undefined;

    return {
      sources: ["fmp"],
      recentActions: recentActions.length ? recentActions : undefined,
      upgrades30d,
      downgrades30d,
      ptRaises30d,
    };
  }
}

export const fmpAnalystProvider = new FMPAnalystProvider();
