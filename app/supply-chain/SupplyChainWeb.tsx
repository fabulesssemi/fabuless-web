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
  subtitle: string;
  count: number;
  nodes: string[];
  color: string;
  why: Record<string, string>; // nodeId → one-line reason
};

const SCENARIOS: Omit<Scenario, "count">[] = [
  {
    id: "taiwan-conflict",
    label: "Taiwan conflict / TSMC disruption",
    subtitle: "The single-point-of-failure that ends the AI trade",
    nodes: ["tsmc","nvidia","amd","broadcom","marvell","qualcomm","apple","astera",
            "asml","amat","lrcx","klac","tel","arm","snps","cdns",
            "microsoft","google","amazon","meta","openai","oracle","coreweave","xai","anthropic"],
    color: "#DC2626",
    why: {
      tsmc: "Fabricates 90%+ of the world's leading-edge AI chips — no substitute exists",
      nvidia: "Entire Blackwell/Rubin lineup fabbed at TSMC N3/N4 — shipments halt immediately",
      amd: "MI-series and EPYC both TSMC-only — no second-source at leading edge",
      broadcom: "TPU and networking silicon exclusively at TSMC — Google loses its custom chip",
      marvell: "All custom ASICs (Trainium, Maia) fabbed at TSMC",
      qualcomm: "Snapdragon at TSMC — mobile and PC supply collapses",
      apple: "A-series and M-series chips: TSMC is sole fab — iPhone/Mac production stops",
      astera: "Connectivity silicon at TSMC — AI rack builds stall",
      asml: "EUV tools deployed in Taiwan — machines physically at risk",
      amat: "Major tool base in TSMC fabs — deposition/etch revenue disappears",
      lrcx: "Etch tools in TSMC and TSMC-adjacent memory fabs",
      klac: "Process control tools installed across all TSMC nodes",
      tel: "Coat/develop systems in every TSMC fab",
      arm: "Grace CPU and all Arm-based chips cut off from fabrication",
      snps: "EDA revenue tied to design tape-outs that can no longer be fabbed",
      cdns: "Same — design tools lose value if silicon can't be produced",
      microsoft: "Azure AI and OpenAI hosting depend on TSMC-fabbed GPUs",
      google: "TPUs and cloud GPU fleet both TSMC-sourced",
      amazon: "Trainium, Inferentia, and all AWS GPUs are TSMC chips",
      meta: "GPU fleet and MTIA ASIC both TSMC-dependent",
      openai: "Entire compute infrastructure runs on TSMC-fabbed silicon",
      oracle: "Stargate GPU cluster is Nvidia/TSMC — build stops",
      coreweave: "Pure-play GPU cloud — entire asset base is TSMC chips",
      xai: "Colossus runs on TSMC-fabbed Nvidia GPUs",
      anthropic: "Trainium (TSMC) and TPU (TSMC) are primary training platforms",
    },
  },
  {
    id: "china-export-controls",
    label: "China export controls tighten",
    subtitle: "US restricts advanced chips, equipment, and EDA to China",
    nodes: ["asml","amat","lrcx","klac","tel","snps","cdns",
            "nvidia","broadcom","qualcomm","samsung-foundry","samsung-memory",
            "jsr","shin-etsu","sumco"],
    color: "#B45309",
    why: {
      asml: "China is ~30% of ASML revenue — EUV already banned, DUV next in line",
      amat: "China was largest single-country market (~30% of revenue) — export licenses at risk",
      lrcx: "Significant China revenue for etch tools — restrictions squeeze backlog",
      klac: "Process control tools subject to expanded entity list enforcement",
      tel: "Japan-based but US pressure to align — China revenue at risk",
      snps: "EDA tools restricted for advanced Chinese fabs — Huawei design flow disrupted",
      cdns: "Same — Chinese chip designers lose access to leading-edge EDA",
      nvidia: "H100/H200 already banned — further controls may cover more SKUs",
      broadcom: "Networking silicon for Chinese hyperscalers faces export license scrutiny",
      qualcomm: "Modem and SoC sales to Chinese OEMs (Xiaomi, OPPO) at risk",
      "samsung-foundry": "Competes with TSMC for advanced nodes — benefits if China-based fabs are hobbled",
      "samsung-memory": "HBM export restrictions tighten supply to Chinese AI customers",
      jsr: "Photoresist exports to China subject to Japanese aligned controls",
      "shin-etsu": "Wafer exports to Chinese fabs face new restrictions",
      sumco: "Same — Japanese wafer suppliers caught in allied export control alignment",
    },
  },
  {
    id: "hbm-shortage",
    label: "HBM shortage escalates",
    subtitle: "SK Hynix sells out 2026 allocation — Nvidia shipments slip",
    nodes: ["skhynix","micron","samsung-memory","nvidia","amd",
            "lrcx","asml","openai","xai","coreweave","microsoft","amazon"],
    color: "#0F766E",
    why: {
      skhynix: "Controls ~60% of HBM supply — if Hynix is sold out, the market is sold out",
      micron: "Only US HBM maker — allocation sold forward, no spot market",
      "samsung-memory": "Still qualifying HBM3E for Nvidia — shortage exposes their lag",
      nvidia: "Each Blackwell GPU needs 8 HBM3E stacks — can't ship GPUs without memory",
      amd: "MI-series AI GPUs similarly HBM-dependent — shipments constrained alongside Nvidia",
      lrcx: "Etch tools critical for HBM stacking process — capacity limits trace back here",
      asml: "EUV for advanced DRAM nodes — foundational constraint on HBM capacity growth",
      openai: "GPU deliveries slip → training and inference expansion delayed",
      xai: "Colossus expansion gated by GPU availability, gated by HBM",
      coreweave: "GPU cloud capacity additions stall — can't take new customer commitments",
      microsoft: "Azure GPU fleet expansion constrained — OpenAI buildout slips",
      amazon: "AWS capacity additions slow — Trainium ramp also HBM-dependent",
    },
  },
  {
    id: "cowos-bottleneck",
    label: "CoWoS packaging bottleneck",
    subtitle: "TSMC advanced packaging sold out through 2026 — Nvidia allocation constrained",
    nodes: ["tsmc","nvidia","amd","broadcom","ase","amkor",
            "microsoft","google","amazon","meta","openai","oracle","coreweave"],
    color: "#9A3412",
    why: {
      tsmc: "CoWoS is TSMC's proprietary 2.5D packaging — they control the bottleneck",
      nvidia: "Blackwell requires CoWoS-L — every GPU that can't be packaged is a missed quarter",
      amd: "MI-series uses CoWoS-S — same packaging queue as Nvidia",
      broadcom: "TPU v5/v6 chips use advanced packaging — Google buildout constrained",
      ase: "Overflow CoWoS capacity at ASE — benefits from TSMC backlog, but capacity limited",
      amkor: "Same — alternative OSAT gains share when TSMC is capped",
      microsoft: "Azure AI cluster expansion gated on packaged GPU delivery",
      google: "TPU production constrained — competes with Nvidia for same TSMC packaging slots",
      amazon: "Trainium ramp limited by packaging capacity",
      meta: "GPU orders slip — Llama training timelines extend",
      openai: "Compute expansion delayed — model training and inference scaling impacted",
      oracle: "Stargate build timeline at risk if GPU shipments slip",
      coreweave: "Can't add GPU capacity without packaged chips — customer commitments at risk",
    },
  },
  {
    id: "n3-crunch",
    label: "N3/N2 node capacity crunch",
    subtitle: "Every AI chip family converges on TSMC N3 — Apple, Nvidia, AMD fight for allocation",
    nodes: ["tsmc","nvidia","amd","broadcom","marvell","apple","qualcomm","asml","amat","klac","tel"],
    color: "#534AB7",
    why: {
      tsmc: "N3 is the fulcrum — TSMC plays kingmaker deciding which customers get wafers",
      nvidia: "Blackwell on N4, Rubin on N3 — competes directly with Apple for leading-edge allocation",
      amd: "EPYC Turin and MI-series both on N3 — volume constrained",
      broadcom: "TPU v6/v7 on N3 — Google loses allocation if Apple wins the queue",
      marvell: "Custom ASICs on N3/N2 — hyperscaler ASIC ramps gated on node availability",
      apple: "A18 and M4 on N3 — historically Apple gets priority, but AI demand challenges that",
      qualcomm: "Snapdragon 8 Elite on N3 — mobile premium chips compete with AI chips for wafers",
      asml: "N3 and N2 require EUV — ASML High-NA tools are the upstream gating factor",
      amat: "Deposition and etch tool upgrades needed for N3 process steps",
      klac: "Metrology critical at N3 — smaller geometries need more inspection steps",
      tel: "Coat/develop tools deployed in every N3 layer patterning step",
    },
  },
  {
    id: "euv-ban",
    label: "EUV export ban expands",
    subtitle: "ASML blocked from additional markets — advanced fab capacity freezes",
    nodes: ["asml","zeiss","tsmc","samsung-foundry","intel","skhynix","micron","samsung-memory",
            "nvidia","amd","broadcom","apple"],
    color: "#185FA5",
    why: {
      asml: "Direct revenue impact — new EUV machine sales blocked; High-NA ramp at risk",
      zeiss: "Sole EUV optics supplier — ban effectively also bans Zeiss-dependent machines",
      tsmc: "Can't expand N2/A16 capacity without additional EUV tools",
      "samsung-foundry": "3GAP and 2nm node rollout requires High-NA EUV delivery",
      intel: "18A process requires High-NA EUV — foundry comeback timeline slips",
      skhynix: "HBM4 uses EUV DRAM — capacity growth frozen without new tools",
      micron: "1-gamma DRAM node requires EUV — US HBM competitiveness stalls",
      "samsung-memory": "Advanced DRAM scaling stalls — HBM3E/4 ramp constrained",
      nvidia: "Chip roadmap depends on foundry node progression — Rubin timeline slips",
      amd: "MI-series next-gen on N2 — delayed if TSMC can't expand N2 capacity",
      broadcom: "TPU v7+ roadmap depends on N2/A16 capacity availability",
      apple: "A19/M5 on N2 — Apple's product roadmap exposed to TSMC capacity freeze",
    },
  },
  {
    id: "power-constraint",
    label: "Datacenter power / energy wall",
    subtitle: "Grid capacity limits AI buildout — hyperscaler capex plans slip by 18–24 months",
    nodes: ["nvidia","supermicro","dell","foxconn","arista",
            "microsoft","google","amazon","meta","openai","oracle","coreweave","xai"],
    color: "#6B7280",
    why: {
      nvidia: "GPU shipments can't be absorbed — racks built but power not yet connected",
      supermicro: "Server assembly backlog grows but deployment stalls waiting on power",
      dell: "Enterprise AI server deliveries outpace customer power readiness",
      foxconn: "Rack manufacturing demand drops if hyperscaler build timelines slip",
      arista: "Network switch deployments tied to rack deployments — both stall",
      microsoft: "Has flagged grid constraints as a key limiting factor for Azure expansion",
      google: "Building nuclear and solar deals specifically to address power shortage",
      amazon: "AWS datacenter expansion slowed by permitting and grid interconnection queues",
      meta: "Louisiana and Texas builds face multi-year power connection timelines",
      openai: "Stargate and in-house compute expansion gated on power availability",
      oracle: "OCI expansion explicitly power-constrained — new regions take 3+ years",
      coreweave: "GPU cloud capacity additions require power contracts that take 18+ months",
      xai: "Colossus 2 built faster than grid could support — external generators used",
    },
  },
  {
    id: "optical-transition",
    label: "Optical interconnects go mainstream",
    subtitle: "Copper hits bandwidth limits — photonics winners emerge at rack and switch scale",
    nodes: ["nvidia","broadcom","marvell","astera","arista","tsmc","microsoft","google","amazon","meta"],
    color: "#0E7490",
    why: {
      nvidia: "NVLink and rack-scale interconnects must go optical at 800G+ — Nvidia invests $6B+ in photonics",
      broadcom: "Tomahawk switch silicon ships with co-packaged optics — major design win at stake",
      marvell: "Optical DSPs and PAM4 silicon — positioned as the key enabler of CPO transition",
      astera: "PCIe and CXL retimers extend into optical domain — critical rack connectivity role",
      arista: "Switch infrastructure must support optical ports — hardware refresh cycle triggered",
      tsmc: "Silicon photonics chips fabbed at TSMC — foundry role in optical transition",
      microsoft: "Azure GB300 racks require optical interconnects — Maia 2 designed for it",
      google: "TPU v6+ clusters already using in-package optical at scale",
      amazon: "Trainium 3 clusters require optical bandwidth — Marvell supply critical",
      meta: "Meta's MTIA inference clusters and Llama training need optical scale-out",
    },
  },
  {
    id: "custom-asic-inflection",
    label: "Custom ASIC inflection — hyperscalers defect from Nvidia",
    subtitle: "Google TPU, Amazon Trainium, Meta MTIA reach critical mass for inference workloads",
    nodes: ["broadcom","marvell","tsmc","arm","google","amazon","microsoft","meta","openai","anthropic","nvidia"],
    color: "#7C3AED",
    why: {
      broadcom: "Designs Google TPU and other custom ASICs — direct beneficiary of ASIC shift",
      marvell: "Designs Amazon Trainium and Microsoft Maia interconnect — custom silicon wave",
      tsmc: "Fabrics all custom ASICs — more diverse customer base, same fab demand",
      arm: "All hyperscaler custom chips use Arm ISA — licensing revenue scales with ASIC volume",
      google: "TPU v5/v6 now match H100 on inference cost — internal deployment accelerating",
      amazon: "Trainium 2/3 now training frontier models — reducing Nvidia GPU dependency",
      microsoft: "Maia 2 handles Azure inference — reduces GPU purchase volume at margin",
      meta: "MTIA v2 handles 50%+ of Meta's inference — Nvidia GPU share shrinking",
      openai: "Signed ASIC deal with Broadcom — XPU could handle significant inference by 2027",
      anthropic: "Committed to 1M+ TPUs with Google — primary training may shift off Nvidia GPUs",
      nvidia: "Inference market share threatened — GPU still dominates training but margin risk grows",
    },
  },
  {
    id: "token-commoditization",
    label: "Frontier token prices collapse",
    subtitle: "DeepSeek-style efficiency shock — training capex pauses, inference chips reprice",
    nodes: ["openai","anthropic","xai","nvidia","amd","broadcom","marvell",
            "microsoft","google","amazon","oracle","coreweave"],
    color: "#BE123C",
    why: {
      openai: "Forced to cut token prices to compete with cheap Chinese models — IPO margin story weakens",
      anthropic: "Claude pricing under pressure — cost of inference must fall to stay competitive",
      xai: "Grok competing in a commoditizing inference market — Colossus ROI at risk",
      nvidia: "If training runs shrink and inference cheapens, GPU demand growth thesis weakens",
      amd: "MI-series positioned for inference — commoditization compresses ASP",
      broadcom: "Custom ASIC economics improve relative to GPU when token economics tighten",
      marvell: "Same — inference ASIC thesis strengthens as GPU TCO looks expensive",
      microsoft: "Azure AI revenue at risk if customers shift to cheaper token providers",
      google: "TPU economics benefit — in-house compute looks smarter as external pricing falls",
      amazon: "AWS GPU cloud pricing must fall to match — Trainium investment looks prescient",
      oracle: "OCI GPU cloud revenue under pressure — customers shop for cheapest token source",
      coreweave: "Pure-play GPU cloud faces margin compression as inference pricing collapses",
    },
  },
  {
    id: "chips-act",
    label: "CHIPS Act beneficiaries",
    subtitle: "US onshoring dollars flow to domestic fabs, equipment, and packaging",
    nodes: ["intel","micron","tsmc","globalfoundries","samsung-foundry","ase","amkor","amat","lrcx","klac"],
    color: "#15803D",
    why: {
      intel: "Largest single CHIPS Act recipient — $8.5B grant + $11B loans for Ohio/Arizona fabs",
      micron: "~$6B grant for New York and Idaho DRAM fabs — US HBM production enabled",
      tsmc: "~$6.6B for Arizona N4/N2 fabs — first leading-edge fab on US soil",
      globalfoundries: "$1.5B for Maltese fab expansion — trailing-edge strategic node funding",
      "samsung-foundry": "~$6B for Taylor, Texas fab — N2 node US production",
      ase: "Advanced packaging in Arizona benefits from CHIPS packaging provisions",
      amkor: "New Arizona OSAT facility co-invested with TSMC — packaging onshoring",
      amat: "Equipment suppliers benefit from increased domestic fab construction orders",
      lrcx: "Domestic fab builds require full etch tool refresh — order backlog grows",
      klac: "Every new domestic fab line requires process control tools — direct beneficiary",
    },
  },
  {
    id: "arm-disruption",
    label: "Arm license disruption",
    subtitle: "Arm tightens licensing or raises royalties — Qualcomm, Apple, and Nvidia Grace exposed",
    nodes: ["arm","nvidia","qualcomm","apple","amazon","tsmc","samsung-foundry"],
    color: "#92400E",
    why: {
      arm: "Controls the ISA — any license renegotiation or litigation creates uncertainty across the industry",
      nvidia: "Grace CPU in GB200 uses Arm ISA — license disruption threatens server CPU roadmap",
      qualcomm: "Entire Snapdragon portfolio is Arm-based — existential licensing risk",
      apple: "Apple Silicon is Arm-derived — iPhone, Mac, iPad all exposed",
      amazon: "Graviton server CPUs are Arm — AWS cost advantage at risk if royalties rise",
      tsmc: "Customer order mix changes if Arm-based chip designs stall",
      "samsung-foundry": "Exynos and other Arm-based customer chips affected",
    },
  },
  {
    id: "intel-foundry-comeback",
    label: "Intel 18A foundry comeback",
    subtitle: "18A yields — TSMC gets its first credible leading-edge competitor since 2016",
    nodes: ["intel","microsoft","apple","asml","amat","klac","arm","snps","cdns"],
    color: "#0369A1",
    why: {
      intel: "18A success validates Intel Foundry as a business — stock re-rating event",
      microsoft: "First announced 18A customer — Maia custom silicon on Intel process",
      apple: "Announced 18A test chip — second-source for A/M-series if yields deliver",
      asml: "18A uses High-NA EUV — commercial validation drives next tool order cycle",
      amat: "Intel 18A uses AMAT's backside power delivery process tech — key win",
      klac: "New process node at Intel requires full KLA metrology refresh",
      arm: "Intel Foundry customers still use Arm ISA — design win volume grows",
      snps: "Intel 18A PDK supported in Synopsys — design wins increase tool revenue",
      cdns: "Same — Cadence tools validated on 18A process",
    },
  },
  {
    id: "memory-oversupply",
    label: "Memory price collapse / DRAM oversupply",
    subtitle: "Samsung floods market — HBM pricing craters, Micron and SK Hynix margins crushed",
    nodes: ["skhynix","micron","samsung-memory","samsung-foundry","lrcx","amat","nvidia"],
    color: "#0F766E",
    why: {
      skhynix: "HBM price leader — if spot market collapses, ASP and gross margin fall sharply",
      micron: "US DRAM maker most exposed to commodity pricing cycles — margin at risk",
      "samsung-memory": "Samsung uses DRAM oversupply as strategic weapon — harms all peers",
      "samsung-foundry": "Memory and foundry divisions cross-subsidize — overall Samsung margins at risk",
      lrcx: "Memory capex cuts directly reduce etch tool orders — largest revenue impact",
      amat: "Same — DRAM capex is a major equipment spending driver",
      nvidia: "Cheaper HBM improves GPU margins if Nvidia captures the savings vs passing on to customers",
    },
  },
  {
    id: "asml-shock",
    label: "ASML supply shock",
    subtitle: "High-NA EUV ramp delayed — 2nm node timelines slip 18+ months industry-wide",
    nodes: ["asml","zeiss","tsmc","samsung-foundry","intel","skhynix","micron","nvidia","amd","apple"],
    color: "#185FA5",
    why: {
      asml: "Manufacturing bottleneck — each High-NA system takes 18+ months to build",
      zeiss: "Sole optics supplier — any Zeiss capacity constraint directly limits ASML output",
      tsmc: "N2 and A16 nodes require High-NA EUV — delay pushes out leading-edge capacity",
      "samsung-foundry": "2nm node schedule depends on High-NA tool delivery",
      intel: "18A uses High-NA — Intel Foundry launch timeline directly tied to ASML",
      skhynix: "HBM4 next-gen DRAM needs EUV scaling — capacity growth stalls",
      micron: "1-gamma DRAM advancement requires EUV tool availability",
      nvidia: "Rubin GPU roadmap depends on TSMC N2 availability — slips with ASML",
      amd: "EPYC and MI-series next-gen both N2-targeted — collateral delay",
      apple: "A19/M5 chip roadmap on N2 — iPhone launch timeline at risk",
    },
  },
  {
    id: "ai-capex-supercycle",
    label: "AI capex supercycle accelerates",
    subtitle: "Hyperscalers collectively double 2027 capex — every link in the chain reprices",
    nodes: ["nvidia","skhynix","micron","tsmc","broadcom","marvell","astera",
            "supermicro","dell","foxconn","arista",
            "microsoft","google","amazon","meta","oracle","coreweave"],
    color: "#B45309",
    why: {
      nvidia: "GPU demand doubles — H100 to H200 to Blackwell cycle compresses, Rubin pulled in",
      skhynix: "HBM demand doubles with GPU shipments — pricing power and margin expansion",
      micron: "US HBM share grows — $15B+ revenue opportunity if supply keeps pace",
      tsmc: "Leading-edge wafer demand doubles — pricing power increases, capex justified",
      broadcom: "Custom ASIC demand from all five hyperscalers accelerates — 44% CAGR",
      marvell: "Trainium and Maia ramps accelerate — custom silicon revenue beats estimates",
      astera: "Every AI rack needs connectivity silicon — revenue scales linearly with GPU shipments",
      supermicro: "AI server assembly demand doubles — backlog grows 18 months",
      dell: "Enterprise AI server demand inflects — GPU server mix reaches 40%+ of revenue",
      foxconn: "GB200 rack manufacturing for Nvidia — volume order locks in capacity",
      arista: "AI network switch refresh cycle accelerates — 800G ports go mainstream",
      microsoft: "Azure AI becomes largest cloud AI revenue generator — capex justified",
      google: "TPU and GPU deployments both scale — GCP AI revenue inflects",
      amazon: "AWS AI chip mix shifts — $20B+ annualized AI infrastructure",
      meta: "Llama training scale and inference expansion drive massive capex",
      oracle: "Stargate and OCI GPU cloud become core business — stock re-rates",
      coreweave: "Pure-play GPU cloud revenue doubles — IPO timing looks prescient",
    },
  },
  {
    id: "openai-demand-shock",
    label: "OpenAI demand shock",
    subtitle: "OpenAI's compute buildout alone becomes a market-moving event",
    nodes: ["openai","microsoft","oracle","coreweave","nvidia","tsmc","skhynix","broadcom","supermicro","foxconn","arista"],
    color: "#7C3AED",
    why: {
      openai: "The largest single buyer of AI compute — $100B+ GPU deal with Nvidia alone",
      microsoft: "Azure hosts OpenAI — $500B Stargate commitment forces massive capex reallocation",
      oracle: "Stargate co-investor — OCI becomes primary non-Azure OpenAI hosting platform",
      coreweave: "OpenAI signed multi-year GPU cloud deal — single largest coreweave customer",
      nvidia: "OpenAI direct GPU deal represents ~$100B equity + hardware — reshapes demand curve",
      tsmc: "OpenAI GPU orders flow through TSMC N3/N4 — meaningful allocation impact",
      skhynix: "HBM demand from OpenAI GPU orders is multi-billion-dollar contract",
      broadcom: "XPU custom chip deal — OpenAI ASIC could be Broadcom's largest ever customer",
      supermicro: "AI rack assembly for Stargate — $1B+ revenue concentration",
      foxconn: "GB200 rack manufacturing — OpenAI Stargate is a key end customer",
      arista: "Networking for Stargate datacenters — hundreds of thousands of switch ports",
    },
  },
  {
    id: "hbm4-transition",
    label: "HBM4 transition — SK Hynix lead widens",
    subtitle: "HBM4 yields only at SK Hynix in 2026 — Samsung and Micron miss the Blackwell Ultra cycle",
    nodes: ["skhynix","micron","samsung-memory","lrcx","nvidia","amd","openai","xai","coreweave"],
    color: "#0F766E",
    why: {
      skhynix: "Only memory maker shipping HBM4 in volume — pricing power maximized, Nvidia sole-sourced",
      micron: "Behind on HBM4 — risks missing Blackwell Ultra GPU generation entirely",
      "samsung-memory": "HBM3E qualification struggles persist — HBM4 timeline even further behind",
      lrcx: "HBM4 stacking requires advanced etch — Lam tools are the process enabler",
      nvidia: "Blackwell Ultra requires HBM4 — allocation fully dependent on Hynix yields",
      amd: "MI400 series also HBM4-targeted — same supply concentration risk as Nvidia",
      openai: "GPU shipment timing determines training cluster expansion — HBM gated",
      xai: "Colossus 3 expansion requires next-gen GPUs — waits on HBM4 supply",
      coreweave: "Next-gen GPU capacity additions require HBM4-equipped chips",
    },
  },
  {
    id: "geopolitical-japan-korea",
    label: "Japan / Korea export controls",
    subtitle: "Allied nations restrict semiconductor materials and equipment exports under US pressure",
    nodes: ["shin-etsu","sumco","jsr","zeiss","tel","skhynix","samsung-foundry","samsung-memory","tsmc","asml"],
    color: "#6B7280",
    why: {
      "shin-etsu": "World's largest wafer supplier — Japanese export control alignment could restrict China sales",
      sumco: "Second-largest wafer supplier — same Japan export control exposure",
      jsr: "EUV photoresist monopoly — US pressure on Japan already forced METI licensing for China exports",
      zeiss: "German optics — EU export control alignment affects EUV-adjacent components",
      tel: "Tokyo Electron already restricted from China advanced node equipment sales",
      skhynix: "South Korean memory maker — US-Korea coordination on HBM export to China",
      "samsung-foundry": "Samsung advanced node chips subject to South Korean export review",
      "samsung-memory": "HBM export to Chinese AI customers under increasing scrutiny",
      tsmc: "Taiwan export alignment with US — already restricts advanced chips to China",
      asml: "Dutch export controls block EUV to China — pressure expanding to DUV",
    },
  },
  {
    id: "packaging-unbundled",
    label: "TSMC packaging monopoly breaks",
    subtitle: "ASE and Amkor close the CoWoS gap — TSMC loses pricing power on advanced packaging",
    nodes: ["tsmc","ase","amkor","nvidia","amd","broadcom","samsung-foundry","intel"],
    color: "#9A3412",
    why: {
      tsmc: "CoWoS pricing power erodes as ASE and Amkor offer credible alternatives — margin pressure",
      ase: "World's largest OSAT — investing heavily to offer CoWoS-equivalent 2.5D packaging",
      amkor: "Arizona OSAT facility targeting AI chip packaging — Nvidia and Apple customer",
      nvidia: "Benefits from packaging competition — lower CoWoS ASP improves GPU margins",
      amd: "Same — multiple packaging sources reduce supply risk and improve economics",
      broadcom: "TPU packaging options expand — less dependent on TSMC allocation",
      "samsung-foundry": "Vertically integrated — can offer packaging + fab bundle to compete with TSMC",
      intel: "EMIB and Foveros are Intel's packaging answer — competes with CoWoS directly",
    },
  },
];

type StockEffect = { dir: "up" | "down" | "mixed"; note: string };

const STOCK_EFFECTS: Record<string, Record<string, StockEffect>> = {
  "taiwan-conflict": {
    tsmc:             { dir: "down",  note: "Physical assets at risk; fabrication ceases entirely" },
    nvidia:           { dir: "down",  note: "All GPU revenue halts; stock could fall 50%+" },
    amd:              { dir: "down",  note: "Entire product line stops shipping" },
    broadcom:         { dir: "down",  note: "TPU and networking revenue disappears overnight" },
    marvell:          { dir: "down",  note: "Custom ASIC business goes to zero" },
    qualcomm:         { dir: "down",  note: "Mobile chip revenue collapses globally" },
    apple:            { dir: "down",  note: "iPhone/Mac production stops; $300B+ revenue at risk" },
    astera:           { dir: "down",  note: "No chips to ship; revenue zeroed" },
    asml:             { dir: "mixed", note: "Short-term crash; long-term fab rebuild demand bullish" },
    amat:             { dir: "down",  note: "Largest customer gone; Taiwan tool revenue disappears" },
    lrcx:             { dir: "down",  note: "Taiwan etch tool revenue gone; market disrupted" },
    klac:             { dir: "down",  note: "Metrology orders collapse with fab shutdowns" },
    tel:              { dir: "down",  note: "TSMC exposure = direct and immediate revenue loss" },
    arm:              { dir: "down",  note: "Royalties fall to zero without chip production" },
    snps:             { dir: "down",  note: "Tape-outs halt; EDA demand craters" },
    cdns:             { dir: "down",  note: "Same; subscription base erodes fast" },
    microsoft:        { dir: "down",  note: "Azure AI frozen; OpenAI partnership in jeopardy" },
    google:           { dir: "down",  note: "TPU fleet can't grow; GCP AI revenue stalls" },
    amazon:           { dir: "down",  note: "AWS AI capacity frozen; Trainium investment stranded" },
    meta:             { dir: "down",  note: "GPU buildout stops; Llama timeline indefinite" },
    openai:           { dir: "down",  note: "Compute costs spike to unaffordable levels" },
    oracle:           { dir: "down",  note: "Stargate becomes a stranded $100B investment" },
    coreweave:        { dir: "down",  note: "No new GPUs = business model collapse" },
    xai:              { dir: "down",  note: "Colossus expansion halts indefinitely" },
    anthropic:        { dir: "down",  note: "Training compute inaccessible; roadmap freezes" },
  },
  "china-export-controls": {
    asml:             { dir: "down",  note: "~30% China DUV revenue at risk from expanded ban" },
    amat:             { dir: "down",  note: "Largest single market lost; ~15-20% revenue at risk" },
    lrcx:             { dir: "down",  note: "Significant China etch tool revenue disappears" },
    klac:             { dir: "down",  note: "China process control revenue cut" },
    tel:              { dir: "down",  note: "China equipment sales restricted further" },
    snps:             { dir: "down",  note: "Huawei and SMIC EDA revenue gone" },
    cdns:             { dir: "down",  note: "Same; China advanced chip design revenue lost" },
    nvidia:           { dir: "up",    note: "H20 already banned; controls hobble Chinese GPU competition" },
    broadcom:         { dir: "down",  note: "China hyperscaler networking revenue under scrutiny" },
    qualcomm:         { dir: "down",  note: "60%+ of revenue from Chinese OEMs — largest single risk" },
    "samsung-foundry":{ dir: "up",    note: "Chinese fabs hobbled; Samsung gains fab market share" },
    "samsung-memory": { dir: "down",  note: "HBM export to China AI customers restricted" },
    jsr:              { dir: "down",  note: "EUV photoresist export ban expands; China revenue lost" },
    "shin-etsu":      { dir: "down",  note: "Wafer exports to Chinese fabs restricted" },
    sumco:            { dir: "down",  note: "Same; China wafer export revenue at risk" },
  },
  "hbm-shortage": {
    skhynix:          { dir: "up",    note: "Sole qualified supplier; ASP and margin surge dramatically" },
    micron:           { dir: "up",    note: "Second-source scarcity premium; ASP improves" },
    "samsung-memory": { dir: "down",  note: "HBM3E qualification lag exposed publicly; share loss" },
    nvidia:           { dir: "down",  note: "GPU shipments slip; revenue miss vs estimates" },
    amd:              { dir: "down",  note: "MI-series constrained alongside Nvidia" },
    lrcx:             { dir: "up",    note: "HBM capacity investment accelerates; etch orders rise" },
    asml:             { dir: "up",    note: "Advanced DRAM EUV demand rises with HBM investment" },
    openai:           { dir: "down",  note: "Compute expansion delayed; training timelines slip" },
    xai:              { dir: "down",  note: "Colossus expansion gated by GPU delivery" },
    coreweave:        { dir: "down",  note: "Can't add GPU capacity; customer commitments at risk" },
    microsoft:        { dir: "down",  note: "Azure GPU expansion slows; OpenAI build delayed" },
    amazon:           { dir: "down",  note: "AWS AI capacity additions constrained" },
  },
  "cowos-bottleneck": {
    tsmc:             { dir: "up",    note: "CoWoS scarcity = pricing power and margin expansion" },
    nvidia:           { dir: "down",  note: "GPU shipments directly constrained; revenue miss likely" },
    amd:              { dir: "down",  note: "MI-series in same TSMC packaging queue as Nvidia" },
    broadcom:         { dir: "down",  note: "TPU production constrained; Google build delayed" },
    ase:              { dir: "up",    note: "Overflow CoWoS demand; significant AI packaging share gain" },
    amkor:            { dir: "up",    note: "Arizona OSAT gains real share as TSMC alternative" },
    microsoft:        { dir: "down",  note: "Azure GPU fleet expansion delayed" },
    google:           { dir: "down",  note: "TPU and GPU capacity equally constrained" },
    amazon:           { dir: "down",  note: "Trainium ramp limited by packaging availability" },
    meta:             { dir: "down",  note: "GPU orders slip; Llama training schedules extend" },
    openai:           { dir: "down",  note: "Compute expansion delayed; inference capacity capped" },
    oracle:           { dir: "down",  note: "Stargate build timeline at direct risk" },
    coreweave:        { dir: "down",  note: "Can't add GPU capacity; revenue growth stalls" },
  },
  "n3-crunch": {
    tsmc:             { dir: "up",    note: "Kingmaker on N3; can raise wafer prices significantly" },
    nvidia:           { dir: "down",  note: "Rubin potentially delayed if Apple wins allocation" },
    amd:              { dir: "down",  note: "EPYC and MI-series volume at risk; timeline extends" },
    broadcom:         { dir: "down",  note: "TPU v6/v7 delayed if TSMC prioritizes Apple wafers" },
    marvell:          { dir: "down",  note: "Custom ASIC ramps gated by node availability" },
    apple:            { dir: "mixed", note: "May win allocation but share fight adds cost pressure" },
    qualcomm:         { dir: "down",  note: "Snapdragon N3 wafers compete directly with AI chips" },
    asml:             { dir: "up",    note: "N3/N2 EUV demand validates the next tool order cycle" },
    amat:             { dir: "up",    note: "N3 process tools in high demand; orders grow" },
    klac:             { dir: "up",    note: "More metrology steps at smaller nodes = more revenue" },
    tel:              { dir: "up",    note: "Coat/develop tools in every N3 layer" },
  },
  "euv-ban": {
    asml:             { dir: "down",  note: "New EUV machine sales blocked; High-NA ramp delayed" },
    zeiss:            { dir: "down",  note: "Sole optics supplier — ban effectively hits Zeiss too" },
    tsmc:             { dir: "down",  note: "N2/A16 expansion frozen without new EUV tools" },
    "samsung-foundry":{ dir: "down",  note: "2nm node timeline slips 18+ months" },
    intel:            { dir: "down",  note: "18A foundry comeback timeline directly blocked" },
    skhynix:          { dir: "down",  note: "HBM4 capacity growth frozen without EUV tools" },
    micron:           { dir: "down",  note: "1-gamma DRAM advancement stalls" },
    "samsung-memory": { dir: "down",  note: "Advanced DRAM scaling halts at current node" },
    nvidia:           { dir: "down",  note: "Rubin GPU on N2 delayed; roadmap slips" },
    amd:              { dir: "down",  note: "Next-gen MI-series timeline pushed out" },
    broadcom:         { dir: "down",  note: "TPU v7+ depends on N2 capacity availability" },
    apple:            { dir: "down",  note: "A19/M5 on N2 — iPhone launch timing at risk" },
  },
  "power-constraint": {
    nvidia:           { dir: "mixed", note: "Demand unaffected; deployment delays = revenue timing risk" },
    supermicro:       { dir: "down",  note: "Rack backlog grows but deployments stall — revenue delayed" },
    dell:             { dir: "down",  note: "AI server delivery outpaces customer power readiness" },
    foxconn:          { dir: "down",  note: "GB200 rack manufacturing demand drops if builds stall" },
    arista:           { dir: "down",  note: "Switch deployments tied to rack build timelines" },
    microsoft:        { dir: "down",  note: "Azure expansion constrained; capex plans slip 18-24 months" },
    google:           { dir: "down",  note: "Datacenter build timelines extend significantly" },
    amazon:           { dir: "down",  note: "AWS expansion gated by grid permitting and interconnection" },
    meta:             { dir: "down",  note: "Louisiana and Texas builds face multi-year power delays" },
    openai:           { dir: "down",  note: "Stargate power connection timelines add 18+ months" },
    oracle:           { dir: "down",  note: "OCI expansion explicitly power-constrained" },
    coreweave:        { dir: "down",  note: "GPU capacity additions need 18-month power contracts" },
    xai:              { dir: "down",  note: "Colossus external generator dependency is a liability" },
  },
  "optical-transition": {
    nvidia:           { dir: "mixed", note: "Must invest in photonics; near-term cost, long-term moat" },
    broadcom:         { dir: "up",    note: "Co-packaged optics is their core thesis; massive design wins" },
    marvell:          { dir: "up",    note: "Optical DSP silicon is their biggest near-term catalyst" },
    astera:           { dir: "up",    note: "CXL and optical connectivity expand in tandem" },
    arista:           { dir: "up",    note: "800G optical switch refresh = multi-year revenue wave" },
    tsmc:             { dir: "up",    note: "Silicon photonics chips fabbed at TSMC" },
    microsoft:        { dir: "up",    note: "GB300 optical racks lower total compute cost" },
    google:           { dir: "up",    note: "Already using in-package optical; cost advantage widens" },
    amazon:           { dir: "up",    note: "Trainium 3 optical design gives cost edge vs GPU racks" },
    meta:             { dir: "up",    note: "Optical scale-out reduces MTIA cluster cost" },
  },
  "custom-asic-inflection": {
    broadcom:         { dir: "up",    note: "Direct ASIC revenue from 5 hyperscalers; best positioned" },
    marvell:          { dir: "up",    note: "Trainium and Maia ramps hit estimates; stock re-rates" },
    tsmc:             { dir: "up",    note: "More diverse chip customers; same leading-edge fab demand" },
    arm:              { dir: "up",    note: "All custom ASICs use Arm ISA; royalties scale with volume" },
    google:           { dir: "up",    note: "TPU economics vs GPU improve; GCP margins widen" },
    amazon:           { dir: "up",    note: "Trainium TCO advantage grows; AWS margin expands" },
    microsoft:        { dir: "up",    note: "Maia reduces Nvidia dependency; Azure margin improves" },
    meta:             { dir: "up",    note: "MTIA cuts Nvidia spend; margin story strengthens" },
    openai:           { dir: "mixed", note: "XPU deal lowers long-term cost; near-term execution risk" },
    anthropic:        { dir: "up",    note: "TPU commitment lowers training cost vs GPU clusters" },
    nvidia:           { dir: "down",  note: "Inference market share erodes; GPU ASP under pressure" },
  },
  "token-commoditization": {
    openai:           { dir: "down",  note: "Token revenue margin collapses; IPO story weakens" },
    anthropic:        { dir: "down",  note: "Claude pricing pressure; fundraising multiple at risk" },
    xai:              { dir: "down",  note: "Grok inference ROI on Colossus deteriorates" },
    nvidia:           { dir: "down",  note: "Training capex pauses; GPU demand growth thesis weakens" },
    amd:              { dir: "down",  note: "MI-series inference chips reprice as market commoditizes" },
    broadcom:         { dir: "up",    note: "ASIC economics improve as GPU TCO looks expensive" },
    marvell:          { dir: "up",    note: "Custom silicon thesis strengthens on GPU margin pressure" },
    microsoft:        { dir: "down",  note: "Azure AI revenue margin at risk from cheap competition" },
    google:           { dir: "mixed", note: "TPU costs drop; Gemini revenue margin also under pressure" },
    amazon:           { dir: "mixed", note: "Trainium looks prescient; AWS AI pricing must fall too" },
    oracle:           { dir: "down",  note: "OCI GPU cloud revenue under severe margin pressure" },
    coreweave:        { dir: "down",  note: "Inference pricing collapse = direct margin compression" },
  },
  "chips-act": {
    intel:            { dir: "up",    note: "$8.5B grant + $11B loans de-risk the foundry bet entirely" },
    micron:           { dir: "up",    note: "$6B grant enables US HBM production — stock re-rates" },
    tsmc:             { dir: "up",    note: "Arizona fab de-risked; $6.6B grant validates US strategy" },
    globalfoundries:  { dir: "up",    note: "$1.5B Malta expansion; trailing-edge strategic moat grows" },
    "samsung-foundry":{ dir: "up",    note: "$6B Taylor TX grant; US fab presence established" },
    ase:              { dir: "up",    note: "Packaging grant de-risks Arizona OSAT build" },
    amkor:            { dir: "up",    note: "Co-investment with TSMC; packaging onshoring funded" },
    amat:             { dir: "up",    note: "Domestic fab builds generate a fresh equipment order wave" },
    lrcx:             { dir: "up",    note: "New US fabs need full etch tool refresh" },
    klac:             { dir: "up",    note: "Every new domestic fab line requires KLA process control" },
  },
  "arm-disruption": {
    arm:              { dir: "mixed", note: "Higher royalties short-term; customer RISC-V migration risk" },
    nvidia:           { dir: "down",  note: "Grace CPU roadmap threatened; datacenter plans at risk" },
    qualcomm:         { dir: "down",  note: "Entire portfolio at risk; most exposed company in the chain" },
    apple:            { dir: "down",  note: "A/M-series uses Arm ISA; no viable alternative short-term" },
    amazon:           { dir: "down",  note: "Graviton cost advantage erodes if royalties spike" },
    tsmc:             { dir: "down",  note: "Arm-based chip tape-outs slow if designers pause" },
    "samsung-foundry":{ dir: "down",  note: "Exynos and Arm customer designs affected" },
  },
  "intel-foundry-comeback": {
    intel:            { dir: "up",    note: "18A success = major stock re-rating; foundry thesis proven" },
    microsoft:        { dir: "up",    note: "First 18A customer; chip costs fall, margins improve" },
    apple:            { dir: "up",    note: "Second-source optionality reduces TSMC pricing leverage" },
    asml:             { dir: "up",    note: "High-NA commercial validation drives next order cycle" },
    amat:             { dir: "up",    note: "18A uses AMAT backside power delivery — key process win" },
    klac:             { dir: "up",    note: "Intel 18A requires full KLA metrology refresh" },
    arm:              { dir: "up",    note: "18A customer chips use Arm ISA; royalty volume grows" },
    snps:             { dir: "up",    note: "18A PDK in Synopsys drives tape-out revenue" },
    cdns:             { dir: "up",    note: "Cadence 18A design tools validated; customer wins" },
  },
  "memory-oversupply": {
    skhynix:          { dir: "down",  note: "ASP and gross margin fall sharply on spot price collapse" },
    micron:           { dir: "down",  note: "Commodity DRAM crush; memory revenue down 30-40%" },
    "samsung-memory": { dir: "mixed", note: "Strategic pricing weapon — but own margins also crushed" },
    "samsung-foundry":{ dir: "down",  note: "Memory losses drag overall Samsung financials" },
    lrcx:             { dir: "down",  note: "Memory capex cuts directly reduce etch tool orders" },
    amat:             { dir: "down",  note: "DRAM capex is a major spending driver — falls with prices" },
    nvidia:           { dir: "up",    note: "Cheaper HBM improves GPU margins if savings are captured" },
  },
  "asml-shock": {
    asml:             { dir: "down",  note: "Revenue misses as High-NA tool deliveries slip significantly" },
    zeiss:            { dir: "down",  note: "Root cause of delay; optics bottleneck exposed publicly" },
    tsmc:             { dir: "down",  note: "N2 and A16 capacity expansion frozen" },
    "samsung-foundry":{ dir: "down",  note: "2nm node schedule slips 18+ months" },
    intel:            { dir: "down",  note: "18A foundry comeback timeline directly tied to ASML delivery" },
    skhynix:          { dir: "down",  note: "HBM4 capacity growth stalls without EUV tools" },
    micron:           { dir: "down",  note: "1-gamma DRAM node advancement stalls" },
    nvidia:           { dir: "down",  note: "Rubin GPU on N2 delayed; chip roadmap slips" },
    amd:              { dir: "down",  note: "EPYC and MI next-gen both N2-targeted; collateral delay" },
    apple:            { dir: "down",  note: "A19/M5 on N2 — iPhone launch timeline at risk" },
  },
  "ai-capex-supercycle": {
    nvidia:           { dir: "up",    note: "GPU demand doubles; H100→Blackwell→Rubin cycle compresses" },
    skhynix:          { dir: "up",    note: "HBM demand doubles; pricing power and margin expand" },
    micron:           { dir: "up",    note: "$15B+ revenue opportunity if US HBM supply keeps pace" },
    tsmc:             { dir: "up",    note: "Leading-edge wafer demand doubles; pricing power rises" },
    broadcom:         { dir: "up",    note: "Custom ASIC demand from all 5 hyperscalers accelerates" },
    marvell:          { dir: "up",    note: "Trainium and Maia ramps beat estimates; stock re-rates" },
    astera:           { dir: "up",    note: "Every AI rack needs connectivity silicon; scales linearly" },
    supermicro:       { dir: "up",    note: "AI server assembly demand doubles; backlog grows 18 months" },
    dell:             { dir: "up",    note: "GPU server mix reaches 40%+ of revenue; margin expands" },
    foxconn:          { dir: "up",    note: "GB200 rack manufacturing volume locks in long-term capacity" },
    arista:           { dir: "up",    note: "800G port refresh cycle accelerates; multi-year wave" },
    microsoft:        { dir: "up",    note: "Azure AI becomes the largest cloud AI revenue generator" },
    google:           { dir: "up",    note: "GCP AI inflects; TPU and GPU deployments both scale" },
    amazon:           { dir: "up",    note: "AWS AI infrastructure investment pays off at scale" },
    meta:             { dir: "up",    note: "Llama training at scale justifies massive capex" },
    oracle:           { dir: "up",    note: "Stargate and OCI GPU cloud re-rate the stock meaningfully" },
    coreweave:        { dir: "up",    note: "Pure-play GPU cloud revenue doubles; IPO timing ideal" },
  },
  "openai-demand-shock": {
    openai:           { dir: "up",    note: "Revenue and valuation surge; IPO window opens" },
    microsoft:        { dir: "up",    note: "Azure AI revenue surge; $500B Stargate commitment justified" },
    oracle:           { dir: "up",    note: "OCI becomes primary non-Azure OpenAI host; stock re-rates" },
    coreweave:        { dir: "up",    note: "OpenAI anchor customer validates GPU cloud at scale" },
    nvidia:           { dir: "up",    note: "$100B+ direct order; largest single customer in history" },
    tsmc:             { dir: "up",    note: "GPU wafer orders are a meaningful allocation event" },
    skhynix:          { dir: "up",    note: "HBM demand from Nvidia GPU surge = multi-billion contract" },
    broadcom:         { dir: "up",    note: "XPU ASIC deal could be Broadcom's largest customer ever" },
    supermicro:       { dir: "up",    note: "AI rack assembly for Stargate; $1B+ revenue concentration" },
    foxconn:          { dir: "up",    note: "GB200 rack manufacturing for Stargate DCs" },
    arista:           { dir: "up",    note: "Hundreds of thousands of switch ports across Stargate DCs" },
  },
  "hbm4-transition": {
    skhynix:          { dir: "up",    note: "Sole HBM4 supplier = maximum pricing power; stock re-rates" },
    micron:           { dir: "down",  note: "Risks missing Blackwell Ultra generation; stock de-rates" },
    "samsung-memory": { dir: "down",  note: "HBM3E issues persist; HBM4 timeline even further behind" },
    lrcx:             { dir: "up",    note: "HBM4 stacking requires advanced etch; orders accelerate" },
    nvidia:           { dir: "mixed", note: "Chips ship but sole-sourced from Hynix = supply risk premium" },
    amd:              { dir: "down",  note: "MI400 delayed if HBM4 supply concentrated at Hynix only" },
    openai:           { dir: "down",  note: "GPU delivery timing risk delays cluster expansion" },
    xai:              { dir: "down",  note: "Colossus 3 expansion requires next-gen GPUs" },
    coreweave:        { dir: "down",  note: "Next-gen GPU capacity additions delayed" },
  },
  "geopolitical-japan-korea": {
    "shin-etsu":      { dir: "down",  note: "Japan allied control alignment restricts China sales" },
    sumco:            { dir: "down",  note: "Same; China wafer export revenue at risk" },
    jsr:              { dir: "down",  note: "Prior METI restrictions expand; China photoresist revenue lost" },
    zeiss:            { dir: "down",  note: "EU aligned on EUV-adjacent component exports" },
    tel:              { dir: "down",  note: "Already restricted; further US-Japan alignment cuts more" },
    skhynix:          { dir: "down",  note: "HBM to China AI customers under export scrutiny" },
    "samsung-foundry":{ dir: "mixed", note: "Export review adds uncertainty; rival hobbling is a benefit" },
    "samsung-memory": { dir: "down",  note: "HBM export to China increasingly restricted" },
    tsmc:             { dir: "up",    note: "Allied coordination benefits Taiwan; competitor access cut" },
    asml:             { dir: "down",  note: "DUV restrictions expand further; China sales window closes" },
  },
  "packaging-unbundled": {
    tsmc:             { dir: "down",  note: "CoWoS pricing power erodes; margin compression likely" },
    ase:              { dir: "up",    note: "Gains AI chip packaging share; world's largest OSAT wins" },
    amkor:            { dir: "up",    note: "Arizona OSAT for AI chips gains Nvidia and Apple orders" },
    nvidia:           { dir: "up",    note: "Packaging competition lowers CoWoS cost; GPU margins improve" },
    amd:              { dir: "up",    note: "Multiple packaging sources reduce supply risk and cost" },
    broadcom:         { dir: "up",    note: "TPU packaging options expand; TSMC leverage reduced" },
    "samsung-foundry":{ dir: "up",    note: "Fab+package bundle competes directly with TSMC offering" },
    intel:            { dir: "up",    note: "EMIB and Foveros gain credibility vs CoWoS" },
  },
};

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
              <div className="fixed right-0 top-[55px] bottom-0 z-50 w-72 border-l border-gray-200 bg-white shadow-2xl flex flex-col">
                <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                    20 investor scenarios
                  </span>
                  <button
                    onClick={() => setDropdownOpen(false)}
                    className="text-gray-400 hover:text-gray-600 text-sm leading-none"
                  >
                    ✕
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto">
                  {SCENARIOS.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => selectScenario(s.id)}
                      className={`block w-full border-b border-gray-50 px-4 py-3 text-left last:border-b-0 hover:bg-gray-50 transition-colors ${
                        scenario === s.id ? "bg-[#FFF7ED]" : ""
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className="mt-0.5 h-2 w-2 shrink-0 rounded-full"
                          style={{ backgroundColor: s.color }}
                        />
                        <span className="text-[12px] font-semibold text-gray-800 leading-snug">{s.label}</span>
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
                  <div className="border-t border-gray-100 px-4 py-3">
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

      {/* Active scenario panel */}
      {activeScenario && (
        <div
          className="border-b"
          style={{ borderColor: activeScenario.color + "30", backgroundColor: activeScenario.color + "08" }}
        >
          {/* Panel header */}
          <div className="flex items-start gap-3 px-4 pt-3 pb-2">
            <span
              className="mt-0.5 h-2.5 w-2.5 shrink-0 rounded-full"
              style={{ backgroundColor: activeScenario.color }}
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-baseline gap-2 flex-wrap">
                <span className="text-sm font-bold" style={{ color: activeScenario.color }}>
                  {activeScenario.label}
                </span>
                <span className="text-xs text-gray-500">{activeScenario.subtitle}</span>
              </div>
              <div className="mt-0.5 text-[11px] text-gray-400">
                {activeScenario.nodes.length} companies affected — highlighted on the map
              </div>
            </div>
            <button
              onClick={() => setScenario(null)}
              className="shrink-0 text-gray-400 hover:text-gray-600 text-sm leading-none mt-0.5"
            >
              ✕
            </button>
          </div>
          {/* Affected companies grid */}
          <div className="px-4 pb-3 grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-0">
            {activeScenario.nodes.map((nid) => {
              const node = NODES.find((n) => n.id === nid);
              const reason = activeScenario.why[nid];
              const effect = STOCK_EFFECTS[activeScenario.id]?.[nid];
              if (!node) return null;
              const effectColor = effect?.dir === "up" ? "#16a34a" : effect?.dir === "down" ? "#dc2626" : "#6b7280";
              const effectArrow = effect?.dir === "up" ? "▲" : effect?.dir === "down" ? "▼" : "↔";
              return (
                <div
                  key={nid}
                  className="flex items-start gap-2 py-2 border-b border-gray-100 last:border-0"
                >
                  <span
                    className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full"
                    style={{ backgroundColor: TIER_COLORS[node.tier as Tier] }}
                  />
                  <div className="min-w-0">
                    <div>
                      <span className="text-[11px] font-semibold text-gray-800">{node.ticker ?? node.name}</span>
                      {reason && (
                        <span className="text-[11px] text-gray-500"> — {reason}</span>
                      )}
                    </div>
                    {effect && (
                      <div className="mt-0.5 flex items-start gap-1">
                        <span className="text-[10px] font-bold leading-tight shrink-0" style={{ color: effectColor }}>
                          {effectArrow}
                        </span>
                        <span className="text-[10px] leading-tight text-gray-500">{effect.note}</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
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
