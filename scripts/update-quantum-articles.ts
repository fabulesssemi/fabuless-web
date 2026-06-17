/**
 * update-quantum-articles.ts
 *
 * Fetches curated quantum + consciousness RSS feeds, filters by relevance,
 * generates a 3-sentence summary + category via Groq, marks the top 4 stories,
 * and writes to data/quantum-articles.json.
 *
 * Two lanes of content:
 *   • tech — hardware, software, market, research, policy
 *   • mind — consciousness, observer effect, quantum reality, worldview
 *
 * Run:
 *   GROQ_API_KEY=gsk_... npx tsx scripts/update-quantum-articles.ts
 *   GROQ_API_KEY=gsk_... npx tsx scripts/update-quantum-articles.ts --force
 */

import fs from "fs";
import path from "path";
import Anthropic from "@anthropic-ai/sdk";
import { fetchQuantumNewsItems } from "../lib/quantum/sources";
import { QUANTUM_KEYWORDS, QUANTUM_COMPANIES } from "../lib/quantum/companies";
import type { QuantumArticle, QuantumArticlesStore } from "../lib/quantum/articles";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const DATA_PATH = path.resolve(__dirname, "../data/quantum-articles.json");

// Target 10-12 high-quality articles per run
const TARGET_ARTICLES = 16;
// Process at most this many raw candidates (Groq rate limit safety)
const MAX_CANDIDATES = 40;

function sleep(ms: number) { return new Promise((r) => setTimeout(r, ms)); }

async function imageIsAccessible(url: string): Promise<boolean> {
  try {
    const res = await fetch(url, { method: "HEAD", signal: AbortSignal.timeout(4000) });
    const ct = res.headers.get("content-type") ?? "";
    return res.ok && ct.startsWith("image/");
  } catch { return false; }
}

// Top story hero images must be substantial — at least 60KB (real editorial photos).
// Headshots, podcast thumbnails, and tiny icons are typically <40KB and look bad as hero.
async function imageIsHeroQuality(url: string): Promise<boolean> {
  try {
    const res = await fetch(url, { method: "HEAD", signal: AbortSignal.timeout(4000) });
    const ct = res.headers.get("content-type") ?? "";
    if (!res.ok || !ct.startsWith("image/")) return false;
    const size = parseInt(res.headers.get("content-length") ?? "0", 10);
    return size === 0 || size >= 60_000; // 0 = server didn't send size, allow through
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
    .filter((c) =>
      lower.includes(c.ticker.toLowerCase()) ||
      lower.includes(c.name.toLowerCase())
    )
    .map((c) => c.ticker);
}

// Source diversity: cap how many articles from a single domain make it in.
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

type AnalysisResult = {
  summary: string;
  category: QuantumArticle["category"];
};

async function analyzeArticle(
  title: string,
  description: string,
  source: string,
): Promise<AnalysisResult> {
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
      const validCategories = ["hardware", "software", "market", "research", "policy", "consciousness"];
      const category = validCategories.includes(p.category) ? p.category : "research";
      return { summary: p.summary ?? title, category };
    }
  } catch { /* fall through */ }
  return { summary: title, category: "research" };
}

async function pickTopStories(articles: QuantumArticle[], forceConsciousness = false): Promise<Set<string>> {
  if (articles.length === 0) return new Set();

  const list = articles
    .map((a, i) => `${i + 1}. [${a.category.toUpperCase()}] "${a.title}" — ${a.source}\n   ${a.summary}`)
    .join("\n\n");

  const prompt = `You are the editor-in-chief at Fabuless Quantum. Your readers are curious non-experts — retail investors, tech enthusiasts, and people fascinated by big ideas. They are NOT physicists or researchers.

Pick the 3 most compelling articles from the list below.

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

Respond with ONLY a JSON array of the article numbers you chose (e.g., [1, 3, 7]). No other text.`;

  const msg = await anthropic.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 50,
    messages: [{ role: "user", content: prompt }],
  });

  const text = msg.content[0]?.type === "text" ? msg.content[0].text : "";
  const nums = text.match(/\[[\d,\s]+\]/)?.[0];
  if (!nums) return new Set();

  try {
    const picks: number[] = JSON.parse(nums);
    return new Set(
      picks
        .filter((n) => n >= 1 && n <= articles.length)
        .slice(0, 3)
        .map((n) => articles[n - 1].id)
    );
  } catch { return new Set(); }
}

async function main() {
  const force = process.argv.includes("--force");

  if (!process.env.GROQ_API_KEY) {
    console.error("GROQ_API_KEY required");
    process.exit(1);
  }

  let store: QuantumArticlesStore = [];
  try { store = JSON.parse(fs.readFileSync(DATA_PATH, "utf8")); } catch { }
  if (!Array.isArray(store)) store = [];

  const existingUrls = new Set(store.map((a) => a.sourceUrl));

  console.log("Fetching quantum + consciousness RSS feeds...");
  const items = await fetchQuantumNewsItems();
  console.log(`\n  ${items.length} total items fetched`);

  // Filter for relevance, deduplicate, apply source diversity, cap candidates
  const relevant = items.filter((item) =>
    isQuantumRelevant(item.title, item.description) &&
    (force || !existingUrls.has(item.link))
  );

  const diverse = diversify(relevant, MAX_CANDIDATES, 3) as typeof relevant;
  const toProcess = diverse.slice(0, MAX_CANDIDATES);

  console.log(`  ${relevant.length} relevant → ${toProcess.length} to process (diverse)\n`);

  const newArticles: QuantumArticle[] = [];

  for (const item of toProcess) {
    if (newArticles.length >= TARGET_ARTICLES) break;

    console.log(`▸ ${item.title.slice(0, 70)}`);
    console.log(`  Source: ${item.source}`);

    const { summary, category } = await analyzeArticle(item.title, item.description, item.source);
    const companies = detectCompanies(`${item.title} ${item.description}`);

    const rawImage = item.image ?? null;
    const image = rawImage && await imageIsAccessible(rawImage) ? rawImage : null;
    if (rawImage && !image) console.log(`  ⚠ image failed HEAD check — cleared`);

    const article: QuantumArticle = {
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
    };

    newArticles.push(article);
    console.log(`  ✓ [${category}] ${companies.length > 0 ? companies.join(", ") : "general"}`);

    await sleep(500);
  }

  // Pick top 3 from this batch — only articles with images are eligible
  if (newArticles.length > 0) {
    console.log("\nPicking top stories...");

    // Every other day, force a consciousness article into top stories.
    // Check if the previous run already had a consciousness top story.
    const lastConsciousnessTop = store.find((a) => a.topStory && a.category === "consciousness");
    const consciousnessWasTopRecently = lastConsciousnessTop
      ? Date.now() - new Date(lastConsciousnessTop.generatedAt).getTime() < 36 * 60 * 60 * 1000
      : false;
    const forceConsciousness = !consciousnessWasTopRecently;

    // Build candidate pool: only articles with hero-quality images (≥60KB)
    const cutoff48h = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString();
    const heroCheck = async (a: QuantumArticle) => a.image && await imageIsHeroQuality(a.image);
    const newHeroEligible = (await Promise.all(newArticles.map(async (a) => ({ a, ok: await heroCheck(a) })))).filter(x => x.ok).map(x => x.a);
    const recentHeroEligible = (await Promise.all(
      store.filter((a) => a.image && a.publishedAt >= cutoff48h && !newArticles.some((n) => n.id === a.id))
           .map(async (a) => ({ a, ok: await heroCheck(a) }))
    )).filter(x => x.ok).map(x => x.a);
    const candidatePool = [...newHeroEligible, ...recentHeroEligible].slice(0, 20);
    const withImages = candidatePool;
    const topIds = await pickTopStories(withImages, forceConsciousness);

    // If forcing consciousness but Claude didn't pick one, manually slot the best one in
    if (forceConsciousness && !newArticles.some((a) => topIds.has(a.id) && a.category === "consciousness")) {
      const bestConsciousness = withImages.find((a) => a.category === "consciousness");
      if (bestConsciousness) {
        // Drop the last top pick and replace with consciousness article
        const topArr = [...topIds];
        topArr[topArr.length - 1] = bestConsciousness.id;
        topIds.clear();
        topArr.forEach((id) => topIds.add(id));
        console.log(`  🧠 Force-slotted consciousness: ${bestConsciousness.title.slice(0, 50)}`);
      }
    }

    // Clear all existing top story flags first
    for (const a of store) a.topStory = false;
    // Apply top story flag to both new and store articles
    for (const a of [...newArticles, ...store]) {
      if (topIds.has(a.id)) {
        a.topStory = true;
        console.log(`  ⭐ [${a.category}] ${a.title.slice(0, 55)}`);
      }
    }
  }

  // Merge new articles into store (dedupe by id/url)
  for (const article of newArticles) {
    const idx = store.findIndex((a) => a.id === article.id || a.sourceUrl === article.sourceUrl);
    if (idx >= 0) store[idx] = article; else store.unshift(article);
  }

  // Keep 200 most recent
  store = store
    .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt))
    .slice(0, 200);

  fs.writeFileSync(DATA_PATH, JSON.stringify(store, null, 2));
  console.log(`\nDone. ${newArticles.length} new articles. ${store.length} total in data/quantum-articles.json`);
}

main().catch((e) => { console.error(e); process.exit(1); });
