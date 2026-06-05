/**
 * Converts raw source slugs (from filenames) into clean display names.
 */

const SOURCE_MAP: Record<string, string> = {
  "invest like the best": "Invest Like the Best",
  "capital allocators": "Capital Allocators",
  "all-in": "All-In Podcast",
  "all in": "All-In Podcast",
  "invested": "Invested Podcast",
  "a16z": "a16z Podcast",
};

export function formatSourceName(raw: string): string {
  const lower = raw.toLowerCase();
  for (const [key, display] of Object.entries(SOURCE_MAP)) {
    if (lower.includes(key)) return display;
  }
  return raw
    .replace(/\b(Ai|Api|Gpu|Cpu|Hbm|Tpu|Llm|Rag)\b/g, (m) => m.toUpperCase())
    .replace(/\s+/g, " ")
    .trim();
}
