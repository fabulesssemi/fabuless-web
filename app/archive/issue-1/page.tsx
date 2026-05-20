import Link from "next/link";

const sections = [
  {
    category: "Compute",
    stories: [
      {
        headline: "ADI to Acquire IVR Tech to Join Data Center's Power Gold Rush",
        url: "https://www.eetimes.com/adi-to-acquire-empower-to-join-data-centers-power-gold-rush/",
        source: "EE Times",
        image: "https://www.eetimes.com/wp-content/uploads/Hero-image-Empower.png?fit=800%2C480",
        oneliner: "ADI is buying its way into the data center power delivery race — integrated voltage regulators inside the chip package are the next margin battleground as AI power density makes traditional VRMs obsolete.",
      },
      {
        headline: "ASML, Tata Electronics Partner for India's First 300-mm Semiconductor Fab",
        url: "https://www.eetimes.com/asml-tata-electronics-partner-for-indias-first-300-mm-semiconductor-fab/",
        source: "EE Times",
        image: "https://www.eetimes.com/wp-content/uploads/ASML_Tata-Electronics-MoU-Signing.jpg?fit=1500%2C1000",
        oneliner: "India's first 300mm fab is a geopolitical milestone, but execution risk is high — Dholera has faced repeated delays and India has yet to prove it can build and run a leading-edge fab at scale.",
      },
      {
        headline: "Siemens EDA Expands AI and Advanced Packaging Collaboration with TSMC",
        url: "https://semiwiki.com/eda/siemens-eda/369271-siemens-eda-expands-ai-and-advanced-packaging-collaboration-with-tsmc/",
        source: "SemiWiki",
        image: "https://semiwiki.com/wp-content/uploads/2026/05/SIemens-EDA-TSMC-Teshnical-Symposium-2026-1200x800.jpg",
        oneliner: "Siemens is gaining ground in the EDA duopoly — expanding its TSMC design enablement footprint alongside Synopsys and Cadence matters because EDA tools are a prerequisite for every chip on TSMC's most advanced nodes.",
      },
    ],
  },
  {
    category: "Capital Flows",
    stories: [
      {
        headline: "Wall Street Prepares for Boom in Tech IPOs After Cerebras' Success",
        url: "https://www.ft.com/content/b839fea1-8563-4a34-b8f0-1c735f23467f",
        source: "Financial Times",
        image: "https://images.ft.com/v3/image/raw/https%3A%2F%2Fd1e00ek4ebabms.cloudfront.net%2Fproduction%2Fe986a2e5-5b14-40fb-8262-0e0938b54a2d.jpg?source=next-barrier-page",
        oneliner: "Cerebras pulling $6.4B pre-IPO signals the AI chip premium is alive in private markets — watch the Cerebras listing as a leading indicator for how public investors will price pure-play AI hardware.",
      },
      {
        headline: "Micron's Stock Gets a Boost. Are Samsung's Problems Helping?",
        url: "https://www.marketwatch.com/story/microns-stock-gets-a-boost-are-samsungs-problems-helping-e4de7e32",
        source: "MarketWatch",
        image: null,
        oneliner: "A Samsung strike is a clean Micron tailwind — any disruption to the world's largest DRAM and NAND producer tightens already-rising memory prices, and Micron is the most direct US-listed beneficiary.",
      },
    ],
  },
  {
    category: "Geopolitics & Policy",
    stories: [
      {
        headline: "China Banned Nvidia's Gaming Chip During Jensen Huang's Visit",
        url: "https://www.ft.com/content/a30c3dd5-9383-4606-a649-fdf19c41c308",
        source: "Financial Times",
        image: "https://images.ft.com/v3/image/raw/https%3A%2F%2Fd1e00ek4ebabms.cloudfront.net%2Fproduction%2F872bc14f-2563-4683-a583-bc3222e60506.jpg?source=next-barrier-page",
        oneliner: "China banned Nvidia's purpose-built export-compliant chip while Jensen Huang was literally in the country — Beijing is willing to accept short-term pain to give Huawei and domestic AI chipmakers room to close the gap.",
      },
    ],
  },
  {
    category: "Other",
    stories: [
      {
        headline: "When Arm Meets RISC-V: SiPearl, Semidynamics to Co-Develop Sovereign AI Platform",
        url: "https://www.eetimes.com/when-arm-meets-risc-v-sipearl-semidynamics-to-co-develop-sovereign-ai-platform/",
        source: "EE Times",
        image: "https://www.eetimes.com/wp-content/uploads/Joint_PR_Semidynamics_and_SiPearl_Announcement_May_7-1.jpg?fit=1827%2C995",
        oneliner: "Europe's sovereign AI chip project is real but slow — SiPearl and Semidynamics are credible teams, but building a competitive rack-scale AI platform without access to TSMC's leading nodes is a 5-year project, not a 2026 story.",
      },
    ],
  },
];

const earnings = [
  { date: "Wed May 20", company: "Nvidia", ticker: "NVDA", eps: "$1.77", beatRate: "89%", avgMove: "+2.7%" },
  { date: "Wed May 20", company: "Analog Devices", ticker: "ADI", eps: "$2.91", beatRate: "90%", avgMove: "+0.9%" },
  { date: "Wed May 27", company: "Marvell", ticker: "MRVL", eps: "$0.79", beatRate: "75%", avgMove: "+1.9%" },
  { date: "Wed May 27", company: "Synopsys", ticker: "SNPS", eps: "$3.15", beatRate: "95%", avgMove: "-1.3%" },
  { date: "Mon Jun 01", company: "Credo", ticker: "CRDO", eps: "$1.03", beatRate: "67%", avgMove: "+5.9%" },
  { date: "Wed Jun 03", company: "Broadcom", ticker: "AVGO", eps: "$2.39", beatRate: "95%", avgMove: "+2.9%" },
];

const categoryColors: Record<string, string> = {
  "Compute": "bg-violet-50 text-violet-700 border-violet-200",
  "Capital Flows": "bg-emerald-50 text-emerald-700 border-emerald-200",
  "Geopolitics & Policy": "bg-amber-50 text-amber-700 border-amber-200",
  "Other": "bg-gray-50 text-gray-500 border-gray-200",
};

const categoryBorder: Record<string, string> = {
  "Compute": "border-violet-300",
  "Capital Flows": "border-emerald-300",
  "Geopolitics & Policy": "border-amber-300",
  "Other": "border-gray-200",
};

export default function Issue1() {
  return (
    <div className="max-w-6xl mx-auto px-6 pt-12 pb-16">

      {/* Header */}
      <div className="mb-8 pb-6 border-b border-gray-200">
        <Link href="/archive" className="text-xs text-[#0E7490] hover:underline uppercase tracking-widest">
          ← Archive
        </Link>
        <div className="mt-3 flex items-baseline gap-4">
          <span className="text-sm text-gray-400">Issue 1 · May 20, 2026</span>
        </div>
        <h1 className="font-serif text-3xl text-[#374151] tracking-tight leading-tight mt-1">
          Cerebras vs. Nvidia, TSMC's TAM Expansion, and the AMD Upgrade
        </h1>
      </div>

      {/* Two-column layout */}
      <div className="flex gap-8 items-start">

        {/* Main feed */}
        <div className="flex-1 min-w-0 space-y-0">
          {sections.map((section) => (
            <div
              key={section.category}
              className={`border-l-4 ${categoryBorder[section.category]} pl-4 mb-8`}
            >
              {/* Category label */}
              <div className="mb-3">
                <span className={`inline-block text-[10px] font-semibold uppercase tracking-widest px-2 py-0.5 rounded border ${categoryColors[section.category]}`}>
                  {section.category}
                </span>
              </div>

              {/* Stories */}
              <div className="space-y-5">
                {section.stories.map((story) => (
                  <div key={story.url} className="flex gap-3 items-start">
                    <div className="flex-1 min-w-0">
                      <div className="text-[11px] font-medium text-gray-400 uppercase tracking-wide mb-0.5">
                        {story.source}
                      </div>
                      <a
                        href={story.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-serif text-[1.1rem] leading-snug text-[#1a1a2e] hover:text-[#0E7490] transition-colors"
                      >
                        {story.headline}
                      </a>
                      <p className="text-sm text-gray-500 italic leading-relaxed mt-1">
                        {story.oneliner}
                      </p>
                    </div>
                    {story.image && (
                      <a href={story.url} target="_blank" rel="noopener noreferrer" className="shrink-0">
                        <img
                          src={story.image}
                          alt={story.headline}
                          className="w-28 h-18 object-cover rounded"
                          style={{ height: "72px" }}
                        />
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* Podcasts */}
          <div className="border-l-4 border-[#0E7490] pl-4 mb-8">
            <div className="mb-3">
              <span className="inline-block text-[10px] font-semibold uppercase tracking-widest px-2 py-0.5 rounded border bg-teal-50 text-teal-700 border-teal-200">
                Podcasts
              </span>
            </div>
            <div className="space-y-4">
              <div>
                <div className="text-[11px] font-medium text-gray-400 uppercase tracking-wide mb-0.5">The Circuit</div>
                <a
                  href="https://share.transistor.fm/s/8357dfce"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-serif text-[1.1rem] leading-snug text-[#1a1a2e] hover:text-[#0E7490] transition-colors"
                >
                  Ep. 165: Cerebras IPO, Premium Tokens, Neo Clouds, and the Angstrom Era
                </a>
              </div>
              <div>
                <div className="text-[11px] font-medium text-gray-400 uppercase tracking-wide mb-0.5">Chip Stock Investor</div>
                <a
                  href="https://open.spotify.com/show/4QSHBYlMjTwwy1qK2mlM1F"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-serif text-[1.1rem] leading-snug text-[#1a1a2e] hover:text-[#0E7490] transition-colors"
                >
                  Faraj Aalaei on Why AI Will Let Anyone Design a Chip — and What Happens When the Semiconductor Industry Hits the Wall
                </a>
              </div>
              <div>
                <div className="text-[11px] font-medium text-gray-400 uppercase tracking-wide mb-0.5">Invest Like the Best</div>
                <a
                  href="https://www.joincolossus.com/episodes"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-serif text-[1.1rem] leading-snug text-[#1a1a2e] hover:text-[#0E7490] transition-colors"
                >
                  Gavin Baker — Watts and Wafers (Ep. 473)
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="w-64 shrink-0 space-y-6">

          {/* Category key */}
          <div className="border border-gray-100 rounded-lg p-4">
            <div className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 mb-3">This Issue</div>
            <div className="space-y-2">
              {sections.map((s) => (
                <div key={s.category} className="flex items-center gap-2">
                  <span className={`inline-block text-[10px] font-semibold uppercase tracking-widest px-2 py-0.5 rounded border ${categoryColors[s.category]}`}>
                    {s.category}
                  </span>
                  <span className="text-xs text-gray-400">{s.stories.length} {s.stories.length === 1 ? "story" : "stories"}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Earnings */}
          <div className="border border-gray-100 rounded-lg p-4">
            <div className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 mb-3">Upcoming Earnings</div>
            <div className="space-y-3">
              {earnings.map((e) => (
                <div key={e.ticker} className="border-b border-gray-50 pb-3 last:border-0 last:pb-0">
                  <div className="flex justify-between items-baseline">
                    <span className="font-medium text-sm text-[#374151]">{e.company}</span>
                    <span className="text-xs font-mono text-[#0E7490]">{e.ticker}</span>
                  </div>
                  <div className="text-[11px] text-gray-400">{e.date}</div>
                  <div className="flex gap-3 mt-0.5 text-[11px] text-gray-500">
                    <span>EPS est. {e.eps}</span>
                    <span>{e.avgMove} avg</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
