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
// Last run: 2026-10-27
export const insiderTradingData: InsiderTradingData = {
  generatedDate: "2026-10-27",
  lookbackWindow: "Apr 30 \u2013 Oct 27, 2026",
  executiveSummary: "This 6-month window reveals a striking absence of open-market P-coded insider buys across the Fabuless 12\u2014a bearish macro signal. Instead, the tape is dominated by C-suite and director sell activity (AMD CEO, NVDA CFO/GC, AVGO founder), routine option exercises (M-codes), and tax forfeitures (F-codes). Only AVGO shows founder Henry Samueli's large liquidation ($240M+), while AMD CEO Lisa Su executed a massive $70M+ directional exit on Sep 10. This is not a bullish environment for insider conviction.",
  watchlist: [
    {
      rank: 1,
      ticker: "NVDA",
      company: "NVIDIA Corporation",
      price: "~$205",
      signal: "No open-market P-coded buys. CEO Jensen Huang and CFO Colette Kress both sold on Sep 17 (~$2.0M CEO gift + F-codes; ~$7.6M CFO direct sales). Director Mark Stevens executed massive 1.37M-share liquidation (Sep 18, $297M+). Routine F-code tax forfeitures only.",
      lastInsiderBuy: "N/A",
      stillOpen: false,
      conviction: "MODERATE",
      thesis: "No bullish insider signal. Heavy C-suite selling (likely 10b5-1 plans) and director liquidation suggest no material conviction at current levels. Assume neutral-to-cautious tape.",
      stars: 2,
    },
    {
      rank: 2,
      ticker: "AMD",
      company: "Advanced Micro Devices",
      price: "~$165",
      signal: "No open-market P-coded buys. CEO Lisa Su executed massive $70M+ directional exit on Sep 10 (69k+ shares across multiple tranches, $503\u2013$514.55 range). EVP/GM Forrest Norrod conducted repeated routine M-code option exercises + S-sales (Aug, Sep, Oct; ~$17M cumulative). CFO Jean Hu sold $7.9M on Aug 25. No conviction buying.",
      lastInsiderBuy: "N/A",
      stillOpen: false,
      conviction: "AVOID",
      thesis: "CEO's $70M exit on Sep 10 at $503\u2013$515 (well above current ~$165) is a massive directional liquidation, not routine rebalance. Coupled with CFO and EVP selling, this signals no material insider confidence. AVOID.",
      stars: 1,
    },
    {
      rank: 3,
      ticker: "AVGO",
      company: "Broadcom Inc.",
      price: "~$245",
      signal: "No open-market P-coded buys. Founder Henry Samueli executed $240M+ liquidation on Sep 23 (600k+ shares, $354\u2013$362 range; followed by massive secondary block sales $66\u2013$81M). Officer Mark Brazeal sold $19.5M+ (July\u2013Sep). No insider buys.",
      lastInsiderBuy: "N/A",
      stillOpen: false,
      conviction: "AVOID",
      thesis: "Founder's $240M+ trimming of mega-holdings ($354\u2013$362 range) followed by block liquidations is a clear directional exit ahead of Q3/Q4. No offsetting insider buys. Major red flag for conviction.",
      stars: 1,
    },
    {
      rank: 4,
      ticker: "MRVL",
      company: "Marvell Technology",
      price: "~$90",
      signal: "No open-market P-coded buys. All insider activity consists of routine M-code option exercises (Oct 15) and F-code tax forfeitures (Oct 15\u201316). Officer Bharathi Sandeep made single small S-sale ($865k, Oct 16). No conviction buying.",
      lastInsiderBuy: "N/A",
      stillOpen: false,
      conviction: "MODERATE",
      thesis: "Pure routine equity comp mechanics (M + F codes). Single small directional sale by Sandeep is immaterial. No positive or negative signal; treat as neutral tape.",
      stars: 2,
    },
    {
      rank: 5,
      ticker: "TSM",
      company: "Taiwan Semiconductor Manufacturing Company",
      price: "~$180",
      signal: "No Form 4 filings in 6-month window (Apr 30 \u2013 Oct 27, 2026). No insider activity recorded.",
      lastInsiderBuy: "N/A",
      stillOpen: false,
      conviction: "MODERATE",
      thesis: "Absence of insider trading activity is neutral; TSM is a Taiwan-listed ADR with lighter SEC filing cadence. No signal to extract.",
      stars: 2,
    },
    {
      rank: 6,
      ticker: "ASML",
      company: "ASML Holding N.V.",
      price: "~$730",
      signal: "No Form 4 filings in 6-month window. ASML is Netherlands-domiciled; no SEC insiders on file.",
      lastInsiderBuy: "N/A",
      stillOpen: false,
      conviction: "MODERATE",
      thesis: "Foreign issuer; SEC Form 4 data not applicable. Neutral for this analysis.",
      stars: 2,
    },
    {
      rank: 7,
      ticker: "ARM",
      company: "Arm Holdings plc",
      price: "~$140",
      signal: "No Form 4 filings in 6-month window. UK-domiciled; minimal SEC insider filing activity expected post-IPO.",
      lastInsiderBuy: "N/A",
      stillOpen: false,
      conviction: "MODERATE",
      thesis: "UK-listed entity; SEC Form 4 coverage limited. No actionable signal.",
      stars: 2,
    },
    {
      rank: 8,
      ticker: "MU",
      company: "Micron Technology",
      price: "~$130",
      signal: "No Form 4 filings in 6-month window (Apr 30 \u2013 Oct 27, 2026). No insider activity recorded.",
      lastInsiderBuy: "N/A",
      stillOpen: false,
      conviction: "MODERATE",
      thesis: "Silence on the insider tape; no bullish or bearish signal. Assume neutral positioning by management.",
      stars: 2,
    },
    {
      rank: 9,
      ticker: "INTC",
      company: "Intel Corporation",
      price: "~$22",
      signal: "No Form 4 filings in 6-month window. No insider activity recorded.",
      lastInsiderBuy: "N/A",
      stillOpen: false,
      conviction: "MODERATE",
      thesis: "No insider tape signal. Intel's operational challenges are well-documented; insider silence during a period of strategic turmoil is notable but not dispositive.",
      stars: 2,
    },
    {
      rank: 10,
      ticker: "QCOM",
      company: "Qualcomm Incorporated",
      price: "~$160",
      signal: "No Form 4 filings in 6-month window. No insider activity recorded.",
      lastInsiderBuy: "N/A",
      stillOpen: false,
      conviction: "MODERATE",
      thesis: "No insider tape signal. Neutral positioning; no evidence of C-suite conviction or concern.",
      stars: 2,
    },
  ],
  redFlags: [
    {
      ticker: "AMD",
      company: "Advanced Micro Devices",
      severity: "AVOID",
      signal: "CEO Lisa Su executed $70M+ directional liquidation on Sep 10, 2026, selling 69k+ shares across $503\u2013$515 range. Current stock trades ~$165\u2014a 68% decline from sale prices. This is a massive C-suite exit with zero offsetting insider buys. Red flag for material adverse information or loss of confidence.",
    },
    {
      ticker: "AVGO",
      company: "Broadcom Inc.",
      severity: "STRONG AVOID",
      signal: "Founder Henry Samueli liquidated $240M+ of holdings on Sep 23, 2026 ($354\u2013$362 range), followed by institutional block sales of $66\u2013$81M. Current stock ~$245. This is a founder-level conviction exit, suggesting either diversification ahead of a known inflection or loss of confidence in valuation. Paired with officer Mark Brazeal's $19.5M+ sales (Jul\u2013Sep), insider tape is overwhelmingly bearish.",
    },
    {
      ticker: "NVDA",
      company: "NVIDIA Corporation",
      severity: "CAUTIOUS",
      signal: "Director Mark Stevens liquidated 1.37M shares (~$298M) on Sep 18, 2026 at $219\u2013$220 range. While not a C-suite officer, this is an outsized director exit. CFO Colette Kress sold $7.6M on Sep 17. CEO Jensen Huang showed a $438k gift (Sep 17) + F-code forfeitures only. Director liquidation warrants caution; likely pre-planned 10b5-1 but timing coincides with late-Sep consolidation.",
    },
  ],
};
