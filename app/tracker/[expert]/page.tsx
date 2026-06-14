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
  CORRECT: "Correct",
  PARTIAL: "Partial",
  WRONG: "Wrong",
  TOO_EARLY: "Open",
};

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
    description: `${meta.name}: ${stats.accuracyPct}% accurate on ${stats.resolved} resolved semiconductor predictions. Full history, domain breakdown, and every verdict.`,
  };
}

/* ── Timeline ─────────────────────────────────────────────────────────── */
function Timeline({ rows }: { rows: Prediction[] }) {
  const dated = rows.filter((r) => r.date).slice().sort((a, b) => a.date.localeCompare(b.date));
  if (dated.length === 0) return null;

  const minTs = new Date(dated[0].date).getTime();
  const maxTs = new Date(dated[dated.length - 1].date).getTime();
  const span = Math.max(maxTs - minTs, 1);

  const W = 920, PAD_L = 0, PAD_R = 0;
  // Single band: marks jitter vertically in a 40px band, axis below, legend above
  const BAND_TOP = 16;   // top of jitter band
  const BAND_H   = 40;   // height of jitter band
  const AXIS_Y   = BAND_TOP + BAND_H + 14; // year label baseline
  const H        = AXIS_Y + 4;

  const xPos = (date: string) =>
    PAD_L + ((new Date(date).getTime() - minTs) / span) * (W - PAD_L - PAD_R);

  const startYear = new Date(minTs).getFullYear();
  const endYear   = new Date(maxTs).getFullYear();
  const years: number[] = [];
  for (let y = startYear + 1; y <= endYear; y++) years.push(y);

  // Deterministic vertical jitter: hash the prediction id to get a stable Y offset
  // within the band so marks never overlap but also never shift on re-render
  const strHash = (s: string) => {
    let h = 0;
    for (let i = 0; i < s.length; i++) h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
    return Math.abs(h);
  };

  const MARK_R = 3;
  const dots = dated.map((r) => {
    const jitter = (strHash(r.id) % 1000) / 1000; // 0–1
    const cy = BAND_TOP + MARK_R + jitter * (BAND_H - MARK_R * 2);
    return { r, cx: xPos(r.date), cy };
  });

  const LEGEND = [
    { status: "CORRECT"   as PredictionStatus, label: "Correct" },
    { status: "PARTIAL"   as PredictionStatus, label: "Partial"  },
    { status: "WRONG"     as PredictionStatus, label: "Wrong"    },
    { status: "TOO_EARLY" as PredictionStatus, label: "Open"     },
  ];

  return (
    <div>
      {/* Inline legend — muted, small, no chrome */}
      <div className="flex items-center gap-4 mb-3">
        {LEGEND.map(({ status, label }) => (
          <div key={status} className="flex items-center gap-1.5">
            <svg width="8" height="8" viewBox="0 0 8 8">
              <circle cx="4" cy="4" r="3" fill={STATUS_COLOR[status]} fillOpacity={status === "TOO_EARLY" ? 0.45 : 0.85} />
            </svg>
            <span className="text-[10px] text-gray-400">{label}</span>
          </div>
        ))}
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} className="w-full overflow-visible" role="img" aria-label="Prediction timeline">
        {/* Year axis ticks — muted text only, no lines */}
        {years.map((y) => (
          <text key={y} x={xPos(`${y}-01-01`)} y={AXIS_Y} textAnchor="middle" fontSize="9" fill="#C4C4C4" letterSpacing="0.03em">
            {y}
          </text>
        ))}

        {/* Marks — bottom layer first (open/partial) so correct sits on top */}
        {[...dots].sort((a, b) => {
          const order: Record<PredictionStatus, number> = { TOO_EARLY: 0, WRONG: 1, PARTIAL: 2, CORRECT: 3 };
          return order[a.r.status] - order[b.r.status];
        }).map(({ r, cx, cy }) => (
          <circle
            key={r.id}
            cx={cx}
            cy={cy}
            r={MARK_R}
            fill={STATUS_COLOR[r.status]}
            fillOpacity={r.status === "TOO_EARLY" ? 0.35 : 0.8}
          >
            <title>{`${r.date.slice(0, 7)} — ${r.claim.slice(0, 120)}${r.claim.length > 120 ? "…" : ""} [${STATUS_LABEL[r.status]}]`}</title>
          </circle>
        ))}
      </svg>
    </div>
  );
}


function domainAccuracyColor(pct: number | null): string {
  if (pct === null) return "text-gray-300";
  if (pct >= 75) return "text-emerald-600";
  if (pct >= 55) return "text-amber-600";
  return "text-rose-500";
}

export default async function ExpertScorecard({ params }: { params: Promise<{ expert: string }> }) {
  const { expert } = await params;
  const meta = getExpert(expert);
  if (!meta) notFound();

  const rows = predictions.filter((p) => p.expert === meta.id);
  const stats = statsFor(meta.id);

  const domains = stats.domains;

  const headline = `${meta.name}: ${stats.accuracyPct}% accurate on ${stats.resolved} resolved semiconductor predictions`;
  const shareUrl = `https://fabuless.ai/tracker/${meta.id}`;
  const tweetHref = `https://twitter.com/intent/tweet?text=${encodeURIComponent(headline + " — via fabuless.ai")}&url=${encodeURIComponent(shareUrl)}`;

  const signatures = (SIGNATURE_CALLS[meta.id] ?? [])
    .map(([id, why]) => ({ pred: rows.find((r) => r.id === id), why }))
    .filter((s): s is { pred: Prediction; why: string } => Boolean(s.pred));

  const accColor = stats.accuracyPct !== null
    ? stats.accuracyPct >= 80 ? "#059669" : stats.accuracyPct >= 70 ? "#D97706" : "#E11D48"
    : "#111827";

  return (
    <div>
      {/* ── Header ── */}
      <div className="border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-6 py-4">
          <Link href="/tracker" className="text-[11px] text-gray-400 hover:text-gray-600">
            ← Prediction Tracker
          </Link>

          <div className="mt-2 flex items-center justify-between gap-6 flex-wrap">
            {/* Identity */}
            <div>
              <div className="flex items-baseline gap-2">
                <h1 className="font-sans text-[17px] font-bold tracking-tight text-[#111827] leading-none">{meta.name}</h1>
                <span className="text-[12px] text-gray-400">{meta.subtitle}</span>
              </div>
              <div className="text-[11px] text-gray-400 mt-1 tabular-nums">
                {stats.total} predictions · {stats.dateRange} · {stats.sourceCount} sources
              </div>
            </div>

            {/* Accuracy + breakdown */}
            <div className="flex items-baseline gap-4 flex-wrap">
              <span className="font-mono text-[28px] font-bold leading-none tabular-nums" style={{ color: accColor }}>
                {stats.accuracyPct !== null ? `${stats.accuracyPct}%` : "—"}
              </span>
              <div className="flex items-center gap-2 text-[11px] tabular-nums">
                <span className="text-gray-400">{stats.resolved} resolved</span>
                <span className="text-gray-200">·</span>
                <span className="text-emerald-600 font-semibold">{stats.correct}c</span>
                <span className="text-gray-200">·</span>
                <span className="text-amber-600 font-semibold">{stats.partial}p</span>
                <span className="text-gray-200">·</span>
                <span className="text-rose-500 font-semibold">{stats.wrong}w</span>
                <span className="text-gray-200">·</span>
                <span className="text-gray-400 font-semibold">{stats.tooEarly} open</span>
              </div>
              <a href={tweetHref} target="_blank" rel="noopener noreferrer" className="text-[11px] text-gray-400 hover:text-gray-600">𝕏</a>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 pt-5 pb-10">

        {/* ── Timeline ── */}
        <section className="mb-6">
          <div className="flex items-center gap-3 mb-1">
            <h2 className="text-[11px] font-bold uppercase tracking-widest text-gray-400">The record, dot by dot</h2>
            <div className="h-px flex-1 bg-gray-200" />
          </div>
          <p className="text-[11px] text-gray-400 mb-2">Every tracked prediction by date. Hover any dot for the claim.</p>
          <Timeline rows={rows} />
        </section>

        {/* ── Domain breakdown ── */}
        <section className="mb-10">
          <div className="flex items-center gap-3 mb-1">
            <h2 className="text-[11px] font-bold uppercase tracking-widest text-gray-400">Where they're sharp — and where they miss</h2>
            <div className="h-px flex-1 bg-gray-200" />
          </div>
          <p className="text-[11px] text-gray-400 mb-5">Accuracy on resolved predictions by domain. Partial calls count half.</p>

          <div className="grid sm:grid-cols-2 gap-x-12 gap-y-3">
            {domains.map((d) => {
              const noData = d.resolved === 0;
              return (
                <div key={d.domain} className={noData ? "opacity-40" : ""}>
                  <div className="flex items-baseline justify-between mb-1">
                    <span className="text-[12px] font-semibold text-gray-700">{d.label}</span>
                    <div className="flex items-baseline gap-2 text-[11px]">
                      {d.accuracyPct !== null ? (
                        <span className={`font-bold tabular-nums ${domainAccuracyColor(d.accuracyPct)}`}>
                          {d.accuracyPct}%
                        </span>
                      ) : (
                        <span className="text-gray-300">—</span>
                      )}
                      <span className="text-gray-400 tabular-nums">
                        {d.resolved}r · {d.total - d.resolved}o
                      </span>
                    </div>
                  </div>
                  <div className="bg-gray-100 overflow-hidden" style={{ height: "3px", width: "200px", borderRadius: "1px" }}>
                    {d.accuracyPct !== null && (
                      <div
                        style={{
                          height: "100%",
                          width: `${d.accuracyPct}%`,
                          backgroundColor: d.accuracyPct >= 75 ? "#059669" : d.accuracyPct >= 55 ? "#D97706" : "#E11D48",
                          borderRadius: "1px",
                        }}
                      />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>


        {/* ── Signature calls ── */}
        {signatures.length > 0 && (
          <section className="mb-12">
            <div className="flex items-center gap-3 mb-5">
              <h2 className="text-[11px] font-bold uppercase tracking-widest text-gray-400">Signature calls</h2>
              <div className="h-px flex-1 bg-gray-200" />
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              {signatures.map(({ pred, why }) => (
                <div key={pred.id} className="border border-gray-200 bg-white p-5 flex flex-col">
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
                  <blockquote className="font-serif text-[15px] text-[#1a1a1a] leading-relaxed flex-1">
                    "{pred.claim}"
                  </blockquote>
                  <p className="text-[12px] text-gray-500 leading-relaxed mt-3 pt-3 border-t border-gray-100">{why}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ── Full record ── */}
        <section>
          <div className="flex items-center gap-3 mb-5">
            <h2 className="text-[11px] font-bold uppercase tracking-widest text-gray-400">The full record</h2>
            <div className="h-px flex-1 bg-gray-200" />
          </div>
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
