// Brand colors — each ticker gets its real logo/brand color.
// Fallback palette is used for unknown tickers.
export const BRAND_COLORS: Record<string, string> = {
  // Chip designers
  NVDA:    "#76B900", // NVIDIA green
  AMD:     "#ED1C24", // AMD red
  QCOM:    "#3253DC", // Qualcomm blue
  AVGO:    "#CC0000", // Broadcom red
  MRVL:    "#005EB8", // Marvell blue
  ARM:     "#0091BD", // Arm blue
  INTC:    "#0068B5", // Intel blue
  ALAB:    "#6D28D9", // Astera Labs purple
  // Foundry & Memory
  TSM:     "#1B6B3A", // TSMC green
  MU:      "#005EB8", // Micron blue
  "000660.KS": "#1428A0", // SK Hynix blue
  "005930.KS": "#1428A0", // Samsung blue
  GFS:     "#E87722", // GlobalFoundries orange
  // Equipment
  AMAT:    "#F36F21", // Applied Materials orange
  LRCX:    "#C8102E", // Lam Research red
  KLAC:    "#005DAA", // KLA blue
  "8035.T":"#E60012", // Tokyo Electron red
  BESI:    "#003082", // BE Semiconductor blue
  ASML:    "#0071B9", // ASML blue
  // Packaging
  ASX:     "#007DC5", // ASE blue
  AMKR:    "#003087", // Amkor blue
  "2317.TW":"#E2231A", // Foxconn red
  // EDA
  SNPS:    "#6E2B8B", // Synopsys purple
  CDNS:    "#E31B23", // Cadence red
  // Optical / Networking
  COHR:    "#0057A8", // Coherent blue
  LITE:    "#0075BE", // Lumentum blue
  FN:      "#003087", // Fabrinet blue
  ANET:    "#007DC5", // Arista blue
  // Infrastructure / Servers
  SMCI:    "#CC0000", // Supermicro red
  DELL:    "#007DB8", // Dell blue
  // Hyperscalers
  AAPL:    "#555555", // Apple gray
  GOOGL:   "#4285F4", // Google blue
  GOOG:    "#4285F4",
  AMZN:    "#FF9900", // Amazon orange
  MSFT:    "#00A4EF", // Microsoft blue
  META:    "#1877F2", // Meta blue
  ORCL:    "#C74634", // Oracle red
  CRWV:    "#7C3AED", // CoreWeave purple
  // Other common semis
  TXN:     "#C8102E", // TI red
  ON:      "#005EB8", // onsemi blue
  MCHP:    "#DD1921", // Microchip red
  SWKS:    "#0057A8", // Skyworks blue
  QRVO:    "#E87722", // Qorvo orange
  MPWR:    "#003087", // Monolithic Power blue
  WOLF:    "#6D28D9", // Wolfspeed purple
  PI:      "#00796B", // Impinj teal
  FORM:    "#E31B23", // FormFactor red
  ENTG:    "#005DAA", // Entegris blue
  ACLS:    "#F36F21", // Axcelis orange
  ONTO:    "#003082", // Onto Innovation blue
  CAMT:    "#76B900", // Camtek green
  MKSI:    "#0091BD", // MKS Instruments cyan
  AMBA:    "#C8102E", // Ambarella red
  NVEC:    "#6D28D9", // NVE Corp purple
  SITM:    "#005EB8", // SiTime blue
  ALGM:    "#E87722", // Allegro orange
  OLED:    "#7C3AED", // Universal Display purple
  IPGP:    "#007DC5", // IPG Photonics blue
  IIVI:    "#0057A8",
  "4063.T":"#E60012", // Shin-Etsu red
  "3436.T":"#003082", // SUMCO blue
};

// Fallback palette for tickers not in BRAND_COLORS.
const FALLBACK_COLORS = [
  "#6B7280", "#92400E", "#065F46", "#1E3A5F", "#4C1D95",
  "#7F1D1D", "#064E3B", "#1E1B4B", "#713F12", "#134E4A",
];

export function colorForTicker(ticker: string, fallbackIndex: number): string {
  return BRAND_COLORS[ticker] ?? FALLBACK_COLORS[fallbackIndex % FALLBACK_COLORS.length];
}

// Build a ticker → color map. Brand colors take priority; unknowns get fallback palette.
export function buildColorMap(tickers: string[]): Record<string, string> {
  const map: Record<string, string> = {};
  let fallbackIdx = 0;
  tickers.forEach((t) => {
    map[t] = colorForTicker(t, fallbackIdx);
    if (!BRAND_COLORS[t]) fallbackIdx++;
  });
  return map;
}

// Keep colorForIndex for any legacy call sites
export function colorForIndex(i: number): string {
  return FALLBACK_COLORS[i % FALLBACK_COLORS.length];
}

export const LINE_COLORS = Object.values(BRAND_COLORS);
export const SPX_COLOR = "#9CA3AF";
