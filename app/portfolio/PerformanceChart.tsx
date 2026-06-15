"use client";

import { useEffect, useState } from "react";
import {
  LineChart, Line, XAxis, YAxis, Tooltip,
  ReferenceLine, ResponsiveContainer, Legend,
} from "recharts";
import type { Holding } from "./storage";

// Identity colors — not data-encoded, purely for differentiation
const LINE_COLORS = [
  "#2563EB", // blue
  "#D97706", // amber
  "#7C3AED", // violet
  "#DC2626", // red
  "#059669", // emerald
  "#DB2777", // pink
  "#0891B2", // cyan
  "#EA580C", // orange
];

type DayPrice = { date: string; close: number };
type HistoryMap = Record<string, DayPrice[]>;

// Normalize a price series to % return from the price on or after startDate
function normalize(prices: DayPrice[], startDate: string): { date: string; pct: number }[] {
  const startIdx = prices.findIndex((p) => p.date >= startDate);
  if (startIdx === -1 || prices.length === 0) return [];
  const base = prices[startIdx].close;
  if (!base) return [];
  return prices.slice(startIdx).map((p) => ({
    date: p.date,
    pct: Math.round(((p.close - base) / base) * 1000) / 10, // 1 decimal
  }));
}

// Merge all series onto a shared date axis, filling forward for missing days
function buildChartData(
  seriesMap: Record<string, { date: string; pct: number }[]>,
): Record<string, string | number>[] {
  const allDates = Array.from(
    new Set(Object.values(seriesMap).flatMap((s) => s.map((p) => p.date)))
  ).sort();

  // Build a lookup per series
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
      if (date in lookups[key]) {
        lastVal[key] = lookups[key][date];
      }
      if (key in lastVal) row[key] = lastVal[key];
    }
    rows.push(row);
  }
  return rows;
}

function fmt(date: string) {
  const d = new Date(date + "T00:00:00");
  return d.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
}

export function PerformanceChart({ holdings }: { holdings: Holding[] }) {
  const [data, setData] = useState<Record<string, string | number>[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // Only holdings with a purchase date & price contribute a normalized line
  const charted = holdings.filter((h) => h.purchaseDate && h.purchasePrice);

  // Earliest purchase date determines the chart window
  const earliest = charted.length
    ? charted.map((h) => h.purchaseDate!).sort()[0]
    : null;

  useEffect(() => {
    if (!earliest || charted.length === 0) { setLoading(false); return; }

    const tickers = charted.map((h) => h.ticker);
    fetch(`/api/portfolio-history?tickers=${tickers.join(",")}&from=${earliest}`)
      .then((r) => r.json())
      .then((history: HistoryMap) => {
        const seriesMap: Record<string, { date: string; pct: number }[]> = {};
        for (const h of charted) {
          const prices = history[h.ticker] ?? [];
          const normalized = normalize(prices, h.purchaseDate!);
          if (normalized.length > 0) seriesMap[h.ticker] = normalized;
        }
        // SPX normalized from earliest purchase date
        if (history.SPX) {
          seriesMap["S&P 500"] = normalize(history.SPX, earliest);
        }
        setData(buildChartData(seriesMap));
        setLoading(false);
      })
      .catch(() => { setError(true); setLoading(false); });
  }, [earliest, charted.map((h) => h.ticker + h.purchaseDate).join(",")]);

  if (charted.length === 0) return null; // no holdings with purchase data

  const seriesKeys = [...charted.map((h) => h.ticker), "S&P 500"].filter(
    (k) => data.some((row) => k in row)
  );

  return (
    <div className="mb-10">
      <h2 className="text-[11px] font-bold uppercase tracking-widest text-gray-700 mb-4">
        Performance vs. S&P 500
      </h2>

      {loading && (
        <div className="h-[240px] flex items-center justify-center text-[12px] text-gray-400">
          Loading chart…
        </div>
      )}
      {error && (
        <div className="h-[240px] flex items-center justify-center text-[12px] text-gray-400">
          Chart unavailable
        </div>
      )}
      {!loading && !error && data.length > 0 && (
        <ResponsiveContainer width="100%" height={240}>
          <LineChart data={data} margin={{ top: 8, right: 16, bottom: 0, left: 0 }}>
            <XAxis
              dataKey="date"
              tickFormatter={fmt}
              tick={{ fontSize: 10, fill: "#9CA3AF" }}
              axisLine={false}
              tickLine={false}
              interval="preserveStartEnd"
            />
            <YAxis
              tickFormatter={(v) => `${v > 0 ? "+" : ""}${v}%`}
              tick={{ fontSize: 10, fill: "#9CA3AF" }}
              axisLine={false}
              tickLine={false}
              width={52}
            />
            <Tooltip
              contentStyle={{
                fontSize: 11,
                border: "1px solid #E5E7EB",
                borderRadius: 8,
                background: "white",
                boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
              }}
              formatter={(value, name) => [
                typeof value === "number" ? `${value > 0 ? "+" : ""}${value.toFixed(1)}%` : "—",
                String(name),
              ]}
              labelFormatter={(label) => new Date(label + "T00:00:00").toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
              cursor={{ stroke: "#E5E7EB", strokeWidth: 1 }}
            />
            {/* 0% baseline */}
            <ReferenceLine y={0} stroke="#D1D5DB" strokeWidth={1.5} />

            {/* Holding lines */}
            {charted.map((h, i) => (
              <Line
                key={h.ticker}
                type="monotone"
                dataKey={h.ticker}
                stroke={LINE_COLORS[i % LINE_COLORS.length]}
                strokeWidth={1.5}
                dot={false}
                connectNulls
                name={h.ticker}
              />
            ))}

            {/* S&P 500 — dashed gray */}
            <Line
              type="monotone"
              dataKey="S&P 500"
              stroke="#9CA3AF"
              strokeWidth={1.5}
              strokeDasharray="4 3"
              dot={false}
              connectNulls
              name="S&P 500"
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
