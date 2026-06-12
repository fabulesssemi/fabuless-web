"""
Ingest ALL Baker tweet content — including short snippets with inference context.
Every sentence Baker writes is signal. Short quotes are kept and annotated
so the lens can make inferences from them.

Run: COHERE_API_KEY=... SUPABASE_URL=... SUPABASE_SERVICE_KEY=... python3 scripts/ingest_baker_tweets_v2.py
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

  # ── Token producer/consumer framing ──────────────────────────────────────
  (
    "Baker X Post — Token Producer vs Consumer Framing (GTC 2026)",
    "2026-04-13",
    "https://x.com/GavinSBaker",
    """Baker at Nvidia GTC stated: "You're either a token producer or a token consumer."

This framing reflects his core view that tokens are literally revenue — the fundamental unit of economic value in the AI era. Every company will eventually be categorized by whether they produce tokens (semiconductor companies, cloud providers, AI labs) or consume them (enterprises, end users). Token producers capture value upstream; token consumers capture value through productivity gains downstream. Baker has said he profoundly believes this to be true. The implication for investors: companies that can produce tokens at the lowest cost per token have structural pricing power in the AI economy.""",
  ),

  # ── Chinese silicon capability signal ────────────────────────────────────
  (
    "Baker X Post — Chinese Silicon Capability (Qwen/Alibaba)",
    "2026-05-27",
    "https://x.com/GavinSBaker",
    """When Alibaba's Qwen team posted about Qwen3.5 reaching 580 tokens per second for agentic workloads on the TokenSpeed engine using Nvidia infrastructure, Baker commented: "Tells you a lot about the reality of Chinese silicon IMO."

Baker's inference: the fact that Alibaba's best AI results still require Nvidia hardware — rather than Huawei or domestic Chinese chips — reveals that Chinese domestic silicon remains significantly behind American alternatives for frontier AI workloads. This supports his broader view that selling deprecated GPUs to China (like the B30) is pro-American, because denying them forces China to develop an entirely separate chip ecosystem that could eventually surpass Nvidia on a different power-intensive tech tree. Chinese silicon capability matters enormously for export control policy and the long-term competitive dynamics of AI.""",
  ),

  # ── Qwen/Chinese open source as signal for Blackwell gap ─────────────────
  (
    "Baker X Post — Composer 2.5 / Grok Scale Signal",
    "2026-05-27",
    "https://x.com/GavinSBaker",
    """Baker on Composer 2.5 being Pareto dominant in coding per CursorBench: "This is after only a few weeks of supplemental training and/or RL in the Colossus 2 cluster. The 1.5 trillion parameter version of Grok will likely be a much better base model than Kimi. We shall see."

Baker's inference: the speed at which xAI's models improve with minimal additional training on Colossus 2 is evidence that large coherent clusters produce compounding returns on capability — a few weeks of RL on a world-class cluster produces benchmark-leading results. This validates his thesis that coherent cluster size is the most important variable in AI training, and that xAI's infrastructure position (second largest coherent cluster behind only Tesla internally) gives them a durable competitive advantage in model quality.""",
  ),

  # ── GPU financing rates signal ────────────────────────────────────────────
  (
    "Baker X Post — GPU Financing Rates & Useful Life Advantage",
    "2026-05-20",
    "https://x.com/GavinSBaker",
    """Baker: "The interest rates at which various chips — GPU or ASIC — can be financed as a function of expected useful life will have real implications for demand. Likely ends up being a significant advantage for the big green GPU incumbent over time."

Baker's inference: because Nvidia GPUs have demonstrated longer useful lives than expected (H100s still fully utilized 4 years after release, A100s still generating strong cash margins 6 years out), their residual values are higher than the market previously assumed. This means GPU financing costs should continue to fall — 100-200bps lower — while ASIC financing costs remain high because ASICs designed for a single model or application have shorter useful lives given the current pace of AI change. Lower financing costs structurally advantage Nvidia over custom silicon competitors in the total cost of ownership calculation for hyperscalers and cloud providers.""",
  ),

  # ── Nemotron / American open source ──────────────────────────────────────
  (
    "Baker X Post — Nemotron 3 Ultra & American Open Source",
    "2026-06-06",
    "https://x.com/GavinSBaker",
    """Baker: "Quite a week for open-source AI. Especially American open-source. Nemotron 3 Ultra is the most important release in quite some time. And some really cool RL and fine-tuning work from Harvey."

Baker's inference: American open-source AI is progressing rapidly and should not be dismissed. Nemotron 3 Ultra from Nvidia signals that Nvidia is investing seriously in the model layer, not just hardware — a strategic move that strengthens the overall Nvidia ecosystem. The Harvey fine-tuning work is evidence that domain-specific RL on top of frontier models is creating real enterprise value, which validates the "token consumer" productivity thesis.""",
  ),

  # ── We need to change China GPU policy ───────────────────────────────────
  (
    "Baker X Post — US China GPU Policy Urgency",
    "2026-05-29",
    "https://x.com/GavinSBaker",
    """Baker: "We need to change our policies on China and GPUs."

This is a direct statement reflecting his strongly held view that current US GPU export controls toward China are counterproductive. His argument: denying China access to deprecated American GPUs (like the B30) incentivizes China to build its own semiconductor ecosystem on a different technological path — specifically optical scale-up networking leveraging China's power surplus. If China succeeds in building a competitive alternative ecosystem, Chinese frontier models will stop running well on American hardware, removing a key point of American leverage and control. Baker believes selling deprecated GPUs to China actually cements American technological dominance because it keeps Chinese AI dependent on American infrastructure standards.""",
  ),

  # ── TSMC CEO pushback / capacity discipline ───────────────────────────────
  (
    "Baker X Post — TSMC CEO & Capacity Discipline",
    "2026-06-04",
    "https://x.com/GavinSBaker",
    """After TSMC's CEO pushed back on Baker's characterization of their bottlenecks as self-imposed (clarifying they are organic constraints), Baker responded: "I believe I said 'tough, flinty, disciplined' rather than stubborn. I deeply admire TSM management and believe their capacity discipline, whether organic or self-imposed, is good for everyone. We want a smoother for longer cycle. An overbuild and/or a bubble would be terrible. We need to get C.C. on X!"

Baker's inference: whether TSMC's constrained capacity expansion is a deliberate strategic choice or an organic limitation of workforce and equipment availability is secondary to the outcome — it prevents the AI buildout from accelerating into an overbuild. Baker has repeatedly stated that TSMC's "flinty" management is one of the key structural reasons this AI cycle will be smoother and longer than prior technology cycles, unlike the telecom buildout of the late 1990s where unconstrained supply led directly to the crash.""",
  ),

  # ── Investing near market lows ────────────────────────────────────────────
  (
    "Baker X Post — Calling Market Lows (May 2026)",
    "2026-05-21",
    "https://x.com/GavinSBaker",
    """Baker referenced three posts from 5/11/22, 4/1/25, and 3/31/26 that "aged ok" — all were either near a low or at the low. He noted this in response to critics questioning his market calls.

Baker's inference on market timing: he does not claim to be a precise market timer but notes a consistent pattern of being constructive near significant lows. His broader philosophy (from multiple posts and Medium articles) is that "time in the market is more important than timing the market" and that expressing a cautious view near tops and a constructive view near bottoms, even if imprecise, is a better framework than attempting precise timing. Risk/reward and valuation relative to long-run earnings power matter more than predicting exact turning points.""",
  ),

  # ── Sam Altman $1T spending / AI non-bubble ───────────────────────────────
  (
    "Baker X Post — Sam Altman Spending & AI Non-Bubble",
    "2025-11-15",
    "https://x.com/GavinSBaker",
    """Baker: "Sam Altman's manifestly ridiculous $1 trillion of spending commitments shifted the AI investing landscape. The market is more skeptical now. Ironically makes an IPO harder for them. Also likely ended any potential for a 1999-style melt-up which is healthy."

Baker's inference: OpenAI's unfunded $1 trillion commitment was a strategic mistake that damaged investor confidence in AI broadly without any fundamental justification. However, the resulting market skepticism is actually healthy — it reduces the odds of a speculative bubble forming in AI equities, which Baker believes would ultimately be damaging. His view is that the underlying AI ROI story is real and strong, and a market that prices it more carefully is better for the long-term durability of the cycle than one driven by hype. OpenAI has lost model quality leadership for the first time (now third behind Google and xAI) while also having made this strategic communications error.""",
  ),

  # ── Kioxia / Apple NAND management ───────────────────────────────────────
  (
    "Baker X Post — Apple NAND Management vs Kioxia",
    "2025-11-14",
    "https://x.com/GavinSBaker",
    """Baker: "Kioxia signing an LTA with Apple right before spot prices went vertical is a little funny. Apple is so good at managing their DRAM and NAND exposure."

Baker's inference: Apple's supply chain management in memory and storage is exceptional — they consistently time long-term agreements to lock in favorable pricing just before spot markets tighten. This reflects Apple's enormous purchasing power and sophisticated procurement operation. For memory companies like Kioxia (NAND) and the DRAM suppliers, Apple's ability to lock in LTAs at trough pricing means the upside from spot price increases accrues less to Apple and more to spot buyers and other customers. Baker's broader memory hierarchy view: HBM DRAM has the longest structural undersupply and lowest China risk, followed by DRAM, then NAND.""",
  ),

  # ── Space datacenters ─────────────────────────────────────────────────────
  (
    "Baker X Post — Space Datacenters & Elon's Physics Analysis",
    "2026-01-15",
    "https://x.com/GavinSBaker",
    """Baker defended Elon Musk's assertion that space-based datacenters are viable: "If you are not currently operating a large AI datacenter, a large satellite cluster, and have not landed a rocket, maybe be a little less quick to confidently assume that Elon and Google are both wrong on this topic."

Baker noted: Starlink v3 will be 20 kilowatts. Elon's stated plan is 100 kilowatts for each AI satellite — slightly less than a full Blackwell rack. Starship should be able to lift 10-15 megawatts to sun-synchronous orbit per flight. Inference will likely be the primary use case.

Baker's inference: the economics of space-based inference compute will be driven by access to cheap solar power and the ability to move workloads to where electricity is available and unconstrained — the same logic behind his broader thesis on power scarcity as the binding constraint on AI buildout. A working small datacenter in space already exists (Starcloud's orbital setup trained an LLM). Baker is biased given Atreides investments but his framework is consistent: tokens per watt per dollar is everything, and solar-powered orbital compute eliminates the terrestrial power constraint entirely.""",
  ),

  # ── Value/macro investors on AI ───────────────────────────────────────────
  (
    "Baker X Post — Value Investors Making AI Calls",
    "2025-11-12",
    "https://x.com/GavinSBaker",
    """Baker: "Why are value and macro investors so comfortable making highly confident prognostications about AI despite their manifest ignorance? I don't recall many tech/growth investors penning long, bearish, highly confident and utterly ignorant analyses about energy in 2022/2023."

Baker's inference: the loudest skeptics of AI's economic impact are systematically the least qualified to assess it. Investors without hands-on exposure to AI infrastructure, semiconductor supply chains, or software productivity are making categorical claims about AI being a bubble based on surface-level valuation concerns — the same kind of error that would have caused someone to miss the entire cloud computing buildout by looking only at AWS capex vs. near-term revenue. Baker's consistent framework: trust the engineers and operators closest to the technology, not macro tourists.""",
  ),

  # ── Higher semiconductor intensity of AI ─────────────────────────────────
  (
    "Baker X Post — Semiconductor Intensity of AI (2020)",
    "2020-07-19",
    "https://x.com/GavinSBaker",
    """Baker in 2020: "The higher semiconductor intensity of AI is underappreciated and will be increasingly important."

This was an early signal of his core thesis — that AI workloads require dramatically more compute per dollar of economic output than prior software generations. This view, stated in 2020 before the generative AI wave, underpins his long-running bullishness on semiconductor companies exposed to AI infrastructure. The implication: every dollar of AI-driven GDP growth requires significantly more semiconductor content than the equivalent dollar of traditional software GDP growth, creating a structural tailwind for the entire semiconductor supply chain — from leading-edge logic (TSMC, Nvidia) to memory (HBM, DRAM) to networking and packaging.""",
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
