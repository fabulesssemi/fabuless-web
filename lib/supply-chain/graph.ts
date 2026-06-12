// Semiconductor supply chain graph — the data layer for the Supply Chain Web.
// Nodes are companies grouped into tiers; edges are directed supplier→customer
// relationships with a typed relation. UI to be built on top of this.

export type Tier =
  | "materials"   // wafers, chemicals, photoresist
  | "equipment"   // litho, etch, deposition, metrology
  | "eda_ip"      // design software + IP licensing
  | "foundry"     // wafer fabrication
  | "memory"      // DRAM / HBM / NAND
  | "packaging"   // advanced packaging, OSAT
  | "designer"    // fabless chip designers
  | "integrator"  // systems: servers, networking
  | "customer";   // hyperscalers, OEMs, AI labs

export type RelationType =
  | "supplies_equipment"
  | "supplies_materials"
  | "fabricates_for"
  | "supplies_memory"
  | "packages_for"
  | "licenses_ip"
  | "eda_tools"
  | "designs_asic_for"
  | "supplies_chips"
  | "builds_systems_for"
  | "provides_compute";

export type SupplyNode = {
  id: string;            // slug, matches /companies/[slug] where covered
  name: string;
  ticker?: string;       // undefined for private companies
  tier: Tier;
  covered: boolean;      // true = in Fabuless coverage universe (links to company page)
  blurb: string;         // one line on its role in the chain
};

export type SupplyEdge = {
  from: string;          // supplier node id
  to: string;            // customer node id
  relation: RelationType;
  label: string;         // short edge annotation, e.g. "EUV tools" or "HBM3E"
  critical?: boolean;    // true = single-source or near-single-source dependency
};

// ── Nodes ────────────────────────────────────────────────────────────────────

export const NODES: SupplyNode[] = [
  // Tier: materials
  { id: "shin-etsu", name: "Shin-Etsu", ticker: "4063.T", tier: "materials", covered: false,
    blurb: "World's largest silicon wafer supplier." },
  { id: "sumco", name: "SUMCO", ticker: "3436.T", tier: "materials", covered: false,
    blurb: "Second-largest silicon wafer supplier." },
  { id: "jsr", name: "JSR", tier: "materials", covered: false,
    blurb: "Photoresist leader, critical for EUV lithography." },
  { id: "zeiss", name: "Zeiss SMT", tier: "materials", covered: false,
    blurb: "Sole supplier of EUV optics — ASML's machines don't exist without it." },

  // Tier: equipment
  { id: "asml", name: "ASML", ticker: "ASML", tier: "equipment", covered: true,
    blurb: "Monopoly on EUV lithography — every advanced chip depends on it." },
  { id: "amat", name: "Applied Materials", ticker: "AMAT", tier: "equipment", covered: false,
    blurb: "Broadest equipment portfolio: deposition, etch, implant." },
  { id: "lrcx", name: "Lam Research", ticker: "LRCX", tier: "equipment", covered: false,
    blurb: "Etch and deposition leader; critical for NAND and HBM stacking." },
  { id: "klac", name: "KLA", ticker: "KLAC", tier: "equipment", covered: false,
    blurb: "Process control and metrology — yields depend on it." },
  { id: "tel", name: "Tokyo Electron", ticker: "8035.T", tier: "equipment", covered: false,
    blurb: "Coaters/developers paired with every EUV tool." },
  { id: "besi", name: "BE Semiconductor", ticker: "BESI", tier: "equipment", covered: false,
    blurb: "Hybrid bonding leader — the die-attach tooling under every advanced packaging roadmap." },

  // Tier: EDA + IP
  { id: "arm", name: "Arm", ticker: "ARM", tier: "eda_ip", covered: true,
    blurb: "CPU instruction set licensed across mobile, server, and AI chips." },
  { id: "snps", name: "Synopsys", ticker: "SNPS", tier: "eda_ip", covered: false,
    blurb: "EDA software every chip designer uses." },
  { id: "cdns", name: "Cadence", ticker: "CDNS", tier: "eda_ip", covered: false,
    blurb: "EDA software + design IP." },

  // Tier: foundry
  { id: "tsmc", name: "TSMC", ticker: "TSM", tier: "foundry", covered: true,
    blurb: "Fabricates virtually every leading-edge AI chip on earth." },
  { id: "samsung-foundry", name: "Samsung Foundry", ticker: "005930.KS", tier: "foundry", covered: true,
    blurb: "Second-source leading-edge foundry; Exynos + external customers." },
  { id: "intel", name: "Intel", ticker: "INTC", tier: "foundry", covered: true,
    blurb: "x86 designer turned foundry challenger — 18A is the bet." },
  { id: "globalfoundries", name: "GlobalFoundries", ticker: "GFS", tier: "foundry", covered: false,
    blurb: "Trailing-edge foundry — RF, auto, and legacy nodes." },

  // Tier: memory
  { id: "micron", name: "Micron", ticker: "MU", tier: "memory", covered: true,
    blurb: "Only US DRAM/HBM maker." },
  { id: "skhynix", name: "SK Hynix", ticker: "000660.KS", tier: "memory", covered: true,
    blurb: "HBM leader — majority share of Nvidia's HBM supply." },
  { id: "samsung-memory", name: "Samsung Memory", ticker: "005930.KS", tier: "memory", covered: true,
    blurb: "Largest DRAM/NAND maker; fighting for HBM qualification." },

  // Tier: packaging
  { id: "ase", name: "ASE Technology", ticker: "ASX", tier: "packaging", covered: false,
    blurb: "World's largest OSAT; overflow advanced packaging capacity." },
  { id: "amkor", name: "Amkor", ticker: "AMKR", tier: "packaging", covered: false,
    blurb: "US-listed OSAT; packaging for Apple, Nvidia, AMD." },

  // Tier: designers
  { id: "nvidia", name: "Nvidia", ticker: "NVDA", tier: "designer", covered: true,
    blurb: "The AI compute platform — GPUs, networking, systems." },
  { id: "amd", name: "AMD", ticker: "AMD", tier: "designer", covered: true,
    blurb: "GPU + CPU challenger; MI-series is the main Nvidia alternative." },
  { id: "broadcom", name: "Broadcom", ticker: "AVGO", tier: "designer", covered: true,
    blurb: "Custom AI ASICs (Google TPU) + networking silicon." },
  { id: "marvell", name: "Marvell", ticker: "MRVL", tier: "designer", covered: true,
    blurb: "Custom ASICs (Amazon Trainium) + optical/interconnect." },
  { id: "qualcomm", name: "Qualcomm", ticker: "QCOM", tier: "designer", covered: true,
    blurb: "Mobile SoCs and modems; pushing into PC and auto." },
  { id: "astera", name: "Astera Labs", ticker: "ALAB", tier: "designer", covered: false,
    blurb: "PCIe/CXL connectivity silicon inside every AI server rack." },

  // Tier: integrators
  { id: "supermicro", name: "Supermicro", ticker: "SMCI", tier: "integrator", covered: false,
    blurb: "AI server assembly — GPUs into racks." },
  { id: "dell", name: "Dell", ticker: "DELL", tier: "integrator", covered: false,
    blurb: "AI server volume leader for enterprise." },
  { id: "foxconn", name: "Foxconn", ticker: "2317.TW", tier: "integrator", covered: false,
    blurb: "World's largest electronics assembler — GB200 rack manufacturing." },
  { id: "arista", name: "Arista", ticker: "ANET", tier: "integrator", covered: false,
    blurb: "AI datacenter networking — the switch layer between GPUs." },
  { id: "coherent", name: "Coherent", ticker: "COHR", tier: "integrator", covered: false,
    blurb: "800G/1.6T optical transceivers — the physical layer of AI networking." },
  { id: "lumentum", name: "Lumentum", ticker: "LITE", tier: "integrator", covered: false,
    blurb: "Laser chips and optical components inside every transceiver." },
  { id: "fabrinet", name: "Fabrinet", ticker: "FN", tier: "integrator", covered: false,
    blurb: "Contract optical manufacturer — builds Coherent/Lumentum modules at scale." },

  // Tier: customers
  { id: "apple", name: "Apple", ticker: "AAPL", tier: "customer", covered: false,
    blurb: "TSMC's largest customer; designs its own silicon." },
  { id: "google", name: "Google", ticker: "GOOGL", tier: "customer", covered: false,
    blurb: "TPUs (with Broadcom) + the largest in-house AI fleet." },
  { id: "amazon", name: "Amazon", ticker: "AMZN", tier: "customer", covered: false,
    blurb: "Trainium/Inferentia (with Marvell/Alchip) + AWS demand." },
  { id: "microsoft", name: "Microsoft", ticker: "MSFT", tier: "customer", covered: false,
    blurb: "Maia ASIC + OpenAI's primary compute partner." },
  { id: "meta", name: "Meta", ticker: "META", tier: "customer", covered: false,
    blurb: "MTIA ASIC + among the largest GPU buyers." },
  { id: "openai", name: "OpenAI", tier: "customer", covered: false,
    blurb: "The demand engine — multi-gigawatt buildouts across partners." },
  { id: "oracle", name: "Oracle", ticker: "ORCL", tier: "customer", covered: false,
    blurb: "OCI GPU cloud + Stargate — OpenAI's biggest compute landlord." },
  { id: "coreweave", name: "CoreWeave", ticker: "CRWV", tier: "customer", covered: false,
    blurb: "The pure-play GPU cloud — Nvidia-backed, AI-lab demand." },
  { id: "xai", name: "xAI", tier: "customer", covered: false,
    blurb: "Colossus — first confirmed gigawatt-scale training cluster." },
  { id: "anthropic", name: "Anthropic", tier: "customer", covered: false,
    blurb: "Frontier lab training across AWS Trainium and Google TPUs." },
];

// ── Edges ────────────────────────────────────────────────────────────────────

export const EDGES: SupplyEdge[] = [
  // Materials → equipment/foundry
  { from: "shin-etsu", to: "tsmc", relation: "supplies_materials", label: "Silicon wafers" },
  { from: "sumco", to: "tsmc", relation: "supplies_materials", label: "Silicon wafers" },
  { from: "shin-etsu", to: "samsung-foundry", relation: "supplies_materials", label: "Silicon wafers" },
  { from: "jsr", to: "tsmc", relation: "supplies_materials", label: "EUV photoresist", critical: true },
  { from: "zeiss", to: "asml", relation: "supplies_materials", label: "EUV optics — sole source", critical: true },
  { from: "shin-etsu", to: "intel", relation: "supplies_materials", label: "Silicon wafers" },
  { from: "sumco", to: "samsung-foundry", relation: "supplies_materials", label: "Silicon wafers" },

  // Equipment → foundries/memory
  { from: "asml", to: "tsmc", relation: "supplies_equipment", label: "EUV lithography", critical: true },
  { from: "asml", to: "samsung-foundry", relation: "supplies_equipment", label: "EUV lithography", critical: true },
  { from: "asml", to: "intel", relation: "supplies_equipment", label: "High-NA EUV", critical: true },
  { from: "asml", to: "skhynix", relation: "supplies_equipment", label: "EUV for DRAM" },
  { from: "asml", to: "micron", relation: "supplies_equipment", label: "EUV for DRAM" },
  { from: "amat", to: "tsmc", relation: "supplies_equipment", label: "Deposition/etch" },
  { from: "amat", to: "intel", relation: "supplies_equipment", label: "Deposition/etch" },
  { from: "lrcx", to: "skhynix", relation: "supplies_equipment", label: "HBM etch/bonding", critical: true },
  { from: "lrcx", to: "micron", relation: "supplies_equipment", label: "Etch/deposition" },
  { from: "lrcx", to: "samsung-memory", relation: "supplies_equipment", label: "NAND etch" },
  { from: "klac", to: "tsmc", relation: "supplies_equipment", label: "Process control" },
  { from: "klac", to: "intel", relation: "supplies_equipment", label: "Process control" },
  { from: "tel", to: "tsmc", relation: "supplies_equipment", label: "Coat/develop" },
  { from: "tel", to: "samsung-foundry", relation: "supplies_equipment", label: "Coat/develop" },
  { from: "besi", to: "tsmc", relation: "supplies_equipment", label: "Hybrid bonding", critical: true },
  { from: "besi", to: "ase", relation: "supplies_equipment", label: "Die attach / bonding" },
  { from: "besi", to: "amkor", relation: "supplies_equipment", label: "Die attach / bonding" },
  { from: "klac", to: "samsung-foundry", relation: "supplies_equipment", label: "Process control" },
  { from: "asml", to: "samsung-memory", relation: "supplies_equipment", label: "EUV for DRAM" },
  { from: "amat", to: "globalfoundries", relation: "supplies_equipment", label: "Deposition/etch" },

  // EDA/IP → designers
  { from: "arm", to: "nvidia", relation: "licenses_ip", label: "Grace CPU (Arm ISA)" },
  { from: "arm", to: "qualcomm", relation: "licenses_ip", label: "Snapdragon (Arm ISA)", critical: true },
  { from: "arm", to: "apple", relation: "licenses_ip", label: "Apple Silicon (Arm ISA)", critical: true },
  { from: "arm", to: "amazon", relation: "licenses_ip", label: "Graviton (Arm ISA)" },
  { from: "snps", to: "nvidia", relation: "eda_tools", label: "EDA" },
  { from: "snps", to: "amd", relation: "eda_tools", label: "EDA" },
  { from: "cdns", to: "broadcom", relation: "eda_tools", label: "EDA" },
  { from: "cdns", to: "marvell", relation: "eda_tools", label: "EDA" },
  { from: "snps", to: "qualcomm", relation: "eda_tools", label: "EDA" },

  // Foundry → designers
  { from: "tsmc", to: "nvidia", relation: "fabricates_for", label: "Blackwell/Rubin (N4/N3)", critical: true },
  { from: "tsmc", to: "amd", relation: "fabricates_for", label: "MI400 + EPYC", critical: true },
  { from: "tsmc", to: "broadcom", relation: "fabricates_for", label: "TPU + networking", critical: true },
  { from: "tsmc", to: "marvell", relation: "fabricates_for", label: "Custom ASICs" },
  { from: "tsmc", to: "qualcomm", relation: "fabricates_for", label: "Snapdragon" },
  { from: "tsmc", to: "apple", relation: "fabricates_for", label: "A/M-series (N3, first dibs)", critical: true },
  { from: "samsung-foundry", to: "qualcomm", relation: "fabricates_for", label: "Second source" },
  { from: "intel", to: "apple", relation: "fabricates_for", label: "18A (announced 2026)" },
  { from: "intel", to: "microsoft", relation: "fabricates_for", label: "18A custom silicon" },
  { from: "tsmc", to: "astera", relation: "fabricates_for", label: "Connectivity silicon" },
  { from: "globalfoundries", to: "qualcomm", relation: "fabricates_for", label: "RF front-end" },

  // Memory → designers
  { from: "skhynix", to: "nvidia", relation: "supplies_memory", label: "HBM3E/HBM4", critical: true },
  { from: "micron", to: "nvidia", relation: "supplies_memory", label: "HBM3E" },
  { from: "samsung-memory", to: "nvidia", relation: "supplies_memory", label: "HBM (qualifying)" },
  { from: "skhynix", to: "amd", relation: "supplies_memory", label: "HBM for MI-series" },
  { from: "micron", to: "amd", relation: "supplies_memory", label: "HBM" },
  { from: "samsung-memory", to: "amd", relation: "supplies_memory", label: "HBM" },

  // Packaging
  { from: "tsmc", to: "nvidia", relation: "packages_for", label: "CoWoS advanced packaging", critical: true },
  { from: "ase", to: "nvidia", relation: "packages_for", label: "Overflow packaging" },
  { from: "amkor", to: "apple", relation: "packages_for", label: "US packaging (AZ)" },

  // Designers → ASIC partnerships
  { from: "broadcom", to: "google", relation: "designs_asic_for", label: "TPU co-design", critical: true },
  { from: "marvell", to: "amazon", relation: "designs_asic_for", label: "Trainium co-design" },
  { from: "marvell", to: "microsoft", relation: "designs_asic_for", label: "Maia interconnect" },
  { from: "broadcom", to: "openai", relation: "designs_asic_for", label: "Custom XPU — 10GW deal", critical: true },
  { from: "broadcom", to: "meta", relation: "designs_asic_for", label: "MTIA co-design" },

  // Designers → customers (chips)
  { from: "nvidia", to: "microsoft", relation: "supplies_chips", label: "GPUs (for OpenAI)" },
  { from: "nvidia", to: "meta", relation: "supplies_chips", label: "GPUs" },
  { from: "nvidia", to: "google", relation: "supplies_chips", label: "GPUs (cloud)" },
  { from: "nvidia", to: "amazon", relation: "supplies_chips", label: "GPUs (AWS)" },
  { from: "nvidia", to: "openai", relation: "supplies_chips", label: "Direct deal — $100B equity + GPUs", critical: true },
  { from: "amd", to: "openai", relation: "supplies_chips", label: "MI450 — 6GW deal" },
  { from: "amd", to: "meta", relation: "supplies_chips", label: "MI-series" },
  { from: "qualcomm", to: "apple", relation: "supplies_chips", label: "Modems (being displaced)" },
  { from: "nvidia", to: "oracle", relation: "supplies_chips", label: "GPUs (OCI / Stargate)" },
  { from: "nvidia", to: "coreweave", relation: "supplies_chips", label: "GPUs — equity backer", critical: true },
  { from: "nvidia", to: "xai", relation: "supplies_chips", label: "Colossus GPUs", critical: true },
  { from: "broadcom", to: "arista", relation: "supplies_chips", label: "Tomahawk switch silicon", critical: true },
  { from: "astera", to: "supermicro", relation: "supplies_chips", label: "PCIe retimers" },
  { from: "astera", to: "dell", relation: "supplies_chips", label: "PCIe retimers" },

  // Optical components
  { from: "lumentum", to: "coherent", relation: "supplies_materials", label: "Laser chips / EMLs", critical: true },
  { from: "coherent", to: "arista", relation: "supplies_chips", label: "800G/1.6T transceivers", critical: true },
  { from: "fabrinet", to: "arista", relation: "supplies_chips", label: "Optical module mfg" },
  { from: "coherent", to: "nvidia", relation: "supplies_chips", label: "Optical transceivers" },
  { from: "fabrinet", to: "coherent", relation: "supplies_materials", label: "Contract optical mfg" },

  // Integrators
  { from: "nvidia", to: "supermicro", relation: "supplies_chips", label: "GPUs for servers" },
  { from: "nvidia", to: "dell", relation: "supplies_chips", label: "GPUs for servers" },
  { from: "nvidia", to: "foxconn", relation: "supplies_chips", label: "GB200 components" },
  { from: "supermicro", to: "openai", relation: "builds_systems_for", label: "AI racks" },
  { from: "supermicro", to: "coreweave", relation: "builds_systems_for", label: "AI racks" },
  { from: "dell", to: "microsoft", relation: "builds_systems_for", label: "AI servers" },
  { from: "dell", to: "coreweave", relation: "builds_systems_for", label: "AI servers" },
  { from: "foxconn", to: "microsoft", relation: "builds_systems_for", label: "Rack assembly" },
  { from: "foxconn", to: "amazon", relation: "builds_systems_for", label: "Rack assembly" },
  { from: "arista", to: "microsoft", relation: "builds_systems_for", label: "AI network switches" },
  { from: "arista", to: "meta", relation: "builds_systems_for", label: "AI network switches" },

  // Compute provision (cloud → AI labs)
  { from: "microsoft", to: "openai", relation: "provides_compute", label: "Azure — primary host", critical: true },
  { from: "oracle", to: "openai", relation: "provides_compute", label: "Stargate capacity", critical: true },
  { from: "coreweave", to: "openai", relation: "provides_compute", label: "GPU capacity" },
  { from: "amazon", to: "anthropic", relation: "provides_compute", label: "Trainium clusters", critical: true },
  { from: "google", to: "anthropic", relation: "provides_compute", label: "TPU capacity" },
];

export const TIER_ORDER: Tier[] = [
  "materials", "equipment", "eda_ip", "foundry", "memory", "packaging", "designer", "integrator", "customer",
];

export const TIER_LABELS: Record<Tier, string> = {
  materials: "Materials",
  equipment: "Equipment",
  eda_ip: "EDA & IP",
  foundry: "Foundry",
  memory: "Memory",
  packaging: "Packaging",
  designer: "Chip Designers",
  integrator: "Systems",
  customer: "Hyperscalers & OEMs",
};
