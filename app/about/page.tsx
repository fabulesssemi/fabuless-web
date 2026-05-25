export default function About() {
  return (
    <div className="max-w-4xl mx-auto px-6 pt-16 pb-8">
      <h1 className="font-sans text-4xl text-[#0E7490] mb-8 tracking-tight">
        About
      </h1>

      <div className="max-w-2xl space-y-6 text-[#374151] leading-relaxed">
        <p>
          Fabuless is a weekly briefing on the fabless semiconductor industry —
          the companies that design chips but don&apos;t own fabs. Nvidia,
          Qualcomm, AMD, Broadcom, Marvell, Arm. The companies building the
          hardware layer underneath every AI model, every smartphone, every data
          center.
        </p>

        <p>
          The name plays on <em>fabless</em> — the industry term for chip
          companies that outsource manufacturing to foundries like TSMC — and{" "}
          <em>fabulous</em>. We thought that was clever.
        </p>

        <h2 className="font-sans text-2xl text-[#374151] pt-4">
          The model
        </h2>
        <p>
          Think Techmeme, but for chips. We track 50+ sources — industry
          publications, financial press, earnings calls, analyst notes — and
          distill the week&apos;s signal into a 5-minute read. No PhD required.
          No paywalled deep dives. Just the stories that matter, with a finance
          lens.
        </p>

        <h2 className="font-sans text-2xl text-[#374151] pt-4">
          Who it&apos;s for
        </h2>
        <p>
          Investors and finance professionals who follow semiconductors seriously
          but don&apos;t want to wade through SemiAnalysis-level technical
          writing. Students who want to understand the most important industry of
          the next decade. Anyone who has noticed that chips are at the center of
          everything — AI, geopolitics, capital allocation — and wants a weekly
          briefing that treats them like an intelligent adult.
        </p>

        <h2 className="font-sans text-2xl text-[#374151] pt-4">
          Who writes it
        </h2>
        <p>
          Fabuless is built and run by Andrew Harrick, a student at Boston
          College with a background in finance and a genuine obsession with the
          semiconductor industry.
        </p>
      </div>
    </div>
  );
}
