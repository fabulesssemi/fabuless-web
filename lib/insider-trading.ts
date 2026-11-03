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
// Last run: 2026-11-03
export const insiderTradingData: InsiderTradingData = {
  generatedDate: "2026-11-03",
  lookbackWindow: "May 07 \u2013 Nov 03, 2026",
  executiveSummary: "This 6-month window reveals a predominantly bearish insider tape dominated by systematic executive selling across NVDA, AMD, and AVGO\u2014likely driven by 10b5-1 plans or rebalancing rather than conviction-based selling. No meaningful open-market P-coded purchases were identified among the Fabuless 12, suggesting executives are net sellers across the cohort. The absence of insider buying signals caution, though routine F/M/A mechanics do not constitute red flags.",
  watchlist: [
    {
      rank: 1,
      ticker: "NVDA",
      company: "NVIDIA Corporation",
      price: "~$205",
      signal: "Heavy officer and director selling in September 2026 (CFO Kress, General Counsel Teter, CEO Huang all sold). CEO Huang sold ~$9.7M (F-code forfeit on 9/16), then gifted 438k shares on 9/17. Director Stevens liquidated 1.366M shares (~$298M) on 9/18. No P-coded buys identified; all selling appears linked to scheduled grants/forfeitures.",
      lastInsiderBuy: "N/A",
      stillOpen: false,
      conviction: "MODERATE",
      thesis: "NVDA insiders are executing routine equity management and tax withholdings, not panic-selling. However, the absence of any offsetting open-market buys by leadership is notable in a $205 environment. Monitor for renewed insider buying as a bullish reversal signal.",
      stars: 2,
    },
    {
      rank: 2,
      ticker: "AMD",
      company: "Advanced Micro Devices",
      price: "~$165",
      signal: "Systematic selling by CEO Lisa Su (heavy liquidations in August\u2013September, ~$50M total), CFO Hu Jean (~$7.4M in August), and EVP Norrod (routine option exercise + sale pattern across Aug/Sept/Oct). Multiple S-coded tranches across officers suggest coordinated 10b5-1 rebalancing rather than crisis selling. No P-coded buys.",
      lastInsiderBuy: "N/A",
      stillOpen: false,
      conviction: "MODERATE",
      thesis: "AMD's insider selling pattern is orderly and methodical, consistent with pre-arranged equity plans. Prices are in a reasonable range ($453\u2013$542 in August\u2013October), and the lack of panic or accelerating dispositions is reassuring. Absence of buying limits upside conviction.",
      stars: 2,
    },
    {
      rank: 3,
      ticker: "AVGO",
      company: "Broadcom Inc.",
      price: "~$245",
      signal: "Director Samueli executed massive liquidation on 9/23/2026: ~706k shares sold (~$252M total), followed by gift of 72.5k shares. Pattern suggests large rebalancing or estate planning, not panic. Other officers (CLO Brazeal, CFO O'Toole) showed small F/S activity in July\u2013September. No P-coded purchases.",
      lastInsiderBuy: "N/A",
      stillOpen: false,
      conviction: "MODERATE",
      thesis: "Samueli's large disposal appears strategic and pre-planned rather than distressed. The subsequent gift to another party suggests wealth transfer, not loss of confidence. Orderly selling at rising prices ($354\u2013$361) is neutral to slightly cautious.",
      stars: 2,
    },
    {
      rank: 4,
      ticker: "MRVL",
      company: "Marvell Technology",
      price: "~$90",
      signal: "October 2026 filings show routine M (option exercise) and F (tax forfeit) activity across President Koopmans, Data Center President Bharathi, and others. One small S-sale by Bharathi (3.7k shares, ~$865k on 10/16). No P-coded purchases; activity is entirely routine vesting mechanics.",
      lastInsiderBuy: "N/A",
      stillOpen: false,
      conviction: "MODERATE",
      thesis: "MRVL insiders show no red flags; trading is minimal and linked to compensation events. The absence of open-market buying in a ~$90 stock suggests no urgent bullish conviction, but the lack of heavy selling is neutral.",
      stars: 2,
    },
    {
      rank: 5,
      ticker: "TSM",
      company: "Taiwan Semiconductor Manufacturing Company",
      price: "~$180",
      signal: "No Form 4 filings identified in the May 07 \u2013 Nov 03, 2026 window for TSM insiders. This is consistent with TSM's limited insider trading disclosure in U.S. EDGAR due to ADR structure and dominance of Taiwanese insider rules.",
      lastInsiderBuy: "N/A",
      stillOpen: false,
      conviction: "MODERATE",
      thesis: "TSM's absence from this 6-month EDGAR window is data-neutral; the company rarely reports Form 4s via U.S. channels. No signal can be derived. Investors should monitor Taiwanese exchanges and ADR-linked insider disclosures separately.",
      stars: 2,
    },
    {
      rank: 6,
      ticker: "ASML",
      company: "ASML Holding N.V.",
      price: "~$730",
      signal: "No Form 4 filings identified in the May 07 \u2013 Nov 03, 2026 window for ASML. ASML is Dutch-listed and does not file Form 4s on SEC EDGAR; insider activity is disclosed via Euronext/Dutch regulatory channels.",
      lastInsiderBuy: "N/A",
      stillOpen: false,
      conviction: "MODERATE",
      thesis: "ASML's absence from SEC EDGAR is structural, not a signal of insider sentiment. Investors requiring ASML insider intelligence should consult Dutch AFM filings and Euronext disclosures.",
      stars: 2,
    },
    {
      rank: 7,
      ticker: "ARM",
      company: "Arm Holdings plc",
      price: "~$140",
      signal: "No Form 4 filings identified in the May 07 \u2013 Nov 03, 2026 window for ARM. ARM is UK-listed (LSE) and does not file U.S. Form 4s; insider transactions are reported via UK regulatory channels (RNS).",
      lastInsiderBuy: "N/A",
      stillOpen: false,
      conviction: "MODERATE",
      thesis: "ARM's absence from SEC EDGAR is structural. Insider activity disclosure follows UK FCA/LR rules. Monitor RNS announcements and UK regulatory filings for ARM insider sentiment.",
      stars: 2,
    },
    {
      rank: 8,
      ticker: "MU",
      company: "Micron Technology",
      price: "~$130",
      signal: "No Form 4 filings identified in the May 07 \u2013 Nov 03, 2026 window for Micron. This is surprising given MU's large cap status; insider trading may have been dormant or minimal during this period.",
      lastInsiderBuy: "N/A",
      stillOpen: false,
      conviction: "MODERATE",
      thesis: "The absence of MU insider activity (buy, sell, or routine grant) in a 6-month window is neutral; it suggests no major leadership transitions or rebalancing events. Without positive insider buying, conviction remains neutral.",
      stars: 2,
    },
    {
      rank: 9,
      ticker: "INTC",
      company: "Intel Corporation",
      price: "~$22",
      signal: "No Form 4 filings identified in the May 07 \u2013 Nov 03, 2026 window for Intel. Given INTC's depressed valuation (~$22) and ongoing strategic turnaround, the absence of insider buying is notable and potentially bearish.",
      lastInsiderBuy: "N/A",
      stillOpen: false,
      conviction: "MODERATE",
      thesis: "INTC's lack of insider buying at distressed levels (~$22) is mildly concerning; it suggests leadership is not confident enough to invest personal capital. However, absence of data is not a strong signal. Await positive insider activity as a potential inflection point.",
      stars: 2,
    },
    {
      rank: 10,
      ticker: "QCOM",
      company: "Qualcomm Incorporated",
      price: "~$160",
      signal: "No Form 4 filings identified in the May 07 \u2013 Nov 03, 2026 window for Qualcomm. This contrasts with elevated activity at NVDA/AMD and suggests QCOM leadership is dormant or operating under trading windows.",
      lastInsiderBuy: "N/A",
      stillOpen: false,
      conviction: "MODERATE",
      thesis: "QCOM's absence from insider disclosures is neutral-to-slightly-bearish; it implies no leadership conviction to buy or proactive selling. Requires positive catalyst (insider buy, or strategic announcement) to upgrade thesis.",
      stars: 2,
    },
  ],
  redFlags: [
    {
      ticker: "AMD",
      company: "Advanced Micro Devices",
      severity: "CAUTIOUS",
      signal: "CEO Lisa Su executed systematic liquidation of ~$50M in stock across August\u2013September 2026 (12 separate S tranches on 8/18, totaling 13k+ shares; 9/10, totaling 69k+ shares). While pricing was consistent ($475\u2013$515 range) suggesting pre-arranged 10b5-1 plans, the sheer volume and repetitive cadence warrants monitoring. Combined with CFO and CTO selling, this is orderly but worth flagging for potential upcoming guidance miss or capital deployment elsewhere.",
    },
    {
      ticker: "AVGO",
      company: "Broadcom Inc.",
      severity: "CAUTIOUS",
      signal: "Director Henry Samueli's single-day liquidation on 9/23/2026 of ~706k shares (~$252M) is one of the largest insider dispositions in the 6-month window. While the subsequent 72.5k-share gift to another party suggests estate planning/wealth transfer rather than panic, the size and concentration merit close monitoring. No offsetting insider buys provide reassurance.",
    },
  ],
};
