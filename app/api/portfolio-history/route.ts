import { NextRequest, NextResponse } from "next/server";
import YahooFinance from "yahoo-finance2";
import { unstable_cache } from "next/cache";

const yf = new YahooFinance({ suppressNotices: ["yahooSurvey", "ripHistorical"] });

type DayPrice = { date: string; close: number }; // date = "YYYY-MM-DD"

async function fetchHistory(symbol: string, from: string): Promise<DayPrice[]> {
  try {
    const result = await yf.chart(symbol, { period1: from, interval: "1d" });
    return (result.quotes ?? [])
      .filter((r) => r.close != null)
      .map((r) => ({
        date: (r.date as Date).toISOString().slice(0, 10),
        close: r.close!,
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
