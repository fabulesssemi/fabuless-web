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

export default async function AnalystsIndex() {
  const analysts = await fetchAnalystCoverage();

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      <header className="mb-6 pb-4 border-b border-gray-200">
        <div className="flex items-baseline justify-between">
          <div>
            <h1 className="font-sans text-2xl font-bold text-[#111827] tracking-tight">
              Wall Street Analysts
            </h1>
            <p className="mt-1 font-serif text-[15px] text-[#4a4a4a] leading-relaxed">
              The analysts who move semi stocks. Current ratings and price targets across the coverage universe.
            </p>
          </div>
          <Link href="/analyst-consensus" className="text-[11px] text-[#B45309] font-semibold hover:underline shrink-0">
            Consensus view →
          </Link>
        </div>
      </header>

      <div className="divide-y divide-gray-200 border-t border-gray-200">
        {analysts.map((analyst) => {
          const { bull, bear, neutral } = bullBearSummary(analyst.coverage);
          return (
            <Link
              key={analyst.id}
              href={`/analysts/${analyst.id}`}
              className="group flex items-stretch gap-4 py-4 hover:bg-[#FAFAF8] transition-colors -mx-3 px-3"
            >
              {/* Accent rail */}
              <div className="w-1 self-stretch rounded-full shrink-0" style={{ backgroundColor: analyst.accent }} />

              {/* Name + known for */}
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline gap-2 flex-wrap">
                  <span className="font-sans text-[16px] font-bold text-gray-900 tracking-tight group-hover:text-[#B45309] transition-colors leading-tight">
                    {analyst.name}
                  </span>
                  <span className="font-mono text-[10px] font-semibold uppercase tracking-wider" style={{ color: analyst.accent }}>
                    {analyst.firmDisplay}
                  </span>
                </div>
                <p className="mt-1 text-[12.5px] text-gray-500 leading-snug line-clamp-1">
                  {analyst.knownFor}
                </p>
              </div>

              {/* Rating breakdown + coverage count */}
              <div className="hidden md:flex items-center gap-5 shrink-0 self-center">
                <div className="flex items-center gap-3 text-[12px] tabular-nums">
                  <span className="text-emerald-600 font-semibold">{bull} <span className="text-gray-400 font-normal">buy</span></span>
                  <span className="text-gray-400 font-semibold">{neutral} <span className="text-gray-400 font-normal">hold</span></span>
                  <span className="text-rose-500 font-semibold">{bear} <span className="text-gray-400 font-normal">sell</span></span>
                </div>
                <div className="w-px h-8 bg-gray-200" />
                <div className="text-right w-[78px]">
                  <div className="text-[15px] font-bold text-gray-900 tabular-nums leading-none">{analyst.coverage.length}</div>
                  <div className="text-[10px] text-gray-400 uppercase tracking-wide mt-0.5">stocks</div>
                </div>
              </div>

              <div className="self-center shrink-0 text-[13px] font-semibold opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: analyst.accent }}>
                →
              </div>
            </Link>
          );
        })}
      </div>

      <p className="mt-8 text-[11px] text-gray-400 border-t border-gray-100 pt-4">
        Data via Yahoo Finance, refreshed hourly. Analyst names are matched to their firm&apos;s published ratings.
      </p>
    </div>
  );
}
