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
  const upsideVals = analyst.coverage.map((c) => c.upsidePct).filter((v): v is number => v !== null);
  const avgUpside  = upsideVals.length
    ? Math.round((upsideVals.reduce((a, b) => a + b, 0) / upsideVals.length) * 10) / 10
    : null;

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      <div className="mb-6">
        <Link href="/analysts" className="text-[11px] text-gray-400 hover:text-gray-600 transition-colors">
          ← All Analysts
        </Link>
      </div>

      {/* ── Header ── */}
      <div className="flex items-start justify-between gap-8 mb-8 pb-6 border-b border-gray-200">
        <div className="flex items-center gap-4">
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center text-white text-[16px] font-bold shrink-0"
            style={{ backgroundColor: analyst.accent }}
          >
            {analyst.name.split(" ").map((n) => n[0]).join("")}
          </div>
          <div>
            <h1 className="text-[22px] font-bold text-[#111827] tracking-tight leading-tight">
              {analyst.name}
            </h1>
            <div className="text-[13px] text-gray-500 mt-0.5">{analyst.firmDisplay}</div>
            <div className="text-[12px] text-gray-400 mt-0.5">{analyst.title}</div>
          </div>
        </div>

        {/* Four stat boxes */}
        <div className="hidden sm:grid grid-cols-4 divide-x divide-gray-200 border border-gray-200 shrink-0">
          {(
            [
              { label: "Buys",       val: bull,    color: "text-emerald-600" },
              { label: "Holds",      val: neutral, color: "text-gray-400"    },
              { label: "Sells",      val: bear,    color: "text-rose-500"    },
              {
                label: "Avg Upside",
                val: avgUpside !== null ? `${avgUpside > 0 ? "+" : ""}${avgUpside}%` : "—",
                color: avgUpside === null ? "text-gray-400" : avgUpside > 0 ? "text-emerald-600" : "text-rose-500",
              },
            ] as { label: string; val: string | number; color: string }[]
          ).map((s) => (
            <div key={s.label} className="flex flex-col items-center justify-center px-6 py-4">
              <span className={`text-[22px] font-bold tabular-nums leading-none ${s.color}`}>
                {s.val}
              </span>
              <span className="text-[9px] uppercase tracking-widest text-gray-400 mt-1.5">
                {s.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Coverage headline */}
      <div className="flex items-baseline justify-between mb-4">
        <h2 className="text-[13px] font-semibold text-[#111827]">
          {analyst.name.split(" ")[0]}&apos;s Semiconductor Coverage
        </h2>
        <span className="text-[11px] text-gray-400">{analyst.coverage.length} companies · refreshed hourly</span>
      </div>

      {/* ── Table ── */}
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
                  { label: "Company",      align: "text-left"  },
                  { label: "Date",         align: "text-left"  },
                  { label: "Position",     align: "text-left"  },
                  { label: "Action",       align: "text-left"  },
                  { label: "Price Target", align: "text-right" },
                ].map(({ label, align }) => (
                  <th
                    key={label}
                    className={`px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-gray-500 bg-white ${align}`}
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
                  <tr
                    key={c.ticker}
                    className="border-b border-gray-100 last:border-0 hover:bg-[#FAFAF8] transition-colors"
                  >
                    {/* Company */}
                    <td className="px-5 py-4">
                      {slug ? (
                        <Link href={`/companies/${slug}`} className="group block">
                          <span className="font-mono text-[10px] text-[#B45309] group-hover:underline leading-none">
                            {c.ticker}
                          </span>
                          <span className="block text-[13px] font-semibold text-[#111827] group-hover:text-[#B45309] transition-colors leading-snug mt-0.5">
                            {c.name}
                          </span>
                        </Link>
                      ) : (
                        <>
                          <span className="font-mono text-[10px] text-gray-400 leading-none block">{c.ticker}</span>
                          <span className="block text-[13px] font-semibold text-[#111827] leading-snug mt-0.5">{c.name}</span>
                        </>
                      )}
                    </td>

                    {/* Date */}
                    <td className="px-5 py-4 text-[12px] text-gray-500 whitespace-nowrap">
                      {fmtDate(c.priceTargetDate)}
                    </td>

                    {/* Position */}
                    <td className="px-5 py-4">
                      <span className={`text-[13px] ${pos.cls}`}>{pos.label}</span>
                    </td>

                    {/* Action */}
                    <td className="px-5 py-4 text-[12px] text-gray-500">
                      {actionLabel(c.action)}
                    </td>

                    {/* Price Target + Upside */}
                    <td className="px-5 py-4 text-right">
                      {c.priceTarget ? (
                        <>
                          <div className="text-[14px] font-bold text-[#111827] tabular-nums">
                            ${c.priceTarget.toLocaleString()}
                          </div>
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

      <p className="mt-8 text-[11px] text-gray-400 border-t border-gray-100 pt-4 leading-relaxed">
        Data via Yahoo Finance, refreshed hourly. Most recent rating and price target per company shown.
        Upside calculated vs. current market price. Analyst names matched to firm&apos;s published ratings.
      </p>
    </div>
  );
}
