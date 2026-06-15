import type { Metadata } from "next";
import { getLatestArticles } from "@/lib/quantum/articles";
import { QUANTUM_COMPANIES } from "@/lib/quantum/companies";
import { QuantumFilter } from "./QuantumFilter";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Fabuless Quantum — The Race to Useful Quantum",
  description:
    "Coverage of the quantum computing industry — hardware breakthroughs, market moves, research, and the companies building the next computing paradigm.",
};

const CATEGORY_LABELS: Record<string, string> = {
  hardware: "Hardware", software: "Software", market: "Market", research: "Research", policy: "Policy",
};
const CATEGORY_ORDER = ["hardware", "software", "market", "research", "policy"];

export default async function QuantumPage() {
  const articles = getLatestArticles(24);

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
                  {CATEGORY_LABELS[cat]} {count > 0 && <span className="text-indigo-300">{count}</span>}
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
              <code className="text-indigo-600 text-[13px]">GROQ_API_KEY=gsk_... npx tsx scripts/update-quantum-articles.ts</code>
            </p>
          </div>
        ) : (
          <QuantumFilter articles={articles} />
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
