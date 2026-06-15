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

function ratingStyle(r: string): { label: string; cls: string } {
  if (BULL.has(r)) return { label: "BUY",  cls: "text-emerald-600 font-bold" };
  if (BEAR.has(r)) return { label: "SELL", cls: "text-rose-500 font-bold" };
  return               { label: "HOLD", cls: "text-gray-400 font-semibold" };
}

const ACTION_LABEL: Record<string, string> = {
  init: "Initiated", up: "Upgraded", down: "Downgraded",
  main: "Maintained", reit: "Reiterated", resume: "Resumed",
};

function TickerPill({
  ticker,
  color,
  count,
  active,
  onClick,
}: {
  ticker: string;
  color: string;
  count: number;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`group relative flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-bold transition-all duration-150 select-none ${
        active
          ? "bg-[#111827] text-white shadow-sm"
          : "bg-white border border-gray-200 text-gray-500 hover:border-gray-400 hover:text-gray-800"
      }`}
    >
      {ticker}
      <span className={`text-[10px] font-semibold tabular-nums ${
        active ? "text-gray-300" : "text-gray-400 group-hover:text-gray-500"
      }`}>{count}</span>
    </button>
  );
}

function AnalystCard({ entry, tickerColor }: { entry: AnalystEntry; tickerColor: string }) {
  const rs = ratingStyle(entry.rating);
  const actionStr = ACTION_LABEL[entry.action] ?? "Assigned";
  const upside = entry.upsidePct;

  return (
    <div className="relative bg-white border border-[#E5E7EB] overflow-hidden hover:border-gray-300 transition-colors">
      {/* Ticker color bar */}
      <div className="absolute left-0 top-0 bottom-0 w-[3px]" style={{ backgroundColor: tickerColor }} />

      <div className="pl-5 pr-5 pt-4 pb-3.5">
        {/* Header row */}
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          {/* Ticker */}
          <span
            className="text-[10px] font-bold px-2 py-0.5 rounded-full border shrink-0"
            style={{ color: tickerColor, borderColor: tickerColor + "33", backgroundColor: tickerColor + "12" }}
          >
            {entry.ticker}
          </span>
          {/* Analyst name */}
          <span
            className="text-[11px] font-bold uppercase tracking-wider shrink-0"
            style={{ color: entry.accent }}
          >
            {entry.analystName}
          </span>
          {/* Firm */}
          <span className="text-[11px] text-gray-400 shrink-0">{entry.firm}</span>
          {/* Date */}
          {entry.date && (
            <span className="text-[10px] text-gray-300 ml-auto shrink-0">{entry.date}</span>
          )}
        </div>

        {/* Data row */}
        <div className="flex items-baseline gap-5 flex-wrap">
          {/* Rating */}
          <div className="flex flex-col gap-0.5">
            <span className="text-[9px] uppercase tracking-widest text-gray-400 font-semibold">Rating</span>
            <span className={`text-[13px] ${rs.cls}`}>{rs.label}</span>
          </div>

          {/* Action */}
          <div className="flex flex-col gap-0.5">
            <span className="text-[9px] uppercase tracking-widest text-gray-400 font-semibold">Action</span>
            <span className="text-[13px] font-semibold text-[#111827]">{actionStr}</span>
          </div>

          {/* Price target */}
          {entry.priceTarget !== null && (
            <div className="flex flex-col gap-0.5">
              <span className="text-[9px] uppercase tracking-widest text-gray-400 font-semibold">Price Target</span>
              <span className="text-[13px] font-bold text-[#111827] tabular-nums">${entry.priceTarget}</span>
            </div>
          )}

          {/* Upside */}
          {upside !== null && entry.currentPrice !== null && (
            <div className="flex flex-col gap-0.5">
              <span className="text-[9px] uppercase tracking-widest text-gray-400 font-semibold">Upside</span>
              <span className={`text-[13px] font-bold tabular-nums ${upside >= 0 ? "text-emerald-600" : "text-rose-500"}`}>
                {upside >= 0 ? "+" : ""}{upside.toFixed(1)}%
              </span>
            </div>
          )}

          {/* Current price */}
          {entry.currentPrice !== null && (
            <div className="flex flex-col gap-0.5">
              <span className="text-[9px] uppercase tracking-widest text-gray-400 font-semibold">Current</span>
              <span className="text-[13px] text-gray-500 tabular-nums">${entry.currentPrice.toFixed(2)}</span>
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
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const toggle = (ticker: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(ticker)) next.delete(ticker); else next.add(ticker);
      return next;
    });
  };

  const countPerTicker = useMemo(() => {
    const m: Record<string, number> = {};
    for (const t of tickers) m[t] = entries.filter((e) => e.ticker === t).length;
    return m;
  }, [entries, tickers]);

  const filtered = useMemo(
    () => selected.size === 0 ? entries : entries.filter((e) => selected.has(e.ticker)),
    [entries, selected]
  );

  // Aggregate: avg target per filtered ticker
  const avgTarget = useMemo(() => {
    const targets = filtered.map((e) => e.priceTarget).filter((t): t is number => t !== null);
    return targets.length ? Math.round(targets.reduce((a, b) => a + b) / targets.length) : null;
  }, [filtered]);

  const bullCount = filtered.filter((e) => BULL.has(e.rating)).length;
  const bearCount = filtered.filter((e) => BEAR.has(e.rating)).length;
  const holdCount = filtered.length - bullCount - bearCount;

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
      <div className="flex items-center gap-2 flex-wrap mb-5">
        <button
          onClick={() => setSelected(new Set())}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-bold transition-all duration-150 select-none ${
            selected.size === 0
              ? "bg-[#111827] text-white shadow-sm"
              : "bg-white border border-gray-200 text-gray-500 hover:border-gray-400 hover:text-gray-800"
          }`}
        >
          All
          <span className={`text-[10px] font-semibold tabular-nums ${selected.size === 0 ? "text-gray-300" : "text-gray-400"}`}>
            {entries.length}
          </span>
        </button>
        <div className="w-px h-5 bg-gray-200 mx-1" />
        {tickers.filter((t) => (countPerTicker[t] ?? 0) > 0).map((ticker) => (
          <TickerPill
            key={ticker}
            ticker={ticker}
            color={colorMap[ticker]}
            count={countPerTicker[ticker] ?? 0}
            active={selected.has(ticker)}
            onClick={() => toggle(ticker)}
          />
        ))}
      </div>

      {/* Stats strip */}
      <div className="flex items-center gap-6 mb-5 py-3 px-4 bg-gray-50 border border-gray-100 rounded-lg flex-wrap">
        <div className="text-[11px]">
          <span className="text-gray-400 mr-1.5">Buy</span>
          <span className="font-bold text-emerald-600 tabular-nums">{bullCount}</span>
        </div>
        <div className="text-[11px]">
          <span className="text-gray-400 mr-1.5">Hold</span>
          <span className="font-bold text-gray-500 tabular-nums">{holdCount}</span>
        </div>
        <div className="text-[11px]">
          <span className="text-gray-400 mr-1.5">Sell</span>
          <span className="font-bold text-rose-500 tabular-nums">{bearCount}</span>
        </div>
        {avgTarget !== null && (
          <div className="text-[11px]">
            <span className="text-gray-400 mr-1.5">Avg. target</span>
            <span className="font-bold text-[#111827] tabular-nums">${avgTarget}</span>
          </div>
        )}
        {selected.size > 0 && (
          <button
            onClick={() => setSelected(new Set())}
            className="ml-auto text-[10px] text-gray-400 hover:text-gray-700 font-semibold transition-colors"
          >
            Clear filter ×
          </button>
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
