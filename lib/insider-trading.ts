export type ConvictionLevel = "VERY HIGH" | "HIGH" | "MOD-HIGH" | "MODERATE" | "AVOID" | "CAUTIOUS";

export interface WatchlistItem {
  rank: number;
  ticker: string;
  company: string;
  price: string;
  signal: string;
  lastInsiderBuy: string;
  stillOpen: boolean;
  conviction: ConvictionLevel;
  thesis: string;
  stars: number;
}

export interface RedFlag {
  ticker: string;
  company: string;
  severity: "STRONG AVOID" | "AVOID" | "CAUTIOUS";
  signal: string;
}

export interface InsiderTradingData {
  generatedDate: string;
  lookbackWindow: string;
  executiveSummary: string;
  watchlist: WatchlistItem[];
  redFlags: RedFlag[];
}

// ⚠️  AUTO-GENERATED — do not edit manually.
// Updated every Monday by the Fabuless Insider Trading Agent (GitHub Actions).
// Source: SEC EDGAR Form 4 filings (official regulatory source).
// Last run: 2026-06-06
export const insiderTradingData: InsiderTradingData = {
  generatedDate: "2026-06-06",
  lookbackWindow: "Dec 08 \u2013 Jun 06, 2026",
  executiveSummary: "The semiconductor insider tape is notably weak with zero meaningful P-coded purchases from C-suite executives at major names. TSM stands out with multiple small open-market buys including from the CEO, though dollar amounts are modest. ARM shows concerning cluster selling with multiple officers liquidating positions, warranting caution despite strong stock performance.",
  watchlist: [
    {
      rank: 1,
      ticker: "TSM",
      company: "Taiwan Semiconductor Manufacturing Co",
      price: "~$180",
      signal: "Multiple P-coded open-market purchases in May 2026 including CEO Wei Che-Chia ($11.5k), SVP Kevin Zhang, and VP Tien Bor-Zen accumulating across several transactions totaling ~$156k. Rare coordinated buying from Taiwan-based executives.",
      lastInsiderBuy: "$70k @ $69.98 (May 2026)",
      stillOpen: true,
      conviction: "MOD-HIGH",
      thesis: "Coordinated insider buying across multiple executives including CEO signals internal confidence in TSMC's outlook despite modest dollar amounts typical of Taiwan compensation structures.",
      stars: 3,
    },
    {
      rank: 2,
      ticker: "NVDA",
      company: "NVIDIA Corporation",
      price: "~$205",
      signal: "No P-coded insider purchases. Activity dominated by routine F-coded tax withholdings and director sales. Mark Stevens sold $221M+ in June but retains 6.1M shares. Sales appear planned/10b5-1 given consistent pattern.",
      lastInsiderBuy: "N/A",
      stillOpen: false,
      conviction: "MODERATE",
      thesis: "Absence of insider buying is notable given stock volatility, but no alarming clustered executive exits. Large director sales likely pre-planned diversification.",
      stars: 2,
    },
    {
      rank: 3,
      ticker: "AVGO",
      company: "Broadcom Inc",
      price: "~$245",
      signal: "No P-coded purchases. Filings show only routine A-coded director equity grants and one small F-coded tax withholding. Single S-sale by President ISG ($3M) in April with substantial retained position.",
      lastInsiderBuy: "N/A",
      stillOpen: false,
      conviction: "MODERATE",
      thesis: "Clean insider tape with no aggressive selling; routine compensation mechanics only. Neutral signal but no red flags.",
      stars: 2,
    },
    {
      rank: 4,
      ticker: "ASML",
      company: "ASML Holding NV",
      price: "~$730",
      signal: "No Form 4 filings found in the 6-month window. As a Dutch company, US Form 4 requirements apply only to US-based insiders; absence of filings is not inherently bearish.",
      lastInsiderBuy: "N/A",
      stillOpen: false,
      conviction: "MODERATE",
      thesis: "No actionable insider signal available from SEC filings. Evaluate based on fundamentals and European disclosure requirements.",
      stars: 2,
    },
    {
      rank: 5,
      ticker: "QCOM",
      company: "Qualcomm Inc",
      price: "~$160",
      signal: "No Form 4 data provided in dataset for this ticker. Unable to assess insider activity.",
      lastInsiderBuy: "N/A",
      stillOpen: false,
      conviction: "MODERATE",
      thesis: "Insufficient data to evaluate insider sentiment. Monitor future filings for directional signals.",
      stars: 2,
    },
    {
      rank: 6,
      ticker: "INTC",
      company: "Intel Corporation",
      price: "~$22",
      signal: "No Form 4 data provided in dataset for this ticker. Unable to assess insider activity.",
      lastInsiderBuy: "N/A",
      stillOpen: false,
      conviction: "MODERATE",
      thesis: "No insider data available to evaluate. Given turnaround story, would want to see C-suite P-buys for conviction.",
      stars: 2,
    },
    {
      rank: 7,
      ticker: "MRVL",
      company: "Marvell Technology Inc",
      price: "~$90",
      signal: "No P-coded purchases. CEO Murphy and CFO Meintjes both sold in May ($1.3M and $700k respectively). COO Koopmans sold $2M+ in June. Multiple officer sales but positions remain substantial.",
      lastInsiderBuy: "N/A",
      stillOpen: false,
      conviction: "CAUTIOUS",
      thesis: "CEO, CFO, and COO all selling within 60 days is a yellow flag. Positions retained are large, but coordinated officer selling warrants monitoring.",
      stars: 1,
    },
    {
      rank: 8,
      ticker: "AMD",
      company: "Advanced Micro Devices Inc",
      price: "~$165",
      signal: "No P-coded purchases. CEO Lisa Su executed large programmatic sale (~$54M across 22 lots) in May. CTO Papermaster M+S same-day sale. Activity consistent with 10b5-1 plans.",
      lastInsiderBuy: "N/A",
      stillOpen: false,
      conviction: "CAUTIOUS",
      thesis: "CEO selling $54M is notable even if planned. No offsetting insider buying despite strong AI narrative. Monitor for acceleration in sales.",
      stars: 1,
    },
    {
      rank: 9,
      ticker: "MU",
      company: "Micron Technology Inc",
      price: "~$130",
      signal: "No P-coded purchases. CEO Mehrotra conducted substantial S-coded sales totaling $20M+ across May 29 in many small lots. Pattern suggests 10b5-1 plan execution.",
      lastInsiderBuy: "N/A",
      stillOpen: false,
      conviction: "CAUTIOUS",
      thesis: "Heavy CEO selling during memory upcycle is a yellow flag. Retains large position but no insider buying to offset negative optics.",
      stars: 1,
    },
    {
      rank: 10,
      ticker: "ARM",
      company: "Arm Holdings plc",
      price: "~$140",
      signal: "Alarming cluster selling: Chief Legal Officer Collins liquidated entire position ($8.8M), Chief People Officer Eaton sold to zero, Chief Commercial Officer Abbey sold aggressively across 7 filings totaling $13M+. CAO also selling.",
      lastInsiderBuy: "N/A",
      stillOpen: false,
      conviction: "AVOID",
      thesis: "Multiple officers selling to zero is a strong red flag regardless of stock performance. Suggests insiders view current prices as full valuation.",
      stars: 1,
    },
  ],
  redFlags: [
    {
      ticker: "ARM",
      company: "Arm Holdings plc",
      severity: "STRONG AVOID",
      signal: "Chief Legal Officer Collins and Chief People Officer Eaton both liquidated 100% of holdings in May 2026. Chief Commercial Officer Abbey sold $13M+ across 7 separate filings in May-June. Pattern of officers exiting entirely is a major warning signal.",
    },
  ],
};
