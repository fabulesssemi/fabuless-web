"use client";

import { useState, useEffect } from "react";
import type { PricePoint } from "@/lib/providers/history";

const W = 800;
const H = 220;
const PAD_L = 52;
const PAD_R = 16;
const PAD_T = 16;
const PAD_B = 30;
const PW = W - PAD_L - PAD_R;
const PH = H - PAD_T - PAD_B;

const PERIODS = ["1D", "5D", "1M", "6M", "YTD", "1Y", "5Y", "All"] as const;
type Period = typeof PERIODS[number];

type IntradayPoint = { time: string; close: number };

function fmtY(v: number, currency: string): string {
  if (currency === "KRW") {
    if (v >= 1_000_000) return `₩${(v / 1_000_000).toFixed(1)}M`;
    if (v >= 1_000) return `₩${Math.round(v / 1_000)}K`;
    return `₩${Math.round(v)}`;
  }
  if (v >= 1_000) return `$${(v / 1_000).toFixed(1)}K`;
  return `$${v.toFixed(0)}`;
}

function periodStart(period: Period): string {
  const now = new Date();
  switch (period) {
    case "5D":  { const d = new Date(now); d.setDate(d.getDate() - 8); return d.toISOString().slice(0, 10); }
    case "1M":  { const d = new Date(now); d.setMonth(d.getMonth() - 1); return d.toISOString().slice(0, 10); }
    case "6M":  { const d = new Date(now); d.setMonth(d.getMonth() - 6); return d.toISOString().slice(0, 10); }
    case "YTD": return `${now.getFullYear()}-01-01`;
    case "1Y":  { const d = new Date(now); d.setFullYear(d.getFullYear() - 1); return d.toISOString().slice(0, 10); }
    case "5Y":
    case "All":
    case "1D":  return "";
  }
}

function xLabelForPeriod(date: string, period: Period): string {
  const d = new Date(date + "T00:00:00");
  switch (period) {
    case "5D":
    case "1M":  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    case "6M":  return d.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
    case "YTD": return d.toLocaleDateString("en-US", { month: "short" });
    case "1Y":  return d.getMonth() === 0 ? d.getFullYear().toString() : d.toLocaleDateString("en-US", { month: "short" });
    case "5Y":
    case "All": return d.getFullYear().toString();
    case "1D":  return "";
  }
}

// Pick N evenly-spaced tick positions for guaranteed even spacing
function computeXLabels(
  data: { date: string }[],
  period: Period,
): { idx: number; label: string }[] {
  const n = data.length;
  if (!n) return [];

  const targets: Record<Period, number> = {
    "1D": 5, "5D": Math.min(n, 5), "1M": 5,
    "6M": 6, "YTD": 6, "1Y": 6, "5Y": 6, "All": 6,
  };
  const count = targets[period];
  if (n <= count) {
    return data.map((d, i) => ({ idx: i, label: xLabelForPeriod(d.date, period) }));
  }

  const labels: { idx: number; label: string }[] = [];
  for (let i = 0; i < count; i++) {
    const idx = Math.round((i / (count - 1)) * (n - 1));
    labels.push({ idx, label: xLabelForPeriod(data[idx].date, period) });
  }
  return labels;
}

function SVGChart({
  points,
  xLabels,
  currency,
  symbol,
  lineColor,
}: {
  points: { close: number }[];
  xLabels: { idx: number; label: string }[];
  currency: string;
  symbol: string;
  lineColor: string;
}) {
  if (points.length < 2) return (
    <div className="h-[160px] flex items-center justify-center text-[12px] text-gray-400">
      Not enough data
    </div>
  );

  const closes = points.map((p) => p.close);
  const rawMin = Math.min(...closes);
  const rawMax = Math.max(...closes);
  const rangePad = (rawMax - rawMin || rawMax * 0.05) * 0.1;
  const min = rawMin - rangePad;
  const max = rawMax + rangePad;
  const totalRange = max - min;

  const toX = (i: number) => PAD_L + (i / Math.max(points.length - 1, 1)) * PW;
  const toY = (v: number) => PAD_T + (1 - (v - min) / totalRange) * PH;

  const linePath = points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${toX(i).toFixed(1)} ${toY(p.close).toFixed(1)}`)
    .join(" ");
  const areaPath =
    linePath +
    ` L ${toX(points.length - 1).toFixed(1)} ${(PAD_T + PH).toFixed(1)}` +
    ` L ${PAD_L.toFixed(1)} ${(PAD_T + PH).toFixed(1)} Z`;

  const gradientId = `pg-${symbol.replace(/[^a-z0-9]/gi, "")}`;
  const yLevels = [0, 0.33, 0.67, 1].map((t) => ({
    y: toY(min + t * totalRange),
    value: min + t * totalRange,
  }));

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" preserveAspectRatio="xMidYMid meet">
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={lineColor} stopOpacity="0.15" />
          <stop offset="100%" stopColor={lineColor} stopOpacity="0.01" />
        </linearGradient>
      </defs>
      {yLevels.map((l, i) => (
        <line key={i} x1={PAD_L} y1={l.y.toFixed(1)} x2={W - PAD_R} y2={l.y.toFixed(1)}
          stroke="rgba(107,114,128,0.1)" strokeWidth="1" />
      ))}
      <path d={areaPath} fill={`url(#${gradientId})`} />
      <path d={linePath} fill="none" stroke={lineColor} strokeWidth="1.5"
        strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={toX(points.length - 1).toFixed(1)} cy={toY(closes[closes.length - 1]).toFixed(1)}
        r="3" fill={lineColor} />
      {yLevels.map((l, i) => (
        <text key={i} x={PAD_L - 6} y={(l.y + 4).toFixed(1)}
          textAnchor="end" fontSize="11" fill="rgba(107,114,128,0.7)">
          {fmtY(l.value, currency)}
        </text>
      ))}
      {xLabels.map((l, i) => (
        <text key={i} x={toX(l.idx).toFixed(1)} y={(H - 4).toFixed(1)}
          textAnchor="middle" fontSize="11" fill="rgba(107,114,128,0.7)">
          {l.label}
        </text>
      ))}
    </svg>
  );
}

export function PriceChart({
  data,
  symbol,
  currency = "USD",
}: {
  data: PricePoint[];
  symbol: string;
  currency?: string;
}) {
  const [period, setPeriod] = useState<Period>("1Y");
  const [intraday, setIntraday] = useState<IntradayPoint[] | null>(null);
  const [intradayLoading, setIntradayLoading] = useState(false);

  useEffect(() => {
    if (period !== "1D") return;
    if (intraday !== null) return; // already fetched
    setIntradayLoading(true);
    fetch(`/api/company-chart?symbol=${encodeURIComponent(symbol)}`)
      .then((r) => r.json())
      .then((d: IntradayPoint[]) => { setIntraday(d); setIntradayLoading(false); })
      .catch(() => { setIntraday([]); setIntradayLoading(false); });
  }, [period, symbol, intraday]);

  // Filter daily data to the selected period window
  const winStart = periodStart(period);
  const filteredDaily = winStart
    ? data.filter((p) => p.date >= winStart)
    : data;

  // What points to render
  const isIntraday = period === "1D";
  const points: { close: number }[] = isIntraday
    ? (intraday ?? [])
    : filteredDaily;

  // % change for the header
  const firstClose = points[0]?.close ?? 0;
  const lastClose = points[points.length - 1]?.close ?? 0;
  const changePct = firstClose ? ((lastClose - firstClose) / firstClose) * 100 : 0;
  const isUp = changePct >= 0;
  const lineColor = isUp ? "#059669" : "#e11d48";

  // X-axis labels (only for daily view; intraday uses time strings on x-axis)
  const xLabels: { idx: number; label: string }[] = isIntraday
    ? (intraday ?? [])
        .map((p, i) => ({ idx: i, label: p.time }))
        .filter((_, i, arr) => i === 0 || i === Math.floor(arr.length / 3) || i === Math.floor(arr.length * 2 / 3) || i === arr.length - 1)
    : computeXLabels(filteredDaily, period);

  if (data.length < 2) return null;

  return (
    <div className="mb-6">
      {/* Header: label + period buttons + change % */}
      <div className="flex items-center justify-between mb-2 px-0.5">
        <div className="flex items-center gap-1">
          {PERIODS.map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className="px-2 py-0.5 text-[11px] font-semibold rounded transition-colors"
              style={{
                background: period === p ? "#1e40af" : "transparent",
                color: period === p ? "#fff" : "#6B7280",
              }}
            >
              {p}
            </button>
          ))}
        </div>
        <span className={`text-sm font-semibold tabular-nums ${isUp ? "text-emerald-600" : "text-rose-600"}`}>
          {isUp ? "+" : ""}{changePct.toFixed(1)}%
        </span>
      </div>

      <div className="rounded-xl border border-[#DDDBD2] bg-white p-3">
        {intradayLoading ? (
          <div className="h-[190px] flex items-center justify-center text-[12px] text-gray-400">
            Loading…
          </div>
        ) : (
          <SVGChart
            points={points}
            xLabels={xLabels}
            currency={currency}
            symbol={symbol}
            lineColor={lineColor}
          />
        )}
      </div>
    </div>
  );
}
