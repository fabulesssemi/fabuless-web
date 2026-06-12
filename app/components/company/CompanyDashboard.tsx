import Link from "next/link";
import type { CEOProfile, CompanyEditorial, CompanyMeta } from "@/lib/companies";
import type { PricePoint } from "@/lib/providers/history";
import { PriceChart } from "./PriceChart";
import { GrossMarginChart } from "./GrossMarginChart";
import { COMPANY_UNIVERSE, getCompanyMeta } from "@/lib/companies";
import type { CompanyMarketData } from "@/lib/providers/types";
import type { AnalystView } from "@/lib/analyst/types";
import { DistributionBar } from "@/app/components/analyst/AnalystConsensusPanel";
import { ShowMore } from "./ShowMore";
import { SegmentChart } from "./SegmentChart";
import { ExpertPulse } from "./ExpertPulse";
import {
  ChipGroup,
  Pill,
  Section,
  Stat,
  Unavailable,
  changeTone,
  fmtFraction,
  displayTicker,
  fmtMarketCap,
  fmtPercent,
  fmtPrice,
  timeAgo,
} from "./primitives";

export function CompanyDashboard({
  meta,
  editorial,
  data,
  analyst,
  priceHistory = [],
}: {
  meta: CompanyMeta;
  editorial?: CompanyEditorial;
  data: CompanyMarketData;
  analyst?: AnalystView;
  priceHistory?: PricePoint[];
}) {
  const { profile, quote, earnings, news } = data;
  const currency = quote?.currency ?? "USD";

  const ratingColor = "text-gray-900";

  return (
    <div className="max-w-5xl mx-auto px-6 pt-5 pb-10">

      {/* Back link — prominent, flush left */}
      <Link
        href="/companies"
        className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-gray-600 hover:text-[#B45309] transition-colors -ml-0.5 mb-1"
      >
        <span className="text-[#B45309] font-bold">←</span>
        <span className="uppercase tracking-wide">All Companies</span>
      </Link>

      {/* ── HERO HEADER ── */}
      <header className="mt-3 mb-5 pb-5 border-b border-gray-200">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5 mb-0.5">
              <span className="font-mono text-[#B45309] text-sm font-semibold">
                {displayTicker(meta.ticker)}
              </span>
              {meta.exchangeLabel && (
                <span className="text-xs text-gray-400">{meta.exchangeLabel}</span>
              )}
              <Pill tone="cyan">{meta.sector}</Pill>
            </div>
            <h1 className="font-sans text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight leading-tight">
              {meta.name}
            </h1>
            {meta.ceo && <InlineCEO ceo={meta.ceo} />}
          </div>

          {/* Live price */}
          <div className="text-right">
            {quote?.price != null ? (
              <>
                <div className="text-3xl font-semibold text-gray-900 tabular-nums">
                  {fmtPrice(quote.price, currency)}
                </div>
                <div className={`text-sm font-medium tabular-nums ${changeTone(quote.changePercent)}`}>
                  {quote.change != null ? `${quote.change > 0 ? "+" : ""}${quote.change.toFixed(2)} ` : ""}
                  ({fmtPercent(quote.changePercent)})
                </div>
                <div className="mt-0.5 inline-flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-gray-400">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Live · Yahoo Finance
                </div>
              </>
            ) : (
              <span className="text-sm text-gray-400">Price unavailable</span>
            )}
          </div>
        </div>

        {/* Key stats strip */}
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Stat label="Market Cap"    value={fmtMarketCap(quote?.marketCap)} />
          <Stat label="P/E (TTM)"     value={quote?.peTrailing != null ? quote.peTrailing.toFixed(1) : "—"} />
          <Stat
            label="52-Week Range"
            value={
              quote?.fiftyTwoWeekLow != null && quote?.fiftyTwoWeekHigh != null
                ? `${fmtPrice(quote.fiftyTwoWeekLow, currency)} – ${fmtPrice(quote.fiftyTwoWeekHigh, currency)}`
                : "—"
            }
          />
          <Stat label="Next Earnings" value={earnings?.nextEarningsDate ?? "—"} tone="text-amber-700" />
        </div>
      </header>

      {/* Price chart */}
      {priceHistory.length >= 10 && (
        <div className="mb-6">
          <PriceChart
            data={priceHistory}
            symbol={meta.yahooSymbol}
            currency={quote?.currency ?? (meta.ticker.endsWith(".KS") ? "KRW" : "USD")}
          />
        </div>
      )}

      {/* ── ROW 1: EDITORIAL + BULL CASE LEFT · ANALYST DATA RIGHT ── */}
      <div className="grid sm:grid-cols-2 items-start sm:divide-x divide-gray-200 border-t border-gray-200 mb-4">

        {/* LEFT — editorial teaser + bull/bear side-by-side */}
        <div className="py-5 sm:pr-8 pb-5 sm:pb-0 flex flex-col border-b sm:border-b-0 border-gray-200">
          <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#B45309] mb-3">
            Fabuless Analysis{editorial ? ` · ${editorial.updated}` : ""}
          </div>
          {editorial ? (
            <>
              <p className="text-[14px] leading-relaxed text-gray-700 italic mb-4">
                {editorial.quickTake}
              </p>
              {/* Key themes as compact chips */}
              {editorial.keyThemes.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {editorial.keyThemes.slice(0, 3).map((t) => (
                    <span key={t.title} className="text-[11px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                      {t.title}
                    </span>
                  ))}
                </div>
              )}
              {/* Bull + Bear side-by-side — Morningstar style */}
              {(editorial.bullCase.length > 0 || editorial.bearCase.length > 0) && (
                <div className="border-t border-gray-200 pt-4 mt-4">
                  <div className="text-[11px] font-bold uppercase tracking-[0.15em] text-gray-500 mb-3">
                    Bulls Say / Bears Say
                  </div>
                  <div className="grid grid-cols-2 divide-x divide-gray-200">
                    <div className="pr-4">
                      <CaseColumn title="Bulls" tone="emerald" points={editorial.bullCase} max={3} />
                    </div>
                    <div className="pl-4">
                      <CaseColumn title="Bears" tone="rose" points={editorial.bearCase} max={3} />
                    </div>
                  </div>
                </div>
              )}
            </>
          ) : (
            <p className="text-sm text-gray-500 leading-relaxed">
              {profile?.description ??
                `Our full editorial deep-dive for ${meta.name} is in progress.`}
            </p>
          )}
        </div>

        {/* RIGHT — analyst consensus + key financials */}
        <div className="py-5 sm:pl-8 flex flex-col">
          <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-gray-400 mb-3">
            Wall Street · Analyst View
          </div>

          {analyst?.consensusRating || analyst?.avgPriceTarget ? (
            <>
              <div className={`text-3xl font-semibold mb-0.5 ${ratingColor}`}>
                {analyst.consensusRating ?? "—"}
              </div>
              <p className="text-[13px] text-gray-500 mb-4">
                {analyst.numberOfAnalysts != null ? `${analyst.numberOfAnalysts} analysts` : ""}
                {analyst.impliedUpsidePct != null && (
                  <>
                    {" · "}
                    <span className={`font-medium ${changeTone(analyst.impliedUpsidePct)}`}>
                      {fmtPercent(analyst.impliedUpsidePct)} implied upside
                    </span>
                    {analyst.avgPriceTarget != null
                      ? ` · avg PT ${fmtPrice(analyst.avgPriceTarget, currency)}`
                      : ""}
                  </>
                )}
              </p>

              {analyst.distribution && (
                <div className="mb-5">
                  <DistributionBar d={analyst.distribution} />
                </div>
              )}

              {analyst.lowPriceTarget != null && analyst.highPriceTarget != null && (
                <div className="mb-4 text-[11px] text-gray-400">
                  PT range: {fmtPrice(analyst.lowPriceTarget, currency)} – {fmtPrice(analyst.highPriceTarget, currency)}
                </div>
              )}
            </>
          ) : null}

          {/* Earnings chart + stats */}
          <div className="pt-4 border-t border-gray-200">
            <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-gray-400 mb-3">
              Earnings Snapshot
            </div>
            <GrossMarginChart
              quarters={editorial?.quarterlyGM}
              currentGM={earnings?.grossMargin ?? undefined}
            />
            {earnings ? (
              <div className="mt-4 grid grid-cols-2 gap-x-6 gap-y-3">
                <Stat label="Revenue Growth (YoY)" value={fmtFraction(earnings.revenueGrowthYoY, true)} tone={changeTone(earnings.revenueGrowthYoY)} />
                <Stat label="Gross Margin"         value={fmtFraction(earnings.grossMargin)} />
                <Stat label="EPS (TTM)"            value={earnings.epsTrailing != null ? `$${earnings.epsTrailing.toFixed(2)}` : "—"} />
                <Stat label="Next-Q EPS Est."      value={earnings.nextQuarterEpsEstimate != null ? `$${earnings.nextQuarterEpsEstimate.toFixed(2)}` : "—"} />
              </div>
            ) : (
              <p className="text-sm text-gray-400 italic mt-2">Earnings data unavailable.</p>
            )}
            {editorial?.guidanceCommentary && (
              <p className="text-[12px] text-gray-500 leading-relaxed border-t border-gray-200 pt-3 mt-3">
                <span className="text-[#B45309] font-medium">What to watch: </span>
                {editorial.guidanceCommentary}
              </p>
            )}

            {/* Revenue by segment — editorial (AI-refreshed after earnings) takes priority over seed data */}
            {(() => {
              const segments = editorial?.revenueSegments ?? meta.revenueSegments;
              const label = editorial?.fiscalLabel ?? meta.fiscalLabel;
              return segments && segments.length > 0
                ? <SegmentChart segments={segments} fiscalLabel={label} />
                : null;
            })()}
          </div>

        </div>
      </div>

      {/* ── ROW 3: LATEST DEVELOPMENTS ── */}
      {(() => {
        // Merge pipeline-curated RSS news (editorial.pinnedNews) with Yahoo Finance live news.
        // Pinned items appear first — they're guaranteed relevant (keyword-filtered from Reuters,
        // CNBC, SemiWiki, etc.) and updated every time the editorial pipeline runs.
        // Yahoo Finance news fills any remaining slots, deduplicated by URL.
        const pinned = editorial?.pinnedNews ?? [];
        const pinnedUrls = new Set(pinned.map((n) => n.url));
        const merged = [
          ...pinned,
          ...news.filter((n) => !pinnedUrls.has(n.url)),
        ].slice(0, 8);

        return (
          <Section eyebrow="Live" title="Latest Developments" live className="border-t border-gray-200 pt-4 mb-4">
            {merged.length > 0 ? (
              <ul className="divide-y divide-gray-200">
                {merged.map((n) => (
                  <li key={n.url} className="py-3 first:pt-0 last:pb-0">
                    <a href={n.url} target="_blank" rel="noopener noreferrer" className="group">
                      <span className="text-[14px] text-gray-800 group-hover:text-[#B45309] group-hover:underline underline-offset-2 decoration-[#B45309]/50 transition-colors leading-snug block">
                        {n.title}
                      </span>
                    </a>
                    <div className="mt-0.5 flex items-center gap-2 text-[11px] text-gray-400">
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
        );
      })()}

      {/* ── ROW 4: KEY THEMES (left) · SUPPLY CHAIN (right) ── */}
      {editorial && (
        <div className="grid sm:grid-cols-2 sm:divide-x divide-gray-200 border-t border-gray-200 pt-4 mb-4">
          {editorial.keyThemes.length > 0 && (
            <div className="sm:pr-8 pb-6 sm:pb-0">
              <Section eyebrow="What the industry is watching" title="Key Themes">
                <ShowMore max={3}>
                  {editorial.keyThemes.map((t) => (
                    <div key={t.title}>
                      <div className="text-[13px] font-semibold text-gray-900 mb-0.5">{t.title}</div>
                      <p className="text-[13px] text-gray-500 leading-relaxed">{t.detail}</p>
                    </div>
                  ))}
                </ShowMore>
              </Section>
            </div>
          )}
          <div className="sm:pl-8">
            <Section eyebrow="Who they depend on" title="Supply Chain">
              <div className="space-y-4">
                <ChipGroup label="Key suppliers"        items={editorial.supplyChain.suppliers} />
                <ChipGroup label="Customers"            items={editorial.supplyChain.customers} />
                <ChipGroup label="Hyperscaler exposure" items={editorial.supplyChain.hyperscalers} />
                <ChipGroup label="Foundry"              items={editorial.supplyChain.foundry} />
                <ChipGroup label="Packaging"            items={editorial.supplyChain.packaging} />
                <ChipGroup label="Memory"               items={editorial.supplyChain.memory} />
              </div>
            </Section>
          </div>
        </div>
      )}

      {/* Expert pulse — live synthesis from Baker, Dylan, Circuit corpora */}
      <ExpertPulse slug={meta.slug} />

      {/* Related companies */}
      <div className="pt-4 border-t border-gray-200 mb-4">
        <div className="text-[10px] uppercase tracking-wider text-gray-400 mb-4">Related Companies</div>
        <div className="flex flex-wrap gap-x-8 gap-y-3">
          {relatedFor(meta, editorial).map((r) => (
            <Link
              key={r.slug}
              href={`/companies/${r.slug}`}
              className="group flex items-baseline gap-1.5"
            >
              <span className="font-mono text-[10px] text-gray-400">{displayTicker(r.ticker)}</span>
              <span className="text-[13px] font-medium text-gray-700 group-hover:text-[#B45309] transition-colors">{r.name}</span>
            </Link>
          ))}
        </div>
      </div>

      {editorial && (
        <p className="text-[11px] text-gray-400 leading-relaxed">
          Editorial updated {editorial.updated}. Market data via Yahoo Finance, cached hourly.
        </p>
      )}
    </div>
  );
}

// ── Sub-components ──────────────────────────────────────────────────────────

function InlineCEO({ ceo }: { ceo: CEOProfile }) {
  const initials = ceo.name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
  return (
    <div className="mt-3 flex items-center gap-2.5">
      {ceo.photo ? (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img
          src={ceo.photo}
          alt={ceo.name}
          className="h-7 w-7 rounded-full object-cover object-top shrink-0"
        />
      ) : (
        <div className="h-7 w-7 rounded-full bg-amber-50 flex items-center justify-center text-[#B45309] font-semibold text-[10px] shrink-0">
          {initials}
        </div>
      )}
      <span className="text-[13px] text-gray-500">
        {ceo.name} <span className="text-gray-400">· CEO since {ceo.since}</span>
      </span>
    </div>
  );
}

function CaseColumn({ title, points, tone, max = 99 }: { title: string; points: string[]; tone: "emerald" | "rose"; max?: number }) {
  return (
    <div>
      <div className="text-sm font-bold text-gray-900 mb-2">{title}</div>
      <ShowMore max={max}>
        {points.map((p, i) => (
          <li key={i} className="list-none py-2.5 border-t border-gray-200 first:border-t-0 first:pt-0">
            <p className="text-[13px] text-gray-700 leading-relaxed">
              <span className="text-gray-300 mr-0.5 select-none">&ldquo;&ldquo;</span>
              {p}
              <span className="text-gray-300 ml-0.5 select-none">&rdquo;&rdquo;</span>
            </p>
          </li>
        ))}
      </ShowMore>
    </div>
  );
}

function relatedFor(meta: CompanyMeta, editorial?: CompanyEditorial) {
  const picks =
    editorial?.related.map((r) => ({ slug: r.slug, reason: r.reason })) ??
    COMPANY_UNIVERSE.filter((c) => c.slug !== meta.slug).slice(0, 6).map((c) => ({ slug: c.slug, reason: c.sector }));

  return picks
    .map((p) => {
      const m = getCompanyMeta(p.slug);
      if (!m) return null;
      return { slug: m.slug, name: m.name, ticker: m.ticker, reason: p.reason };
    })
    .filter((x): x is { slug: string; name: string; ticker: string; reason: string } => x !== null);
}
