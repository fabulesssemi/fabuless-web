"use client";

import { useState } from "react";
import Link from "next/link";

// Industry category mapping — slug → category key
export const SLUG_CATEGORY: Record<string, string> = {
  // Chip Designers
  nvda: "designers",
  amd: "designers",
  avgo: "designers",
  mrvl: "designers",
  arm: "designers",
  qcom: "designers",
  astera: "designers",

  // Foundry & Memory
  tsm: "foundry",
  intc: "foundry",
  globalfoundries: "foundry",
  mu: "foundry",
  skhynix: "foundry",
  samsung: "foundry",

  // Equipment & Materials
  asml: "equipment",
  amat: "equipment",
  lrcx: "equipment",
  klac: "equipment",
  "tokyo-electron": "equipment",
  besi: "equipment",
  "shin-etsu": "equipment",
  sumco: "equipment",

  // Packaging & Test
  ase: "packaging",
  amkor: "packaging",

  // EDA & IP
  synopsys: "eda",
  cadence: "eda",

  // Infrastructure (servers, networking, optics, hyperscalers)
  supermicro: "infra",
  dell: "infra",
  foxconn: "infra",
  arista: "infra",
  coherent: "infra",
  lumentum: "infra",
  fabrinet: "infra",
  apple: "infra",
  google: "infra",
  amazon: "infra",
  microsoft: "infra",
  meta: "infra",
  oracle: "infra",
  coreweave: "infra",
};

const CATEGORIES = [
  { key: "all",        label: "All" },
  { key: "designers",  label: "Chip Design" },
  { key: "foundry",    label: "Foundry & Memory" },
  { key: "equipment",  label: "Equipment" },
  { key: "packaging",  label: "Packaging" },
  { key: "eda",        label: "EDA" },
  { key: "infra",      label: "Infrastructure" },
];

type CardData = {
  slug: string;
  ticker: string;
  name: string;
  sector: string;
  accent: string;
  displayTicker: string;
  price: string | null;
  changePercent: string | null;
  marketCap: string | null;
  hasDeepDive: boolean;
  logoUrl: string;
};

export function CompaniesFilter({ cards }: { cards: CardData[] }) {
  const [active, setActive] = useState("all");

  const filtered = active === "all"
    ? cards
    : cards.filter((c) => (SLUG_CATEGORY[c.slug] ?? "infra") === active);

  return (
    <div>
      {/* Category tabs */}
      <div className="flex items-center gap-1.5 flex-wrap mb-8">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.key}
            onClick={() => setActive(cat.key)}
            className={`px-3.5 py-1.5 rounded-full text-[12px] font-bold transition-all duration-150 select-none ${
              active === cat.key
                ? "bg-[#111827] text-white border border-[#111827]"
                : "bg-transparent border border-gray-200 text-gray-500 hover:border-gray-400 hover:text-gray-700"
            }`}
          >
            {cat.label}
            {active === cat.key && cat.key !== "all" && (
              <span className="ml-1.5 text-[10px] font-semibold opacity-60 tabular-nums">
                {filtered.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Cards grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((c) => (
          <Link
            key={c.slug}
            href={`/companies/${c.slug}`}
            className="group relative overflow-hidden rounded-2xl border border-gray-100 bg-white p-5 shadow-sm hover:shadow-md transition-all duration-200"
            style={{ borderTopColor: c.accent, borderTopWidth: "2px" }}
          >
            <div
              className="pointer-events-none absolute inset-0"
              style={{ background: `${c.accent}07` }}
            />

            <div className="relative flex items-start justify-between gap-3">
              <div className="flex items-start gap-3 min-w-0">
                <div
                  className="shrink-0 w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: `${c.accent}18` }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={c.logoUrl} alt={c.name} width={26} height={26} className="object-contain" />
                </div>
                <div className="min-w-0 pt-0.5">
                  <div className="font-mono text-[10px] font-semibold tracking-widest" style={{ color: c.accent }}>
                    {c.displayTicker}
                  </div>
                  <div className="font-sans text-[1.05rem] font-bold text-gray-900 leading-tight tracking-tight group-hover:text-[#B45309] transition-colors">
                    {c.name}
                  </div>
                </div>
              </div>

              {c.price && (
                <div className="text-right shrink-0 pt-0.5">
                  <div className="text-sm font-bold text-gray-900 tabular-nums leading-tight">{c.price}</div>
                  {c.changePercent && (
                    <div className="text-xs font-semibold tabular-nums text-gray-900">{c.changePercent}</div>
                  )}
                </div>
              )}
            </div>

            <p className="relative mt-3 text-[12px] text-gray-500 leading-snug tracking-wide">{c.sector}</p>

            <div className="relative mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
              <span className="text-[11px] font-medium text-gray-400 tabular-nums">{c.marketCap ?? ""}</span>
              {c.hasDeepDive ? (
                <span
                  className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full"
                  style={{ color: c.accent, background: `${c.accent}18` }}
                >
                  Deep-dive
                </span>
              ) : (
                <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full text-gray-400 bg-gray-100">
                  Live data
                </span>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
