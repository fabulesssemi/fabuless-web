import type { Metadata } from "next";
import { fetchAnalystCoverage } from "@/lib/analyst/analysts";
import { decodeHoldings } from "@/app/portfolio/storage";
import { PortfolioTabs } from "@/app/portfolio/PortfolioTabs";
import { PortfolioGate } from "@/app/portfolio/PortfolioGate";
import { COMPANY_UNIVERSE } from "@/lib/companies";
import { buildColorMap } from "@/app/portfolio/colors";
import { AnalystsFilter } from "./AnalystsFilter";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Analysts — My Portfolio",
};

const METABYTICKER = new Map(COMPANY_UNIVERSE.map((c) => [c.ticker, c]));

function fmtDate(iso: string | null) {
  if (!iso) return null;
  return new Date(iso + "T12:00:00Z").toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric",
  });
}

export default async function PortfolioAnalystsPage({
  searchParams,
}: {
  searchParams: Promise<{ h?: string }>;
}) {
  const { h } = await searchParams;
  const holdings = h ? decodeHoldings(h) : [];

  if (holdings.length === 0) return <PortfolioGate />;

  const tickers = holdings.map((hh) => hh.ticker);
  const colorMap = buildColorMap(tickers);

  const allAnalysts = await fetchAnalystCoverage();

  // Flatten to one entry per (ticker, analyst) pair, only for held tickers
  const entries = tickers.flatMap((ticker) => {
    const meta = METABYTICKER.get(ticker);
    return allAnalysts
      .map((a) => {
        const cov = a.coverage.find((c) => c.ticker === ticker);
        if (!cov) return null;
        return {
          ticker,
          companyName: meta?.name ?? ticker,
          analystId: a.id,
          analystName: a.name,
          firm: a.firmDisplay,
          accent: a.accent,
          rating: cov.rating,
          priceTarget: cov.priceTarget,
          currentPrice: cov.currentPrice,
          upsidePct: cov.upsidePct,
          action: cov.action,
          date: fmtDate(cov.priceTargetDate),
        };
      })
      .filter((x): x is NonNullable<typeof x> => x !== null);
  });

  // Sort: by upside desc (highest conviction calls first)
  entries.sort((a, b) => (b.upsidePct ?? -999) - (a.upsidePct ?? -999));

  return (
    <div className="max-w-6xl mx-auto pl-4 pr-6 py-10">
      <PortfolioTabs earnings={[]} />
      <AnalystsFilter entries={entries} tickers={tickers} colorMap={colorMap} />
    </div>
  );
}
