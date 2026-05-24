import type { ReactNode } from "react";

// ---------------------------------------------------------------------------
// Formatters
// ---------------------------------------------------------------------------
export function fmtMarketCap(n?: number, currency = "USD"): string {
  if (n == null) return "—";
  const sym = currency === "KRW" ? "₩" : "$";
  if (n >= 1e12) return `${sym}${(n / 1e12).toFixed(2)}T`;
  if (n >= 1e9) return `${sym}${(n / 1e9).toFixed(1)}B`;
  if (n >= 1e6) return `${sym}${(n / 1e6).toFixed(1)}M`;
  return `${sym}${n.toLocaleString()}`;
}

export function fmtPrice(n?: number, currency = "USD"): string {
  if (n == null) return "—";
  try {
    return n.toLocaleString("en-US", { style: "currency", currency });
  } catch {
    return `${n.toFixed(2)}`;
  }
}

// fraction (0.69) -> "69%" or "+69%"
export function fmtFraction(frac?: number, withSign = false): string {
  if (frac == null) return "—";
  const pct = frac * 100;
  const sign = withSign && pct > 0 ? "+" : "";
  return `${sign}${pct.toFixed(1)}%`;
}

// already a percent (2.7) -> "+2.7%"
export function fmtPercent(pct?: number, withSign = true): string {
  if (pct == null) return "—";
  const sign = withSign && pct > 0 ? "+" : "";
  return `${sign}${pct.toFixed(2)}%`;
}

export function changeTone(n?: number): string {
  if (n == null) return "text-gray-400";
  return n > 0 ? "text-emerald-600" : n < 0 ? "text-rose-600" : "text-gray-400";
}

export function displayTicker(ticker: string): string {
  return ticker.includes(".") ? ticker.replace(".", " ") : ticker;
}

export function timeAgo(iso?: string): string {
  if (!iso) return "";
  const then = new Date(iso).getTime();
  if (isNaN(then)) return "";
  const mins = Math.round((Date.now() - then) / 60000);
  if (mins < 60) return `${Math.max(1, mins)}m ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.round(hrs / 24);
  return `${days}d ago`;
}

// ---------------------------------------------------------------------------
// Layout primitives
// ---------------------------------------------------------------------------

// Section — no card border. Just typography + thin rule.
export function Section({
  title,
  eyebrow,
  children,
  className = "",
}: {
  title: string;
  eyebrow?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={className}>
      <div className="mb-5">
        {eyebrow && (
          <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#B45309] mb-0.5">
            {eyebrow}
          </div>
        )}
        <h2 className="font-serif text-[1.05rem] font-semibold text-gray-900 tracking-tight">
          {title}
        </h2>
        <div className="mt-3 h-px bg-gray-100" />
      </div>
      {children}
    </section>
  );
}

// Pill — minimal, no border. Light background tint only.
export function Pill({
  children,
  tone = "neutral",
}: {
  children: ReactNode;
  tone?: "neutral" | "amber" | "emerald" | "rose" | "cyan";
}) {
  const tones: Record<string, string> = {
    neutral: "bg-gray-100 text-gray-600",
    amber:   "bg-amber-50 text-amber-700",
    emerald: "bg-teal-50 text-teal-700",
    rose:    "bg-rose-50 text-rose-700",
    cyan:    "bg-sky-50 text-sky-700",
  };
  return (
    <span className={`inline-flex items-center rounded px-2 py-0.5 text-xs font-medium ${tones[tone]}`}>
      {children}
    </span>
  );
}

// Stat — label / value pair. No box, no border.
export function Stat({
  label,
  value,
  tone,
}: {
  label: string;
  value: ReactNode;
  tone?: string;
}) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wider text-gray-400 mb-0.5">
        {label}
      </div>
      <div className={`text-sm font-semibold tabular-nums ${tone ?? "text-gray-900"}`}>
        {value}
      </div>
    </div>
  );
}

// ChipGroup — plain comma-separated text, no badge spam.
export function ChipGroup({
  label,
  items,
}: {
  label: string;
  items?: string[];
  tone?: string; // kept for API compat, unused
}) {
  if (!items || items.length === 0) return null;
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wider text-gray-400 mb-1">
        {label}
      </div>
      <p className="text-[13px] text-gray-600 leading-relaxed">
        {items.join(", ")}
      </p>
    </div>
  );
}

export function Unavailable({ what }: { what: string }) {
  return (
    <p className="text-sm text-gray-400 italic">
      {what} temporarily unavailable.
    </p>
  );
}
