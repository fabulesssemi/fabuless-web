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

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {analysts.map((analyst) => {
          const { bull, bear, neutral } = bullBearSummary(analyst.coverage);
          return (
            <Link key={analyst.id} href={`/analysts/${analyst.id}`}>
              <div className="border border-gray-100 p-4 hover:border-gray-300 hover:shadow-sm transition-all h-full flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center text-white text-[12px] font-bold shrink-0"
                    style={{ backgroundColor: analyst.accent }}
                  >
                    {analyst.name.split(" ").map((n) => n[0]).join("")}
                  </div>
                  <div className="min-w-0">
                    <div className="text-[14px] font-bold text-gray-900 leading-tight">{analyst.name}</div>
                    <div className="text-[11px] text-gray-400">{analyst.firmDisplay}</div>
                  </div>
                </div>

                <p className="text-[12px] text-gray-500 leading-snug flex-1">{analyst.knownFor}</p>

                <div className="flex items-center gap-4 pt-1 border-t border-gray-50">
                  <span className="text-[11px] font-semibold text-emerald-600">▲ {bull} bull</span>
                  <span className="text-[11px] font-semibold text-rose-500">▼ {bear} bear</span>
                  <span className="text-[11px] text-gray-300">— {neutral}</span>
                  <span className="ml-auto text-[10px] text-[#B45309] font-semibold">View →</span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      <p className="mt-10 text-[11px] text-gray-400 border-t border-gray-100 pt-4">
        Data via Yahoo Finance, refreshed hourly. Analyst names are matched to their firm&apos;s published ratings.
      </p>
    </div>
  );
}
