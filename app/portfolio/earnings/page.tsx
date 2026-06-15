import type { Metadata } from "next";
import { getSummaries } from "@/lib/earnings/summaries";
import { decodeHoldings } from "@/app/portfolio/storage";
import { PortfolioTabs } from "@/app/portfolio/PortfolioTabs";
import { PortfolioGate } from "@/app/portfolio/PortfolioGate";
import { COMPANY_UNIVERSE } from "@/lib/companies";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Earnings Results — My Portfolio",
};

const METABYTICKER = new Map(COMPANY_UNIVERSE.map((c) => [c.ticker, c]));

function BeatBadge({ surprisePct }: { surprisePct: number | null }) {
  if (surprisePct === null) return null;
  const beat = surprisePct > 0;
  return (
    <span className={`inline-block text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded ${
      beat ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-red-50 text-red-700 border border-red-200"
    }`}>
      {beat ? `Beat +${surprisePct.toFixed(1)}%` : `Miss ${surprisePct.toFixed(1)}%`}
    </span>
  );
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

  const rows = tickers
    .map((ticker) => ({
      ticker,
      name: METABYTICKER.get(ticker)?.name ?? ticker,
      summaries: getSummaries(ticker, 4),
    }))
    .filter((r) => r.summaries.length > 0);

  return (
    <div className="max-w-6xl mx-auto pl-4 pr-6 py-10">
      <PortfolioTabs earnings={[]} />

      {rows.length === 0 ? (
        <div className="text-center py-16 text-gray-400 font-serif text-[15px]">
          No earnings reports found for your holdings yet.<br />
          <span className="text-[13px]">The pipeline runs Mon / Wed / Fri and populates results automatically.</span>
        </div>
      ) : (
        <div className="space-y-10">
          {rows.map(({ ticker, name, summaries }) => (
            <div key={ticker}>
              {/* Company header */}
              <div className="flex items-center gap-3 mb-4 border-b border-gray-100 pb-3">
                <span className="font-mono text-[11px] font-bold text-[#B45309] bg-amber-50 border border-amber-200 px-2 py-0.5 rounded">
                  {ticker}
                </span>
                <span className="font-sans text-[15px] font-bold text-[#111827]">{name}</span>
              </div>

              {/* Quarters */}
              <div className="space-y-4">
                {summaries.map((s) => (
                  <div key={s.quarter} className="bg-white border border-[#DDDBD2] p-5">
                    {/* Quarter row */}
                    <div className="flex items-center gap-3 mb-3 flex-wrap">
                      <span className="font-sans text-[13px] font-bold text-[#111827]">{s.quarter}</span>
                      <span className="text-[11px] text-gray-400">{s.date}</span>
                      <BeatBadge surprisePct={s.surprisePct} />
                      {s.priceMoveDay !== null && (
                        <span className={`text-[11px] font-semibold ${s.priceMoveDay >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                          {s.priceMoveDay >= 0 ? "+" : ""}{s.priceMoveDay.toFixed(1)}% day-of
                        </span>
                      )}
                    </div>

                    {/* EPS row */}
                    {(s.epsActual !== null || s.epsEstimate !== null) && (
                      <div className="flex items-center gap-6 mb-3 text-[12px]">
                        {s.epsActual !== null && (
                          <div>
                            <span className="text-gray-400 mr-1">EPS actual</span>
                            <span className="font-bold text-[#111827]">${s.epsActual.toFixed(2)}</span>
                          </div>
                        )}
                        {s.epsEstimate !== null && (
                          <div>
                            <span className="text-gray-400 mr-1">vs est.</span>
                            <span className="font-bold text-gray-600">${s.epsEstimate.toFixed(2)}</span>
                          </div>
                        )}
                        {s.revActual !== null && (
                          <div>
                            <span className="text-gray-400 mr-1">Revenue</span>
                            <span className="font-bold text-[#111827]">${(s.revActual / 1000).toFixed(1)}B</span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Summary */}
                    {s.summary && (
                      <p className="font-serif text-[13px] text-[#4a4a4a] leading-relaxed">
                        {s.summary}
                      </p>
                    )}

                    {/* Key quote */}
                    {s.keyQuote && (
                      <blockquote className="mt-3 pl-3 border-l-2 border-amber-400 font-serif text-[12px] text-gray-500 italic leading-relaxed">
                        "{s.keyQuote}"
                      </blockquote>
                    )}

                    {/* Transcript link */}
                    {s.transcriptUrl && (
                      <a
                        href={s.transcriptUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block mt-3 text-[11px] font-semibold text-[#B45309] hover:underline"
                      >
                        SEC filing →
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
