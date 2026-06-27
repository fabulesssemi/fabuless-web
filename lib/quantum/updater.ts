import Anthropic from "@anthropic-ai/sdk";
import { revalidatePath } from "next/cache";
import { fetchQuantumNewsItems } from "./sources";
import { QUANTUM_KEYWORDS, QUANTUM_COMPANIES } from "./companies";
import { saveQuantumArticles, loadQuantumArticlesFromDB } from "./db";
import type { QuantumArticle } from "./articles";

const TARGET_ARTICLES = 24;
const MAX_CANDIDATES = 60;

function sleep(ms: number) { return new Promise((r) => setTimeout(r, ms)); }

async function imageIsAccessible(url: string): Promise<boolean> {
  try {
    const res = await fetch(url, { method: "HEAD", signal: AbortSignal.timeout(4000) });
    return res.ok && (res.headers.get("content-type") ?? "").startsWith("image/");
  } catch { return false; }
}

async function imageIsHeroQuality(url: string): Promise<boolean> {
  try {
    const res = await fetch(url, { method: "HEAD", signal: AbortSignal.timeout(4000) });
    const ct = res.headers.get("content-type") ?? "";
    if (!res.ok || !ct.startsWith("image/")) return false;
    const size = parseInt(res.headers.get("content-length") ?? "0", 10);
    return size === 0 || size >= 60_000;
  } catch { return false; }
}

function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 60);
}

const TOO_TECHNICAL = [
  "arxiv", "preprint", "lattice qcd", "hamiltonian", "fidelity threshold",
  "variational quantum eigensolver", "vqe", "ansatz", "hilbert space",
  "qubit coherence time", "t1 time", "t2 time", "gate fidelity",
  "density matrix", "bloch sphere", "pauli", "clifford circuit",
];

function isQuantumRelevant(title: string, description: string): boolean {
  const text = `${title} ${description}`.toLowerCase();
  if (TOO_TECHNICAL.some((t) => text.includes(t))) return false;
  return QUANTUM_KEYWORDS.some((kw) => text.includes(kw.toLowerCase()));
}

function detectCompanies(text: string): string[] {
  const lower = text.toLowerCase();
  return QUANTUM_COMPANIES
    .filter((c) => lower.includes(c.ticker.toLowerCase()) || lower.includes(c.name.toLowerCase()))
    .map((c) => c.ticker);
}

function diversify(
  items: { source: string; [k: string]: unknown }[],
  target: number,
  maxPerSource = 2,
): typeof items {
  const sourceCounts = new Map<string, number>();
  const result: typeof items = [];
  for (let pass = 1; pass <= maxPerSource && result.length < target; pass++) {
    for (const item of items) {
      if (result.length >= target) break;
      const src = item.source.toLowerCase().trim();
      if ((sourceCounts.get(src) ?? 0) === pass - 1) {
        result.push(item);
        sourceCounts.set(src, (sourceCounts.get(src) ?? 0) + 1);
      }
    }
  }
  return result;
}

async function analyzeArticle(
  title: string,
  description: string,
  source: string,
): Promise<{ summary: string; category: QuantumArticle["category"] }> {
  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  const prompt = `You are an editor at Fabuless Quantum. Your audience is everyday people just getting into quantum — curious, smart, but NOT researchers or engineers. Think: someone who reads about tech stocks and wants to understand what's happening in quantum before it goes mainstream.

The site covers three lanes equally:
1. INVESTING: quantum stocks, hot companies, funding rounds, who's winning, market moves. (IonQ, Rigetti, D-Wave, IBM, Google, Microsoft, Amazon)
2. BIG PICTURE: breakthroughs explained simply, policy shifts, what countries are betting on quantum and why it matters.
3. MIND-BLOWING: quantum consciousness, observer effect, quantum biology, how quantum changes our understanding of reality — written for a general reader, not a physicist.

AVOID: dense academic jargon, papers written for researchers, anything that reads like a press release for engineers.
PREFER: stories with a "whoa" factor, investment angles, "why should I care" clarity.

Article from ${source}:
Title: ${title}
Excerpt: ${description}

Write ONE punchy sentence (max 18 words) — the investment angle or "why this matters to a normal person." No jargon. No filler.

Classify into exactly one category:
  hardware    — qubit advances, new processors, quantum computers
  software    — algorithms, error correction, SDKs, simulators
  market      — stocks, funding rounds, company earnings, deals, investing
  research    — breakthroughs explained simply, experiments with real-world implications
  policy      — government programs, export controls, standards
  consciousness — quantum mind, observer effect, reality/physics philosophy, quantum biology, Dean Radin, IONS, worldview topics

Respond in this exact JSON format (no markdown, no extra text):
{"summary": "...", "category": "hardware|software|market|research|policy|consciousness"}`;

  const msg = await anthropic.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 300,
    messages: [{ role: "user", content: prompt }],
  });

  const text = msg.content[0]?.type === "text" ? msg.content[0].text : "";
  try {
    const m = text.match(/\{[\s\S]*\}/);
    if (m) {
      const p = JSON.parse(m[0]);
      const valid = ["hardware", "software", "market", "research", "policy", "consciousness"];
      return { summary: p.summary ?? title, category: valid.includes(p.category) ? p.category : "research" };
    }
  } catch { /* fall through */ }
  return { summary: title, category: "research" };
}

async function pickTopStories(articles: QuantumArticle[], forceConsciousness = false): Promise<Set<string>> {
  if (!articles.length) return new Set();
  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  const list = articles
    .map((a, i) => `${i + 1}. [${a.category.toUpperCase()}] "${a.title}" — ${a.source}\n   ${a.summary}`)
    .join("\n\n");

  const prompt = `You are the editor-in-chief at Fabuless Quantum. Your readers are curious non-experts — retail investors, tech enthusiasts, and people fascinated by big ideas. They are NOT physicists or researchers.

Pick the 4 most compelling articles from the list below.

HARD RULES — automatically disqualify any article that:
- Mentions qubits, error rates, gate fidelity, decoherence, algorithms, or circuit depth in a technical way
- Is a paper, preprint, or academic announcement with no real-world implication
- Would require a physics degree to care about

PRIORITIZE in this order:
1. Money/market stories — funding rounds, stock moves, acquisitions, partnerships, company wins
2. "Why it matters to regular people" stories — breakthroughs explained simply, timelines, what quantum unlocks
3. Government/policy — CHIPS Act, national programs, geopolitical angles
4. Consciousness, philosophy of mind, or reality-bending ideas a curious person would share at dinner
5. Source diversity — never pick 2 from the same outlet
${forceConsciousness ? "- MUST include exactly 1 consciousness/worldview/quantum-mind story in your 3 picks" : "- Include a consciousness/worldview story if one qualifies"}

Articles:
${list}

Respond with ONLY a JSON array of the article numbers you chose (e.g., [1, 3, 7, 12]). No other text.`;

  const msg = await anthropic.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 50,
    messages: [{ role: "user", content: prompt }],
  });

  const text = msg.content[0]?.type === "text" ? msg.content[0].text : "";
  const nums = text.match(/\[[\d,\s]+\]/)?.[0];
  if (!nums) return new Set();
  try {
    const picks: number[] = JSON.parse(nums);
    return new Set(picks.filter((n) => n >= 1 && n <= articles.length).slice(0, 4).map((n) => articles[n - 1].id));
  } catch { return new Set(); }
}

export async function runQuantumUpdate(force = false): Promise<{ added: number; total: number }> {
  // Load existing articles from Supabase
  const store = await loadQuantumArticlesFromDB({ limit: 200 });
  const existingUrls = new Set(store.map((a) => a.sourceUrl));

  const items = await fetchQuantumNewsItems();

  const relevant = items.filter((item) =>
    isQuantumRelevant(item.title, item.description) &&
    (force || !existingUrls.has(item.link))
  );

  const diverse = diversify(relevant, MAX_CANDIDATES, 3) as typeof relevant;
  const toProcess = diverse.slice(0, MAX_CANDIDATES);

  const newArticles: QuantumArticle[] = [];

  for (const item of toProcess) {
    if (newArticles.length >= TARGET_ARTICLES) break;
    const { summary, category } = await analyzeArticle(item.title, item.description, item.source);
    const companies = detectCompanies(`${item.title} ${item.description}`);
    const rawImage = item.image ?? null;
    const image = rawImage && await imageIsAccessible(rawImage) ? rawImage : null;

    newArticles.push({
      id: slugify(item.title),
      title: item.title,
      summary,
      source: item.source,
      sourceUrl: item.link,
      publishedAt: item.pubDate ? new Date(item.pubDate).toISOString() : new Date().toISOString(),
      category,
      companies,
      image,
      topStory: false,
      generatedAt: new Date().toISOString(),
    });

    await sleep(500);
  }

  // Pick top stories
  if (newArticles.length > 0) {
    const lastConsciousnessTop = store.find((a) => a.topStory && a.category === "consciousness");
    const consciousnessWasTopRecently = lastConsciousnessTop
      ? Date.now() - new Date(lastConsciousnessTop.generatedAt).getTime() < 36 * 60 * 60 * 1000
      : false;
    const forceConsciousness = !consciousnessWasTopRecently;

    const cutoff48h = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString();
    const heroCheck = async (a: QuantumArticle) => a.image && await imageIsHeroQuality(a.image);
    const newHeroEligible = (await Promise.all(newArticles.map(async (a) => ({ a, ok: await heroCheck(a) })))).filter(x => x.ok).map(x => x.a);
    const recentHeroEligible = (await Promise.all(
      store.filter((a) => a.image && a.publishedAt >= cutoff48h && !newArticles.some((n) => n.id === a.id))
           .map(async (a) => ({ a, ok: await heroCheck(a) }))
    )).filter(x => x.ok).map(x => x.a);

    const candidatePool = [...newHeroEligible, ...recentHeroEligible].slice(0, 20);
    const topIds = await pickTopStories(candidatePool, forceConsciousness);

    if (forceConsciousness && !candidatePool.some((a) => topIds.has(a.id) && a.category === "consciousness")) {
      const bestConsciousness = candidatePool.find((a) => a.category === "consciousness");
      if (bestConsciousness) {
        const topArr = [...topIds];
        topArr[topArr.length - 1] = bestConsciousness.id;
        topIds.clear();
        topArr.forEach((id) => topIds.add(id));
      }
    }

    // Clear old top flags, apply new ones
    for (const a of store) a.topStory = false;
    for (const a of [...newArticles, ...store]) {
      if (topIds.has(a.id)) a.topStory = true;
    }
  }

  // Merge new into store
  for (const article of newArticles) {
    const idx = store.findIndex((a) => a.id === article.id || a.sourceUrl === article.sourceUrl);
    if (idx >= 0) store[idx] = article; else store.unshift(article);
  }

  const merged = store
    .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt))
    .slice(0, 200);

  await saveQuantumArticles(merged);
  revalidatePath("/quantum");
  revalidatePath("/");
  return { added: newArticles.length, total: merged.length };
}
