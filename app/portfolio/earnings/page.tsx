import type { Metadata } from "next";
import { getSummaries } from "@/lib/earnings/summaries";
import { getPreview } from "@/lib/earnings/previews";
import { decodeHoldings } from "@/app/portfolio/storage";
import { PortfolioTabs } from "@/app/portfolio/PortfolioTabs";
import { PortfolioGate } from "@/app/portfolio/PortfolioGate";
import { COMPANY_UNIVERSE } from "@/lib/companies";
import { getCompanyData } from "@/lib/providers";
import Link from "next/link";

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

  // Fetch upcoming earnings dates for all holdings
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
        label,
        date,
        daysAway: date ? daysUntil(date) : null,
        preview: getPreview(ticker),
      };
    })
  );

  const upcoming = upcomingData
    .filter((u) => u.date && u.daysAway !== null && u.daysAway >= 0)
    .sort((a, b) => a.date!.getTime() - b.date!.getTime());

  const pastRows = tickers
    .map((ticker) => ({
      ticker,
      name: METABYTICKER.get(ticker)?.name ?? ticker,
      summaries: getSummaries(ticker, 4),
    }))
    .filter((r) => r.summaries.length > 0);

  const hParam = h ? `?h=${h}` : "";

  return (
    <div className="max-w-6xl mx-auto pl-4 pr-6 py-10">
      <PortfolioTabs earnings={upcoming.map((u) => ({
        ticker: u.ticker,
        companyName: u.name,
        label: u.label!,
        daysUntil: u.daysAway!,
        earningsSlug: u.preview ? u.ticker.toLowerCase() : null,
      }))} />

      {/* ── Upcoming ── */}
      {upcoming.length > 0 && (
        <section className="mb-10">
          <div className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-3">Upcoming</div>
          <div className="space-y-2">
            {upcoming.map((u) => (
              <div key={u.ticker} className="flex items-center gap-4 bg-white border border-[#DDDBD2] px-5 py-3.5">
                <span className="font-mono text-[11px] font-bold text-[#B45309] bg-amber-50 border border-amber-200 px-2 py-0.5 rounded w-14 text-center shrink-0">
                  {u.ticker}
                </span>
                <span className="font-sans text-[13px] font-semibold text-[#111827] flex-1">{u.name}</span>
                <span className="text-[12px] text-gray-500 shrink-0">{u.label}</span>
                <span className={`text-[11px] font-bold shrink-0 ${u.daysAway! <= 7 ? "text-amber-600" : "text-gray-400"}`}>
                  {u.daysAway === 0 ? "Today" : u.daysAway === 1 ? "Tomorrow" : `${u.daysAway}d away`}
                </span>
                {u.preview ? (
                  <Link
                    href={`/earnings/${u.ticker.toLowerCase()}${hParam}`}
                    className="shrink-0 text-[11px] font-semibold text-[#B45309] hover:underline"
                  >
                    Deep dive →
                  </Link>
                ) : (
                  <span className="shrink-0 text-[11px] text-gray-300">No preview yet</span>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── Past results ── */}
      {pastRows.length > 0 && (
        <section>
          <div className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-3">Past Results</div>
          <div className="space-y-10">
            {pastRows.map(({ ticker, name, summaries }) => (
              <div key={ticker}>
                <div className="flex items-center gap-3 mb-4 border-b border-gray-100 pb-3">
                  <span className="font-mono text-[11px] font-bold text-[#B45309] bg-amber-50 border border-amber-200 px-2 py-0.5 rounded">
                    {ticker}
                  </span>
                  <span className="font-sans text-[15px] font-bold text-[#111827]">{name}</span>
                </div>

                <div className="space-y-4">
                  {summaries.map((s) => (
                    <div key={s.quarter} className="bg-white border border-[#DDDBD2] p-5">
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

                      {s.summary && (
                        <p className="font-serif text-[13px] text-[#4a4a4a] leading-relaxed">{s.summary}</p>
                      )}

                      {s.keyQuote && (
                        <blockquote className="mt-3 pl-3 border-l-2 border-amber-400 font-serif text-[12px] text-gray-500 italic leading-relaxed">
                          "{s.keyQuote}"
                        </blockquote>
                      )}

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
        </section>
      )}

      {upcoming.length === 0 && pastRows.length === 0 && (
        <div className="text-center py-16 text-gray-400 font-serif text-[15px]">
          No earnings data found for your holdings yet.<br />
          <span className="text-[13px]">The pipeline runs Mon / Wed / Fri and populates results automatically.</span>
        </div>
      )}
    </div>
  );
}
