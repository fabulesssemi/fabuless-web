import { COMPANY_UNIVERSE } from "@/lib/companies";
import type { AnalystView } from "./types";

const slugByTicker = new Map(COMPANY_UNIVERSE.map((c) => [c.ticker, c.slug]));

// Pure ranking helpers for the global /analyst-consensus dashboard.
// All operate on the assembled AnalystView[] — no fetching here.

export function estimateScore(v: AnalystView): number {
  const r = v.revisions;
  if (!r) return 0;
  const base = r.eps90dAgo ?? r.eps30dAgo;
  if (r.epsCurrent != null && base != null && base !== 0) {
    return ((r.epsCurrent - base) / Math.abs(base)) * 100;
  }
  return (r.epsUpLast30d ?? 0) - (r.epsDownLast30d ?? 0);
}

export function rankBullish(views: AnalystView[], n = 5): AnalystView[] {
  return views
    .filter((v) => v.sentimentScore > 0.5)
    .sort((a, b) => b.sentimentScore - a.sentimentScore)
    .slice(0, n);
}

export function rankBearish(views: AnalystView[], n = 5): AnalystView[] {
  return views
    .filter((v) => v.sentimentScore < -0.5)
    .sort((a, b) => a.sentimentScore - b.sentimentScore)
    .slice(0, n);
}

export function rankPTRaises(views: AnalystView[], n = 5): AnalystView[] {
  return views
    .filter((v) => v.delta?.ptChangePct != null && v.delta.ptChangePct > 0)
    .sort((a, b) => (b.delta!.ptChangePct ?? 0) - (a.delta!.ptChangePct ?? 0))
    .slice(0, n);
}

export function rankPTCuts(views: AnalystView[], n = 5): AnalystView[] {
  return views
    .filter((v) => v.delta?.ptChangePct != null && v.delta.ptChangePct < 0)
    .sort((a, b) => (a.delta!.ptChangePct ?? 0) - (b.delta!.ptChangePct ?? 0))
    .slice(0, n);
}

export function rankUpgrades(views: AnalystView[], n = 5): AnalystView[] {
  return views
    .filter((v) => (v.upgrades30d ?? 0) > 0)
    .sort((a, b) => (b.upgrades30d ?? 0) - (a.upgrades30d ?? 0))
    .slice(0, n);
}

export function rankDowngrades(views: AnalystView[], n = 5): AnalystView[] {
  return views
    .filter((v) => (v.downgrades30d ?? 0) > 0)
    .sort((a, b) => (b.downgrades30d ?? 0) - (a.downgrades30d ?? 0))
    .slice(0, n);
}

export function rankEstimateLeaders(views: AnalystView[], n = 5): AnalystView[] {
  return views
    .map((v) => ({ v, s: estimateScore(v) }))
    .filter((x) => Math.abs(x.s) > 0.01)
    .sort((a, b) => b.s - a.s)
    .map((x) => x.v)
    .slice(0, n);
}

export function sortByBuyShare(views: AnalystView[]): AnalystView[] {
  return views.slice().sort((a, b) => (b.buyShare ?? 0) - (a.buyShare ?? 0));
}

export function narrativeCounts(views: AnalystView[]) {
  return {
    improving: views.filter((v) => v.sentimentDirection === "improving").length,
    weakening: views.filter((v) => v.sentimentDirection === "weakening").length,
    stable: views.filter((v) => v.sentimentDirection === "stable").length,
  };
}

// Flatten to a serializable row for the client-side sortable table.
export type ConsensusRow = {
  ticker: string;
  slug: string;
  name: string;
  rating: string;
  avgPT: number | null;
  upside: number | null;
  buyShare: number | null;
  sentimentScore: number;
  direction: AnalystView["sentimentDirection"];
  upgrades30d: number;
  downgrades30d: number;
  ptChangePct: number | null;
  estimateScore: number;
};

export function toRows(views: AnalystView[]): ConsensusRow[] {
  return views.map((v) => ({
    ticker: v.ticker,
    slug: slugByTicker.get(v.ticker) ?? v.ticker.toLowerCase(),
    name: v.name,
    rating: v.consensusRating ?? "—",
    avgPT: v.avgPriceTarget ?? null,
    upside: v.impliedUpsidePct ?? null,
    buyShare: v.buyShare ?? null,
    sentimentScore: v.sentimentScore,
    direction: v.sentimentDirection,
    upgrades30d: v.upgrades30d ?? 0,
    downgrades30d: v.downgrades30d ?? 0,
    ptChangePct: v.delta?.ptChangePct ?? null,
    estimateScore: Math.round(estimateScore(v) * 10) / 10,
  }));
}
