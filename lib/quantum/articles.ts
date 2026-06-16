import fs from "fs";
import path from "path";

export type QuantumArticleCategory =
  | "hardware"       // qubit advances, new processors
  | "software"       // algorithms, error correction, SDKs
  | "market"         // stocks, funding, earnings
  | "research"       // academic breakthroughs
  | "policy"         // government, export controls, investment
  | "consciousness"; // quantum-mind, observer effect, philosophy, worldview

export type QuantumArticle = {
  id: string;
  title: string;
  summary: string;              // Groq-generated, 3-4 sentences
  source: string;
  sourceUrl: string;
  publishedAt: string;          // ISO date string
  category: QuantumArticleCategory;
  companies: string[];          // tickers mentioned
  image: string | null;
  topStory: boolean;            // true for the 4 featured articles per run
  generatedAt: string;
};

export type QuantumArticlesStore = QuantumArticle[];

const DATA_PATH = path.resolve(process.cwd(), "data/quantum-articles.json");

export function getAllArticles(): QuantumArticle[] {
  try {
    const raw = fs.readFileSync(DATA_PATH, "utf8");
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    // backfill topStory for articles written before this field existed
    return parsed.map((a) => ({ topStory: false, ...a }));
  } catch { return []; }
}

export function getTopStories(limit = 3): QuantumArticle[] {
  return getAllArticles()
    .filter((a) => a.topStory)
    .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt))
    .slice(0, limit);
}

export function getArticlesByCategory(category: QuantumArticleCategory): QuantumArticle[] {
  return getAllArticles().filter((a) => a.category === category);
}

export function getArticlesByTicker(ticker: string): QuantumArticle[] {
  return getAllArticles().filter((a) => a.companies.includes(ticker));
}

export function getLatestArticles(limit = 48): QuantumArticle[] {
  const cutoff = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString();
  return getAllArticles()
    .filter((a) => a.publishedAt >= cutoff)
    .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt))
    .slice(0, limit);
}
