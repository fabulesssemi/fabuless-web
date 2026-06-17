"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { encodeHoldings, parseTickersToHoldings, type Holding } from "./storage";
import { usePortfolioSync } from "./usePortfolioSync";

type PendingHolding = { ticker: string; purchasePrice: string; purchaseDate: string; shares: string };

function blankPending(ticker: string): PendingHolding {
  return { ticker, purchasePrice: "", purchaseDate: "", shares: "" };
}

export function PortfolioGate() {
  const router = useRouter();
  const { load, save } = usePortfolioSync();
  const [checked, setChecked] = useState(false);
  const [tickerInput, setTickerInput] = useState("");
  const [pending, setPending] = useState<PendingHolding[]>([]);

  useEffect(() => {
    load().then((holdings) => {
      if (holdings.length > 0) {
        router.replace(`/portfolio?h=${encodeHoldings(holdings)}`);
      } else {
        setChecked(true);
      }
    });
  }, [router]); // eslint-disable-line react-hooks/exhaustive-deps

  function addTickers() {
    const tickers = parseTickersToHoldings(tickerInput).filter(
      (t) => !pending.some((p) => p.ticker === t)
    );
    if (tickers.length === 0) return;
    setPending((prev) => [...prev, ...tickers.map(blankPending)]);
    setTickerInput("");
  }

  function handleSave() {
    if (pending.length === 0) return;
    const holdings: Holding[] = pending.map((p) => ({
      ticker: p.ticker,
      purchasePrice: p.purchasePrice ? parseFloat(p.purchasePrice) : null,
      purchaseDate: p.purchaseDate || null,
      shares: p.shares ? parseFloat(p.shares) : null,
    }));
    save(holdings);
    router.push(`/portfolio?h=${encodeHoldings(holdings)}`);
  }

  if (!checked) return null;

  return (
    <div className="max-w-xl mx-auto px-6 pt-28 pb-16">
      <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#B45309] mb-2">
        Your Holdings
      </div>
      <h1 className="font-sans text-2xl font-bold text-[#111827] tracking-tight mb-2">
        Enter the tickers you follow
      </h1>
      <p className="font-serif text-[15px] text-[#4a4a4a] leading-relaxed mb-7">
        Build a personalized view — live prices, analyst consensus, expert calls, and earnings filtered to your stocks.
        Add purchase details to track your return vs. the S&P 500.
      </p>

      {/* Ticker entry */}
      <div className="flex items-center gap-2 mb-5">
        <input
          autoFocus={pending.length === 0}
          value={tickerInput}
          onChange={(e) => setTickerInput(e.target.value.toUpperCase())}
          onKeyDown={(e) => e.key === "Enter" && addTickers()}
          placeholder="NVDA, AMD, INTC, TSM"
          className="flex-1 rounded-lg border border-gray-200 px-4 py-2.5 text-[14px] text-[#111827] placeholder:text-gray-300 outline-none focus:border-[#B45309] transition-colors"
        />
        <button
          onClick={addTickers}
          className="shrink-0 rounded-lg border border-gray-200 px-4 py-2.5 text-[13px] font-semibold text-gray-600 hover:border-gray-400 transition-colors"
        >
          Add
        </button>
      </div>

      {/* Pending holdings — inline detail form */}
      {pending.length > 0 && (
        <div className="mb-2">
          <p className="text-[12px] font-semibold text-gray-600 mb-2">
            Add purchase details <span className="font-normal text-gray-400">(optional — enables return tracking vs. S&P 500)</span>
          </p>
        </div>
      )}
      {pending.length > 0 && (
        <div className="rounded-xl border border-gray-100 bg-white shadow-sm overflow-hidden mb-5">
          {pending.map((p, i) => (
            <div
              key={p.ticker}
              className="px-4 py-3 flex items-center gap-3 flex-wrap"
              style={{ borderTop: i > 0 ? "1px solid #F1F5F9" : undefined }}
            >
              <span className="font-sans text-[13px] font-bold text-gray-900 w-14 shrink-0">{p.ticker}</span>
              <input
                type="number"
                min="0"
                step="0.01"
                value={p.purchasePrice}
                onChange={(e) => setPending((prev) => prev.map((x) => x.ticker === p.ticker ? { ...x, purchasePrice: e.target.value } : x))}
                placeholder="$0.00"
                className="w-24 rounded border border-gray-200 px-2 py-1 text-[12px] text-[#111827] placeholder:text-gray-300 outline-none focus:border-[#B45309] transition-colors"
              />
              <input
                type="date"
                value={p.purchaseDate}
                onChange={(e) => setPending((prev) => prev.map((x) => x.ticker === p.ticker ? { ...x, purchaseDate: e.target.value } : x))}
                className="rounded border border-gray-200 px-2 py-1 text-[12px] text-[#111827] outline-none focus:border-[#B45309] transition-colors"
              />
              <input
                type="number"
                min="0"
                step="any"
                value={p.shares}
                onChange={(e) => setPending((prev) => prev.map((x) => x.ticker === p.ticker ? { ...x, shares: e.target.value } : x))}
                placeholder="shares"
                className="w-20 rounded border border-gray-200 px-2 py-1 text-[12px] text-[#111827] placeholder:text-gray-300 outline-none focus:border-[#B45309] transition-colors"
              />
              <button
                onClick={() => setPending((prev) => prev.filter((x) => x.ticker !== p.ticker))}
                className="ml-auto text-gray-300 hover:text-rose-400 transition-colors text-[14px]"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      {pending.length > 0 && (
        <button
          onClick={handleSave}
          className="w-full rounded-lg bg-[#111827] px-5 py-2.5 text-[13px] font-semibold text-white hover:bg-[#1f2937] transition-colors"
        >
          Save portfolio
        </button>
      )}
      <p className="mt-3 text-[11px] text-gray-400">Purchase details are optional. Sign in to sync across devices.</p>
    </div>
  );
}
