import type { Metadata } from "next";
import { predictions } from "@/lib/tracker/predictions";
import { EXPERTS } from "@/lib/tracker/experts";
import { decodeHoldings } from "@/app/portfolio/storage";
import { PortfolioTabs } from "@/app/portfolio/PortfolioTabs";
import { PortfolioGate } from "@/app/portfolio/PortfolioGate";
import { COMPANY_UNIVERSE } from "@/lib/companies";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Expert Calls — My Portfolio",
};

const METABYTICKER = new Map(COMPANY_UNIVERSE.map((c) => [c.ticker, c]));
const EXPERTSMAP = new Map(EXPERTS.map((e) => [e.id, e]));

const STATUS_LABELS: Record<string, string> = {
  CORRECT: "Correct",
  PARTIAL: "Partial",
  WRONG: "Wrong",
  TOO_EARLY: "Open",
};

const STATUS_COLORS: Record<string, string> = {
  CORRECT: "bg-emerald-50 text-emerald-700 border border-emerald-200",
  PARTIAL: "bg-amber-50 text-amber-700 border border-amber-200",
  WRONG: "bg-red-50 text-red-700 border border-red-200",
  TOO_EARLY: "bg-gray-100 text-gray-500 border border-gray-200",
};

export default async function ExpertCallsPage({
  searchParams,
}: {
  searchParams: Promise<{ h?: string }>;
}) {
  const { h } = await searchParams;
  const holdings = h ? decodeHoldings(h) : [];

  if (holdings.length === 0) return <PortfolioGate />;

  const tickers = holdings.map((hh) => hh.ticker);

  const calls = predictions
    .filter((p) => (p.companies ?? []).some((c) => tickers.includes(c)))
    .sort((a, b) => b.date.localeCompare(a.date));

  // Group by ticker
  const byTicker = new Map<string, typeof calls>();
  for (const ticker of tickers) {
    const tickerCalls = calls.filter((p) => (p.companies ?? []).includes(ticker));
    if (tickerCalls.length > 0) byTicker.set(ticker, tickerCalls);
  }

  return (
    <div className="max-w-6xl mx-auto pl-4 pr-6 py-10">
      <PortfolioTabs earnings={[]} />

      {calls.length === 0 ? (
        <div className="text-center py-16 text-gray-400 font-serif text-[15px]">
          No expert calls found for your holdings.
        </div>
      ) : (
        <div className="space-y-10">
          {Array.from(byTicker.entries()).map(([ticker, tickerCalls]) => {
            const name = METABYTICKER.get(ticker)?.name ?? ticker;
            const open = tickerCalls.filter((p) => p.status === "TOO_EARLY");
            const resolved = tickerCalls.filter((p) => p.status !== "TOO_EARLY");
            return (
              <div key={ticker}>
                <div className="flex items-center gap-3 mb-4 border-b border-gray-100 pb-3">
                  <span className="font-mono text-[11px] font-bold text-[#B45309] bg-amber-50 border border-amber-200 px-2 py-0.5 rounded">
                    {ticker}
                  </span>
                  <span className="font-sans text-[15px] font-bold text-[#111827]">{name}</span>
                  <span className="text-[11px] text-gray-400 ml-auto">
                    {open.length} open · {resolved.length} resolved
                  </span>
                </div>

                <div className="space-y-3">
                  {tickerCalls.map((p) => {
                    const expert = EXPERTSMAP.get(p.expert);
                    return (
                      <div key={p.id} className="bg-white border border-[#DDDBD2] px-5 py-4">
                        <div className="flex items-start gap-3 flex-wrap mb-2">
                          <span
                            className="text-[10px] font-bold uppercase tracking-wider shrink-0 mt-0.5"
                            style={{ color: expert?.accent ?? "#111827" }}
                          >
                            {expert?.name ?? p.expert}
                          </span>
                          <span className="text-[10px] text-gray-400 shrink-0 mt-0.5">{p.date}</span>
                          <span className={`text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded ml-auto shrink-0 ${STATUS_COLORS[p.status]}`}>
                            {STATUS_LABELS[p.status]}
                          </span>
                        </div>
                        <p className="font-serif text-[13px] text-[#111827] leading-relaxed">{p.claim}</p>
                        {p.notes && (
                          <p className="mt-1.5 font-serif text-[12px] text-gray-400 leading-relaxed">{p.notes}</p>
                        )}
                        <div className="mt-2 flex items-center gap-3">
                          <span className="text-[10px] text-gray-300">{p.horizon}</span>
                          {p.source && (
                            <a
                              href={p.source}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[10px] text-gray-300 hover:text-[#B45309] transition-colors"
                            >
                              Source →
                            </a>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
