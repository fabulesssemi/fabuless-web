import Link from "next/link";
import type { CEOProfile, CompanyEditorial, CompanyMeta } from "@/lib/companies";
import type { PricePoint } from "@/lib/providers/history";
import { PriceChart } from "./PriceChart";
import { GrossMarginChart } from "./GrossMarginChart";
import { COMPANY_UNIVERSE, getCompanyMeta } from "@/lib/companies";
import type { CompanyMarketData } from "@/lib/providers/types";
import type { AnalystView } from "@/lib/analyst/types";
import { AnalystConsensusPanel } from "@/app/components/analyst/AnalystConsensusPanel";
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

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">

      {/* Back link */}
      <Link
        href="/companies"
        className="text-[11px] uppercase tracking-widest text-gray-400 hover:text-[#B45309] transition-colors"
      >
        ← All Companies
      </Link>

      {/* ── HERO HEADER ── */}
      <header className="mt-5 mb-8 pb-8 border-b border-gray-200">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <span className="font-mono text-[#B45309] text-base font-semibold">
                {displayTicker(meta.ticker)}
              </span>
              {meta.exchangeLabel && (
                <span className="text-xs text-gray-400">{meta.exchangeLabel}</span>
              )}
              <Pill tone="cyan">{meta.sector}</Pill>
            </div>
            <h1 className="font-serif text-4xl sm:text-5xl text-gray-900 tracking-tight">
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
                <div className="mt-1 inline-flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-gray-400">
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
        <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-6">
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
        <div className="mb-10">
          <PriceChart
            data={priceHistory}
            symbol={meta.yahooSymbol}
            currency={quote?.currency ?? (meta.ticker.endsWith(".KS") ? "KRW" : "USD")}
          />
        </div>
      )}

      {/* ── MAIN CONTENT ── */}
      <div className="space-y-10">

          {/* 1. QUICK TAKE */}
          {editorial ? (
            <Section eyebrow="The 30-Second Read" title="Quick Take">
              <p className="text-[15px] leading-relaxed text-gray-700 italic mb-5 max-w-2xl">
                {editorial.quickTake}
              </p>
              <div className="space-y-4 max-w-2xl">
                <div>
                  <div className="text-[10px] uppercase tracking-wider text-sky-700 mb-1">
                    Role in the AI ecosystem
                  </div>
                  <p className="text-[13px] text-gray-600 leading-relaxed">
                    {editorial.ecosystemRole}
                  </p>
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-wider text-[#B45309] mb-1">
                    What investors care about now
                  </div>
                  <p className="text-[13px] text-gray-600 leading-relaxed">
                    {editorial.investorFocus}
                  </p>
                </div>
              </div>
            </Section>
          ) : (
            <Section title="Quick Take" eyebrow="Deep-dive in progress">
              <p className="text-sm text-gray-500 leading-relaxed max-w-2xl">
                {profile?.description ??
                  `Our full editorial deep-dive for ${meta.name} is in progress. Live market data, earnings, analyst consensus, and news are fully active.`}
              </p>
            </Section>
          )}

          {/* 2. LATEST DEVELOPMENTS */}
          <Section eyebrow="Live" title="Latest Developments">
            {news.length > 0 ? (
              <ul className="divide-y divide-gray-100">
                {news.map((n) => (
                  <li key={n.url} className="py-3 first:pt-0 last:pb-0">
                    <a
                      href={n.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group"
                    >
                      <span className="text-[14px] text-gray-800 group-hover:text-[#B45309] transition-colors leading-snug block">
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

          {/* 3. WHY IT MATTERS */}
          {editorial && (
            <Section eyebrow="Analysis" title="Why It Matters">
              <div className="space-y-5 max-w-2xl">
                <WhyBlock label="Business implications"    tone="text-sky-700"    text={editorial.whyItMatters.business} />
                <WhyBlock label="Investment implications"  tone="text-[#B45309]"  text={editorial.whyItMatters.investment} />
                <WhyBlock label="Ecosystem implications"   tone="text-emerald-700" text={editorial.whyItMatters.ecosystem} />
              </div>
            </Section>
          )}

          {/* 4. KEY THEMES */}
          {editorial && editorial.keyThemes.length > 0 && (
            <Section eyebrow="What the industry is watching" title="Key Themes">
              <div className="grid sm:grid-cols-2 gap-x-8 gap-y-5">
                {editorial.keyThemes.map((t) => (
                  <div key={t.title}>
                    <div className="text-[13px] font-semibold text-gray-900 mb-0.5">{t.title}</div>
                    <p className="text-[13px] text-gray-500 leading-relaxed">{t.detail}</p>
                  </div>
                ))}
              </div>
            </Section>
          )}

          {/* 5. BULL / BEAR */}
          {editorial && (
            <Section eyebrow="The debate" title="Bull Case / Bear Case">
              <div className="grid sm:grid-cols-2 gap-8">
                <CaseColumn title="Bull Case" tone="emerald" points={editorial.bullCase} />
                <CaseColumn title="Bear Case" tone="rose"    points={editorial.bearCase} />
              </div>
            </Section>
          )}

          {/* 6. SUPPLY CHAIN */}
          {editorial && (
            <Section eyebrow="Who they depend on" title="Supply Chain Exposure">
              <div className="grid sm:grid-cols-2 gap-x-8 gap-y-4">
                <ChipGroup label="Key suppliers"        items={editorial.supplyChain.suppliers} />
                <ChipGroup label="Customers"            items={editorial.supplyChain.customers} />
                <ChipGroup label="Hyperscaler exposure" items={editorial.supplyChain.hyperscalers} />
                <ChipGroup label="Foundry"              items={editorial.supplyChain.foundry} />
                <ChipGroup label="Packaging"            items={editorial.supplyChain.packaging} />
                <ChipGroup label="Memory"               items={editorial.supplyChain.memory} />
              </div>
            </Section>
          )}

          {/* 7. EARNINGS SNAPSHOT */}
          <Section eyebrow="Live + KPIs" title="Earnings Snapshot">
            <GrossMarginChart
              quarters={editorial?.quarterlyGM}
              currentGM={earnings?.grossMargin ?? undefined}
            />
            {earnings ? (
              <div className="mt-5 space-y-5">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
                  <Stat label="Revenue Growth (YoY)" value={fmtFraction(earnings.revenueGrowthYoY, true)} tone={changeTone(earnings.revenueGrowthYoY)} />
                  <Stat label="Gross Margin"         value={fmtFraction(earnings.grossMargin)} />
                  <Stat label="EPS (TTM)"             value={earnings.epsTrailing != null ? `$${earnings.epsTrailing.toFixed(2)}` : "—"} />
                  <Stat label="Next-Q EPS Est."       value={earnings.nextQuarterEpsEstimate != null ? `$${earnings.nextQuarterEpsEstimate.toFixed(2)}` : "—"} />
                </div>
                {editorial?.guidanceCommentary && (
                  <p className="text-[13px] text-gray-500 leading-relaxed border-t border-gray-100 pt-4 max-w-2xl">
                    <span className="text-[#B45309] font-medium">What to watch: </span>
                    {editorial.guidanceCommentary}
                  </p>
                )}
              </div>
            ) : (
              <Unavailable what="Earnings data" />
            )}
          </Section>

          {/* 8. ANALYST CONSENSUS */}
          {analyst && <AnalystConsensusPanel view={analyst} />}

          {/* Related companies — horizontal strip */}
          <div className="pt-6 border-t border-gray-100">
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

function WhyBlock({ label, text, tone }: { label: string; text: string; tone: string }) {
  return (
    <div>
      <div className={`text-[10px] uppercase tracking-wider mb-1 ${tone}`}>{label}</div>
      <p className="text-[13px] text-gray-600 leading-relaxed">{text}</p>
    </div>
  );
}

function CaseColumn({ title, points, tone }: { title: string; points: string[]; tone: "emerald" | "rose" }) {
  const accent = tone === "emerald" ? "border-l-2 border-emerald-400" : "border-l-2 border-rose-400";
  const titleColor = tone === "emerald" ? "text-emerald-700" : "text-rose-600";
  return (
    <div className={`pl-4 ${accent}`}>
      <div className={`text-[10px] font-bold uppercase tracking-wider mb-3 ${titleColor}`}>{title}</div>
      <ul className="space-y-2.5">
        {points.map((p, i) => (
          <li key={i} className="text-[13px] text-gray-600 leading-relaxed">{p}</li>
        ))}
      </ul>
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
