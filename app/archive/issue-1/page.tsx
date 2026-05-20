import Link from "next/link";

const stories = {
  compute: [
    {
      headline: "ADI to Acquire IVR Tech to Join Data Center's Power Gold Rush",
      url: "https://www.eetimes.com/adi-to-acquire-empower-to-join-data-centers-power-gold-rush/",
      source: "EE Times",
      oneliner:
        "ADI is buying its way into the data center power delivery race — integrated voltage regulators inside the chip package are the next margin battleground as AI power density makes traditional VRMs obsolete.",
    },
    {
      headline: "ASML, Tata Electronics Partner for India's First 300-mm Semiconductor Fab",
      url: "https://www.eetimes.com/asml-tata-electronics-partner-for-indias-first-300-mm-semiconductor-fab/",
      source: "EE Times",
      oneliner:
        "India's first 300mm fab is a geopolitical milestone, but execution risk is high — Dholera has faced repeated delays and India has yet to prove it can build and run a leading-edge fab at scale.",
    },
    {
      headline: "Siemens EDA Expands AI and Advanced Packaging Collaboration with TSMC",
      url: "https://semiwiki.com/eda/siemens-eda/369271-siemens-eda-expands-ai-and-advanced-packaging-collaboration-with-tsmc/",
      source: "SemiWiki",
      oneliner:
        "Siemens is gaining ground in the EDA duopoly — expanding its TSMC design enablement footprint alongside Synopsys and Cadence matters because EDA tools are a prerequisite for every chip on TSMC's most advanced nodes.",
    },
  ],
  capitalFlows: [
    {
      headline: "Wall Street Prepares for Boom in Tech IPOs After Cerebras' Success",
      url: "https://www.ft.com/content/b839fea1-8563-4a34-b8f0-1c735f23467f",
      source: "Financial Times",
      oneliner:
        "Cerebras pulling $6.4B pre-IPO signals the AI chip premium is alive in private markets — watch the Cerebras listing as a leading indicator for how public investors will price pure-play AI hardware.",
    },
    {
      headline: "Micron's Stock Gets a Boost. Are Samsung's Problems Helping?",
      url: "https://www.marketwatch.com/story/microns-stock-gets-a-boost-are-samsungs-problems-helping-e4de7e32",
      source: "MarketWatch",
      oneliner:
        "A Samsung strike is a clean Micron tailwind — any disruption to the world's largest DRAM and NAND producer tightens already-rising memory prices, and Micron is the most direct US-listed beneficiary.",
    },
  ],
  geopolitics: [
    {
      headline: "China Banned Nvidia's Gaming Chip During Jensen Huang's Visit",
      url: "https://www.ft.com/content/a30c3dd5-9383-4606-a649-fdf19c41c308",
      source: "Financial Times",
      oneliner:
        "China banned Nvidia's purpose-built export-compliant chip while Jensen Huang was literally in the country — Beijing is willing to accept short-term pain to give Huawei and domestic AI chipmakers room to close the gap.",
    },
  ],
  other: [
    {
      headline: "When Arm Meets RISC-V: SiPearl, Semidynamics to Co-Develop Sovereign AI Platform",
      url: "https://www.eetimes.com/when-arm-meets-risc-v-sipearl-semidynamics-to-co-develop-sovereign-ai-platform/",
      source: "EE Times",
      oneliner:
        "Europe's sovereign AI chip project is real but slow — SiPearl and Semidynamics are credible teams, but building a competitive rack-scale AI platform without access to TSMC's leading nodes is a 5-year project, not a 2026 story.",
    },
  ],
};

const earnings = [
  { date: "Wed May 20", company: "Nvidia", ticker: "NVDA", eps: "$1.77", beatRate: "89%", avgMove: "+2.7%" },
  { date: "Wed May 20", company: "Analog Devices", ticker: "ADI", eps: "$2.91", beatRate: "90%", avgMove: "+0.9%" },
  { date: "Wed May 27", company: "Marvell", ticker: "MRVL", eps: "$0.79", beatRate: "75%", avgMove: "+1.9%" },
  { date: "Wed May 27", company: "Synopsys", ticker: "SNPS", eps: "$3.15", beatRate: "95%", avgMove: "-1.3%" },
  { date: "Mon Jun 01", company: "Credo", ticker: "CRDO", eps: "$1.03", beatRate: "67%", avgMove: "+5.9%" },
  { date: "Wed Jun 03", company: "Broadcom", ticker: "AVGO", eps: "$2.39", beatRate: "95%", avgMove: "+2.9%" },
];

function Section({ title, items }: { title: string; items: typeof stories.compute }) {
  return (
    <div className="mb-10">
      <h2 className="text-xs font-medium text-[#0E7490] uppercase tracking-widest mb-4">
        {title}
      </h2>
      <div className="space-y-6">
        {items.map((story) => (
          <div key={story.url}>
            <a
              href={story.url}
              target="_blank"
              rel="noopener noreferrer"
              className="font-serif text-lg text-[#374151] hover:text-[#0E7490] transition-colors leading-snug"
            >
              {story.headline}
            </a>
            <div className="text-xs text-gray-400 mt-0.5 mb-1">{story.source}</div>
            <p className="text-sm text-[#374151] italic leading-relaxed">{story.oneliner}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Issue1() {
  return (
    <div className="max-w-4xl mx-auto px-6 pt-16 pb-16">
      <div className="mb-2">
        <Link href="/archive" className="text-xs text-[#0E7490] hover:underline uppercase tracking-widest">
          ← Archive
        </Link>
      </div>

      <div className="mb-10">
        <p className="text-sm text-gray-400 mb-1">Issue 1 · May 20, 2026</p>
        <h1 className="font-serif text-4xl text-[#374151] tracking-tight leading-tight">
          Cerebras vs. Nvidia, TSMC's TAM Expansion, and the AMD Upgrade
        </h1>
      </div>

      <div className="max-w-2xl">
        <Section title="Compute" items={stories.compute} />
        <Section title="Capital Flows" items={stories.capitalFlows} />
        <Section title="Geopolitics & Policy" items={stories.geopolitics} />
        <Section title="Other" items={stories.other} />

        {/* Podcasts */}
        <div className="mb-10">
          <h2 className="text-xs font-medium text-[#0E7490] uppercase tracking-widest mb-4">
            From the Podcast
          </h2>
          <div className="space-y-4">
            <div>
              <a
                href="https://share.transistor.fm/s/8357dfce"
                target="_blank"
                rel="noopener noreferrer"
                className="font-serif text-lg text-[#374151] hover:text-[#0E7490] transition-colors"
              >
                The Circuit Ep. 165: Cerebras IPO, Premium Tokens, Neo Clouds, and the Angstrom Era
              </a>
              <div className="text-xs text-gray-400 mt-0.5">The Circuit</div>
            </div>
            <div>
              <a
                href="https://podcasters.spotify.com/pod/show/chipstockinvestor/episodes/Hospitals-Are-Using-YETI-Coolers-for-Heart-Transplants--TransMedics-Just-Built-Something-Better-TMDX-Q1-2026-e3jl26i"
                target="_blank"
                rel="noopener noreferrer"
                className="font-serif text-lg text-[#374151] hover:text-[#0E7490] transition-colors"
              >
                Chip Stock Investor: TransMedics Q1 2026
              </a>
              <div className="text-xs text-gray-400 mt-0.5">Chip Stock Investor</div>
            </div>
          </div>
        </div>

        {/* Earnings */}
        <div>
          <h2 className="text-xs font-medium text-[#0E7490] uppercase tracking-widest mb-4">
            Upcoming Earnings
          </h2>
          <table className="w-full text-sm text-[#374151]">
            <thead>
              <tr className="text-xs text-gray-400 border-b border-gray-100">
                <th className="text-left font-normal pb-2">Date</th>
                <th className="text-left font-normal pb-2">Company</th>
                <th className="text-left font-normal pb-2">EPS Est.</th>
                <th className="text-left font-normal pb-2">Beat Rate</th>
                <th className="text-left font-normal pb-2">Avg Move</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {earnings.map((e) => (
                <tr key={e.ticker}>
                  <td className="py-2 text-gray-400">{e.date}</td>
                  <td className="py-2">
                    {e.company}{" "}
                    <span className="text-xs text-gray-400">{e.ticker}</span>
                  </td>
                  <td className="py-2">{e.eps}</td>
                  <td className="py-2">{e.beatRate}</td>
                  <td className="py-2">{e.avgMove}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
