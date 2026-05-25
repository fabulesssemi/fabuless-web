import Link from "next/link";

const issues = [
  {
    number: 2,
    date: "May 22, 2026",
    title: "AMD's $10B Taiwan Bet, Nvidia's Investor Fatigue, and the High-NA EUV Delay",
    slug: "issue-2",
  },
  {
    number: 1,
    date: "May 20, 2026",
    title: "Cerebras vs. Nvidia, TSMC's TAM Expansion, and the AMD Upgrade",
    slug: "issue-1",
  },
];

export default function Archive() {
  return (
    <div className="max-w-4xl mx-auto px-6 pt-16 pb-8">
      <h1 className="font-sans text-4xl text-[#0E7490] mb-2 tracking-tight">
        Archive
      </h1>
      <p className="text-[#374151] mb-10 leading-relaxed">
        Every issue, in order. Shipped Fridays.
      </p>

      <div className="divide-y divide-gray-100">
        {issues.map((issue) => (
          <Link
            key={issue.slug}
            href={`/archive/${issue.slug}`}
            className="py-5 flex items-baseline justify-between gap-6 group hover:bg-gray-50 -mx-4 px-4 rounded transition-colors"
          >
            <div>
              <span className="text-xs font-medium text-[#0E7490] uppercase tracking-widest mr-3">
                Issue {issue.number}
              </span>
              <span className="font-sans text-lg text-[#374151] group-hover:text-[#0E7490] transition-colors">
                {issue.title}
              </span>
            </div>
            <span className="text-sm text-gray-400 whitespace-nowrap">{issue.date}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
