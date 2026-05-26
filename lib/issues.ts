export type Quote = {
  handle: string;  // e.g. "@BenBajarin"
  name: string;    // e.g. "Ben Bajarin"
  text: string;    // tweet text
  url?: string;    // link to the original tweet
};

export type Story = {
  headline: string;
  url: string;
  source: string;
  image: string | null;
  oneliner: string;
  topLabel?: string;
};

export type IssueSection = {
  category: "Compute" | "Capital Flows" | "Geopolitics & Policy" | "Memory & Networking" | "Other";
  stories: Story[];
};

export type EarningsRow = {
  date: string;
  company: string;
  ticker: string;
  eps: string;
  beatRate: string;
  avgMove: string;
};

export type Podcast = {
  show: string;
  title: string;
  url: string;
  oneliner?: string;
  image?: string | null;
};

export type Issue = {
  number: number;
  date: string;
  slug: string;
  title: string;
  sections: IssueSection[];
  podcasts: Podcast[];
  earnings: EarningsRow[];
  // Add 2-3 real tweets each week from chip Twitter (analysts, founders, journalists).
  // Leave empty ([]) if you don't have good ones — the hero just goes full-width.
  quotes?: Quote[];
};

export const issues: Issue[] = [
  {
    number: 2,
    date: "May 22, 2026",
    slug: "issue-2",
    title: "AMD's $10B Taiwan Bet, Nvidia's Investor Fatigue, and the High-NA EUV Delay",
    sections: [
      {
        category: "Compute",
        stories: [
          {
            headline: "AMD Plans $10B Investment in Taiwan to Boost AI Infrastructure",
            url: "https://www.eetimes.com/amd-plans-10b-investment-in-taiwan-to-boost-ai-infrastructure/",
            source: "EE Times",
            image: "https://www.eetimes.com/wp-content/uploads/AMD_corporate.jpg?fit=1200%2C675",
            oneliner: "$10B TSMC commitment deepens AMD's single-supplier risk at peak cross-strait geopolitical tension.",
          },
        ],
      },
      {
        category: "Memory & Networking",
        stories: [
          {
            headline: "Analog Devices CEO Drops Bombshell Message on Exploding AI Infrastructure Demand",
            url: "https://www.thestreet.com/investing/stocks/analog-devices-ceo-drops-bombshell-message-on-exploding-ai-infrastructure-demand",
            source: "TheStreet",
            image: "https://www.eetimes.com/wp-content/uploads/Hero-image-Empower.png?fit=800%2C480",
            oneliner: "ADI's CEO backs AI demand with hard order data — not vague optionality.",
          },
          {
            headline: "Micron CEO on Expanding US Chip Production, Memory Demand",
            url: "https://www.bloomberg.com/news/videos/2026-05-22/micron-ceo-on-expanding-chip-production-memory-demand-video",
            source: "Bloomberg",
            image: null,
            oneliner: "US-built advanced DRAM targets industrial and defense margins — structurally higher than consumer.",
          },
        ],
      },
      {
        category: "Capital Flows",
        stories: [
          {
            headline: "Nvidia Fails to Dazzle Investors Despite Lifting Dividends",
            url: "https://www.ft.com/content/a7aa26d1-1bad-407f-8bff-4ae491cb8ce0",
            source: "Financial Times",
            image: null,
            oneliner: "$91B quarter guide, stock still dips — the AI trade is moving from momentum to fundamentals.",
          },
        ],
      },
      {
        category: "Other",
        stories: [
          {
            headline: "EDA Market Primer — Market Dynamics, Cadence, Synopsys, Siemens, China EDA Rise",
            url: "https://newsletter.semianalysis.com/p/eda-market-primer",
            source: "SemiAnalysis",
            image: "https://substackcdn.com/image/fetch/$s_!X4k_!,w_1200,h_675,c_fill,f_jpg,q_auto:good,fl_progressive:steep,g_auto/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F017877b6-b4be-4112-b1d9-a0dcbc5c5568_2400x1260.jpeg",
            oneliner: "Synopsys and Cadence have the deepest lock-in in semis — China's domestic vendors are the only credible threat.",
            topLabel: "EDA",
          },
          {
            headline: "ASML High-NA EUV is Not Ready for High-Volume Production",
            url: "https://semiwiki.com/lithography/369490-asml-high-na-euv-is-not-ready-for-high-volume-production/",
            source: "SemiWiki",
            image: "https://semiwiki.com/wp-content/uploads/2026/05/ASML-Elephant-High-NA-EUV-1-1200x800.jpg",
            oneliner: "High-NA EUV is years behind schedule — 2nm fabs will lean on multi-patterning longer than expected.",
            topLabel: "EUV",
          },
        ],
      },
    ],
    podcasts: [
      {
        show: "The Circuit",
        title: "Ep. 165: Cerebras IPO, Premium Tokens, Neo Clouds, and the Angstrom Era",
        url: "https://share.transistor.fm/s/8357dfce",
        image: "https://is1-ssl.mzstatic.com/image/thumb/Podcasts211/v4/93/af/60/93af603b-e0ae-3c34-fce4-68ced89e4938/mza_989817321568677055.jpg/600x600bb.jpg",
        oneliner: "Ben Bajarin and Jay Goldberg discuss the Cerebras IPO, AI compute pricing, neo cloud providers, wafer fab equipment forecasts, and post-Moore's law manufacturing challenges.",
      },
      {
        show: "Chip Stock Investor",
        title: "Nvidia Q1 FY2027: $49B in Free Cash Flow, the CPU Supplier Claim That Changes Everything, and Whether NVDA Is Actually Cheap",
        url: "https://podcasters.spotify.com/pod/show/chipstockinvestor/episodes/Nvidia-Q1-FY2027-49-Billion-in-Free-Cash-Flow--the-CPU-Supplier-Claim-That-Changes-Everything--and-Whether-NVDA-Is-Actually-Cheap-e3jn66s",
        image: "https://d3t3ozftmdmh3i.cloudfront.net/staging/podcast_uploaded_nologo/37949422/37949422-1745251328337-b57bc485b0f23.jpg",
        oneliner: "Chip Stock Investor breaks down Nvidia's Q1 FY2027 results — $49B free cash flow, Vera Rubin shipments beginning, and Jensen Huang's claim that Nvidia will become the world's largest CPU supplier in 2026.",
      },
      {
        show: "Invest Like the Best",
        title: "Gavin Baker — Watts and Wafers (Ep. 473)",
        url: "https://colossus.com/episode/watts-and-wafers/",
        image: "https://megaphone.imgix.net/podcasts/3bc7d580-53ec-11f1-99c0-3bd245449e4f/image/31563a7dd10ea92493c934f0c1e723fe.jpg?ixlib=rails-4.3.1&max-w=3000&max-h=3000&fit=crop&auto=format,compress",
        oneliner: "Gavin Baker of Atreides Management discusses AI's power and wafer constraints, TSMC capacity, Elon Musk's Terrafab, GPU disaggregation, and whether economic value will keep accruing to frontier models.",
      },
    ],
    earnings: [
      { date: "Wed May 27", company: "Marvell", ticker: "MRVL", eps: "$0.79", beatRate: "75%", avgMove: "+1.9%" },
      { date: "Wed May 27", company: "Synopsys", ticker: "SNPS", eps: "$3.15", beatRate: "95%", avgMove: "-1.3%" },
      { date: "Mon Jun 01", company: "Credo", ticker: "CRDO", eps: "$1.03", beatRate: "67%", avgMove: "+5.9%" },
      { date: "Wed Jun 03", company: "Broadcom", ticker: "AVGO", eps: "$2.39", beatRate: "95%", avgMove: "+2.9%" },
    ],
      quotes: [
      {
        handle: "@MilkRoadAI",
        name: "MilkRoadAI",
        text: "Micron just officially crossed $1 trillion in market cap for the first time in its history and is still extremely undervalued at these levels",
        url:"https://x.com/MilkRoadAI/status/2059294657654456787",
      },
      {
        handle: "@chr1sa",
        name: "Chris Anderson",
        text: "In all of human history, has there ever been a commodity with infinite demand, as there appears to be for intelligence? I can't think of one. Even compute, energy or just silicon/sand are just downstream of intelligence, which is the main demand driver.",
        url: "https://x.com/chr1sa/status/2058600333493047379",
      },
      {
        handle: "@PhotonCap",
        name: "Photon Capital",
        text: "More AI → more GPUs → more interconnects → CPO → silicon photonics",
        url: "https://x.com/PhotonCap/status/2059114034931405264",
      },
 {         // ← you need this opening brace
        handle: "@demian_ai",
        name: "dylan ツ",
        text: "The CPU was supposed to be the commodity layer of AI. As of this week, both chip CEOs say otherwise.",
        url: "https://x.com/demian_ai/status/2059269939987632363",
      },
    ],
  },
  {
    number: 1,
    date: "May 20, 2026",
    slug: "issue-1",
    title: "Cerebras vs. Nvidia, TSMC's TAM Expansion, and the AMD Upgrade",
    sections: [
      {
        category: "Compute",
        stories: [
          {
            headline: "ADI to Acquire IVR Tech to Join Data Center's Power Gold Rush",
            url: "https://www.eetimes.com/adi-to-acquire-empower-to-join-data-centers-power-gold-rush/",
            source: "EE Times",
            image: "https://www.eetimes.com/wp-content/uploads/Hero-image-Empower.png?fit=800%2C480",
            oneliner: "ADI buys into chip-level power delivery — AI density is making traditional VRMs obsolete.",
          },
          {
            headline: "ASML, Tata Electronics Partner for India's First 300-mm Semiconductor Fab",
            url: "https://www.eetimes.com/asml-tata-electronics-partner-for-indias-first-300-mm-semiconductor-fab/",
            source: "EE Times",
            image: "https://www.eetimes.com/wp-content/uploads/ASML_Tata-Electronics-MoU-Signing.jpg?fit=1500%2C1000",
            oneliner: "India's first 300mm fab is a geopolitical milestone — but Dholera has a long history of delays.",
          },
          {
            headline: "Siemens EDA Expands AI and Advanced Packaging Collaboration with TSMC",
            url: "https://semiwiki.com/eda/siemens-eda/369271-siemens-eda-expands-ai-and-advanced-packaging-collaboration-with-tsmc/",
            source: "SemiWiki",
            image: "https://semiwiki.com/wp-content/uploads/2026/05/SIemens-EDA-TSMC-Teshnical-Symposium-2026-1200x800.jpg",
            oneliner: "Siemens expands its TSMC footprint — EDA tools are the prerequisite for every leading-edge chip.",
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
            oneliner: "Cerebras at $6.4B pre-IPO is a live gauge for how markets will price pure-play AI hardware.",
          },
          {
            headline: "Micron's Stock Gets a Boost. Are Samsung's Problems Helping?",
            url: "https://www.marketwatch.com/story/microns-stock-gets-a-boost-are-samsungs-problems-helping-e4de7e32",
            source: "MarketWatch",
            image: null,
            oneliner: "Any Samsung disruption tightens memory supply — Micron is the most direct US-listed beneficiary.",
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
            oneliner: "Beijing banned Nvidia's export chip while Jensen was in China — giving Huawei room to close the gap.",
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
            oneliner: "Europe's sovereign AI chip is real but slow — competing without leading-edge TSMC nodes is a 5-year play.",
          },
        ],
      },
    ],
    podcasts: [
      {
        show: "The Circuit",
        title: "Ep. 165: Cerebras IPO, Premium Tokens, Neo Clouds, and the Angstrom Era",
        url: "https://share.transistor.fm/s/8357dfce",
        image: "https://is1-ssl.mzstatic.com/image/thumb/Podcasts211/v4/93/af/60/93af603b-e0ae-3c34-fce4-68ced89e4938/mza_989817321568677055.jpg/600x600bb.jpg",
        oneliner: "Ben Bajarin and Jay Goldberg break down the Cerebras IPO, the rise of neo cloud providers, and what the angstrom era means for foundry economics.",
      },
      {
        show: "Chip Stock Investor",
        title: "Faraj Aalaei on Why AI Will Let Anyone Design a Chip — and What Happens When the Semiconductor Industry Hits the Wall",
        url: "https://open.spotify.com/show/4QSHBYlMjTwwy1qK2mlM1F",
        oneliner: "Veteran chip exec Faraj Aalaei argues AI-assisted design will democratize custom silicon, and weighs where the industry's physical scaling limits will bite.",
      },
      {
        show: "Invest Like the Best",
        title: "Gavin Baker — Watts and Wafers (Ep. 473)",
        url: "https://www.joincolossus.com/episodes",
        oneliner: "Investor Gavin Baker connects AI compute demand to power and wafer supply, framing energy as the binding constraint on the chip buildout.",
      },
    ],
    earnings: [
      { date: "Wed May 20", company: "Nvidia", ticker: "NVDA", eps: "$1.77", beatRate: "89%", avgMove: "+2.7%" },
      { date: "Wed May 20", company: "Analog Devices", ticker: "ADI", eps: "$2.91", beatRate: "90%", avgMove: "+0.9%" },
      { date: "Wed May 27", company: "Marvell", ticker: "MRVL", eps: "$0.79", beatRate: "75%", avgMove: "+1.9%" },
      { date: "Wed May 27", company: "Synopsys", ticker: "SNPS", eps: "$3.15", beatRate: "95%", avgMove: "-1.3%" },
      { date: "Mon Jun 01", company: "Credo", ticker: "CRDO", eps: "$1.03", beatRate: "67%", avgMove: "+5.9%" },
      { date: "Wed Jun 03", company: "Broadcom", ticker: "AVGO", eps: "$2.39", beatRate: "95%", avgMove: "+2.9%" },
    ],
  },
];

export const latestIssue = issues[0];

export function getIssueBySlug(slug: string): Issue | undefined {
  return issues.find((i) => i.slug === slug);
}
