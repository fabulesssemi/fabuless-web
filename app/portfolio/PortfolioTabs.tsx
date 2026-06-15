"use client";

import { useState } from "react";
import Link from "next/link";
import type { Prediction } from "@/lib/tracker/predictions";
import type { ExpertMeta } from "@/lib/tracker/experts";

const STATUS_META = {
  CORRECT:   { label: "Correct", bg: "bg-emerald-500", text: "text-white" },
  PARTIAL:   { label: "Partial", bg: "bg-amber-400",   text: "text-white" },
  WRONG:     { label: "Wrong",   bg: "bg-rose-500",    text: "text-white" },
  TOO_EARLY: { label: "Open",    bg: "bg-gray-100",    text: "text-gray-500" },
} as const;

export type EarningsRow = {
  ticker: string;
  label: string;
  daysUntil: number;
};

export type AnalystRow = {
  ticker: string;
  companyName: string;
  analysts: {
    id: string;
    name: string;
    firmDisplay: string;
    rating: string;
    priceTarget: number | null;
    upsidePct: number | null;
    action: string;
    accent: string;
  }[];
  avgTarget: number | null;
  avgUpside: number | null;
};

type Tab = "earnings" | "calls" | "analysts";

const TABS: { key: Tab; label: string }[] = [
  { key: "earnings", label: "Earnings" },
  { key: "calls",    label: "Expert Calls" },
  { key: "analysts", label: "Analysts" },
];

export function PortfolioTabs({
  earnings,
  calls,
  experts,
  analystRows,
  tickers,
}: {
  earnings: EarningsRow[];
  calls: Prediction[];
  experts: Record<string, ExpertMeta>;
  analystRows: AnalystRow[];
  tickers: string[];
}) {
  const [tab, setTab] = useState<Tab>("earnings");

  const tabBtn = (key: Tab) =>
    `px-4 py-2 text-[12px] font-semibold transition-colors border-b-2 ${
      tab === key
        ? "text-[#111827] border-[#111827]"
        : "text-gray-400 border-transparent hover:text-gray-600"
    }`;

  return (
    <div>
      {/* Tab bar */}
      <div className="flex gap-1 border-b border-gray-100 mb-5">
        {TABS.map(({ key, label }) => (
          <button key={key} onClick={() => setTab(key)} className={tabBtn(key)}>
            {label}
            {key === "earnings" && earnings.length > 0 && (
              <span className="ml-1.5 text-[10px] font-bold text-[#B45309] tabular-nums">{earnings.length}</span>
            )}
            {key === "calls" && calls.length > 0 && (
              <span className="ml-1.5 text-[10px] font-bold text-[#B45309] tabular-nums">{calls.length}</span>
            )}
          </button>
        ))}
      </div>

      {/* Earnings tab */}
      {tab === "earnings" && (
        <>
          {earnings.length === 0 ? (
            <p className="font-serif text-[13px] text-[#4a4a4a]">No earnings in the next 30 days for your holdings.</p>
          ) : (
            <div className="rounded-xl border border-gray-100 bg-white shadow-sm overflow-hidden">
              {earnings.map((r, i) => {
                const soon = r.daysUntil <= 7;
                const label = r.daysUntil === 0 ? "today" : r.daysUntil === 1 ? "tomorrow" : `${r.daysUntil} days`;
                return (
                  <div
                    key={r.ticker}
                    className="flex items-center justify-between px-4 py-3"
                    style={{ borderTop: i > 0 ? "1px solid #F1F5F9" : undefined }}
                  >
                    <div className="flex items-center gap-3">
                      <span className="font-sans text-[13px] font-bold text-gray-900 w-12 tabular-nums">{r.ticker}</span>
                      <span className="font-serif text-[12px] text-[#4a4a4a]">{r.label.replace(/^[A-Za-z]{3,}\s+/, "")}</span>
                    </div>
                    <span className={`text-[11px] font-semibold tabular-nums ${soon ? "text-[#B45309]" : "text-gray-400"}`}>
                      {label}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* Expert Calls tab */}
      {tab === "calls" && (
        <>
          {calls.length === 0 ? (
            <p className="font-serif text-[13px] text-[#4a4a4a]">No tracked predictions on your holdings yet.</p>
          ) : (
            <div className="rounded-xl border border-gray-100 bg-white shadow-sm overflow-hidden">
              {calls.map((p, i) => {
                const expert = experts[p.expert];
                const sm = STATUS_META[p.status];
                const heldTickers = (p.companies ?? []).filter((c) => tickers.includes(c));
                return (
                  <Link
                    key={p.id}
                    href={`/tracker/${p.expert}`}
                    className="block px-4 py-3 hover:bg-slate-50 transition-colors"
                    style={{ borderTop: i > 0 ? "1px solid #F1F5F9" : undefined }}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-[12px] font-bold text-gray-900">{expert?.name ?? p.speaker}</span>
                        {heldTickers.map((tk) => (
                          <span key={tk} className="text-[9px] font-bold px-1.5 py-0.5 bg-gray-100 text-gray-500 rounded border border-gray-200 tracking-wide">
                            {tk}
                          </span>
                        ))}
                      </div>
                      <span className={`shrink-0 text-[9px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full ${sm.bg} ${sm.text}`}>
                        {sm.label}
                      </span>
                    </div>
                    <p className="font-serif text-[12.5px] text-[#4a4a4a] leading-snug line-clamp-2">{p.claim}</p>
                  </Link>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* Analysts tab */}
      {tab === "analysts" && (
        <>
          {analystRows.length === 0 ? (
            <p className="font-serif text-[13px] text-[#4a4a4a]">No analyst coverage found for your holdings.</p>
          ) : (
            <div className="flex flex-col gap-4">
              {analystRows.map((row) => (
                <div key={row.ticker} className="rounded-xl border border-gray-100 bg-white shadow-sm overflow-hidden">
                  {/* Stock header */}
                  <div className="flex items-center justify-between px-4 py-3 border-b border-[#F1F5F9] bg-gray-50/60">
                    <div className="flex items-center gap-2">
                      <span className="font-sans text-[13px] font-bold text-gray-900 tabular-nums">{row.ticker}</span>
                      <span className="text-[11px] text-gray-400">{row.companyName}</span>
                    </div>
                    <div className="flex items-center gap-4 text-right">
                      {row.avgTarget !== null && (
                        <div>
                          <div className="text-[13px] font-bold text-gray-800 tabular-nums">${row.avgTarget.toFixed(0)}</div>
                          <div className="text-[9px] uppercase tracking-widest text-gray-400">avg PT</div>
                        </div>
                      )}
                      {row.avgUpside !== null && (
                        <div>
                          <div className={`text-[13px] font-bold tabular-nums ${row.avgUpside >= 0 ? "text-emerald-600" : "text-rose-500"}`}>
                            {row.avgUpside >= 0 ? "+" : ""}{row.avgUpside.toFixed(1)}%
                          </div>
                          <div className="text-[9px] uppercase tracking-widest text-gray-400">avg upside</div>
                        </div>
                      )}
                    </div>
                  </div>
                  {/* Analyst rows */}
                  {row.analysts.map((a, i) => (
                    <Link
                      key={a.id}
                      href={`/analysts/${a.id}`}
                      className="flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 transition-colors"
                      style={{ borderTop: i > 0 ? "1px solid #F1F5F9" : undefined }}
                    >
                      <div
                        className="shrink-0 w-1.5 h-1.5 rounded-full"
                        style={{ backgroundColor: a.accent }}
                      />
                      <div className="flex-1 min-w-0 flex items-center gap-2 flex-wrap">
                        <span className="text-[12px] font-bold text-gray-900">{a.name}</span>
                        <span
                          className="text-[9px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded-full"
                          style={{ color: a.accent, backgroundColor: `${a.accent}18` }}
                        >
                          {a.firmDisplay}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-right shrink-0">
                        <span className="text-[11px] font-semibold text-gray-600">{a.rating}</span>
                        {a.priceTarget !== null && (
                          <span className="text-[12px] font-bold text-gray-800 tabular-nums w-14 text-right">${a.priceTarget.toFixed(0)}</span>
                        )}
                        {a.upsidePct !== null && (
                          <span className={`text-[11px] font-semibold tabular-nums w-14 text-right ${a.upsidePct >= 0 ? "text-emerald-600" : "text-rose-500"}`}>
                            {a.upsidePct >= 0 ? "+" : ""}{a.upsidePct.toFixed(1)}%
                          </span>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
