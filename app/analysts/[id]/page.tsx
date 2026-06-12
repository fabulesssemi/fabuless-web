import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { fetchAnalystCoverage, WALL_STREET_ANALYSTS, actionLabel } from "@/lib/analyst/analysts";
import { COMPANY_UNIVERSE } from "@/lib/companies";

export const revalidate = 3600;

const slugByTicker = new Map(COMPANY_UNIVERSE.map((c) => [c.ticker, c.slug]));

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const analyst = WALL_STREET_ANALYSTS.find((a) => a.id === id);
  if (!analyst) return {};
  return {
    title: `${analyst.name} — ${analyst.firmDisplay} | Fabuless`,
    description: `${analyst.name}'s current price targets and ratings across the semiconductor universe.`,
  };
}

const BULL_RATINGS = new Set(["Buy", "Strong Buy", "Outperform", "Overweight", "Positive"]);
const BEAR_RATINGS = new Set(["Sell", "Underperform", "Underweight", "Negative"]);

function ratingStyle(r: string) {
  if (BULL_RATINGS.has(r)) return { text: "text-emerald-700", bg: "bg-emerald-50", border: "border-emerald-200" };
  if (BEAR_RATINGS.has(r)) return { text: "text-rose-600",   bg: "bg-rose-50",    border: "border-rose-200"   };
  return                          { text: "text-gray-500",    bg: "bg-gray-50",    border: "border-gray-200"   };
}

function upsideColor(pct: number | null) {
  if (pct === null) return "text-gray-300";
  return pct > 0 ? "text-emerald-600" : "text-rose-500";
}

function fmtDate(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso + "T12:00:00Z").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default async function AnalystPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const all = await fetchAnalystCoverage();
  const analyst = all.find((a) => a.id === id);
  if (!analyst) notFound();

  const bull    = analyst.coverage.filter((c) => BULL_RATINGS.has(c.rating)).length;
  const bear    = analyst.coverage.filter((c) => BEAR_RATINGS.has(c.rating)).length;
  const neutral = analyst.coverage.length - bull - bear;
  const upsideVals = analyst.coverage.map((c) => c.upsidePct).filter((v): v is number => v !== null);
  const avgUpside  = upsideVals.length ? Math.round((upsideVals.reduce((a, b) => a + b, 0) / upsideVals.length) * 10) / 10 : null;

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      <div className="mb-4">
        <Link href="/analysts" className="text-[11px] text-gray-400 hover:text-gray-600 transition-colors">
          ← All Analysts
        </Link>
      </div>

      {/* Header card */}
      <div className="border border-gray-200 p-6 mb-8">
        <div className="flex items-start gap-5 flex-wrap">
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center text-white text-[14px] font-bold shrink-0"
            style={{ backgroundColor: analyst.accent }}
          >
            {analyst.name.split(" ").map((n) => n[0]).join("")}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-baseline gap-3 flex-wrap">
              <h1 className="font-sans text-2xl font-bold text-[#111827] tracking-tight">{analyst.name}</h1>
              <span className="text-[12px] text-gray-400">{analyst.title} · {analyst.firmDisplay}</span>
            </div>
            <p className="font-serif text-[14px] text-[#4a4a4a] leading-relaxed mt-1 max-w-2xl">{analyst.knownFor}</p>
          </div>

          {/* Stats strip */}
          <div className="flex items-stretch border border-gray-200 divide-x divide-gray-200 shrink-0">
            {[
              { label: "Buys",       value: String(bull),    color: "text-emerald-600" },
              { label: "Holds",      value: String(neutral), color: "text-gray-400"    },
              { label: "Sells",      value: String(bear),    color: "text-rose-500"    },
              { label: "Avg Upside", value: avgUpside !== null ? `${avgUpside > 0 ? "+" : ""}${avgUpside}%` : "—",
                color: avgUpside !== null ? (avgUpside > 0 ? "text-emerald-600" : "text-rose-500") : "text-gray-400" },
            ].map((s) => (
              <div key={s.label} className="flex flex-col items-center justify-center px-5 py-3">
                <span className={`text-[20px] font-bold tabular-nums leading-none ${s.color}`}>{s.value}</span>
                <span className="text-[9px] uppercase tracking-wider text-gray-400 mt-1 whitespace-nowrap">{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Coverage table */}
      {analyst.coverage.length === 0 ? (
        <div className="border border-gray-100 p-10 text-center">
          <p className="text-[13px] text-gray-400 italic">No recent coverage data available.</p>
        </div>
      ) : (
        <div className="border border-gray-200 overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-[#FAFAF8]">
                {["Company", "Date", "Rating", "Action", "Price Target", "Upside"].map((h, i) => (
                  <th
                    key={h}
                    className={`px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-gray-400 ${i >= 5 ? "text-right hidden sm:table-cell" : i >= 4 ? "text-right" : "text-left"}`}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {analyst.coverage.map((c) => {
                const slug = slugByTicker.get(c.ticker);
                const rs   = ratingStyle(c.rating);
                return (
                  <tr key={c.ticker} className="border-b border-gray-50 last:border-0 hover:bg-[#FAFAF8] transition-colors">

                    {/* Company */}
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <span className="w-0.5 h-7 rounded-full shrink-0" style={{ backgroundColor: analyst.accent + "70" }} />
                        <div>
                          <div className="font-mono text-[10px] text-gray-400 leading-none">{c.ticker}</div>
                          {slug ? (
                            <Link href={`/companies/${slug}`} className="text-[13px] font-semibold text-[#111827] hover:text-[#B45309] transition-colors leading-snug mt-0.5 block">
                              {c.name}
                            </Link>
                          ) : (
                            <div className="text-[13px] font-semibold text-[#111827] leading-snug mt-0.5">{c.name}</div>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Date */}
                    <td className="px-5 py-3.5 text-[12px] text-gray-500 whitespace-nowrap">
                      {fmtDate(c.priceTargetDate)}
                    </td>

                    {/* Rating */}
                    <td className="px-5 py-3.5">
                      <span className={`text-[11px] font-bold px-2 py-0.5 border ${rs.text} ${rs.bg} ${rs.border}`}>
                        {c.rating.toUpperCase()}
                      </span>
                    </td>

                    {/* Action */}
                    <td className="px-5 py-3.5 text-[12px] text-gray-500">
                      {actionLabel(c.action)}
                    </td>

                    {/* Price Target */}
                    <td className="px-5 py-3.5 text-right">
                      {c.priceTarget ? (
                        <span className="text-[15px] font-bold text-[#111827] tabular-nums">
                          ${c.priceTarget.toLocaleString()}
                        </span>
                      ) : (
                        <span className="text-gray-300">—</span>
                      )}
                    </td>

                    {/* Upside */}
                    <td className="px-5 py-3.5 text-right hidden sm:table-cell">
                      <span className={`text-[13px] font-semibold tabular-nums ${upsideColor(c.upsidePct)}`}>
                        {c.upsidePct !== null ? `${c.upsidePct > 0 ? "+" : ""}${c.upsidePct}%` : "—"}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <p className="mt-8 text-[11px] text-gray-400 border-t border-gray-100 pt-4 leading-relaxed">
        Data via Yahoo Finance, refreshed hourly. Most recent rating and price target per company shown.
        Upside calculated vs. current market price. Analyst names matched to firm&apos;s published ratings.
      </p>
    </div>
  );
}
