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
// Last run: 2026-10-06
export const insiderTradingData: InsiderTradingData = {
  generatedDate: "2026-10-06",
  lookbackWindow: "Apr 09 \u2013 Oct 06, 2026",
  executiveSummary: "Insider tape is dominated by C-suite and officer sales across NVDA, AMD, and AVGO during August\u2013September 2026, consistent with typical post-equity-vesting liquidation patterns and likely 10b5-1 trading plans. TSM shows rare open-market P-coded buys by multiple VPs (small dollar amounts, ~$3k\u2013$4k each), suggesting modest confidence but insufficient to offset broader sector selling pressure. No significant VERY HIGH conviction signals detected; the absence of meaningful P-buys among mega-cap semiconductors warrants caution despite \"no red flag\" fundamentals.",
  watchlist: [
    {
      rank: 1,
      ticker: "TSM",
      company: "Taiwan Semiconductor Manufacturing Company",
      price: "~$180",
      signal: "Multiple VP-level open-market P-coded purchases on 2026-09-07: Wu Yi-Huang (40 shares @ $76.20), Yoo Chue-San (53 shares @ $76.20), Yeap Choh Fei (54 shares @ $76.20), Zhang Kevin Xiaoqiang (incomplete filing). Rare insider P-buys in the Fabuless 12 during this window; suggests operational confidence despite modest dollar amounts.",
      lastInsiderBuy: "$4k @ $76.20 (Sep 2026)",
      stillOpen: true,
      conviction: "MOD-HIGH",
      thesis: "Multiple insiders deploying personal capital during market volatility signals conviction in TSM's fundamental positioning. While dollar amounts are small, the pattern of coordinated VP-level buying is atypical and noteworthy in a window dominated by sales.",
      stars: 3,
    },
    {
      rank: 2,
      ticker: "NVDA",
      company: "NVIDIA Corporation",
      price: "~$205",
      signal: "Heavy S-coded sales by multiple officers in mid-to-late September (Teter, Kress, CFO Kress ~$7.6M+ liquidated; Director Stevens ~$300M+ on 2026-09-18). Routine F-coded tax withholdings on vesting (Huang, Kress, Teter, Shoquist, Gawel ~$9.7M aggregate on 2026-09-16). CEO Huang received large gift of 438k shares on 2026-09-17 (non-cash). No P-buy activity.",
      lastInsiderBuy: "N/A",
      stillOpen: false,
      conviction: "MODERATE",
      thesis: "Sales appear algorithmic and tied to vesting/10b5-1 plans rather than conviction-based exits. The absence of offsetting P-buys and Stevens' $300M+ liquidation merit monitoring but do not trigger red flag severity given typical equity-comp mechanics at mega-cap scale.",
      stars: 2,
    },
    {
      rank: 3,
      ticker: "AMD",
      company: "Advanced Micro Devices, Inc.",
      price: "~$165",
      signal: "CEO Lisa Su sold ~73k shares across two tranches (2026-09-10: ~$10.2M; 2026-08-18: ~$4.7M). EVP/GM Norrod exercised options and sold ~16k shares combined (2026-09-15 & 2026-08-24 tranches, ~$4.1M). CFO Hu sold ~11.4k shares (2026-08-25). CTO Papermaster gifted 25k shares then sold ~28.8k shares (2026-08-20, ~$8.8M). No P-buy activity.",
      lastInsiderBuy: "N/A",
      stillOpen: false,
      conviction: "MODERATE",
      thesis: "Consistent pattern of option-exercise-and-sell across multiple officers suggests routine equity rebalancing and tax planning rather than loss of confidence. CEO still retains ~3M+ shares. Absence of P-buys limits positive signal, but no alarming concentration of distressed selling.",
      stars: 2,
    },
    {
      rank: 4,
      ticker: "AVGO",
      company: "Broadcom Inc.",
      price: "~$245",
      signal: "Director Samueli executed massive S-tranche on 2026-09-23: 16 tranches totaling ~570k shares (~$202M notional) plus gift of 72.5k shares. Officer Brazeal sold 50k shares combined (2026-07-10 & 2026-07-08, ~$19.5M). Officer O'Toole and Brazeal underwent routine F-coded tax withholding (2026-09-15). No P-buy activity.",
      lastInsiderBuy: "N/A",
      stillOpen: false,
      conviction: "MODERATE",
      thesis: "Samueli's $202M liquidation is largest by absolute dollars in the window but appears to be pre-announced estate/diversification plan given the multi-tranche format and concurrent gift. Routine tax withholdings and sustained holdings by other officers do not suggest systemic loss of confidence.",
      stars: 2,
    },
    {
      rank: 5,
      ticker: "MRVL",
      company: "Marvell Technology, Inc.",
      price: "~$90",
      signal: "CEO Murphy sold 15k shares total (2026-09-15 & 2026-08-17, ~$3.4M). President/COO Koopmans sold 30k shares across three tranches (2026-10-01, 2026-09-01, 2026-08-03, ~$6.5M). CFO Durn and SVP Scarpulla executed options and tax-withheld (routine M/F). VP Bharathi exercised multiple options and tax-withheld, then sold 9k shares (2026-07-16, ~$1.8M). No P-buy activity.",
      lastInsiderBuy: "N/A",
      stillOpen: false,
      conviction: "MODERATE",
      thesis: "Koopmans' quarterly $2\u20132.6M sell-offs and Murphy's periodic trimming are consistent with rule 10b5-1 plan mechanics. No panic selling or concentrated exits by single insider. Absence of P-buys prevents higher conviction, but pattern does not trigger red flag.",
      stars: 2,
    },
    {
      rank: 6,
      ticker: "ASML",
      company: "ASML Holding N.V.",
      price: "~$730",
      signal: "No Form 4 filings detected in the 6-month window (Apr 09 \u2013 Oct 06, 2026). ASML insiders either did not trade or filings are not yet available in the dataset provided.",
      lastInsiderBuy: "N/A",
      stillOpen: false,
      conviction: "MODERATE",
      thesis: "Absence of insider activity does not imply weakness; ASML's U.S. cross-listing and ADR mechanics may limit Form 4 reporting frequency. Monitor for future filings, but current silence is neutral rather than negative.",
      stars: 2,
    },
    {
      rank: 7,
      ticker: "ARM",
      company: "Arm Holdings plc",
      price: "~$140",
      signal: "No Form 4 filings detected in the 6-month window. ARM insiders either did not trade or filings are not yet included in the dataset.",
      lastInsiderBuy: "N/A",
      stillOpen: false,
      conviction: "MODERATE",
      thesis: "Post-IPO trading lockup or limited insider trading activity is not uncommon in newly public or recently listed companies. Lack of data does not indicate a red flag; monitor for future insider activity once lockup or trading windows open.",
      stars: 2,
    },
    {
      rank: 8,
      ticker: "MU",
      company: "Micron Technology, Inc.",
      price: "~$130",
      signal: "No Form 4 filings detected in the 6-month window. Micron insiders either did not trade or filings are delayed in the dataset.",
      lastInsiderBuy: "N/A",
      stillOpen: false,
      conviction: "MODERATE",
      thesis: "Absence of insider activity in a major memory player during a cyclical upswing is noteworthy but not necessarily bearish. May reflect concentrated equity awards (vesting infrequently) or limited insider trading windows. Await future filings for conviction signals.",
      stars: 2,
    },
    {
      rank: 9,
      ticker: "INTC",
      company: "Intel Corporation",
      price: "~$22",
      signal: "No Form 4 filings detected in the 6-month window. Intel insiders either did not trade or filings are not yet available in the dataset provided.",
      lastInsiderBuy: "N/A",
      stillOpen: false,
      conviction: "MODERATE",
      thesis: "Intel's trading lockup, restricted officer trading windows, and potential reputational sensitivities around insider trading during recent operational challenges may limit observable Form 4 activity. Absence of data is neutral; requires future filings for directional signals.",
      stars: 2,
    },
    {
      rank: 10,
      ticker: "QCOM",
      company: "Qualcomm Incorporated",
      price: "~$160",
      signal: "No Form 4 filings detected in the 6-month window. Qualcomm insiders either did not trade or filings are not yet included in the dataset.",
      lastInsiderBuy: "N/A",
      stillOpen: false,
      conviction: "MODERATE",
      thesis: "Qualcomm's large shareholder base and potential trading blackout windows may result in infrequent insider filings. Current silence does not indicate weakness; monitor for future activity once trading windows reopen.",
      stars: 2,
    },
  ],
  redFlags: [
    {
      ticker: "AVGO",
      company: "Broadcom Inc.",
      severity: "CAUTIOUS",
      signal: "Director Henry Samueli executed 570k+ share liquidation (~$202M) on 2026-09-23 in 16 tranches, accompanied by 72.5k share gift. While multi-tranche format and gift suggest pre-planned estate diversification (not emergency exit), the scale and timing warrant close monitoring of quarterly guidance and competitive positioning. No concurrent insider P-buys to offset conviction.",
    },
  ],
};
