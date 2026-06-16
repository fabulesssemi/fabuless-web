"use client";

import { useState } from "react";
import Link from "next/link";
import { RemoveTicker } from "./PortfolioRowActions";
import { MiniHoldingChart } from "./MiniHoldingChart";
import type { Holding } from "./storage";

export type RowData = {
  ticker: string;
  covered: boolean;
  slug: string | null;
  name: string;
  price: number | null;
  changePercent: number | null;
  dist: { strongBuy: number; buy: number; hold: number; sell: number; strongSell: number } | null;
  openCount: number;
  earningsLabel: string | null;
  earningsSoon: boolean;
  myReturn: number | null;   // % from cost basis (live)
  value: number | null;      // shares × live price
  pnl: number | null;        // value − cost basis ($)
  purchasePrice: number | null;
  purchaseDate: string | null;
};

function ConsensusBar({ dist }: { dist: RowData["dist"] }) {
  if (!dist) return <span className="text-[12px] text-gray-300">—</span>;
  const buy = dist.strongBuy + dist.buy;
  const hold = dist.hold;
  const sell = dist.sell + dist.strongSell;
  const total = buy + hold + sell;
  if (!total) return <span className="text-[12px] text-gray-300">—</span>;
  return (
    <div className="flex h-1 w-20 rounded-full overflow-hidden gap-px">
      {buy > 0 && <div className="bg-emerald-500" style={{ width: `${(buy / total) * 100}%` }} />}
      {hold > 0 && <div className="bg-gray-300" style={{ width: `${(hold / total) * 100}%` }} />}
      {sell > 0 && <div className="bg-rose-400" style={{ width: `${(sell / total) * 100}%` }} />}
    </div>
  );
}

function money(n: number): string {
  const abs = Math.abs(n);
  const s = abs >= 1000 ? `$${(abs / 1000).toFixed(1)}k` : `$${abs.toFixed(0)}`;
  return n < 0 ? `-${s}` : `+${s}`;
}

export function HoldingRow({
  r, color, gridCols, hasReturnData, allHoldings, isFirst, compact,
}: {
  r: RowData;
  color: string;
  gridCols: string;
  hasReturnData: boolean;
  allHoldings: Holding[];
  isFirst: boolean;
  compact?: boolean;
}) {
  const [expanded, setExpanded] = useState(false);

  const up = (r.changePercent ?? 0) > 0;
  const down = (r.changePercent ?? 0) < 0;
  const retUp = r.myReturn !== null && r.myReturn > 0;
  const retDown = r.myReturn !== null && r.myReturn < 0;

  return (
    <div style={{ borderTop: isFirst ? undefined : "1px solid #F1F5F9" }}>
      <div className={`relative grid ${gridCols} items-center gap-3 px-4 py-2 hover:bg-slate-50 transition-colors`}>
        {r.covered && r.slug && (
          <Link href={`/companies/${r.slug}`} className="absolute inset-0 z-0" aria-label={`${r.ticker} company page`} />
        )}

        {/* Expand caret + color dot + holding */}
        <div className="relative z-10 min-w-0 flex items-center gap-2">
          {!compact && (
            <button
              onClick={() => setExpanded((v) => !v)}
              title={expanded ? "Hide chart" : "Show chart"}
              className="shrink-0 w-4 h-4 flex items-center justify-center text-gray-300 hover:text-gray-600 transition-colors"
            >
              <span className={`text-[9px] transition-transform ${expanded ? "rotate-90" : ""}`}>▶</span>
            </button>
          )}
          {/* Company logo with color-tinted bg, falls back to color dot */}
          <div className="shrink-0 w-7 h-7 rounded-lg flex items-center justify-center overflow-hidden" style={{ background: `${color}40` }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`https://assets.parqet.com/logos/symbol/${r.ticker}?format=png`}
              alt={r.ticker}
              width={20}
              height={20}
              className="object-contain"
              onError={(e) => {
                const el = e.currentTarget;
                el.style.display = "none";
                const dot = document.createElement("span");
                dot.style.cssText = `width:8px;height:8px;border-radius:2px;background:${color};display:block`;
                el.parentElement?.appendChild(dot);
              }}
            />
          </div>
          <span className="font-sans text-[14px] font-bold text-gray-900 tabular-nums pointer-events-none">{r.ticker}</span>
          <span className="text-[12px] text-gray-400 truncate pointer-events-none">{r.name}</span>
          {!r.covered && <span className="text-[9px] uppercase tracking-wide text-gray-300 font-semibold pointer-events-none">no coverage</span>}
        </div>

        {/* Price */}
        <div className="relative z-10 pointer-events-none text-right text-[13px] font-semibold text-gray-800 tabular-nums">
          {r.price != null ? `$${r.price.toFixed(2)}` : "—"}
        </div>

        {/* Day % */}
        <div className={`relative z-10 pointer-events-none text-right text-[12px] font-semibold tabular-nums ${up ? "text-emerald-600" : down ? "text-rose-500" : "text-gray-400"}`}>
          {r.changePercent != null ? `${up ? "+" : ""}${r.changePercent.toFixed(1)}%` : "—"}
        </div>

        {/* Consensus / Open calls / Earnings — hidden in compact mode */}
        {!compact && (
          <>
            <div className="relative z-10 pointer-events-none flex justify-end">
              <ConsensusBar dist={r.dist} />
            </div>
            <div className="relative z-10 text-right">
              {r.openCount > 0 ? (
                <Link href={`/tracker?company=${r.ticker}`} className="text-[13px] font-bold text-[#B45309] tabular-nums hover:underline">
                  {r.openCount}
                </Link>
              ) : (
                <span className="text-[12px] text-gray-300 pointer-events-none">—</span>
              )}
            </div>
            <div className="relative z-10 pointer-events-none text-right">
              {r.earningsLabel ? (
                <span className={`text-[12px] font-semibold tabular-nums ${r.earningsSoon ? "text-[#B45309]" : "text-gray-500"}`}>
                  {r.earningsLabel.replace(/^[A-Za-z]{3,}\s+/, "")}
                </span>
              ) : (
                <span className="text-[12px] text-gray-300">—</span>
              )}
            </div>
          </>
        )}

        {/* Your return + Value */}
        {hasReturnData && (
          <>
            <div className={`relative z-10 pointer-events-none text-right tabular-nums ${retUp ? "text-emerald-600" : retDown ? "text-rose-500" : "text-gray-300"}`}>
              {r.myReturn !== null ? (
                <>
                  <div className="text-[13px] font-bold leading-tight">{r.myReturn > 0 ? "+" : ""}{r.myReturn.toFixed(1)}%</div>
                  {r.pnl !== null && <div className="text-[10px] font-semibold leading-tight opacity-80">{money(r.pnl)}</div>}
                </>
              ) : "—"}
            </div>
            <div className="relative z-10 pointer-events-none text-right text-[12px] text-gray-400 tabular-nums">
              {r.value != null ? `$${r.value >= 1000 ? `${(r.value / 1000).toFixed(1)}k` : r.value.toFixed(0)}` : "—"}
            </div>
          </>
        )}

        {/* Remove */}
        <RemoveTicker ticker={r.ticker} allHoldings={allHoldings} />
      </div>

      {/* Expanded per-holding chart */}
      {!compact && expanded && (
        <div className="px-6 pb-5 pt-1 bg-slate-50/40 border-t border-[#F1F5F9]">
          <MiniHoldingChart ticker={r.ticker} purchasePrice={r.purchasePrice} purchaseDate={r.purchaseDate} color={color} />
        </div>
      )}
    </div>
  );
}
