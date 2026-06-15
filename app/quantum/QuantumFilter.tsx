"use client";

import { useState } from "react";
import Link from "next/link";
import type { QuantumArticle, QuantumArticleCategory } from "@/lib/quantum/articles";

const CATEGORY_META: Record<string, { label: string; color: string; activeColor: string }> = {
  hardware:      { label: "Hardware",      color: "bg-violet-100 text-violet-700",  activeColor: "bg-violet-600 text-white" },
  software:      { label: "Software",      color: "bg-indigo-100 text-indigo-700",  activeColor: "bg-indigo-600 text-white" },
  market:        { label: "Market",        color: "bg-sky-100 text-sky-700",        activeColor: "bg-sky-600 text-white" },
  research:      { label: "Research",      color: "bg-emerald-100 text-emerald-700",activeColor: "bg-emerald-600 text-white" },
  policy:        { label: "Policy",        color: "bg-amber-100 text-amber-700",    activeColor: "bg-amber-600 text-white" },
  consciousness: { label: "Consciousness", color: "bg-fuchsia-100 text-fuchsia-700",activeColor: "bg-fuchsia-600 text-white" },
};

const CATEGORY_ORDER = ["hardware", "software", "market", "research", "policy", "consciousness"] as const;
const CATEGORIES = Object.keys(CATEGORY_META) as QuantumArticleCategory[];

function ArticleCard({ article }: { article: QuantumArticle }) {
  return (
    <div className="group flex flex-col rounded-xl border border-gray-100 bg-white hover:border-indigo-200 hover:shadow-md transition-all overflow-hidden">
      {article.image && (
        <div className="h-36 overflow-hidden bg-indigo-50 shrink-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={article.image} alt={article.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        </div>
      )}
      <div className="p-4 flex flex-col flex-1">
        <div className="flex items-center gap-1.5 mb-2 flex-wrap">
          <span className={`text-[9px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded-full ${CATEGORY_META[article.category]?.color}`}>
            {CATEGORY_META[article.category]?.label}
          </span>
          {article.companies.slice(0, 2).map((t) => (
            <span key={t} className="text-[9px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-600">{t}</span>
          ))}
        </div>
        <h3 className="font-sans text-[13px] font-bold text-gray-900 leading-snug mb-1.5 line-clamp-2 group-hover:text-indigo-700 transition-colors flex-1">
          {article.title}
        </h3>
        <p className="font-serif text-[11.5px] text-gray-400 leading-snug line-clamp-2 mb-3">{article.summary}</p>
        <div className="flex items-center justify-between mt-auto">
          <div>
            <span className="text-[10px] font-semibold text-indigo-500">{article.source}</span>
            <span className="ml-2 text-[10px] text-gray-400">{new Date(article.publishedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
          </div>
          <Link href={`/quantum/${article.id}`} className="text-[10px] font-bold text-indigo-500 hover:text-indigo-700 transition-colors">
            Summary →
          </Link>
        </div>
      </div>
    </div>
  );
}

export function QuantumFilter({ articles }: { articles: QuantumArticle[] }) {
  const [active, setActive] = useState<QuantumArticleCategory | null>(null);

  const topStories = articles.filter((a) => a.topStory).slice(0, 4);
  const nonTop = articles.filter((a) => !a.topStory);
  const filtered = active ? nonTop.filter((a) => a.category === active) : nonTop;

  return (
    <>
      {/* ── Top Stories ── */}
      {topStories.length > 0 && !active && (
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-5">
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-indigo-500">Top Stories</span>
            <div className="flex-1 h-px bg-indigo-100" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {topStories.map((article, i) => (
              <a
                key={article.id}
                href={article.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex gap-4 rounded-xl border border-gray-100 bg-white hover:border-indigo-200 hover:shadow-md transition-all p-4"
              >
                {article.image && (
                  <div className="shrink-0 w-20 h-20 rounded-lg overflow-hidden bg-indigo-50">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={article.image} alt={article.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <span className="text-[9px] font-bold text-indigo-400 tabular-nums">#{i + 1}</span>
                    <span className={`text-[9px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded-full ${CATEGORY_META[article.category]?.color}`}>
                      {CATEGORY_META[article.category]?.label}
                    </span>
                  </div>
                  <h3 className="font-sans text-[13px] font-bold text-gray-900 leading-snug line-clamp-2 group-hover:text-indigo-700 transition-colors mb-1">
                    {article.title}
                  </h3>
                  <p className="font-serif text-[11px] text-gray-400 line-clamp-2 leading-snug">{article.summary}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-[10px] font-semibold text-indigo-500">{article.source}</span>
                    <Link
                      href={`/quantum/${article.id}`}
                      onClick={(e) => e.stopPropagation()}
                      className="ml-auto text-[9px] font-bold uppercase tracking-wide px-2 py-0.5 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-colors"
                    >
                      Summary
                    </Link>
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>
      )}


      {/* ── Sectioned by category (no filter active) ── */}
      {!active && filtered.length > 0 && (
        <div className="mb-14 space-y-10">
          {CATEGORY_ORDER
            .map((cat) => ({ cat, items: filtered.filter((a) => a.category === cat) }))
            .filter(({ items }) => items.length > 0)
            .map(({ cat, items }) => (
              <div key={cat}>
                <div className="flex items-center gap-3 mb-4">
                  <span className={`text-[10px] font-bold uppercase tracking-[0.2em] px-2 py-0.5 rounded-full ${CATEGORY_META[cat].color}`}>
                    {CATEGORY_META[cat].label}
                  </span>
                  <div className="flex-1 h-px bg-gray-100" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {items.map((article) => (
                    <ArticleCard key={article.id} article={article} />
                  ))}
                </div>
              </div>
            ))}
        </div>
      )}

      {/* ── Flat grid (category filter active) ── */}
      {active && filtered.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-14">
          {filtered.map((article) => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </div>
      )}

      {filtered.length === 0 && (
        <div className="text-center py-12 text-gray-400 font-serif text-[14px]">
          No articles in this category yet.
        </div>
      )}
    </>
  );
}
