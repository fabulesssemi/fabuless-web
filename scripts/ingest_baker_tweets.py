"""
Ingest cleaned Baker X/tweet content into baker_chunks.
Run: COHERE_API_KEY=... SUPABASE_URL=... SUPABASE_SERVICE_KEY=... python3 scripts/ingest_baker_tweets.py
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

  # ── Model portability eroding / inference co-design ──────────────────────
  (
    "Baker X Post — Model Portability & Inference Co-Design",
    "2025-11-01",
    "https://x.com/GavinSBaker",
    """As system-level architectures diverge (torus vs. switched scale-up topologies, memory hierarchies, networking primitives), true AI model portability is eroding. The Mi300 and Mi325 had roughly the same scale-up domain size as Hopper while Blackwell's scale-up domain is 9x larger than the Mi355 scale-up domain.

Many frontier models are now being explicitly co-designed for inference on specific hardware like GB300 racks. Codex on Cerebras is another example. Those models run less efficiently on other systems and the performance differentials will only widen. A model that runs well on Google's torus topology will run less efficiently on Nvidia's switched scale-up topology and vice versa — the data traffic is fundamentally different as a byproduct of the models being parallelized across the different topologies.

Today, inference costs as measured by tokens per watt per dollar are everything. Inference is way more important than training costs (inference is effectively now part of training via RL). Labs are therefore now optimizing for inference. This means increasing co-design and higher go-forward switching costs for individual models between systems. This explains why Anthropic and Nvidia came together: Anthropic needed Blackwells and Rubins to inference at least some of their models economically.

TLDR: as labs shift their focus from training to inference, the costs of portability and the upside of co-design to maximize tokens per watt per dollar both rise. Portability is likely to begin decreasing as a result.""",
  ),

  # ── China GPU policy / selling B30s ──────────────────────────────────────
  (
    "Baker X Post — China GPU Policy & B30 Export Argument",
    "2026-04-15",
    "https://x.com/GavinSBaker",
    """Selling advanced GPUs to America first and then deprecated versions to China later is a good policy that actually cements American dominance and eliminates the risk that China surpasses us in AI.

Conversely, if we deny them GPUs like the B30 that are deprecated relative to the ones available to America, and as a consequence China develops their own semiconductor ecosystem — likely centered around optical scale-up networking technologies given their surplus of watts — they actually might end up surpassing America in AI.

The argument for selling deprecated GPUs to China: selling them less advanced GPUs than we have in America decreases the odds that they develop more advanced GPUs that go down a different, more power-intensive tech tree. This is pro national-security.

The evolutionary pressure in America is a shortage of watts, so it makes sense for Nvidia to optimize for power efficiency and tokens per watt and stay on copper as long as possible. China has a surfeit of watts. Chinese AI systems are already taking advantage of this — the Huawei Cloudmatrix 384 and Atlas SuperPoD have an optical scale-up domain much larger than anything offered by Nvidia today at the cost of much higher power consumption and much lower tokens per watt. A model that runs well on Nvidia will not run well on that system and vice versa. This means that if a Chinese ecosystem gets momentum, Chinese models might stop running well on American hardware — and when Chinese models run best on American hardware, America is in a better position. Selling B30s to China is super pro-American, especially given Vera Rubin is launching imminently.""",
  ),

  # ── HBM DRAM undersupply thesis ──────────────────────────────────────────
  (
    "Baker X Post — HBM vs DRAM vs NAND Undersupply",
    "2026-02-12",
    "https://x.com/GavinSBaker",
    """HBM DRAM > DRAM > NAND from a long-term undersupply (longest to shortest) and China risk (lowest to highest) perspective.

The equities have traded exactly the opposite way this year.""",
  ),

  # ── Nvidia buying Groq / SRAM decode thesis ───────────────────────────────
  (
    "Baker X Post — Nvidia Acquiring Groq & SRAM Decode Thesis",
    "2025-12-26",
    "https://x.com/GavinSBaker",
    """Nvidia is buying Groq for two reasons.

First, inference is disaggregating into prefill and decode. SRAM architectures have unique advantages in decode for workloads where performance is primarily a function of memory bandwidth. Rubin CPX, Rubin, and the putative "Rubin SRAM" variant derived from Groq should give Nvidia the ability to mix and match chips to create the optimal balance of performance vs. cost for each workload. Rubin CPX is optimized for massive context windows during prefill as a result of super high memory capacity. Rubin is the workhorse for training and high-density batched inference. The Groq-derived "Rubin SRAM" is optimized for ultra-low latency agentic reasoning inference as a result of SRAM's extremely high memory bandwidth.

Second, SRAM architectures can hit token-per-second metrics much higher than GPUs, TPUs, or any ASIC we have yet seen — extremely low latency per individual user at the expense of throughput per dollar. It was less clear 18 months ago whether end users were willing to pay for this speed. It is now abundantly clear from Cerebras and Groq's recent results that users are willing to pay for speed.

This increases my confidence that all ASICs except TPU, AI5, and Trainium will eventually be canceled. Good luck competing with the three Rubin variants and multiple associated networking chips. Cerebras is now in a very interesting and highly strategic position as the last independent SRAM player that was ahead of Groq on all public benchmarks.""",
  ),

  # ── Tesla AI / inference compute thesis ───────────────────────────────────
  (
    "Baker X Post — Tesla AI Capex & Inference Cost Advantage",
    "2025-11-15",
    "https://x.com/GavinSBaker",
    """Tesla's inference definitionally happens in the car so their customers are effectively paying for the inference compute capex — which is now probably the majority of hyperscaler capex spend. Tesla's capex might be an order of magnitude higher if they had to synthetically generate relevant driving data in a datacenter. Customer-subsidized vertical integration is beautiful.

Tesla customers will eventually be able to put their cars into a pool of distributed edge compute and earn money when the car is not driving — same way that Akamai and Cloudflare are putting single GPUs in their edge nodes. The Tesla fleet as the world's largest, most distributed CDN for AI is a real possibility.

Beyond this significant inference cost advantage, Tesla has the second largest coherent Hopper cluster — behind only xAI — in the world for pre-training. Coherent cluster size drives capital efficiency for pre-training. No one has been able to match the xAI and Tesla clusters from a coherence, speed, and cost perspective — coherence being the most important. Tesla also has a significant data advantage for training Chinchilla optimal FSD models as real-world video scales infinitely.

Cost per token is everything for AI. Google is the low cost producer of LLM tokens (with xAI as #2) but Tesla is the lowest cost producer of tokens that matter for FSD and Robotics. AI is the first time in my career that being the low-cost producer has mattered as token quantity effectively drives quality in a reasoning world. This dynamic is very underappreciated by the market.

If LLM inference happened at the edge on phones and PCs as with FSD, hyperscaler capex would be much lower. This is the real risk to datacenter spending. Memory is the biggest winner in this scenario.""",
  ),

  # ── Tariffs and AI datacenters ────────────────────────────────────────────
  (
    "Baker X Post — Tariffs & AI Datacenter Risk",
    "2025-04-03",
    "https://x.com/GavinSBaker",
    """Geopolitically, nothing matters more than winning AI. These tariffs, as constructed, essentially guarantee that America will lose AI by making America the most expensive place on earth to build AI datacenters.

The semiconductor exemption was irrelevant for AI. Datacenter semiconductors come into America in finished goods from Taiwan and other Asian countries: servers, storage systems, and networking switches. By the time we have developed the capacity to domestically produce these systems, we will have lost the AI race.

Best outcome from here would be to quickly cut deals with friendly Asian countries — Japan, Taiwan, South Korea, Thailand, Malaysia, Vietnam, Indonesia. Something like a 10% tariff plus true reciprocal tariffs (which would quickly go to zero) would be reasonable. I was open-minded to tariffs that were thoughtfully constructed, gradually phased in, and accompanied by massive deregulation. The ideal outcome would have been some combination of reshoring, revenue generation, and seeing our largest trading partners lower their barriers to American goods.""",
  ),

  # ── Foundation Models / Game of Emperors (2023) ───────────────────────────
  (
    "Baker X Post — Foundation Models & Game of Emperors",
    "2023-11-04",
    "https://x.com/GavinSBaker",
    """Foundation models without significant RLHF and access to high-quality proprietary datasets are likely the fastest depreciating assets in human history.

I think only four are likely to have enduring value and transition into "Foundation Agents": ChatGPT, Gemini, Grok/Tesla/X, and Llama. ChatGPT by virtue of RLHF and Microsoft's various datasets plus access to closed internal data at most enterprises via CoPilot. Gemini by virtue of RLHF via the SGE and Google's many datasets (YouTube transcripts, Gmail). Grok by virtue of RLHF via inclusion in X's premium tier and access to X's real-time data. Llama is the only open-source model on the list with the widest range of outcomes.

This isn't a "Game of Kings." This is a "Game of Emperors." The most efficient Emperor is likely going to be the ultimate winner — infrastructure efficiency might be the single most important deciding factor as even a 20-30% efficiency advantage might be decisive in the context of hundreds of billions in capex.

Key assumption underpinning all of this is that scaling laws will continue such that "intelligence is an engineering problem." Nvidia is a wildcard — they would like more than four dominant Foundation Models in the same way they want more than a few cloud computing providers.""",
  ),

  # ── GPU rental prices / valuation attractive ──────────────────────────────
  (
    "Baker X Post — GPU Rental Prices & Tech Valuations",
    "2026-03-30",
    "https://x.com/GavinSBaker",
    """Risk/reward seems attractive: token consumption accelerating, GPU per hour rental prices going vertical, and tech valuations are broadly below their COVID and DeepSeek lows.

Some high-quality secular growth names are at mid-single digit multiples on real 2027/2028 numbers.""",
  ),

  # ── FT article math error / GPU economics ─────────────────────────────────
  (
    "Baker X Post — FT GPU Bubble Article Math Error",
    "2025-10-19",
    "https://x.com/GavinSBaker",
    """The FT wrote an article about how current GPU rental prices suggest AI is a bubble, but made a math error such that all of their calculations were off by a factor of 8 by conflating per-server and per-GPU economics.

Doing the math correctly was actually reasonably bullish for the "subscalers" and super bullish for the hyperscalers. The article is ironically another positive indicator for GPU residual values.""",
  ),

  # ── TSMC capacity discipline ──────────────────────────────────────────────
  (
    "Baker X Post — TSMC Capacity Discipline",
    "2026-06-04",
    "https://x.com/GavinSBaker",
    """TSMC management's capacity discipline — whether organic or self-imposed — is good for everyone. We want a smoother for longer cycle. An overbuild and/or a bubble would be terrible.

There are 100,000 births per year in Taiwan and TSMC needs to hire 10,000 people per year in Taiwan, a number which will only grow. Continued expansion in the United States is likely inevitable, especially given immense willingness to pay a premium for American wafers.""",
  ),

  # ── AI productivity / revenue per employee ────────────────────────────────
  (
    "Baker X Post — AI Productivity & Revenue Per Employee",
    "2026-01-30",
    "https://x.com/GavinSBaker",
    """Revenue per employee up 75% for the top decile of AI/software companies in 2025. Probably doesn't slow down in 2026 given the December revolution in AI coding agents.

The higher semiconductor intensity of AI is underappreciated and will be increasingly important. Stock market and job openings were highly correlated for decades — no longer. Stock market up 75% and job openings down 33% since 2022. This is at least partially due to AI.""",
  ),

  # ── Networking / optics thesis ────────────────────────────────────────────
  (
    "Baker X Post — Networking & Optics in AI Datacenters",
    "2026-04-15",
    "https://x.com/GavinSBaker",
    """Networking, especially switched scale-up networking, should be the fastest growing part of the datacenter for the next several years. Coherent training clusters are increasing in size to enable ever larger models — a larger coherent cluster is much more networking intensive. And then the larger models trained on these larger clusters require larger switched scale-up domains to inference economically, which is again more networking intensive.

Switched scale-up networking (almost all copper with some optical beginning late next year) > scale across (optical obviously) > scale-out (first place for CPO) from a growth perspective next three years. We will be using copper well into the 2030s and somewhat ironically the growth of optical is likely to drive accelerated growth for copper in the near term.

Optics is the next memory. PICs (photonic ICs) feel similar to RF in the early days of cellular — quite a bit of black magic. There are only a few companies successfully supplying datacom PICs at scale today. Silicon Photonics and PICs essentially create another axis for scaling bandwidth. Long-term, Silicon Photonics is essential for CPO.

GPU financing rates are meaningfully impacted by expected useful life — this likely ends up being a significant advantage for the big green GPU incumbent over time. The interest rates at which various chips — GPU or ASIC — can be financed as a function of expected useful life will have real implications for demand.""",
  ),

  # ── GB300 / Rubin capability leap ────────────────────────────────────────
  (
    "Baker X Post — GB300 & Rubin Capability Leap",
    "2025-12-02",
    "https://x.com/GavinSBaker",
    """The next 12 months might be different as the GB300 finally ramps. And then Rubin.

Models trained and then inferenced on these GPUs are likely to show a dramatic leap in capability. I think we see the first significant AI scientific breakthrough and the first economically useful agents outside of coding as a result. And the lower per-token cost enabled by the GB300 and then Rubin will help democratize AI.""",
  ),

  # ── Nvidia hyperscaler revenue data point ────────────────────────────────
  (
    "Baker X Post — Nvidia & Broadcom AI Revenue Growth",
    "2024-06-01",
    "https://x.com/GavinSBaker",
    """Nvidia's "AI hyperscaler" revenue grew 191% YoY in the April quarter ex-China (effectively all hyperscaler).

Broadcom has guided to 143% YoY growth for their AI segment in their next quarter.

Interesting.""",
  ),

  # ── Bubble comparison: AI vs quantum/nuclear ──────────────────────────────
  (
    "Baker X Post — AI vs Quantum/Nuclear Bubble Comparison",
    "2025-11-15",
    "https://x.com/GavinSBaker",
    """It is strange to me that anyone is focused on AI as a potential bubble when quantum and nuclear are clearly in bubbles with zero fundamental support of any kind.

Sam Altman's manifestly ridiculous $1 trillion of spending commitments shifted the AI investing landscape. The market is more skeptical now. Ironically this makes an IPO harder for OpenAI. It also likely ended any potential for a 1999-style melt-up, which is healthy.

The supply response in AI cannot happen quickly. Leading-edge wafers and power are both structurally constrained and neither can be turned on in a matter of months. Back in 2000, supply could largely keep up with demand because there was massive underutilized wafer capacity coming out of the 1998 Asian crisis. The relatively quick supply response led to an overbuild, which caused the crash. There is no comparable slack in the system today. And obviously the largest buyers of compute will have no trouble servicing their debt.""",
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
                "quality_score": 0.9,
            })

        sb.table("baker_chunks").insert(rows).execute()
        print(f"  Inserted {len(rows)} rows.")
        time.sleep(0.5)

    print("Done!")

if __name__ == "__main__":
    main()
