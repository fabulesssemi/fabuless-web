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

const CATEGORIES = Object.keys(CATEGORY_META) as QuantumArticleCategory[];

export function QuantumFilter({ articles }: { articles: QuantumArticle[] }) {
  const [active, setActive] = useState<QuantumArticleCategory | null>(null);

  const topStories = articles.filter((a) => a.topStory).slice(0, 4);
  const filtered = active ? articles.filter((a) => a.category === active) : articles;
  const featured = active ? (filtered[0] ?? null) : null;
  const rest = active ? filtered.slice(1) : filtered;

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
                className="group flex gap-4 rounded-xl border border-gray-100 bg-white hover:border-indigo-200 hover:shadow-md transition-all overflow-hidden p-4"
              >
                {article.image && (
                  <div className="shrink-0 w-20 h-20 rounded-lg overflow-hidden bg-indigo-50">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={article.image} alt={article.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 mb-1.5 flex-wrap">
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

      {/* Category filter pills */}
      <div className="flex flex-wrap gap-2 mb-8">
        <button
          onClick={() => setActive(null)}
          className={`px-3 py-1 rounded-full text-[11px] font-semibold transition-colors border ${
            active === null ? "bg-[#111827] text-white border-[#111827]" : "border-gray-200 text-gray-500 hover:border-gray-400"
          }`}
        >
          All {articles.length}
        </button>
        {CATEGORIES.filter((c) => articles.some((a) => a.category === c)).map((cat) => {
          const count = articles.filter((a) => a.category === cat).length;
          const isActive = active === cat;
          return (
            <button
              key={cat}
              onClick={() => setActive(isActive ? null : cat)}
              className={`px-3 py-1 rounded-full text-[11px] font-semibold transition-colors border ${
                isActive
                  ? `${CATEGORY_META[cat].activeColor} border-transparent`
                  : `border-gray-200 text-gray-500 hover:border-gray-400`
              }`}
            >
              {CATEGORY_META[cat].label} {count}
            </button>
          );
        })}
      </div>

      {/* Featured (only shown when a category filter is active) */}
      {featured && (
        <div className="mb-8">
          <a
            href={featured.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="group block rounded-2xl border border-indigo-100 bg-white overflow-hidden hover:border-indigo-300 hover:shadow-lg transition-all"
          >
            <div className="flex flex-col md:flex-row">
              {featured.image && (
                <div className="md:w-80 shrink-0 h-48 md:h-auto overflow-hidden bg-indigo-50">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={featured.image} alt={featured.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                </div>
              )}
              <div className="p-6 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-3 flex-wrap">
                    <span className={`text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full ${CATEGORY_META[featured.category]?.color}`}>
                      {CATEGORY_META[featured.category]?.label}
                    </span>
                    {featured.companies.slice(0, 3).map((t) => (
                      <span key={t} className="text-[9px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-600 border border-indigo-100">{t}</span>
                    ))}
                  </div>
                  <h2 className="font-sans text-[18px] font-bold text-gray-900 leading-snug mb-2 group-hover:text-indigo-700 transition-colors">
                    {featured.title}
                  </h2>
                  <p className="font-serif text-[13px] text-gray-500 leading-relaxed line-clamp-3">{featured.summary}</p>
                </div>
                <div className="flex items-center gap-3 mt-4">
                  <span className="text-[11px] font-semibold text-indigo-500">{featured.source}</span>
                  <span className="text-[10px] text-gray-400">{new Date(featured.publishedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
                  <Link
                    href={`/quantum/${featured.id}`}
                    onClick={(e) => e.stopPropagation()}
                    className="ml-auto text-[10px] font-bold uppercase tracking-wide px-2.5 py-1 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-colors"
                  >
                    Summary →
                  </Link>
                </div>
              </div>
            </div>
          </a>
        </div>
      )}

      {/* Grid */}
      {rest.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-14">
          {rest.map((article) => (
            <div key={article.id} className="group flex flex-col rounded-xl border border-gray-100 bg-white hover:border-indigo-200 hover:shadow-md transition-all overflow-hidden">
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
                  <Link
                    href={`/quantum/${article.id}`}
                    className="text-[10px] font-bold text-indigo-500 hover:text-indigo-700 transition-colors"
                  >
                    Summary →
                  </Link>
                </div>
              </div>
            </div>
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
