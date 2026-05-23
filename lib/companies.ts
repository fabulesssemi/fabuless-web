// ---------------------------------------------------------------------------
// Editorial / curated content layer
// ---------------------------------------------------------------------------
// This is the "human judgment is the product" layer. Live numbers (price,
// earnings, analyst targets, news) come from the provider system; the analysis
// below is curated, AI-drafted-then-edited, and refreshed on a schedule.
// No financial figures are hard-coded here that would go stale.

export type CompanyMeta = {
  slug: string; // URL segment, e.g. "nvda"
  ticker: string; // display ticker
  name: string; // display name
  yahooSymbol: string; // symbol the data layer queries
  sector: string; // sublabel under the name
  exchangeLabel?: string; // optional, for foreign listings
};

export type CompanyEditorial = {
  slug: string;
  quickTake: string;
  ecosystemRole: string;
  investorFocus: string;
  whyItMatters: {
    business: string;
    investment: string;
    ecosystem: string;
  };
  keyThemes: { title: string; detail: string }[];
  bullCase: string[];
  bearCase: string[];
  supplyChain: {
    suppliers?: string[];
    customers?: string[];
    hyperscalers?: string[];
    foundry?: string[];
    packaging?: string[];
    memory?: string[];
  };
  guidanceCommentary?: string;
  consensusBullThemes?: string[];
  consensusBearThemes?: string[];
  related: { slug: string; reason: string }[];
  updated: string; // when the editorial layer was last refreshed
};

// ---------------------------------------------------------------------------
// The universe — 12 companies. Live data works for ALL of these immediately.
// ---------------------------------------------------------------------------
export const COMPANY_UNIVERSE: CompanyMeta[] = [
  { slug: "nvda", ticker: "NVDA", name: "NVIDIA", yahooSymbol: "NVDA", sector: "AI GPUs / Accelerated Computing" },
  { slug: "amd", ticker: "AMD", name: "AMD", yahooSymbol: "AMD", sector: "CPUs & AI GPUs (x86 + Instinct)" },
  { slug: "avgo", ticker: "AVGO", name: "Broadcom", yahooSymbol: "AVGO", sector: "Custom AI ASICs & Networking" },
  { slug: "mrvl", ticker: "MRVL", name: "Marvell", yahooSymbol: "MRVL", sector: "Custom AI Silicon & Optical Interconnect" },
  { slug: "tsm", ticker: "TSM", name: "TSMC", yahooSymbol: "TSM", sector: "Leading-Edge Foundry" },
  { slug: "asml", ticker: "ASML", name: "ASML", yahooSymbol: "ASML", sector: "EUV Lithography Equipment" },
  { slug: "arm", ticker: "ARM", name: "Arm Holdings", yahooSymbol: "ARM", sector: "CPU IP & Instruction Set" },
  { slug: "mu", ticker: "MU", name: "Micron", yahooSymbol: "MU", sector: "HBM & DRAM/NAND Memory" },
  { slug: "intc", ticker: "INTC", name: "Intel", yahooSymbol: "INTC", sector: "x86 CPUs & Foundry (IDM)" },
  { slug: "qcom", ticker: "QCOM", name: "Qualcomm", yahooSymbol: "QCOM", sector: "Mobile SoCs & Edge AI" },
  { slug: "skhynix", ticker: "000660.KS", name: "SK Hynix", yahooSymbol: "000660.KS", sector: "HBM & DRAM Memory", exchangeLabel: "KRX: 000660" },
  { slug: "samsung", ticker: "005930.KS", name: "Samsung Electronics", yahooSymbol: "005930.KS", sector: "Memory, Foundry & Devices", exchangeLabel: "KRX: 005930" },
];

const metaBySlug = new Map(COMPANY_UNIVERSE.map((c) => [c.slug, c]));

export function getCompanyMeta(slug: string): CompanyMeta | undefined {
  return metaBySlug.get(slug.toLowerCase());
}

export function allCompanySlugs(): string[] {
  return COMPANY_UNIVERSE.map((c) => c.slug);
}

// ---------------------------------------------------------------------------
// Editorial content — NVDA fully written. Others added after layout sign-off.
// ---------------------------------------------------------------------------
const EDITORIAL: Record<string, CompanyEditorial> = {
  nvda: {
    slug: "nvda",
    quickTake:
      "NVIDIA designs the GPUs and full-stack AI systems — CUDA software, NVLink networking, and reference server designs — that train and serve the world's largest AI models. It is the default compute platform for frontier AI, and its data-center segment now dwarfs the gaming business that built the company. The investment debate is no longer whether AI demand is real, but how long NVIDIA can hold its margins and architectural lead as customers, competitors, and governments all push back.",
    ecosystemRole:
      "NVIDIA sits at the gravitational center of the AI buildout. It sells accelerators to every hyperscaler and neocloud, depends on TSMC to manufacture its chips and on SK Hynix, Micron, and Samsung for high-bandwidth memory, and increasingly competes with the same customers who are designing their own custom silicon. When NVIDIA guides up, the entire semiconductor supply chain re-rates with it.",
    investorFocus:
      "Right now the market is focused on the Blackwell-to-Vera Rubin transition, the durability of ~70%+ data-center gross margins, the pace of hyperscaler capex, HBM supply as the binding constraint, and the twin threats of custom ASICs and tightening China export controls.",
    whyItMatters: {
      business:
        "Each new architecture (Hopper → Blackwell → Vera Rubin) compresses the cost of training and inference, which pulls forward demand rather than satisfying it. NVIDIA's moat is not just the silicon — it is CUDA, the installed base, and a yearly cadence that competitors struggle to match. The risk is concentration: a handful of hyperscalers drive the majority of revenue.",
      investment:
        "The stock increasingly trades on whether results can beat an already-heroic bar. When a company guiding tens of billions per quarter sees shares dip on a beat-and-raise, the market is pricing perfection — leaving little room for any ramp hiccup, margin give-back, or capex pause among the big buyers.",
      ecosystem:
        "NVIDIA's roadmap effectively sets the schedule for TSMC's advanced packaging (CoWoS), HBM roadmaps at the memory makers, and power/networking demand across the data center. Its push into CPUs (Grace, and Jensen's claim NVIDIA will become the largest CPU supplier) directly threatens Intel and AMD's server franchises.",
    },
    keyThemes: [
      { title: "Blackwell → Vera Rubin ramp", detail: "The annual architecture cadence is the core growth engine. Vera Rubin shipments beginning is the next catalyst; any yield or CoWoS packaging constraint is the key risk to watch." },
      { title: "Hyperscaler capex super-cycle", detail: "Microsoft, Meta, Amazon, Google, and Oracle account for the bulk of demand. Their capex guidance is the single best leading indicator for NVIDIA revenue." },
      { title: "HBM as the bottleneck", detail: "High-bandwidth memory supply — not GPU dies — is often the gating factor. SK Hynix leads, with Micron and Samsung qualifying. HBM4 timing matters for the Rubin generation." },
      { title: "Custom ASIC competition", detail: "Google TPU, AWS Trainium, Meta MTIA, and Microsoft Maia — designed with Broadcom and Marvell — target NVIDIA's most profitable inference workloads. The question is how much volume migrates." },
      { title: "CUDA software moat", detail: "Two decades of libraries, frameworks, and developer lock-in remain the hardest part of NVIDIA's position to replicate, and the main reason alternatives struggle to convert benchmarks into deployments." },
      { title: "China export controls", detail: "Restrictions on advanced accelerators cap a large addressable market and give Huawei and domestic Chinese chipmakers room to close the gap. Policy swings can move guidance overnight." },
      { title: "Networking & systems", detail: "NVLink, InfiniBand, Spectrum-X Ethernet, and rack-scale designs increasingly make NVIDIA a systems vendor, not just a chip vendor — expanding the moat and the dollar content per rack." },
    ],
    bullCase: [
      "AI compute demand keeps outrunning supply; each architecture lowers cost-per-token and expands the market rather than saturating it.",
      "CUDA, the installed base, and a yearly cadence create a moat competitors cannot close on benchmarks alone.",
      "Expansion into CPUs, networking, and full rack-scale systems grows dollar content and addressable market well beyond the GPU.",
      "Sovereign AI, enterprise inference, and physical AI (robotics, autonomous) are large, still-early demand pools.",
    ],
    bearCase: [
      "Revenue is highly concentrated in a few hyperscalers; any capex pause or digestion period hits hard.",
      "Custom ASICs steadily peel off the highest-margin inference workloads from the largest buyers.",
      "~70%+ gross margins are a target for competition and customer pushback; mean reversion would compress the multiple.",
      "China restrictions cap the market and accelerate credible domestic alternatives.",
      "Valuation prices near-perfection — execution stumbles or a demand air-pocket would de-rate the stock sharply.",
    ],
    supplyChain: {
      suppliers: ["TSMC (logic dies)", "SK Hynix / Micron / Samsung (HBM)", "Amkor / ASE (back-end)", "Vertiv, power & cooling vendors"],
      customers: ["Microsoft", "Meta", "Amazon", "Google", "Oracle", "CoreWeave", "Tesla / xAI"],
      hyperscalers: ["Azure", "AWS", "Google Cloud", "Oracle Cloud", "Meta"],
      foundry: ["TSMC (N4 / N3 family, CoWoS-L advanced packaging)"],
      packaging: ["TSMC CoWoS & SoIC", "Amkor / ASE backend"],
      memory: ["SK Hynix (lead HBM)", "Micron", "Samsung"],
    },
    guidanceCommentary:
      "Watch data-center revenue mix, gross-margin trajectory, and any commentary on supply (CoWoS packaging, HBM) versus demand. Management's tone on hyperscaler capex and the Vera Rubin ramp typically moves the stock more than the headline EPS beat itself.",
    consensusBullThemes: [
      "Vera Rubin ramp extends the data-center growth runway",
      "Networking and systems expand dollar content per deployment",
      "Sovereign and enterprise AI add new demand pools",
    ],
    consensusBearThemes: [
      "Customer-concentration and capex-digestion risk",
      "Custom-ASIC share gains in inference",
      "Gross-margin normalization over time",
    ],
    related: [
      { slug: "amd", reason: "Closest merchant GPU competitor (Instinct)" },
      { slug: "avgo", reason: "Custom-ASIC and networking challenger" },
      { slug: "tsm", reason: "Sole leading-edge foundry & CoWoS packager" },
      { slug: "mu", reason: "HBM supplier and memory-cycle proxy" },
      { slug: "mrvl", reason: "Custom AI silicon & optical interconnect" },
      { slug: "skhynix", reason: "Lead HBM supplier" },
    ],
    updated: "May 22, 2026",
  },
};

export function getEditorial(slug: string): CompanyEditorial | undefined {
  return EDITORIAL[slug.toLowerCase()];
}
