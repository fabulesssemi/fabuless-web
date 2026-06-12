"""
Ingest baker_tweets_2.txt content into baker_chunks.
Run: COHERE_API_KEY=... SUPABASE_URL=... SUPABASE_SERVICE_KEY=... python3 scripts/ingest_baker_tweets_v3.py
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

  # ── Google search share / GenAI expanding market ──────────────────────────
  (
    "Baker X Post — Google Search Share & GenAI Expanding Market (Oct 2025)",
    "2025-10-10",
    "https://x.com/GavinSBaker",
    """Baker in Oct 2025: "Google gaining search share two months in a row. Overall search instances accelerating from 3% YoY growth in October 2024 to 27% in September 2025 as GenAI expands the market. Funny relative to the hysteria earlier this year."

Earlier in Feb 2024, Baker had described ChatGPT as a "Pearl Harbor moment" for Google, saying Gemini 1.5 Pro felt like "Doolittle's Raid" — one eye opening. By October 2025 he noted Google had fully woken up. This is an important evolution: Baker's early concern that ChatGPT would structurally damage Google search has been replaced by the view that GenAI is actually expanding the total search market, with Google recapturing and growing share. The implication: platform incumbents with distribution and data often absorb would-be disruptors — the same pattern seen with mobile and social media.""",
  ),

  # ── A100/H200 pricing up after Blackwell ──────────────────────────────────
  (
    "Baker X Post — H200 & A100 Pricing Rising Post-Blackwell (Oct 2025)",
    "2025-10-08",
    "https://x.com/GavinSBaker",
    """Baker in Oct 2025: "Amazon raising Blackwell per hour pricing. H200 rental pricing going up after Blackwell scale deployments ramping up. Might be important."

He also noted: "Lower A100 availability today post-Blackwell vs the beginning of the year — maybe most interesting. Those 5-6 year depreciation schedules looking much more solid. And every private credit fund that invested in GPU financing is feeling good."

Baker's inference: the fact that older GPU rental prices are rising even as Blackwell ramps is the strongest possible confirmation of his GPU useful life thesis. In a normal technology cycle, new hardware commoditizes old hardware and rental prices fall. The opposite is happening — demand for tokens is growing faster than total GPU supply even as the newest, most capable GPUs come online. This means the AI buildout is genuinely supply-constrained, not demand-constrained, and that GPU residual values will remain strong for years longer than depreciation schedules imply.""",
  ),

  # ── Prefill/decode as distinct markets ────────────────────────────────────
  (
    "Baker X Post — Prefill & Decode as Distinct Markets (Aug 2025)",
    "2025-08-21",
    "https://x.com/GavinSBaker",
    """Baker in Aug 2025: "Increasingly convinced that prefill and decode will emerge as distinct markets within inference. Different systems will be used for each; obviously they will have to work together. Probably 18 months away."

Baker's inference: the disaggregation of inference into prefill (context processing, compute-intensive, benefits from high memory capacity) and decode (token generation, bandwidth-intensive, benefits from SRAM or high memory bandwidth) will create two distinct hardware markets. This is why Nvidia is building multiple Rubin variants — Rubin CPX for prefill, standard Rubin for training and batched inference, and a Groq-derived SRAM variant for low-latency decode. The implication for ASICs: a custom chip optimized for one part of inference may be genuinely competitive in that specific workload, even if it cannot compete across the full inference stack. However, Nvidia's ability to offer all three variants within a unified NVLink ecosystem is a durable advantage.""",
  ),

  # ── ASIC bear case: architectural changes ─────────────────────────────────
  (
    "Baker X Post — Architectural Changes as ASIC Bear Case",
    "2025-04-01",
    "https://x.com/GavinSBaker",
    """When discussing a new diffusion-based LLM architecture (models that denoise all tokens simultaneously rather than generating left-to-right like autoregressive models), Baker commented: "Architectural/algorithmic changes like this are the bear case for ASICs."

Baker's inference: ASICs are optimized for specific model architectures. If the dominant model architecture shifts — from autoregressive transformers to diffusion models, or from dense models to MoE, or from pre-training to test-time compute — ASICs built for the old architecture become significantly less valuable. This is a key structural risk to custom silicon programs at Microsoft, Meta, and other hyperscalers. GPUs, being more programmable and flexible, can adapt to architectural changes without a full redesign cycle. This is one reason Baker expects most ASIC programs (except TPU, Trainium, and Dojo) to eventually be cancelled — the pace of architectural change makes specialized hardware a risky bet.""",
  ),

  # ── Inference-first world: Ferraris vs Hondas ─────────────────────────────
  (
    "Baker X Post — Inference-First World & Pre-Training Shift (Feb 2025)",
    "2025-02-22",
    "https://x.com/GavinSBaker",
    """Baker on the shift from pre-training to inference-first AI: "Shifting from a pre-training centric world to an inference-centric world is likely positive for compute overall. Intelligence may scale even better with test-time compute (inference) than it does with pre-training."

His framework: more 50-100 megawatt datacenters geospatially and cost-optimized for inference ("Hondas"). Fewer 1 gigawatt-plus datacenters with the networking, storage, and cooling necessary for coherent pre-training clusters ("Ferraris"). The number of companies doing pre-training in a Ferrari likely steadily shrinks over time.

Satya Nadella essentially confirmed this view by signaling a shift away from pre-training focused compute to inference-optimized compute. Baker's implication: instead of a 50/50 split between pre-training and inference compute, the world moves to roughly 5/95. Total compute demand may be even higher than in the pre-training-centric scenario because test-time compute means compute is literally intelligence — but it is a very different kind of compute, in smaller, geographically distributed facilities optimized for low latency and cost-effective power.""",
  ),

  # ── Only 2-3 companies will pre-train frontier models ─────────────────────
  (
    "Baker X Post — Only 2-3 Frontier Pre-Trainers, Unique Data (Feb 2025)",
    "2025-02-22",
    "https://x.com/GavinSBaker",
    """Baker in Feb 2025: "Frontier models without access to unique, valuable data are the fastest depreciating assets in history. Distillation only amplifies this. There may not be any ROI on future frontier models that do not have access to unique, valuable data like YouTube, X, TeslaVision, Instagram and Facebook."

His conclusion: only 2-3 companies will be pre-training frontier models going forward. The rest of AI compute would be smaller datacenters geospatially optimized for low-latency or cost-effective inference.

Medium confidence hypothesis on ASIC survival: "In 3 years Trainium, TPU and Dojo will be the only ASICs left standing."

Baker's inference on OpenAI: OpenAI had roughly 7 quarters of dominance (summer 2022 through spring 2024). Being first to reasoning with o1 only led to a few months of advantage. Deepseek, Google, and xAI are at rough parity with OpenAI today. Microsoft is likely to shift investments away from pre-training focused compute to inference-optimized compute and may eventually use an open-source model to power CoPilot. Unique data — YouTube, X, TeslaVision, Instagram, Facebook — may be the only durable basis for frontier model differentiation.""",
  ),

  # ── H20 vs B200 / China chip export nuance ────────────────────────────────
  (
    "Baker X Post — H20 vs B200 & China Chip Policy Nuance (Aug 2025)",
    "2025-08-12",
    "https://x.com/GavinSBaker",
    """Baker: "Any journalist describing Nvidia H20 as an 'advanced chip' is not a serious person. The H20 is circa 4 years behind the actually advanced B200. The B200 has 30x more compute, 2x the memory bandwidth and 2x the memory of the H20. Arguably 100x more usable compute."

His policy argument: "Selling H20s to China is good policy as they are slightly (1.25x) better than domestic Chinese AI accelerators. Selling the H20 thus effectively slows down the development of a robust domestic Chinese AI accelerator ecosystem. In the event of conflict, we would simply stop selling H20s to China and they would be left with inferior domestic alternatives and America would have a 5-6 year technology advantage."

The fact that the Chinese government is discouraging use of H20s in favor of domestic alternatives "should tell a rational dispassionate observer all they need to know about which country benefits from the sale of H20s in China." Baker's consistent position: selling deprecated American GPUs to China during peacetime is pro-American national security policy because it keeps China dependent on American hardware standards and prevents them from building a fully independent AI chip ecosystem.""",
  ),

  # ── Intel: board is the problem ───────────────────────────────────────────
  (
    "Baker X Post — Intel Management Problem (Aug 2025)",
    "2025-08-08",
    "https://x.com/GavinSBaker",
    """Baker in Aug 2025: "The board is the management problem at Intel, not the CEO."

This represents an evolution from his earlier Intel investment thesis. Baker had previously written a detailed Medium post about his Intel mistake — buying the stock in June 2020 based on a belief that 10nm++ would work and that Intel's "exorbitant privilege" (software optimized for their architecture) would sustain them. He called it one of his biggest mistakes of commission after the 7nm delay was revealed. By 2025 his view had evolved further: the problem at Intel is governance (the board) rather than execution (the current CEO). Baker's implication: Intel's recovery potential depends more on board-level strategic clarity than on any individual management hire.""",
  ),

  # ── Low cost token producers: Google & xAI ────────────────────────────────
  (
    "Baker X Post — Low Cost Token Producers: Google & xAI (Jul 2025)",
    "2025-07-10",
    "https://x.com/GavinSBaker",
    """Baker in July 2025: "Given the massive and increasing importance of test-time compute and post-training RL shown by Grok-4's absolute dominance, being the low cost producer of tokens is more important than ever. This is the first time in my career as a tech investor that being the low cost producer of anything has mattered."

"Today, the lowest cost producers of tokens are Google (TPUs) and xAI (largest coherent cluster, lowest capex per deployed GPU, almost certainly highest MFU and have made some really smart architectural decisions)."

Key technical factors for token cost leadership: "Having the best scale-up networking and most efficient KV cache offload are most important to both cost and latency for increasingly large models and context windows. These are the most important axes of competition in AI infrastructure today — not compute. On-package memory bandwidth is most important when you can fit the model on a single chip, but for any really large model requiring multiple packages, scale-up and KV cache offload are most important."

Nvidia's Dynamo and open-sourcing NVLink were both important and smart moves — the latter could increasingly lead to ASIC share migrating to NVLink partners.""",
  ),

  # ── Grok-4 / Google dominance shattered ──────────────────────────────────
  (
    "Baker X Post — Google AI Dominance Shattered by Grok-4 (Sep 2025)",
    "2025-09-21",
    "https://x.com/GavinSBaker",
    """Baker in Sep 2025: "Google's dominance of the Pareto frontier for AI has been shattered."

This is a notable evolution from his Feb 2026 post where he described Google (Gemini 3) and xAI (Grok 4.1) as clearly the best models. Between September 2025 and February 2026, xAI and Google traded leadership at the frontier. Baker's consistent view: the frontier model race is dynamic and multi-player. First-mover advantages in model quality erode quickly — OpenAI had 7 quarters of dominance, Google's post-Gemini 3 dominance lasted months before xAI surpassed it with Grok-4. Baker's inference: model quality leadership is not a durable moat on its own; the durable moats are unique data, infrastructure efficiency (lowest cost per token), and distribution.""",
  ),

  # ── AI will help large companies more than long tail ─────────────────────
  (
    "Baker X Post — AI Consolidates Value to Large Players (Aug 2025)",
    "2025-08-22",
    "https://x.com/GavinSBaker",
    """Baker in Aug 2025: "The internet helped the long tail. AI will be the opposite for the next 3-5 years."

Baker's inference: the internet democratized distribution and allowed niche creators, small businesses, and long-tail content to reach audiences that were previously impossible to reach economically. AI is doing the opposite — it is consolidating value to large players with unique data, distribution, and infrastructure efficiency. The companies that will benefit most from AI over the next 3-5 years are those with the most proprietary data (Google, Meta, xAI/X, Tesla), the largest coherent compute clusters, and the widest distribution for deploying inference at scale. Small companies and content creators face a more competitive environment as AI lowers the cost of producing what they produce, while large incumbents use AI to dramatically increase productivity.""",
  ),

  # ── Market cap / CoWoS allocation signal ──────────────────────────────────
  (
    "Baker X Post — CoWoS Allocation as Valuation Signal (Aug 2025)",
    "2025-08-17",
    "https://x.com/GavinSBaker",
    """Baker in Aug 2025: "Market cap divided by CoWoS allocation is interesting. Generally takes three generations for an ASIC to get real traction."

Baker's inference: CoWoS (Chip on Wafer on Substrate) is TSMC's advanced packaging technology required for HBM memory integration on high-end AI chips. A company's allocated CoWoS capacity is a proxy for how seriously TSMC and the ecosystem view their AI chip roadmap. Market cap divided by CoWoS allocation is a rough valuation sanity check — companies with large market caps but small CoWoS allocations may be overvalued on their AI chip ambitions. The "three generations" observation is important for ASIC investors: custom silicon programs rarely produce competitive chips on the first or second try. Patience is required, and most programs get cancelled before reaching generation three.""",
  ),

  # ── Grok-4 models / first Blackwell model prediction ─────────────────────
  (
    "Baker X Post — First Blackwell-Trained Model Prediction (Aug 2025)",
    "2025-08-14",
    "https://x.com/GavinSBaker",
    """Baker in Aug 2025: "Important to remember that Grok-4, GPT5, Opus 4.1 were all trained on Hopper GPUs. Excited to see the first models trained on Blackwell over the next six months. I am highly confident the first Blackwell model will come from xAI. Note that I am biased here — time will tell."

Baker's inference: the models available in mid-2025 — which represented the state of the art — were all trained on Hopper-generation hardware. Blackwell represents a massive step-up in coherent cluster size and compute density. If scaling laws hold (which Baker believes they will, given Gemini 3 results), models trained on Blackwell should show a dramatic capability leap relative to Hopper-trained models. He is biased toward xAI being first given Atreides investments in xAI, but the broader point is that the capability jumps from Blackwell-trained models are likely to be the most significant AI datapoint of 2025-2026.""",
  ),

  # ── Microsoft ASIC skepticism ──────────────────────────────────────────────
  (
    "Baker X Post — Microsoft ASIC vs Rubin (Jun 2025)",
    "2025-06-27",
    "https://x.com/GavinSBaker",
    """Baker in June 2025: "If the Microsoft ASIC underperforms the 2024-era Blackwell when it is released in 2026, imagine how it will fare vs. Rubin."

Baker's inference: Microsoft's custom AI accelerator (Maia) faces a nearly impossible competitive bar. By the time it reaches production and achieves meaningful scale (likely 2026-2027), Nvidia will have shipped Rubin — a dramatic improvement over Blackwell. Microsoft's ASIC is being designed and optimized against today's Blackwell baseline, but it will be deployed into a world where Rubin exists. This is the fundamental problem with all non-hyperscaler ASIC programs: the design cycle is 2-3 years, and Nvidia advances by 2-3 generations in that time. Only Google's TPU, Amazon's Trainium, and possibly Tesla's Dojo have the organizational scale and iteration speed to keep pace.""",
  ),

  # ── Apollo private equity return metrics ──────────────────────────────────
  (
    "Baker X Post — Private Equity vs S&P 500 Return Metrics (Jun 2025)",
    "2025-06-26",
    "https://x.com/GavinSBaker",
    """Baker on Apollo's marketing materials: "'Average annualized return' is a meaningless, made-up metric that has nothing to do with performance. On a compounded basis — i.e. annualized returns i.e. the metric that matters for any investor in the solar system — the S&P 500 is outperforming Private Equity and Private Credit over the last 5 years and is in-line to ahead over the last 10 years."

Baker's inference: this reflects his broader investment philosophy — returns must be measured correctly. Compounded annualized return (CAGR) is the only metric that matters for investors. "Average annualized return" (arithmetic average) systematically overstates performance because it ignores the compounding drag of down years. Baker's framework: always ignore metrics that don't reflect actual investor experience. The same rigor applies to software company metrics — ignore LTV calculations, focus on gross profit dollar payback periods. Focus on numbers that reflect economic reality.""",
  ),

  # ── Compute-in-memory / memory wall ───────────────────────────────────────
  (
    "Baker X Post — Compute-in-Memory & Memory Wall (Feb 2025)",
    "2025-02-05",
    "https://x.com/GavinSBaker",
    """Baker in Feb 2025: "Really cool — had not seen the 'Accelerator in Memory' and fully agree that compute-in-memory may be the ideal solution to the memory wall."

Baker's inference: the "memory wall" — the growing bottleneck between compute and memory bandwidth — is one of the most fundamental constraints in AI hardware. As models get larger and inference becomes the dominant workload, moving data between compute (GPU cores) and memory (HBM) at sufficient speed becomes the binding constraint. Compute-in-memory architectures (processing data where it is stored, rather than shuttling it back and forth) could dramatically alleviate this bottleneck. Baker views this as a potentially important architectural direction, consistent with his broader thesis that memory bandwidth and KV cache efficiency are the most important axes of AI infrastructure competition today.""",
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
