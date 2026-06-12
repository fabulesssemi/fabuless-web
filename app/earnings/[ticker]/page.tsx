import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPreview, tickersWithPreview, type Importance, type WatchPoint } from "@/lib/earnings/previews";
import { COMPANY_UNIVERSE } from "@/lib/companies";
import { Countdown } from "../Countdown";

export const revalidate = 3600;

const slugByTicker = new Map(COMPANY_UNIVERSE.map((c) => [c.ticker, c.slug]));

export function generateStaticParams() {
  return tickersWithPreview().map((ticker) => ({ ticker: ticker.toLowerCase() }));
}

export async function generateMetadata({ params }: { params: Promise<{ ticker: string }> }): Promise<Metadata> {
  const { ticker } = await params;
  const preview = getPreview(ticker.toUpperCase());
  if (!preview) return {};
  return {
    title: `${preview.company} (${preview.ticker}) Earnings Preview — ${preview.fiscalQuarter} | Fabuless`,
    description: preview.centralQuestion,
  };
}

const IMPORTANCE: Record<Importance, { label: string; cls: string; dot: string }> = {
  critical: { label: "Critical", cls: "text-rose-600 border-rose-200 bg-rose-50",   dot: "bg-rose-500"   },
  high:     { label: "High",     cls: "text-amber-700 border-amber-200 bg-amber-50", dot: "bg-amber-500"  },
  medium:   { label: "Medium",   cls: "text-gray-500 border-gray-200 bg-gray-50",    dot: "bg-gray-400"   },
};

function fmtDate(iso: string) {
  return new Date(iso + "T12:00:00Z").toLocaleDateString("en-US", {
    weekday: "long", month: "long", day: "numeric", year: "numeric",
  });
}

function WatchCard({ wp, idx }: { wp: WatchPoint; idx: number }) {
  const imp = IMPORTANCE[wp.importance];
  return (
    <div className="border border-gray-200 bg-white p-5 flex gap-4">
      <div className="shrink-0">
        <span className="font-mono text-[13px] font-bold text-gray-300">{String(idx + 1).padStart(2, "0")}</span>
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2.5 flex-wrap">
          <h3 className="text-[15px] font-bold text-[#111827]">{wp.title}</h3>
          <span className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 border rounded ${imp.cls}`}>
            {imp.label}
          </span>
        </div>
        <p className="text-[13px] text-gray-600 leading-relaxed mt-1.5">{wp.why}</p>
        {wp.metric && (
          <div className="mt-2.5 flex items-start gap-2">
            <span className="text-[9px] font-bold uppercase tracking-wider text-gray-400 mt-0.5 shrink-0">Watch</span>
            <span className="text-[12px] text-gray-700 font-medium leading-snug">{wp.metric}</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default async function EarningsDeepDive({ params }: { params: Promise<{ ticker: string }> }) {
  const { ticker } = await params;
  const preview = getPreview(ticker.toUpperCase());
  if (!preview) notFound();

  const slug = slugByTicker.get(preview.ticker);
  const hasVerdict = preview.verdict !== null;

  return (
    <div>
      {/* ── HEADER ── */}
      <div className="max-w-5xl mx-auto px-6 pt-6 pb-4 border-b border-gray-200">
        <Link
          href="/earnings"
          className="inline-flex items-center gap-1.5 text-[12px] font-medium text-gray-400 hover:text-[#B45309] transition-colors"
        >
          ← All upcoming earnings
        </Link>

        <div className="mt-4 flex items-start justify-between gap-8 flex-wrap">
          <div className="min-w-0">
            <div className="flex items-center gap-2.5">
              <span className="font-mono text-[12px] font-bold text-amber-700">{preview.ticker}</span>
              <span className="text-[11px] uppercase tracking-widest text-gray-400">{preview.fiscalQuarter}</span>
            </div>
            <h1 className="font-sans text-[26px] font-bold tracking-tight leading-none mt-1 text-[#111827]">
              {preview.company}
            </h1>
            <div className="text-[12px] text-gray-400 mt-1">
              {fmtDate(preview.reportDate)} · {preview.reportTime}
            </div>
          </div>

          {!hasVerdict && (
            <div className="shrink-0">
              <div className="text-[9px] uppercase tracking-widest text-gray-400 mb-1.5">Reports in</div>
              <Countdown iso={preview.reportDate} />
            </div>
          )}
        </div>

        <div className="mt-4 border-l-2 border-amber-400 pl-4">
          <p className="font-serif text-[15px] text-gray-600 leading-relaxed">
            {preview.centralQuestion}
          </p>
        </div>
      </div>

      {/* ── BODY ── */}
      <div className="max-w-5xl mx-auto px-6 py-10">

        {/* Setup */}
        <section className="mb-10">
          <p className="font-serif text-[16px] text-[#2a2a2a] leading-relaxed max-w-3xl">
            {preview.setup}
          </p>
        </section>

        {/* Expectations / the bar */}
        <section className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <h2 className="text-[12px] font-bold uppercase tracking-widest text-gray-400">Where expectations sit</h2>
            <div className="h-px flex-1 bg-gray-200" />
          </div>

          <div className="grid sm:grid-cols-2 gap-4 mb-4">
            <div className="border border-gray-200 bg-white p-5">
              <div className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Revenue (est.)</div>
              <div className="text-[20px] font-bold text-[#111827] mt-1 leading-tight">{preview.expectations.revenue}</div>
            </div>
            <div className="border border-gray-200 bg-white p-5">
              <div className="text-[10px] font-bold uppercase tracking-wider text-gray-400">EPS (est.)</div>
              <div className="text-[20px] font-bold text-[#111827] mt-1 leading-tight">{preview.expectations.eps}</div>
            </div>
          </div>

          <div className="border border-gray-200 bg-white p-5 mb-4">
            <div className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1.5">Stock setup</div>
            <p className="text-[13px] text-gray-600 leading-relaxed">{preview.expectations.stockSetup}</p>
            {preview.expectations.whisper && (
              <p className="text-[12px] text-gray-500 italic leading-relaxed mt-2">{preview.expectations.whisper}</p>
            )}
          </div>

          {/* THE BAR — the centerpiece judgment */}
          <div className="border-l-2 border-[#111827] bg-[#FAFAF8] p-5">
            <div className="text-[10px] font-bold uppercase tracking-widest text-[#111827] mb-1.5">How big a beat is needed</div>
            <p className="text-[14px] text-[#1a1a1a] leading-relaxed font-medium">{preview.expectations.barToMove}</p>
          </div>
        </section>

        {/* Signal check — cross-source reads */}
        {preview.signalChecks && preview.signalChecks.length > 0 && (
          <section className="mb-10">
            <div className="flex items-center gap-3 mb-1">
              <h2 className="text-[12px] font-bold uppercase tracking-widest text-gray-400">Signal check</h2>
              <div className="h-px flex-1 bg-gray-200" />
            </div>
            <p className="text-[11px] text-gray-400 mb-4">What the consensus, options, and end-market data say going in.</p>
            <div className="border border-gray-200 bg-white divide-y divide-gray-100">
              {preview.signalChecks.map((s) => (
                <div key={s.source} className="flex flex-col sm:flex-row gap-1 sm:gap-5 px-5 py-3.5">
                  <div className="sm:w-44 shrink-0 text-[12px] font-bold text-[#111827]">{s.source}</div>
                  <p className="text-[13px] text-gray-600 leading-relaxed flex-1">{s.read}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Watch points */}
        <section className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <h2 className="text-[12px] font-bold uppercase tracking-widest text-gray-400">What actually moves the stock</h2>
            <div className="h-px flex-1 bg-gray-200" />
          </div>
          <div className="flex flex-col gap-3">
            {preview.watchPoints.map((wp, i) => (
              <WatchCard key={wp.title} wp={wp} idx={i} />
            ))}
          </div>
        </section>

        {/* Roadmap + partnerships */}
        <section className="mb-10 grid md:grid-cols-2 gap-6">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <h2 className="text-[12px] font-bold uppercase tracking-widest text-gray-400">Roadmap to watch</h2>
              <div className="h-px flex-1 bg-gray-200" />
            </div>
            <ul className="flex flex-col gap-3">
              {preview.roadmapWatch.map((r, i) => (
                <li key={i} className="flex gap-3 text-[13px] text-gray-700 leading-relaxed">
                  <span className="text-amber-500 font-bold shrink-0">→</span>
                  <span>{r}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <div className="flex items-center gap-3 mb-4">
              <h2 className="text-[12px] font-bold uppercase tracking-widest text-gray-400">Partnerships / deals to watch</h2>
              <div className="h-px flex-1 bg-gray-200" />
            </div>
            <ul className="flex flex-col gap-3">
              {preview.partnershipWatch.map((p, i) => (
                <li key={i} className="flex gap-3 text-[13px] text-gray-700 leading-relaxed">
                  <span className="text-emerald-600 font-bold shrink-0">+</span>
                  <span>{p}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Bull / bear */}
        <section className="mb-10 grid md:grid-cols-2 gap-4">
          <div className="border border-emerald-200 bg-emerald-50/40 p-5">
            <div className="text-[10px] font-bold uppercase tracking-widest text-emerald-700 mb-2">▲ Bull case</div>
            <p className="text-[13px] text-gray-700 leading-relaxed">{preview.bullCase}</p>
          </div>
          <div className="border border-rose-200 bg-rose-50/40 p-5">
            <div className="text-[10px] font-bold uppercase tracking-widest text-rose-600 mb-2">▼ Bear case</div>
            <p className="text-[13px] text-gray-700 leading-relaxed">{preview.bearCase}</p>
          </div>
        </section>

        {/* Verdict */}
        <section className="mb-6">
          <div className="flex items-center gap-3 mb-4">
            <h2 className="text-[12px] font-bold uppercase tracking-widest text-gray-400">Post-earnings verdict</h2>
            <div className="h-px flex-1 bg-gray-200" />
          </div>
          {preview.verdict ? (
            <div className="border border-gray-200 bg-white p-5">
              <div className="flex items-baseline justify-between gap-4 mb-2">
                <span className="text-[11px] text-gray-400">{fmtDate(preview.verdict.date)}</span>
                <span className="text-[13px] font-bold text-[#111827]">{preview.verdict.reaction}</span>
              </div>
              <p className="text-[14px] text-gray-700 leading-relaxed">{preview.verdict.summary}</p>
            </div>
          ) : (
            <div className="border border-dashed border-gray-300 bg-gray-50/50 p-6 text-center">
              <p className="text-[13px] text-gray-400">
                Verdict posts here after {preview.company} reports. Check back the morning after the print.
              </p>
            </div>
          )}
        </section>

        {slug && (
          <Link href={`/companies/${slug}`} className="text-[12px] font-semibold text-[#B45309] hover:underline">
            See the full {preview.company} deep-dive →
          </Link>
        )}

        <p className="mt-8 pt-4 border-t border-gray-100 text-[11px] text-gray-400 leading-relaxed max-w-3xl">
          Built from line-item consensus and analyst preview notes, the options-implied move, the prior quarter&apos;s
          guidance, end-market memory-pricing data, and industry discussion (incl. The Circuit) — synthesized into what
          the sell-side is actually watching. Editorial analysis, not investment advice; figures are approximate and
          confirmed against filings where possible.
        </p>
      </div>
    </div>
  );
}
