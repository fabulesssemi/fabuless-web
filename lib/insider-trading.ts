export type ConvictionLevel = "VERY HIGH" | "HIGH" | "MOD-HIGH" | "MODERATE" | "AVOID" | "CAUTIOUS";

export interface WatchlistItem {
  rank: number;
  ticker: string;
  company: string;
  price: string;
  signal: string;
  lastInsiderBuy: string;
  stillOpen: boolean;
  conviction: ConvictionLevel;
  thesis: string;
  stars: number;
}

export interface RedFlag {
  ticker: string;
  company: string;
  severity: "STRONG AVOID" | "AVOID" | "CAUTIOUS";
  signal: string;
}

export interface InsiderTradingData {
  generatedDate: string;
  lookbackWindow: string;
  executiveSummary: string;
  watchlist: WatchlistItem[];
  redFlags: RedFlag[];
}

export const insiderTradingData: InsiderTradingData = {
  generatedDate: "2026-05-27",
  lookbackWindow: "May 13–27, 2026",
  executiveSummary:
    "The 2-week window was nearly devoid of open-market buys across the semi/semi-cap universe. Every large name had insiders selling — mostly pre-planned 10b5-1 programs triggered by recent stock appreciation. The only true open-market purchase: TSM VP Bor-Zen Tien bought ~$140K of ADS on May 19. The highest-conviction signals are from Q4 2025–Q1 2026 and have largely played out at extraordinary magnitude (INTC CFO +190%, MU Director +172%, LSCC CEO +138%). Today (May 27) is an explosive tape: MU +26%, MRVL +10% into earnings, KLAC $2,011 — compressing risk/reward on chasing.",
  watchlist: [
    {
      rank: 1,
      ticker: "INTC",
      company: "Intel",
      price: "~$123",
      signal: "CFO David Zinsner paid $250K of his own money at $42.50 (Jan 2026). He bought near a multi-year low, the stock has tripled, and he has NOT sold.",
      lastInsiderBuy: "$250K @ $42.50 (Jan 2026)",
      stillOpen: true,
      conviction: "HIGH",
      thesis: "Intel Foundry turnaround (18A node, Microsoft win). Lip-Bu Tan restructuring. Cost reduction program $10B+. CFO conviction buy + fundamental turnaround still early-innings.",
      stars: 5,
    },
    {
      rank: 2,
      ticker: "MU",
      company: "Micron",
      price: "~$916 (+26% today)",
      signal: "Director Liu Teyin bought $7.82M at avg $337 (Jan 2026) — the largest dollar-value open-market purchase in the coverage universe in the last 6 months. Has NOT sold.",
      lastInsiderBuy: "$7.8M @ $337 (Jan 2026)",
      stillOpen: true,
      conviction: "VERY HIGH",
      thesis: "HBM3E/HBM4 supply constrained through 2026. AI training clusters consuming every GB of HBM available. DRAM pricing cycle turning positive. Watch $780–820 for better entry after today's move.",
      stars: 5,
    },
    {
      rank: 3,
      ticker: "LSCC",
      company: "Lattice Semiconductor",
      price: "~$150",
      signal: "CEO Fouad Tamer bought $1.89M in two tranches at ~$63 (Nov 2025). Stock +138%. CEO sold some at $90 but still holds a large position.",
      lastInsiderBuy: "$1.9M @ $63 (Nov 2025)",
      stillOpen: true,
      conviction: "MOD-HIGH",
      thesis: "Low-power FPGA demand recovering in data center power management, AI edge inference, and automotive. LSCC is a lower-ASP FPGA play with better power efficiency for inference.",
      stars: 4,
    },
    {
      rank: 4,
      ticker: "TSM",
      company: "Taiwan Semiconductor (ADR)",
      price: "~$400 ADS",
      signal: "VP Bor-Zen Tien bought ~17 ADS ($140K) on May 19 — the only true open-market purchase in the 2-week window across the entire semi universe.",
      lastInsiderBuy: "$140K (May 19, 2026)",
      stillOpen: true,
      conviction: "MODERATE",
      thesis: "TSMC is the single most critical node in the semiconductor supply chain. N3/N2 demand fully booked through 2026–2027. Pricing power improving. Arizona fabs coming online.",
      stars: 3,
    },
    {
      rank: 5,
      ticker: "ONTO",
      company: "Onto Innovation",
      price: "~$105",
      signal: "CEO Plisinski exercised options in Mar 2026 and did NOT sell the shares — constructive signal of price confidence. No insider selling in 2026.",
      lastInsiderBuy: "Option exercise held (Mar 2026)",
      stillOpen: true,
      conviction: "MODERATE",
      thesis: "Growing exposure to advanced packaging (HBM inspection, CoWoS) and epitaxy monitoring. As packaging complexity increases with HBM4 and chiplets, ONTO's tools become critical quality gates.",
      stars: 3,
    },
    {
      rank: 6,
      ticker: "AVGO",
      company: "Broadcom",
      price: "~$370",
      signal: "Director You Harry L. bought 1,000 shares at $325 (Dec 2025) while CEO Hock Tan was selling hundreds of millions — a contrarian insider signal.",
      lastInsiderBuy: "$325K @ $325 (Dec 2025)",
      stillOpen: true,
      conviction: "MODERATE",
      thesis: "Custom ASIC franchise for hyperscalers (Google TPU, Meta MTIA) is the highest-quality revenue stream in semi. VMware integration adds $15B+ at improving margins.",
      stars: 3,
    },
    {
      rank: 7,
      ticker: "SNPS",
      company: "Synopsys",
      price: "~$470",
      signal: "Director Robert Painter bought $149K at $425 (Sep 2025). May 2026: only option exercises, no sales. CEO/Executive Chair exercising without selling = accumulating equity.",
      lastInsiderBuy: "$149K @ $425 (Sep 2025)",
      stillOpen: true,
      conviction: "MODERATE",
      thesis: "EDA duopoly with structural pricing power. AI chip complexity is a direct tailwind — every new GPU, custom ASIC, and advanced node SoC requires more EDA tool-hours.",
      stars: 3,
    },
    {
      rank: 8,
      ticker: "NVDA",
      company: "NVIDIA",
      price: "$214",
      signal: "CEO Jensen Huang last sold at $207 in Oct 2025 — 7 months ago. With stock at $214 (above his last sale), Jensen is holding. No insider activity in last 2 weeks.",
      lastInsiderBuy: "No buys (scheduled sales only)",
      stillOpen: true,
      conviction: "MODERATE",
      thesis: "Blackwell architecture ramp (GB200/GB300), NVLink fabric, CUDA software moat. Every hyperscaler, sovereign AI program, and enterprise build-out requires NVDA at the compute layer.",
      stars: 2,
    },
    {
      rank: 9,
      ticker: "AMAT",
      company: "Applied Materials",
      price: "~$453",
      signal: "No large directional exits in 2 weeks. CFO last sold $1.8M at $361 in February — now $453, suggesting he is letting the position run.",
      lastInsiderBuy: "No buys",
      stillOpen: false,
      conviction: "MODERATE",
      thesis: "Most diversified semi-cap equipment name. Advanced packaging, gate-all-around transistors, and DRAM upgrades all AMAT-intensive. Second derivative of the HBM cycle playing through now.",
      stars: 2,
    },
    {
      rank: 10,
      ticker: "MRVL",
      company: "Marvell Technology",
      price: "~$221",
      signal: "CEO Murphy sold at $177 (May 13) and CFO sold at $175 (May 15). Stock now at $221 — executives sold $44 below today's price. Reports earnings tonight.",
      lastInsiderBuy: "No buys",
      stillOpen: false,
      conviction: "MODERATE",
      thesis: "#2 custom ASIC player for AI data centers (behind AVGO), with Amazon Trainium and Google TPU design wins. 800G/1.6T networking silicon. Earnings event tonight.",
      stars: 2,
    },
  ],
  redFlags: [
    {
      ticker: "ARM",
      company: "Arm Holdings",
      severity: "STRONG AVOID",
      signal:
        "CLO, CPO, and Chief Architect all liquidated ENTIRE positions (0 shares remaining) in May as stock ran from $160 to $305. Four C-suite officers exiting simultaneously at 50x+ revenue is textbook distribution.",
    },
    {
      ticker: "ACLS",
      company: "Axcelis Technologies",
      severity: "AVOID",
      signal:
        "Nine insiders sold in a 10-day window (May 12–22): CEO, Controller, EVP Operations, EVP Marketing, EVP R&D, EVP Customer Ops, EVP GC, and four directors. The most concentrated cluster sell in the data set.",
    },
    {
      ticker: "MKSI",
      company: "MKS Instruments",
      severity: "CAUTIOUS",
      signal:
        "CEO and CFO both sold $3M+ each on the same day (May 22). Consistent pattern of selling on strength — CEO sold at $256 in Feb, now again at $315. $2B+ debt from CMC acquisition still on balance sheet.",
    },
    {
      ticker: "AMD",
      company: "Advanced Micro Devices",
      severity: "CAUTIOUS",
      signal:
        "Lisa Su sold $55.7M at $445 (May 13) — largest single-day insider sale in the coverage universe. Three other executives sold $21M+ in May. Almost certainly 10b5-1 but scale limits near-term upside.",
    },
    {
      ticker: "ENTG",
      company: "Entegris",
      severity: "CAUTIOUS",
      signal:
        "Executive Chair Loy has been serially selling throughout 2025–2026 ($6.4M April, $4.4M April, $7.8M February). No counterbalancing buys. Consistent selling on every rebound since 2024.",
    },
  ],
};
