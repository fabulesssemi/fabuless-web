import { unstable_cache } from "next/cache";
import YahooFinance from "yahoo-finance2";
import { COMPANY_UNIVERSE } from "@/lib/companies";
import priceTargets from "./price-targets.json";

const yf = new YahooFinance({ suppressNotices: ["yahooSurvey"] });

export interface WallStreetAnalyst {
  id: string;
  name: string;
  firm: string;
  firmDisplay: string;
  title: string;
  knownFor: string;
  accent: string;
}

export const WALL_STREET_ANALYSTS: WallStreetAnalyst[] = [
  { id: "arya",    name: "Vivek Arya",      firm: "B of A Securities",   firmDisplay: "BofA Securities",      title: "Managing Director", knownFor: "AI infrastructure bull covering NVDA, AMD, and AVGO",              accent: "#C0392B" },
  { id: "moore",   name: "Joseph Moore",    firm: "Morgan Stanley",      firmDisplay: "Morgan Stanley",       title: "Managing Director", knownFor: "Memory cycle specialist focused on MU, SK Hynix, and HBM",         accent: "#1A5276" },
  { id: "rasgon",  name: "Stacy Rasgon",    firm: "Bernstein",           firmDisplay: "Bernstein",            title: "Senior Analyst",    knownFor: "Bearish contrarian known for early cycle calls on INTC and QCOM",  accent: "#145A32" },
  { id: "mcneill", name: "Harlan Sur",      firm: "JP Morgan",           firmDisplay: "JP Morgan",            title: "Managing Director", knownFor: "Broad semi coverage with focus on MRVL, AVGO, and NVDA",           accent: "#17202A" },
  { id: "lu",      name: "C.J. Muse",       firm: "Cantor Fitzgerald",   firmDisplay: "Cantor Fitzgerald",    title: "Senior Analyst",    knownFor: "Equipment specialist covering ASML, litho, and EUV cycle dynamics", accent: "#1F618D" },
  { id: "lurie",   name: "Chris Caso",      firm: "Wolfe Research",      firmDisplay: "Wolfe Research",       title: "Managing Director", knownFor: "Mobile and PC cycle analyst covering QCOM, INTC, and foundry",     accent: "#784212" },
  { id: "rolland", name: "Pierre Ferragu",  firm: "New Street Research", firmDisplay: "New Street Research",  title: "Partner",           knownFor: "NVDA mega-bull behind the GPU compute buildout thesis",            accent: "#6C3483" },
  { id: "egan",    name: "Timothy Arcuri",  firm: "UBS",                 firmDisplay: "UBS",                  title: "Managing Director", knownFor: "Leading-edge fab economist covering TSM, ASML, and capex cycles",  accent: "#1A5276" },
  { id: "omalley", name: "Thomas O'Malley", firm: "Barclays",            firmDisplay: "Barclays",             title: "Managing Director", knownFor: "Barclays semiconductor equity research",                           accent: "#00AEEF" },
];

export interface AnalystCoverage {
  ticker: string;
  name: string;
  rating: string;
  priceTarget: number | null;
  currentPrice: number | null;
  upsidePct: number | null;
  priceTargetDate: string | null;
  action: string;
}

export interface AnalystWithCoverage extends WallStreetAnalyst {
  coverage: AnalystCoverage[];
}

const ACTION_LABEL: Record<string, string> = {
  init:   "Initiated",
  up:     "Upgraded",
  down:   "Downgraded",
  main:   "Maintained",
  reit:   "Reiterated",
  resume: "Resumed",
};

export function actionLabel(action: string): string {
  return ACTION_LABEL[action] ?? "Assigned";
}

// Build a merged name map: start from COMPANY_UNIVERSE then overlay curated names.
// Curated names win so we always display the correct full company name.
const _universeNames = new Map(COMPANY_UNIVERSE.map((c) => [c.ticker, c.name]));
const _CURATED: Record<string, string> = {
  NVDA: "NVIDIA", MU:   "Micron", ARM:  "Arm Holdings", QCOM: "Qualcomm",
  INTC: "Intel",  AVGO: "Broadcom", MRVL: "Marvell",
  AMD:  "Advanced Micro Devices", ADI:  "Analog Devices", AMBA: "Ambarella",
  SNPS: "Synopsys", CDNS: "Cadence Design", TXN:  "Texas Instruments",
  ON:   "ON Semiconductor", AMAT: "Applied Materials", MCHP: "Microchip Technology",
  GFS:  "GlobalFoundries", KLAC: "KLA Corporation", TER:  "Teradyne",
  NXPI: "NXP Semiconductors", LRCX: "Lam Research", SWKS: "Skyworks Solutions",
  CRDO: "Credo Technology", ALAB: "Astera Labs", LITE: "Lumentum",
  MTSI: "MACOM Technology", COHR: "Coherent Corp", NVMI: "Nova",
  MKSI: "MKS Instruments", CAMT: "Camtek", CBRS: "Cerebras Systems",
  SNDK: "SanDisk", SMTC: "Semtech", IONQ: "IonQ",
  NVTS: "Navitas Semiconductor", AMKR: "Amkor Technology", QRVO: "Qorvo",
  ALGM: "Allegro MicroSystems", AEVA: "Aeva Technologies",
  ASML: "ASML", TSM: "TSMC",
  WDC:  "Western Digital", STX:  "Seagate Technology",
  ENTG: "Entegris", SITM: "SiTime", UCTT: "Ultra Clean Holdings",
  PI:   "Impinj", AMBQ: "Ambiq Micro",
};

function companyName(ticker: string): string {
  return _CURATED[ticker] ?? _universeNames.get(ticker) ?? ticker;
}

async function fetchAnalystCoverageRaw(): Promise<AnalystWithCoverage[]> {
  // Collect unique tickers across all manual entries
  const uniqueTickers = [...new Set(priceTargets.targets.map((t) => t.ticker))];

  // Fetch only current price — no upgradeDowngradeHistory needed
  const priceResults = await Promise.allSettled(
    uniqueTickers.map((ticker) =>
      yf.quoteSummary(ticker, { modules: ["financialData"] }).then((r: any) => ({
        ticker,
        currentPrice: (r.financialData?.currentPrice ?? null) as number | null,
      }))
    )
  );

  const currentPrices = new Map<string, number | null>();
  for (const result of priceResults) {
    if (result.status === "fulfilled") {
      currentPrices.set(result.value.ticker, result.value.currentPrice);
    }
  }

  return WALL_STREET_ANALYSTS.map((analyst) => {
    const entries = priceTargets.targets.filter((t) => t.analyst === analyst.id);
    const coverage: AnalystCoverage[] = entries.map((entry) => {
      const pt = entry.priceTarget;
      const cp = currentPrices.get(entry.ticker) ?? null;
      const upsidePct = pt && cp ? Math.round(((pt - cp) / cp) * 1000) / 10 : null;
      return {
        ticker: entry.ticker,
        name: companyName(entry.ticker),
        rating: entry.rating,
        priceTarget: pt,
        currentPrice: cp,
        upsidePct,
        priceTargetDate: entry.date,
        action: entry.action,
      };
    });

    // Sort by date descending
    coverage.sort((a, b) => {
      if (!a.priceTargetDate) return 1;
      if (!b.priceTargetDate) return -1;
      return b.priceTargetDate.localeCompare(a.priceTargetDate);
    });

    return { ...analyst, coverage };
  });
}

export const fetchAnalystCoverage = unstable_cache(fetchAnalystCoverageRaw, ["analyst-coverage-v4"], {
  revalidate: 3600,
});
