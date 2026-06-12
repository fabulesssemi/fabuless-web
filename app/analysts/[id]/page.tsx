import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { fetchAnalystCoverage, WALL_STREET_ANALYSTS } from "@/lib/analyst/analysts";
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

const RATING_COLOR: Record<string, string> = {
  "Buy": "text-emerald-600",
  "Strong Buy": "text-emerald-700",
  "Outperform": "text-emerald-600",
  "Overweight": "text-emerald-600",
  "Hold": "text-gray-500",
  "Neutral": "text-gray-500",
  "Equal-Weight": "text-gray-500",
  "Market Perform": "text-gray-500",
  "Underperform": "text-rose-500",
  "Underweight": "text-rose-500",
  "Sell": "text-rose-500",
};

function ratingColor(r: string): string {
  return RATING_COLOR[r] ?? "text-gray-600";
}

function actionLabel(action: string): { text: string; color: string } | null {
  if (action === "up")   return { text: "Upgraded",   color: "text-emerald-600 bg-emerald-50" };
  if (action === "down") return { text: "Downgraded", color: "text-rose-500 bg-rose-50" };
  if (action === "init") return { text: "Initiated",  color: "text-blue-600 bg-blue-50" };
  return null;
}

export default async function AnalystPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const all = await fetchAnalystCoverage();
  const analyst = all.find((a) => a.id === id);
  if (!analyst) notFound();

  const bullCount = analyst.coverage.filter((c) =>
    ["Buy", "Strong Buy", "Outperform", "Overweight"].includes(c.rating)
  ).length;
  const bearCount = analyst.coverage.filter((c) =>
    ["Sell", "Underperform", "Underweight"].includes(c.rating)
  ).length;

  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      <div className="mb-2">
        <Link href="/analyst-consensus" className="text-[11px] text-gray-400 hover:text-gray-600 transition-colors">
          ← Analyst Consensus
        </Link>
      </div>

      {/* Header */}
      <div className="border-b border-gray-200 pb-5 mb-8">
        <div className="flex items-start gap-4">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center text-white text-[13px] font-bold shrink-0 mt-0.5"
            style={{ backgroundColor: analyst.accent }}
          >
            {analyst.name.split(" ").map((n) => n[0]).join("")}
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="font-sans text-2xl font-bold text-[#111827] tracking-tight">{analyst.name}</h1>
            <div className="text-[13px] text-gray-500 mt-0.5">{analyst.title} · {analyst.firmDisplay}</div>
            <p className="text-[13px] text-[#4a4a4a] font-serif leading-relaxed mt-2 max-w-2xl">{analyst.knownFor}</p>
          </div>
          <div className="shrink-0 text-right hidden sm:flex flex-col gap-1">
            <div className="flex items-baseline gap-1.5 justify-end">
              <span className="text-lg font-bold text-emerald-600 tabular-nums">{bullCount}</span>
              <span className="text-[10px] uppercase tracking-wider text-gray-400">bullish</span>
            </div>
            <div className="flex items-baseline gap-1.5 justify-end">
              <span className="text-lg font-bold text-rose-500 tabular-nums">{bearCount}</span>
              <span className="text-[10px] uppercase tracking-wider text-gray-400">bearish</span>
            </div>
            <div className="flex items-baseline gap-1.5 justify-end">
              <span className="text-lg font-bold text-gray-400 tabular-nums">{analyst.coverage.length - bullCount - bearCount}</span>
              <span className="text-[10px] uppercase tracking-wider text-gray-400">neutral</span>
            </div>
          </div>
        </div>
      </div>

      {/* Coverage grid */}
      {analyst.coverage.length === 0 ? (
        <p className="text-[13px] text-gray-400 italic">No recent coverage data available.</p>
      ) : (
        <div className="grid sm:grid-cols-2 gap-3">
          {analyst.coverage.map((c) => {
            const slug = slugByTicker.get(c.ticker);
            const action = actionLabel(c.action);
            const card = (
              <div
                key={c.ticker}
                className="border border-gray-100 p-4 hover:border-gray-300 hover:shadow-sm transition-all"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="font-mono text-[10px] text-gray-400 leading-none">{c.ticker}</div>
                    <div className="text-[14px] font-semibold text-gray-900 mt-0.5 leading-snug">{c.name}</div>
                  </div>
                  {action && (
                    <span className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${action.color}`}>
                      {action.text}
                    </span>
                  )}
                </div>
                <div className="mt-3 flex items-baseline justify-between">
                  <span className={`text-[15px] font-bold ${ratingColor(c.rating)}`}>
                    {c.rating}
                  </span>
                  {c.priceTarget && (
                    <div className="text-right">
                      <span className="text-[18px] font-bold text-gray-900 tabular-nums">
                        ${c.priceTarget.toFixed(0)}
                      </span>
                      {c.priceTargetDate && (
                        <div className="text-[10px] text-gray-400">
                          {new Date(c.priceTargetDate + "T12:00:00Z").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
            return slug ? (
              <Link key={c.ticker} href={`/companies/${slug}`}>{card}</Link>
            ) : card;
          })}
        </div>
      )}

      <p className="mt-10 text-[11px] text-gray-400 border-t border-gray-100 pt-4">
        Data sourced from Yahoo Finance, refreshed hourly. Most recent rating and price target per company shown.
        Individual analyst names are matched to their firm&apos;s published ratings.
      </p>
    </div>
  );
}
