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
// Last run: 2026-06-15
export const insiderTradingData: InsiderTradingData = {
  generatedDate: "2026-06-15",
  lookbackWindow: "Dec 17 \u2013 Jun 15, 2026",
  executiveSummary: "The semiconductor insider tape shows limited conviction buying. AVGO stands out with a $374k director P-buy in June that remains open. TSM shows coordinated but very small P-buys from multiple executives including CEO. AMD and ARM show concerning officer selling patterns, though AMD's CEO sales appear 10b5-1 routine. Most names show only routine compensation mechanics (A/F/M codes) with no meaningful open-market purchases.",
  watchlist: [
    {
      rank: 1,
      ticker: "AVGO",
      company: "Broadcom Inc.",
      price: "~$245",
      signal: "Director Harry L. You made a $374k open-market purchase on Jun 11, 2026 at $373.57/share, acquiring 1,000 shares. No subsequent sale filed\u2014position remains open. This is the only meaningful P-buy in the large-cap semi space this window.",
      lastInsiderBuy: "$374k @ $373.57 (Jun 2026)",
      stillOpen: true,
      conviction: "HIGH",
      thesis: "Director conviction buy at elevated prices suggests confidence in forward fundamentals; only actionable P-buy signal in the Fabuless 12 this period.",
      stars: 4,
    },
    {
      rank: 2,
      ticker: "TSM",
      company: "Taiwan Semiconductor Manufacturing Co.",
      price: "~$180",
      signal: "Eight executives including Chairman/CEO Wei Che-Chia made coordinated P-buys on Jun 5, 2026 at $76.01/ADR. Amounts are small ($3k-$11k each) but breadth across C-suite is notable. CEO bought 150 shares (~$11.4k). All positions remain open.",
      lastInsiderBuy: "$11k @ $76.01 (Jun 2026)",
      stillOpen: true,
      conviction: "MOD-HIGH",
      thesis: "Coordinated buying from 8 executives including CEO signals internal confidence; small dollar amounts temper conviction but breadth is meaningful.",
      stars: 3,
    },
    {
      rank: 3,
      ticker: "NVDA",
      company: "NVIDIA Corporation",
      price: "~$205",
      signal: "No P-coded purchases in window. Director Mark Stevens sold $238M worth over multiple transactions in Mar-Jun 2026. Other directors (Neal, Dabiri, Shah) also sold smaller amounts. Activity is A/F/S codes only\u2014routine compensation and diversification.",
      lastInsiderBuy: "N/A",
      stillOpen: false,
      conviction: "MODERATE",
      thesis: "No insider buying signal; heavy director selling likely reflects diversification at elevated valuations rather than fundamental concern given large retained positions.",
      stars: 2,
    },
    {
      rank: 4,
      ticker: "MRVL",
      company: "Marvell Technology Inc.",
      price: "~$90",
      signal: "No P-coded purchases in window. Activity limited to M/F codes (option exercises, tax withholding). President/COO Koopmans sold $2M on Jun 1 following vesting. CEO Murphy had $11.6M tax withholding on vesting. Routine compensation mechanics.",
      lastInsiderBuy: "N/A",
      stillOpen: false,
      conviction: "MODERATE",
      thesis: "Clean tape with no alarming sales clusters; absence of P-buys leaves no bullish signal but no red flags either.",
      stars: 2,
    },
    {
      rank: 5,
      ticker: "ASML",
      company: "ASML Holding N.V.",
      price: "~$730",
      signal: "No Form 4 filings found in the 6-month window. As a Netherlands-domiciled company, ASML insiders are not required to file Form 4 with SEC. Cannot assess insider sentiment from EDGAR data.",
      lastInsiderBuy: "N/A",
      stillOpen: false,
      conviction: "MODERATE",
      thesis: "No SEC insider data available; fundamental analysis and European regulatory filings required for insider sentiment assessment.",
      stars: 2,
    },
    {
      rank: 6,
      ticker: "MU",
      company: "Micron Technology Inc.",
      price: "~$130",
      signal: "Very limited Form 4 data in window. Only filing shows a small A-coded award (63 shares) to Alexis Bjorlin in June. No P-buys, no concerning S-sales. Insufficient data for strong signal.",
      lastInsiderBuy: "N/A",
      stillOpen: false,
      conviction: "MODERATE",
      thesis: "Minimal insider activity provides no actionable signal; neutral stance warranted pending more data.",
      stars: 2,
    },
    {
      rank: 7,
      ticker: "INTC",
      company: "Intel Corporation",
      price: "~$22",
      signal: "No Form 4 data provided in this filing window. Cannot assess insider sentiment. Stock has been under significant pressure; absence of visible insider buying is notable.",
      lastInsiderBuy: "N/A",
      stillOpen: false,
      conviction: "MODERATE",
      thesis: "No insider data to analyze; turnaround story requires fundamental catalyst rather than insider signal confirmation.",
      stars: 2,
    },
    {
      rank: 8,
      ticker: "QCOM",
      company: "Qualcomm Inc.",
      price: "~$160",
      signal: "No Form 4 data provided in this filing window. Cannot assess insider sentiment from available data.",
      lastInsiderBuy: "N/A",
      stillOpen: false,
      conviction: "MODERATE",
      thesis: "No insider activity data available for analysis; rely on fundamental thesis for positioning.",
      stars: 2,
    },
    {
      rank: 9,
      ticker: "AMD",
      company: "Advanced Micro Devices Inc.",
      price: "~$165",
      signal: "CEO Lisa Su sold ~$84M worth of stock across May-June 2026 in programmatic tranches (likely 10b5-1). Director Denzel sold $5.5M. CTO Papermaster exercised options and same-day sold $2.6M. EVP Norrod exercised and sold $7.4M. Heavy but appears routine.",
      lastInsiderBuy: "N/A",
      stillOpen: false,
      conviction: "CAUTIOUS",
      thesis: "Large CEO selling volume warrants monitoring despite likely being pre-planned 10b5-1; no offsetting P-buys from any insider dampens sentiment.",
      stars: 1,
    },
    {
      rank: 10,
      ticker: "ARM",
      company: "Arm Holdings plc",
      price: "~$140",
      signal: "Multiple officers aggressively selling: Chief Commercial Officer Abbey sold $8.5M across 5 transactions in May-June. Chief Legal Officer Collins liquidated entire position ($8.8M). Chief People Officer Eaton sold to zero ($2.3M). Chief Accounting Officer Bartels sold $4.4M. Cluster selling pattern.",
      lastInsiderBuy: "N/A",
      stillOpen: false,
      conviction: "AVOID",
      thesis: "Four officers selling with two liquidating to zero shares is a strong negative signal; avoid until insider selling subsides and fundamentals clarify.",
      stars: 1,
    },
  ],
  redFlags: [
    {
      ticker: "ARM",
      company: "Arm Holdings plc",
      severity: "STRONG AVOID",
      signal: "Cluster S-selling from 4 officers in May-June 2026 totaling ~$24M. Chief Legal Officer Collins and Chief People Officer Eaton both sold to zero shares remaining. Chief Commercial Officer Abbey sold repeatedly across 5 separate filings. Pattern suggests coordinated insider distribution.",
    },
    {
      ticker: "AMD",
      company: "Advanced Micro Devices Inc.",
      severity: "CAUTIOUS",
      signal: "CEO Lisa Su sold ~$84M in stock over May-June 2026 across dozens of tranches. While likely 10b5-1 pre-planned, the volume is notable. Combined with CTO and EVP same-day option exercises and sales, the tape leans negative despite no cluster pattern.",
    },
  ],
};
