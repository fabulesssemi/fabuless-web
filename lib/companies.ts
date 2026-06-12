// ---------------------------------------------------------------------------
// Editorial / curated content layer
// ---------------------------------------------------------------------------
// This is the "human judgment is the product" layer. Live numbers (price,
// earnings, analyst targets, news) come from the provider system; the analysis
// below is curated, AI-drafted-then-edited, and refreshed on a schedule.
// No financial figures are hard-coded here that would go stale.

export type CEOProfile = {
  name: string;
  since: string; // year as string, e.g. "2014"
  photo?: string; // URL to headshot (Wikipedia/Wikimedia Commons)
};

export type RevenueSegment = {
  name: string;   // short label, e.g. "Data Center"
  pct: number;    // integer percentage, all segments must sum to 100
};

export type CompanyMeta = {
  slug: string; // URL segment, e.g. "nvda"
  ticker: string; // display ticker
  name: string; // display name
  yahooSymbol: string; // symbol the data layer queries
  sector: string; // sublabel under the name
  exchangeLabel?: string; // optional, for foreign listings
  newsKeywords: string[]; // title must contain at least one (case-insensitive) for news to show
  ceo?: CEOProfile;
  revenueSegments?: RevenueSegment[]; // shown as a mini chart in the What to watch panel
  fiscalLabel?: string; // e.g. "FY2025 (Jan)" — labels the segment data period
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
  // Quarterly gross margin trend — populated by the editorial refresh cron.
  // Each entry: q = "Q1 FY27" style label, gm = gross margin as % (e.g. 74.1).
  // Newest entry last. [] until the first cron run after this field was added.
  quarterlyGM?: { q: string; gm: number }[];
  // Revenue by segment — extracted from latest earnings by the editorial refresh cron.
  // Overrides the seed data in CompanyMeta.revenueSegments when present.
  // null until the first cron run that finds segment data in earnings news.
  revenueSegments?: RevenueSegment[];
  fiscalLabel?: string; // e.g. "Q1 FY26" — the period the segment data covers
  // Curated news — top relevant articles found by the editorial pipeline from RSS sources.
  // Updated every time the editorial refresh cron runs; auto-revalidates the company page.
  // Merged with live Yahoo Finance news on the page (pinned items appear first).
  pinnedNews?: { title: string; url: string; source?: string; publishedAt?: string }[];
  related: { slug: string; reason: string }[];
  updated: string; // when the editorial layer was last refreshed
};

// ---------------------------------------------------------------------------
// The universe — 12 companies. Live data works for ALL of these immediately.
// ---------------------------------------------------------------------------
export const COMPANY_UNIVERSE: CompanyMeta[] = [
  {
    slug: "nvda", ticker: "NVDA", name: "NVIDIA", yahooSymbol: "NVDA",
    sector: "AI GPUs / Accelerated Computing",
    newsKeywords: ["nvidia", "nvda"],
    ceo: { name: "Jensen Huang", since: "1993", photo: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e6/Jen-Hsun_Huang_2025.jpg/500px-Jen-Hsun_Huang_2025.jpg" },
    revenueSegments: [
      { name: "Data Center", pct: 88 },
      { name: "Gaming", pct: 8 },
      { name: "Pro Viz", pct: 2 },
      { name: "Automotive", pct: 2 },
    ],
    fiscalLabel: "FY2025 (Jan)",
  },
  {
    slug: "amd", ticker: "AMD", name: "AMD", yahooSymbol: "AMD",
    sector: "CPUs & AI GPUs (x86 + Instinct)",
    newsKeywords: ["amd", "advanced micro devices", "advanced micro"],
    ceo: { name: "Lisa Su", since: "2014", photo: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/de/SXSW-2024-alih-OB7A0861-Lisa_Su_%28cropped_2%29.jpg/500px-SXSW-2024-alih-OB7A0861-Lisa_Su_%28cropped_2%29.jpg" },
    revenueSegments: [
      { name: "Data Center", pct: 56 },
      { name: "Client / PC", pct: 26 },
      { name: "Gaming", pct: 13 },
      { name: "Embedded", pct: 5 },
    ],
    fiscalLabel: "FY2024",
  },
  {
    slug: "avgo", ticker: "AVGO", name: "Broadcom", yahooSymbol: "AVGO",
    sector: "Custom AI ASICs & Networking",
    newsKeywords: ["broadcom", "avgo"],
    ceo: { name: "Hock Tan", since: "2006", photo: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Hock_Tan_2022.png/500px-Hock_Tan_2022.png" },
    revenueSegments: [
      { name: "Semiconductor", pct: 60 },
      { name: "Infra Software", pct: 40 },
    ],
    fiscalLabel: "FY2024 (Oct)",
  },
  {
    slug: "mrvl", ticker: "MRVL", name: "Marvell", yahooSymbol: "MRVL",
    sector: "Custom AI Silicon & Optical Interconnect",
    newsKeywords: ["marvell", "mrvl"],
    ceo: { name: "Matt Murphy", since: "2016" },
    revenueSegments: [
      { name: "Data Center", pct: 74 },
      { name: "Enterprise", pct: 11 },
      { name: "Carrier", pct: 9 },
      { name: "Consumer", pct: 6 },
    ],
    fiscalLabel: "FY2025 (Feb)",
  },
  {
    slug: "tsm", ticker: "TSM", name: "TSMC", yahooSymbol: "TSM",
    sector: "Leading-Edge Foundry",
    newsKeywords: ["tsmc", "taiwan semiconductor"],
    ceo: { name: "C.C. Wei", since: "2018" },
    revenueSegments: [
      { name: "HPC / AI", pct: 51 },
      { name: "Smartphones", pct: 33 },
      { name: "IoT", pct: 6 },
      { name: "Automotive", pct: 5 },
      { name: "Consumer", pct: 5 },
    ],
    fiscalLabel: "FY2024",
  },
  {
    slug: "asml", ticker: "ASML", name: "ASML", yahooSymbol: "ASML",
    sector: "EUV Lithography Equipment",
    newsKeywords: ["asml"],
    ceo: { name: "Christophe Fouquet", since: "2024" },
    revenueSegments: [
      { name: "DUV Systems", pct: 46 },
      { name: "EUV Systems", pct: 29 },
      { name: "Services", pct: 19 },
      { name: "Applications", pct: 6 },
    ],
    fiscalLabel: "FY2024",
  },
  {
    slug: "arm", ticker: "ARM", name: "Arm Holdings", yahooSymbol: "ARM",
    sector: "CPU IP & Instruction Set",
    newsKeywords: ["arm holdings", "arm chips", "arm-based", "arm's", "arm stock", "arm ipo"],
    ceo: { name: "Rene Haas", since: "2022", photo: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/08/Rene_Haas_at_SXSW_2025.jpg/500px-Rene_Haas_at_SXSW_2025.jpg" },
    revenueSegments: [
      { name: "Royalties", pct: 73 },
      { name: "Licensing", pct: 27 },
    ],
    fiscalLabel: "FY2025 (Mar)",
  },
  {
    slug: "mu", ticker: "MU", name: "Micron", yahooSymbol: "MU",
    sector: "HBM & DRAM/NAND Memory",
    newsKeywords: ["micron", "micron technology"],
    ceo: { name: "Sanjay Mehrotra", since: "2017", photo: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/de/Sanjay_Mehrotra_2025_%28cropped%29.jpg/500px-Sanjay_Mehrotra_2025_%28cropped%29.jpg" },
    revenueSegments: [
      { name: "DRAM", pct: 70 },
      { name: "NAND Flash", pct: 28 },
      { name: "Other", pct: 2 },
    ],
    fiscalLabel: "FY2024 (Aug)",
  },
  {
    slug: "intc", ticker: "INTC", name: "Intel", yahooSymbol: "INTC",
    sector: "x86 CPUs & Foundry (IDM)",
    newsKeywords: ["intel", "intc"],
    ceo: { name: "Lip-Bu Tan", since: "2025", photo: "https://upload.wikimedia.org/wikipedia/commons/1/10/Howard_Lutnick_with_Intel_CEO_Lip-Bu_Tan_%282025%29_%28cropped3%29.jpg" },
    revenueSegments: [
      { name: "Client / PC", pct: 55 },
      { name: "DC & AI", pct: 24 },
      { name: "Network/Edge", pct: 11 },
      { name: "Mobileye", pct: 3 },
      { name: "Other", pct: 7 },
    ],
    fiscalLabel: "FY2024",
  },
  {
    slug: "qcom", ticker: "QCOM", name: "Qualcomm", yahooSymbol: "QCOM",
    sector: "Mobile SoCs & Edge AI",
    newsKeywords: ["qualcomm", "qcom"],
    ceo: { name: "Cristiano Amon", since: "2021", photo: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6e/Cristiano_Amon_%28President_%26_CEOQualcomm%29_%2854916855494%29_%28cropped%29.jpg/500px-Cristiano_Amon_%28President_%26_CEOQualcomm%29_%2854916855494%29_%28cropped%29.jpg" },
    revenueSegments: [
      { name: "Handsets", pct: 54 },
      { name: "IoT", pct: 14 },
      { name: "Automotive", pct: 7 },
      { name: "QTL License", pct: 13 },
      { name: "Other", pct: 12 },
    ],
    fiscalLabel: "FY2024 (Sep)",
  },
  {
    slug: "skhynix", ticker: "000660.KS", name: "SK Hynix", yahooSymbol: "000660.KS",
    sector: "HBM & DRAM Memory",
    exchangeLabel: "KRX: 000660",
    newsKeywords: ["sk hynix", "hynix"],
    ceo: { name: "Kwak Noh-jung", since: "2021" },
    revenueSegments: [
      { name: "DRAM", pct: 78 },
      { name: "NAND / SSDs", pct: 22 },
    ],
    fiscalLabel: "FY2024",
  },
  {
    slug: "samsung", ticker: "005930.KS", name: "Samsung Electronics", yahooSymbol: "005930.KS",
    sector: "Memory, Foundry & Devices",
    exchangeLabel: "KRX: 005930",
    newsKeywords: ["samsung"],
    ceo: { name: "Jong-Hee Han", since: "2022" },
    revenueSegments: [
      { name: "Mobile / MX", pct: 40 },
      { name: "Semiconductor", pct: 28 },
      { name: "Consumer Elec", pct: 12 },
      { name: "Display", pct: 12 },
      { name: "Harman", pct: 8 },
    ],
    fiscalLabel: "FY2024",
  },
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
      { title: "Vera Rubin ramp", detail: "Vera Rubin is the current architectural step — NVL72 rack configurations are the flagship product. Rubin Ultra (4 reticle-sized dies stitched via SoIC) is the next step, making packaging as critical and expensive as the silicon itself." },
      { title: "Reticle limit era", detail: "GPUs have hit the reticle limit — a single die can no longer fit the compute needed. Multi-die stitching (Rubin Ultra = 4 dies) means advanced packaging yields and CoWoS-L capacity are now gating factors alongside wafer supply." },
      { title: "Hyperscaler capex super-cycle", detail: "Microsoft, Meta, Amazon, Google, and Oracle are all guiding $50B+ annual AI capex. Their quarterly guidance is the single best leading indicator for NVIDIA revenue — more reliable than NVIDIA's own forward commentary." },
      { title: "CoWoS-L as the supply ceiling", detail: "TSMC CoWoS-L advanced packaging — not wafer starts — is the binding constraint on accelerator shipments. Expansion takes 18–24 months; TSMC has been aggressively adding capacity but demand outpaces it." },
      { title: "HBM4 transition", detail: "HBM4 is required for Rubin's memory bandwidth targets. SK Hynix leads, Micron is qualifying, Samsung is behind. HBM4 timing and yield are the memory-side gating factor for the Rubin ramp." },
      { title: "Custom ASIC share", detail: "Google TPU v6, AWS Trainium2, Meta MTIA2 — designed with Broadcom and Marvell — now run production inference workloads at scale. The question is how fast the migration from merchant GPU to custom accelerator grows." },
      { title: "CUDA software moat", detail: "Two decades of libraries, frameworks, and developer habits remain the hardest part of NVIDIA's position to dislodge. ROCm and oneAPI have not materially converted production workloads despite years of investment." },
      { title: "China export controls", detail: "H20 and further restrictions have capped a large market. Huawei Ascend 910C is gaining domestic traction. Policy changes can move guidance in hours." },
    ],
    bullCase: [
      "Vera Rubin and Rubin Ultra multi-die architectures compound performance gains without requiring impossible process nodes — reinforcing the annual cadence moat.",
      "AI compute demand keeps expanding; lower cost-per-token expands the addressable market rather than satisfying it.",
      "CUDA ecosystem lock-in deepens with every model trained on NVIDIA hardware — switching cost rises each year.",
      "NVLink, InfiniBand, and rack-scale systems make NVIDIA a full-stack vendor; dollar content per rack grows each generation.",
      "Sovereign AI, agentic workloads, and physical AI (robotics, autonomous) are large, still-early demand pools.",
    ],
    bearCase: [
      "Revenue concentrated in a handful of hyperscalers; a capex digestion period or synchronous pause creates sharp demand air pockets.",
      "Custom ASICs (Google TPU v6, AWS Trainium2) increasingly cover large-scale inference at materially lower cost per token.",
      "Rubin Ultra multi-die architecture creates complex CoWoS-L yield risks; packaging supply chain is the new execution variable.",
      "China restrictions permanently cap a large market and are accelerating credible Huawei/domestic competition.",
      "~75%+ data-center gross margins are a target for customer pushback; any normalization compresses the multiple sharply.",
    ],
    supplyChain: {
      suppliers: ["TSMC (N3/N2 logic dies)", "SK Hynix (HBM3E/HBM4 — lead supplier)", "Micron / Samsung (HBM)", "BESI (hybrid bonding equipment for die stacking)", "ASE / Amkor (back-end)", "Vertiv / power & cooling vendors"],
      customers: ["Microsoft (Azure)", "Meta", "Amazon (AWS)", "Google", "Oracle", "CoreWeave / neoclouds", "Tesla / xAI"],
      hyperscalers: ["Azure", "AWS", "Google Cloud", "Oracle Cloud", "Meta", "CoreWeave"],
      foundry: ["TSMC (N3/N2, CoWoS-L advanced packaging)", "TSMC SoIC for Rubin Ultra multi-die stacking"],
      packaging: ["TSMC CoWoS-L (primary)", "TSMC SoIC (Rubin Ultra 4-die)", "ASE / Amkor back-end"],
      memory: ["SK Hynix (lead HBM3E/HBM4)", "Micron (qualifying)", "Samsung (qualifying)"],
    },
    guidanceCommentary:
      "CoWoS-L packaging capacity and expansion timeline is the single most binding supply watch item — it gates Vera Rubin shipments more than wafer supply. Data-center gross margins and NVL72 rack yields are the profitability metrics. Hyperscaler capex guidance from Microsoft, Meta, Amazon, and Google in a single earnings season moves NVIDIA's stock more than its own print. HBM4 qualification timing from SK Hynix is the memory-side risk to track.",
    consensusBullThemes: [
      "Rubin Ultra / multi-die architecture extends the cadence moat",
      "Networking and rack-scale systems expand dollar content per deployment",
      "Sovereign and agentic AI open new large demand pools",
    ],
    consensusBearThemes: [
      "Customer-concentration and capex-digestion risk",
      "Custom-ASIC share gains in inference at scale",
      "CoWoS-L packaging supply as execution variable",
    ],
    related: [
      { slug: "amd", reason: "Closest merchant GPU competitor (Instinct)" },
      { slug: "avgo", reason: "Custom-ASIC and networking challenger" },
      { slug: "tsm", reason: "Sole leading-edge foundry & CoWoS-L packager" },
      { slug: "mu", reason: "HBM supplier and memory-cycle proxy" },
      { slug: "mrvl", reason: "Custom AI silicon & optical interconnect" },
      { slug: "skhynix", reason: "Lead HBM3E/HBM4 supplier" },
    ],
    updated: "June 11, 2026",
  },
  amd: {
    slug: "amd",
    quickTake:
      "AMD is the only credible merchant alternative to NVIDIA in AI GPUs while simultaneously taking server-CPU share from Intel. Its EPYC processors have quietly become the data-center x86 standard, and its Instinct MI-series accelerators are the lead 'second source' hyperscalers want so they aren't beholden to a single GPU vendor. The bull case is a two-front share-gain story; the bear case is that the software gap to CUDA keeps Instinct a niche.",
    ecosystemRole:
      "AMD straddles two markets: it competes with Intel in x86 CPUs (EPYC servers, Ryzen) and with NVIDIA in AI accelerators (Instinct). Like NVIDIA it is fabless and wholly dependent on TSMC and on the same HBM suppliers, but it positions itself as the open alternative — ROCm software, open standards, and willingness to be the diversification vendor.",
    investorFocus:
      "Investors are watching the Instinct MI-series ramp and whether hyperscaler design wins convert into multi-billion-dollar revenue, continued EPYC server share gains against Intel, gross-margin mix as data-center grows, and progress closing the ROCm-vs-CUDA software gap.",
    whyItMatters: {
      business:
        "EPYC has turned AMD into a genuine data-center franchise with durable share gains; the open question is whether Instinct can do the same in GPUs. Every hyperscaler wants a second GPU source, which gives AMD a structural opening even if it never matches NVIDIA's volume.",
      investment:
        "AMD trades on the slope of the Instinct ramp. Upside surprises in data-center GPU revenue re-rate the stock; any sign the MI-series is stalling against NVIDIA's cadence pressures it. The CPU business provides a more predictable earnings base underneath the AI optionality.",
      ecosystem:
        "AMD's success is the market's main hope for GPU price competition and supplier diversity. More AMD volume also pulls on the same TSMC and HBM capacity NVIDIA needs, tightening the whole supply chain.",
    },
    keyThemes: [
      { title: "Instinct MI350 / MI400 cadence", detail: "MI350 builds on MI300X gains; MI400 is the answer to NVIDIA Rubin. Execution against NVIDIA's annual rhythm is the key test — any slippage in cadence widens the competitive gap." },
      { title: "EPYC Turin dominance", detail: "5th-gen EPYC (Turin) is now the preferred x86 data-center CPU at most hyperscalers. Share gains from Intel are durable; EPYC is a high-margin franchise that funds the AI GPU push." },
      { title: "ROCm closing the gap", detail: "ROCm software has improved materially. Meta, Microsoft, and Oracle are running production AI workloads on Instinct. The gap to CUDA is narrowing but remains the single biggest adoption barrier for mid-market buyers." },
      { title: "Second-source structural demand", detail: "Every hyperscaler has a strategic reason to fund a credible NVIDIA alternative. MI300X has already hit multi-billion quarterly run rates, validating the structural demand thesis." },
      { title: "TSMC / HBM supply competition", detail: "AMD competes for the same CoWoS packaging capacity and HBM allocation as NVIDIA. Supply-chain access — not just silicon performance — limits how fast Instinct can ramp." },
    ],
    bullCase: [
      "EPYC Turin is the clear data-center x86 winner — a durable, high-margin CPU franchise that no longer needs proving.",
      "Instinct MI300X has already hit multi-billion run rates; hyperscalers are paying for an alternative to NVIDIA, not just evaluating one.",
      "ROCm is genuinely improving; sophisticated buyers (Meta, Microsoft, Oracle) are running production workloads, widening the customer base.",
      "Data-center mix shift structurally lifts margins each year as AMD's revenue center moves to HPC and AI.",
    ],
    bearCase: [
      "NVIDIA's Rubin/Rubin Ultra cadence and full-stack systems moat remain structurally harder to match each generation.",
      "ROCm is better but still trails CUDA; mid-market and enterprise buyers are unlikely to switch without parity.",
      "Competing for the same TSMC CoWoS and HBM capacity as NVIDIA caps how fast Instinct can scale.",
      "Client and gaming remain cyclical and can drag on overall earnings and mask data-center progress.",
    ],
    supplyChain: {
      suppliers: ["TSMC (N3/N2 logic, CoWoS chiplet packaging)", "SK Hynix / Micron / Samsung (HBM3/HBM3E)", "ASE / Amkor (back-end)"],
      customers: ["Microsoft (Azure — confirmed MI300X deployments)", "Meta (AI inference)", "Oracle Cloud", "Dell / Supermicro (OEMs)", "Enterprise & cloud"],
      hyperscalers: ["Azure (confirmed large MI300X deployment)", "Meta", "Oracle Cloud"],
      foundry: ["TSMC (N4 / N3 / N2 roadmap, SoIC chiplet stacking)"],
      packaging: ["TSMC CoWoS / SoIC for chiplet integration"],
      memory: ["SK Hynix (HBM3E)", "Micron", "Samsung"],
    },
    guidanceCommentary:
      "Data-center GPU revenue is the number — management has begun breaking out quarterly MI revenue. EPYC ASP trends show the CPU franchise health. Watch for any new named hyperscaler production workload on Instinct; those are the clearest signals the ROCm gap is closing. Gross-margin trajectory reflects the data-center mix shift in real time.",
    consensusBullThemes: [
      "Instinct second-source at scale — multi-billion run rate validated",
      "EPYC Turin server dominance is durable",
      "Data-center mix driving structural margin improvement",
    ],
    consensusBearThemes: [
      "ROCm/CUDA software gap limits addressable market",
      "TSMC/HBM supply allocation capped by NVIDIA priority",
      "Client and gaming cyclicality",
    ],
    related: [
      { slug: "nvda", reason: "Primary AI-GPU competitor" },
      { slug: "intc", reason: "x86 server-CPU rival losing share" },
      { slug: "tsm", reason: "Sole leading-edge foundry" },
      { slug: "avgo", reason: "Custom-ASIC alternative to merchant GPUs" },
      { slug: "mu", reason: "HBM supplier" },
      { slug: "mrvl", reason: "Data-center silicon peer" },
    ],
    updated: "June 11, 2026",
  },

  avgo: {
    slug: "avgo",
    quickTake:
      "Broadcom is the quiet giant of AI infrastructure: it co-designs the custom accelerators (XPUs) that hyperscalers use to reduce their NVIDIA dependence, and it dominates the high-speed networking silicon that ties AI clusters together. Add a large, sticky enterprise-software arm (VMware) and AVGO is a diversified, cash-generative way to own the AI buildout without betting on merchant GPUs.",
    ecosystemRole:
      "Broadcom sits on the other side of the custom-silicon trade from NVIDIA. When Google, Meta, or other hyperscalers build their own AI chips, Broadcom is the partner that turns those designs into silicon — and its switch/SerDes/optical portfolio is foundational to AI networking. It is both a beneficiary of and a hedge against the merchant-GPU model.",
    investorFocus:
      "The market focuses on growth in custom AI accelerator (XPU) revenue and new hyperscaler design wins, AI networking share as cluster sizes explode, VMware integration and software margins, and the durability of Broadcom's overall free-cash-flow and dividend story.",
    whyItMatters: {
      business:
        "Custom ASICs let hyperscalers optimize cost and power for their own workloads — and Broadcom is the dominant merchant partner for that. Its networking franchise scales directly with cluster size, so AI buildouts lift both halves of the semiconductor business.",
      investment:
        "AVGO is a 'picks-and-shovels plus software' compounder. The stock rewards visible XPU ramps and customer additions; the risk is concentration in a few mega-customers and the lumpiness of custom programs.",
      ecosystem:
        "Every dollar of custom-ASIC and networking spend is, in part, a dollar that could have gone to NVIDIA. Broadcom's design wins are the clearest scoreboard for how much of AI compute migrates to custom silicon.",
    },
    keyThemes: [
      { title: "3+ confirmed XPU programs", detail: "Google TPU and Meta MTIA co-design are confirmed; a third hyperscaler XPU program is widely reported. Each new named customer is a multi-year, multi-billion revenue program. The market is pricing in a 4th." },
      { title: "AI networking at scale", detail: "Tomahawk 5/6 switches and Jericho3-AI scale directly with cluster size. Ethernet's rise in AI fabrics (vs. InfiniBand) plays to Broadcom's strength; every larger cluster adds networking content." },
      { title: "Management's SAM framing", detail: "Hock Tan has guided toward a $60–90B AI serviceable market over a multi-year window — the most bullish AI revenue framing from any chip company. Each earnings call either validates or tests that number." },
      { title: "VMware software anchor", detail: "Post-acquisition VMware provides high-margin, ARR-style software revenue that smooths chip cyclicality, funds the dividend, and lifts overall EBITDA margins." },
      { title: "Co-packaged optics roadmap", detail: "Moving optics onto the package (CPO) expands dollar content per system. Broadcom's early ecosystem position in CPO is an underappreciated long-term content driver." },
    ],
    bullCase: [
      "Owns the two best non-GPU ways to play AI: 3+ hyperscaler XPU programs and the dominant AI networking silicon portfolio.",
      "Management's $60–90B AI SAM guidance is the most bullish long-term framing in semiconductors — any validation re-rates the stock.",
      "Networking content scales automatically with cluster size; no execution risk on that revenue as AI buildout continues.",
      "VMware ARR-style software provides high-margin, recession-resistant cash flow that supports the dividend and de-risks chip cyclicality.",
    ],
    bearCase: [
      "Google and Meta represent concentrated revenue; a slowdown at either ripples through AI semiconductor results immediately.",
      "Custom programs are multi-year cycles — lumpy, and can be re-competed or insourced at renewal by customers with large engineering teams.",
      "A synchronous AI-capex digestion hits both the XPU and networking segments simultaneously.",
      "VMware integration is still ongoing; customer pricing disputes and churn risk haven't fully played out.",
    ],
    supplyChain: {
      suppliers: ["TSMC (leading-edge N3/N2 for XPUs, N4/N5 for networking)", "Arm (CPU IP in XPU designs)", "Substrate & advanced packaging partners"],
      customers: ["Google (TPU co-design — confirmed)", "Meta (MTIA — confirmed)", "Third hyperscaler (widely reported)", "Apple (Wi-Fi/Bluetooth connectivity)", "Enterprise networking (data-center Ethernet)"],
      hyperscalers: ["Google Cloud (TPU)", "Meta (MTIA)", "Third hyperscaler (reported)"],
      foundry: ["TSMC (N3/N2 for XPUs; N4/N5 for Tomahawk/Jericho)"],
      packaging: ["Advanced packaging & substrates for multi-die XPU designs"],
    },
    guidanceCommentary:
      "AI semiconductor revenue (XPU + networking combined) is the primary number. Watch for any new named XPU customer — each addition is a multi-year re-rating event. Management's updated SAM guidance and the timeline to that opportunity moves the stock most. VMware EBITDA margin trend is the software quality check. Tomahawk 5 attach rates in AI clusters are the networking proxy.",
    consensusBullThemes: [
      "Expanding XPU customer roster beyond 3 confirmed",
      "AI networking content growth with cluster scale",
      "VMware ARR-style software lifting EBITDA durability",
    ],
    consensusBearThemes: [
      "Customer concentration in Google/Meta",
      "Program lumpiness and re-bid risk",
      "Synchronous AI-capex digestion risk",
    ],
    related: [
      { slug: "nvda", reason: "Custom silicon is the hedge against merchant GPUs" },
      { slug: "mrvl", reason: "Direct custom-ASIC & optical competitor" },
      { slug: "tsm", reason: "Manufactures Broadcom's leading-edge silicon" },
      { slug: "amd", reason: "Merchant-GPU alternative" },
      { slug: "mu", reason: "Memory in AI systems" },
    ],
    updated: "June 11, 2026",
  },

  mrvl: {
    slug: "mrvl",
    quickTake:
      "Marvell is the smaller, higher-beta custom-silicon and interconnect play. It co-designs AI accelerators for hyperscalers and is a leader in the optical DSPs and electro-optics that move data between and within AI clusters. As a more concentrated bet on data-center infrastructure than Broadcom, it tends to move more sharply on each custom-program update.",
    ecosystemRole:
      "Marvell occupies the connectivity and custom-compute layers of the AI data center: optical DSPs, retimers, switching, and bespoke ASICs for cloud customers. It rises and falls with hyperscaler infrastructure spend and the shift toward optimized, custom silicon.",
    investorFocus:
      "Investors track custom AI silicon ramps and hyperscaler design wins, optical/interconnect demand as bandwidth needs surge, the data-center revenue mix versus legacy enterprise/carrier segments, and margin progression as custom programs scale.",
    whyItMatters: {
      business:
        "Marvell's electro-optics and DSPs are essential plumbing for AI clusters, and custom ASIC wins can transform its revenue base. The trade-off is heavy dependence on a few large programs and customers.",
      investment:
        "As a focused, smaller-cap infrastructure name, Marvell offers more torque to the AI interconnect theme — bigger upside on wins, bigger drawdowns on disappointments or program timing slips.",
      ecosystem:
        "As clusters scale, interconnect becomes the bottleneck. Marvell's optical roadmap is central to whether networks keep pace with compute — a structural tailwind for the whole AI buildout.",
    },
    keyThemes: [
      { title: "Amazon AWS custom silicon", detail: "Marvell co-designs Trainium and Inferentia custom ASICs for AWS — the largest design-win catalyst in Marvell's history. This is a confirmed, multi-year program at scale." },
      { title: "Optical DSP leadership", detail: "PAM4 and coherent DSPs are essential for AI cluster interconnect. Bandwidth demand grows with every generation of accelerator; Marvell's optical portfolio is a durable secular driver." },
      { title: "Data-center mix >80%", detail: "Data center now dominates Marvell's revenue. Legacy enterprise and carrier segments are shrinking as a fraction; the margin profile and growth rate have structurally improved." },
      { title: "Co-packaged optics (CPO)", detail: "Moving optics onto the switch/compute package dramatically reduces power and latency. Marvell's early CPO development work is a long-horizon content-expansion opportunity." },
      { title: "Program concentration risk", detail: "A few hyperscaler programs drive most AI revenue. Program timing, ramp pace, and renewal terms create significant quarterly volatility — in both directions." },
    ],
    bullCase: [
      "Amazon AWS custom silicon (Trainium/Inferentia) is a confirmed, multi-year multi-billion revenue program — the clearest large re-rating catalyst among mid-cap AI names.",
      "Optical DSP demand is structurally growing; every generation of AI cluster requires more interconnect bandwidth, and Marvell leads in DSP technology.",
      "Data-center mix >80% means the overall earnings quality and growth rate have permanently improved relative to the old Marvell.",
      "CPO is the next major content expansion; early ecosystem position creates a potential moat in the next networking cycle.",
    ],
    bearCase: [
      "Concentration in a handful of hyperscaler programs means slippage in any one causes outsized quarterly earnings misses.",
      "Broadcom is larger, better-capitalized, and competes in both custom ASIC and networking — a formidable rival on every front.",
      "Legacy enterprise and carrier segments, though shrinking, still drag during macro downturns.",
      "Valuation prices aggressive program ramps; any execution slip or delay is severely punished.",
    ],
    supplyChain: {
      suppliers: ["TSMC (N3/N4 for custom ASICs)", "Optical component and module partners", "Arm (CPU IP in ASIC designs)"],
      customers: ["Amazon / AWS (Trainium & Inferentia — confirmed large program)", "Microsoft (networking/optical)", "Google (networking switching)", "Networking OEMs"],
      hyperscalers: ["AWS (primary custom-silicon)", "Azure (optical/networking)", "Google Cloud (networking)"],
      foundry: ["TSMC (N3/N4)"],
      packaging: ["Advanced packaging & co-packaged optics development"],
    },
    guidanceCommentary:
      "Data-center revenue growth rate is the primary metric — watch for the AWS ramp contribution becoming explicit in guidance. Optical DSP revenue indicates the interconnect buildout pace. Any new named design-win beyond AWS is a significant re-rating catalyst. CPO timeline commentary is the long-horizon watch item.",
    consensusBullThemes: [
      "AWS custom-silicon ramp is a multi-year confirmed catalyst",
      "Secular optical/interconnect demand",
      "Data-center mix >80% — structural margin improvement",
    ],
    consensusBearThemes: [
      "Program concentration and timing lumpiness",
      "Competition from Broadcom on every front",
      "Legacy-segment drag in downturns",
    ],
    related: [
      { slug: "avgo", reason: "Larger custom-ASIC & networking rival" },
      { slug: "nvda", reason: "Interconnect & custom-silicon adjacency" },
      { slug: "tsm", reason: "Manufactures Marvell's leading-edge chips" },
      { slug: "amd", reason: "Data-center silicon peer" },
      { slug: "mu", reason: "Memory in AI infrastructure" },
    ],
    updated: "June 11, 2026",
  },

  tsm: {
    slug: "tsm",
    quickTake:
      "TSMC manufactures the chips that power essentially the entire AI economy — NVIDIA, AMD, Apple, Broadcom, and most of the fabless world depend on it. As the only foundry reliably shipping leading-edge logic at scale, plus the CoWoS advanced packaging that AI accelerators require, TSMC is the closest thing the industry has to a single point of leverage. The debate is less about demand than about Taiwan concentration risk and how much pricing power it chooses to exercise.",
    ecosystemRole:
      "TSMC is the foundation of the fabless model and the manufacturing chokepoint of AI. Its capacity decisions on leading-edge nodes and CoWoS packaging set the supply ceiling for the entire accelerator market, which is why its capex and utilization commentary moves the whole sector.",
    investorFocus:
      "The market watches AI/HPC revenue mix and leading-edge (N3/N2) ramp, CoWoS advanced-packaging capacity as the gating factor for accelerators, pricing power and gross margins, capex discipline, and the cost and progress of overseas fabs (Arizona, Japan, Germany) plus Taiwan geopolitical risk.",
    whyItMatters: {
      business:
        "TSMC converts the entire industry's design ambitions into physical chips. Leading-edge and packaging capacity are scarce, giving it pricing power and visibility few manufacturers ever achieve — but also enormous capital intensity.",
      investment:
        "As the indispensable supplier, TSMC offers diversified exposure to AI demand without picking a chip-design winner. The key risks are geopolitical (Taiwan) and cyclical (capex over-build), not competitive.",
      ecosystem:
        "When TSMC adds CoWoS capacity, accelerator supply loosens for everyone; when it can't, the whole AI supply chain is constrained. Its roadmap effectively schedules the industry.",
    },
    keyThemes: [
      { title: "N2 in volume production", detail: "2nm-class node entered volume production in 2025. Apple led adoption; AI/HPC customers are next. N2 improves performance-per-watt ~15% over N3, extending TSMC's process lead." },
      { title: "CoWoS-L as the AI supply ceiling", detail: "CoWoS-L advanced packaging — not wafer starts — is the binding constraint on accelerator shipments. TSMC has been aggressively adding CoWoS-L capacity but demand still outpaces supply. Expansion takes 18–24 months." },
      { title: "SoIC for multi-die packaging", detail: "SoIC face-to-face bonding enables Rubin Ultra's 4-die architecture. Advanced packaging is no longer a commodity back-end step — it is a core TSMC competitive asset generating meaningful revenue." },
      { title: "Arizona Fab 21 ramping", detail: "Phase 1 (N4) entered production; Phase 2 (N2) construction is underway. Arizona adds US-supply-chain resilience and unlocks government subsidies — but dilutes gross margins by 200–400bps versus Taiwan." },
      { title: "Taiwan geopolitical risk", detail: "The dominant tail risk for the entire technology supply chain. Any cross-strait escalation disrupts semiconductors globally — there is no credible near-term substitute for TSMC's leading-edge capacity." },
    ],
    bullCase: [
      "Indispensable, near-monopoly supplier of leading-edge logic and CoWoS-L packaging — every major AI accelerator runs through TSMC.",
      "AI/HPC is now >50% of revenue and growing; TSMC benefits from every dollar of AI capex regardless of which chip designer wins.",
      "N2 and A16 roadmaps extend the process leadership that sustains pricing power well into the decade.",
      "Arizona de-risks the geopolitical overhang gradually; US government support offsets some of the overseas-fab cost penalty.",
    ],
    bearCase: [
      "Taiwan concentration is the dominant tail risk — extreme and hard to hedge even with Arizona/Japan fabs.",
      "Overseas fabs dilute gross margins 200–400bps; Arizona ramp adds near-term margin pressure as volumes build.",
      "CoWoS-L expansion takes 18–24 months from investment decision to yield — cannot respond quickly to demand surges.",
      "AI-capex concentration means a synchronous digestion period at NVIDIA, Apple, AMD, and Broadcom would hit hard simultaneously.",
    ],
    supplyChain: {
      suppliers: ["ASML (EUV / High-NA EUV)", "Applied Materials", "Lam Research", "KLA", "Tokyo Electron", "BESI (hybrid bonding equipment for CoWoS/SoIC)"],
      customers: ["NVIDIA (largest AI customer — N3/CoWoS-L)", "Apple (largest revenue customer)", "AMD", "Broadcom", "Qualcomm", "MediaTek", "Google / Amazon / Microsoft (custom silicon via foundry partners)"],
      hyperscalers: ["Indirect — via NVIDIA, AMD, Broadcom, and direct custom-silicon programs"],
      packaging: ["CoWoS-L (AI accelerator advanced packaging)", "SoIC (multi-die bonding for Rubin Ultra and future architectures)"],
    },
    guidanceCommentary:
      "CoWoS-L capacity commentary and expansion timeline is now as important as wafer-start guidance — it directly gates NVIDIA Vera Rubin shipments. Watch AI/HPC revenue mix (target: crossing 55%+), N2 utilization ramp, Arizona production milestones, and gross-margin guidance including overseas-fab dilution. TSMC's capex guidance is the single clearest forward signal for the entire AI supply chain.",
    consensusBullThemes: [
      "AI/HPC leading-edge demand — >50% of revenue and growing",
      "CoWoS-L expansion unlocking accelerator supply",
      "N2/A16 roadmap extending process leadership and pricing power",
    ],
    consensusBearThemes: [
      "Taiwan geopolitical concentration — dominant tail risk",
      "Overseas-fab margin dilution from Arizona/Japan",
      "CoWoS-L supply responsiveness too slow for demand surges",
    ],
    related: [
      { slug: "asml", reason: "Sole EUV/High-NA equipment supplier" },
      { slug: "nvda", reason: "Largest AI customer — N3/CoWoS-L" },
      { slug: "amd", reason: "Key leading-edge and packaging customer" },
      { slug: "avgo", reason: "Custom-silicon XPU customer" },
      { slug: "arm", reason: "IP inside nearly every chip TSMC manufactures" },
    ],
    updated: "June 11, 2026",
  },

  asml: {
    slug: "asml",
    quickTake:
      "ASML is the ultimate pick-and-shovel of the chip industry: it is the only company that makes EUV lithography machines, without which no leading-edge chip can be manufactured. Its customers are the foundries and memory makers (TSMC, Samsung, Intel, SK Hynix). The current debate centers on the High-NA EUV ramp — whether the next-generation tools are ready for high-volume production — and on China export restrictions.",
    ecosystemRole:
      "ASML sits one layer above the foundries as a true monopoly on EUV. Every advanced logic and memory roadmap depends on its tools, making it a diversified, upstream way to own the entire leading-edge transition — but also exposing it to the timing of customer capex cycles.",
    investorFocus:
      "Investors focus on the High-NA EUV transition and its production readiness, the order backlog and bookings as a leading indicator of foundry/memory capex, China revenue exposure under tightening export controls, and the long-term installed-base service revenue.",
    whyItMatters: {
      business:
        "ASML's EUV monopoly gives it unmatched pricing power and visibility, but its revenue is tied to the lumpy capex cycles of a handful of customers. Tool readiness (especially High-NA) directly sets the pace of the industry's roadmap.",
      investment:
        "ASML is a way to own leading-edge scaling without choosing a foundry. The risks are cyclical (capex timing), policy-driven (China), and technological (High-NA ramp slower than hoped).",
      ecosystem:
        "If High-NA slips, foundries lean longer on multi-patterning with existing EUV — affecting cost, timing, and the entire 2nm-and-below roadmap that justifies leading-edge investment.",
    },
    keyThemes: [
      { title: "High-NA EUV first shipments", detail: "EXE:5000 High-NA tools have shipped to Intel Foundry and TSMC for process development. Production readiness and first high-volume customer are the next gating milestones — and the premium-ASP revenue event." },
      { title: "Bookings as the clearest forward indicator", detail: "ASML's quarterly order intake gives 12–18 month visibility into foundry and memory capex. Bookings recovery (post-China restrictions) is the primary bull signal for the sector." },
      { title: "China DUV phase-down", detail: "DUV export restrictions removed a meaningful revenue pool. Management has guided to declining China mix. Further restrictions remain a policy risk; upside surprise from relaxation is asymmetric." },
      { title: "HBM / memory EUV demand surge", detail: "SK Hynix, Micron, and Samsung are investing aggressively in HBM and advanced DRAM nodes requiring EUV. This is an underrated second demand leg alongside logic — driven entirely by AI." },
      { title: "Installed-base services compounding", detail: "A growing global tool install base generates recurring, high-margin service revenue that smooths the lumpiness of system sales and provides earnings resilience at cycle troughs." },
    ],
    bullCase: [
      "Absolute monopoly on EUV and the only source of High-NA tools — no leading-edge logic or advanced DRAM can exist without ASML.",
      "Memory (HBM/DRAM) plus logic dual demand creates two independent secular drivers; AI is accelerating both.",
      "High-NA tools carry the highest ASP in ASML's history; successful production ramp meaningfully expands revenue per system shipped.",
      "Large backlog plus growing installed-base service revenue provides multi-year earnings visibility unmatched by most capital equipment companies.",
    ],
    bearCase: [
      "Revenue is lumpy and tied to a few customers' capex cycles; quarterly swings are large and hard to forecast.",
      "China DUV restrictions have already removed a material revenue stream; further restrictions are possible at any time.",
      "High-NA production readiness may slip further, delaying the premium-ASP revenue contribution.",
      "A synchronous foundry/memory capex pause would compress bookings sharply and rapidly.",
    ],
    supplyChain: {
      suppliers: ["Zeiss (critical optics — sole source for EUV mirror systems)", "Cymer / Gigaphoton (light sources)", "Specialized photonics & precision component vendors"],
      customers: ["TSMC (largest EUV customer)", "Samsung (logic + HBM/DRAM EUV)", "SK Hynix (HBM/DRAM EUV — fast-growing)", "Intel Foundry (High-NA early adopter)", "Micron (DRAM EUV)"],
      foundry: ["Sells to all leading-edge foundries, IDMs, and advanced DRAM makers globally"],
    },
    guidanceCommentary:
      "Bookings/order intake is the single most important number — it signals foundry and memory capex plans 12–18 months out. High-NA shipment count and customer qualification timeline drive premium-ASP expectations. China revenue mix and any incremental restriction commentary is the key downside risk. Memory EUV demand from HBM expansion is the underrated bull case that rarely gets enough attention in earnings commentary.",
    consensusBullThemes: [
      "EUV monopoly plus High-NA extending the roadmap for years",
      "HBM/memory EUV as a new secular demand leg",
      "Installed-base services providing earnings resilience",
    ],
    consensusBearThemes: [
      "Lumpy capex cycle timing",
      "China DUV restrictions — further downside possible",
      "High-NA production ramp uncertainty",
    ],
    related: [
      { slug: "tsm", reason: "Largest EUV customer" },
      { slug: "intc", reason: "High-NA EUV early adopter" },
      { slug: "samsung", reason: "Logic + memory EUV customer" },
      { slug: "skhynix", reason: "HBM/DRAM EUV — fast-growing customer" },
      { slug: "mu", reason: "DRAM EUV and memory capex driver" },
    ],
    updated: "June 11, 2026",
  },

  arm: {
    slug: "arm",
    quickTake:
      "Arm doesn't make chips — it designs the CPU architecture and instruction set that nearly every smartphone and a fast-growing share of data-center and PC processors are built on. Its royalty-and-licensing model means it earns a small cut of an enormous and expanding base of silicon. The growth story is higher royalty rates from newer architectures (v9, compute subsystems) and Arm's push from mobile into the data center and AI.",
    ecosystemRole:
      "Arm is the neutral IP layer beneath much of computing. Apple, Qualcomm, NVIDIA (Grace), Amazon (Graviton), and MediaTek all build on Arm. As power efficiency becomes the binding constraint in AI data centers, Arm-based CPUs are gaining server share — extending its reach far beyond its mobile stronghold.",
    investorFocus:
      "The market focuses on royalty-rate expansion from v9 and Compute Subsystems (CSS), data-center and AI penetration (Neoverse, Grace, Graviton), licensing momentum and the high-margin model, and valuation, which prices significant future royalty growth.",
    whyItMatters: {
      business:
        "Arm's royalty model scales with the entire compute market and improves as customers adopt higher-value architectures. Moving into data center and PC multiplies its addressable royalty base.",
      investment:
        "Arm is a high-margin, asset-light way to own the secular growth of compute. The premium valuation requires the data-center and royalty-rate expansion story to keep delivering.",
      ecosystem:
        "As efficiency becomes paramount in AI, Arm-based CPUs (and Arm cores inside accelerators) gain ground against x86 — a structural shift that touches Intel, AMD, and the hyperscalers' custom chips.",
    },
    keyThemes: [
      { title: "v9 royalty-rate step-up", detail: "v9 architecture carries roughly 2x the royalty rate of v8. As v9 penetrates mobile and moves into data center, it is the core lever lifting revenue per chip shipped across the installed base." },
      { title: "Compute Subsystem (CSS) attach", detail: "Pre-designed CPU+GPU subsystems deepen customer relationships and shorten design cycles. CSS adoption is accelerating in both mobile and data center, raising per-chip royalty value." },
      { title: "Data-center penetration", detail: "Amazon Graviton, NVIDIA Grace Blackwell, Ampere Computing, and Microsoft custom Arm data-center silicon are driving real server share. Neoverse V/N is now the performance leader for cloud-native workloads." },
      { title: "On-device AI complexity", detail: "Generative AI models running locally on Snapdragon and Apple Silicon SoCs raise chip complexity and die area per device — structurally lifting royalties across the mobile installed base." },
      { title: "RISC-V as long-horizon competition", detail: "Open-source ISA is credible and growing in embedded/IoT. Not yet a threat in premium compute, but a long-term watch item that could erode the long tail of Arm's royalty base." },
    ],
    bullCase: [
      "Royalty model captures a slice of an enormous and growing compute market with no manufacturing capital risk — pure leverage to silicon unit volumes and complexity.",
      "v9/CSS adoption is a multi-year structural royalty-rate lift; data-center and PC expansion are new, largely unmonetized royalty pools still in early innings.",
      "Apple, NVIDIA, Amazon, Qualcomm, and Microsoft all build on Arm — ecosystem depth creates switching costs no RISC-V alternative has matched.",
      "On-device AI raises chip complexity per mobile device, lifting royalties without requiring unit growth.",
    ],
    bearCase: [
      "Valuation (50x+ forward earnings) requires continuous royalty-rate and volume growth to justify; any deceleration is severely punished.",
      "RISC-V adoption in IoT and embedded markets is real and growing — the long tail of Arm royalties faces structural erosion over time.",
      "Smartphone unit volumes are slow-growing; royalty growth depends heavily on rate expansion, not unit growth.",
      "Large licensing deal timing and renewal negotiations add quarterly lumpiness; sophisticated licensees push hard on terms.",
    ],
    supplyChain: {
      suppliers: ["N/A — IP licensor with no manufacturing assets or supply-chain exposure"],
      customers: ["Apple (A/M-series — largest royalty contributor)", "Qualcomm (Snapdragon)", "NVIDIA (Grace Blackwell)", "Amazon (Graviton4)", "MediaTek", "Samsung (Exynos)", "Google / Microsoft / Amazon (custom Arm data-center silicon)"],
      hyperscalers: ["AWS (Graviton4 — fastest-growing Arm data-center deployment)", "Google (custom Arm cores)", "Microsoft (custom Arm data-center silicon)"],
      foundry: ["Arm takes no manufacturing risk — customers build at TSMC, Samsung, Intel Foundry"],
    },
    guidanceCommentary:
      "Royalty revenue growth rate and v9 adoption percentage are the primary metrics. CSS license signings are a 3–5 year leading indicator — each new CSS win represents royalties well into the future. Data-center royalty revenue, though still a small fraction, is the fastest-growing and highest-value segment; any Neoverse design-win commentary or hyperscaler custom-Arm adoption update is the highest-quality forward signal on the call.",
    consensusBullThemes: [
      "v9 royalty-rate step-up across mobile and data-center installed base",
      "Data-center and PC as new royalty pool — still early innings",
      "Asset-light, high-margin model with deep ecosystem lock-in",
    ],
    consensusBearThemes: [
      "Valuation stretched — priced for sustained royalty-growth delivery",
      "RISC-V long-term erosion of embedded/IoT royalty tail",
      "Smartphone unit growth dependence on rate expansion not volume",
    ],
    related: [
      { slug: "qcom", reason: "Major Arm licensee (Snapdragon)" },
      { slug: "nvda", reason: "Grace Blackwell built on Arm Neoverse" },
      { slug: "amd", reason: "x86 incumbent Arm is challenging in data center" },
      { slug: "intc", reason: "x86 incumbent under sustained Arm pressure" },
      { slug: "tsm", reason: "Manufactures nearly all Arm-based designs" },
    ],
    updated: "June 11, 2026",
  },

  mu: {
    slug: "mu",
    quickTake:
      "Micron is the only US-listed pure-play memory maker, which makes it the most direct way to own the AI-driven memory upcycle. High-bandwidth memory (HBM) has turned a historically commoditized, brutally cyclical business into a supply-constrained, higher-margin one — and Micron is qualifying its HBM into the top AI accelerators. The stock is a leveraged bet on memory pricing and the HBM ramp.",
    ecosystemRole:
      "Micron supplies the DRAM, NAND, and increasingly the HBM that AI accelerators and data centers depend on. It competes with SK Hynix and Samsung in a global oligopoly where supply discipline and technology leadership drive the cycle. HBM has made memory a strategic, allocated resource rather than a spot commodity.",
    investorFocus:
      "Investors watch the HBM3E/HBM4 ramp and qualification into AI GPUs, DRAM/NAND pricing and the memory cycle, supply discipline across the oligopoly, capex and US fab expansion (CHIPS Act), and end-market mix shifting toward data center, automotive, and industrial.",
    whyItMatters: {
      business:
        "HBM has structurally improved memory economics, and Micron's qualification into leading accelerators converts AI demand directly into revenue. But the core DRAM/NAND business remains cyclical and pricing-driven.",
      investment:
        "Micron offers high-torque exposure to memory pricing: it can earn enormous profits at the top of the cycle and lose money at the bottom. The HBM ramp is the variable that could dampen that historic cyclicality.",
      ecosystem:
        "Memory bandwidth is often the binding constraint on AI performance. Micron's HBM roadmap and capacity decisions directly affect how fast accelerators can scale.",
    },
    keyThemes: [
      { title: "HBM3E qualified in NVIDIA B200", detail: "Micron HBM3E is shipping in NVIDIA Blackwell B200 systems — a major strategic milestone that makes Micron a direct beneficiary of every accelerator shipped. The US-only angle adds policy tailwinds." },
      { title: "HBM4 development race", detail: "SK Hynix leads HBM4; Micron is #2 and qualifying. Timing to production readiness matters for Rubin-generation supply. Perpetually trailing the leader limits pricing power on HBM." },
      { title: "DRAM pricing upcycle", detail: "Conventional DRAM pricing has recovered significantly off the 2023 trough. AI server DRAM content per server is 10x+ standard consumer DRAM, driving a structural mix shift that lifts ASPs." },
      { title: "US manufacturing via CHIPS Act", detail: "Idaho Fab 10 expansion is underway; domestic HBM/DRAM production aligns with government procurement preferences and reduces geopolitical supply risk for US customers." },
      { title: "Oligopoly pricing discipline", detail: "Three players (SK Hynix, Samsung, Micron) means irrational pricing is structurally harder than in prior cycles. Supply discipline from all three has been better than historical patterns." },
    ],
    bullCase: [
      "HBM3E in NVIDIA B200 makes Micron a direct revenue beneficiary of every Blackwell system shipped — the clearest AI memory validation in company history.",
      "US-only HBM production is strategically valuable; CHIPS Act support and domestic procurement preferences are structural tailwinds.",
      "DRAM upcycle is underway with better supply discipline than prior cycles; the oligopoly structure reduces the risk of a pricing collapse.",
      "Data-center and AI server DRAM content per server is structurally rising — mix shift is accretive to ASPs each year.",
    ],
    bearCase: [
      "SK Hynix has a persistent HBM technology lead and is first to HBM4 production; Micron may stay perpetually a generation behind on the highest-margin product.",
      "Memory cycles always eventually turn; a DRAM/NAND pricing reversal erases profitability quickly given the high fixed-cost structure.",
      "HBM capacity conversion ties up DRAM supply; a demand air pocket could flip the tightly balanced market to oversupply.",
      "Extreme capital intensity requires sustained pricing health to earn adequate returns on Idaho and international fab investments.",
    ],
    supplyChain: {
      suppliers: ["ASML (EUV for advanced DRAM nodes)", "Applied Materials / Lam Research / KLA", "Tokyo Electron"],
      customers: ["NVIDIA (HBM3E — Blackwell B200)", "AMD (Instinct MI-series HBM)", "Hyperscalers (data-center DRAM)", "Automotive & industrial OEMs"],
      hyperscalers: ["Indirect — HBM ships inside NVIDIA B200 systems at Azure, AWS, Google Cloud, Oracle"],
      memory: ["Competes with SK Hynix (HBM leader) and Samsung"],
    },
    guidanceCommentary:
      "HBM revenue and HBM4 qualification timeline are the premier data points. Watch for any update on HBM4 sample timing to NVIDIA — that determines Rubin-generation supply share. DRAM pricing commentary and bit-shipment guidance determine the non-HBM earnings trajectory. Gross margin is the cleanest single metric combining both dynamics. CHIPS Act funding milestones and Idaho fab ramp updates are the strategic watch items.",
    consensusBullThemes: [
      "HBM3E in B200 — direct AI accelerator revenue link",
      "DRAM upcycle with better oligopoly supply discipline",
      "US manufacturing CHIPS Act tailwind",
    ],
    consensusBearThemes: [
      "SK Hynix HBM technology lead is persistent",
      "Memory cyclicality — downturns erase profitability",
      "High capital intensity requires sustained pricing health",
    ],
    related: [
      { slug: "skhynix", reason: "Lead HBM competitor — ahead on HBM4" },
      { slug: "samsung", reason: "Memory oligopoly rival" },
      { slug: "nvda", reason: "Key HBM3E customer — B200" },
      { slug: "asml", reason: "EUV equipment for advanced DRAM" },
      { slug: "amd", reason: "HBM customer — Instinct MI-series" },
    ],
    updated: "June 11, 2026",
  },

  intc: {
    slug: "intc",
    quickTake:
      "Intel is the industry's highest-stakes turnaround. Once the undisputed leader, it has ceded process leadership to TSMC and server share to AMD, and is now betting its future on two hard things at once: regaining manufacturing leadership (the 18A node) and building a credible third-party foundry business. There is meaningful US government and strategic backing, but execution risk is high and its AI accelerator efforts lag badly.",
    ecosystemRole:
      "Intel is the last integrated device manufacturer (IDM) attempting leading-edge logic at scale in the US, making it strategically important to Western supply-chain resilience. It competes with AMD and Arm in CPUs, aims to compete with TSMC and Samsung in foundry, and trails NVIDIA/AMD badly in AI accelerators.",
    investorFocus:
      "Investors focus on 18A (and beyond) process execution and yields, foundry customer wins and external revenue, x86 server share stabilization versus AMD/Arm, capex and balance-sheet/funding (including government support), and any credible path in AI accelerators.",
    whyItMatters: {
      business:
        "If Intel regains process leadership and lands external foundry customers, it re-rates dramatically; if 18A slips or foundry fails to attract volume, the capital burn is severe. It is a binary-leaning execution story.",
      investment:
        "Intel is a deep-value turnaround with optionality and strategic backing, but also real downside if the roadmap or foundry strategy disappoints. Risk/reward hinges on milestones, not steady compounding.",
      ecosystem:
        "A successful Intel Foundry would be the only Western leading-edge alternative to TSMC and Samsung — strategically valuable for supply-chain diversification and a check on Taiwan concentration risk.",
    },
    keyThemes: [
      { title: "18A gate-all-around milestone", detail: "18A (Intel's nanosheet gate-all-around node with backside power delivery) is the make-or-break process milestone. First production-intent wafers are in customer hands; yield progress and external tape-out announcements are the scoreboard." },
      { title: "Intel Foundry as separate entity", detail: "Intel Foundry is now structured as a separate subsidiary with its own P&L. This creates cleaner accounting, enables external capital, and forces commercial discipline — but external revenue remains near zero." },
      { title: "Lip-Bu Tan cost discipline", detail: "New CEO Lip-Bu Tan (2025) refocused the company on engineering execution and cost reduction (20,000+ job cuts). A leaner Intel could generate meaningful earnings at lower revenue if manufacturing costs improve." },
      { title: "EMIB advanced packaging asset", detail: "Intel's Embedded Multi-die Interconnect Bridge (EMIB) and Foveros 3D stacking are legitimate, differentiated packaging technologies — potentially attractive to foundry customers who want CoWoS-like performance with Western manufacturing." },
      { title: "Server share stabilization", detail: "EPYC (AMD) continues gaining, but Granite Rapids (Xeon 6) is holding enterprise share more firmly than the prior generation. Arm pressure is growing but primarily in new greenfield deployments, not direct displacement." },
    ],
    bullCase: [
      "18A is the most credible process comeback Intel has shown in a decade — first external production tape-out at a hyperscaler would be a transformational re-rating event.",
      "Intel Foundry is the only Western leading-edge alternative to TSMC; strategic value to governments and Western supply chains is worth billions in support.",
      "EMIB and Foveros packaging technologies are legitimate differentiators that could attract foundry customers prioritizing US-manufactured advanced packaging.",
      "Lip-Bu Tan cost restructuring is improving the expense base; a leaner Intel could earn more at the same revenue if 18A yields improve.",
    ],
    bearCase: [
      "18A yields and process maturity lag TSMC N2 in every public comparison; the gap may be wider than disclosed.",
      "Foundry external revenue is negligible and a marquee external customer win is overdue — without it, the strategy is unvalidated.",
      "EPYC and Arm-based designs continue pressuring Xeon server share; CPU franchise is in gradual structural decline.",
      "AI accelerator (Gaudi 3) is a distant third — NVIDIA and AMD installed bases make switching costly for any buyer.",
      "Capex commitments are enormous relative to revenue; balance sheet is stretched and execution risk is high.",
    ],
    supplyChain: {
      suppliers: ["ASML (High-NA EUV — Intel Foundry is first commercial customer)", "Applied Materials / Lam Research / KLA", "TSMC (outsources some tiles for current-gen products)"],
      customers: ["PC & server OEMs (Dell, HPE, Lenovo, Supermicro)", "US government / defense programs", "Microsoft (18A trial confirmed)", "Enterprise x86 installed base"],
      foundry: ["Building Intel Foundry for external customers — 18A as the commercial-facing node", "EMIB / Foveros packaging offered to foundry customers"],
      packaging: ["Foveros 3D stacking (in-house)", "EMIB multi-die interconnect bridge — comparable to TSMC SoIC"],
    },
    guidanceCommentary:
      "18A production readiness and external customer announcements are the only catalysts that materially re-rate Intel. Every earnings call: watch for yield progress updates, first-customer tape-out confirmation, and volume production timeline. Foundry external revenue (currently near zero) is the scoreboard metric. Gross-margin trajectory shows manufacturing cost discipline. Any Gaudi hyperscaler trial commentary is a secondary but meaningful indicator.",
    consensusBullThemes: [
      "18A process execution — first external customer production",
      "Intel Foundry as Western supply-chain strategic asset",
      "Lip-Bu Tan cost discipline improving earnings leverage",
    ],
    consensusBearThemes: [
      "18A yield gap vs. TSMC N2 is real and may be wider than disclosed",
      "Foundry external revenue — still near zero, strategy unvalidated",
      "CPU server share in structural decline; AI accelerator gap",
    ],
    related: [
      { slug: "amd", reason: "Primary x86 server share-taker" },
      { slug: "tsm", reason: "Foundry benchmark and partial tile supplier" },
      { slug: "arm", reason: "Growing threat to x86 in data center" },
      { slug: "nvda", reason: "AI-accelerator leader Intel trails badly" },
      { slug: "asml", reason: "High-NA EUV — Intel is first commercial customer" },
    ],
    updated: "June 11, 2026",
  },

  qcom: {
    slug: "qcom",
    quickTake:
      "Qualcomm is the leader in smartphone system-on-chips and wireless, now working to prove it's more than a handset company. Its growth pitch is diversification: on-device AI, automotive (digital cockpit and ADAS), and a push into Arm-based PCs with Snapdragon X. The overhang is concentration in smartphones and the long-running risk that Apple designs out Qualcomm's modems.",
    ecosystemRole:
      "Qualcomm sits at the edge of the AI ecosystem — putting AI inference into phones, cars, and PCs rather than the data center. It is a major Arm licensee and a bellwether for on-device AI, where models run locally instead of in the cloud.",
    investorFocus:
      "Investors track diversification progress in automotive and PC, on-device (edge) AI as a content driver, the Apple modem-insourcing risk to handset revenue, the high-margin licensing (QTL) business, and exposure to the cyclical, China-heavy smartphone market.",
    whyItMatters: {
      business:
        "Qualcomm's handset franchise is mature; the equity story depends on automotive and PC scaling and on edge AI raising chip content. Licensing provides a high-margin profit anchor.",
      investment:
        "The stock is cheaper than data-center AI names and offers an edge-AI angle, but it must show real diversification to escape the smartphone-cyclical, Apple-risk narrative.",
      ecosystem:
        "If meaningful AI inference shifts on-device, Qualcomm benefits as the leader in efficient mobile/edge silicon — a different (and complementary) bet from the data-center buildout.",
    },
    keyThemes: [
      { title: "Snapdragon X Elite — real PC traction", detail: "Arm-based Windows AI PCs are gaining genuine shelf space. Snapdragon X Elite outperforms Intel Core Ultra on efficiency for AI-intensive workloads — the strongest x86 PC challenger in decades." },
      { title: "Automotive $45B+ pipeline", detail: "Snapdragon Digital Chassis design wins represent a $45B+ multi-year revenue pipeline. Cockpit and ADAS content per car is rising; automotive is now Qualcomm's clearest long-term diversification proof point." },
      { title: "On-device AI — NPU content rising", detail: "Snapdragon 8 Elite's NPU enables real-time generative AI on the phone. AI raises die area and ASP per SoC structurally, even without handset unit growth." },
      { title: "Apple C1 modem insourcing", detail: "Apple's C1 modem launched in entry-level devices in 2025. Premium iPhone transition is likely 2026–2027, putting $6–8B of annual Qualcomm revenue at risk over a multi-year glide path." },
      { title: "QTL licensing anchor", detail: "Patent licensing is ~20% of revenue but ~40% of operating profit. High-margin, relatively predictable, but faces renewal risk with Samsung and others." },
    ],
    bullCase: [
      "Snapdragon X Elite has genuine performance/efficiency advantages for AI-intensive PC workloads — first real x86 disruption in the laptop market since Apple M1.",
      "Automotive pipeline ($45B+) converts to revenue over 3–5 years as design wins enter production; largely locked in and less cyclical than mobile.",
      "On-device AI raises SoC complexity and ASPs structurally — royalty and content growth without needing handset unit volume.",
      "Valuation (14–16x forward PE) is the cheapest way to own an AI-adjacent semiconductor franchise with meaningful diversification progress.",
    ],
    bearCase: [
      "Apple C1 modem is in production; premium iPhone modem transition in 2026–2027 puts $6–8B of revenue at risk over a multi-year window.",
      "Handset segment is still the dominant earnings driver — mature, cyclical, and heavily China-exposed.",
      "PC and automotive must scale to a material fraction of QCT revenue to change the stock's narrative and multiple.",
      "QTL licensing faces ongoing royalty-rate disputes and renewal risk with Samsung and other large licensees.",
    ],
    supplyChain: {
      suppliers: ["TSMC (Snapdragon SoCs — N3/N4)", "Samsung (secondary foundry for modems)", "Arm (Oryon custom core IP via Nuvia acquisition)"],
      customers: ["Samsung (Android flagship)", "Xiaomi / OPPO / vivo / OnePlus (Android OEMs)", "Automakers (BMW, GM, Mercedes, Stellantis)", "PC OEMs (Microsoft Surface, Dell, HP, Lenovo, Samsung)"],
      foundry: ["TSMC (primary — Snapdragon 8 Elite on N3)", "Samsung (secondary, modems)"],
    },
    guidanceCommentary:
      "Automotive and IoT/PC revenue are the diversification scorecards — watch their share of QCT revenue each quarter. Handset ASPs and China sell-through show core franchise health. Apple modem timing updates (from Apple earnings or supply-chain signals) are the biggest single downside risk to quantify. QTL royalty-per-handset trends reflect global smartphone ASP dynamics.",
    consensusBullThemes: [
      "Snapdragon X Elite PC disruption is real",
      "Automotive $45B pipeline converting to revenue",
      "On-device AI raising SoC content and ASPs",
    ],
    consensusBearThemes: [
      "Apple modem insourcing — $6–8B revenue at risk",
      "Smartphone cyclicality and China concentration",
      "PC and automotive must scale materially to move the needle",
    ],
    related: [
      { slug: "arm", reason: "Core CPU IP licensor (Oryon built on Arm)" },
      { slug: "avgo", reason: "Wireless & connectivity semiconductor peer" },
      { slug: "nvda", reason: "Edge vs. data-center AI contrast" },
      { slug: "intc", reason: "x86 PC incumbent Snapdragon X challenges" },
      { slug: "tsm", reason: "Manufactures Snapdragon SoCs at N3" },
    ],
    updated: "June 11, 2026",
  },

  skhynix: {
    slug: "skhynix",
    quickTake:
      "SK Hynix has emerged as the single biggest memory winner of the AI era. It took an early lead in high-bandwidth memory (HBM) and became the primary HBM supplier to NVIDIA's accelerators, turning a cyclical commodity business into a strategic, supply-constrained one. As a Korea-listed pure memory and HBM leader, it is the most direct international play on AI memory demand.",
    ecosystemRole:
      "SK Hynix is the lead HBM supplier feeding the AI accelerator boom, alongside its large DRAM and NAND (Solidigm) operations. It competes with Samsung and Micron in a global oligopoly, but its HBM leadership has given it pricing power and priority allocation at the heart of the AI supply chain.",
    investorFocus:
      "Investors focus on HBM leadership and share (HBM3E/HBM4) into AI GPUs, DRAM/NAND pricing and the memory cycle, capex and capacity allocation toward HBM, competitive response from Samsung and Micron, and customer concentration in NVIDIA.",
    whyItMatters: {
      business:
        "HBM leadership has transformed SK Hynix's margins and strategic position. Its capacity decisions directly influence how quickly AI accelerators can scale, but the broader memory business stays cyclical.",
      investment:
        "SK Hynix offers the purest international exposure to the AI memory upcycle and HBM leadership, with high torque to memory pricing and the ramp of next-gen HBM.",
      ecosystem:
        "As the primary HBM supplier to the dominant accelerator vendor, SK Hynix is a critical bottleneck — its yields and capacity help set the ceiling on AI compute supply.",
    },
    keyThemes: [
      { title: "HBM4 production lead", detail: "SK Hynix is first to production with HBM4, extending the HBM3E first-mover advantage into the Rubin GPU generation. Maintaining this lead through each HBM generation is the core franchise sustainability test." },
      { title: "NVIDIA B200 primary supplier", detail: "HBM3E is inside every H100, H200, and B200 system shipped. SK Hynix's supply relationship with NVIDIA is deeply embedded — NVIDIA has structured roadmap dependencies on SK Hynix yields." },
      { title: "Hybrid bonding transition", detail: "HBM stacking is moving from mass-reflow solder to hybrid bonding (copper-to-copper direct bond). This improves yield and density but requires BESI tooling investment. SK Hynix is ahead of peers here." },
      { title: "Capacity allocation tightening DRAM", detail: "Converting standard DRAM capacity to HBM reduces conventional DRAM supply, supporting broader memory pricing. SK Hynix's HBM mix shift is a secondary support for the entire DRAM market." },
      { title: "Samsung HBM catch-up risk", detail: "Samsung is qualifying HBM3E and HBM4 aggressively. Successful qualification into NVIDIA systems is the primary competitive threat to SK Hynix's pricing power and share." },
    ],
    bullCase: [
      "HBM4 leadership extends SK Hynix's premium economics into the NVIDIA Rubin generation — first-mover advantage compounding into the next cycle.",
      "Every B200 and GH200 system ships with SK Hynix HBM3E; NVIDIA supply dependency is mutual and deeply embedded in joint roadmap planning.",
      "HBM capacity allocation structurally tightens conventional DRAM supply, supporting wider memory pricing beyond just the HBM premium.",
      "Hybrid bonding technology lead (via BESI tooling) is a manufacturing moat that Samsung and Micron are still closing.",
    ],
    bearCase: [
      "Samsung is qualifying HBM3E and HBM4 aggressively; success would directly compress SK Hynix's share and pricing power at NVIDIA.",
      "Core DRAM/NAND remains deeply cyclical; a conventional memory pricing reversal would overwhelm HBM-driven profitability gains.",
      "NVIDIA HBM concentration means any AI-capex digestion period creates direct revenue risk for SK Hynix.",
      "Capital intensity of HBM (TSV stacking, hybrid bonding, advanced packaging) is very high; timing capacity additions is difficult.",
    ],
    supplyChain: {
      suppliers: ["ASML (EUV/DUV for advanced DRAM nodes)", "Applied Materials / Lam Research / KLA", "BESI (hybrid bonding equipment — critical for HBM stacking)", "Tokyo Electron"],
      customers: ["NVIDIA (primary HBM3E/HBM4 — B200, GH200)", "AMD (Instinct MI-series HBM)", "Hyperscalers via AI accelerator systems"],
      hyperscalers: ["Indirect — HBM ships inside NVIDIA/AMD systems at Azure, AWS, Google Cloud, Oracle"],
      memory: ["Leads Samsung and Micron in HBM technology; competes across conventional DRAM and NAND"],
    },
    guidanceCommentary:
      "HBM4 production ramp and NVIDIA qualification update is the primary metric each quarter. Watch HBM revenue as a percentage of total DRAM — when it crosses 40%+, the margin and cyclicality profile transforms permanently. Samsung's HBM3E/HBM4 qualification status into NVIDIA systems is the key competitive risk; any signal it clears is an SK Hynix thesis test. Conventional DRAM pricing sets the base earnings floor. Note: Korea-listed (KRX), reports in KRW.",
    consensusBullThemes: [
      "HBM4 production lead into NVIDIA Rubin generation",
      "NVIDIA B200 primary-supplier lock-in",
      "Hybrid bonding technology moat vs. Samsung/Micron",
    ],
    consensusBearThemes: [
      "Samsung HBM qualification closing the gap",
      "DRAM/NAND cyclicality overwhelming HBM gains",
      "NVIDIA AI-capex concentration risk",
    ],
    related: [
      { slug: "mu", reason: "HBM/memory competitor (US-listed)" },
      { slug: "samsung", reason: "Korean memory rival closing HBM gap" },
      { slug: "nvda", reason: "Primary HBM3E/HBM4 customer" },
      { slug: "asml", reason: "EUV equipment for advanced DRAM nodes" },
      { slug: "amd", reason: "HBM accelerator customer — Instinct" },
    ],
    updated: "June 11, 2026",
  },

  samsung: {
    slug: "samsung",
    quickTake:
      "Samsung Electronics is a diversified technology conglomerate spanning memory, foundry, and consumer devices — but for AI investors, the story is whether it can catch up. It is a memory giant that ceded the early HBM lead to SK Hynix and is racing to qualify its HBM into NVIDIA, while its foundry arm is the main challenger to TSMC. Successful HBM qualification and foundry traction are the two catalysts that would re-rate the stock.",
    ecosystemRole:
      "Samsung is one of three global memory makers and the second-largest foundry, giving it a unique dual role: it both supplies memory for AI systems and competes to manufacture the logic chips that drive them. Its breadth is a strength and a focus problem — it fights TSMC in foundry and SK Hynix/Micron in memory simultaneously.",
    investorFocus:
      "Investors watch HBM qualification progress (especially into NVIDIA) and share recovery, foundry competitiveness versus TSMC and yield improvement, the DRAM/NAND pricing cycle, capex across memory and foundry, and the drag/contribution from consumer devices.",
    whyItMatters: {
      business:
        "Samsung has the scale and capital to compete on every front, but it has lagged in the most important AI niche (HBM). Closing that gap and improving foundry yields are essential to participating fully in the AI upcycle.",
      investment:
        "Samsung is a value-oriented, diversified way to own memory and foundry, with a clear catalyst path (HBM qualification, foundry wins) but also execution questions that have weighed on sentiment.",
      ecosystem:
        "As the only company that is both a top-three memory maker and a leading-edge foundry, Samsung is strategically central — a credible second source to both TSMC and SK Hynix if it executes.",
    },
    keyThemes: [
      { title: "HBM3E/HBM4 qualification race", detail: "Passing NVIDIA's HBM3E qualification — and then HBM4 — is the single most important AI catalyst for Samsung. The company has the capacity to supply at scale once qualified; the yield and power spec are the gates." },
      { title: "Foundry SF2 yield progress", detail: "Samsung Foundry SF2 (2nm-class) must close a material yield gap to TSMC N2 to attract external logic customers. The foundry has not yet landed a marquee external customer at the leading edge at scale." },
      { title: "DRAM/NAND pricing recovery", detail: "As the world's largest DRAM producer, Samsung benefits disproportionately from pricing recovery. Conventional memory pricing sets the base-case earnings floor while AI-specific revenues develop." },
      { title: "Hybrid bonding catch-up", detail: "Samsung is investing in hybrid bonding for HBM stacking to match SK Hynix's process maturity. BESI tooling and process development are the bottleneck; SK Hynix has a meaningful head start." },
      { title: "Multi-front capex strain", detail: "Funding HBM catch-up, SF2 foundry, and advanced packaging simultaneously is enormously capital-intensive. Focus and capital-allocation discipline are questions the market continues to raise." },
    ],
    bullCase: [
      "HBM3E/HBM4 qualification into NVIDIA B200/Rubin systems would be a significant re-rating catalyst; Samsung has the capacity to supply at scale immediately upon qualification.",
      "Only company that is simultaneously a top-3 memory maker and a leading-edge foundry — potential cross-business synergies in advanced packaging.",
      "World's largest DRAM producer benefits most from pricing recovery; the balance sheet can sustain investment through the current execution challenges.",
      "DRAM pricing recovery plus any HBM qualification confirmation is a powerful dual catalyst.",
    ],
    bearCase: [
      "HBM qualification delays have been the single biggest AI thesis disappointment — execution credibility is compromised and the gap to SK Hynix in HBM4 appears to be widening.",
      "SF2 foundry yield gap to TSMC N2 is estimated at 2+ years; landing a marquee external customer requires sustained execution the market has not yet seen.",
      "Fighting on every front (HBM, foundry, logic, NAND, consumer devices) strains management attention and capital allocation.",
      "Consumer device exposure (Mobile/MX segment) adds cyclicality and can compress margins during weak smartphone cycles.",
    ],
    supplyChain: {
      suppliers: ["ASML (EUV/High-NA for leading-edge logic and memory)", "Applied Materials / Lam Research / KLA", "BESI (hybrid bonding equipment — catching up to SK Hynix)"],
      customers: ["NVIDIA (target HBM customer — qualification ongoing)", "Qualcomm (Galaxy SoC — foundry customer)", "AMD (secondary memory customer)", "Samsung device division (large internal consumer)", "Foundry pipeline customers"],
      foundry: ["Samsung Foundry (SF3E / SF2) competing with TSMC for external logic at leading edge"],
      memory: ["World's largest DRAM producer — competing with SK Hynix (HBM leader) and Micron"],
    },
    guidanceCommentary:
      "HBM qualification status into NVIDIA systems is the single most-watched data point — any confirmation of B200-qualified HBM3E or HBM4 sample timing is the primary catalyst for re-rating. Foundry SF2 yield progress and any new external design-win is the foundry re-rating narrative. DRAM/NAND pricing gives the base-case earnings picture each quarter. Note: Korea-listed (KRX), reports in KRW — ADR (SSNLF) is OTC and less liquid.",
    consensusBullThemes: [
      "HBM qualification into NVIDIA — major pending catalyst",
      "DRAM pricing recovery benefits world's largest producer",
      "Foundry turnaround optionality at deep-value entry",
    ],
    consensusBearThemes: [
      "HBM execution lag — credibility gap on AI memory",
      "Foundry yield gap vs. TSMC — 2+ years behind",
      "Multi-front capex strain and focus questions",
    ],
    related: [
      { slug: "skhynix", reason: "Korean memory & HBM rival — leads on HBM4" },
      { slug: "mu", reason: "Memory competitor (US-listed)" },
      { slug: "tsm", reason: "Foundry leader Samsung is challenging" },
      { slug: "asml", reason: "EUV/High-NA equipment for memory & foundry" },
      { slug: "nvda", reason: "Target HBM customer — qualification pending" },
    ],
    updated: "June 11, 2026",
  },
};

export function getEditorial(slug: string): CompanyEditorial | undefined {
  return EDITORIAL[slug.toLowerCase()];
}
