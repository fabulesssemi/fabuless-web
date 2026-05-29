import type { Metadata } from "next";
import Link from "next/link";
import { COMPANY_UNIVERSE, getEditorial } from "@/lib/companies";
import { getQuoteCached } from "@/lib/providers";
import {
  Pill,
  changeTone,
  displayTicker,
  fmtMarketCap,
  fmtPercent,
  fmtPrice,
} from "@/app/components/company/primitives";

export const revalidate = 300; // 5 min — keeps prices fresh

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
    <div className="min-h-screen">
      <div className="max-w-6xl mx-auto px-6 py-12">
        <header className="mb-10">
          <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#B45309]">
            Company Intelligence
          </div>
          <h1 className="font-sans text-4xl sm:text-5xl text-gray-900 tracking-tight mt-2">
            The AI Silicon Stack
          </h1>
          <p className="mt-3 max-w-2xl text-gray-500 leading-relaxed">
            The easiest way to understand the semiconductor and AI infrastructure
            companies we cover — what changed, why it matters, and where each one
            sits in the chip ecosystem. Live market data, refreshed hourly.
          </p>
        </header>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {cards.map(({ meta, quote, hasDeepDive }) => (
            <Link
              key={meta.slug}
              href={`/companies/${meta.slug}`}
              className="group rounded-2xl border border-gray-100 bg-white p-5 shadow-sm hover:shadow-md hover:border-amber-200 transition-all duration-200"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="font-mono text-xs text-[#B45309]">
                    {displayTicker(meta.ticker)}
                  </div>
                  <div className="font-sans text-xl text-gray-900 tracking-tight group-hover:text-[#B45309] transition-colors">
                    {meta.name}
                  </div>
                </div>
                {quote?.price != null && (
                  <div className="text-right shrink-0">
                    <div className="text-sm font-semibold text-gray-900 tabular-nums">
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

              <p className="mt-3 text-[13px] text-gray-500 leading-snug">
                {meta.sector}
              </p>

              <div className="mt-4 flex items-center justify-between">
                <span className="text-[11px] text-gray-400">
                  {quote?.marketCap != null
                    ? `Mkt cap ${fmtMarketCap(quote.marketCap, quote.currency ?? "USD")}`
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
