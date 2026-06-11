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
          Every issue, in order. Shipped Fridays.
        </p>
      </div>

      <div className="space-y-0 divide-y divide-gray-200">
        {issues.map((issue) => {
          const allStories = issue.sections.flatMap((s) => s.stories);
          const preview = allStories.slice(0, 3);

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
              <h2 className="font-sans text-xl font-bold text-[#111827] leading-snug mb-4 group-hover:text-[#B45309] transition-colors">
                {issue.title}
              </h2>

              {/* Story preview list */}
              <ul className="space-y-1.5 mb-4">
                {preview.map((story) => (
                  <li key={story.url} className="flex items-start gap-2">
                    <span className="text-[#B45309] mt-[3px] shrink-0 text-[10px]">▸</span>
                    <div className="min-w-0">
                      <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mr-2">
                        {story.source}
                      </span>
                      <span className="text-[13px] text-gray-600 leading-snug">
                        {story.headline}
                      </span>
                    </div>
                  </li>
                ))}
                {allStories.length > 3 && (
                  <li className="text-[12px] text-gray-400 pl-4">
                    +{allStories.length - 3} more stories
                  </li>
                )}
              </ul>

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
