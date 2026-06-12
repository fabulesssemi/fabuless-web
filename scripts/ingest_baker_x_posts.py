"""
Ingest Gavin Baker X posts into baker_chunks.
Run: COHERE_API_KEY=... SUPABASE_URL=... SUPABASE_SERVICE_KEY=... python3 scripts/ingest_baker_x_posts.py
"""

import os, time, uuid
import cohere
from supabase import create_client

COHERE_API_KEY = os.environ["COHERE_API_KEY"]
SUPABASE_URL   = os.environ["SUPABASE_URL"]
SUPABASE_KEY   = os.environ["SUPABASE_SERVICE_KEY"]

co = cohere.Client(COHERE_API_KEY)
sb = create_client(SUPABASE_URL, SUPABASE_KEY)

CHUNKS = [

  # ── Feb 25 2026 X post: Nvidia, AI cycle, GPU residual values ─────────────
  (
    "Baker X Post — Nvidia Demand Durability & AI Cycle (Feb 2026)",
    "2026-02-25",
    "https://x.com/GavinSBaker",
    """From my perspective, the most important dynamics for Nvidia are the durability of demand and the ROI on AI, which is closely tied to the useful life of GPUs.

Every single comparable episode in market history suggests we will get a financial bubble and an overbuild. Carlota Perez covered this in "Technological Revolutions and Financial Capital" — anytime there is a technological revolution (railroads, radio, the internet), financial markets correctly understand its potential and the ensuing excitement leads to a bubble. The bubble leads to an overbuild, the overbuild leads to a temporary decline in demand, a crash, then the oversupply of the enabling technology leads to a "golden age." This is exactly what happened with the internet.

Nvidia's valuation can be understood as the market essentially saying it believes we are approaching a local peak in Nvidia earnings as a result of a coming overbuild fueled by a bubble. Nvidia's stock is not in a valuation bubble — the market is concerned about a fundamental bubble, a bubble in capex rather than valuation. If the market were to build confidence in even a high single digit revenue growth CAGR for Nvidia post fiscal 27, this would probably have a positive impact on their valuation.""",
  ),
  (
    "Baker X Post — Nvidia Demand Durability & AI Cycle (Feb 2026)",
    "2026-02-25",
    "https://x.com/GavinSBaker",
    """Believing that "this time is different" is dangerous, but this time may be different. The world is fundamentally short both watts and wafers and it may take years to resolve these shortages. The shortage of watts and wafers may prevent an overbuild — hyperscalers would overbuild if they could, but they simply cannot. To the best of my knowledge, there were no comparable shortages preventing the deployment of the precedent technologies outlined by Perez. Difficult to have a crash without an overbuild, especially from current valuation levels where technology equities trade at the same multiple as consumer staples.

TSMC is run by flinty, hard, old-school semiconductor veterans who regard their tenure as stewardship of a national treasure and preserving the legacy of Morris Chang for the people of Taiwan. Jensen might wish that TSMC were expanding capacity faster, but TSMC's restraint is really good for everyone involved. The shortage of watts and wafers is likely to smoothen and elongate this cycle — those flinty old veterans may single-handedly prevent an overbuild even if we magically resolve the shortage of watts. The wafer intensity of AI may be its savior. A smoother for longer AI cycle is good for humanity, not just financial markets.""",
  ),
  (
    "Baker X Post — GPU Useful Life & ASIC vs GPU (Feb 2026)",
    "2026-02-25",
    "https://x.com/GavinSBaker",
    """The rental price of GPUs reflects the economic value of tokens. Rental prices for GPUs are the beating heart of the "ROI on AI." We should expect them to trend down over time even with a highly positive ROI on AI as more capable, efficient GPUs are continuously introduced. Instead, rental prices for nearly four-year-old H100s have gone vertical over the last two months, suggesting that agentic AI — especially agentic coding — is delivering significant economic value.

Even six-year-old A100s remain fully utilized per AWS with firm per-hour pricing. I would have expected the opposite after the introduction of Blackwell. This strongly suggests that the useful life of a GPU is at least six years, which is longer than the depreciation schedules of most of their customers. This means financing rates for GPUs should fall further as residual values come out stronger than expected.

Relative to an ASIC, this is important — an ASIC developed and optimized for a single model or application is unlikely to have such a long useful life given the current pace of change. ASICs will be harder to finance and have a higher cost of capital. Specialization may be the enemy of useful life whereas a GPU's more flexible, programmable nature is likely to be its friend. Using GPUs for prefill and forthcoming SRAM-based chips for decode should further prolong GPU useful lives relative to ASICs.""",
  ),
  (
    "Baker X Post — Nvidia vs TPU, Prefill/Decode, Google Cost Advantage (Feb 2026)",
    "2026-02-25",
    "https://x.com/GavinSBaker",
    """The disaggregation of prefill and decode, which is probably going to happen much earlier for the Nvidia ecosystem than the TPU ecosystem, combined with conservative design choices by Google for TPU v8 and aggressive choices by Nvidia for Rubin, may give Nvidia's customers a significant cost advantage over Google for the first time.

The fact that Google does not have a switched scale-up networking fabric for TPUs today may only add to the Nvidia ecosystem's cost advantage when it comes to inference for the MoE architectures that currently dominate the frontier. Google has likely been using their TPU v7 cost advantage to underprice tokens in an attempt to suck the economic oxygen out of competing independent labs like Anthropic, OpenAI, and xAI. The potential end of this cost advantage should lead to more rational decision making by Google — even they cannot afford to lose tens of billions underpricing tokens for long — and this should be really positive for the ROI on AI as Blackwell clusters shift from training to inference.""",
  ),
  (
    "Baker X Post — Frontier Model Oligopoly & Scaling Laws (Feb 2026)",
    "2026-02-25",
    "https://x.com/GavinSBaker",
    """Gemini 3 shows that scaling laws for pretraining are intact. This is the most important AI datapoint since the release of o1. This means that Blackwell models are likely to show a significant increase in performance when they come out in Q2 2026.

GPT-5 was not evidence of a slowdown in scaling laws. GPT-5 was designed to be cheaper to inference, not better — it was actually a smaller model behind a router.

Reasoning has dramatically improved the economics and business models of frontier models. Reasoning unlocks the "users generate data which can be fed back into the product to improve the product and attract more users" flywheel that underpins every great internet business model. This did not exist in the non-reasoning world where pre-training was the only scaling law. Barriers to entry are increasing by the day as a result of reasoning.

The frontier model industry increasingly looks like a four-player oligopoly: Gemini, OpenAI, Anthropic, and xAI all have much more advanced checkpoints than are publicly available that are being used to train their next model. Makes it difficult to catch up. Meta has a chance because Chinese open-source models are only nine months behind, but only a small chance.""",
  ),
  (
    "Baker X Post — Blackwell, Power Shortages & Tokenomics (Feb 2026)",
    "2026-02-25",
    "https://x.com/GavinSBaker",
    """Blackwell will likely significantly increase the gap between American frontier models and Chinese open-source models. Domestic Chinese semiconductors are much further behind Blackwell relative to their performance vs. Hopper a year ago. This will only increase barriers to entry for frontier models.

The Blackwell product transition was by far the biggest and most complex in technology history. The B300, which is ramping now, is arguably Nvidia's best datacenter GPU ever and rack deployments are accelerating. The fact that Nvidia was able to grow through this transition is a testament to how eagerly customers were anticipating the B300.

AI remains the first time in my career as a tech investor that costs matter. Apple is not a multi-trillion dollar company because they are the low cost producer of phones, nor is Nvidia the low cost producer of AI accelerators. But being the low cost producer of tokens will be a profound advantage. Today, the low cost producers of tokens are Google followed by xAI.

It is not the number of GPUs or TPUs that matter — it is the number of coherent GPUs in a cluster/fabric and the cost of communicating across that cluster/fabric. Google with Gemini 3 and xAI with Grok 4.1 are clearly the best models today.""",
  ),
  (
    "Baker X Post — Power Shortages, Optics, GPU Residuals (Feb 2026)",
    "2026-02-25",
    "https://x.com/GavinSBaker",
    """Power shortages are a natural governor on the AI buildout that reduce the odds of an overbuild. Should increase the duration and smoothness of the cycle. Power shortages could be great for Blackwell — when watts are the bottleneck, tokens per watt will drive decision making as tokens literally equal revenue. GPU vs. ASIC pricing will matter much less in a power constrained world. Even if an ASIC can reduce the cost of a 1 gigawatt datacenter from $50B to $40B, the ROI on that $40B will be lower because the revenue (tokens) produced by that datacenter will be significantly lower. Net-net, power shortages increase the pricing power for the semiconductors and systems with the best token per watt performance.

Optics allow workloads to be moved to where electricity is available and cheap. Multi-campus training requires an unimaginable amount of optics, but this spend is still dwarfed by the spend on compute itself. Optics are also the solution to China's GPU deficit and power surplus — moving from copper to optics for scale-up networking can offset much of the deficit in compute per accelerator at the cost of dramatically increased power usage. "Copper when you can, optics when you must" — and the "must" is inexorably approaching for almost the entire datacenter.

The fact that Hopper rental prices have increased since Blackwell became broadly available suggests GPU residual values might need to be extended beyond six years. If these trends continue, expect GPU financing costs to drop another 100-200 bps.""",
  ),
  (
    "Baker X Post — ROI on AI & ROIC of Hyperscalers (Feb 2026)",
    "2026-02-25",
    "https://x.com/GavinSBaker",
    """As of the third quarter, the ROIC of the hyperscalers remains higher than it was before they ramped their capex on GPUs. This is the most accurate way to quantitatively measure the "ROI on AI" — it also captures the immense revenue benefits that Google and Meta have seen from moving their recommendation and advertising systems to GPUs from CPUs.

It is possible that we have an "ROIC" air pocket over the next two quarters as capex ramps sharply for Blackwell and there is definitionally no initial ROI on this spend as the Blackwells are used for training. Obviously the only "ROI on AI" comes from inference.

It took S&P 500 companies roughly five years to begin broadly shifting to the cloud after venture companies had shifted en masse. AI might be happening faster. The third quarter was the first time multiple S&P 500 companies gave concrete data on AI productivity that impacted their financials. These nascent productivity gains at large companies mirror what VCs are seeing with their portfolio companies where revenue per employee has gone vertical since essentially every venture-backed company leaned into AI.

All of this suggests that we are still very early in AI. The internet trade survived the demise of Yahoo, MySpace, and AOL. OpenAI losing share to Google and/or others will not materially impact overall token demand — and token demand as a function of customer ROI is what ultimately matters.""",
  ),

  # ── Nov 19 2025 X post: Scaling laws, AI economics, 10 points ────────────
  (
    "Baker X Post — AI Scaling Laws & Economics (Nov 2025)",
    "2025-11-19",
    "https://x.com/GavinSBaker",
    """Cautious optimism might be a better description of my current thinking on AI. "I don't know" and "time will tell" are generally the most accurate statements about the future, especially with something as complex, fast-moving, and open-ended as AI.

First, the ROI on AI has been positive thus far. This is undeniable. ROIC at the largest spenders on AI has gone up significantly since they ramped their datacenter/GPU capex spend last year. Most of the ROI on AI thus far has come from improved advertising targeting and creative leading to higher ROAS for customers. The higher customer ROAS has driven increased spend and thereby higher revenue growth for the largest internet advertising companies. AI underpins both Performance Max and Advantage Plus, which have really ramped over the last year.

GPUs are fungible across AI workloads — which is one reason it has taken so long for ASICs to ramp. When a training run finishes, GPUs can be redeployed to support both training and inference for the recommender systems that are still some of the largest workloads in the world. Revenue growth accelerated at the two largest internet advertising companies beginning in early 2023, much more so than can be explained by trends in GDP growth — this acceleration is almost certainly due to improved ROAS enabled by AI. Until ROIC at the largest GPU spenders begins to go down, any debate about ROI on AI is ridiculous.""",
  ),
  (
    "Baker X Post — Scaling Laws Colliding with Economics (Nov 2025)",
    "2025-11-19",
    "https://x.com/GavinSBaker",
    """Scaling laws may eventually collide with economics if they hold. No one on Planet Earth knows if they will hold. Almost everyone closest to AI believes they will.

If scaling laws hold and there are no fundamental technology breakthroughs, the models trained in 2026/2027 are likely to require clusters costing well over $100 billion. Multiple players are discussing 5-10 gigawatt clusters — easily into the hundreds of billions for a single cluster. At this point, scaling laws may collide with economics, ROIC may begin declining, and there might be an ROI on AI debate underpinned by reality rather than speculation.

New generations of GPUs/XPUs, networking, memory, and storage are mostly what enable scaling laws to continue. A model trained on a $100 billion-plus training cluster might be effectively worthless in 18 months given the 90%+ depreciation curve seen thus far for token pricing once new compute/networking technologies come out that enable the training of a new generation of models. Not only is that model essentially worthless, but a new cluster costing $150-200 billion might then immediately be required to train the next generation. That is what scaling laws mean barring a technological breakthrough in the efficiency of the conversion of joules to exaflops per second.

NVLink is the single most important technology and product at Nvidia — the back-end networking speeds are what determine whether you can build a bigger, more powerful cluster every year.""",
  ),
  (
    "Baker X Post — Agents, ASI & Wildcards for AI ROI (Nov 2025)",
    "2025-11-19",
    "https://x.com/GavinSBaker",
    """Given these dynamics, the only way to generate ROI on a model is to have unique, valuable data and internet-scale distribution. Absent unique data and internet-scale distribution, these models are essentially commodities — which is why it was relatively easy for Meta to outsource Llama. The value will mostly come from the data, not the model, at least for now. This isn't a Game of Kings, it is a Game of Emperors. The most efficient Emperor is likely going to be the ultimate winner — infrastructure efficiency might be the single most important deciding factor as even a 20-30% efficiency advantage might be decisive in the context of hundreds of billions in capex.

The two wildcards for ROI are agents and ASI. An agent is effectively a disembodied robot that can take online/virtual action on your behalf or a corporation's behalf. There are likely to eventually be billions of agents. If agents become a reality sooner rather than later then there might be an ROI even on that $100 billion-plus of spend.

More important is ASI — if this is achieved before scaling laws collide with economics, tens of trillions of dollars in value will be created. The reason major players are likely to keep spending as long as scaling laws hold — even if ROIC begins declining — is that they believe they are in a race to create ASI. They believe ASI will create tens of trillions of value and that it is an existential risk if they lose. If ROICs begin declining and megacap companies cancel their dividends and buybacks, that is not bullish until we get agents and/or ASI.""",
  ),
  (
    "Baker X Post — Blackwell Delay Risk & xAI Scaling Test (Nov 2025)",
    "2025-11-19",
    "https://x.com/GavinSBaker",
    """The potential Blackwell delay might be significant. Blackwell's original timeline was at least 6-9 months ahead of potential ASIC/AMD/startup alternatives for training (inference is a different matter entirely and becoming more competitive by the day). If Blackwell is delayed more than three months, spending will likely slow as there will be no ability or reason to spend on a massive new cluster until Blackwell comes out or alternatives improve. A spending slowdown as a result of a longer than expected Blackwell delay would not be bullish.

The xAI 100k cluster is the first true test of scaling laws since 20-30k H100 clusters were stood up roughly a year ago. This should lead to a super impressive Grok 3 if scaling laws hold. I think it is highly likely that scaling laws hold and Grok 3 is the best model in the world by a wide margin. Grok 3 class models might even usher in agents as a reality.

If scaling laws don't hold, then all of the spending really slows down. The only way spending will stop is if there is irrefutable evidence that scaling laws have stopped holding. "Trust the curves" until they break has been the right mentality — it is possible that we get a new generation of compute/networking technology that enables the order-of-magnitude increase in training capacity necessary to truly test the scaling law hypothesis, and that the scaling laws don't hold. No one really knows how or why scaling laws work, which means it is hard to make high-confidence predictions about them other than observing that the curves have been incredibly consistent since 2018.""",
  ),
]

def embed_texts(texts):
    response = co.embed(
        texts=texts,
        model="embed-english-v3.0",
        input_type="search_document",
        embedding_types=["float"],
    )
    return response.embeddings.float_

def main():
    print(f"Ingesting {len(CHUNKS)} chunks into baker_chunks...")
    batch_size = 10

    for i in range(0, len(CHUNKS), batch_size):
        batch = CHUNKS[i:i+batch_size]
        texts = [c[3] for c in batch]

        print(f"  Embedding batch {i//batch_size + 1} ({len(texts)} chunks)...")
        embeddings = embed_texts(texts)

        rows = []
        for (source, date, url, text), embedding in zip(batch, embeddings):
            rows.append({
                "id": str(uuid.uuid4()),
                "source": source,
                "date": date,
                "url": url,
                "text": text.strip(),
                "embedding": embedding,
                "quality_score": 0.95,
            })

        sb.table("baker_chunks").insert(rows).execute()
        print(f"  Inserted {len(rows)} rows.")
        time.sleep(0.5)

    print("Done!")

if __name__ == "__main__":
    main()
