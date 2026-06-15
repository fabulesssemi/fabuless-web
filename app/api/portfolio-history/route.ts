import { NextRequest, NextResponse } from "next/server";
import YahooFinance from "yahoo-finance2";
import { unstable_cache } from "next/cache";

const yf = new YahooFinance({ suppressNotices: ["yahooSurvey"] });

type DayPrice = { date: string; close: number }; // date = "YYYY-MM-DD"

async function fetchHistory(symbol: string, from: string): Promise<DayPrice[]> {
  try {
    const rows = await yf.historical(
      symbol,
      { period1: from, period2: new Date(), interval: "1d" },
      { validateResult: false },
    ) as unknown as { date: Date; adjClose?: number; close?: number }[];
    return rows
      .filter((r) => r.close != null || r.adjClose != null)
      .map((r) => ({
        date: r.date.toISOString().slice(0, 10),
        close: (r.adjClose ?? r.close)!,
      }));
  } catch {
    return [];
  }
}

// Cache per symbol+from, revalidate every hour
function cachedHistory(symbol: string, from: string) {
  return unstable_cache(
    () => fetchHistory(symbol, from),
    [`portfolio-history-${symbol}-${from}`],
    { revalidate: 3600 },
  )();
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const tickers = (searchParams.get("tickers") ?? "").split(",").filter(Boolean);
  const from = searchParams.get("from") ?? "";

  if (!from || tickers.length === 0) {
    return NextResponse.json({ error: "missing params" }, { status: 400 });
  }

  const [spx, ...holdings] = await Promise.all([
    cachedHistory("^GSPC", from),
    ...tickers.map((t) => cachedHistory(t, from)),
  ]);

  const result: Record<string, DayPrice[]> = { SPX: spx };
  tickers.forEach((t, i) => { result[t] = holdings[i]; });

  return NextResponse.json(result);
}
