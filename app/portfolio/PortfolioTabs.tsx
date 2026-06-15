"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import type { Prediction } from "@/lib/tracker/predictions";
import type { ExpertMeta } from "@/lib/tracker/experts";
import type { EarningsSummary } from "@/lib/earnings/summaries";
import type { TickerEarnings } from "@/app/api/earnings-history/route";
import type { EarningsPreviewGenerated } from "@/scripts/update-earnings-previews";

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

function UpcomingEarningsCard({ ticker, label, daysUntil, earningsSlug, forward, preview }: EarningsRow & { forward: ForwardEst[]; preview: EarningsPreviewGenerated | null }) {
  const [open, setOpen] = useState(false); // collapsed by default
  const soon = daysUntil >= 0 && daysUntil <= 7;
  const nextEst = forward.find((f) => f.period === "0q" || f.period === "+1q");
  const epsEst = preview?.epsEst ?? nextEst?.epsEst ?? null;
  const revEstB = preview?.revEstB ?? (nextEst?.revEst != null ? Math.round(nextEst.revEst / 1e9 * 10) / 10 : null);
  const hasPreview = !!(preview?.barToBeat || preview?.watchPoints?.length);

  return (
    <div className={`rounded-lg border ${soon ? "border-amber-300 bg-amber-50/30" : "border-gray-100 bg-white"} overflow-hidden`}>
      {/* Header row — always visible, click to expand what-to-watch */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between gap-4 px-4 py-2.5 text-left hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-3 flex-wrap">
          <span className={`text-[10px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded ${soon ? "bg-amber-100 text-amber-700" : "bg-gray-100 text-gray-500"}`}>
            {daysUntil === 0 ? "today" : daysUntil === 1 ? "tomorrow" : `in ${daysUntil}d`}
          </span>
          <span className="font-serif text-[12px] text-[#4a4a4a]">{label}</span>
          {epsEst != null && (
            <span className="text-[11px] text-gray-400">EPS est. <span className="font-semibold text-gray-700">${epsEst.toFixed(2)}</span></span>
          )}
          {revEstB != null && (
            <span className="text-[11px] text-gray-400">Rev est. <span className="font-semibold text-gray-700">${revEstB}B</span></span>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {earningsSlug && !open && (
            <Link
              href={`/earnings/${earningsSlug}`}
              onClick={(e) => e.stopPropagation()}
              className="text-[10px] font-bold uppercase tracking-wide px-2 py-1 bg-[#B45309] text-white rounded hover:bg-amber-800 transition-colors"
            >
              Deep dive →
            </Link>
          )}
          <span className="text-[10px] text-gray-400 font-medium">{open ? "▲ hide" : "▼ what to watch"}</span>
        </div>
      </button>

      {/* What to watch panel */}
      {open && preview && (
        <div className="px-4 pb-4 pt-2 border-t border-gray-100 bg-gray-50/40">
          {preview.barToBeat && (
            <div className="mb-3">
              <div className="text-[9px] font-bold uppercase tracking-widest text-[#B45309] mb-1">Bar to beat</div>
              <p className="font-serif text-[12.5px] text-[#4a4a4a] leading-relaxed">{preview.barToBeat}</p>
            </div>
          )}

          {preview.watchPoints?.length > 0 && (
            <div className="mb-3">
              <div className="text-[9px] font-bold uppercase tracking-widest text-gray-400 mb-2">What to watch</div>
              <div className="flex flex-col gap-2">
                {preview.watchPoints.map((wp, i) => (
                  <div key={i} className="flex gap-2.5">
                    <span className="shrink-0 font-mono text-[10px] text-gray-300 mt-0.5">{String(i + 1).padStart(2, "0")}</span>
                    <div>
                      <div className="text-[12px] font-bold text-gray-800">{wp.title}</div>
                      <p className="font-serif text-[11.5px] text-gray-500 leading-snug">{wp.why}</p>
                      {wp.metric && (
                        <div className="mt-0.5 flex items-start gap-1.5">
                          <span className="text-[9px] font-bold uppercase tracking-wide text-gray-400 mt-0.5 shrink-0">Watch</span>
                          <span className="text-[11px] text-gray-600 font-medium">{wp.metric}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {(preview.bullSetup || preview.bearSetup) && (
            <div className="flex gap-3 mt-3">
              {preview.bullSetup && (
                <div className="flex-1 bg-emerald-50 border border-emerald-100 rounded px-3 py-2">
                  <div className="text-[9px] font-bold uppercase tracking-widest text-emerald-700 mb-0.5">Bull</div>
                  <p className="font-serif text-[11.5px] text-emerald-800 leading-snug">{preview.bullSetup}</p>
                </div>
              )}
              {preview.bearSetup && (
                <div className="flex-1 bg-rose-50 border border-rose-100 rounded px-3 py-2">
                  <div className="text-[9px] font-bold uppercase tracking-widest text-rose-700 mb-0.5">Bear</div>
                  <p className="font-serif text-[11.5px] text-rose-800 leading-snug">{preview.bearSetup}</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function EarningsTabContent({ tickers, upcoming, pastSummaries, earningsRows }: {
  tickers: string[];
  upcoming: (EarningsRow & { forward: ForwardEst[] })[];
  pastSummaries: Record<string, EarningsSummary[]>;
  earningsRows: EarningsRow[];
}) {
  if (tickers.length === 0) {
    return <p className="font-serif text-[13px] text-[#4a4a4a]">Add holdings to see earnings data.</p>;
  }

  return (
    <div className="rounded-xl border border-gray-100 bg-white shadow-sm overflow-hidden">
      {tickers.map((ticker, i) => {
        const upcomingForTicker = upcoming.find((u) => u.ticker === ticker);
        const past = pastSummaries[ticker] ?? [];
        const earningsRow = earningsRows.find((e) => e.ticker === ticker);
        const slug = earningsRow?.earningsSlug ?? null;
        const href = slug ? `/earnings/${slug}` : null;
        const companyName = upcomingForTicker?.companyName ?? earningsRow?.companyName ?? ticker;

        return (
          <div
            key={ticker}
            className="flex items-center justify-between gap-4 px-4 py-3 hover:bg-gray-50 transition-colors"
            style={{ borderTop: i > 0 ? "1px solid #F1F5F9" : undefined }}
          >
            {/* Left: ticker + company + upcoming badge */}
            <div className="flex items-center gap-3 min-w-0">
              <span className="font-sans text-[12px] font-bold text-gray-900 w-12 shrink-0">{ticker}</span>
              <span className="text-[11px] text-gray-400 truncate hidden sm:block">{companyName}</span>
              {upcomingForTicker && (
                <span className={`text-[10px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded shrink-0 ${upcomingForTicker.daysUntil <= 7 ? "bg-amber-100 text-amber-700" : "bg-gray-100 text-gray-500"}`}>
                  {upcomingForTicker.daysUntil === 0 ? "today" : upcomingForTicker.daysUntil === 1 ? "tomorrow" : `in ${upcomingForTicker.daysUntil}d`}
                </span>
              )}
            </div>

            {/* Right: last 2 quarter chips + link */}
            <div className="flex items-center gap-3 shrink-0">
              {past.slice(0, 2).map((s) => (
                <div key={s.date} className="flex items-center gap-1.5">
                  <span className="text-[10px] text-gray-400 font-medium">{s.quarter}</span>
                  {s.epsActual != null && s.epsEstimate != null && (
                    <span className={`text-[10px] font-bold px-1 py-0.5 rounded ${s.epsActual >= s.epsEstimate ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-600"}`}>
                      {s.epsActual >= s.epsEstimate ? "beat" : "miss"}
                    </span>
                  )}
                  {s.priceMoveDay != null && (
                    <span className={`text-[10px] font-semibold tabular-nums ${s.priceMoveDay >= 0 ? "text-emerald-600" : "text-rose-500"}`}>
                      {s.priceMoveDay >= 0 ? "+" : ""}{s.priceMoveDay.toFixed(1)}%
                    </span>
                  )}
                </div>
              ))}
              {href ? (
                <Link href={href} className="text-[10px] font-bold uppercase tracking-wide px-2.5 py-1 bg-[#111827] text-white rounded hover:bg-[#1f2937] transition-colors">
                  View →
                </Link>
              ) : (
                <span className="text-[10px] text-gray-300 w-14 text-right">no page</span>
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
    `px-3 py-1.5 text-[11px] font-semibold transition-colors rounded-md ${
      tab === key
        ? "bg-[#111827] text-white"
        : "text-gray-500 hover:text-gray-800 hover:bg-gray-100"
    }`;

  return (
    <div className="mb-8">
      {/* Header row: title left, tabs right */}
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#B45309] mb-1">Your Holdings</div>
          <h1 className="font-sans text-2xl font-bold text-[#111827] tracking-tight">My Portfolio</h1>
          <p className="mt-1 font-serif text-[15px] text-[#4a4a4a] leading-relaxed max-w-xl">
            Your stocks in context — live prices, analyst consensus, open expert calls, and earnings ahead.
          </p>
        </div>
        <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1 shrink-0 mt-1">
          {TABS.map(({ key, label }) => (
            <button key={key} onClick={() => setTab(key)} className={tabBtn(key)}>
              {label}
              {key === "earnings" && earnings.length > 0 && (
                <span className="ml-1 text-[9px] font-bold tabular-nums opacity-70">{earnings.length}</span>
              )}
              {key === "calls" && calls.length > 0 && (
                <span className="ml-1 text-[9px] font-bold tabular-nums opacity-70">{calls.length}</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Earnings tab */}
      {tab === "earnings" && (
        <EarningsTabContent
          tickers={tickers}
          upcoming={upcomingWithForward}
          pastSummaries={pastSummaries}
          earningsRows={earnings}
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
