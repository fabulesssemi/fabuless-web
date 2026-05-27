import { insiderTradingData } from "@/lib/insider-trading";
import type { ConvictionLevel } from "@/lib/insider-trading";
import { getQuoteCached } from "@/lib/providers";

export const revalidate = 1800; // refresh every 30 min

// ── Live price fetcher ────────────────────────────────────────────────────────

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

// ── UI components ─────────────────────────────────────────────────────────────

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
    HIGH: "bg-emerald-50 text-emerald-700 border border-emerald-200",
    "MOD-HIGH": "bg-teal-50 text-teal-700 border border-teal-200",
    MODERATE: "bg-gray-100 text-gray-500 border border-gray-200",
    AVOID: "bg-red-100 text-red-700 border border-red-200",
    CAUTIOUS: "bg-amber-50 text-amber-700 border border-amber-200",
  };
  return (
    <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded font-sans tracking-wider uppercase ${styles[level]}`}>
      {level}
    </span>
  );
}

function SeverityBadge({ severity }: { severity: string }) {
  if (severity === "STRONG AVOID")
    return <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded font-sans tracking-wider uppercase bg-red-100 text-red-800 border border-red-300">🚨 STRONG AVOID</span>;
  if (severity === "AVOID")
    return <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded font-sans tracking-wider uppercase bg-red-50 text-red-700 border border-red-200">🚨 AVOID</span>;
  return <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded font-sans tracking-wider uppercase bg-amber-50 text-amber-700 border border-amber-200">⚠️ CAUTIOUS</span>;
}

// ── Page ──────────────────────────────────────────────────────────────────────

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
      <h2 className="font-sans text-sm font-semibold text-[#0E7490] mb-3 tracking-widest uppercase">
        Top 10 Watchlist
      </h2>

      <div className="divide-y divide-gray-100 border border-gray-200 rounded-lg mb-10 bg-white">
        {data.watchlist.map((item) => {
          const livePrice = livePrices[item.ticker];
          return (
            <div key={item.ticker} className="px-4 py-3 hover:bg-gray-50/60 transition-colors">

              {/* Row 1: rank · ticker · company · price · stars · conviction */}
              <div className="flex items-center gap-2 flex-wrap mb-1.5">
                <span className="text-[10px] text-gray-400 font-sans w-3 flex-shrink-0">{item.rank}.</span>
                <span className="font-sans font-bold text-sm text-[#18181B] tracking-tight">{item.ticker}</span>
                <span className="text-xs text-gray-400">{item.company}</span>
                <span className="ml-auto flex items-center gap-2 flex-shrink-0">
                  {livePrice ? (
                    <span className="font-sans font-semibold text-xs text-[#18181B]">
                      {formatPrice(livePrice)} <span className="text-[9px] font-normal text-gray-400">live</span>
                    </span>
                  ) : (
                    <span className="text-xs text-gray-400">{item.price}</span>
                  )}
                  <Stars count={item.stars} />
                  <ConvictionBadge level={item.conviction} />
                </span>
              </div>

              {/* Row 2: signal */}
              <p className="text-xs text-gray-600 leading-relaxed mb-1">{item.signal}</p>

              {/* Row 3: thesis + last buy inline */}
              <p className="text-[11px] text-gray-400 leading-relaxed">{item.thesis}</p>

              <div className="mt-1.5 flex items-center gap-3 text-[10px] text-gray-400">
                <span>Last buy: <span className="text-gray-500">{item.lastInsiderBuy}</span></span>
                {item.stillOpen && (
                  <span className="text-emerald-600 font-medium">✓ Open</span>
                )}
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
          <div className="divide-y divide-red-50 border border-red-100 rounded-lg mb-10 bg-red-50/30">
            {data.redFlags.map((flag) => (
              <div key={flag.ticker} className="px-4 py-3">
                <div className="flex items-center gap-2 flex-wrap mb-1.5">
                  <span className="font-sans font-bold text-sm text-[#18181B] tracking-tight">{flag.ticker}</span>
                  <span className="text-xs text-gray-400">{flag.company}</span>
                  <span className="ml-auto flex-shrink-0">
                    <SeverityBadge severity={flag.severity} />
                  </span>
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
          <span className="font-semibold text-gray-500">Methodology:</span> Data pulled from Finviz insider trading tables and SEC EDGAR Form 4 filings. Coverage universe: NVDA, AMD, INTC, QCOM, AVGO, MRVL, MU, AMAT, LRCX, KLAC, ASML, ARM, ONTO, ENTG, SNPS, CDNS, LSCC, ACLS, MKSI. Open-market purchases weighted higher than option exercises. 10b5-1 sales treated as less directional. Prices live via Yahoo Finance. Not investment advice.
        </p>
      </div>
    </div>
  );
}
