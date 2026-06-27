import Link from "next/link";
import { Suspense } from "react";
import type { Metadata } from "next";
import { predictions } from "@/lib/tracker/predictions";
import { statsFor } from "@/lib/tracker/stats";
import { EXPERTS } from "@/lib/tracker/experts";
import { PredictionTable } from "@/app/components/tracker/PredictionTable";

export const metadata: Metadata = {
  title: "Prediction Tracker — Fabuless",
  description:
    "Who actually called it? Every falsifiable semiconductor prediction from leading analysts — verbatim quote, source, and verdict. The scoreboard nobody else keeps.",
};

const DOMAIN_COLS = [
  { key: "supply_chain", label: "Supply" },
  { key: "demand",       label: "Demand" },
  { key: "pricing",      label: "Pricing" },
  { key: "geopolitics",  label: "Geo" },
  { key: "technology",   label: "Tech" },
  { key: "financials",   label: "Fin" },
] as const;

// Refined financial-analytics palette
const C_GREEN = "#15803D"; // sophisticated success
const C_AMBER = "#B45309"; // warm gold partial
const C_RED   = "#B91C1C"; // muted deep red
const C_SLATE = "#64748B"; // cool neutral

function accuracyHex(pct: number | null): string {
  if (pct === null) return C_SLATE;
  if (pct >= 75) return C_GREEN;
  if (pct >= 55) return C_AMBER;
  return C_RED;
}

function accuracyColor(pct: number | null): string {
  if (pct === null) return "text-slate-500";
  if (pct >= 75) return "text-green-700";
  if (pct >= 55) return "text-amber-700";
  return "text-red-700";
}

export default function TrackerPage() {
  const rows = EXPERTS.map((e) => ({ expert: e, stats: statsFor(e.id) }));

  // Summary stats for header
  const totalPredictions = rows.reduce((s, r) => s + r.stats.total, 0);
  const totalResolved    = rows.reduce((s, r) => s + r.stats.resolved, 0);

  return (
    <div className="min-h-screen">
      <div className="max-w-5xl mx-auto px-6 py-10">

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="font-sans text-[28px] font-bold text-[#0F172A] tracking-tight leading-none">
                Prediction Tracker
              </h1>
              <p className="mt-2 font-serif text-[15px] text-[#4a4a4a] max-w-lg leading-relaxed">
                Every falsifiable semiconductor call, verbatim — graded publicly when the verdict lands.
              </p>
            </div>
            <Link
              href="/tracker/methodology"
              className="shrink-0 mt-1 text-[11px] font-medium text-gray-400 hover:text-gray-600 underline underline-offset-2 transition-colors"
            >
              Methodology →
            </Link>
          </div>

          <div className="mt-2 flex items-center gap-3 text-[11px] text-slate-400">
            <span><strong className="text-slate-600 tabular-nums">{rows.length}</strong> experts</span>
            <span>·</span>
            <span><strong className="text-slate-600 tabular-nums">{totalPredictions}</strong> predictions</span>
            <span>·</span>
            <span><strong className="text-slate-600 tabular-nums">{totalResolved}</strong> resolved</span>
          </div>
        </div>

        {/* Expert leaderboard — compact table rows */}
        <div className="mb-8 rounded-xl border border-gray-100 bg-white shadow-sm overflow-hidden">
          {rows.map(({ expert, stats }, i) => {
            const domainMap = Object.fromEntries(stats.domains.map((d) => [d.domain, d.accuracyPct]));
            const topDomain = stats.domains
              .filter((d) => d.resolved >= 3 && d.accuracyPct !== null)
              .sort((a, b) => (b.accuracyPct ?? 0) - (a.accuracyPct ?? 0))[0];
            const accent = accuracyHex(stats.accuracyPct);

            return (
              <Link
                key={expert.id}
                href={`/tracker/${expert.id}`}
                className="group relative flex items-center gap-4 px-4 py-3 hover:bg-slate-50 transition-colors duration-150"
                style={{ borderTop: i > 0 ? "1px solid #F1F5F9" : undefined }}
              >
                {/* Left accent rail */}
                <div
                  className="absolute left-0 top-2 bottom-2 w-[3px] rounded-full"
                  style={{ backgroundColor: accent }}
                />

                {/* Rank */}
                <span className="shrink-0 w-5 text-[12px] font-bold tabular-nums text-center" style={{ color: accent }}>
                  {i + 1}
                </span>

                {/* Identity */}
                <div className="flex-1 min-w-0 flex items-center gap-2 flex-wrap">
                  <span className="font-sans text-[14px] font-bold text-gray-900 leading-none">
                    {expert.name}
                  </span>
                  <span className="text-[11px] text-gray-400">{expert.subtitle}</span>
                  {topDomain && (
                    <span className="text-[10px] text-gray-400 hidden lg:inline">
                      · Best:{" "}
                      <span className={`font-semibold ${accuracyColor(topDomain.accuracyPct)}`}>{topDomain.label}</span>
                      <span className="text-gray-300 ml-0.5">{topDomain.accuracyPct}%</span>
                    </span>
                  )}
                </div>

                {/* Domain bars */}
                <div className="hidden lg:flex items-center gap-[4px] shrink-0">
                  {DOMAIN_COLS.map((d) => {
                    const pct = domainMap[d.key] ?? null;
                    const color = pct === null ? "#E2E8F0" : pct >= 75 ? C_GREEN : pct >= 50 ? C_AMBER : C_RED;
                    return (
                      <div key={d.key} className="flex flex-col items-center gap-[2px]">
                        <div style={{ width: "18px", height: "3px", backgroundColor: color, borderRadius: "2px" }} />
                        <span className="text-[6px] uppercase text-slate-400 leading-none tracking-wide">{d.label}</span>
                      </div>
                    );
                  })}
                </div>

                {/* Resolved */}
                <div className="hidden lg:block text-right shrink-0 w-16">
                  <span className="text-[11px] text-slate-500 tabular-nums">{stats.correct}/{stats.resolved}</span>
                  <span className="text-[10px] text-slate-400 tabular-nums ml-1">+{stats.tooEarly}</span>
                </div>

                {/* Accuracy */}
                <div className="text-right shrink-0 w-14">
                  <span
                    className="text-[18px] font-bold tabular-nums leading-none"
                    style={{ color: accent }}
                  >
                    {stats.accuracyPct !== null ? `${stats.accuracyPct}%` : "—"}
                  </span>
                </div>

                {/* Chevron */}
                <span className="text-slate-300 group-hover:text-slate-500 transition-colors shrink-0 text-[12px]">→</span>
              </Link>
            );
          })}
        </div>

        {/* Prediction feed */}
        <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm p-6">
          <Suspense fallback={<div className="h-32 flex items-center justify-center text-[12px] text-gray-400">Loading predictions…</div>}>
            <PredictionTable rows={predictions} />
          </Suspense>
        </div>

        {/* Footer note */}
        <div className="mt-8 pt-6 border-t border-[#E2E8F0]">
          <p className="text-[11px] text-gray-400 leading-relaxed max-w-2xl">
            All predictions are drawn from publicly available articles, podcasts, and interviews.
            Verdicts are editorial judgments based on verifiable outcomes, graded per the{" "}
            <Link href="/tracker/methodology" className="underline hover:text-gray-600">
              methodology
            </Link>
            . Independent analysis — Fabuless is not affiliated with any tracked expert. Not investment advice.
          </p>
        </div>
      </div>
    </div>
  );
}
