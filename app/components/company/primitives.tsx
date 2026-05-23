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
    return n.toLocaleString("en-US", {
      style: "currency",
      currency,
    });
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
  if (n == null) return "text-slate-400";
  return n > 0 ? "text-emerald-400" : n < 0 ? "text-rose-400" : "text-slate-400";
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
// Layout primitives (dark "intelligence product" surface)
// ---------------------------------------------------------------------------
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
    <section
      className={`rounded-2xl border border-white/10 bg-white/[0.02] p-6 ${className}`}
    >
      <div className="mb-4">
        {eyebrow && (
          <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-amber-400/80">
            {eyebrow}
          </div>
        )}
        <h2 className="font-serif text-xl text-white tracking-tight">{title}</h2>
      </div>
      {children}
    </section>
  );
}

export function Pill({
  children,
  tone = "neutral",
}: {
  children: ReactNode;
  tone?: "neutral" | "amber" | "emerald" | "rose" | "cyan";
}) {
  const tones: Record<string, string> = {
    neutral: "bg-white/5 text-slate-300 border-white/10",
    amber: "bg-amber-400/10 text-amber-300 border-amber-400/20",
    emerald: "bg-emerald-400/10 text-emerald-300 border-emerald-400/20",
    rose: "bg-rose-400/10 text-rose-300 border-rose-400/20",
    cyan: "bg-cyan-400/10 text-cyan-300 border-cyan-400/20",
  };
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${tones[tone]}`}
    >
      {children}
    </span>
  );
}

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
      <div className="text-[11px] uppercase tracking-wider text-slate-500">
        {label}
      </div>
      <div className={`text-sm font-semibold ${tone ?? "text-slate-100"}`}>
        {value}
      </div>
    </div>
  );
}

// A labelled group of chips, used throughout the supply-chain section.
export function ChipGroup({
  label,
  items,
  tone = "neutral",
}: {
  label: string;
  items?: string[];
  tone?: "neutral" | "amber" | "emerald" | "rose" | "cyan";
}) {
  if (!items || items.length === 0) return null;
  return (
    <div>
      <div className="text-[11px] uppercase tracking-wider text-slate-500 mb-1.5">
        {label}
      </div>
      <div className="flex flex-wrap gap-1.5">
        {items.map((it) => (
          <Pill key={it} tone={tone}>
            {it}
          </Pill>
        ))}
      </div>
    </div>
  );
}

export function Unavailable({ what }: { what: string }) {
  return (
    <p className="text-sm text-slate-500 italic">
      {what} is temporarily unavailable. Other sections are unaffected.
    </p>
  );
}
