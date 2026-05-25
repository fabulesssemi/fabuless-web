import { getUpcomingEarnings } from "@/lib/earnings";

export const revalidate = 3600; // ISR — refreshes hourly

export default async function Earnings() {
  const earnings = await getUpcomingEarnings();

  return (
    <div className="max-w-4xl mx-auto px-6 pt-16 pb-8">
      <div className="flex items-baseline justify-between mb-2">
        <h1 className="font-sans text-4xl text-[#0E7490] tracking-tight">
          Earnings Calendar
        </h1>
      </div>
      <p className="text-sm text-gray-400 mb-10">
        Upcoming semiconductor &amp; hyperscaler earnings — next 2 weeks.
        Auto-updated daily; past reports drop off automatically.
      </p>

      {earnings.length === 0 ? (
        <p className="text-sm text-gray-400 italic">
          No earnings reports in the next two weeks.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 text-left">
                {["Date", "Company", "EPS Est."].map((h) => (
                  <th
                    key={h}
                    className="pb-6 font-sans font-semibold text-xs tracking-widest text-[#0E7490] uppercase pr-8"
                  >
                    {h}
                  </th>
                ))}
                <th className="pb-3 pr-8 font-sans font-semibold text-xs tracking-widest text-[#0E7490] uppercase">
                  Avg 2-Day Move
                  <span className="block normal-case tracking-normal font-normal text-gray-400 text-[10px] mt-0.5">post-earnings</span>
                </th>
                <th className="pb-6 font-sans font-semibold text-xs tracking-widest text-[#0E7490] uppercase">
                  Beat Rate
                </th>
              </tr>
            </thead>
            <tbody>
              {earnings.map((row) => (
                <tr
                  key={`${row.ticker}-${row.date}`}
                  className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                >
                  <td className="py-4 pr-8 text-gray-500 whitespace-nowrap">
                    {row.date}
                  </td>
                  <td className="py-4 pr-8">
                    <span className="font-medium text-gray-900">{row.company}</span>
                    <span className="ml-2 text-xs text-gray-400">{row.ticker}</span>
                  </td>
                  <td className="py-4 pr-8 text-gray-900">{row.eps}</td>
                  <td
                    className={`py-4 pr-8 font-medium ${
                      row.avgMove.startsWith("+") ? "text-emerald-600" : "text-rose-500"
                    }`}
                  >
                    {row.avgMove}
                  </td>
                  <td className="py-4 text-gray-900">{row.beatRate}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <p className="mt-6 text-xs text-gray-400">
        Avg 2-day move and beat rate based on last 20 quarters. Live earnings
        dates via Yahoo Finance. Updates hourly.
      </p>
    </div>
  );
}
