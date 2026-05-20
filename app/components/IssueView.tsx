import type { Issue } from "@/lib/issues";

const categoryColors: Record<string, string> = {
  "Compute": "bg-violet-50 text-violet-700 border-violet-200",
  "Capital Flows": "bg-emerald-50 text-emerald-700 border-emerald-200",
  "Geopolitics & Policy": "bg-amber-50 text-amber-700 border-amber-200",
  "Memory & Networking": "bg-sky-50 text-sky-700 border-sky-200",
  "Other": "bg-gray-50 text-gray-500 border-gray-200",
};

const categoryBorder: Record<string, string> = {
  "Compute": "border-violet-300",
  "Capital Flows": "border-emerald-300",
  "Geopolitics & Policy": "border-amber-300",
  "Memory & Networking": "border-sky-300",
  "Other": "border-gray-200",
};

export function IssueView({ issue, showEarnings = true }: { issue: Issue; showEarnings?: boolean }) {
  return (
    <div className="flex gap-8 items-start">
      {/* Main feed */}
      <div className="flex-1 min-w-0 space-y-0">
        {issue.sections.map((section) => (
          <div
            key={section.category}
            className={`border-l-4 ${categoryBorder[section.category]} pl-4 mb-8`}
          >
            <div className="mb-3">
              <span className={`inline-block text-[10px] font-semibold uppercase tracking-widest px-2 py-0.5 rounded border ${categoryColors[section.category]}`}>
                {section.category}
              </span>
            </div>

            <div className="space-y-5">
              {section.stories.map((story) => (
                <div key={story.url} className="flex gap-3 items-start">
                  <div className="flex-1 min-w-0">
                    <div className="text-[11px] font-medium text-gray-400 uppercase tracking-wide mb-0.5">
                      {story.source}
                    </div>
                    <a
                      href={story.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-serif text-[1.1rem] leading-snug text-[#1a1a2e] hover:text-[#0E7490] transition-colors"
                    >
                      {story.headline}
                    </a>
                    <p className="text-sm text-gray-500 italic leading-relaxed mt-1">
                      {story.oneliner}
                    </p>
                  </div>
                  {story.image && (
                    <a href={story.url} target="_blank" rel="noopener noreferrer" className="shrink-0">
                      <img
                        src={story.image}
                        alt={story.headline}
                        className="w-28 object-cover rounded"
                        style={{ height: "72px" }}
                      />
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* Podcasts */}
        {issue.podcasts.length > 0 && (
          <div className="border-l-4 border-[#0E7490] pl-4 mb-8">
            <div className="mb-3">
              <span className="inline-block text-[10px] font-semibold uppercase tracking-widest px-2 py-0.5 rounded border bg-teal-50 text-teal-700 border-teal-200">
                Podcasts
              </span>
            </div>
            <div className="space-y-4">
              {issue.podcasts.map((p) => (
                <div key={p.url}>
                  <div className="text-[11px] font-medium text-gray-400 uppercase tracking-wide mb-0.5">{p.show}</div>
                  <a
                    href={p.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-serif text-[1.1rem] leading-snug text-[#1a1a2e] hover:text-[#0E7490] transition-colors"
                  >
                    {p.title}
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Sidebar */}
      <div className="w-64 shrink-0 space-y-6">
        <div className="border border-gray-100 rounded-lg p-4">
          <div className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 mb-3">This Issue</div>
          <div className="space-y-2">
            {issue.sections.map((s) => (
              <div key={s.category} className="flex items-center gap-2">
                <span className={`inline-block text-[10px] font-semibold uppercase tracking-widest px-2 py-0.5 rounded border ${categoryColors[s.category]}`}>
                  {s.category}
                </span>
                <span className="text-xs text-gray-400">{s.stories.length} {s.stories.length === 1 ? "story" : "stories"}</span>
              </div>
            ))}
          </div>
        </div>

        {showEarnings && issue.earnings.length > 0 && (
          <div className="border border-gray-100 rounded-lg p-4">
            <div className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 mb-3">Upcoming Earnings</div>
            <div className="space-y-3">
              {issue.earnings.map((e) => (
                <div key={e.ticker} className="border-b border-gray-50 pb-3 last:border-0 last:pb-0">
                  <div className="flex justify-between items-baseline">
                    <span className="font-medium text-sm text-[#374151]">{e.company}</span>
                    <span className="text-xs font-mono text-[#0E7490]">{e.ticker}</span>
                  </div>
                  <div className="text-[11px] text-gray-400">{e.date}</div>
                  <div className="flex gap-3 mt-0.5 text-[11px] text-gray-500">
                    <span>EPS est. {e.eps}</span>
                    <span>{e.avgMove} avg</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
