"use client";

import { useState, useEffect } from "react";
import { latestIssue, type EarningsRow } from "@/lib/issues";

export function EarningsCard() {
  const [earnings, setEarnings] = useState<EarningsRow[]>(latestIssue.earnings);
  const [live, setLive] = useState(false);

  useEffect(() => {
    fetch("/api/earnings")
      .then((r) => r.json())
      .then((data: EarningsRow[]) => {
        if (data.length > 0) { setEarnings(data); setLive(true); }
      })
      .catch(() => {/* keep static fallback */});
  }, []);

  return (
    <div className="w-fit shrink-0 hidden lg:block border border-[#DDDBD2] bg-white">
      <div className="border-b border-gray-200 px-4 py-1.5 flex items-start justify-between gap-2">
        <div>
          <div className="text-[10px] font-bold uppercase tracking-widest text-[#111827]">
            Upcoming Earnings
          </div>
          <div className="text-[10px] text-gray-400 mt-0.5 leading-snug">
            Avg stock move in the 2 trading days after the report · last 20 quarters
          </div>
        </div>
        {live && (
          <div className="text-[9px] text-emerald-600 font-semibold uppercase tracking-wide shrink-0 mt-0.5">Live</div>
        )}
      </div>
      {/* Column headers */}
      <div className="flex items-center px-4 py-1 border-b border-gray-100 text-[9px] font-bold uppercase tracking-wider text-gray-400">
        <div className="w-36">Company</div>
        <div className="w-14 text-right">EPS Est</div>
        <div className="w-[4.5rem] text-right">2-Day Move</div>
        <div className="w-12 text-right">Beat</div>
      </div>
      <div className="divide-y divide-gray-100">
        {earnings.slice(0, 6).map((e) => (
          <div key={e.ticker} className="flex items-center px-4 py-1">
            <div className="w-36 min-w-0">
              <div className="text-[12px] font-semibold text-[#111827] leading-tight truncate">{e.company}</div>
              <div className="text-[10px] text-gray-400">{e.date} · {e.ticker}</div>
            </div>
            <div className="w-14 text-right text-[11px] text-gray-600 font-mono">{e.eps}</div>
            <div className={`w-[4.5rem] text-right text-[11px] font-mono font-medium ${e.avgMove.startsWith("-") ? "text-red-600" : "text-emerald-700"}`}>
              {e.avgMove}
            </div>
            <div className="w-12 text-right text-[11px] text-gray-600 font-mono">{e.beatRate}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
