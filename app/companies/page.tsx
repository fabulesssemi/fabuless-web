import type { Metadata } from "next";
import Link from "next/link";
import { COMPANY_UNIVERSE, getEditorial } from "@/lib/companies";
import { getQuoteCached } from "@/lib/providers";
import {
  Pill,
  changeTone,
  fmtMarketCap,
  fmtPercent,
  fmtPrice,
} from "@/app/components/company/primitives";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Companies — Fabuless",
  description:
    "Live intelligence on the semiconductor and AI-infrastructure companies that matter — price, earnings, analyst consensus, supply-chain maps, and deep-dives.",
};

export default async function CompaniesIndex() {
  const cards = await Promise.all(
    COMPANY_UNIVERSE.map(async (c) => ({
      meta: c,
      quote: await getQuoteCached(c.yahooSymbol),
      hasDeepDive: Boolean(getEditorial(c.slug)),
    })),
  );

  return (
    <div className="min-h-screen bg-[#0B1120] text-slate-200">
      <div className="max-w-6xl mx-auto px-6 py-12">
        <header className="mb-10">
          <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-amber-400/80">
            Company Intelligence
          </div>
          <h1 className="font-serif text-4xl sm:text-5xl text-white tracking-tight mt-2">
            The AI Silicon Stack
          </h1>
          <p className="mt-3 max-w-2xl text-slate-400 leading-relaxed">
            The easiest way to understand a semiconductor or AI-infrastructure
            company — what changed, why it matters, and where it sits in the AI
            ecosystem. Live market data, refreshed hourly.
          </p>
        </header>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {cards.map(({ meta, quote, hasDeepDive }) => (
            <Link
              key={meta.slug}
              href={`/companies/${meta.slug}`}
              className="group rounded-2xl border border-white/10 bg-white/[0.02] p-5 hover:border-amber-400/30 hover:bg-white/[0.04] transition-colors"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="font-mono text-xs text-amber-400">
                    {meta.ticker}
                  </div>
                  <div className="font-serif text-xl text-white tracking-tight group-hover:text-amber-300 transition-colors">
                    {meta.name}
                  </div>
                </div>
                {quote?.price != null && (
                  <div className="text-right shrink-0">
                    <div className="text-sm font-semibold text-white tabular-nums">
                      {fmtPrice(quote.price, quote.currency ?? "USD")}
                    </div>
                    <div
                      className={`text-xs tabular-nums ${changeTone(quote.changePercent)}`}
                    >
                      {fmtPercent(quote.changePercent)}
                    </div>
                  </div>
                )}
              </div>

              <p className="mt-3 text-[13px] text-slate-400 leading-snug">
                {meta.sector}
              </p>

              <div className="mt-4 flex items-center justify-between">
                <span className="text-[11px] text-slate-500">
                  {quote?.marketCap != null
                    ? `Mkt cap ${fmtMarketCap(quote.marketCap)}`
                    : ""}
                </span>
                {hasDeepDive ? (
                  <Pill tone="emerald">Deep-dive</Pill>
                ) : (
                  <Pill tone="neutral">Live data</Pill>
                )}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
