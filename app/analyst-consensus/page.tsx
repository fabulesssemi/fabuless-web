import type { Metadata } from "next";
import Link from "next/link";
import { getAllAnalystViews } from "@/lib/analyst";
import type { AnalystView } from "@/lib/analyst/types";
import {
  narrativeCounts,
  rankBearish,
  rankBullish,
  rankDowngrades,
  rankEstimateLeaders,
  rankPTCuts,
  rankPTRaises,
  rankUpgrades,
  sortByBuyShare,
  toRows,
} from "@/lib/analyst/dashboard";
import { COMPANY_UNIVERSE } from "@/lib/companies";
import { ConsensusTable } from "@/app/components/analyst/ConsensusTable";
import { Section, changeTone, fmtPercent, fmtPrice } from "@/app/components/company/primitives";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Analyst Consensus — Fabuless",
  description:
    "What Wall Street is getting more bullish or bearish on across AI semiconductors — sentiment moves, price-target changes, upgrades/downgrades, and estimate revisions.",
};

const slugByTicker = new Map(COMPANY_UNIVERSE.map((c) => [c.ticker, c.slug]));
const nameByTicker = new Map(COMPANY_UNIVERSE.map((c) => [c.ticker, c.name]));

export default async function AnalystConsensusDashboard() {
  const views = await getAllAnalystViews();
  const counts = narrativeCounts(views);
  const rows = toRows(views);

  const heat = sortByBuyShare(views);
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

        {/* Ranking cards 1-7 */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
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
            title="Largest PT Increases"
            eyebrow="Price Target ▲"
            items={rankPTRaises(views)}
            metric={(v) => ({
              text: fmtPercent(v.delta?.ptChangePct),
              tone: "text-emerald-400",
            })}
            emptyHint="No price-target history yet — captured daily once snapshots accumulate."
          />
          <RankCard
            title="Largest PT Cuts"
            eyebrow="Price Target ▼"
            items={rankPTCuts(views)}
            metric={(v) => ({
              text: fmtPercent(v.delta?.ptChangePct),
              tone: "text-rose-400",
            })}
            emptyHint="No price-target history yet — captured daily once snapshots accumulate."
          />
          <RankCard
            title="Most Upgraded"
            eyebrow="Actions · 30d"
            items={rankUpgrades(views)}
            metric={(v) => ({ text: `${v.upgrades30d} ▲`, tone: "text-emerald-400" })}
            emptyHint="No upgrades in the last 30 days."
          />
          <RankCard
            title="Most Downgraded"
            eyebrow="Actions · 30d"
            items={rankDowngrades(views)}
            metric={(v) => ({ text: `${v.downgrades30d} ▼`, tone: "text-rose-400" })}
            emptyHint="No downgrades in the last 30 days."
          />
          <RankCard
            title="Estimate Revision Leaders"
            eyebrow="EPS estimates rising"
            items={rankEstimateLeaders(views)}
            metric={(v) => {
              const r = v.revisions;
              const base = r?.eps90dAgo ?? r?.eps30dAgo;
              const s =
                r?.epsCurrent != null && base != null && base !== 0
                  ? ((r.epsCurrent - base) / Math.abs(base)) * 100
                  : 0;
              return { text: fmtPercent(s), tone: changeTone(s) };
            }}
            emptyHint="No notable estimate revisions."
          />
        </div>

        {/* 8. Consensus Heatmap */}
        <Section eyebrow="Buy-share across the group" title="Consensus Heatmap" className="mb-8">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {heat.map((v) => (
              <HeatTile key={v.ticker} view={v} />
            ))}
          </div>
          <div className="mt-3 flex items-center gap-2 text-[11px] text-slate-500">
            <span className="inline-block h-2 w-8 rounded" style={{ background: "linear-gradient(90deg, hsl(0,55%,42%), hsl(60,55%,42%), hsl(120,55%,38%))" }} />
            Sell-leaning → Buy-leaning (share of buy ratings)
          </div>
        </Section>

        {/* 9. Analyst Narrative Trends */}
        <Section eyebrow="What's the story" title="Analyst Narrative Trends" className="mb-8">
          <div className="grid lg:grid-cols-2 gap-5">
            <NarrativeColumn title="Getting more bullish" tone="emerald" views={improving} />
            <NarrativeColumn title="Getting more cautious" tone="rose" views={weakening} />
          </div>
        </Section>

        {/* Master sortable table */}
        <div className="mb-3 flex items-baseline justify-between">
          <h2 className="font-serif text-xl text-white">All Companies</h2>
          <span className="text-[11px] text-slate-500">Click any column to sort</span>
        </div>
        <ConsensusTable rows={rows} />

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
                      {v.ticker.endsWith(".KS") ? "KRX" : v.ticker}
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

function HeatTile({ view }: { view: AnalystView }) {
  const bs = view.buyShare ?? 50;
  const hue = (Math.max(0, Math.min(100, bs)) / 100) * 120; // 0=red, 120=green
  const arrow =
    view.sentimentDirection === "improving"
      ? "▲"
      : view.sentimentDirection === "weakening"
        ? "▼"
        : "→";
  const slug = slugByTicker.get(view.ticker) ?? view.ticker.toLowerCase();
  return (
    <Link
      href={`/companies/${slug}`}
      className="rounded-xl border border-white/10 p-4 transition-transform hover:scale-[1.02]"
      style={{ background: `hsl(${hue}, 45%, 22%)` }}
    >
      <div className="flex items-center justify-between">
        <span className="font-mono text-xs text-white/90">
          {nameByTicker.get(view.ticker) ?? view.ticker}
        </span>
        <span className="text-white/70 text-xs">{arrow}</span>
      </div>
      <div className="mt-2 text-2xl font-semibold text-white tabular-nums">
        {view.buyShare != null ? `${view.buyShare.toFixed(0)}%` : "—"}
      </div>
      <div className="text-[10px] uppercase tracking-wider text-white/60">Buy share</div>
      {view.impliedUpsidePct != null && (
        <div className="mt-1 text-[11px] text-white/80">
          {fmtPrice(view.avgPriceTarget, view.ticker.endsWith(".KS") ? "KRW" : "USD")} PT · {fmtPercent(view.impliedUpsidePct)}
        </div>
      )}
    </Link>
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
          {views.map((v) => (
            <li
              key={v.ticker}
              className="rounded-xl border border-white/10 bg-white/[0.02] p-3"
            >
              <p className="text-[13px] text-slate-300 leading-relaxed">{v.narrative}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
