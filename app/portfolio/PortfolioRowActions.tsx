"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { readPortfolio, writePortfolio, encodeHoldings, parseTickersToHoldings, type Holding } from "./storage";

export function RemoveTicker({ ticker, allHoldings }: { ticker: string; allHoldings: Holding[] }) {
  const router = useRouter();
  function remove() {
    const next = allHoldings.filter((h) => h.ticker !== ticker);
    writePortfolio({ holdings: next });
    if (next.length === 0) {
      router.push("/portfolio");
    } else {
      router.push(`/portfolio?h=${encodeHoldings(next)}`);
    }
  }
  return (
    <button
      onClick={remove}
      title={`Remove ${ticker}`}
      className="relative z-10 shrink-0 w-5 h-5 flex items-center justify-center rounded-full text-gray-300 hover:text-rose-400 hover:bg-rose-50 transition-colors text-[13px] leading-none"
    >
      ×
    </button>
  );
}

type PendingAdd = { ticker: string; purchasePrice: string; purchaseDate: string; shares: string };

export function AddTickerRow({ allHoldings }: { allHoldings: Holding[] }) {
  const router = useRouter();
  const [step, setStep] = useState<"idle" | "detail">("idle");
  const [tickerInput, setTickerInput] = useState("");
  const [pending, setPending] = useState<PendingAdd[]>([]);

  function startAdd() {
    const tickers = parseTickersToHoldings(tickerInput).filter(
      (t) => !allHoldings.some((h) => h.ticker === t)
    );
    if (tickers.length === 0) return;
    setPending(tickers.map((t) => ({ ticker: t, purchasePrice: "", purchaseDate: "", shares: "" })));
    setTickerInput("");
    setStep("detail");
  }

  function save() {
    const newHoldings: Holding[] = pending.map((p) => ({
      ticker: p.ticker,
      purchasePrice: p.purchasePrice ? parseFloat(p.purchasePrice) : null,
      purchaseDate: p.purchaseDate || null,
      shares: p.shares ? parseFloat(p.shares) : null,
    }));
    const next = [...allHoldings, ...newHoldings];
    writePortfolio({ holdings: next });
    setStep("idle");
    setPending([]);
    router.push(`/portfolio?h=${encodeHoldings(next)}`);
  }

  function cancel() {
    setStep("idle");
    setPending([]);
    setTickerInput("");
  }

  if (step === "detail") {
    return (
      <div className="border-t border-[#F1F5F9] px-4 py-3 bg-gray-50/40">
        <p className="text-[11px] text-gray-400 mb-2.5">
          Optional — add purchase details to track your return vs. the S&P 500.
        </p>
        {pending.map((p, i) => (
          <div key={p.ticker} className="flex items-center gap-3 flex-wrap mb-2">
            <span className="font-sans text-[13px] font-bold text-gray-900 w-12 shrink-0">{p.ticker}</span>
            <input
              type="number" min="0" step="0.01"
              value={p.purchasePrice}
              onChange={(e) => setPending((prev) => prev.map((x, j) => j === i ? { ...x, purchasePrice: e.target.value } : x))}
              placeholder="Buy price"
              autoFocus={i === 0}
              className="w-24 rounded border border-gray-200 px-2 py-1 text-[12px] text-[#111827] placeholder:text-gray-300 outline-none focus:border-[#B45309]"
            />
            <input
              type="date"
              value={p.purchaseDate}
              onChange={(e) => setPending((prev) => prev.map((x, j) => j === i ? { ...x, purchaseDate: e.target.value } : x))}
              className="rounded border border-gray-200 px-2 py-1 text-[12px] text-[#111827] outline-none focus:border-[#B45309]"
            />
            <input
              type="number" min="0" step="any"
              value={p.shares}
              onChange={(e) => setPending((prev) => prev.map((x, j) => j === i ? { ...x, shares: e.target.value } : x))}
              placeholder="Shares"
              className="w-20 rounded border border-gray-200 px-2 py-1 text-[12px] text-[#111827] placeholder:text-gray-300 outline-none focus:border-[#B45309]"
            />
          </div>
        ))}
        <div className="flex gap-2 mt-2">
          <button onClick={save} className="text-[11px] font-semibold text-white bg-[#111827] rounded px-3 py-1.5 hover:bg-[#1f2937] transition-colors">
            Add
          </button>
          <button onClick={cancel} className="text-[11px] font-semibold text-gray-400 hover:text-gray-600 px-2 transition-colors">
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 px-4 py-2.5 border-t border-[#F1F5F9]">
      <span className="text-[15px] text-gray-400 leading-none select-none font-bold">+</span>
      <input
        value={tickerInput}
        onChange={(e) => setTickerInput(e.target.value.toUpperCase())}
        onKeyDown={(e) => e.key === "Enter" && startAdd()}
        placeholder="Add a company — type a ticker (NVDA, AMD…)"
        className="flex-1 text-[13px] font-semibold text-[#111827] placeholder:text-[#111827] placeholder:font-semibold outline-none bg-transparent"
      />
      {tickerInput && (
        <button
          onClick={startAdd}
          className="shrink-0 rounded-lg bg-[#B45309] px-3 py-1.5 text-[11px] font-bold text-white hover:bg-amber-700 transition-colors"
        >
          Add →
        </button>
      )}
    </div>
  );
}
