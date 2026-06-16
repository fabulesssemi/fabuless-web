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
  CORRECT:   { label: "Correct", bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200", barColor: "#34d399" },
  PARTIAL:   { label: "Partial", bg: "bg-amber-50",   text: "text-amber-700",   border: "border-amber-200",  barColor: "#fbbf24" },
  WRONG:     { label: "Wrong",   bg: "bg-red-50",     text: "text-red-700",     border: "border-red-200",    barColor: "#f87171" },
  TOO_EARLY: { label: "Open",    bg: "bg-gray-100",   text: "text-gray-600",    border: "border-gray-300",   barColor: "#B45309" },
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
  const isOpen = call.status === "TOO_EARLY";

  return (
    <div className="relative bg-white border border-[#E5E7EB] overflow-hidden hover:border-gray-300 transition-colors">
      {/* Left accent bar — status-driven, not ticker color */}
      <div
        className="absolute left-0 top-0 bottom-0 w-[3px]"
        style={{ backgroundColor: meta.barColor }}
      />

      <div className="pl-5 pr-5 pt-4 pb-3.5">
        {/* Row 1: Expert (dominant) + ticker chip + status badge */}
        <div className="flex items-center justify-between gap-3 mb-2.5">
          <div className="flex items-center gap-2.5 flex-wrap min-w-0">
            {/* Expert name — credibility anchor, most prominent element */}
            <span
              className="font-sans text-[14px] font-bold leading-none"
              style={{ color: call.expertAccent }}
            >
              {call.expert}
            </span>
            {/* Ticker chip — supporting context, not the lead */}
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-transparent text-[#B45309] border border-[#B45309] shrink-0">
              {call.ticker}
            </span>
          </div>
          {/* Status badge — right-aligned, always visible */}
          <span className={`shrink-0 text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 border ${meta.bg} ${meta.text} ${meta.border}`}>
            {meta.label}
          </span>
        </div>

        {/* Claim — the thesis, dominant */}
        <p className={`font-serif leading-snug ${
          isOpen
            ? "text-[14.5px] text-[#111827]"
            : "text-[13.5px] text-[#2d2d2d]"
        }`}>
          {call.claim}
        </p>

        {/* Notes — supporting context, secondary */}
        {call.notes && (
          <p className="font-serif text-[12.5px] text-gray-500 leading-relaxed mt-2">
            {call.notes}
          </p>
        )}

        {/* Footer: date · horizon pill · source */}
        <div className="mt-3 flex items-center gap-3 flex-wrap">
          <span className="text-[10px] text-gray-400 tabular-nums">{call.date}</span>
          {call.horizon && (
            <span className="text-[10px] font-medium px-2 py-0.5 border border-gray-200 text-gray-500">
              {call.horizon}
            </span>
          )}
          {call.source && (
            <a
              href={call.source}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[10px] font-semibold text-[#B45309] hover:underline transition-colors"
            >
              Source →
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

function SectionHeader({
  title,
  meta,
}: {
  title: string;
  meta: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-2 border-t-2 border-[#111827] pt-2 mb-5">
      <span className="font-sans text-[13px] font-bold text-[#111827] uppercase tracking-tight">
        {title}
      </span>
      {meta}
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
    () => (selected === null ? calls : calls.filter((c) => c.ticker === selected)),
    [calls, selected]
  );

  const activeCalls = filtered.filter((c) => c.status === "TOO_EARLY");
  const resolvedCalls = filtered.filter((c) => c.status !== "TOO_EARLY");
  const correctCount = resolvedCalls.filter((c) => c.status === "CORRECT").length;
  const accuracy =
    resolvedCalls.length > 0
      ? Math.round((correctCount / resolvedCalls.length) * 100)
      : null;

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
      <div className="flex items-center gap-2 flex-wrap mb-7">
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
        {selected !== null && (
          <button
            onClick={() => setSelected(null)}
            className="ml-auto text-[10px] text-gray-400 hover:text-gray-700 font-semibold transition-colors"
          >
            Clear ×
          </button>
        )}
      </div>

      {/* ── Active calls ───────────────────────────────────────────────── */}
      {activeCalls.length > 0 && (
        <section className="mb-10">
          <SectionHeader
            title="Active Calls"
            meta={
              <>
                <span className="text-[10px] text-gray-300">·</span>
                <span className="text-[11px] text-gray-400">
                  {activeCalls.length} open
                </span>
              </>
            }
          />
          <div className="space-y-2">
            {activeCalls.map((call) => (
              <CallCard
                key={call.id}
                call={call}
                tickerColor={colorMap[call.ticker] ?? "#9CA3AF"}
              />
            ))}
          </div>
        </section>
      )}

      {/* ── Track record ───────────────────────────────────────────────── */}
      {resolvedCalls.length > 0 && (
        <section>
          <SectionHeader
            title="Track Record"
            meta={
              <>
                <span className="text-[10px] text-gray-300">·</span>
                <span className="text-[11px] text-gray-400">
                  {resolvedCalls.length} resolved
                </span>
                {accuracy !== null && (
                  <>
                    <span className="text-[10px] text-gray-300">·</span>
                    <span
                      className={`text-[11px] font-bold tabular-nums ${
                        accuracy >= 70
                          ? "text-emerald-600"
                          : accuracy >= 50
                          ? "text-amber-600"
                          : "text-red-500"
                      }`}
                    >
                      {accuracy}% accuracy
                    </span>
                  </>
                )}
              </>
            }
          />
          <div className="space-y-2">
            {resolvedCalls.map((call) => (
              <CallCard
                key={call.id}
                call={call}
                tickerColor={colorMap[call.ticker] ?? "#9CA3AF"}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
