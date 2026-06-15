// Identity colors for chart lines — NOT the green/red data-encoding system.
// Purely to differentiate one holding's line from another. Shared between the
// chart and the table so the same ticker is always the same color in both.

export const LINE_COLORS = [
  "#2563EB", // blue
  "#D97706", // amber
  "#7C3AED", // violet
  "#0891B2", // cyan
  "#DB2777", // pink
  "#65A30D", // lime
  "#EA580C", // orange
  "#4F46E5", // indigo
  "#0D9488", // teal
  "#C026D3", // fuchsia
  "#CA8A04", // gold
  "#0369A1", // sky
];

// Deterministic color for a ticker, based on its position in the holdings list.
export function colorForIndex(i: number): string {
  return LINE_COLORS[i % LINE_COLORS.length];
}

// Build a ticker → color map from an ordered list of tickers.
export function buildColorMap(tickers: string[]): Record<string, string> {
  const map: Record<string, string> = {};
  tickers.forEach((t, i) => { map[t] = colorForIndex(i); });
  return map;
}

export const SPX_COLOR = "#9CA3AF";
