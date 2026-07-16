export type Quote = {
  handle: string;  // e.g. "@BenBajarin"
  name: string;    // e.g. "Ben Bajarin"
  text: string;    // tweet text
  url?: string;    // link to the original tweet
};

export type StoryQuote = {
  handle: string; // e.g. "@BenBajarin"
  name: string;   // e.g. "Ben Bajarin"
  text: string;
  url?: string;
};

export type Story = {
  headline: string;
  url: string;
  source: string;
  image: string | null;
  oneliner: string;
  topLabel?: string;
  // Email-only: X quotes that react to this specific story (Techmeme style)
  xQuotes?: StoryQuote[];
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
    number: 15,
    date: "July 16, 2026",
    slug: "issue-15",
    title: "TSMC Commits $265B, Intel Uses High-NA EUV, Hydrofluoric Acid Soars",
    sections: [
      {
        category: "Compute",
        stories: [
          {
            headline: "Samsung Reportedly Outsources Google's TPU I/O Late-Stage Design, Says Report",
            url: "https://wccftech.com/samsung-reportedly-outsources-googles-tpu-i-o-late-stage-design-says-report/",
            source: "WCCFtech",
            image: "https://cdn.wccftech.com/wp-content/uploads/2025/11/google-tpu-engines-Ironwood-board-with-rack-scaled-1-1920x1280.jpg",
            oneliner: "Samsung outsources Google TPU I/O design as custom AI chip supply chains fragment under demand.",
          },
          {
            headline: "Former OpenAI CTO does what Altman won't: releases a frontier AI model that's actually open",
            url: "https://www.theregister.com/ai-and-ml/2026/07/16/former-openai-cto-does-what-altman-wont-releases-a-frontier-ai-model-thats-actually-open/5272177",
            source: "The Register",
            image: "https://image.theregister.com/5272215.jpg?imageId=5272215&x=0&y=0&cropw=100&croph=100&panox=0&panoy=0&panow=100&panoh=100&width=1200&height=683",
            oneliner: "Thinking Machines launches open-weights frontier model; open-source inference ecosystem fragments further.",
          },
          {
            headline: "Mira Murati's Thinking Machines draws from Chinese rivals in debut AI model",
            url: "https://www.ft.com/content/ef486929-d2c2-480b-8b00-9cb98bda6acf",
            source: "Financial Times",
            image: null,
            oneliner: "Thinking Machines' Inkling borrows from Chinese LLM architecture; open-source model design diversity grows.",
          },
          {
            headline: "Nvidia's Huang vows to deliver 'giant amounts' of Vera Rubin — company says that 'our roadmap is intact'",
            url: "https://www.tomshardware.com/tech-industry/artificial-intelligence/nvidias-huang-vows-to-deliver-giant-amounts-of-vera-rubin-company-says-that-our-roadmap-is-intact",
            source: "Tom's Hardware",
            image: "https://cdn.mos.cms.futurecdn.net/rsyZScrnGySN3xEMD8VwAR-1280-80.jpg",
            oneliner: "NVIDIA confirms Vera Rubin GPU roadmap; Kyber NVL144 delays rumored but company denies disruption.",
          },
        ],
      },
      {
        category: "Memory & Networking",
        stories: [
          {
            headline: "Hydrofluoric Acid Prices Climb as AI Chip Demand Outpaces a Strained Semiconductor Materials Supply",
            url: "https://wccftech.com/hydrofluoric-acid-prices-climb-as-ai-chip-demand-outpaces-a-strained-semiconductor-materials-supply/",
            source: "WCCFtech",
            image: "https://cdn.wccftech.com/wp-content/uploads/2026/05/TSMC-2nm-wafer.jpg",
            oneliner: "Hydrofluoric acid shortage signals supply-chain bottleneck as AI fab demand outpaces chemical feedstock.",
          },
          {
            headline: "Large-area OLED Shipments to Increase 18.8% YoY in 2026 Despite Economic Uncertainty and Component Price Hike",
            url: "https://www.semiconductor-digest.com/large-area-oled-shipments-to-increase-18-8-yoy-in-2026-despite-economic-uncertainty-and-component-price-hike/",
            source: "Semiconductor Digest",
            image: null,
            oneliner: "Large-area OLED shipments forecast +18.8% YoY; display capex remains resilient despite cost inflation.",
          },
        ],
      },
      {
        category: "Capital Flows",
        stories: [
          {
            headline: "TSMC to invest additional $100 billion in Arizona after second-quarter profit soars 77%",
            url: "https://www.cnbc.com/2026/07/16/tsmc-second-quarter-profit-.html",
            source: "CNBC",
            image: "https://image.cnbcfm.com/api/v1/image/107402218-1713316368478-gettyimages-1558946698-AFP_33Q43U9.jpeg?v=1760595833&amp;w=1920&amp;h=1080",
            oneliner: "TSMC raises US capex commitment to $265B as foundry demand surges amid AI chip race.",
          },
          {
            headline: "Chipmaker TSMC to invest another $100bn in US production",
            url: "https://www.ft.com/content/491927e1-1532-486d-94ec-8d6ee2de7bcd",
            source: "Financial Times",
            image: null,
            oneliner: "TSMC doubles down on US manufacturing as world's leading foundry confirms 77% profit surge.",
          },
          {
            headline: "Intel starts using ASML's High NA EUV technology to produce chips",
            url: "https://siliconangle.com/2026/07/15/intel-starts-using-asmls-high-na-euv-technology-produce-chips/",
            source: "SiliconAngle",
            image: "https://d15shllkswkct0.cloudfront.net/wp-content/blogs.dir/1/files/2026/07/ASML.png",
            oneliner: "Intel deploys ASML's High-NA EUV in production; capital equipment milestone accelerates next-gen node.",
          },
        ],
      },
      {
        category: "Geopolitics & Policy",
        stories: [
          {
            headline: "India Adds Pieces to Strengthen Its Electronics Supply Chain Puzzle",
            url: "https://www.eetimes.com/india-adds-pieces-to-strengthen-its-electronics-supply-chain-puzzle/",
            source: "EE Times",
            image: null,
            oneliner: "India builds OSAT, PCB capacity to reduce import dependency as geopolitical diversification accelerates.",
          },
          {
            headline: "Trump blasts New York AI data center moratorium, says state should change policy 'immediately'",
            url: "https://www.cnbc.com/2026/07/15/trump-blasts-new-york-gov-hochul-over-ai-data-center-moratorium.html",
            source: "CNBC",
            image: "https://image.cnbcfm.com/api/v1/image/108335504-1784135985308-Hocul_Trump.jpg?v=1784145618&amp;w=1920&amp;h=1080",
            oneliner: "Trump opposes NY AI data center ban; political clash over power infrastructure policy widens.",
          },
        ],
      },
      {
        category: "Other",
        stories: [
          {
            headline: "Cadence extends its AI agents beyond chips with AuraStack for circuit boards and packaging",
            url: "https://siliconangle.com/2026/07/15/cadence-extends-ai-agents-beyond-chips-aurastack-circuit-boards-packaging/",
            source: "SiliconAngle",
            image: "https://d15shllkswkct0.cloudfront.net/wp-content/blogs.dir/1/files/2025/04/A-circuit-board-with-an-AI-model-looking-down-on-it-touching-it-with-a-glowing-hand-abstract-art-mut.jpeg",
            oneliner: "Cadence AI agent expands to PCB/packaging design; EDA toolchain consolidation accelerates post-silicon.",
          },
          {
            headline: "Cadence's AuraStack agent melds AI with HPC to speed PCB, advanced packaging design",
            url: "https://www.theregister.com/ai-and-ml/2026/07/15/cadences-aurastack-agent-melds-ai-with-hpc-to-speed-pcb-advanced-packaging-design/5271465",
            source: "The Register",
            image: "https://image.theregister.com/5262971.jpg?imageId=5262971&x=0&y=0&cropw=100&croph=100&panox=0&panoy=0&panow=100&panoh=100&width=1200&height=683",
            oneliner: "Cadence marries AI agents with HPC simulation for advanced packaging; design cycle compression gains traction.",
          },
          {
            headline: "TYLsemi De-Risks Chiplets With New Business Model",
            url: "https://www.eetimes.com/tyl-semi-de-risks-chiplets-with-new-business-model/",
            source: "EE Times",
            image: null,
            oneliner: "TYLsemi assumes chiplet design risk for AI customers; modular chip architecture business model emerges.",
          },
          {
            headline: "ChipAgents Helps Whalechip Cut Semiconductor Root Cause Analysis from Days to Minutes",
            url: "https://www.semiconductor-digest.com/chipagents-helps-whalechip-cut-semiconductor-root-cause-analysis-from-days-to-minutes/",
            source: "Semiconductor Digest",
            image: null,
            oneliner: "AI-powered chip debug slashes RCA cycle; design automation integration accelerates SoC time-to-market.",
          },
        ],
      },
    ],
    podcasts: [],
    earnings: [],
    quotes: [],
  },
  {
    number: 14,
    date: "July 15, 2026",
    slug: "issue-14",
    title: "ASML Doubles Down. Intel's 18A Ships. IBM Stumbles.",
    sections: [
      {
        category: "Compute",
        stories: [
          {
            headline: "IBM shares plunge 25% as customers shift spending to AI",
            url: "https://www.ft.com/content/da478c37-7a32-415d-9f30-3b2981149f95",
            source: "Financial Times",
            image: null,
            oneliner: "IBM crashes 25%; enterprise spending shifts from software to AI infrastructure hardware.",
          },
          {
            headline: "Cybersecurity stocks rally on AI spending change comments from IBM's Krishna",
            url: "https://www.cnbc.com/2026/07/14/cybersecurity-stocks-ai-spending-mythos.html",
            source: "CNBC",
            image: "https://image.cnbcfm.com/api/v1/image/108334858-1784049472784-Okta_Crowdstrike.jpg?v=1784049568&amp;w=1920&amp;h=1080",
            oneliner: "IBM CEO: enterprise deal delays as businesses rethink AI vs. legacy IT allocation.",
          },
        ],
      },
      {
        category: "Memory & Networking",
        stories: [
          {
            headline: "What IBM's profit warning means: Hardware is 'eating everyone's lunch'",
            url: "https://www.marketwatch.com/story/what-ibms-profit-warning-means-hardware-is-eating-everyones-lunch-c6878824?mod=mw_rss_topstories",
            source: "MarketWatch",
            image: null,
            oneliner: "IBM miss: clients front-loaded memory purchases ahead of price increases.",
          },
        ],
      },
      {
        category: "Capital Flows",
        stories: [
          {
            headline: "Intel Leverages ASML's High NA EUV Technology To Produce 18A Panther Lake Chips",
            url: "https://wccftech.com/intel-leverages-asml-high-na-euv-technology-to-produce-18a-panther-lake-chips/",
            source: "WCCFtech",
            image: "https://cdn.wccftech.com/wp-content/uploads/2026/07/Intel-ASML-High-NA-EUV-1920x1280.jpg",
            oneliner: "ASML High NA EUV enters volume production; Intel 18A Panther Lake chips shipping.",
          },
          {
            headline: "ASML raises forecasts as AI boom drives chipmaking demand",
            url: "https://www.ft.com/content/731ec5ef-e9e1-40f5-b0bd-09e71787a938",
            source: "Financial Times",
            image: null,
            oneliner: "ASML raises guidance twice; AI chip demand sustains capital equipment cycle momentum.",
          },
          {
            headline: "ASML rises 5% after hiking sales forecast for second time this year on strong AI chip demand",
            url: "https://www.cnbc.com/2026/07/15/asml-2q-earnings-ai-chips-orders.html",
            source: "CNBC",
            image: "https://image.cnbcfm.com/api/v1/image/108019821-1723561950847-gettyimages-1900810562-raa-asmlhold240104_npWrR.jpeg?v=1775551832&amp;w=1920&amp;h=1080",
            oneliner: "ASML stock surges on raised guidance; AI lithography demand outpaces supply.",
          },
          {
            headline: "Global Semiconductor Equipment Sales Forecast to Reach a Record $229 Billion in 2028, SEMI Reports",
            url: "https://www.semiconductor-digest.com/global-semiconductor-equipment-sales-forecast-to-reach-a-record-229-billion-in-2028-semi-reports/?utm_source=rss&utm_medium=rss&utm_campaign=global-semiconductor-equipment-sales-forecast-to-reach-a-record-229-billion-in-2028-semi-reports",
            source: "Semiconductor Digest",
            image: "https://www.semiconductor-digest.com/wp-content/uploads/2026/07/l5txg8y4mizuialnaupwk.png",
            oneliner: "SEMI: equipment capex hits record $165.9B in 2026, up 23.2% YoY on AI scaling.",
          },
          {
            headline: "Presidio Investors Announces Sale of ElevATE Semiconductor to Diodes Incorporated",
            url: "https://www.semiconductor-digest.com/presidio-investors-announces-sale-of-elevate-semiconductor-to-diodes-incorporated/?utm_source=rss&utm_medium=rss&utm_campaign=presidio-investors-announces-sale-of-elevate-semiconductor-to-diodes-incorporated",
            source: "Semiconductor Digest",
            image: null,
            oneliner: "Diodes acquires ElevATE; consolidation in analog/mixed-signal semiconductor IP.",
          },
        ],
      },
      {
        category: "Geopolitics & Policy",
        stories: [
          {
            headline: "US gov't allows Chinese telecom giant ZTE to purchase Nvidia H200 AI chips",
            url: "https://www.tomshardware.com/tech-industry/artificial-intelligence/us-govt-allows-chinese-telecom-giant-zte-to-purchase-nvidia-h200-ai-chips-firm-joins-alibaba-tencent-and-bytedance-in-access-to-hopper-tech",
            source: "Tom's Hardware",
            image: "https://cdn.mos.cms.futurecdn.net/4tsCCBgB9mYcXBed7UdUSS-2048-80.jpg",
            oneliner: "US licenses ZTE for Nvidia H200; Chinese AI capex gains selective access to Hopper GPUs.",
          },
          {
            headline: "South Korea to launch universal basic AI chatbot",
            url: "https://www.theregister.com/public-sector/2026/07/15/south-korea-to-launch-universal-basic-ai-chatbot/5271566",
            source: "The Register",
            image: "https://image.theregister.com/260291.jpg?imageId=260291&x=0&y=0&cropw=100&croph=100&panox=0&panoy=0&panow=100&panoh=100&width=1200&height=683",
            oneliner: "South Korea funds national AI chatbot; GPU procurement initiative boosts domestic semiconductor demand.",
          },
          {
            headline: "Australia demands AI companies must produce more energy than they consume, stop 'theft' of content",
            url: "https://www.theregister.com/ai-and-ml/2026/07/15/australia-demands-ai-companies-must-produce-more-energy-than-they-consume-stop-theft-of-content/5271535",
            source: "The Register",
            image: null,
            oneliner: "Australia mandates net-positive energy for AI ops; policy pressures data center chip efficiency.",
          },
          {
            headline: "New York becomes first US state to impose a data center moratorium",
            url: "https://siliconangle.com/2026/07/14/new-york-becomes-first-us-state-impose-data-center-moratorium/",
            source: "SiliconAngle",
            image: "https://d15shllkswkct0.cloudfront.net/wp-content/blogs.dir/1/files/2026/07/nydatacenterban.png",
            oneliner: "NY moratorium stalls $130B hyperscale projects; GPU/chip procurement delayed nationwide.",
          },
          {
            headline: "Hochul's Data Center Moratorium Lands as $130 Billion in Projects Stalled Nationwide in a Single Quarter",
            url: "https://wccftech.com/hochuls-data-center-moratorium-lands-as-130-billion-in-projects-stalled-nationwide-in-a-single-quarter/",
            source: "WCCFtech",
            image: "https://cdn.wccftech.com/wp-content/uploads/2023/10/Data-Centers-1024x576-1-1920x1079.jpeg",
            oneliner: "NY data center freeze halts $130B capex; semiconductor demand deflation looms.",
          },
          {
            headline: "Singularity lands $80M at $400M valuation to build cheap drone interceptors",
            url: "https://siliconangle.com/2026/07/14/singularity-lands-80m-400m-valuation-build-cheap-drone-interceptors/",
            source: "SiliconAngle",
            image: "https://d15shllkswkct0.cloudfront.net/wp-content/blogs.dir/1/files/2026/07/singularityus.png",
            oneliner: "Singularity Defense funds cheap air-defense drones; defense-grade semiconductor demand rises.",
          },
        ],
      },
      {
        category: "Other",
        stories: [
          {
            headline: "DAC 2026: Certus Semiconductor Brings Two New I/O Libraries to GlobalFoundries 12nm",
            url: "https://semiwiki.com/ip/certus-semiconductor/370883-certus-semiconductor-brings-two-new-i-o-libraries-to-globalfoundries-12nm-certus-sem/",
            source: "SemiWiki",
            image: "https://semiwiki.com/wp-content/uploads/2026/07/certus_dac63_technical.png",
            oneliner: "Certus releases I/O libraries for GF 12LP/12LP+; mature node packaging accelerates.",
          },
          {
            headline: "Probabilistic Computing Is Already Here; Here Is How It Works",
            url: "https://www.eetimes.com/probabilistic-computing-is-already-here-here-is-how-it-works/",
            source: "EE Times",
            image: null,
            oneliner: "Probabilistic hardware deployed at Boeing/CERN; specialized compute accelerators address Monte Carlo bottlenecks.",
          },
        ],
      },
    ],
    podcasts: [],
    earnings: [],
    quotes: [],
  },
  {
    number: 13,
    date: "July 14, 2026",
    slug: "issue-13",
    title: "UMC Expands. SK hynix Stalls. NVIDIA Tightens China.",
    sections: [
      {
        category: "Compute",
        stories: [
          {
            headline: "Zuck's AI ambitions put Meta on course to become America's next big cloud provider",
            url: "https://www.theregister.com/ai-and-ml/2026/07/14/zucks-ai-ambitions-put-meta-on-course-to-become-americas-next-big-cloud-provider/5270758",
            source: "The Register",
            image: "https://image.theregister.com/256736.jpg?imageId=256736&x=0&y=0&cropw=100&croph=100&panox=0&panoy=0&panow=100&panoh=100&width=1200&height=683",
            oneliner: "Meta's internal AI infrastructure pivot signals shift from NVIDIA buyer to compute lessor.",
          },
          {
            headline: "Tesla's AI5 with 2nm-class node tapes out at Samsung Foundry",
            url: "https://www.tomshardware.com/tech-industry/artificial-intelligence/teslas-ai5-with-2nm-class-node-tapes-out-at-samsung-foundry-production-starts-soon-months-after-tsmc-tape-out",
            source: "Tom's Hardware",
            image: "https://cdn.mos.cms.futurecdn.net/voDLanHmcp7is6VSiU2Qea-1920-80.png",
            oneliner: "Tesla AI5 tapes out Samsung 2nm after TSMC; foundry diversification limits TSMC node monopoly.",
          },
          {
            headline: "Siri AI Is Becoming Apple's Everything Tool",
            url: "https://www.wired.com/story/siri-ai-is-now-apple-everything-tool/",
            source: "Wired",
            image: "https://media.wired.com/photos/6a55464e20012bbe11800495/191:100/w_1280,c_limit/Siri-Apple-Everything-Tool-Gear-2260718787.jpg",
            oneliner: "Apple's Siri AI backbone drives on-device silicon demands; A-series processor requirements shift.",
          },
        ],
      },
      {
        category: "Memory & Networking",
        stories: [
          {
            headline: "Taiwan's second-largest chipmaker starts mass production in Singapore; Citi sees improving outlook",
            url: "https://www.cnbc.com/2026/07/14/umc-starts-mass-production-in-singapore-citi-sees-improving-outlook.html",
            source: "CNBC",
            image: "https://image.cnbcfm.com/api/v1/image/108333841-1783922224186-gettyimages-2259167476-SINGAPORE_ECONOMY.jpeg?v=1783922244&amp;w=1920&amp;h=1080",
            oneliner: "UMC ramps silicon photonics in Singapore as supply chain diversifies away from Taiwan.",
          },
          {
            headline: "SK hynix May Add Just One-Sixth Of Its Planned New Memory Capacity By 2028",
            url: "https://wccftech.com/sk-hynix-may-add-just-one-sixth-of-its-planned-new-memory-capacity-by-2028-handing-ammunition-to-the-dram-price-fixing-lawsuit/",
            source: "WCCFtech",
            image: "https://cdn.wccftech.com/wp-content/uploads/2025/11/SK-hynix-NAND-flash-memory.jpg",
            oneliner: "SK hynix delays 5/6 of planned DRAM capacity; memory supply crisis extends, pricing power intact.",
          },
          {
            headline: "The Cutthroat Smartphone Industry And DRAM Crisis Force A Player Out Of The U.S. Market",
            url: "https://wccftech.com/one-smartphone-player-to-bow-out-of-us-market-letting-apple-and-samsung-grow/",
            source: "WCCFtech",
            image: "https://cdn.wccftech.com/wp-content/uploads/2026/07/One-smartphone-maker-bows-out-of-the-U.S.-smartphone-market.jpg",
            oneliner: "DRAM shortage forces smartphone OEM exit; Apple and Samsung gain pricing power.",
          },
          {
            headline: "Wi-Fi 8 Explained: Features, Release Date, and More",
            url: "https://www.wired.com/story/what-is-wi-fi-8/",
            source: "Wired",
            image: "https://media.wired.com/photos/6a5120f01264e7ba7d8cf820/191:100/w_1280,c_limit/What-is-Wi-Fi-8--Here%E2%80%99s-Everything-You-Need-to-Know.jpg",
            oneliner: "Wi-Fi 8 standard drives next-gen silicon roadmaps for router and chipset makers.",
          },
        ],
      },
      {
        category: "Capital Flows",
        stories: [
          {
            headline: "Meta boosts investment in Hyperion data center campus to $50B+",
            url: "https://siliconangle.com/2026/07/13/meta-boosts-investment-hyperion-data-center-campus-50b/",
            source: "SiliconAngle",
            image: "https://d15shllkswkct0.cloudfront.net/wp-content/blogs.dir/1/files/2026/07/Meta-3.png",
            oneliner: "Meta raises Louisiana Hyperion to $50B+ for 5GW AI supercluster; NVIDIA/chip demand accelerates.",
          },
          {
            headline: "Meta's Louisiana data center investment to reach $50 billion, aided by generous tax incentives",
            url: "https://www.cnbc.com/2026/07/13/meta-louisiana-data-center-investment-reaches-50-billion-amid-ai-push.html",
            source: "CNBC",
            image: "https://image.cnbcfm.com/api/v1/image/108163748-1750853113167-meta.jpeg?v=1750853491&amp;w=1920&amp;h=1080",
            oneliner: "Meta commits $50B Louisiana 5GW facility with tax subsidies; reshapes AI chip procurement landscape.",
          },
          {
            headline: "India's tech services giant HCL is getting into the AI datacenter business",
            url: "https://www.theregister.com/off-prem/2026/07/14/indias-tech-services-giant-hcl-is-getting-into-the-ai-datacenter-business/5270827",
            source: "The Register",
            image: "https://image.theregister.com/228571.jpg?imageId=228571&x=0&y=0&cropw=100&croph=100&panox=0&panoy=0&panow=100&panoh=100&width=1200&height=683",
            oneliner: "HCL enters AI datacenters with $37M, 50MW; signals emerging-market hyperscaler buildout.",
          },
          {
            headline: "Defense technology startup Helsing raises $1.8B at $18B valuation",
            url: "https://siliconangle.com/2026/07/13/defense-technology-startup-helsing-raises-1-8b-18b-valuation/",
            source: "SiliconAngle",
            image: "https://d15shllkswkct0.cloudfront.net/wp-content/blogs.dir/1/files/2026/07/Helsing.jpg",
            oneliner: "German defense AI startup Helsing reaches $18B valuation; signals geopolitical AI silicon demand.",
          },
        ],
      },
      {
        category: "Geopolitics & Policy",
        stories: [
          {
            headline: "Nvidia halves Asia buyer list in China chip crackdown",
            url: "https://www.ft.com/content/7c146c56-cc7a-40ec-93cb-58106a012421",
            source: "Financial Times",
            image: null,
            oneliner: "NVIDIA cuts Singapore, Malaysia, Japan distributors to block China gray-market AI chip flows.",
          },
          {
            headline: "Silicon shadows: inside the black market for AI chips",
            url: "https://www.ft.com/content/ce906dad-6b72-4add-ac5c-0fbebeeb7e82",
            source: "Financial Times",
            image: null,
            oneliner: "U.S. export controls spawn $billions black market routing advanced chips to China via intermediaries.",
          },
          {
            headline: "Spain Semiconductor Industry Convenes to Forge Domestic Alliances",
            url: "https://www.eetimes.com/spain-semiconductor-industry-convenes-to-forge-domestic-alliances/",
            source: "EE Times",
            image: null,
            oneliner: "AESEMI MatchMaking Day signals European chipmakers consolidating domestic supply chains.",
          },
        ],
      },
      {
        category: "Other",
        stories: [
          {
            headline: "Tomocube Launches HT-T1 Desktop for 3D Glass Substrate Defect Analysis in Advanced Packaging",
            url: "https://www.semiconductor-digest.com/tomocube-launches-ht-t1-desktop-for-3d-glass-substrate-defect-analysis-in-advanced-packaging/?utm_source=rss&utm_medium=rss&utm_campaign=tomocube-launches-ht-t1-desktop-for-3d-glass-substrate-defect-analysis-in-advanced-packaging",
            source: "Semiconductor Digest",
            image: null,
            oneliner: "Tomocube launches 3D holotomography for glass substrate defects; enables chiplet packaging scaling.",
          },
          {
            headline: "ESD Alliance Reports Electronic System Design Industry Posts $5.7 Billion in Revenue in Q1 2026",
            url: "https://www.semiconductor-digest.com/esd-alliance-reports-electronic-system-design-industry-posts-5-7-billion-in-revenue-in-q1-2026/?utm_source=rss&utm_medium=rss&utm_campaign=esd-alliance-reports-electronic-system-design-industry-posts-5-7-billion-in-revenue-in-q1-2026",
            source: "Semiconductor Digest",
            image: "https://www.semiconductor-digest.com/wp-content/uploads/2026/07/screenshot-2026-07-13-at-72315am.png",
            oneliner: "ESD revenue up 12.7% YoY to $5.7B in Q1; AI-driven design tool spending accelerates.",
          },
        ],
      },
    ],
    podcasts: [],
    earnings: [],
    quotes: [],
  },
  {
    number: 12,
    date: "July 13, 2026",
    slug: "issue-12",
    title: "TSMC Surges 68%, SK Hynix Warns 2027 Crunch, CoWoS Bottleneck Spreads",
    sections: [
      {
        category: "Compute",
        stories: [
          {
            headline: "TSMC, the world's largest contract chipmaker, reports 68% surge in June revenue",
            url: "https://www.cnbc.com/2026/07/13/tsmc-june-revenue-rises-percent-ahead-second-quarter.html",
            source: "CNBC",
            image: "https://image.cnbcfm.com/api/v1/image/108292490-1776347906856-gettyimages-2253792580-US_STOCKS.jpeg?v=1777030120&amp;w=1920&amp;h=1080",
            oneliner: "TSMC dominates AI chip demand; June revenue jumps 68% ahead of Q2 earnings.",
          },
          {
            headline: "CEO Interview with Dr. Albert Liu of Kneron",
            url: "https://semiwiki.com/ceo-interviews/369987-ceo-interview-with-dr-albert-liu-of-kneron/",
            source: "SemiWiki",
            image: "https://semiwiki.com/wp-content/uploads/2026/06/7375e8e18faa662c-2.jpg",
            oneliner: "Kneron NPU architecture pioneer pivots edge AI infrastructure; on-device processing accelerates vs. cloud dependency.",
          },
          {
            headline: "MSI Leverages R&D and Manufacturing Strengths for AI Growth",
            url: "https://www.eetimes.com/msi-leverages-rd-and-manufacturing-strengths-for-ai-growth/",
            source: "EE Times",
            image: null,
            oneliner: "MSI scales AI PC, on-premises, hybrid cloud infrastructure; ODM/ODH suppliers capture AI edge expansion.",
          },
          {
            headline: "India's Tata Consultancy Services plans up to 8,900 AI deployment engineers, seeks AI acquisitions",
            url: "https://finance.yahoo.com/technology/ai/articles/indias-tata-consultancy-services-plans-083649889.html",
            source: "Yahoo Finance",
            image: null,
            oneliner: "TCS targets 8,900 AI engineers; Indian AI services sector scales; heterogeneous compute demand accelerates globally.",
          },
          {
            headline: "Lenovo's Legion 7a gaming laptop now comes with an RTX 5070 12GB GPU option",
            url: "https://www.tomshardware.com/laptops/lenovos-legion-7a-gaming-laptop-now-comes-with-an-rtx-5070-12gb-gpu-option-but-it-costs-usd3-375-paired-with-a-ryzen-ai-9-cpu-sku-was-previously-limited-to-rtx-5060",
            source: "Tom's Hardware",
            image: "https://cdn.mos.cms.futurecdn.net/GiadzK9VgVUydhdk6UQPki-1920-80.png",
            oneliner: "Lenovo expands RTX 5070 12GB availability; Ryzen AI 9 pairing signals Nvidia-AMD competitive GPU memory wars.",
          },
        ],
      },
      {
        category: "Memory & Networking",
        stories: [
          {
            headline: "SK Hynix CEO Warns 2027 Will Be Memory's \"Worst Year\" Ever, With Shortages Set To Outlast The Decade",
            url: "https://wccftech.com/sk-hynix-ceo-warns-2027-memory-worst-year-ever-shortages-set-to-outlast-the-decade/",
            source: "WCCFtech",
            image: "https://cdn.wccftech.com/wp-content/uploads/2026/07/Photo-5.jpg",
            oneliner: "SK Hynix CEO warns 2027 memory shortage will be worst on record; supply crisis extends past 2030.",
          },
          {
            headline: "TSMC Can't Keep Up With CoWoS Demand, Sending Advanced Packaging Orders Spilling Over To Intel & Rival Taiwanese Fabs",
            url: "https://wccftech.com/tsmc-cant-keep-up-with-cowos-demand-advanced-packaging-orders-spilling-over-to-intel-rival-fabs/",
            source: "WCCFtech",
            image: "https://cdn.wccftech.com/wp-content/uploads/2025/12/TSMC.jpg",
            oneliner: "TSMC CoWoS bottleneck redirects AI packaging orders to Intel and rival fabs; supply chain stress spreads.",
          },
          {
            headline: "Memory makers are slaves to the boom-bust rollercoaster, and the AI boom is the wildest ride of all",
            url: "https://www.theregister.com/ai-and-ml/2026/07/12/memory-makers-are-slaves-to-the-boom-bust-rollercoaster-and-the-ai-boom-is-the-wildest-ride-of-all/5269549",
            source: "The Register",
            image: "https://image.theregister.com/5269616.jpg?imageId=5269616&x=0&y=0&cropw=100&croph=100&panox=0&panoy=0&panow=100&panoh=100&width=1200&height=683",
            oneliner: "AI-driven demand volatility creates extreme boom-bust cycle for DRAM/NAND makers; supply-demand mismatch widening.",
          },
        ],
      },
      {
        category: "Capital Flows",
        stories: [
          {
            headline: "Global stocks fall as Asian memory chipmakers hammered",
            url: "https://www.ft.com/content/54be872f-c0a2-46dd-9337-5cad9124e734",
            source: "Financial Times",
            image: null,
            oneliner: "TSMC, SK Hynix, Samsung equity losses spike as geopolitical risk-off mode grips Asian chip stocks.",
          },
          {
            headline: "Traders braced for won volatility after blockbuster SK Hynix listing",
            url: "https://www.ft.com/content/b433644d-caba-4962-8d60-f46fcd9716f9",
            source: "Financial Times",
            image: null,
            oneliner: "SK Hynix Nasdaq debut triggers $26bn repatriation; South Korean currency volatility expected mid-term.",
          },
          {
            headline: "The stock-market rally now hinges more on AI than oil",
            url: "https://www.marketwatch.com/story/the-stock-market-rally-now-hinges-more-on-ai-than-oil-1292260a?mod=mw_rss_topstories",
            source: "MarketWatch",
            image: null,
            oneliner: "AI capex replaces energy as primary equity driver; earnings season highlights semiconductor-led growth narrative.",
          },
          {
            headline: "Ireland's data centers consumed nearly as much electricity as every home in the country combined in 2025",
            url: "https://www.tomshardware.com/tech-industry/data-centers/irelands-data-centers-consumed-nearly-as-much-electricity-as-every-home-in-the-country-combined-in-2025-server-farms-gulped-23-percent-of-national-power-despite-years-of-grid-restrictions",
            source: "Tom's Hardware",
            image: "https://cdn.mos.cms.futurecdn.net/Y3oTnzWpqVWpTpwua8KH7Q-1920-80.jpg",
            oneliner: "Ireland data centers consume 23% national grid (2025); AI/HPC infrastructure strains power supply chains globally.",
          },
        ],
      },
      {
        category: "Geopolitics & Policy",
        stories: [
          {
            headline: "Lenovo denies using banned Chinese SSDs where they're not allowed",
            url: "https://www.theregister.com/personal-tech/2026/07/13/lenovo-denies-using-banned-chinese-ssds-where-theyre-not-allowed/5270212",
            source: "The Register",
            image: "https://image.theregister.com/225936.jpg?imageId=225936&x=0&y=0&cropw=100&croph=100&panox=0&panoy=0&panow=100&panoh=100&width=1200&height=683",
            oneliner: "Lenovo disputes allegations of banned Chinese SSD usage; supply chain compliance scrutiny intensifies.",
          },
          {
            headline: "Elon Musk and Sam Altman spar on X after Apple files OpenAI lawsuit",
            url: "https://www.cnbc.com/2026/07/12/elon-musk-and-sam-altman-spar-.html",
            source: "CNBC",
            image: "https://image.cnbcfm.com/api/v1/image/108333755-1783868174451-gettyimages-2273245639-2026_apr_30_muskvsaltman_0352.jpeg?v=1783868241&amp;w=1920&amp;h=1080",
            oneliner: "Musk-Altman public feud escalates over Apple IP lawsuit; AI industry talent wars intensify.",
          },
        ],
      },
      {
        category: "Other",
        stories: [
          {
            headline: "AI Driven Semiconductor Systems",
            url: "https://semiwiki.com/semiconductor-services/netapp/370833-ai-driven-semiconductor-systems/",
            source: "SemiWiki",
            image: "https://semiwiki.com/wp-content/uploads/2026/07/AI-Driven-Semiconductor-Systems-NetApp.jpg",
            oneliner: "AI automation transforms chip design and manufacturing workflows; complexity forces human-AI hybrid models.",
          },
          {
            headline: "ITF World 2026: The Semiconductor Industry Enters a New Systems Era",
            url: "https://www.eetimes.com/itf-world-2026-the-semiconductor-industry-enters-a-new-systems-era/",
            source: "EE Times",
            image: null,
            oneliner: "Chiplets, heterogeneous integration, silicon photonics converge; systems-level design dominates next SoC generation.",
          },
        ],
      },
    ],
    podcasts: [],
    earnings: [],
    quotes: [],
  },
  {
    number: 11,
    date: "July 10, 2026",
    slug: "issue-11",
    title: "SK Hynix Nasdaq Debut. Micron Commits $250B. Memory Cycle Peaks.",
    sections: [
      {
        category: "Compute",
        stories: [
          {
            headline: "The Energy Barrier Reshaping AI Hardware",
            url: "https://www.eetimes.com/ai-energy-barrier-forces-system-technology-co-optimization/",
            source: "EE Times",
            image: null,
            oneliner: "Energy efficiency becomes AI hardware's binding constraint; power delivery now defines compute ceiling.",
          },
          {
            headline: "Can an AI 'superforecaster' beat the market?",
            url: "https://www.ft.com/content/1c991bec-ede2-42ba-b6f5-334fd474f94a",
            source: "Financial Times",
            image: null,
            oneliner: "AI forecasting underperforms human judgment on Fed decisions; limits near-term AI infrastructure ROI claims.",
          },
          {
            headline: "Token per watt becomes the defining metric as storage moves to AI's critical path",
            url: "https://siliconangle.com/2026/07/09/token-per-watt-metrics-optimize-ai-data-center-efficiency-raisesummit/",
            source: "SiliconAngle",
            image: "https://d15shllkswkct0.cloudfront.net/wp-content/blogs.dir/1/files/2026/07/IMG_8688.jpg",
            oneliner: "Token-per-watt efficiency replaces raw compute; storage hardware becomes AI data center bottleneck.",
          },
          {
            headline: "Fast token generation emerges as the key differentiator as heterogeneous inference takes hold",
            url: "https://siliconangle.com/2026/07/09/fast-token-generation-accelerates-enterprise-ai-inference-raisesummit/",
            source: "SiliconAngle",
            image: "https://d15shllkswkct0.cloudfront.net/wp-content/blogs.dir/1/files/2026/07/IMG_8443.jpg",
            oneliner: "Token generation speed drives inference hardware redesign; GPU-only architectures obsolete for agentic AI.",
          },
          {
            headline: "Consolidation and Competition: Who is Winning the $4.5 Billion Interface IP Race?",
            url: "https://semiwiki.com/ip/370809-consolidation-and-competition-who-is-winning-the-4-5-billion-interface-ip-race/",
            source: "SemiWiki",
            image: "https://semiwiki.com/wp-content/uploads/2026/06/2025-TSMC-Revenue-by-Platform.png",
            oneliner: "$4.5B interface IP market consolidates around HPC/AI; TSMC's data-centric shift drives topology wars.",
          },
          {
            headline: "Meta's stock rebounds as agentic AI coding and custom chips ease spending fears",
            url: "https://www.marketwatch.com/story/metas-stock-rebounds-as-agentic-ai-coding-and-custom-chips-ease-spending-fears-16d1cb24?mod=mw_rss_topstories",
            source: "MarketWatch",
            image: null,
            oneliner: "Meta's custom AI chip progress calms capex concerns; validates in-house silicon strategy.",
          },
          {
            headline: "Palo Alto CEO Arora says AI pricing needs to fall 90% as token costs skyrocket",
            url: "https://www.cnbc.com/2026/07/09/palo-alto-ceo-arora-ai-pricing.html",
            source: "CNBC",
            image: "https://image.cnbcfm.com/api/v1/image/108137406-17458547422025-03-25t214442z_1404614266_rc2jkda1kvqf_rtrmadp_0_paloalto-stocks.jpeg?v=1753825094&amp;w=1920&amp;h=1080",
            oneliner: "Token costs must drop 90% for enterprise AI adoption; signals inference infrastructure margin pressure.",
          },
          {
            headline: "Anthropic found a hidden space where Claude puzzles over concepts",
            url: "https://www.technologyreview.com/2026/07/09/1140293/anthropic-found-a-hidden-space-where-claude-puzzles-over-concepts/",
            source: "MIT Tech Review",
            image: "https://wp.technologyreview.com/wp-content/uploads/2026/07/llm-crystal-globe_1.jpg?resize=1200,600",
            oneliner: "Anthropic maps internal LLM reasoning via mechanistic interpretability; opens debugging tools for inference optimization.",
          },
          {
            headline: "AI slop writing has taken over the internet, particularly LinkedIn and X",
            url: "https://www.theregister.com/ai-and-ml/2026/07/09/ai-slop-writing-has-taken-over-the-internet-particularly-linkedin-and-x/5269525",
            source: "The Register",
            image: "https://image.theregister.com/5269572.jpg?imageId=5269572&x=0&y=0&cropw=100&croph=100&panox=0&panoy=0&panow=100&panoh=100&width=1200&height=683",
            oneliner: "25% of long-form social posts AI-generated; signals inference cost collapse driving content commoditization.",
          },
        ],
      },
      {
        category: "Memory & Networking",
        stories: [
          {
            headline: "MRDIMM's Allow DDR5 Memory To Keep Up With Next-Gen Servers, Achieving DDR6-Class Bandwidth & No Pin-Change",
            url: "https://wccftech.com/mrdimm-ddr5-memory-keep-up-with-next-gen-servers-achieving-ddr6-class-bandwidth/",
            source: "WCCFtech",
            image: "https://cdn.wccftech.com/wp-content/uploads/2026/07/DDR5-MRDIMM-F-1920x926.jpg",
            oneliner: "DDR5 MRDIMMs reach DDR6 bandwidth without socket redesign; extends server memory upgrade cycle.",
          },
        ],
      },
      {
        category: "Capital Flows",
        stories: [
          {
            headline: "SK Hynix raises $26.5 billion in U.S. offering. What to know about the stock.",
            url: "https://www.marketwatch.com/story/sk-hynix-is-about-to-hit-the-u-s-market-heres-what-to-know-about-the-deal-1c873fa4?mod=mw_rss_topstories",
            source: "MarketWatch",
            image: null,
            oneliner: "SK Hynix $26.5B US listing largest foreign IPO; signals memory chip supply consolidation.",
          },
          {
            headline: "Micron to Pour $250 Billion in Manufacturing on US Soil As It Starts Construction of New York's DRAM Megafab",
            url: "https://wccftech.com/micron-to-pour-250-billion-in-manufacturing-in-us-starts-construction-of-new-york-s-dram-megafab/",
            source: "WCCFtech",
            image: null,
            oneliner: "Micron commits $250B US capex through 2035, grounds first New York DRAM megafab.",
          },
          {
            headline: "Micron Announces Up to $3 Billion Strategic Investment",
            url: "https://www.semiconductor-digest.com/micron-announces-up-to-3-billion-strategic-investment/?utm_source=rss&utm_medium=rss&utm_campaign=micron-announces-up-to-3-billion-strategic-investment",
            source: "Semiconductor Digest",
            image: null,
            oneliner: "Micron invests $3B in GlobalWafers US expansion; secures wafer supply independence for memory production.",
          },
          {
            headline: "Where Jim Cramer stands on SK Hynix's massive offering",
            url: "https://www.cnbc.com/2026/07/09/jim-cramer-sk-hynix.html",
            source: "CNBC",
            image: "https://image.cnbcfm.com/api/v1/image/108326518-1782348833270-GettyImages-1230847768.jpg?v=1782348905&amp;w=1920&amp;h=1080",
            oneliner: "SK Hynix appears cheap but carries cycle risk; AI memory boom durability questioned by strategists.",
          },
        ],
      },
      {
        category: "Geopolitics & Policy",
        stories: [
          {
            headline: "OpenAI and Google sell AI models to blacklisted China groups",
            url: "https://www.ft.com/content/5d6aafa1-5d47-4585-aa95-6ec06a6cd20f",
            source: "Financial Times",
            image: null,
            oneliner: "OpenAI, Google supplied AI services to Alibaba, Baidu, Tencent via Singapore proxies; sanctions evasion risk.",
          },
          {
            headline: "Microsoft warns customers AI will mean busier Patch Tuesdays",
            url: "https://www.theregister.com/security/2026/07/10/microsoft-warns-customers-ai-will-mean-busier-patch-tuesdays/5269618",
            source: "The Register",
            image: "https://image.theregister.com/248668.jpg?imageId=248668&x=0&y=0&cropw=100&croph=100&panox=0&panoy=0&panow=100&panoh=100&width=1200&height=683",
            oneliner: "AI-driven attack surface expansion increases patch velocity; security supply chain becomes infrastructure bottleneck.",
          },
        ],
      },
    ],
    podcasts: [],
    earnings: [],
    quotes: [],
  },
  {
    number: 10,
    date: "July 9, 2026",
    slug: "issue-10",
    title: "Apple-Broadcom $30B. SambaNova $11B. Memory Surges 50%.",
    sections: [
      {
        category: "Compute",
        stories: [
          {
            headline: "SambaNova Raises $1B, Signs JPMorganChase as a Customer",
            url: "https://www.eetimes.com/sambanova-raises-1-billion-signs-jpmorganchase-as-a-customer/",
            source: "EE Times",
            image: null,
            oneliner: "Enterprise AI chip startups gain traction as JPMorganChase validates alternative to NVIDIA.",
          },
          {
            headline: "Nvidia touts Vera CPU's single-threaded performance as its agentic AI advantage",
            url: "https://www.tomshardware.com/pc-components/cpus/nvidia-touts-vera-cpus-single-threaded-performance-as-its-agentic-ai-advantage-frames-chip-as-a-max-single-threaded-cpu-at-scale-not-a-parallel-monster",
            source: "Tom's Hardware",
            image: "https://cdn.mos.cms.futurecdn.net/JUMzzHeBHtq9q5mBczXBWb-1280-80.jpg",
            oneliner: "NVIDIA Vera CPU claims 1.8x single-thread lead over x86 for agentic workloads; Perplexity endorses.",
          },
          {
            headline: "Perplexity Bets on NVIDIA's Vera CPU, Calling The Max Single-Threaded Chip a \"Dead-On\" Fit",
            url: "https://wccftech.com/perplexity-bets-on-nvidia-vera-cpu-calling-max-single-threaded-chip-a-dead-on-fit/",
            source: "WCCFtech",
            image: "https://cdn.wccftech.com/wp-content/uploads/2026/04/NVIDIA-Vera-CPU-1920x1080.webp",
            oneliner: "Perplexity adopts NVIDIA Vera for inference; 1.5x speedup validates CPU-agnostic AI architecture shift.",
          },
          {
            headline: "AI is becoming a bargain hunter's market, with a few luxury models on top",
            url: "https://www.theregister.com/ai-and-ml/2026/07/08/ai-is-becoming-a-bargain-hunters-market-with-a-few-luxury-models-on-top/5268050",
            source: "The Register",
            image: "https://image.theregister.com/5268091.jpg?imageId=5268091&x=0&y=0&cropw=100&croph=100&panox=0&panoy=0&panow=100&panoh=100&width=1200&height=683",
            oneliner: "Inference commoditizes; frontier models command premiums while edge/mobile accelerators fragment supply chain demand.",
          },
        ],
      },
      {
        category: "Memory & Networking",
        stories: [
          {
            headline: "Memory Shortages Drive DDR4 Prices Over 50% In Q3 2026, DDR3 Also Impacted By Higher Costs",
            url: "https://wccftech.com/memory-shortages-drive-ddr4-prices-over-50-in-q3-2026-ddr3-also-impacted-by-higher-costs/",
            source: "WCCFtech",
            image: "https://cdn.wccftech.com/wp-content/uploads/2021/10/DSC_0625-Custom-1920x1280.jpg",
            oneliner: "DRAM shortage cascades across legacy nodes; DDR4 prices spike 50%, pressuring OEM margins.",
          },
          {
            headline: "Stacking Chips Sideways Gives AI More Memory",
            url: "https://spectrum.ieee.org/stacking-chips-sideways",
            source: "IEEE Spectrum",
            image: "https://spectrum.ieee.org/media-library/a-prototype-memory-chip-consisting-of-a-silver-cube-with-orange-strips-on-two-sides-and-large-grey-blobs-on-the-other-sides.jpg?id=67103305&width=1200&height=600&coordinates=0%2C646%2C0%2C604",
            oneliner: "Chipmakers pivot to sideways HBM stacking to bypass thermal limits; cooling innovation critical for scaling.",
          },
          {
            headline: "AI's biggest challenge is not compute - it's data storage",
            url: "https://www.theregister.com/storage/2026/07/08/ais-biggest-challenge-is-not-compute-its-data-storage/5267453",
            source: "The Register",
            image: "https://image.theregister.com/4093614.jpg?imageId=4093614&x=0&y=0&cropw=100&croph=100&panox=0&panoy=0&panow=100&panoh=100&width=1200&height=683",
            oneliner: "AI bottleneck shifts to storage/data pipeline; SSD, interconnect, and memory architecture innovation accelerates.",
          },
        ],
      },
      {
        category: "Capital Flows",
        stories: [
          {
            headline: "Apple commits $30 billion to Broadcom for U.S. chipmaking push",
            url: "https://www.cnbc.com/2026/07/08/apple-commits-30-billion-to-broadcom-for-us-chipmaking-push.html",
            source: "CNBC",
            image: "https://image.cnbcfm.com/api/v1/image/108318340-17809408152026-06-08t174532z_2056210661_rc2tplaw4p32_rtrmadp_0_apple-wwdc.jpeg?v=1780940834&amp;w=1920&amp;h=1080",
            oneliner: "Apple's largest U.S. chipmaking commitment redirects supply chain away from Taiwan.",
          },
          {
            headline: "SambaNova hits $11 billion valuation as investors back Nvidia chip challengers",
            url: "https://www.cnbc.com/2026/07/08/sambanova-ai-chip-funding-valuation.html",
            source: "CNBC",
            image: "https://image.cnbcfm.com/api/v1/image/108331345-1783423707790-gettyimages-2275500664-SH1_2370.jpeg?v=1783423770&amp;w=1920&amp;h=1080",
            oneliner: "SambaNova reaches $11B valuation with JPMorganChase anchor customer, accelerating NVIDIA competition.",
          },
          {
            headline: "South Korea falls into bear market as traders fret over AI chipmakers' prospects",
            url: "https://www.ft.com/content/2cb790fc-016b-4b15-a9d8-5b6057592e1a",
            source: "Financial Times",
            image: null,
            oneliner: "Kospi enters bear market amid Samsung, SK Hynix AI revenue fears; memory oversupply threatens pricing power.",
          },
          {
            headline: "It was the world's hottest stock market. Now South Korea has entered bear territory.",
            url: "https://www.marketwatch.com/story/it-was-the-worlds-hottest-stock-market-now-south-koreas-stock-market-index-has-entered-bear-market-territory-95d70e3d?mod=mw_rss_topstories",
            source: "MarketWatch",
            image: null,
            oneliner: "Korean memory duopoly (Samsung, SK Hynix) faces margin compression; capital reallocation ripples across supply chain.",
          },
          {
            headline: "Alibaba just had its best day in 10 months. Is it time for China techs to catch up?",
            url: "https://www.marketwatch.com/story/alibaba-just-had-its-best-day-in-10-months-is-it-time-for-china-techs-to-catch-up-8ccc3f7c?mod=mw_rss_topstories",
            source: "MarketWatch",
            image: null,
            oneliner: "Alibaba rally signals China tech rebound; domestic chip spending may accelerate amid U.S. export controls.",
          },
        ],
      },
      {
        category: "Geopolitics & Policy",
        stories: [
          {
            headline: "Apple to buy $30bn of US-made chips from Broadcom",
            url: "https://www.ft.com/content/1bc10dd1-2aac-472d-b3d8-b76a83fb4abf",
            source: "Financial Times",
            image: null,
            oneliner: "Broadcom secures massive Apple contract as Trump administration courts domestic chip manufacturing.",
          },
          {
            headline: "Space Force gets first mobile high-powered electromagnetic beam weapon to cripple enemy satellites",
            url: "https://www.tomshardware.com/tech-industry/space/space-force-gets-first-mobile-high-powered-electromagnetic-beam-weapon-to-cripple-enemy-satellites-plans-to-deploy-32-meadowlands-units-to-detect-deny-disrupt-and-degrade-hostile-space-assets",
            source: "Tom's Hardware",
            image: "https://cdn.mos.cms.futurecdn.net/vnM65gNvXEVetqkUnwnkV-1920-80.jpg",
            oneliner: "U.S. Space Force deploys Meadowlands EW system; satellite resilience drives demand for hardened semiconductor packaging.",
          },
          {
            headline: "What Happens if China Hacks the US Water Supply? I Went to a Secret War Game to Find Out",
            url: "https://www.wired.com/story/what-happens-if-china-hacks-the-us-water-supply-war-game-volt-typhoon/",
            source: "Wired",
            image: "https://media.wired.com/photos/6a4d67b2cd42662145e222f2/191:100/w_1280,c_limit/WARGAME-TopArt-v4.jpg",
            oneliner: "U.S. critical infrastructure vulnerability exposed; Volt Typhoon scenario drives military/industrial semiconductor hardening investment.",
          },
          {
            headline: "Verity Harding: This Former DeepMind Exec Thinks the AI Arms Race Could End in Disaster",
            url: "https://www.wired.com/story/verity-harding-ai-arms-race-dangers-anthology/",
            source: "Wired",
            image: "https://media.wired.com/photos/6a4be55744dc79c43267387c/191:100/w_1280,c_limit/DeepMind-Alum-QandA-Verity-Harding-Business.jpg",
            oneliner: "Former DeepMind exec warns AI arms race risks; U.S. chip export controls and foundry restrictions likely intensify.",
          },
        ],
      },
    ],
    podcasts: [],
    earnings: [],
    quotes: [],
  },
  {
    number: 9,
    date: "June 19, 2026",
    slug: "issue-9",
    title: "ASML Denies China Shipment. SK Hynix Eyes HBM. Apple-Intel Alliance Forms.",
    sections: [
      {
        category: "Compute",
        stories: [
          {
            headline: "Snapdragon 8 Elite Gen 6 Pro Will Only Have Two Versions, With Block Diagrams Serving As Concrete Evidence",
            url: "https://wccftech.com/snapdragon-8-elite-gen-6-pro-block-diagrams-show-evidence-of-only-two-versions/",
            source: "WCCFtech",
            image: null,
            oneliner: "Qualcomm's 2nm Snapdragon 8 Elite Gen 6 Pro narrows to two SKUs; binning strategy clarified.",
          },
          {
            headline: "A startup claims it broke through a bottleneck that's holding back LLMs",
            url: "https://www.technologyreview.com/2026/06/19/1139313/a-startup-claims-it-broke-through-a-bottleneck-thats-holding-back-llms/",
            source: "MIT Tech Review",
            image: null,
            oneliner: "Subquadratic claims LLM compute bottleneck breakthrough; implications for accelerator demand unclear.",
          },
          {
            headline: "Fabrix.ai demonstrates production-grade agentic operations at Cisco Live",
            url: "https://siliconangle.com/2026/06/19/fabrix-ai-demonstrates-production-grade-agentic-operations-cisco-live/",
            source: "SiliconAngle",
            image: null,
            oneliner: "Fabrix.ai production agentic ops signal shift from AI curiosity to enterprise deployment; capex urgency.",
          },
        ],
      },
      {
        category: "Memory & Networking",
        stories: [
          {
            headline: "SK Hynix reportedly held U.S. talks on HBM supply and local investment plans",
            url: "https://www.digitimes.com/news/a20260618PD233/sk-hynix-hbm-investment-shipments-supply-chain.html",
            source: "Digitimes",
            image: null,
            oneliner: "SK Hynix negotiates HBM supply deals and US capex expansion with State Department.",
          },
        ],
      },
      {
        category: "Capital Flows",
        stories: [
          {
            headline: "US energy regulator to order grid operators to expedite AI data center applications",
            url: "https://www.tomshardware.com/tech-industry/data-centers/us-energy-regulator-to-order-grid-operators-to-expedite-ai-data-center-applications-says-projects-should-bring-their-own-power-or-cut-usage-during-high-demand",
            source: "Tom's Hardware",
            image: null,
            oneliner: "FERC mandates 90-day fast-track for AI datacenters with on-site power or demand response.",
          },
          {
            headline: "German electricity grid equipment maker SGB-SMIT in early IPO talks",
            url: "https://www.ft.com/content/660b1366-acbb-4f9b-910a-6f1062653bff",
            source: "Financial Times",
            image: null,
            oneliner: "SGB-SMIT IPO at €4bn+ valuation; AI/datacenter grid equipment capex boom drives exit.",
          },
          {
            headline: "The tech giant mining Wall Street for AI cash",
            url: "https://www.ft.com/content/6db5b580-58ac-4c7e-83ca-7c9fb11a347e",
            source: "Financial Times",
            image: null,
            oneliner: "Meta's Dina Powell seeks Wall Street financing for AI capex surge; capital intensity accelerates.",
          },
          {
            headline: "Why the Fed's hawkish stance signals a step-change in U.S. dollar sentiment",
            url: "https://www.marketwatch.com/story/why-the-feds-hawkish-stance-signals-a-step-change-in-u-s-dollar-sentiment-and-a-new-direction-742f1fff?mod=mw_rss_topstories",
            source: "MarketWatch",
            image: null,
            oneliner: "Fed hawkishness strengthens dollar; higher cost of capital pressures semiconductor M&A/capex cycles.",
          },
          {
            headline: "Warsh's task forces give the Fed wiggle room to put off changing rates until December",
            url: "https://www.marketwatch.com/story/warshs-task-forces-give-the-fed-wiggle-room-to-put-off-changing-rates-until-december-364fc1fc?mod=mw_rss_topstories",
            source: "MarketWatch",
            image: null,
            oneliner: "Fed delays rate decisions via task forces; elevated cost of capital extends through 2026.",
          },
        ],
      },
      {
        category: "Geopolitics & Policy",
        stories: [
          {
            headline: "ASML May Have Shipped Banned Machine To China Says US Government – Firm Denies Claim",
            url: "https://wccftech.com/asml-has-shipped-banned-machines-to-china-says-us-government-firm-denies-claim/",
            source: "WCCFtech",
            image: null,
            oneliner: "US Commerce alleges ASML EUV shipments to China; export controls enforcement tightens.",
          },
          {
            headline: "SK Telecom named as the Korean carrier at the center of Anthropic's Mythos export controls controversy",
            url: "https://www.tomshardware.com/tech-industry/artificial-intelligence/sk-telecom-named-as-the-korean-carrier-at-the-center-of-anthropics-mythos-export-controls",
            source: "Tom's Hardware",
            image: null,
            oneliner: "SK Telecom's Claude Mythos access revoked; US frontier model export controls bite allies.",
          },
          {
            headline: "All Semiconductor Roads Lead to Taiwan",
            url: "https://www.eetimes.com/all-semiconductor-roads-lead-to-taiwan/",
            source: "EE Times",
            image: null,
            oneliner: "Taiwan's outsized linchpin role in global chip supply underscores geopolitical concentration risk.",
          },
          {
            headline: "Geopolitical jitters push Europe's internet registry away from cloud-first strategy",
            url: "https://www.theregister.com/networks/2026/06/19/geopolitical-jitters-push-europes-internet-registry-away-from-cloud-first-strategy/5258704",
            source: "The Register",
            image: null,
            oneliner: "RIPE jettisons cloud-first strategy over geopolitical risk; EU infrastructure sovereignty reshapes capex.",
          },
        ],
      },
    ],
    podcasts: [],
    earnings: [],
    quotes: [],
  },
  {
    number: 8,
    date: "June 18, 2026",
    slug: "issue-8",
    title: "Intel–Apple Deal Powers Foundry. Memory Crunch Hits Margins.",
    sections: [
      {
        category: "Compute",
        stories: [
          {
            headline: "Intel surges 9% after Trump says company will partner with Apple on U.S. chip design",
            url: "https://www.cnbc.com/2026/06/18/trump-intel-apple-chip-design-deal.html",
            source: "CNBC",
            image: null,
            oneliner: "Trump confirms Intel–Apple foundry partnership; reshapes US onshore chip supply chain geopolitics.",
          },
          {
            headline: "Elon Musk aims for record maximum usable compute per wafer for AI6 chip",
            url: "https://www.digitimes.com/news/a20260618PD212/wafer-elon-musk-2026-design-tesla.html",
            source: "Digitimes",
            image: null,
            oneliner: "Tesla AI6 targets record compute density per wafer; signals aggressive yield-aware scaling post-AI5 tape-out.",
          },
          {
            headline: "SpaceX acquires Cursor to bolster xAI and court AI developers",
            url: "https://www.digitimes.com/news/a20260618PD207/spacex-xai-data-competition-software.html",
            source: "Digitimes",
            image: null,
            oneliner: "SpaceX $60B Cursor acquisition fuels xAI developer ecosystem; extends Musk competition into AI toolchain layer.",
          },
        ],
      },
      {
        category: "Memory & Networking",
        stories: [
          {
            headline: "Tim Cook says Apple price hikes are unavoidable as AI squeezes memory supply",
            url: "https://www.digitimes.com/news/a20260618VL203/apple-dram-nand-price-tim-cook.html",
            source: "Digitimes",
            image: null,
            oneliner: "Apple forced to raise prices as AI data center demand crushes DRAM/NAND supply; margin squeeze spreads.",
          },
          {
            headline: "AI data center boom drives Taiwan passive component makers to record sales",
            url: "https://www.digitimes.com/news/a20260618PD231/yageo-walsin-passive-components-data-center-revenue-taiwan.html",
            source: "Digitimes",
            image: null,
            oneliner: "Yageo, Walsin hit record sales; book-to-bill >1.3 as AI data center power demand strains passive supply.",
          },
          {
            headline: "Exclusive: Winbond NOR flash reportedly enters Nvidia supply chain",
            url: "https://www.digitimes.com/news/a20260618PD216/flash-winbond-nvidia-supply-chain-demand.html",
            source: "Digitimes",
            image: null,
            oneliner: "Winbond NOR flash enters Nvidia Vera Rubin supply chain; memory diversification tightens ahead of H2 ramp.",
          },
        ],
      },
      {
        category: "Capital Flows",
        stories: [
          {
            headline: "AI chip boom strains probe card supply, Taiwan test interface maker weighs prepayment deals",
            url: "https://www.digitimes.com/news/a20260618PD208/mpi-ai-chip-probe-card-test-interface-demand.html",
            source: "Digitimes",
            image: null,
            oneliner: "MPI probe card capacity maxed; pursues prepayment lock-in as AI wafer test demand strains supply visibility.",
          },
          {
            headline: "Nearly 80% of data center capacity is at elevated risk to climate hazards like flooding and fire, study says",
            url: "https://www.cnbc.com/2026/06/18/data-center-climate-change-study.html",
            source: "CNBC",
            image: null,
            oneliner: "80% of data centers face climate risk; forces geographic dispersion, reshapes capex and supply chain resilience.",
          },
        ],
      },
      {
        category: "Geopolitics & Policy",
        stories: [
          {
            headline: "Chinese makers of DRAM modules, SSDs have a serious advantage over American and Taiwanese suppliers, says SMI SVP",
            url: "https://www.tomshardware.com/pc-components/ssds/chinese-makers-of-dram-modules-ssds-have-a-serious-advantage-over-american-and-taiwanese-suppliers-says-smi-svp-state-guidance-secures-local-dram-and-ssd-supply-while-the-big-three-chase-ai-margins",
            source: "Tom's Hardware",
            image: null,
            oneliner: "State guidance locks Chinese DRAM/SSD makers into domestic supply; SKM, Samsung, Micron cede non-AI margin pools.",
          },
          {
            headline: "Foxconn chairman maps out Taiwan's global AI and manufacturing expansion strategy",
            url: "https://www.digitimes.com/news/a20260618PD230/taiwan-manufacturing-foxconn-chairman-expansion.html",
            source: "Digitimes",
            image: null,
            oneliner: "Foxconn pivots to AI/data center substrate role; signals Taiwan supply chain shift from consumer to enterprise.",
          },
          {
            headline: "Japan lasers in on India's Assam state for chip and infrastructure corridor",
            url: "https://www.digitimes.com/news/a20260618PD224/infrastructure-investment-market-business-region.html",
            source: "Digitimes",
            image: null,
            oneliner: "Japan PM Takaichi leads 50+ companies into Assam chip corridor; counters China influence in South Asia supply chain.",
          },
          {
            headline: "G7 AI talks reveal trust gap behind US model power",
            url: "https://www.digitimes.com/news/a20260618VL204/anthropic-openai-policy-technology-europe.html",
            source: "Digitimes",
            image: null,
            oneliner: "G7 summit exposes US dominance in frontier AI rules-setting; European, allied chip fabs face regulatory headwinds.",
          },
        ],
      },
      {
        category: "Other",
        stories: [
          {
            headline: "SiC cuts AI data center costs; 5% efficiency gain saves US$5 billion",
            url: "https://www.digitimes.com/news/a20260618PD225/renesas-sic-data-center-efficiency-electricity.html",
            source: "Digitimes",
            image: null,
            oneliner: "Renesas SiC power conversion cuts data center electricity waste $5B annually; reshapes power chip economics.",
          },
          {
            headline: "BoolSi raises $6M to compile ordinary code into custom chips",
            url: "https://siliconangle.com/2026/06/18/boolsi-raises-6m-compile-ordinary-code-custom-chips/",
            source: "SiliconAngle",
            image: null,
            oneliner: "BoolSi $6M seed funds software-to-hardware compiler; disintermediates traditional chip design talent bottleneck.",
          },
          {
            headline: "Imec, Sony unveil backside interconnect method for 3D chip stacking",
            url: "https://www.digitimes.com/news/a20260618VL207/imec-sony-3d-silicon-tsv-wafer.html",
            source: "Digitimes",
            image: null,
            oneliner: "Imec–Sony backside interconnect enables 3D stacking without via-in-pad; unlocks chiplet density gains for foundries.",
          },
          {
            headline: "Smart glasses race pulls Taiwan and China optical suppliers into waveguide battle",
            url: "https://www.digitimes.com/news/a20260618PD211/shipments-taiwan-smart-glasses-growth-gseo.html",
            source: "Digitimes",
            image: null,
            oneliner: "Taiwan optical suppliers race China competitors for smart glass waveguide share; supply chain bifurcates by region.",
          },
        ],
      },
    ],
    podcasts: [],
    earnings: [],
    quotes: [],
  },
  {
    number: 7,
    date: "June 17, 2026",
    slug: "issue-7",
    title: "Glass Substrates, Quantum Cloud, Edge AI",
    sections: [
      {
        category: "Compute",
        stories: [
          {
            headline: "TSMC Bets on Glass for CoWoS as Silicon-Mimicking Thermals Beat Organic Substrates, Yet Mass Production Stays Distant",
            url: "https://wccftech.com/tsmc-bets-on-glass-for-cowos-as-silicon-mimicking-thermals-beat-organic-substrates-yet-mass-production-stays-distant/",
            source: "WCCFtech",
            image: null,
            oneliner: "TSMC's glass substrate push signals advanced packaging supply chain is reshaping — watch substrate vendors.",
          },
          {
            headline: "QuEra's Libra Fault-Tolerant Quantum System Heading To AWS Braket Service",
            url: "https://www.nextplatform.com/compute/2026/06/16/queras-libra-fault-tolerant-quantum-system-heading-to-aws-braket-service/5256477",
            source: "NextPlatform",
            image: null,
            oneliner: "First fault-tolerant quantum system on a major cloud marks a commercialization inflection point.",
          },
          {
            headline: "SiMa Launches Agentic Development Environment for Physical AI",
            url: "https://www.eetimes.com/sima-launches-agentic-development-environment-for-physical-ai/",
            source: "EE Times",
            image: null,
            oneliner: "SiMa slashes edge AI deployment friction, strengthening its competitive moat against Hailo and Qualcomm.",
          },
          {
            headline: "GPU-native mask rule checking eliminates the curvilinear mask rule check bottleneck",
            url: "https://semiwiki.com/eda/siemens-eda/370278-gpu-native-mask-rule-checking-eliminates-the-curvilinear-mask-rule-check-bottleneck/",
            source: "SemiWiki",
            image: null,
            oneliner: "GPU-accelerated EDA for curvilinear masks cuts advanced-node OPC bottlenecks, benefiting Siemens EDA.",
          },
          {
            headline: "Snap unveils $2,195 AR glasses as CEO Evan Spiegel bets on post-smartphone future",
            url: "https://www.cnbc.com/2026/06/16/snap-unveils-2195-specs-ar-glasses-spiegel-bets-on-post-smartphone.html",
            source: "CNBC",
            image: null,
            oneliner: "Snap's mass-market AR push will drive demand for low-power display and edge-AI silicon.",
          },
          {
            headline: "Apple's First 1.4nm Chipset, The A22 Pro, Could Be Powering iPhones In Just A Couple Of Years",
            url: "https://wccftech.com/apple-a22-pro-first-1-4nm-chipset-arriving-in-a-couple-of-years/",
            source: "WCCFtech",
            image: null,
            oneliner: "Apple's 1.4nm roadmap locks in TSMC's N14 node lead and cements long-term foundry revenue visibility.",
          },
        ],
      },
    ],
    podcasts: [],
    earnings: [],
    quotes: [],
  },
  {
    number: 6,
    date: "June 16, 2026",
    slug: "issue-6",
    title: "NAND Crisis Deepens, Qualcomm Eyes Tenstorrent, Packaging Frontiers Expand",
    sections: [
      {
        category: "Compute",
        stories: [
          {
            headline: "ASML, TSMC, and imec move 2D transistors closer to manufacturing reality",
            url: "https://www.digitimes.com/news/a20260616VL216/tsmc-asml-imec-transistor-manufacturing-materials.html",
            source: "Digitimes",
            image: null,
            oneliner: "300mm wafer integration of 2D materials signals the post-FinFET roadmap is on track.",
          },
          {
            headline: "TSMC says panel packaging won't replace CoWoS anytime soon for the largest future AI processors — wafer-level tech can scale to 58 massive dies in one package",
            url: "https://www.tomshardware.com/tech-industry/semiconductors/tsmc-says-panel-packaging-wont-replace-cowos-anytime-soon-for-the-largest-future-ai-processors-wafer-level-tech-can-scale-to-58-massive-dies-in-one-package",
            source: "Tom's Hardware",
            image: null,
            oneliner: "CoWoS retains its AI packaging moat; panel-level scaling remains years from displacing it.",
          },
          {
            headline: "Non-x86 servers now nearly half the market, IDC says",
            url: "https://www.theregister.com/systems/2026/06/16/non-x86-servers-now-nearly-half-the-market-idc-says/5256248",
            source: "The Register",
            image: null,
            oneliner: "Arm and custom silicon's datacenter surge structurally erodes Intel and AMD x86 server share.",
          },
          {
            headline: "QuEra's Libra Fault-Tolerant Quantum System Heading To AWS Braket Service",
            url: "https://www.nextplatform.com/compute/2026/06/16/queras-libra-fault-tolerant-quantum-system-heading-to-aws-braket-service/5256477",
            source: "NextPlatform",
            image: null,
            oneliner: "First fault-tolerant quantum system on a major cloud platform marks a commercialization milestone.",
          },
        ],
      },
      {
        category: "Memory & Networking",
        stories: [
          {
            headline: "SMI's PCIe 6.0 SSD controller for consumer SSDs coming next year, but severe NAND shortages will get even worse in 2027 as AI data centers swallow supply",
            url: "https://www.tomshardware.com/pc-components/ssds/smis-pcie-6-0-ssd-controller-for-consumer-ssds-coming-next-year-but-severe-nand-shortages-will-get-even-worse-in-2027-as-ai-data-centers-swallow-supply-an-interview-with-silicon-motions-svp-nelson-duann",
            source: "Tom's Hardware",
            image: null,
            oneliner: "AI datacenters consuming NAND supply will price consumer SSD makers out through 2027.",
          },
          {
            headline: "AMD Snaps MEXT to Break the Memory Wall",
            url: "https://www.eetimes.com/amd-snaps-mext-to-break-the-memory-wall/",
            source: "EE Times",
            image: null,
            oneliner: "AMD's MEXT acquisition targets AI memory bandwidth bottleneck, expanding its system-level stack.",
          },
        ],
      },
      {
        category: "Capital Flows",
        stories: [
          {
            headline: "Qualcomm mulls taking over Jim Keller's Tenstorrent, report claims — deal for AI chipmaker would value the company at between $8 billion and $10 billion",
            url: "https://www.tomshardware.com/tech-industry/artificial-intelligence/qualcomm-mulls-taking-over-jim-kellers-tenstorrent-report-claims-deal-for-ai-chipmaker-would-value-the-company-at-between-usd8-billion-and-usd10-billion",
            source: "Tom's Hardware",
            image: null,
            oneliner: "Qualcomm's $10B RISC-V AI bet signals serious challenge to Nvidia's inference dominance.",
          },
          {
            headline: "Nvidia sells US$25 billion in bonds as investors seek foothold in AI boom",
            url: "https://www.digitimes.com/news/a20260616VL218/nvidia-funding-investment-ai.html",
            source: "Digitimes",
            image: null,
            oneliner: "$85B in orders for Nvidia's bond shows unprecedented investor demand to fund AI capex.",
          },
          {
            headline: "AI chip race sends semiconductor equipment sales to record US$36.55 billion",
            url: "https://www.digitimes.com/news/a20260616VL217/ai-chip-semiconductors-equipment-investment-manufacturing-packaging.html",
            source: "Digitimes",
            image: null,
            oneliner: "Record Q1 equipment spend confirms AI-driven capex supercycle is accelerating, not plateauing.",
          },
        ],
      },
      {
        category: "Geopolitics & Policy",
        stories: [
          {
            headline: "Gloway And KingBank Ditch Samsung, Micron, And SK Hynix, Building 48 GB DDR5 Kits From China-Made 24 Gb Chips",
            url: "https://wccftech.com/gloway-and-kingbank-ditch-samsung-micron-and-sk-hynix-building-48-gb-ddr5-kits-from-china-made-24-gb-chips/",
            source: "WCCFtech",
            image: null,
            oneliner: "Chinese domestic DRAM reaching commercial DDR5 density threatens Western suppliers' last pricing floor.",
          },
          {
            headline: "Chinese fab SMIC's 7nm metal pitch beats Intel 18A but lags 38% on density, teardown finds",
            url: "https://www.tomshardware.com/tech-industry/semiconductors/semianalysis-opens-its-own-chip-teardown-lab",
            source: "Tom's Hardware",
            image: null,
            oneliner: "SMIC's sanctions-beaten 7nm closing gap with Intel 18A raises fresh export control urgency.",
          },
          {
            headline: "Finland charges Russian captain and crew member of ship suspected of damaging undersea cables — prosecutors claim ship had eight more targets before it was stopped",
            url: "https://www.tomshardware.com/networking/finland-charges-russian-captain-and-crew-member-of-ship-suspected-of-damaging-undersea-cables-prosecutors-claim-ship-had-eight-more-targets-before-it-was-stopped-by-coast-guard",
            source: "Tom's Hardware",
            image: null,
            oneliner: "Systematic undersea cable sabotage campaign exposes critical vulnerability in global digital infrastructure.",
          },
        ],
      },
    ],
    podcasts: [],
    earnings: [],
    quotes: [],
  },
  {
    number: 5,
    date: "June 16, 2026",
    slug: "issue-5",
    title: "NAND Crisis Deepens, Qualcomm Eyes Tenstorrent, Packaging Wars Heat Up",
    sections: [
      {
        category: "Compute",
        stories: [
          {
            headline: "ASML, TSMC, and imec move 2D transistors closer to manufacturing reality",
            url: "https://www.digitimes.com/news/a20260616VL216/tsmc-asml-imec-transistor-manufacturing-materials.html",
            source: "Digitimes",
            image: null,
            oneliner: "300mm wafer integration of 2D materials marks a credible path beyond silicon scaling limits.",
          },
          {
            headline: "TSMC says panel packaging won't replace CoWoS anytime soon for the largest future AI processors — wafer-level tech can scale to 58 massive dies in one package",
            url: "https://www.tomshardware.com/tech-industry/semiconductors/tsmc-says-panel-packaging-wont-replace-cowos-anytime-soon-for-the-largest-future-ai-processors-wafer-level-tech-can-scale-to-58-massive-dies-in-one-package",
            source: "Tom's Hardware",
            image: null,
            oneliner: "CoWoS dominance at scale locks in TSMC's advanced packaging moat for next-gen AI chips.",
          },
          {
            headline: "Non-x86 servers now nearly half the market, IDC says",
            url: "https://www.theregister.com/systems/2026/06/16/non-x86-servers-now-nearly-half-the-market-idc-says/5256248",
            source: "The Register",
            image: null,
            oneliner: "ARM and custom AI silicon are structurally displacing x86 in the data center market.",
          },
          {
            headline: "QuEra's Libra Fault-Tolerant Quantum System Heading To AWS Braket Service",
            url: "https://www.nextplatform.com/compute/2026/06/16/queras-libra-fault-tolerant-quantum-system-heading-to-aws-braket-service/5256477",
            source: "NextPlatform",
            image: null,
            oneliner: "Fault-tolerant quantum on AWS Braket moves commercial quantum compute from lab to cloud.",
          },
        ],
      },
      {
        category: "Memory & Networking",
        stories: [
          {
            headline: "SMI's PCIe 6.0 SSD controller for consumer SSDs coming next year, but severe NAND shortages will get even worse in 2027 as AI data centers swallow supply",
            url: "https://www.tomshardware.com/pc-components/ssds/smis-pcie-6-0-ssd-controller-for-consumer-ssds-coming-next-year-but-severe-nand-shortages-will-get-even-worse-in-2027-as-ai-data-centers-swallow-supply-an-interview-with-silicon-motions-svp-nelson-duann",
            source: "Tom's Hardware",
            image: null,
            oneliner: "AI data centers hoarding NAND will structurally starve consumer storage markets through 2027.",
          },
          {
            headline: "AMD Snaps MEXT to Break the Memory Wall",
            url: "https://www.eetimes.com/amd-snaps-mext-to-break-the-memory-wall/",
            source: "EE Times",
            image: null,
            oneliner: "AMD's MEXT acquisition targets the memory bandwidth bottleneck constraining AI inference at scale.",
          },
        ],
      },
      {
        category: "Capital Flows",
        stories: [
          {
            headline: "Qualcomm mulls taking over Jim Keller's Tenstorrent, report claims — deal for AI chipmaker would value the company at between $8 billion and $10 billion",
            url: "https://www.tomshardware.com/tech-industry/artificial-intelligence/qualcomm-mulls-taking-over-jim-kellers-tenstorrent-report-claims-deal-for-ai-chipmaker-would-value-the-company-at-between-usd8-billion-and-usd10-billion",
            source: "Tom's Hardware",
            image: null,
            oneliner: "Qualcomm's $10B RISC-V bet would reshape the edge AI accelerator competitive landscape.",
          },
          {
            headline: "Nvidia sells US$25 billion in bonds as investors seek foothold in AI boom",
            url: "https://www.digitimes.com/news/a20260616VL218/nvidia-funding-investment-ai.html",
            source: "Digitimes",
            image: null,
            oneliner: "Nvidia's $25B bond draw of $85B in orders signals unprecedented investor confidence in AI capex.",
          },
          {
            headline: "AI chip race sends semiconductor equipment sales to record US$36.55 billion",
            url: "https://www.digitimes.com/news/a20260616VL217/ai-chip-semiconductors-equipment-investment-manufacturing-packaging.html",
            source: "Digitimes",
            image: null,
            oneliner: "Record Q1 equipment sales confirm AI-driven capex supercycle is still accelerating.",
          },
        ],
      },
      {
        category: "Geopolitics & Policy",
        stories: [
          {
            headline: "Chinese fab SMIC's 7nm metal pitch beats Intel 18A but lags 38% on density, teardown finds",
            url: "https://www.tomshardware.com/tech-industry/semiconductors/semianalysis-opens-its-own-chip-teardown-lab",
            source: "Tom's Hardware",
            image: null,
            oneliner: "SMIC's sanctioned 7nm trails TSMC on density, capping Huawei's AI chip competitiveness.",
          },
          {
            headline: "Gloway And KingBank Ditch Samsung, Micron, And SK Hynix, Building 48 GB DDR5 Kits From China-Made 24 Gb Chips",
            url: "https://wccftech.com/gloway-and-kingbank-ditch-samsung-micron-and-sk-hynix-building-48-gb-ddr5-kits-from-china-made-24-gb-chips/",
            source: "WCCFtech",
            image: null,
            oneliner: "China's domestic DRAM ecosystem is maturing fast, threatening Western memory makers' share.",
          },
          {
            headline: "Finland charges Russian captain and crew member of ship suspected of damaging undersea cables",
            url: "https://www.tomshardware.com/networking/finland-charges-russian-captain-and-crew-member-of-ship-suspected-of-damaging-undersea-cables-prosecutors-claim-ship-had-eight-more-targets-before-it-was-stopped-by-coast-guard",
            source: "Tom's Hardware",
            image: null,
            oneliner: "Undersea cable sabotage prosecutions highlight critical infrastructure risk for global connectivity investors.",
          },
        ],
      },
    ],
    podcasts: [],
    earnings: [],
    quotes: [],
  },
  {
    number: 4,
    date: "June 3, 2026",
    slug: "issue-4",
    title: "Nvidia's AI Stack Expansion, TSMC's Scaling Defense, and Photonics' Rise",
    sections: [
      {
        category: "Compute",
        stories: [
          {
            headline: "TSMC Expands Use of NVIDIA AI Technologies Across Chip Production Operations",
            url: "https://semiwiki.com/semiconductor-manufacturers/tsmc/369873-tsmc-expands-use-of-nvidia-ai-technologies-across-chip-production-operations/",
            source: "SemiWiki",
            image: "https://semiwiki.com/wp-content/uploads/2026/06/TSMC-Expands-Use-of-NVIDIA-AI-Technologies-Across-Chip-Production-Operations-1200x600.jpg",
            oneliner: "TSMC is embedding NVIDIA's AI and accelerated computing stack deeper into its chip design and fab operations.",
          },
          {
            headline: "Physical AI Pushes Chipmakers Up the Value Chain",
            url: "https://www.eetimes.com/physical-ai-pushes-chipmakers-up-the-value-chain/",
            source: "EE Times",
            image: "https://www.eetimes.com/wp-content/uploads/Robot_a5661d.jpg?fit=925%2C925",
            oneliner: "European chipmakers are repositioning around physical AI in robotics and autos, aiming to move up the stack from components to systems.",
          },
          {
            headline: "TSMC Defends Transistor Scaling Amid Huawei’s ‘Her’s Law’ Proposal",
            url: "https://www.eetimes.com/tsmc-defends-transistor-scaling-amid-huaweis-hers-law-proposal/",
            source: "EE Times",
            image: "https://www.eetimes.com/wp-content/uploads/Kevin-Zhang-sq.jpg?fit=887%2C887",
            oneliner: "TSMC defends node scaling as the core roadmap, rejecting Huawei's framing that 3D packaging should supplant Moore's Law.",
          },
          {
            headline: "Nvidia Extends Its Grip On The AI Datacenter Outwards",
            url: "https://www.nextplatform.com/ai/2026/06/02/nvidia-extends-its-grip-on-the-ai-datacenter-outwards/5250344",
            source: "The Next Platform",
            image: "https://image.nextplatform.com/5250346.jpg?imageId=5250346&x=0&y=0&cropw=100&croph=100&panox=0&panoy=0&panow=100&panoh=100&width=1200&height=683",
            oneliner: "Nvidia is pushing further into networking and systems-level infrastructure, expanding its AI datacenter share beyond GPUs.",
          },
          {
            headline: "GPUs And RAM Are In Short Supply, But The Real Bottleneck For AI Is Electricians",
            url: "https://www.nextplatform.com/compute/2026/05/28/gpus-and-ram-are-in-short-supply-but-the-real-bottleneck-for-ai-is-electricians/5247566",
            source: "The Next Platform",
            image: "https://image.nextplatform.com/5247569.jpg?imageId=5247569&x=0&y=0&cropw=100&croph=100&panox=0&panoy=0&panow=100&panoh=100&width=1200&height=683",
            oneliner: "Electrician shortages are emerging as a key bottleneck for AI data center buildouts, alongside GPU and memory supply constraints.",
          },
        ],
      },
      {
        category: "Memory & Networking",
        stories: [
          {
            headline: "Taiwan Minister Emphasizes Collaboration and Future Focus on Photonics, WBG, and Quantum",
            url: "https://www.eetimes.com/taiwan-minister-emphasizes-collaboration-and-future-focus-on-photonics-wbg-and-quantum/",
            source: "EE Times",
            image: "https://www.eetimes.com/wp-content/uploads/Minister-Wu-NSTC-Taiwan_sq.jpg?fit=1920%2C1920",
            oneliner: "Taiwan is steering national R&D priorities toward photonics, wide-bandgap, and quantum to extend its chip dominance into AI infrastructure.",
          },
          {
            headline: "Photonics: A Foundational Scaling Layer for AI-Era Computing",
            url: "https://www.eetimes.com/photonics-a-foundational-scaling-layer-for-ai-era-computing/",
            source: "EE Times",
            image: "https://www.eetimes.com/wp-content/uploads/AdobeStock_1971136027.jpeg?fit=2688%2C1536",
            oneliner: "Photonics is being positioned as a core enabler for AI scaling, benefiting silicon photonics players as electrical interconnects hit limits.",
            xQuotes: [
              {
                handle: "@MoMoMacro",
                name: "MoMoMacro",
                text: "CPO (co-packaged optics, where the laser moves inside the chip housing instead of sitting at the rack edge) is still in early hyperscaler qualification. This run is pluggable transceivers. The CPO volume cycle is still ahead.",
                url: "https://x.com/MoMoMacro/status/2062194824535556205",
              },
            ],
          },
          {
            headline: "HPE shares soar 37% on booming demand for AI infrastructure",
            url: "https://www.ft.com/content/3ddf001d-d7f6-40f1-8fe4-1cc577868da0",
            source: "Financial Times Tech",
            image: "https://images.ft.com/v3/image/raw/https%3A%2F%2Fd1e00ek4ebabms.cloudfront.net%2Fproduction%2F26a52004-19e2-4863-b519-6f80e9496c51.jpg?source=next-barrier-page",
            oneliner: "HPE stock surged 37% on accelerating AI server and networking demand, signaling broad-based data center capex strength.",
          },
          {
            headline: "HSBC massively revamps Broadcom's stock price target",
            url: "https://www.thestreet.com/investing/stocks/hsbc-massively-revamps-broadcoms-stock-price-target-ahead-of-earnings",
            source: "TheStreet Tech",
            image: null,
            oneliner: "HSBC sharply lifts Broadcom price target on Buy rating, pointing to stronger-than-expected AI ASIC and networking demand.",
            xQuotes: [
              {
                handle: "@schaeffers",
                name: "Schaeffer's Investment Research",
                text: "The reaction in $AVGO is a reminder of how HIGHHHH the bar has become for AI winners. Broadcom beat earnings, beat revenue, and guided Q3 revenue nearly $1B above consensus. Yet shares are sharply lower after hours.",
                url: "https://x.com/schaeffers/status/2062272358849876344",
              },
            ],
          },
          {
            headline: "Memory chips are all the rage in markets, with Micron and SK Hynix becoming trillion-dollar companies",
            url: "https://finance.yahoo.com/markets/stocks/articles/memory-chips-rage-markets-micron-160000501.html",
            source: "Yahoo Finance Tech",
            image: "https://s.yimg.com/ny/api/res/1.2/4Dscf9X7EdysP1aOpoOcKQ--/YXBwaWQ9aGlnaGxhbmRlcjt3PTEyMDA7aD02NzU-/https://media.zenfs.com/en/moneywise_327/04cd2ec715a9a5c4ffea766203a03809",
            oneliner: "AI-driven HBM and DRAM demand has pushed Micron and SK Hynix into trillion-dollar territory, signaling a memory supercycle repricing.",
          },
        ],
      },
      {
        category: "Capital Flows",
        stories: [
          {
            headline: "Marvell's stock is on a run not seen in a quarter-century as the tech company grows in stature",
            url: "https://www.eetimes.com/photonics-a-foundational-scaling-layer-for-ai-era-computing/",
            source: "EE Times",
            image: "https://www.eetimes.com/wp-content/uploads/AdobeStock_1971136027.jpeg?fit=2688%2C1536",
            oneliner: "Photonics is being positioned as a core enabler for AI scaling, benefiting silicon photonics players as electrical interconnects hit limits.",
            xQuotes: [
              {
                handle: "@MoMoMacro",
                name: "MoMoMacro",
                text: "CPO (co-packaged optics, where the laser moves inside the chip housing instead of sitting at the rack edge) is still in early hyperscaler qualification. This run is pluggable transceivers. The CPO volume cycle is still ahead.",
                url: "https://x.com/MoMoMacro/status/2062194824535556205",
              },
            ],
          },
          {
            headline: "HPE shares soar 37% on booming demand for AI infrastructure",
            url: "https://www.ft.com/content/3ddf001d-d7f6-40f1-8fe4-1cc577868da0",
            source: "Financial Times Tech",
            image: "https://images.ft.com/v3/image/raw/https%3A%2F%2Fd1e00ek4ebabms.cloudfront.net%2Fproduction%2F26a52004-19e2-4863-b519-6f80e9496c51.jpg?source=next-barrier-page",
            oneliner: "HPE stock surged 37% on accelerating AI server and networking demand, signaling broad-based data center capex strength.",
          },
          {
            headline: "HSBC massively revamps Broadcom's stock price target",
            url: "https://www.thestreet.com/investing/stocks/hsbc-massively-revamps-broadcoms-stock-price-target-ahead-of-earnings",
            source: "TheStreet Tech",
            image: null,
            oneliner: "HSBC sharply lifts Broadcom price target on Buy rating, pointing to stronger-than-expected AI ASIC and networking demand.",
          },
          {
            headline: "Memory chips are all the rage in markets, with Micron and SK Hynix becoming trillion-dollar companies",
            url: "https://finance.yahoo.com/markets/stocks/articles/memory-chips-rage-markets-micron-160000501.html",
            source: "Yahoo Finance Tech",
            image: "https://s.yimg.com/ny/api/res/1.2/4Dscf9X7EdysP1aOpoOcKQ--/YXBwaWQ9aGlnaGxhbmRlcjt3PTEyMDA7aD02NzU-/https://media.zenfs.com/en/moneywise_327/04cd2ec715a9a5c4ffea766203a03809",
            oneliner: "AI-driven HBM and DRAM demand has pushed Micron and SK Hynix into trillion-dollar territory, signaling a memory supercycle repricing.",
          },
        ],
      },
      {
        category: "Capital Flows",
        stories: [
          {
            headline: "Marvell’s stock is on a run not seen in a quarter-century as the tech company grows in stature",
            url: "https://www.marketwatch.com/story/marvells-stock-is-on-a-run-not-seen-in-a-quarter-century-as-the-tech-company-grows-in-stature-7884b9c3?mod=mw_rss_topstories",
            source: "MarketWatch Tech",
            image: null,
            oneliner: "Marvell’s market cap hit $269B, surpassing PepsiCo and T-Mobile, as AI-driven gains fuel its biggest stock run in 25 years.",
            xQuotes: [
              {
                handle: "@jukan05",
                name: "Jukan @COMPUTEX",
                text: "Marvell CEO says copper wall is moving inside the rack, and copackaged optics is the only way through. He emphasized at Computex 2026 that the next bottleneck in AI infrastructure is not compute or memory but connectivity.",
                url: "https://x.com/jukan05/status/2061728423656210652",
              },
            ],
          },
          {
            headline: "Susquehanna resets Broadcom stock target ahead of earnings",
            url: "https://www.thestreet.com/investing/stocks/susquehanna-raises-broadcom-stock-target-ahead-of-earnings",
            source: "TheStreet Tech",
            image: null,
            oneliner: "Susquehanna lifts Broadcom price target but trims 2025 AI revenue estimate heading into June 3 earnings.",
          },
        ],
      },
      {
        category: "Other",
        stories: [
          {
            headline: "Dell Makes The Profits Up In Volume For Booming AI Servers",
            url: "https://www.nextplatform.com/compute/2026/06/01/dell-makes-the-profits-up-in-volume-for-booming-ai-servers/5249707",
            source: "The Next Platform",
            image: "https://image.nextplatform.com/5249710.jpg?imageId=5249710&x=0&y=0&cropw=100&croph=100&panox=0&panoy=0&panow=100&panoh=100&width=1200&height=683",
            oneliner: "Dell is riding AI server volume to grow profits despite tight per-unit margins on hyperscaler deals.",
          },
          {
            headline: "Hyperscalers and the equity tap: more to come",
            url: "https://www.ft.com/content/c9d562d6-1448-4a40-8198-0cb1f0dc2032",
            source: "Financial Times Tech",
            image: null,
            oneliner: "FT signals more hyperscaler equity raises ahead as AI capex outpaces cash flow, a potential supply overhang for investors.",
            xQuotes: [
              {
                handle: "@ScroogeCap",
                name: "Scrooge McDuck",
                text: "Oppenheimer brings out an interesting point here. If $GOOGL that prints massive FCF is tapping equity markets for $80B it's because credit is drying up.",
                url: "https://x.com/search?q=google%20equity%20raise%20private%20credit&src=typed_query&f=top",
              },
            ],
          },
        ],
      },
    ],
    podcasts: [
    {
      show: "Chip Stock Investor",
      title: "Wafer Fab Equipment, M&A Moves & The Lab 7 You've Never Heard Of",
      url: "https://podcasters.spotify.com/pod/show/chipstockinvestor/episodes/Wafer-Fab-Equipment--MA-Moves--The-Lab-7-Youve-Never-Heard-Of-e3k23qo",
      image: "https://d3t3ozftmdmh3i.cloudfront.net/staging/podcast_uploaded_nologo/37949422/37949422-1745251328337-b57bc485b0f23.jpg",
      oneliner: "Chip Stock Investor reviews valuations and 2026-2028 revenue outlooks for the Fab 5 (ASML, Applied Materials, Lam, Tokyo Electron, KLA), recent M&A including Axcelis-Veeco, Onto-Rigaku, and Applied-ASMPT, plus a \"Lab 7\" life-science equip",
    },
    {
      show: "Invest Like The Best",
      title: "Gavin Baker - Watts and Wafers - [Invest Like the Best, EP.473]",
      url: "https://colossus.com/episode/watts-and-wafers/",
      image: "https://megaphone.imgix.net/podcasts/3bc7d580-53ec-11f1-99c0-3bd245449e4f/image/31563a7dd10ea92493c934f0c1e723fe.jpg?ixlib=rails-4.3.1&max-w=3000&max-h=3000&fit=crop&auto=format,compress",
      oneliner: "Gavin Baker of Atreides Management discusses AI's power and wafer constraints, TSMC capacity, Elon's Terrafab, GPU disaggregation, and frontier model economics.",
    },
    ],
    earnings: [],
    quotes: [
      {
        handle: "@jukan05",
        name: "Jukan @COMPUTEX",
        text: "Marvell will design a networking chip for Google. This chip will be manufactured on Intel's 18A (or 18AP), with mass production scheduled to begin by the end of 2027, and it will be paired with the MediaTek-designed Humufish for Google.",
        url: "https://x.com/jukan05/status/2062123266668679514",
      },
    ],
  },
  {
    number: 3,
    date: "June 3, 2026",
    slug: "issue-3",
    title: "TSMC-Nvidia AI Alliance, Memory's Trillion-Dollar Surge, and Electrician Bottlenecks",
    sections: [
      {
        category: "Compute",
        stories: [
          {
            headline: "TSMC Expands Use of NVIDIA AI Technologies Across Chip Production Operations",
            url: "https://semiwiki.com/semiconductor-manufacturers/tsmc/369873-tsmc-expands-use-of-nvidia-ai-technologies-across-chip-production-operations/",
            source: "SemiWiki",
            image: "https://semiwiki.com/wp-content/uploads/2026/06/TSMC-Expands-Use-of-NVIDIA-AI-Technologies-Across-Chip-Production-Operations-1200x600.jpg",
            oneliner: "TSMC is embedding NVIDIA's AI and accelerated computing stack deeper into its chip design and fab operations.",
          },
          {
            headline: "TSMC Defends Transistor Scaling Amid Huawei’s ‘Her’s Law’ Proposal",
            url: "https://www.eetimes.com/tsmc-defends-transistor-scaling-amid-huaweis-hers-law-proposal/",
            source: "EE Times",
            image: "https://www.eetimes.com/wp-content/uploads/Kevin-Zhang-sq.jpg?fit=887%2C887",
            oneliner: "TSMC defends node scaling as the core roadmap, rejecting Huawei's framing that 3D packaging should supplant Moore's Law.",
          },
          {
            headline: "Nvidia Extends Its Grip On The AI Datacenter Outwards",
            url: "https://www.nextplatform.com/ai/2026/06/02/nvidia-extends-its-grip-on-the-ai-datacenter-outwards/5250344",
            source: "The Next Platform",
            image: "https://image.nextplatform.com/5250346.jpg?imageId=5250346&x=0&y=0&cropw=100&croph=100&panox=0&panoy=0&panow=100&panoh=100&width=1200&height=683",
            oneliner: "Nvidia is pushing further into networking and systems-level infrastructure, expanding its AI datacenter share beyond GPUs.",
          },
          {
            headline: "GPUs And RAM Are In Short Supply, But The Real Bottleneck For AI Is Electricians",
            url: "https://www.nextplatform.com/compute/2026/05/28/gpus-and-ram-are-in-short-supply-but-the-real-bottleneck-for-ai-is-electricians/5247566",
            source: "The Next Platform",
            image: "https://image.nextplatform.com/5247569.jpg?imageId=5247569&x=0&y=0&cropw=100&croph=100&panox=0&panoy=0&panow=100&panoh=100&width=1200&height=683",
            oneliner: "Electrician shortages are emerging as a key bottleneck for AI data center buildouts, alongside GPU and memory supply constraints.",
          },
          {
            headline: "What Can Nvidia Do to Get Investors Excited Again?",
            url: "https://www.bloomberg.com/news/articles/2026-06-03/nvidia-share-price-what-can-chipmaker-do-to-get-investors-excited-again",
            source: "Bloomberg Technology",
            image: null,
            oneliner: "Nvidia faces investor questions on what catalysts can sustain momentum as AI trade enthusiasm cools.",
          },
        ],
      },
      {
        category: "Memory & Networking",
        stories: [
          {
            headline: "HPE shares soar 37% on booming demand for AI infrastructure",
            url: "https://www.ft.com/content/3ddf001d-d7f6-40f1-8fe4-1cc577868da0",
            source: "Financial Times Tech",
            image: "https://images.ft.com/v3/image/raw/https%3A%2F%2Fd1e00ek4ebabms.cloudfront.net%2Fproduction%2F26a52004-19e2-4863-b519-6f80e9496c51.jpg?source=next-barrier-page",
            oneliner: "HPE stock surged 37% on accelerating AI server and networking demand, signaling broad-based data center capex strength.",
          },
          {
            headline: "HSBC massively revamps Broadcom's stock price target",
            url: "https://www.thestreet.com/investing/stocks/hsbc-massively-revamps-broadcoms-stock-price-target-ahead-of-earnings",
            source: "TheStreet Tech",
            image: null,
            oneliner: "HSBC sharply lifts Broadcom price target on Buy rating, pointing to stronger-than-expected AI ASIC and networking demand.",
          },
          {
            headline: "Memory chips are all the rage in markets, with Micron and SK Hynix becoming trillion-dollar companies",
            url: "https://finance.yahoo.com/markets/stocks/articles/memory-chips-rage-markets-micron-160000501.html",
            source: "Yahoo Finance Tech",
            image: "https://s.yimg.com/ny/api/res/1.2/4Dscf9X7EdysP1aOpoOcKQ--/YXBwaWQ9aGlnaGxhbmRlcjt3PTEyMDA7aD02NzU-/https://media.zenfs.com/en/moneywise_327/04cd2ec715a9a5c4ffea766203a03809",
            oneliner: "AI-driven HBM and DRAM demand has pushed Micron and SK Hynix into trillion-dollar territory, signaling a memory supercycle repricing.",
          },
        ],
      },
      {
        category: "Capital Flows",
        stories: [
          {
            headline: "Marvell’s stock is on a run not seen in a quarter-century as the tech company grows in stature",
            url: "https://www.marketwatch.com/story/marvells-stock-is-on-a-run-not-seen-in-a-quarter-century-as-the-tech-company-grows-in-stature-7884b9c3?mod=mw_rss_topstories",
            source: "MarketWatch Tech",
            image: null,
            oneliner: "Marvell's market cap hit $269B, surpassing PepsiCo and T-Mobile, as AI-driven gains fuel its biggest stock run in 25 years.",
          },
          {
            headline: "Susquehanna resets Broadcom stock target ahead of earnings",
            url: "https://www.thestreet.com/investing/stocks/susquehanna-raises-broadcom-stock-target-ahead-of-earnings",
            source: "TheStreet Tech",
            image: null,
            oneliner: "Susquehanna lifts Broadcom price target but trims 2025 AI revenue estimate heading into June 3 earnings.",
          },
          {
            headline: "Broadcom stock hovers at all-time highs ahead of earnings",
            url: "https://finance.yahoo.com/markets/article/broadcom-stock-hovers-at-all-time-highs-ahead-of-earnings-165602217.html",
            source: "Yahoo Finance Tech",
            image: "https://s.yimg.com/ny/api/res/1.2/m3Tq2R0N4Kcj1ezXmkiqqA--/YXBwaWQ9aGlnaGxhbmRlcjt3PTEyMDA7aD03NzI-/https://d29szjachogqwa.cloudfront.net/images/user-uploaded/gettyimages-1980670067_3607.jpg",
            oneliner: "Broadcom enters earnings at all-time highs, with AI ASIC and networking momentum setting a high bar for results.",
          },
        ],
      },
      {
        category: "Other",
        stories: [
          {
            headline: "Dell Makes The Profits Up In Volume For Booming AI Servers",
            url: "https://www.nextplatform.com/compute/2026/06/01/dell-makes-the-profits-up-in-volume-for-booming-ai-servers/5249707",
            source: "The Next Platform",
            image: "https://image.nextplatform.com/5249710.jpg?imageId=5249710&x=0&y=0&cropw=100&croph=100&panox=0&panoy=0&panow=100&panoh=100&width=1200&height=683",
            oneliner: "Dell is riding AI server volume to grow profits despite tight per-unit margins on hyperscaler deals.",
          },
        ],
      },
    ],
    podcasts: [
    ],
    earnings: [],
    quotes: [],
  },
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
        text: "Micron just officially crossed $1 trillion in market cap for the first time in its history and is still extremely undervalued at these levels. Twelve months ago, this stock was worth $70 billion and that is a 14x move in a single year, one of the fastest wealth creation events in the history of American public markets.",
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
