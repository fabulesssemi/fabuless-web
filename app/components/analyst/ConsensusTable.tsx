"use client";

import Link from "next/link";
import { useState } from "react";
import type { ConsensusRow } from "@/lib/analyst/dashboard";
import { displayTicker } from "@/app/components/company/primitives";

type SortKey =
  | "ticker"
  | "rating"
  | "avgPT"
  | "numberOfAnalysts"
  | "upside"
  | "buyShare"
  | "sentimentScore"
  | "upgrades30d"
  | "downgrades30d"
  | "ptChangePct"
  | "estimateScore";

const COLS: { key: SortKey; label: string; numeric: boolean }[] = [
  { key: "ticker", label: "Company", numeric: false },
  { key: "rating", label: "Rating", numeric: false },
  { key: "avgPT", label: "Avg PT", numeric: true },
  { key: "numberOfAnalysts", label: "# Analysts", numeric: true },
  { key: "upside", label: "Upside", numeric: true },
  { key: "buyShare", label: "Buy %", numeric: true },
  { key: "sentimentScore", label: "Sentiment", numeric: true },
  { key: "upgrades30d", label: "Up 30d", numeric: true },
  { key: "downgrades30d", label: "Down 30d", numeric: true },
  { key: "ptChangePct", label: "PT Δ", numeric: true },
  { key: "estimateScore", label: "Est. Δ", numeric: true },
];

function tone(n: number | null | undefined): string {
  if (n == null) return "text-gray-400";
  return n > 0 ? "text-emerald-600" : n < 0 ? "text-rose-600" : "text-gray-400";
}
function pct(n: number | null, sign = true): string {
  if (n == null) return "—";
  return `${sign && n > 0 ? "+" : ""}${n.toFixed(1)}%`;
}
function money(n: number | null, ticker: string): string {
  if (n == null) return "—";
  if (ticker.endsWith(".KS")) return `₩${Math.round(n).toLocaleString()}`;
  return `$${n.toFixed(0)}`;
}

export function ConsensusTable({ rows }: { rows: ConsensusRow[] }) {
  const [sortKey, setSortKey] = useState<SortKey>("sentimentScore");
  const [asc, setAsc] = useState(false);

  const sorted = [...rows].sort((a, b) => {
    const av = a[sortKey];
    const bv = b[sortKey];
    if (typeof av === "string" && typeof bv === "string") {
      return asc ? av.localeCompare(bv) : bv.localeCompare(av);
    }
    const an = (av as number | null) ?? -Infinity;
    const bn = (bv as number | null) ?? -Infinity;
    return asc ? an - bn : bn - an;
  });

  function onSort(key: SortKey) {
    if (key === sortKey) setAsc((x) => !x);
    else {
      setSortKey(key);
      setAsc(false);
    }
  }

  return (
    <div className="overflow-x-auto border border-gray-100 -mx-4 sm:mx-0">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-200 text-[11px] uppercase tracking-wider text-gray-400 bg-gray-50">
            {COLS.map((c) => (
              <th
                key={c.key}
                onClick={() => onSort(c.key)}
                className={`cursor-pointer select-none px-3 py-2.5 font-semibold hover:text-gray-700 transition-colors ${
                  c.numeric ? "text-right" : "text-left"
                }`}
              >
                {c.label}
                {sortKey === c.key && (
                  <span className="ml-1 text-gray-500">{asc ? "▲" : "▼"}</span>
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sorted.map((r) => (
            <tr
              key={r.ticker}
              className="border-b border-gray-100 last:border-0 hover:bg-gray-50"
            >
              <td className="px-3 py-2.5">
                <Link href={`/companies/${r.slug}`} className="group">
                  <span className="font-mono text-gray-400 text-[10px]">
                    {displayTicker(r.ticker)}
                  </span>
                  <span className="block text-gray-800 group-hover:text-gray-900 transition-colors text-[13px] font-medium">
                    {r.name}
                  </span>
                </Link>
              </td>
              <td className="px-3 py-2.5 text-gray-700">{r.rating}</td>
              <td className="px-3 py-2.5 text-right tabular-nums text-gray-800">
                {money(r.avgPT, r.ticker)}
              </td>
              <td className="px-3 py-2.5 text-right tabular-nums text-gray-400 text-[12px]">
                {r.numberOfAnalysts != null ? r.numberOfAnalysts : "—"}
              </td>
              <td className={`px-3 py-3 text-right tabular-nums ${tone(r.upside)}`}>
                {pct(r.upside)}
              </td>
              <td className="px-3 py-2.5 text-right tabular-nums text-gray-800">
                {r.buyShare != null ? `${r.buyShare.toFixed(0)}%` : "—"}
              </td>
              <td className={`px-3 py-3 text-right tabular-nums ${tone(r.sentimentScore)}`}>
                {r.sentimentScore > 0 ? "+" : ""}
                {r.sentimentScore}
              </td>
              <td className="px-3 py-2.5 text-right tabular-nums text-emerald-600">
                {r.upgrades30d || "—"}
              </td>
              <td className="px-3 py-2.5 text-right tabular-nums text-rose-600">
                {r.downgrades30d || "—"}
              </td>
              <td className={`px-3 py-3 text-right tabular-nums ${tone(r.ptChangePct)}`}>
                {r.ptChangePct == null ? "—" : pct(r.ptChangePct)}
              </td>
              <td className={`px-3 py-3 text-right tabular-nums ${tone(r.estimateScore)}`}>
                {r.estimateScore === 0 ? "—" : pct(r.estimateScore)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
