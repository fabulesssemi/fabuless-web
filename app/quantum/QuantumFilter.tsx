"use client";

import type { QuantumArticle } from "@/lib/quantum/articles";

const CATEGORY_LABELS: Record<string, string> = {
  hardware: "Hardware", software: "Software", market: "Market",
  research: "Research", policy: "Policy", consciousness: "Consciousness",
};

// Single accent color — matches the quantum page header (#312E81 indigo)
const ACCENT = "#4338CA";

function TopLabel() {
  return <span className="text-[11px] font-semibold uppercase tracking-widest" style={{ color: ACCENT }}>Top Stories</span>;
}

function CategoryLabel({ category }: { category: string }) {
  return (
    <span className="text-[11px] font-semibold uppercase tracking-widest" style={{ color: ACCENT }}>
      {CATEGORY_LABELS[category] ?? category}
    </span>
  );
}

export function QuantumFilter({ articles }: { articles: QuantumArticle[] }) {
  const topStories = articles.filter((a) => a.topStory && a.image).slice(0, 3);
  const topIds = new Set(topStories.map((a) => a.id));
  const rest = articles.filter((a) => !topIds.has(a.id)).slice(0, 12);

  const hero = topStories[0] ?? null;
  const mid = topStories.slice(1, 3);
  const rail = topStories.slice(3, 4).concat(rest.slice(0, 4));

  if (articles.length === 0) {
    return (
      <div className="text-center py-12 text-gray-400 font-serif text-[14px]">
        No articles yet — pipeline runs tomorrow morning.
      </div>
    );
  }

  return (
    <>
      {/* ── 3-column hero section ── */}
      <section className="pb-8 border-b border-gray-200">

        <div className="grid grid-cols-1 lg:grid-cols-[46fr_26fr_28fr] gap-0 lg:divide-x lg:divide-gray-200">

          {/* LEFT — hero story */}
          {hero && (
            <div className="lg:pr-10 pb-6 lg:pb-0 lg:-ml-6">
              <a href={hero.sourceUrl} target="_blank" rel="noopener noreferrer" className="block mb-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={hero.image!}
                  alt={hero.title}
                  className="w-full object-cover"
                  style={{ maxHeight: "320px" }}
                />
              </a>
              <TopLabel />
              <a
                href={hero.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="block mt-2 font-serif text-[2.1rem] font-normal text-[#111827] leading-tight hover:text-[#312E81] transition-colors"
              >
                {hero.title}
              </a>
              <p className="mt-3 font-serif text-[14px] text-[#4a4a4a] leading-relaxed line-clamp-3">
                {hero.summary}
              </p>
              <p className="mt-2 text-[11px] text-gray-400">{hero.source}</p>
            </div>
          )}

          {/* MIDDLE — 2 stacked stories with photos */}
          <div className="lg:px-6 flex flex-col gap-6 border-t border-gray-200 lg:border-t-0 pt-6 lg:pt-0">
            {[0, 1].map((i) => {
              const article = mid[i];
              if (article) return (
                <div key={article.id}>
                  <a href={article.sourceUrl} target="_blank" rel="noopener noreferrer" className="block mb-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={article.image!}
                      alt={article.title}
                      className="w-full object-cover"
                      style={{ maxHeight: "160px" }}
                    />
                  </a>
                  <TopLabel />
                  <a
                    href={article.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block mt-1.5 font-serif text-[1.35rem] font-normal text-[#111827] leading-snug hover:text-[#312E81] transition-colors"
                  >
                    {article.title}
                  </a>
                  <p className="mt-1 text-[11px] text-gray-400">{article.source}</p>
                </div>
              );
              return (
                <div key={`placeholder-${i}`}>
                  <div className="w-full bg-indigo-50 animate-pulse mb-3" style={{ height: "160px" }} />
                  <div className="h-2.5 w-20 bg-gray-200 rounded animate-pulse mb-2" />
                  <div className="h-5 bg-gray-200 rounded animate-pulse mb-1.5" />
                  <div className="h-5 w-3/4 bg-gray-200 rounded animate-pulse mb-2" />
                  <div className="h-2.5 w-24 bg-gray-100 rounded animate-pulse" />
                </div>
              );
            })}
          </div>

          {/* RIGHT RAIL — text-only headlines */}
          <div className="lg:pl-6 flex flex-col border-t border-gray-200 lg:border-t-0 pt-6 lg:pt-0">
            <div className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-4">More Stories</div>
            <div className="flex flex-col divide-y divide-gray-100">
              {rail.map((article) => (
                <div key={article.id} className="py-3 first:pt-0">
                  <a
                    href={article.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block font-serif text-[1.05rem] font-normal text-[#111827] leading-snug hover:text-[#312E81] transition-colors"
                  >
                    {article.title}
                  </a>
                  <p className="mt-0.5 text-[10px] text-gray-400">{article.source}</p>
                </div>
              ))}
            </div>
          </div>

        </div>
      </section>

      {/* ── Story feed below ── */}
      {rest.length > 0 && (
        <section className="pt-6 pb-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-gray-200">
            {rest.map((article) => (
              <div key={article.id} className="py-5 first:pt-0 sm:first:pt-5 odd:sm:pr-8 even:sm:pl-8 border-b border-gray-100 last:border-b-0">
                <a
                  href={article.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block font-serif text-[1.15rem] font-normal text-[#111827] leading-snug hover:text-[#312E81] transition-colors mb-1.5"
                >
                  {article.title}
                </a>
                <p className="font-serif text-[12px] text-[#4a4a4a] leading-snug line-clamp-2">{article.summary}</p>
                <p className="mt-1.5 text-[10px] text-gray-400">{article.source}</p>
              </div>
            ))}
          </div>
        </section>
      )}
    </>
  );
}
