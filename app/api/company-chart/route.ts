import { NextRequest, NextResponse } from "next/server";
import YahooFinance from "yahoo-finance2";
import { unstable_cache } from "next/cache";

const yf = new YahooFinance({ suppressNotices: ["yahooSurvey", "ripHistorical"] });

// Intraday (5-min intervals, last 2 days) for 1D view
async function fetchIntraday(symbol: string): Promise<{ time: string; close: number }[]> {
  try {
    const start = new Date();
    start.setDate(start.getDate() - 2);
    const result = await yf.chart(symbol, {
      period1: start.toISOString().slice(0, 10),
      interval: "5m",
    });
    const today = new Date().toISOString().slice(0, 10);
    return (result.quotes ?? [])
      .filter((r) => r.close != null && (r.date as Date).toISOString().slice(0, 10) === today)
      .map((r) => ({
        time: (r.date as Date).toLocaleTimeString("en-US", {
          hour: "numeric", minute: "2-digit", hour12: true, timeZone: "America/New_York",
        }),
        close: r.close!,
      }));
  } catch {
    return [];
  }
}

function cachedIntraday(symbol: string) {
  return unstable_cache(
    () => fetchIntraday(symbol),
    [`company-intraday-${symbol}`],
    { revalidate: 300 }, // 5-min cache for intraday
  )();
}

export async function GET(req: NextRequest) {
  const symbol = new URL(req.url).searchParams.get("symbol") ?? "";
  if (!symbol) return NextResponse.json({ error: "missing symbol" }, { status: 400 });
  const data = await cachedIntraday(symbol);
  return NextResponse.json(data);
}
