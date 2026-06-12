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
    nodes: ["coherent","lumentum","fabrinet","nvidia","broadcom","marvell","astera","arista","tsmc","microsoft","google","amazon","meta"],
    color: "#0E7490",
    why: {
      coherent: "The 800G/1.6T transceiver market doubles — sole supplier of high-bandwidth modules at scale",
      lumentum: "Laser chips inside every transceiver — demand scales with port count across hyperscaler DCs",
      fabrinet: "Contract optical manufacturing capacity becomes the supply constraint — backlog grows",
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
            "supermicro","dell","foxconn","arista","coherent","lumentum","fabrinet",
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
      coherent: "800G/1.6T transceiver demand scales with every new DC build — multi-year supercycle",
      lumentum: "Laser chip demand doubles with port count — Lumentum is the laser supplier behind it all",
      fabrinet: "Contract optical manufacturing backlog extends to 18 months — pricing power expands",
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
  {
    id: "reticle-limit-era",
    label: "Reticle limit era — multi-die packaging wars",
    subtitle: "Rubin Ultra stitches 4 reticle-sized dies into one GPU — packaging becomes as critical and expensive as the silicon itself",
    nodes: ["intel","tsmc","nvidia","amd","broadcom","marvell","ase","amkor","skhynix","micron","besi"],
    color: "#7C2D12",
    why: {
      intel: "EMIB embeds bridges in a rectangular panel substrate — ~90% utilization vs ~60% for wafer interposers, and the advantage widens as packages grow",
      tsmc: "CoWoS-L is the flagship AI packaging flow today, but multi-reticle packages approach one interposer per wafer — the economics degrade at exactly the sizes Rubin Ultra needs",
      nvidia: "Rubin Ultra's 4-die design makes packaging a first-order cost line — whoever packages it cheapest sets Nvidia's gross margin",
      amd: "MI-series chiplet designs face the same multi-die packaging bill — packaging cost is now a real competitive variable versus Nvidia",
      broadcom: "TPU and custom XPU programs at hyperscaler scale are the biggest packaging volume after Nvidia — cheaper multi-die assembly flows straight to margins",
      marvell: "Custom ASIC programs (Trainium, Maia) all need 2.5D assembly — packaging capacity is the gating factor on program timelines",
      ase: "World's largest OSAT — wins overflow volume regardless of whether CoWoS or bridge-based approaches dominate",
      amkor: "US-based OSAT with TSMC Arizona co-investment — positioned for onshored multi-die assembly",
      skhynix: "Every additional HBM stack per package raises interconnect density requirements — HBM count growth drives the packaging escalation",
      micron: "Same HBM dynamic — more stacks per GPU means more advanced packaging content per unit shipped",
      besi: "Hybrid bonding equipment is the tooling layer under every advanced packaging roadmap — die-attach precision becomes the binding constraint",
    },
  },
];

type StockEffect = { dir: "up" | "down" | "mixed" | "neutral"; note: string };

// Notes grounded in Baker, Patel (SemiAnalysis), and Circuit podcast expert views
const STOCK_EFFECTS: Record<string, Record<string, StockEffect>> = {
  "taiwan-conflict": {
    tsmc:             { dir: "down",  note: "TSMC capacity is the single most important variable in AI — if it goes offline, everything stops" },
    nvidia:           { dir: "down",  note: "Jensen has no formal TSMC contract — handshake arrangements don't survive a military conflict" },
    amd:              { dir: "down",  note: "AMD always runs a step behind on capacity — without fab access, there's no recovery path" },
    broadcom:         { dir: "down",  note: "Broadcom is the go-to ASIC supplier for every major hyperscaler — all of that pipeline goes to zero" },
    marvell:          { dir: "down",  note: "All custom ASICs — Trainium, Maia, custom silicon — are TSMC-fabbed; every program halts" },
    qualcomm:         { dir: "down",  note: "The entire Snapdragon line is TSMC-fabbed — mobile chip revenue collapses with no alternative source" },
    apple:            { dir: "down",  note: "A/M-series chips are TSMC's largest customer — iPhone and Mac production stops entirely" },
    astera:           { dir: "down",  note: "Connectivity silicon is TSMC-fabbed — every AI rack build stalls without it" },
    asml:             { dir: "mixed", note: "the best semiconductor talent clusters at TSMC and Taiwan — short-term crash but long-term rebuild demand is real" },
    amat:             { dir: "down",  note: "Applied Materials had key teams at TSMC — Taiwan tool revenue disappears instantly" },
    lrcx:             { dir: "down",  note: "Significant TSMC etch tool revenue gone; the memory run that drives Lam is also disrupted" },
    klac:             { dir: "down",  note: "Process control revenue is tied to TSMC output — collapses immediately with fab shutdowns" },
    tel:              { dir: "down",  note: "TSMC is TEL's largest customer — direct, immediate revenue loss with no short-term replacement" },
    arm:              { dir: "down",  note: "ARM had been going parabolic on the AI CPU narrative — conflict zeroes the royalty stream" },
    snps:             { dir: "down",  note: "Tape-outs halt; EDA subscriptions erode as chip design activity stops across the industry" },
    cdns:             { dir: "down",  note: "Same dynamic as Synopsys — design tools have no value if silicon can't be produced" },
    microsoft:        { dir: "down",  note: "Azure runs OpenAI at roughly 2GW of compute — all TSMC-dependent, all stranded" },
    google:           { dir: "down",  note: "TPUs account for the majority of Google and Anthropic training infrastructure — all TSMC-fabbed" },
    amazon:           { dir: "down",  note: "Trainium is the real ASIC challenger to Nvidia — conflict strands the entire bet" },
    meta:             { dir: "down",  note: "GPU buildout stops; Llama training runs on TSMC-fabbed chips — timeline becomes indefinite" },
    openai:           { dir: "down",  note: "OpenAI runs roughly 2GW of compute, all TSMC-dependent — costs spike to unaffordable levels" },
    oracle:           { dir: "down",  note: "Stargate is a $100B+ bet on TSMC-fabbed chips — becomes a stranded asset overnight" },
    coreweave:        { dir: "down",  note: "Nvidia essentially built the neocloud business model — without TSMC chips, that model collapses" },
    xai:              { dir: "down",  note: "xAI built Colossus remarkably fast, but it runs entirely on Nvidia/TSMC silicon — expansion halts" },
    anthropic:        { dir: "down",  note: "Anthropic runs 2-2.5GW on Google TPUs — all TSMC-fabbed; roadmap freezes without new chips" },
  },
  "china-export-controls": {
    asml:             { dir: "down",  note: "ASML only makes roughly 70 EUV tools per year — a China DUV ban removes 30% of their addressable market" },
    amat:             { dir: "down",  note: "China was Applied Materials' largest single market — 15-20% of revenue is directly at risk" },
    lrcx:             { dir: "down",  note: "Significant China etch revenue; Baker sees allied supply chain coordination as the long-term direction of travel" },
    klac:             { dir: "down",  note: "China process control revenue gets cut; KLA has the highest China revenue exposure among all semiconductor equipment makers" },
    tel:              { dir: "down",  note: "Tokyo Electron is already restricted from advanced nodes in China — further US-Japan alignment cuts more" },
    snps:             { dir: "down",  note: "Huawei and SMIC EDA revenue disappears — Synopsys loses its most important Chinese design customers" },
    cdns:             { dir: "down",  note: "Same story as Synopsys — China advanced chip design revenue is lost with no near-term replacement" },
    nvidia:           { dir: "up",    note: "the H20 revenue hit has already been absorbed — tighter controls on Chinese AI chips mostly hobble domestic competitors" },
    broadcom:         { dir: "down",  note: "China hyperscaler networking revenue comes under export scrutiny — a meaningful but underappreciated risk" },
    qualcomm:         { dir: "down",  note: "Over 60% of Qualcomm's revenue comes from Chinese OEMs — this is the single largest risk in the whole supply chain" },
    "samsung-foundry":{ dir: "up",    note: "China's fab technology is roughly four years behind and falling further — Samsung gains relative share as Chinese fabs stall" },
    "samsung-memory": { dir: "down",  note: "HBM exports to Chinese AI customers are getting restricted; Patel sees memory access to China being progressively cut off" },
    jsr:              { dir: "down",  note: "METI photoresist export restrictions have already set the precedent — China revenue for JSR is effectively gone" },
    "shin-etsu":      { dir: "down",  note: "Wafer exports to Chinese fabs are restricted under the broader allied export alignment framework" },
    sumco:            { dir: "down",  note: "Same allied export control exposure as Shin-Etsu — China wafer export revenue is increasingly at risk" },
  },
  "hbm-shortage": {
    skhynix:          { dir: "up",    note: "HBM actually costs more than the TSMC node in Nvidia's bill of materials — SK Hynix holds maximum pricing power in a shortage" },
    micron:           { dir: "up",    note: "DRAM companies trade at mid-single digit multiples while semiconductor equipment trades at 40x — that gap closes in a shortage" },
    "samsung-memory": { dir: "down",  note: "Samsung is effectively out of the picture for Rubin HBM4 — the qualification lag gets exposed publicly in a shortage" },
    nvidia:           { dir: "down",  note: "CoWoS packaging is already the gating constraint on Blackwell — an HBM shortage stacks directly on top; revenue miss likely" },
    amd:              { dir: "down",  note: "AMD is running pretty mid at single-digit GPU share — HBM shortage hits them alongside Nvidia with no way out" },
    lrcx:             { dir: "up",    note: "the memory run was already accelerating — an HBM shortage drives an even faster investment cycle in HBM etch capacity" },
    asml:             { dir: "up",    note: "Advanced DRAM EUV demand rises with HBM investment; Patel notes that ASML's own production capacity is itself the binding constraint" },
    openai:           { dir: "down",  note: "OpenAI is at 2GW and targeting 10GW — any GPU delivery timing risk slips the entire compute buildout plan" },
    xai:              { dir: "down",  note: "xAI gets access to GPUs ahead of most others — an HBM shortage narrows that structural timing advantage" },
    coreweave:        { dir: "down",  note: "Nvidia essentially created the neocloud market — a GPU supply gap from HBM shortage breaks the business model" },
    microsoft:        { dir: "down",  note: "Azure GPU expansion slows — OpenAI and Anthropic together consume roughly 30% of all Nvidia output" },
    amazon:           { dir: "down",  note: "Trainium 3 is the real long-term challenger to Nvidia — HBM shortage delays exactly the ramp that matters most" },
  },
  "cowos-bottleneck": {
    tsmc:             { dir: "up",    note: "CoWoS is the actual gating constraint on the entire Blackwell ramp — TSMC holds all the leverage on AI chip delivery" },
    nvidia:           { dir: "down",  note: "the real bottleneck is CoWoS packaging, not the TSMC node itself — GPU shipment delays translate directly to revenue misses" },
    amd:              { dir: "down",  note: "MI-series chips are in the same TSMC CoWoS packaging queue as Nvidia — AMD gets caught in the same constraint" },
    broadcom:         { dir: "down",  note: "TPU production competes for the same CoWoS slots — Google's TPU build gets delayed alongside GPU orders" },
    ase:              { dir: "up",    note: "Overflow demand flows to OSATs — TSMC supply was constrained all through 2026 — ASE gains real AI packaging share" },
    amkor:            { dir: "up",    note: "Amkor's Arizona OSAT gains meaningful AI packaging share as an alternative to TSMC CoWoS" },
    microsoft:        { dir: "down",  note: "Azure GPU fleet expansion delayed; the Maia ASIC also needs advanced packaging and sits in the same queue" },
    google:           { dir: "down",  note: "TPU and GPU capacity are both bottlenecked by the same TSMC packaging constraint" },
    amazon:           { dir: "down",  note: "Trainium is the most credible challenger to Nvidia — the CoWoS bottleneck delays exactly this ramp" },
    meta:             { dir: "down",  note: "GPU orders slip and the MTIA custom ASIC is also packaging-constrained — Llama training timelines extend" },
    openai:           { dir: "down",  note: "each gigawatt of data center costs $10-15B — a packaging bottleneck delays every gigawatt in the buildout" },
    oracle:           { dir: "down",  note: "Stargate GPU cluster build timeline is directly at risk; Oracle is the most exposed hyperscaler to GPU supply delays" },
    coreweave:        { dir: "down",  note: "the neocloud model depends entirely on adding GPU capacity — can't do that without packaged chips" },
  },
  "n3-crunch": {
    tsmc:             { dir: "up",    note: "TSMC capacity decisions are the most important single variable in AI — N3 scarcity translates directly into pricing power" },
    nvidia:           { dir: "down",  note: "AI chips will consume 86% of N3 wafer output by 2027 — Rubin gets delayed if Apple wins the allocation fight" },
    amd:              { dir: "down",  note: "AMD is running at single-digit GPU share — a wafer crunch exposes how little TSMC leverage they actually have" },
    broadcom:         { dir: "down",  note: "TPU v6/v7 gets delayed if TSMC allocates Apple's N3 wafers ahead of AI chip orders" },
    marvell:          { dir: "down",  note: "Custom ASIC ramps are gated by node availability — all five hyperscaler programs face timeline risk" },
    apple:            { dir: "mixed", note: "TSMC sold out its Arizona fab almost immediately and raised prices 20% — Apple may win the allocation but pays a significant premium" },
    qualcomm:         { dir: "down",  note: "Snapdragon N3 wafers compete directly with AI chips in the same allocation process — mobile loses this fight" },
    asml:             { dir: "up",    note: "ASML makes 70-80 EUV tools per year — the N3 crunch validates that every unit is worth far more than the price" },
    amat:             { dir: "up",    note: "the best teams at TSMC are focused on N3 — Applied Materials process tools are in high demand at that node" },
    klac:             { dir: "up",    note: "More metrology steps are required at N3/N2; semiconductor equipment still trades at 40x vs DRAM at single digits" },
    tel:              { dir: "up",    note: "Coat and develop tools go into every N3 layer — TEL benefits directly from TSMC's N3 expansion" },
  },
  "euv-ban": {
    asml:             { dir: "down",  note: "ASML is capped at roughly 100 EUV tools per year by the end of the decade — a ban makes every remaining unit far more contested" },
    zeiss:            { dir: "down",  note: "Zeiss is the sole supplier of EUV optics — a ban on EUV tools is effectively a ban on Zeiss revenue too" },
    tsmc:             { dir: "down",  note: "TSMC's N2/A16 capacity expansion is the single most important wafer variable — it freezes without new EUV tools" },
    "samsung-foundry":{ dir: "down",  note: "Samsung's 2nm node timeline slips 18+ months — Baker notes they are already well behind TSMC, and the gap widens" },
    intel:            { dir: "down",  note: "18A gives Intel a lifeline; an EUV ban directly blocks the 14A follow-on node that is supposed to save them" },
    skhynix:          { dir: "down",  note: "HBM costs more than the TSMC node in Nvidia's bill of materials — an EUV ban freezes the HBM4 capacity growth that sustains that premium" },
    micron:           { dir: "down",  note: "Micron is already behind on HBM4 — an EUV ban makes the gap permanent with no path to close it" },
    "samsung-memory": { dir: "down",  note: "Advanced DRAM scaling halts; Patel notes Samsung was already out of the picture for Rubin HBM4 before this" },
    nvidia:           { dir: "down",  note: "Rubin is planned for TSMC's N2 — Baker sees TSMC as 18 months ahead of everyone; an EUV ban freezes that lead indefinitely" },
    amd:              { dir: "down",  note: "Next-gen MI-series is N2-targeted; Patel notes AMD is already behind, and the ban adds further delay with no workaround" },
    broadcom:         { dir: "down",  note: "TPU v7+ depends on N2 — Broadcom is guiding to $100B in AI revenue by 2027 — that number assumes the N2 ramp happens" },
    apple:            { dir: "down",  note: "A19/M5 are both N2-targeted — iPhone launch timing is at risk — Arizona fabs are approaching the bleeding edge" },
  },
  "power-constraint": {
    nvidia:           { dir: "mixed", note: "power is the primary constraint on AI infrastructure growth for at least five years — demand is unaffected, but deployment timing slips" },
    supermicro:       { dir: "down",  note: "Rack backlogs grow but actual deployments stall; the power constraint and TSMC supply constraint are hitting simultaneously" },
    dell:             { dir: "down",  note: "AI server delivery outpaces customer power readiness — revenue recognition gets delayed as hardware sits in warehouses" },
    foxconn:          { dir: "down",  note: "GB200 rack manufacturing demand drops if hyperscaler builds stall because power can't be procured" },
    arista:           { dir: "down",  note: "Nvidia is already the largest networking vendor — switch deployments are tied to rack build timelines that slip with power" },
    microsoft:        { dir: "down",  note: "multiple US states are actively trying to make new data center construction illegal — Azure expansion is directly at risk" },
    google:           { dir: "down",  note: "capitalism is working hard on the power problem but it takes 18-24 months to solve — GCP data center builds extend" },
    amazon:           { dir: "down",  note: "AWS plans to build more capacity than anyone else in 2025-2027 — power availability is the binding constraint on that plan" },
    meta:             { dir: "down",  note: "the power shortage starts easing around 2027-2028 — Meta's Louisiana and Texas builds face multi-year waits before then" },
    openai:           { dir: "down",  note: "Stargate is targeting gigawatt-scale sites — power permitting adds 18+ months to every gigawatt of the buildout" },
    oracle:           { dir: "down",  note: "OCI expansion is explicitly power-constrained; Oracle is the most exposed as a pure GPU cloud without diversified revenue" },
    coreweave:        { dir: "down",  note: "GPU capacity additions require 18-month power contracts — the neocloud business model is entirely dependent on power availability" },
    xai:              { dir: "down",  note: "xAI built Colossus with remarkable speed but relied on external generators — that approach is a long-term liability" },
  },
  "optical-transition": {
    coherent:         { dir: "up",    note: "the 800G datacenter interconnect refresh is a multi-year wave — Coherent supplies the transceiver hardware that makes it happen" },
    lumentum:         { dir: "up",    note: "Every 800G and 1.6T transceiver requires Lumentum laser chips — demand compounds directly with port count across hyperscaler builds" },
    fabrinet:         { dir: "up",    note: "Contract optical manufacturing becomes the supply constraint as demand accelerates — Fabrinet backlog extends and pricing power rises" },
    nvidia:           { dir: "mixed", note: "Nvidia is already the largest networking vendor — it needs to invest in photonics, which is near-term cost but long-term moat" },
    broadcom:         { dir: "up",    note: "Broadcom is guiding to $100B in AI revenue by 2027 — co-packaged optics is central to how they get there" },
    marvell:          { dir: "up",    note: "Marvell's optical DSP silicon is the biggest near-term catalyst — it is the key enabling component for the co-packaged optics transition" },
    astera:           { dir: "up",    note: "CXL and optical connectivity expand in tandem — Astera is the connectivity layer inside every AI server rack" },
    arista:           { dir: "up",    note: "Ethernet wins again at each generation — the 800G optical switch refresh is a multi-year revenue wave for Arista" },
    tsmc:             { dir: "up",    note: "Silicon photonics chips are fabbed at TSMC — Baker: TSMC is the critical asset regardless of which interconnect technology wins" },
    microsoft:        { dir: "up",    note: "GB300 optical racks lower total compute cost; Maia 2 was specifically designed for optical scale-out" },
    google:           { dir: "up",    note: "Google is already deploying in-package optical at scale — the cost advantage over GPU-only rivals compounds over time" },
    amazon:           { dir: "up",    note: "Trainium is the most credible challenger to Nvidia — Trainium 3's optical design is a key part of that cost advantage" },
    meta:             { dir: "up",    note: "Optical scale-out lowers MTIA cluster cost — 2026 is the year of custom silicon, validating Meta's bet" },
  },
  "custom-asic-inflection": {
    broadcom:         { dir: "up",    note: "Broadcom is the go-to ASIC supplier for the hyperscalers — the OpenAI XPU deal could be the largest customer relationship in their history" },
    marvell:          { dir: "up",    note: "Trainium and Marvell custom silicon are the real challengers to Nvidia — ramps accelerating, estimates getting beaten" },
    tsmc:             { dir: "up",    note: "TSMC still fabs all the custom ASICs — same leading-edge wafer demand, but now spread across a more diverse customer base" },
    arm:              { dir: "up",    note: "ARM was going parabolic on the agentic CPU thesis — every custom ASIC uses Arm ISA, so royalties scale directly with volume" },
    google:           { dir: "up",    note: "TPUs account for the majority of Google and Anthropic training infrastructure — custom ASIC economics improve versus renting GPUs" },
    amazon:           { dir: "up",    note: "Trainium in 2026 is what TPUs were to 2025 — the AWS TCO advantage compounds as the ramp continues" },
    microsoft:        { dir: "up",    note: "Maia reduces Nvidia dependency — the Maia program is central to Microsoft's Azure margin story" },
    meta:             { dir: "up",    note: "2026 is the year of custom silicon — MTIA cuts Nvidia spending and the margin story strengthens" },
    openai:           { dir: "mixed", note: "he would be surprised if many ASICs beyond Trainium and TPU actually succeed — the OpenAI XPU faces real execution risk" },
    anthropic:        { dir: "up",    note: "Anthropic committed to more than a million TPU chips; Anthropic choosing TPU over GPU speaks to how compelling the economics are" },
    nvidia:           { dir: "down",  note: "the real competitive fight is between Nvidia and the Google TPU — inference market share erosion begins as ASICs scale" },
  },
  "token-commoditization": {
    openai:           { dir: "down",  note: "OpenAI is adding revenue faster than almost any company in history, but pricing pressure from more efficient models compresses margin" },
    anthropic:        { dir: "down",  note: "Anthropic is roughly four times more capital efficient than OpenAI — but token price collapse hurts every model provider" },
    xai:              { dir: "down",  note: "xAI has among the lowest cost per token of any frontier lab — but commoditization erodes the ROI thesis for Colossus" },
    nvidia:           { dir: "down",  note: "if training capex pauses, the entire $2T GPU demand thesis evaporates immediately — token commoditization is the key risk" },
    amd:              { dir: "down",  note: "AMD is running at single-digit inference share — inference repricing hits AMD hardest with the least room to maneuver" },
    broadcom:         { dir: "up",    note: "most custom ASICs will fail, but Broadcom's $100B AI revenue guidance implies their specific ASIC partnerships survive" },
    marvell:          { dir: "up",    note: "Custom silicon economics improve when GPU TCO looks expensive in a world of commodity token pricing" },
    microsoft:        { dir: "down",  note: "Azure AI revenue margin is at risk — OpenAI and Microsoft revenue are both highly sensitive to token price declines" },
    google:           { dir: "mixed", note: "Google is never not going to be in a strong position — TPU costs drop, but Gemini inference revenue margin gets squeezed too" },
    amazon:           { dir: "mixed", note: "Trainium looks prescient in this environment — AWS AI pricing must fall, but Trainium TCO protects margin better than GPU alternatives" },
    oracle:           { dir: "down",  note: "OCI GPU cloud revenue faces severe margin pressure — Oracle is the least differentiated hyperscaler in a commodity pricing environment" },
    coreweave:        { dir: "down",  note: "H100 rental prices already fell from $4 to $2 per hour — token commoditization accelerates that trend further" },
  },
  "chips-act": {
    intel:            { dir: "up",    note: "18A gives Intel a genuine lifeline — the CHIPS Act $8.5B grant plus $11B in loans de-risks the entire foundry bet" },
    micron:           { dir: "up",    note: "he doesn't know anyone who isn't bullish on DRAM — the CHIPS Act $6B grant enables US HBM production and the stock re-rates" },
    tsmc:             { dir: "up",    note: "TSMC opened Arizona, sold out immediately and raised wafer prices 20% — the grant validates their US strategy entirely" },
    globalfoundries:  { dir: "up",    note: "$1.5B Malta expansion grant; the trailing-edge strategic moat is critical for defense and automotive supply chain independence" },
    "samsung-foundry":{ dir: "up",    note: "$6B Taylor Texas grant — the allied supply chain is the long-term strategy and Samsung is a key node in it" },
    ase:              { dir: "up",    note: "Packaging onshoring grants are flowing — TSMC CoPAS packaging is coming — US OSATs are well-positioned to benefit" },
    amkor:            { dir: "up",    note: "Co-invested with TSMC in Arizona — Terafab-style talent clustering is what makes the Arizona ecosystem real" },
    amat:             { dir: "up",    note: "Applied Materials teams will follow the leading fabs — domestic builds generate a fresh equipment order wave" },
    lrcx:             { dir: "up",    note: "New US fabs need a full etch tool refresh; the memory investment cycle and domestic fab buildout are both driving Lam" },
    klac:             { dir: "up",    note: "KLA teams follow the leading fabs — every new US fab line requires KLA process control from day one" },
  },
  "arm-disruption": {
    arm:              { dir: "mixed", note: "ARM was going parabolic on the agentic CPU thesis with $15B in orders — but a licensing dispute creates real RISC-V migration risk" },
    nvidia:           { dir: "down",  note: "the Grace CPU is central to Nvidia's data center architecture story — a licensing disruption threatens the whole stack" },
    qualcomm:         { dir: "down",  note: "Qualcomm's entire product portfolio is Arm-based — they are the most exposed company in the chain to any licensing change" },
    apple:            { dir: "down",  note: "A and M-series chips all use the Arm ISA; there is no viable RISC-V alternative at Apple's scale in any near-term timeframe" },
    amazon:           { dir: "down",  note: "Graviton's cost advantage erodes if Arm royalties spike — the entire AWS server CPU economics thesis is at risk" },
    tsmc:             { dir: "down",  note: "TSMC sold out immediately — Arm disruption slows tape-outs by designers pausing decisions, and those chips compete for TSMC slots" },
    "samsung-foundry":{ dir: "down",  note: "Exynos and Arm-based external customer chip designs are both affected — Samsung has material exposure here" },
  },
  "intel-foundry-comeback": {
    intel:            { dir: "up",    note: "18A gives Intel a real lifeline; if 14A delivers, Intel re-enters the process technology competition with a credible roadmap" },
    microsoft:        { dir: "up",    note: "Microsoft is the first major external 18A customer — chip costs fall and Maia silicon optionality expands meaningfully" },
    apple:            { dir: "up",    note: "TSMC raised prices 20% after selling out — Apple getting second-source options at Intel reduces TSMC pricing leverage" },
    asml:             { dir: "up",    note: "ASML makes 70-80 EUV tools per year — Intel 18A being the first High-NA commercial validation drives the next tool order cycle" },
    amat:             { dir: "up",    note: "Applied Materials' backside power delivery technology is key to 18A — a direct process technology win for them" },
    klac:             { dir: "up",    note: "Intel posted a Q1 2026 earnings beat — an 18A ramp requires a full KLA metrology refresh at every process step" },
    arm:              { dir: "up",    note: "ARM was going parabolic on the agentic CPU thesis — 18A customer chips all use Arm ISA, adding royalty volume" },
    snps:             { dir: "up",    note: "18A PDK is validated in Synopsys tools — more tape-out activity at Intel foundry drives EDA revenue" },
    cdns:             { dir: "up",    note: "Intel foundry was not abandoned — Cadence 18A design tools are validated and customer design wins are following" },
  },
  "memory-oversupply": {
    skhynix:          { dir: "down",  note: "DRAM companies already trade at mid-single digit multiples — oversupply removes the one remaining premium, which is HBM scarcity" },
    micron:           { dir: "down",  note: "he doesn't know anyone who isn't bullish on DRAM long-term — but an oversupply scenario is exactly the bear case that would break that thesis" },
    "samsung-memory": { dir: "mixed", note: "Samsung uses oversupply as a strategic pricing weapon against rivals — memory margins were in the eighties — both dynamics are at risk" },
    "samsung-foundry":{ dir: "down",  note: "Memory division losses drag overall Samsung financials and remove the cross-subsidy that supports foundry investments" },
    lrcx:             { dir: "down",  note: "the memory run was the key driver of Lam — oversupply means memory capex cuts hit Lam Research the hardest" },
    amat:             { dir: "down",  note: "DRAM capex is a major Applied Materials revenue driver — oversupply causes cuts that flow directly through to equipment orders" },
    nvidia:           { dir: "up",    note: "HBM costs more than the TSMC node in Nvidia's bill of materials — cheaper HBM from oversupply would improve GPU gross margins" },
  },
  "asml-shock": {
    asml:             { dir: "down",  note: "ASML makes roughly 70 EUV tools per year and is targeting 80 — a delay exposes how thin the production margin actually is" },
    zeiss:            { dir: "down",  note: "Zeiss is the sole EUV optics supplier; Patel views ASML's production rate as the binding constraint — Zeiss is the root cause" },
    tsmc:             { dir: "down",  note: "TSMC capacity decisions are the most important variable — without EUV tool deliveries, N2/A16 expansion freezes" },
    "samsung-foundry":{ dir: "down",  note: "Samsung's 2nm timeline slips; Baker notes they are already 18+ months behind TSMC — the gap widens further with an ASML shock" },
    intel:            { dir: "down",  note: "18A buys Intel time; an ASML shock directly blocks the 14A follow-on node that is supposed to make the comeback sustainable" },
    skhynix:          { dir: "down",  note: "HBM costs more than the TSMC node in Nvidia's bill of materials — HBM4 capacity growth freezes without EUV tool access" },
    micron:           { dir: "down",  note: "Micron is already out of the picture for Rubin HBM4 — an ASML delay makes that gap permanent" },
    nvidia:           { dir: "down",  note: "Rubin depends on TSMC's N2 node — an ASML shock means no N2, and the Rubin roadmap slips with no alternative" },
    amd:              { dir: "down",  note: "AMD is already running behind — next-gen MI-series is N2-targeted, and an ASML delay extends the gap versus Nvidia further" },
    apple:            { dir: "down",  note: "A19/M5 are both N2-targeted — TSMC Arizona is approaching the bleeding edge — an ASML shock propagates to the Apple product roadmap" },
  },
  "ai-capex-supercycle": {
    nvidia:           { dir: "up",    note: "if TSMC expands capacity, Nvidia could sell $2T worth of GPUs in 2026-2027 — the supercycle is the scenario that proves it" },
    skhynix:          { dir: "up",    note: "HBM costs more than the TSMC node in Nvidia's bill of materials — HBM demand doubling means SK Hynix re-rates significantly" },
    micron:           { dir: "up",    note: "he doesn't know anyone who isn't bullish on DRAM — a full capex supercycle is the scenario that closes the multiple gap" },
    tsmc:             { dir: "up",    note: "TSMC capacity decisions are the most important variable — a supercycle proves they were right to invest aggressively" },
    broadcom:         { dir: "up",    note: "Broadcom is guiding to $100B in AI revenue by 2027 — the supercycle is exactly the environment that gets them there" },
    marvell:          { dir: "up",    note: "Trainium in 2026 is what TPUs were to 2025 — the supercycle validates the entire custom silicon thesis" },
    astera:           { dir: "up",    note: "Every AI rack needs connectivity silicon — Astera revenue scales linearly with the number of GPU shipments" },
    supermicro:       { dir: "up",    note: "Nvidia essentially created the neocloud industry — AI server assembly demand doubles in a supercycle" },
    dell:             { dir: "up",    note: "GPU server mix reaches 40%+ of total revenue; the OEM commitment to AI hardware infrastructure is locked in" },
    foxconn:          { dir: "up",    note: "GB200 rack manufacturing for Nvidia — Baker: the hardware engineering challenge at Terafab scale is the next big wave" },
    arista:           { dir: "up",    note: "Nvidia is already the largest networking vendor — the 800G port refresh cycle accelerates through the supercycle" },
    coherent:         { dir: "up",    note: "Every new AI data center build needs 800G and 1.6T optics — Coherent transceiver demand scales with every rack deployed" },
    lumentum:         { dir: "up",    note: "Laser chip content grows with port count — a supercycle means Lumentum demand grows linearly alongside the build" },
    fabrinet:         { dir: "up",    note: "Contract optical manufacturing backlog extends; a supercycle tightens optical component capacity across the board" },
    microsoft:        { dir: "up",    note: "Azure is dwarfing rivals on AI capex — the supercycle justifies every dollar of the Stargate commitment" },
    google:           { dir: "up",    note: "the TPUv7 Ironwood deal is worth roughly $52B — GCP AI revenue inflects in a full supercycle environment" },
    amazon:           { dir: "up",    note: "AWS plans to build more capacity than anyone else in 2025-2027 — the supercycle fully vindicates that decision" },
    meta:             { dir: "up",    note: "Llama training at scale — 2026 is the year of custom silicon — Meta's MTIA bet finally pays off in this environment" },
    oracle:           { dir: "up",    note: "Stargate is a $300B deal at $10-15B per gigawatt — the supercycle re-rates Oracle as a core AI infrastructure company" },
    coreweave:        { dir: "up",    note: "Nvidia created the neocloud market — pure-play GPU cloud revenue doubles and the IPO timing looks prescient" },
  },
  "openai-demand-shock": {
    openai:           { dir: "up",    note: "OpenAI is adding revenue faster than almost any company in history — the demand shock accelerates the path to IPO" },
    microsoft:        { dir: "up",    note: "Azure is dwarfing rivals on AI capex — the $500B Stargate commitment is fully justified by OpenAI demand alone" },
    oracle:           { dir: "up",    note: "Stargate is a $300B deal over five years — OCI becomes the primary non-Azure host for OpenAI and the stock re-rates" },
    coreweave:        { dir: "up",    note: "OpenAI as the anchor customer validates the entire neocloud model that Nvidia essentially built" },
    nvidia:           { dir: "up",    note: "if TSMC expanded capacity, Nvidia could sell $2T of GPUs — OpenAI is the single demand event that proves that thesis" },
    tsmc:             { dir: "up",    note: "TSMC capacity is the most important variable — OpenAI GPU wafer demand is a meaningful allocation event at the leading edge" },
    skhynix:          { dir: "up",    note: "HBM costs more than the TSMC node in Nvidia's bill of materials — an OpenAI GPU surge translates into a multi-billion dollar SK Hynix contract" },
    broadcom:         { dir: "up",    note: "the OpenAI XPU ASIC deal with Broadcom is essentially a windfall for them — could be their largest customer relationship ever" },
    supermicro:       { dir: "up",    note: "the neocloud ecosystem — AI rack assembly for Stargate creates over $1B in revenue concentration" },
    foxconn:          { dir: "up",    note: "GB200 rack manufacturing for Stargate — hardware engineering at Terafab scale is the model for what comes next" },
    arista:           { dir: "up",    note: "Nvidia is already the largest networking vendor — the Stargate data center build requires hundreds of thousands of switch ports" },
  },
  "hbm4-transition": {
    skhynix:          { dir: "up",    note: "Samsung is effectively out of the picture for Rubin HBM4 — SK Hynix becomes the sole qualified supplier and holds maximum pricing power" },
    micron:           { dir: "down",  note: "Micron is well behind and effectively out of the picture for Rubin HBM4 — the company misses the most important GPU generation cycle" },
    "samsung-memory": { dir: "down",  note: "Samsung was already flagged as out for Rubin HBM4 — the HBM3E qualification lag persists into the next generation" },
    lrcx:             { dir: "up",    note: "the memory run keeps going — HBM4 stacking requires more advanced etch steps, and Lam Research orders accelerate" },
    nvidia:           { dir: "mixed", note: "HBM costs more than the TSMC node in Nvidia's bill of materials — chips ship, but sole-sourcing from SK Hynix carries a supply risk premium" },
    amd:              { dir: "down",  note: "AMD is running pretty mid — MI400 gets delayed if HBM4 supply is concentrated entirely at SK Hynix" },
    openai:           { dir: "down",  note: "OpenAI is targeting 5-10GW of compute — any GPU delivery timing risk delays every gigawatt in the plan" },
    xai:              { dir: "down",  note: "xAI gets GPU access ahead of most other customers — an HBM4 constraint narrows that structural timing advantage" },
    coreweave:        { dir: "down",  note: "the neocloud model requires continuous GPU additions — HBM4 shortage delays next-gen GPU capacity for months" },
  },
  "geopolitical-japan-korea": {
    "shin-etsu":      { dir: "down",  note: "the allied supply chain coordination is the long-term strategy — Japan alignment restricts China wafer sales for Shin-Etsu" },
    sumco:            { dir: "down",  note: "Same allied export control exposure as Shin-Etsu — China wafer export revenue is increasingly at risk under coordinated restrictions" },
    jsr:              { dir: "down",  note: "METI photoresist restrictions already set the precedent — China EUV photoresist revenue for JSR is effectively gone" },
    zeiss:            { dir: "down",  note: "The EU is aligned on EUV-adjacent component exports; Patel sees ASML's constraints propagating directly to Zeiss" },
    tel:              { dir: "down",  note: "Tokyo Electron is already restricted from China advanced nodes — further US-Japan alignment cuts additional revenue" },
    skhynix:          { dir: "down",  note: "HBM exports to Chinese AI customers are under increasing scrutiny — SK Hynix is the most exposed Korean memory company" },
    "samsung-foundry":{ dir: "mixed", note: "China's fab technology is four years behind and the gap is growing — Samsung gains share versus China but still faces export review uncertainty" },
    "samsung-memory": { dir: "down",  note: "HBM exports to China are increasingly restricted — the memory supercycle helps, but the China revenue cut is a real headwind" },
    tsmc:             { dir: "up",    note: "the allied supply chain coordination benefits Taiwan — competitor access to advanced tools gets cut while TSMC gains relative position" },
    asml:             { dir: "down",  note: "ASML is already capped at 70-80 EUV tools per year — a DUV ban removes the incremental China volume that was still flowing" },
  },
  "packaging-unbundled": {
    tsmc:             { dir: "down",  note: "CoWoS is the actual gating constraint on the Blackwell ramp — packaging competition from OSATs erodes that pricing power" },
    ase:              { dir: "up",    note: "TSMC's own CoPAS packaging offering isn't coming until 2028 — ASE gains meaningful AI chip packaging share in the gap" },
    amkor:            { dir: "up",    note: "Amkor is co-invested with TSMC in Arizona — Terafab-style talent clustering makes the US packaging ecosystem real" },
    nvidia:           { dir: "up",    note: "CoWoS was the Blackwell bottleneck — packaging competition from OSATs lowers that cost and improves GPU economics" },
    amd:              { dir: "up",    note: "Multiple packaging sources reduce supply risk — AMD needs every cost and supply advantage it can get versus Nvidia" },
    broadcom:         { dir: "up",    note: "Broadcom is guiding to $100B in AI revenue by 2027 — packaging optionality improves the economics of TPU and XPU programs" },
    "samsung-foundry":{ dir: "up",    note: "Samsung is a key node in the allied supply chain — a fab plus packaging bundle becomes more competitive against TSMC's offering" },
    intel:            { dir: "up",    note: "18A keeps Intel's foundry alive — EMIB and Foveros advanced packaging gain credibility as real alternatives to TSMC CoWoS" },
  },
  "reticle-limit-era": {
    intel:            { dir: "up",    note: "EMIB's panel-based bridges avoid the wafer-interposer cost spiral — Intel's best near-term foundry business may be packaging Nvidia's chips, not competing with them" },
    tsmc:             { dir: "mixed", note: "CoWoS demand keeps growing and pricing power holds near-term — but at 4-reticle package sizes the interposer economics break, and the moat narrows" },
    nvidia:           { dir: "mixed", note: "Multi-die packages make Rubin Ultra possible at all — but packaging is now a structural cost line that monolithic chips never had" },
    amd:              { dir: "up",    note: "AMD has shipped chiplets since Zen 1 — years of multi-die design experience become an advantage when the whole industry is forced into it" },
    broadcom:         { dir: "up",    note: "Hyperscaler XPU programs are the largest packaging volume after Nvidia — cheaper multi-die assembly directly widens custom ASIC margins" },
    marvell:          { dir: "up",    note: "Trainium and Maia generations are gated on packaging capacity — more assembly supply means faster custom silicon program cycles" },
    ase:              { dir: "up",    note: "The world's largest OSAT wins in every branch — overflow from CoWoS, bridge-based assembly, and test all flow through ASE" },
    amkor:            { dir: "up",    note: "Arizona co-investment with TSMC puts Amkor at the center of onshored multi-die assembly for Nvidia and Apple" },
    skhynix:          { dir: "up",    note: "HBM costs more than the TSMC node in Nvidia's bill of materials — every added stack per package compounds that pricing power" },
    micron:           { dir: "up",    note: "More HBM stacks per GPU means more memory content per unit — the multi-die era is structurally bullish for memory ASPs" },
    besi:             { dir: "up",    note: "Hybrid bonding precision is the binding constraint under every 2.5D/3D roadmap — tool demand scales with every die added to a package" },
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
          {/* Scenarios button */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen((o) => !o)}
              className={`flex items-center gap-1.5 border px-3 py-1.5 text-[13px] font-semibold transition-colors ${
                activeScenario
                  ? "border-[#B45309] bg-[#FFF7ED] text-[#B45309]"
                  : "border-[#111827] bg-[#111827] text-white hover:bg-[#374151]"
              }`}
            >
              {activeScenario ? (
                <span className="max-w-[160px] truncate">{activeScenario.label}</span>
              ) : (
                "Scenarios"
              )}
              <span className="ml-0.5 text-[10px]">{dropdownOpen ? "▲" : "▾"}</span>
            </button>
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

      {/* Right sidebar: scenario list (dropdown open) OR scenario detail (scenario active) */}
      {(dropdownOpen || activeScenario) && (
        <div className="fixed right-0 top-[70px] bottom-0 z-50 w-80 border-l border-gray-200 bg-white shadow-2xl flex flex-col">
          {dropdownOpen ? (
            /* ── Scenario list ── */
            <>
              <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3 shrink-0">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                  {SCENARIOS.length} investor scenarios
                </span>
                <button
                  onClick={() => setDropdownOpen(false)}
                  className="text-gray-400 hover:text-gray-600 text-sm leading-none"
                >
                  ✕
                </button>
              </div>
              <div className="flex-1 overflow-y-auto">
                {SCENARIOS.map((s) => {
                  const effects = STOCK_EFFECTS[s.id] ?? {};
                  const ups = s.nodes.filter((n) => effects[n]?.dir === "up").length;
                  const downs = s.nodes.filter((n) => effects[n]?.dir === "down").length;
                  return (
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
                        <span className="text-[12px] font-semibold text-gray-800 leading-snug flex-1">{s.label}</span>
                        <span className="flex items-center gap-1.5 shrink-0">
                          {ups > 0 && (
                            <span className="text-[11px] font-bold text-green-600">▲{ups}</span>
                          )}
                          {downs > 0 && (
                            <span className="text-[11px] font-bold text-red-600">▼{downs}</span>
                          )}
                        </span>
                      </div>
                      <p className="ml-4 mt-0.5 text-[11px] leading-snug text-gray-500">
                        {s.subtitle}
                      </p>
                    </button>
                  );
                })}
              </div>
              {scenario && (
                <div className="border-t border-gray-100 px-4 py-3 shrink-0">
                  <button
                    onClick={() => { setScenario(null); setDropdownOpen(false); }}
                    className="text-[11px] text-gray-500 hover:text-gray-700"
                  >
                    ✕ Clear scenario
                  </button>
                </div>
              )}
            </>
          ) : activeScenario ? (
            /* ── Scenario detail ── */
            <>
              <div
                className="shrink-0 border-b px-4 pt-3 pb-2"
                style={{ borderColor: activeScenario.color + "40", backgroundColor: activeScenario.color + "08" }}
              >
                <div className="flex items-start gap-2">
                  <span
                    className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full"
                    style={{ backgroundColor: activeScenario.color }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="text-[13px] font-bold leading-snug" style={{ color: activeScenario.color }}>
                      {activeScenario.label}
                    </div>
                    <div className="mt-0.5 text-[11px] text-gray-500 leading-snug">{activeScenario.subtitle}</div>
                    {/* ▲/▼ summary */}
                    {(() => {
                      const effects = STOCK_EFFECTS[activeScenario.id] ?? {};
                      const ups = activeScenario.nodes.filter((n) => effects[n]?.dir === "up").length;
                      const downs = activeScenario.nodes.filter((n) => effects[n]?.dir === "down").length;
                      const mixed = activeScenario.nodes.filter((n) => effects[n]?.dir === "mixed").length;
                      const neutral = activeScenario.nodes.filter((n) => effects[n]?.dir === "neutral").length;
                      return (
                        <div className="mt-1.5 flex items-center gap-3">
                          {ups > 0 && <span className="text-[12px] font-bold text-green-600">▲ {ups} bullish</span>}
                          {downs > 0 && <span className="text-[12px] font-bold text-red-600">▼ {downs} bearish</span>}
                          {mixed > 0 && <span className="text-[12px] font-semibold text-gray-400">↔ {mixed} mixed</span>}
                          {neutral > 0 && <span className="text-[12px] font-semibold text-gray-400">— {neutral} neutral</span>}
                        </div>
                      );
                    })()}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => setDropdownOpen(true)}
                      className="text-[10px] text-gray-400 hover:text-gray-600 border border-gray-200 px-1.5 py-0.5 leading-tight"
                    >
                      ≡
                    </button>
                    <button
                      onClick={() => setScenario(null)}
                      className="text-gray-400 hover:text-gray-600 text-sm leading-none"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              </div>
              {/* Company rows */}
              <div className="flex-1 overflow-y-auto">
                {activeScenario.nodes.map((nid) => {
                  const node = NODES.find((n) => n.id === nid);
                  const reason = activeScenario.why[nid];
                  const effect = STOCK_EFFECTS[activeScenario.id]?.[nid];
                  if (!node) return null;
                  const effectColor = effect?.dir === "up" ? "#16a34a" : effect?.dir === "down" ? "#dc2626" : "#6b7280";
                  const effectArrow = effect?.dir === "up" ? "▲" : effect?.dir === "down" ? "▼" : effect?.dir === "neutral" ? "—" : "↔";
                  return (
                    <div
                      key={nid}
                      className="flex items-start gap-2.5 px-4 py-2.5 border-b border-gray-50 last:border-0"
                    >
                      {/* Colored direction badge */}
                      {effect ? (
                        <span
                          className="mt-0.5 shrink-0 text-[13px] font-black leading-none w-4 text-center"
                          style={{ color: effectColor }}
                        >
                          {effectArrow}
                        </span>
                      ) : (
                        <span
                          className="mt-1 h-1.5 w-4 shrink-0 flex items-center justify-center"
                        >
                          <span
                            className="h-1.5 w-1.5 rounded-full"
                            style={{ backgroundColor: TIER_COLORS[node.tier as Tier] }}
                          />
                        </span>
                      )}
                      <div className="min-w-0">
                        <div className="flex items-baseline gap-1.5 flex-wrap">
                          <span className="text-[12px] font-bold text-gray-900">{(/^\d/.test(node.ticker ?? "")) ? node.name : (node.ticker ?? node.name)}</span>
                          {effect && (
                            <span
                              className="text-[10px] font-semibold px-1 py-0 rounded"
                              style={{ color: effectColor, backgroundColor: effectColor + "14" }}
                            >
                              {effect.dir === "up" ? "bullish" : effect.dir === "down" ? "bearish" : effect.dir === "neutral" ? "neutral" : "mixed"}
                            </span>
                          )}
                        </div>
                        {reason && (
                          <p className="mt-0.5 text-[10px] leading-snug text-gray-500">{reason}</p>
                        )}
                        {effect && (
                          <p className="mt-0.5 text-[10px] leading-snug text-gray-400 italic">{effect.note}</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          ) : null}
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
                {n.ticker && !(/^\d/.test(n.ticker)) && (
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
                  {n.ticker && !(/^\d/.test(n.ticker)) && <span className="ml-2 font-mono text-xs text-gray-400">{n.ticker}</span>}
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
              {(/^\d/.test(activeNode.ticker ?? "")) ? "PRIVATE" : (activeNode.ticker ?? "PRIVATE")}
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
