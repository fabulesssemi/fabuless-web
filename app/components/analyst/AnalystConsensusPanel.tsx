import type { AnalystView } from "@/lib/analyst/types";
import {
  Pill,
  Section,
  changeTone,
  fmtPercent,
  fmtPrice,
  timeAgo,
} from "@/app/components/company/primitives";
import { PTSparkline } from "./PTSparkline";

export function SentimentBadge({
  direction,
  score,
}: {
  direction: AnalystView["sentimentDirection"];
  score?: number;
}) {
  const map = {
    improving: { tone: "amber" as const, arrow: "↑", label: "Improving" },
    weakening: { tone: "rose" as const, arrow: "↓", label: "Weakening" },
    stable: { tone: "neutral" as const, arrow: "–", label: "Stable" },
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
    rising:  { tone: "amber" as const, label: "Estimates Rising" },
    falling: { tone: "rose" as const,  label: "Estimates Falling" },
    stable:  { tone: "neutral" as const, label: "Estimates Stable" },
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
    { v: d.strongBuy + d.buy, c: "bg-amber-400", label: "Buy" },
    { v: d.hold,              c: "bg-gray-200",  label: "Hold" },
    { v: d.sell + d.strongSell, c: "bg-rose-400", label: "Sell" },
  ];
  return (
    <div>
      <div className="flex h-2 w-full overflow-hidden rounded-full bg-gray-100">
        {segs.map((s) => (
          <div key={s.label} className={s.c} style={{ width: `${(s.v / total) * 100}%` }} />
        ))}
      </div>
      <div className="mt-1.5 flex justify-between text-[11px] text-gray-400">
        <span className="text-amber-700">{segs[0].v} Buy</span>
        <span>{segs[1].v} Hold</span>
        <span className="text-rose-600">{segs[2].v} Sell</span>
      </div>
    </div>
  );
}

function actionVerb(action?: string): { label: string; tone: "emerald" | "rose" | "neutral" } {
  switch (action) {
    case "up":   return { label: "Upgrade",    tone: "emerald" };
    case "down": return { label: "Downgrade",  tone: "rose" };
    case "init": return { label: "Initiated",  tone: "neutral" };
    case "reit": return { label: "Reiterated", tone: "neutral" };
    default:     return { label: "Maintained", tone: "neutral" };
  }
}

export function AnalystConsensusPanel({ view }: { view: AnalystView }) {
  const currency = view.ticker.endsWith(".KS") ? "KRW" : "USD";
  const hasConsensus =
    view.consensusRating != null || view.avgPriceTarget != null || view.distribution != null;

  return (
    <Section eyebrow="Wall Street" title="Analyst Consensus">
      {!hasConsensus ? (
        <p className="text-sm text-gray-400 italic">
          Analyst data temporarily unavailable for {view.ticker}.
        </p>
      ) : (
        <div className="space-y-6">

          {/* Key consensus numbers — plain stats, no boxes */}
          <div className="grid grid-cols-3 gap-6">
            <div>
              <div className="text-[10px] uppercase tracking-wider text-gray-400 mb-1">Consensus</div>
              <div className="text-2xl font-semibold text-gray-900">{view.consensusRating ?? "—"}</div>
              {view.numberOfAnalysts != null && (
                <div className="text-[11px] text-gray-400">{view.numberOfAnalysts} analysts</div>
              )}
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-wider text-gray-400 mb-1">Avg Price Target</div>
              <div className="text-2xl font-semibold text-gray-900 tabular-nums">
                {view.avgPriceTarget != null ? fmtPrice(view.avgPriceTarget, currency) : "—"}
              </div>
              {view.delta?.ptChangePct != null && Math.abs(view.delta.ptChangePct) >= 0.05 && (
                <div className={`text-[11px] ${changeTone(view.delta.ptChangePct)}`}>
                  {fmtPercent(view.delta.ptChangePct)} vs {view.delta.priorSnapshotDate}
                </div>
              )}
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-wider text-gray-400 mb-1">Implied Upside</div>
              <div className={`text-2xl font-semibold tabular-nums ${changeTone(view.impliedUpsidePct)}`}>
                {view.impliedUpsidePct != null ? fmtPercent(view.impliedUpsidePct) : "—"}
              </div>
            </div>
          </div>

          {/* PT range bar */}
          {view.lowPriceTarget != null &&
            view.highPriceTarget != null &&
            view.avgPriceTarget != null &&
            view.currentPrice != null && (
              <PTRangeBar
                low={view.lowPriceTarget}
                current={view.currentPrice}
                avg={view.avgPriceTarget}
                high={view.highPriceTarget}
                currency={currency}
              />
            )}

          {/* Rating breakdown */}
          {view.distribution && (
            <div>
              <div className="text-[10px] uppercase tracking-wider text-gray-400 mb-2">
                Rating Breakdown
              </div>
              <DistributionBar d={view.distribution} />
            </div>
          )}

          {/* PT sparkline */}
          {view.ptHistory && view.ptHistory.length >= 2 && (
            <div>
              <div className="text-[10px] uppercase tracking-wider text-gray-400 mb-2">
                Price Target Trend
              </div>
              <PTSparkline data={view.ptHistory} />
            </div>
          )}

          {/* Sentiment narrative — plain text, no amber box */}
          <div className="border-t border-gray-100 pt-5">
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <SentimentBadge direction={view.sentimentDirection} score={view.sentimentScore} />
              <EstimateBadge direction={view.estimateDirection} />
            </div>
            <p className="text-[14px] text-gray-600 leading-relaxed">{view.narrative}</p>
            {(view.bullThemes.length > 0 || view.bearThemes.length > 0) && (
              <div className="mt-4 grid sm:grid-cols-2 gap-4">
                {view.bullThemes.length > 0 && (
                  <div>
                    <div className="text-[10px] uppercase tracking-wider text-amber-700 mb-1">
                      Bullish themes
                    </div>
                    <p className="text-[12px] text-gray-500 leading-relaxed">
                      {view.bullThemes.slice(0, 3).join(" · ")}
                    </p>
                  </div>
                )}
                {view.bearThemes.length > 0 && (
                  <div>
                    <div className="text-[10px] uppercase tracking-wider text-gray-500 mb-1">
                      Bearish themes
                    </div>
                    <p className="text-[12px] text-gray-500 leading-relaxed">
                      {view.bearThemes.slice(0, 3).join(" · ")}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Estimate revisions — plain stats */}
          {view.revisions &&
            (view.revisions.epsUpLast30d != null ||
              view.revisions.epsDownLast30d != null ||
              view.revisions.epsCurrent != null) && (
              <div className="border-t border-gray-100 pt-5">
                <div className="text-[10px] uppercase tracking-wider text-gray-400 mb-3">
                  Estimate Revisions (next quarter EPS)
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <RevStat label="Up (7d)"   value={view.revisions.epsUpLast7d}   tone="text-emerald-600" />
                  <RevStat label="Up (30d)"  value={view.revisions.epsUpLast30d}  tone="text-emerald-600" />
                  <RevStat label="Down (30d)" value={view.revisions.epsDownLast30d} tone="text-rose-600" />
                  <RevStat
                    label="vs 90d ago"
                    value={
                      view.revisions.epsCurrent != null && view.revisions.eps90dAgo != null
                        ? `${view.revisions.epsCurrent >= view.revisions.eps90dAgo ? "+" : ""}${(view.revisions.epsCurrent - view.revisions.eps90dAgo).toFixed(2)}`
                        : "—"
                    }
                    tone={
                      view.revisions.epsCurrent != null && view.revisions.eps90dAgo != null
                        ? changeTone(view.revisions.epsCurrent - view.revisions.eps90dAgo)
                        : "text-gray-400"
                    }
                  />
                </div>
              </div>
            )}

          {/* Recent analyst actions */}
          {view.recentActions && view.recentActions.length > 0 && (() => {
            const named = view.recentActions.filter((a) => a.firm && a.firm !== "—");
            if (named.length === 0) return null;
            return (
              <div className="border-t border-gray-100 pt-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="text-[10px] uppercase tracking-wider text-gray-400">
                    Recent Analyst Actions
                  </div>
                  <div className="text-[11px] text-gray-400">
                    {view.upgrades30d ?? 0} up · {view.downgrades30d ?? 0} down (30d)
                  </div>
                </div>
                <ul className="divide-y divide-gray-100">
                  {named.slice(0, 6).map((a, i) => {
                    const v = actionVerb(a.action);
                    return (
                      <li key={`${a.firm}-${i}`} className="py-2.5 flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <div className="text-[13px] font-medium text-gray-800 truncate">
                            {a.analyst ? `${a.analyst}, ` : ""}{a.firm}
                          </div>
                          <div className="text-[11px] text-gray-400">
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
                            <div className="text-[10px] text-gray-400 mt-0.5">{timeAgo(a.date)}</div>
                          )}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>
            );
          })()}

          <div className="text-[11px] text-gray-400 border-t border-gray-100 pt-3">
            Source: {view.sources.join(", ") || "—"} · cached hourly
          </div>
        </div>
      )}
    </Section>
  );
}

function PTRangeBar({
  low, current, avg, high, currency,
}: {
  low: number; current: number; avg: number; high: number; currency: string;
}) {
  const range = high - low;
  if (range <= 0) return null;
  const pct = (v: number) => Math.max(0, Math.min(100, ((v - low) / range) * 100));
  const curPct = pct(current);
  const avgPct = pct(avg);

  return (
    <div>
      <div className="text-[10px] uppercase tracking-wider text-gray-400 mb-3">
        Price Target Range
      </div>
      <div className="relative">
        <div className="h-1 rounded-full bg-gray-100 relative">
          <div className="absolute inset-y-0 left-0 bg-gray-300 rounded-l-full" style={{ width: `${curPct}%` }} />
          {avgPct > curPct && (
            <div className="absolute inset-y-0 bg-emerald-400" style={{ left: `${curPct}%`, width: `${avgPct - curPct}%` }} />
          )}
          <div className="absolute inset-y-0 bg-emerald-100 rounded-r-full" style={{ left: `${Math.max(curPct, avgPct)}%`, width: `${100 - Math.max(curPct, avgPct)}%` }} />
          <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-2.5 h-2.5 rounded-full bg-gray-700 ring-2 ring-white z-10" style={{ left: `${curPct}%` }} />
          <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white z-10" style={{ left: `${avgPct}%` }} />
        </div>
        <div className="flex justify-between mt-2 text-[10px] text-gray-400">
          <span>{fmtPrice(low, currency)} Low</span>
          <span>High {fmtPrice(high, currency)}</span>
        </div>
      </div>
      <div className="flex gap-5 mt-3 text-[11px]">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-gray-700 inline-block shrink-0" />
          <span className="text-gray-500">Current <span className="text-gray-900 tabular-nums">{fmtPrice(current, currency)}</span></span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block shrink-0" />
          <span className="text-gray-500">Avg PT <span className="text-emerald-600 tabular-nums">{fmtPrice(avg, currency)}</span></span>
        </div>
      </div>
    </div>
  );
}

function RevStat({ label, value, tone }: { label: string; value: number | string | undefined; tone: string; }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wider text-gray-400 mb-0.5">{label}</div>
      <div className={`text-lg font-semibold tabular-nums ${tone}`}>
        {value == null ? "—" : value}
      </div>
    </div>
  );
}
