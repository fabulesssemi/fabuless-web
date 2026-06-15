import type { Metadata } from "next";
import { predictions } from "@/lib/tracker/predictions";
import { EXPERTS } from "@/lib/tracker/experts";
import { decodeHoldings } from "@/app/portfolio/storage";
import { PortfolioTabs } from "@/app/portfolio/PortfolioTabs";
import { PortfolioGate } from "@/app/portfolio/PortfolioGate";
import { COMPANY_UNIVERSE } from "@/lib/companies";
import { buildColorMap } from "@/app/portfolio/colors";
import { ExpertCallsFilter } from "./ExpertCallsFilter";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Expert Calls — My Portfolio",
};

const METABYTICKER = new Map(COMPANY_UNIVERSE.map((c) => [c.ticker, c]));
const EXPERTSMAP = new Map(EXPERTS.map((e) => [e.id, e]));

export default async function ExpertCallsPage({
  searchParams,
}: {
  searchParams: Promise<{ h?: string }>;
}) {
  const { h } = await searchParams;
  const holdings = h ? decodeHoldings(h) : [];

  if (holdings.length === 0) return <PortfolioGate />;

  const tickers = holdings.map((hh) => hh.ticker);
  const colorMap = buildColorMap(tickers);

  const calls = tickers.flatMap((ticker) =>
    predictions
      .filter((p) => (p.companies ?? []).includes(ticker))
      .map((p) => {
        const expert = EXPERTSMAP.get(p.expert);
        return {
          id: `${p.id}-${ticker}`,
          ticker,
          expert: expert?.name ?? p.expert,
          expertAccent: expert?.accent ?? "#111827",
          date: p.date,
          claim: p.claim,
          notes: p.notes ?? "",
          status: p.status as "CORRECT" | "PARTIAL" | "WRONG" | "TOO_EARLY",
          horizon: p.horizon ?? "",
          source: p.source ?? "",
        };
      })
  );

  // Dedupe by id (a prediction that tags multiple holdings would appear twice)
  const seen = new Set<string>();
  const deduped = calls.filter((c) => {
    const key = c.id.replace(/-[A-Z]+$/, "");
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  // Sort: open first, then by date desc
  deduped.sort((a, b) => {
    if (a.status === "TOO_EARLY" && b.status !== "TOO_EARLY") return -1;
    if (b.status === "TOO_EARLY" && a.status !== "TOO_EARLY") return 1;
    return b.date.localeCompare(a.date);
  });

  return (
    <div className="max-w-6xl mx-auto pl-4 pr-6 py-10">
      <PortfolioTabs earnings={[]} />
      <ExpertCallsFilter calls={deduped} tickers={tickers} colorMap={colorMap} />
    </div>
  );
}
