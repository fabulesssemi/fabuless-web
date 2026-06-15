"use client";

import { useEffect, useState } from "react";
import {
  LineChart, Line, XAxis, YAxis, Tooltip,
  ReferenceLine, ResponsiveContainer,
} from "recharts";
import type { Holding } from "./storage";
import { buildColorMap, SPX_COLOR } from "./colors";

type DayPrice = { date: string; close: number };
type HistoryMap = Record<string, DayPrice[]>;

function ninetyDaysAgo(): string {
  const d = new Date();
  d.setDate(d.getDate() - 90);
  return d.toISOString().slice(0, 10);
}

// Close price on or after a target date, from a daily series
function closeOnOrAfter(prices: DayPrice[], date: string): number | null {
  const hit = prices.find((p) => p.date >= date);
  return hit ? hit.close : null;
}

// Normalize a price series to % return vs. a fixed base price (cost basis)
function normalizeToBase(prices: DayPrice[], startDate: string, base: number): { date: string; pct: number }[] {
  const startIdx = prices.findIndex((p) => p.date >= startDate);
  if (startIdx === -1 || !base) return [];
  return prices.slice(startIdx).map((p) => ({
    date: p.date,
    pct: Math.round(((p.close - base) / base) * 1000) / 10,
  }));
}

function buildChartData(
  seriesMap: Record<string, { date: string; pct: number }[]>,
): Record<string, string | number>[] {
  const allDates = Array.from(
    new Set(Object.values(seriesMap).flatMap((s) => s.map((p) => p.date)))
  ).sort();
  const lookups: Record<string, Record<string, number>> = {};
  for (const [key, series] of Object.entries(seriesMap)) {
    lookups[key] = {};
    for (const p of series) lookups[key][p.date] = p.pct;
  }
  const keys = Object.keys(seriesMap);
  const rows: Record<string, string | number>[] = [];
  const lastVal: Record<string, number> = {};
  for (const date of allDates) {
    const row: Record<string, string | number> = { date };
    for (const key of keys) {
      if (date in lookups[key]) lastVal[key] = lookups[key][date];
      if (key in lastVal) row[key] = lastVal[key];
    }
    rows.push(row);
  }
  return rows;
}

function fmtAxis(date: string) {
  const d = new Date(date + "T00:00:00");
  return d.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
}

function money(n: number): string {
  const abs = Math.abs(n);
  const s = abs >= 1000 ? `$${(abs / 1000).toFixed(1)}k` : `$${abs.toFixed(0)}`;
  return n < 0 ? `-${s}` : `+${s}`;
}

export function PortfolioPerformance({
  holdings,
  livePrices,
}: {
  holdings: Holding[];
  livePrices: Record<string, number | null>;
}) {
  const [history, setHistory] = useState<HistoryMap | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const colorMap = buildColorMap(holdings.map((h) => h.ticker));

  // Holdings that have a cost basis (price + date) drive the anchored chart
  const anchored = holdings.filter((h) => h.purchasePrice && h.purchaseDate);
  const usingFallback = anchored.length === 0;

  // Chart window start
  const charted = usingFallback ? holdings : anchored;
  const fromDates = charted.map((h) => h.purchaseDate ?? ninetyDaysAgo());
  const earliest = fromDates.sort()[0] ?? ninetyDaysAgo();
  const tickers = charted.map((h) => h.ticker);
  const cacheKey = charted.map((h) => h.ticker + (h.purchaseDate ?? "") + (h.purchasePrice ?? "")).join(",");

  useEffect(() => {
    if (tickers.length === 0) { setLoading(false); return; }
    setLoading(true);
    fetch(`/api/portfolio-history?tickers=${tickers.join(",")}&from=${earliest}`)
      .then((r) => r.json())
      .then((h: HistoryMap) => { setHistory(h); setLoading(false); })
      .catch(() => { setError(true); setLoading(false); });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cacheKey]);

  if (charted.length === 0) return null;

  // ---- Build chart series ----
  let data: Record<string, string | number>[] = [];
  if (history) {
    const seriesMap: Record<string, { date: string; pct: number }[]> = {};
    for (const h of charted) {
      const prices = history[h.ticker] ?? [];
      const startDate = h.purchaseDate ?? earliest;
      // anchor to cost basis if present, else to first close (fallback mode)
      const base = h.purchasePrice ?? closeOnOrAfter(prices, startDate);
      if (base) {
        const series = normalizeToBase(prices, startDate, base);
        if (series.length > 0) seriesMap[h.ticker] = series;
      }
    }
    // S&P backdrop — anchored to its close on the earliest start date
    if (history.SPX) {
      const spxBase = closeOnOrAfter(history.SPX, earliest);
      if (spxBase) seriesMap["S&P 500"] = normalizeToBase(history.SPX, earliest, spxBase);
    }
    data = buildChartData(seriesMap);
  }

  // ---- Summary strip (needs price + date + shares for dollar figures) ----
  const full = holdings.filter((h) => h.purchasePrice && h.purchaseDate && h.shares);
  let strip: null | {
    cost: number; curValue: number; pnl: number; pnlPct: number;
    spyValue: number; spyPct: number; beatBy: number; beatByPct: number;
  } = null;

  if (full.length > 0 && history) {
    let cost = 0, curValue = 0, spyValue = 0;
    const spxToday = history.SPX?.length ? history.SPX[history.SPX.length - 1].close : null;
    for (const h of full) {
      const hCost = h.shares! * h.purchasePrice!;
      const live = livePrices[h.ticker];
      cost += hCost;
      curValue += h.shares! * (live ?? h.purchasePrice!);
      const spxAtBuy = history.SPX ? closeOnOrAfter(history.SPX, h.purchaseDate!) : null;
      if (spxToday && spxAtBuy) {
        spyValue += hCost * (spxToday / spxAtBuy);
      } else {
        spyValue += hCost; // no SPX data → treat as flat
      }
    }
    const pnl = curValue - cost;
    const spyPnl = spyValue - cost;
    strip = {
      cost,
      curValue,
      pnl,
      pnlPct: cost ? (pnl / cost) * 100 : 0,
      spyValue,
      spyPct: cost ? (spyPnl / cost) * 100 : 0,
      beatBy: curValue - spyValue,
      beatByPct: cost ? ((pnl - spyPnl) / cost) * 100 : 0,
    };
  }

  const legendItems = charted.filter((h) => data.some((row) => h.ticker in row));

  return (
    <div className="mb-8">
      <h2 className="text-[11px] font-bold uppercase tracking-widest text-gray-700 mb-3">
        Performance vs. S&amp;P 500
      </h2>

      {/* Summary strip */}
      {strip && (
        <div className="flex flex-wrap items-baseline gap-x-6 gap-y-1 mb-4 pb-4 border-b border-gray-100">
          <div>
            <span className="text-[11px] uppercase tracking-widest text-gray-400 mr-2">Your holdings</span>
            <span className={`text-[20px] font-bold tabular-nums ${strip.pnl >= 0 ? "text-emerald-600" : "text-rose-500"}`}>
              {money(strip.pnl)}
            </span>
            <span className={`text-[13px] font-semibold tabular-nums ml-1.5 ${strip.pnl >= 0 ? "text-emerald-600" : "text-rose-500"}`}>
              ({strip.pnlPct >= 0 ? "+" : ""}{strip.pnlPct.toFixed(1)}%)
            </span>
          </div>
          <div className="text-[13px] text-gray-500">
            <span className="text-gray-400">Same money in S&amp;P:</span>{" "}
            <span className="font-semibold tabular-nums">{strip.spyPct >= 0 ? "+" : ""}{strip.spyPct.toFixed(1)}%</span>
          </div>
          <div className={`text-[13px] font-semibold tabular-nums ${strip.beatBy >= 0 ? "text-emerald-600" : "text-rose-500"}`}>
            {strip.beatBy >= 0 ? "Beating the market by " : "Trailing the market by "}
            {money(Math.abs(strip.beatBy)).replace(/^[+]/, "")} ({strip.beatByPct >= 0 ? "+" : ""}{strip.beatByPct.toFixed(1)}%)
          </div>
        </div>
      )}

      {usingFallback && (
        <p className="text-[11px] text-gray-400 mb-3">
          Showing 90-day price change. Add your purchase price &amp; date (Edit holdings) to anchor the chart to your cost basis — 0% becomes your breakeven.
        </p>
      )}

      {loading && <div className="h-[320px] flex items-center justify-center text-[12px] text-gray-400">Loading chart…</div>}
      {error && <div className="h-[320px] flex items-center justify-center text-[12px] text-gray-400">Chart unavailable</div>}

      {!loading && !error && data.length > 0 && (
        <>
          <ResponsiveContainer width="100%" height={320}>
            <LineChart data={data} margin={{ top: 8, right: 16, bottom: 0, left: 0 }}>
              <XAxis dataKey="date" tickFormatter={fmtAxis} tick={{ fontSize: 10, fill: "#9CA3AF" }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
              <YAxis tickFormatter={(v) => `${v > 0 ? "+" : ""}${v}%`} tick={{ fontSize: 10, fill: "#9CA3AF" }} axisLine={false} tickLine={false} width={52} />
              <Tooltip
                contentStyle={{ fontSize: 11, border: "1px solid #E5E7EB", borderRadius: 8, background: "white", boxShadow: "0 4px 12px rgba(0,0,0,0.08)" }}
                formatter={(value, name) => [typeof value === "number" ? `${value > 0 ? "+" : ""}${value.toFixed(1)}%` : "—", String(name)]}
                labelFormatter={(label) => new Date(label + "T00:00:00").toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                cursor={{ stroke: "#E5E7EB", strokeWidth: 1 }}
                itemSorter={(item) => -(item.value as number)}
              />
              {/* breakeven baseline */}
              <ReferenceLine y={0} stroke="#9CA3AF" strokeWidth={1.5} />
              {legendItems.map((h) => (
                <Line key={h.ticker} type="monotone" dataKey={h.ticker} stroke={colorMap[h.ticker]} strokeWidth={1.5} dot={false} connectNulls name={h.ticker} />
              ))}
              <Line type="monotone" dataKey="S&P 500" stroke={SPX_COLOR} strokeWidth={1.5} strokeDasharray="4 3" dot={false} connectNulls name="S&P 500" />
            </LineChart>
          </ResponsiveContainer>

          {/* Custom legend — scales cleanly, wraps, shows which color is which stock */}
          <div className="flex flex-wrap gap-x-4 gap-y-1.5 mt-3">
            {legendItems.map((h) => {
              const last = [...data].reverse().find((row) => h.ticker in row);
              const pct = last ? (last[h.ticker] as number) : null;
              return (
                <div key={h.ticker} className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: colorMap[h.ticker] }} />
                  <span className="text-[11px] font-bold text-gray-700">{h.ticker}</span>
                  {pct !== null && (
                    <span className={`text-[11px] font-semibold tabular-nums ${pct >= 0 ? "text-emerald-600" : "text-rose-500"}`}>
                      {pct >= 0 ? "+" : ""}{pct.toFixed(1)}%
                    </span>
                  )}
                </div>
              );
            })}
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-0.5 rounded-sm" style={{ backgroundColor: SPX_COLOR }} />
              <span className="text-[11px] font-semibold text-gray-400">S&amp;P 500</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
