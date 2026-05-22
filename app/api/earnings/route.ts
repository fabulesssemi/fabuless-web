import { NextResponse } from "next/server";
import YahooFinance from "yahoo-finance2";

const yf = new YahooFinance({ suppressNotices: ["yahooSurvey"] });

// Historical stats per ticker — update quarterly when pipeline runs
const COMPANIES: Record<string, { name: string; avgMove: string; beatRate: string }> = {
  NVDA: { name: "Nvidia",            avgMove: "+2.7%", beatRate: "89%" },
  AMD:  { name: "AMD",               avgMove: "+3.1%", beatRate: "85%" },
  AVGO: { name: "Broadcom",          avgMove: "+2.9%", beatRate: "95%" },
  QCOM: { name: "Qualcomm",          avgMove: "+2.2%", beatRate: "80%" },
  ARM:  { name: "Arm Holdings",      avgMove: "+4.5%", beatRate: "80%" },
  MRVL: { name: "Marvell",           avgMove: "+1.9%", beatRate: "75%" },
  MU:   { name: "Micron",            avgMove: "+4.2%", beatRate: "75%" },
  INTC: { name: "Intel",             avgMove: "-5.2%", beatRate: "60%" },
  AMAT: { name: "Applied Materials", avgMove: "+1.8%", beatRate: "85%" },
  LRCX: { name: "Lam Research",      avgMove: "+2.3%", beatRate: "85%" },
  KLAC: { name: "KLA Corp",          avgMove: "+2.1%", beatRate: "90%" },
  ADI:  { name: "Analog Devices",    avgMove: "+0.9%", beatRate: "90%" },
  SNPS: { name: "Synopsys",          avgMove: "-1.3%", beatRate: "95%" },
  CDNS: { name: "Cadence",           avgMove: "+2.8%", beatRate: "90%" },
  CRDO: { name: "Credo",             avgMove: "+5.9%", beatRate: "67%" },
  TSM:  { name: "TSMC",              avgMove: "+1.2%", beatRate: "75%" },
  ASML: { name: "ASML",              avgMove: "+1.5%", beatRate: "70%" },
  TXN:  { name: "Texas Instruments", avgMove: "+1.5%", beatRate: "75%" },
  MPWR: { name: "Monolithic Power",  avgMove: "+3.2%", beatRate: "85%" },
};

export async function GET() {
  const now = new Date();
  const twoWeeksOut = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);
  const tickers = Object.keys(COMPANIES);

  const settled = await Promise.allSettled(
    tickers.map(async (ticker) => {
      const quote = await yf.quoteSummary(ticker, {
        modules: ["calendarEvents"],
      });
      const earningsDates = quote.calendarEvents?.earnings?.earningsDate ?? [];
      const epsAvg = quote.calendarEvents?.earnings?.earningsAverage;

      const nextDate = earningsDates.find((d) => d >= now && d <= twoWeeksOut);
      if (!nextDate) return null;

      return {
        _ts: nextDate.getTime(),
        ticker,
        company: COMPANIES[ticker].name,
        date: nextDate.toLocaleDateString("en-US", {
          weekday: "short",
          month: "short",
          day: "numeric",
        }),
        eps: epsAvg != null ? `$${epsAvg.toFixed(2)}` : "N/A",
        avgMove: COMPANIES[ticker].avgMove,
        beatRate: COMPANIES[ticker].beatRate,
      };
    })
  );

  const results = settled
    .filter(
      (r): r is PromiseFulfilledResult<NonNullable<{ _ts: number; ticker: string; company: string; date: string; eps: string; avgMove: string; beatRate: string }>> =>
        r.status === "fulfilled" && r.value !== null
    )
    .map((r) => r.value)
    .sort((a, b) => a._ts - b._ts)
    .map(({ _ts: _ignored, ...row }) => row);

  return NextResponse.json(results, {
    headers: {
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
