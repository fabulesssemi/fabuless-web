import { SubscribeForm } from "@/app/components/SubscribeForm";

export default function About() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-10">

      <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#B45309] mb-4">
        About Fabuless
      </p>

      <h1 className="font-sans text-2xl font-bold text-[#111827] tracking-tight leading-tight mb-6">
        Semiconductor intelligence,<br />without the complexity.
      </h1>

      <div className="space-y-4 text-[15px] text-[#374151] leading-relaxed mb-10">
        <p>
          Fabuless is a semiconductor intelligence platform. We track the stories, data, and companies that drive the chip industry and make it accessible to people who don't want to spend hours scouring the internet or decoding technical research just to stay up to speed.
        </p>
        <p>
          It started as a weekly newsletter. That's still at the core: every Friday, a concise briefing on the week's most important semiconductor developments, written with a finance lens and no PhD required.
        </p>
        <p>
          But it's become more than a newsletter. The platform now includes live analyst consensus data, insider trading signals, earnings tracking, and a set of AI tools called Lenses that let you go deep on specific companies and the thinking of the industry's most respected voices.
        </p>
      </div>

      <div className="h-px bg-gray-100 mb-8" />

      <div className="mb-8">
        <h2 className="font-sans text-xs font-bold uppercase tracking-[0.18em] text-[#111827] mb-5">
          Who it's for
        </h2>
        <div className="space-y-4 text-[15px] text-[#374151] leading-relaxed">
          <p>
            <span className="font-semibold text-[#111827]">Investors</span> who follow semiconductors and want cleaner signal. Consensus shifts, insider moves, the week's key developments without the noise.
          </p>
          <p>
            <span className="font-semibold text-[#111827]">Students and people earlier in their career</span> who want to understand the most important industry of the next decade without needing an electrical engineering degree to follow along.
          </p>
          <p>
            <span className="font-semibold text-[#111827]">Anyone paying attention</span> to the fact that chips sit at the center of AI, geopolitics, and capital allocation and wants a place that treats them like an intelligent adult.
          </p>
        </div>
      </div>

      <div className="h-px bg-gray-100 mb-8" />

      <div className="mb-8">
        <h2 className="font-sans text-xs font-bold uppercase tracking-[0.18em] text-[#111827] mb-5">
          What's on the platform
        </h2>
        <div className="space-y-0">
          {[
            ["Weekly Newsletter", "The week's most important semiconductor stories, every Friday. Finance lens, no PhD required."],
            ["Analyst Consensus", "Live price targets, ratings, and sentiment shifts across the top semiconductor names."],
            ["Insider Trading", "Form 4 signals sourced directly from SEC EDGAR. Who's buying, who's selling, and what the pattern looks like."],
            ["Earnings Tracker", "Key metrics and guidance from semiconductor earnings calls, updated each quarter."],
            ["The Lenses", "AI tools built on the thinking of respected industry voices. Ask anything about a company or topic and get a grounded, sourced answer."],
          ].map(([title, desc]) => (
            <div key={title} className="flex gap-4 py-4 border-b border-gray-100 last:border-0">
              <div className="w-1.5 h-1.5 rounded-full bg-[#B45309] mt-[7px] shrink-0" />
              <div>
                <p className="font-semibold text-[14px] text-[#111827] mb-0.5">{title}</p>
                <p className="text-[14px] text-[#374151]">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="h-px bg-gray-100 mb-8" />

      <div className="mb-8">
        <h2 className="font-sans text-xs font-bold uppercase tracking-[0.18em] text-[#111827] mb-5">
          Who built it
        </h2>
        <p className="text-[15px] text-[#374151] leading-relaxed">
          Fabuless is built and run by Andrew Harrick, a student at Boston College with a background in finance and a genuine interest in the semiconductor industry. The name plays on <em>fabless</em> (the industry term for chip companies that outsource manufacturing to foundries like TSMC) and <em>fabulous</em>. We thought that was clever.
        </p>
      </div>

      <div className="h-px bg-gray-100 mb-8" />

      <div>
        <h2 className="font-sans text-xs font-bold uppercase tracking-[0.18em] text-[#111827] mb-3">
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
