import { unstable_cache } from "next/cache";
import YahooFinance from "yahoo-finance2";
import { COMPANY_UNIVERSE } from "@/lib/companies";

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
  { id: "arya",    name: "Vivek Arya",      firm: "B of A Securities",   firmDisplay: "BofA Securities",      title: "Managing Director", knownFor: "NVDA, AMD, AVGO bull — AI infrastructure supply chain",       accent: "#C0392B" },
  { id: "moore",   name: "Joseph Moore",    firm: "Morgan Stanley",      firmDisplay: "Morgan Stanley",       title: "Managing Director", knownFor: "Memory cycle specialist — MU, SKHYNIX, HBM dynamics",          accent: "#1A5276" },
  { id: "rasgon",  name: "Stacy Rasgon",    firm: "Bernstein",           firmDisplay: "Bernstein",            title: "Senior Analyst",    knownFor: "Bearish contrarian — known for early cycle calls on INTC/QCOM", accent: "#145A32" },
  { id: "rolland", name: "Pierre Ferragu",  firm: "New Street Research", firmDisplay: "New Street Research",  title: "Partner",           knownFor: "NVDA mega-bull — GPU compute buildout thesis",                  accent: "#6C3483" },
  { id: "lu",      name: "C.J. Muse",       firm: "Cantor Fitzgerald",   firmDisplay: "Cantor Fitzgerald",    title: "Senior Analyst",    knownFor: "ASML, litho equipment — EUV cycle and wafer starts",            accent: "#1F618D" },
  { id: "lurie",   name: "Chris Caso",      firm: "Wolfe Research",      firmDisplay: "Wolfe Research",       title: "Managing Director", knownFor: "QCOM, INTC — mobile/PC cycle and foundry strategy",             accent: "#784212" },
  { id: "mcneill", name: "Harlan Sur",      firm: "JP Morgan",           firmDisplay: "JP Morgan",            title: "Managing Director", knownFor: "Broad semi coverage — MRVL, AVGO, NVDA",                       accent: "#17202A" },
  { id: "pitzer",  name: "Matt Ramsay",     firm: "TD Cowen",            firmDisplay: "TD Cowen",             title: "Managing Director", knownFor: "AMD deep-dive — Instinct MI series vs NVDA competitive calls",  accent: "#0E6655" },
  { id: "egan",    name: "Timothy Arcuri",  firm: "UBS",                 firmDisplay: "UBS",                  title: "Managing Director", knownFor: "TSM, ASML — leading-edge fab economics and capex cycles",       accent: "#1A5276" },
  { id: "mehdi",   name: "Toshiya Hari",    firm: "Goldman Sachs",       firmDisplay: "Goldman Sachs",        title: "Managing Director", knownFor: "NVDA, ARM — data center and edge AI silicon",                   accent: "#2874A6" },
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

// Broad semiconductor + adjacent universe for analyst coverage lookup
const COVERAGE_UNIVERSE = [
  // Core semi
  "NVDA","AMD","AVGO","MRVL","TSM","ASML","ARM","MU","INTC","QCOM",
  // Equipment
  "AMAT","LRCX","KLAC","ENTG","MKSI","ACLS","ICHR","ONTO","FORM","COHU",
  // Analog / mixed-signal
  "TXN","ADI","MCHP","ON","MPWR","SLAB","SWKS","QRVO","CRUS","MTSI",
  // EDA / IP
  "SNPS","CDNS",
  // Test & measurement
  "TER","KEYS",
  // Memory adjacents
  "WOLF","AMKR","ASX",
];

async function fetchAnalystCoverageRaw(): Promise<AnalystWithCoverage[]> {
  const tickers = COVERAGE_UNIVERSE;
  // Name map: prefer COMPANY_UNIVERSE names, fall back to ticker
  const nameByTicker = new Map(COMPANY_UNIVERSE.map((c) => [c.ticker, c.name]));
  const STALE_CUTOFF = new Date(Date.now() - 18 * 30 * 24 * 60 * 60 * 1000);

  // Fetch history + current price for every ticker in parallel
  const results = await Promise.allSettled(
    tickers.map((t) =>
      yf.quoteSummary(t, { modules: ["upgradeDowngradeHistory", "financialData"] }).then((r: any) => ({
        ticker: t,
        currentPrice: (r.financialData?.currentPrice ?? null) as number | null,
        history: (r.upgradeDowngradeHistory?.history ?? []) as Array<{
          epochGradeDate: Date;
          firm: string;
          toGrade: string;
          currentPriceTarget?: number;
          action: string;
        }>,
      }))
    )
  );

  const byFirm = new Map<string, Map<string, AnalystCoverage>>();
  const currentPrices = new Map<string, number | null>();

  for (const result of results) {
    if (result.status !== "fulfilled") continue;
    const { ticker, currentPrice, history } = result.value;
    currentPrices.set(ticker, currentPrice);
    const companyName = nameByTicker.get(ticker) ?? ticker;

    for (const entry of history) {
      if (!entry.firm || !entry.toGrade) continue;
      if (entry.epochGradeDate && new Date(entry.epochGradeDate) < STALE_CUTOFF) continue;
      if (!byFirm.has(entry.firm)) byFirm.set(entry.firm, new Map());
      const firmMap = byFirm.get(entry.firm)!;
      if (!firmMap.has(ticker)) {
        const pt = entry.currentPriceTarget ?? null;
        const cp = currentPrice;
        const upside = pt && cp ? Math.round(((pt - cp) / cp) * 1000) / 10 : null;
        firmMap.set(ticker, {
          ticker,
          name: companyName,
          rating: entry.toGrade,
          priceTarget: pt,
          currentPrice: cp,
          upsidePct: upside,
          priceTargetDate: entry.epochGradeDate
            ? new Date(entry.epochGradeDate).toISOString().slice(0, 10)
            : null,
          action: entry.action,
        });
      }
    }
  }

  return WALL_STREET_ANALYSTS.map((analyst) => ({
    ...analyst,
    coverage: Array.from(byFirm.get(analyst.firm)?.values() ?? []).sort((a, b) => {
      // Sort by date descending
      if (!a.priceTargetDate) return 1;
      if (!b.priceTargetDate) return -1;
      return b.priceTargetDate.localeCompare(a.priceTargetDate);
    }),
  }));
}

export const fetchAnalystCoverage = unstable_cache(fetchAnalystCoverageRaw, ["analyst-coverage"], {
  revalidate: 3600,
});
