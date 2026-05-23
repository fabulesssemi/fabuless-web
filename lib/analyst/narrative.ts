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
  const { ticker, snap, delta, direction, estimate, bullThemes, bearThemes } =
    args;

  const facts: string[] = [];
  if (snap.consensusRating)
    facts.push(`consensus ${snap.consensusRating.toLowerCase()}`);
  if (snap.impliedUpsidePct != null)
    facts.push(`${pct(snap.impliedUpsidePct)} implied upside`);

  // Action facts (last 30d)
  const up = snap.upgrades30d ?? 0;
  const down = snap.downgrades30d ?? 0;
  if (up || down) {
    if (up && down) facts.push(`${up} upgrade${up > 1 ? "s" : ""} vs ${down} downgrade${down > 1 ? "s" : ""} (30d)`);
    else if (up) facts.push(`${up} upgrade${up > 1 ? "s" : ""} (30d)`);
    else facts.push(`${down} downgrade${down > 1 ? "s" : ""} (30d)`);
  }

  // PT change fact (only when we have stored history)
  if (delta?.ptChangePct != null && Math.abs(delta.ptChangePct) >= 0.1) {
    facts.push(`avg PT ${pct(delta.ptChangePct)} since ${delta.priorSnapshotDate}`);
  }

  // Estimate fact
  if (estimate === "rising") facts.push("EPS estimates trending up");
  else if (estimate === "falling") facts.push("EPS estimates trending down");

  const lead =
    direction === "improving"
      ? "Sentiment improving"
      : direction === "weakening"
        ? "Sentiment weakening"
        : "Sentiment broadly stable";

  const themes = direction === "weakening" ? bearThemes : bullThemes;
  const themeLabel = direction === "weakening" ? "Key concerns" : "Key themes";
  const themeClause =
    themes.length > 0
      ? ` ${themeLabel}: ${themes.slice(0, 2).join("; ")}.`
      : "";

  const factClause = facts.length ? ` — ${facts.join(", ")}.` : ".";

  return `${ticker}: ${lead}${factClause}${themeClause}`;
}
