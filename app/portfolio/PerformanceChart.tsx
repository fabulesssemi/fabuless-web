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

function periodStart(period: Period): string {
  const now = new Date();
  switch (period) {
    case "5D":  { const d = new Date(now); d.setDate(d.getDate() - 8); return d.toISOString().slice(0, 10); }
    case "1M":  { const d = new Date(now); d.setMonth(d.getMonth() - 1); return d.toISOString().slice(0, 10); }
    case "6M":  { const d = new Date(now); d.setMonth(d.getMonth() - 6); return d.toISOString().slice(0, 10); }
    case "YTD": return `${now.getFullYear()}-01-01`;
    case "1Y":  { const d = new Date(now); d.setFullYear(d.getFullYear() - 1); return d.toISOString().slice(0, 10); }
    case "5Y":  return fiveYearsAgo();
    case "All": return fiveYearsAgo();
  }
}

function closeOnOrAfter(prices: DayPrice[], date: string): number | null {
  const hit = prices.find((p) => p.date >= date);
  return hit ? hit.close : null;
}

// Builds pre/post series for a ticker. pre = before purchaseDate (dashed), post = from purchaseDate (solid).
// If no purchaseDate, all data goes into "post" (solid throughout).
function buildSplitSeries(
  prices: DayPrice[],
  winStart: string,
  base: number,
  purchaseDate: string | null | undefined,
): {
  pre: { date: string; pct: number }[];
  post: { date: string; pct: number }[];
} {
  const startIdx = prices.findIndex((p) => p.date >= winStart);
  if (startIdx === -1 || !base) return { pre: [], post: [] };

  const sliced = prices.slice(startIdx);
  const toPct = (p: DayPrice) => ({ date: p.date, pct: Math.round(((p.close - base) / base) * 1000) / 10 });

  if (!purchaseDate) return { pre: [], post: sliced.map(toPct) };

  const pre = sliced.filter((p) => p.date < purchaseDate).map(toPct);
  const post = sliced.filter((p) => p.date >= purchaseDate).map(toPct);

  // Stitch: include the last pre point in post so the lines connect visually
  if (pre.length > 0 && post.length > 0) {
    post.unshift(pre[pre.length - 1]);
  }

  return { pre, post };
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

// Pick N evenly-spaced ticks across the data for guaranteed even spacing
function computeTicks(data: Record<string, string | number>[], period: Period): string[] {
  const dates = data.map((r) => r.date as string);
  if (!dates.length) return [];
  const n = dates.length;

  // Target tick count per period
  const targets: Record<Period, number> = {
    "5D": Math.min(n, 5),
    "1M": 5,
    "6M": 6,
    "YTD": 6,
    "1Y": 6,
    "5Y": 6,
    "All": 6,
  };
  const count = targets[period];
  if (n <= count) return dates;

  const result: string[] = [];
  for (let i = 0; i < count; i++) {
    const idx = Math.round((i / (count - 1)) * (n - 1));
    result.push(dates[idx]);
  }
  return result;
}

function fmtAxisDate(date: string, period: Period) {
  const d = new Date(date + "T00:00:00");
  switch (period) {
    case "5D":
    case "1M":
      return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    case "6M":
      return d.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
    case "YTD":
      return d.toLocaleDateString("en-US", { month: "short" });
    case "1Y":
      // Bold marker for year change is handled in CustomTick below
      return d.getMonth() === 0
        ? d.getFullYear().toString()
        : d.toLocaleDateString("en-US", { month: "short" });
    case "5Y":
    case "All":
      return d.getFullYear().toString();
  }
}

// Custom tick: bolds year-change labels on 1Y chart
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CustomXTick({ x, y, payload, period }: any) {
  const label = fmtAxisDate(payload.value, period);
  const d = new Date((payload.value as string) + "T00:00:00");
  const isYearChange = period === "1Y" && d.getMonth() === 0;
  return (
    <text
      x={x} y={y + 10}
      textAnchor="middle"
      fontSize={11}
      fill={isYearChange ? "#374151" : "#9CA3AF"}
      fontWeight={isYearChange ? 700 : 400}
    >
      {label}
    </text>
  );
}

function money(n: number): string {
  const abs = Math.abs(n);
  const s = abs >= 1000 ? `$${(abs / 1000).toFixed(1)}k` : `$${abs.toFixed(0)}`;
  return n < 0 ? `-${s}` : `+${s}`;
}

// Custom tooltip — hides _pre keys, strips _post suffix from display names
function ChartTooltip({
  active, payload, label, colorMap,
}: {
  active?: boolean;
  payload?: { dataKey?: string | number; value?: number; color?: string }[];
  label?: string;
  colorMap: Record<string, string>;
}) {
  if (!active || !payload?.length) return null;

  // Filter out _pre series; deduplicate (post wins over bare)
  const seen = new Set<string>();
  const items: { ticker: string; value: number; color: string }[] = [];
  for (const entry of [...payload].sort((a, b) => (b.value ?? 0) - (a.value ?? 0))) {
    const key = String(entry.dataKey ?? "");
    if (key.endsWith("_pre")) continue;
    const ticker = key.replace(/_post$/, "");
    if (seen.has(ticker)) continue;
    seen.add(ticker);
    if (typeof entry.value === "number") {
      items.push({ ticker, value: entry.value, color: colorMap[ticker] ?? entry.color ?? "#888" });
    }
  }

  const date = new Date(String(label) + "T00:00:00").toLocaleDateString("en-US", {
    month: "long", day: "numeric", year: "numeric",
  });

  return (
    <div style={{ fontSize: 11, border: "1px solid #E5E7EB", borderRadius: 8, background: "white", boxShadow: "0 4px 12px rgba(0,0,0,0.08)", padding: "8px 12px", minWidth: 140 }}>
      <p style={{ fontWeight: 700, color: "#111827", marginBottom: 6 }}>{date}</p>
      {items.map(({ ticker, value, color }) => (
        <p key={ticker} style={{ color, margin: "2px 0", fontWeight: 600 }}>
          {ticker} : {value >= 0 ? "+" : ""}{value.toFixed(1)}%
        </p>
      ))}
    </div>
  );
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
  const charted = holdings;

  // Always fetch 5 years back so every period button has data
  const earliest = fiveYearsAgo();
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
  // All periods anchor to window start. Each ticker gets _pre (dashed) + _post (solid) series.
  const seriesMap: Record<string, { date: string; pct: number }[]> = {};

  if (history) {
    const winStart = periodStart(period);

    for (const h of charted) {
      const prices = history[h.ticker] ?? [];
      const base = closeOnOrAfter(prices, winStart);
      if (!base) continue;

      const { pre, post } = buildSplitSeries(prices, winStart, base, h.purchaseDate);
      if (pre.length > 0) seriesMap[`${h.ticker}_pre`] = pre;
      if (post.length > 0) seriesMap[`${h.ticker}_post`] = post;
    }

    if (history.SPX) {
      const spxBase = closeOnOrAfter(history.SPX, winStart);
      if (spxBase) {
        const { post } = buildSplitSeries(history.SPX, winStart, spxBase, null);
        if (post.length > 0) seriesMap["S&P 500"] = post;
      }
    }
  }

  const data = history ? buildChartData(seriesMap) : [];

  // ── Summary strip (always cost-basis anchored) ────────────────────────────
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

  const legendItems = charted.filter((h) =>
    data.some((row) => `${h.ticker}_post` in row || h.ticker in row)
  );

  function toggleTicker(ticker: string) {
    setHiddenTickers((prev) => {
      const next = new Set(prev);
      if (next.has(ticker)) next.delete(ticker); else next.add(ticker);
      return next;
    });
  }

  // % return at end of period for legend (use _post series)
  function lastPct(ticker: string): number | null {
    const postKey = `${ticker}_post`;
    const key = data.some((r) => postKey in r) ? postKey : ticker;
    const last = [...data].reverse().find((row) => key in row);
    return last ? (last[key] as number) : null;
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

      {loading && <div className="h-[300px] flex items-center justify-center text-[12px] text-gray-400">Loading chart…</div>}
      {error && <div className="h-[300px] flex items-center justify-center text-[12px] text-gray-400">Chart unavailable</div>}

      {!loading && !error && data.length > 0 && (
        <>
          {/* Period selector + legend hint */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex gap-0.5">
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
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1.5">
                <svg width="24" height="8" viewBox="0 0 24 8">
                  <line x1="0" y1="4" x2="24" y2="4" stroke="#9CA3AF" strokeWidth="1.5" strokeDasharray="4 3" />
                </svg>
                <span className="text-[10px] text-gray-400">before you bought</span>
              </span>
              <span className="flex items-center gap-1.5">
                <svg width="24" height="8" viewBox="0 0 24 8">
                  <line x1="0" y1="4" x2="24" y2="4" stroke="#9CA3AF" strokeWidth="1.5" />
                </svg>
                <span className="text-[10px] text-gray-400">while you held it</span>
              </span>
            </div>
          </div>

          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data} margin={{ top: 8, right: 16, bottom: 0, left: 0 }}>
              <XAxis
                dataKey="date"
                ticks={computeTicks(data, period)}
                tick={(props) => <CustomXTick {...props} period={period} />}
                axisLine={false} tickLine={false}
                interval={0}
              />
              <YAxis
                tickFormatter={(v) => `${v > 0 ? "+" : ""}${v}%`}
                tick={{ fontSize: 11, fill: "#9CA3AF" }}
                axisLine={false} tickLine={false} width={52}
              />
              <Tooltip
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                content={(props: any) => <ChartTooltip {...props} colorMap={{ ...colorMap, "S&P 500": SPX_COLOR }} />}
                cursor={{ stroke: "#E5E7EB", strokeWidth: 1 }}
              />
              <ReferenceLine y={0} stroke="#9CA3AF" strokeWidth={1.5} />

              {/* Per-ticker: _pre (dashed+faded) then _post (solid) */}
              {legendItems.flatMap((h) => {
                const color = colorMap[h.ticker];
                const hidden = hiddenTickers.has(h.ticker);
                const hasPre = data.some((r) => `${h.ticker}_pre` in r);
                return [
                  hasPre && (
                    <Line
                      key={`${h.ticker}_pre`}
                      type="monotone"
                      dataKey={`${h.ticker}_pre`}
                      stroke={color}
                      strokeWidth={1.5}
                      strokeDasharray="4 3"
                      strokeOpacity={0.35}
                      dot={false}
                      connectNulls
                      legendType="none"
                      hide={hidden}
                      name={`${h.ticker}_pre`}
                    />
                  ),
                  <Line
                    key={`${h.ticker}_post`}
                    type="monotone"
                    dataKey={`${h.ticker}_post`}
                    stroke={color}
                    strokeWidth={1.5}
                    dot={false}
                    connectNulls
                    legendType="none"
                    hide={hidden}
                    name={`${h.ticker}_post`}
                  />,
                ].filter(Boolean);
              })}

              {/* S&P 500 — dashed black */}
              <Line
                type="monotone"
                dataKey="S&P 500"
                stroke={SPX_COLOR}
                strokeWidth={1.5}
                strokeDasharray="4 3"
                dot={false}
                connectNulls
                legendType="none"
                hide={hiddenTickers.has("S&P 500")}
                name="S&P 500"
              />
            </LineChart>
          </ResponsiveContainer>

          {/* Legend — click to toggle */}
          <div className="flex flex-wrap gap-x-4 gap-y-1.5 mt-3">
            {legendItems.map((h) => {
              const pct = lastPct(h.ticker);
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
