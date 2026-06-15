"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { parseTickers } from "./PortfolioGate";

const STORAGE_KEY = "fabuless_portfolio_tickers";

function updateTickers(next: string[]) {
  if (next.length === 0) {
    localStorage.removeItem(STORAGE_KEY);
    return "";
  }
  const joined = next.join(",");
  localStorage.setItem(STORAGE_KEY, joined);
  return joined;
}

export function RemoveTicker({ ticker, allTickers }: { ticker: string; allTickers: string[] }) {
  const router = useRouter();
  function remove() {
    const next = allTickers.filter((t) => t !== ticker);
    const joined = updateTickers(next);
    if (joined) {
      router.push(`/portfolio?t=${encodeURIComponent(joined)}`);
    } else {
      router.push("/portfolio");
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

export function AddTickerRow({ allTickers }: { allTickers: string[] }) {
  const router = useRouter();
  const [value, setValue] = useState("");

  function add() {
    const toAdd = parseTickers(value).filter((t) => !allTickers.includes(t));
    if (toAdd.length === 0) { setValue(""); return; }
    const next = [...allTickers, ...toAdd];
    const joined = updateTickers(next);
    setValue("");
    router.push(`/portfolio?t=${encodeURIComponent(joined)}`);
  }

  return (
    <div className="flex items-center gap-2 px-4 py-2.5 border-t border-[#F1F5F9]">
      <input
        value={value}
        onChange={(e) => setValue(e.target.value.toUpperCase())}
        onKeyDown={(e) => e.key === "Enter" && add()}
        placeholder="Add ticker…"
        className="flex-1 text-[13px] text-[#111827] placeholder:text-gray-300 outline-none bg-transparent"
      />
      {value && (
        <button
          onClick={add}
          className="shrink-0 text-[11px] font-semibold text-[#B45309] hover:underline"
        >
          Add
        </button>
      )}
    </div>
  );
}
