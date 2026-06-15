import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getAllArticles } from "@/lib/quantum/articles";
import { QUANTUM_COMPANIES } from "@/lib/quantum/companies";

export const revalidate = 3600;

const CATEGORY_META: Record<string, { label: string; color: string }> = {
  hardware:      { label: "Hardware",      color: "bg-violet-100 text-violet-700" },
  software:      { label: "Software",      color: "bg-indigo-100 text-indigo-700" },
  market:        { label: "Market",        color: "bg-sky-100 text-sky-700" },
  research:      { label: "Research",      color: "bg-emerald-100 text-emerald-700" },
  policy:        { label: "Policy",        color: "bg-amber-100 text-amber-700" },
  consciousness: { label: "Consciousness", color: "bg-fuchsia-100 text-fuchsia-700" },
};

export async function generateStaticParams() {
  return getAllArticles().map((a) => ({ id: a.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const article = getAllArticles().find((a) => a.id === id);
  if (!article) return { title: "Article Not Found — Fabuless Quantum" };
  return {
    title: `${article.title} — Fabuless Quantum`,
    description: article.summary,
  };
}

export default async function QuantumArticlePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const all = getAllArticles();
  const article = all.find((a) => a.id === id);
  if (!article) notFound();

  const related = all
    .filter((a) => a.id !== id && (
      a.category === article.category ||
      a.companies.some((c) => article.companies.includes(c))
    ))
    .slice(0, 3);

  const companies = QUANTUM_COMPANIES.filter((c) => article.companies.includes(c.ticker));

  return (
    <div className="min-h-screen">
      {/* ── Header bar ── */}
      <div className="border-b border-indigo-100 bg-white">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center gap-3">
          <Link href="/quantum" className="text-[11px] font-bold uppercase tracking-widest text-indigo-500 hover:text-indigo-700 transition-colors">
            ← Fabuless Quantum
          </Link>
          <span className="text-gray-300">/</span>
          <span className={`text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full ${CATEGORY_META[article.category]?.color ?? "bg-gray-100 text-gray-500"}`}>
            {CATEGORY_META[article.category]?.label}
          </span>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-12">
        {/* ── Article header ── */}
        <div className="mb-8">
          {/* Company tickers */}
          {article.companies.length > 0 && (
            <div className="flex gap-2 mb-4 flex-wrap">
              {article.companies.map((t) => (
                <span key={t} className="text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded bg-indigo-50 text-indigo-600 border border-indigo-100">
                  {t}
                </span>
              ))}
            </div>
          )}

          <h1 className="font-sans text-[26px] font-bold text-gray-900 leading-tight mb-4">
            {article.title}
          </h1>

          <div className="flex items-center gap-4 text-[12px] text-gray-400">
            <span className="font-semibold text-indigo-500">{article.source}</span>
            <span>{new Date(article.publishedAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</span>
          </div>
        </div>

        {/* ── Hero image ── */}
        {article.image && (
          <div className="rounded-2xl overflow-hidden mb-8 bg-indigo-50">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={article.image} alt={article.title} className="w-full h-64 object-cover" />
          </div>
        )}

        {/* ── Summary ── */}
        <div className="rounded-xl border border-indigo-100 bg-indigo-50/40 px-6 py-5 mb-8">
          <div className="text-[10px] font-bold uppercase tracking-widest text-indigo-500 mb-2">Summary</div>
          <p className="font-serif text-[15px] text-gray-700 leading-relaxed">{article.summary}</p>
        </div>

        {/* ── Read full article CTA ── */}
        <a
          href={article.sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-between gap-4 rounded-xl border border-gray-200 bg-white hover:border-indigo-300 hover:shadow-md transition-all px-6 py-4 mb-10 group"
        >
          <div>
            <div className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-0.5">Full article</div>
            <div className="font-sans text-[13px] font-semibold text-gray-800 group-hover:text-indigo-700 transition-colors">
              Read on {article.source} →
            </div>
          </div>
          <div className="shrink-0 w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white text-[14px] group-hover:bg-indigo-700 transition-colors">
            →
          </div>
        </a>

        {/* ── Companies mentioned ── */}
        {companies.length > 0 && (
          <div className="mb-10">
            <div className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-3">Companies mentioned</div>
            <div className="flex flex-col gap-2">
              {companies.map((co) => (
                <div key={co.ticker} className="flex items-center gap-3 rounded-lg border border-gray-100 bg-white px-4 py-2.5">
                  <div className="shrink-0 w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${co.accent}18` }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={`https://assets.parqet.com/logos/symbol/${co.ticker}?format=png`} alt={co.ticker} width={20} height={20} className="object-contain" onError={(e) => { e.currentTarget.style.display = "none"; }} />
                  </div>
                  <div>
                    <span className="font-sans text-[12px] font-bold text-gray-900">{co.ticker}</span>
                    <span className="ml-2 text-[11px] text-gray-400">{co.name}</span>
                  </div>
                  <span className="ml-auto text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ color: co.accent, background: `${co.accent}15` }}>
                    {co.category === "pure-play" ? "Pure play" : co.category === "big-tech" ? "Big tech" : "Infrastructure"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Related articles ── */}
        {related.length > 0 && (
          <div>
            <div className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-3">Related</div>
            <div className="flex flex-col gap-2">
              {related.map((a) => (
                <Link
                  key={a.id}
                  href={`/quantum/${a.id}`}
                  className="flex items-start gap-3 rounded-lg border border-gray-100 bg-white hover:border-indigo-200 hover:bg-indigo-50/30 transition-all px-4 py-3 group"
                >
                  <span className={`shrink-0 mt-0.5 text-[9px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded-full ${CATEGORY_META[a.category]?.color}`}>
                    {CATEGORY_META[a.category]?.label}
                  </span>
                  <div className="min-w-0">
                    <p className="font-sans text-[12px] font-semibold text-gray-800 group-hover:text-indigo-700 transition-colors line-clamp-1">{a.title}</p>
                    <p className="font-serif text-[11px] text-gray-400 line-clamp-1 mt-0.5">{a.summary}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
