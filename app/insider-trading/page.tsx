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
    <span className="text-amber-500 tracking-tight">
      {"★".repeat(count)}{"☆".repeat(5 - count)}
    </span>
  );
}

function ConvictionBadge({ level }: { level: ConvictionLevel }) {
  const styles: Record<ConvictionLevel, string> = {
    "VERY HIGH": "bg-emerald-100 text-emerald-800 border border-emerald-200",
    HIGH: "bg-emerald-50 text-emerald-700 border border-emerald-200",
    "MOD-HIGH": "bg-teal-50 text-teal-700 border border-teal-200",
    MODERATE: "bg-gray-100 text-gray-600 border border-gray-200",
    AVOID: "bg-red-100 text-red-700 border border-red-200",
    CAUTIOUS: "bg-amber-50 text-amber-700 border border-amber-200",
  };
  return (
    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded font-sans tracking-wider uppercase ${styles[level]}`}>
      {level}
    </span>
  );
}

function SeverityBadge({ severity }: { severity: string }) {
  if (severity === "STRONG AVOID")
    return <span className="text-[10px] font-semibold px-2 py-0.5 rounded font-sans tracking-wider uppercase bg-red-100 text-red-800 border border-red-300">🚨 STRONG AVOID</span>;
  if (severity === "AVOID")
    return <span className="text-[10px] font-semibold px-2 py-0.5 rounded font-sans tracking-wider uppercase bg-red-50 text-red-700 border border-red-200">🚨 AVOID</span>;
  return <span className="text-[10px] font-semibold px-2 py-0.5 rounded font-sans tracking-wider uppercase bg-amber-50 text-amber-700 border border-amber-200">⚠️ CAUTIOUS</span>;
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function InsiderTrading() {
  const data = insiderTradingData;

  const analysisDate = new Date(data.generatedDate).toLocaleDateString("en-US", {
    month: "long", day: "numeric", year: "numeric",
  });

  // Fetch live prices for all watchlist tickers
  const tickers = data.watchlist.map((item) => item.ticker);
  const livePrices = await fetchLivePrices(tickers);

  return (
    <div className="max-w-4xl mx-auto px-6 pt-16 pb-16">

      {/* Header */}
      <div className="flex items-baseline justify-between mb-2">
        <h1 className="font-sans text-4xl text-[#0E7490] tracking-tight">
          Insider Trading
        </h1>
        <span className="text-xs text-gray-400 font-sans">Analysis: {analysisDate}</span>
      </div>
      <p className="text-sm text-gray-400 mb-2">
        Open-market insider purchases and cluster-sell signals across the semi &amp; semi-cap equipment universe.
        Generated weekly by the Fabuless Equity Research Agent.
      </p>
      <p className="text-xs text-gray-400 mb-2">
        Lookback window: <span className="text-gray-500">{data.lookbackWindow}</span>
      </p>
      <p className="text-xs text-amber-600 mb-10">
        ⚡ Prices shown are live. Thesis text reflects conditions on {analysisDate} — specific price targets may be stale.
      </p>

      {/* Executive Summary */}
      <div className="bg-[#111827] rounded-lg p-5 mb-12 border-l-4 border-amber-500">
        <p className="text-xs font-semibold text-amber-400 uppercase tracking-widest mb-2 font-sans">Executive Summary</p>
        <p className="text-sm text-gray-300 leading-relaxed">{data.executiveSummary}</p>
        <p className="text-[10px] text-gray-500 mt-3">Written {analysisDate}</p>
      </div>

      {/* Top 10 Watchlist */}
      <h2 className="font-sans text-xl font-semibold text-[#0E7490] mb-1 tracking-tight">
        Top 10 Watchlist
      </h2>
      <p className="text-xs text-gray-400 mb-6">Ranked by insider conviction signal strength · Prices live</p>

      <div className="space-y-5 mb-14">
        {data.watchlist.map((item) => {
          const livePrice = livePrices[item.ticker];
          return (
            <div
              key={item.ticker}
              className="border border-gray-200 rounded-lg p-5 hover:border-[#0E7490]/40 transition-colors bg-white"
            >
              <div className="flex items-start justify-between gap-4 mb-3">
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="text-xs text-gray-400 font-sans w-4">{item.rank}.</span>
                  <span className="font-sans font-bold text-lg text-[#18181B] tracking-tight">
                    {item.ticker}
                  </span>
                  <span className="text-sm text-gray-500">{item.company}</span>

                  {/* Live price — prominent */}
                  {livePrice ? (
                    <span className="font-sans font-semibold text-sm text-[#18181B] bg-gray-100 px-2 py-0.5 rounded">
                      {formatPrice(livePrice)} <span className="text-[10px] font-normal text-gray-400">live</span>
                    </span>
                  ) : (
                    <span className="text-sm text-gray-400">{item.price}</span>
                  )}
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Stars count={item.stars} />
                  <ConvictionBadge level={item.conviction} />
                </div>
              </div>

              <p className="text-xs text-[#0E7490] font-semibold mb-1 font-sans uppercase tracking-wider">Insider Signal</p>
              <p className="text-sm text-gray-700 mb-3 leading-relaxed">{item.signal}</p>

              {/* Thesis with staleness disclaimer */}
              <p className="text-xs text-gray-500 font-semibold mb-1 font-sans uppercase tracking-wider">
                Thesis <span className="normal-case tracking-normal font-normal text-gray-400">· as of {analysisDate}</span>
              </p>
              <p className="text-sm text-gray-600 leading-relaxed">{item.thesis}</p>

              <div className="mt-3 flex items-center gap-4 text-xs text-gray-400">
                <span>Last buy: <span className="text-gray-600">{item.lastInsiderBuy}</span></span>
                {item.stillOpen && (
                  <span className="text-emerald-600 font-medium">✓ Signal still open</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Red Flags */}
      <h2 className="font-sans text-xl font-semibold text-red-700 mb-1 tracking-tight">
        Red Flags — Names to Avoid
      </h2>
      <p className="text-xs text-gray-400 mb-6">Cluster selling, full liquidations, and concentrated insider distribution</p>

      <div className="space-y-4 mb-14">
        {data.redFlags.map((flag) => (
          <div
            key={flag.ticker}
            className="border border-red-100 rounded-lg p-5 bg-red-50/40"
          >
            <div className="flex items-center gap-3 mb-3">
              <span className="font-sans font-bold text-lg text-[#18181B] tracking-tight">
                {flag.ticker}
              </span>
              <span className="text-sm text-gray-500">{flag.company}</span>
              <SeverityBadge severity={flag.severity} />
            </div>
            <p className="text-sm text-gray-700 leading-relaxed">{flag.signal}</p>
          </div>
        ))}
      </div>

      {/* Methodology */}
      <div className="border-t border-gray-200 pt-6">
        <p className="text-xs text-gray-400 leading-relaxed">
          <span className="font-semibold text-gray-500">Methodology:</span> Data pulled from Finviz insider trading tables,
          SEC EDGAR Form 4 filings, and StockTitan/Benzinga for individual tickers. Coverage universe: NVDA, AMD, INTC,
          QCOM, AVGO, TXN, MRVL, MU, AMAT, LRCX, KLAC, ONTO, ENTG, MKSI, ACLS, ASML, SNPS, CDNS, ARM, LSCC, ON.
          Open-market purchases weighted higher than option exercises. 10b5-1 sales treated as less directional than
          discretionary sales. Prices shown are live via Yahoo Finance. Thesis text is generated weekly and reflects
          market conditions at the time of analysis — specific price levels may be stale between updates. Not investment advice.
        </p>
      </div>
    </div>
  );
}
