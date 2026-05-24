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

export type CompanyMeta = {
  slug: string; // URL segment, e.g. "nvda"
  ticker: string; // display ticker
  name: string; // display name
  yahooSymbol: string; // symbol the data layer queries
  sector: string; // sublabel under the name
  exchangeLabel?: string; // optional, for foreign listings
  newsKeywords: string[]; // title must contain at least one (case-insensitive) for news to show
  ceo?: CEOProfile;
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
  },
  {
    slug: "amd", ticker: "AMD", name: "AMD", yahooSymbol: "AMD",
    sector: "CPUs & AI GPUs (x86 + Instinct)",
    newsKeywords: ["amd", "advanced micro devices", "advanced micro"],
    ceo: { name: "Lisa Su", since: "2014", photo: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/de/SXSW-2024-alih-OB7A0861-Lisa_Su_%28cropped_2%29.jpg/500px-SXSW-2024-alih-OB7A0861-Lisa_Su_%28cropped_2%29.jpg" },
  },
  {
    slug: "avgo", ticker: "AVGO", name: "Broadcom", yahooSymbol: "AVGO",
    sector: "Custom AI ASICs & Networking",
    newsKeywords: ["broadcom", "avgo"],
    ceo: { name: "Hock Tan", since: "2006", photo: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Hock_Tan_2022.png/500px-Hock_Tan_2022.png" },
  },
  {
    slug: "mrvl", ticker: "MRVL", name: "Marvell", yahooSymbol: "MRVL",
    sector: "Custom AI Silicon & Optical Interconnect",
    newsKeywords: ["marvell", "mrvl"],
    ceo: { name: "Matt Murphy", since: "2016" },
  },
  {
    slug: "tsm", ticker: "TSM", name: "TSMC", yahooSymbol: "TSM",
    sector: "Leading-Edge Foundry",
    newsKeywords: ["tsmc", "taiwan semiconductor"],
    ceo: { name: "C.C. Wei", since: "2018" },
  },
  {
    slug: "asml", ticker: "ASML", name: "ASML", yahooSymbol: "ASML",
    sector: "EUV Lithography Equipment",
    newsKeywords: ["asml"],
    ceo: { name: "Christophe Fouquet", since: "2024" },
  },
  {
    slug: "arm", ticker: "ARM", name: "Arm Holdings", yahooSymbol: "ARM",
    sector: "CPU IP & Instruction Set",
    newsKeywords: ["arm holdings", "arm chips", "arm-based", "arm's", "arm stock", "arm ipo"],
    ceo: { name: "Rene Haas", since: "2022", photo: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/08/Rene_Haas_at_SXSW_2025.jpg/500px-Rene_Haas_at_SXSW_2025.jpg" },
  },
  {
    slug: "mu", ticker: "MU", name: "Micron", yahooSymbol: "MU",
    sector: "HBM & DRAM/NAND Memory",
    newsKeywords: ["micron", "micron technology"],
    ceo: { name: "Sanjay Mehrotra", since: "2017", photo: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/de/Sanjay_Mehrotra_2025_%28cropped%29.jpg/500px-Sanjay_Mehrotra_2025_%28cropped%29.jpg" },
  },
  {
    slug: "intc", ticker: "INTC", name: "Intel", yahooSymbol: "INTC",
    sector: "x86 CPUs & Foundry (IDM)",
    newsKeywords: ["intel", "intc"],
    ceo: { name: "Lip-Bu Tan", since: "2025", photo: "https://upload.wikimedia.org/wikipedia/commons/1/10/Howard_Lutnick_with_Intel_CEO_Lip-Bu_Tan_%282025%29_%28cropped3%29.jpg" },
  },
  {
    slug: "qcom", ticker: "QCOM", name: "Qualcomm", yahooSymbol: "QCOM",
    sector: "Mobile SoCs & Edge AI",
    newsKeywords: ["qualcomm", "qcom"],
    ceo: { name: "Cristiano Amon", since: "2021", photo: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6e/Cristiano_Amon_%28President_%26_CEOQualcomm%29_%2854916855494%29_%28cropped%29.jpg/500px-Cristiano_Amon_%28President_%26_CEOQualcomm%29_%2854916855494%29_%28cropped%29.jpg" },
  },
  {
    slug: "skhynix", ticker: "000660.KS", name: "SK Hynix", yahooSymbol: "000660.KS",
    sector: "HBM & DRAM Memory",
    exchangeLabel: "KRX: 000660",
    newsKeywords: ["sk hynix", "hynix"],
    ceo: { name: "Kwak Noh-jung", since: "2021" },
  },
  {
    slug: "samsung", ticker: "005930.KS", name: "Samsung Electronics", yahooSymbol: "005930.KS",
    sector: "Memory, Foundry & Devices",
    exchangeLabel: "KRX: 005930",
    newsKeywords: ["samsung"],
    ceo: { name: "Jong-Hee Han", since: "2022" },
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
      { title: "Instinct MI-series ramp", detail: "The MI300/MI350/MI400 cadence and hyperscaler design wins are the core AI growth driver. Execution against NVIDIA's annual rhythm is the key variable." },
      { title: "EPYC server share gains", detail: "AMD continues taking x86 data-center share from Intel — a steady, high-margin franchise that funds the AI push." },
      { title: "ROCm software gap", detail: "Closing the distance to CUDA is the single biggest swing factor for Instinct adoption beyond a handful of sophisticated buyers." },
      { title: "Second-source demand", detail: "Hyperscalers actively want a credible NVIDIA alternative; AMD is the obvious beneficiary of that strategic diversification." },
      { title: "TSMC & HBM dependence", detail: "AMD competes for the same leading-edge wafers, CoWoS packaging, and HBM that constrain NVIDIA — supply allocation matters." },
    ],
    bullCase: [
      "Two simultaneous share-gain stories: EPYC vs. Intel in CPUs and Instinct as the AI second source.",
      "Hyperscalers are structurally motivated to fund a credible NVIDIA alternative.",
      "Data-center mix shift lifts margins and earnings power over time.",
      "Chiplet design leadership and TSMC access keep AMD on the leading edge.",
    ],
    bearCase: [
      "ROCm still trails CUDA badly; Instinct may stay a niche second source.",
      "NVIDIA's yearly cadence and systems moat are hard to out-execute.",
      "Competes for the same constrained TSMC/HBM capacity, capping upside.",
      "Client and gaming segments are cyclical and can mask data-center progress.",
    ],
    supplyChain: {
      suppliers: ["TSMC (logic)", "SK Hynix / Micron / Samsung (HBM)", "Amkor / ASE (back-end)"],
      customers: ["Microsoft", "Meta", "Oracle", "Dell / Supermicro (OEMs)", "Enterprise & cloud"],
      hyperscalers: ["Azure", "Meta", "Oracle Cloud"],
      foundry: ["TSMC (N4 / N3 / N2 roadmap)"],
      packaging: ["TSMC CoWoS / SoIC chiplet packaging"],
      memory: ["SK Hynix", "Micron", "Samsung (HBM)"],
    },
    guidanceCommentary:
      "Focus on data-center GPU revenue guidance and any quantified Instinct pipeline, plus EPYC share commentary and gross-margin trajectory. Management's tone on MI-series customer traction usually matters more than the headline number.",
    consensusBullThemes: [
      "Instinct second-source momentum",
      "Sustained EPYC server share gains",
      "Margin accretion from data-center mix",
    ],
    consensusBearThemes: [
      "Software ecosystem gap vs. CUDA",
      "Supply allocation constraints",
      "Cyclicality in client/gaming",
    ],
    related: [
      { slug: "nvda", reason: "Primary AI-GPU competitor" },
      { slug: "intc", reason: "x86 server-CPU rival losing share" },
      { slug: "tsm", reason: "Sole leading-edge foundry" },
      { slug: "avgo", reason: "Custom-ASIC alternative to merchant GPUs" },
      { slug: "mu", reason: "HBM supplier" },
      { slug: "mrvl", reason: "Data-center silicon peer" },
    ],
    updated: "May 22, 2026",
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
      { title: "Custom XPU programs", detail: "Co-designing accelerators for hyperscalers (Google TPU and others) is the marquee AI growth engine. New named customers are the key catalysts." },
      { title: "AI networking", detail: "Tomahawk/Jericho switches and SerDes scale with cluster size; Ethernet's rise in AI fabrics plays to Broadcom's strength." },
      { title: "Customer concentration", detail: "A small number of hyperscalers drive the AI silicon business — a strength in scale but a risk if any pulls back." },
      { title: "Software (VMware)", detail: "High-margin, recurring software smooths the cyclicality of chips and supports the cash-return story." },
      { title: "Optical & co-packaged optics", detail: "As interconnect becomes the bottleneck, Broadcom's optical and CPO roadmap expands dollar content per cluster." },
    ],
    bullCase: [
      "Owns the two best non-GPU ways to play AI: custom accelerators and networking.",
      "Adding hyperscaler XPU customers expands a large, multi-year revenue pipeline.",
      "VMware adds sticky, high-margin recurring revenue and strong free cash flow.",
      "Networking content grows automatically as AI clusters get larger.",
    ],
    bearCase: [
      "Heavy revenue concentration in a handful of mega-customers.",
      "Custom programs are lumpy and can be insourced or re-bid.",
      "Acquisitive model carries integration and leverage risk.",
      "A broad AI-capex digestion would hit both silicon segments at once.",
    ],
    supplyChain: {
      suppliers: ["TSMC (logic & advanced nodes)", "Substrate & packaging partners"],
      customers: ["Google", "Meta", "ByteDance / large hyperscalers", "Apple (wireless content)"],
      hyperscalers: ["Google Cloud", "Meta", "Other XPU customers"],
      foundry: ["TSMC (leading-edge logic)"],
      packaging: ["Advanced packaging & substrates"],
    },
    guidanceCommentary:
      "Watch AI semiconductor revenue guidance (XPU + networking), commentary on new custom-silicon customers, and software margins. Management's framing of the multi-year AI revenue opportunity tends to move the stock most.",
    consensusBullThemes: [
      "Expanding custom-XPU customer roster",
      "AI networking share gains",
      "Durable free cash flow and dividends",
    ],
    consensusBearThemes: [
      "Customer concentration risk",
      "Lumpiness of custom programs",
      "Capex-digestion sensitivity",
    ],
    related: [
      { slug: "nvda", reason: "Custom silicon is the hedge against merchant GPUs" },
      { slug: "mrvl", reason: "Direct custom-ASIC & optical competitor" },
      { slug: "tsm", reason: "Manufactures Broadcom's leading-edge silicon" },
      { slug: "amd", reason: "Merchant-GPU alternative" },
      { slug: "mu", reason: "Memory in AI systems" },
    ],
    updated: "May 22, 2026",
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
      { title: "Custom AI silicon", detail: "Co-designed ASICs for cloud customers are the swing factor; named program ramps drive the stock." },
      { title: "Optical interconnect", detail: "Optical DSPs and electro-optics scale with bandwidth demand as AI clusters grow — a durable secular driver." },
      { title: "Data-center mix shift", detail: "Data center is becoming the dominant segment; legacy enterprise/carrier exposure adds cyclicality." },
      { title: "Customer concentration", detail: "A few hyperscalers drive the custom and optical pipeline, amplifying both upside and risk." },
      { title: "Co-packaged optics", detail: "Moving optics closer to the switch/compute die is a long-term content-expansion opportunity." },
    ],
    bullCase: [
      "Leveraged exposure to two secular winners: custom AI silicon and optical interconnect.",
      "Custom program ramps can re-rate the revenue base meaningfully.",
      "Interconnect bottlenecks make Marvell's optics increasingly essential.",
      "Smaller base means high incremental growth from each design win.",
    ],
    bearCase: [
      "High customer and program concentration creates lumpy results.",
      "Competes directly with a larger, better-capitalized Broadcom.",
      "Legacy enterprise/carrier segments can drag in downcycles.",
      "Valuation prices aggressive custom-silicon ramps that must execute.",
    ],
    supplyChain: {
      suppliers: ["TSMC (leading-edge logic)", "Optical component partners"],
      customers: ["Amazon / hyperscalers", "Microsoft", "Networking OEMs"],
      hyperscalers: ["AWS", "Azure", "Other cloud customers"],
      foundry: ["TSMC"],
      packaging: ["Advanced packaging & co-packaged optics"],
    },
    guidanceCommentary:
      "Focus on data-center revenue guidance, custom-silicon program commentary, and optical demand. Updates on new or ramping custom ASIC customers tend to drive outsized moves given the smaller revenue base.",
    consensusBullThemes: [
      "Custom-ASIC ramp leverage",
      "Secular optical/interconnect demand",
      "Data-center mix shift",
    ],
    consensusBearThemes: [
      "Concentration and program lumpiness",
      "Competition from Broadcom",
      "Legacy-segment drag",
    ],
    related: [
      { slug: "avgo", reason: "Larger custom-ASIC & networking rival" },
      { slug: "nvda", reason: "Interconnect & custom-silicon adjacency" },
      { slug: "tsm", reason: "Manufactures Marvell's leading-edge chips" },
      { slug: "amd", reason: "Data-center silicon peer" },
      { slug: "mu", reason: "Memory in AI infrastructure" },
    ],
    updated: "May 22, 2026",
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
      { title: "Leading-edge node ramp", detail: "N3 and N2 adoption by AI and mobile customers drives mix and margin. Node leadership is TSMC's core moat." },
      { title: "CoWoS packaging bottleneck", detail: "Advanced packaging capacity, not just wafers, often gates accelerator supply — the single most-watched constraint in AI hardware." },
      { title: "Pricing power", detail: "Scarcity of leading-edge capacity lets TSMC raise prices, supporting industry-leading margins." },
      { title: "Geographic diversification", detail: "Arizona, Japan, and Germany fabs reduce concentration but raise costs — a margin and execution watch item." },
      { title: "Taiwan geopolitical risk", detail: "The dominant tail risk; any cross-strait escalation would ripple through the entire technology supply chain." },
    ],
    bullCase: [
      "Indispensable, near-monopoly supplier of leading-edge logic and CoWoS packaging.",
      "Diversified AI exposure without betting on a single chip designer.",
      "Pricing power and node leadership support durable, high margins.",
      "Multi-year visibility from AI/HPC demand and customer capex commitments.",
    ],
    bearCase: [
      "Taiwan concentration is a severe, hard-to-hedge geopolitical risk.",
      "Extreme capital intensity; over-building into a demand pause hurts returns.",
      "Overseas fabs dilute margins and carry execution risk.",
      "Customer demand is ultimately cyclical and tied to AI-capex sentiment.",
    ],
    supplyChain: {
      suppliers: ["ASML (EUV/DUV)", "Applied Materials", "Lam Research", "KLA", "Tokyo Electron"],
      customers: ["NVIDIA", "Apple", "AMD", "Broadcom", "Qualcomm", "MediaTek"],
      hyperscalers: ["Indirect — via custom-silicon customers (Google, Amazon, Microsoft)"],
      packaging: ["CoWoS & SoIC (in-house advanced packaging)"],
    },
    guidanceCommentary:
      "Watch HPC/AI revenue mix, leading-edge utilization, CoWoS capacity expansion, capex guidance, and gross-margin commentary (including overseas-fab dilution). Management's tone on AI demand durability is a key sector signal.",
    consensusBullThemes: [
      "AI/HPC leading-edge demand",
      "CoWoS capacity expansion",
      "Pricing power & margin leadership",
    ],
    consensusBearThemes: [
      "Taiwan geopolitical risk",
      "Capital intensity / over-build risk",
      "Overseas-fab margin dilution",
    ],
    related: [
      { slug: "asml", reason: "Sole EUV equipment supplier upstream" },
      { slug: "nvda", reason: "Largest leading-edge AI customer" },
      { slug: "amd", reason: "Key leading-edge customer" },
      { slug: "avgo", reason: "Custom-silicon customer" },
      { slug: "arm", reason: "IP in chips TSMC manufactures" },
    ],
    updated: "May 22, 2026",
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
      { title: "High-NA EUV ramp", detail: "Whether next-gen High-NA tools reach high-volume readiness on schedule shapes the industry roadmap — and is currently contested." },
      { title: "Bookings as a leading indicator", detail: "ASML's order intake is one of the cleanest forward signals for foundry and memory capex intentions." },
      { title: "China export controls", detail: "Restrictions cap a meaningful revenue pool and inject policy risk into guidance." },
      { title: "Installed-base services", detail: "A growing, recurring high-margin service stream smooths the lumpiness of system sales." },
      { title: "Memory capex recovery", detail: "HBM/DRAM expansion drives EUV demand from memory makers, adding a second growth leg to logic." },
    ],
    bullCase: [
      "Absolute monopoly on EUV — no leading-edge chip exists without ASML.",
      "Diversified exposure to logic and memory leading-edge transitions.",
      "Large backlog and growing recurring service revenue provide visibility.",
      "High-NA extends the technology roadmap and ASML's runway for years.",
    ],
    bearCase: [
      "Revenue is lumpy and tied to a few customers' capex cycles.",
      "China restrictions cap demand and create policy overhang.",
      "High-NA readiness may slip, delaying revenue and roadmap.",
      "A leading-edge capex pause would hit bookings hard.",
    ],
    supplyChain: {
      suppliers: ["Zeiss (optics)", "Specialized photonics & precision component vendors"],
      customers: ["TSMC", "Samsung", "Intel", "SK Hynix", "Micron"],
      foundry: ["Sells to all leading-edge foundries & IDMs"],
    },
    guidanceCommentary:
      "Watch bookings/order intake (the key forward indicator), High-NA shipment and qualification commentary, China revenue mix, and service-revenue growth. Management's read on customer capex timing is a major sector signal.",
    consensusBullThemes: [
      "EUV monopoly & roadmap longevity",
      "Backlog and recurring service revenue",
      "Memory + logic dual demand",
    ],
    consensusBearThemes: [
      "Cyclical capex timing",
      "China export-control overhang",
      "High-NA ramp uncertainty",
    ],
    related: [
      { slug: "tsm", reason: "Largest EUV customer" },
      { slug: "intc", reason: "High-NA early adopter" },
      { slug: "samsung", reason: "Logic + memory EUV customer" },
      { slug: "skhynix", reason: "Memory EUV customer" },
      { slug: "mu", reason: "Memory capex driver" },
    ],
    updated: "May 22, 2026",
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
      { title: "Royalty-rate expansion", detail: "Adoption of v9 and Compute Subsystems lifts the royalty per chip — the core lever on revenue growth." },
      { title: "Data-center penetration", detail: "Neoverse, NVIDIA Grace, and Amazon Graviton push Arm into servers, expanding beyond mobile." },
      { title: "Edge & on-device AI", detail: "AI moving onto phones and devices increases the value and complexity of Arm-based SoCs." },
      { title: "Licensing model leverage", detail: "Asset-light, high-margin economics scale with the entire silicon market." },
      { title: "Valuation expectations", detail: "The stock prices substantial future royalty growth, raising sensitivity to any slowdown." },
    ],
    bullCase: [
      "Royalty model captures upside across the entire and growing compute market.",
      "Data-center and PC expansion multiplies the addressable royalty base.",
      "v9/CSS adoption structurally raises royalty rates per chip.",
      "Asset-light, high-margin economics with broad ecosystem lock-in.",
    ],
    bearCase: [
      "Premium valuation leaves little room for royalty-growth disappointment.",
      "RISC-V is a long-term open-source threat to the licensing model.",
      "Revenue partly tied to cyclical smartphone volumes.",
      "Customer concentration and licensing-deal timing add lumpiness.",
    ],
    supplyChain: {
      suppliers: ["N/A — IP licensor (no manufacturing)"],
      customers: ["Apple", "Qualcomm", "NVIDIA", "Amazon", "MediaTek", "Hyperscaler custom-silicon teams"],
      hyperscalers: ["AWS (Graviton)", "Others via custom Arm cores"],
      foundry: ["Customers manufacture at TSMC, Samsung, etc."],
    },
    guidanceCommentary:
      "Focus on royalty revenue growth, v9/CSS adoption commentary, licensing momentum, and data-center traction. Management's framing of royalty-rate expansion and AI-driven complexity is the key driver.",
    consensusBullThemes: [
      "Royalty-rate expansion (v9/CSS)",
      "Data-center & AI penetration",
      "High-margin, asset-light model",
    ],
    consensusBearThemes: [
      "Stretched valuation",
      "RISC-V long-term threat",
      "Smartphone cyclicality",
    ],
    related: [
      { slug: "qcom", reason: "Major Arm licensee (Snapdragon)" },
      { slug: "nvda", reason: "Grace CPU built on Arm" },
      { slug: "amd", reason: "x86 incumbent Arm is challenging" },
      { slug: "intc", reason: "x86 incumbent under Arm pressure" },
      { slug: "tsm", reason: "Manufactures Arm-based designs" },
    ],
    updated: "May 22, 2026",
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
      { title: "HBM ramp", detail: "HBM3E/HBM4 qualification into AI GPUs is the marquee growth driver and the key margin lever." },
      { title: "Memory cycle & pricing", detail: "DRAM/NAND prices drive the bulk of earnings; supply discipline determines the cycle's shape." },
      { title: "Supply discipline", detail: "The three-player oligopoly's capacity restraint is critical to sustaining the upcycle." },
      { title: "US fab expansion", detail: "CHIPS Act-backed domestic capacity aligns with policy and serves industrial/defense end markets." },
      { title: "End-market mix shift", detail: "Growing data-center, automotive, and industrial demand reduces reliance on consumer memory." },
    ],
    bullCase: [
      "Most direct US-listed play on the AI memory upcycle.",
      "HBM structurally improves memory margins and supply tightness.",
      "Oligopoly discipline supports a longer, healthier pricing cycle.",
      "Mix shift toward data center and industrial reduces commodity exposure.",
    ],
    bearCase: [
      "Memory remains deeply cyclical; downturns can erase profitability.",
      "HBM competition from SK Hynix (leader) and Samsung is intense.",
      "Capital intensity is high and timing capacity is hard.",
      "Pricing can roll over fast if supply discipline breaks.",
    ],
    supplyChain: {
      suppliers: ["ASML / Applied Materials / Lam / KLA (equipment)"],
      customers: ["NVIDIA", "AMD", "Hyperscalers", "Automotive & industrial OEMs"],
      hyperscalers: ["Azure", "AWS", "Google Cloud (via systems)"],
      memory: ["Competes with SK Hynix & Samsung"],
    },
    guidanceCommentary:
      "Watch HBM revenue and qualification updates, DRAM/NAND pricing commentary, bit-shipment and inventory trends, gross-margin trajectory, and capex. Management's read on the cycle and HBM allocation drives the stock.",
    consensusBullThemes: [
      "HBM ramp & margin uplift",
      "Constructive memory pricing cycle",
      "Data-center / industrial mix shift",
    ],
    consensusBearThemes: [
      "Inherent memory cyclicality",
      "HBM competition (SK Hynix lead)",
      "High capital intensity",
    ],
    related: [
      { slug: "skhynix", reason: "Lead HBM competitor" },
      { slug: "samsung", reason: "Memory oligopoly rival" },
      { slug: "nvda", reason: "Key HBM customer" },
      { slug: "asml", reason: "Memory capex / equipment link" },
      { slug: "amd", reason: "HBM customer" },
    ],
    updated: "May 22, 2026",
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
      { title: "18A process execution", detail: "Hitting 18A yields and timeline is the make-or-break milestone for both products and foundry credibility." },
      { title: "Foundry (IFS) traction", detail: "Landing marquee external customers is essential to justify the capex and validate the strategy." },
      { title: "Server share defense", detail: "Stemming x86 losses to AMD (and now Arm) stabilizes the core franchise." },
      { title: "Government & strategic backing", detail: "Policy support and funding aid the turnaround but come with strings and execution expectations." },
      { title: "AI accelerator gap", detail: "Intel's AI silicon trails NVIDIA/AMD significantly — a missing leg in the AI story." },
    ],
    bullCase: [
      "Deep-value turnaround with major optionality if 18A and foundry succeed.",
      "Only credible Western leading-edge foundry alternative — strategically backed.",
      "x86 installed base and enterprise relationships remain large.",
      "Government support de-risks some of the capital burden.",
    ],
    bearCase: [
      "Process and foundry execution risk is high; milestones have slipped before.",
      "Continues losing server share to AMD and increasingly Arm.",
      "AI accelerator efforts are far behind the leaders.",
      "Heavy capex and uncertain returns pressure the balance sheet.",
    ],
    supplyChain: {
      suppliers: ["ASML / Applied Materials / Lam / KLA (equipment)", "TSMC (outsources some tiles)"],
      customers: ["PC & server OEMs", "Prospective foundry customers", "Government / defense"],
      foundry: ["Building Intel Foundry (IFS) for external customers"],
      packaging: ["Foveros / EMIB advanced packaging (in-house)"],
    },
    guidanceCommentary:
      "Watch 18A yield/ramp updates, foundry customer announcements and external revenue, data-center CPU share commentary, gross-margin trajectory, and capex/funding. Milestone progress matters more than near-term EPS.",
    consensusBullThemes: [
      "18A process milestones",
      "Foundry customer wins",
      "Strategic / government backing",
    ],
    consensusBearThemes: [
      "Execution and yield risk",
      "Ongoing server share loss",
      "AI accelerator gap & capex burn",
    ],
    related: [
      { slug: "amd", reason: "Primary x86 share-taker" },
      { slug: "tsm", reason: "Foundry benchmark & partial supplier" },
      { slug: "arm", reason: "Rising threat to x86" },
      { slug: "nvda", reason: "AI-accelerator leader Intel trails" },
      { slug: "asml", reason: "Key equipment supplier for 18A" },
    ],
    updated: "May 22, 2026",
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
      { title: "On-device AI", detail: "Running AI locally on phones and PCs raises silicon content and is Qualcomm's clearest AI angle." },
      { title: "Automotive ramp", detail: "Digital cockpit and ADAS design wins are a large, growing, less-cyclical revenue pool." },
      { title: "PC push (Snapdragon X)", detail: "Arm-based Windows laptops are a new TAM, challenging x86 incumbents on efficiency." },
      { title: "Apple modem risk", detail: "Apple's move to in-house modems is a multi-year headwind to handset revenue." },
      { title: "Licensing (QTL)", detail: "High-margin patent licensing remains a key profit anchor and cash generator." },
    ],
    bullCase: [
      "Leader in efficient on-device AI as inference moves to the edge.",
      "Automotive and PC diversification reduce handset dependence.",
      "High-margin licensing business underpins cash flow.",
      "Reasonable valuation relative to data-center AI peers.",
    ],
    bearCase: [
      "Still heavily exposed to mature, cyclical, China-heavy smartphones.",
      "Apple modem insourcing erodes a meaningful revenue stream.",
      "PC and automotive must scale materially to move the needle.",
      "Licensing faces periodic legal and renewal risk.",
    ],
    supplyChain: {
      suppliers: ["TSMC / Samsung (foundry)", "Arm (CPU IP)"],
      customers: ["Samsung", "Xiaomi / Android OEMs", "Automakers", "PC OEMs"],
      foundry: ["TSMC & Samsung leading-edge nodes"],
    },
    guidanceCommentary:
      "Watch automotive and IoT/PC revenue growth, handset/QCT guidance, licensing (QTL) trends, and any Apple-modem commentary. Diversification metrics matter more than the smartphone print.",
    consensusBullThemes: [
      "On-device AI content growth",
      "Automotive & PC diversification",
      "High-margin licensing cash flow",
    ],
    consensusBearThemes: [
      "Smartphone cyclicality & China exposure",
      "Apple modem insourcing",
      "Execution risk in new markets",
    ],
    related: [
      { slug: "arm", reason: "Core CPU IP licensor" },
      { slug: "avgo", reason: "Wireless & connectivity peer" },
      { slug: "nvda", reason: "Edge vs. data-center AI contrast" },
      { slug: "intc", reason: "x86 PC incumbent it challenges" },
      { slug: "tsm", reason: "Manufactures Snapdragon SoCs" },
    ],
    updated: "May 22, 2026",
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
      { title: "HBM leadership", detail: "First-mover HBM lead and priority supply to NVIDIA is the core franchise advantage and growth driver." },
      { title: "HBM4 transition", detail: "Maintaining the lead through the next HBM generation is critical to sustaining premium economics." },
      { title: "Memory cycle", detail: "DRAM/NAND pricing still drives a large share of earnings and overall cyclicality." },
      { title: "Capacity allocation", detail: "Shifting capacity toward high-value HBM constrains conventional DRAM, affecting pricing across the board." },
      { title: "Customer concentration", detail: "Heavy reliance on NVIDIA HBM demand is both a strength and a concentration risk." },
    ],
    bullCase: [
      "Clear HBM leadership and primary-supplier status to NVIDIA.",
      "HBM economics structurally lift margins above the old memory cycle.",
      "Purest international pure-play on AI memory demand.",
      "Oligopoly discipline supports a healthier pricing environment.",
    ],
    bearCase: [
      "Samsung and Micron are investing aggressively to close the HBM gap.",
      "Core DRAM/NAND remains cyclical and pricing-sensitive.",
      "Concentration in NVIDIA HBM demand is a risk if AI capex digests.",
      "High capital intensity and capacity-timing risk.",
    ],
    supplyChain: {
      suppliers: ["ASML / Applied Materials / Lam / KLA (equipment)"],
      customers: ["NVIDIA (lead HBM)", "AI accelerator & hyperscaler systems"],
      hyperscalers: ["Indirect — via accelerator demand"],
      memory: ["Competes with Samsung & Micron"],
    },
    guidanceCommentary:
      "Watch HBM revenue/share and HBM4 progress, DRAM/NAND pricing, capacity-allocation commentary, and capex. HBM leadership and customer-demand signals are the dominant drivers; note this is a Korea-listed (KRX) name, so figures are in KRW.",
    consensusBullThemes: [
      "HBM leadership & NVIDIA supply",
      "Margin uplift from HBM mix",
      "Constructive memory pricing",
    ],
    consensusBearThemes: [
      "Closing HBM competition",
      "Memory cyclicality",
      "Customer concentration",
    ],
    related: [
      { slug: "mu", reason: "HBM/memory competitor (US-listed)" },
      { slug: "samsung", reason: "Korean memory rival closing HBM gap" },
      { slug: "nvda", reason: "Primary HBM customer" },
      { slug: "asml", reason: "Equipment supplier for memory nodes" },
      { slug: "amd", reason: "HBM accelerator customer" },
    ],
    updated: "May 22, 2026",
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
      { title: "HBM catch-up", detail: "Qualifying HBM into NVIDIA and regaining share is the single biggest swing factor for the AI story." },
      { title: "Foundry vs. TSMC", detail: "Improving leading-edge yields and winning external customers is critical to the foundry turnaround." },
      { title: "Memory cycle", detail: "DRAM/NAND pricing drives a large part of earnings and overall cyclicality." },
      { title: "Diversification & focus", detail: "Breadth across memory, foundry, and devices provides ballast but raises focus and capital-allocation questions." },
      { title: "Capex intensity", detail: "Funding both memory and foundry leadership simultaneously is enormously capital-intensive." },
    ],
    bullCase: [
      "Only player that is both a top-three memory maker and a leading-edge foundry.",
      "HBM qualification into NVIDIA would be a major re-rating catalyst.",
      "Scale and balance sheet to invest through cycles on every front.",
      "Diversified earnings provide downside ballast.",
    ],
    bearCase: [
      "Lagging HBM position behind SK Hynix in the key AI niche.",
      "Foundry yields and customer wins trail TSMC materially.",
      "Fighting on multiple fronts strains focus and capital.",
      "Memory cyclicality and consumer-device exposure add volatility.",
    ],
    supplyChain: {
      suppliers: ["ASML / Applied Materials / Lam / KLA (equipment)"],
      customers: ["NVIDIA (HBM target)", "Foundry customers", "Device & component buyers"],
      foundry: ["Competes with TSMC for leading-edge logic"],
      memory: ["Competes with SK Hynix & Micron"],
    },
    guidanceCommentary:
      "Watch HBM qualification/share commentary, foundry yield and customer updates, DRAM/NAND pricing, and segment capex. HBM and foundry milestones drive sentiment; note this is a Korea-listed (KRX) name reported in KRW.",
    consensusBullThemes: [
      "HBM qualification catalyst",
      "Foundry turnaround optionality",
      "Diversified scale & balance sheet",
    ],
    consensusBearThemes: [
      "HBM share lag",
      "Foundry yield gap vs. TSMC",
      "Multi-front capex strain",
    ],
    related: [
      { slug: "skhynix", reason: "Korean memory & HBM rival (ahead in HBM)" },
      { slug: "mu", reason: "Memory competitor" },
      { slug: "tsm", reason: "Foundry leader Samsung challenges" },
      { slug: "asml", reason: "Equipment supplier for memory & foundry" },
      { slug: "nvda", reason: "Target HBM customer" },
    ],
    updated: "May 22, 2026",
  },
};

export function getEditorial(slug: string): CompanyEditorial | undefined {
  return EDITORIAL[slug.toLowerCase()];
}
