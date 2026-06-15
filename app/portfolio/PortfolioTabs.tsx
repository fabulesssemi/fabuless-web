import Link from "next/link";

const NAV_LINKS = [
  { label: "Earnings",     href: "/earnings" },
  { label: "Expert Calls", href: "/tracker" },
  { label: "Analysts",     href: "/analysts" },
];

export type EarningsRow = {
  ticker: string;
  companyName: string;
  label: string;
  daysUntil: number;
  earningsSlug: string | null;
};

export type AnalystRow = {
  ticker: string;
  companyName: string;
  analysts: {
    id: string;
    name: string;
    firmDisplay: string;
    rating: string;
    priceTarget: number | null;
    upsidePct: number | null;
    action: string;
    accent: string;
  }[];
  avgTarget: number | null;
  avgUpside: number | null;
};

export function PortfolioTabs({
  earnings,
}: {
  earnings: EarningsRow[];
  calls?: unknown[];
  experts?: unknown;
  analystRows?: unknown[];
  tickers?: string[];
  pastSummaries?: unknown;
}) {
  const upcomingCount = earnings.length;

  return (
    <div className="flex items-start justify-between gap-4 mb-8">
      <div>
        <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#B45309] mb-1">Your Holdings</div>
        <h1 className="font-sans text-2xl font-bold text-[#111827] tracking-tight">My Portfolio</h1>
        <p className="mt-1 font-serif text-[15px] text-[#4a4a4a] leading-relaxed max-w-xl">
          Your stocks in context — live prices, analyst consensus, open expert calls, and earnings ahead.
        </p>
      </div>

      {/* Nav links — go to dedicated pages */}
      <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1 shrink-0 mt-1">
        {NAV_LINKS.map(({ label, href }) => (
          <Link
            key={href}
            href={href}
            className="px-3 py-1.5 text-[11px] font-semibold text-gray-500 hover:text-gray-800 hover:bg-white rounded-md transition-colors flex items-center gap-1"
          >
            {label}
            {label === "Earnings" && upcomingCount > 0 && (
              <span className="text-[9px] font-bold tabular-nums text-[#B45309]">{upcomingCount}</span>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}
