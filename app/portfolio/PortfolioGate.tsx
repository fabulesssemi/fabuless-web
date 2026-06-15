"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const STORAGE_KEY = "fabuless_portfolio_tickers";

export function parseTickers(raw: string): string[] {
  return raw
    .split(/[,\s]+/)
    .map((s) => s.trim().toUpperCase())
    .filter(Boolean)
    .filter((v, i, a) => a.indexOf(v) === i);
}

export function PortfolioGate() {
  const router = useRouter();
  const [value, setValue] = useState("");
  const [checked, setChecked] = useState(false);

  // On mount: if we already have saved tickers, jump straight to the dashboard.
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    const tickers = saved ? parseTickers(saved) : [];
    if (tickers.length > 0) {
      router.replace(`/portfolio?t=${encodeURIComponent(tickers.join(","))}`);
    } else {
      setChecked(true);
    }
  }, [router]);

  function save() {
    const tickers = parseTickers(value);
    if (tickers.length === 0) return;
    const joined = tickers.join(",");
    localStorage.setItem(STORAGE_KEY, joined);
    router.push(`/portfolio?t=${encodeURIComponent(joined)}`);
  }

  // Avoid a flash of the input while we check localStorage / redirect.
  if (!checked) return null;

  return (
    <div className="max-w-xl mx-auto px-6 pt-28 pb-16 text-center">
      <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#B45309] mb-2">
        Your Holdings
      </div>
      <h1 className="font-sans text-2xl font-bold text-[#111827] tracking-tight mb-2">
        Enter the tickers you follow
      </h1>
      <p className="font-serif text-[15px] text-[#4a4a4a] leading-relaxed mb-7">
        Build a personalized view — live prices, analyst consensus, open expert calls, and earnings
        ahead, filtered to your stocks.
      </p>
      <div className="flex items-center gap-2">
        <input
          autoFocus
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && save()}
          placeholder="NVDA, AMD, INTC, TSM"
          className="flex-1 rounded-lg border border-gray-200 px-4 py-2.5 text-[14px] text-[#111827] placeholder:text-gray-300 outline-none focus:border-[#B45309] transition-colors"
        />
        <button
          onClick={save}
          className="shrink-0 rounded-lg bg-[#111827] px-5 py-2.5 text-[13px] font-semibold text-white hover:bg-[#1f2937] transition-colors"
        >
          Save
        </button>
      </div>
      <p className="mt-3 text-[11px] text-gray-400">Comma or space separated. Saved to this browser only.</p>
    </div>
  );
}
