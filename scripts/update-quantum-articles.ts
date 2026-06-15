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
const TARGET_ARTICLES = 12;
// Process at most this many raw candidates (Groq rate limit safety)
const MAX_CANDIDATES = 40;

function sleep(ms: number) { return new Promise((r) => setTimeout(r, ms)); }

function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 60);
}

function isQuantumRelevant(title: string, description: string): boolean {
  const text = `${title} ${description}`.toLowerCase();
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
  const prompt = `You are an editor at Fabuless Quantum. Your audience is curious, intelligent adults — NOT just engineers or investors. You cover two kinds of content equally:

1. Quantum TECH: hardware breakthroughs, algorithms, company news, policy, funding.
2. Quantum MIND: consciousness, observer effect, quantum biology, philosophy of reality, worldview-changing ideas that overlap with quantum physics.

Article from ${source}:
Title: ${title}
Excerpt: ${description}

Write a tight 2-3 sentence summary a curious non-technical reader would find fascinating. Be concrete, not vague. Make the "so what" clear.

Classify into exactly one category:
  hardware    — qubit advances, new processors, quantum computers
  software    — algorithms, error correction, SDKs, simulators
  market      — stocks, funding rounds, company earnings, deals
  research    — academic breakthroughs, papers, experiments
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

async function pickTopStories(articles: QuantumArticle[]): Promise<Set<string>> {
  if (articles.length === 0) return new Set();

  const list = articles
    .map((a, i) => `${i + 1}. [${a.category.toUpperCase()}] "${a.title}" — ${a.source}\n   ${a.summary}`)
    .join("\n\n");

  const prompt = `You are the editor-in-chief at Fabuless Quantum. Below are today's new articles — a mix of quantum tech and consciousness/philosophy stories.

Pick the 4 most compelling for a curious general reader. Prioritize:
- Genuine breakthroughs or unexpected findings
- Stories the average person would share with a friend ("whoa, did you see this?")
- Source diversity — don't pick 4 from the same outlet
- Include at least 1 consciousness/worldview story if one is strong

Articles:
${list}

Respond with ONLY a JSON array of the article numbers you chose (e.g., [1, 3, 7, 9]). No other text.`;

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
    return new Set(
      picks
        .filter((n) => n >= 1 && n <= articles.length)
        .slice(0, 4)
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

    const article: QuantumArticle = {
      id: slugify(item.title),
      title: item.title,
      summary,
      source: item.source,
      sourceUrl: item.link,
      publishedAt: item.pubDate ? new Date(item.pubDate).toISOString() : new Date().toISOString(),
      category,
      companies,
      image: item.image ?? null,
      topStory: false,
      generatedAt: new Date().toISOString(),
    };

    newArticles.push(article);
    console.log(`  ✓ [${category}] ${companies.length > 0 ? companies.join(", ") : "general"}`);

    await sleep(500);
  }

  // Pick top 4 from this batch
  if (newArticles.length > 0) {
    console.log("\nPicking top stories...");
    const topIds = await pickTopStories(newArticles);
    for (const a of newArticles) {
      if (topIds.has(a.id)) {
        a.topStory = true;
        console.log(`  ⭐ ${a.title.slice(0, 60)}`);
      }
    }
    // Clear topStory on previous run so only today's top 4 are marked
    for (const a of store) a.topStory = false;
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
