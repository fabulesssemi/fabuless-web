import { NextRequest, NextResponse } from "next/server";
import YahooFinance from "yahoo-finance2";
import { unstable_cache } from "next/cache";

const yf = new YahooFinance({ suppressNotices: ["yahooSurvey"] });

export type EarningsQuarter = {
  date: string; // "YYYY-MM-DD"
  label: string; // "Q1 2025"
  epsActual: number | null;
  epsEstimate: number | null;
  surprisePct: number | null;
};

export type ForwardEstimate = {
  period: string; // "0q" | "+1q"
  endDate: string; // "YYYY-MM-DD"
  epsEst: number | null;
  revEst: number | null; // in millions
};

export type TickerEarnings = {
  history: EarningsQuarter[];
  forward: ForwardEstimate[];
  nextDate: string | null;
};

async function fetchEarnings(ticker: string): Promise<TickerEarnings> {
  try {
    const summary = await yf.quoteSummary(
      ticker,
      { modules: ["earningsHistory", "earningsTrend", "calendarEvents"] as never[] },
      { validateResult: false },
    ) as unknown as {
      earningsHistory?: {
        history?: {
          quarter?: { raw: number };
          epsActual?: { raw: number };
          epsEstimate?: { raw: number };
          surprisePercent?: { raw: number };
          period?: string;
        }[];
      };
      earningsTrend?: {
        trend?: {
          period?: string;
          endDate?: string;
          earningsEstimate?: { avg?: { raw: number } };
          revenueEstimate?: { avg?: { raw: number } };
        }[];
      };
      calendarEvents?: {
        earnings?: {
          earningsDate?: { raw: number }[];
        };
      };
    };

    const rawHistory = summary.earningsHistory?.history ?? [];
    const history: EarningsQuarter[] = rawHistory
      .slice(-4) // last 4 quarters available
      .map((h) => {
        const qNum = h.quarter?.raw;
        const date = qNum ? new Date(qNum * 1000).toISOString().slice(0, 10) : null;
        // Build human label from the date
        let label = h.period ?? "";
        if (date) {
          const d = new Date(date);
          const q = Math.ceil((d.getMonth() + 1) / 3);
          label = `Q${q} ${d.getFullYear()}`;
        }
        return {
          date: date ?? "",
          label,
          epsActual: h.epsActual?.raw ?? null,
          epsEstimate: h.epsEstimate?.raw ?? null,
          surprisePct: h.surprisePercent?.raw != null ? Math.round(h.surprisePercent.raw * 100 * 10) / 10 : null,
        };
      })
      .filter((h) => h.date)
      .reverse(); // most recent first

    const trendPeriods = ["0q", "+1q"];
    const forward: ForwardEstimate[] = (summary.earningsTrend?.trend ?? [])
      .filter((t) => trendPeriods.includes(t.period ?? ""))
      .map((t) => ({
        period: t.period ?? "",
        endDate: t.endDate ?? "",
        epsEst: t.earningsEstimate?.avg?.raw ?? null,
        revEst: t.revenueEstimate?.avg?.raw != null ? Math.round(t.revenueEstimate.avg.raw / 1e6) : null,
      }));

    const nextDates = summary.calendarEvents?.earnings?.earningsDate ?? [];
    const nextRaw = nextDates[0]?.raw;
    const nextDate = nextRaw ? new Date(nextRaw * 1000).toISOString().slice(0, 10) : null;

    return { history, forward, nextDate };
  } catch {
    return { history: [], forward: [], nextDate: null };
  }
}

function cachedEarnings(ticker: string) {
  return unstable_cache(
    () => fetchEarnings(ticker),
    [`earnings-history-${ticker}`],
    { revalidate: 3600 },
  )();
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const tickers = (searchParams.get("tickers") ?? "").split(",").filter(Boolean);

  if (tickers.length === 0) {
    return NextResponse.json({ error: "missing tickers" }, { status: 400 });
  }

  const results = await Promise.all(tickers.map((t) => cachedEarnings(t)));
  const out: Record<string, TickerEarnings> = {};
  tickers.forEach((t, i) => { out[t] = results[i]; });

  return NextResponse.json(out);
}
