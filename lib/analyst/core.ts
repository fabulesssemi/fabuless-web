// Core analyst assembly — NO next/cache import, so this is safe to run both
// inside Next (wrapped with caching in index.ts) and from a plain tsx script
// (the daily snapshot capture).
import { getEditorial, type CompanyMeta } from "@/lib/companies";
import { finnhubAnalystProvider } from "./providers/finnhub";
import { fmpAnalystProvider } from "./providers/fmp";
import { yahooAnalystProvider } from "./providers/yahoo";
import {
  buildNarrative,
  buyShare,
  deriveEstimateDirection,
  deriveSentiment,
} from "./narrative";
import { computeDelta, getPriorSnapshot, getPTHistory } from "./snapshots";
import type { AnalystAction, AnalystProvider, AnalystSnapshot, AnalystView } from "./types";

// Providers in PRIORITY ORDER. Yahoo wins on consensus data; FMP enriches
// recentActions with analyst names + per-action price targets.
export const providers: AnalystProvider[] = [
  yahooAnalystProvider,
  finnhubAnalystProvider, // dormant until FINNHUB_API_KEY is set
  fmpAnalystProvider,     // dormant until FMP_API_KEY is set
];

async function safe<T>(fn: () => Promise<T>): Promise<T | null> {
  try {
    return await fn();
  } catch {
    return null;
  }
}

// Merge partial snapshots: earlier providers win per field; sources concatenate.
// Special case: recentActions is concatenated across all providers and deduped.
function mergeActions(parts: (Partial<AnalystSnapshot> | null)[]): AnalystAction[] {
  const all = parts.flatMap((p) => p?.recentActions ?? []);
  // Deduplicate by firm+date; prefer entry with analyst name or newTarget
  const map = new Map<string, AnalystAction>();
  for (const a of all) {
    const key = `${a.firm}|${a.date?.slice(0, 10) ?? ""}`;
    const existing = map.get(key);
    if (!existing) {
      map.set(key, a);
    } else if ((!existing.analyst && a.analyst) || (!existing.newTarget && a.newTarget)) {
      map.set(key, { ...existing, ...a });
    }
  }
  return [...map.values()].sort((a, b) => (b.date ?? "").localeCompare(a.date ?? ""));
}

function merge(
  parts: (Partial<AnalystSnapshot> | null)[],
  fallbackTicker: string,
  fallbackName: string,
): AnalystSnapshot {
  const out: Record<string, unknown> = {};
  const sources: string[] = [];
  for (const part of parts) {
    if (!part) continue;
    if (part.sources) sources.push(...part.sources);
    for (const [k, v] of Object.entries(part)) {
      if (k === "sources" || k === "recentActions") continue;
      if (v !== undefined && v !== null && out[k] === undefined) out[k] = v;
    }
  }
  const recentActions = mergeActions(parts);
  return {
    ...(out as AnalystSnapshot),
    ticker: (out.ticker as string) ?? fallbackTicker,
    name: (out.name as string) ?? fallbackName,
    sources: [...new Set(sources)],
    recentActions: recentActions.length ? recentActions : undefined,
    lastUpdated: (out.lastUpdated as string) ?? new Date().toISOString(),
  };
}

function themesFor(slug: string): { bull: string[]; bear: string[] } {
  const ed = getEditorial(slug);
  if (!ed) return { bull: [], bear: [] };
  return {
    bull: ed.consensusBullThemes ?? ed.bullCase ?? [],
    bear: ed.consensusBearThemes ?? ed.bearCase ?? [],
  };
}

/** Provider merge only — no delta/narrative. Used by the snapshot capture job. */
export async function fetchRawSnapshot(
  meta: CompanyMeta,
): Promise<AnalystSnapshot> {
  const parts = await Promise.all(
    providers
      .filter((p) => p.isEnabled())
      .map((p) => safe(() => p.getAnalyst(meta.yahooSymbol))),
  );
  return merge(parts, meta.ticker, meta.name);
}

/** Full assembled view: snapshot + delta + sentiment + narrative. */
export async function assembleView(meta: CompanyMeta): Promise<AnalystView> {
  const snap = await fetchRawSnapshot(meta);

  const [prior, ptHistory] = await Promise.all([
    getPriorSnapshot(meta.ticker),
    getPTHistory(meta.ticker, 30),
  ]);
  const delta = computeDelta(snap, prior);

  const { direction, score } = deriveSentiment(snap.recTrend, delta);
  const estimate = deriveEstimateDirection(snap.revisions);
  const { bull, bear } = themesFor(meta.slug);

  const narrative = buildNarrative({
    ticker: meta.ticker,
    snap,
    delta,
    direction,
    estimate,
    bullThemes: bull,
    bearThemes: bear,
  });

  return {
    ...snap,
    ticker: meta.ticker,
    name: meta.name,
    buyShare: buyShare(snap.distribution),
    delta,
    sentimentDirection: direction,
    sentimentScore: score,
    estimateDirection: estimate,
    narrative,
    bullThemes: bull,
    bearThemes: bear,
    ptHistory: ptHistory.length >= 2 ? ptHistory : undefined,
  };
}
