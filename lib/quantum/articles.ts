import fs from "fs";
import path from "path";

export type QuantumArticleCategory =
  | "hardware"    // qubit advances, new processors
  | "software"    // algorithms, error correction, SDKs
  | "market"      // stocks, funding, earnings
  | "research"    // academic breakthroughs
  | "policy";     // government, export controls, investment

export type QuantumArticle = {
  id: string;                    // slug-style, e.g. "ionq-2025-q2-results"
  title: string;
  summary: string;               // Groq-generated, 3-4 sentences
  source: string;                // e.g. "The Quantum Insider"
  sourceUrl: string;
  publishedAt: string;           // ISO date string
  category: QuantumArticleCategory;
  companies: string[];           // tickers mentioned, e.g. ["IONQ", "IBM"]
  image: string | null;
  generatedAt: string;
};

export type QuantumArticlesStore = QuantumArticle[];

const DATA_PATH = path.resolve(process.cwd(), "data/quantum-articles.json");

export function getAllArticles(): QuantumArticle[] {
  try {
    const raw = fs.readFileSync(DATA_PATH, "utf8");
    return JSON.parse(raw) as QuantumArticle[];
  } catch { return []; }
}

export function getArticlesByCategory(category: QuantumArticleCategory): QuantumArticle[] {
  return getAllArticles().filter((a) => a.category === category);
}

export function getArticlesByTicker(ticker: string): QuantumArticle[] {
  return getAllArticles().filter((a) => a.companies.includes(ticker));
}

export function getLatestArticles(limit = 12): QuantumArticle[] {
  return getAllArticles()
    .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt))
    .slice(0, limit);
}
