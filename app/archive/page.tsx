import Link from "next/link";
import { issues } from "@/lib/issues";

export default function Archive() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      <div className="mb-10">
        <h1 className="font-sans text-2xl font-bold text-[#111827] tracking-tight">
          Archive
        </h1>
        <p className="font-serif text-[15px] text-[#4a4a4a] mt-1">
          Every issue, in order. Updated daily.
        </p>
      </div>

      <div className="space-y-0 divide-y divide-gray-200">
        {issues.map((issue) => {
          const allStories = issue.sections.flatMap((s) => s.stories);

          return (
            <Link
              key={issue.slug}
              href={`/archive/${issue.slug}`}
              className="block py-8 group hover:bg-gray-50 -mx-4 px-4 transition-colors"
            >
              {/* Meta row */}
              <div className="flex items-baseline justify-between gap-4 mb-3">
                <span className="text-[11px] font-bold text-[#B45309] uppercase tracking-widest">
                  Issue {issue.number}
                </span>
                <span className="text-[13px] text-gray-400">{issue.date}</span>
              </div>

              {/* Issue title */}
              <h2 className="font-sans text-xl font-bold text-[#111827] leading-snug mb-3 group-hover:text-[#B45309] transition-colors">
                {issue.title}
              </h2>

              {/* Story count + read time */}
              <div className="flex items-center gap-2 mb-3">
                <span className="text-[11px] text-gray-400">{allStories.length} stories</span>
                <span className="text-[11px] text-gray-300">·</span>
                <span className="text-[11px] text-gray-400">~{Math.ceil(allStories.length * 0.6)} min read</span>
              </div>

              {/* Category pills — The Information-style content badges */}
              <div className="flex flex-wrap gap-1.5 mb-4">
                {issue.sections.filter((s) => s.stories.length > 0).map((s) => (
                  <span
                    key={s.category}
                    className="text-[10px] font-semibold px-2 py-0.5 border border-gray-200 text-gray-500 uppercase tracking-wider"
                  >
                    {s.category}
                  </span>
                ))}
              </div>

              <span className="text-[12px] font-semibold text-[#B45309] group-hover:underline underline-offset-2">
                Read issue →
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
