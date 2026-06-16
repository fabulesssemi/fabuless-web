import type { Issue } from "@/lib/issues";

export function IssueView({ issue, showEarnings = true }: { issue: Issue; showEarnings?: boolean }) {
  const hasSidebar = showEarnings && issue.earnings.length > 0;
  const seenUrls = new Set<string>();

  const sectionsToRender = issue.sections
    .map((section) => ({
      ...section,
      stories: section.stories.filter(
        (story) => !seenUrls.has(story.url) && seenUrls.add(story.url)
      ),
    }))
    .filter((s) => s.stories.length > 0);

  return (
    <div className={hasSidebar ? "flex gap-10 items-start" : ""}>
      <div className={hasSidebar ? "flex-1 min-w-0" : ""}>

        {sectionsToRender.map((section, sIdx) => (
          <div key={section.category}>
            {/* Section header — TLDR-style: category · count */}
            <div className={[
              "flex items-center gap-2 pb-3 border-t border-gray-200",
              sIdx > 0 ? "pt-6" : "pt-0 border-t-0",
            ].join(" ")}>
              <span className="text-[10px] font-bold text-[#B45309] uppercase tracking-widest">
                {section.category}
              </span>
              <span className="text-[10px] text-gray-300">·</span>
              <span className="text-[10px] text-gray-400">
                {section.stories.length} {section.stories.length === 1 ? "story" : "stories"}
              </span>
            </div>

            {/* 2-column story grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 divide-x divide-gray-200">
              {section.stories.map((story, i) => (
                <div
                  key={story.url}
                  className={[
                    "py-5",
                    i % 2 === 0 ? "pr-8" : "pl-8",
                    i >= 2 ? "border-t border-gray-200" : "",
                  ].filter(Boolean).join(" ")}
                >
                  <div className="flex gap-4 items-start">
                    <div className="flex-1 min-w-0">
                      <div className="text-[11px] font-bold text-[#B45309] uppercase tracking-wider mb-1.5">
                        {story.source}
                      </div>
                      <a
                        href={story.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block font-sans text-[1.05rem] font-bold leading-snug text-[#111827] hover:text-[#B45309] transition-colors mb-2"
                      >
                        {story.headline}
                      </a>
                      <p className="font-serif text-[13px] text-[#4a4a4a] leading-relaxed">
                        {story.oneliner}
                      </p>
                    </div>

                    {story.image && (
                      <a href={story.url} target="_blank" rel="noopener noreferrer" className="shrink-0">
                        <img
                          src={story.image}
                          alt={story.headline}
                          className="w-[130px] object-cover"
                          style={{ height: "88px" }}
                        />
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* Podcasts */}
        {issue.podcasts.length > 0 && (
          <div className="mt-2 pt-5 border-t-2 border-[#B45309]">
            <div className="text-[10px] font-bold uppercase tracking-widest text-[#B45309] mb-3">
              Podcasts
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 divide-x divide-gray-200">
              {issue.podcasts.map((p, i) => (
                <div
                  key={p.url}
                  className={[
                    "py-4 flex gap-3 items-start",
                    i % 2 === 0 && i < issue.podcasts.length - 1 ? "pr-8" : i % 2 === 1 ? "pl-8" : "",
                  ].filter(Boolean).join(" ")}
                >
                  {p.image && (
                    <img src={p.image} alt="" className="w-14 h-14 object-cover shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-0.5">
                      {p.show}
                    </div>
                    <a
                      href={p.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-sans text-[0.95rem] font-semibold leading-snug text-[#111827] hover:text-[#B45309] transition-colors"
                    >
                      {p.title}
                    </a>
                    {p.oneliner && (
                      <p className="font-serif text-[12px] text-[#4a4a4a] leading-snug mt-1">{p.oneliner}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Sidebar — only rendered when showing earnings */}
      {hasSidebar && (
        <div className="w-60 shrink-0">
          <div className="border border-gray-200 p-4">
            <div className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">Upcoming Earnings</div>
            <div className="text-[10px] text-gray-400 mb-3 leading-snug">
              Avg = 2-day post-earnings move, last 20 quarters
            </div>
            <div className="space-y-3">
              {issue.earnings.map((e) => (
                <div key={e.ticker} className="border-b border-gray-100 pb-3 last:border-0 last:pb-0">
                  <div className="flex justify-between items-baseline">
                    <span className="font-semibold text-sm text-[#111827]">{e.company}</span>
                    <span className="text-xs font-mono text-[#B45309]">{e.ticker}</span>
                  </div>
                  <div className="text-[11px] text-gray-400">{e.date}</div>
                  <div className="flex gap-3 mt-0.5 text-[11px] text-gray-500">
                    <span>EPS est. {e.eps}</span>
                    <span>{e.avgMove} post-ER</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
