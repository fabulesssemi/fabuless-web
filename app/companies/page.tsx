import type { Metadata } from "next";
import { COMPANY_UNIVERSE, getEditorial } from "@/lib/companies";
import { getQuoteCached } from "@/lib/providers";
import {
  displayTicker,
  fmtMarketCap,
  fmtPercent,
  fmtPrice,
} from "@/app/components/company/primitives";
import { CompaniesFilter } from "./CompaniesFilter";

export const revalidate = 300;

const logoUrl = (ticker: string) =>
  `https://assets.parqet.com/logos/symbol/${ticker}?format=png`;

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
    COMPANY_UNIVERSE.map(async (c) => {
      const quote = await getQuoteCached(c.yahooSymbol);
      const accent = BRAND_COLORS[c.slug] ?? "#B45309";
      return {
        slug: c.slug,
        ticker: c.ticker,
        name: c.name,
        sector: c.sector,
        accent,
        displayTicker: displayTicker(c.ticker),
        price: quote?.price != null ? fmtPrice(quote.price, quote.currency ?? "USD") : null,
        changePercent: quote?.changePercent != null ? fmtPercent(quote.changePercent) : null,
        marketCap: quote?.marketCap != null ? `Mkt cap ${fmtMarketCap(quote.marketCap, quote.currency ?? "USD")}` : null,
        hasDeepDive: Boolean(getEditorial(c.slug)),
        logoUrl: logoUrl(c.ticker),
      };
    }),
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

        <CompaniesFilter cards={cards} />
      </div>
    </div>
  );
}
