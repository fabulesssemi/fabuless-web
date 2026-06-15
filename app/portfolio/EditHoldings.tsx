"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { parseTickers } from "./PortfolioGate";

const STORAGE_KEY = "fabuless_portfolio_tickers";

export function EditHoldings({ tickers }: { tickers: string[] }) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(tickers.join(", "));

  // Keep localStorage in sync with whatever is in the URL (?t=...), so a bare
  // visit to /portfolio later restores the same holdings.
  useEffect(() => {
    if (tickers.length > 0) {
      localStorage.setItem(STORAGE_KEY, tickers.join(","));
    }
  }, [tickers]);

  function save() {
    const next = parseTickers(value);
    if (next.length === 0) {
      // Clearing holdings → wipe storage and return to the empty state.
      localStorage.removeItem(STORAGE_KEY);
      router.push("/portfolio");
      return;
    }
    const joined = next.join(",");
    localStorage.setItem(STORAGE_KEY, joined);
    setEditing(false);
    router.push(`/portfolio?t=${encodeURIComponent(joined)}`);
  }

  if (!editing) {
    return (
      <button
        onClick={() => {
          setValue(tickers.join(", "));
          setEditing(true);
        }}
        className="shrink-0 mt-1 text-[12px] font-semibold text-gray-500 hover:text-[#B45309] transition-colors"
      >
        Edit holdings
      </button>
    );
  }

  return (
    <div className="shrink-0 flex items-center gap-2">
      <input
        autoFocus
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") save();
          if (e.key === "Escape") setEditing(false);
        }}
        placeholder="NVDA, AMD, INTC"
        className="w-64 rounded-lg border border-gray-200 px-3 py-1.5 text-[13px] text-[#111827] placeholder:text-gray-300 outline-none focus:border-[#B45309] transition-colors"
      />
      <button
        onClick={save}
        className="rounded-lg bg-[#111827] px-3.5 py-1.5 text-[12px] font-semibold text-white hover:bg-[#1f2937] transition-colors"
      >
        Save
      </button>
      <button
        onClick={() => setEditing(false)}
        className="text-[12px] font-semibold text-gray-400 hover:text-gray-600 transition-colors"
      >
        Cancel
      </button>
    </div>
  );
}
