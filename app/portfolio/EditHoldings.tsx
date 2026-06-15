"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { readPortfolio, writePortfolio, encodeHoldings, type Holding } from "./storage";

type PendingHolding = { ticker: string; purchasePrice: string; purchaseDate: string; shares: string };

function holdingToPending(h: Holding): PendingHolding {
  return {
    ticker: h.ticker,
    purchasePrice: h.purchasePrice != null ? String(h.purchasePrice) : "",
    purchaseDate: h.purchaseDate ?? "",
    shares: h.shares != null ? String(h.shares) : "",
  };
}

export function EditHoldings({ holdings }: { holdings: Holding[] }) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [pending, setPending] = useState<PendingHolding[]>([]);

  useEffect(() => {
    if (holdings.length > 0) {
      writePortfolio({ holdings });
    }
  }, [holdings]);

  function openEdit() {
    setPending(holdings.map(holdingToPending));
    setEditing(true);
  }

  function save() {
    const next: Holding[] = pending
      .filter((p) => p.ticker.trim())
      .map((p) => ({
        ticker: p.ticker.toUpperCase().trim(),
        purchasePrice: p.purchasePrice ? parseFloat(p.purchasePrice) : null,
        purchaseDate: p.purchaseDate || null,
        shares: p.shares ? parseFloat(p.shares) : null,
      }));
    if (next.length === 0) {
      writePortfolio({ holdings: [] });
      router.push("/portfolio");
      return;
    }
    writePortfolio({ holdings: next });
    setEditing(false);
    router.push(`/portfolio?h=${encodeHoldings(next)}`);
  }

  if (!editing) {
    return (
      <button
        onClick={openEdit}
        className="w-full flex items-center justify-center gap-1.5 px-3 py-2 bg-[#111827] hover:bg-[#1f2937] text-white text-[11px] font-bold uppercase tracking-wide rounded-lg transition-colors"
      >
        <span>✎</span> Edit holdings
      </button>
    );
  }

  return (
    <div className="w-full mt-4">
      <div className="rounded-xl border border-gray-100 bg-white shadow-sm overflow-hidden mb-3">
        {/* Column labels */}
        <div className="grid grid-cols-[80px_100px_140px_80px_24px] gap-3 px-4 py-2 bg-gray-50/60 border-b border-[#F1F5F9]">
          {["Ticker", "Buy price", "Buy date", "Shares", ""].map((h, i) => (
            <span key={i} className="text-[9px] font-bold uppercase tracking-widest text-gray-400">{h}</span>
          ))}
        </div>
        {pending.map((p, i) => (
          <div
            key={p.ticker}
            className="grid grid-cols-[80px_100px_140px_80px_24px] gap-3 items-center px-4 py-2.5"
            style={{ borderTop: i > 0 ? "1px solid #F1F5F9" : undefined }}
          >
            <span className="font-bold text-[13px] text-gray-900">{p.ticker}</span>
            <input
              type="number" min="0" step="0.01"
              value={p.purchasePrice}
              onChange={(e) => setPending((prev) => prev.map((x, j) => j === i ? { ...x, purchasePrice: e.target.value } : x))}
              placeholder="$0.00"
              className="rounded border border-gray-200 px-2 py-1 text-[12px] text-[#111827] placeholder:text-gray-300 outline-none focus:border-[#B45309] w-full"
            />
            <input
              type="date"
              value={p.purchaseDate}
              onChange={(e) => setPending((prev) => prev.map((x, j) => j === i ? { ...x, purchaseDate: e.target.value } : x))}
              className="rounded border border-gray-200 px-2 py-1 text-[12px] text-[#111827] outline-none focus:border-[#B45309] w-full"
            />
            <input
              type="number" min="0" step="any"
              value={p.shares}
              onChange={(e) => setPending((prev) => prev.map((x, j) => j === i ? { ...x, shares: e.target.value } : x))}
              placeholder="0"
              className="rounded border border-gray-200 px-2 py-1 text-[12px] text-[#111827] placeholder:text-gray-300 outline-none focus:border-[#B45309] w-full"
            />
            <button
              onClick={() => setPending((prev) => prev.filter((_, j) => j !== i))}
              className="text-gray-300 hover:text-rose-400 transition-colors text-[14px] text-center"
            >
              ×
            </button>
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <button onClick={save} className="rounded-lg bg-[#111827] px-4 py-2 text-[12px] font-semibold text-white hover:bg-[#1f2937] transition-colors">
          Save
        </button>
        <button onClick={() => setEditing(false)} className="text-[12px] font-semibold text-gray-400 hover:text-gray-600 px-2 transition-colors">
          Cancel
        </button>
      </div>
    </div>
  );
}
