"use client";

import { useState } from "react";

const latestStories = [
  {
    category: "COMPUTE",
    headline: "ADI to Acquire Empower Semiconductor to Join Data Center's Power Gold Rush",
    source: "EE Times",
    url: "https://www.eetimes.com/adi-to-acquire-empower-to-join-data-centers-power-gold-rush/",
    summary:
      "Analog Devices is acquiring Empower Semiconductor, a maker of integrated voltage regulators that can be placed directly inside AI processor packages to deliver power closer to the compute die. The deal positions ADI to compete more directly with Monolithic Power Systems, Infineon, and Vicor in the fast-growing data center power delivery market, where rising GPU power draw has made advanced voltage regulation a critical bottleneck.",
  },
  {
    category: "GEOPOLITICS & POLICY",
    headline: "ASML, Tata Electronics Partner for India's First 300-mm Semiconductor Fab",
    source: "EE Times",
    url: "https://www.eetimes.com/asml-tata-electronics-partner-for-indias-first-300-mm-semiconductor-fab/",
    summary:
      "ASML and Tata Electronics signed a strategic partnership to supply lithography equipment to India's first 300-mm semiconductor fab in Dholera, Gujarat. The deal marks ASML's entry into India's nascent chipmaking ecosystem and supports Tata's broader push into foundry operations under the country's semiconductor incentive program.",
  },
  {
    category: "CAPITAL FLOWS",
    headline: "Wall Street Prepares for Boom in Tech IPOs After Cerebras' Success",
    source: "Financial Times",
    url: "https://www.ft.com/content/b839fea1-8563-4a34-b8f0-1c735f23467f",
    summary:
      "Cerebras Systems raised $6.4B in its IPO, with the AI chip designer's strong reception signaling renewed investor appetite for tech listings. The deal is being read on Wall Street as a precursor to a wave of high-profile IPOs expected from SpaceX, OpenAI, and Anthropic.",
  },
  {
    category: "GEOPOLITICS & POLICY",
    headline: "China Banned Nvidia's Gaming Chip During Jensen Huang's Visit",
    source: "Financial Times",
    url: "https://www.ft.com/content/a30c3dd5-9383-4606-a649-fdf19c41c308",
    summary:
      "China's Cyberspace Administration ordered domestic tech companies including ByteDance and Alibaba to halt purchases of Nvidia's RTX Pro 6000D — a chip designed specifically for the Chinese market to comply with US export controls — during CEO Jensen Huang's July visit to Beijing. The move is part of a broader push to support domestic AI chipmakers like Huawei and Cambricon.",
  },
];

export default function Home() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error" | "duplicate">("idle");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    const res = await fetch("/api/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    if (res.ok) {
      setStatus("success");
      setEmail("");
    } else if (res.status === 409) {
      setStatus("duplicate");
    } else {
      setStatus("error");
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-6">
      {/* Hero */}
      <section className="pt-20 pb-14 border-b border-gray-200">
        <h1 className="font-serif text-5xl text-[#0E7490] mb-4 tracking-tight">
          Fabuless
        </h1>
        <p className="text-lg text-[#374151] max-w-xl leading-relaxed mb-8">
          A weekly briefing on the fabless semiconductor industry — for
          investors who track chips seriously but don&apos;t want to wade
          through PhD-level technical writing.
        </p>

        {status === "success" ? (
          <p className="text-sm text-emerald-600 font-medium">You&apos;re in. See you Friday.</p>
        ) : (
          <form onSubmit={handleSubmit} className="flex gap-3 max-w-md">
            <input
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="flex-1 px-4 py-2.5 border border-gray-300 rounded text-sm focus:outline-none focus:border-[#0E7490] transition-colors"
            />
            <button
              type="submit"
              disabled={status === "loading"}
              className="px-5 py-2.5 bg-[#0E7490] text-white text-sm rounded hover:bg-[#0c6480] transition-colors whitespace-nowrap disabled:opacity-60"
            >
              {status === "loading" ? "..." : "Subscribe free"}
            </button>
          </form>
        )}
        {status === "duplicate" && (
          <p className="mt-2 text-sm text-gray-400">That email is already subscribed.</p>
        )}
        {status === "error" && (
          <p className="mt-2 text-sm text-red-500">Something went wrong — try again.</p>
        )}
      </section>

      {/* Latest issue */}
      <section className="pt-12">
        <div className="flex items-baseline justify-between mb-8">
          <h2 className="font-serif text-2xl text-[#374151]">
            Latest Issue
          </h2>
          <span className="text-sm text-gray-400">Week of May 20, 2026</span>
        </div>

        <div className="space-y-10">
          {latestStories.map((story) => (
            <article key={story.headline} className="border-b border-gray-100 pb-10">
              <span className="text-xs font-sans font-semibold text-[#0E7490] tracking-widest uppercase">
                {story.category}
              </span>
              <h3 className="mt-2 mb-1">
                <a
                  href={story.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-serif text-xl text-[#374151] hover:text-[#0E7490] transition-colors leading-snug"
                >
                  {story.headline}
                </a>
              </h3>
              <p className="text-xs text-gray-400 mb-3">{story.source}</p>
              <p className="text-sm text-[#374151] leading-relaxed">
                {story.summary}
              </p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
