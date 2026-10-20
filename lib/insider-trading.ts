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
// Last run: 2026-10-20
export const insiderTradingData: InsiderTradingData = {
  generatedDate: "2026-10-20",
  lookbackWindow: "Apr 23 \u2013 Oct 20, 2026",
  executiveSummary: "This 6-month window reveals a concerning absence of open-market P-coded insider buying across the Fabuless 12. Instead, the tape is dominated by heavy C-suite and director selling (particularly in NVDA, AMD, AVGO, and MRVL), routine F-coded tax forfeitures on vesting, and compensation awards. The only bullish signal is a 500k-share gift to NVDA Director Coxe (likely part of estate/succession planning, not conviction buying). Overall, insider sentiment is neutral-to-cautious; the selling volume and timing suggest either portfolio rebalancing or preemptive exits ahead of potential volatility.",
  watchlist: [
    {
      rank: 1,
      ticker: "NVDA",
      company: "NVIDIA Corporation",
      price: "~$205",
      signal: "No P-coded buys. Director Coxe received 500k-share gift (2026-10-07, likely estate planning, not conviction). CEO Huang filed routine F-forfeitures (45.7k shares, 09-16) and a 438k-share gift (09-17). CFO Kress and EVP Teter sold $5.2M and $6.8M respectively in mid-September; Teter reduced holdings by ~$6.8M post-September sales. Director Stevens dumped 1.37M shares (~$300M, 09-18)\u2014the single largest directional exit in the dataset.",
      lastInsiderBuy: "N/A",
      stillOpen: false,
      conviction: "MODERATE",
      thesis: "NVDA shows no insider conviction buying; the heavy selling by Stevens (director) and CFO Kress in September, combined with routine compensation flows, suggests executives are comfortable taking chips off the table at current levels. No red flag per se, but absence of buying is notable given NVDA's dominance.",
      stars: 2,
    },
    {
      rank: 2,
      ticker: "AMD",
      company: "Advanced Micro Devices, Inc.",
      price: "~$165",
      signal: "No P-coded buys. CEO Lisa Su executed a 69-tranche sale (69k shares total, 09-10, ~$35.2M realized); EVP Norrod repeatedly sold in tranches post-option exercise (M + S pattern across 08-24, 09-15, 10-15; ~12.8k shares, ~$5.8M across three filing dates). CFO Hu sold 13.6k shares (~$7.6M, 08-25) in six tranches. All sales are routine 10b5-1 liquidation patterns, not forced exits.",
      lastInsiderBuy: "N/A",
      stillOpen: false,
      conviction: "MODERATE",
      thesis: "AMD's insider tape mirrors NVDA: systematic, tranched selling by C-suite (CEO Su, CFO Hu, CTO Papermaster) with no offsetting open-market buys. Selling volumes suggest planned portfolio rebalancing rather than panic; still, the absence of buying conviction is a yellow flag in a sector where insider confidence typically manifests as P-coded purchases.",
      stars: 2,
    },
    {
      rank: 3,
      ticker: "AVGO",
      company: "Broadcom Inc.",
      price: "~$245",
      signal: "No P-coded buys. Director Samueli executed the second-largest single-name liquidation in the window: 673k shares (~$239M realized, 09-23) in 16 tranches, all at prices $354\u2013$362. Also received 72.5k-share gift same day (likely partial estate transfer). CFO O'Toole filed routine F-forfeiture (1.5k shares, 09-15). CLO Brazeal sold 50k shares (~$19.5M, 07-08 and 07-10) in two blocks. No conviction buying.",
      lastInsiderBuy: "N/A",
      stillOpen: false,
      conviction: "MODERATE",
      thesis: "AVGO's insider tape is dominated by Director Samueli's massive, methodical $239M liquidation in late September. While the tranched execution suggests orderly 10b5-1 plan execution (not distress), the scale and timing raise questions about near-term sentiment. No offsetting insider buying to suggest conviction at current levels.",
      stars: 2,
    },
    {
      rank: 4,
      ticker: "MRVL",
      company: "Marvell Technology, Inc.",
      price: "~$90",
      signal: "No P-coded buys. Recent activity (10-15 to 10-16): COO Koopmans, CAO Scarpulla, DCG President Bharathi, and CLO Casper all filed M (option exercises) followed by F (tax forfeitures)\u2014routine vesting mechanics. Bharathi sold 3.7k shares (~$866k, 10-16) post-forfeiture. No material open-market buys or high-conviction insider moves.",
      lastInsiderBuy: "N/A",
      stillOpen: false,
      conviction: "MODERATE",
      thesis: "MRVL shows zero open-market insider buying over 6 months. Recent filings (mid-October) are routine option vests and tax withholdings, not signals. Given MRVL's exposure to data-center dynamics, absence of insider conviction is mildly concerning but not alarming; company remains on watchlist pending stronger signals.",
      stars: 2,
    },
    {
      rank: 5,
      ticker: "TSM",
      company: "Taiwan Semiconductor Manufacturing Company",
      price: "~$180",
      signal: "No Form 4 filings in 6-month window (Apr 23 \u2013 Oct 20, 2026). TSM as a Taiwan-listed ADR may not file with SEC; check Taiwan Stock Exchange (TWSE) filings separately for insider signals.",
      lastInsiderBuy: "N/A",
      stillOpen: false,
      conviction: "MODERATE",
      thesis: "TSM is included per Fabuless 12 mandate, but no SEC EDGAR data available in this window. Recommend cross-checking TWSE Form 10-Q/20-F filings or Taiwan Stock Exchange insider transactions. Maintain position on watchlist pending additional intel.",
      stars: 2,
    },
    {
      rank: 6,
      ticker: "ASML",
      company: "ASML Holding N.V.",
      price: "~$730",
      signal: "No Form 4 filings in 6-month window. ASML is a Dutch-listed company; U.S. insiders may file with SEC, but no filings found in EDGAR for Apr 23 \u2013 Oct 20, 2026. Check Netherlands Authority for Financial Markets (AFM) and ASML's official disclosures.",
      lastInsiderBuy: "N/A",
      stillOpen: false,
      conviction: "MODERATE",
      thesis: "ASML (Fabuless 12 inclusion) shows no SEC EDGAR insider filings this window. Recommend checking Dutch regulatory filings (AFM) and ASML IR for insider transaction data. Maintain watchlist pending clarification.",
      stars: 2,
    },
    {
      rank: 7,
      ticker: "ARM",
      company: "Arm Holdings plc",
      price: "~$140",
      signal: "No Form 4 filings in 6-month window (Apr 23 \u2013 Oct 20, 2026). ARM is UK-listed; U.S. insiders may file, but no EDGAR filings identified. Check UK Financial Conduct Authority (FCA) and ARM's investor relations for insider transaction disclosures.",
      lastInsiderBuy: "N/A",
      stillOpen: false,
      conviction: "MODERATE",
      thesis: "ARM Holdings (Fabuless 12 inclusion) shows no SEC EDGAR insider filings in this period. Recommend verifying UK FCA disclosures for meaningful insider activity. Maintain position pending additional data.",
      stars: 2,
    },
    {
      rank: 8,
      ticker: "MU",
      company: "Micron Technology, Inc.",
      price: "~$130",
      signal: "No Form 4 filings in 6-month window (Apr 23 \u2013 Oct 20, 2026). Absence of insider trading activity\u2014whether buying or selling\u2014in a DRAM/NAND leader during a volatile memory cycle is unusual and warrants investigation.",
      lastInsiderBuy: "N/A",
      stillOpen: false,
      conviction: "MODERATE",
      thesis: "MU's silence on the insider tape is notable. No buys, no sells, no grants. Either: (a) SEC Form 4 filings delayed, (b) heavy blackout period (earnings/guidance), or (c) insider lockup. Monitor MU's SEC filings for updates; absence of any insider signal is neutral-to-slightly-bearish in a memory-cyclical context.",
      stars: 2,
    },
    {
      rank: 9,
      ticker: "INTC",
      company: "Intel Corporation",
      price: "~$22",
      signal: "No Form 4 filings in 6-month window (Apr 23 \u2013 Oct 20, 2026). Given Intel's CEO transition (Pat Gelsinger \u2192 new leadership in 2024\u20132025) and foundry restructuring, insider silence\u2014no buys, no sells\u2014is notable. Check for SEC filings; may be in extended blackout.",
      lastInsiderBuy: "N/A",
      stillOpen: false,
      conviction: "MODERATE",
      thesis: "INTC's absence from insider tape during a period of massive strategic transition (foundry pivot, manufacturing ramp, cost cuts) is conspicuous. Either insiders are locked out (blackout) or avoiding public transactions amid uncertainty. No signal = neutral; remain vigilant for first insider buy post-blackout as potential contrarian indicator.",
      stars: 2,
    },
    {
      rank: 10,
      ticker: "QCOM",
      company: "Qualcomm Incorporated",
      price: "~$160",
      signal: "No Form 4 filings in 6-month window (Apr 23 \u2013 Oct 20, 2026). Absence of insider activity during a volatile handset / automotive / RF transition period is mildly concerning; no conviction signals.",
      lastInsiderBuy: "N/A",
      stillOpen: false,
      conviction: "MODERATE",
      thesis: "QCOM shows zero insider transaction filings in 6 months. Given QCOM's exposure to smartphone saturation, automotive ramp uncertainty, and China geopolitical risk, absence of insider buying is a neutral-to-mildly-bearish signal. Monitor for insider accumulation as a potential capitulation/reversal indicator.",
      stars: 2,
    },
  ],
  redFlags: [
    {
      ticker: "NVDA",
      company: "NVIDIA Corporation",
      severity: "AVOID",
      signal: "Director Mark A. Stevens liquidated 1.366M shares (~$300M, 09-18) in just two tranches (1.356M @ $219.72 and 10k @ $220.42). While not a full exit, this is the largest single directional sale in the 6-month dataset and occurred amid broad C-suite selling (CFO Kress: $5.2M, EVP Teter: $6.8M). Pattern suggests confidence waning at $220 levels; warrants close monitoring for further insider exits.",
    },
    {
      ticker: "AVGO",
      company: "Broadcom Inc.",
      severity: "AVOID",
      signal: "Director Henry Samueli executed a 673k-share liquidation (~$239M, 09-23) in 16 tranches across a $354\u2013$362 price band. While tranched execution is consistent with 10b5-1 plan, the scale ($239M) and concentration on a single date represent the second-largest insider dump in the window. Samueli simultaneously received 72.5k-share gift, suggesting partial estate planning; however, the magnitude of selling at current levels merits caution.",
    },
    {
      ticker: "AMD",
      company: "Advanced Micro Devices, Inc.",
      severity: "CAUTIOUS",
      signal: "CEO Lisa Su sold 69k shares (~$35.2M, 09-10) in 23 tranches across a $503\u2013$515 price band\u2014a material but not catastrophic reduction. Combined with CFO Hu's $7.6M sale (08-25) and EVP Papermaster's $9.6M sale (08-20), the aggregate C-suite liquidation is ~$52M over 2 months. All sales follow orderly 10b5-1 patterns (likely pre-planned), but cumulative magnitude and mid-year timing (not typical year-end bonus release) warrant monitoring for signs of reduced insider confidence.",
    },
  ],
};
