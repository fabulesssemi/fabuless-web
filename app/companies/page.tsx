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

const LOGO_DOMAINS: Record<string, string> = {
  nvda:     "nvidia.com",
  amd:      "amd.com",
  avgo:     "broadcom.com",
  mrvl:     "marvell.com",
  tsm:      "tsmc.com",
  asml:     "asml.com",
  arm:      "arm.com",
  mu:       "micron.com",
  intc:     "intel.com",
  qcom:     "qualcomm.com",
  skhynix:  "skhynix.com",
  samsung:  "samsung.com",
};

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
          <h1 className="font-sans text-2xl font-bold text-[#111827] tracking-tight mt-1">
            The AI Silicon Stack
          </h1>
          <p className="mt-1 max-w-2xl font-serif text-[15px] text-[#4a4a4a] leading-relaxed">
            Coverage of the semiconductor and AI infrastructure companies that move markets. Prices and ratings refreshed hourly.
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
                <div className="min-w-0 flex items-start gap-3">
                  {LOGO_DOMAINS[meta.slug] && (
                    <img
                      src={`https://logo.clearbit.com/${LOGO_DOMAINS[meta.slug]}`}
                      alt={meta.name}
                      width={36}
                      height={36}
                      className="rounded-lg shrink-0 mt-0.5 border border-gray-100"
                      onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
                    />
                  )}
                  <div className="min-w-0">
                    <div className="font-mono text-xs text-[#B45309]">
                      {displayTicker(meta.ticker)}
                    </div>
                    <div className="font-sans text-xl text-gray-900 tracking-tight group-hover:text-[#B45309] transition-colors">
                      {meta.name}
                    </div>
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
