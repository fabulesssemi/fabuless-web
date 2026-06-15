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
    <div className="bg-white border border-[#DDDBD2] flex flex-col">
      <a href={article.sourceUrl} target="_blank" rel="noopener noreferrer" className="block">
        <div className="aspect-[16/9] overflow-hidden bg-indigo-50">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={article.image!}
            alt={article.title}
            className="w-full h-full object-cover"
          />
        </div>
      </a>
      <div className="p-4 pt-3 flex flex-col flex-1">
        <div className={`text-[11px] font-bold uppercase tracking-wider mb-1.5 ${CATEGORY_COLORS[article.category] ?? "text-indigo-600"}`}>
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
        <div className="mt-auto pt-2.5 flex items-center justify-between">
          <span className="text-[10px] text-gray-400">{article.source}</span>
          <Link
            href={`/quantum/${article.id}`}
            className="text-[10px] text-indigo-500 hover:text-indigo-700 font-semibold transition-colors"
          >
            Summary →
          </Link>
        </div>
      </div>
    </div>
  );
}

export function QuantumFilter({ articles }: { articles: QuantumArticle[] }) {
  const topStories = articles.filter((a) => a.topStory && a.image).slice(0, 4);
  const rest = articles.filter((a) => !a.topStory || !a.image);

  return (
    <>
      {/* ── Top Stories — 4-col image cards ── */}
      {topStories.length > 0 && (
        <section className="pb-6 border-b border-gray-200">
          <div className="flex items-center gap-4 mb-4">
            <div className="h-px flex-1 bg-gray-200" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 shrink-0">Top Stories</span>
            <div className="h-px flex-1 bg-gray-200" />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {topStories.map((article) => (
              <StoryCard key={article.id} article={article} />
            ))}
          </div>
        </section>
      )}

      {/* ── Rest — 2-col text list ── */}
      {rest.length > 0 && (
        <section className="pt-4 pb-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-gray-200 border-t border-gray-200 pt-4">
            {rest.map((article) => (
              <div key={article.id} className="py-4 first:pt-0 sm:first:pt-4 odd:sm:pr-8 even:sm:pl-8">
                <div className={`text-[11px] font-bold uppercase tracking-wider mb-1 ${CATEGORY_COLORS[article.category] ?? "text-indigo-600"}`}>
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
                <div className="flex items-center justify-between mt-1">
                  <span className="text-[10px] text-gray-400">{article.source}</span>
                  <Link href={`/quantum/${article.id}`} className="text-[10px] text-indigo-500 hover:text-indigo-700 font-semibold transition-colors">
                    Summary →
                  </Link>
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
