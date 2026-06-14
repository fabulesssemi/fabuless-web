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
      <div className="flex flex-col gap-2 mb-10">
        {rows.map(({ expert, stats }, i) => {
          const domainMap = Object.fromEntries(stats.domains.map((d) => [d.domain, d.accuracyPct]));
          const form = recentForm(expert.id);
          const isFirst = i === 0;

          return (
            <Link
              key={expert.id}
              href={`/tracker/${expert.id}`}
              className={`group relative flex items-center gap-5 rounded-xl border px-5 py-4 transition-all duration-150 hover:shadow-md ${
                isFirst
                  ? "border-amber-200 bg-amber-50/40 hover:border-amber-300"
                  : "border-gray-100 bg-white hover:border-gray-200"
              }`}
            >
              {/* Left accent */}
              <div
                className="absolute left-0 top-3 bottom-3 w-[3px] rounded-full"
                style={{ backgroundColor: expert.accent }}
              />

              {/* Rank */}
              <div className={`shrink-0 w-7 text-center font-bold tabular-nums ${isFirst ? "text-[#B45309] text-[16px]" : "text-gray-300 text-[14px]"}`}>
                {i + 1}
              </div>

              {/* Identity */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-sans text-[15px] font-bold text-gray-900 tracking-tight group-hover:text-[#B45309] transition-colors">
                    {expert.name}
                  </span>
                  <span
                    className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full"
                    style={{ color: expert.accent, backgroundColor: `${expert.accent}18` }}
                  >
                    {expert.subtitle}
                  </span>
                  {isFirst && (
                    <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">
                      #1
                    </span>
                  )}
                </div>

                {/* Recent form dots */}
                {form.length > 0 && (
                  <div className="flex items-center gap-1 mt-1.5">
                    <span className="text-[9px] uppercase tracking-widest text-gray-400 mr-1">Recent</span>
                    {form.map((s, j) => (
                      <div
                        key={j}
                        className="w-2 h-2 rounded-full"
                        style={{
                          backgroundColor:
                            s === "CORRECT" ? "#10b981" :
                            s === "PARTIAL" ? "#f59e0b" : "#f43f5e",
                        }}
                        title={s}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Domain mini-bars */}
              <div className="hidden lg:flex flex-col gap-1 w-52 shrink-0">
                {DOMAIN_COLS.map((d) => {
                  const pct = domainMap[d.key] ?? null;
                  return (
                    <div key={d.key} className="flex items-center gap-2">
                      <span className="text-[9px] uppercase tracking-wide text-gray-400 w-10 shrink-0">{d.label}</span>
                      <div className="flex-1 h-1 bg-gray-100 rounded-full overflow-hidden">
                        {pct !== null && (
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${pct}%`,
                              backgroundColor:
                                pct >= 75 ? "#10b981" : pct >= 50 ? "#f59e0b" : "#f43f5e",
                            }}
                          />
                        )}
                      </div>
                      <span className="text-[9px] tabular-nums text-gray-400 w-6 text-right">
                        {pct !== null ? `${pct}%` : "—"}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Resolved / Open */}
              <div className="hidden sm:flex flex-col items-center gap-0.5 w-20 shrink-0">
                <div className="text-[12px] font-semibold text-gray-700 tabular-nums">{stats.correct}/{stats.resolved}</div>
                <div className="text-[9px] uppercase tracking-widest text-gray-400">resolved</div>
                <div className="text-[11px] text-gray-400 tabular-nums mt-0.5">{stats.tooEarly} open</div>
              </div>

              {/* Accuracy % — hero */}
              <div className="shrink-0 text-right w-24">
                {stats.accuracyPct !== null ? (
                  <>
                    <div className={`text-[28px] font-bold tabular-nums leading-none ${accuracyColor(stats.accuracyPct)}`}>
                      {stats.accuracyPct}%
                    </div>
                    <div className="text-[9px] uppercase tracking-widest text-gray-400 mt-0.5">accuracy</div>
                  </>
                ) : (
                  <span className="text-gray-300 text-[14px]">—</span>
                )}
              </div>

              {/* Chevron */}
              <div className="shrink-0 text-gray-300 group-hover:text-[#B45309] transition-colors">→</div>
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
