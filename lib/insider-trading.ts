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
// Last run: 2026-10-13
export const insiderTradingData: InsiderTradingData = {
  generatedDate: "2026-10-13",
  lookbackWindow: "Apr 16 \u2013 Oct 13, 2026",
  executiveSummary: "Insider tape is dominated by massive C-suite selling in NVDA, AMD, AVGO, and MRVL during August\u2013September 2026, suggesting profit-taking or pre-planned 10b5-1 liquidations at market peaks. TSM stands out with multiple officers executing small open-market P-coded purchases (Oct 7, 2026), signaling bottom-fishing conviction despite modest notional values\u2014a rare bullish datapoint in an otherwise bearish window. No major insider accumulation detected across the Fabuless 12.",
  watchlist: [
    {
      rank: 1,
      ticker: "TSM",
      company: "Taiwan Semiconductor Manufacturing Company",
      price: "~$180",
      signal: "8 officers/executives made open-market P-coded purchases on 2026-10-07 at $79.39/share, totaling ~$39k across 489 shares. CEO Wei Che-Chia purchased 144 shares ($11.4k), followed by SVPs and VPs in tight sequence. This is the ONLY material P-buy activity in the entire 6-month window\u2014all other major insiders were net sellers. Despite small absolute size, the synchronized multi-executive buying at a single price point signals conviction and contrarian positioning.",
      lastInsiderBuy: "$39k @ $79.39 (Oct 2026)",
      stillOpen: true,
      conviction: "MOD-HIGH",
      thesis: "Multiple officers buying simultaneously at a single price suggests they view current levels as attractive entry points. TSM's modest P-buy activity, while small-dollar, contrasts sharply with the heavy selling tape at rival fabs (NVDA, AVGO) and suggests management confidence in TSM's valuation or demand outlook.",
      stars: 3,
    },
    {
      rank: 2,
      ticker: "NVDA",
      company: "NVIDIA Corporation",
      price: "~$205",
      signal: "Heavy officer/director selling Sep 16\u2013Sep 21, 2026: CFO Kress Colette sold ~35k shares ($4.6M total); EVP Operations Shoquist Debora sold 35k shares via F-forfeitures; CEO Huang Jen-Hsun sold 45.7k shares via F-forfeitures (tax withholding). Director Stevens Mark A dumped 1.366M shares Sep 18 (~$298M), a material reduction. Multiple S-codes by EVP Teter (26k shares, ~$5.8M total) and CEO Huang (438k share gift Sep 17). Massive selling cluster suggests year-end tax planning or profit-taking at $212\u2013$223 peak.",
      lastInsiderBuy: "N/A",
      stillOpen: false,
      conviction: "CAUTIOUS",
      thesis: "While F-forfeitures are routine, the exceptional volume and C-suite coordination (CFO + EVPs + CEO + major director all selling within 5 days) at near-peak prices warrants caution. No offsetting insider buys detected; this is net liquidation at $220 levels.",
      stars: 2,
    },
    {
      rank: 3,
      ticker: "AMD",
      company: "Advanced Micro Devices, Inc.",
      price: "~$165",
      signal: "Massive director/officer liquidation Aug 18\u2013Sep 10, 2026. CEO Lisa Su sold 72k+ shares across multiple tranches ($3M+ total) Aug 18. CFO Jean Hu sold 8.9k shares (~$4.2M total) Aug 25. EVP Mark Papermaster sold 28.8k shares (~$13.8M total) Aug 20. Chief Technology Officer exercised options (M-code) and immediately dumped shares. Director Ryan Timothy received option award (A-code). Net selling tone; no P-buys detected.",
      lastInsiderBuy: "N/A",
      stillOpen: false,
      conviction: "CAUTIOUS",
      thesis: "CEO Su's sustained selling across multiple dates and price points ($475\u2013$515), combined with CFO and CTO liquidations, suggests broad-based profit-taking at elevated valuations. The sheer scale ($21M+ officer selling) and lack of any offsetting insider purchases is a yellow flag despite likely 10b5-1 plan mechanics.",
      stars: 2,
    },
    {
      rank: 4,
      ticker: "AVGO",
      company: "Broadcom Inc.",
      price: "~$245",
      signal: "Director Henry Samueli executed a massive two-day liquidation Sep 23, 2026: 677k shares across ~16 tranches at $354.71\u2013$361.79/share, totaling ~$240M. This represents a material reduction of Samueli's stake (from ~36.3M to ~35.8M shares). Officer Mark Brazeal sold 50k shares Jul 8\u2013Jul 10 (~$19.5M total) at $379\u2013$401. No P-buy activity detected. Samueli's scale is exceptionally large for a single event.",
      lastInsiderBuy: "N/A",
      stillOpen: false,
      conviction: "CAUTIOUS",
      thesis: "Samueli's $240M+ two-day exit at $354\u2013$361 is unusual in velocity and concentration, even if he retains >29.9M shares. This level of selling by a founder/major shareholder could signal peak valuation concerns or estate/personal cash needs. However, Samueli's status as founder suggests the sale may be pre-planned diversification rather than loss of confidence.",
      stars: 2,
    },
    {
      rank: 5,
      ticker: "MRVL",
      company: "Marvell Technology, Inc.",
      price: "~$90",
      signal: "CEO Matthew Murphy sold 7.5k shares twice (Aug 17 @ $236, Sep 15 @ $223.39 = $3.4M total). COO Chris Koopmans executed four separate S-sales over 2 months (Aug 3, Sep 1, Oct 1) totaling 30k shares at prices ranging $180.50\u2013$262 (~$6.5M). CFO Daniel Durn exercised options (M-code) and dumped shares via F-forfeiture. No P-buy activity. Scattered selling pattern suggests steady liquidation rather than coordinated cliff selling.",
      lastInsiderBuy: "N/A",
      stillOpen: false,
      conviction: "MODERATE",
      thesis: "Marvell's insider selling is less aggressive than NVDA/AMD/AVGO in velocity and absolute dollars, but the pattern is consistently net-negative. CEO + COO combined sales exceed $9M with no buys. This warrants monitoring for momentum but does not yet signal distress.",
      stars: 2,
    },
    {
      rank: 6,
      ticker: "QCOM",
      company: "Qualcomm Incorporated",
      price: "~$160",
      signal: "No Form 4 filings found in the Apr 16 \u2013 Oct 13, 2026 window. No insider trading activity (P, S, F, M, A, or G transactions) reported for this period.",
      lastInsiderBuy: "N/A",
      stillOpen: false,
      conviction: "MODERATE",
      thesis: "Absence of insider trading activity is neutral\u2014could reflect blackout windows, minimal equity incentive vesting, or management confidence. Lack of data does not warrant conviction either way. Monitor for future filings.",
      stars: 2,
    },
    {
      rank: 7,
      ticker: "INTC",
      company: "Intel Corporation",
      price: "~$22",
      signal: "No Form 4 filings found in the Apr 16 \u2013 Oct 13, 2026 window. No insider trading activity reported.",
      lastInsiderBuy: "N/A",
      stillOpen: false,
      conviction: "MODERATE",
      thesis: "Silent insider tape could reflect extreme market volatility in Intel stock, management blackouts, or depressed morale limiting option exercises. Absence of conviction either direction. Reputationally troubled; absence of insider buys in a turnaround narrative is mildly concerning.",
      stars: 2,
    },
    {
      rank: 8,
      ticker: "MU",
      company: "Micron Technology, Inc.",
      price: "~$130",
      signal: "No Form 4 filings found in the Apr 16 \u2013 Oct 13, 2026 window. No insider trading activity reported.",
      lastInsiderBuy: "N/A",
      stillOpen: false,
      conviction: "MODERATE",
      thesis: "Absence of insider activity across a 6-month window in the DRAM/NAND cycle is neutral. No data to support bullish or bearish conviction. Micron's leadership may be subject to trading blackouts or scheduled buy plans not yet disclosed.",
      stars: 2,
    },
    {
      rank: 9,
      ticker: "ARM",
      company: "Arm Holdings plc",
      price: "~$140",
      signal: "Form 4 filing date 2026-09-23 with Officer Jason Child (Chief Financial Officer) truncated mid-description in the raw data. No transaction details provided. Insufficient information to assess insider sentiment.",
      lastInsiderBuy: "N/A",
      stillOpen: false,
      conviction: "MODERATE",
      thesis: "Data incomplete; cannot meaningfully assess ARM's insider tape from this filing. Requires manual review of full Form 4 filings on SEC EDGAR for accurate characterization.",
      stars: 2,
    },
    {
      rank: 10,
      ticker: "SK Hynix",
      company: "SK Hynix Inc. (000660.KS)",
      price: "N/A (South Korean ADR; limited US SEC filings)",
      signal: "SK Hynix is a South Korean-domiciled company with limited Form 4 filing presence on US SEC EDGAR. Insider transactions are primarily disclosed on Korean stock exchange (KRX) and via Korean financial regulators, not US SEC.",
      lastInsiderBuy: "N/A",
      stillOpen: false,
      conviction: "MODERATE",
      thesis: "SK Hynix's insider activity is outside the scope of this US SEC Form 4 analysis. Recommend consulting KRX filings and Korean financial press for insider sentiment. Included for Fabuless 12 completeness but not actionable from US SEC data.",
      stars: 2,
    },
  ],
  redFlags: [
    {
      ticker: "NVDA",
      company: "NVIDIA Corporation",
      severity: "CAUTIOUS",
      signal: "Director Mark Stevens liquidated 1.366M shares on 2026-09-18 (~$298M total value), reducing his stake from ~2.35M to ~970k shares\u2014a 59% reduction. Combined with CFO Kress Colette's 35k share dump (~$6.6M) and CEO Huang's 45.7k F-forfeitures, this represents a large, coordinated exit by multiple senior insiders at $212\u2013$220 price levels (near 52-week highs at the time). While director selling can reflect portfolio rebalancing, the volume and timing warrant monitoring for forward guidance or macro headwinds.",
    },
    {
      ticker: "AVGO",
      company: "Broadcom Inc.",
      severity: "CAUTIOUS",
      signal: "Founder/Director Henry Samueli sold 677k shares in a single 16-tranche event on 2026-09-23 at $354.71\u2013$361.79, totaling ~$240M and reducing his stake by ~1.5%. While Samueli retained >29.9M shares, the exceptional sale velocity and scale is unusual. Could signal peak valuation concerns, estate planning, or portfolio diversification, but warrants scrutiny given his founding status and historical long-term holding patterns.",
    },
    {
      ticker: "AMD",
      company: "Advanced Micro Devices, Inc.",
      severity: "AVOID",
      signal: "CEO Lisa Su executed 72k+ shares of open-market selling across 13 tranches (Aug 18, 2026) at $475\u2013$515/share (~$33M total). Simultaneously, CFO Jean Hu sold 8.9k shares (~$4.2M), CTO Mark Papermaster sold 28.8k shares (~$13.8M), and EVP Forrest Norrod exercised options then dumped 10.9k shares (~$4.9M). This represents >$55M+ in net executive selling within a compressed 3-week window (Aug 18\u2013Sep 15) with zero offsetting insider purchases. The breadth (4+ C-suite officers), scale, and absence of buys suggests broad-based profit-taking or loss of confidence at elevated valuations.",
    },
  ],
};
