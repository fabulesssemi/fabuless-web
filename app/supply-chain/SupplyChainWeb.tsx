"use client";

import { useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  NODES,
  EDGES,
  TIER_ORDER,
  TIER_LABELS,
  type SupplyNode,
  type Tier,
} from "@/lib/supply-chain/graph";

type Scenario = {
  id: string;
  label: string;
  subtitle: string;  // one-liner description
  count: number;     // filled in at runtime
  nodes: string[];   // affected node ids
  color: string;     // highlight color
};

const SCENARIOS: Omit<Scenario, "count">[] = [
  {
    id: "taiwan-conflict",
    label: "Taiwan conflict / TSMC disruption",
    subtitle: "The single-point-of-failure that ends the AI trade",
    nodes: ["tsmc", "nvidia", "amd", "broadcom", "marvell", "qualcomm", "apple", "astera",
            "asml", "amat", "lrcx", "klac", "tel", "arm", "snps", "cdns",
            "microsoft", "google", "amazon", "meta", "openai", "oracle", "coreweave", "xai", "anthropic"],
    color: "#DC2626",
  },
  {
    id: "china-export-controls",
    label: "China export controls tighten",
    subtitle: "US restricts advanced chips, equipment, and EDA to China",
    nodes: ["asml", "amat", "lrcx", "klac", "tel", "snps", "cdns",
            "nvidia", "broadcom", "qualcomm", "samsung-foundry", "samsung-memory",
            "jsr", "shin-etsu", "sumco"],
    color: "#B45309",
  },
  {
    id: "hbm-shortage",
    label: "HBM shortage escalates",
    subtitle: "SK Hynix sells out 2026 allocation — Nvidia shipments slip",
    nodes: ["skhynix", "micron", "samsung-memory", "nvidia", "amd",
            "lrcx", "asml", "openai", "xai", "coreweave", "microsoft", "amazon"],
    color: "#0F766E",
  },
  {
    id: "cowos-bottleneck",
    label: "CoWoS packaging bottleneck",
    subtitle: "TSMC advanced packaging sold out through 2026 — Nvidia allocation constrained",
    nodes: ["tsmc", "nvidia", "amd", "broadcom", "ase", "amkor",
            "microsoft", "google", "amazon", "meta", "openai", "oracle", "coreweave"],
    color: "#9A3412",
  },
  {
    id: "n3-crunch",
    label: "N3/N2 node capacity crunch",
    subtitle: "Every AI chip family converges on TSMC N3 — Apple, Nvidia, AMD fight for allocation",
    nodes: ["tsmc", "nvidia", "amd", "broadcom", "marvell", "apple", "qualcomm",
            "asml", "amat", "klac", "tel"],
    color: "#534AB7",
  },
  {
    id: "euv-ban",
    label: "EUV export ban expands",
    subtitle: "ASML blocked from additional markets — advanced fab capacity freezes",
    nodes: ["asml", "zeiss", "tsmc", "samsung-foundry", "intel", "skhynix", "micron", "samsung-memory",
            "nvidia", "amd", "broadcom", "apple"],
    color: "#185FA5",
  },
  {
    id: "power-constraint",
    label: "Datacenter power / energy wall",
    subtitle: "Grid capacity limits AI buildout — hyperscaler capex plans slip by 18–24 months",
    nodes: ["nvidia", "supermicro", "dell", "foxconn", "arista",
            "microsoft", "google", "amazon", "meta", "openai", "oracle", "coreweave", "xai"],
    color: "#6B7280",
  },
  {
    id: "optical-transition",
    label: "Optical interconnects go mainstream",
    subtitle: "Copper hits bandwidth limits — photonics winners emerge, Arista / Marvell pivots",
    nodes: ["nvidia", "broadcom", "marvell", "astera", "arista",
            "tsmc", "microsoft", "google", "amazon", "meta"],
    color: "#0E7490",
  },
  {
    id: "custom-asic-inflection",
    label: "Custom ASIC inflection — hyperscalers defect from Nvidia",
    subtitle: "Google TPU, Amazon Trainium, Meta MTIA reach critical mass — Nvidia inference share falls",
    nodes: ["broadcom", "marvell", "tsmc", "arm",
            "google", "amazon", "microsoft", "meta", "openai", "anthropic",
            "nvidia"],
    color: "#7C3AED",
  },
  {
    id: "token-commoditization",
    label: "Frontier token prices collapse",
    subtitle: "DeepSeek-style efficiency shock — training capex pauses, inference chips reprice",
    nodes: ["openai", "anthropic", "xai",
            "nvidia", "amd", "broadcom", "marvell",
            "microsoft", "google", "amazon", "oracle", "coreweave"],
    color: "#BE123C",
  },
  {
    id: "chips-act",
    label: "CHIPS Act beneficiaries",
    subtitle: "US onshoring dollars flow — domestic fabs and packaging winners",
    nodes: ["intel", "micron", "tsmc", "globalfoundries", "samsung-foundry",
            "ase", "amkor", "amat", "lrcx", "klac"],
    color: "#15803D",
  },
  {
    id: "arm-disruption",
    label: "Arm license disruption",
    subtitle: "Arm tightens licensing or revokes China access — Qualcomm, Nvidia Grace, Apple exposed",
    nodes: ["arm", "nvidia", "qualcomm", "apple", "amazon",
            "tsmc", "samsung-foundry"],
    color: "#92400E",
  },
  {
    id: "intel-foundry-comeback",
    label: "Intel 18A foundry comeback",
    subtitle: "18A yields — Microsoft and others adopt, TSMC gets credible competitor for first time",
    nodes: ["intel", "microsoft", "apple", "asml", "amat", "klac",
            "arm", "snps", "cdns"],
    color: "#185FA5",
  },
  {
    id: "memory-oversupply",
    label: "Memory price collapse / DRAM oversupply",
    subtitle: "Samsung floods market — HBM pricing craters, Micron and Hynix margins crushed",
    nodes: ["skhynix", "micron", "samsung-memory", "samsung-foundry",
            "lrcx", "amat", "nvidia"],
    color: "#0F766E",
  },
  {
    id: "asml-shock",
    label: "ASML supply shock",
    subtitle: "High-NA EUV ramp delayed — 2nm node timelines slip 18+ months across all foundries",
    nodes: ["asml", "zeiss", "tsmc", "samsung-foundry", "intel",
            "skhynix", "micron", "nvidia", "amd", "apple"],
    color: "#185FA5",
  },
  {
    id: "ai-capex-supercycle",
    label: "AI capex supercycle accelerates",
    subtitle: "Hyperscalers collectively double 2027 capex — every node in the chain reprices",
    nodes: ["nvidia", "skhynix", "micron", "tsmc", "broadcom", "marvell", "astera",
            "supermicro", "dell", "foxconn", "arista",
            "microsoft", "google", "amazon", "meta", "oracle", "coreweave"],
    color: "#B45309",
  },
  {
    id: "openai-demand-shock",
    label: "OpenAI demand shock",
    subtitle: "OpenAI's compute buildout alone moves market — upstream chain reprices",
    nodes: ["openai", "microsoft", "oracle", "coreweave",
            "nvidia", "tsmc", "skhynix", "broadcom",
            "supermicro", "foxconn", "arista"],
    color: "#7C3AED",
  },
  {
    id: "hbm4-transition",
    label: "HBM4 transition — SK Hynix lead widens",
    subtitle: "HBM4 yields only at Hynix — Samsung and Micron miss the next GPU generation",
    nodes: ["skhynix", "micron", "samsung-memory", "lrcx",
            "nvidia", "amd", "openai", "xai", "coreweave"],
    color: "#0F766E",
  },
  {
    id: "geopolitical-japan-korea",
    label: "Japan / Korea export controls",
    subtitle: "Allied nations restrict semiconductor materials and equipment exports",
    nodes: ["shin-etsu", "sumco", "jsr", "zeiss", "tel",
            "skhynix", "samsung-foundry", "samsung-memory",
            "tsmc", "asml"],
    color: "#6B7280",
  },
  {
    id: "packaging-unbundled",
    label: "TSMC packaging monopoly breaks",
    subtitle: "ASE and Amkor close CoWoS gap — TSMC loses pricing power on packaging",
    nodes: ["tsmc", "ase", "amkor", "nvidia", "amd", "broadcom",
            "samsung-foundry", "intel"],
    color: "#9A3412",
  },
];

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
  const [scenario, setScenario] = useState<string | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const activeScenario = scenario ? SCENARIOS.find((s) => s.id === scenario) ?? null : null;
  const scenarioSet = activeScenario ? new Set(activeScenario.nodes) : null;

  function selectScenario(id: string) {
    setScenario((cur) => (cur === id ? null : id));
    setActive(null);
    setDropdownOpen(false);
  }

  function reset() {
    setActive(null);
    setScenario(null);
    setCkOnly(false);
  }

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
        <div className="flex shrink-0 items-center gap-3">
          {/* Scenarios dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen((o) => !o)}
              className={`flex items-center gap-1 border px-2.5 py-1 text-xs transition-colors ${
                activeScenario
                  ? "border-[#B45309] bg-[#FFF7ED] text-[#B45309]"
                  : "border-gray-300 bg-white text-gray-700 hover:border-gray-400"
              }`}
            >
              {activeScenario ? (
                <span className="max-w-[160px] truncate">{activeScenario.label}</span>
              ) : (
                "Scenarios"
              )}
              <span className="ml-0.5 text-[10px]">{dropdownOpen ? "▲" : "▾"}</span>
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 top-full z-50 mt-1 w-80 border border-gray-200 bg-white shadow-lg">
                <div className="border-b border-gray-100 px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                  20 investor scenarios
                </div>
                <div className="max-h-[420px] overflow-y-auto">
                  {SCENARIOS.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => selectScenario(s.id)}
                      className={`block w-full border-b border-gray-50 px-3 py-2.5 text-left last:border-b-0 hover:bg-gray-50 ${
                        scenario === s.id ? "bg-[#FFF7ED]" : ""
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className="mt-0.5 h-2 w-2 shrink-0 rounded-full"
                          style={{ backgroundColor: s.color }}
                        />
                        <span className="text-[12px] font-semibold text-gray-800">{s.label}</span>
                        {scenario === s.id && (
                          <span className="ml-auto shrink-0 text-[10px] text-[#B45309]">active</span>
                        )}
                      </div>
                      <p className="ml-4 mt-0.5 text-[11px] leading-snug text-gray-500">
                        {s.subtitle}
                      </p>
                      <p className="ml-4 mt-0.5 text-[10px] text-gray-400">
                        {s.nodes.length} companies affected
                      </p>
                    </button>
                  ))}
                </div>
                {scenario && (
                  <div className="border-t border-gray-100 px-3 py-2">
                    <button
                      onClick={() => { setScenario(null); setDropdownOpen(false); }}
                      className="text-[11px] text-gray-500 hover:text-gray-700"
                    >
                      ✕ Clear scenario
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Chokepoints toggle */}
          <label className="flex cursor-pointer items-center gap-2 text-xs text-gray-700">
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

          {/* Reset */}
          {(active || scenario || ckOnly) && (
            <button
              onClick={reset}
              className="border border-gray-300 bg-white px-2.5 py-1 text-xs font-semibold text-gray-700 hover:border-gray-400 hover:text-gray-900"
              title="Reset view"
            >
              Reset ↺
            </button>
          )}
        </div>
      </div>

      {/* Active scenario banner */}
      {activeScenario && (
        <div
          className="flex items-center gap-3 border-b px-4 py-2 text-xs"
          style={{
            backgroundColor: activeScenario.color + "10",
            borderColor: activeScenario.color + "40",
          }}
        >
          <span
            className="h-2 w-2 shrink-0 rounded-full"
            style={{ backgroundColor: activeScenario.color }}
          />
          <span className="font-semibold" style={{ color: activeScenario.color }}>
            {activeScenario.label}
          </span>
          <span className="text-gray-500">—</span>
          <span className="text-gray-600">{activeScenario.subtitle}</span>
          <span className="ml-auto shrink-0 text-gray-400">
            {activeScenario.nodes.length} companies highlighted
          </span>
          <button
            onClick={() => setScenario(null)}
            className="shrink-0 text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>
      )}

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
            // scenario: highlight edges where both endpoints are in the scenario
            const scHit = scenarioSet !== null && scenarioSet.has(e.from) && scenarioSet.has(e.to);
            const dim = active !== null ? !hit
                      : scenarioSet !== null ? !scHit
                      : false;
            const d = edgePath(a, b);
            const scColor = activeScenario?.color ?? "#B45309";
            return (
              <g key={i} fill="none">
                <path
                  d={d}
                  stroke={hit ? "#B45309" : scHit ? scColor : e.critical ? "#DC2626" : "#9CA3AF"}
                  strokeWidth={hit ? 2 : scHit ? 1.4 : e.critical ? 1.3 : 0.8}
                  opacity={dim ? 0.06 : hit ? 1 : scHit ? 0.7 : e.critical ? 0.55 : 0.3}
                />
                {(hit || scHit || (!active && !scenarioSet && e.critical)) && (
                  <path
                    d={d}
                    stroke={hit ? "#D97706" : scHit ? scColor : "#EF4444"}
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
            const inScenario = scenarioSet !== null && scenarioSet.has(n.id);
            const scColor = activeScenario?.color ?? "#B45309";
            const dim = connected !== null ? !connected.has(n.id)
                      : scenarioSet !== null ? !inScenario
                      : false;
            const isCk = CHOKEPOINTS.has(n.id);
            const markSize = Math.max(7.5, p.r * 0.42);
            return (
              <g
                key={n.id}
                opacity={dim ? 0.15 : 1}
                className="cursor-pointer"
                onClick={() => toggle(n.id)}
              >
                {(isActive || inScenario || (!active && !scenarioSet && isCk)) && (
                  <circle
                    cx={p.x} cy={p.y} r={p.r + 7}
                    fill="none"
                    stroke={isActive ? "#B45309" : inScenario ? scColor : "#DC2626"}
                    strokeWidth={inScenario && !isActive ? 1.5 : 1}
                    opacity={0.45}
                  >
                    <animate
                      attributeName="r"
                      values={`${p.r + 4};${p.r + 10};${p.r + 4}`}
                      dur={inScenario && !isActive ? "3s" : "2.4s"} repeatCount="indefinite"
                    />
                    <animate
                      attributeName="opacity"
                      values="0.55;0.1;0.55"
                      dur={inScenario && !isActive ? "3s" : "2.4s"} repeatCount="indefinite"
                    />
                  </circle>
                )}
                <circle
                  cx={p.x} cy={p.y} r={p.r}
                  fill={isActive ? "#FFFBEB" : inScenario ? `${scColor}12` : "#FFFFFF"}
                  stroke={inScenario ? scColor : color}
                  strokeWidth={n.covered || isActive || inScenario ? 2 : 1.2}
                />
                <text
                  x={p.x} y={p.y + markSize * 0.36}
                  textAnchor="middle"
                  fontSize={markSize}
                  fontWeight={500}
                  fill={inScenario ? scColor : color}
                >
                  {MARK[n.id] ?? n.name.slice(0, 4)}
                </text>
                <text
                  x={p.x} y={p.y + p.r + 13}
                  textAnchor="middle"
                  fontSize={p.r >= 20 ? 12 : 10.5}
                  fontWeight={500}
                  fill={isActive ? "#B45309" : inScenario ? scColor : "#1F2937"}
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
