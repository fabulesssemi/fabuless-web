import type { Metadata } from "next";
import Link from "next/link";
import { getLatestArticles } from "@/lib/quantum/articles";
import { QUANTUM_COMPANIES } from "@/lib/quantum/companies";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Fabuless Quantum — The Race to Useful Quantum",
  description:
    "Coverage of the quantum computing industry — hardware breakthroughs, market moves, research, and the companies building the next computing paradigm.",
};

const CATEGORY_META: Record<string, { label: string; color: string }> = {
  hardware:  { label: "Hardware",  color: "bg-violet-100 text-violet-700" },
  software:  { label: "Software",  color: "bg-indigo-100 text-indigo-700" },
  market:    { label: "Market",    color: "bg-sky-100 text-sky-700" },
  research:  { label: "Research",  color: "bg-emerald-100 text-emerald-700" },
  policy:    { label: "Policy",    color: "bg-amber-100 text-amber-700" },
};

const CATEGORY_ORDER = ["hardware", "software", "market", "research", "policy"];

export default async function QuantumPage() {
  const articles = getLatestArticles(24);
  const featured = articles[0] ?? null;
  const rest = articles.slice(1);

  const purePlay = QUANTUM_COMPANIES.filter((c) => c.category === "pure-play");
  const bigTech  = QUANTUM_COMPANIES.filter((c) => c.category === "big-tech");
  const infra    = QUANTUM_COMPANIES.filter((c) => c.category === "infrastructure");

  return (
    <div className="min-h-screen">
      {/* ── Hero ── */}
      <div className="relative overflow-hidden" style={{ background: "linear-gradient(135deg, #0f0c29 0%, #1a1040 50%, #0f172a 100%)" }}>
        {/* Grid overlay */}
        <div className="absolute inset-0 opacity-[0.07]"
          style={{ backgroundImage: "linear-gradient(#6366F1 1px, transparent 1px), linear-gradient(90deg, #6366F1 1px, transparent 1px)", backgroundSize: "40px 40px" }} />
        {/* Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full opacity-20"
          style={{ background: "radial-gradient(ellipse, #818CF8 0%, transparent 70%)" }} />

        <div className="relative max-w-5xl mx-auto px-6 py-20">
          <div className="text-[11px] font-bold uppercase tracking-[0.25em] text-indigo-400 mb-3">
            Fabuless Quantum
          </div>
          <h1 className="font-sans text-4xl md:text-5xl font-bold text-white tracking-tight leading-tight max-w-2xl">
            The Race to Useful Quantum
          </h1>
          <p className="mt-4 font-serif text-[16px] text-indigo-200 leading-relaxed max-w-xl">
            Hardware breakthroughs, market moves, and the companies building the next computing paradigm. Updated twice a week.
          </p>

          {/* Category pills */}
          <div className="flex flex-wrap gap-2 mt-8">
            {CATEGORY_ORDER.map((cat) => {
              const count = articles.filter((a) => a.category === cat).length;
              return (
                <span key={cat} className="px-3 py-1 rounded-full text-[11px] font-semibold bg-white/10 text-white/70 border border-white/10">
                  {CATEGORY_META[cat].label} {count > 0 && <span className="text-indigo-300">{count}</span>}
                </span>
              );
            })}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-12">

        {/* ── Articles ── */}
        {articles.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-indigo-200 bg-indigo-50/40 px-8 py-14 text-center mb-12">
            <div className="text-[11px] font-bold uppercase tracking-widest text-indigo-400 mb-2">Pipeline ready</div>
            <p className="font-serif text-[15px] text-gray-500">
              Articles load after the first pipeline run.<br />
              Run: <code className="text-indigo-600 text-[13px]">GROQ_API_KEY=gsk_... npx tsx scripts/update-quantum-articles.ts</code>
            </p>
          </div>
        ) : (
          <>
            {/* Featured article */}
            {featured && (
              <div className="mb-10">
                <div className="text-[10px] font-bold uppercase tracking-widest text-indigo-500 mb-4">Latest</div>
                <a
                  href={featured.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group block rounded-2xl border border-indigo-100 bg-white overflow-hidden hover:border-indigo-300 hover:shadow-lg transition-all"
                >
                  <div className="flex gap-0 flex-col md:flex-row">
                    {featured.image && (
                      <div className="md:w-80 shrink-0 h-48 md:h-auto overflow-hidden bg-indigo-50">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={featured.image} alt={featured.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      </div>
                    )}
                    <div className="p-6 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-3">
                          <span className={`text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full ${CATEGORY_META[featured.category]?.color ?? "bg-gray-100 text-gray-500"}`}>
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
                      </div>
                    </div>
                  </div>
                </a>
              </div>
            )}

            {/* Article grid */}
            {rest.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-14">
                {rest.map((article) => (
                  <a
                    key={article.id}
                    href={article.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex flex-col rounded-xl border border-gray-100 bg-white hover:border-indigo-200 hover:shadow-md transition-all overflow-hidden"
                  >
                    {article.image && (
                      <div className="h-36 overflow-hidden bg-indigo-50 shrink-0">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={article.image} alt={article.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      </div>
                    )}
                    <div className="p-4 flex flex-col flex-1">
                      <div className="flex items-center gap-1.5 mb-2 flex-wrap">
                        <span className={`text-[9px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded-full ${CATEGORY_META[article.category]?.color ?? "bg-gray-100 text-gray-500"}`}>
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
                        <span className="text-[10px] font-semibold text-indigo-500">{article.source}</span>
                        <span className="text-[10px] text-gray-400">{new Date(article.publishedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
                      </div>
                    </div>
                  </a>
                ))}
              </div>
            )}
          </>
        )}

        {/* ── Who's Building Quantum ── */}
        <div className="mb-14">
          <div className="flex items-baseline gap-3 mb-6">
            <h2 className="font-sans text-[18px] font-bold text-gray-900">Who&apos;s Building Quantum</h2>
            <span className="text-[11px] text-gray-400 font-serif">{QUANTUM_COMPANIES.length} companies tracked</span>
          </div>

          {([
            { label: "Pure Plays", companies: purePlay },
            { label: "Big Tech", companies: bigTech },
            { label: "Infrastructure", companies: infra },
          ] as const).map(({ label, companies }) => (
            <div key={label} className="mb-6">
              <div className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-3">{label}</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {companies.map((co) => {
                  const coArticleCount = articles.filter((a) => a.companies.includes(co.ticker)).length;
                  return (
                    <div
                      key={co.ticker}
                      className="flex items-start gap-3 rounded-xl border border-gray-100 bg-white px-4 py-3 hover:border-indigo-200 hover:shadow-sm transition-all"
                    >
                      {/* Logo */}
                      <div className="shrink-0 w-9 h-9 rounded-lg flex items-center justify-center mt-0.5" style={{ background: `${co.accent}18` }}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={`https://assets.parqet.com/logos/symbol/${co.ticker}?format=png`}
                          alt={co.name}
                          width={22}
                          height={22}
                          className="object-contain"
                          onError={(e) => { e.currentTarget.style.display = "none"; }}
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="font-sans text-[13px] font-bold text-gray-900">{co.ticker}</span>
                          {coArticleCount > 0 && (
                            <span className="text-[9px] font-bold text-indigo-500 tabular-nums">{coArticleCount} articles</span>
                          )}
                        </div>
                        <p className="font-serif text-[11px] text-gray-500 leading-snug line-clamp-2">{co.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* ── Footer note ── */}
        <p className="pt-5 border-t border-gray-100 font-serif text-[11px] text-gray-400 leading-relaxed">
          Fabuless Quantum covers the quantum computing industry for investors and researchers. Articles sourced from The Quantum Insider, Quantum Computing Report, IEEE Spectrum, MIT Technology Review, arXiv, and corporate research blogs. Summaries AI-generated — always read the source. Not investment advice.
        </p>
      </div>
    </div>
  );
}
