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
    <div className="min-h-screen">
      <div className="max-w-6xl mx-auto px-6 py-10">
        {/* Back link */}
        <Link
          href="/companies"
          className="text-xs uppercase tracking-widest text-gray-400 hover:text-[#B45309] transition-colors"
        >
          ← All Companies
        </Link>

        {/* ---------------- HERO HEADER ---------------- */}
        <header className="mt-4 mb-8 pb-8 border-b border-gray-200">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <div className="flex items-center gap-3">
                <span className="font-mono text-[#B45309] text-lg font-semibold">
                  {displayTicker(meta.ticker)}
                </span>
                {meta.exchangeLabel && (
                  <span className="text-xs text-gray-400">
                    {meta.exchangeLabel}
                  </span>
                )}
              </div>
              <h1 className="font-serif text-4xl sm:text-5xl text-gray-900 tracking-tight mt-1">
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
                  <div className="text-3xl font-semibold text-gray-900 tabular-nums">
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
              tone="text-amber-700"
            />
          </div>
        </header>

        {/* ---------------- PRICE CHART ---------------- */}
        {priceHistory.length >= 10 && (
          <PriceChart
            data={priceHistory}
            symbol={meta.yahooSymbol}
            currency={quote?.currency ?? (meta.ticker.endsWith(".KS") ? "KRW" : "USD")}
          />
        )}

        {/* ---------------- CEO CARD ---------------- */}
        {meta.ceo && <CEOCard ceo={meta.ceo} />}

        {/* ---------------- 1. QUICK TAKE ---------------- */}
        {editorial ? (
          <Section eyebrow="The 30-Second Read" title="Quick Take" className="mb-6">
            <p className="text-[15px] leading-relaxed text-gray-700">
              {editorial.quickTake}
            </p>
            <div className="mt-5 grid sm:grid-cols-2 gap-4">
              <div className="rounded-xl bg-gray-50 border border-gray-200 p-4">
                <div className="text-[11px] uppercase tracking-wider text-cyan-700 mb-1">
                  Role in the AI ecosystem
                </div>
                <p className="text-sm text-gray-700 leading-relaxed">
                  {editorial.ecosystemRole}
                </p>
              </div>
              <div className="rounded-xl bg-gray-50 border border-gray-200 p-4">
                <div className="text-[11px] uppercase tracking-wider text-[#B45309] mb-1">
                  What investors care about now
                </div>
                <p className="text-sm text-gray-700 leading-relaxed">
                  {editorial.investorFocus}
                </p>
              </div>
            </div>
          </Section>
        ) : (
          <Section title="Quick Take" eyebrow="Deep-dive in progress" className="mb-6">
            <p className="text-sm text-gray-500 leading-relaxed">
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
                <ul className="divide-y divide-gray-100">
                  {news.map((n) => (
                    <li key={n.url} className="py-3 first:pt-0 last:pb-0">
                      <a
                        href={n.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group flex items-baseline justify-between gap-4"
                      >
                        <span className="text-[15px] text-gray-800 group-hover:text-[#B45309] transition-colors leading-snug">
                          {n.title}
                        </span>
                      </a>
                      <div className="mt-1 flex items-center gap-2 text-[11px] text-gray-400">
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
                    tone="text-cyan-700"
                    text={editorial.whyItMatters.business}
                  />
                  <WhyBlock
                    label="Investment implications"
                    tone="text-[#B45309]"
                    text={editorial.whyItMatters.investment}
                  />
                  <WhyBlock
                    label="Ecosystem implications"
                    tone="text-emerald-700"
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
                      className="rounded-xl border border-gray-200 bg-gray-50 p-4"
                    >
                      <div className="text-sm font-semibold text-gray-900 mb-1">
                        {t.title}
                      </div>
                      <p className="text-[13px] text-gray-500 leading-relaxed">
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

            {/* 8. ANALYST CONSENSUS (rich) */}
            {analyst && <AnalystConsensusPanel view={analyst} />}
          </div>

          {/* SIDEBAR */}
          <div className="space-y-6 lg:sticky lg:top-6">
            {/* 7. EARNINGS SNAPSHOT */}
            <Section eyebrow="Live + KPIs" title="Earnings Snapshot">
              <GrossMarginChart
                quarters={editorial?.quarterlyGM}
                currentGM={earnings?.grossMargin ?? undefined}
              />
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
                    <p className="text-[13px] text-gray-500 leading-relaxed border-t border-gray-200 pt-3">
                      <span className="text-[#B45309] font-medium">
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

            {/* 9. RELATED COMPANIES */}
            <Section title="Related Companies">
              <ul className="space-y-2">
                {relatedFor(meta, editorial).map((r) => (
                  <li key={r.slug}>
                    <Link
                      href={`/companies/${r.slug}`}
                      className="group flex items-center justify-between gap-3 rounded-lg border border-gray-200 bg-white px-3 py-2 hover:border-amber-300 transition-colors"
                    >
                      <div className="min-w-0">
                        <div className="text-sm font-medium text-gray-800 group-hover:text-[#B45309] transition-colors">
                          {r.name}
                        </div>
                        <div className="text-[11px] text-gray-400 truncate">
                          {r.reason}
                        </div>
                      </div>
                      <span className="font-mono text-[11px] text-gray-400 shrink-0">
                        {displayTicker(r.ticker)}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </Section>

            {editorial && (
              <p className="text-[11px] text-gray-400 px-1">
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
      <p className="text-sm text-gray-700 leading-relaxed">{text}</p>
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
      ? "border-emerald-200 bg-emerald-50"
      : "border-rose-200 bg-rose-50";
  const dot = tone === "emerald" ? "text-emerald-700" : "text-rose-700";
  return (
    <div className={`rounded-xl border p-4 ${ring}`}>
      <div className={`text-sm font-semibold mb-2 ${dot}`}>{title}</div>
      <ul className="space-y-2">
        {points.map((p, i) => (
          <li key={i} className="flex gap-2 text-[13px] text-gray-700 leading-relaxed">
            <span className={`shrink-0 ${dot}`}>{tone === "emerald" ? "▲" : "▼"}</span>
            <span>{p}</span>
          </li>
        ))}
      </ul>
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

function CEOCard({ ceo }: { ceo: CEOProfile }) {
  const initials = ceo.name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="mb-6 flex items-center gap-4 rounded-xl border border-gray-200 bg-white px-4 py-3">
      {ceo.photo ? (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img
          src={ceo.photo}
          alt={ceo.name}
          className="h-14 w-14 rounded-full object-cover object-top shrink-0 ring-1 ring-gray-200"
        />
      ) : (
        <div className="h-14 w-14 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center text-[#B45309] font-semibold text-base shrink-0">
          {initials}
        </div>
      )}
      <div>
        <div className="text-[10px] uppercase tracking-widest text-gray-400">Chief Executive Officer</div>
        <div className="text-sm font-semibold text-gray-900 mt-0.5">{ceo.name}</div>
        <div className="text-[11px] text-gray-400">CEO since {ceo.since}</div>
      </div>
    </div>
  );
}
