import { createClient } from "@supabase/supabase-js";
import type { AnalystDelta, AnalystSnapshot } from "./types";

function getSupabase() {
  const key = process.env.SUPABASE_SERVICE_KEY;
  if (!key) throw new Error("SUPABASE_SERVICE_KEY is not set");
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, key);
}

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

/** Last N snapshots for one ticker, sorted oldest→newest. Used for PT sparkline. */
export async function getPTHistory(
  ticker: string,
  limit = 30,
): Promise<Array<{ date: string; pt: number; price: number | null }>> {
  try {
    const { data, error } = await supabase
      .from("analyst_snapshots")
      .select("snapshot_date, avg_price_target, current_price")
      .eq("ticker", ticker)
      .not("avg_price_target", "is", null)
      .order("snapshot_date", { ascending: true })
      .limit(limit);
    if (error || !data) return [];
    return (data as Array<{ snapshot_date: string; avg_price_target: number; current_price: number | null }>).map(
      (r) => ({ date: r.snapshot_date, pt: r.avg_price_target, price: r.current_price }),
    );
  } catch {
    return [];
  }
}

export type WeeklyDelta = {
  ticker: string;
  name: string;
  ptChangePct: number | null;
  ptChangeAbs: number | null;
  currentPT: number | null;
  buyShareChange: number | null;
  currentBuyShare: number | null;
  upgrades30d: number;
  downgrades30d: number;
};

/** Compares most-recent vs oldest-available snapshot in the last 14 days, per ticker. */
export async function getWeeklySnapshotDeltas(
  nameByTicker: Record<string, string>,
): Promise<WeeklyDelta[]> {
  try {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 14);
    const { data, error } = await supabase
      .from("analyst_snapshots")
      .select("*")
      .gte("snapshot_date", cutoff.toISOString().slice(0, 10))
      .order("snapshot_date", { ascending: false });
    if (error || !data) return [];

    const byTicker = new Map<string, SnapshotRow[]>();
    for (const row of data as SnapshotRow[]) {
      if (!byTicker.has(row.ticker)) byTicker.set(row.ticker, []);
      byTicker.get(row.ticker)!.push(row);
    }

    const deltas: WeeklyDelta[] = [];
    for (const [ticker, rows] of byTicker) {
      const latest = rows[0];
      const oldest = rows[rows.length - 1];
      if (latest === oldest) continue;

      const curPT = latest.avg_price_target;
      const priPT = oldest.avg_price_target;
      const ptChangePct =
        curPT != null && priPT != null && priPT > 0
          ? ((curPT - priPT) / priPT) * 100
          : null;

      const curBS = buyShareOf(rowToDistribution(latest));
      const priBS = buyShareOf(rowToDistribution(oldest));
      const buyShareChange =
        curBS != null && priBS != null ? curBS - priBS : null;

      deltas.push({
        ticker,
        name: nameByTicker[ticker] ?? ticker,
        ptChangePct: ptChangePct != null ? Math.round(ptChangePct * 10) / 10 : null,
        ptChangeAbs: curPT != null && priPT != null ? Math.round((curPT - priPT) * 100) / 100 : null,
        currentPT: curPT,
        buyShareChange: buyShareChange != null ? Math.round(buyShareChange * 10) / 10 : null,
        currentBuyShare: curBS != null ? Math.round(curBS) : null,
        upgrades30d: latest.upgrades_30d ?? 0,
        downgrades30d: latest.downgrades_30d ?? 0,
      });
    }

    return deltas.sort((a, b) => {
      const ma = Math.abs(a.ptChangePct ?? 0) + Math.abs(a.buyShareChange ?? 0);
      const mb = Math.abs(b.ptChangePct ?? 0) + Math.abs(b.buyShareChange ?? 0);
      return mb - ma;
    });
  } catch {
    return [];
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
