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

// Notes grounded in Baker, Patel (SemiAnalysis), and Circuit podcast expert views
const STOCK_EFFECTS: Record<string, Record<string, StockEffect>> = {
  "taiwan-conflict": {
    tsmc:             { dir: "down",  note: "Baker: TSMC capacity decisions are the single most important variable — if gone, everything stops" },
    nvidia:           { dir: "down",  note: "Baker: Jensen has no TSMC contract — handshakes don't survive a war" },
    amd:              { dir: "down",  note: "Baker: AMD is 'always flying a little behind' — with no fab, it's over" },
    broadcom:         { dir: "down",  note: "Baker: 'everybody's favorite ASIC supplier' goes dark — TPU/XPU pipeline zeroed" },
    marvell:          { dir: "down",  note: "All custom ASICs fabbed at TSMC — Trainium, Maia, custom silicon halted" },
    qualcomm:         { dir: "down",  note: "Entire Snapdragon line is TSMC-fabbed — mobile chip revenue collapses" },
    apple:            { dir: "down",  note: "A/M-series at TSMC — iPhone and Mac production stops; largest consumer hardware failure" },
    astera:           { dir: "down",  note: "Connectivity silicon at TSMC — every AI rack build stalls" },
    asml:             { dir: "mixed", note: "Baker: A-teams at TSMC/Taiwan; short-term crash but long-term rebuild demand bullish" },
    amat:             { dir: "down",  note: "Baker: A-teams from AMAT were at TSMC — Taiwan tool revenue disappears instantly" },
    lrcx:             { dir: "down",  note: "Significant TSMC etch tool revenue gone; Circuit: memory run also disrupted" },
    klac:             { dir: "down",  note: "Process control revenue tied to TSMC output — collapses with fab shutdowns" },
    tel:              { dir: "down",  note: "TSMC is TEL's largest customer — direct, immediate revenue loss" },
    arm:              { dir: "down",  note: "Circuit: ARM went parabolic on AI CPU narrative — war zeroes the royalty stream" },
    snps:             { dir: "down",  note: "Tape-outs halt; EDA subscription base erodes as design activity stops" },
    cdns:             { dir: "down",  note: "Same as Synopsys — design tools have no value if silicon can't be produced" },
    microsoft:        { dir: "down",  note: "Azure AI frozen; Patel: OpenAI at 2GW compute — all stranded" },
    google:           { dir: "down",  note: "Patel: TPU = majority of Google/Anthropic training infra — all TSMC-fabbed" },
    amazon:           { dir: "down",  note: "Baker: Trainium is the real ASIC challenger — conflict strands the whole bet" },
    meta:             { dir: "down",  note: "GPU buildout stops; Llama training on TSMC-fabbed chips — timeline indefinite" },
    openai:           { dir: "down",  note: "Patel: OpenAI at ~2GW compute, all TSMC-dependent — costs spike to unaffordable" },
    oracle:           { dir: "down",  note: "Stargate is a $100B+ TSMC-chip bet — becomes stranded overnight" },
    coreweave:        { dir: "down",  note: "Circuit: Nvidia willed neoclouds into existence — no TSMC chips = business model collapse" },
    xai:              { dir: "down",  note: "Baker: xAI built Colossus in record time — all Nvidia/TSMC chips; expansion halts" },
    anthropic:        { dir: "down",  note: "Patel: Anthropic at 2-2.5GW on Google TPUs — all TSMC-fabbed; roadmap freezes" },
  },
  "china-export-controls": {
    asml:             { dir: "down",  note: "Patel: ASML makes ~70 EUV/year; China DUV ban removes 30% of addressable market" },
    amat:             { dir: "down",  note: "China was AMAT's largest single market — 15-20% revenue at direct risk" },
    lrcx:             { dir: "down",  note: "Significant China etch revenue; Baker: allied supply chain tightening is real" },
    klac:             { dir: "down",  note: "China process control revenue cut; KLA has highest China exposure among semi-cap" },
    tel:              { dir: "down",  note: "Already restricted from advanced nodes; further US-Japan alignment cuts more" },
    snps:             { dir: "down",  note: "Huawei and SMIC EDA revenue gone — Synopsys loses key Chinese design customers" },
    cdns:             { dir: "down",  note: "Same as Synopsys — China advanced chip design revenue lost" },
    nvidia:           { dir: "up",    note: "Circuit: H20 ban already taken; tighter controls hobble Chinese GPU competition vs Nvidia" },
    broadcom:         { dir: "down",  note: "China hyperscaler networking revenue under export scrutiny" },
    qualcomm:         { dir: "down",  note: "60%+ of Qualcomm revenue from Chinese OEMs — single largest risk in the chain" },
    "samsung-foundry":{ dir: "up",    note: "Baker: China 4 years behind and gap is growing — Samsung foundry gains share" },
    "samsung-memory": { dir: "down",  note: "HBM export to China AI customers restricted; Patel: China memory also being cut off" },
    jsr:              { dir: "down",  note: "METI restrictions on EUV photoresist already set precedent — China revenue lost" },
    "shin-etsu":      { dir: "down",  note: "Wafer exports to Chinese fabs restricted under allied export alignment" },
    sumco:            { dir: "down",  note: "Same as Shin-Etsu; China wafer export revenue at increasing risk" },
  },
  "hbm-shortage": {
    skhynix:          { dir: "up",    note: "Baker: 'HBM costs more than TSMC' in Nvidia COGS — Hynix has maximum pricing power" },
    micron:           { dir: "up",    note: "Baker: DRAM companies at mid-single digit multiples vs semi-cap at 40x = massive gap to close" },
    "samsung-memory": { dir: "down",  note: "Patel: Samsung 'effectively out of the picture for Rubin HBM4' — qualification lag exposed" },
    nvidia:           { dir: "down",  note: "Patel: CoWoS is THE Blackwell bottleneck — HBM shortage stacks on top; revenue miss" },
    amd:              { dir: "down",  note: "Patel: AMD 'pretty mid' — HBM shortage hits them alongside Nvidia with no escape route" },
    lrcx:             { dir: "up",    note: "Circuit: 'memory run continues' — HBM etch capacity investment accelerates" },
    asml:             { dir: "up",    note: "Advanced DRAM EUV demand rises; Patel: ASML capacity itself is the constraint" },
    openai:           { dir: "down",  note: "Patel: OpenAI at 2GW, targeting 10GW — GPU delivery timing risk slips the whole plan" },
    xai:              { dir: "down",  note: "Baker: xAI gets GPUs before anyone else — HBM shortage narrows that advantage" },
    coreweave:        { dir: "down",  note: "Circuit: Nvidia willed neoclouds into existence — GPU supply gap breaks the model" },
    microsoft:        { dir: "down",  note: "Azure GPU expansion slows; Patel: OpenAI/Anthropic consume 30% of Nvidia output" },
    amazon:           { dir: "down",  note: "Baker: Trainium 3 is the real challenger — HBM shortage delays the ramp that matters" },
  },
  "cowos-bottleneck": {
    tsmc:             { dir: "up",    note: "Patel: CoWoS is the actual gating constraint on Blackwell — TSMC holds all the leverage" },
    nvidia:           { dir: "down",  note: "Patel: 'CoWoS packaging is the real bottleneck, not TSMC node' — direct revenue miss" },
    amd:              { dir: "down",  note: "MI-series in the same TSMC packaging queue as Nvidia — collateral constraint" },
    broadcom:         { dir: "down",  note: "TPU production competes for same CoWoS slots — Google build delayed" },
    ase:              { dir: "up",    note: "Overflow CoWoS demand; Circuit: TSMC supply constrained all 2026 — OSATs gain" },
    amkor:            { dir: "up",    note: "Arizona OSAT gains real AI packaging share as TSMC alternative" },
    microsoft:        { dir: "down",  note: "Azure GPU fleet expansion delayed; Maia ASIC also needs advanced packaging" },
    google:           { dir: "down",  note: "TPU and GPU capacity both in same TSMC packaging queue" },
    amazon:           { dir: "down",  note: "Baker: Trainium is tugging on Superman's cape — CoWoS bottleneck delays the ramp" },
    meta:             { dir: "down",  note: "GPU orders slip; MTIA ASIC also packaging-constrained — Llama timelines extend" },
    openai:           { dir: "down",  note: "Patel: $10-15B/GW data center cost — packaging bottleneck delays every GW" },
    oracle:           { dir: "down",  note: "Stargate GPU cluster build timeline at direct risk; Oracle most exposed hyperscaler" },
    coreweave:        { dir: "down",  note: "Circuit: Nvidia neocloud ecosystem — can't add GPU capacity without packaged chips" },
  },
  "n3-crunch": {
    tsmc:             { dir: "up",    note: "Baker: TSMC capacity decisions are the single most important variable — N3 scarcity = pricing power" },
    nvidia:           { dir: "down",  note: "Patel: AI will be 86% of N3 wafer output in 2027 — Rubin delayed if Apple wins allocation" },
    amd:              { dir: "down",  note: "Patel: AMD 'pretty mid,' single-digit share — wafer crunch exposes lack of TSMC leverage" },
    broadcom:         { dir: "down",  note: "TPU v6/v7 delayed if TSMC allocates Apple's N3 wafers ahead of AI chips" },
    marvell:          { dir: "down",  note: "Custom ASIC ramps gated by node availability — all five hyperscaler programs at risk" },
    apple:            { dir: "mixed", note: "Baker: TSMC sold out in 'milliseconds' and raised prices 20% — Apple may win but pays a premium" },
    qualcomm:         { dir: "down",  note: "Snapdragon N3 wafers compete directly with AI chips — mobile loses the allocation fight" },
    asml:             { dir: "up",    note: "Patel: ASML makes 70-80 EUV/year; N3 crunch proves EUV is worth every dollar" },
    amat:             { dir: "up",    note: "Baker: A-teams at TSMC on N3 — AMAT process tools in high demand" },
    klac:             { dir: "up",    note: "More metrology steps at N3/N2; Circuit: semi-cap at 40x vs DRAM at single digits still" },
    tel:              { dir: "up",    note: "Coat/develop tools in every N3 layer; TEL benefits from TSMC expansion" },
  },
  "euv-ban": {
    asml:             { dir: "down",  note: "Patel: ASML capped at ~100 EUV/year by decade end — ban makes every unit more contested" },
    zeiss:            { dir: "down",  note: "Sole EUV optics supplier — ban is effectively a Zeiss ban too" },
    tsmc:             { dir: "down",  note: "Baker: TSMC's N2/A16 expansion is THE wafer variable — frozen without EUV tools" },
    "samsung-foundry":{ dir: "down",  note: "2nm node timeline slips 18+ months; Samsung already behind TSMC by Baker's estimate" },
    intel:            { dir: "down",  note: "Circuit: 18A keeps Intel alive; EUV ban directly blocks the 14A follow-on that saves them" },
    skhynix:          { dir: "down",  note: "Baker: HBM costs more than TSMC in Nvidia's COGS — EUV ban freezes HBM4 capacity growth" },
    micron:           { dir: "down",  note: "Patel: Micron already behind on HBM4 — EUV ban makes the gap permanent" },
    "samsung-memory": { dir: "down",  note: "Advanced DRAM scaling halts; Patel: Samsung already 'out of the picture' for Rubin HBM4" },
    nvidia:           { dir: "down",  note: "Rubin on N2 — Baker: TSMC is 18 months ahead of everyone; EUV ban freezes that lead" },
    amd:              { dir: "down",  note: "Next-gen MI-series N2-targeted; Patel: AMD already behind, ban adds to the delay" },
    broadcom:         { dir: "down",  note: "TPU v7+ on N2; Circuit: Broadcom guiding $100B AI in 2027 — that number assumes N2 ramp" },
    apple:            { dir: "down",  note: "A19/M5 on N2 — iPhone launch timing at risk; Baker: Arizona fabs near bleeding edge" },
  },
  "power-constraint": {
    nvidia:           { dir: "mixed", note: "Baker: power is 'the primary constraint on AI growth for at least five years' — timing risk not demand risk" },
    supermicro:       { dir: "down",  note: "Rack backlog grows but deployments stall; Circuit: TSMC supply constrained and so is power" },
    dell:             { dir: "down",  note: "AI server delivery outpaces customer power readiness — revenue recognition delayed" },
    foxconn:          { dir: "down",  note: "GB200 rack manufacturing demand drops if hyperscaler builds stall on power" },
    arista:           { dir: "down",  note: "Circuit: Nvidia is largest networking vendor — switch deployments tied to rack builds" },
    microsoft:        { dir: "down",  note: "Baker: 'seven states have bills to make it illegal to build data centers' — Azure expansion at risk" },
    google:           { dir: "down",  note: "Baker: capitalism 'hard at work on watts' but 18-24 months to solve — GCP build extends" },
    amazon:           { dir: "down",  note: "Patel: AWS will build more capacity than anyone in 2025-2027 — power is the binding constraint" },
    meta:             { dir: "down",  note: "Baker: power shortage starts to ease in '27-'28 — Meta's Louisiana/Texas builds face multi-year waits" },
    openai:           { dir: "down",  note: "Patel: Stargate targeting 1GW sites — power permitting adds 18+ months to every gigawatt" },
    oracle:           { dir: "down",  note: "OCI expansion explicitly power-constrained; Oracle most exposed as pure GPU cloud" },
    coreweave:        { dir: "down",  note: "GPU capacity additions need 18-month power contracts; Circuit: neocloud model power-dependent" },
    xai:              { dir: "down",  note: "Baker: xAI built Colossus 'in a superhuman way' but used external generators — liability exposed" },
  },
  "optical-transition": {
    nvidia:           { dir: "mixed", note: "Circuit: Nvidia already largest networking vendor — must invest in photonics; near-term cost, long-term moat" },
    broadcom:         { dir: "up",    note: "Circuit: Broadcom guided $100B AI revenue 2027 — co-packaged optics is central to that thesis" },
    marvell:          { dir: "up",    note: "Optical DSP silicon is Marvell's biggest near-term catalyst; Circuit: Trainium/Maia customer" },
    astera:           { dir: "up",    note: "CXL and optical connectivity expand together — Astera is the connectivity layer in every AI rack" },
    arista:           { dir: "up",    note: "Circuit: Ethernet will win again — 800G optical switch refresh is a multi-year revenue wave" },
    tsmc:             { dir: "up",    note: "Silicon photonics chips fabbed at TSMC — Baker: TSMC is the critical asset regardless" },
    microsoft:        { dir: "up",    note: "GB300 optical racks lower total compute cost; Maia 2 designed for optical scale-out" },
    google:           { dir: "up",    note: "Already deploying in-package optical at scale; cost advantage widens vs GPU-only rivals" },
    amazon:           { dir: "up",    note: "Baker: Trainium is tugging on Superman's cape — Trainium 3 optical design is the edge" },
    meta:             { dir: "up",    note: "Optical scale-out reduces MTIA cluster cost; Circuit: custom silicon year validates Meta's bet" },
  },
  "custom-asic-inflection": {
    broadcom:         { dir: "up",    note: "Baker: 'everybody's favorite ASIC supplier' — OpenAI XPU deal could be Broadcom's biggest ever" },
    marvell:          { dir: "up",    note: "Baker: Trainium and Marvell custom silicon are the real challengers — ramps hit estimates" },
    tsmc:             { dir: "up",    note: "Baker: TSMC still fabs all the ASICs — same wafer demand, more diverse customer base" },
    arm:              { dir: "up",    note: "Circuit: ARM went parabolic on agentic CPU; all custom ASICs use Arm ISA — royalties scale" },
    google:           { dir: "up",    note: "Patel: TPU = majority of Google/Anthropic training infra — economics improve vs GPU" },
    amazon:           { dir: "up",    note: "Baker: 'Trainium is to 2026 what TPUs were to 2025' — AWS TCO advantage compounds" },
    microsoft:        { dir: "up",    note: "Maia reduces Nvidia dependency; Patel: Maia is core to Microsoft's Azure margin story" },
    meta:             { dir: "up",    note: "Circuit: 2026 is the year of custom silicon — MTIA cuts Nvidia spend, margin story strengthens" },
    openai:           { dir: "mixed", note: "Baker: 'I will be surprised if there are many ASICs other than Trainium and TPU' — XPU risk" },
    anthropic:        { dir: "up",    note: "Patel: Anthropic committed >1M TPUs; Circuit: 'Anthropic chose TPU — speaks to how compelling they are'" },
    nvidia:           { dir: "down",  note: "Baker: 'it's really a fight between NVDA and the Google TPU' — inference share erosion begins" },
  },
  "token-commoditization": {
    openai:           { dir: "down",  note: "Patel: OpenAI revenue accelerating but pricing pressure from efficient models compresses margin" },
    anthropic:        { dir: "down",  note: "Patel: Anthropic 4x more capital efficient than OpenAI — but token price collapse hurts all" },
    xai:              { dir: "down",  note: "Baker: xAI has lowest cost per token — but commoditization erodes Colossus ROI thesis" },
    nvidia:           { dir: "down",  note: "Baker: if training capex pauses, Baker's $2T GPU demand thesis evaporates immediately" },
    amd:              { dir: "down",  note: "Patel: AMD 'pretty mid' at single-digit share — inference repricing hits AMD first" },
    broadcom:         { dir: "up",    note: "Baker: 'I think most ASICs will fail' but Broadcom's $100B AI guidance implies ASIC wins" },
    marvell:          { dir: "up",    note: "Custom silicon economics improve as GPU TCO looks expensive in a commodity token world" },
    microsoft:        { dir: "down",  note: "Azure AI revenue margin at risk; Patel: OpenAI/Microsoft revenue highly token-price sensitive" },
    google:           { dir: "mixed", note: "Baker: Google 'never not going to be in a good position' — TPU costs drop but Gemini margin squeezed" },
    amazon:           { dir: "mixed", note: "Baker: Trainium looks prescient — AWS AI pricing must fall; Trainium TCO saves margin" },
    oracle:           { dir: "down",  note: "OCI GPU cloud revenue under severe margin pressure — least differentiated hyperscaler" },
    coreweave:        { dir: "down",  note: "Patel: H100 rental prices already fell from $4 to $2/hr — token collapse accelerates that" },
  },
  "chips-act": {
    intel:            { dir: "up",    note: "Circuit: 18A keeps Intel alive — CHIPS Act $8.5B grant + $11B loans de-risk the entire bet" },
    micron:           { dir: "up",    note: "Baker: 'I don't know anyone who's not really bullish on DRAM' — CHIPS Act $6B enables US HBM" },
    tsmc:             { dir: "up",    note: "Baker: 'TSMC opened Arizona, sold out in milliseconds, then raised prices 20%' — grant validates US strategy" },
    globalfoundries:  { dir: "up",    note: "$1.5B Malta grant; trailing-edge strategic moat critical for defense/auto supply chain" },
    "samsung-foundry":{ dir: "up",    note: "$6B Taylor TX grant; Baker: allied supply chain is the strategy — Samsung is a key node" },
    ase:              { dir: "up",    note: "Packaging onshoring grants; Circuit: TSMC CoPAS packaging coming — US OSATs benefit" },
    amkor:            { dir: "up",    note: "Co-investment with TSMC Arizona; Baker: Terafab-style talent clustering makes Arizona real" },
    amat:             { dir: "up",    note: "Baker: AMAT A-teams will be at domestic fabs — domestic builds generate fresh order waves" },
    lrcx:             { dir: "up",    note: "New US fabs need full etch tool refresh; Circuit: memory run and fab build both drive Lam" },
    klac:             { dir: "up",    note: "Baker: KLA A-teams follow the leading fabs — every new US line requires KLA metrology" },
  },
  "arm-disruption": {
    arm:              { dir: "mixed", note: "Circuit: ARM went parabolic on agentic CPU with $15B orders — but license disruption risks RISC-V migration" },
    nvidia:           { dir: "down",  note: "Baker: Grace CPU is central to Nvidia's data center story — license disruption threatens the stack" },
    qualcomm:         { dir: "down",  note: "Entire Qualcomm portfolio is Arm-based — most exposed company if licensing changes" },
    apple:            { dir: "down",  note: "A/M-series Silicon uses Arm ISA; no viable RISC-V alternative at Apple's scale short-term" },
    amazon:           { dir: "down",  note: "Graviton cost advantage erodes if Arm royalties spike — AWS server CPU economics at risk" },
    tsmc:             { dir: "down",  note: "Baker: TSMC sold out — Arm disruption slows tape-outs and chips competing for slots" },
    "samsung-foundry":{ dir: "down",  note: "Exynos and Arm-based customer designs affected; Samsung also exposed" },
  },
  "intel-foundry-comeback": {
    intel:            { dir: "up",    note: "Circuit: 18A keeps Intel alive; if 14A delivers, Baker: Intel re-enters the recipe competition" },
    microsoft:        { dir: "up",    note: "Circuit: first 18A external customer — chip costs fall, Maia silicon optionality expands" },
    apple:            { dir: "up",    note: "Baker: TSMC 'raised prices 20%' — Apple second-source at Intel reduces TSMC leverage" },
    asml:             { dir: "up",    note: "Patel: ASML makes ~70-80 EUV/year — Intel 18A High-NA commercial validation drives next cycle" },
    amat:             { dir: "up",    note: "Baker: AMAT backside power delivery is key to 18A — direct process technology win" },
    klac:             { dir: "up",    note: "Circuit: Intel Q1 2026 earnings beat — 18A requires full KLA metrology refresh" },
    arm:              { dir: "up",    note: "Circuit: ARM parabolic on agentic CPU — 18A customer chips all use Arm ISA" },
    snps:             { dir: "up",    note: "18A PDK validated in Synopsys; more tape-out activity drives EDA revenue" },
    cdns:             { dir: "up",    note: "Circuit: Intel foundry not abandoned — Cadence 18A tools validated; customer wins" },
  },
  "memory-oversupply": {
    skhynix:          { dir: "down",  note: "Baker: DRAM at mid-single digit multiples already — oversupply removes the one premium: HBM scarcity" },
    micron:           { dir: "down",  note: "Baker: 'I don't know anyone who's not bullish on DRAM' — oversupply scenario is the bear case" },
    "samsung-memory": { dir: "mixed", note: "Samsung uses oversupply as strategic weapon; Circuit: memory margins 'in the eighties' — both at risk" },
    "samsung-foundry":{ dir: "down",  note: "Memory losses drag overall Samsung financials; foundry division loses cross-subsidy" },
    lrcx:             { dir: "down",  note: "Circuit: memory run drives Lam — oversupply means memory capex cuts hit Lam hardest" },
    amat:             { dir: "down",  note: "DRAM capex is a major AMAT driver — oversupply causes cuts that flow directly to orders" },
    nvidia:           { dir: "up",    note: "Baker: HBM costs more than TSMC in Nvidia COGS — cheaper HBM improves GPU margins" },
  },
  "asml-shock": {
    asml:             { dir: "down",  note: "Patel: ASML makes ~70 EUV/year, targeting 80 — delay exposes how thin the margin is" },
    zeiss:            { dir: "down",  note: "Sole EUV optics supplier — Patel: ASML production is the binding constraint; Zeiss is the root" },
    tsmc:             { dir: "down",  note: "Baker: TSMC capacity decisions = most important variable — frozen without EUV tools" },
    "samsung-foundry":{ dir: "down",  note: "2nm timeline slips; Baker: Samsung already 18+ months behind TSMC — gap widens further" },
    intel:            { dir: "down",  note: "Circuit: 18A buys Intel time; ASML shock directly blocks the 14A follow-on" },
    skhynix:          { dir: "down",  note: "Baker: HBM costs more than TSMC in Nvidia COGS — HBM4 capacity growth frozen" },
    micron:           { dir: "down",  note: "Patel: Micron already 'out of the picture for Rubin HBM4' — delay makes it permanent" },
    nvidia:           { dir: "down",  note: "Baker: Rubin roadmap depends on TSMC N2 — ASML shock means no N2, no Rubin on time" },
    amd:              { dir: "down",  note: "Patel: AMD 'pretty mid' — next-gen N2-targeted; delay extends the gap vs Nvidia" },
    apple:            { dir: "down",  note: "A19/M5 on N2; Baker: TSMC Arizona near bleeding edge — shock propagates to Apple roadmap" },
  },
  "ai-capex-supercycle": {
    nvidia:           { dir: "up",    note: "Baker: if TSMC expands, Nvidia 'could sell $2T of GPUs in 2026-27' — supercycle proves it" },
    skhynix:          { dir: "up",    note: "Baker: 'HBM costs more than TSMC' in Nvidia COGS — HBM demand doubles, Hynix re-rates" },
    micron:           { dir: "up",    note: "Baker: 'I don't know anyone not really bullish on DRAM' — supercycle is the bull case" },
    tsmc:             { dir: "up",    note: "Baker: TSMC capacity decisions = most important variable — supercycle proves they were right to expand" },
    broadcom:         { dir: "up",    note: "Circuit: Broadcom guiding $100B AI revenue in 2027 — supercycle is exactly why" },
    marvell:          { dir: "up",    note: "Baker: Trainium is to 2026 what TPUs were to 2025 — supercycle validates custom silicon" },
    astera:           { dir: "up",    note: "Every AI rack needs connectivity silicon — Astera scales linearly with GPU shipments" },
    supermicro:       { dir: "up",    note: "Circuit: Nvidia willed neoclouds into existence — AI server assembly demand doubles" },
    dell:             { dir: "up",    note: "GPU server mix reaches 40%+ of revenue; Circuit: OEM commitment to AI hardware is locked" },
    foxconn:          { dir: "up",    note: "GB200 rack manufacturing; Baker: Terafab-level hardware engineering is the next wave" },
    arista:           { dir: "up",    note: "Circuit: Nvidia is already the largest networking vendor — 800G refresh accelerates" },
    microsoft:        { dir: "up",    note: "Patel: Azure dwarfs rivals in capex — supercycle justifies every dollar of Stargate" },
    google:           { dir: "up",    note: "Patel: TPUv7 Ironwood deal worth ~$52B — GCP AI revenue inflects on supercycle" },
    amazon:           { dir: "up",    note: "Patel: AWS will build more capacity than anyone in 2025-2027 — supercycle vindicates" },
    meta:             { dir: "up",    note: "Llama training at scale; Circuit: custom silicon year = Meta MTIA finally matters" },
    oracle:           { dir: "up",    note: "Patel: Stargate $300B deal at $10-15B/GW — supercycle re-rates Oracle as AI infrastructure" },
    coreweave:        { dir: "up",    note: "Circuit: Nvidia willed neoclouds into existence — pure-play GPU cloud IPO timing ideal" },
  },
  "openai-demand-shock": {
    openai:           { dir: "up",    note: "Patel: OpenAI adding revenue faster than any company in history — demand shock accelerates IPO" },
    microsoft:        { dir: "up",    note: "Patel: Azure dwarfs rivals in AI capex — OpenAI $500B Stargate commitment fully justified" },
    oracle:           { dir: "up",    note: "Patel: Stargate $300B over 5 years at Oracle — OCI becomes the primary non-Azure OpenAI host" },
    coreweave:        { dir: "up",    note: "Circuit: OpenAI anchor customer validates the neocloud model Jensen built" },
    nvidia:           { dir: "up",    note: "Baker: if TSMC expanded, Nvidia 'could sell $2T of GPUs' — OpenAI is the demand that proves it" },
    tsmc:             { dir: "up",    note: "Baker: TSMC capacity = most important variable — OpenAI GPU wafer demand is meaningful allocation" },
    skhynix:          { dir: "up",    note: "Baker: HBM costs more than TSMC in Nvidia COGS — OpenAI GPU surge = multi-billion Hynix contract" },
    broadcom:         { dir: "up",    note: "Baker: OpenAI XPU ASIC deal with Broadcom is 'manna from heaven' for Broadcom" },
    supermicro:       { dir: "up",    note: "Circuit: Nvidia neocloud ecosystem — AI rack assembly for Stargate is a $1B+ concentration event" },
    foxconn:          { dir: "up",    note: "GB200 rack manufacturing; Baker: hardware engineering at Terafab scale is the model" },
    arista:           { dir: "up",    note: "Circuit: Nvidia is largest networking vendor — Stargate DC switch build is hundreds of thousands of ports" },
  },
  "hbm4-transition": {
    skhynix:          { dir: "up",    note: "Patel: Samsung 'effectively out of picture for Rubin HBM4' — Hynix sole supplier; maximum pricing power" },
    micron:           { dir: "down",  note: "Patel: 'Micron well behind, effectively out of picture for Rubin HBM4' — misses the Blackwell Ultra cycle" },
    "samsung-memory": { dir: "down",  note: "Patel: Samsung already flagged as out for Rubin HBM4 — HBM3E lag persists into HBM4" },
    lrcx:             { dir: "up",    note: "Circuit: 'memory run continues' — HBM4 stacking requires advanced etch; orders accelerate" },
    nvidia:           { dir: "mixed", note: "Baker: HBM costs more than TSMC in Nvidia COGS — ships but sole-sourced from Hynix = risk premium" },
    amd:              { dir: "down",  note: "Patel: AMD 'pretty mid' — MI400 delayed if HBM4 supply concentrated at Hynix only" },
    openai:           { dir: "down",  note: "Patel: OpenAI targeting 5-10GW compute — GPU delivery timing risk delays every gigawatt" },
    xai:              { dir: "down",  note: "Baker: xAI gets GPUs before anyone — HBM4 constraint narrows that structural advantage" },
    coreweave:        { dir: "down",  note: "Circuit: neocloud model needs GPU additions — HBM4 shortage delays next-gen GPU capacity" },
  },
  "geopolitical-japan-korea": {
    "shin-etsu":      { dir: "down",  note: "Baker: allied supply chain is the strategy — Japan alignment restricts China wafer sales" },
    sumco:            { dir: "down",  note: "Same allied export control exposure as Shin-Etsu; China wafer revenue at risk" },
    jsr:              { dir: "down",  note: "METI photoresist restrictions already set precedent — China EUV photoresist revenue lost" },
    zeiss:            { dir: "down",  note: "EU aligned on EUV-adjacent components; Patel: ASML constraint propagates to Zeiss" },
    tel:              { dir: "down",  note: "Already restricted from China advanced nodes; further US-Japan alignment cuts more revenue" },
    skhynix:          { dir: "down",  note: "Patel: HBM to China AI customers under increasing scrutiny; Hynix most exposed Korean memory" },
    "samsung-foundry":{ dir: "mixed", note: "Baker: China 4 years behind and gap growing — Samsung gains vs China but faces export review" },
    "samsung-memory": { dir: "down",  note: "HBM export to China increasingly restricted; Patel: memory supercycle helps but China cut hurts" },
    tsmc:             { dir: "up",    note: "Baker: 'allied supply chain' benefits Taiwan — competitor access cut, TSMC gains relative share" },
    asml:             { dir: "down",  note: "Patel: ASML already capped at ~70-80 EUV/year — DUV ban removes the incremental volume" },
  },
  "packaging-unbundled": {
    tsmc:             { dir: "down",  note: "Patel: CoWoS is the actual Blackwell bottleneck — competition erodes that pricing power" },
    ase:              { dir: "up",    note: "Circuit: TSMC CoPAS packaging coming in 2028 — ASE gains AI chip share in the interim" },
    amkor:            { dir: "up",    note: "Arizona OSAT co-invested with TSMC; Baker: Terafab clustering makes US packaging real" },
    nvidia:           { dir: "up",    note: "Patel: CoWoS was the Blackwell bottleneck — packaging competition lowers that cost" },
    amd:              { dir: "up",    note: "Multiple packaging sources reduce supply risk; Patel: AMD needs every advantage vs Nvidia" },
    broadcom:         { dir: "up",    note: "Circuit: Broadcom $100B AI in 2027 — packaging optionality improves TPU/XPU economics" },
    "samsung-foundry":{ dir: "up",    note: "Baker: Samsung is a key node in the allied supply chain — fab+package bundle gains" },
    intel:            { dir: "up",    note: "Circuit: 18A keeps Intel alive — EMIB and Foveros gain credibility vs CoWoS" },
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
  const [hovered, setHovered] = useState<string | null>(null);
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
            const hit    = active  !== null && (e.from === active  || e.to === active);
            const hovHit = hovered !== null && (e.from === hovered || e.to === hovered);
            const scHit  = scenarioSet !== null && scenarioSet.has(e.from) && scenarioSet.has(e.to);
            const ckHit  = ckOnly && e.critical;
            // hide edge entirely when nothing requests it to be shown
            const visible = hit || hovHit || scHit || ckHit;
            if (!visible) return null;
            const d = edgePath(a, b);
            const scColor = activeScenario?.color ?? "#B45309";
            const stroke = hit ? "#B45309" : scHit ? scColor : hovHit ? "#9CA3AF" : "#DC2626";
            const sw     = hit ? 2 : scHit ? 1.4 : hovHit ? 0.8 : 1.3;
            const op     = hit ? 1 : scHit ? 0.7 : hovHit ? 0.45 : 0.55;
            return (
              <g key={i} fill="none">
                <path d={d} stroke={stroke} strokeWidth={sw} opacity={op} />
                {(hit || scHit || ckHit) && (
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
            const isHovered = n.id === hovered;
            const hovConnected = hovered !== null && edges.some(
              (e) => (e.from === hovered || e.to === hovered) && (e.from === n.id || e.to === n.id)
            );
            const dim = connected !== null ? !connected.has(n.id)
                      : scenarioSet !== null ? !inScenario
                      : hovered !== null ? !(isHovered || hovConnected)
                      : false;
            const isCk = CHOKEPOINTS.has(n.id);
            const markSize = Math.max(7.5, p.r * 0.42);
            return (
              <g
                key={n.id}
                opacity={dim ? 0.2 : 1}
                className="cursor-pointer"
                onClick={() => toggle(n.id)}
                onMouseEnter={() => setHovered(n.id)}
                onMouseLeave={() => setHovered(null)}
              >
                {(isActive || inScenario || isHovered || (!active && !scenarioSet && !hovered && isCk && ckOnly)) && (
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
