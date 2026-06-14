import type { Metadata } from "next";
import Link from "next/link";
import { COMPANY_UNIVERSE, getEditorial } from "@/lib/companies";
import { getQuoteCached } from "@/lib/providers";
import {
  changeTone,
  displayTicker,
  fmtMarketCap,
  fmtPercent,
  fmtPrice,
} from "@/app/components/company/primitives";

export const revalidate = 300;

// Parqet stock logo API — allows hotlinking, returns clean PNGs by ticker
const logoUrl = (ticker: string) =>
  `https://assets.parqet.com/logos/symbol/${ticker}?format=png`;

// Brand accent colors — used for the card tint and logo badge bg
const BRAND_COLORS: Record<string, string> = {
  nvda:    "#76b900",
  amd:     "#ED1C24",
  avgo:    "#CC0000",
  mrvl:    "#005FAD",
  tsm:     "#0082C8",
  asml:    "#0071B5",
  arm:     "#0091BD",
  mu:      "#E31837",
  intc:    "#0068B5",
  qcom:    "#3253DC",
  skhynix: "#0066B3",
  samsung: "#1428A0",
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
          {cards.map(({ meta, quote, hasDeepDive }) => {
            const accent = BRAND_COLORS[meta.slug] ?? "#B45309";
            const isUp = (quote?.changePercent ?? 0) >= 0;

            return (
              <Link
                key={meta.slug}
                href={`/companies/${meta.slug}`}
                className="group relative overflow-hidden rounded-2xl border border-gray-100 bg-white p-5 shadow-sm hover:shadow-md transition-all duration-200"
                style={{
                  borderTopColor: accent,
                  borderTopWidth: "2px",
                }}
              >
                {/* Very subtle brand tint */}
                <div
                  className="pointer-events-none absolute inset-0"
                  style={{ background: `${accent}07` }}
                />

                {/* Top row: logo badge + name block + price */}
                <div className="relative flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 min-w-0">
                    {/* Logo badge */}
                    <div
                      className="shrink-0 w-10 h-10 rounded-xl flex items-center justify-center"
                      style={{ background: `${accent}18` }}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={logoUrl(meta.ticker)}
                        alt={meta.name}
                        width={26}
                        height={26}
                        className="object-contain"
                      />
                    </div>

                    {/* Ticker + name */}
                    <div className="min-w-0 pt-0.5">
                      <div className="font-mono text-[10px] font-semibold tracking-widest" style={{ color: accent }}>
                        {displayTicker(meta.ticker)}
                      </div>
                      <div className="font-sans text-[1.05rem] font-bold text-gray-900 leading-tight tracking-tight group-hover:text-[#B45309] transition-colors">
                        {meta.name}
                      </div>
                    </div>
                  </div>

                  {/* Price block */}
                  {quote?.price != null && (
                    <div className="text-right shrink-0 pt-0.5">
                      <div className="text-sm font-bold text-gray-900 tabular-nums leading-tight">
                        {fmtPrice(quote.price, quote.currency ?? "USD")}
                      </div>
                      <div className={`text-xs font-semibold tabular-nums ${changeTone(quote.changePercent)}`}>
                        {fmtPercent(quote.changePercent)}
                      </div>
                    </div>
                  )}
                </div>

                {/* Sector */}
                <p className="relative mt-3 text-[12px] text-gray-500 leading-snug tracking-wide">
                  {meta.sector}
                </p>

                {/* Bottom row: mkt cap + badge */}
                <div className="relative mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
                  <span className="text-[11px] font-medium text-gray-400 tabular-nums">
                    {quote?.marketCap != null
                      ? `Mkt cap ${fmtMarketCap(quote.marketCap, quote.currency ?? "USD")}`
                      : ""}
                  </span>
                  {hasDeepDive ? (
                    <span
                      className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full"
                      style={{ color: accent, background: `${accent}18` }}
                    >
                      Deep-dive
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full text-gray-400 bg-gray-100">
                      Live data
                    </span>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
