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

function accuracyHex(pct: number | null): string {
  if (pct === null) return "#9CA3AF";
  if (pct >= 75) return "#059669";
  if (pct >= 55) return "#D97706";
  return "#E11D48";
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
    <div className="max-w-5xl mx-auto px-6 py-10">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h1 className="font-sans text-2xl font-bold text-[#111827] tracking-tight">
              Prediction Tracker
            </h1>
            <p className="mt-1 text-[14px] text-gray-500">
              Who actually called it? Every falsifiable prediction, every verdict, public record.
            </p>
          </div>
          <Link
            href="/tracker/methodology"
            className="shrink-0 text-[11px] font-semibold text-gray-400 underline underline-offset-2 hover:text-gray-700 transition-colors"
          >
            Methodology →
          </Link>
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
              className="group relative flex items-center gap-5 rounded-xl border border-gray-100 bg-white px-5 py-4 shadow-sm hover:shadow-md hover:border-gray-200 transition-all duration-150"
            >
              {/* Left accent rail */}
              <div
                className="absolute left-0 top-3 bottom-3 w-[3px] rounded-full"
                style={{ backgroundColor: accent }}
              />

              {/* Rank */}
              <span className="text-[13px] font-semibold text-gray-300 w-4 tabular-nums shrink-0">{i + 1}</span>

              {/* Identity */}
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-2 flex-wrap">
                  <span className="font-sans text-[15px] font-bold text-gray-900 group-hover:text-[#111827] leading-tight">
                    {expert.name}
                  </span>
                  <span className="text-[11px] text-gray-400">{expert.subtitle}</span>
                </div>
                <div className="mt-0.5 flex items-center gap-2 text-[11px] text-gray-400">
                  <span className="tabular-nums">{stats.total} predictions</span>
                  {topDomain && (
                    <>
                      <span className="text-gray-200">·</span>
                      <span>
                        Best in{" "}
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
              <div className="hidden lg:flex items-end gap-1.5 shrink-0">
                {DOMAIN_COLS.map((d) => {
                  const pct = domainMap[d.key] ?? null;
                  const color = pct === null ? "#E5E7EB" : pct >= 75 ? "#10b981" : pct >= 50 ? "#f59e0b" : "#f43f5e";
                  return (
                    <div key={d.key} className="flex flex-col items-center gap-[3px]">
                      <div style={{ width: "22px", height: "4px", backgroundColor: color, borderRadius: "1px" }} />
                      <span className="text-[7px] uppercase text-gray-400 leading-none tracking-wide">{d.label}</span>
                    </div>
                  );
                })}
              </div>

              {/* Resolved */}
              <div className="hidden lg:block text-right shrink-0 w-20">
                <div className="text-[12px] font-medium text-gray-600 tabular-nums">{stats.correct}/{stats.resolved}</div>
                <div className="text-[10px] text-gray-300 tabular-nums">+{stats.tooEarly} open</div>
              </div>

              {/* Accuracy */}
              <div className="text-right shrink-0 w-16">
                {stats.accuracyPct !== null ? (
                  <span
                    className="text-[22px] font-bold tabular-nums leading-none"
                    style={{ color: accent }}
                  >
                    {stats.accuracyPct}%
                  </span>
                ) : (
                  <span className="text-gray-300 text-[14px]">—</span>
                )}
              </div>

              {/* Chevron */}
              <span className="text-gray-300 group-hover:text-gray-500 transition-colors shrink-0 text-[13px]">→</span>
            </Link>
          );
        })}
      </div>

      {/* Prediction table */}
      <PredictionTable rows={predictions} />

      {/* Bottom note */}
      <div className="mt-12 pt-8 border-t border-gray-100">
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
