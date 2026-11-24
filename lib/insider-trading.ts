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
// Last run: 2026-11-24
export const insiderTradingData: InsiderTradingData = {
  generatedDate: "2026-11-24",
  lookbackWindow: "May 28 \u2013 Nov 24, 2026",
  executiveSummary: "Insider tape is mixed but heavily skewed toward executive liquidations, particularly at AMD (CEO Lisa Su) and NVDA (EVP Teter), signaling potential confidence erosion or pre-announced 10b5-1 plans. TSM stands out as the only name with consistent multi-insider open-market P-buying (8 officers), suggesting genuine conviction at current levels (~$180). ASML shows no filing activity; most other names exhibit routine compensation mechanics (F/M/A codes) with scattered sales.",
  watchlist: [
    {
      rank: 1,
      ticker: "TSM",
      company: "Taiwan Semiconductor Manufacturing",
      price: "~$180",
      signal: "8 separate officers executed open-market P-buys in Nov 2026 (Lu Lee-Chung $121k, Burns Ursula $500k, plus 6 SVPs/VPs at $70.50/share on Nov 6). No offsetting sales by these insiders. Collectively ~$700k+ deployed.",
      lastInsiderBuy: "$500k @ $363.67 (Nov 17, 2026)",
      stillOpen: true,
      conviction: "VERY HIGH",
      thesis: "Multi-insider, coordinated open-market buying at $70\u2013$180 without concurrent selling is a rare and credible signal of conviction in TSM's near-term trajectory. The breadth (8 officers) across levels (VP to SVP) suggests institutional confidence.",
      stars: 5,
    },
    {
      rank: 2,
      ticker: "NVDA",
      company: "NVIDIA Corporation",
      price: "~$205",
      signal: "EVP Teter (General Counsel) executed major open-market S-sales: $2.77M (Sep 21), $3.0M (Sep 21) at $222\u2013$223; followed by $3.88M in tranched sales (Nov 19) at $146\u2013$152. Director Coxe received $500k gifts (Oct, Nov). No P-buys. Routine F-code forfeitures by officers (Sep 16). Pattern suggests pre-planned 10b5-1 or personal liquidity, not new conviction.",
      lastInsiderBuy: "N/A",
      stillOpen: false,
      conviction: "MODERATE",
      thesis: "NVDA shows no fresh insider P-buying; heavy sales by C-suite legal officer likely reflect predetermined exit plans rather than loss of confidence, but absence of new buys at $205 warrants caution.",
      stars: 2,
    },
    {
      rank: 3,
      ticker: "AMD",
      company: "Advanced Micro Devices",
      price: "~$165",
      signal: "CEO Lisa Su executed massive open-market S-sale on Nov 16: 63,952 shares across 23 tranches at $502\u2013$524, totaling ~$32.5M. EVP Norrod also sold $4.9M (11,517 shares, Nov 16). Multiple officers (Papermaster, Guido, Hu, Grasby, Hahn) exercised options & took tax forfeitures (M/F, Nov 15). No P-buys by any insider.",
      lastInsiderBuy: "N/A",
      stillOpen: false,
      conviction: "MODERATE",
      thesis: "CEO Lisa Su's $32M+ liquidation on a single day (Nov 16) is consistent with a 10b5-1 plan or rebalancing, but signals neither conviction nor concern. Absence of P-buying at $165 is neutral-to-slightly-bearish given AMD's strong stock performance YTD.",
      stars: 2,
    },
    {
      rank: 4,
      ticker: "AVGO",
      company: "Broadcom Inc.",
      price: "~$245",
      signal: "Director Samueli executed $233M in open-market S-sales on Sep 23 (586,814 shares across 17 tranches at $354\u2013$361). Officers Brazeal & O'Toole filed routine F-code tax forfeitures (Jul, Sep). No P-buys. Sales are large but Samueli still retains ~36M shares; pattern consistent with diversification or a known 10b5-1.",
      lastInsiderBuy: "N/A",
      stillOpen: false,
      conviction: "MODERATE",
      thesis: "Samueli's $233M exit is material but does not reflect capitulation (he retains ~36M shares). Absence of fresh P-buying or insider concern, but high absolute sale value warrants monitoring.",
      stars: 2,
    },
    {
      rank: 5,
      ticker: "MRVL",
      company: "Marvell Technology",
      price: "~$90",
      signal: "CEO Murphy sold 7,500 shares at $146.54 (Nov 16, ~$1.1M). COO Koopmans sold 10,000 shares at $186.97 (Nov 2, ~$1.87M). Officers (Scarpulla, Koopmans) filed routine option exercises & tax forfeitures (M/F, Oct\u2013Nov). No P-buys. Sales by senior management but of modest size relative to holdings.",
      lastInsiderBuy: "N/A",
      stillOpen: false,
      conviction: "MODERATE",
      thesis: "Marvell shows routine executive sales consistent with compensation management, not signs of distress. Absence of P-buying suggests no strong conviction, but no red flags either.",
      stars: 2,
    },
    {
      rank: 6,
      ticker: "ARM",
      company: "Arm Holdings plc",
      price: "~$140",
      signal: "CFO Child sold 10,400 shares at $189.73 (Nov 19, ~$1.97M). Multiple officers (Bartels, Abbey, Collins, Eaton) executed option exercises & tax forfeitures (M/F, Nov 16). No P-buys. Sales and vesting are routine; no concentration of concern.",
      lastInsiderBuy: "N/A",
      stillOpen: false,
      conviction: "MODERATE",
      thesis: "ARM insiders show routine equity management (vesting, tax-driven forfeitures, modest diversification). No insider P-buying or coordinated selling suggests neither strong conviction nor alarm.",
      stars: 2,
    },
    {
      rank: 7,
      ticker: "INTC",
      company: "Intel Corporation",
      price: "~$22",
      signal: "No Form 4 filings in the 6-month window (May 28 \u2013 Nov 24, 2026). Absence of insider activity in a turnaround period is not necessarily a negative (may reflect blackout or limited equity comp), but provides no evidence of confidence.",
      lastInsiderBuy: "N/A",
      stillOpen: false,
      conviction: "MODERATE",
      thesis: "Intel's lack of insider filings during a critical restructuring phase offers neither signal nor reassurance. Monitor for future trading; absence of P-buying does not preclude a turnaround but denies us confidence data.",
      stars: 2,
    },
    {
      rank: 8,
      ticker: "QCOM",
      company: "Qualcomm Incorporated",
      price: "~$160",
      signal: "No Form 4 filings in the 6-month window. Absence of insider activity suggests either restricted trading or limited executive equity transactions during this period.",
      lastInsiderBuy: "N/A",
      stillOpen: false,
      conviction: "MODERATE",
      thesis: "Qualcomm shows no insider filings in the lookback window, neither confirming nor denying conviction. Neutral signal absent additional context.",
      stars: 2,
    },
    {
      rank: 9,
      ticker: "ASML",
      company: "ASML Holding N.V.",
      price: "~$730",
      signal: "No Form 4 filings in the 6-month window (May 28 \u2013 Nov 24, 2026). ASML insiders have not filed with the SEC in this period, possibly due to ADR structure, local regulatory exemptions, or trading restrictions.",
      lastInsiderBuy: "N/A",
      stillOpen: false,
      conviction: "MODERATE",
      thesis: "ASML's absence from SEC filings does not indicate weakness; ADR holders may trade under different reporting regimes or be subject to blackout periods. Neutral signal; evaluate ASML on fundamentals and earnings, not insider tape.",
      stars: 2,
    },
    {
      rank: 10,
      ticker: "MU",
      company: "Micron Technology",
      price: "~$130",
      signal: "No Form 4 filings in the 6-month window. Absence of insider activity in a commodity-cycle sensitive memory stock provides no confidence signal.",
      lastInsiderBuy: "N/A",
      stillOpen: false,
      conviction: "MODERATE",
      thesis: "Micron's silence on Form 4s suggests restricted trading or limited equity transactions. Neither bullish nor bearish; focus on supply/demand and earnings for conviction.",
      stars: 2,
    },
  ],
  redFlags: [
    {
      ticker: "AMD",
      company: "Advanced Micro Devices",
      severity: "CAUTIOUS",
      signal: "CEO Lisa Su executed $32.5M in open-market sales on a single day (Nov 16, 2026) across 23 tranches. While likely a 10b5-1 plan, the scale and timing should be flagged. Absence of any insider P-buying in a 6-month window is mildly concerning given strong stock momentum.",
    },
    {
      ticker: "NVDA",
      company: "NVIDIA Corporation",
      severity: "CAUTIOUS",
      signal: "EVP Timothy Teter (General Counsel) executed $6M+ in open-market sales (Sep 21 and Nov 19). Combined with routine F-code forfeitures by other officers, the sales pattern suggests pre-planned liquidity moves rather than fresh conviction. No P-buys by any insider.",
    },
    {
      ticker: "AVGO",
      company: "Broadcom Inc.",
      severity: "AVOID",
      signal: "Director Henry Samueli executed $233M in open-market S-sales on Sep 23, 2026 (586,814 shares). While he retains ~36M shares and the sale may reflect a known diversification plan, the absolute magnitude ($233M in a single day) is exceptionally large and warrants close monitoring for any signs of management concern or stock overvaluation.",
    },
  ],
};
