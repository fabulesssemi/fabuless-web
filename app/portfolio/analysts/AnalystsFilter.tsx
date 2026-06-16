"use client";

import { useState, useMemo } from "react";

type AnalystEntry = {
  ticker: string;
  companyName: string;
  analystId: string;
  analystName: string;
  firm: string;
  accent: string;
  rating: string;
  priceTarget: number | null;
  currentPrice: number | null;
  upsidePct: number | null;
  action: string;
  date: string | null;
};

const BULL = new Set(["Buy", "Strong Buy", "Outperform", "Overweight", "Positive"]);
const BEAR = new Set(["Sell", "Underperform", "Underweight", "Negative"]);

function getRatingTier(r: string): "buy" | "hold" | "sell" {
  if (BULL.has(r)) return "buy";
  if (BEAR.has(r)) return "sell";
  return "hold";
}

const RATING_BAR_COLOR = { buy: "#34d399", hold: "#d1d5db", sell: "#f87171" };
const RATING_BADGE = {
  buy:  { label: "BUY",  cls: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  sell: { label: "SELL", cls: "bg-red-50 text-red-700 border-red-200" },
  hold: { label: "HOLD", cls: "bg-gray-100 text-gray-500 border-gray-200" },
};

// Only show a badge for actions that change the narrative
const ACTION_BADGE: Record<string, { label: string; cls: string }> = {
  init:   { label: "Initiated",   cls: "bg-amber-50 text-amber-700 border-amber-200" },
  up:     { label: "Upgraded",    cls: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  down:   { label: "Downgraded",  cls: "bg-red-50 text-red-700 border-red-200" },
  resume: { label: "Resumed",     cls: "bg-indigo-50 text-indigo-700 border-indigo-200" },
};

function getDaysAgo(dateStr: string | null): number | null {
  if (!dateStr) return null;
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return null;
    return Math.floor((Date.now() - d.getTime()) / 86_400_000);
  } catch { return null; }
}

function TickerPill({ ticker, active, onClick }: { ticker: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded-full text-[12px] font-bold transition-all duration-150 select-none ${
        active
          ? "bg-[#111827] text-white shadow-sm"
          : "bg-white border border-gray-200 text-gray-500 hover:border-gray-400 hover:text-gray-800"
      }`}
    >
      {ticker}
    </button>
  );
}

function AnalystCard({ entry, tickerColor }: { entry: AnalystEntry; tickerColor: string }) {
  const tier = getRatingTier(entry.rating);
  const badge = RATING_BADGE[tier];
  const actionBadge = ACTION_BADGE[entry.action] ?? null;
  const daysAgo = getDaysAgo(entry.date);
  const dateCls =
    daysAgo !== null && daysAgo <= 30
      ? "text-[#B45309] font-semibold"         // fresh — amber
      : daysAgo !== null && daysAgo <= 90
      ? "text-gray-400"                          // normal
      : "text-gray-300";                         // stale — recedes

  return (
    <div className="relative bg-white border border-[#E5E7EB] overflow-hidden hover:border-gray-300 transition-colors">
      {/* Left bar — rating color, not ticker color */}
      <div
        className="absolute left-0 top-0 bottom-0 w-[3px]"
        style={{ backgroundColor: RATING_BAR_COLOR[tier] }}
      />

      <div className="pl-5 pr-5 pt-4 pb-3.5">
        {/* Header: analyst identity + date + action badge */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2.5 flex-wrap min-w-0">
            {/* Analyst name — credibility anchor */}
            <span
              className="font-sans text-[14px] font-bold leading-none"
              style={{ color: entry.accent }}
            >
              {entry.analystName}
            </span>
            {/* Firm */}
            <span className="text-[11px] text-gray-500 shrink-0">{entry.firm}</span>
            {/* Ticker chip — supporting context */}
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#111827] text-white border border-[#111827] shrink-0">
              {entry.ticker}
            </span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Date — color reflects recency */}
            {entry.date && (
              <span className={`text-[10px] tabular-nums ${dateCls}`}>{entry.date}</span>
            )}
            {/* Action badge — only when meaningful */}
            {actionBadge && (
              <span className={`text-[9px] font-bold uppercase tracking-wide px-2 py-0.5 border ${actionBadge.cls}`}>
                {actionBadge.label}
              </span>
            )}
          </div>
        </div>

        {/* Data row: Rating | Price Target + Upside | Current */}
        <div className="flex items-end gap-8 flex-wrap">
          {/* Rating badge */}
          <div>
            <div className="text-[9px] font-bold uppercase tracking-widest text-gray-400 mb-1">Rating</div>
            <span className={`text-[10px] font-bold px-2 py-0.5 border ${badge.cls}`}>
              {badge.label}
            </span>
          </div>

          {/* Price target + upside — stacked as a unit */}
          {entry.priceTarget !== null && (
            <div>
              <div className="text-[9px] font-bold uppercase tracking-widest text-gray-400 mb-1">Target</div>
              <span className="font-sans text-[1.1rem] font-bold text-[#111827] tabular-nums">
                ${entry.priceTarget}
              </span>
              {entry.upsidePct !== null && (
                <div className={`text-[10px] font-semibold tabular-nums mt-0.5 ${
                  entry.upsidePct >= 0 ? "text-emerald-600" : "text-rose-500"
                }`}>
                  {entry.upsidePct >= 0 ? "+" : ""}{entry.upsidePct.toFixed(1)}% implied
                </div>
              )}
            </div>
          )}

          {/* Current price — context, not the call */}
          {entry.currentPrice !== null && (
            <div>
              <div className="text-[9px] font-bold uppercase tracking-widest text-gray-400 mb-1">Current</div>
              <span className="font-sans text-[1.1rem] font-semibold text-gray-400 tabular-nums">
                ${entry.currentPrice.toFixed(2)}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function AnalystsFilter({
  entries,
  tickers,
  colorMap,
}: {
  entries: AnalystEntry[];
  tickers: string[];
  colorMap: Record<string, string>;
}) {
  const [selected, setSelected] = useState<string | null>(null);

  const filtered = useMemo(
    () => (selected === null ? entries : entries.filter((e) => e.ticker === selected)),
    [entries, selected]
  );

  const bullCount = filtered.filter((e) => BULL.has(e.rating)).length;
  const bearCount = filtered.filter((e) => BEAR.has(e.rating)).length;
  const holdCount = filtered.length - bullCount - bearCount;
  const total = filtered.length;
  const bullPct = total ? Math.round((bullCount / total) * 100) : 0;
  const holdPct = total ? Math.round((holdCount / total) * 100) : 0;
  const bearPct = 100 - bullPct - holdPct;

  const { avgTarget, lowTarget, highTarget } = useMemo(() => {
    const targets = filtered.map((e) => e.priceTarget).filter((t): t is number => t !== null);
    if (!targets.length) return { avgTarget: null, lowTarget: null, highTarget: null };
    return {
      avgTarget: Math.round(targets.reduce((a, b) => a + b) / targets.length),
      lowTarget: Math.min(...targets),
      highTarget: Math.max(...targets),
    };
  }, [filtered]);

  if (entries.length === 0) {
    return (
      <div className="text-center py-16 text-gray-400 font-serif text-[15px]">
        No analyst coverage found for your holdings.
      </div>
    );
  }

  return (
    <div>
      {/* Filter bar */}
      <div className="flex items-center gap-2 flex-wrap mb-6">
        <button
          onClick={() => setSelected(null)}
          className={`px-3 py-1.5 rounded-full text-[12px] font-bold transition-all duration-150 select-none ${
            selected === null
              ? "bg-[#111827] text-white shadow-sm"
              : "bg-white border border-gray-200 text-gray-500 hover:border-gray-400 hover:text-gray-800"
          }`}
        >
          All
        </button>
        <div className="w-px h-5 bg-gray-200 mx-1" />
        {tickers.map((ticker) => (
          <TickerPill
            key={ticker}
            ticker={ticker}
            active={selected === ticker}
            onClick={() => setSelected((prev) => (prev === ticker ? null : ticker))}
          />
        ))}
        {selected !== null && (
          <button
            onClick={() => setSelected(null)}
            className="ml-auto text-[10px] text-gray-400 hover:text-gray-700 font-semibold transition-colors"
          >
            Clear ×
          </button>
        )}
      </div>

      {/* ── Consensus snapshot ─────────────────────────────────────────── */}
      <div className="border-t-2 border-[#111827] pt-2 mb-7">
        <div className="flex items-center gap-2 mb-3">
          <span className="font-sans text-[13px] font-bold text-[#111827] uppercase tracking-tight">
            Analyst Consensus
          </span>
          <span className="text-[10px] text-gray-300">·</span>
          <span className="text-[11px] text-gray-400">{filtered.length} analysts</span>
        </div>

        {/* Distribution bar */}
        <div className="flex items-center gap-4 mb-3">
          <div className="flex w-48 h-1.5 rounded-full overflow-hidden bg-gray-100">
            {bullPct > 0 && <div style={{ width: `${bullPct}%` }} className="bg-emerald-400" />}
            {holdPct > 0 && <div style={{ width: `${holdPct}%` }} className="bg-gray-300" />}
            {bearPct > 0 && <div style={{ width: `${bearPct}%` }} className="bg-rose-400" />}
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            <span>
              <span className="font-bold text-emerald-600 tabular-nums">{bullCount}</span>
              <span className="text-gray-400 ml-1">Buy</span>
            </span>
            {holdCount > 0 && (
              <span>
                <span className="font-bold text-gray-500 tabular-nums">{holdCount}</span>
                <span className="text-gray-400 ml-1">Hold</span>
              </span>
            )}
            {bearCount > 0 && (
              <span>
                <span className="font-bold text-rose-500 tabular-nums">{bearCount}</span>
                <span className="text-gray-400 ml-1">Sell</span>
              </span>
            )}
          </div>
        </div>

        {/* PT range */}
        {avgTarget !== null && (
          <div className="flex items-center gap-3 text-[11px]">
            <span className="text-gray-400">Avg target</span>
            <span className="font-bold text-[#111827] tabular-nums">${avgTarget}</span>
            {lowTarget !== null && highTarget !== null && lowTarget !== highTarget && (
              <>
                <span className="text-gray-300">·</span>
                <span className="text-gray-400">Range</span>
                <span className="font-medium text-gray-600 tabular-nums">
                  ${lowTarget} – ${highTarget}
                </span>
              </>
            )}
          </div>
        )}
      </div>

      {/* Cards */}
      <div className="space-y-2">
        {filtered.map((entry, i) => (
          <AnalystCard
            key={`${entry.ticker}-${entry.analystId}-${i}`}
            entry={entry}
            tickerColor={colorMap[entry.ticker] ?? "#9CA3AF"}
          />
        ))}
      </div>
    </div>
  );
}
