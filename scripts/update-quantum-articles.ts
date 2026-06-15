/**
 * update-quantum-articles.ts
 *
 * Fetches quantum RSS feeds, filters for relevant articles,
 * generates a summary + category via Groq, writes to data/quantum-articles.json.
 *
 * Run:
 *   GROQ_API_KEY=gsk_... npx tsx scripts/update-quantum-articles.ts
 *   GROQ_API_KEY=gsk_... npx tsx scripts/update-quantum-articles.ts --force
 */

import fs from "fs";
import path from "path";
import Groq from "groq-sdk";
import { fetchQuantumNewsItems } from "../lib/quantum/sources";
import { QUANTUM_KEYWORDS, QUANTUM_COMPANIES } from "../lib/quantum/companies";
import type { QuantumArticle, QuantumArticlesStore } from "../lib/quantum/articles";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const DATA_PATH = path.resolve(__dirname, "../data/quantum-articles.json");
const MAX_NEW_PER_RUN = 20; // Groq rate limit safety

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

async function analyzeArticle(
  title: string,
  description: string,
  source: string,
): Promise<{ summary: string; category: QuantumArticle["category"] }> {
  const prompt = `You are an editor at Fabuless Quantum, covering the quantum computing industry.

Article from ${source}:
Title: ${title}
Excerpt: ${description}

Write a tight 3-sentence summary of this article for a sophisticated investor/researcher audience.
Also classify it into exactly one category: hardware | software | market | research | policy

Respond in this exact JSON format (no markdown):
{"summary": "...", "category": "hardware|software|market|research|policy"}`;

  const msg = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    max_tokens: 300,
    temperature: 0.2,
    messages: [{ role: "user", content: prompt }],
  });

  const text = msg.choices[0]?.message?.content ?? "";
  try {
    const m = text.match(/\{[\s\S]*\}/);
    if (m) {
      const p = JSON.parse(m[0]);
      return { summary: p.summary ?? title, category: p.category ?? "research" };
    }
  } catch { /* fall through */ }
  return { summary: title, category: "research" };
}

async function main() {
  const force = process.argv.includes("--force");

  if (!process.env.GROQ_API_KEY) {
    console.error("GROQ_API_KEY required");
    process.exit(1);
  }

  let store: QuantumArticlesStore = [];
  try { store = JSON.parse(fs.readFileSync(DATA_PATH, "utf8")); } catch { }
  // Handle legacy empty object seed
  if (!Array.isArray(store)) store = [];

  const existingUrls = new Set(store.map((a) => a.sourceUrl));

  console.log("Fetching quantum RSS feeds...");
  const items = await fetchQuantumNewsItems();
  console.log(`  ${items.length} total items fetched`);

  const relevant = items.filter((item) =>
    isQuantumRelevant(item.title, item.description) &&
    (force || !existingUrls.has(item.link))
  ).slice(0, MAX_NEW_PER_RUN);

  console.log(`  ${relevant.length} new quantum-relevant articles to process`);

  for (const item of relevant) {
    console.log(`\n▸ ${item.title.slice(0, 70)}...`);
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
      image: item.image,
      generatedAt: new Date().toISOString(),
    };

    // Dedupe by id
    const idx = store.findIndex((a) => a.id === article.id || a.sourceUrl === article.sourceUrl);
    if (idx >= 0) store[idx] = article; else store.unshift(article);

    console.log(`  ✓ [${category}] ${companies.length > 0 ? companies.join(", ") : "general"}`);

    fs.writeFileSync(DATA_PATH, JSON.stringify(store.slice(0, 200), null, 2));
    await sleep(600);
  }

  console.log(`\nDone. ${store.length} articles in data/quantum-articles.json`);
}

main().catch((e) => { console.error(e); process.exit(1); });
