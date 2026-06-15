"use client";

import { useEffect, useState } from "react";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ReferenceLine, ResponsiveContainer,
} from "recharts";
import { SPX_COLOR } from "./colors";

type DayPrice = { date: string; close: number };

function ninetyDaysAgo(): string {
  const d = new Date();
  d.setDate(d.getDate() - 90);
  return d.toISOString().slice(0, 10);
}

function closeOnOrAfter(prices: DayPrice[], date: string): number | null {
  const hit = prices.find((p) => p.date >= date);
  return hit ? hit.close : null;
}

function normalizeToBase(prices: DayPrice[], startDate: string, base: number) {
  const startIdx = prices.findIndex((p) => p.date >= startDate);
  if (startIdx === -1 || !base) return [];
  return prices.slice(startIdx).map((p) => ({
    date: p.date,
    pct: Math.round(((p.close - base) / base) * 1000) / 10,
  }));
}

function fmtAxis(date: string) {
  return new Date(date + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

// One stock vs. the S&P 500, both anchored to the holding's purchase date.
export function MiniHoldingChart({
  ticker, purchasePrice, purchaseDate, color,
}: {
  ticker: string;
  purchasePrice: number | null;
  purchaseDate: string | null;
  color: string;
}) {
  const [data, setData] = useState<Record<string, string | number>[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const from = purchaseDate ?? ninetyDaysAgo();

  useEffect(() => {
    setLoading(true);
    fetch(`/api/portfolio-history?tickers=${ticker}&from=${from}`)
      .then((r) => r.json())
      .then((h: Record<string, DayPrice[]>) => {
        const stock = h[ticker] ?? [];
        const spx = h.SPX ?? [];
        const stockBase = purchasePrice ?? closeOnOrAfter(stock, from);
        const spxBase = closeOnOrAfter(spx, from);
        const stockSeries = stockBase ? normalizeToBase(stock, from, stockBase) : [];
        const spxSeries = spxBase ? normalizeToBase(spx, from, spxBase) : [];

        const byDate: Record<string, Record<string, string | number>> = {};
        for (const p of stockSeries) byDate[p.date] = { ...(byDate[p.date] ?? { date: p.date }), [ticker]: p.pct };
        for (const p of spxSeries) byDate[p.date] = { ...(byDate[p.date] ?? { date: p.date }), SPX: p.pct };
        setData(Object.values(byDate).sort((a, b) => String(a.date).localeCompare(String(b.date))));
        setLoading(false);
      })
      .catch(() => { setError(true); setLoading(false); });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ticker, from]);

  if (loading) return <div className="h-[160px] flex items-center justify-center text-[11px] text-gray-400">Loading…</div>;
  if (error || data.length === 0) return <div className="h-[160px] flex items-center justify-center text-[11px] text-gray-400">No history</div>;

  return (
    <div>
      <div className="flex items-center gap-3 mb-1.5">
        <span className="text-[10px] font-semibold uppercase tracking-widest text-gray-400">
          {ticker} vs. S&amp;P 500 {purchaseDate ? "since purchase" : "· last 90 days"}
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-sm" style={{ backgroundColor: color }} /><span className="text-[10px] font-bold text-gray-600">{ticker}</span>
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-0.5" style={{ backgroundColor: SPX_COLOR }} /><span className="text-[10px] font-semibold text-gray-400">S&amp;P</span>
        </span>
      </div>
      <ResponsiveContainer width="100%" height={160}>
        <LineChart data={data} margin={{ top: 6, right: 12, bottom: 0, left: 0 }}>
          <XAxis dataKey="date" tickFormatter={fmtAxis} tick={{ fontSize: 9, fill: "#9CA3AF" }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
          <YAxis tickFormatter={(v) => `${v > 0 ? "+" : ""}${v}%`} tick={{ fontSize: 9, fill: "#9CA3AF" }} axisLine={false} tickLine={false} width={44} />
          <Tooltip
            contentStyle={{ fontSize: 11, border: "1px solid #E5E7EB", borderRadius: 8, background: "white" }}
            formatter={(value, name) => [typeof value === "number" ? `${value > 0 ? "+" : ""}${value.toFixed(1)}%` : "—", name === "SPX" ? "S&P 500" : String(name)]}
            labelFormatter={(label) => new Date(label + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
            cursor={{ stroke: "#E5E7EB", strokeWidth: 1 }}
          />
          <ReferenceLine y={0} stroke="#9CA3AF" strokeWidth={1.5} />
          <Line type="monotone" dataKey={ticker} stroke={color} strokeWidth={1.5} dot={false} connectNulls />
          <Line type="monotone" dataKey="SPX" stroke={SPX_COLOR} strokeWidth={1.5} strokeDasharray="4 3" dot={false} connectNulls />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
