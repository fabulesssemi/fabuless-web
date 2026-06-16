import YahooFinance from "yahoo-finance2";
import { unstable_cache } from "next/cache";

const yf = new YahooFinance({ suppressNotices: ["yahooSurvey", "ripHistorical"] });

export type PricePoint = { date: string; close: number };

async function fetchPriceHistory(symbol: string): Promise<PricePoint[]> {
  try {
    const start = new Date();
    start.setFullYear(start.getFullYear() - 1);

    const result = await yf.chart(symbol, {
      period1: start.toISOString().slice(0, 10),
      interval: "1d",
    });

    return (result.quotes ?? [])
      .filter((r: { close?: number | null }) => r.close != null)
      .map((r: { date: Date; close: number | null }) => ({
        date: r.date.toISOString().slice(0, 10),
        close: r.close as number,
      }))
      .sort((a: PricePoint, b: PricePoint) => a.date.localeCompare(b.date));
  } catch {
    return [];
  }
}

export function getPriceHistory(symbol: string): Promise<PricePoint[]> {
  const cached = unstable_cache(
    () => fetchPriceHistory(symbol),
    ["price-history", symbol],
    { tags: [`company:${symbol}`], revalidate: 3600 },
  );
  return cached();
}
