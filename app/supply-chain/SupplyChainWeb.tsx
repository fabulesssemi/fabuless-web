"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  NODES,
  EDGES,
  TIER_ORDER,
  TIER_LABELS,
  type SupplyNode,
  type Tier,
} from "@/lib/supply-chain/graph";

const W = 960;
const H = 740;
const TOP = 60;
const BOTTOM = 712;

const TIER_COLORS: Record<Tier, string> = {
  materials: "#6B7280",
  equipment: "#185FA5",
  eda_ip: "#534AB7",
  foundry: "#B45309",
  memory: "#0F766E",
  packaging: "#9A3412",
  designer: "#15803D",
  integrator: "#475569",
  customer: "#BE123C",
};

// Single-source suppliers — get the pulsing halo
const CHOKEPOINTS = new Set(["jsr", "asml", "arm", "tsmc", "skhynix"]);

// Node radius by importance; everything else defaults by coverage
const SIZE: Record<string, number> = {
  tsmc: 24,
  nvidia: 24,
  asml: 19,
  arm: 15,
  skhynix: 15,
  openai: 16,
  amd: 14,
  broadcom: 14,
};

// Short wordmark shown inside each circle
const MARK: Record<string, string> = {
  "shin-etsu": "SE",
  sumco: "SU",
  jsr: "JSR",
  asml: "ASML",
  amat: "AMAT",
  lrcx: "LAM",
  klac: "KLA",
  tel: "TEL",
  arm: "arm",
  snps: "SNPS",
  cdns: "CDNS",
  tsmc: "tsmc",
  "samsung-foundry": "SAM",
  intel: "intel",
  micron: "MU",
  skhynix: "SK",
  "samsung-memory": "SAM",
  ase: "ASE",
  amkor: "AMKR",
  nvidia: "nVIDIA",
  amd: "AMD",
  broadcom: "AVGO",
  marvell: "MRVL",
  qualcomm: "QCOM",
  supermicro: "SMCI",
  dell: "DELL",
  apple: "AAPL",
  google: "G",
  amazon: "a",
  microsoft: "MS",
  meta: "M",
  openai: "OAI",
  zeiss: "ZS",
  globalfoundries: "GF",
  astera: "ALAB",
  foxconn: "FOX",
  arista: "ANET",
  oracle: "ORCL",
  coreweave: "CW",
  xai: "xAI",
  anthropic: "ANT",
};

type Pos = { x: number; y: number; r: number };

function computeLayout(): Record<string, Pos> {
  const colX = (i: number) => 52 + i * ((W - 104) / (TIER_ORDER.length - 1));
  const pos: Record<string, Pos> = {};
  TIER_ORDER.forEach((tier, ti) => {
    const tierNodes = NODES.filter((n) => n.tier === tier);
    const span = BOTTOM - TOP;
    tierNodes.forEach((n, ni) => {
      pos[n.id] = {
        x: colX(ti),
        y: TOP + ((ni + 0.5) * span) / tierNodes.length,
        r: SIZE[n.id] ?? (n.covered ? 12 : 10.5),
      };
    });
  });
  return pos;
}

function edgePath(a: Pos, b: Pos): string {
  const mx = a.x + (b.x - a.x) * 0.5;
  return `M${a.x + a.r},${a.y} C${mx},${a.y} ${mx},${b.y} ${b.x - b.r},${b.y}`;
}

export function SupplyChainWeb() {
  const [active, setActive] = useState<string | null>(null);
  const [ckOnly, setCkOnly] = useState(false);

  const pos = useMemo(computeLayout, []);
  const nodeById = useMemo(
    () => Object.fromEntries(NODES.map((n) => [n.id, n])) as Record<string, SupplyNode>,
    []
  );

  const edges = ckOnly ? EDGES.filter((e) => e.critical) : EDGES;

  const connected = useMemo(() => {
    if (!active) return null;
    const set = new Set([active]);
    edges.forEach((e) => {
      if (e.from === active || e.to === active) {
        set.add(e.from);
        set.add(e.to);
      }
    });
    return set;
  }, [active, edges]);

  const activeNode = active ? nodeById[active] : null;

  // Exposure = concentration. For each relationship, share = 1 / (number of
  // alternative providers of the same relation); critical edges pin to 100%.
  type ExposureRow = {
    other: SupplyNode;
    label: string;
    share: number;
    single: boolean;
  };

  function exposureRows(id: string, dir: "up" | "down"): ExposureRow[] {
    const rel =
      dir === "up"
        ? edges.filter((e) => e.to === id)
        : edges.filter((e) => e.from === id);
    return rel
      .map((e) => {
        const alternatives = rel.filter((r) => r.relation === e.relation).length;
        const single = !!e.critical;
        return {
          other: nodeById[dir === "up" ? e.from : e.to],
          label: e.label,
          share: single ? 1 : 1 / alternatives,
          single,
        };
      })
      .filter((r) => r.other)
      .sort((a, b) => b.share - a.share);
  }

  function levelOf(r: ExposureRow, dir: "up" | "down"): { text: string; color: string } {
    if (r.single)
      return { text: dir === "up" ? "Single source" : "Critical", color: "#DC2626" };
    if (r.share >= 0.5) return { text: "High", color: "#B45309" };
    if (r.share >= 0.3) return { text: "Medium", color: "#A16207" };
    return { text: "Low", color: "#6B7280" };
  }

  const upstream = active ? exposureRows(active, "up") : [];
  const downstream = active ? exposureRows(active, "down") : [];

  function toggle(id: string) {
    setActive((cur) => (cur === id ? null : id));
  }

  return (
    <div className="border border-gray-200 bg-[#F1F0EA]">
      <div className="flex items-center justify-between border-b border-[#DDDBD2] px-4 py-3">
        <div className="flex flex-wrap gap-x-4 gap-y-1">
          {TIER_ORDER.map((t) => (
            <span key={t} className="flex items-center gap-1.5 text-[11px] text-gray-600">
              <span
                className="inline-block h-2.5 w-2.5 rounded-full border-2 bg-white"
                style={{ borderColor: TIER_COLORS[t] }}
              />
              {TIER_LABELS[t]}
            </span>
          ))}
        </div>
        <label className="flex shrink-0 cursor-pointer items-center gap-2 text-xs text-gray-700">
          <input
            type="checkbox"
            checked={ckOnly}
            onChange={(e) => {
              setCkOnly(e.target.checked);
              setActive(null);
            }}
            className="h-3.5 w-3.5 accent-[#B45309]"
          />
          Chokepoints only
        </label>
      </div>

      {/* Desktop web */}
      <div className="hidden md:block">
        <svg viewBox={`0 0 ${W} ${H}`} className="block w-full">
          {/* graph-paper grid */}
          {Array.from({ length: Math.floor(W / 24) + 1 }, (_, i) => (
            <line
              key={`gx${i}`}
              x1={i * 24} y1={0} x2={i * 24} y2={H}
              stroke="#E2E0D8" strokeWidth={i % 5 === 0 ? 1 : 0.5}
            />
          ))}
          {Array.from({ length: Math.floor(H / 24) + 1 }, (_, i) => (
            <line
              key={`gy${i}`}
              x1={0} y1={i * 24} x2={W} y2={i * 24}
              stroke="#E2E0D8" strokeWidth={i % 5 === 0 ? 1 : 0.5}
            />
          ))}

          {/* tier labels */}
          {TIER_ORDER.map((t, i) => (
            <text
              key={t}
              x={52 + i * ((W - 104) / (TIER_ORDER.length - 1))}
              y={20}
              textAnchor="middle"
              fontSize={9}
              letterSpacing={1.5}
              fill={TIER_COLORS[t]}
              className="font-mono uppercase"
            >
              {TIER_LABELS[t]}
            </text>
          ))}

          {/* edges */}
          {edges.map((e, i) => {
            const a = pos[e.from];
            const b = pos[e.to];
            if (!a || !b) return null;
            const hit = active !== null && (e.from === active || e.to === active);
            const dim = active !== null && !hit;
            const d = edgePath(a, b);
            return (
              <g key={i} fill="none">
                <path
                  d={d}
                  stroke={hit ? "#B45309" : e.critical ? "#DC2626" : "#9CA3AF"}
                  strokeWidth={hit ? 2 : e.critical ? 1.3 : 0.8}
                  opacity={dim ? 0.07 : hit ? 1 : e.critical ? 0.55 : 0.3}
                />
                {(hit || (!active && e.critical)) && (
                  <path
                    d={d}
                    stroke={hit ? "#D97706" : "#EF4444"}
                    strokeWidth={1.6}
                    opacity={0.85}
                    strokeDasharray="3 14"
                    strokeLinecap="round"
                  >
                    <animate
                      attributeName="stroke-dashoffset"
                      from="34" to="0"
                      dur={hit ? "0.9s" : "1.6s"}
                      repeatCount="indefinite"
                    />
                  </path>
                )}
              </g>
            );
          })}

          {/* nodes */}
          {NODES.map((n) => {
            const p = pos[n.id];
            const color = TIER_COLORS[n.tier];
            const isActive = n.id === active;
            const dim = connected !== null && !connected.has(n.id);
            const isCk = CHOKEPOINTS.has(n.id);
            const markSize = Math.max(7.5, p.r * 0.42);
            return (
              <g
                key={n.id}
                opacity={dim ? 0.15 : 1}
                className="cursor-pointer"
                onClick={() => toggle(n.id)}
              >
                {(isActive || (!active && isCk)) && (
                  <circle
                    cx={p.x} cy={p.y} r={p.r + 7}
                    fill="none"
                    stroke={isActive ? "#B45309" : "#DC2626"}
                    strokeWidth={1}
                    opacity={0.45}
                  >
                    <animate
                      attributeName="r"
                      values={`${p.r + 4};${p.r + 10};${p.r + 4}`}
                      dur="2.4s" repeatCount="indefinite"
                    />
                    <animate
                      attributeName="opacity"
                      values="0.55;0.1;0.55"
                      dur="2.4s" repeatCount="indefinite"
                    />
                  </circle>
                )}
                <circle
                  cx={p.x} cy={p.y} r={p.r}
                  fill={isActive ? "#FFFBEB" : "#FFFFFF"}
                  stroke={color}
                  strokeWidth={n.covered || isActive ? 2 : 1.2}
                />
                <text
                  x={p.x} y={p.y + markSize * 0.36}
                  textAnchor="middle"
                  fontSize={markSize}
                  fontWeight={500}
                  fill={color}
                >
                  {MARK[n.id] ?? n.name.slice(0, 4)}
                </text>
                <text
                  x={p.x} y={p.y + p.r + 13}
                  textAnchor="middle"
                  fontSize={p.r >= 20 ? 12 : 10.5}
                  fontWeight={500}
                  fill={isActive ? "#B45309" : "#1F2937"}
                >
                  {n.name}
                </text>
                {n.ticker && (
                  <text
                    x={p.x} y={p.y + p.r + 24}
                    textAnchor="middle"
                    fontSize={8.5}
                    fill="#9CA3AF"
                    className="font-mono"
                  >
                    {n.ticker}
                  </text>
                )}
              </g>
            );
          })}
        </svg>
      </div>

      {/* Mobile: tier accordions */}
      <div className="md:hidden">
        {TIER_ORDER.map((t) => (
          <details key={t} className="border-b border-[#DDDBD2] last:border-b-0">
            <summary className="flex cursor-pointer items-center gap-2 px-4 py-3 text-sm font-semibold text-gray-800">
              <span
                className="inline-block h-2.5 w-2.5 rounded-full border-2 bg-white"
                style={{ borderColor: TIER_COLORS[t] }}
              />
              {TIER_LABELS[t]}
            </summary>
            <div className="px-4 pb-3">
              {NODES.filter((n) => n.tier === t).map((n) => (
                <button
                  key={n.id}
                  onClick={() => toggle(n.id)}
                  className={`block w-full border-b border-[#E5E3DA] py-2 text-left text-sm last:border-b-0 ${
                    active === n.id ? "text-[#B45309]" : "text-gray-800"
                  }`}
                >
                  <span className="font-semibold">{n.name}</span>
                  {n.ticker && <span className="ml-2 font-mono text-xs text-gray-400">{n.ticker}</span>}
                </button>
              ))}
            </div>
          </details>
        ))}
      </div>

      {/* Detail panel */}
      {activeNode && (
        <div className="border-t border-[#DDDBD2] px-4 py-3">
          <div className="flex items-baseline gap-2">
            <span className="text-sm font-bold text-[#111827]">{activeNode.name}</span>
            <span className="font-mono text-[11px] text-[#B45309]">
              {activeNode.ticker ?? "PRIVATE"}
            </span>
            <span
              className="text-[10px] uppercase tracking-wide"
              style={{ color: TIER_COLORS[activeNode.tier] }}
            >
              {TIER_LABELS[activeNode.tier]}
            </span>
            <button
              onClick={() => setActive(null)}
              className="ml-auto text-[11px] text-gray-500 hover:text-gray-700"
            >
              ✕ close
            </button>
          </div>
          <p className="mt-1 text-xs leading-relaxed text-gray-600">{activeNode.blurb}</p>
          <div className="mt-3 grid grid-cols-1 gap-4 md:grid-cols-2">
            {(
              [
                { title: "Depends on", note: "supply exposure", rows: upstream, dir: "up" },
                { title: "Sells to", note: "customer exposure", rows: downstream, dir: "down" },
              ] as const
            ).map(({ title, note, rows, dir }) => (
              <div key={title}>
                <div className="mb-1.5 text-[10px] font-semibold uppercase tracking-wide text-gray-500">
                  {title} <span className="font-normal normal-case text-gray-400">— {note}</span>
                </div>
                {rows.length === 0 && (
                  <div className="text-[11px] text-gray-400">None in this view.</div>
                )}
                {rows.map((r, i) => {
                  const lvl = levelOf(r, dir);
                  return (
                    <div
                      key={i}
                      className="flex items-center gap-2 border-b border-[#E5E3DA] py-1 last:border-b-0"
                    >
                      <button
                        onClick={() => toggle(r.other.id)}
                        className="w-24 shrink-0 truncate text-left text-[11px] font-semibold text-gray-800 hover:text-[#B45309]"
                      >
                        {r.other.name}
                      </button>
                      <span className="w-32 shrink-0 truncate text-[10px] text-gray-500">
                        {r.label}
                      </span>
                      <span className="h-1.5 flex-1 bg-[#E5E3DA]">
                        <span
                          className="block h-full"
                          style={{
                            width: `${Math.round(r.share * 100)}%`,
                            backgroundColor: lvl.color,
                          }}
                        />
                      </span>
                      <span
                        className="w-20 shrink-0 text-right text-[10px] font-semibold"
                        style={{ color: lvl.color }}
                      >
                        {lvl.text}
                      </span>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
          {activeNode.covered && (
            <Link
              href={`/companies/${active}`}
              className="mt-2 inline-block text-xs text-[#B45309] hover:underline"
            >
              View company →
            </Link>
          )}
        </div>
      )}

      <div className="hidden items-center gap-5 border-t border-[#DDDBD2] px-4 py-2.5 md:flex">
        <span className="flex items-center gap-1.5 text-[10.5px] text-gray-600">
          <span className="inline-block h-2.5 w-2.5 rounded-full border-2 border-[#B45309] bg-white" />
          Bold ring = Fabuless coverage
        </span>
        <span className="flex items-center gap-1.5 text-[10.5px] text-gray-600">
          <span className="inline-block h-0.5 w-4 bg-[#DC2626]" />
          Critical dependency
        </span>
        <span className="flex items-center gap-1.5 text-[10.5px] text-gray-600">
          <span className="inline-block h-px w-4 bg-gray-400" />
          Standard flow
        </span>
        <span className="ml-auto text-[10.5px] text-gray-400">Click a node to explore</span>
      </div>
    </div>
  );
}
