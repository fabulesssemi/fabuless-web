"use client";

import Link from "next/link";
import type { QuantumArticle } from "@/lib/quantum/articles";

const CATEGORY_COLORS: Record<string, string> = {
  hardware:      "text-indigo-600",
  software:      "text-violet-600",
  market:        "text-sky-600",
  research:      "text-emerald-600",
  policy:        "text-amber-600",
  consciousness: "text-fuchsia-600",
};

const CATEGORY_LABELS: Record<string, string> = {
  hardware: "Hardware", software: "Software", market: "Market",
  research: "Research", policy: "Policy", consciousness: "Consciousness",
};

function StoryCard({ article }: { article: QuantumArticle }) {
  return (
    <div className="bg-white border border-[#DDDBD2] border-t-2 border-t-indigo-500 flex flex-col">
      <a href={article.sourceUrl} target="_blank" rel="noopener noreferrer" className="block">
        <div className="aspect-[16/9] overflow-hidden bg-indigo-50 flex items-center justify-center">
          {article.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={article.image}
              alt={article.title}
              className="w-full h-full object-cover"
              onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-indigo-50 to-indigo-100 flex items-center justify-center">
              <span className="text-indigo-300 text-3xl">✦</span>
            </div>
          )}
        </div>
      </a>
      <div className="p-4 pt-3 flex flex-col flex-1">
        <div className="text-[11px] font-bold text-indigo-600 uppercase tracking-wider mb-1.5">
          {CATEGORY_LABELS[article.category]}
        </div>
        <a
          href={article.sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="font-sans text-[1rem] font-bold text-[#111827] leading-snug hover:text-indigo-600 transition-colors"
        >
          {article.title}
        </a>
        <p className="font-serif text-[12px] text-[#4a4a4a] mt-1.5 leading-snug line-clamp-2">
          {article.summary}
        </p>
        <div className="mt-auto pt-2.5">
          <span className="text-[10px] text-gray-400">{article.source}</span>
        </div>
      </div>
    </div>
  );
}

export function QuantumFilter({ articles }: { articles: QuantumArticle[] }) {
  const topStories = articles.filter((a) => a.topStory && a.image).slice(0, 4);
  const topIds = new Set(topStories.map((a) => a.id));
  const rest = articles.filter((a) => !topIds.has(a.id)).slice(0, 12);

  return (
    <>
      {/* ── Top Stories — 4-col image cards ── */}
      <section className="pb-6 border-b border-gray-200">
        <div className="flex items-center gap-4 mb-4">
          <div className="h-px flex-1 bg-gray-200" />
          <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 shrink-0">Top Stories</span>
          <div className="h-px flex-1 bg-gray-200" />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {topStories.length > 0
            ? topStories.map((article) => <StoryCard key={article.id} article={article} />)
            : Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="bg-white border border-[#DDDBD2] flex flex-col">
                  <div className="aspect-[16/9] bg-indigo-50 animate-pulse" />
                  <div className="p-4 pt-3 flex flex-col gap-2">
                    <div className="h-2.5 w-20 bg-gray-200 rounded animate-pulse" />
                    <div className="h-4 bg-gray-200 rounded animate-pulse" />
                    <div className="h-4 w-3/4 bg-gray-200 rounded animate-pulse" />
                    <div className="h-3 w-1/2 bg-gray-100 rounded animate-pulse mt-1" />
                  </div>
                </div>
              ))
          }
        </div>
      </section>

      {/* ── Rest — 2-col text list ── */}
      {rest.length > 0 && (
        <section className="pt-4 pb-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-gray-200 border-t border-gray-200 pt-4">
            {rest.map((article) => (
              <div key={article.id} className="py-4 first:pt-0 sm:first:pt-4 odd:sm:pr-8 even:sm:pl-8">
                <div className="text-[11px] font-bold text-indigo-600 uppercase tracking-wider mb-1">
                  {CATEGORY_LABELS[article.category]}
                </div>
                <a
                  href={article.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block font-sans text-[0.95rem] font-bold text-[#111827] hover:text-indigo-600 transition-colors leading-snug mb-1"
                >
                  {article.title}
                </a>
                <p className="font-serif text-[12px] text-[#4a4a4a] leading-snug line-clamp-2">{article.summary}</p>
                <div className="mt-1">
                  <span className="text-[10px] text-gray-400">{article.source}</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {articles.length === 0 && (
        <div className="text-center py-12 text-gray-400 font-serif text-[14px]">
          No articles yet — pipeline runs tomorrow morning.
        </div>
      )}
    </>
  );
}
