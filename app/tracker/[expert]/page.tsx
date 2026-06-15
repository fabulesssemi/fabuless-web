import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { predictions, type Prediction, type PredictionStatus } from "@/lib/tracker/predictions";
import { statsFor } from "@/lib/tracker/stats";
import { EXPERTS, getExpert } from "@/lib/tracker/experts";
import { PredictionTable } from "@/app/components/tracker/PredictionTable";

export const dynamic = "force-static";

const STATUS_COLOR: Record<PredictionStatus, string> = {
  CORRECT:   "#059669",
  PARTIAL:   "#D97706",
  WRONG:     "#E11D48",
  TOO_EARLY: "#9CA3AF",
};

const STATUS_LABEL: Record<PredictionStatus, string> = {
  CORRECT:   "Correct",
  PARTIAL:   "Partial",
  WRONG:     "Wrong",
  TOO_EARLY: "Open",
};

const LEGEND: { status: PredictionStatus; label: string }[] = [
  { status: "CORRECT",   label: "Correct" },
  { status: "PARTIAL",   label: "Partial"  },
  { status: "WRONG",     label: "Wrong"    },
  { status: "TOO_EARLY", label: "Open"     },
];

const SIGNATURE_CALLS: Record<string, [string, string][]> = {
  dylan: [
    ["dylan-5", "Called the first gigawatt-scale AI training site for 2026 — xAI's Colossus 2 crossed the line in January 2026, right on schedule."],
    ["dylan-3", "The famous 'LLM-in-search will crater Google's profits' math — search AI arrived without the $36B cost bomb."],
  ],
  circuit: [
    ["circuit-2", "Took the under on Panther Lake delay rumors when the FUD was loudest — Intel shipped on time."],
    ["circuit-18", "Declared Intel Foundry dead just before the narrative (and the government stake) turned."],
  ],
  baker: [
    ["baker-1", "Called Intel's loss of the 25-year manufacturing lead in 2019 — and that it wouldn't come back quickly. The defining call of the decade."],
    ["baker-4", "Believed Intel 10nm server parts would show competitive data within 9 months — the optimism the manufacturing call should have ruled out."],
  ],
  doug: [
    ["doug-8", "Called the memory/semis glut in mid-2022 while the cycle was still partying — supply did overwhelm demand."],
    ["doug-10", "Said NVIDIA's data center business would never recover the China revenue hit — months before the AI boom made the number a rounding error."],
  ],
  stacy: [
    ["stacy-1", "The reluctant-bull NVDA call going into 2024 — right when it mattered most."],
    ["stacy-16", "Doubted anyone would own semis through tariff chaos in April 2025 — the group ripped instead."],
  ],
};

export function generateStaticParams() {
  return EXPERTS.map((e) => ({ expert: e.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ expert: string }> }): Promise<Metadata> {
  const { expert } = await params;
  const meta = getExpert(expert);
  if (!meta) return {};
  const stats = statsFor(meta.id);
  return {
    title: `${meta.name} Prediction Scorecard — Fabuless`,
    description: `${meta.name}: ${stats.accuracyPct}% accurate on ${stats.resolved} resolved semiconductor predictions.`,
  };
}

/* ── Timeline ── compact, no padding, fills its container ── */
function Timeline({ rows }: { rows: Prediction[] }) {
  const dated = rows.filter((r) => r.date).slice().sort((a, b) => a.date.localeCompare(b.date));
  if (dated.length === 0) return null;

  const minTs = new Date(dated[0].date).getTime();
  const maxTs = new Date(dated[dated.length - 1].date).getTime();
  const span  = Math.max(maxTs - minTs, 1);

  const W      = 920;
  const DOT_R  = 4;
  const BAND_H = 72;
  const BAND_Y = 1;
  const AXIS_Y = BAND_Y + BAND_H + 13;
  const H      = AXIS_Y + 4;

  const xPos = (date: string) =>
    (new Date(date).getTime() - minTs) / span * W;

  const startYear = new Date(minTs).getFullYear();
  const endYear   = new Date(maxTs).getFullYear();
  const years: number[] = [];
  for (let y = startYear + 1; y <= endYear; y++) years.push(y);

  const placed: { cx: number; cy: number; r: Prediction }[] = [];
  for (const r of dated) {
    const cx     = xPos(r.date);
    const nearby = placed.filter((p) => Math.abs(p.cx - cx) <= DOT_R * 2 + 1);
    let cy: number;
    if (nearby.length === 0) {
      cy = BAND_Y + BAND_H / 2;
    } else {
      const dir   = nearby.length % 2 === 1 ? -1 : 1;
      const level = Math.ceil(nearby.length / 2);
      cy = BAND_Y + BAND_H / 2 + dir * level * (DOT_R * 2 + 2);
      cy = Math.max(BAND_Y + DOT_R, Math.min(BAND_Y + BAND_H - DOT_R, cy));
    }
    placed.push({ cx, cy, r });
  }

  const sorted = [...placed].sort((a, b) => {
    const order: Record<PredictionStatus, number> = { TOO_EARLY: 0, PARTIAL: 1, WRONG: 2, CORRECT: 3 };
    return order[a.r.status] - order[b.r.status];
  });

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full overflow-visible" role="img" aria-label="Prediction timeline">
      <line x1="0" y1={BAND_Y + BAND_H} x2={W} y2={BAND_Y + BAND_H} stroke="#E5E7EB" strokeWidth="1" />
      {years.map((y) => (
        <text key={y} x={xPos(`${y}-01-01`)} y={AXIS_Y} textAnchor="middle" fontSize="9" fill="#C4C4C4" letterSpacing="0.03em">
          {y}
        </text>
      ))}
      {sorted.map(({ r, cx, cy }) => (
        <circle key={r.id} cx={cx} cy={cy} r={DOT_R}
          fill={STATUS_COLOR[r.status]}
          fillOpacity={r.status === "TOO_EARLY" ? 0.28 : 0.85}
        >
          <title>{`${r.date.slice(0, 7)} — ${r.claim.slice(0, 120)}${r.claim.length > 120 ? "…" : ""} [${STATUS_LABEL[r.status]}]`}</title>
        </circle>
      ))}
    </svg>
  );
}

function domainAccuracyColor(pct: number | null): string {
  if (pct === null) return "text-gray-300";
  if (pct >= 75) return "text-emerald-600";
  if (pct >= 55) return "text-amber-600";
  return "text-rose-500";
}

function domainBarColor(pct: number): string {
  if (pct >= 75) return "#059669";
  if (pct >= 55) return "#D97706";
  return "#E11D48";
}

export default async function ExpertScorecard({ params }: { params: Promise<{ expert: string }> }) {
  const { expert } = await params;
  const meta = getExpert(expert);
  if (!meta) notFound();

  const rows    = predictions.filter((p) => p.expert === meta.id);
  const stats   = statsFor(meta.id);
  const domains = stats.domains;

  const headline  = `${meta.name}: ${stats.accuracyPct}% accurate on ${stats.resolved} resolved semiconductor predictions`;
  const shareUrl  = `https://fabuless.ai/tracker/${meta.id}`;
  const tweetHref = `https://twitter.com/intent/tweet?text=${encodeURIComponent(headline + " — via fabuless.ai")}&url=${encodeURIComponent(shareUrl)}`;

  const signatures = (SIGNATURE_CALLS[meta.id] ?? [])
    .map(([id, why]) => ({ pred: rows.find((r) => r.id === id), why }))
    .filter((s): s is { pred: Prediction; why: string } => Boolean(s.pred));

  const accColor = stats.accuracyPct !== null
    ? stats.accuracyPct >= 80 ? "#059669" : stats.accuracyPct >= 70 ? "#D97706" : "#E11D48"
    : "#111827";

  return (
    <div>
      {/* ── Hero: two-column split — identity+stats left, timeline right ── */}
      <div className="border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-6 pt-4 pb-6">
          <Link href="/tracker" className="text-[11px] text-gray-400 hover:text-gray-600 transition-colors">
            ← Prediction Tracker
          </Link>

          <div className="mt-4 grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6 lg:gap-10 items-start">

            {/* Left panel: identity + accuracy */}
            <div className="relative pl-4">
              <div
                className="absolute left-0 top-0 bottom-0 w-[3px] rounded-full"
                style={{ backgroundColor: accColor }}
              />

              {/* Identity */}
              <div className="flex items-baseline gap-2 flex-wrap">
                <h1 className="font-sans text-[22px] font-bold tracking-tight text-[#111827] leading-none">
                  {meta.name}
                </h1>
                <span className="text-[13px] text-gray-400">{meta.subtitle}</span>
              </div>
              <div className="text-[11px] text-gray-400 mt-1 tabular-nums">
                {stats.total} predictions · {stats.dateRange} · {stats.sourceCount} sources
              </div>

              {/* Accuracy */}
              <div className="mt-5">
                <span
                  className="font-mono text-[52px] font-bold leading-none tabular-nums block"
                  style={{ color: accColor }}
                >
                  {stats.accuracyPct !== null ? `${stats.accuracyPct}%` : "—"}
                </span>
                <div className="text-[11px] text-gray-400 mt-1 tabular-nums">{stats.resolved} resolved predictions</div>
              </div>

              {/* Stat breakdown */}
              <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[12px] tabular-nums">
                <span className="text-emerald-600 font-medium">{stats.correct} correct</span>
                <span className="text-amber-600 font-medium">{stats.partial} partial</span>
                <span className="text-rose-500 font-medium">{stats.wrong} wrong</span>
                <span className="text-gray-400">{stats.tooEarly} open</span>
              </div>

              <a
                href={tweetHref}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-block text-[11px] text-gray-400 hover:text-gray-600 transition-colors"
              >
                Share →
              </a>
            </div>

            {/* Right panel: timeline */}
            <div className="min-w-0">
              <div className="flex items-center justify-end gap-3 mb-2">
                {LEGEND.map(({ status, label }) => (
                  <div key={status} className="flex items-center gap-1.5">
                    <svg width="7" height="7" viewBox="0 0 7 7">
                      <circle cx="3.5" cy="3.5" r="3"
                        fill={STATUS_COLOR[status]}
                        fillOpacity={status === "TOO_EARLY" ? 0.4 : 0.85} />
                    </svg>
                    <span className="text-[10px] text-gray-400">{label}</span>
                  </div>
                ))}
              </div>
              <Timeline rows={rows} />
            </div>
          </div>
        </div>
      </div>

      {/* ── Content ── */}
      <div className="max-w-5xl mx-auto px-6 py-8">

        {/* Domain breakdown — compact 3-col */}
        <section className="mb-10">
          <p className="text-[11px] font-semibold text-gray-400 mb-4">Where they&rsquo;re sharp</p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-x-10 gap-y-4">
            {domains.map((d) => (
              <div key={d.domain} className={d.resolved === 0 ? "opacity-30" : ""}>
                <div className="flex items-baseline gap-2 mb-1.5">
                  <span className="text-[12px] font-semibold text-gray-800">{d.label}</span>
                  {d.accuracyPct !== null ? (
                    <span className={`text-[12px] font-bold tabular-nums ${domainAccuracyColor(d.accuracyPct)}`}>
                      {d.accuracyPct}%
                    </span>
                  ) : (
                    <span className="text-[11px] text-gray-300">—</span>
                  )}
                  <span className="text-[10px] text-gray-400 tabular-nums ml-auto">
                    {d.resolved}r · {d.total - d.resolved}o
                  </span>
                </div>
                <div className="bg-gray-100 overflow-hidden" style={{ height: "3px", width: "160px", borderRadius: "1px" }}>
                  {d.accuracyPct !== null && (
                    <div style={{
                      height: "100%",
                      width: `${d.accuracyPct}%`,
                      backgroundColor: domainBarColor(d.accuracyPct),
                      borderRadius: "1px",
                    }} />
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Signature calls */}
        {signatures.length > 0 && (
          <section className="mb-10">
            <p className="text-[11px] font-semibold text-gray-400 mb-4">Signature calls</p>
            <div className="grid md:grid-cols-2 gap-4">
              {signatures.map(({ pred, why }) => (
                <div key={pred.id} className="rounded-xl border border-gray-100 bg-white p-5 flex flex-col shadow-sm">
                  <div className="flex items-center justify-between gap-3 mb-3">
                    <span className="text-[11px] text-gray-400">{pred.date.slice(0, 7)}</span>
                    <span
                      className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded border"
                      style={{
                        color: STATUS_COLOR[pred.status],
                        borderColor: STATUS_COLOR[pred.status] + "55",
                        backgroundColor: STATUS_COLOR[pred.status] + "11",
                      }}
                    >
                      {STATUS_LABEL[pred.status]}
                    </span>
                  </div>
                  <blockquote className="font-serif text-[14px] text-[#1a1a1a] leading-relaxed flex-1">
                    &ldquo;{pred.claim}&rdquo;
                  </blockquote>
                  <p className="text-[12px] text-gray-500 leading-relaxed mt-3 pt-3 border-t border-gray-100">{why}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Full record */}
        <section>
          <p className="text-[11px] font-semibold text-gray-400 mb-5">Full record</p>
          <PredictionTable rows={rows} hideExpertFilter />
        </section>

        <p className="mt-10 pt-4 border-t border-gray-100 text-[11px] text-gray-400 leading-relaxed max-w-2xl">
          Verdicts are editorial judgments based on verifiable outcomes, graded per the{" "}
          <Link href="/tracker/methodology" className="underline hover:text-gray-600">methodology</Link>.
          Partial calls count half. Fabuless is not affiliated with {meta.name}. Nothing here is investment advice.
        </p>
      </div>
    </div>
  );
}
