"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import type { Prediction } from "@/lib/tracker/predictions";
import type { ExpertMeta } from "@/lib/tracker/experts";
import type { EarningsSummary } from "@/lib/earnings/summaries";
import type { TickerEarnings } from "@/app/api/earnings-history/route";

const STATUS_META = {
  CORRECT:   { label: "Correct", bg: "bg-emerald-500", text: "text-white" },
  PARTIAL:   { label: "Partial", bg: "bg-amber-400",   text: "text-white" },
  WRONG:     { label: "Wrong",   bg: "bg-rose-500",    text: "text-white" },
  TOO_EARLY: { label: "Open",    bg: "bg-gray-100",    text: "text-gray-500" },
} as const;

export type EarningsRow = {
  ticker: string;
  companyName: string;
  label: string;
  daysUntil: number;
  earningsSlug: string | null; // if deep-dive exists, link to /earnings/[slug]
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

// ── Earnings sub-components ───────────────────────────────────────────────────

function EpsSurprise({ actual, estimate, surprisePct }: {
  actual: number | null; estimate: number | null; surprisePct: number | null;
}) {
  if (actual == null && estimate == null) return null;
  const beat = actual != null && estimate != null ? actual >= estimate : null;
  return (
    <div className="flex items-center gap-3 flex-wrap">
      {actual != null && (
        <span className="text-[12px] font-bold tabular-nums text-gray-800">
          EPS ${actual.toFixed(2)}
        </span>
      )}
      {estimate != null && (
        <span className="text-[11px] text-gray-400 tabular-nums">
          est. ${estimate.toFixed(2)}
        </span>
      )}
      {surprisePct != null && (
        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${beat ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-600"}`}>
          {beat ? "+" : ""}{surprisePct.toFixed(1)}%
        </span>
      )}
      {beat != null && (
        <span className={`text-[10px] font-semibold uppercase tracking-wide ${beat ? "text-emerald-600" : "text-rose-500"}`}>
          {beat ? "beat" : "miss"}
        </span>
      )}
    </div>
  );
}

function PriceMoveChip({ pct }: { pct: number | null }) {
  if (pct == null) return null;
  const up = pct >= 0;
  return (
    <span className={`text-[11px] font-bold tabular-nums px-1.5 py-0.5 rounded ${up ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-600"}`}>
      {up ? "+" : ""}{pct.toFixed(1)}% day
    </span>
  );
}

function PastQuarterCard({ s, ticker }: { s: EarningsSummary; ticker: string }) {
  const [open, setOpen] = useState(false);
  const hasSummary = !!s.summary;
  return (
    <div className="border border-gray-100 rounded-lg overflow-hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between gap-4 px-4 py-3 hover:bg-gray-50 transition-colors text-left"
      >
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-[11px] font-bold uppercase tracking-widest text-gray-500 w-14 shrink-0">{s.quarter}</span>
          <EpsSurprise actual={s.epsActual} estimate={s.epsEstimate} surprisePct={s.surprisePct} />
          <PriceMoveChip pct={s.priceMoveDay} />
        </div>
        {hasSummary && (
          <span className="shrink-0 text-[11px] text-gray-400 font-medium">
            {open ? "▲" : "▼"}
          </span>
        )}
      </button>
      {open && hasSummary && (
        <div className="px-4 pb-4 pt-1 bg-gray-50/60 border-t border-gray-100">
          <p className="font-serif text-[13px] text-[#4a4a4a] leading-relaxed">{s.summary}</p>
          {s.keyQuote && (
            <blockquote className="mt-3 pl-3 border-l-2 border-[#B45309]">
              <p className="font-serif text-[12px] text-gray-600 italic leading-relaxed">"{s.keyQuote}"</p>
            </blockquote>
          )}
          {s.transcriptUrl && (
            <a
              href={s.transcriptUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2.5 inline-flex items-center gap-1 text-[10px] font-semibold text-[#B45309] hover:underline"
            >
              Full transcript →
            </a>
          )}
        </div>
      )}
      {open && !hasSummary && (
        <div className="px-4 pb-4 pt-2 bg-gray-50/60 border-t border-gray-100">
          <p className="font-serif text-[12px] text-gray-400">Transcript not yet available for this quarter.</p>
        </div>
      )}
    </div>
  );
}

type ForwardEst = TickerEarnings["forward"][number];

function UpcomingEarningsCard({ ticker, companyName, label, daysUntil, earningsSlug, forward }: EarningsRow & { forward: ForwardEst[] }) {
  const soon = daysUntil >= 0 && daysUntil <= 7;
  const nextEst = forward.find((f) => f.period === "0q" || f.period === "+1q");
  return (
    <div className={`rounded-lg border ${soon ? "border-amber-300 bg-amber-50/40" : "border-gray-100 bg-white"} overflow-hidden`}>
      <div className="flex items-center justify-between gap-4 px-4 py-3">
        <div className="flex items-center gap-3">
          <span className="font-sans text-[13px] font-bold text-gray-900 w-12 tabular-nums">{ticker}</span>
          <span className="font-serif text-[12px] text-[#4a4a4a]">{label}</span>
          {nextEst?.epsEst != null && (
            <span className="text-[11px] text-gray-400">
              EPS est. <span className="font-semibold text-gray-700">${nextEst.epsEst.toFixed(2)}</span>
            </span>
          )}
          {nextEst?.revEst != null && (
            <span className="text-[11px] text-gray-400">
              Rev est. <span className="font-semibold text-gray-700">${(nextEst.revEst / 1000).toFixed(1)}B</span>
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          <span className={`text-[11px] font-semibold tabular-nums ${soon ? "text-[#B45309]" : "text-gray-400"}`}>
            {daysUntil === 0 ? "today" : daysUntil === 1 ? "tomorrow" : `${daysUntil}d`}
          </span>
          {earningsSlug && (
            <Link
              href={`/earnings/${earningsSlug}`}
              className="text-[10px] font-bold uppercase tracking-wide px-2.5 py-1 bg-[#B45309] text-white rounded hover:bg-amber-800 transition-colors"
            >
              Deep dive →
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

function EarningsTabContent({ tickers, upcoming, pastSummaries }: {
  tickers: string[];
  upcoming: (EarningsRow & { forward: ForwardEst[] })[];
  pastSummaries: Record<string, EarningsSummary[]>;
}) {
  if (tickers.length === 0) {
    return <p className="font-serif text-[13px] text-[#4a4a4a]">Add holdings to see earnings data.</p>;
  }

  return (
    <div className="flex flex-col gap-6">
      {tickers.map((ticker) => {
        const upcomingForTicker = upcoming.filter((u) => u.ticker === ticker);
        const past = pastSummaries[ticker] ?? [];

        return (
          <div key={ticker}>
            <div className="flex items-center gap-2 mb-2.5">
              <span className="font-sans text-[12px] font-bold text-gray-900">{ticker}</span>
              <span className="text-[11px] text-gray-400">{upcomingForTicker[0]?.companyName ?? ""}</span>
            </div>

            <div className="flex flex-col gap-2">
              {/* Upcoming */}
              {upcomingForTicker.map((u) => (
                <UpcomingEarningsCard key={`upcoming-${u.ticker}`} {...u} />
              ))}

              {/* Past quarters */}
              {past.length > 0 ? (
                past.map((s) => <PastQuarterCard key={s.date} s={s} ticker={ticker} />)
              ) : (
                <div className="border border-dashed border-gray-200 rounded-lg px-4 py-3">
                  <p className="text-[12px] text-gray-400 font-serif">Past earnings data loading — runs weekly via pipeline.</p>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export function PortfolioTabs({
  earnings,
  calls,
  experts,
  analystRows,
  tickers,
  pastSummaries,
}: {
  earnings: EarningsRow[];
  calls: Prediction[];
  experts: Record<string, ExpertMeta>;
  analystRows: AnalystRow[];
  tickers: string[];
  pastSummaries: Record<string, EarningsSummary[]>;
}) {
  const [tab, setTab] = useState<Tab>("earnings");
  // Forward estimates fetched client-side (not blocking SSR)
  const [forwardData, setForwardData] = useState<Record<string, TickerEarnings>>({});

  useEffect(() => {
    if (tickers.length === 0) return;
    fetch(`/api/earnings-history?tickers=${tickers.join(",")}`)
      .then((r) => r.json())
      .then((data: Record<string, TickerEarnings>) => setForwardData(data))
      .catch(() => {});
  }, [tickers.join(",")]);

  const upcomingWithForward = earnings.map((e) => ({
    ...e,
    forward: forwardData[e.ticker]?.forward ?? [],
  }));

  const tabBtn = (key: Tab) =>
    `px-4 py-2 text-[12px] font-semibold transition-colors border-b-2 ${
      tab === key
        ? "text-[#111827] border-[#111827]"
        : "text-gray-400 border-transparent hover:text-gray-600"
    }`;

  const upcomingCount = earnings.length;

  return (
    <div className="mb-8">
      {/* Tab bar */}
      <div className="flex gap-1 border-b border-gray-100 mb-5">
        {TABS.map(({ key, label }) => (
          <button key={key} onClick={() => setTab(key)} className={tabBtn(key)}>
            {label}
            {key === "earnings" && upcomingCount > 0 && (
              <span className="ml-1.5 text-[10px] font-bold text-[#B45309] tabular-nums">{upcomingCount}</span>
            )}
            {key === "calls" && calls.length > 0 && (
              <span className="ml-1.5 text-[10px] font-bold text-[#B45309] tabular-nums">{calls.length}</span>
            )}
          </button>
        ))}
      </div>

      {/* Earnings tab */}
      {tab === "earnings" && (
        <EarningsTabContent
          tickers={tickers}
          upcoming={upcomingWithForward}
          pastSummaries={pastSummaries}
        />
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
                  {row.analysts.map((a, i) => (
                    <Link
                      key={a.id}
                      href={`/analysts/${a.id}`}
                      className="flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 transition-colors"
                      style={{ borderTop: i > 0 ? "1px solid #F1F5F9" : undefined }}
                    >
                      <div className="shrink-0 w-1.5 h-1.5 rounded-full" style={{ backgroundColor: a.accent }} />
                      <div className="flex-1 min-w-0 flex items-center gap-2 flex-wrap">
                        <span className="text-[12px] font-bold text-gray-900">{a.name}</span>
                        <span className="text-[9px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded-full"
                          style={{ color: a.accent, backgroundColor: `${a.accent}18` }}>
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
