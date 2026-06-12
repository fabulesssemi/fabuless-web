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
  TOO_EARLY: "#C4C4BC",
};

const STATUS_LABEL: Record<PredictionStatus, string> = {
  CORRECT: "Correct",
  PARTIAL: "Partial",
  WRONG: "Wrong",
  TOO_EARLY: "Open",
};

// Hand-picked reputation-defining calls per expert: [predictionId, whyItMattered]
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

/* ── Timeline: every prediction as a dot, lanes by outcome ───────────── */
function Timeline({ rows }: { rows: Prediction[] }) {
  const dated = rows.filter((r) => r.date).slice().sort((a, b) => a.date.localeCompare(b.date));
  if (dated.length === 0) return null;

  const minTs = new Date(dated[0].date).getTime();
  const maxTs = new Date(dated[dated.length - 1].date).getTime();
  const span = Math.max(maxTs - minTs, 1);

  const W = 920, H = 190, PAD_L = 64, PAD_R = 16, PAD_T = 18;
  const LANES: PredictionStatus[] = ["CORRECT", "PARTIAL", "WRONG", "TOO_EARLY"];
  const laneY = (s: PredictionStatus) => PAD_T + LANES.indexOf(s) * 40 + 12;
  const x = (date: string) => PAD_L + ((new Date(date).getTime() - minTs) / span) * (W - PAD_L - PAD_R);

  // Year gridlines
  const startYear = new Date(minTs).getFullYear();
  const endYear = new Date(maxTs).getFullYear();
  const years: number[] = [];
  for (let y = startYear + 1; y <= endYear; y++) years.push(y);

  // Jitter overlapping dots within a lane (same month) horizontally
  const seen = new Map<string, number>();
  const dots = dated.map((r) => {
    const key = `${r.status}-${r.date.slice(0, 7)}`;
    const n = seen.get(key) ?? 0;
    seen.set(key, n + 1);
    return { r, cx: x(r.date) + (n % 5) * 3.5, cy: laneY(r.status) + (Math.floor(n / 5) % 3) * 7 - 7 };
  });

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label="Prediction timeline">
      {years.map((y) => {
        const gx = x(`${y}-01-01`);
        return (
          <g key={y}>
            <line x1={gx} y1={PAD_T - 8} x2={gx} y2={H - 22} stroke="#E5E7EB" strokeWidth="1" />
            <text x={gx} y={H - 8} textAnchor="middle" fontSize="10" fill="#9CA3AF">{y}</text>
          </g>
        );
      })}
      {LANES.map((s) => (
        <g key={s}>
          <line x1={PAD_L} y1={laneY(s)} x2={W - PAD_R} y2={laneY(s)} stroke="#F3F4F6" strokeWidth="22" strokeLinecap="round" />
          <text x={PAD_L - 10} y={laneY(s) + 3.5} textAnchor="end" fontSize="10" fontWeight="600" fill={s === "TOO_EARLY" ? "#9CA3AF" : STATUS_COLOR[s]}>
            {STATUS_LABEL[s]}
          </text>
        </g>
      ))}
      {dots.map(({ r, cx, cy }) => (
        <circle key={r.id} cx={cx} cy={cy} r="4" fill={STATUS_COLOR[r.status]} fillOpacity={r.status === "TOO_EARLY" ? 0.7 : 0.85}>
          <title>{`${r.date} — ${r.claim.slice(0, 120)}${r.claim.length > 120 ? "…" : ""} [${STATUS_LABEL[r.status]}]`}</title>
        </circle>
      ))}
    </svg>
  );
}

/* ── Year × domain heatmap ────────────────────────────────────────────── */
function heatColor(pct: number | null, resolved: number): { bg: string; fg: string } {
  if (pct === null || resolved === 0) return { bg: "#FAFAF8", fg: "#D1D5DB" };
  if (pct >= 75) return { bg: "#059669", fg: "#FFFFFF" };
  if (pct >= 60) return { bg: "#34D399", fg: "#064E3B" };
  if (pct >= 45) return { bg: "#FBBF24", fg: "#78350F" };
  if (pct >= 30) return { bg: "#FB7185", fg: "#881337" };
  return { bg: "#E11D48", fg: "#FFFFFF" };
}

export default async function ExpertScorecard({ params }: { params: Promise<{ expert: string }> }) {
  const { expert } = await params;
  const meta = getExpert(expert);
  if (!meta) notFound();

  const rows = predictions.filter((p) => p.expert === meta.id);
  const stats = statsFor(meta.id);

  // Heatmap data: year × domain accuracy
  const years = [...new Set(rows.map((r) => r.date.slice(0, 4)))].sort();
  const domains = stats.domains;
  const cell = (year: string, domain: string) => {
    const subset = rows.filter((r) => r.date.startsWith(year) && r.domain === domain);
    const c = subset.filter((r) => r.status === "CORRECT").length;
    const p = subset.filter((r) => r.status === "PARTIAL").length;
    const w = subset.filter((r) => r.status === "WRONG").length;
    const resolved = c + p + w;
    return { resolved, total: subset.length, pct: resolved > 0 ? Math.round(((c + p * 0.5) / resolved) * 100) : null };
  };

  const headline = `${meta.name}: ${stats.accuracyPct}% accurate on ${stats.resolved} resolved semiconductor predictions`;
  const shareUrl = `https://fabuless.ai/tracker/${meta.id}`;
  const tweetHref = `https://twitter.com/intent/tweet?text=${encodeURIComponent(headline + " — via fabuless.ai")}&url=${encodeURIComponent(shareUrl)}`;

  const signatures = (SIGNATURE_CALLS[meta.id] ?? [])
    .map(([id, why]) => ({ pred: rows.find((r) => r.id === id), why }))
    .filter((s): s is { pred: Prediction; why: string } => Boolean(s.pred));

  return (
    <div>
      {/* ── Header ── */}
      <div className="border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-6 pt-6 pb-5">
          <Link href="/tracker" className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-[#B45309] border border-amber-200 bg-amber-50 hover:bg-amber-100 px-3 py-1.5 rounded transition-colors">
            ← Prediction Tracker
          </Link>

          <div className="mt-5 flex flex-wrap items-end justify-between gap-8">
            <div>
              <div className="flex items-center gap-2.5">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: meta.accent }} />
                <span className="text-[11px] uppercase tracking-widest text-gray-400">{meta.subtitle}</span>
              </div>
              <h1 className="font-sans text-[28px] font-bold tracking-tight leading-none mt-1.5 text-[#111827]">{meta.name}</h1>
              <div className="text-[12px] text-gray-400 mt-1.5">
                {stats.total} predictions tracked · {stats.dateRange} · {stats.sourceCount} sources
              </div>
            </div>

            <div className="flex items-center gap-8">
              <div className="text-right">
                <div className="font-mono text-[40px] font-bold leading-none text-[#111827] tabular-nums">
                  {stats.accuracyPct !== null ? `${stats.accuracyPct}%` : "—"}
                </div>
                <div className="text-[10px] uppercase tracking-widest text-gray-400 mt-1.5">
                  accurate · {stats.resolved} resolved
                </div>
              </div>
              <div className="flex flex-col gap-1.5 text-[12px] tabular-nums">
                <span className="text-emerald-600 font-semibold">{stats.correct} correct</span>
                <span className="text-amber-600 font-semibold">{stats.partial} partial</span>
                <span className="text-rose-600 font-semibold">{stats.wrong} wrong</span>
                <span className="text-gray-400 font-semibold">{stats.tooEarly} open</span>
              </div>
            </div>
          </div>

          <a
            href={tweetHref}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex items-center gap-2 border border-gray-200 hover:border-gray-400 text-[12px] font-semibold text-gray-500 hover:text-gray-700 px-3.5 py-2 rounded transition-colors"
          >
            <span className="font-bold">𝕏</span> Share this scorecard
          </a>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-10">
        {/* ── Timeline ── */}
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-1">
            <h2 className="text-[12px] font-bold uppercase tracking-widest text-gray-400">The record, dot by dot</h2>
            <div className="h-px flex-1 bg-gray-200" />
          </div>
          <p className="text-[11px] text-gray-400 mb-5">Every tracked prediction, placed by the date it was made. Hover any dot for the claim.</p>
          <Timeline rows={rows} />
        </section>

        {/* ── Domain breakdown ── */}
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-1">
            <h2 className="text-[12px] font-bold uppercase tracking-widest text-gray-400">Where they're sharp — and where they miss</h2>
            <div className="h-px flex-1 bg-gray-200" />
          </div>
          <p className="text-[11px] text-gray-400 mb-5">Accuracy on resolved predictions by domain. Partial calls count half.</p>

          <div className="grid sm:grid-cols-2 gap-x-10 gap-y-5">
            {domains.map((d) => {
              const { bg } = heatColor(d.accuracyPct, d.resolved);
              return (
                <div key={d.domain}>
                  <div className="flex items-baseline justify-between mb-1.5">
                    <span className="text-[13px] font-semibold text-[#111827]">{d.label}</span>
                    <span className="text-[12px] text-gray-400 tabular-nums">
                      {d.accuracyPct !== null ? <span className="font-bold text-gray-700">{d.accuracyPct}%</span> : "—"}
                      <span className="ml-1.5">({d.resolved} resolved · {d.total - d.resolved} open)</span>
                    </span>
                  </div>
                  <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                    {d.accuracyPct !== null && (
                      <div className="h-full rounded-full" style={{ width: `${d.accuracyPct}%`, backgroundColor: bg }} />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ── Year × domain heatmap ── */}
        {years.length > 1 && (
          <section className="mb-12">
            <div className="flex items-center gap-3 mb-1">
              <h2 className="text-[12px] font-bold uppercase tracking-widest text-gray-400">Accuracy by year and domain</h2>
              <div className="h-px flex-1 bg-gray-200" />
            </div>
            <p className="text-[11px] text-gray-400 mb-5">Green = mostly right, red = mostly wrong, gray = nothing resolved yet.</p>

            <div className="overflow-x-auto">
              <table className="border-separate" style={{ borderSpacing: 3 }}>
                <thead>
                  <tr>
                    <th className="text-left text-[10px] font-bold uppercase tracking-wider text-gray-400 pr-3 pb-1">Domain</th>
                    {years.map((y) => (
                      <th key={y} className="text-center text-[10px] font-bold text-gray-400 pb-1 min-w-[52px]">{y}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {domains.map((d) => (
                    <tr key={d.domain}>
                      <td className="text-[12px] font-semibold text-gray-700 pr-3 whitespace-nowrap">{d.label}</td>
                      {years.map((y) => {
                        const c = cell(y, d.domain);
                        const { bg, fg } = heatColor(c.pct, c.resolved);
                        return (
                          <td
                            key={y}
                            className="text-center text-[11px] font-bold tabular-nums rounded"
                            style={{ backgroundColor: bg, color: fg, height: 34 }}
                            title={c.total === 0 ? "No predictions" : `${y} · ${d.label}: ${c.resolved} resolved of ${c.total}`}
                          >
                            {c.pct !== null ? `${c.pct}` : c.total > 0 ? "·" : ""}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* ── Signature calls ── */}
        {signatures.length > 0 && (
          <section className="mb-12">
            <div className="flex items-center gap-3 mb-5">
              <h2 className="text-[12px] font-bold uppercase tracking-widest text-gray-400">Signature calls</h2>
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
                    “{pred.claim}”
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
            <h2 className="text-[12px] font-bold uppercase tracking-widest text-gray-400">The full record</h2>
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
