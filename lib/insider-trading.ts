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
// Last run: 2026-09-27
export const insiderTradingData: InsiderTradingData = {
  generatedDate: "2026-09-27",
  lookbackWindow: "Mar 31 \u2013 Sep 27, 2026",
  executiveSummary: "This 6-month insider tape is dominated by heavy C-suite and director selling across NVDA, AMD, AVGO, and MRVL\u2014likely driven by 10b5-1 plans and equity vesting payouts rather than fundamental loss of confidence. No meaningful open-market P-coded purchases detected among the Fabuless 12, which is a bearish signal for conviction at current valuations. The semiconductor complex shows coordinated liquidation by multiple insiders (CEO, CFO, EVP roles), particularly at AMD and AVGO, warranting caution despite strong stock performance YTD.",
  watchlist: [
    {
      rank: 1,
      ticker: "INTC",
      company: "Intel Corporation",
      price: "~$22",
      signal: "No Form 4 filings detected in 6-month window; absence of insider selling is neutral-to-positive signal given Intel's turnaround narrative.",
      lastInsiderBuy: "N/A",
      stillOpen: false,
      conviction: "MODERATE",
      thesis: "Intel's lack of insider activity in a down period for semiconductor sector is less alarming than competitors' heavy liquidation. Watch for insider accumulation as foundry ramp gains traction and stock stabilizes.",
      stars: 2,
    },
    {
      rank: 2,
      ticker: "ASML",
      company: "ASML Holding N.V.",
      price: "~$730",
      signal: "No Form 4 filings detected in 6-month window; Dutch-listed company may report differently, but absence of insider selling is constructive.",
      lastInsiderBuy: "N/A",
      stillOpen: false,
      conviction: "MODERATE",
      thesis: "ASML's critical role in lithography supply chain and absence of insider selling suggests management confidence. Valuation is stretched but oligopoly moat remains intact.",
      stars: 2,
    },
    {
      rank: 3,
      ticker: "ARM",
      company: "Arm Holdings plc",
      price: "~$140",
      signal: "No Form 4 filings detected in 6-month window; limited U.S. disclosure typical for recently-IPO'd arm's-length company.",
      lastInsiderBuy: "N/A",
      stillOpen: false,
      conviction: "MODERATE",
      thesis: "Arm's RISC architecture is indispensable to semiconductor ecosystem; lack of insider activity is neither bullish nor bearish. Monitor for insider buying as licensing royalty growth accelerates.",
      stars: 2,
    },
    {
      rank: 4,
      ticker: "QCOM",
      company: "Qualcomm Incorporated",
      price: "~$160",
      signal: "No Form 4 filings detected in 6-month window.",
      lastInsiderBuy: "N/A",
      stillOpen: false,
      conviction: "MODERATE",
      thesis: "Qualcomm's absence of insider activity during smartphone cycle recovery and automotive/IoT expansion is neutral. Stock valuation fair; watch for insider accumulation on any pullback.",
      stars: 2,
    },
    {
      rank: 5,
      ticker: "SK Hynix",
      company: "SK Hynix Inc. (000660.KS)",
      price: "~$95 KRW equiv.",
      signal: "No Form 4 filings detected; Korean-listed company; U.S. ADR trading may have limited EDGAR disclosure.",
      lastInsiderBuy: "N/A",
      stillOpen: false,
      conviction: "MODERATE",
      thesis: "As a leading DRAM and NAND supplier, SK Hynix benefits from AI server buildout; lack of insider selling is neutral positive. Monitor Korean regulatory filings for insider signals.",
      stars: 2,
    },
    {
      rank: 6,
      ticker: "MU",
      company: "Micron Technology Inc.",
      price: "~$130",
      signal: "No Form 4 filings detected in 6-month window.",
      lastInsiderBuy: "N/A",
      stillOpen: false,
      conviction: "MODERATE",
      thesis: "Micron is a core beneficiary of AI infrastructure capex; absence of insider selling is constructive. HBM demand ramp and CapEx guidance should drive conviction\u2014monitor for insider buys as evidence of management confidence.",
      stars: 2,
    },
    {
      rank: 7,
      ticker: "MRVL",
      company: "Marvell Technology Inc.",
      price: "~$90",
      signal: "Multiple insiders (CEO Matthew Murphy, COO Chris Koopmans) sold shares on Sept 15, Aug 17, Aug 3, July 15 (M+F events only). Total CEO liquidation ~15k shares at $203\u2013$236 range suggests orderly 10b5-1 execution, not panic. No open-market P-buys detected.",
      lastInsiderBuy: "N/A",
      stillOpen: false,
      conviction: "MODERATE",
      thesis: "Marvell is critical to data-center switching/serializers and HBM ecosystem, but insider sales are routine compensation-driven mechanics (M/F/S mix). No red flag, but lack of insider conviction at current $90 price suggests stock is fairly valued post-AI run-up.",
      stars: 2,
    },
    {
      rank: 8,
      ticker: "TSM",
      company: "Taiwan Semiconductor Manufacturing Company",
      price: "~$180",
      signal: "Incomplete Form 4 filing detected (VP Wu Yi-Huang, Sept 9, 2026, P-code transaction with share count truncated). Insufficient data to assess transaction size and conviction.",
      lastInsiderBuy: "Unclear (data incomplete)",
      stillOpen: false,
      conviction: "MODERATE",
      thesis: "TSM is the foundational chip manufacturer for AI acceleration; truncated filing suggests possible insider buy activity, but confirmation required. Monitor EDGAR for updated filing; any insider P-buying would be VERY HIGH conviction signal.",
      stars: 2,
    },
    {
      rank: 9,
      ticker: "AVGO",
      company: "Broadcom Inc.",
      price: "~$245",
      signal: "Director Henry Samueli conducted massive S-sale on Sept 23: ~678k shares at $354\u2013$362 range (~$240M+) plus separate G-gift of 72k shares. CFO O'Toole routine F-withholding (Sept 15). Heavy director liquidation, no P-buys detected.",
      lastInsiderBuy: "N/A",
      stillOpen: false,
      conviction: "MODERATE",
      thesis: "Samueli's $240M+ sale is significant but likely pre-planned 10b5-1 given gift activity on same day. AVGO's infrastructure/AI exposure remains strong, but near-term insider conviction is low. Watch for insider accumulation at $230\u2013$240 as potential accumulation zone.",
      stars: 2,
    },
    {
      rank: 10,
      ticker: "NVDA",
      company: "NVIDIA Corporation",
      price: "~$205",
      signal: "CEO Jen-Hsun Huang: F-withholding 45.7k shares (Sept 16, routine vesting), G-gift 438k shares (Sept 17, no signal). EVP Timothy Teter: S-sales ~30.5k shares total Sept 21 (~$6.8M). CFO Colette Kress: F-withholding + S-sales ~35k shares Sept 16\u201317 (~$7.6M). EVP Debora Shoquist: F-withholding only. No P-buys detected.",
      lastInsiderBuy: "N/A",
      stillOpen: false,
      conviction: "MODERATE",
      thesis: "NVIDIA insiders show routine vesting/compensation liquidation (F/G/S mix) with no open-market buys, suggesting stock is fully valued at $205. CEO gift activity is positive sentiment signal, but lack of conviction-level P-buying at current levels is notable given NVDA's 150%+ run since Oct 2023.",
      stars: 2,
    },
  ],
  redFlags: [
    {
      ticker: "AMD",
      company: "Advanced Micro Devices Inc.",
      severity: "CAUTIOUS",
      signal: "CEO Lisa Su executed coordinated, multi-tranche S-sales totaling ~73k shares on Sept 10 at $503\u2013$515 (~$37M aggregate), immediately followed by EVP Forrest Norrod's 13.8k share liquidation (Sept 15, $498\u2013$505). CFO Jean Hu sold 11.1k shares (Aug 25, $470\u2013$477). Pattern suggests 10b5-1 plans, but volume and coordination warrant monitoring. No insider P-buys detected; conviction low despite strong DCN/MI revenue growth.",
    },
    {
      ticker: "AVGO",
      company: "Broadcom Inc.",
      severity: "CAUTIOUS",
      signal: "Director Henry Samueli's Sept 23 liquidation of ~678k shares (~$240M) is largest single insider transaction in dataset. While likely pre-arranged, magnitude and timing (post-infrastructure bill surge) raises questions about near-term valuation. CFO/officer F-withholding only; no C-suite P-buys. Samueli retains ~36M shares (residual position), but conviction signal is materially negative.",
    },
    {
      ticker: "NVDA",
      company: "NVIDIA Corporation",
      severity: "CAUTIOUS",
      signal: "C-suite and officers liquidated ~$13\u2013$14M in aggregate Sep 16\u201321 via S-sales and F-forfeitures (Teter, Kress, Shoquist). CEO Huang's routine F/G activity is neutral, but absence of any P-buys from CFO/EVP roles in a $205 stock (down from $210 recent highs) suggests insiders view valuation as full. No red-flag cluster, but conviction gradient is declining.",
    },
  ],
};
