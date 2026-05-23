"use client";

import Link from "next/link";
import { useState } from "react";
import type { ConsensusRow } from "@/lib/analyst/dashboard";

type SortKey =
  | "ticker"
  | "rating"
  | "avgPT"
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
  { key: "upside", label: "Upside", numeric: true },
  { key: "buyShare", label: "Buy %", numeric: true },
  { key: "sentimentScore", label: "Sentiment", numeric: true },
  { key: "upgrades30d", label: "Up 30d", numeric: true },
  { key: "downgrades30d", label: "Down 30d", numeric: true },
  { key: "ptChangePct", label: "PT Δ", numeric: true },
  { key: "estimateScore", label: "Est. Δ", numeric: true },
];

function tone(n: number | null | undefined): string {
  if (n == null) return "text-slate-400";
  return n > 0 ? "text-emerald-400" : n < 0 ? "text-rose-400" : "text-slate-400";
}
function pct(n: number | null, sign = true): string {
  if (n == null) return "—";
  return `${sign && n > 0 ? "+" : ""}${n.toFixed(1)}%`;
}
function money(n: number | null): string {
  if (n == null) return "—";
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
    <div className="overflow-x-auto rounded-2xl border border-white/10 bg-white/[0.02]">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-white/10 text-[11px] uppercase tracking-wider text-slate-500">
            {COLS.map((c) => (
              <th
                key={c.key}
                onClick={() => onSort(c.key)}
                className={`cursor-pointer select-none px-3 py-3 font-semibold hover:text-amber-300 ${
                  c.numeric ? "text-right" : "text-left"
                }`}
              >
                {c.label}
                {sortKey === c.key && (
                  <span className="ml-1 text-amber-400">{asc ? "▲" : "▼"}</span>
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sorted.map((r) => (
            <tr
              key={r.ticker}
              className="border-b border-white/5 last:border-0 hover:bg-white/[0.03]"
            >
              <td className="px-3 py-3">
                <Link href={`/companies/${r.slug}`} className="group">
                  <span className="font-mono text-amber-400 text-xs">{r.ticker}</span>
                  <span className="block text-slate-300 group-hover:text-amber-300 transition-colors text-[13px]">
                    {r.name}
                  </span>
                </Link>
              </td>
              <td className="px-3 py-3 text-slate-300">{r.rating}</td>
              <td className="px-3 py-3 text-right tabular-nums text-slate-200">
                {money(r.avgPT)}
              </td>
              <td className={`px-3 py-3 text-right tabular-nums ${tone(r.upside)}`}>
                {pct(r.upside)}
              </td>
              <td className="px-3 py-3 text-right tabular-nums text-slate-200">
                {r.buyShare != null ? `${r.buyShare.toFixed(0)}%` : "—"}
              </td>
              <td className={`px-3 py-3 text-right tabular-nums ${tone(r.sentimentScore)}`}>
                {r.sentimentScore > 0 ? "+" : ""}
                {r.sentimentScore}
              </td>
              <td className="px-3 py-3 text-right tabular-nums text-emerald-400">
                {r.upgrades30d || "—"}
              </td>
              <td className="px-3 py-3 text-right tabular-nums text-rose-400">
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
