import { supabase } from "@/lib/supabase";
import type { AnalystDelta, AnalystSnapshot } from "./types";

// ---------------------------------------------------------------------------
// Daily snapshot persistence (Supabase). Powers true day-over-day deltas:
// "PT raised this week", "sentiment moved since the last snapshot".
//
// Everything here is GRACEFUL: if the table doesn't exist yet, or Supabase
// errors, reads return null/[] and writes report ok:false. The feature still
// runs on Yahoo's built-in trends — deltas simply appear once snapshots exist.
//
// Table (run lib/analyst/schema.sql in the Supabase SQL editor):
//   analyst_snapshots(snapshot_date date, ticker text, avg_price_target numeric,
//     high_price_target numeric, low_price_target numeric, current_price numeric,
//     consensus_rating text, number_of_analysts int, strong_buy int, buy int,
//     hold int, sell int, strong_sell int, upgrades_30d int, downgrades_30d int,
//     created_at timestamptz default now(), PRIMARY KEY (snapshot_date, ticker))
// ---------------------------------------------------------------------------

export type SnapshotRow = {
  snapshot_date: string;
  ticker: string;
  avg_price_target: number | null;
  high_price_target: number | null;
  low_price_target: number | null;
  current_price: number | null;
  consensus_rating: string | null;
  number_of_analysts: number | null;
  strong_buy: number | null;
  buy: number | null;
  hold: number | null;
  sell: number | null;
  strong_sell: number | null;
  upgrades_30d: number | null;
  downgrades_30d: number | null;
};

function todayUTC(): string {
  return new Date().toISOString().slice(0, 10);
}

function buyShareOf(
  d?: { strongBuy: number; buy: number; hold: number; sell: number; strongSell: number } | null,
): number | undefined {
  if (!d) return undefined;
  const total = d.strongBuy + d.buy + d.hold + d.sell + d.strongSell;
  if (total <= 0) return undefined;
  return ((d.strongBuy + d.buy) / total) * 100;
}

function rowToDistribution(r: SnapshotRow) {
  return {
    strongBuy: r.strong_buy ?? 0,
    buy: r.buy ?? 0,
    hold: r.hold ?? 0,
    sell: r.sell ?? 0,
    strongSell: r.strong_sell ?? 0,
  };
}

/** Upsert today's snapshot for one company. Never throws. */
export async function saveSnapshot(
  snap: AnalystSnapshot,
): Promise<{ ok: boolean }> {
  const d = snap.distribution;
  const row: SnapshotRow = {
    snapshot_date: todayUTC(),
    ticker: snap.ticker,
    avg_price_target: snap.avgPriceTarget ?? null,
    high_price_target: snap.highPriceTarget ?? null,
    low_price_target: snap.lowPriceTarget ?? null,
    current_price: snap.currentPrice ?? null,
    consensus_rating: snap.consensusRating ?? null,
    number_of_analysts: snap.numberOfAnalysts ?? null,
    strong_buy: d?.strongBuy ?? null,
    buy: d?.buy ?? null,
    hold: d?.hold ?? null,
    sell: d?.sell ?? null,
    strong_sell: d?.strongSell ?? null,
    upgrades_30d: snap.upgrades30d ?? null,
    downgrades_30d: snap.downgrades30d ?? null,
  };
  try {
    const { error } = await supabase
      .from("analyst_snapshots")
      .upsert(row, { onConflict: "snapshot_date,ticker" });
    return { ok: !error };
  } catch {
    return { ok: false };
  }
}

/** Most recent snapshot strictly before today, for one ticker. */
export async function getPriorSnapshot(
  ticker: string,
): Promise<SnapshotRow | null> {
  try {
    const { data, error } = await supabase
      .from("analyst_snapshots")
      .select("*")
      .eq("ticker", ticker)
      .lt("snapshot_date", todayUTC())
      .order("snapshot_date", { ascending: false })
      .limit(1);
    if (error || !data || data.length === 0) return null;
    return data[0] as SnapshotRow;
  } catch {
    return null;
  }
}

/** Latest prior snapshot for every ticker, keyed by ticker (for the dashboard). */
export async function getPriorSnapshotMap(): Promise<Record<string, SnapshotRow>> {
  try {
    const { data, error } = await supabase
      .from("analyst_snapshots")
      .select("*")
      .lt("snapshot_date", todayUTC())
      .order("snapshot_date", { ascending: false });
    if (error || !data) return {};
    const out: Record<string, SnapshotRow> = {};
    for (const row of data as SnapshotRow[]) {
      if (!out[row.ticker]) out[row.ticker] = row; // first = most recent
    }
    return out;
  } catch {
    return {};
  }
}

/** Compute the delta between a live snapshot and a stored prior row. */
export function computeDelta(
  snap: AnalystSnapshot,
  prior: SnapshotRow | null,
): AnalystDelta | undefined {
  if (!prior) return undefined;
  const priorPT = prior.avg_price_target ?? undefined;
  const curPT = snap.avgPriceTarget ?? undefined;
  const ptChangeAbs =
    priorPT != null && curPT != null ? curPT - priorPT : undefined;
  const ptChangePct =
    priorPT != null && curPT != null && priorPT > 0
      ? ((curPT - priorPT) / priorPT) * 100
      : undefined;

  const priorBuyShare = buyShareOf(rowToDistribution(prior));
  const curBuyShare = buyShareOf(snap.distribution);
  const buyShareChange =
    priorBuyShare != null && curBuyShare != null
      ? curBuyShare - priorBuyShare
      : undefined;

  return {
    priorSnapshotDate: prior.snapshot_date,
    priorAvgPriceTarget: priorPT,
    ptChangeAbs,
    ptChangePct,
    priorBuyShare,
    buyShareChange,
  };
}
