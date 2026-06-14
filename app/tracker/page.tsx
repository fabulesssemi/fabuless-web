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

function recentForm(expertId: string, n = 6): ("CORRECT" | "PARTIAL" | "WRONG")[] {
  return predictions
    .filter((p) => p.expert === expertId && p.status !== "TOO_EARLY")
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, n)
    .map((p) => p.status as "CORRECT" | "PARTIAL" | "WRONG")
    .reverse();
}

function accuracyColor(pct: number | null): string {
  if (pct === null) return "text-gray-400";
  if (pct >= 75) return "text-emerald-600";
  if (pct >= 55) return "text-amber-600";
  return "text-rose-500";
}

export default function TrackerPage() {
  const rows = EXPERTS.map((e) => ({ expert: e, stats: statsFor(e.id) }));

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      {/* Header */}
      <div className="mb-8">
        <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#B45309] mb-1">
          Expert Track Records
        </div>
        <div className="flex items-end justify-between gap-4">
          <div>
            <h1 className="font-sans text-2xl font-bold text-[#111827] tracking-tight">
              Prediction Tracker
            </h1>
            <p className="mt-1 font-serif text-[15px] text-[#4a4a4a]">
              Every prediction on record. Every verdict public. Click any expert for their full scorecard.
            </p>
          </div>
          <Link
            href="/tracker/methodology"
            className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[#B45309] text-[#B45309] text-[11px] font-bold uppercase tracking-widest hover:bg-[#B45309] hover:text-white transition-colors"
          >
            Methodology →
          </Link>
        </div>
      </div>

      {/* Leaderboard */}
      <div className="mb-10 border-t border-gray-200">
        {/* Column headers */}
        <div className="hidden lg:grid grid-cols-[28px_1fr_200px_80px_72px] gap-4 px-3 py-2 border-b border-gray-100">
          <div />
          <div className="text-[10px] font-semibold uppercase tracking-widest text-gray-400">Expert</div>
          <div className="text-[10px] font-semibold uppercase tracking-widest text-gray-400">By Domain</div>
          <div className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 text-right">Resolved</div>
          <div className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 text-right">Accuracy</div>
        </div>
        {rows.map(({ expert, stats }, i) => {
          const domainMap = Object.fromEntries(stats.domains.map((d) => [d.domain, d.accuracyPct]));
          return (
            <Link
              key={expert.id}
              href={`/tracker/${expert.id}`}
              className="group grid grid-cols-[28px_1fr_auto] lg:grid-cols-[28px_1fr_200px_80px_72px] gap-4 items-center px-3 border-b border-gray-100 hover:bg-gray-50 transition-colors"
              style={{ minHeight: "56px" }}
            >
              {/* Rank */}
              <span className="text-[12px] font-semibold text-gray-300 tabular-nums">{i + 1}</span>

              {/* Identity */}
              <div className="min-w-0 py-3">
                <div className="flex items-baseline gap-2 flex-wrap">
                  <span className="font-sans text-[14px] font-bold text-gray-900 group-hover:text-[#B45309] transition-colors leading-tight">
                    {expert.name}
                  </span>
                  <span className="text-[10px] font-medium text-gray-400 tracking-wide">{expert.subtitle}</span>
                </div>
              </div>

              {/* Domain inline bars */}
              <div className="hidden lg:flex items-center gap-2">
                {DOMAIN_COLS.map((d) => {
                  const pct = domainMap[d.key] ?? null;
                  const color = pct === null ? "#e5e7eb" : pct >= 75 ? "#10b981" : pct >= 50 ? "#f59e0b" : "#f43f5e";
                  return (
                    <div key={d.key} className="flex flex-col items-center gap-0.5" style={{ width: "26px" }}>
                      <div className="w-full bg-gray-100 rounded-sm" style={{ height: "16px" }}>
                        <div
                          className="w-full rounded-sm"
                          style={{
                            height: pct !== null ? `${Math.max(2, Math.round(pct / 100 * 16))}px` : "2px",
                            backgroundColor: color,
                            marginTop: pct !== null ? `${16 - Math.max(2, Math.round(pct / 100 * 16))}px` : "14px",
                          }}
                        />
                      </div>
                      <span className="text-[7px] uppercase text-gray-400 leading-none tracking-wide">{d.label}</span>
                    </div>
                  );
                })}
              </div>

              {/* Resolved */}
              <div className="hidden lg:block text-right">
                <span className="text-[12px] font-medium text-gray-500 tabular-nums">{stats.correct}/{stats.resolved}</span>
                <span className="text-[10px] text-gray-300 ml-1 tabular-nums">+{stats.tooEarly}</span>
              </div>

              {/* Accuracy */}
              <div className="text-right">
                {stats.accuracyPct !== null ? (
                  <span className={`text-[18px] font-bold tabular-nums ${accuracyColor(stats.accuracyPct)}`}>
                    {stats.accuracyPct}%
                  </span>
                ) : (
                  <span className="text-gray-300 text-[13px]">—</span>
                )}
              </div>
            </Link>
          );
        })}
      </div>

      {/* Prediction table */}
      <PredictionTable rows={predictions} />

      {/* Bottom note */}
      <div className="mt-12 pt-8 border-t border-gray-200">
        <p className="text-[12px] text-gray-400 leading-relaxed max-w-2xl">
          All predictions are drawn from publicly available articles, podcasts, and interviews.
          Verdicts are editorial judgments based on verifiable outcomes, graded per the{" "}
          <Link href="/tracker/methodology" className="underline hover:text-gray-600">
            methodology
          </Link>
          . This is independent analysis — Fabuless is not affiliated with any tracked expert.
          Nothing here is investment advice.
        </p>
      </div>
    </div>
  );
}
