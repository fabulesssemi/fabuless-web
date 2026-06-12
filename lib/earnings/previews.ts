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
      "With revenue expected to roughly quadruple year-over-year and margins near record highs, is there any beat large enough to move a stock that has already priced in the memory super-cycle?",
    setup:
      "Micron has been the cleanest large-cap way to own the AI memory shortage, and the stock has run accordingly into the print. The debate has shifted from 'is the cycle real' to 'how long can pricing and HBM economics stay this good' — which means the risk has quietly flipped from upside surprise to disappointment if the forward guide cools. This is the quarter where expectations are highest and the margin of safety is thinnest.",
    expectations: {
      revenue: "~$33.5B (guide ±$750M) — confirm vs. latest Street",
      eps: "~$19 non-GAAP vs. $1.73 a year ago — confirm vs. latest Street",
      whisper: "Buy-side is positioned for a beat-and-raise; an in-line print is effectively a miss.",
      stockSetup:
        "Stock has rallied hard into the quarter on HBM and DRAM pricing optimism. A lot of the up-cycle is already in the multiple, so positioning is crowded and expectations are extended.",
      barToMove:
        "An in-line $33.5B and a reiterated guide likely sells off — the cycle is already in the price. To move the stock up, Micron needs (1) revenue and margins above the high end, (2) a raised forward guide, and (3) a strengthened HBM narrative (more capacity sold out, share gains, HBM4 progress). Two of three may not be enough.",
    },
    watchPoints: [
      {
        title: "HBM revenue run-rate & sold-out status",
        why: "HBM is the single largest swing factor for both revenue and gross margin, and it's the reason the multiple re-rated. The market wants confirmation that HBM is sold out further into the future and that Micron is taking share, not just riding the tide.",
        metric: "HBM revenue run-rate, % of capacity sold out for the next 12+ months, stated share trajectory vs. SK Hynix",
        importance: "critical",
      },
      {
        title: "Gross margin trajectory",
        why: "Margin is the cleanest read on where Micron sits in the cycle and on mix shift toward high-value HBM/DDR5. With margins already near records, the question is whether the slope is still up — flattening margin is the first sign the cycle is maturing.",
        metric: "Reported gross margin vs. ~81% guide, and the direction of next-quarter margin guidance",
        importance: "critical",
      },
      {
        title: "Forward guidance vs. the run-up",
        why: "Memory stocks trade on the next-quarter guide far more than the printed quarter. Given how far the stock has run, the guide is the whole game — a strong print with a merely in-line guide is the classic up-cycle sell-off setup.",
        metric: "Next-quarter revenue / EPS / gross-margin guidance vs. Street",
        importance: "critical",
      },
      {
        title: "DRAM pricing & bit demand mix",
        why: "DRAM is the majority of profit. The split between data-center DRAM (strong, AI-driven) and consumer DRAM (PC/mobile, more cyclical) tells you how durable the strength is versus how much is a pricing spike that can reverse.",
        metric: "DRAM bit shipment growth, ASP direction, data-center vs. consumer mix commentary",
        importance: "high",
      },
      {
        title: "Capex & supply discipline",
        why: "The memory market punishes supply gluts. The market wants to see disciplined wafer additions; aggressive bit-supply growth or greenfield acceleration would raise fears of seeding the next downturn.",
        metric: "FY capex guidance, wafer-fab equipment spend, bit-supply growth commentary",
        importance: "high",
      },
      {
        title: "NAND pricing & posture",
        why: "NAND is secondary and more commoditized, but it can swing the blended margin. Watch whether Micron is curtailing supply to protect pricing or seeing demand recovery in enterprise SSD.",
        metric: "NAND pricing trend, enterprise SSD demand, any supply curtailment",
        importance: "medium",
      },
    ],
    roadmapWatch: [
      "HBM4 timeline and whether Micron is sampling / qualifying ahead of or on pace with SK Hynix and Samsung.",
      "HBM3E 12-high qualification status at the major GPU/accelerator customers.",
      "Custom HBM (logic base die) positioning — the next axis of differentiation and pricing power.",
      "Stated HBM market-share target trajectory exiting calendar 2026.",
      "Leading-edge DRAM node progress (1-gamma / EUV adoption) as a cost-and-capacity lever.",
    ],
    partnershipWatch: [
      "New or expanded long-term supply agreements (LTAs) with hyperscalers or GPU vendors that lock in HBM pricing/volume.",
      "A formal qualification win at NVIDIA on next-gen HBM that confirms share gains.",
      "Capacity-expansion commitments (Idaho / New York fabs) and any government / CHIPS-related support.",
      "Custom HBM design wins with a major accelerator customer.",
    ],
    bullCase:
      "HBM stays sold out further than the market models, Micron confirms share gains and HBM4 progress, and the forward guide steps up again — proving the memory cycle has a longer, more structural runway than a typical boom-bust. In that world, the stock's multiple is still too low for the earnings power.",
    bearCase:
      "Revenue and margins are great but merely meet a very high bar, the forward guide is only in-line, and management strikes any cautious note on consumer DRAM or 2027 supply. With positioning crowded and the cycle already priced, that's enough to trigger a sharp 'sell the news' move even on a strong quarter.",
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
