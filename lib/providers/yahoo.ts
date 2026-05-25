import YahooFinance from "yahoo-finance2";
import type {
  AnalystConsensus,
  AnalystConsensusProvider,
  CompanyProfile,
  CompanyProfileProvider,
  EarningsProvider,
  EarningsSnapshot,
  NewsItem,
  NewsProvider,
  Quote,
  QuoteProvider,
} from "./types";

// Single shared client. suppressNotices avoids the survey log spam.
const yf = new YahooFinance({ suppressNotices: ["yahooSurvey"] });

// Don't let Yahoo's strict runtime schema validation throw on minor field
// drift — we read defensively and tolerate missing fields. (With validation
// off the library returns `unknown`, so we cast to the shape we consume below.)
const MODULE_OPTS = { validateResult: false } as const;

// Only the fields we actually read from quoteSummary, all optional.
type QS = {
  assetProfile?: {
    sector?: string;
    industry?: string;
    longBusinessSummary?: string;
    website?: string;
    fullTimeEmployees?: number;
    country?: string;
  };
  price?: {
    symbol?: string;
    longName?: string;
    shortName?: string;
    exchangeName?: string;
  };
  financialData?: {
    revenueGrowth?: number;
    grossMargins?: number;
    totalRevenue?: number;
    targetMeanPrice?: number;
    targetHighPrice?: number;
    targetLowPrice?: number;
    recommendationKey?: string;
    numberOfAnalystOpinions?: number;
    currentPrice?: number;
  };
  calendarEvents?: { earnings?: { earningsDate?: Date[] } };
  defaultKeyStatistics?: { trailingEps?: number; forwardEps?: number };
  earningsTrend?: {
    trend?: Array<{ period?: string; earningsEstimate?: { avg?: number } }>;
  };
  recommendationTrend?: {
    trend?: Array<{
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
};

function fmtDate(d?: Date | number | null): string | undefined {
  if (d == null) return undefined;
  const date = typeof d === "number" ? new Date(d * (d < 1e12 ? 1000 : 1)) : d;
  if (!(date instanceof Date) || isNaN(date.getTime())) return undefined;
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

/**
 * One class that satisfies every provider interface. Each method is wrapped in
 * try/catch and returns null / [] on any failure so the registry can fall
 * through to another provider without the page breaking.
 */
export class YahooProvider
  implements
    CompanyProfileProvider,
    QuoteProvider,
    EarningsProvider,
    AnalystConsensusProvider,
    NewsProvider
{
  readonly name = "yahoo-finance2";

  async getProfile(ticker: string): Promise<Partial<CompanyProfile> | null> {
    try {
      const r = (await yf.quoteSummary(
        ticker,
        { modules: ["assetProfile", "price"] },
        MODULE_OPTS,
      )) as QS;
      const p = r.assetProfile;
      const px = r.price;
      return {
        ticker: px?.symbol ?? ticker,
        name: px?.longName ?? px?.shortName ?? ticker,
        exchange: px?.exchangeName ?? undefined,
        sector: p?.sector ?? undefined,
        industry: p?.industry ?? undefined,
        description: p?.longBusinessSummary ?? undefined,
        website: p?.website ?? undefined,
        employees: p?.fullTimeEmployees ?? undefined,
        country: p?.country ?? undefined,
      };
    } catch {
      return null;
    }
  }

  async getQuote(ticker: string): Promise<Partial<Quote> | null> {
    try {
      const q = await yf.quote(ticker);
      return {
        price: q.regularMarketPrice ?? undefined,
        change: q.regularMarketChange ?? undefined,
        changePercent: q.regularMarketChangePercent ?? undefined,
        currency: q.currency ?? undefined,
        marketCap: q.marketCap ?? undefined,
        peTrailing: q.trailingPE ?? undefined,
        peForward: q.forwardPE ?? undefined,
        fiftyTwoWeekHigh: q.fiftyTwoWeekHigh ?? undefined,
        fiftyTwoWeekLow: q.fiftyTwoWeekLow ?? undefined,
        asOf: new Date().toISOString(),
      };
    } catch {
      return null;
    }
  }

  async getEarnings(ticker: string): Promise<Partial<EarningsSnapshot> | null> {
    try {
      const r = (await yf.quoteSummary(
        ticker,
        {
          modules: [
            "financialData",
            "calendarEvents",
            "defaultKeyStatistics",
            "earningsTrend",
          ],
        },
        MODULE_OPTS,
      )) as QS;
      const fd = r.financialData;
      const ce = r.calendarEvents;
      const ks = r.defaultKeyStatistics;

      const earningsDates = ce?.earnings?.earningsDate ?? [];
      const now = new Date();
      const nextDate =
        earningsDates.find((d) => d instanceof Date && d >= now) ??
        earningsDates[0];

      // Next-quarter EPS estimate from the earnings trend (period "+1q")
      const nextQ = r.earningsTrend?.trend?.find((t) => t.period === "+1q");

      return {
        nextEarningsDate: fmtDate(nextDate),
        revenueGrowthYoY: fd?.revenueGrowth ?? undefined,
        grossMargin: fd?.grossMargins ?? undefined,
        totalRevenue: fd?.totalRevenue ?? undefined,
        epsTrailing: ks?.trailingEps ?? undefined,
        epsForward: ks?.forwardEps ?? undefined,
        nextQuarterEpsEstimate: nextQ?.earningsEstimate?.avg ?? undefined,
      };
    } catch {
      return null;
    }
  }

  async getConsensus(ticker: string): Promise<Partial<AnalystConsensus> | null> {
    try {
      const r = (await yf.quoteSummary(
        ticker,
        {
          modules: [
            "financialData",
            "recommendationTrend",
            "upgradeDowngradeHistory",
          ],
        },
        MODULE_OPTS,
      )) as QS;
      const fd = r.financialData;
      const trend = r.recommendationTrend?.trend?.[0];
      const history = r.upgradeDowngradeHistory?.history ?? [];

      const targetMean = fd?.targetMeanPrice ?? undefined;
      const current = fd?.currentPrice ?? undefined;
      const upsidePercent =
        targetMean != null && current != null && current > 0
          ? ((targetMean - current) / current) * 100
          : undefined;

      return {
        rating: prettyRating(fd?.recommendationKey),
        numberOfAnalysts: fd?.numberOfAnalystOpinions ?? undefined,
        targetMean,
        targetHigh: fd?.targetHighPrice ?? undefined,
        targetLow: fd?.targetLowPrice ?? undefined,
        upsidePercent,
        distribution: trend
          ? {
              strongBuy: trend.strongBuy ?? 0,
              buy: trend.buy ?? 0,
              hold: trend.hold ?? 0,
              sell: trend.sell ?? 0,
              strongSell: trend.strongSell ?? 0,
            }
          : undefined,
        recentActions: history
          .slice()
          .reverse()
          .slice(0, 6)
          .map((h) => ({
            firm: h.firm ?? "—",
            action: h.action ?? undefined,
            fromGrade: h.fromGrade || undefined,
            toGrade: h.toGrade || undefined,
            date: fmtDate(h.epochGradeDate as Date),
          })),
      };
    } catch {
      return null;
    }
  }

  async getNews(
    ticker: string,
    opts?: { limit?: number },
  ): Promise<NewsItem[]> {
    try {
      // Pass MODULE_OPTS (validateResult: false) so Yahoo schema drift
      // (new fields like screenerFieldResults, culturalAssets) doesn't throw.
      const raw = await yf.search(
        ticker,
        { newsCount: opts?.limit ?? 8, quotesCount: 0, enableNavLinks: false },
        MODULE_OPTS,
      ) as { news?: Array<{ title?: string; link?: string; publisher?: string; providerPublishTime?: Date | number }> };
      return (raw.news ?? [])
        .filter((n): n is typeof n & { title: string; link: string } =>
          typeof n.title === "string" && typeof n.link === "string",
        )
        .map((n) => ({
          title: n.title,
          url: n.link,
          source: n.publisher ?? undefined,
          publishedAt:
            n.providerPublishTime instanceof Date
              ? n.providerPublishTime.toISOString()
              : typeof n.providerPublishTime === "number"
              ? new Date(n.providerPublishTime * 1000).toISOString()
              : undefined,
        }));
    } catch {
      return [];
    }
  }
}

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

export const yahooProvider = new YahooProvider();
