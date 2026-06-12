"use client";

import { useMemo, useState } from "react";
import type { ExpertId, Prediction, PredictionStatus } from "@/lib/tracker/predictions";

const STATUS_META: Record<
  PredictionStatus,
  { label: string; badge: string }
> = {
  CORRECT: { label: "Correct", badge: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  PARTIAL: { label: "Partial", badge: "bg-amber-50 text-amber-700 border-amber-200" },
  WRONG: { label: "Wrong", badge: "bg-rose-50 text-rose-700 border-rose-200" },
  TOO_EARLY: { label: "Open", badge: "bg-gray-50 text-gray-500 border-gray-200" },
};

const EXPERT_LABELS: Record<ExpertId, string> = {
  dylan: "Dylan Patel / SemiAnalysis",
  circuit: "The Circuit",
  baker: "Gavin Baker",
  doug: "Doug O'Laughlin",
  stacy: "Stacy Rasgon",
};

// Companies worth showing as quick-filter buttons (most-predicted)
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
    `px-3 py-1.5 text-[12px] font-semibold border transition-colors ${
      active
        ? "bg-[#111827] text-white border-[#111827]"
        : "bg-white text-gray-500 border-gray-200 hover:border-gray-400"
    }`;

  const companyBtn = (ticker: string) =>
    `px-2.5 py-1 text-[11px] font-bold border transition-colors ${
      company === ticker
        ? "bg-[#B45309] text-white border-[#B45309]"
        : "bg-white text-gray-500 border-gray-200 hover:border-gray-400"
    }`;

  return (
    <div>
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
            <span className="hidden sm:block text-gray-200">|</span>
          </>
        )}
        <div className="flex gap-1.5">
          {(
            [["all", "All"], ["resolved", "Resolved"], ["open", "Open"]] as const
          ).map(([s, label]) => (
            <button key={s} onClick={() => setStatus(s)} className={filterBtn(status === s)}>
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Company filter */}
      <div className="flex flex-wrap items-center gap-1.5 mb-4">
        <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mr-1">Company:</span>
        <button onClick={() => setCompany("all")} className={companyBtn("all")}>
          All
        </button>
        {TOP_COMPANIES.map((t) => (
          <button key={t} onClick={() => setCompany(t)} className={companyBtn(t)}>
            {t}
          </button>
        ))}
        <span className="ml-auto text-[12px] text-gray-400">
          {filtered.length} prediction{filtered.length === 1 ? "" : "s"}
        </span>
      </div>

      {/* Table */}
      <div className="border border-[#DDDBD2] bg-white overflow-x-auto -mx-4 sm:mx-0">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 text-[11px] uppercase tracking-wider text-gray-400 bg-gray-50">
              <th
                className="text-left px-4 py-3 cursor-pointer select-none whitespace-nowrap hover:text-gray-600"
                onClick={() => onSort("date")}
              >
                Date {sortKey === "date" ? (asc ? "↑" : "↓") : ""}
              </th>
              <th className="text-left px-4 py-3">Speaker</th>
              <th className="text-left px-4 py-3 w-full">Prediction</th>
              <th className="text-left px-4 py-3 whitespace-nowrap">Horizon</th>
              <th
                className="text-left px-4 py-3 cursor-pointer select-none whitespace-nowrap hover:text-gray-600"
                onClick={() => onSort("status")}
              >
                Verdict {sortKey === "status" ? (asc ? "↑" : "↓") : ""}
              </th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((p) => {
              const isOpen = expanded === p.id;
              return (
                <FragmentRow
                  key={p.id}
                  p={p}
                  isOpen={isOpen}
                  onToggle={() => setExpanded(isOpen ? null : p.id)}
                />
              );
            })}
          </tbody>
        </table>
      </div>

      <p className="mt-3 text-[12px] text-gray-400">
        Click any row for the verdict reasoning and source.
      </p>
    </div>
  );
}

function FragmentRow({
  p, isOpen, onToggle,
}: {
  p: Prediction;
  isOpen: boolean;
  onToggle: () => void;
}) {
  const meta = STATUS_META[p.status];
  return (
    <>
      <tr
        onClick={onToggle}
        className={`border-b border-gray-100 cursor-pointer transition-colors ${
          isOpen ? "bg-gray-50" : "hover:bg-gray-50"
        }`}
      >
        <td className="px-4 py-3 text-gray-400 whitespace-nowrap align-top text-[13px]">
          {p.date.slice(0, 7)}
        </td>
        <td className="px-4 py-3 text-gray-600 align-top text-[13px] whitespace-nowrap max-w-[160px] overflow-hidden text-ellipsis">
          {p.speaker}
        </td>
        <td className="px-4 py-3 text-[#18181B] align-top leading-snug">
          <span className={isOpen ? "" : "line-clamp-2"}>&ldquo;{p.claim}&rdquo;</span>
          {(p.companies ?? []).length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1.5">
              {(p.companies ?? []).map((t) => (
                <span key={t} className="text-[10px] font-bold px-1.5 py-0.5 bg-gray-100 text-gray-500 border border-gray-200">
                  {t}
                </span>
              ))}
            </div>
          )}
        </td>
        <td className="px-4 py-3 text-gray-400 whitespace-nowrap align-top text-[13px]">
          {p.horizon}
        </td>
        <td className="px-4 py-3 align-top">
          <span
            className={`inline-block border px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider whitespace-nowrap ${meta.badge}`}
          >
            {meta.label}
          </span>
        </td>
      </tr>
      {isOpen && (
        <tr className="border-b border-gray-100 bg-gray-50">
          <td colSpan={5} className="px-4 pb-4 pt-0">
            <div className="border-l-2 border-gray-300 pl-4 ml-1">
              <p className="text-[11px] uppercase tracking-wider text-gray-400 mb-1">
                Verdict reasoning
              </p>
              <p className="text-[13px] text-gray-600 leading-relaxed mb-3">{p.notes}</p>
              <p className="text-[11px] uppercase tracking-wider text-gray-400 mb-1">Source</p>
              <p className="text-[13px] text-gray-600">{prettySource(p.source)}</p>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}
