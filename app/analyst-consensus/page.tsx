import type { Metadata } from "next";
import Link from "next/link";
import { getAllAnalystViews } from "@/lib/analyst";
import type { AnalystView } from "@/lib/analyst/types";
import { getLatestWeeklySummary } from "@/lib/analyst/weekly";
import {
  narrativeCounts,
  rankBearish,
  rankBullish,
  rankUpgrades,
  toRows,
} from "@/lib/analyst/dashboard";
import { COMPANY_UNIVERSE } from "@/lib/companies";
import { ConsensusTable } from "@/app/components/analyst/ConsensusTable";
import { displayTicker, fmtPercent } from "@/app/components/company/primitives";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Analyst Consensus — Fabuless",
  description:
    "What Wall Street is getting more bullish or bearish on across AI semiconductors — sentiment moves, price-target changes, upgrades/downgrades, and estimate revisions.",
};

const slugByTicker = new Map(COMPANY_UNIVERSE.map((c) => [c.ticker, c.slug]));
const nameByTicker = new Map(COMPANY_UNIVERSE.map((c) => [c.ticker, c.name]));

export default async function AnalystConsensusDashboard() {
  const [views, weeklySummary] = await Promise.all([
    getAllAnalystViews(),
    getLatestWeeklySummary(),
  ]);
  const counts = narrativeCounts(views);
  const rows = toRows(views);

  const improving = views
    .filter((v) => v.sentimentDirection === "improving")
    .sort((a, b) => b.sentimentScore - a.sentimentScore);
  const weakening = views
    .filter((v) => v.sentimentDirection === "weakening")
    .sort((a, b) => a.sentimentScore - b.sentimentScore);

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">

      {/* Header */}
      <header className="mb-6 pb-4 border-b border-gray-200">
        <div className="flex items-baseline justify-between gap-4">
          <div>
            <h1 className="font-sans text-2xl font-bold text-[#111827] tracking-tight">
              Analyst Consensus
            </h1>
            <p className="mt-1 font-serif text-[15px] text-[#4a4a4a] leading-relaxed">
              What Wall Street is getting more bullish or bearish on across AI semiconductors.
              Sentiment, price targets, upgrades — refreshed hourly.
            </p>
          </div>
          <div className="flex items-center gap-4 shrink-0">
            <div className="flex items-baseline gap-1">
              <span className="font-sans text-base font-bold text-emerald-600 tabular-nums">{counts.improving}</span>
              <span className="text-[10px] uppercase tracking-wider text-gray-400">up</span>
            </div>
            <span className="w-px h-3 bg-gray-200" />
            <div className="flex items-baseline gap-1">
              <span className="font-sans text-base font-bold text-rose-500 tabular-nums">{counts.weakening}</span>
              <span className="text-[10px] uppercase tracking-wider text-gray-400">down</span>
            </div>
            <span className="w-px h-3 bg-gray-200" />
            <div className="flex items-baseline gap-1">
              <span className="font-sans text-base font-bold text-gray-400 tabular-nums">{counts.stable}</span>
              <span className="text-[10px] uppercase tracking-wider text-gray-400">stable</span>
            </div>
          </div>
        </div>
      </header>

      {/* What Changed This Week — compact strip, no amber card */}
      {weeklySummary && (
        <div className="mb-8 pl-4 border-l-2 border-gray-200">
          <div className="text-[10px] uppercase tracking-wider text-gray-400 mb-1">
            What Changed This Week · {weeklySummary.week_of}
          </div>
          <p className="text-[13px] text-gray-600 leading-relaxed">{weeklySummary.summary}</p>
        </div>
      )}

      {/* Master sortable table — primary view */}
      <div className="mb-2 flex items-baseline justify-between">
        <h2 className="font-sans text-lg font-semibold text-gray-900">All Companies</h2>
        <span className="text-[11px] text-gray-400">Click column to sort</span>
      </div>
      <ConsensusTable rows={rows} />

      {/* 3 ranking sections */}
      <div className="grid md:grid-cols-3 gap-x-8 gap-y-10 mt-10 mb-10">
        <RankCard
          title="Biggest Bullish Moves"
          eyebrow="Sentiment ▲"
          items={rankBullish(views)}
          metric={(v) => ({ text: `+${v.sentimentScore}pp`, tone: "text-emerald-600" })}
          emptyHint="No clear bullish shifts right now."
        />
        <RankCard
          title="Biggest Bearish Moves"
          eyebrow="Sentiment ▼"
          items={rankBearish(views)}
          metric={(v) => ({ text: `${v.sentimentScore}pp`, tone: "text-rose-500" })}
          emptyHint="No clear bearish shifts right now."
        />
        <RankCard
          title="Most Upgraded"
          eyebrow="Actions · 30d"
          items={rankUpgrades(views)}
          metric={(v) => ({ text: `${v.upgrades30d} ↑`, tone: "text-gray-700" })}
          emptyHint="No upgrades in the last 30 days."
        />
      </div>

      {/* Analyst Narrative Trends */}
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-6">
          <h2 className="font-sans text-lg font-semibold text-gray-900">Narrative Trends</h2>
          <div className="flex-1 h-px bg-gray-100" />
        </div>
        <div className="grid lg:grid-cols-2 gap-8">
          <NarrativeColumn title="Getting more bullish"  tone="emerald" views={improving} />
          <NarrativeColumn title="Getting more cautious" tone="rose"    views={weakening} />
        </div>
      </div>

      <p className="text-[11px] text-gray-400 leading-relaxed border-t border-gray-100 pt-6">
        Data via Yahoo Finance, cached hourly. Sentiment = change in buy-rating share over the
        trailing recommendation window. Price-target changes use daily snapshots and populate over
        time. Narratives are generated from real figures + curated themes — no numbers are invented.
      </p>

    </div>
  );
}

function RankCard({
  title,
  eyebrow,
  items,
  metric,
  emptyHint,
}: {
  title: string;
  eyebrow: string;
  items: AnalystView[];
  metric: (v: AnalystView) => { text: string; tone: string };
  emptyHint: string;
}) {
  return (
    <div>
      <div className="mb-4">
        <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-gray-400 mb-0.5">
          {eyebrow}
        </div>
        <h3 className="font-sans text-[1.05rem] font-semibold text-gray-900">{title}</h3>
        <div className="mt-3 h-px bg-gray-100" />
      </div>
      {items.length === 0 ? (
        <p className="text-[13px] text-gray-400 italic">{emptyHint}</p>
      ) : (
        <ol>
          {items.map((v, i) => {
            const m = metric(v);
            const slug = slugByTicker.get(v.ticker) ?? v.ticker.toLowerCase();
            return (
              <li key={v.ticker} className="border-b border-gray-100 last:border-0">
                <Link
                  href={`/companies/${slug}`}
                  className="group flex items-center justify-between gap-3 py-2.5 hover:bg-gray-50 -mx-2 px-2 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-[11px] text-gray-300 tabular-nums w-3 shrink-0 text-right">
                      {i + 1}
                    </span>
                    <div className="min-w-0">
                      <span className="font-mono text-[10px] text-gray-400">
                        {displayTicker(v.ticker)}
                      </span>
                      <span className="block text-[13px] font-medium text-gray-800 group-hover:text-gray-900 transition-colors truncate">
                        {v.name}
                      </span>
                    </div>
                  </div>
                  <span className={`text-sm font-semibold tabular-nums shrink-0 ${m.tone}`}>
                    {m.text}
                  </span>
                </Link>
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}

function NarrativeColumn({
  title,
  tone,
  views,
}: {
  title: string;
  tone: "emerald" | "rose";
  views: AnalystView[];
}) {
  const isPositive = tone === "emerald";
  const titleColor   = isPositive ? "text-emerald-600" : "text-rose-500";
  const borderColor  = isPositive ? "border-emerald-300" : "border-rose-300";
  const indicator    = isPositive ? "↑" : "↓";

  return (
    <div>
      <div className="flex items-center gap-3 mb-4">
        <span className={`text-[10px] font-bold uppercase tracking-[0.18em] ${titleColor}`}>
          {indicator} {title}
        </span>
        <div className="flex-1 h-px bg-gray-100" />
      </div>
      {views.length === 0 ? (
        <p className="text-[13px] text-gray-400 italic">Nothing notable right now.</p>
      ) : (
        <ul>
          {views.map((v) => {
            const slug = slugByTicker.get(v.ticker) ?? v.ticker.toLowerCase();
            const name = nameByTicker.get(v.ticker) ?? v.ticker;
            return (
              <li
                key={v.ticker}
                className={`border-l-2 ${borderColor} pl-4 py-3`}
              >
                <Link href={`/companies/${slug}`} className="group block">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-[10px] text-gray-400">
                      {displayTicker(v.ticker)}
                    </span>
                    <span className="text-[13px] font-medium text-gray-800 group-hover:text-gray-900 transition-colors">
                      {name}
                    </span>
                  </div>
                  <p className="text-[12px] text-gray-500 leading-relaxed">{v.narrative}</p>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
