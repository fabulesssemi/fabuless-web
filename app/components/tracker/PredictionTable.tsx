"use client";

import { useMemo, useState } from "react";
import type { ExpertId, Prediction, PredictionStatus } from "@/lib/tracker/predictions";

const STATUS_META: Record<PredictionStatus, { label: string; bg: string; text: string; dot: string }> = {
  CORRECT:   { label: "Correct",  bg: "bg-emerald-500", text: "text-white",      dot: "#10b981" },
  PARTIAL:   { label: "Partial",  bg: "bg-amber-400",   text: "text-white",      dot: "#f59e0b" },
  WRONG:     { label: "Wrong",    bg: "bg-rose-500",    text: "text-white",      dot: "#f43f5e" },
  TOO_EARLY: { label: "Open",     bg: "bg-gray-100",    text: "text-gray-500",   dot: "#d1d5db" },
};

const EXPERT_LABELS: Record<ExpertId, string> = {
  dylan:   "Dylan Patel / SemiAnalysis",
  circuit: "The Circuit",
  baker:   "Gavin Baker",
  doug:    "Doug O'Laughlin",
  stacy:   "Stacy Rasgon",
};

const TOP_COMPANIES = ["NVDA", "AMD", "INTC", "TSMC", "MU", "AVGO", "ASML", "ARM", "ANTHROPIC", "OPENAI"];

type ExpertFilter = "all" | ExpertId;
type StatusFilter = "all" | "resolved" | "open";
type SortKey = "date" | "status";

function prettySource(source: string): string {
  const ep = source.match(/^circuit-ep(\d+)-(.*)$/);
  if (ep) {
    const words = ep[2].replace(/-/g, " ");
    return `The Circuit ep. ${ep[1]} — ${words}`;
  }
  return source;
}

function HorizonBadge({ horizon }: { horizon: string }) {
  const now = new Date().getFullYear();
  const match = horizon.match(/(\d{4})/);
  const year = match ? parseInt(match[1]) : null;
  const isPast = year !== null && year < now;
  const isCurrent = year === now;
  return (
    <span className={`inline-block text-[10px] font-semibold px-2 py-0.5 rounded tabular-nums ${
      isPast ? "bg-gray-100 text-gray-400" :
      isCurrent ? "bg-blue-50 text-blue-600 border border-blue-100" :
      "bg-gray-50 text-gray-500"
    }`}>
      {horizon}
    </span>
  );
}

export function PredictionTable({ rows, hideExpertFilter = false }: { rows: Prediction[]; hideExpertFilter?: boolean }) {
  const [expert, setExpert]   = useState<ExpertFilter>("all");
  const [status, setStatus]   = useState<StatusFilter>("all");
  const [company, setCompany] = useState<string>("all");
  const [sortKey, setSortKey] = useState<SortKey>("status");
  const [asc, setAsc]         = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const statusOrder: Record<PredictionStatus, number> = {
      CORRECT: 0, PARTIAL: 1, WRONG: 2, TOO_EARLY: 3,
    };
    return rows
      .filter((p) => expert === "all" || p.expert === expert)
      .filter((p) => {
        if (status === "resolved") return p.status !== "TOO_EARLY";
        if (status === "open")     return p.status === "TOO_EARLY";
        return true;
      })
      .filter((p) => company === "all" || (p.companies ?? []).includes(company))
      .sort((a, b) => {
        const cmp =
          sortKey === "date"
            ? a.date.localeCompare(b.date)
            : statusOrder[a.status] - statusOrder[b.status];
        return asc ? cmp : -cmp;
      });
  }, [rows, expert, status, company, sortKey, asc]);

  function onSort(key: SortKey) {
    if (key === sortKey) setAsc((x) => !x);
    else { setSortKey(key); setAsc(key === "status"); }
  }

  const filterBtn = (active: boolean) =>
    `px-3 py-1.5 text-[11px] font-bold uppercase tracking-widest rounded-full border transition-colors ${
      active
        ? "bg-[#111827] text-white border-[#111827]"
        : "bg-white text-gray-400 border-gray-200 hover:border-gray-400 hover:text-gray-600"
    }`;

  const companyBtn = (ticker: string) =>
    `px-2.5 py-1 text-[10px] font-bold rounded border transition-colors ${
      company === ticker
        ? "bg-[#B45309] text-white border-[#B45309]"
        : "bg-white text-gray-500 border-gray-200 hover:border-gray-400"
    }`;

  return (
    <div>
      {/* Divider + section label */}
      <div className="flex items-center gap-3 mb-5">
        <div className="h-px flex-1 bg-gray-200" />
        <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Prediction Feed</span>
        <div className="h-px flex-1 bg-gray-200" />
      </div>

      {/* Expert filter */}
      <div className="flex flex-wrap items-center gap-2 mb-3">
        {!hideExpertFilter && (
          <>
            <div className="flex flex-wrap gap-1.5">
              {(["all", "dylan", "circuit", "baker", "doug", "stacy"] as const).map((e) => (
                <button key={e} onClick={() => setExpert(e)} className={filterBtn(expert === e)}>
                  {e === "all" ? "All experts" : EXPERT_LABELS[e]}
                </button>
              ))}
            </div>
            <span className="hidden sm:block text-gray-200 mx-1">|</span>
          </>
        )}
        <div className="flex gap-1.5">
          {([["all", "All"], ["resolved", "Resolved"], ["open", "Open"]] as const).map(([s, label]) => (
            <button key={s} onClick={() => setStatus(s)} className={filterBtn(status === s)}>
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Company filter */}
      <div className="flex flex-wrap items-center gap-1.5 mb-5">
        <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mr-1">Company:</span>
        <button onClick={() => setCompany("all")} className={companyBtn("all")}>All</button>
        {TOP_COMPANIES.map((t) => (
          <button key={t} onClick={() => setCompany(t)} className={companyBtn(t)}>{t}</button>
        ))}
        <span className="ml-auto text-[11px] text-gray-400 tabular-nums">
          {filtered.length} prediction{filtered.length === 1 ? "" : "s"}
        </span>
      </div>

      {/* Sort bar */}
      <div className="flex items-center gap-4 px-4 mb-2">
        <button
          onClick={() => onSort("date")}
          className={`text-[10px] font-bold uppercase tracking-widest ${sortKey === "date" ? "text-[#111827]" : "text-gray-400 hover:text-gray-600"}`}
        >
          Date {sortKey === "date" ? (asc ? "↑" : "↓") : ""}
        </button>
        <button
          onClick={() => onSort("status")}
          className={`text-[10px] font-bold uppercase tracking-widest ${sortKey === "status" ? "text-[#111827]" : "text-gray-400 hover:text-gray-600"}`}
        >
          Verdict {sortKey === "status" ? (asc ? "↑" : "↓") : ""}
        </button>
        <span className="ml-auto text-[10px] text-gray-400 uppercase tracking-widest">Click any row to expand</span>
      </div>

      {/* Cards */}
      <div className="flex flex-col gap-1.5">
        {filtered.map((p) => (
          <PredictionCard
            key={p.id}
            p={p}
            isOpen={expanded === p.id}
            onToggle={() => setExpanded(expanded === p.id ? null : p.id)}
          />
        ))}
      </div>
    </div>
  );
}

function PredictionCard({ p, isOpen, onToggle }: { p: Prediction; isOpen: boolean; onToggle: () => void }) {
  const meta = STATUS_META[p.status];
  const isOpen_ = p.status === "TOO_EARLY";

  return (
    <div
      onClick={onToggle}
      className={`group cursor-pointer rounded-xl border transition-all duration-150 ${
        isOpen
          ? "border-gray-300 bg-gray-50 shadow-sm"
          : "border-gray-100 bg-white hover:border-gray-200 hover:shadow-sm"
      }`}
    >
      <div className="flex items-start gap-4 px-4 py-3.5">
        {/* Status dot */}
        <div className="shrink-0 mt-1.5 w-2 h-2 rounded-full" style={{ backgroundColor: meta.dot }} />

        {/* Main content */}
        <div className="flex-1 min-w-0">
          {/* Meta row */}
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <span className="text-[10px] font-semibold text-gray-400 tabular-nums">{p.date.slice(0, 7)}</span>
            <span className="text-gray-200 text-[10px]">·</span>
            <span className="text-[10px] font-bold text-gray-500">{p.speaker}</span>
            {(p.companies ?? []).length > 0 && (
              <>
                <span className="text-gray-200 text-[10px]">·</span>
                <div className="flex flex-wrap gap-1">
                  {(p.companies ?? []).map((t) => (
                    <span key={t} className="text-[9px] font-bold px-1.5 py-0.5 bg-gray-100 text-gray-500 rounded border border-gray-200 tracking-wide">
                      {t}
                    </span>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Prediction text — primary */}
          <p className={`text-[13.5px] font-medium text-[#111827] leading-snug ${isOpen ? "" : "line-clamp-2"}`}>
            &ldquo;{p.claim}&rdquo;
          </p>

          {/* Expanded detail */}
          {isOpen && (
            <div className="mt-3 pt-3 border-t border-gray-100 space-y-2">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-0.5">Verdict reasoning</p>
                <p className="text-[12.5px] text-gray-600 leading-relaxed">{p.notes}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-0.5">Source</p>
                <p className="text-[12px] text-gray-500">{prettySource(p.source)}</p>
              </div>
            </div>
          )}
        </div>

        {/* Right: horizon + verdict */}
        <div className="shrink-0 flex flex-col items-end gap-2 ml-2">
          <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-widest ${meta.bg} ${meta.text}`}>
            {meta.label}
          </span>
          <HorizonBadge horizon={p.horizon} />
        </div>
      </div>
    </div>
  );
}
