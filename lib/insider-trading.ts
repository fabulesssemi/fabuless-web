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
// Last run: 2026-11-10
export const insiderTradingData: InsiderTradingData = {
  generatedDate: "2026-11-10",
  lookbackWindow: "May 14 \u2013 Nov 10, 2026",
  executiveSummary: "This 6-month window shows a heavily negative insider tape dominated by executive and director liquidations with zero open-market P-coded purchases across the Fabuless 12. AMD's CEO (Lisa Su) executed a massive $45M+ directional sell-down on 2026-09-10, AVGO's founder (Henry Samueli) dumped $230M+ same-day on 2026-09-23, and NVDA's CFO (Colette Kress) unwound positions post-vesting. The absence of any insider P-buys at reasonable valuations signals caution across the complex; routine M and F transactions (option exercises and tax withholding) are noise, but the concentrated S-selling by C-suite officers is a material red flag.",
  watchlist: [
    {
      rank: 1,
      ticker: "NVDA",
      company: "NVIDIA Corporation",
      price: "~$205",
      signal: "CFO Colette Kress filed F-coded tax withholding forfeitures (40.7k shares @ $212.17 on 2026-09-16) followed by routine S-sales ($25.6M aggregate on 2026-09-17). No P-buys detected. General Counsel Timothy Teter also sold $5.8M same day. Director Tench received G-gifts (1M shares, likely acquisition bonus). Routine post-vesting liquidation, not directional conviction selling, but lacks insider conviction.",
      lastInsiderBuy: "N/A",
      stillOpen: false,
      conviction: "MODERATE",
      thesis: "No insider P-buys in window; post-vesting F/S activity is mechanical. Moderate stance reflects strong fundamental business but lack of officer-level conviction buying at ~$205.",
      stars: 2,
    },
    {
      rank: 2,
      ticker: "AMD",
      company: "Advanced Micro Devices",
      price: "~$165",
      signal: "CEO Lisa Su executed a massive liquidation: $45.3M in S-coded sales on 2026-09-10 (69 tranches, $503\u2013$515 per share). EVP Forrest Norrod followed with $12.8M in S-sales on same date and again on 2026-08-24 ($8.8M) and 2026-09-15 ($11.5M). CFO Jean Hu also sold $7.8M on 2026-08-25. Zero P-buys. All sales accompanied by routine M-coded option exercises (non-predictive). Cluster liquidation by multiple officers over 3-month period.",
      lastInsiderBuy: "N/A",
      stillOpen: false,
      conviction: "AVOID",
      thesis: "CEO-led and broad officer sell-off ($76M+ aggregate in 6 months) with zero offsetting P-buys signals loss of insider conviction. While 10b5-1 plans are normal, concentration and timing (amid elevated valuations) warrant caution.",
      stars: 1,
    },
    {
      rank: 3,
      ticker: "AVGO",
      company: "Broadcom Inc.",
      price: "~$245",
      signal: "Founder Henry Samueli executed one of the largest single-day insider liquidations on 2026-09-23: $230M+ in coordinated S-sales (16 tranches, $354\u2013$361 per share). Additional large blocks (186k, 230k, 85k shares) suggest pre-planned systematic exit. CFO and General Counsel filed routine F-coded forfeitures. No P-buys. Samueli retains ~35.9M shares post-sale but the sheer scale and coordination of this dump is extraordinary.",
      lastInsiderBuy: "N/A",
      stillOpen: false,
      conviction: "AVOID",
      thesis: "Founder liquidating $230M+ in single session at ~$356/share without any offsetting buy signals extreme loss of confidence. While retention of 35.9M shares limits severity, the opportunistic timing and magnitude warrant caution.",
      stars: 1,
    },
    {
      rank: 4,
      ticker: "MRVL",
      company: "Marvell Technology",
      price: "~$90",
      signal: "COO Chris Koopmans sold 10k shares ($1.87M) on 2026-11-02 at $186.97\u2014only S-transaction by an officer in window. Remaining activity is routine M/F (option exercises and tax withholding by multiple SVPs/EPs on 2026-10-15). Single small S-sale is not alarm-level, but combined with complete absence of P-buys, reflects neutral-to-cautious sentiment.",
      lastInsiderBuy: "N/A",
      stillOpen: false,
      conviction: "MODERATE",
      thesis: "No P-buys and isolated S-sale by COO suggest insiders are not building positions, but transaction size is modest and not part of cluster. Hold pending future conviction signals.",
      stars: 2,
    },
    {
      rank: 5,
      ticker: "TSMC",
      company: "Taiwan Semiconductor Manufacturing Company",
      price: "~$180",
      signal: "No Form 4 filings detected in SEC EDGAR window (May 14 \u2013 Nov 10, 2026). As a Taiwan-listed company with ADRs, TSMC insider filings are typically sparse or absent from SEC EDGAR.",
      lastInsiderBuy: "N/A",
      stillOpen: false,
      conviction: "MODERATE",
      thesis: "Lack of SEC EDGAR disclosure precludes insider signal analysis. Monitor Taiwan stock exchange filings or ADR holder disclosures for conviction signals.",
      stars: 2,
    },
    {
      rank: 6,
      ticker: "ASML",
      company: "ASML Holding N.V.",
      price: "~$730",
      signal: "No Form 4 filings detected in SEC EDGAR window. ASML is Euronext-listed (Amsterdam); insider trading disclosures are regulated by Euronext, not SEC EDGAR.",
      lastInsiderBuy: "N/A",
      stillOpen: false,
      conviction: "MODERATE",
      thesis: "Euronext-listed entity falls outside SEC EDGAR purview. Insider signals unavailable from this dataset; check Euronext AFM filings separately.",
      stars: 2,
    },
    {
      rank: 7,
      ticker: "ARM",
      company: "Arm Holdings plc",
      price: "~$140",
      signal: "No Form 4 filings detected in SEC EDGAR window. ARM is LSE-listed (London); insider disclosures governed by UK FCA regulations, not SEC.",
      lastInsiderBuy: "N/A",
      stillOpen: false,
      conviction: "MODERATE",
      thesis: "UK-listed entity outside SEC EDGAR scope. Insider signals not available in this dataset; monitor LSE RNS announcements for conviction signals.",
      stars: 2,
    },
    {
      rank: 8,
      ticker: "MU",
      company: "Micron Technology",
      price: "~$130",
      signal: "No Form 4 filings detected in SEC EDGAR window (May 14 \u2013 Nov 10, 2026). Despite Micron being SEC-listed, no insider trading activity was reported in this 6-month period.",
      lastInsiderBuy: "N/A",
      stillOpen: false,
      conviction: "MODERATE",
      thesis: "Absence of insider trading (P, S, or even routine M/F) over 6 months is neutral; suggests no clear conviction either direction from management.",
      stars: 2,
    },
    {
      rank: 9,
      ticker: "INTC",
      company: "Intel Corporation",
      price: "~$22",
      signal: "No Form 4 filings detected in SEC EDGAR window (May 14 \u2013 Nov 10, 2026). Intel is SEC-listed but reported no insider transactions in this 6-month lookback.",
      lastInsiderBuy: "N/A",
      stillOpen: false,
      conviction: "MODERATE",
      thesis: "Zero insider activity in 6 months amid turnaround narrative is notable but not directly bearish; may reflect blackout period or management lock-up post-strategy reset.",
      stars: 2,
    },
    {
      rank: 10,
      ticker: "QCOM",
      company: "Qualcomm Incorporated",
      price: "~$160",
      signal: "No Form 4 filings detected in SEC EDGAR window (May 14 \u2013 Nov 10, 2026). Qualcomm is SEC-listed but reported no insider transactions in this 6-month period.",
      lastInsiderBuy: "N/A",
      stillOpen: false,
      conviction: "MODERATE",
      thesis: "Absence of insider activity (buy or sell) suggests management is neither building nor liquidating, consistent with stable operational outlook but no conviction signal.",
      stars: 2,
    },
  ],
  redFlags: [
    {
      ticker: "AMD",
      company: "Advanced Micro Devices",
      severity: "STRONG AVOID",
      signal: "CEO Lisa Su executed $45.3M in coordinated S-sales on 2026-09-10 across 69 tranches ($503\u2013$515/share). EVP Norrod followed with $12.8M same day, $8.8M on 2026-08-24, and $11.5M on 2026-09-15. CFO Hu sold $7.8M on 2026-08-25. Zero offsetting P-buys. Aggregate officer liquidation exceeds $76M over 3 months with no conviction buying. Cluster pattern with CEO leadership suggests loss of insider confidence.",
    },
    {
      ticker: "AVGO",
      company: "Broadcom Inc.",
      severity: "STRONG AVOID",
      signal: "Founder Henry Samueli dumped $230M+ in single coordinated session on 2026-09-23 (16 tranches, $354\u2013$361/share), including three massive block sales (186k, 230k, 85k shares). Zero P-buys in entire window. While Samueli retains 35.9M shares post-sale, the timing, scale, and coordination of this liquidation at peak valuation represent an extraordinary loss-of-confidence signal unprecedented in this 6-month dataset.",
    },
    {
      ticker: "NVDA",
      company: "NVIDIA Corporation",
      severity: "CAUTIOUS",
      signal: "CFO Colette Kress filed F-coded tax withholding forfeitures (40.7k shares @ $212.17 on 2026-09-16), followed by $25.6M in S-sales on 2026-09-17 across 3 tranches. General Counsel Timothy Teter also sold $5.8M same period ($222\u2013$224/share). While post-vesting liquidation is routine and not directional, the concentration and officer-level participation warrant monitoring for any shift toward larger discretionary sales.",
    },
  ],
};
