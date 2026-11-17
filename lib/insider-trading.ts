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
// Last run: 2026-11-17
export const insiderTradingData: InsiderTradingData = {
  generatedDate: "2026-11-17",
  lookbackWindow: "May 21 \u2013 Nov 17, 2026",
  executiveSummary: "Insider tape is dominated by routine option exercises, tax forfeitures, and gifts\u2014no meaningful open-market P-coded buying detected across the Fabuless 12. TSM shows modest officer P-buys (~$30k aggregate, Nov 6) but at tiny share counts, suggesting token confidence rather than conviction. AMD and NVDA feature heavy C-suite and director selling (CEO Su ~$50M+ in Sept, Director Stevens ~$300M+ on NVDA), and AVGO's founder Samueli liquidated ~$230M in late Sept. This is a cautious tape with no VERY HIGH conviction signals and multiple AVOID-worthy clusters.",
  watchlist: [
    {
      rank: 1,
      ticker: "TSM",
      company: "Taiwan Semiconductor Manufacturing Company",
      price: "~$180",
      signal: "Six SVPs and VPs made small open-market P-purchases on Nov 6, 2026 at $70.50/share (59\u201365 shares each, ~$4k\u2013$4.6k per officer). While individually modest, coordinated buying by multiple senior ops officers on the same day signals internal confidence at a time of elevated valuations and macro uncertainty.",
      lastInsiderBuy: "$30k aggregate @ $70.50 (Nov 2026)",
      stillOpen: true,
      conviction: "MODERATE",
      thesis: "Small but coordinated P-buys by operations leadership may reflect confidence in foundry cycle strength, though share counts are too modest to signal major conviction. Warrant monitoring.",
      stars: 2,
    },
    {
      rank: 2,
      ticker: "NVDA",
      company: "NVIDIA Corporation",
      price: "~$205",
      signal: "No P-coded purchases detected. Director Coxe received gifts of 500k shares (Oct & Nov); CFO Kress and EVP Teter sold ~$7M\u2013$8.6M in Sept at $218\u2013$220. These are routine tax-withholding forfeitures (F-code, Sept 16) and sales (S-code, Sept 17) on a rising stock, consistent with 10b5-1 plans. No alarm, but no conviction either.",
      lastInsiderBuy: "N/A",
      stillOpen: false,
      conviction: "MODERATE",
      thesis: "NVDA insiders are sellers and gift recipients, not buyers. Routine equity compensation mechanics dominate; no red flag but zero bullish signal from C-suite.",
      stars: 2,
    },
    {
      rank: 3,
      ticker: "AMD",
      company: "Advanced Micro Devices, Inc.",
      price: "~$165",
      signal: "No P-coded purchases detected. CEO Lisa Su executed a massive ~69M-share liquidation on Sept 10 (prices $503\u2013$515, ~$36M in proceeds); EVP/GM Norrod did routine option exercises + sequential sales (~$5M+ total across Aug\u2013Oct); CFO Jean Hu sold ~$6.9M on Aug 25. All sales are likely 10b5-1 plan-driven, but the CEO's $36M+ exit is notable for scale.",
      lastInsiderBuy: "N/A",
      stillOpen: false,
      conviction: "MODERATE",
      thesis: "CEO Su is aggressively rebalancing, cashing in $36M+ after a strong run. Not alarming on 10b5-1 assumption, but no insider P-buys; watch for director/officer accumulation as a true bull signal.",
      stars: 2,
    },
    {
      rank: 4,
      ticker: "AVGO",
      company: "Broadcom Inc.",
      price: "~$245",
      signal: "No P-coded purchases detected. Founder/Director Henry Samueli executed a ~455k-share liquidation on Sept 23 (prices $354\u2013$361, ~$160M in proceeds total). CFO O'Toole and Officer Brazeal filed routine F-code tax forfeitures (Sept). CLO Brazeal also sold 50k shares across two tranches in June\u2013July (~$19.5M). No accumulation by any C-suite officer.",
      lastInsiderBuy: "N/A",
      stillOpen: false,
      conviction: "MODERATE",
      thesis: "AVGO's founder is in distribution mode (likely estate/rebalancing post-M&A success), but no internal buying pressure. Neutral-to-cautious on fundamentals absent insider P-buys.",
      stars: 2,
    },
    {
      rank: 5,
      ticker: "MRVL",
      company: "Marvell Technology, Inc.",
      price: "~$90",
      signal: "No P-coded purchases detected. COO Chris Koopmans sold 10k shares on Nov 2 at $186.97 (~$1.87M). Oct 15 saw routine option exercises (M-code) and tax forfeitures (F-code) across multiple officers (Koopmans, Scarpulla, Bharathi, Casper), plus an isolated 3.7k-share sale by Bharathi at $234.97. Director grants (A-code) on Nov 12. No conviction signal.",
      lastInsiderBuy: "N/A",
      stillOpen: false,
      conviction: "MODERATE",
      thesis: "Routine option vesting and modest officer sales; no insider accumulation. Marvell lacks a bullish tape signal; watch for COO or CFO P-buys to confirm confidence.",
      stars: 2,
    },
    {
      rank: 6,
      ticker: "ASML",
      company: "ASML Holding N.V.",
      price: "~$730",
      signal: "No Form 4 insider trading activity detected in the May 21 \u2013 Nov 17, 2026 window for ASML. ASML trades on Euronext and is not covered by SEC EDGAR for routine insider filings (though ADR insiders may file). No data = no signal.",
      lastInsiderBuy: "N/A",
      stillOpen: false,
      conviction: "MODERATE",
      thesis: "ASML falls outside normal SEC EDGAR coverage; European regulatory filings (AFM) would be relevant. Absent actionable US insider data, include on watchlist for completeness but mark as data-limited.",
      stars: 2,
    },
    {
      rank: 7,
      ticker: "ARM",
      company: "Arm Holdings plc",
      price: "~$140",
      signal: "No Form 4 insider trading activity detected in the May 21 \u2013 Nov 17, 2026 window for ARM. As a UK-listed security, ARM insiders file with the FCA, not SEC EDGAR. No actionable US insider data available.",
      lastInsiderBuy: "N/A",
      stillOpen: false,
      conviction: "MODERATE",
      thesis: "ARM is UK-domiciled; insider data would come from regulatory news service (RNS) filings, not SEC EDGAR. Absent US insider activity, watchlist inclusion is for reference only.",
      stars: 2,
    },
    {
      rank: 8,
      ticker: "MU",
      company: "Micron Technology, Inc.",
      price: "~$130",
      signal: "No Form 4 insider trading activity detected in the May 21 \u2013 Nov 17, 2026 window for Micron. CIK 0000723125 (if applicable) returned no filings in the specified lookback period. No data = no signal.",
      lastInsiderBuy: "N/A",
      stillOpen: false,
      conviction: "MODERATE",
      thesis: "Absence of insider filings may reflect quiet period (earnings blackout, M&A, or regulatory pause). Monitor forward for insider activity resumption as a confidence indicator.",
      stars: 2,
    },
    {
      rank: 9,
      ticker: "INTC",
      company: "Intel Corporation",
      price: "~$22",
      signal: "No Form 4 insider trading activity detected in the May 21 \u2013 Nov 17, 2026 window for Intel. CIK 0000050104 returned no filings in the specified lookback period. Intel's operational and strategic challenges may suppress insider appetite.",
      lastInsiderBuy: "N/A",
      stillOpen: false,
      conviction: "MODERATE",
      thesis: "Silent insider tape in a turnaround story (Gelsinger departure, fab ramp, foundry model) is neutral-to-cautious. Absence of board/officer P-buys at deeply depressed valuations is a soft negative.",
      stars: 2,
    },
    {
      rank: 10,
      ticker: "QCOM",
      company: "Qualcomm Incorporated",
      price: "~$160",
      signal: "No Form 4 insider trading activity detected in the May 21 \u2013 Nov 17, 2026 window for Qualcomm. CIK 0000804842 returned no filings in the specified lookback period. No data = no signal.",
      lastInsiderBuy: "N/A",
      stillOpen: false,
      conviction: "MODERATE",
      thesis: "Silent tape in a cyclical semiconductor play. Absence of insider P-buys during a potential cyclical trough is neutral; await director or CFO accumulation for bullish signal.",
      stars: 2,
    },
  ],
  redFlags: [
    {
      ticker: "NVDA",
      company: "NVIDIA Corporation",
      severity: "CAUTIOUS",
      signal: "Director Mark Stevens liquidated 1.366M shares on Sept 18, 2026 (~$300M total at $219\u2013$220). CFO Colette Kress and EVP Timothy Teter sold ~$7M\u2013$8.6M combined on Sept 17. While likely 10b5-1 plan-driven, the scale of Stevens' exit (reducing holdings from ~981M to ~970.5M shares) during a strength phase warrants monitoring for forward guidance changes.",
    },
    {
      ticker: "AMD",
      company: "Advanced Micro Devices, Inc.",
      severity: "CAUTIOUS",
      signal: "CEO Lisa Su executed a ~69M-share liquidation spanning Sept 10 (prices $503\u2013$515, ~$36M in proceeds). While individually routine over a single day, the aggregate scale and timing (post-strong earnings season) suggests aggressive rebalancing. No alarm if on 10b5-1 plan, but monitor for further tranches or forward revenue guidance softness.",
    },
    {
      ticker: "AVGO",
      company: "Broadcom Inc.",
      severity: "CAUTIOUS",
      signal: "Founder Henry Samueli liquidated ~455k shares on Sept 23, 2026 (prices $354\u2013$361, ~$160M in proceeds). CLO Mark Brazeal also sold 50k shares across June\u2013July tranches (~$19.5M). Founder-level distribution is not uncommon for estate/tax planning, but absence of any insider P-buys and concurrent officer selling suggests neutral-to-cautious sentiment on near-term upside.",
    },
  ],
};
