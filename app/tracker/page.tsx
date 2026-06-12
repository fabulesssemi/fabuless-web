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

function pctColor(_pct: number | null): string {
  return "text-gray-700";
}

export default function TrackerPage() {
  const rows = EXPERTS.map((e) => ({ expert: e, stats: statsFor(e.id) }));

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      {/* Header */}
      <div className="border-b border-gray-200 pb-4 mb-6 flex items-baseline justify-between gap-4">
        <div className="flex items-baseline gap-3">
          <h1 className="font-sans text-2xl font-bold text-[#111827] tracking-tight">
            Prediction Tracker
          </h1>
          <span className="font-serif text-[15px] text-[#4a4a4a]">
            Every prediction on record. Every verdict public. See who called it and who missed.
          </span>
        </div>
        <Link href="/tracker/methodology" className="text-[12px] text-[#B45309] font-semibold hover:underline shrink-0">
          Methodology →
        </Link>
      </div>

      {/* Leaderboard */}
      <div className="border border-[#DDDBD2] bg-white mb-8 overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="text-left px-4 py-2.5 text-[10px] font-bold uppercase tracking-wider text-gray-400 w-6">#</th>
              <th className="text-left px-3 py-2.5 text-[10px] font-bold uppercase tracking-wider text-gray-400">Expert</th>
              <th className="text-center px-4 py-2.5 text-[10px] font-bold uppercase tracking-wider text-gray-400">Overall</th>
              <th className="hidden sm:table-cell text-center px-3 py-2.5 text-[10px] font-bold uppercase tracking-wider text-gray-300">Resolved</th>
              <th className="hidden sm:table-cell text-center px-3 py-2.5 text-[10px] font-bold uppercase tracking-wider text-gray-300">Open</th>
              {DOMAIN_COLS.map((d) => (
                <th key={d.key} className="hidden md:table-cell text-center px-3 py-2.5 text-[10px] font-bold uppercase tracking-wider text-gray-300">
                  {d.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map(({ expert, stats }, i) => {
              const domainMap = Object.fromEntries(stats.domains.map((d) => [d.domain, d.accuracyPct]));
              return (
                <tr key={expert.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors">
                  {/* Rank */}
                  <td className="px-4 py-3 text-[12px] text-gray-300 font-semibold">{i + 1}</td>

                  {/* Expert name */}
                  <td className="px-3 py-3">
                    <Link href={`/tracker/${expert.id}`} className="group flex items-center gap-2.5">
                      <div className="w-0.5 h-8 shrink-0 rounded-full" style={{ backgroundColor: expert.accent }} />
                      <div>
                        <div className="text-[13px] font-bold text-[#111827] leading-tight group-hover:text-[#B45309] transition-colors">{expert.name}</div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[11px] text-gray-400">{expert.subtitle}</span>
                          <span className="text-[10px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded leading-none">Scorecard →</span>
                        </div>
                      </div>
                    </Link>
                  </td>

                  {/* Overall % — hero stat */}
                  <td className="px-4 py-3 text-center">
                    {stats.accuracyPct !== null ? (
                      <span className={`text-[18px] font-bold ${pctColor(stats.accuracyPct)}`}>
                        {stats.accuracyPct}%
                      </span>
                    ) : (
                      <span className="text-gray-300 text-[13px]">—</span>
                    )}
                  </td>

                  {/* Resolved */}
                  <td className="hidden sm:table-cell px-3 py-3 text-center text-[12px] text-gray-500">
                    {stats.correct}/{stats.resolved}
                  </td>

                  {/* Open */}
                  <td className="hidden sm:table-cell px-3 py-3 text-center text-[12px] text-gray-400">
                    {stats.tooEarly}
                  </td>

                  {/* Domain columns */}
                  {DOMAIN_COLS.map((d) => {
                    const pct = domainMap[d.key] ?? null;
                    return (
                      <td key={d.key} className="hidden md:table-cell px-3 py-3 text-center">
                        {pct !== null ? (
                          <span className={`text-[12px] font-semibold ${pctColor(pct)}`}>{pct}%</span>
                        ) : (
                          <span className="text-gray-200 text-[12px]">—</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
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
