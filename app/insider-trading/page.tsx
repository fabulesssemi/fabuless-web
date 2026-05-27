import { insiderTradingData } from "@/lib/insider-trading";
import type { ConvictionLevel } from "@/lib/insider-trading";
import { getQuoteCached } from "@/lib/providers";

export const revalidate = 1800;

async function fetchLivePrices(tickers: string[]): Promise<Record<string, number | null>> {
  const results = await Promise.all(
    tickers.map(async (ticker) => {
      const quote = await getQuoteCached(ticker).catch(() => null);
      return [ticker, quote?.price ?? null] as [string, number | null];
    })
  );
  return Object.fromEntries(results);
}

function formatPrice(price: number | null | undefined): string {
  if (!price) return "—";
  return price >= 1000
    ? `$${price.toLocaleString("en-US", { maximumFractionDigits: 0 })}`
    : `$${price.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function Stars({ count }: { count: number }) {
  return (
    <span className="text-amber-400 tracking-tight text-xs">
      {"★".repeat(count)}{"☆".repeat(5 - count)}
    </span>
  );
}

function ConvictionBadge({ level }: { level: ConvictionLevel }) {
  const styles: Record<ConvictionLevel, string> = {
    "VERY HIGH": "bg-emerald-100 text-emerald-800 border border-emerald-200",
    HIGH:        "bg-emerald-50 text-emerald-700 border border-emerald-200",
    "MOD-HIGH":  "bg-teal-50 text-teal-700 border border-teal-200",
    MODERATE:    "bg-gray-100 text-gray-500 border border-gray-200",
    AVOID:       "bg-red-100 text-red-700 border border-red-200",
    CAUTIOUS:    "bg-amber-50 text-amber-700 border border-amber-200",
  };
  return (
    <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded font-sans tracking-wider uppercase whitespace-nowrap ${styles[level]}`}>
      {level}
    </span>
  );
}

function SeverityBadge({ severity }: { severity: string }) {
  if (severity === "STRONG AVOID")
    return <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded font-sans tracking-wider uppercase bg-red-100 text-red-800 border border-red-300 whitespace-nowrap">🚨 STRONG AVOID</span>;
  if (severity === "AVOID")
    return <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded font-sans tracking-wider uppercase bg-red-50 text-red-700 border border-red-200 whitespace-nowrap">🚨 AVOID</span>;
  return <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded font-sans tracking-wider uppercase bg-amber-50 text-amber-700 border border-amber-200 whitespace-nowrap">⚠️ CAUTIOUS</span>;
}

export default async function InsiderTrading() {
  const data = insiderTradingData;

  const analysisDate = new Date(data.generatedDate).toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric",
  });

  const tickers = data.watchlist.map((item) => item.ticker);
  const livePrices = await fetchLivePrices(tickers);

  return (
    <div className="max-w-4xl mx-auto px-6 pt-14 pb-16">

      {/* Header */}
      <div className="flex items-baseline justify-between mb-1">
        <h1 className="font-sans text-3xl text-[#0E7490] tracking-tight">Insider Trading</h1>
        <span className="text-xs text-gray-400 font-sans">Updated {analysisDate} · {data.lookbackWindow}</span>
      </div>
      <p className="text-xs text-gray-400 mb-8">
        Open-market insider purchases and cluster-sell signals across the semi &amp; semi-cap universe. Prices live · Thesis as of {analysisDate}.
      </p>

      {/* Top 10 Watchlist */}
      <h2 className="font-sans text-sm font-semibold text-[#0E7490] mb-2 tracking-widest uppercase">
        Top 10 Watchlist
      </h2>

      {/* Conviction key */}
      <div className="flex flex-wrap gap-x-4 gap-y-1 mb-4">
        {([
          ["VERY HIGH", "bg-emerald-100 text-emerald-800 border-emerald-200", "CEO/CFO bought $500k+ of their own stock"],
          ["HIGH",      "bg-emerald-50 text-emerald-700 border-emerald-200",  "Insider bought $250k+ of their own stock"],
          ["MOD-HIGH",  "bg-teal-50 text-teal-700 border-teal-200",           "Insider bought $100k–$250k of their own stock"],
          ["MODERATE",  "bg-gray-100 text-gray-500 border-gray-200",          "No notable buying or selling"],
          ["CAUTIOUS",  "bg-amber-50 text-amber-700 border-amber-200",        "Executives selling shares (likely pre-planned)"],
          ["AVOID",     "bg-red-100 text-red-700 border-red-200",             "Multiple insiders selling — exit signal"],
        ] as const).map(([label, style, desc]) => (
          <div key={label} className="flex items-center gap-1.5">
            <span className={`text-[8px] font-semibold px-1.5 py-0.5 rounded border tracking-wider uppercase ${style}`}>{label}</span>
            <span className="text-[10px] text-gray-400">{desc}</span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 mb-10">
        {data.watchlist.map((item) => {
          const livePrice = livePrices[item.ticker];
          return (
            <div
              key={item.ticker}
              className="border border-gray-200 rounded-lg p-3 hover:border-[#0E7490]/40 transition-colors bg-white flex flex-col gap-1.5"
            >
              {/* Ticker row */}
              <div className="flex items-center gap-1">
                <span className="text-[9px] text-gray-400 w-3 flex-shrink-0">{item.rank}.</span>
                <span className="font-sans font-bold text-sm text-[#18181B] tracking-tight">{item.ticker}</span>
                <span className="text-[10px] text-gray-400 truncate">{item.company}</span>
              </div>

              {/* Price */}
              <span className="font-sans font-semibold text-xs text-[#18181B]">
                {livePrice ? (
                  <>{formatPrice(livePrice)} <span className="text-[9px] font-normal text-gray-400">live</span></>
                ) : (
                  <span className="text-gray-400">{item.price}</span>
                )}
              </span>

              {/* Stars + conviction */}
              <div className="flex items-center gap-1.5">
                <Stars count={item.stars} />
                <ConvictionBadge level={item.conviction} />
              </div>

              {/* Signal */}
              <p className="text-[11px] text-gray-600 leading-relaxed">{item.signal}</p>

              {/* Footer */}
              <div className="flex items-center gap-2 text-[9px] text-gray-400 mt-auto pt-1 border-t border-gray-100">
                <span className="truncate">Last buy: <span className="text-gray-500">{item.lastInsiderBuy}</span></span>
                {item.stillOpen && <span className="text-emerald-600 font-medium ml-auto flex-shrink-0">✓ Open</span>}
              </div>
            </div>
          );
        })}
      </div>

      {/* Red Flags */}
      {data.redFlags.length > 0 && (
        <>
          <h2 className="font-sans text-sm font-semibold text-red-700 mb-3 tracking-widest uppercase">
            Red Flags
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 mb-10">
            {data.redFlags.map((flag) => (
              <div key={flag.ticker} className="border border-red-100 rounded-lg p-3.5 bg-red-50/30 flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <span className="font-sans font-bold text-sm text-[#18181B] tracking-tight">{flag.ticker}</span>
                  <span className="text-xs text-gray-400 truncate">{flag.company}</span>
                  <div className="ml-auto flex-shrink-0">
                    <SeverityBadge severity={flag.severity} />
                  </div>
                </div>
                <p className="text-xs text-gray-600 leading-relaxed">{flag.signal}</p>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Methodology */}
      <div className="border-t border-gray-100 pt-5">
        <p className="text-[10px] text-gray-400 leading-relaxed">
          <span className="font-semibold text-gray-500">Methodology:</span> Data pulled from Finviz insider trading tables and SEC EDGAR Form 4 filings. Coverage: NVDA, AMD, INTC, QCOM, AVGO, MRVL, MU, AMAT, LRCX, KLAC, ASML, ARM, ONTO, ENTG, SNPS, CDNS, LSCC, ACLS, MKSI. Open-market purchases weighted higher than option exercises. 10b5-1 sales less directional. Prices live via Yahoo Finance. Not investment advice.
        </p>
      </div>
    </div>
  );
}
