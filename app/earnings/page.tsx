const earnings = [
  {
    date: "Wed May 20",
    company: "Nvidia",
    ticker: "NVDA",
    epsEst: "$1.77",
    avgMove: "+2.5%",
    beatRate: "90%",
  },
  {
    date: "Wed May 20",
    company: "Analog Devices",
    ticker: "ADI",
    epsEst: "$2.91",
    avgMove: "+0.8%",
    beatRate: "90%",
  },
  {
    date: "Wed May 27",
    company: "Marvell",
    ticker: "MRVL",
    epsEst: "$0.79",
    avgMove: "+1.9%",
    beatRate: "75%",
  },
  {
    date: "Wed May 27",
    company: "Synopsys",
    ticker: "SNPS",
    epsEst: "$3.15",
    avgMove: "-1.3%",
    beatRate: "95%",
  },
  {
    date: "Mon Jun 1",
    company: "Credo",
    ticker: "CRDO",
    epsEst: "$1.03",
    avgMove: "+5.9%",
    beatRate: "67%",
  },
  {
    date: "Wed Jun 3",
    company: "Broadcom",
    ticker: "AVGO",
    epsEst: "$2.39",
    avgMove: "+2.9%",
    beatRate: "95%",
  },
];

export default function Earnings() {
  return (
    <div className="max-w-4xl mx-auto px-6 pt-16 pb-8">
      <div className="flex items-baseline justify-between mb-2">
        <h1 className="font-serif text-4xl text-[#0E7490] tracking-tight">
          Earnings Calendar
        </h1>
      </div>
      <p className="text-sm text-gray-400 mb-10">
        Upcoming semiconductor & hyperscaler earnings — next 2 weeks. Updated
        weekly.
      </p>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 text-left">
              <th className="pb-3 font-sans font-semibold text-xs tracking-widest text-[#0E7490] uppercase pr-8">
                Date
              </th>
              <th className="pb-3 font-sans font-semibold text-xs tracking-widest text-[#0E7490] uppercase pr-8">
                Company
              </th>
              <th className="pb-3 font-sans font-semibold text-xs tracking-widest text-[#0E7490] uppercase pr-8">
                EPS Est.
              </th>
              <th className="pb-3 font-sans font-semibold text-xs tracking-widest text-[#0E7490] uppercase pr-8">
                Avg 2-Day Move
              </th>
              <th className="pb-3 font-sans font-semibold text-xs tracking-widest text-[#0E7490] uppercase">
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
                  <span className="font-medium text-[#374151]">
                    {row.company}
                  </span>
                  <span className="ml-2 text-xs text-gray-400">
                    {row.ticker}
                  </span>
                </td>
                <td className="py-4 pr-8 text-[#374151]">{row.epsEst}</td>
                <td
                  className={`py-4 pr-8 font-medium ${
                    row.avgMove.startsWith("+")
                      ? "text-emerald-600"
                      : "text-red-500"
                  }`}
                >
                  {row.avgMove}
                </td>
                <td className="py-4 text-[#374151]">{row.beatRate}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="mt-6 text-xs text-gray-400">
        Avg 2-day move and beat rate based on last 20 quarters. Source:
        Fabuless pipeline via yfinance.
      </p>
    </div>
  );
}
