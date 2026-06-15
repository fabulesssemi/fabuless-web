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
    <span className={`inline-block text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded border ${
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
      className={`group px-3 py-1.5 rounded-full text-[12px] font-bold transition-all duration-150 select-none ${
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

  const visibleUpcoming = selected ? upcoming.filter((u) => u.ticker === selected) : upcoming;
  const visiblePast = selected ? pastRows.filter((r) => r.ticker === selected) : pastRows;
  const isEmpty = visibleUpcoming.length === 0 && visiblePast.length === 0;

  return (
    <div>
      {/* Ticker filter pills */}
      <div className="flex items-center gap-2 flex-wrap mb-6">
        <button
          onClick={() => setSelected(null)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-bold transition-all duration-150 select-none ${
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

      {/* Upcoming */}
      {visibleUpcoming.length > 0 && (
        <section className="mb-10">
          <div className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-3">Upcoming</div>
          <div className="space-y-2">
            {visibleUpcoming.map((u) => (
              <div
                key={u.ticker}
                className="relative flex items-center gap-4 bg-white border border-[#E5E7EB] px-5 py-3.5 overflow-hidden hover:border-gray-300 transition-colors"
              >
                <div
                  className="absolute left-0 top-0 bottom-0 w-[3px]"
                  style={{ backgroundColor: colorMap[u.ticker] ?? "#9CA3AF" }}
                />
                <span
                  className="text-[10px] font-bold px-2 py-0.5 rounded-full border shrink-0"
                  style={{
                    color: colorMap[u.ticker],
                    borderColor: (colorMap[u.ticker] ?? "#9CA3AF") + "33",
                    backgroundColor: (colorMap[u.ticker] ?? "#9CA3AF") + "12",
                  }}
                >
                  {u.ticker}
                </span>
                <span className="font-sans text-[13px] font-semibold text-[#111827] flex-1">{u.name}</span>
                <span className="text-[12px] text-gray-500 shrink-0">{u.label}</span>
                <span className={`text-[11px] font-bold tabular-nums shrink-0 ${u.daysAway <= 7 ? "text-amber-600" : "text-gray-400"}`}>
                  {u.daysAway === 0 ? "Today" : u.daysAway === 1 ? "Tomorrow" : `${u.daysAway}d away`}
                </span>
                {u.hasPreview ? (
                  <Link
                    href={`/earnings/${u.ticker.toLowerCase()}${u.hParam}`}
                    className="shrink-0 text-[11px] font-semibold text-[#B45309] hover:underline"
                  >
                    Deep dive →
                  </Link>
                ) : (
                  <span className="shrink-0 text-[11px] text-gray-300">No preview yet</span>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Past results */}
      {visiblePast.length > 0 && (
        <section>
          <div className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-3">Past Results</div>
          <div className="space-y-10">
            {visiblePast.map(({ ticker, name, summaries }) => (
              <div key={ticker}>
                <div
                  className="flex items-center gap-3 mb-4 pb-3 border-b border-gray-100"
                >
                  <span
                    className="text-[10px] font-bold px-2 py-0.5 rounded-full border"
                    style={{
                      color: colorMap[ticker],
                      borderColor: (colorMap[ticker] ?? "#9CA3AF") + "33",
                      backgroundColor: (colorMap[ticker] ?? "#9CA3AF") + "12",
                    }}
                  >
                    {ticker}
                  </span>
                  <span className="font-sans text-[15px] font-bold text-[#111827]">{name}</span>
                </div>

                <div className="space-y-4">
                  {summaries.map((s) => (
                    <div
                      key={s.quarter}
                      className="relative bg-white border border-[#E5E7EB] p-5 overflow-hidden hover:border-gray-300 transition-colors"
                    >
                      <div
                        className="absolute left-0 top-0 bottom-0 w-[3px]"
                        style={{ backgroundColor: colorMap[ticker] ?? "#9CA3AF" }}
                      />
                      <div className="pl-1">
                        <div className="flex items-center gap-3 mb-3 flex-wrap">
                          <span className="font-sans text-[13px] font-bold text-[#111827]">{s.quarter}</span>
                          <span className="text-[11px] text-gray-400">{s.date}</span>
                          <BeatBadge surprisePct={s.surprisePct} />
                          {s.priceMoveDay !== null && (
                            <span className={`text-[11px] font-semibold tabular-nums ${s.priceMoveDay >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                              {s.priceMoveDay >= 0 ? "+" : ""}{s.priceMoveDay.toFixed(1)}% day-of
                            </span>
                          )}
                        </div>

                        {(s.epsActual !== null || s.epsEstimate !== null) && (
                          <div className="flex items-center gap-6 mb-3 text-[12px]">
                            {s.epsActual !== null && (
                              <div>
                                <span className="text-gray-400 mr-1">EPS actual</span>
                                <span className="font-bold text-[#111827] tabular-nums">${s.epsActual.toFixed(2)}</span>
                              </div>
                            )}
                            {s.epsEstimate !== null && (
                              <div>
                                <span className="text-gray-400 mr-1">vs est.</span>
                                <span className="font-bold text-gray-600 tabular-nums">${s.epsEstimate.toFixed(2)}</span>
                              </div>
                            )}
                            {s.revActual !== null && (
                              <div>
                                <span className="text-gray-400 mr-1">Revenue</span>
                                <span className="font-bold text-[#111827] tabular-nums">${(s.revActual / 1000).toFixed(1)}B</span>
                              </div>
                            )}
                          </div>
                        )}

                        {s.summary && (
                          <p className="font-serif text-[13px] text-[#4a4a4a] leading-relaxed">{s.summary}</p>
                        )}

                        {s.keyQuote && (
                          <blockquote className="mt-3 pl-3 border-l-2 border-amber-400 font-serif text-[12px] text-gray-500 italic leading-relaxed">
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
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
