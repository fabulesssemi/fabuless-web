import type { Issue } from "@/lib/issues";

const CATEGORY_COLOR: Record<string, string> = {
  "Compute": "text-violet-600",
  "Capital Flows": "text-emerald-700",
  "Geopolitics & Policy": "text-amber-700",
  "Memory & Networking": "text-sky-700",
  "Other": "text-gray-500",
};

export function IssueView({ issue, showEarnings = true }: { issue: Issue; showEarnings?: boolean }) {
  void showEarnings; // reserved for future sidebar use
  const sections = issue.sections.filter((s) => s.stories.length > 0);

  return (
    <div>

      {/* Stories grouped by category */}
      <div>
        {sections.map((section, idx) => (
          <div
            key={section.category}
            className={idx === 0 ? "pb-7" : "py-7 border-t border-gray-100"}
          >
            {/* Category header */}
            <div className="flex items-center gap-3 mb-5">
              <span className={`text-[10px] font-bold uppercase tracking-[0.18em] ${CATEGORY_COLOR[section.category] ?? "text-gray-500"}`}>
                {section.category}
              </span>
              <div className="flex-1 h-px bg-gray-100" />
            </div>

            {/* Stories */}
            <div className="space-y-6">
              {section.stories.map((story) => (
                <div key={story.url}>
                  <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">
                    {story.source}
                  </div>
                  <a
                    href={story.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-serif text-[1.05rem] font-semibold leading-snug text-[#111827] hover:text-[#B45309] transition-colors duration-150 block mb-1.5"
                  >
                    {story.headline}
                  </a>
                  <p className="text-[13px] text-gray-500 italic leading-relaxed">
                    {story.oneliner}
                  </p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Podcasts */}
      {issue.podcasts.length > 0 && (
        <div className="pt-7 border-t border-gray-200">
          <div className="flex items-center gap-3 mb-5">
            <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-gray-400">
              Podcasts
            </span>
            <div className="flex-1 h-px bg-gray-100" />
          </div>
          <div className="space-y-6">
            {issue.podcasts.map((p) => (
              <div key={p.url} className="flex gap-4 items-start">
                {p.image && (
                  <img
                    src={p.image}
                    alt=""
                    className="w-11 h-11 object-cover shrink-0 rounded-sm"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">
                    {p.show}
                  </div>
                  <a
                    href={p.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-serif text-[1.05rem] font-semibold leading-snug text-[#111827] hover:text-[#B45309] transition-colors duration-150 block mb-1.5"
                  >
                    {p.title}
                  </a>
                  {p.oneliner && (
                    <p className="text-[13px] text-gray-500 italic leading-relaxed">
                      {p.oneliner}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
