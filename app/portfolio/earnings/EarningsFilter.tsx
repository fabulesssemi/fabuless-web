"use client";

import { useState } from "react";
import Link from "next/link";

type UpcomingItem = {
  ticker: string;
  name: string;
  label: string;
  daysAway: number;
  hasPreview: boolean;
  hParam: string;
};

type EarningsSummary = {
  quarter: string;
  date: string;
  surprisePct: number | null;
  priceMoveDay: number | null;
  epsActual: number | null;
  epsEstimate: number | null;
  revActual: number | null;
  summary: string | null;
  keyQuote: string | null;
  transcriptUrl: string | null;
};

type PastRow = {
  ticker: string;
  name: string;
  summaries: EarningsSummary[];
};

function BeatBadge({ surprisePct }: { surprisePct: number | null }) {
  if (surprisePct === null) return null;
  const beat = surprisePct > 0;
  return (
    <span className={`inline-block text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 border ${
      beat
        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
        : "bg-red-50 text-red-700 border-red-200"
    }`}>
      {beat ? `Beat +${surprisePct.toFixed(1)}%` : `Miss ${surprisePct.toFixed(1)}%`}
    </span>
  );
}

function TickerPill({
  ticker,
  color,
  active,
  onClick,
}: {
  ticker: string;
  color: string;
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

export function EarningsFilter({
  tickers,
  colorMap,
  upcoming,
  pastRows,
}: {
  tickers: string[];
  colorMap: Record<string, string>;
  upcoming: UpcomingItem[];
  pastRows: PastRow[];
}) {
  const [selected, setSelected] = useState<string | null>(null);

  // Cross-reference pastRows to surface "Beat Last Q" on upcoming cards
  const lastBeat = new Map<string, boolean | null>();
  for (const row of pastRows) {
    if (row.summaries.length > 0 && row.summaries[0].surprisePct !== null) {
      lastBeat.set(row.ticker, row.summaries[0].surprisePct > 0);
    }
  }

  const visibleUpcoming = selected ? upcoming.filter((u) => u.ticker === selected) : upcoming;
  const visiblePast = selected ? pastRows.filter((r) => r.ticker === selected) : pastRows;
  const isEmpty = visibleUpcoming.length === 0 && visiblePast.length === 0;

  return (
    <div>
      {/* Ticker filter pills */}
      <div className="flex items-center gap-2 flex-wrap mb-8">
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
            color={colorMap[ticker] ?? "#9CA3AF"}
            active={selected === ticker}
            onClick={() => setSelected((prev) => (prev === ticker ? null : ticker))}
          />
        ))}
      </div>

      {isEmpty && (
        <div className="text-center py-16 text-gray-400 font-serif text-[15px]">
          No earnings data yet for {selected ?? "your holdings"}.<br />
          <span className="text-[13px]">Pipeline runs Mon / Wed / Fri.</span>
        </div>
      )}

      {/* ── Upcoming catalysts ─────────────────────────────────────────── */}
      {visibleUpcoming.length > 0 && (
        <section className="mb-12">
          <div className="flex items-center gap-2 border-t-2 border-[#111827] pt-2 mb-5">
            <span className="font-sans text-[13px] font-bold text-[#111827] uppercase tracking-tight">
              Upcoming
            </span>
            <span className="text-[10px] text-gray-300">·</span>
            <span className="text-[11px] text-gray-400">
              {visibleUpcoming.length} {visibleUpcoming.length === 1 ? "event" : "events"}
            </span>
          </div>

          <div className="space-y-3">
            {visibleUpcoming.map((u) => {
              const beat = lastBeat.get(u.ticker);
              const urgent = u.daysAway <= 7;
              const accent = colorMap[u.ticker] ?? "#9CA3AF";
              return (
                <div
                  key={u.ticker}
                  className="bg-white border border-[#E5E7EB] border-t-2 border-t-[#B45309] flex items-stretch overflow-hidden hover:border-gray-300 transition-colors"
                >
                  {/* Countdown — left-dominant event signal */}
                  <div className={`shrink-0 flex flex-col items-center justify-center w-[68px] border-r border-gray-100 py-4 ${urgent ? "text-[#B45309]" : "text-gray-400"}`}>
                    <span className="font-sans text-[1.6rem] font-bold leading-none tabular-nums">
                      {u.daysAway}
                    </span>
                    <span className="text-[9px] font-semibold uppercase tracking-widest mt-1">
                      {u.daysAway === 1 ? "day" : "days"}
                    </span>
                  </div>

                  {/* Company + date */}
                  <div className="flex flex-1 items-center gap-4 px-5 py-3.5">
                    <div className="flex items-center gap-2.5 flex-1 min-w-0">
                      <span
                        className="text-[10px] font-bold px-2 py-0.5 rounded-full border shrink-0"
                        style={{
                          color: accent,
                          borderColor: accent + "40",
                          backgroundColor: accent + "12",
                        }}
                      >
                        {u.ticker}
                      </span>
                      <span className="font-sans text-[14px] font-semibold text-[#111827] truncate">
                        {u.name}
                      </span>
                    </div>

                    {/* Right side: date + badges + action */}
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-[12px] text-gray-500 tabular-nums">{u.label}</span>

                      {beat === true && (
                        <span className="text-[9px] font-bold uppercase tracking-wide px-2 py-0.5 border border-emerald-200 bg-emerald-50 text-emerald-700">
                          Beat Last Q
                        </span>
                      )}

                      {u.hasPreview ? (
                        <Link
                          href={`/earnings/${u.ticker.toLowerCase()}${u.hParam}`}
                          className="text-[11px] font-semibold text-[#B45309] hover:underline"
                        >
                          Deep dive →
                        </Link>
                      ) : (
                        <span className="text-[10px] text-gray-300 italic">Brief pending</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* ── Past results ───────────────────────────────────────────────── */}
      {visiblePast.length > 0 && (
        <section>
          <div className="flex items-center gap-2 border-t-2 border-[#111827] pt-2 mb-7">
            <span className="font-sans text-[13px] font-bold text-[#111827] uppercase tracking-tight">
              Past Results
            </span>
          </div>

          <div className="space-y-10">
            {visiblePast.map(({ ticker, name, summaries }) => {
              const accent = colorMap[ticker] ?? "#9CA3AF";
              return (
                <div key={ticker}>
                  {/* Company header */}
                  <div className="flex items-center gap-3 mb-4 pb-3 border-b border-gray-100">
                    <span
                      className="text-[10px] font-bold px-2 py-0.5 rounded-full border shrink-0"
                      style={{
                        color: accent,
                        borderColor: accent + "40",
                        backgroundColor: accent + "12",
                      }}
                    >
                      {ticker}
                    </span>
                    <span className="font-sans text-[16px] font-bold text-[#111827]">{name}</span>
                    <span className="ml-auto text-[11px] text-gray-400 tabular-nums">
                      {summaries.length} {summaries.length === 1 ? "quarter" : "quarters"}
                    </span>
                  </div>

                  <div className="space-y-3">
                    {summaries.map((s) => (
                      <div
                        key={s.quarter}
                        className="bg-white border border-[#E5E7EB] border-t-2 border-t-[#B45309] p-5 hover:border-gray-300 transition-colors"
                      >
                        {/* Quarter header row */}
                        <div className="flex items-center gap-3 mb-4 flex-wrap">
                          <span className="font-sans text-[13px] font-bold text-[#111827]">{s.quarter}</span>
                          <span className="text-[11px] text-gray-400">{s.date}</span>
                          <BeatBadge surprisePct={s.surprisePct} />
                          {s.priceMoveDay !== null && (
                            <span className={`text-[11px] font-semibold tabular-nums ${s.priceMoveDay >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                              {s.priceMoveDay >= 0 ? "+" : ""}{s.priceMoveDay.toFixed(1)}% day-of
                            </span>
                          )}
                        </div>

                        {/* EPS / revenue block — enlarged, labeled, separated from narrative */}
                        {(s.epsActual !== null || s.epsEstimate !== null || s.revActual !== null) && (
                          <div className="flex items-end gap-8 mb-4 pb-4 border-b border-gray-100">
                            {s.epsActual !== null && (
                              <div>
                                <div className="text-[9px] font-bold uppercase tracking-widest text-gray-400 mb-1">EPS Actual</div>
                                <span className="font-sans text-[1.1rem] font-bold text-[#111827] tabular-nums">
                                  ${s.epsActual.toFixed(2)}
                                </span>
                              </div>
                            )}
                            {s.epsEstimate !== null && (
                              <div>
                                <div className="text-[9px] font-bold uppercase tracking-widest text-gray-400 mb-1">Consensus</div>
                                <span className="font-sans text-[1.1rem] font-semibold text-gray-400 tabular-nums">
                                  ${s.epsEstimate.toFixed(2)}
                                </span>
                              </div>
                            )}
                            {s.revActual !== null && (
                              <div>
                                <div className="text-[9px] font-bold uppercase tracking-widest text-gray-400 mb-1">Revenue</div>
                                <span className="font-sans text-[1.1rem] font-bold text-[#111827] tabular-nums">
                                  ${(s.revActual / 1000).toFixed(1)}B
                                </span>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Research narrative */}
                        {s.summary && (
                          <p className="font-serif text-[13.5px] text-[#4a4a4a] leading-[1.75]">
                            {s.summary}
                          </p>
                        )}

                        {/* Key quote — amber accent consistent with site system */}
                        {s.keyQuote && (
                          <blockquote className="mt-4 pl-3 border-l-2 border-[#B45309] font-serif text-[12px] text-gray-500 italic leading-relaxed">
                            "{s.keyQuote}"
                          </blockquote>
                        )}

                        {s.transcriptUrl && (
                          <a
                            href={s.transcriptUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-block mt-3 text-[11px] font-semibold text-[#B45309] hover:underline"
                          >
                            SEC filing →
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
