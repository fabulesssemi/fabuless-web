import Link from "next/link";
import { SubscribeForm } from "@/app/components/SubscribeForm";

export default function About() {
  return (
    <div className="max-w-2xl mx-auto px-6 pt-16 pb-16">

      {/* Eyebrow */}
      <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#B45309] mb-4">
        About Fabuless
      </p>

      {/* Headline */}
      <h1 className="font-sans text-4xl font-bold text-[#111827] tracking-tight leading-tight mb-8">
        Semiconductor intelligence,<br />without the complexity.
      </h1>

      {/* What it is */}
      <div className="space-y-5 text-[15px] text-[#374151] leading-relaxed mb-12">
        <p>
          Fabuless is a semiconductor intelligence platform. We track the stories, data, and analysis that move the chip industry — from earnings and analyst sentiment to insider activity and supply chain dynamics — and make it accessible to anyone who doesn't want to scour the internet or wade through PhD-level technical writing to stay informed.
        </p>
        <p>
          It started as a weekly newsletter, and that's still at the core: every Friday, a concise briefing on the week's most important semiconductor developments, written with a finance lens and built for intelligent adults who have better things to do than read 8,000-word deep dives.
        </p>
        <p>
          But it's grown into something bigger. The platform now includes live analyst consensus data, insider trading signals, earnings tracking, and — through our Lenses — AI-powered tools that let you interrogate the thinking of the industry's most respected voices and go deeper on the companies you care about.
        </p>
      </div>

      {/* Divider */}
      <div className="h-px bg-gray-100 mb-12" />

      {/* Who it's for */}
      <div className="mb-12">
        <h2 className="font-sans text-xs font-bold uppercase tracking-[0.18em] text-gray-400 mb-5">
          Who it's for
        </h2>
        <div className="space-y-4 text-[15px] text-[#374151] leading-relaxed">
          <p>
            <span className="font-semibold text-[#111827]">Investors</span> who follow semiconductors seriously and want a faster signal — consensus shifts, insider moves, and the week's key developments without the noise.
          </p>
          <p>
            <span className="font-semibold text-[#111827]">Students and career-switchers</span> who want to understand the most important industry of the next decade without needing a background in electrical engineering.
          </p>
          <p>
            <span className="font-semibold text-[#111827]">Anyone paying attention</span> who has noticed that chips are at the center of AI, geopolitics, and capital allocation — and wants a platform that treats them like an intelligent adult.
          </p>
        </div>
      </div>

      {/* Divider */}
      <div className="h-px bg-gray-100 mb-12" />

      {/* What's on the platform */}
      <div className="mb-12">
        <h2 className="font-sans text-xs font-bold uppercase tracking-[0.18em] text-gray-400 mb-5">
          What's on the platform
        </h2>
        <div className="space-y-3">
          {[
            ["Weekly Newsletter", "The week's most important semiconductor stories, every Friday. Finance lens, no PhD required."],
            ["Analyst Consensus", "Live price targets, ratings, and sentiment shifts across the top semiconductor names."],
            ["Insider Trading", "Form 4 signals from SEC EDGAR — who's buying, who's selling, and what it means."],
            ["Earnings Tracker", "Key metrics and guidance from semiconductor earnings calls, updated each quarter."],
            ["The Lenses", "AI tools that let you interrogate the thinking of respected industry voices — Baker, Dylan Patel, The Circuit — on any company or topic."],
          ].map(([title, desc]) => (
            <div key={title} className="flex gap-4 py-3 border-b border-gray-100 last:border-0">
              <div className="w-1.5 h-1.5 rounded-full bg-[#B45309] mt-2 shrink-0" />
              <div>
                <span className="font-semibold text-[14px] text-[#111827]">{title} — </span>
                <span className="text-[14px] text-[#374151]">{desc}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Divider */}
      <div className="h-px bg-gray-100 mb-12" />

      {/* Who built it */}
      <div className="mb-12">
        <h2 className="font-sans text-xs font-bold uppercase tracking-[0.18em] text-gray-400 mb-5">
          Who built it
        </h2>
        <p className="text-[15px] text-[#374151] leading-relaxed">
          Fabuless is built and run by Andrew Harrick, a student at Boston College studying finance with a genuine obsession with the semiconductor industry. The name plays on <em>fabless</em> — the industry term for chip companies that outsource manufacturing to foundries like TSMC — and <em>fabulous</em>. We thought that was clever.
        </p>
      </div>

      {/* Divider */}
      <div className="h-px bg-gray-100 mb-12" />

      {/* Subscribe CTA */}
      <div>
        <h2 className="font-sans text-xs font-bold uppercase tracking-[0.18em] text-gray-400 mb-3">
          Get the newsletter
        </h2>
        <p className="text-[14px] text-gray-500 mb-5">
          Every Friday. Free. No spam.
        </p>
        <SubscribeForm />
      </div>

    </div>
  );
}
