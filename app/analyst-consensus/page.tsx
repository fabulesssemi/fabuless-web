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
import { Section, displayTicker, fmtPercent } from "@/app/components/company/primitives";

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
    <div className="min-h-screen bg-[#0B1120] text-slate-200">
      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Header */}
        <header className="mb-8">
          <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-amber-400/80">
            Wall Street Intelligence
          </div>
          <h1 className="font-serif text-4xl sm:text-5xl text-white tracking-tight mt-2">
            Analyst Consensus
          </h1>
          <p className="mt-3 max-w-2xl text-slate-400 leading-relaxed">
            What Wall Street is getting more bullish or bearish on across AI
            semiconductors. Sentiment, price targets, upgrades, and estimate
            revisions — refreshed hourly.
          </p>
          <div className="mt-4 flex flex-wrap gap-2 text-xs">
            <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 text-emerald-300 px-3 py-1">
              {counts.improving} improving
            </span>
            <span className="rounded-full border border-rose-400/20 bg-rose-400/10 text-rose-300 px-3 py-1">
              {counts.weakening} weakening
            </span>
            <span className="rounded-full border border-white/10 bg-white/5 text-slate-300 px-3 py-1">
              {counts.stable} stable
            </span>
          </div>
        </header>

        {/* What Changed This Week */}
        {weeklySummary && (
          <section className="mb-8 rounded-2xl border border-amber-400/20 bg-amber-400/[0.03] p-6">
            <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-amber-400/80 mb-1">
              What Changed This Week
            </div>
            <p className="text-slate-300 leading-relaxed text-[15px]">{weeklySummary.summary}</p>
            <div className="mt-3 text-[11px] text-slate-600">
              Week of {weeklySummary.week_of}
            </div>
          </section>
        )}

        {/* Master sortable table — primary view */}
        <div className="mb-3 flex items-baseline justify-between">
          <h2 className="font-serif text-xl text-white">All Companies</h2>
          <span className="text-[11px] text-slate-500">Click any column to sort</span>
        </div>
        <ConsensusTable rows={rows} />

        {/* 3 ranking cards — top movers */}
        <div className="grid md:grid-cols-3 gap-5 mt-8 mb-8">
          <RankCard
            title="Biggest Bullish Moves"
            eyebrow="Sentiment ▲"
            items={rankBullish(views)}
            metric={(v) => ({ text: `+${v.sentimentScore}pp`, tone: "text-emerald-400" })}
            emptyHint="No clear bullish shifts right now."
          />
          <RankCard
            title="Biggest Bearish Moves"
            eyebrow="Sentiment ▼"
            items={rankBearish(views)}
            metric={(v) => ({ text: `${v.sentimentScore}pp`, tone: "text-rose-400" })}
            emptyHint="No clear bearish shifts right now."
          />
          <RankCard
            title="Most Upgraded"
            eyebrow="Actions · 30d"
            items={rankUpgrades(views)}
            metric={(v) => ({ text: `${v.upgrades30d} ▲`, tone: "text-emerald-400" })}
            emptyHint="No upgrades in the last 30 days."
          />
        </div>

        {/* Analyst Narrative Trends */}
        <Section eyebrow="What's the story" title="Analyst Narrative Trends" className="mb-8">
          <div className="grid lg:grid-cols-2 gap-5">
            <NarrativeColumn title="Getting more bullish" tone="emerald" views={improving} />
            <NarrativeColumn title="Getting more cautious" tone="rose" views={weakening} />
          </div>
        </Section>

        <p className="mt-6 text-[11px] text-slate-600">
          Data via Yahoo Finance, cached hourly. Sentiment = change in buy-rating
          share over the trailing recommendation window. Price-target changes use
          daily snapshots and populate over time. Narratives are generated from
          real figures + curated themes — no numbers are invented.
        </p>
      </div>
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
    <Section eyebrow={eyebrow} title={title}>
      {items.length === 0 ? (
        <p className="text-[13px] text-slate-500 italic">{emptyHint}</p>
      ) : (
        <ol className="space-y-2">
          {items.map((v, i) => {
            const m = metric(v);
            const slug = slugByTicker.get(v.ticker) ?? v.ticker.toLowerCase();
            return (
              <li key={v.ticker}>
                <Link
                  href={`/companies/${slug}`}
                  className="group flex items-center justify-between gap-3 rounded-lg border border-white/10 bg-white/[0.02] px-3 py-2 hover:border-amber-400/30 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-[11px] text-slate-600 w-3">{i + 1}</span>
                    <div className="min-w-0">
                      <span className="font-mono text-amber-400 text-xs">
                      {displayTicker(v.ticker)}
                    </span>
                      <span className="block text-[13px] text-slate-300 group-hover:text-amber-300 transition-colors truncate">
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
    </Section>
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
  const color = tone === "emerald" ? "text-emerald-400" : "text-rose-400";
  return (
    <div>
      <div className={`text-sm font-semibold mb-3 ${color}`}>{title}</div>
      {views.length === 0 ? (
        <p className="text-[13px] text-slate-500 italic">Nothing notable right now.</p>
      ) : (
        <ul className="space-y-3">
          {views.map((v) => {
            const slug = slugByTicker.get(v.ticker) ?? v.ticker.toLowerCase();
            const name = nameByTicker.get(v.ticker) ?? v.ticker;
            return (
              <li key={v.ticker} className="rounded-xl border border-white/10 bg-white/[0.02] p-3">
                <Link href={`/companies/${slug}`} className="group block">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="font-mono text-[11px] text-amber-400">{displayTicker(v.ticker)}</span>
                    <span className="text-[11px] text-slate-500 truncate group-hover:text-amber-300 transition-colors">{name}</span>
                  </div>
                  <p className="text-[13px] text-slate-300 leading-relaxed">{v.narrative}</p>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
