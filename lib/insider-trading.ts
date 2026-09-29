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
// Last run: 2026-09-29
export const insiderTradingData: InsiderTradingData = {
  generatedDate: "2026-09-29",
  lookbackWindow: "Apr 02 \u2013 Sep 29, 2026",
  executiveSummary: "Insider tape is dominated by routine compensation mechanics (F-coded tax withholdings, M-coded option exercises, A-coded grants) with NO meaningful open-market P-coded purchases across the Fabuless 12 in this 6-month window. Multiple C-suite executives at NVDA, AMD, AVGO, and MRVL executed large S-coded share sales in August\u2013September, likely under 10b5-1 pre-planned programs but warrant monitoring. Absence of insider buying conviction across all major semis is a cautionary signal; market appears fully priced with insiders taking profits rather than deploying capital.",
  watchlist: [
    {
      rank: 1,
      ticker: "NVDA",
      company: "NVIDIA Corporation",
      price: "~$205",
      signal: "No open-market P-coded purchases in 6-month window. CEO Jensen Huang executed routine F-coded tax withholding (45.7k shares @ $212.17, Sep 16) and gift of 438k shares to family (Sep 17). CFO Colette Kress and EVP Timothy Teter each executed modest S-coded sales (~$1.0\u2013$4.5M each) on Sep 17\u201321. Pattern consistent with liquidity management and compensation vesting rather than conviction buying.",
      lastInsiderBuy: "N/A",
      stillOpen: false,
      conviction: "MODERATE",
      thesis: "Market leadership in AI/datacenter but insider tape silent on new buying. No red flags, but absence of P-coded purchases by C-suite despite ~14% YoY stock appreciation suggests fair valuation or full insider positioning.",
      stars: 2,
    },
    {
      rank: 2,
      ticker: "AMD",
      company: "Advanced Micro Devices Inc.",
      price: "~$165",
      signal: "No open-market P-coded purchases. CEO Lisa Su executed large S-coded liquidation program: ~72k shares sold across 22 tranches on Sep 10 @ $503\u2013$515 (~$36.6M), plus gift of 35k shares same day. EVP Forrest Norrod (DSG) and EVP Jean Hu (CFO) also sold consistently in Aug\u2013Sep (Norrod: ~14.3k shares @ $453\u2013$502 = ~$6.7M; Hu: ~8.1k shares @ $470\u2013$476 = ~$3.9M). Pattern suggests 10b5-1 plan execution; no panic, but insiders exiting at elevated prices.",
      lastInsiderBuy: "N/A",
      stillOpen: false,
      conviction: "MODERATE",
      thesis: "Strong datacenter demand but CEO and CFO are steady sellers. Likely routine rebalancing, but lack of insider buying alongside significant officer liquidation warrants cautious stance.",
      stars: 2,
    },
    {
      rank: 3,
      ticker: "AVGO",
      company: "Broadcom Inc.",
      price: "~$245",
      signal: "No open-market P-coded purchases. Founder/Director Henry Samueli executed massive S-coded sales on Sep 23: ~687k shares sold across 16 tranches @ $354\u2013$361 (~$242M aggregate value), plus gift of 72.5k shares. Chief Legal Officer Mark Brazeal also sold 25k shares on Jul 8\u201310 @ $379\u2013$401 (~$9.5M). Samueli's scale suggests rebalancing and diversification rather than bearish signal, but directional selling by largest insider is notable.",
      lastInsiderBuy: "N/A",
      stillOpen: false,
      conviction: "MODERATE",
      thesis: "Infrastructure networking leader but founder taking chips off the table in large quantities. Not an immediate red flag (Samueli likely rebalancing), but worth monitoring for additional officer activity.",
      stars: 2,
    },
    {
      rank: 4,
      ticker: "MRVL",
      company: "Marvell Technology Inc.",
      price: "~$90",
      signal: "No open-market P-coded purchases. CEO Matthew Murphy executed two S-coded sales: 7.5k shares on Aug 17 @ $236.08 (~$1.77M) and 7.5k shares on Sep 15 @ $223.39 (~$1.68M). COO Chris Koopmans sold 10k shares on Aug 3 @ $180.50 and 10k shares on Sep 1 @ $203.27 (~$2.03M each tranche). CFO Daniel Durn executed M-coded option exercise (6.5k shares @ $0) and routine F-coded withholding. Pattern is steady executive selling with no compensatory buying.",
      lastInsiderBuy: "N/A",
      stillOpen: false,
      conviction: "MODERATE",
      thesis: "Data center storage/HPC supplier with CEO and COO in steady trimming mode. Modest selling volumes but directional trend bears watching as stock recovers from lows.",
      stars: 2,
    },
    {
      rank: 5,
      ticker: "TSM",
      company: "Taiwan Semiconductor Manufacturing Company Ltd.",
      price: "~$180",
      signal: "Form 4 data truncated mid-filing (Wu Yi-Huang, VP, P-coded transaction details incomplete). Cannot assess conviction level. Recommend direct SEC EDGAR review for complete transaction details.",
      lastInsiderBuy: "Incomplete filing data",
      stillOpen: false,
      conviction: "MODERATE",
      thesis: "World's largest foundry and critical NVIDIA partner. Data gap prevents full assessment, but no alarming red flags visible. Maintain watchlist pending complete filing review.",
      stars: 2,
    },
    {
      rank: 6,
      ticker: "ASML",
      company: "ASML Holding N.V.",
      price: "~$730",
      signal: "No Form 4 insider transactions reported in SEC EDGAR for 6-month window (Apr 02 \u2013 Sep 29, 2026). Company is Dutch-listed with limited SEC reporting. No actionable insider signal available.",
      lastInsiderBuy: "N/A",
      stillOpen: false,
      conviction: "MODERATE",
      thesis: "Critical EUV lithography monopolist and key NVDA/TSMC supplier. Absence of SEC filings (Dutch domicile) prevents insider analysis. Monitor alternative European regulatory filings if available.",
      stars: 2,
    },
    {
      rank: 7,
      ticker: "ARM",
      company: "Arm Holdings plc",
      price: "~$140",
      signal: "No Form 4 insider transactions reported in SEC EDGAR for 6-month window. ARM is LSE-listed and UK-domiciled with limited SEC reporting. No actionable insider signal available.",
      lastInsiderBuy: "N/A",
      stillOpen: false,
      conviction: "MODERATE",
      thesis: "Leading CPU IP licensor (smartphone, datacenter, edge). UK-listing limits SEC visibility into insider activity. Monitor LSE filings or Regulatory News Service for insider signals.",
      stars: 2,
    },
    {
      rank: 8,
      ticker: "MU",
      company: "Micron Technology Inc.",
      price: "~$130",
      signal: "No Form 4 insider transactions reported in SEC EDGAR for 6-month window (Apr 02 \u2013 Sep 29, 2026). No actionable insider signal available.",
      lastInsiderBuy: "N/A",
      stillOpen: false,
      conviction: "MODERATE",
      thesis: "Major DRAM/NAND supplier with exposure to AI and datacenter buildout. Absence of insider buying or selling in 6-month window neutral; maintain watchlist pending earnings and forward guidance.",
      stars: 2,
    },
    {
      rank: 9,
      ticker: "INTC",
      company: "Intel Corporation",
      price: "~$22",
      signal: "No Form 4 insider transactions reported in SEC EDGAR for 6-month window (Apr 02 \u2013 Sep 29, 2026). Intel's dramatic 2024\u20132026 operational deterioration (foundry losses, x86 market share erosion, Gelsinger departure) likely suppressed insider confidence; silence is ominous.",
      lastInsiderBuy: "N/A",
      stillOpen: false,
      conviction: "MODERATE",
      thesis: "Semiconductor veteran in structural decline. Lack of insider buying confidence amid turnaround efforts is cautionary. Stock down >85% from 2021 peaks; insider silence suggests limited conviction in near-term recovery.",
      stars: 2,
    },
    {
      rank: 10,
      ticker: "QCOM",
      company: "Qualcomm Incorporated",
      price: "~$160",
      signal: "No Form 4 insider transactions reported in SEC EDGAR for 6-month window (Apr 02 \u2013 Sep 29, 2026). No actionable insider signal available.",
      lastInsiderBuy: "N/A",
      stillOpen: false,
      conviction: "MODERATE",
      thesis: "Dominant mobile modem/RF supplier with exposure to 5G ramp and handset cycles. Insider silence neutral given cyclical nature; monitor for buying confidence as AI smartphone adoption accelerates in 2027.",
      stars: 2,
    },
  ],
  redFlags: [
    {
      ticker: "AVGO",
      company: "Broadcom Inc.",
      severity: "CAUTION",
      signal: "Founder Henry Samueli liquidated ~687k shares on Sep 23 @ $354\u2013$361 aggregate value ~$242M). While scale suggests diversification rebalancing rather than fundamental distress, this represents one of the largest insider sale events in the 6-month window. Monitor for additional officer exits or guidance reductions.",
    },
    {
      ticker: "AMD",
      company: "Advanced Micro Devices Inc.",
      severity: "CAUTION",
      signal: "CEO Lisa Su executed coordinated liquidation of ~72k shares on Sep 10 across 22 separate sales (~$36.6M aggregate), consistent with 10b5-1 pre-planned program. Prices ($503\u2013$515) imply significant run-up from earlier in cycle. No panic signal, but insider confidence appears neutral-to-cautious at current levels.",
    },
    {
      ticker: "NVDA",
      company: "NVIDIA Corporation",
      severity: "MONITOR",
      signal: "Director Mark Stevens sold 1.366M shares on Sep 18 @ $219\u2013$220 (~$300M aggregate), reducing stake from ~980.5M to ~970.5M shares. While Stevens likely under 10b5-1, scale is notable. CEO Huang and CFO Kress also trimmed holdings modestly in Sep. No fundamental red flag, but suggests insiders comfortable taking profits at current valuations.",
    },
  ],
};
