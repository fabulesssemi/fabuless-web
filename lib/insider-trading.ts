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
// Last run: 2026-05-27
export const insiderTradingData: InsiderTradingData = {
  generatedDate: "2026-05-27",
  lookbackWindow: "May 13 \u2013 27, 2026",
  executiveSummary: "The two-week window produced no actionable insider trading signals across the Fabuless 12 semiconductor coverage universe. With no Form 4 filings indicating open-market purchases or notable cluster selling, the tape remains neutral from an insider sentiment perspective. Absent directional conviction from corporate insiders, position sizing should reflect fundamental and technical factors rather than insider cues.",
  watchlist: [
    {
      rank: 1,
      ticker: "NVDA",
      company: "NVIDIA Corporation",
      price: "~$135",
      signal: "No insider purchases or sales reported during the lookback window. Insider posture is neutral with no Form 4 activity to interpret.",
      lastInsiderBuy: "N/A",
      stillOpen: false,
      conviction: "MODERATE",
      thesis: "AI infrastructure leader with strong secular tailwinds; absence of insider activity provides no incremental signal but fundamentals remain intact.",
      stars: 2,
    },
    {
      rank: 2,
      ticker: "AMD",
      company: "Advanced Micro Devices, Inc.",
      price: "~$165",
      signal: "No insider purchases or sales reported during the lookback window. Management has been quiet on the open market.",
      lastInsiderBuy: "N/A",
      stillOpen: false,
      conviction: "MODERATE",
      thesis: "Data center share gains continue; no insider signal to adjust conviction from fundamental baseline.",
      stars: 2,
    },
    {
      rank: 3,
      ticker: "AVGO",
      company: "Broadcom Inc.",
      price: "~$185",
      signal: "No insider purchases or sales reported during the lookback window. Typical quiet period posture ahead of fiscal Q2 results.",
      lastInsiderBuy: "N/A",
      stillOpen: false,
      conviction: "MODERATE",
      thesis: "Diversified semi with custom ASIC optionality; insider silence is neutral rather than negative.",
      stars: 2,
    },
    {
      rank: 4,
      ticker: "MRVL",
      company: "Marvell Technology, Inc.",
      price: "~$78",
      signal: "No insider purchases or sales reported during the lookback window. No directional cues from management.",
      lastInsiderBuy: "N/A",
      stillOpen: false,
      conviction: "MODERATE",
      thesis: "Custom silicon and data infrastructure growth story; fundamentals constructive but no insider confirmation.",
      stars: 2,
    },
    {
      rank: 5,
      ticker: "TSM",
      company: "Taiwan Semiconductor Manufacturing Co.",
      price: "~$175",
      signal: "No insider purchases or sales reported during the lookback window. ADR structure limits typical U.S.-style insider filings.",
      lastInsiderBuy: "N/A",
      stillOpen: false,
      conviction: "MODERATE",
      thesis: "Foundry leader with unmatched scale; insider data less transparent but competitive moat unchanged.",
      stars: 2,
    },
    {
      rank: 6,
      ticker: "ASML",
      company: "ASML Holding N.V.",
      price: "~$980",
      signal: "No insider purchases or sales reported during the lookback window. European disclosure cadence differs from U.S. norms.",
      lastInsiderBuy: "N/A",
      stillOpen: false,
      conviction: "MODERATE",
      thesis: "EUV monopoly sustains pricing power; no insider signal but structural demand visibility remains high.",
      stars: 2,
    },
    {
      rank: 7,
      ticker: "ARM",
      company: "Arm Holdings plc",
      price: "~$140",
      signal: "No insider purchases or sales reported during the lookback window. Post-IPO lockup dynamics may still influence activity.",
      lastInsiderBuy: "N/A",
      stillOpen: false,
      conviction: "MODERATE",
      thesis: "Royalty model leverages AI edge proliferation; insider silence neutral given relatively recent public listing.",
      stars: 2,
    },
    {
      rank: 8,
      ticker: "MU",
      company: "Micron Technology, Inc.",
      price: "~$115",
      signal: "No insider purchases or sales reported during the lookback window. Memory cycle upturn thesis not yet confirmed by insider buying.",
      lastInsiderBuy: "N/A",
      stillOpen: false,
      conviction: "MODERATE",
      thesis: "HBM demand inflection supportive; lack of insider buying tempers near-term enthusiasm.",
      stars: 2,
    },
    {
      rank: 9,
      ticker: "INTC",
      company: "Intel Corporation",
      price: "~$32",
      signal: "No insider purchases or sales reported during the lookback window. Turnaround narrative lacks insider validation.",
      lastInsiderBuy: "N/A",
      stillOpen: false,
      conviction: "MODERATE",
      thesis: "Foundry services and 18A process ramp are key catalysts; insider buying would meaningfully upgrade conviction.",
      stars: 2,
    },
    {
      rank: 10,
      ticker: "QCOM",
      company: "Qualcomm Incorporated",
      price: "~$185",
      signal: "No insider purchases or sales reported during the lookback window. Licensing stability and auto/IoT growth unconfirmed by insider activity.",
      lastInsiderBuy: "N/A",
      stillOpen: false,
      conviction: "MODERATE",
      thesis: "Diversification beyond handsets progressing; neutral insider posture supports hold rather than add.",
      stars: 2,
    },
  ],
  redFlags: [
  ],
};
