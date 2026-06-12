/**
 * Editorial earnings previews — the "deep dive" content for upcoming semi earners.
 *
 * Content philosophy: this is NOT a flashy summary. Each preview is built around
 * what actually moves the stock — where expectations already sit, how big a beat is
 * needed to matter, the specific metrics/end-markets the sell-side watches, the
 * roadmap items and partnerships that could surprise, and the bull/bear setup.
 *
 * Grounding rules:
 *   - Point-in-time figures (consensus, guidance) live in `expectations` and are
 *     confirmed against filings / the Street before publish. Never invent a number.
 *   - The analytical framing (watch points, roadmap, bull/bear) is evergreen-ish —
 *     it reflects how memory/compute/equipment names are actually analyzed.
 *   - Influenced by industry discussion (e.g. The Circuit) but never quoted.
 *
 * Previews are keyed by ticker. The live Yahoo calendar (lib/earnings.ts) supplies
 * the authoritative date and sorts the queue; a preview attaches the editorial layer.
 */

export type Importance = "critical" | "high" | "medium";

export interface WatchPoint {
  /** Short title, e.g. "HBM revenue trajectory" */
  title: string;
  /** Why this moves the stock — the analytical reason, one or two sentences. */
  why: string;
  /** The specific number / signal to watch, if there is one. */
  metric?: string;
  importance: Importance;
}

export interface EarningsExpectations {
  /** Consensus revenue, as a display string. */
  revenue: string;
  /** Consensus EPS, as a display string. */
  eps: string;
  /** Optional buy-side whisper if it diverges from published consensus. */
  whisper?: string;
  /** Where the stock sits going into the print — what's already priced in. */
  stockSetup: string;
  /** THE key judgment: how big a beat is actually needed to move the stock. */
  barToMove: string;
}

export interface SignalCheck {
  /** The source / lens, e.g. "Options-implied move" or "Line-item consensus". */
  source: string;
  /** What that source is telling us going into the print. */
  read: string;
}

export interface EarningsVerdict {
  /** ISO date the verdict was written. */
  date: string;
  /** 2-3 sentence read on what actually happened. */
  summary: string;
  /** The market reaction, e.g. "+8% after hours". */
  reaction: string;
}

export interface EarningsPreview {
  ticker: string;
  company: string;
  /** e.g. "Fiscal Q3 2026" */
  fiscalQuarter: string;
  /** ISO date, authoritative date still comes from the live calendar. */
  reportDate: string;
  /** e.g. "After market close" */
  reportTime: string;
  /** The single question this print answers — the frame for everything. */
  centralQuestion: string;
  /** 2-3 sentences: where the story and the stock are right now. */
  setup: string;
  expectations: EarningsExpectations;
  /** Cross-source reads (consensus, options, end-market data, Circuit) — the rigor layer. */
  signalChecks?: SignalCheck[];
  /** Ranked — most stock-relevant first. */
  watchPoints: WatchPoint[];
  /** Product / roadmap items management may lay out that the market cares about. */
  roadmapWatch: string[];
  /** Relationships / deals / customer wins that could be announced. */
  partnershipWatch: string[];
  bullCase: string;
  bearCase: string;
  /** Null until the company has reported; then the post-earnings read. */
  verdict: EarningsVerdict | null;
}

export const EARNINGS_PREVIEWS: Record<string, EarningsPreview> = {
  MU: {
    ticker: "MU",
    company: "Micron Technology",
    fiscalQuarter: "Fiscal Q3 2026",
    reportDate: "2026-06-24",
    reportTime: "After market close",
    centralQuestion:
      "With the stock up ~70% on the year, Street estimates already sitting above the company's own guide, and options pricing a ~9.5% move, is there a print big enough to satisfy a market that has fully embraced the memory super-cycle?",
    setup:
      "Micron is the cleanest US-listed way to own the AI memory shortage, and the stock has run ~70% in 2026 ahead of the print. The debate has moved past 'is the cycle real' to 'how durable is it' — which flips the risk from upside surprise toward disappointment if the forward guide or HBM share narrative wobbles. Crucially, Micron is still the #3 HBM player (~5-10% share) behind SK Hynix and Samsung, so its bull case rests on closing the gap from a low base, not on dominance. This is the quarter with the highest expectations and the thinnest margin of safety.",
    expectations: {
      revenue: "Guide ~$33.5B (±$750M); Street ~$33.7B-$40.9B — the Street already sits above guidance",
      eps: "~$19 non-GAAP vs. $1.73 a year ago; gross margin guided ~81%",
      whisper: "Buy-side is positioned for a beat-and-raise; with the Street above the guide, merely beating guidance is not the bar.",
      stockSetup:
        "Up ~70% YTD on HBM and DRAM-pricing optimism. The up-cycle is largely in the multiple, positioning is crowded, and options imply a ~9.5% move — nearly double the ~5.7% historical average, i.e. the market is braced for one of the bigger reactions of the year.",
      barToMove:
        "An in-line $33.5B with a reiterated guide likely sells off — the cycle is priced and a ~9.5% implied move means a quiet quarter isn't an option. Because Street revenue already runs above the company's own guide, 'beating guidance' isn't enough; Micron has to beat the Street's above-guide number, hold gross margin near or above ~81%, raise the forward guide, AND show HBM4 share progress at NVIDIA. Two of four after a 70% run is the textbook 'sell the news' setup.",
    },
    signalChecks: [
      {
        source: "Options-implied move",
        read: "~9.5% expected move vs. a ~5.7% 12-quarter average — among the largest setups of the year. A top-tier move is already priced, so an in-line quarter is effectively a disappointment.",
      },
      {
        source: "Line-item consensus",
        read: "Street revenue ~$33.7B-$40.9B sits above the company's own ~$33.5B guide. The bar is the Street's above-guide number and the gross-margin slope, not the printed guidance.",
      },
      {
        source: "Memory pricing (TrendForce / BofA)",
        read: "Conventional DRAM contract prices up ~55-60% and server DRAM hiked 60-70%; HBM now eats ~23% of DRAM wafers, cannibalizing conventional supply and driving the pricing spike. BofA frames 2026 as a '1990s-style' super-cycle.",
      },
      {
        source: "HBM share (Counterpoint)",
        read: "Micron is ~5-10% of HBM vs. SK Hynix ~50-55% and Samsung ~35-40%; UBS sees Hynix at ~70% of HBM4 for NVIDIA's Rubin. Micron's upside is share capture from a low base — and its bear risk is being designed out of HBM4.",
      },
      {
        source: "The Circuit (qualitative)",
        read: "Recent memory-focused episodes frame the structural 'memory wall' demand and the supply-discipline dynamic among the three makers — the qualitative backdrop, used to shape the questions, not quoted.",
      },
    ],
    watchPoints: [
      {
        title: "HBM4 share & NVIDIA Rubin qualification",
        why: "Micron is the #3 HBM player from a low base, so the entire bull thesis is share capture. The single biggest swing is whether Micron secures meaningful HBM4 allocation at NVIDIA's Rubin — where UBS expects SK Hynix to take ~70%. Evidence of real HBM4 share gains is the upside catalyst; being designed out is the bear case made real.",
        metric: "HBM4 qualification status at NVIDIA, stated HBM share-target trajectory, HBM revenue run-rate and sold-out status",
        importance: "critical",
      },
      {
        title: "Gross margin trajectory",
        why: "Margin is the cleanest read on cycle position and on mix shift toward high-value HBM/DDR5, and it compresses before revenue when supply loosens. With margin guided ~81% — far above the historical norm — the question is whether the slope is still up.",
        metric: "Reported gross margin vs. ~81% guide, and the direction of next-quarter margin guidance",
        importance: "critical",
      },
      {
        title: "Forward guide vs. an above-guide Street",
        why: "Memory stocks trade on the next-quarter guide more than the printed quarter, and here the Street already sits above the company's guide. The forward number is the whole game — an in-line guide after a 70% run is the classic up-cycle sell-off.",
        metric: "Next-quarter revenue / EPS / gross-margin guidance vs. the (above-guide) Street",
        importance: "critical",
      },
      {
        title: "DRAM pricing & the wafer-cannibalization engine",
        why: "DRAM is the majority of profit, and the pricing spike is being driven by HBM consuming ~23% of wafer supply, starving conventional DRAM. Watch whether ASPs are still climbing and how durable management frames it — that mechanism is the core of the super-cycle, and any sign it's cresting matters more than the headline.",
        metric: "DRAM bit shipment growth, ASP direction, server vs. consumer DRAM mix, management's pricing-durability commentary",
        importance: "high",
      },
      {
        title: "Capex & supply discipline",
        why: "The super-cycle thesis — and talk of the rally running past 2028 — rests on all three makers staying disciplined on supply. Aggressive bit-supply growth or greenfield acceleration from Micron would raise fears of seeding the next glut and could break the narrative.",
        metric: "FY capex guidance, wafer-fab equipment spend, bit-supply growth commentary",
        importance: "high",
      },
      {
        title: "NAND pricing & posture",
        why: "NAND is secondary and more commoditized but swings the blended margin. With NAND contract pricing up ~33-38%, watch whether Micron is curtailing supply to protect pricing or seeing enterprise-SSD demand recovery.",
        metric: "NAND pricing trend, enterprise SSD demand, any supply curtailment",
        importance: "medium",
      },
    ],
    roadmapWatch: [
      "HBM4 timeline and whether Micron is sampling / qualifying on pace with SK Hynix and Samsung for NVIDIA's Rubin generation.",
      "HBM3E 12-high qualification and ramp status at the major GPU/accelerator customers.",
      "Custom HBM (logic base die) positioning — the next axis of differentiation and pricing power into HBM4E.",
      "A concrete HBM market-share target exiting calendar 2026 (the gap-closing milestone the bulls need).",
      "Leading-edge DRAM node progress (1-gamma / EUV) as the cost-and-capacity lever behind both HBM and conventional DRAM.",
    ],
    partnershipWatch: [
      "New or expanded long-term supply agreements (LTAs) with hyperscalers or GPU vendors that lock in HBM pricing/volume.",
      "A formal qualification win at NVIDIA on next-gen HBM that confirms share gains.",
      "Capacity-expansion commitments (Idaho / New York fabs) and any government / CHIPS-related support.",
      "Custom HBM design wins with a major accelerator customer.",
    ],
    bullCase:
      "Micron confirms real HBM4 share gains at NVIDIA from its low base, margins hold or climb past ~81%, and the forward guide steps up again — validating that the memory cycle is a longer, more structural franchise (the '1990s-style' super-cycle) rather than another boom-bust. In that world the stock's multiple still under-prices the earnings power.",
    bearCase:
      "Revenue and margins are great but merely clear a very high, above-guide bar; the forward guide is only in-line; HBM4 share commentary disappoints versus SK Hynix; or management flags any 2027 supply addition. With a ~9.5% move priced and positioning crowded after a 70% run, any of those triggers a sharp 'sell the news' drop even on a strong quarter.",
    verdict: null,
  },
};

/** Return the editorial preview for a ticker, if one exists. */
export function getPreview(ticker: string): EarningsPreview | null {
  return EARNINGS_PREVIEWS[ticker] ?? null;
}

/** Tickers that have a published deep-dive preview. */
export function tickersWithPreview(): string[] {
  return Object.keys(EARNINGS_PREVIEWS);
}
