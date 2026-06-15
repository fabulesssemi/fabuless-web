import type { Metadata } from "next";
import { Suspense } from "react";
import { COMPANY_UNIVERSE } from "@/lib/companies";
import { getCompanyData } from "@/lib/providers";
import { predictions } from "@/lib/tracker/predictions";
import { EXPERTS } from "@/lib/tracker/experts";
import { fetchAnalystCoverage } from "@/lib/analyst/analysts";
import { tickersWithPreview } from "@/lib/earnings/previews";
import { getSummaries } from "@/lib/earnings/summaries";
import { decodeHoldings, type Holding } from "./storage";
import { buildColorMap } from "./colors";
import { PortfolioGate } from "./PortfolioGate";
import { EditHoldings } from "./EditHoldings";
import { AddTickerRow } from "./PortfolioRowActions";
import { PortfolioTabs } from "./PortfolioTabs";
import { PortfolioPerformance } from "./PerformanceChart";
import { HoldingRow, type RowData } from "./HoldingRow";
import type { AnalystRow, EarningsRow } from "./PortfolioTabs";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "My Portfolio — Fabuless",
  description:
    "Your holdings, in context. Live prices, analyst consensus, open expert predictions, and upcoming earnings — filtered to the stocks you follow.",
};

const METABYTICKER = new Map(COMPANY_UNIVERSE.map((c) => [c.ticker, c]));

function parseEarningsDate(s?: string): Date | null {
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

export default async function PortfolioPage({
  searchParams,
}: {
  searchParams: Promise<{ h?: string }>;
}) {
  const { h } = await searchParams;
  const holdings: Holding[] = h ? decodeHoldings(h) : [];

  if (holdings.length === 0) {
    return <PortfolioGate />;
  }

  const tickers = holdings.map((h) => h.ticker);

  const built = await Promise.all(
    holdings.map(async (holding) => {
      const meta = METABYTICKER.get(holding.ticker);
      const symbol = meta?.yahooSymbol ?? holding.ticker;
      const data = await getCompanyData(symbol, meta?.newsKeywords);
      const openCount = predictions.filter(
        (p) => (p.companies ?? []).includes(holding.ticker) && p.status === "TOO_EARLY",
      ).length;
      const earningsLabel = data.earnings?.nextEarningsDate ?? null;
      const earningsDate = parseEarningsDate(earningsLabel ?? undefined);
      const price = data.quote?.price ?? null;
      const myReturn =
        holding.purchasePrice && price != null
          ? Math.round(((price - holding.purchasePrice) / holding.purchasePrice) * 1000) / 10
          : null;
      const value = holding.shares && price != null ? holding.shares * price : null;
      const cost = holding.shares && holding.purchasePrice ? holding.shares * holding.purchasePrice : null;
      const pnl = value != null && cost != null ? value - cost : null;
      const dUntil = earningsDate ? daysUntil(earningsDate) : null;

      const row: RowData = {
        ticker: holding.ticker,
        covered: !!meta,
        slug: meta?.slug ?? null,
        name: meta?.name ?? data.profile?.name ?? holding.ticker,
        price,
        changePercent: data.quote?.changePercent ?? null,
        dist: data.consensus?.distribution ?? null,
        openCount,
        earningsLabel,
        earningsSoon: dUntil !== null && dUntil >= 0 && dUntil <= 14,
        myReturn,
        value,
        pnl,
        purchasePrice: holding.purchasePrice,
        purchaseDate: holding.purchaseDate,
      };
      return { row, earningsDate, price };
    }),
  );

  const rows = built.map((b) => b.row);
  const livePrices: Record<string, number | null> = Object.fromEntries(built.map((b) => [b.row.ticker, b.price]));
  const colorMap = buildColorMap(tickers);

  // Earnings tab — upcoming (any future date, not just 30 days)
  const previewTickers = new Set(tickersWithPreview());
  const earningsRows: EarningsRow[] = built
    .filter((b) => b.earningsDate && daysUntil(b.earningsDate) >= 0)
    .sort((a, b) => a.earningsDate!.getTime() - b.earningsDate!.getTime())
    .map((b) => ({
      ticker: b.row.ticker,
      companyName: b.row.name,
      label: b.row.earningsLabel!,
      daysUntil: daysUntil(b.earningsDate!),
      earningsSlug: previewTickers.has(b.row.ticker) ? b.row.ticker.toLowerCase() : null,
    }));

  // Past earnings summaries from static JSON (auto-updated by pipeline)
  const pastSummaries = Object.fromEntries(
    tickers.map((t) => [t, getSummaries(t, 3)])
  );

  // Expert calls tab
  const recentCalls = predictions
    .filter((p) => (p.companies ?? []).some((c) => tickers.includes(c)))
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 20);

  const expertsMap = Object.fromEntries(EXPERTS.map((e) => [e.id, e]));

  // Analysts tab
  const allAnalysts = await fetchAnalystCoverage();
  const analystRows: AnalystRow[] = tickers
    .map((ticker) => {
      const meta = METABYTICKER.get(ticker);
      const entries = allAnalysts
        .map((a) => {
          const cov = a.coverage.find((c) => c.ticker === ticker);
          if (!cov) return null;
          return { id: a.id, name: a.name, firmDisplay: a.firmDisplay, rating: cov.rating, priceTarget: cov.priceTarget, upsidePct: cov.upsidePct, action: cov.action, accent: a.accent };
        })
        .filter((x): x is NonNullable<typeof x> => x !== null)
        .sort((a, b) => (b.priceTarget ?? 0) - (a.priceTarget ?? 0));
      if (entries.length === 0) return null;
      const targets = entries.map((a) => a.priceTarget).filter((p): p is number => p !== null);
      const upsides = entries.map((a) => a.upsidePct).filter((u): u is number => u !== null);
      return {
        ticker,
        companyName: meta?.name ?? ticker,
        analysts: entries,
        avgTarget: targets.length ? Math.round(targets.reduce((a, b) => a + b, 0) / targets.length) : null,
        avgUpside: upsides.length ? Math.round(upsides.reduce((a, b) => a + b, 0) / upsides.length * 10) / 10 : null,
      };
    })
    .filter((r): r is AnalystRow => r !== null);

  const hasReturnData = holdings.some((h) => h.purchasePrice && h.purchaseDate);

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      {/* Header with tabs top-right */}
      <PortfolioTabs
        earnings={earningsRows}
        calls={recentCalls}
        experts={expertsMap}
        analystRows={analystRows}
        tickers={tickers}
        pastSummaries={pastSummaries}
      />

      {/* Main two-column: holdings left, chart right */}
      <div className="flex gap-6 mb-8 items-start">
        {/* LEFT — condensed holdings table */}
        <div className="w-[380px] shrink-0">
          {/* Edit Holdings — prominent, above the list */}
          <Suspense fallback={null}>
            <EditHoldings holdings={holdings} />
          </Suspense>
          <div className="rounded-xl border border-gray-100 bg-white shadow-sm overflow-hidden mt-2">
            {/* Add ticker row at TOP */}
            <AddTickerRow allHoldings={holdings} />
            {/* Column headers */}
            <div className="grid grid-cols-[1fr_80px_60px_20px] items-center gap-2 px-3 py-2.5 border-t border-b border-gray-100 bg-gray-50/60">
              {["Holding", "Price", "Day", ""].map((h, i) => (
                <span key={i} className={`text-[9px] font-bold uppercase tracking-widest text-gray-400 ${i === 0 ? "" : "text-right"}`}>{h}</span>
              ))}
            </div>
            {rows.map((r, i) => (
              <HoldingRow
                key={r.ticker}
                r={r}
                color={colorMap[r.ticker]}
                gridCols="grid-cols-[1fr_80px_60px_20px]"
                hasReturnData={false}
                allHoldings={holdings}
                isFirst={i === 0}
                compact
              />
            ))}
          </div>
        </div>

        {/* RIGHT — performance chart */}
        <div className="flex-1 min-w-0">
          <Suspense fallback={null}>
            <PortfolioPerformance holdings={holdings} livePrices={livePrices} />
          </Suspense>
        </div>
      </div>



      <p className="mt-10 pt-5 border-t border-gray-100 font-serif text-[11px] text-[#4a4a4a] leading-relaxed max-w-2xl">
        Prices and consensus via Yahoo Finance, refreshed every 5 minutes. Performance calculations use closing prices and do not account for dividends, splits, or fees. Independent analysis — not investment advice.
      </p>
    </div>
  );
}
