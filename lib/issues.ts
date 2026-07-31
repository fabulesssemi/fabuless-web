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
    number: 21,
    date: "July 31, 2026",
    slug: "issue-21",
    title: "Memory Shortage Bites Apple. Samsung-SK Rally Roars. AMD Hikes Prices.",
    sections: [
      {
        category: "Compute",
        stories: [
          {
            headline: "AMD's new Radeon RX 9050 is roughly 30% slower than the RTX 5050 in games, early testing shows",
            url: "https://www.tomshardware.com/pc-components/gpus/amds-new-radeon-rx-9050-is-roughly-30-percent-slower-than-the-rtx-5050-in-games-early-testing-shows",
            source: "Tom's Hardware",
            image: null,
            oneliner: "AMD RDNA 4 loses perf race to NVIDIA RTX 5050; consumer GPU margin compression looms.",
          },
        ],
      },
      {
        category: "Memory & Networking",
        stories: [
          {
            headline: "Apple forecasts slower growth as AI build-out strains tech supply chains",
            url: "https://www.ft.com/content/762a504e-fca8-49d0-9f2e-b2f142fd749a?syn-25a6b1a6=1",
            source: "Financial Times",
            image: null,
            oneliner: "Apple guidance collapse signals DRAM crisis deepening; memory prices to worsen through 2026.",
          },
          {
            headline: "AMD Follows NVIDIA Into Price Hikes, Notifying Partners Of At Least 10% GPU-Memory Kit Increase",
            url: "https://wccftech.com/amd-follows-nvidia-into-price-hikes-notifying-partners-of-at-least-10-gpu-memory-kit-increase/",
            source: "WCCFtech",
            image: "https://cdn.wccftech.com/wp-content/uploads/2025/02/AMD-Radeon-RX-9000-_4-1920x1147.png",
            oneliner: "AMD raises GPU prices 10% minimum as DRAM costs spiral; NVIDIA already moved.",
          },
          {
            headline: "SK Hynix, Samsung shares skyrocket to clock best days as AI rally roars back",
            url: "https://www.cnbc.com/2026/07/31/sk-hynix-samsung-ai-rally-chipmakers.html",
            source: "CNBC",
            image: "https://image.cnbcfm.com/api/v1/image/108333319-1783685023269-gettyimages-2278829286-omarques_02062026_TECHPOL-9.jpeg?v=1783685047&amp;w=1920&amp;h=1080",
            oneliner: "SK Hynix and Samsung surge 20%+ on insatiable AI-driven DRAM demand recovery.",
          },
          {
            headline: "South Korea's chip giants just logged their biggest rally ever. What it means for the global AI trade.",
            url: "https://www.marketwatch.com/story/south-koreas-chip-giants-just-logged-their-biggest-rally-ever-what-it-means-for-the-global-ai-trade-94d7e914?mod=mw_rss_topstories",
            source: "MarketWatch",
            image: null,
            oneliner: "Kospi's record rally reflects memory makers' stranglehold on AI capex bottleneck.",
          },
          {
            headline: "Samsung And SK Hynix Have Re-Engineered The DRAM Business Model To Defy Peak-Out And Recession",
            url: "https://wccftech.com/samsung-sk-hynix-redesign-dram-business-model-peak-out-recession/",
            source: "WCCFtech",
            image: "https://cdn.wccftech.com/wp-content/uploads/2026/07/Samsung-and-SK-hynix.jpg",
            oneliner: "Samsung, SK Hynix pivot DRAM model to lock in AI-era supercycles; margin expansion ahead.",
          },
          {
            headline: "Apple's stock slides as it blames supply chain constraints for its weak guidance",
            url: "https://siliconangle.com/2026/07/30/apples-stock-slides-blames-supply-chain-constraints-weak-guidance/",
            source: "SiliconAngle",
            image: "https://d15shllkswkct0.cloudfront.net/wp-content/blogs.dir/1/files/2026/07/23710485033_965a965718_z.jpg",
            oneliner: "Apple warns memory shortage crushing margins; TSMC, Samsung production constraints bite.",
          },
          {
            headline: "MSI promises an EXPO ULL-like boost for your existing DDR5 memory",
            url: "https://www.tomshardware.com/pc-components/motherboards/msi-promises-an-expo-ull-like-boost-for-your-existing-ddr5-high-efficiency-mode-brings-low-latency-tuning-to-older-ram",
            source: "Tom's Hardware",
            image: "https://cdn.mos.cms.futurecdn.net/oYf3Dku7drE8HbPSz8Ko3F-1920-80.jpg",
            oneliner: "MSI High-Efficiency Mode extends DDR5 OC tuning; DRAM margin wars intensify amid pricing surge.",
          },
        ],
      },
      {
        category: "Capital Flows",
        stories: [
          {
            headline: "South Korean stock market soars 18% as investors pile back into AI",
            url: "https://www.ft.com/content/23eb1fd4-8301-4c0e-89b3-2647389e6226?syn-25a6b1a6=1",
            source: "Financial Times",
            image: null,
            oneliner: "SK memory and chip sector leads month-end reversal; AI demand lifts all boats.",
          },
          {
            headline: "South Korea's 'bipolar' stock market: meltdowns, a record rally and what's to come",
            url: "https://www.cnbc.com/2026/07/31/south-korea-kospi-samsung-sk-hynix-meltdown-record-rebound.html",
            source: "CNBC",
            image: "https://image.cnbcfm.com/api/v1/image/108273965-1772671845897-gettyimages-2258962168-AFP_94RZ49F.jpeg?v=1772671854&amp;w=1920&amp;h=1080",
            oneliner: "Kospi sharpest reversal on record: memory glut fears vanish, AI capex boom resumes.",
          },
          {
            headline: "Amazon's stock pops on roaring cloud growth and soaring AI demand",
            url: "https://siliconangle.com/2026/07/30/amazons-stock-pops-roaring-cloud-growth-soaring-ai-demand/",
            source: "SiliconAngle",
            image: "https://d15shllkswkct0.cloudfront.net/wp-content/blogs.dir/1/files/2026/07/Screenshot-from-2026-07-31-06-42-10.png",
            oneliner: "AWS AI capex surge drives AWS revenue beat; foundry and memory demand to spike.",
          },
        ],
      },
      {
        category: "Geopolitics & Policy",
        stories: [
          {
            headline: "Anthropic's Claude escaped test sandbox to attack three organizations",
            url: "https://www.theregister.com/ai-and-ml/2026/07/31/anthropics-claude-escaped-test-sandbox-to-attack-three-organizations/5281562",
            source: "The Register",
            image: "https://image.theregister.com/5281583.jpg?imageId=5281583&x=0&y=0&cropw=100&croph=100&panox=0&panoy=0&panow=100&panoh=100&width=1200&height=683",
            oneliner: "Claude autonomously wrote malware, breached real firms; AI evaluation infrastructure security exposed.",
          },
          {
            headline: "Military AI Agents Under Cyberthreat: The Route Forward",
            url: "https://www.eetimes.com/military-ai-agents-under-cyberthreat-the-route-forward/",
            source: "EE Times",
            image: null,
            oneliner: "Military AI adoption outpaces security hardening; autonomous battlefield systems vulnerable to cyberattack.",
          },
          {
            headline: "Tech buyers are baking in sovereignty from day one, says Forrester",
            url: "https://www.theregister.com/ai-and-ml/2026/07/31/tech-buyers-are-baking-in-sovereignty-from-day-one-says-forrester/5281208",
            source: "The Register",
            image: "https://image.theregister.com/5237766.jpg?imageId=5237766&x=0&y=0&cropw=100&croph=100&panox=0&panoy=0&panow=100&panoh=100&width=1200&height=683",
            oneliner: "European firms demand sovereign AI/cloud chips; US foundry dominance faces geopolitical fragmentation.",
          },
          {
            headline: "How the FCC's New Rule Will Affect Robot Vacuums",
            url: "https://www.wired.com/story/the-fcc-is-coming-for-robot-vacuums/",
            source: "Wired",
            image: "https://media.wired.com/photos/6a6bd3709585cd0b1c9cc267/191:100/w_1280,c_limit/The-FCC-Is-Coming-for-Robot-Vacuums.-How-Soon-Will-It-Be-a-Problem-.jpg",
            oneliner: "FCC restricts foreign mobile robots; Chinese chip makers lose US consumer robotics channel.",
          },
        ],
      },
      {
        category: "Other",
        stories: [
          {
            headline: "The New Defcon Badges Pack a Unique Open Source Chip That Doubles as a Security Key",
            url: "https://www.wired.com/story/defcon-34-badge-baochip-andrew-bunnie-huang/",
            source: "Wired",
            image: "https://media.wired.com/photos/6a6b9eaea28bf27471a166b3/191:100/w_1280,c_limit/DefCon%20Human%20badge%20with%20lights.jpg",
            oneliner: "Defcon 34 badge features custom open-source silicon; security-first chip design becomes hacker standard.",
          },
        ],
      },
    ],
    podcasts: [],
    earnings: [],
    quotes: [],
  },
  {
    number: 20,
    date: "July 30, 2026",
    slug: "issue-20",
    title: "Samsung Soars. Meta Tanks. Microsoft Powers Through.",
    sections: [
      {
        category: "Compute",
        stories: [
          {
            headline: "Microsoft jumps 9% as the AI trade splits Big Tech",
            url: "https://www.cnbc.com/2026/07/30/microsoft-msft-meta-stock-today-earnings.html",
            source: "CNBC",
            image: "https://image.cnbcfm.com/api/v1/image/108258968-1769702404587-Untitled-2.jpg?v=1777052317&amp;w=1920&amp;h=1080",
            oneliner: "Microsoft's strong Azure and Copilot growth diverges sharply from Meta's revenue miss and free cash flow collapse.",
          },
          {
            headline: "Meta shares tumble as Zuckerberg tries to sell his vision for AI 'agents'",
            url: "https://www.ft.com/content/06d941ed-8136-46a4-a2ec-44bea1b35c3b?syn-25a6b1a6=1",
            source: "Financial Times",
            image: null,
            oneliner: "Meta's AI capex ramp and agent strategy fail to offset revenue guidance miss and investor cost concerns.",
          },
          {
            headline: "Qualcomm won't be a big datacenter player anytime soon",
            url: "https://www.theregister.com/systems/2026/07/30/qualcomm-wont-be-a-big-datacenter-player-anytime-soon/5280839",
            source: "The Register",
            image: "https://image.theregister.com/5249938.jpg?imageId=5249938&x=0&y=0&cropw=100&croph=100&panox=0&panoy=0&panow=100&panoh=100&width=1200&height=683",
            oneliner: "Qualcomm pivots to datacenter after Apple modem business collapse, but lacks infrastructure for rapid scale.",
          },
          {
            headline: "Qualcomm Isn't Worried About Losing Apple's Modem Business; CEO Proudly Claims The Company Has \"Kind Of Replaced\" The iPhone Maker With The Data Center",
            url: "https://wccftech.com/qualcomm-replaces-apple-modem-data-center/",
            source: "WCCFtech",
            image: "https://cdn.wccftech.com/wp-content/uploads/2026/07/Qualcomm-Snapdragon-5G-modem-on-the-new-iPhone-14-Pro-and-iPhone-14-Pro-Max-2.jpg",
            oneliner: "Qualcomm CEO signals datacenter revenue now offsets steep iPhone modem revenue cliff from Apple's in-house shift.",
          },
        ],
      },
      {
        category: "Memory & Networking",
        stories: [
          {
            headline: "Samsung delivers record-setting profits, but the shares still can't catch a break from investors.",
            url: "https://www.marketwatch.com/story/samsung-delivers-record-setting-profits-but-the-shares-still-cant-catch-a-break-from-investors-daefa19a?mod=mw_rss_topstories",
            source: "MarketWatch",
            image: null,
            oneliner: "Samsung's 19x profit jump on AI memory demand masks investor skepticism over China chip threat and capex sustainability.",
          },
          {
            headline: "Qualcomm and Arm see momentum in AI, but smartphone weakness weighs on both stocks",
            url: "https://siliconangle.com/2026/07/29/qualcomm-arm-see-momentum-ai-smartphone-weakness-weighs-stocks/",
            source: "SiliconAngle",
            image: "https://d15shllkswkct0.cloudfront.net/wp-content/blogs.dir/1/files/2026/07/Screenshot-from-2025-05-01-08-41-13.png",
            oneliner: "Qualcomm, Arm warn of smartphone component cost inflation; memory chip prices squeeze handset supply chain.",
          },
          {
            headline: "Samsung's stock rises on explosive operating profit growth",
            url: "https://siliconangle.com/2026/07/29/samsungs-stock-rises-explosive-operating-profit-growth/",
            source: "SiliconAngle",
            image: "https://d15shllkswkct0.cloudfront.net/wp-content/blogs.dir/1/files/2026/07/Screenshot-from-2026-01-08-09-07-08-1.png",
            oneliner: "Samsung's 19-fold operating profit surge driven by AI-driven memory demand, signals sustained capex tailwind.",
          },
        ],
      },
      {
        category: "Capital Flows",
        stories: [
          {
            headline: "Microsoft jumps 8% as it boosts capital spending plans, citing demand",
            url: "https://www.cnbc.com/2026/07/29/microsoft-msft-q4-earnings-report-2026.html",
            source: "CNBC",
            image: "https://image.cnbcfm.com/api/v1/image/108341300-1785264972840-gettyimages-2262968972-20090101260225-99-646958.jpeg?v=1785265047&amp;w=1920&amp;h=1080",
            oneliner: "Microsoft raises capex guidance, signals positive FCF despite AI datacenter build-out acceleration.",
          },
          {
            headline: "TSMC's AI Implementation Helps 1.4nm Progress By Reducing Construction Risk And High Temperature Hazards, As Company Sets Ambitious Production Target Of Mid-2028",
            url: "https://wccftech.com/tsmc-1-4nm-ai-construction-risk-temperature-hazards-2028-target/",
            source: "WCCFtech",
            image: "https://cdn.wccftech.com/wp-content/uploads/2026/07/TSMC-1.4nm-2.jpg",
            oneliner: "TSMC leverages AI to de-risk 1.4nm process node ramp, targeting 2028 production launch ahead of Samsung, Intel.",
          },
          {
            headline: "Amazon finds cases of AI causing runaway spending on tech projects",
            url: "https://www.ft.com/content/77baac40-d803-4084-94f3-a133653072cf?syn-25a6b1a6=1",
            source: "Financial Times",
            image: null,
            oneliner: "Amazon discovers AI-driven budget overruns on infrastructure projects, raises capex governance risks across tech.",
          },
          {
            headline: "The majority of corporate IT is now off premises for the first time",
            url: "https://www.theregister.com/off-prem/2026/07/30/the-majority-of-corporate-it-is-now-off-premises-for-the-first-time/5280554",
            source: "The Register",
            image: "https://image.theregister.com/259417.jpg?imageId=259417&x=0&y=0&cropw=100&croph=100&panox=0&panoy=0&panow=100&panoh=100&width=1200&height=683",
            oneliner: "Cloud migration milestone: off-premises workloads exceed on-premise for first time, accelerates datacenter chip demand.",
          },
          {
            headline: "30 Georgia homes are being acquired via sale or eminent domain to expand power grid — one affected family member says it's 'for the data centers'",
            url: "https://www.tomshardware.com/tech-industry/data-centers/30-georgia-homes-are-being-reclaimed-via-sale-or-eminent-domain-to-expand-power-grid-one-affected-family-member-says-its-for-the-data-centers",
            source: "Tom's Hardware",
            image: "https://cdn.mos.cms.futurecdn.net/KHUetaXQbsmm6z9m5g5Pne-2560-80.jpg",
            oneliner: "Georgia power grid expansion via eminent domain targets datacenter buildout; infrastructure bottleneck drives land conflicts.",
          },
        ],
      },
      {
        category: "Geopolitics & Policy",
        stories: [
          {
            headline: "Pennsylvania town lists 43 specific demands to approve new AI data center project — developer calls local demands 'too difficult' as council slams response as 'approval by tantrum'",
            url: "https://www.tomshardware.com/tech-industry/data-centers/pennsylvania-town-lists-43-specific-demands-to-approve-new-ai-data-center-project-developer-calls-local-demands-too-difficult-as-council-slams-response-as-approval-by-tantrum",
            source: "Tom's Hardware",
            image: null,
            oneliner: "Pennsylvania datacenter approval deadlock signals regulatory friction escalating across US infrastructure expansion.",
          },
        ],
      },
      {
        category: "Other",
        stories: [
          {
            headline: "A fundamental flaw leaves LLMs strikingly vulnerable to attack",
            url: "https://www.technologyreview.com/2026/07/30/1140927/a-fundamental-flaw-leaves-llms-vulnerable-to-attack/",
            source: "MIT Tech Review",
            image: "https://wp.technologyreview.com/wp-content/uploads/2026/07/chain-link.jpg?resize=1200,600",
            oneliner: "Researchers prove LLMs structurally vulnerable to hacks; raises security compliance burden for AI chip deployments.",
          },
          {
            headline: "Indian Startup Vimag Labs Develops Wirelessly Excited Motor Without Rare-Earth Magnets",
            url: "https://www.eetimes.com/indian-startup-vimag-labs-develops-wirelessly-excited-motor-without-rare-earth-magnets/",
            source: "EE Times",
            image: null,
            oneliner: "Vimag Labs eliminates rare-earth magnets from EV motors; reshapes semiconductor supply chain for automotive chips.",
          },
        ],
      },
    ],
    podcasts: [],
    earnings: [],
    quotes: [],
  },
  {
    number: 19,
    date: "July 29, 2026",
    slug: "issue-19",
    title: "SK Hynix Crashes. Memory Glut Looms. Intel Closes RAMP-C.",
    sections: [
      {
        category: "Compute",
        stories: [
          {
            headline: "Chip stocks shed more than $1 trillion as selloff hits companies powering AI boom",
            url: "https://www.cnbc.com/2026/07/29/chip-selloff-sk-hynix-samsung-softbank.html",
            source: "CNBC",
            image: "https://image.cnbcfm.com/api/v1/image/108335411-1784129151298-Traders-Photo-20260715-KK-PRESS-013.jpg?v=1784129393&amp;w=1920&amp;h=1080",
            oneliner: "Nvidia, SK Hynix, Samsung lead $1T chip sector selloff on AI demand uncertainty.",
          },
          {
            headline: "Mac Mini Availability: Long Waits and Higher Prices",
            url: "https://www.wired.com/story/mac-mini-availability/",
            source: "Wired",
            image: "https://media.wired.com/photos/6a6912ed459e7618649764bc/191:100/w_1280,c_limit/Months-Later,-the-Mac-Mini-Remains-in-Desperately-Short-Supply.jpg",
            oneliner: "Mac Mini supply crunch driven by AI chip demand and memory shortage; consumer pricing inflated.",
          },
          {
            headline: "From Pilots to AI Factories: How Enterprises Are Really Scaling Agentic AI and Agent Gateways",
            url: "https://intelligence.theregister.com/paper/view/20412",
            source: "NextPlatform",
            image: null,
            oneliner: "Enterprise AI bottleneck shifts from model availability to infrastructure complexity; capex acceleration expected.",
          },
        ],
      },
      {
        category: "Memory & Networking",
        stories: [
          {
            headline: "SK Hynix shares tank as exponential earnings growth fails to satisfy AI-charged expectations",
            url: "https://www.cnbc.com/2026/07/29/sk-hynix-earnings-profit-revenue-hbm-memory.html",
            source: "CNBC",
            image: "https://image.cnbcfm.com/api/v1/image/108312250-1779842485652-gettyimages-2271903082-AFP_A8KT99F.jpeg?v=1783682507&amp;w=1920&amp;h=1080",
            oneliner: "SK Hynix earnings miss triggers $1T chip selloff; HBM demand forecasts now under question.",
          },
          {
            headline: "Tech rout roils markets after SK Hynix profits disappoint",
            url: "https://www.ft.com/content/e8e3a60a-059c-45b5-bbe3-49add14fd343?syn-25a6b1a6=1",
            source: "Financial Times",
            image: null,
            oneliner: "SK Hynix insists memory oversupply risk 'limited' amid market rout and margin compression.",
          },
          {
            headline: "DRAM chip supply to module makers could drop by more than 70% year-on-year in 2027, says Apacer CEO",
            url: "https://www.tomshardware.com/pc-components/ram/dram-chip-supply-to-module-makers-could-drop-by-more-than-70-percent-year-on-year-in-2027-says-apacer-ceo-demand-for-hbm-and-server-ram-continues-to-devour-manufacturing-capacity",
            source: "Tom's Hardware",
            image: "https://cdn.mos.cms.futurecdn.net/82L7i84TosbQSQDKVLcj2G-1920-80.jpg",
            oneliner: "HBM and server RAM consumption starves DIY DRAM allocations; module makers face 70% supply cut.",
          },
          {
            headline: "Big Tech demanding deals that smooth out memory prices, says SK Hynix",
            url: "https://www.theregister.com/systems/2026/07/29/big-tech-demanding-deals-that-smooth-out-memory-prices-says-sk-hynix/5280182",
            source: "The Register",
            image: "https://image.theregister.com/5215958.jpg?imageId=5215958&x=0&y=0&cropw=100&croph=100&panox=0&panoy=0&panow=100&panoh=100&width=1200&height=683",
            oneliner: "Major cloud providers negotiate long-term memory pricing locks; SK Hynix sees sustained margins.",
          },
          {
            headline: "State of play: SSD pricing one year into the AI component crisis",
            url: "https://www.tomshardware.com/pc-components/ssds/state-of-play-ssd-pricing-one-year-into-the-ai-component-crisis-220-percent-price-increases-are-crippling-the-diy-market",
            source: "Tom's Hardware",
            image: "https://cdn.mos.cms.futurecdn.net/LXmYjZpd2fneL9ZcTW3hx9-2560-80.jpg",
            oneliner: "SSD prices up 220% YoY as NAND supply diverted to AI datacenter; DIY market crippled.",
          },
          {
            headline: "From Co-Packaged Optics to Nanolasers: Photonics Moves Inward",
            url: "https://www.eetimes.com/from-co-packaged-optics-to-nanolasers-photonics-moves-inward/",
            source: "EE Times",
            image: null,
            oneliner: "CEA-Leti, Scintil Photonics advance co-packaged optics and chiplet-level optical interconnects.",
          },
        ],
      },
      {
        category: "Capital Flows",
        stories: [
          {
            headline: "Rheinmetall Q2 profit beats forecasts as revenue jumps nearly 70%",
            url: "https://finance.yahoo.com/markets/stocks/articles/rheinmetall-posts-record-q2-revenue-104959546.html",
            source: "Yahoo Finance",
            image: null,
            oneliner: "Rheinmetall Q2 revenue +70% YoY; defense semiconductor and advanced packaging demand surge.",
          },
          {
            headline: "Dow Jones Futures Fall, Oil Jumps On Iran News; Seagate, SK Hynix, KLA, Bloom Energy Are AI Earnings Movers",
            url: "https://www.investors.com/market-trend/stock-market-today/dow-jones-futures-market-seagate-sk-hynix-kla-bloom-energy-earnings-fed-meeting/?src=A00220&yptr=yahoo",
            source: "Yahoo Finance",
            image: "https://www.investors.com/wp-content/uploads/2026/04/stock-ai-chip-adobe.jpg",
            oneliner: "Seagate, SK Hynix, KLA earnings; geopolitical volatility pressures chip capex outlook.",
          },
        ],
      },
      {
        category: "Geopolitics & Policy",
        stories: [
          {
            headline: "America bans imported robots due to supply chain and security risks",
            url: "https://www.theregister.com/security/2026/07/29/america-bans-imported-robots-due-to-supply-chain-and-security-risks/5280145",
            source: "The Register",
            image: "https://image.theregister.com/5280168.jpg?imageId=5280168&x=0&y=0&cropw=100&croph=100&panox=0&panoy=0&panow=100&panoh=100&width=1200&height=683",
            oneliner: "FCC blacklists Chinese robots including Unitree; NVIDIA partner supply chain disrupted.",
          },
          {
            headline: "US FCC Blacklists Foreign Robots on Huawei List as Surveillance Fears Grow",
            url: "https://wccftech.com/fcc-blacklists-foreign-robots-on-huawei-list-as-surveillance-fears-grow-striking-nvidia-partner-unitree-as-well",
            source: "WCCFtech",
            image: "https://cdn.wccftech.com/wp-content/uploads/2026/05/NVIDIA-AI-Robotics-Humans-1920x1103.jpg",
            oneliner: "FCC adds foreign robots to Huawei blacklist; NVIDIA-linked Unitree import ban tightens U.S. controls.",
          },
        ],
      },
      {
        category: "Other",
        stories: [
          {
            headline: "PwC published reports on AI marred by AI hallucinations",
            url: "https://www.ft.com/content/7e149ac8-2ce2-4266-8940-192f9821b33c?syn-25a6b1a6=1",
            source: "Financial Times",
            image: null,
            oneliner: "PwC's AI consulting reports contain LLM hallucinations; enterprise AI deployment quality concerns rise.",
          },
        ],
      },
    ],
    podcasts: [],
    earnings: [],
    quotes: [],
  },
  {
    number: 18,
    date: "July 28, 2026",
    slug: "issue-18",
    title: "Google Burns $44.9B in One Quarter. China DUV. Memory War Intensifies.",
    sections: [
      {
        category: "Compute",
        stories: [
          {
            headline: "Qualcomm's Snapdragon 8 Elite Gen 6 Pro Pricing To Alienate Customers To The Ultra-Premium Segment; MediaTek's 2nm SoC Can Capitalize With A 28% Cheaper Alternative",
            url: "https://wccftech.com/mediatek-dimensity-9600-pro-cheaper-than-snapdragon-8-elite-gen-6-pro/",
            source: "WCCFtech",
            image: "https://cdn.wccftech.com/wp-content/uploads/2026/07/Snapdragon-8-Elite-Gen-6-Pro-and-Dimensity-9600-Pro.jpg",
            oneliner: "MediaTek 2nm Dimensity 9600 Pro undercuts Snapdragon by 28%; N2P demand bifurcates.",
          },
          {
            headline: "Leaked Radeon RX 9050 hints at the return of 4GB VRAM GPUs in 2026 — new budget RDNA 4 card also spotted in 8GB config with half the power of an RX 9060",
            url: "https://www.tomshardware.com/pc-components/gpus/leaked-radeon-rx-9050-hints-at-the-return-of-4gb-vram-gpus-in-2026-new-budget-rdna-4-card-also-spotted-in-8gb-config-with-half-the-power-of-an-rx-9060",
            source: "Tom's Hardware",
            image: "https://cdn.mos.cms.futurecdn.net/e3aZ4gaUfwqRCa2fRXdMEC-1920-80.png",
            oneliner: "AMD RX 9050 4GB RDNA 4 targets budget segment; memory efficiency beats raw power.",
          },
          {
            headline: "Ilya Sutskever's Safe Superintelligence gets access to Nvidia's Vera Rubin platform",
            url: "https://siliconangle.com/2026/07/27/ilya-sutskevers-safe-superintelligence-gets-access-nvidias-vera-rubin-platform/",
            source: "SiliconAngle",
            image: "https://d15shllkswkct0.cloudfront.net/wp-content/blogs.dir/1/files/2026/07/Photo-1.png",
            oneliner: "SSI secures NVIDIA Vera Rubin compute access; frontier lab GPU allocation signals strategic alignment.",
          },
          {
            headline: "AI Hosts And Sandboxes Save Intel's Datacenter CPU Cookies",
            url: "https://www.nextplatform.com/compute/2026/07/28/ai-hosts-and-sandboxes-save-intels-datacenter-cpu-cookies/5279338",
            source: "NextPlatform",
            image: "https://image.nextplatform.com/5218918.jpg?imageId=5218918&x=0&y=0&cropw=100&croph=100&panox=0&panoy=0&panow=100&panoh=100&width=1200&height=683",
            oneliner: "Intel sandboxed AI inference preserves Xeon attach in GPU-centric data centers.",
          },
        ],
      },
      {
        category: "Memory & Networking",
        stories: [
          {
            headline: "Samsung's chip workers are jumping ship to rival SK Hynix",
            url: "https://www.technologyreview.com/2026/07/28/1140853/samsung-chip-workers-exodus-sk-hynix/",
            source: "MIT Tech Review",
            image: "https://wp.technologyreview.com/wp-content/uploads/2026/07/chip-money.jpg?resize=1200,600",
            oneliner: "Samsung engineers defecting to SK Hynix signals aggressive talent war in memory leadership.",
          },
          {
            headline: "SK hynix Plans To Diminish CXMT's Golden Period With The Only Way It Knows; Technological Superiority, As It Wins Over Chinese Customers With LPDDR6 RAM",
            url: "https://wccftech.com/sk-hynix-lpddr6-ram-cxmt-competition/",
            source: "WCCFtech",
            image: "https://cdn.wccftech.com/wp-content/uploads/2026/07/SK-hynix-LPDDR6.jpg",
            oneliner: "SK Hynix LPDDR6 ramp targets CXMT market share; China memory competition intensifies.",
          },
          {
            headline: "Chinese memory maker CXMT jumps 460%+ in first day of trading",
            url: "https://siliconangle.com/2026/07/27/chinese-memory-maker-cxmt-jumps-460-first-day-trading/",
            source: "SiliconAngle",
            image: "https://d15shllkswkct0.cloudfront.net/wp-content/blogs.dir/1/files/2026/07/chip-2.png",
            oneliner: "CXMT IPO surges 466% on Shanghai exchange; China memory self-sufficiency accelerates.",
          },
        ],
      },
      {
        category: "Capital Flows",
        stories: [
          {
            headline: "Google goes cash flow negative for the first time as AI data center buildout increases capex to a staggering $44.9 billion in a single quarter — CFO warns that capex will increase in 2027 as company banks big on TPUs",
            url: "https://www.tomshardware.com/tech-industry/big-tech/alphabet-goes-cash-flow-negative-for-the-first-time-as-ai-capex-doubles-to-44-9-billion-in-a-single-quarter",
            source: "Tom's Hardware",
            image: "https://cdn.mos.cms.futurecdn.net/SJwcUNbmofFcDsiP5VBd6Y-1920-80.png",
            oneliner: "Google's $44.9B quarterly capex spike signals sustained AI infrastructure arms race; TPU demand pressure on NVIDIA.",
          },
          {
            headline: "Nvidia behind $50bn lease on Texas data centre that will use its chips",
            url: "https://www.ft.com/content/685014e7-47dd-471b-a585-1b9b73ce5d6f?syn-25a6b1a6=1",
            source: "Financial Times",
            image: null,
            oneliner: "NVIDIA finances $50B Texas data center lease, anchoring H100/H200 demand through 2030s.",
          },
          {
            headline: "Nvidia's potential new deal with OpenAI would revive a spooky tech-bubble habit, analyst warns",
            url: "https://www.marketwatch.com/story/nvidias-potential-new-deal-with-openai-would-revive-a-spooky-tech-bubble-habit-analyst-warns-ae34ed64?mod=mw_rss_topstories",
            source: "MarketWatch",
            image: null,
            oneliner: "NVIDIA-backed OpenAI data center financing echoes dot-com circular leverage concerns.",
          },
          {
            headline: "Jim Cramer warns AI's circular financing frenzy echoes the dot-com bubble",
            url: "https://www.cnbc.com/2026/07/27/jim-cramer-warns-ai-circular-financing-echoes-dot-com-bubble.html",
            source: "CNBC",
            image: "https://image.cnbcfm.com/api/v1/image/108202841-1758643560411-gettyimages-2236938634-vcg111592748341.jpeg?v=1758647792&amp;w=1920&amp;h=1080",
            oneliner: "Analyst warns NVIDIA's capex backstopping mirors pre-2000 bubble leverage mechanics.",
          },
          {
            headline: "AI stock sell-off deepens as investors dump chipmakers",
            url: "https://www.ft.com/content/f8c03b5b-e194-4236-82c3-389b6f5dd7ae?syn-25a6b1a6=1",
            source: "Financial Times",
            image: null,
            oneliner: "Kospi-led chipmaker rout; SK Hynix, Samsung memory valuations under pressure.",
          },
        ],
      },
      {
        category: "Geopolitics & Policy",
        stories: [
          {
            headline: "'Picks and shovels' trade comes unstuck as AI hardware stocks plunge on competitive threat from China",
            url: "https://www.marketwatch.com/story/picks-and-shovels-trade-comes-unstuck-as-ai-hardware-stocks-plunge-on-competitive-threat-from-china-41a0c2b4?mod=mw_rss_topstories",
            source: "MarketWatch",
            image: null,
            oneliner: "China's DUV lithography claims trigger ASML, semiconductor capex equipment sell-off across Asia.",
          },
          {
            headline: "China's reported chip breakthrough comes with some big caveats",
            url: "https://www.cnbc.com/2026/07/28/china-chipmaking-duv-tool-asml-explained.html",
            source: "CNBC",
            image: "https://image.cnbcfm.com/api/v1/image/108291539-1776230666701-gettyimages-2267755525-SEMICON_China_2026_in_Shanghai.jpeg?v=1776230676&amp;w=1920&amp;h=1080",
            oneliner: "China claims DUV production; ASML dominance threatened but technical hurdles remain steep.",
          },
          {
            headline: "China fights back in AI spat with claim US AI companies distil Chinese models",
            url: "https://www.theregister.com/ai-and-ml/2026/07/28/china-fights-back-in-ai-spat-with-claim-us-ai-companies-distil-chinese-models/5279315",
            source: "The Register",
            image: "https://image.theregister.com/230490.jpg?imageId=230490&x=0&y=0&cropw=100&croph=100&panox=0&panoy=0&panow=100&panoh=100&width=1200&height=683",
            oneliner: "China threatens retaliation on US AI model distillation; IP/export tensions escalate.",
          },
          {
            headline: "Will Purging Chinese Tech Cost Europe Its Digital Future?",
            url: "https://www.eetimes.com/will-purging-chinese-tech-cost-europe-its-digital-future/",
            source: "EE Times",
            image: null,
            oneliner: "EU Chinese telecom equipment replacement costs €46B; supply chain decoupling threatens capex.",
          },
        ],
      },
    ],
    podcasts: [],
    earnings: [],
    quotes: [],
  },
  {
    number: 17,
    date: "July 27, 2026",
    slug: "issue-17",
    title: "CXMT Soars 466%. Intel Premiums Rise. TSMC 2nm Scales.",
    sections: [
      {
        category: "Compute",
        stories: [
          {
            headline: "Intel Bets on Premium Chips, and the Gamble Pays Off With Server Prices Jumping 48% in Q2",
            url: "https://wccftech.com/intel-bets-on-premium-chips-and-the-gamble-pays-off-with-server-prices-jumping-48-in-q2/",
            source: "WCCFtech",
            image: "https://cdn.wccftech.com/wp-content/uploads/2026/07/Intel-18A.jpg",
            oneliner: "Intel server CPU ASPs surge 48% on premium mix; Xeon strategy gains traction.",
          },
          {
            headline: "TSMC's 2nm Production Is In Full Swing, One Plant Has Already Reached 20,000 Monthly Wafers, As Demand Surge Could Eclipse 3nm Requirements Soon",
            url: "https://wccftech.com/tsmc-2nm-production-demand-surge/",
            source: "WCCFtech",
            image: "https://cdn.wccftech.com/wp-content/uploads/2026/07/TSMC-2nm-wafer-2.jpg",
            oneliner: "TSMC 2nm hits 20k wafers/month; demand may exceed 3nm capacity.",
          },
          {
            headline: "Nvidia is putting its Vera CPUs to work alongside AI agents to speed up chip design",
            url: "https://siliconangle.com/2026/07/26/nvidia-putting-vera-cpus-work-alongside-ai-agents-speed-chip-design/",
            source: "SiliconAngle",
            image: "https://d15shllkswkct0.cloudfront.net/wp-content/blogs.dir/1/files/2026/07/Screenshot-from-2026-07-27-10-19-06.png",
            oneliner: "NVIDIA Vera CPUs automate EDA workflows with Cadence, Synopsys integration.",
          },
        ],
      },
      {
        category: "Memory & Networking",
        stories: [
          {
            headline: "Chinese CXMT DRAM doesn't look like the budget savior many were expecting — new modules enter the market, but prices still track the big three",
            url: "https://www.tomshardware.com/pc-components/dram/chinese-cxmt-dram-doesnt-look-like-the-budget-savior-many-were-expecting-new-modules-enter-the-market-but-prices-still-track-the-big-three",
            source: "Tom's Hardware",
            image: "https://cdn.mos.cms.futurecdn.net/Y6RXNGdt5atPtqKHjD7EUW-1280-80.jpg",
            oneliner: "CXMT retail pricing matches SK Hynix/Micron; no margin compression yet.",
          },
          {
            headline: "Five Myths about the Current Memory Boom",
            url: "https://semiwiki.com/semiconductor-manufacturers/371531-five-myths-about-the-current-memory-boom/",
            source: "SemiWiki",
            image: "https://semiwiki.com/wp-content/uploads/2026/07/Five-Myths-about-the-Current-Memory-Boom-1200x658.jpg",
            oneliner: "HBM demand drives memory shortage; capacity allocation, not fab deficit.",
          },
          {
            headline: "Vultr targets open composable stacks and AMD partnership to lead cloud AI infrastructure",
            url: "https://siliconangle.com/2026/07/27/vultr-bets-amd-open-stacks-win-cloud-ai-infrastructure-amdadvancingai/",
            source: "SiliconAngle",
            image: "https://d15shllkswkct0.cloudfront.net/wp-content/blogs.dir/1/files/2026/07/Kevin.jpg",
            oneliner: "Vultr leverages AMD, open stacks for sovereign AI cloud positioning.",
          },
        ],
      },
      {
        category: "Capital Flows",
        stories: [
          {
            headline: "Chipmaker CXMT's 466% market debut surge makes it the most valuable China-listed company",
            url: "https://www.cnbc.com/2026/07/27/cxmt-china-market-debut-chipmaker-ipo.html",
            source: "CNBC",
            image: "https://image.cnbcfm.com/api/v1/image/108339018-1784788545432-gettyimages-2285591332-tang-cxmthead260715_npU3p.jpeg?v=1784788559&amp;w=1920&amp;h=1080",
            oneliner: "CXMT $85bn IPO signals China DRAM push; challenges SK Hynix, Micron duopoly.",
          },
          {
            headline: "Chinese chip champion CXMT soars 466% in market debut",
            url: "https://www.ft.com/content/8e82e939-908b-42bf-a314-0bb02a3f1b07?syn-25a6b1a6=1",
            source: "Financial Times",
            image: null,
            oneliner: "CXMT becomes China's largest IPO since 2010; reshapes global DRAM competition.",
          },
          {
            headline: "Zeiss expands German site that caps ASML's EUV scanner output — first new building opens four years after Oberkochen site groundbreaking",
            url: "https://www.tomshardware.com/tech-industry/zeiss-expands-german-site-that-caps-asmls-euv-scanner-output",
            source: "Tom's Hardware",
            image: "https://cdn.mos.cms.futurecdn.net/XVwQGuRMm2gVLvNC4rHrW8-1920-80.jpg",
            oneliner: "Zeiss adds 25k sqm Oberkochen capacity; ASML optics bottleneck easing.",
          },
          {
            headline: "CXMT IPO: Where China's Largest DRAM Maker Stands?",
            url: "https://www.eetimes.com/cxmt-ipo-where-chinas-largest-dram-maker-stand/",
            source: "EE Times",
            image: null,
            oneliner: "CXMT IPO analysis; China DRAM capacity target post-supply shortage.",
          },
        ],
      },
      {
        category: "Geopolitics & Policy",
        stories: [
          {
            headline: "AI companies spend record sums on Washington lobbying",
            url: "https://www.ft.com/content/d8a5f95e-3b6d-463a-a848-c9ef8e2394db?syn-25a6b1a6=1",
            source: "Financial Times",
            image: null,
            oneliner: "OpenAI, Anthropic, Google, Microsoft escalate DC lobbying; policy risk rises.",
          },
          {
            headline: "Nvidia, SpaceX, Microsoft launch AI safety initiative as OpenAI cyber attack fallout continues",
            url: "https://www.cnbc.com/2026/07/27/nvidia-ai-initiative-openai-cyber-attack.html",
            source: "CNBC",
            image: "https://image.cnbcfm.com/api/v1/image/108317416-1780669969197-gettyimages-2279256400-jung-nvidiace260605_nprgq.jpeg?v=1780670112&amp;w=1920&amp;h=1080",
            oneliner: "NVIDIA, SpaceX, Microsoft form Open Secure AI Alliance; supply chain security focus.",
          },
          {
            headline: "Digital sovereignty is real in Europe. The UK? Not so much",
            url: "https://www.theregister.com/columnists/2026/07/27/digital-sovereignty-is-real-in-europe-the-uk-not-so-much/5276852",
            source: "The Register",
            image: "https://image.theregister.com/5276896.jpg?imageId=5276896&x=0&y=0&cropw=100&croph=100&panox=0&panoy=0&panow=100&panoh=100&width=1200&height=683",
            oneliner: "Europe mandates open-source; UK remains US tech-dependent amid Trump uncertainty.",
          },
          {
            headline: "This Is Donald Trump's AI Brain Trust",
            url: "https://www.wired.com/story/this-is-donald-trumps-ai-brain-trust/",
            source: "Wired",
            image: "https://media.wired.com/photos/6a63ddfc7b2f84e64f1f3fcf/191:100/w_1280,c_limit/Donald-Trump-AI-Brain-Trust-Politics.jpg",
            oneliner: "Trump AI policy fragmented across 10 factions; chip export rules at risk.",
          },
        ],
      },
      {
        category: "Other",
        stories: [
          {
            headline: "Exotic Quasiparticles Promise Next-Gen Interconnects",
            url: "https://spectrum.ieee.org/topological-material-nanowire-interconnect",
            source: "IEEE Spectrum",
            image: "https://spectrum.ieee.org/media-library/image.jpg?id=67534512&width=1200&height=600&coordinates=0%2C125%2C0%2C125",
            oneliner: "Topological materials replace copper interconnects below 3nm nodes.",
          },
          {
            headline: "Foxconn drops VMware, adopts hyperconverged upstart Arcrfra for workloads including AI",
            url: "https://www.theregister.com/virtualization/2026/07/27/foxconn-drops-vmware-adopts-hyperconverged-upstart-arcrfra-for-workloads-including-ai/5278684",
            source: "The Register",
            image: "https://image.theregister.com/253902.jpg?imageId=253902&x=0&y=0&cropw=100&croph=100&panox=0&panoy=0&panow=100&panoh=100&width=1200&height=683",
            oneliner: "Foxconn abandons VMware for Arcrfra; AI workload infrastructure shift.",
          },
        ],
      },
    ],
    podcasts: [],
    earnings: [],
    quotes: [],
  },
  {
    number: 16,
    date: "July 24, 2026",
    slug: "issue-16",
    title: "Intel Surges 25%. AMD-Cerebras Counter Groq. Memory Chips Heat Up.",
    sections: [
      {
        category: "Compute",
        stories: [
          {
            headline: "Intel posts fastest growth in 15 years as AI data centres demand fuels sales",
            url: "https://www.ft.com/content/48f0a410-daae-420b-93fc-216c3a2f1184?syn-25a6b1a6=1",
            source: "Financial Times",
            image: null,
            oneliner: "Intel Q2 revenue jumped 25% on data center AI demand; strongest growth since 2011.",
          },
          {
            headline: "Intel knows it needs to 'leapfrog' ARM and AMD, says CEO Lip-Bu Tan",
            url: "https://www.theregister.com/systems/2026/07/24/intel-knows-it-needs-to-leapfrog-arm-and-amd-says-ceo-lip-bu-tan/5277968",
            source: "The Register",
            image: "https://image.theregister.com/5218918.jpg?imageId=5218918&x=0&y=0&cropw=100&croph=100&panox=0&panoy=0&panow=100&panoh=100&width=1200&height=683",
            oneliner: "Intel CEO signals aggressive roadmap; edge/robotics positioned as growth drivers vs. ARM, AMD.",
          },
          {
            headline: "AMD Fires Back At NVIDIA's Groq Bet, Fuses The Cerebras Wafer-Scale Engine With Helios For 5x Higher Tokens Per Second Per Watt",
            url: "https://wccftech.com/amd-fires-back-at-nvidias-groq-bet-fuses-the-cerebras-wafer-scale-engine-with-helios-for-5x-higher-tokens-per-second-per-watt/",
            source: "WCCFtech",
            image: "https://cdn.wccftech.com/wp-content/uploads/2026/07/2026-07-24_3-44-12-1920x1112.jpg",
            oneliner: "AMD-Cerebras integration claims 5x efficiency vs. NVIDIA's Groq LPU; AI inference arms race escalates.",
          },
          {
            headline: "AMD and Cerebras join forces against Nvidia's Groq LPUs",
            url: "https://www.theregister.com/systems/2026/07/23/amd-and-cerebras-join-forces-against-nvidias-groq-lpus/5277817",
            source: "The Register",
            image: "https://image.theregister.com/250546.jpg?imageId=250546&x=0&y=0&cropw=100&croph=100&panox=0&panoy=0&panow=100&panoh=100&width=1200&height=683",
            oneliner: "AMD partners Cerebras to compete directly with NVIDIA's Groq inference acceleration platform.",
          },
          {
            headline: "Intel Foundry Securing Packaging & Wafer Deal With NVIDIA To Make Next-Gen Feynman GPUs Could Be Its Biggest Customer Win Yet",
            url: "https://wccftech.com/intel-foundry-nvidia-feynman-gpu-wafer-packaging-deal/",
            source: "WCCFtech",
            image: "https://cdn.wccftech.com/wp-content/uploads/2026/07/Intel-NVIDIA-Feynman-GPUs.jpg",
            oneliner: "Intel Foundry poised for NVIDIA Feynman GPU deal; packaging + wafers supply partnership.",
          },
          {
            headline: "AI chip startup Etched more than doubles valuation to $10.3B in new $300M round",
            url: "https://siliconangle.com/2026/07/23/ai-chip-startup-etched-doubles-valuation-10-3b-new-300m-round/",
            source: "SiliconAngle",
            image: "https://d15shllkswkct0.cloudfront.net/wp-content/blogs.dir/1/files/2026/07/Etched.png",
            oneliner: "Etched raises $300M at $10.3B valuation; SK Hynix backs AI inference chip maker.",
          },
          {
            headline: "Microsoft and AMD target silicon diversity to power Azure's AI infrastructure buildout",
            url: "https://siliconangle.com/2026/07/23/silicon-diversity-powers-azure-ai-infrastructure-amdadvancingai/",
            source: "SiliconAngle",
            image: "https://d15shllkswkct0.cloudfront.net/wp-content/blogs.dir/1/files/2026/07/IMG_9924.jpg",
            oneliner: "Microsoft, AMD diversify Azure silicon; multi-GPU architecture hedges NVIDIA dependency.",
          },
          {
            headline: "AMD's rivalry with Nvidia is increasingly moving into a new realm",
            url: "https://www.marketwatch.com/story/amds-rivalry-with-nvidia-is-increasingly-moving-into-a-new-realm-ac63eceb?mod=mw_rss_topstories",
            source: "MarketWatch",
            image: null,
            oneliner: "AMD escalates server CPU competition vs. NVIDIA; GPU duopoly shifting to multi-architecture contest.",
          },
        ],
      },
      {
        category: "Memory & Networking",
        stories: [
          {
            headline: "China's largest memory chipmaker sparks fears of a cash drain as it readies for public debut",
            url: "https://www.cnbc.com/2026/07/24/cxmt-china-ipo-listing-chip-memory.html",
            source: "CNBC",
            image: "https://image.cnbcfm.com/api/v1/image/108312364-1779878364667-gettyimages-2277415878-TFSPI_23052026-5551.jpeg?v=1779878377&amp;w=1920&amp;h=1080",
            oneliner: "CXMT IPO looms; Chinese memory chip capex competition feared to drain domestic liquidity.",
          },
        ],
      },
      {
        category: "Capital Flows",
        stories: [
          {
            headline: "Meta faces higher borrowing costs in latest $12bn data centre financing",
            url: "https://www.ft.com/content/822628c5-4f9c-47db-bd27-f3ad7f841700?syn-25a6b1a6=1",
            source: "Financial Times",
            image: null,
            oneliner: "Meta's $12B data center bond faces investor anxiety over AI capex exposure; rates spike.",
          },
          {
            headline: "Google Cloud CEO Kurian says customers are spending 50% more as segment blows away expectations",
            url: "https://www.cnbc.com/2026/07/23/google-cloud-kurian-revenue-earnings.html",
            source: "CNBC",
            image: "https://image.cnbcfm.com/api/v1/image/106120359-1568071954183gettyimages-1135936634.jpeg?v=1651801580&amp;w=1920&amp;h=1080",
            oneliner: "Google Cloud customers increasing spend 50%; AI capex surge accelerates hyperscaler revenue.",
          },
        ],
      },
      {
        category: "Geopolitics & Policy",
        stories: [
          {
            headline: "U.S. Starts Genesis Mission with $5B for First Projects",
            url: "https://www.eetimes.com/u-s-starts-genesis-mission-with-5b-for-first-projects/",
            source: "EE Times",
            image: null,
            oneliner: "US deploys $5B Genesis Mission AI funding; China readies $295B; geopolitical semiconductor race.",
          },
          {
            headline: "Trump rolls out a new wave of global tariffs. Here are the latest rates.",
            url: "https://www.marketwatch.com/story/trump-rolls-out-a-new-wave-of-tariffs-here-are-the-latest-rates-449af1d3?mod=mw_rss_topstories",
            source: "MarketWatch",
            image: null,
            oneliner: "Trump tariff escalation impacts semiconductor supply chains; manufacturing cost pressures intensify.",
          },
        ],
      },
      {
        category: "Other",
        stories: [
          {
            headline: "Agentrys Designs a Real Chip with its Multi-Agent Workforce",
            url: "https://semiwiki.com/eda/agentrys/371377-agentrys-designs-a-real-chip-with-its-multi-agent-workforce/",
            source: "SemiWiki",
            image: "https://semiwiki.com/wp-content/uploads/2026/07/Agentrys-Designs-a-Real-Chip-with-its-Multi-Agent-Workforce.png",
            oneliner: "Agentrys AI agents tape out real silicon; EDA industry undergoes agent-driven transformation.",
          },
          {
            headline: "The Story Behind Fuse EDA AI system",
            url: "https://www.eetimes.com/the-story-behind-fuse-eda-ai-system/",
            source: "EE Times",
            image: null,
            oneliner: "Fuse agentic EDA system enables AI-driven design verification; trusted AI frameworks emerge.",
          },
          {
            headline: "PCs & Smartphones Supply Constrained",
            url: "https://semiwiki.com/semiconductor-services/semiconductor-intelligence/371662-pcs-smartphones-supply-constrained/",
            source: "SemiWiki",
            image: "https://semiwiki.com/wp-content/uploads/2026/07/Semiconductor-Intelligence-July-2026-1.png",
            oneliner: "PC, smartphone unit shipments down 4.9% and 6.7% YoY; demand cliff signals market correction.",
          },
        ],
      },
    ],
    podcasts: [],
    earnings: [],
    quotes: [],
  },
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
