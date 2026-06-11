import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tracker Methodology — Fabuless",
  description:
    "How Fabuless extracts, grades, and resolves expert semiconductor predictions: direct quotes only, falsifiable claims only, verifiable outcomes only.",
};

const STATUSES = [
  {
    label: "Correct",
    badge: "bg-emerald-50 text-emerald-700 border-emerald-200",
    definition:
      "The claim happened as stated, within the stated (or reasonably implied) time horizon, confirmed by a verifiable outcome — reported revenue, a product launch, market share data, capacity announcements, or pricing.",
  },
  {
    label: "Partial",
    badge: "bg-amber-50 text-amber-700 border-amber-200",
    definition:
      "Directionally right but materially off on magnitude or timing, or only part of a multi-part claim resolved true. Counts as half credit in headline accuracy — better than wrong, not the same as correct.",
  },
  {
    label: "Wrong",
    badge: "bg-rose-50 text-rose-700 border-rose-200",
    definition:
      "The claim did not happen, the opposite happened, or the stated magnitude was off by enough to invalidate the thesis — confirmed by a verifiable outcome.",
  },
  {
    label: "Open (Too Early)",
    badge: "bg-gray-50 text-gray-500 border-gray-200",
    definition:
      "The time horizon has not yet passed, or the outcome cannot yet be verified either way. Open predictions are excluded from accuracy calculations entirely — they sit on the scoreboard until reality grades them.",
  },
];

const RULES = [
  {
    title: "Direct quotes only",
    body: "Every tracked prediction is a verbatim quote from a public source — never a paraphrase, never a summary of what someone “seemed to mean.” If the exact words aren't on record, it isn't tracked.",
  },
  {
    title: "Falsifiable claims only",
    body: "A statement is only tracked if it has a verifiable anchor: a revenue figure, a product launch, a market share percentage, a capacity number, a price level, or a dated milestone. Vibes, vague directional takes, and unfalsifiable opinions are excluded — no matter how confident they sound.",
  },
  {
    title: "Verifiable outcomes only",
    body: "Verdicts are graded against public, checkable evidence: reported earnings, official announcements, shipped products, disclosed capacity, and market data. A prediction is never marked Correct or Wrong based on sentiment or consensus opinion.",
  },
  {
    title: "Public sources only",
    body: "Everything tracked comes from publicly available articles, podcasts, interviews, and earnings calls. Nothing is drawn from private conversations or paywalled material reproduced beyond fair use.",
  },
  {
    title: "Accuracy is shown as fractions, not just percentages",
    body: "Sample sizes here are honest but small. “26 of 34” tells you more than “76%” — so the count always leads, and percentages are secondary. We don't publish per-topic accuracy scores until the sample size within a topic can support them.",
  },
];

export default function MethodologyPage() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      {/* Header */}
      <div className="border-b border-gray-200 pb-6 mb-10">
        <p className="text-[11px] font-bold uppercase tracking-widest text-[#B45309] mb-2">
          Prediction Tracker
        </p>
        <h1 className="font-sans text-4xl font-bold text-[#111827] tracking-tight mb-3">
          Methodology
        </h1>
        <p className="text-gray-500 leading-relaxed">
          A scoreboard is only as good as its rules. These are ours — applied identically to
          every expert, every prediction, every verdict.
        </p>
      </div>

      {/* Rules */}
      <section className="mb-12">
        <h2 className="text-xl font-bold text-[#111827] tracking-tight mb-5">The rules</h2>
        <div className="space-y-5">
          {RULES.map((rule, i) => (
            <div key={rule.title} className="border border-gray-200 bg-white p-5">
              <h3 className="text-[15px] font-bold text-[#111827] mb-1.5">
                {i + 1}. {rule.title}
              </h3>
              <p className="text-[14px] text-gray-600 leading-relaxed">{rule.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Verdicts */}
      <section className="mb-12">
        <h2 className="text-xl font-bold text-[#111827] tracking-tight mb-5">The four verdicts</h2>
        <div className="space-y-4">
          {STATUSES.map((s) => (
            <div key={s.label} className="border border-gray-200 bg-white p-5">
              <span
                className={`inline-block border px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider mb-2 ${s.badge}`}
              >
                {s.label}
              </span>
              <p className="text-[14px] text-gray-600 leading-relaxed">{s.definition}</p>
            </div>
          ))}
        </div>
        <p className="text-[13px] text-gray-500 leading-relaxed mt-4">
          <strong className="text-gray-700">Headline accuracy</strong> = (Correct + 0.5 × Partial)
          ÷ (Correct + Partial + Wrong). Partial counts as half credit — directionally right but
          materially off is better than wrong, but not the same as correct. Open predictions are
          excluded from both sides.
        </p>
      </section>

      {/* Limitations */}
      <section className="mb-12">
        <h2 className="text-xl font-bold text-[#111827] tracking-tight mb-5">
          Known limitations
        </h2>
        <div className="border border-gray-200 bg-white p-5 space-y-4">
          <div>
            <h3 className="text-[15px] font-bold text-[#111827] mb-1.5">
              The initial dataset was compiled retrospectively
            </h3>
            <p className="text-[14px] text-gray-600 leading-relaxed">
              The launch dataset was extracted in mid-2026 from sources dating back to 2023 —
              which means it carries hindsight risk: prediction-shaped statements are easier to
              spot when you know how things turned out. From launch onward, new predictions are
              logged prospectively, as they're made, before outcomes are known. The prospective
              record is the one that matters most, and it gets stronger every month.
            </p>
          </div>
          <div>
            <h3 className="text-[15px] font-bold text-[#111827] mb-1.5">
              Sample sizes are small
            </h3>
            <p className="text-[14px] text-gray-600 leading-relaxed">
              Tens of predictions per expert, not hundreds. That's why counts lead percentages
              everywhere on the tracker, and why we don't slice accuracy by topic yet.
            </p>
          </div>
          <div>
            <h3 className="text-[15px] font-bold text-[#111827] mb-1.5">
              Verdicts involve judgment
            </h3>
            <p className="text-[14px] text-gray-600 leading-relaxed">
              Anchoring grades to verifiable outcomes removes most subjectivity, but edge cases
              exist — especially around timing and magnitude. Every verdict shows its reasoning
              and source so you can check the work and disagree with the grade, not guess at it.
            </p>
          </div>
        </div>
      </section>

      {/* Corrections */}
      <section className="mb-12">
        <h2 className="text-xl font-bold text-[#111827] tracking-tight mb-5">
          Disputes & corrections
        </h2>
        <p className="text-[14px] text-gray-600 leading-relaxed border border-gray-200 bg-white p-5">
          If you believe a quote is inaccurate, a verdict is wrong, or a prediction is missing
          context — including if you're the person being tracked — email{" "}
          <a href="mailto:newsletter@fabuless.ai" className="text-[#B45309] font-semibold hover:underline">
            newsletter@fabuless.ai
          </a>{" "}
          with the evidence. Verdicts are corrected when the evidence supports it, and material
          corrections are noted on the prediction itself. The scoreboard is only valuable if
          it's right.
        </p>
      </section>

      {/* Independence */}
      <div className="pt-8 border-t border-gray-200">
        <p className="text-[12px] text-gray-400 leading-relaxed">
          Fabuless is not affiliated with, endorsed by, or compensated by any tracked expert or
          their employers. Tracking someone here is a statement that their public analysis is
          influential enough to be worth scoring — nothing more. Nothing on this page or the{" "}
          <Link href="/tracker" className="underline hover:text-gray-600">
            tracker
          </Link>{" "}
          is investment advice.
        </p>
      </div>
    </div>
  );
}
