import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Lenses — Fabuless",
  description: "AI-powered analytical frameworks built on the public thinking of the sharpest minds in semiconductors and tech investing.",
};

const lenses = [
  {
    slug: "baker",
    name: "The Baker Lens",
    subtitle: "Growth & AI Investing",
    description:
      "Ask questions about semiconductors, AI infrastructure, and growth investing. Answers grounded exclusively in publicly documented frameworks from a respected growth investor.",
    accent: "#B45309",
    accentLight: "#FEF3C7",
    sources: "18 sources",
    dateRange: "2019–2026",
    sampleQuestion: "What does Baker think about Nvidia's competitive moat?",
    badge: "Investing",
  },
  {
    slug: "dylan",
    name: "The Patel Lens",
    subtitle: "Supply Chain & Infrastructure",
    description:
      "Explore semiconductor supply chains, fab economics, AI infrastructure, and compute tokenomics — grounded in publicly available SemiAnalysis articles and podcast appearances.",
    accent: "#9A3412",
    accentLight: "#FEE2E2",
    sources: "22 sources",
    dateRange: "2023–2026",
    sampleQuestion: "What are the key bottlenecks in CoWoS advanced packaging?",
    badge: "Supply Chain",
  },
  {
    slug: "circuit",
    name: "The Circuit Lens",
    subtitle: "Earnings & Industry Dynamics",
    description:
      "Dig into semiconductor earnings, chip industry cycles, and AI hardware demand — grounded in 38 episodes of The Circuit podcast with Ben Bajarin and Jay Goldberg.",
    accent: "#1C1917",
    accentLight: "#F5F5F4",
    sources: "38 episodes",
    dateRange: "Aug 2025–Jun 2026",
    sampleQuestion: "How are hyperscalers thinking about custom silicon vs. Nvidia GPUs?",
    badge: "Earnings",
  },
];

export default function LensesPage() {
  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      {/* Header */}
      <div className="border-b border-gray-200 pb-6 mb-10">
        <p className="text-[11px] font-bold uppercase tracking-widest text-[#B45309] mb-2">
          AI Frameworks
        </p>
        <h1 className="font-sans text-4xl font-bold text-[#111827] tracking-tight mb-3">
          Lenses
        </h1>
        <p className="text-gray-500 max-w-2xl leading-relaxed">
          Ask questions. Get answers grounded in the documented thinking of the sharpest minds in semiconductors and tech investing — with citations back to the exact source.
        </p>
      </div>

      {/* Lens cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {lenses.map((lens) => (
          <Link
            key={lens.slug}
            href={`/lenses/${lens.slug}`}
            className="group border border-gray-200 bg-white hover:border-gray-300 hover:shadow-md transition-all duration-150 flex flex-col"
          >
            {/* Accent top bar */}
            <div className="h-[3px]" style={{ backgroundColor: lens.accent }} />

            <div className="p-6 flex flex-col flex-1">
              {/* Badge */}
              <span
                className="inline-block text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 mb-4 w-fit"
                style={{ backgroundColor: lens.accentLight, color: lens.accent }}
              >
                {lens.badge}
              </span>

              {/* Name + subtitle */}
              <h2 className="text-xl font-bold text-[#111827] tracking-tight mb-1">
                {lens.name}
              </h2>
              <p className="text-[12px] font-semibold uppercase tracking-wider text-gray-400 mb-4">
                {lens.subtitle}
              </p>

              {/* Description */}
              <p className="text-[14px] text-gray-600 leading-relaxed flex-1 mb-6">
                {lens.description}
              </p>

              {/* Corpus stats */}
              <div className="flex gap-4 text-[11px] text-gray-400 mb-5">
                <span>{lens.sources}</span>
                <span>·</span>
                <span>{lens.dateRange}</span>
              </div>

              {/* Sample question */}
              <div className="border border-gray-100 bg-gray-50 p-3 mb-6">
                <p className="text-[11px] text-gray-400 uppercase tracking-wider mb-1">Sample question</p>
                <p className="text-[13px] text-gray-700 italic">"{lens.sampleQuestion}"</p>
              </div>

              {/* CTA */}
              <div
                className="text-[13px] font-semibold flex items-center gap-1 group-hover:gap-2 transition-all"
                style={{ color: lens.accent }}
              >
                Ask now →
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Bottom note */}
      <div className="mt-12 pt-8 border-t border-gray-200">
        <p className="text-[12px] text-gray-400 leading-relaxed max-w-2xl">
          Lenses draw on publicly available podcasts, interviews, and articles. Outputs are AI-generated analytical frameworks, not investment advice. Citations link back to the exact source passage.
        </p>
      </div>
    </div>
  );
}
