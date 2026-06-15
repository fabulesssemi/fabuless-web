import Link from "next/link";
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
    <div
      className="min-h-screen"
      style={{
        backgroundImage: "radial-gradient(circle, #E2E8F0 1px, transparent 1px)",
        backgroundSize: "24px 24px",
        backgroundColor: "#F8FAFC",
      }}
    >
      <div className="max-w-5xl mx-auto px-6 py-10">

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="font-sans text-[28px] font-bold text-[#0F172A] tracking-tight leading-none">
                Prediction Tracker
              </h1>
              <p className="mt-2 text-[14px] text-gray-500 max-w-lg leading-relaxed">
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

          {/* Summary pills */}
          <div className="mt-5 flex items-center gap-3 flex-wrap">
            {[
              { label: "Experts", value: rows.length },
              { label: "Predictions", value: totalPredictions },
              { label: "Resolved", value: totalResolved },
            ].map(({ label, value }) => (
              <div key={label} className="flex items-center gap-2 bg-white border border-[#E2E8F0] rounded-lg px-3 py-1.5 shadow-sm">
                <span className="text-[11px] text-slate-400 uppercase tracking-wide font-medium">{label}</span>
                <span className="text-[13px] font-bold text-[#0F172A] tabular-nums">{value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Expert cards */}
        <div className="flex flex-col gap-3 mb-12">
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
                className="group relative flex items-center gap-5 rounded-2xl border border-[#E2E8F0] bg-white px-5 py-4 shadow-sm hover:shadow-lg hover:border-slate-300 transition-all duration-200"
              >
                {/* Left accent rail */}
                <div
                  className="absolute left-0 top-4 bottom-4 w-[3px] rounded-full"
                  style={{ backgroundColor: accent }}
                />

                {/* Rank badge */}
                <div
                  className="shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-[12px] font-bold tabular-nums"
                  style={{ backgroundColor: `${accent}14`, color: accent, boxShadow: `inset 0 0 0 1px ${accent}22` }}
                >
                  {i + 1}
                </div>

                {/* Identity */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2 flex-wrap">
                    <span className="font-sans text-[15px] font-bold text-gray-900 leading-tight">
                      {expert.name}
                    </span>
                    <span className="text-[11px] text-gray-400 font-medium">{expert.subtitle}</span>
                  </div>
                  <div className="mt-0.5 flex items-center gap-2 text-[11px] text-gray-400">
                    <span className="tabular-nums">{stats.total} predictions</span>
                    {topDomain && (
                      <>
                        <span className="text-gray-200">·</span>
                        <span>
                          Best:{" "}
                          <span className={`font-semibold ${accuracyColor(topDomain.accuracyPct)}`}>
                            {topDomain.label}
                          </span>
                          <span className="text-gray-300 ml-1 tabular-nums">{topDomain.accuracyPct}%</span>
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {/* Domain bars */}
                <div className="hidden lg:flex items-end gap-[5px] shrink-0">
                  {DOMAIN_COLS.map((d) => {
                    const pct = domainMap[d.key] ?? null;
                    const color = pct === null ? "#E2E8F0" : pct >= 75 ? C_GREEN : pct >= 50 ? C_AMBER : C_RED;
                    return (
                      <div key={d.key} className="flex flex-col items-center gap-[3px]">
                        <div style={{ width: "20px", height: "4px", backgroundColor: color, borderRadius: "2px" }} />
                        <span className="text-[7px] uppercase text-slate-400 leading-none tracking-wide">{d.label}</span>
                      </div>
                    );
                  })}
                </div>

                {/* Resolved */}
                <div className="hidden lg:block text-right shrink-0 w-20">
                  <div className="text-[12px] font-semibold text-slate-700 tabular-nums">{stats.correct}/{stats.resolved}</div>
                  <div className="text-[10px] text-slate-400 tabular-nums">+{stats.tooEarly} open</div>
                </div>

                {/* Accuracy */}
                <div className="text-right shrink-0 w-16">
                  <span
                    className="text-[26px] font-bold tabular-nums leading-none"
                    style={{
                      color: accent,
                      textShadow: stats.accuracyPct !== null && stats.accuracyPct >= 80 ? `0 0 18px ${accent}30` : "none",
                    }}
                  >
                    {stats.accuracyPct !== null ? `${stats.accuracyPct}%` : "—"}
                  </span>
                  <div className="text-[9px] text-slate-400 uppercase tracking-wider mt-0.5">accuracy</div>
                </div>

                {/* Chevron */}
                <span className="text-slate-300 group-hover:text-slate-500 transition-colors shrink-0 text-[14px]">→</span>
              </Link>
            );
          })}
        </div>

        {/* Prediction feed */}
        <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm p-6">
          <PredictionTable rows={predictions} />
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
