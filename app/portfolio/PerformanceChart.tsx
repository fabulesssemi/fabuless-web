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

const PERIODS = ["5D", "1M", "6M", "YTD", "1Y", "5Y", "All"] as const;
type Period = typeof PERIODS[number];

function fiveYearsAgo(): string {
  const d = new Date();
  d.setFullYear(d.getFullYear() - 5);
  return d.toISOString().slice(0, 10);
}

function oneYearAgo(): string {
  const d = new Date();
  d.setFullYear(d.getFullYear() - 1);
  return d.toISOString().slice(0, 10);
}

function periodStart(period: Period): string {
  const now = new Date();
  switch (period) {
    case "5D":  { const d = new Date(now); d.setDate(d.getDate() - 8); return d.toISOString().slice(0, 10); }
    case "1M":  { const d = new Date(now); d.setMonth(d.getMonth() - 1); return d.toISOString().slice(0, 10); }
    case "6M":  { const d = new Date(now); d.setMonth(d.getMonth() - 6); return d.toISOString().slice(0, 10); }
    case "YTD": return `${now.getFullYear()}-01-01`;
    case "1Y":  { const d = new Date(now); d.setFullYear(d.getFullYear() - 1); return d.toISOString().slice(0, 10); }
    case "5Y":  { const d = new Date(now); d.setFullYear(d.getFullYear() - 5); return d.toISOString().slice(0, 10); }
    case "All": return "";
  }
}

function closeOnOrAfter(prices: DayPrice[], date: string): number | null {
  const hit = prices.find((p) => p.date >= date);
  return hit ? hit.close : null;
}

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

function fmtAxisDate(date: string, period: Period) {
  const d = new Date(date + "T00:00:00");
  if (period === "5D") return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  if (period === "1M") return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
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
  const [period, setPeriod] = useState<Period>("All");
  const [hiddenTickers, setHiddenTickers] = useState<Set<string>>(new Set());

  const colorMap = buildColorMap(holdings.map((h) => h.ticker));

  const anchored = holdings.filter((h) => h.purchasePrice && h.purchaseDate);
  const usingFallback = anchored.length === 0;
  const charted = holdings;

  // Always fetch at least 5 years back so all period buttons have data
  const purchaseDates = charted.map((h) => h.purchaseDate ?? fiveYearsAgo());
  const earliest = [fiveYearsAgo(), ...purchaseDates].sort()[0];
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

  // ── Build chart series ────────────────────────────────────────────────────
  let data: Record<string, string | number>[] = [];
  if (history) {
    const seriesMap: Record<string, { date: string; pct: number }[]> = {};

    if (period === "All") {
      // Anchor each holding to its cost basis / purchase date
      const allFromDate = purchaseDates.sort()[0] ?? oneYearAgo();
      for (const h of charted) {
        const prices = history[h.ticker] ?? [];
        const startDate = h.purchaseDate ?? allFromDate;
        const base = h.purchasePrice ?? closeOnOrAfter(prices, startDate);
        if (base) {
          const series = normalizeToBase(prices, startDate, base);
          if (series.length > 0) seriesMap[h.ticker] = series;
        }
      }
      if (history.SPX) {
        const spxBase = closeOnOrAfter(history.SPX, allFromDate);
        if (spxBase) seriesMap["S&P 500"] = normalizeToBase(history.SPX, allFromDate, spxBase);
      }
    } else {
      // Anchor all lines to 0% at the start of the selected window
      const winStart = periodStart(period);
      for (const h of charted) {
        const prices = history[h.ticker] ?? [];
        const base = closeOnOrAfter(prices, winStart);
        if (base) {
          const series = normalizeToBase(prices, winStart, base);
          if (series.length > 0) seriesMap[h.ticker] = series;
        }
      }
      if (history.SPX) {
        const spxBase = closeOnOrAfter(history.SPX, winStart);
        if (spxBase) seriesMap["S&P 500"] = normalizeToBase(history.SPX, winStart, spxBase);
      }
    }

    data = buildChartData(seriesMap);
  }

  // ── Summary strip (always cost-basis anchored, ignores period) ────────────
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
      if (spxToday && spxAtBuy) spyValue += hCost * (spxToday / spxAtBuy);
      else spyValue += hCost;
    }
    const pnl = curValue - cost;
    const spyPnl = spyValue - cost;
    strip = {
      cost, curValue, pnl,
      pnlPct: cost ? (pnl / cost) * 100 : 0,
      spyValue,
      spyPct: cost ? (spyPnl / cost) * 100 : 0,
      beatBy: curValue - spyValue,
      beatByPct: cost ? ((pnl - spyPnl) / cost) * 100 : 0,
    };
  }

  const legendItems = charted.filter((h) => data.some((row) => h.ticker in row));

  function toggleTicker(ticker: string) {
    setHiddenTickers((prev) => {
      const next = new Set(prev);
      if (next.has(ticker)) next.delete(ticker); else next.add(ticker);
      return next;
    });
  }

  return (
    <div className="mb-8">
      <h2 className="text-[11px] font-bold uppercase tracking-widest text-gray-700 mb-3">
        Performance vs. S&amp;P 500
      </h2>

      {/* Summary strip */}
      {strip && (
        <div
          className="mb-4 rounded-lg overflow-hidden"
          style={{ background: "rgba(16,185,129,0.04)", border: "1px solid rgba(16,185,129,0.12)" }}
        >
          <div className="flex divide-x" style={{ borderColor: "#1F2937" }}>
            <div className="flex-1 px-4 py-2.5">
              <p className="text-[9px] font-bold uppercase tracking-widest text-gray-400 mb-0.5">Your Holdings</p>
              <div className="flex items-baseline gap-1.5">
                <span className="text-[20px] font-bold tabular-nums leading-none" style={{ color: strip.pnl >= 0 ? "#10B981" : "#F43F5E" }}>
                  {money(strip.pnl)}
                </span>
                <span className="text-[13px] tabular-nums leading-none" style={{ color: strip.pnl >= 0 ? "#10B981" : "#F43F5E" }}>
                  ({strip.pnlPct >= 0 ? "+" : ""}{strip.pnlPct.toFixed(1)}%)
                </span>
              </div>
            </div>
            <div className="flex-1 px-4 py-2.5" style={{ borderColor: "#1F2937" }}>
              <p className="text-[9px] font-bold uppercase tracking-widest text-gray-400 mb-0.5">S&amp;P 500 (same money)</p>
              <div className="flex items-baseline gap-1.5">
                <span className="text-[20px] font-bold tabular-nums leading-none text-gray-700">
                  {strip.spyPct >= 0 ? "+" : ""}{strip.spyPct.toFixed(1)}%
                </span>
              </div>
            </div>
          </div>
          <div className="px-4 py-1.5" style={{ borderTop: "1px solid rgba(16,185,129,0.12)" }}>
            <span className="text-[11px] tabular-nums" style={{ color: strip.beatBy >= 0 ? "#10B981" : "#F43F5E" }}>
              {strip.beatBy >= 0 ? "↑ Beating the market by " : "↓ Trailing the market by "}
              {money(Math.abs(strip.beatBy)).replace(/^[+]/, "")} ({strip.beatByPct >= 0 ? "+" : ""}{strip.beatByPct.toFixed(1)}%)
            </span>
          </div>
        </div>
      )}

      {usingFallback && (
        <p className="text-[11px] text-gray-400 mb-3">
          Add your purchase price &amp; date (Edit holdings) to anchor to your cost basis.
        </p>
      )}

      {loading && <div className="h-[300px] flex items-center justify-center text-[12px] text-gray-400">Loading chart…</div>}
      {error && <div className="h-[300px] flex items-center justify-center text-[12px] text-gray-400">Chart unavailable</div>}

      {!loading && !error && data.length > 0 && (
        <>
          {/* Period selector */}
          <div className="flex gap-0.5 mb-3">
            {PERIODS.map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className="px-2.5 py-1 text-[11px] font-semibold rounded transition-colors"
                style={{
                  background: period === p ? "#1e40af" : "transparent",
                  color: period === p ? "#fff" : "#6B7280",
                }}
              >
                {p}
              </button>
            ))}
          </div>

          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data} margin={{ top: 8, right: 16, bottom: 0, left: 0 }}>
              <XAxis
                dataKey="date"
                tickFormatter={(d) => fmtAxisDate(d, period)}
                tick={{ fontSize: 10, fill: "#9CA3AF" }}
                axisLine={false} tickLine={false}
                interval="preserveStartEnd"
              />
              <YAxis
                tickFormatter={(v) => `${v > 0 ? "+" : ""}${v}%`}
                tick={{ fontSize: 10, fill: "#9CA3AF" }}
                axisLine={false} tickLine={false} width={52}
              />
              <Tooltip
                contentStyle={{ fontSize: 11, border: "1px solid #E5E7EB", borderRadius: 8, background: "white", boxShadow: "0 4px 12px rgba(0,0,0,0.08)" }}
                formatter={(value, name) => [typeof value === "number" ? `${value > 0 ? "+" : ""}${value.toFixed(1)}%` : "—", String(name)]}
                labelFormatter={(label) => new Date(label + "T00:00:00").toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                cursor={{ stroke: "#E5E7EB", strokeWidth: 1 }}
                itemSorter={(item) => -(item.value as number)}
              />
              <ReferenceLine y={0} stroke="#9CA3AF" strokeWidth={1.5} />
              {legendItems.map((h) => (
                <Line
                  key={h.ticker}
                  type="monotone"
                  dataKey={h.ticker}
                  stroke={colorMap[h.ticker]}
                  strokeWidth={hiddenTickers.has(h.ticker) ? 0 : 1.5}
                  dot={false}
                  connectNulls
                  name={h.ticker}
                  hide={hiddenTickers.has(h.ticker)}
                />
              ))}
              <Line
                type="monotone"
                dataKey="S&P 500"
                stroke={SPX_COLOR}
                strokeWidth={hiddenTickers.has("S&P 500") ? 0 : 1.5}
                strokeDasharray="4 3"
                dot={false}
                connectNulls
                name="S&P 500"
                hide={hiddenTickers.has("S&P 500")}
              />
            </LineChart>
          </ResponsiveContainer>

          {/* Legend — click to toggle */}
          <div className="flex flex-wrap gap-x-4 gap-y-1.5 mt-3">
            {legendItems.map((h) => {
              const last = [...data].reverse().find((row) => h.ticker in row);
              const pct = last ? (last[h.ticker] as number) : null;
              const hidden = hiddenTickers.has(h.ticker);
              return (
                <button
                  key={h.ticker}
                  onClick={() => toggleTicker(h.ticker)}
                  className="flex items-center gap-1.5 transition-opacity"
                  style={{ opacity: hidden ? 0.35 : 1 }}
                >
                  <span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: colorMap[h.ticker] }} />
                  <span className="text-[11px] font-bold text-gray-700">{h.ticker}</span>
                  {pct !== null && (
                    <span className={`text-[11px] font-semibold tabular-nums ${pct >= 0 ? "text-emerald-600" : "text-rose-500"}`}>
                      {pct >= 0 ? "+" : ""}{pct.toFixed(1)}%
                    </span>
                  )}
                </button>
              );
            })}
            {(() => {
              const last = [...data].reverse().find((row) => "S&P 500" in row);
              const pct = last ? (last["S&P 500"] as number) : null;
              const hidden = hiddenTickers.has("S&P 500");
              return (
                <button
                  onClick={() => toggleTicker("S&P 500")}
                  className="flex items-center gap-1.5 transition-opacity"
                  style={{ opacity: hidden ? 0.35 : 1 }}
                >
                  <span className="w-2.5 h-0.5 rounded-sm" style={{ backgroundColor: SPX_COLOR }} />
                  <span className="text-[11px] font-semibold text-gray-400">S&amp;P 500</span>
                  {pct !== null && (
                    <span className={`text-[11px] font-semibold tabular-nums ${pct >= 0 ? "text-emerald-600" : "text-rose-500"}`}>
                      {pct >= 0 ? "+" : ""}{pct.toFixed(1)}%
                    </span>
                  )}
                </button>
              );
            })()}
          </div>
        </>
      )}
    </div>
  );
}
