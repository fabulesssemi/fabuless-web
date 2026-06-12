import { getUpcomingEarnings } from "@/lib/earnings";

export const revalidate = 3600; // ISR — refreshes hourly

export default async function Earnings() {
  const earnings = await getUpcomingEarnings();

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
                    <span className="text-[13px] font-semibold text-[#111827]">{row.company}</span>
                    <span className="ml-2 text-[11px] text-gray-400">{row.ticker}</span>
                  </td>
                  <td className="px-4 py-3 text-[13px] text-gray-700">{row.eps}</td>
                  <td className={`px-4 py-3 text-[13px] font-semibold ${row.avgMove.startsWith("+") ? "text-emerald-600" : "text-rose-500"}`}>
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
