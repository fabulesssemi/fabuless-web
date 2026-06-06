import { unstable_cache } from "next/cache";
import YahooFinance from "yahoo-finance2";

const yf = new YahooFinance({ suppressNotices: ["yahooSurvey"] });

// Semiconductor companies >$10B market cap
// Historical beat-rate and avg post-earnings move — update quarterly
export const COMPANIES: Record<string, { name: string; avgMove: string; beatRate: string }> = {
  // Mega-cap
  NVDA: { name: "Nvidia",                avgMove: "+2.7%", beatRate: "89%" },
  TSM:  { name: "TSMC",                  avgMove: "+1.2%", beatRate: "75%" },
  AVGO: { name: "Broadcom",              avgMove: "+2.9%", beatRate: "95%" },
  ASML: { name: "ASML",                  avgMove: "+1.5%", beatRate: "70%" },
  // Large-cap
  AMD:  { name: "AMD",                   avgMove: "+3.1%", beatRate: "85%" },
  TXN:  { name: "Texas Instruments",     avgMove: "+1.5%", beatRate: "75%" },
  QCOM: { name: "Qualcomm",              avgMove: "+2.2%", beatRate: "80%" },
  AMAT: { name: "Applied Materials",     avgMove: "+1.8%", beatRate: "85%" },
  MU:   { name: "Micron",                avgMove: "+4.2%", beatRate: "75%" },
  ARM:  { name: "Arm Holdings",          avgMove: "+4.5%", beatRate: "80%" },
  LRCX: { name: "Lam Research",          avgMove: "+2.3%", beatRate: "85%" },
  ADI:  { name: "Analog Devices",        avgMove: "+0.9%", beatRate: "90%" },
  KLAC: { name: "KLA Corp",              avgMove: "+2.1%", beatRate: "90%" },
  MRVL: { name: "Marvell",              avgMove: "+1.9%", beatRate: "75%" },
  INTC: { name: "Intel",                 avgMove: "-5.2%", beatRate: "60%" },
  SNPS: { name: "Synopsys",              avgMove: "-1.3%", beatRate: "95%" },
  CDNS: { name: "Cadence",               avgMove: "+2.8%", beatRate: "90%" },
  NXPI: { name: "NXP Semiconductors",    avgMove: "+1.6%", beatRate: "80%" },
  MPWR: { name: "Monolithic Power",      avgMove: "+3.2%", beatRate: "85%" },
  MCHP: { name: "Microchip Technology",  avgMove: "+1.4%", beatRate: "80%" },
  STX:  { name: "Seagate",               avgMove: "+3.8%", beatRate: "70%" },
  WDC:  { name: "Western Digital",       avgMove: "+4.1%", beatRate: "65%" },
  ON:   { name: "ON Semiconductor",      avgMove: "+2.3%", beatRate: "75%" },
  ENTG: { name: "Entegris",              avgMove: "+2.8%", beatRate: "75%" },
  ONTO: { name: "Onto Innovation",       avgMove: "+3.1%", beatRate: "80%" },
  LSCC: { name: "Lattice Semiconductor", avgMove: "+3.5%", beatRate: "80%" },
  ACLS: { name: "Axcelis Technologies",  avgMove: "+4.2%", beatRate: "75%" },
  CRDO: { name: "Credo Technology",      avgMove: "+5.9%", beatRate: "67%" },
  SMTC: { name: "Semtech",               avgMove: "+3.7%", beatRate: "70%" },
  SITM: { name: "SiTime",                avgMove: "+5.2%", beatRate: "65%" },
  ALGM: { name: "Allegro MicroSystems",  avgMove: "+2.9%", beatRate: "70%" },
  POWI: { name: "Power Integrations",    avgMove: "+2.1%", beatRate: "75%" },
  SLAB: { name: "Silicon Laboratories",  avgMove: "+2.4%", beatRate: "75%" },
  WOLF: { name: "Wolfspeed",             avgMove: "-6.1%", beatRate: "45%" },
  AMBA: { name: "Ambarella",             avgMove: "+4.8%", beatRate: "70%" },
  TSEM: { name: "Tower Semiconductor",   avgMove: "+1.9%", beatRate: "70%" },
  FORM: { name: "FormFactor",            avgMove: "+3.2%", beatRate: "70%" },
  COHU: { name: "Cohu",                  avgMove: "+3.5%", beatRate: "65%" },
  RMBS: { name: "Rambus",                avgMove: "+2.7%", beatRate: "75%" },
  IPGP: { name: "IPG Photonics",         avgMove: "+2.3%", beatRate: "70%" },
  LITE: { name: "Lumentum",              avgMove: "+3.9%", beatRate: "65%" },
  MTSI: { name: "MACOM Technology",      avgMove: "+3.4%", beatRate: "75%" },
  SWKS: { name: "Skyworks Solutions",    avgMove: "+1.8%", beatRate: "75%" },
  QRVO: { name: "Qorvo",                 avgMove: "+2.6%", beatRate: "70%" },
  IFNNY:{ name: "Infineon Technologies", avgMove: "+1.4%", beatRate: "70%" },
  STM:  { name: "STMicroelectronics",    avgMove: "+1.9%", beatRate: "70%" },
};

export type LiveEarningsRow = {
  ticker: string;
  company: string;
  date: string;
  eps: string;
  avgMove: string;
  beatRate: string;
};

async function _fetchUpcomingEarnings(): Promise<LiveEarningsRow[]> {
  const now = new Date();
  const twoWeeksOut = new Date(now.getTime() + 42 * 24 * 60 * 60 * 1000); // 6 weeks
  const tickers = Object.keys(COMPANIES);

  const settled = await Promise.allSettled(
    tickers.map(async (ticker) => {
      const quote = await yf.quoteSummary(ticker, { modules: ["calendarEvents"] });
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
        eps: epsAvg != null ? `$${epsAvg.toFixed(2)}` : "—",
        avgMove: COMPANIES[ticker].avgMove,
        beatRate: COMPANIES[ticker].beatRate,
      };
    })
  );

  type Row = { _ts: number; ticker: string; company: string; date: string; eps: string; avgMove: string; beatRate: string };

  return settled
    .filter((r): r is PromiseFulfilledResult<Row> => r.status === "fulfilled" && r.value !== null)
    .map((r) => r.value)
    .sort((a, b) => a._ts - b._ts)
    .map(({ _ts: _ignored, ...row }) => row);
}

export const getUpcomingEarnings = unstable_cache(
  _fetchUpcomingEarnings,
  ["upcoming-earnings"],
  { revalidate: 3600, tags: ["earnings"] }
);
