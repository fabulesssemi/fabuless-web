import Link from "next/link";
import { getUpcomingEarnings } from "@/lib/earnings";
import { getPreview, tickersWithPreview } from "@/lib/earnings/previews";

export const revalidate = 3600; // ISR — refreshes hourly

const PREVIEW_TICKERS = new Set(tickersWithPreview());

export default async function Earnings() {
  const earnings = await getUpcomingEarnings();

  // The "portal": the soonest upcoming earner that has a published deep-dive.
  const featuredRow = earnings.find((r) => PREVIEW_TICKERS.has(r.ticker));
  const featured = featuredRow ? getPreview(featuredRow.ticker) : null;

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      {/* Header */}
      <div className="border-b border-gray-200 pb-4 mb-6 flex items-baseline justify-between gap-4">
        <div>
          <h1 className="font-sans text-2xl font-bold text-[#111827] tracking-tight">
            Earnings Calendar
          </h1>
          <p className="font-serif text-[15px] text-[#4a4a4a] mt-1">
            Semiconductor companies with $10B+ market cap — next 6 weeks. Updates daily.
          </p>
        </div>
      </div>

      {/* ── NEXT-UP PORTAL — pulls you into the deep dive ── */}
      {featured && featuredRow && (
        <Link
          href={`/earnings/${featured.ticker.toLowerCase()}`}
          className="group block mb-8 rounded-2xl bg-[#F3F4F6] border-2 border-amber-400 overflow-hidden hover:border-amber-500 transition-all"
        >
          <div className="p-5 sm:p-6">
            <div className="flex items-center gap-2.5 mb-2">
              <span className="text-[10px] font-bold uppercase tracking-widest text-amber-700">Next up</span>
              <span className="text-[10px] uppercase tracking-widest text-gray-400">· {featuredRow.date}</span>
            </div>
            <div className="flex items-center justify-between gap-6 flex-wrap">
              <div className="min-w-0">
                <div className="flex items-center gap-2.5">
                  <span className="font-mono text-[12px] font-bold text-amber-700">{featured.ticker}</span>
                  <span className="text-[11px] uppercase tracking-widest text-gray-400">{featured.fiscalQuarter}</span>
                  <h2 className="font-sans text-[20px] font-bold tracking-tight leading-none text-[#111827]">
                    {featured.company}
                  </h2>
                </div>
                <p className="font-serif text-[13px] text-gray-500 leading-snug mt-2 max-w-2xl">
                  {featured.centralQuestion}
                </p>
              </div>
              <span className="shrink-0 inline-flex items-center gap-2 text-[13px] font-semibold text-amber-700 group-hover:gap-3 transition-all">
                Enter the deep dive →
              </span>
            </div>
          </div>
        </Link>
      )}

      {earnings.length === 0 ? (
        <p className="text-[13px] text-gray-400 italic">No earnings reports in the next 6 weeks.</p>
      ) : (
        <div className="border border-[#DDDBD2] bg-white overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                {[
                  { label: "Date" },
                  { label: "Company" },
                  { label: "EPS Est." },
                  { label: "Avg 2-Day Move", sub: "post-earnings" },
                  { label: "Beat Rate" },
                ].map((h) => (
                  <th
                    key={h.label}
                    className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-gray-400"
                  >
                    {h.label}
                    {h.sub && <span className="block font-normal normal-case tracking-normal text-gray-300">{h.sub}</span>}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {earnings.map((row) => (
                <tr
                  key={`${row.ticker}-${row.date}`}
                  className="border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors"
                >
                  <td className="px-4 py-3 text-[13px] text-gray-400 whitespace-nowrap">{row.date}</td>
                  <td className="px-4 py-3">
                    {PREVIEW_TICKERS.has(row.ticker) ? (
                      <Link href={`/earnings/${row.ticker.toLowerCase()}`} className="group inline-flex items-center gap-2">
                        <span className="text-[13px] font-semibold text-[#B45309] group-hover:underline">{row.company}</span>
                        <span className="text-[11px] text-gray-400">{row.ticker}</span>
                        <span className="text-[9px] font-bold uppercase tracking-wider text-amber-700 bg-amber-50 border border-amber-200 rounded px-1.5 py-0.5">Deep dive</span>
                      </Link>
                    ) : (
                      <>
                        <span className="text-[13px] font-semibold text-[#111827]">{row.company}</span>
                        <span className="ml-2 text-[11px] text-gray-400">{row.ticker}</span>
                      </>
                    )}
                  </td>
                  <td className="px-4 py-3 text-[13px] text-gray-700">{row.eps}</td>
                  <td className={`px-4 py-3 text-[13px] font-semibold ${!row.avgMove || row.avgMove === "—" || row.avgMove === "N/A" ? "text-gray-400" : row.avgMove.startsWith("+") ? "text-emerald-600" : "text-rose-500"}`}>
                    {row.avgMove}
                  </td>
                  <td className="px-4 py-3 text-[13px] text-gray-700">{row.beatRate}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <p className="mt-4 text-[11px] text-gray-400">
        Avg 2-day move and beat rate based on last 20 quarters. Dates via Yahoo Finance.
      </p>
    </div>
  );
}
