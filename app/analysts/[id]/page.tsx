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

// SVG donut gauge — matches TipRanks success rate circle
function Gauge({ pct, color }: { pct: number; color: string }) {
  const r = 36;
  const circ = 2 * Math.PI * r;
  const fill = (pct / 100) * circ;
  return (
    <svg width="96" height="96" viewBox="0 0 96 96">
      <circle cx="48" cy="48" r={r} fill="none" stroke="#E5E7EB" strokeWidth="7" />
      <circle
        cx="48" cy="48" r={r} fill="none"
        stroke={color} strokeWidth="7"
        strokeDasharray={`${fill} ${circ}`}
        strokeLinecap="round"
        transform="rotate(-90 48 48)"
      />
      <text x="48" y="44" textAnchor="middle" fontSize="15" fontWeight="700" fill="#111827">{pct}%</text>
      <text x="48" y="58" textAnchor="middle" fontSize="9" fill="#9CA3AF" fontWeight="600" letterSpacing="0.5">% BUY RATED</text>
    </svg>
  );
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

        {/* ── LEFT: Profile card ── */}
        <div className="w-[300px] shrink-0 border border-gray-200 bg-white shadow-sm sticky top-6">

          {/* Accent bar */}
          <div className="h-1 w-full" style={{ backgroundColor: analyst.accent }} />

          <div className="p-7 flex flex-col items-center text-center">
            {/* Name + firm */}
            <h1 className="text-[18px] font-bold text-[#111827] tracking-tight leading-tight">
              {analyst.name}
            </h1>
            <div className="text-[13px] font-semibold text-gray-600 mt-1">{analyst.firmDisplay}</div>
            <div className="text-[11px] text-gray-400 mt-0.5 uppercase tracking-wider">Wall Street Analyst</div>

            <div className="w-full h-px bg-gray-100 my-5" />

            {/* Bull rate gauge */}
            <Gauge pct={bullPct} color={gaugeColor} />

            {/* Avg upside */}
            <div className="mt-5 w-full border border-gray-100 px-4 py-3 text-center">
              <div className={`text-[26px] font-bold tabular-nums leading-none ${avgUpside !== null && avgUpside > 0 ? "text-emerald-600" : avgUpside !== null ? "text-rose-500" : "text-gray-400"}`}>
                {avgUpside !== null ? `${avgUpside > 0 ? "+" : ""}${avgUpside}%` : "—"}
              </div>
              <div className="text-[9px] uppercase tracking-wider text-gray-400 mt-1.5 font-semibold">Avg Implied Upside</div>
            </div>

            <div className="w-full h-px bg-gray-100 my-5" />

            {/* Coverage breakdown */}
            <div className="w-full grid grid-cols-3 divide-x divide-gray-100">
              {[
                { val: bull,    label: "Buys",   color: "text-emerald-600" },
                { val: neutral, label: "Holds",  color: "text-gray-400"    },
                { val: bear,    label: "Sells",  color: "text-rose-500"    },
              ].map((s) => (
                <div key={s.label} className="flex flex-col items-center py-1">
                  <span className={`text-[18px] font-bold tabular-nums leading-none ${s.color}`}>{s.val}</span>
                  <span className="text-[9px] uppercase tracking-wider text-gray-400 mt-1">{s.label}</span>
                </div>
              ))}
            </div>

            <div className="w-full h-px bg-gray-100 my-5" />

            {/* Known for */}
            <p className="text-[11px] text-gray-500 leading-relaxed text-left w-full">
              {analyst.knownFor}
            </p>

            <div className="w-full mt-5 text-[10px] text-gray-400 text-left leading-relaxed">
              {analyst.coverage.length} companies covered · refreshed hourly
            </div>
          </div>
        </div>

        {/* ── RIGHT: Coverage table ── */}
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline justify-between mb-4">
            <h2 className="text-[14px] font-semibold text-[#111827]">
              {analyst.name.split(" ")[0]}&apos;s Semiconductor Coverage
            </h2>
          </div>

          {analyst.coverage.length === 0 ? (
            <div className="border border-gray-100 py-16 text-center">
              <p className="text-[13px] text-gray-400">No recent coverage data available.</p>
            </div>
          ) : (
            <div className="border border-gray-200 overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr style={{ borderBottom: `2px solid ${analyst.accent}` }}>
                    {[
                      { label: "Company",       align: "text-left"  },
                      { label: "Date",          align: "text-left"  },
                      { label: "Position",      align: "text-left"  },
                      { label: "Action",        align: "text-left"  },
                      { label: "Price Target",  align: "text-right" },
                    ].map(({ label, align }) => (
                      <th key={label} className={`px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-gray-500 bg-white ${align}`}>
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
                      <tr key={c.ticker} className="border-b border-gray-300 last:border-0 hover:bg-[#FAFAF8] transition-colors">

                        {/* Company */}
                        <td className="px-5 py-3.5">
                          {slug ? (
                            <Link href={`/companies/${slug}`} className="group block">
                              <span className="font-mono text-[10px] text-[#B45309] group-hover:underline leading-none">{c.ticker}</span>
                              <span className="block text-[13px] font-semibold text-[#111827] group-hover:text-[#B45309] transition-colors leading-snug mt-0.5">{c.name}</span>
                            </Link>
                          ) : (
                            <>
                              <span className="font-mono text-[10px] text-gray-400 leading-none block">{c.ticker}</span>
                              <span className="block text-[13px] font-semibold text-[#111827] leading-snug mt-0.5">{c.name}</span>
                            </>
                          )}
                        </td>

                        {/* Date */}
                        <td className="px-5 py-3.5 text-[12px] text-gray-500 whitespace-nowrap">
                          {fmtDate(c.priceTargetDate)}
                        </td>

                        {/* Position */}
                        <td className="px-5 py-3.5">
                          <span className={`text-[13px] ${pos.cls}`}>{pos.label}</span>
                        </td>

                        {/* Action */}
                        <td className="px-5 py-3.5 text-[12px] text-gray-500">
                          {actionLabel(c.action)}
                        </td>

                        {/* Price Target + Upside */}
                        <td className="px-5 py-3.5 text-right">
                          {c.priceTarget ? (
                            <>
                              <div className="text-[14px] font-bold text-[#111827] tabular-nums">${c.priceTarget.toLocaleString()}</div>
                              {c.upsidePct !== null && (
                                <div className={`text-[11px] font-medium tabular-nums mt-0.5 ${c.upsidePct >= 0 ? "text-emerald-600" : "text-rose-500"}`}>
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

          <p className="mt-6 text-[10px] text-gray-400 leading-relaxed">
            Data via Yahoo Finance, refreshed hourly. Most recent rating and price target per company shown.
            Upside calculated vs. current market price. Analyst names matched to firm&apos;s published ratings.
          </p>
        </div>
      </div>
    </div>
  );
}
