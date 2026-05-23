import YahooFinance from "yahoo-finance2";
import type { AnalystProvider, AnalystSnapshot } from "../types";

const yf = new YahooFinance({ suppressNotices: ["yahooSurvey"] });
const MODULE_OPTS = { validateResult: false } as const;

// Local shape for the modules we read (validateResult:false returns unknown).
type QS = {
  price?: { symbol?: string; longName?: string; shortName?: string };
  financialData?: {
    currentPrice?: number;
    targetMeanPrice?: number;
    targetHighPrice?: number;
    targetLowPrice?: number;
    recommendationKey?: string;
    numberOfAnalystOpinions?: number;
  };
  recommendationTrend?: {
    trend?: Array<{
      period?: string;
      strongBuy?: number;
      buy?: number;
      hold?: number;
      sell?: number;
      strongSell?: number;
    }>;
  };
  upgradeDowngradeHistory?: {
    history?: Array<{
      epochGradeDate?: Date;
      firm?: string;
      toGrade?: string;
      fromGrade?: string;
      action?: string;
    }>;
  };
  earningsTrend?: {
    trend?: Array<{
      period?: string;
      epsRevisions?: {
        upLast7days?: number;
        upLast30days?: number;
        downLast7days?: number;
        downLast30days?: number;
      };
      epsTrend?: {
        current?: number;
        "7daysAgo"?: number;
        "30daysAgo"?: number;
        "90daysAgo"?: number;
      };
    }>;
  };
};

function prettyRating(key?: string): string | undefined {
  if (!key) return undefined;
  const map: Record<string, string> = {
    strong_buy: "Strong Buy",
    buy: "Buy",
    hold: "Hold",
    underperform: "Underperform",
    sell: "Sell",
  };
  return map[key] ?? key;
}

const DAY = 86_400_000;

export class YahooAnalystProvider implements AnalystProvider {
  readonly name = "yahoo-finance2";

  // Yahoo needs no key — always available.
  isEnabled(): boolean {
    return true;
  }

  async getAnalyst(symbol: string): Promise<Partial<AnalystSnapshot> | null> {
    try {
      const r = (await yf.quoteSummary(
        symbol,
        {
          modules: [
            "price",
            "financialData",
            "recommendationTrend",
            "upgradeDowngradeHistory",
            "earningsTrend",
          ],
        },
        MODULE_OPTS,
      )) as QS;

      const fd = r.financialData;
      const current = fd?.currentPrice;
      const mean = fd?.targetMeanPrice;
      const impliedUpsidePct =
        mean != null && current != null && current > 0
          ? ((mean - current) / current) * 100
          : undefined;

      // Recommendation trend (newest first). Yahoo gives 0m..-3m.
      const recTrend = (r.recommendationTrend?.trend ?? []).map((t) => ({
        period: t.period ?? "",
        strongBuy: t.strongBuy ?? 0,
        buy: t.buy ?? 0,
        hold: t.hold ?? 0,
        sell: t.sell ?? 0,
        strongSell: t.strongSell ?? 0,
      }));
      const current0m = recTrend.find((t) => t.period === "0m") ?? recTrend[0];

      // Upgrade/downgrade history → recent actions + 30-day counts.
      const now = Date.now();
      const history = (r.upgradeDowngradeHistory?.history ?? [])
        .slice()
        .sort(
          (a, b) =>
            (b.epochGradeDate?.getTime() ?? 0) -
            (a.epochGradeDate?.getTime() ?? 0),
        );

      const recentActions = history.slice(0, 12).map((h) => ({
        firm: h.firm || "—",
        action: h.action || undefined,
        fromGrade: h.fromGrade || undefined,
        toGrade: h.toGrade || undefined,
        date:
          h.epochGradeDate instanceof Date
            ? h.epochGradeDate.toISOString()
            : undefined,
        source: this.name,
      }));

      const within = (h: { epochGradeDate?: Date }, days: number) =>
        h.epochGradeDate instanceof Date &&
        now - h.epochGradeDate.getTime() <= days * DAY;
      const actions7d = history.filter((h) => within(h, 7)).length;
      const actions30d = history.filter((h) => within(h, 30)).length;
      const upgrades30d = history.filter(
        (h) => within(h, 30) && h.action === "up",
      ).length;
      const downgrades30d = history.filter(
        (h) => within(h, 30) && h.action === "down",
      ).length;

      // Estimate revisions — use the next-quarter ("+1q") trend entry.
      const trend =
        r.earningsTrend?.trend?.find((t) => t.period === "+1q") ??
        r.earningsTrend?.trend?.[0];
      const rev = trend?.epsRevisions;
      const ept = trend?.epsTrend;
      const revisions = {
        epsUpLast7d: rev?.upLast7days ?? undefined,
        epsUpLast30d: rev?.upLast30days ?? undefined,
        epsDownLast7d: rev?.downLast7days ?? undefined,
        epsDownLast30d: rev?.downLast30days ?? undefined,
        epsCurrent: ept?.current ?? undefined,
        eps7dAgo: ept?.["7daysAgo"] ?? undefined,
        eps30dAgo: ept?.["30daysAgo"] ?? undefined,
        eps90dAgo: ept?.["90daysAgo"] ?? undefined,
      };

      return {
        ticker: r.price?.symbol ?? symbol,
        name: r.price?.longName ?? r.price?.shortName ?? symbol,
        sources: [this.name],
        consensusRating: prettyRating(fd?.recommendationKey),
        numberOfAnalysts: fd?.numberOfAnalystOpinions ?? undefined,
        avgPriceTarget: mean ?? undefined,
        highPriceTarget: fd?.targetHighPrice ?? undefined,
        lowPriceTarget: fd?.targetLowPrice ?? undefined,
        currentPrice: current ?? undefined,
        impliedUpsidePct,
        distribution: current0m
          ? {
              strongBuy: current0m.strongBuy,
              buy: current0m.buy,
              hold: current0m.hold,
              sell: current0m.sell,
              strongSell: current0m.strongSell,
            }
          : undefined,
        recTrend,
        revisions,
        recentActions,
        actions7d,
        actions30d,
        upgrades30d,
        downgrades30d,
        lastUpdated: new Date().toISOString(),
      };
    } catch {
      return null;
    }
  }
}

export const yahooAnalystProvider = new YahooAnalystProvider();
