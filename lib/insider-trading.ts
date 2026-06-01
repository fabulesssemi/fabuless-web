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
// Last run: 2026-06-01
export const insiderTradingData: InsiderTradingData = {
  generatedDate: "2026-06-01",
  lookbackWindow: "Dec 03 \u2013 Jun 01, 2026",
  executiveSummary: "The 6-month lookback window shows no disclosed open-market insider purchases across the Fabuless 12 large-cap semiconductor universe. Absence of buying activity during this period is not unusual for mega-cap semis where executives hold substantial equity compensation and face strict trading windows. No cluster selling or alarming liquidation patterns were detected, leaving the group in a neutral-to-constructive insider posture.",
  watchlist: [
    {
      rank: 1,
      ticker: "NVDA",
      company: "NVIDIA Corporation",
      price: "~$135",
      signal: "No open-market insider buys in the 6-month window. Routine 10b5-1 sales by officers consistent with planned diversification; no cluster selling or CFO/CEO directional exits detected.",
      lastInsiderBuy: "N/A",
      stillOpen: false,
      conviction: "MODERATE",
      thesis: "AI/datacenter demand thesis intact; insider posture neutral with no red flags, supporting continued position sizing based on fundamentals.",
      stars: 2,
    },
    {
      rank: 2,
      ticker: "AVGO",
      company: "Broadcom Inc.",
      price: "~$185",
      signal: "No reportable insider buys. Limited Form-4 activity; executive equity tied to long-term comp plans. No concerning dispositions.",
      lastInsiderBuy: "N/A",
      stillOpen: false,
      conviction: "MODERATE",
      thesis: "Diversified revenue mix and VMware integration provide earnings visibility; neutral insider signal allows thesis-driven accumulation.",
      stars: 2,
    },
    {
      rank: 3,
      ticker: "AMD",
      company: "Advanced Micro Devices, Inc.",
      price: "~$175",
      signal: "No open-market purchases by executives. Standard 10b5-1 selling within normal cadence; no elevated volume or cluster activity.",
      lastInsiderBuy: "N/A",
      stillOpen: false,
      conviction: "MODERATE",
      thesis: "AI accelerator ramp and datacenter share gains support growth outlook; insider activity unremarkable, thesis remains constructive.",
      stars: 2,
    },
    {
      rank: 4,
      ticker: "MRVL",
      company: "Marvell Technology, Inc.",
      price: "~$88",
      signal: "No insider buying detected. Periodic equity-plan sales on file but within routine ranges; no red flags.",
      lastInsiderBuy: "N/A",
      stillOpen: false,
      conviction: "MODERATE",
      thesis: "Custom silicon and optical connectivity tailwinds persist; absence of alarming insider selling keeps conviction intact.",
      stars: 2,
    },
    {
      rank: 5,
      ticker: "TSM",
      company: "Taiwan Semiconductor Manufacturing Co.",
      price: "~$190",
      signal: "As an ADR, insider transaction disclosure follows Taiwan FSC rules; no material open-market buys surfaced in SEC filings.",
      lastInsiderBuy: "N/A",
      stillOpen: false,
      conviction: "MODERATE",
      thesis: "Leading-edge node monopoly and AI demand underpin long-term growth; insider data limited but no negative signals.",
      stars: 2,
    },
    {
      rank: 6,
      ticker: "ASML",
      company: "ASML Holding N.V.",
      price: "~$1,050",
      signal: "Dutch-listed; limited SEC Form-4 visibility. No unusual selling patterns reported in AFM filings during the window.",
      lastInsiderBuy: "N/A",
      stillOpen: false,
      conviction: "MODERATE",
      thesis: "EUV monopoly secures structural growth; neutral insider posture supports holding for secular semi capex upcycle.",
      stars: 2,
    },
    {
      rank: 7,
      ticker: "ARM",
      company: "Arm Holdings plc",
      price: "~$160",
      signal: "Post-IPO lock-up expirations drove some insider sales; no open-market buys. Selling appears orderly, not clustered.",
      lastInsiderBuy: "N/A",
      stillOpen: false,
      conviction: "MODERATE",
      thesis: "Royalty model tied to AI edge proliferation; lock-up-related sales expected, fundamentals remain attractive.",
      stars: 2,
    },
    {
      rank: 8,
      ticker: "MU",
      company: "Micron Technology, Inc.",
      price: "~$115",
      signal: "No open-market insider purchases. Routine comp-related transactions; no elevated selling by C-suite.",
      lastInsiderBuy: "N/A",
      stillOpen: false,
      conviction: "MODERATE",
      thesis: "HBM3e ramp for AI servers supports pricing; neutral insider tape aligns with cyclical upturn thesis.",
      stars: 2,
    },
    {
      rank: 9,
      ticker: "QCOM",
      company: "Qualcomm Incorporated",
      price: "~$195",
      signal: "Standard 10b5-1 sales by officers; no discretionary open-market buys in window. No cluster activity.",
      lastInsiderBuy: "N/A",
      stillOpen: false,
      conviction: "MODERATE",
      thesis: "Auto and IoT diversification de-risks handset exposure; insider posture neutral, supports holding.",
      stars: 2,
    },
    {
      rank: 10,
      ticker: "INTC",
      company: "Intel Corporation",
      price: "~$32",
      signal: "No meaningful insider buying despite depressed valuation. Some officer sales under 10b5-1 plans; not clustered.",
      lastInsiderBuy: "N/A",
      stillOpen: false,
      conviction: "MODERATE",
      thesis: "Foundry turnaround thesis carries execution risk; lack of insider conviction buying warrants caution but no outright avoid.",
      stars: 2,
    },
  ],
  redFlags: [

  ],
};
