"use client";

import { useState, useMemo } from "react";

type Call = {
  id: string;
  ticker: string;
  expert: string;
  expertAccent: string;
  date: string;
  claim: string;
  notes: string;
  status: "CORRECT" | "PARTIAL" | "WRONG" | "TOO_EARLY";
  horizon: string;
  source: string;
};

const STATUS_META = {
  CORRECT:   { label: "Correct",  bg: "bg-emerald-50",  text: "text-emerald-700", border: "border-emerald-200" },
  PARTIAL:   { label: "Partial",  bg: "bg-amber-50",    text: "text-amber-700",   border: "border-amber-200"  },
  WRONG:     { label: "Wrong",    bg: "bg-red-50",      text: "text-red-700",     border: "border-red-200"    },
  TOO_EARLY: { label: "Open",     bg: "bg-gray-100",    text: "text-gray-500",    border: "border-gray-200"   },
};

function TickerPill({
  ticker,
  active,
  onClick,
}: {
  ticker: string;
  active: boolean;
  onClick: () => void;
}) {
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

function CallCard({ call, tickerColor }: { call: Call; tickerColor: string }) {
  const meta = STATUS_META[call.status];
  return (
    <div className="relative bg-white border border-[#E5E7EB] overflow-hidden group hover:border-gray-300 transition-colors">
      {/* Left accent bar — ticker color */}
      <div className="absolute left-0 top-0 bottom-0 w-[3px]" style={{ backgroundColor: tickerColor }} />

      <div className="pl-5 pr-5 pt-4 pb-3.5">
        {/* Top row */}
        <div className="flex items-center gap-2 mb-2.5 flex-wrap">
          {/* Ticker chip */}
          <span
            className="text-[10px] font-bold px-2 py-0.5 rounded-full border"
            style={{ color: tickerColor, borderColor: tickerColor + "33", backgroundColor: tickerColor + "12" }}
          >
            {call.ticker}
          </span>
          {/* Expert */}
          <span
            className="text-[11px] font-bold uppercase tracking-wider"
            style={{ color: call.expertAccent }}
          >
            {call.expert}
          </span>
          {/* Date */}
          <span className="text-[11px] text-gray-400">{call.date}</span>
          {/* Status */}
          <span className={`ml-auto text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded border ${meta.bg} ${meta.text} ${meta.border}`}>
            {meta.label}
          </span>
        </div>

        {/* Claim */}
        <p className="font-serif text-[13.5px] text-[#111827] leading-relaxed">{call.claim}</p>

        {/* Notes */}
        {call.notes && (
          <p className="mt-1.5 font-serif text-[12px] text-gray-400 leading-relaxed">{call.notes}</p>
        )}

        {/* Footer */}
        <div className="mt-3 flex items-center gap-4">
          {call.horizon && (
            <span className="text-[10px] text-gray-300 font-medium">{call.horizon}</span>
          )}
          {call.source && (
            <a
              href={call.source}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[10px] text-gray-300 hover:text-[#B45309] font-semibold transition-colors"
            >
              Source →
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

export function ExpertCallsFilter({
  calls,
  tickers,
  colorMap,
}: {
  calls: Call[];
  tickers: string[];
  colorMap: Record<string, string>;
}) {
  const [selected, setSelected] = useState<string | null>(null);

  const toggle = (ticker: string) =>
    setSelected((prev) => (prev === ticker ? null : ticker));

  const filtered = useMemo(
    () => selected === null ? calls : calls.filter((c) => c.ticker === selected),
    [calls, selected]
  );

  const openCount = filtered.filter((c) => c.status === "TOO_EARLY").length;
  const resolvedCount = filtered.filter((c) => c.status !== "TOO_EARLY").length;
  const correctCount = filtered.filter((c) => c.status === "CORRECT").length;
  const accuracy = resolvedCount > 0 ? Math.round((correctCount / resolvedCount) * 100) : null;

  if (calls.length === 0) {
    return (
      <div className="text-center py-16 text-gray-400 font-serif text-[15px]">
        No expert calls found for your holdings.
      </div>
    );
  }

  return (
    <div>
      {/* Filter bar */}
      <div className="flex items-center gap-2 flex-wrap mb-5">
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
            onClick={() => toggle(ticker)}
          />
        ))}
      </div>

      {/* Stats strip */}
      <div className="flex items-center gap-6 mb-5 py-3 px-4 bg-gray-50 border border-gray-100 rounded-lg">
        <div className="text-[11px]">
          <span className="text-gray-400 mr-1.5">Open calls</span>
          <span className="font-bold text-[#111827] tabular-nums">{openCount}</span>
        </div>
        <div className="text-[11px]">
          <span className="text-gray-400 mr-1.5">Resolved</span>
          <span className="font-bold text-[#111827] tabular-nums">{resolvedCount}</span>
        </div>
        {accuracy !== null && (
          <div className="text-[11px]">
            <span className="text-gray-400 mr-1.5">Accuracy</span>
            <span className={`font-bold tabular-nums ${accuracy >= 70 ? "text-emerald-600" : accuracy >= 50 ? "text-amber-600" : "text-red-500"}`}>
              {accuracy}%
            </span>
          </div>
        )}
        {selected !== null && (
          <button
            onClick={() => setSelected(null)}
            className="ml-auto text-[10px] text-gray-400 hover:text-gray-700 font-semibold transition-colors"
          >
            Clear filter ×
          </button>
        )}
      </div>

      {/* Cards */}
      <div className="space-y-2">
        {filtered.map((call) => (
          <CallCard key={call.id} call={call} tickerColor={colorMap[call.ticker] ?? "#9CA3AF"} />
        ))}
      </div>
    </div>
  );
}
