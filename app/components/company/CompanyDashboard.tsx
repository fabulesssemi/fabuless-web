import Link from "next/link";
import type { CompanyEditorial, CompanyMeta } from "@/lib/companies";
import { COMPANY_UNIVERSE, getCompanyMeta } from "@/lib/companies";
import type { CompanyMarketData } from "@/lib/providers/types";
import {
  ChipGroup,
  Pill,
  Section,
  Stat,
  Unavailable,
  changeTone,
  fmtFraction,
  fmtMarketCap,
  fmtPercent,
  fmtPrice,
  timeAgo,
} from "./primitives";

export function CompanyDashboard({
  meta,
  editorial,
  data,
}: {
  meta: CompanyMeta;
  editorial?: CompanyEditorial;
  data: CompanyMarketData;
}) {
  const { profile, quote, earnings, consensus, news } = data;
  const currency = quote?.currency ?? "USD";

  return (
    <div className="min-h-screen bg-[#0B1120] text-slate-200">
      <div className="max-w-6xl mx-auto px-6 py-10">
        {/* Back link */}
        <Link
          href="/companies"
          className="text-xs uppercase tracking-widest text-slate-500 hover:text-amber-300 transition-colors"
        >
          ← All Companies
        </Link>

        {/* ---------------- HERO HEADER ---------------- */}
        <header className="mt-4 mb-8 pb-8 border-b border-white/10">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <div className="flex items-center gap-3">
                <span className="font-mono text-amber-400 text-lg font-semibold">
                  {meta.ticker}
                </span>
                {meta.exchangeLabel && (
                  <span className="text-xs text-slate-500">
                    {meta.exchangeLabel}
                  </span>
                )}
              </div>
              <h1 className="font-serif text-4xl sm:text-5xl text-white tracking-tight mt-1">
                {meta.name}
              </h1>
              <div className="mt-2">
                <Pill tone="cyan">{meta.sector}</Pill>
              </div>
            </div>

            {/* Live price block */}
            <div className="text-right">
              {quote?.price != null ? (
                <>
                  <div className="text-3xl font-semibold text-white tabular-nums">
                    {fmtPrice(quote.price, currency)}
                  </div>
                  <div
                    className={`text-sm font-medium tabular-nums ${changeTone(quote.changePercent)}`}
                  >
                    {quote.change != null
                      ? `${quote.change > 0 ? "+" : ""}${quote.change.toFixed(2)} `
                      : ""}
                    ({fmtPercent(quote.changePercent)})
                  </div>
                  <div className="mt-1 inline-flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-slate-500">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Live · Yahoo Finance
                  </div>
                </>
              ) : (
                <span className="text-sm text-slate-500">Price unavailable</span>
              )}
            </div>
          </div>

          {/* Key stats strip */}
          <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
            <Stat label="Market Cap" value={fmtMarketCap(quote?.marketCap)} />
            <Stat
              label="P/E (TTM)"
              value={quote?.peTrailing != null ? quote.peTrailing.toFixed(1) : "—"}
            />
            <Stat
              label="52-Week Range"
              value={
                quote?.fiftyTwoWeekLow != null && quote?.fiftyTwoWeekHigh != null
                  ? `${fmtPrice(quote.fiftyTwoWeekLow, currency)} – ${fmtPrice(quote.fiftyTwoWeekHigh, currency)}`
                  : "—"
              }
            />
            <Stat
              label="Next Earnings"
              value={earnings?.nextEarningsDate ?? "—"}
              tone="text-amber-300"
            />
          </div>
        </header>

        {/* ---------------- 1. QUICK TAKE ---------------- */}
        {editorial ? (
          <Section eyebrow="The 30-Second Read" title="Quick Take" className="mb-6">
            <p className="text-[15px] leading-relaxed text-slate-300">
              {editorial.quickTake}
            </p>
            <div className="mt-5 grid sm:grid-cols-2 gap-4">
              <div className="rounded-xl bg-white/[0.02] border border-white/10 p-4">
                <div className="text-[11px] uppercase tracking-wider text-cyan-400/80 mb-1">
                  Role in the AI ecosystem
                </div>
                <p className="text-sm text-slate-300 leading-relaxed">
                  {editorial.ecosystemRole}
                </p>
              </div>
              <div className="rounded-xl bg-white/[0.02] border border-white/10 p-4">
                <div className="text-[11px] uppercase tracking-wider text-amber-400/80 mb-1">
                  What investors care about now
                </div>
                <p className="text-sm text-slate-300 leading-relaxed">
                  {editorial.investorFocus}
                </p>
              </div>
            </div>
          </Section>
        ) : (
          <Section title="Quick Take" eyebrow="Deep-dive in progress" className="mb-6">
            <p className="text-sm text-slate-400 leading-relaxed">
              {profile?.description
                ? profile.description
                : `Our full editorial deep-dive for ${meta.name} is in progress. Live market data, earnings, analyst consensus, and news below are fully active.`}
            </p>
          </Section>
        )}

        {/* ---------------- Two-column body ---------------- */}
        <div className="grid lg:grid-cols-3 gap-6 items-start">
          {/* MAIN COLUMN */}
          <div className="lg:col-span-2 space-y-6">
            {/* 2. LATEST DEVELOPMENTS */}
            <Section eyebrow="Live" title="Latest Developments">
              {news.length > 0 ? (
                <ul className="divide-y divide-white/5">
                  {news.map((n) => (
                    <li key={n.url} className="py-3 first:pt-0 last:pb-0">
                      <a
                        href={n.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group flex items-baseline justify-between gap-4"
                      >
                        <span className="text-[15px] text-slate-200 group-hover:text-amber-300 transition-colors leading-snug">
                          {n.title}
                        </span>
                      </a>
                      <div className="mt-1 flex items-center gap-2 text-[11px] text-slate-500">
                        {n.source && <span>{n.source}</span>}
                        {n.source && n.publishedAt && <span>·</span>}
                        {n.publishedAt && <span>{timeAgo(n.publishedAt)}</span>}
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <Unavailable what="News" />
              )}
            </Section>

            {/* 3. WHY IT MATTERS */}
            {editorial && (
              <Section eyebrow="Analysis" title="Why It Matters">
                <div className="space-y-4">
                  <WhyBlock
                    label="Business implications"
                    tone="text-cyan-300"
                    text={editorial.whyItMatters.business}
                  />
                  <WhyBlock
                    label="Investment implications"
                    tone="text-amber-300"
                    text={editorial.whyItMatters.investment}
                  />
                  <WhyBlock
                    label="Ecosystem implications"
                    tone="text-emerald-300"
                    text={editorial.whyItMatters.ecosystem}
                  />
                </div>
              </Section>
            )}

            {/* 4. KEY THEMES */}
            {editorial && editorial.keyThemes.length > 0 && (
              <Section eyebrow="What the industry is watching" title="Key Themes">
                <div className="grid sm:grid-cols-2 gap-3">
                  {editorial.keyThemes.map((t) => (
                    <div
                      key={t.title}
                      className="rounded-xl border border-white/10 bg-white/[0.02] p-4"
                    >
                      <div className="text-sm font-semibold text-white mb-1">
                        {t.title}
                      </div>
                      <p className="text-[13px] text-slate-400 leading-relaxed">
                        {t.detail}
                      </p>
                    </div>
                  ))}
                </div>
              </Section>
            )}

            {/* 5. BULL / BEAR */}
            {editorial && (
              <Section eyebrow="The debate" title="Bull Case / Bear Case">
                <div className="grid sm:grid-cols-2 gap-4">
                  <CaseColumn
                    title="Bull Case"
                    tone="emerald"
                    points={editorial.bullCase}
                  />
                  <CaseColumn
                    title="Bear Case"
                    tone="rose"
                    points={editorial.bearCase}
                  />
                </div>
              </Section>
            )}

            {/* 6. SUPPLY CHAIN */}
            {editorial && (
              <Section eyebrow="Who they depend on" title="Supply Chain Exposure">
                <div className="grid sm:grid-cols-2 gap-5">
                  <ChipGroup label="Key suppliers" items={editorial.supplyChain.suppliers} tone="neutral" />
                  <ChipGroup label="Customers" items={editorial.supplyChain.customers} tone="cyan" />
                  <ChipGroup label="Hyperscaler exposure" items={editorial.supplyChain.hyperscalers} tone="cyan" />
                  <ChipGroup label="Foundry" items={editorial.supplyChain.foundry} tone="amber" />
                  <ChipGroup label="Packaging" items={editorial.supplyChain.packaging} tone="amber" />
                  <ChipGroup label="Memory" items={editorial.supplyChain.memory} tone="emerald" />
                </div>
              </Section>
            )}
          </div>

          {/* SIDEBAR */}
          <div className="space-y-6 lg:sticky lg:top-6">
            {/* 7. EARNINGS SNAPSHOT */}
            <Section eyebrow="Live + KPIs" title="Earnings Snapshot">
              {earnings ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <Stat
                      label="Revenue Growth (YoY)"
                      value={fmtFraction(earnings.revenueGrowthYoY, true)}
                      tone={changeTone(earnings.revenueGrowthYoY)}
                    />
                    <Stat
                      label="Gross Margin"
                      value={fmtFraction(earnings.grossMargin)}
                    />
                    <Stat
                      label="EPS (TTM)"
                      value={earnings.epsTrailing != null ? `$${earnings.epsTrailing.toFixed(2)}` : "—"}
                    />
                    <Stat
                      label="Next-Q EPS Est."
                      value={
                        earnings.nextQuarterEpsEstimate != null
                          ? `$${earnings.nextQuarterEpsEstimate.toFixed(2)}`
                          : "—"
                      }
                    />
                  </div>
                  {editorial?.guidanceCommentary && (
                    <p className="text-[13px] text-slate-400 leading-relaxed border-t border-white/10 pt-3">
                      <span className="text-amber-400/80 font-medium">
                        What to watch:{" "}
                      </span>
                      {editorial.guidanceCommentary}
                    </p>
                  )}
                </div>
              ) : (
                <Unavailable what="Earnings data" />
              )}
            </Section>

            {/* 8. ANALYST CONSENSUS */}
            <Section eyebrow="Wall Street" title="Analyst Consensus">
              {consensus ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-2xl font-semibold text-white">
                        {consensus.rating ?? "—"}
                      </div>
                      {consensus.numberOfAnalysts != null && (
                        <div className="text-[11px] text-slate-500">
                          {consensus.numberOfAnalysts} analysts
                        </div>
                      )}
                    </div>
                    {consensus.targetMean != null && (
                      <div className="text-right">
                        <div className="text-[11px] uppercase tracking-wider text-slate-500">
                          Avg. Price Target
                        </div>
                        <div className="text-lg font-semibold text-white tabular-nums">
                          {fmtPrice(consensus.targetMean, currency)}
                        </div>
                        {consensus.upsidePercent != null && (
                          <div
                            className={`text-xs font-medium ${changeTone(consensus.upsidePercent)}`}
                          >
                            {fmtPercent(consensus.upsidePercent)} vs. current
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {consensus.distribution && (
                    <RatingBar dist={consensus.distribution} />
                  )}

                  {consensus.targetLow != null && consensus.targetHigh != null && (
                    <div className="flex justify-between text-[11px] text-slate-500">
                      <span>Low {fmtPrice(consensus.targetLow, currency)}</span>
                      <span>High {fmtPrice(consensus.targetHigh, currency)}</span>
                    </div>
                  )}

                  {consensus.recentActions && consensus.recentActions.length > 0 && (
                    <div className="border-t border-white/10 pt-3">
                      <div className="text-[11px] uppercase tracking-wider text-slate-500 mb-2">
                        Recent Analyst Actions
                      </div>
                      <ul className="space-y-1.5">
                        {consensus.recentActions.slice(0, 4).map((a, i) => (
                          <li
                            key={`${a.firm}-${i}`}
                            className="flex items-center justify-between gap-2 text-[12px]"
                          >
                            <span className="text-slate-300 truncate">{a.firm}</span>
                            <span className="text-slate-500 shrink-0">
                              {a.toGrade ?? a.action ?? ""}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {(editorial?.consensusBullThemes || editorial?.consensusBearThemes) && (
                    <div className="border-t border-white/10 pt-3 space-y-2">
                      {editorial?.consensusBullThemes && (
                        <ThemeLine label="Bull themes" tone="emerald" items={editorial.consensusBullThemes} />
                      )}
                      {editorial?.consensusBearThemes && (
                        <ThemeLine label="Bear themes" tone="rose" items={editorial.consensusBearThemes} />
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <Unavailable what="Analyst data" />
              )}
            </Section>

            {/* 9. RELATED COMPANIES */}
            <Section title="Related Companies">
              <ul className="space-y-2">
                {relatedFor(meta, editorial).map((r) => (
                  <li key={r.slug}>
                    <Link
                      href={`/companies/${r.slug}`}
                      className="group flex items-center justify-between gap-3 rounded-lg border border-white/10 bg-white/[0.02] px-3 py-2 hover:border-amber-400/30 transition-colors"
                    >
                      <div className="min-w-0">
                        <div className="text-sm font-medium text-slate-200 group-hover:text-amber-300 transition-colors">
                          {r.name}
                        </div>
                        <div className="text-[11px] text-slate-500 truncate">
                          {r.reason}
                        </div>
                      </div>
                      <span className="font-mono text-[11px] text-slate-500 shrink-0">
                        {r.ticker}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </Section>

            {editorial && (
              <p className="text-[11px] text-slate-600 px-1">
                Editorial analysis updated {editorial.updated}. Market data via
                Yahoo Finance, cached hourly.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function WhyBlock({
  label,
  text,
  tone,
}: {
  label: string;
  text: string;
  tone: string;
}) {
  return (
    <div>
      <div className={`text-[11px] uppercase tracking-wider mb-1 ${tone}`}>
        {label}
      </div>
      <p className="text-sm text-slate-300 leading-relaxed">{text}</p>
    </div>
  );
}

function CaseColumn({
  title,
  points,
  tone,
}: {
  title: string;
  points: string[];
  tone: "emerald" | "rose";
}) {
  const ring =
    tone === "emerald"
      ? "border-emerald-400/20 bg-emerald-400/[0.03]"
      : "border-rose-400/20 bg-rose-400/[0.03]";
  const dot = tone === "emerald" ? "text-emerald-400" : "text-rose-400";
  return (
    <div className={`rounded-xl border p-4 ${ring}`}>
      <div className={`text-sm font-semibold mb-2 ${dot}`}>{title}</div>
      <ul className="space-y-2">
        {points.map((p, i) => (
          <li key={i} className="flex gap-2 text-[13px] text-slate-300 leading-relaxed">
            <span className={`shrink-0 ${dot}`}>{tone === "emerald" ? "▲" : "▼"}</span>
            <span>{p}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function RatingBar({
  dist,
}: {
  dist: { strongBuy: number; buy: number; hold: number; sell: number; strongSell: number };
}) {
  const total =
    dist.strongBuy + dist.buy + dist.hold + dist.sell + dist.strongSell || 1;
  const segs = [
    { v: dist.strongBuy + dist.buy, c: "bg-emerald-500", label: "Buy" },
    { v: dist.hold, c: "bg-slate-500", label: "Hold" },
    { v: dist.sell + dist.strongSell, c: "bg-rose-500", label: "Sell" },
  ];
  return (
    <div>
      <div className="flex h-2 w-full overflow-hidden rounded-full bg-white/5">
        {segs.map((s) => (
          <div
            key={s.label}
            className={s.c}
            style={{ width: `${(s.v / total) * 100}%` }}
          />
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

function ThemeLine({
  label,
  items,
  tone,
}: {
  label: string;
  items: string[];
  tone: "emerald" | "rose";
}) {
  const color = tone === "emerald" ? "text-emerald-400/80" : "text-rose-400/80";
  return (
    <div>
      <div className={`text-[11px] uppercase tracking-wider mb-1 ${color}`}>
        {label}
      </div>
      <p className="text-[12px] text-slate-400 leading-relaxed">
        {items.join(" · ")}
      </p>
    </div>
  );
}

// Resolve related companies: use editorial picks if present, else nearest peers.
function relatedFor(meta: CompanyMeta, editorial?: CompanyEditorial) {
  const picks =
    editorial?.related.map((r) => ({
      slug: r.slug,
      reason: r.reason,
    })) ??
    COMPANY_UNIVERSE.filter((c) => c.slug !== meta.slug)
      .slice(0, 6)
      .map((c) => ({ slug: c.slug, reason: c.sector }));

  return picks
    .map((p) => {
      const m = getCompanyMeta(p.slug);
      if (!m) return null;
      return { slug: m.slug, name: m.name, ticker: m.ticker, reason: p.reason };
    })
    .filter((x): x is { slug: string; name: string; ticker: string; reason: string } => x !== null);
}
