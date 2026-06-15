import type { Metadata } from "next";
import { getSummaries } from "@/lib/earnings/summaries";
import { getPreview } from "@/lib/earnings/previews";
import { decodeHoldings } from "@/app/portfolio/storage";
import { PortfolioTabs } from "@/app/portfolio/PortfolioTabs";
import { PortfolioGate } from "@/app/portfolio/PortfolioGate";
import { COMPANY_UNIVERSE } from "@/lib/companies";
import { getCompanyData } from "@/lib/providers";
import { buildColorMap } from "@/app/portfolio/colors";
import { EarningsFilter } from "./EarningsFilter";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Earnings — My Portfolio",
};

const METABYTICKER = new Map(COMPANY_UNIVERSE.map((c) => [c.ticker, c]));

function parseEarningsDate(s?: string | null): Date | null {
  if (!s) return null;
  const cleaned = s.replace(/^[A-Za-z]{3,}\s+/, "");
  const now = new Date();
  const d = new Date(`${cleaned} ${now.getFullYear()}`);
  if (isNaN(d.getTime())) return null;
  if (d.getTime() < now.getTime() - 60 * 86_400_000) d.setFullYear(now.getFullYear() + 1);
  return d;
}

function daysUntil(d: Date): number {
  return Math.ceil((d.getTime() - Date.now()) / 86_400_000);
}

export default async function PortfolioEarningsPage({
  searchParams,
}: {
  searchParams: Promise<{ h?: string }>;
}) {
  const { h } = await searchParams;
  const holdings = h ? decodeHoldings(h) : [];

  if (holdings.length === 0) return <PortfolioGate />;

  const tickers = holdings.map((hh) => hh.ticker);
  const colorMap = buildColorMap(tickers);
  const hParam = h ? `?h=${h}` : "";

  const upcomingData = await Promise.all(
    tickers.map(async (ticker) => {
      const meta = METABYTICKER.get(ticker);
      const symbol = meta?.yahooSymbol ?? ticker;
      const data = await getCompanyData(symbol, meta?.newsKeywords);
      const label = data.earnings?.nextEarningsDate ?? null;
      const date = parseEarningsDate(label);
      return {
        ticker,
        name: meta?.name ?? ticker,
        label: label ?? "",
        date,
        daysAway: date ? daysUntil(date) : null,
        hasPreview: !!getPreview(ticker),
        hParam,
      };
    })
  );

  const upcoming = upcomingData
    .filter((u) => u.date && u.daysAway !== null && u.daysAway >= 0)
    .sort((a, b) => a.date!.getTime() - b.date!.getTime())
    .map((u) => ({ ...u, daysAway: u.daysAway! }));

  const pastRows = tickers
    .map((ticker) => ({
      ticker,
      name: METABYTICKER.get(ticker)?.name ?? ticker,
      summaries: getSummaries(ticker, 4),
    }))
    .filter((r) => r.summaries.length > 0);

  return (
    <div className="max-w-6xl mx-auto pl-4 pr-6 py-10">
      <PortfolioTabs earnings={upcoming.map((u) => ({
        ticker: u.ticker,
        companyName: u.name,
        label: u.label,
        daysUntil: u.daysAway,
        earningsSlug: u.hasPreview ? u.ticker.toLowerCase() : null,
      }))} />
      <EarningsFilter
        tickers={tickers}
        colorMap={colorMap}
        upcoming={upcoming}
        pastRows={pastRows}
      />
    </div>
  );
}
