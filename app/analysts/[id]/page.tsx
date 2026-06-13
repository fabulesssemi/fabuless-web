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
    description: `${analyst.name}'s current semiconductor price targets and ratings.`,
  };
}

const BULL = new Set(["Buy", "Strong Buy", "Outperform", "Overweight", "Positive"]);
const BEAR = new Set(["Sell", "Underperform", "Underweight", "Negative"]);

function positionStyle(r: string): { label: string; cls: string } {
  if (BULL.has(r)) return { label: "BUY",  cls: "text-emerald-600 font-bold" };
  if (BEAR.has(r)) return { label: "SELL", cls: "text-rose-500 font-bold"    };
  return                  { label: "HOLD", cls: "text-gray-400 font-semibold" };
}

function fmtDate(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso + "T12:00:00Z").toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric",
  });
}


export default async function AnalystPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const all = await fetchAnalystCoverage();
  const analyst = all.find((a) => a.id === id);
  if (!analyst) notFound();

  const bull    = analyst.coverage.filter((c) => BULL.has(c.rating)).length;
  const bear    = analyst.coverage.filter((c) => BEAR.has(c.rating)).length;
  const neutral = analyst.coverage.length - bull - bear;
  const total   = analyst.coverage.length;

  const bullPct = total > 0 ? Math.round((bull / total) * 100) : 0;

  const upsideVals = analyst.coverage.map((c) => c.upsidePct).filter((v): v is number => v !== null);
  const avgUpside  = upsideVals.length
    ? Math.round((upsideVals.reduce((a, b) => a + b, 0) / upsideVals.length) * 10) / 10
    : null;

  const gaugeColor = bullPct >= 60 ? "#059669" : bullPct >= 40 ? "#D97706" : "#E11D48";

  return (
    <div className="max-w-6xl mx-auto px-6 pt-5 pb-10">
      <div className="mb-3">
        <Link href="/analysts" className="inline-flex items-center gap-1.5 text-[13px] font-medium text-gray-500 hover:text-gray-900 transition-colors">
          ← All Analysts
        </Link>
      </div>

      {/* ── Two-column layout ── */}
      <div className="flex items-start gap-8">

        {/* ── LEFT: Profile panel ── */}
        <div className="w-[220px] shrink-0 sticky top-6">
          {/* Accent bar + name */}
          <div className="pb-4 mb-4" style={{ borderBottom: `2px solid ${analyst.accent}` }}>
            <h1 className="text-[20px] font-bold text-[#111827] tracking-tight leading-tight">
              {analyst.name}
            </h1>
            <div className="text-[13px] text-gray-500 mt-0.5">{analyst.firmDisplay}</div>
          </div>

          {/* Stats — plain rows, no boxes */}
          <div className="space-y-4">
            <div>
              <div className={`text-[22px] font-bold tabular-nums leading-none ${avgUpside !== null && avgUpside > 0 ? "text-emerald-600" : avgUpside !== null ? "text-rose-500" : "text-gray-400"}`}>
                {avgUpside !== null ? `${avgUpside > 0 ? "+" : ""}${avgUpside}%` : "—"}
              </div>
              <div className="text-[10px] uppercase tracking-wider text-gray-400 mt-0.5 font-semibold">Avg Implied Upside</div>
            </div>

            <div>
              <div className={`text-[22px] font-bold tabular-nums leading-none`} style={{ color: gaugeColor }}>
                {bullPct}%
              </div>
              <div className="text-[10px] uppercase tracking-wider text-gray-400 mt-0.5 font-semibold">Buy Rated</div>
            </div>

            <div className="flex gap-5 pt-1">
              {[
                { val: bull,    label: "Buys",  color: "text-emerald-600" },
                { val: neutral, label: "Holds", color: "text-gray-400"    },
                { val: bear,    label: "Sells", color: "text-rose-500"    },
              ].map((s) => (
                <div key={s.label}>
                  <div className={`text-[16px] font-bold tabular-nums leading-none ${s.color}`}>{s.val}</div>
                  <div className="text-[10px] uppercase tracking-wider text-gray-400 mt-0.5 font-semibold">{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="h-px bg-gray-200 my-5" />

          <p className="text-[12px] text-gray-500 leading-relaxed">
            {analyst.knownFor}
          </p>

          <div className="mt-4 text-[10px] text-gray-400 leading-relaxed">
            {analyst.coverage.length} companies · refreshed hourly
          </div>
        </div>

        {/* ── RIGHT: Coverage table ── */}
        <div className="flex-1 min-w-0">
          <h2 className="text-[20px] font-bold text-[#111827] mb-4">
            {analyst.name}&apos;s Stock Coverage
          </h2>

          {analyst.coverage.length === 0 ? (
            <div className="py-16 text-center border-t border-gray-200">
              <p className="text-[13px] text-gray-400">No recent coverage data available.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b-0">
                    {[
                      { label: "Company",      align: "text-left"  },
                      { label: "Date",         align: "text-left"  },
                      { label: "Position",     align: "text-left"  },
                      { label: "Action",       align: "text-left"  },
                      { label: "Price Target", align: "text-right" },
                    ].map(({ label, align }, i) => (
                      <th
                        key={label}
                        style={{ borderBottom: `2px solid ${analyst.accent}` }}
                        className={`pb-2 pt-0 text-[11px] font-bold uppercase tracking-wider text-gray-500 bg-white ${align} ${i === 0 ? "pr-4" : "px-4"}`}
                      >
                        {label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {analyst.coverage.map((c) => {
                    const slug = slugByTicker.get(c.ticker);
                    const pos  = positionStyle(c.rating);
                    return (
                      <tr key={c.ticker} className="border-b border-gray-100 last:border-0 hover:bg-[#FAFAF8] transition-colors">

                        {/* Company */}
                        <td className="pr-4 py-3.5">
                          {slug ? (
                            <Link href={`/companies/${slug}`} className="group block">
                              <span className="font-mono text-[10px] font-semibold uppercase tracking-wide leading-none" style={{ color: analyst.accent }}>{c.ticker}</span>
                              <span className="block text-[13px] font-semibold text-[#111827] group-hover:text-[#B45309] transition-colors leading-snug mt-0.5">{c.name}</span>
                            </Link>
                          ) : (
                            <>
                              <span className="font-mono text-[10px] font-semibold uppercase tracking-wide text-gray-400 leading-none block">{c.ticker}</span>
                              <span className="block text-[13px] font-semibold text-[#111827] leading-snug mt-0.5">{c.name}</span>
                            </>
                          )}
                        </td>

                        {/* Date */}
                        <td className="px-4 py-3.5 text-[12px] text-gray-400 whitespace-nowrap">
                          {fmtDate(c.priceTargetDate)}
                        </td>

                        {/* Position */}
                        <td className="px-4 py-3.5">
                          <span className={`text-[13px] tracking-wide ${pos.cls}`}>{pos.label}</span>
                        </td>

                        {/* Action */}
                        <td className="px-4 py-3.5 text-[12px] text-gray-500">
                          {actionLabel(c.action)}
                        </td>

                        {/* Price Target + Upside */}
                        <td className="px-4 py-3.5 text-right">
                          {c.priceTarget ? (
                            <>
                              <div className="text-[14px] font-bold text-[#111827] tabular-nums">${c.priceTarget.toLocaleString()}</div>
                              {c.upsidePct !== null && (
                                <div className={`text-[11px] font-semibold tabular-nums mt-0.5 ${c.upsidePct >= 0 ? "text-emerald-600" : "text-rose-500"}`}>
                                  ({c.upsidePct > 0 ? "+" : ""}{c.upsidePct}% {c.upsidePct >= 0 ? "Upside" : "Downside"})
                                </div>
                              )}
                            </>
                          ) : (
                            <span className="text-gray-300 text-[12px]">—</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          <p className="mt-5 text-[10px] text-gray-400 leading-relaxed">
            Data via Yahoo Finance, refreshed hourly. Most recent rating and price target per company shown.
            Upside calculated vs. current market price.
          </p>
        </div>
      </div>
    </div>
  );
}
