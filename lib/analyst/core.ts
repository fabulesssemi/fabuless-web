// Core analyst assembly — NO next/cache import, so this is safe to run both
// inside Next (wrapped with caching in index.ts) and from a plain tsx script
// (the daily snapshot capture).
import { getEditorial, type CompanyMeta } from "@/lib/companies";
import { finnhubAnalystProvider } from "./providers/finnhub";
import { yahooAnalystProvider } from "./providers/yahoo";
import {
  buildNarrative,
  buyShare,
  deriveEstimateDirection,
  deriveSentiment,
} from "./narrative";
import { computeDelta, getPriorSnapshot } from "./snapshots";
import type { AnalystProvider, AnalystSnapshot, AnalystView } from "./types";

// Providers in PRIORITY ORDER. Add FMP/TipRanks here later — no UI changes.
export const providers: AnalystProvider[] = [
  yahooAnalystProvider,
  finnhubAnalystProvider, // dormant until FINNHUB_API_KEY is set
];

async function safe<T>(fn: () => Promise<T>): Promise<T | null> {
  try {
    return await fn();
  } catch {
    return null;
  }
}

// Merge partial snapshots: earlier providers win per field; sources concatenate.
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
      if (k === "sources") continue;
      if (v !== undefined && v !== null && out[k] === undefined) out[k] = v;
    }
  }
  return {
    ...(out as AnalystSnapshot),
    ticker: (out.ticker as string) ?? fallbackTicker,
    name: (out.name as string) ?? fallbackName,
    sources: [...new Set(sources)],
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

  const prior = await getPriorSnapshot(meta.ticker);
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
  };
}
