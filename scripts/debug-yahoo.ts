import YahooFinance from "yahoo-finance2";
const yf = new YahooFinance({ suppressNotices: ["yahooSurvey"] });

async function main() {
  const s = await yf.quoteSummary("NVDA", {
    modules: ["earningsHistory", "earningsTrend", "calendarEvents"] as never[],
  }, { validateResult: false }) as never as Record<string, unknown>;

  console.log("earningsHistory:", JSON.stringify((s.earningsHistory as Record<string, unknown>)?.history, null, 2));
  console.log("calendarEvents:", JSON.stringify(s.calendarEvents, null, 2));
  console.log("earningsTrend (0q):", JSON.stringify(
    ((s.earningsTrend as Record<string, unknown[]>)?.trend ?? []).slice(0,2), null, 2
  ));
}

main().catch(console.error);
