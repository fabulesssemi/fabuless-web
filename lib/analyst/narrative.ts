import type {
  AnalystDelta,
  AnalystSnapshot,
  EstimateDirection,
  EstimateRevisions,
  RatingDistribution,
  RecTrendPoint,
  SentimentDirection,
} from "./types";

// ---------------------------------------------------------------------------
// Deterministic, grounded narrative. NO LLM, NO invented numbers. Every
// statement is derived from real figures (recommendation-trend deltas, estimate
// revisions, upgrade/downgrade counts, stored PT changes) and combined with the
// company's curated bull/bear themes.
// ---------------------------------------------------------------------------

export function buyShare(d?: RatingDistribution | null): number | undefined {
  if (!d) return undefined;
  const total = d.strongBuy + d.buy + d.hold + d.sell + d.strongSell;
  if (total <= 0) return undefined;
  return ((d.strongBuy + d.buy) / total) * 100;
}

function distFromPoint(p: RecTrendPoint): RatingDistribution {
  return {
    strongBuy: p.strongBuy,
    buy: p.buy,
    hold: p.hold,
    sell: p.sell,
    strongSell: p.strongSell,
  };
}

/**
 * Sentiment score = change in buy-share (percentage points) across the
 * recommendation-trend window (newest vs oldest available month), blended with
 * any stored snapshot buy-share change when present.
 */
export function deriveSentiment(
  recTrend: RecTrendPoint[] | undefined,
  delta: AnalystDelta | undefined,
): { direction: SentimentDirection; score: number } {
  let score = 0;

  if (recTrend && recTrend.length >= 2) {
    const newest = recTrend.find((t) => t.period === "0m") ?? recTrend[0];
    const oldest =
      recTrend.find((t) => t.period === "-3m") ?? recTrend[recTrend.length - 1];
    const a = buyShare(distFromPoint(newest));
    const b = buyShare(distFromPoint(oldest));
    if (a != null && b != null) score = a - b;
  }

  // Blend in stored day-over-day buy-share change (if we have history).
  if (delta?.buyShareChange != null) {
    score = score * 0.6 + delta.buyShareChange * 0.4;
  }
  // A meaningful PT move nudges sentiment.
  if (delta?.ptChangePct != null) {
    if (delta.ptChangePct >= 2) score += 1.5;
    else if (delta.ptChangePct <= -2) score -= 1.5;
  }

  const direction: SentimentDirection =
    score > 2.5 ? "improving" : score < -2.5 ? "weakening" : "stable";
  return { direction, score: Math.round(score * 10) / 10 };
}

/** Estimate direction from EPS trend (current vs 90/30 days ago) + revision counts. */
export function deriveEstimateDirection(
  rev: EstimateRevisions | undefined,
): EstimateDirection {
  if (!rev) return "stable";
  const base = rev.eps90dAgo ?? rev.eps30dAgo;
  if (rev.epsCurrent != null && base != null && base !== 0) {
    const pct = ((rev.epsCurrent - base) / Math.abs(base)) * 100;
    if (pct >= 1) return "rising";
    if (pct <= -1) return "falling";
  }
  const up = rev.epsUpLast30d ?? 0;
  const down = rev.epsDownLast30d ?? 0;
  if (up - down >= 2) return "rising";
  if (down - up >= 2) return "falling";
  return "stable";
}

function pct(n?: number, withSign = true): string {
  if (n == null) return "—";
  const s = withSign && n > 0 ? "+" : "";
  return `${s}${n.toFixed(1)}%`;
}

/**
 * Build the grounded narrative sentence(s). `themes` come from the curated
 * editorial layer so the prose names real drivers (e.g. "Blackwell ramp").
 *
 * Does NOT include a "TICKER:" prefix — callers are responsible for labeling
 * context (e.g. the dashboard NarrativeColumn shows the company name separately).
 * Does NOT repeat sentiment direction or themes — those are rendered as badges
 * and separate sections in the UI.
 */
export function buildNarrative(args: {
  ticker: string;
  snap: AnalystSnapshot;
  delta?: AnalystDelta;
  direction: SentimentDirection;
  estimate: EstimateDirection;
  bullThemes: string[];
  bearThemes: string[];
}): string {
  const { snap, delta, direction, estimate } = args;

  const bs = snap.distribution ? buyShare(snap.distribution) : undefined;
  const bsRounded = bs != null ? Math.round(bs) : undefined;
  const up = snap.upgrades30d ?? 0;
  const down = snap.downgrades30d ?? 0;
  const upside = snap.impliedUpsidePct;
  const n = snap.numberOfAnalysts;
  const hasPTMove =
    delta?.ptChangePct != null && Math.abs(delta.ptChangePct) >= 0.5;

  // ── IMPROVING ────────────────────────────────────────────────────────────
  if (direction === "improving") {
    if (up >= 2 && bsRounded != null) {
      const tail = hasPTMove && delta!.ptChangePct! > 0
        ? `, with the average price target up ${pct(delta!.ptChangePct)}.`
        : estimate === "rising"
          ? " as EPS estimates continue drifting higher."
          : ".";
      return (
        `${up} upgrade${up > 1 ? "s" : ""} in the last month — ` +
        `${bsRounded}% of analysts now carry a buy rating` +
        tail
      );
    }
    if (hasPTMove && delta!.ptChangePct! > 0) {
      const tail = upside != null
        ? `, implying ${pct(upside, false)} upside at current levels.`
        : ".";
      return (
        `Average price target up ${pct(delta!.ptChangePct)} since ${delta!.priorSnapshotDate}` +
        tail
      );
    }
    if (bsRounded != null && bsRounded >= 70) {
      const extra = estimate === "rising"
        ? ", with EPS estimates trending higher."
        : up > 0
          ? `, with ${up} upgrade${up > 1 ? "s" : ""} in the past month.`
          : ".";
      return `${bsRounded}% of covering analysts carry a buy rating${extra}`;
    }
    // fallback improving
    if (estimate === "rising") {
      return bsRounded != null
        ? `Estimates are drifting higher — ${bsRounded}% buy-rated${n != null ? ` across ${n} analysts` : ""}.`
        : "Estimates are drifting higher as analyst activity picks up.";
    }
    return bsRounded != null
      ? `Street activity is picking up — ${bsRounded}% buy-rated${n != null ? ` among ${n} analysts` : ""}.`
      : "Analyst sentiment is trending in a more constructive direction.";
  }

  // ── WEAKENING ────────────────────────────────────────────────────────────
  if (direction === "weakening") {
    if (down >= 2 && bsRounded != null) {
      const tail = estimate === "falling"
        ? ", with EPS estimates also moving lower."
        : ".";
      return (
        `${down} downgrade${down > 1 ? "s" : ""} in the last month — ` +
        `buy share has slipped to ${bsRounded}%` +
        tail
      );
    }
    if (hasPTMove && delta!.ptChangePct! < 0) {
      const tail = bsRounded != null
        ? ` — ${bsRounded}% of analysts still carry a buy rating.`
        : ".";
      return (
        `Average price target down ${pct(delta!.ptChangePct)} since ${delta!.priorSnapshotDate}` +
        tail
      );
    }
    if (estimate === "falling") {
      const revDown = snap.revisions?.epsDownLast30d;
      const base = revDown != null && revDown > 0
        ? `${revDown} downward EPS revision${revDown > 1 ? "s" : ""} in the past 30 days`
        : "EPS estimates are drifting lower";
      const tail = bsRounded != null ? ` — buy share now at ${bsRounded}%.` : ".";
      return base + tail;
    }
    // fallback weakening
    const tail = down > 0
      ? `, with ${down} downgrade${down > 1 ? "s" : ""} over the past month.`
      : ".";
    return bsRounded != null
      ? `Buy share has drifted lower to ${bsRounded}%${tail}`
      : `Analyst sentiment has softened${tail}`;
  }

  // ── STABLE ───────────────────────────────────────────────────────────────
  if (bsRounded != null && bsRounded >= 75) {
    const extra = estimate === "rising"
      ? ", with EPS estimates still trending higher."
      : estimate === "falling"
        ? ", though estimates have been ticking lower."
        : n != null
          ? ` across ${n} analysts — no material rating shifts in the past month.`
          : " — no material rating shifts in the past month.";
    return `Consensus is firmly buy-rated at ${bsRounded}%${extra}`;
  }
  if (bsRounded != null) {
    const estClause = estimate === "rising"
      ? ", with estimates still trending higher"
      : estimate === "falling"
        ? ", though estimates have been drifting lower"
        : "";
    return (
      `Rating mix unchanged — ${bsRounded}% buy-rated` +
      (n != null ? ` among ${n} analysts` : "") +
      estClause +
      "."
    );
  }

  // absolute fallback
  return snap.consensusRating
    ? `Consensus holds at ${snap.consensusRating.toLowerCase()}${upside != null ? ` with ${pct(upside, false)} implied upside` : ""}.`
    : "Analyst data is refreshed hourly.";
}
