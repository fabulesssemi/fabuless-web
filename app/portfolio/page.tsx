import type { Metadata } from "next";
import Link from "next/link";
import { COMPANY_UNIVERSE } from "@/lib/companies";
import { getCompanyData } from "@/lib/providers";
import { predictions } from "@/lib/tracker/predictions";
import { getExpert } from "@/lib/tracker/experts";
import { PortfolioGate } from "./PortfolioGate";
import { EditHoldings } from "./EditHoldings";
import { RemoveTicker, AddTickerRow } from "./PortfolioRowActions";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "My Portfolio — Fabuless",
  description:
    "Your holdings, in context. Live prices, analyst consensus, open expert predictions, and upcoming earnings — filtered to the stocks you follow.",
};

const STATUS_META = {
  CORRECT:   { label: "Correct", bg: "bg-emerald-500", text: "text-white" },
  PARTIAL:   { label: "Partial", bg: "bg-amber-400",   text: "text-white" },
  WRONG:     { label: "Wrong",   bg: "bg-rose-500",    text: "text-white" },
  TOO_EARLY: { label: "Open",    bg: "bg-gray-100",    text: "text-gray-500" },
} as const;

const METABYTICKER = new Map(COMPANY_UNIVERSE.map((c) => [c.ticker, c]));

function parseEarningsDate(s?: string): Date | null {
  if (!s) return null;
  const cleaned = s.replace(/^[A-Za-z]{3,}\s+/, ""); // strip leading weekday
  const now = new Date();
  const d = new Date(`${cleaned} ${now.getFullYear()}`);
  if (isNaN(d.getTime())) return null;
  // a parsed date far in the past means it's next year's print
  if (d.getTime() < now.getTime() - 60 * 86_400_000) d.setFullYear(now.getFullYear() + 1);
  return d;
}

function daysUntil(d: Date): number {
  return Math.ceil((d.getTime() - Date.now()) / 86_400_000);
}

// Inline Buy/Hold/Sell consensus bar — 80px wide, 4px tall, no labels
function ConsensusBar({ dist }: { dist?: { strongBuy: number; buy: number; hold: number; sell: number; strongSell: number } }) {
  if (!dist) return <span className="text-[12px] text-gray-300">—</span>;
  const buy = dist.strongBuy + dist.buy;
  const hold = dist.hold;
  const sell = dist.sell + dist.strongSell;
  const total = buy + hold + sell;
  if (!total) return <span className="text-[12px] text-gray-300">—</span>;
  return (
    <div className="flex h-1 w-20 rounded-full overflow-hidden gap-px">
      {buy > 0 && <div className="bg-emerald-500" style={{ width: `${(buy / total) * 100}%` }} />}
      {hold > 0 && <div className="bg-gray-300" style={{ width: `${(hold / total) * 100}%` }} />}
      {sell > 0 && <div className="bg-rose-400" style={{ width: `${(sell / total) * 100}%` }} />}
    </div>
  );
}

type Row = {
  ticker: string;
  covered: boolean;
  slug?: string;
  name: string;
  price?: number;
  changePercent?: number;
  rating?: string;
  dist?: { strongBuy: number; buy: number; hold: number; sell: number; strongSell: number };
  openCount: number;
  earningsLabel?: string;
  earningsDate: Date | null;
};

export default async function PortfolioPage({
  searchParams,
}: {
  searchParams: Promise<{ t?: string }>;
}) {
  const { t } = await searchParams;
  const tickers = (t ?? "")
    .split(",")
    .map((s) => s.trim().toUpperCase())
    .filter(Boolean)
    // de-dupe, preserve order
    .filter((v, i, a) => a.indexOf(v) === i);

  // Empty state — hand off to the client gate (checks localStorage, else shows input)
  if (tickers.length === 0) {
    return <PortfolioGate />;
  }

  const rows: Row[] = await Promise.all(
    tickers.map(async (ticker): Promise<Row> => {
      const meta = METABYTICKER.get(ticker);
      const symbol = meta?.yahooSymbol ?? ticker;
      const data = await getCompanyData(symbol, meta?.newsKeywords);
      const openCount = predictions.filter(
        (p) => (p.companies ?? []).includes(ticker) && p.status === "TOO_EARLY",
      ).length;
      const earningsLabel = data.earnings?.nextEarningsDate;
      return {
        ticker,
        covered: !!meta,
        slug: meta?.slug,
        name: meta?.name ?? data.profile?.name ?? ticker,
        price: data.quote?.price,
        changePercent: data.quote?.changePercent,
        rating: data.consensus?.rating,
        dist: data.consensus?.distribution,
        openCount,
        earningsLabel,
        earningsDate: parseEarningsDate(earningsLabel),
      };
    }),
  );

  // What to watch — upcoming earnings within 30 days, soonest first
  const upcoming = rows
    .filter((r) => r.earningsDate && daysUntil(r.earningsDate) >= 0 && daysUntil(r.earningsDate) <= 30)
    .sort((a, b) => a.earningsDate!.getTime() - b.earningsDate!.getTime());

  // What to watch — recent expert predictions on held tickers, newest first
  const recent = predictions
    .filter((p) => (p.companies ?? []).some((c) => tickers.includes(c)))
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 5);

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      {/* Header */}
      <header className="mb-7">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#B45309] mb-1">
              Your Holdings
            </div>
            <h1 className="font-sans text-2xl font-bold text-[#111827] tracking-tight">
              My Portfolio
            </h1>
            <p className="mt-1 font-serif text-[15px] text-[#4a4a4a] leading-relaxed max-w-xl">
              Your stocks in context — live prices, analyst consensus, open expert calls, and earnings ahead.
            </p>
          </div>
          <EditHoldings tickers={tickers} />
        </div>
      </header>

      {/* Portfolio table — the hero */}
      <div className="rounded-xl border border-gray-100 bg-white shadow-sm overflow-hidden mb-10">
        {/* Column header */}
        <div className="grid grid-cols-[1fr_88px_64px_96px_88px_104px_20px] items-center gap-3 px-4 py-2.5 border-b border-gray-100 bg-gray-50/60">
          {["Holding", "Price", "Day", "Consensus", "Open calls", "Earnings", ""].map((h, i) => (
            <span
              key={i}
              className={`text-[9px] font-bold uppercase tracking-widest text-gray-400 ${i === 0 ? "" : "text-right"}`}
            >
              {h}
            </span>
          ))}
        </div>

        {rows.map((r, i) => {
          const up = (r.changePercent ?? 0) > 0;
          const down = (r.changePercent ?? 0) < 0;
          const dUntil = r.earningsDate ? daysUntil(r.earningsDate) : null;
          const earningsSoon = dUntil !== null && dUntil >= 0 && dUntil <= 14;

          return (
            <div
              key={r.ticker}
              className="relative grid grid-cols-[1fr_88px_64px_96px_88px_104px_20px] items-center gap-3 px-4 py-3.5 hover:bg-slate-50 transition-colors"
              style={{ borderTop: i > 0 ? "1px solid #F1F5F9" : undefined }}
            >
              {/* Full-row click target — sibling (not parent) of the open-calls link */}
              {r.covered && r.slug && (
                <Link
                  href={`/companies/${r.slug}`}
                  className="absolute inset-0 z-0"
                  aria-label={`${r.ticker} company page`}
                />
              )}

              {/* Holding */}
              <div className="relative z-10 pointer-events-none min-w-0 flex items-baseline gap-2">
                <span className="font-sans text-[14px] font-bold text-gray-900 tabular-nums">{r.ticker}</span>
                <span className="text-[12px] text-gray-400 truncate">{r.name}</span>
                {!r.covered && (
                  <span className="text-[9px] uppercase tracking-wide text-gray-300 font-semibold">no coverage</span>
                )}
              </div>

              {/* Price */}
              <div className="relative z-10 pointer-events-none text-right text-[13px] font-semibold text-gray-800 tabular-nums">
                {r.price != null ? `$${r.price.toFixed(2)}` : "—"}
              </div>

              {/* Day % */}
              <div
                className={`relative z-10 pointer-events-none text-right text-[12px] font-semibold tabular-nums ${
                  up ? "text-emerald-600" : down ? "text-rose-500" : "text-gray-400"
                }`}
              >
                {r.changePercent != null ? `${up ? "+" : ""}${r.changePercent.toFixed(1)}%` : "—"}
              </div>

              {/* Consensus */}
              <div className="relative z-10 pointer-events-none flex justify-end">
                <ConsensusBar dist={r.dist} />
              </div>

              {/* Open predictions */}
              <div className="relative z-10 text-right">
                {r.openCount > 0 ? (
                  <Link
                    href={`/tracker?company=${r.ticker}`}
                    className="text-[13px] font-bold text-[#B45309] tabular-nums hover:underline"
                  >
                    {r.openCount}
                  </Link>
                ) : (
                  <span className="text-[12px] text-gray-300 pointer-events-none">—</span>
                )}
              </div>

              {/* Earnings */}
              <div className="relative z-10 pointer-events-none text-right">
                {r.earningsLabel ? (
                  <span
                    className={`text-[12px] font-semibold tabular-nums ${
                      earningsSoon ? "text-[#B45309]" : "text-gray-500"
                    }`}
                  >
                    {r.earningsLabel.replace(/^[A-Za-z]{3,}\s+/, "")}
                  </span>
                ) : (
                  <span className="text-[12px] text-gray-300">—</span>
                )}
              </div>

              {/* Remove */}
              <RemoveTicker ticker={r.ticker} allTickers={tickers} />
            </div>
          );
        })}
        <AddTickerRow allTickers={tickers} />
      </div>

      {/* What to watch */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Upcoming earnings */}
        <section>
          <h2 className="text-[11px] font-bold uppercase tracking-widest text-gray-700 mb-3">
            Upcoming earnings
          </h2>
          {upcoming.length === 0 ? (
            <p className="font-serif text-[13px] text-[#4a4a4a]">No earnings in the next 30 days for your holdings.</p>
          ) : (
            <ul className="rounded-xl border border-gray-100 bg-white shadow-sm overflow-hidden">
              {upcoming.map((r, i) => {
                const d = daysUntil(r.earningsDate!);
                const soon = d <= 7;
                return (
                  <li
                    key={r.ticker}
                    className="flex items-center justify-between px-4 py-3"
                    style={{ borderTop: i > 0 ? "1px solid #F1F5F9" : undefined }}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="font-sans text-[13px] font-bold text-gray-900 tabular-nums w-12">{r.ticker}</span>
                      <span className="text-[12px] text-gray-500 tabular-nums">{r.earningsLabel?.replace(/^[A-Za-z]{3,}\s+/, "")}</span>
                    </div>
                    <span
                      className={`text-[11px] font-semibold tabular-nums ${soon ? "text-[#B45309]" : "text-gray-400"}`}
                    >
                      {d === 0 ? "today" : d === 1 ? "tomorrow" : `${d} days`}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        {/* Recent analyst activity */}
        <section>
          <h2 className="text-[11px] font-bold uppercase tracking-widest text-gray-700 mb-3">
            Recent expert calls on your stocks
          </h2>
          {recent.length === 0 ? (
            <p className="font-serif text-[13px] text-[#4a4a4a]">No tracked predictions on your holdings yet.</p>
          ) : (
            <ul className="rounded-xl border border-gray-100 bg-white shadow-sm overflow-hidden">
              {recent.map((p, i) => {
                const expert = getExpert(p.expert);
                const sm = STATUS_META[p.status];
                const heldTickers = (p.companies ?? []).filter((c) => tickers.includes(c));
                return (
                  <li
                    key={p.id}
                    style={{ borderTop: i > 0 ? "1px solid #F1F5F9" : undefined }}
                  >
                    <Link href={`/tracker/${p.expert}`} className="block px-4 py-3 hover:bg-slate-50 transition-colors">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="text-[12px] font-bold text-gray-900">{expert?.name ?? p.speaker}</span>
                          {heldTickers.map((tk) => (
                            <span key={tk} className="text-[9px] font-bold px-1.5 py-0.5 bg-gray-100 text-gray-500 rounded border border-gray-200 tracking-wide">
                              {tk}
                            </span>
                          ))}
                        </div>
                        <span className={`shrink-0 text-[9px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full ${sm.bg} ${sm.text}`}>
                          {sm.label}
                        </span>
                      </div>
                      <p className="font-serif text-[12.5px] text-[#4a4a4a] leading-snug line-clamp-2">{p.claim}</p>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>

      <p className="mt-10 pt-5 border-t border-gray-100 font-serif text-[11px] text-[#4a4a4a] leading-relaxed max-w-2xl">
        Prices and consensus via Yahoo Finance, refreshed every few minutes. Predictions are editorial judgments
        drawn from public sources. Independent analysis — not investment advice.
      </p>
    </div>
  );
}
