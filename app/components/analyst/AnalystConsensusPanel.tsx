import type { AnalystView } from "@/lib/analyst/types";
import {
  Pill,
  Section,
  changeTone,
  fmtPercent,
  fmtPrice,
  timeAgo,
} from "@/app/components/company/primitives";

export function SentimentBadge({
  direction,
  score,
}: {
  direction: AnalystView["sentimentDirection"];
  score?: number;
}) {
  const map = {
    improving: { tone: "emerald" as const, arrow: "▲", label: "Improving" },
    weakening: { tone: "rose" as const, arrow: "▼", label: "Weakening" },
    stable: { tone: "neutral" as const, arrow: "→", label: "Stable" },
  };
  const m = map[direction];
  return (
    <Pill tone={m.tone}>
      {m.arrow} Sentiment {m.label}
      {score != null && score !== 0 ? ` (${score > 0 ? "+" : ""}${score}pp)` : ""}
    </Pill>
  );
}

export function EstimateBadge({
  direction,
}: {
  direction: AnalystView["estimateDirection"];
}) {
  const map = {
    rising: { tone: "emerald" as const, label: "Estimates Rising" },
    falling: { tone: "rose" as const, label: "Estimates Falling" },
    stable: { tone: "neutral" as const, label: "Estimates Stable" },
  };
  const m = map[direction];
  return <Pill tone={m.tone}>{m.label}</Pill>;
}

export function DistributionBar({
  d,
}: {
  d: { strongBuy: number; buy: number; hold: number; sell: number; strongSell: number };
}) {
  const total = d.strongBuy + d.buy + d.hold + d.sell + d.strongSell || 1;
  const segs = [
    { v: d.strongBuy + d.buy, c: "bg-emerald-500", label: "Buy" },
    { v: d.hold, c: "bg-slate-500", label: "Hold" },
    { v: d.sell + d.strongSell, c: "bg-rose-500", label: "Sell" },
  ];
  return (
    <div>
      <div className="flex h-2.5 w-full overflow-hidden rounded-full bg-white/5">
        {segs.map((s) => (
          <div key={s.label} className={s.c} style={{ width: `${(s.v / total) * 100}%` }} />
        ))}
      </div>
      <div className="mt-1.5 flex justify-between text-[11px] text-slate-500">
        <span className="text-emerald-400">{segs[0].v} Buy</span>
        <span>{segs[1].v} Hold</span>
        <span className="text-rose-400">{segs[2].v} Sell</span>
      </div>
    </div>
  );
}

function actionVerb(action?: string): { label: string; tone: "emerald" | "rose" | "neutral" } {
  switch (action) {
    case "up":
      return { label: "Upgrade", tone: "emerald" };
    case "down":
      return { label: "Downgrade", tone: "rose" };
    case "init":
      return { label: "Initiated", tone: "neutral" };
    case "reit":
      return { label: "Reiterated", tone: "neutral" };
    default:
      return { label: "Maintained", tone: "neutral" };
  }
}

export function AnalystConsensusPanel({ view }: { view: AnalystView }) {
  const currency = view.ticker.endsWith(".KS") ? "KRW" : "USD";
  const hasConsensus =
    view.consensusRating != null || view.avgPriceTarget != null || view.distribution != null;

  return (
    <Section eyebrow="Wall Street" title="Analyst Consensus">
      {!hasConsensus ? (
        <p className="text-sm text-slate-500 italic">
          Analyst data is temporarily unavailable for {view.ticker}.
        </p>
      ) : (
        <div className="space-y-6">
          {/* 1. CONSENSUS SNAPSHOT */}
          <div className="grid sm:grid-cols-3 gap-4">
            <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
              <div className="text-[11px] uppercase tracking-wider text-slate-500">
                Consensus
              </div>
              <div className="text-2xl font-semibold text-white">
                {view.consensusRating ?? "—"}
              </div>
              {view.numberOfAnalysts != null && (
                <div className="text-[11px] text-slate-500">
                  {view.numberOfAnalysts} analysts
                </div>
              )}
            </div>
            <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
              <div className="text-[11px] uppercase tracking-wider text-slate-500">
                Avg Price Target
              </div>
              <div className="text-2xl font-semibold text-white tabular-nums">
                {view.avgPriceTarget != null ? fmtPrice(view.avgPriceTarget, currency) : "—"}
              </div>
              {view.delta?.ptChangePct != null && Math.abs(view.delta.ptChangePct) >= 0.05 && (
                <div className={`text-[11px] ${changeTone(view.delta.ptChangePct)}`}>
                  {fmtPercent(view.delta.ptChangePct)} vs {view.delta.priorSnapshotDate}
                </div>
              )}
            </div>
            <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
              <div className="text-[11px] uppercase tracking-wider text-slate-500">
                Implied Upside
              </div>
              <div className={`text-2xl font-semibold tabular-nums ${changeTone(view.impliedUpsidePct)}`}>
                {view.impliedUpsidePct != null ? fmtPercent(view.impliedUpsidePct) : "—"}
              </div>
              {view.lowPriceTarget != null && view.highPriceTarget != null && (
                <div className="text-[11px] text-slate-500">
                  {fmtPrice(view.lowPriceTarget, currency)}–{fmtPrice(view.highPriceTarget, currency)}
                </div>
              )}
            </div>
          </div>

          {view.distribution && (
            <div>
              <div className="text-[11px] uppercase tracking-wider text-slate-500 mb-2">
                Rating Breakdown
              </div>
              <DistributionBar d={view.distribution} />
            </div>
          )}

          {/* 3. CONSENSUS NARRATIVE */}
          <div className="rounded-xl border border-amber-400/20 bg-amber-400/[0.03] p-4">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <SentimentBadge direction={view.sentimentDirection} score={view.sentimentScore} />
              <EstimateBadge direction={view.estimateDirection} />
            </div>
            <div className="text-[11px] uppercase tracking-wider text-amber-400/80 mb-1">
              What changed
            </div>
            <p className="text-sm text-slate-200 leading-relaxed">{view.narrative}</p>
            {(view.bullThemes.length > 0 || view.bearThemes.length > 0) && (
              <div className="mt-3 grid sm:grid-cols-2 gap-3">
                {view.bullThemes.length > 0 && (
                  <div>
                    <div className="text-[11px] uppercase tracking-wider text-emerald-400/80 mb-1">
                      Bullish themes
                    </div>
                    <p className="text-[12px] text-slate-400 leading-relaxed">
                      {view.bullThemes.slice(0, 3).join(" · ")}
                    </p>
                  </div>
                )}
                {view.bearThemes.length > 0 && (
                  <div>
                    <div className="text-[11px] uppercase tracking-wider text-rose-400/80 mb-1">
                      Bearish themes
                    </div>
                    <p className="text-[12px] text-slate-400 leading-relaxed">
                      {view.bearThemes.slice(0, 3).join(" · ")}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* 4. ESTIMATE REVISION TRENDS */}
          {view.revisions &&
            (view.revisions.epsUpLast30d != null ||
              view.revisions.epsDownLast30d != null ||
              view.revisions.epsCurrent != null) && (
              <div>
                <div className="text-[11px] uppercase tracking-wider text-slate-500 mb-2">
                  Estimate Revisions (next quarter EPS)
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <RevStat label="Up (7d)" value={view.revisions.epsUpLast7d} tone="text-emerald-400" />
                  <RevStat label="Up (30d)" value={view.revisions.epsUpLast30d} tone="text-emerald-400" />
                  <RevStat label="Down (30d)" value={view.revisions.epsDownLast30d} tone="text-rose-400" />
                  <RevStat
                    label="Est. vs 90d ago"
                    value={
                      view.revisions.epsCurrent != null && view.revisions.eps90dAgo != null
                        ? `${view.revisions.epsCurrent >= view.revisions.eps90dAgo ? "+" : ""}${(
                            view.revisions.epsCurrent - view.revisions.eps90dAgo
                          ).toFixed(2)}`
                        : "—"
                    }
                    tone={
                      view.revisions.epsCurrent != null && view.revisions.eps90dAgo != null
                        ? changeTone(view.revisions.epsCurrent - view.revisions.eps90dAgo)
                        : "text-slate-300"
                    }
                  />
                </div>
              </div>
            )}

          {/* 2. RECENT ANALYST ACTIONS */}
          {view.recentActions && view.recentActions.length > 0 && (() => {
            const namedActions = view.recentActions.filter(
              (a) => a.firm && a.firm !== "—",
            );
            if (namedActions.length === 0) return null;
            return (
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="text-[11px] uppercase tracking-wider text-slate-500">
                  Recent Analyst Actions
                </div>
                <div className="text-[11px] text-slate-500">
                  {view.upgrades30d ?? 0} up · {view.downgrades30d ?? 0} down (30d)
                </div>
              </div>
              <ul className="divide-y divide-white/5">
                {namedActions.slice(0, 6).map((a, i) => {
                  const v = actionVerb(a.action);
                  return (
                    <li key={`${a.firm}-${i}`} className="py-2 flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <div className="text-sm text-slate-200 truncate">{a.firm}</div>
                        <div className="text-[11px] text-slate-500">
                          {a.fromGrade && a.toGrade && a.fromGrade !== a.toGrade
                            ? `${a.fromGrade} → ${a.toGrade}`
                            : (a.toGrade ?? "")}
                          {a.newTarget != null
                            ? ` · PT ${fmtPrice(a.newTarget, currency)}${a.oldTarget != null ? ` (was ${fmtPrice(a.oldTarget, currency)})` : ""}`
                            : ""}
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <Pill tone={v.tone}>{v.label}</Pill>
                        {a.date && (
                          <div className="text-[10px] text-slate-600 mt-0.5">{timeAgo(a.date)}</div>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
            );
          })()}

          <div className="text-[11px] text-slate-600">
            Source: {view.sources.join(", ") || "—"} · cached hourly
          </div>
        </div>
      )}
    </Section>
  );
}

function RevStat({
  label,
  value,
  tone,
}: {
  label: string;
  value: number | string | undefined;
  tone: string;
}) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/[0.02] p-3">
      <div className="text-[10px] uppercase tracking-wider text-slate-500">{label}</div>
      <div className={`text-lg font-semibold tabular-nums ${tone}`}>
        {value == null ? "—" : value}
      </div>
    </div>
  );
}
