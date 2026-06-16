#!/usr/bin/env tsx
/**
 * build-newsletter.ts
 *
 * Pulls today's semi articles from the Supabase rss_articles table,
 * asks Claude to curate + categorize + write one-liners,
 * pulls top quantum articles from data/quantum-articles.json,
 * then builds + inserts the Issue into lib/issues.ts and creates
 * the archive page.  No manual steps required.
 *
 * Run:
 *   npx tsx scripts/build-newsletter.ts [--auto]
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from "fs";
import { resolve } from "path";
import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@supabase/supabase-js";
import type { IssueSection } from "../lib/issues";

// ── env ──────────────────────────────────────────────────────────────────────
try {
  const lines = readFileSync(resolve(process.cwd(), ".env.local"), "utf-8").split("\n");
  for (const line of lines) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const eq = t.indexOf("=");
    if (eq === -1) continue;
    const k = t.slice(0, eq).trim();
    const v = t.slice(eq + 1).trim().replace(/^['"]|['"]$/g, "");
    if (!(k in process.env)) process.env[k] = v;
  }
} catch { /* CI injects env via secrets */ }

const AUTO = process.argv.includes("--auto");

// ── clients ───────────────────────────────────────────────────────────────────
const ai = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);

// ── types ─────────────────────────────────────────────────────────────────────
type RssRow = { url: string; title: string; description: string; source: string; pub_date: string | null };

type CuratedStory = {
  headline: string;
  url: string;
  source: string;
  oneliner: string;
  category: IssueSection["category"];
};

type ClaudeResponse = {
  title: string;
  stories: CuratedStory[];
};

// ── helpers ───────────────────────────────────────────────────────────────────
function jsStr(s: string | null): string {
  if (s === null) return "null";
  return JSON.stringify(s);
}

function getCurrentIssueNumber(): number {
  const text = readFileSync(resolve(process.cwd(), "lib/issues.ts"), "utf-8");
  const m = text.match(/number:\s*(\d+)/);
  return m ? parseInt(m[1]) : 1;
}

function formatDate(d = new Date()): string {
  return d.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}

// ── Step 1: fetch semi articles from Supabase ─────────────────────────────────
async function fetchSemiArticles(): Promise<RssRow[]> {
  const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const { data, error } = await supabase
    .from("rss_articles")
    .select("url, title, description, source, pub_date")
    .gte("pub_date", cutoff)
    .order("pub_date", { ascending: false })
    .limit(80);
  if (error) throw new Error(`Supabase error: ${error.message}`);
  return (data ?? []) as RssRow[];
}

// ── Step 2: Claude curates + writes one-liners ────────────────────────────────
async function curateWithClaude(articles: RssRow[]): Promise<ClaudeResponse> {
  const articleList = articles.map((a, i) =>
    `[${i + 1}] SOURCE: ${a.source}\nHEADLINE: ${a.title}\nSUMMARY: ${a.description.slice(0, 300)}\nURL: ${a.url}`
  ).join("\n\n");

  const prompt = `You are the editor of Fabuless Semi, a daily semiconductor industry briefing for serious investors.

From the articles below, select the best stories — no more than 12. Skip duplicates, thin earnings recaps, retail/consumer fluff, and analyst price calls with no underlying news.

SOURCE DIVERSITY RULE: Select at most 2 articles from any single source. Prioritize breadth — spread picks across as many different sources as possible. If two articles cover the same event from different angles, pick only the better one.

For each selected story, write:
- A short punchy one-liner (max 15 words) stating the single most investment-relevant implication
- The correct category from: Compute | Memory & Networking | Capital Flows | Geopolitics & Policy | Other

Also write a short, punchy issue title — max 6 words, no fluff. Think newspaper front page: name the biggest story or theme. Examples: "TSMC Holds. NVIDIA Wins. AMD Waits." or "Memory Glut Ends, AI Capex Soars".

Return ONLY valid JSON with this exact shape:
{
  "title": "...",
  "stories": [
    {
      "headline": "original headline",
      "url": "original url",
      "source": "original source",
      "oneliner": "one-liner sentence",
      "category": "Compute"
    }
  ]
}

ARTICLES:
${articleList}`;

  let msg;
  for (let attempt = 1; attempt <= 4; attempt++) {
    try {
      msg = await ai.messages.create({
        model: "claude-sonnet-4-6",
        max_tokens: 3000,
        messages: [{ role: "user", content: prompt }],
      });
      break;
    } catch (e: unknown) {
      const isOverloaded = e instanceof Error && e.message.includes("overloaded");
      if (!isOverloaded || attempt === 4) throw e;
      const wait = attempt * 30000;
      console.log(`  Anthropic overloaded — retrying in ${wait / 1000}s (attempt ${attempt}/4)...`);
      await new Promise((r) => setTimeout(r, wait));
    }
  }

  const text = msg!.content[0].type === "text" ? msg!.content[0].text : "";
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("Claude returned no JSON");
  return JSON.parse(jsonMatch[0]) as ClaudeResponse;
}

// ── Step 3: build the Issue TS string ────────────────────────────────────────
function buildIssueTs(issueNum: number, dateStr: string, curated: ClaudeResponse): string {
  const CAT_ORDER: IssueSection["category"][] = [
    "Compute", "Memory & Networking", "Capital Flows", "Geopolitics & Policy", "Other",
  ];

  const grouped: Partial<Record<IssueSection["category"], CuratedStory[]>> = {};
  for (const s of curated.stories) {
    const cat = CAT_ORDER.includes(s.category) ? s.category : "Other";
    (grouped[cat] ??= []).push(s);
  }

  let sectionsTs = "";
  for (const cat of CAT_ORDER) {
    const stories = grouped[cat];
    if (!stories?.length) continue;
    const storiesTs = stories.map((s) => `          {
            headline: ${jsStr(s.headline)},
            url: ${jsStr(s.url)},
            source: ${jsStr(s.source)},
            image: null,
            oneliner: ${jsStr(s.oneliner)},
          },`).join("\n");
    sectionsTs += `      {
        category: "${cat}",
        stories: [
${storiesTs}
        ],
      },\n`;
  }

  return `  {
    number: ${issueNum},
    date: "${dateStr}",
    slug: "issue-${issueNum}",
    title: ${jsStr(curated.title)},
    sections: [
${sectionsTs}    ],
    podcasts: [],
    earnings: [],
    quotes: [],
  },`;
}

// ── Step 5: insert into lib/issues.ts ────────────────────────────────────────
function insertIntoIssuesTs(newIssueTs: string) {
  const path = resolve(process.cwd(), "lib/issues.ts");
  const text = readFileSync(path, "utf-8");
  const marker = "export const issues: Issue[] = [";
  const idx = text.indexOf(marker);
  if (idx === -1) throw new Error("Could not find issues array in lib/issues.ts");
  const insertAt = idx + marker.length + 1;
  writeFileSync(path, text.slice(0, insertAt) + newIssueTs + "\n" + text.slice(insertAt));
}

// ── Step 6: create archive page ───────────────────────────────────────────────
function createArchivePage(issueNum: number) {
  const dir = resolve(process.cwd(), `app/archive/issue-${issueNum}`);
  mkdirSync(dir, { recursive: true });
  writeFileSync(resolve(dir, "page.tsx"), `import Link from "next/link";
import { getIssueBySlug } from "@/lib/issues";
import { IssueView } from "@/app/components/IssueView";
import { notFound } from "next/navigation";

export default function Issue${issueNum}Page() {
  const issue = getIssueBySlug("issue-${issueNum}");
  if (!issue) notFound();

  return (
    <div className="max-w-6xl mx-auto px-6 pt-12 pb-16">
      <div className="mb-8 pb-6 border-b border-gray-200">
        <Link href="/archive" className="text-xs text-[#0E7490] hover:underline uppercase tracking-widest">
          ← Archive
        </Link>
        <div className="mt-3 text-sm text-gray-400">Issue {issue.number} · {issue.date}</div>
        <h1 className="font-sans text-3xl text-[#374151] tracking-tight leading-tight mt-1">
          {issue.title}
        </h1>
      </div>

      <IssueView issue={issue} showEarnings={false} />
    </div>
  );
}
`);
  console.log(`  ✓ Created app/archive/issue-${issueNum}/page.tsx`);
}

// ── main ──────────────────────────────────────────────────────────────────────
async function main() {
  console.log(`\nFabuless Newsletter Builder — ${formatDate()}`);
  if (AUTO) console.log("  (auto mode)");
  console.log("=".repeat(52));

  console.log("\n[1/4] Fetching semi articles from Supabase...");
  const articles = await fetchSemiArticles();
  console.log(`  → ${articles.length} articles in the last 48h`);
  if (!articles.length) { console.error("No articles found."); process.exit(1); }

  console.log("\n[2/4] Curating with Claude...");
  const curated = await curateWithClaude(articles);
  console.log(`  → ${curated.stories.length} stories selected`);
  console.log(`  → Title: "${curated.title}"`);
  curated.stories.forEach((s) => console.log(`     · [${s.category}] ${s.headline.slice(0, 60)}`));

  console.log("\n[3/4] Building Issue...");
  const issueNum = getCurrentIssueNumber() + 1;
  const dateStr = formatDate();
  const issueTs = buildIssueTs(issueNum, dateStr, curated);
  insertIntoIssuesTs(issueTs);
  console.log(`  ✓ Issue #${issueNum} inserted into lib/issues.ts`);
  createArchivePage(issueNum);

  console.log(`\n${"=".repeat(52)}`);
  console.log(`Issue #${issueNum}: ${curated.title}`);
  console.log(`Stories: ${curated.stories.length}`);
  console.log("=".repeat(52));
  console.log("\n✅ Done. Run send-newsletter.ts to blast to subscribers.");
}

main().catch((e) => { console.error(e); process.exit(1); });
