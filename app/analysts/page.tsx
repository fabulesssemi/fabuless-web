import type { Metadata } from "next";
import Link from "next/link";
import { fetchAnalystCoverage } from "@/lib/analyst/analysts";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Wall Street Analysts — Fabuless",
  description: "Top semiconductor analysts on Wall Street — current price targets, ratings, and coverage across AI chips, memory, and equipment.",
};

const RATING_SCORE: Record<string, number> = {
  "Strong Buy": 2, "Buy": 1, "Outperform": 1, "Overweight": 1,
  "Hold": 0, "Neutral": 0, "Equal-Weight": 0, "Market Perform": 0,
  "Underperform": -1, "Underweight": -1, "Sell": -2,
};

function initials(name: string) {
  return name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
}

// Google favicon service — works for every domain, no auth, no hotlink blocks
const FIRM_DOMAINS: Record<string, string> = {
  arya:    "bankofamerica.com",
  moore:   "morganstanley.com",
  rasgon:  "bernstein.com",
  mcneill: "jpmorgan.com",
  lu:      "cantor.com",
  lurie:   "wolferesearch.com",
  curtis:  "jefferies.com",
  egan:    "ubs.com",
  omalley: "barclays.com",
};

const firmLogoUrl = (id: string) =>
  FIRM_DOMAINS[id]
    ? `https://www.google.com/s2/favicons?domain=${FIRM_DOMAINS[id]}&sz=128`
    : null;

function bullBearSummary(coverage: { rating: string }[]) {
  let bull = 0, bear = 0, neutral = 0;
  for (const c of coverage) {
    const s = RATING_SCORE[c.rating] ?? 0;
    if (s > 0) bull++;
    else if (s < 0) bear++;
    else neutral++;
  }
  return { bull, bear, neutral };
}

function avgUpside(coverage: { upsidePct: number | null }[]) {
  const valid = coverage.map((c) => c.upsidePct).filter((u): u is number => u !== null);
  if (!valid.length) return null;
  return Math.round(valid.reduce((a, b) => a + b, 0) / valid.length * 10) / 10;
}

// Compact stacked bar: bull = green, neutral = gray, bear = red
function RatingBar({ bull, neutral, bear }: { bull: number; neutral: number; bear: number }) {
  const total = bull + neutral + bear;
  if (!total) return null;
  const bPct = (bull / total) * 100;
  const nPct = (neutral / total) * 100;
  const rPct = (bear / total) * 100;
  return (
    <div className="flex h-1.5 w-24 rounded-full overflow-hidden gap-px">
      {bull > 0 && <div className="bg-emerald-500 rounded-l-full" style={{ width: `${bPct}%` }} />}
      {neutral > 0 && <div className="bg-gray-300" style={{ width: `${nPct}%` }} />}
      {bear > 0 && <div className="bg-rose-400 rounded-r-full" style={{ width: `${rPct}%` }} />}
    </div>
  );
}

export default async function AnalystsIndex() {
  const analysts = await fetchAnalystCoverage();

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      <header className="mb-8">
        <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#B45309] mb-1">
          Equity Research
        </div>
        <div className="flex items-end justify-between gap-4">
          <div>
            <h1 className="font-sans text-2xl font-bold text-[#111827] tracking-tight">
              Wall Street Analysts
            </h1>
            <p className="mt-1 font-serif text-[15px] text-[#4a4a4a] leading-relaxed">
              The analysts who move semi stocks. Live ratings and price targets across the coverage universe.
            </p>
          </div>
          <Link
            href="/analyst-consensus"
            className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#B45309] text-white text-[11px] font-bold uppercase tracking-widest hover:bg-[#92400e] transition-colors"
          >
            Consensus view <span className="text-[13px]">→</span>
          </Link>
        </div>
      </header>

      {/* Column headers */}
      <div className="hidden md:grid grid-cols-[1fr_160px_180px_100px] gap-4 px-4 mb-2">
        <div className="text-[10px] font-semibold uppercase tracking-widest text-gray-400">Analyst</div>
        <div className="text-[10px] font-semibold uppercase tracking-widest text-gray-400">Sentiment</div>
        <div className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 text-center">Buy · Hold · Sell</div>
        <div className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 text-right">Avg Upside</div>
      </div>

      <div className="flex flex-col gap-2">
        {analysts.map((analyst) => {
          const { bull, bear, neutral } = bullBearSummary(analyst.coverage);
          const upside = avgUpside(analyst.coverage);
          const bullPct = analyst.coverage.length ? Math.round((bull / analyst.coverage.length) * 100) : 0;

          return (
            <Link
              key={analyst.id}
              href={`/analysts/${analyst.id}`}
              className="group relative flex items-center gap-4 rounded-xl border border-gray-100 bg-white px-4 py-4 shadow-sm hover:shadow-md hover:border-gray-200 transition-all duration-150"
            >
              {/* Left accent */}
              <div
                className="absolute left-0 top-3 bottom-3 w-[3px] rounded-full"
                style={{ backgroundColor: analyst.accent }}
              />

              {/* Firm logo badge */}
              <div
                className="shrink-0 w-10 h-10 rounded-xl flex items-center justify-center overflow-hidden"
                style={{ backgroundColor: `${analyst.accent}18`, border: `1.5px solid ${analyst.accent}30` }}
              >
                {firmLogoUrl(analyst.id) ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={firmLogoUrl(analyst.id)!}
                    alt={analyst.firmDisplay}
                    width={28}
                    height={28}
                    className="object-contain rounded-sm"
                  />
                ) : (
                  <span className="text-[13px] font-bold" style={{ color: analyst.accent }}>
                    {initials(analyst.name)}
                  </span>
                )}
              </div>

              {/* Name + firm + known-for */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-sans text-[15px] font-bold text-gray-900 tracking-tight group-hover:text-[#B45309] transition-colors">
                    {analyst.name}
                  </span>
                  <span
                    className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full"
                    style={{ color: analyst.accent, backgroundColor: `${analyst.accent}18` }}
                  >
                    {analyst.firmDisplay}
                  </span>
                  <span className="text-[10px] text-gray-400 font-medium">{analyst.title}</span>
                </div>
                <p className="mt-0.5 text-[12px] text-gray-500 leading-snug line-clamp-1">
                  {analyst.knownFor}
                </p>
              </div>

              {/* Sentiment bar + bull% */}
              <div className="hidden md:flex flex-col gap-1.5 w-40 shrink-0">
                <RatingBar bull={bull} neutral={neutral} bear={bear} />
                <div className="text-[11px] text-gray-400 tabular-nums">
                  <span className="text-emerald-600 font-semibold">{bullPct}% bullish</span>
                  {" · "}
                  <span>{analyst.coverage.length} stocks</span>
                </div>
              </div>

              {/* Buy / Hold / Sell counts */}
              <div className="hidden md:flex items-center gap-3 w-44 shrink-0 justify-center">
                <div className="text-center">
                  <div className="text-[15px] font-bold text-emerald-600 tabular-nums leading-none">{bull}</div>
                  <div className="text-[9px] uppercase tracking-widest text-gray-400 mt-0.5">Buy</div>
                </div>
                <div className="w-px h-6 bg-gray-200" />
                <div className="text-center">
                  <div className="text-[15px] font-bold text-gray-400 tabular-nums leading-none">{neutral}</div>
                  <div className="text-[9px] uppercase tracking-widest text-gray-400 mt-0.5">Hold</div>
                </div>
                <div className="w-px h-6 bg-gray-200" />
                <div className="text-center">
                  <div className="text-[15px] font-bold text-rose-400 tabular-nums leading-none">{bear}</div>
                  <div className="text-[9px] uppercase tracking-widest text-gray-400 mt-0.5">Sell</div>
                </div>
              </div>

              {/* Avg upside */}
              <div className="hidden md:block text-right w-24 shrink-0">
                {upside !== null ? (
                  <>
                    <div className={`text-[17px] font-bold tabular-nums leading-none ${upside >= 0 ? "text-emerald-600" : "text-rose-500"}`}>
                      {upside >= 0 ? "+" : ""}{upside}%
                    </div>
                    <div className="text-[9px] uppercase tracking-widest text-gray-400 mt-0.5">avg upside</div>
                  </>
                ) : (
                  <span className="text-[12px] text-gray-300">—</span>
                )}
              </div>

              {/* Chevron */}
              <div className="shrink-0 text-gray-300 group-hover:text-[#B45309] transition-colors text-[13px]">
                →
              </div>
            </Link>
          );
        })}
      </div>

      <p className="mt-6 text-[11px] text-gray-400 border-t border-gray-100 pt-4">
        Data via Yahoo Finance, refreshed hourly. Avg upside calculated from current price vs. price target across all covered stocks.
      </p>
    </div>
  );
}
