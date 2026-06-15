/**
 * update-earnings-previews.ts
 *
 * Auto-generates "what to watch" previews for every upcoming earner in COMPANY_UNIVERSE.
 * Uses Groq (free tier) — Llama 3.1 70B.
 *
 * For each company with an upcoming earnings date:
 *   1. Pull forward estimates from Yahoo (EPS est, revenue est, implied move)
 *   2. Load last 2 quarters of summaries from data/earnings-summaries.json for context
 *   3. Groq generates: bar-to-beat, 3 watch points, bull/bear setup
 *   4. Writes to data/earnings-previews.json
 *
 * Run:
 *   GROQ_API_KEY=gsk_... npx tsx scripts/update-earnings-previews.ts
 *   GROQ_API_KEY=gsk_... npx tsx scripts/update-earnings-previews.ts --ticker=NVDA
 *   GROQ_API_KEY=gsk_... npx tsx scripts/update-earnings-previews.ts --force
 */

import fs from "fs";
import path from "path";
import Groq from "groq-sdk";
import YahooFinance from "yahoo-finance2";
import { COMPANY_UNIVERSE } from "../lib/companies";

const yf = new YahooFinance({ suppressNotices: ["yahooSurvey"] });
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const SUMMARIES_PATH = path.resolve(__dirname, "../data/earnings-summaries.json");
const PREVIEWS_PATH  = path.resolve(__dirname, "../data/earnings-previews.json");

export type WatchPoint = {
  title: string;
  why: string;
  metric?: string;
};

export type EarningsPreviewGenerated = {
  ticker: string;
  companyName: string;
  nextDate: string;         // "YYYY-MM-DD"
  fiscalQuarter: string;    // "Q2 FY27"
  epsEst: number | null;
  revEstB: number | null;   // revenue estimate in billions
  barToBeat: string;        // 1-2 sentences on what a real beat looks like
  watchPoints: WatchPoint[];
  bullSetup: string;
  bearSetup: string;
  generatedAt: string;
};

export type PreviewsStore = Record<string, EarningsPreviewGenerated>;

function sleep(ms: number) { return new Promise((r) => setTimeout(r, ms)); }

function quarterLabel(date: string, fiscalYearOffset = 0): string {
  const d = new Date(date + "T12:00:00Z");
  const q = Math.ceil((d.getMonth() + 1) / 3);
  return `Q${q} FY${String(d.getFullYear() + fiscalYearOffset).slice(2)}`;
}

function toDateStr(v: Date | string | number | undefined | null): string | null {
  if (v == null) return null;
  if (v instanceof Date) return v.toISOString().slice(0, 10);
  if (typeof v === "string") return v.slice(0, 10);
  if (typeof v === "number") return new Date(v * 1000).toISOString().slice(0, 10);
  return null;
}

function toNum(v: unknown): number | null {
  if (v == null) return null;
  if (typeof v === "number") return v;
  // legacy { raw: number } format
  if (typeof v === "object" && v !== null && "raw" in v && typeof (v as { raw: unknown }).raw === "number") {
    return (v as { raw: number }).raw;
  }
  return null;
}

async function getNextEarningsDate(symbol: string): Promise<{ date: string; epsEst: number | null; revEstB: number | null } | null> {
  try {
    const summary = await yf.quoteSummary(
      symbol,
      { modules: ["calendarEvents", "earningsTrend"] as never[] },
      { validateResult: false },
    ) as unknown as Record<string, unknown>;

    // calendarEvents.earnings.earningsDate — array of Date|number|{raw}
    const cal = summary.calendarEvents as Record<string, unknown> | undefined;
    const earningsDates = (cal?.earnings as Record<string, unknown>)?.earningsDate as unknown[] | undefined ?? [];

    let date: string | null = null;
    const today = new Date().toISOString().slice(0, 10);
    for (const d of earningsDates) {
      const s = toDateStr(d as Date | string | number);
      if (s && s >= today) { date = s; break; }
    }
    if (!date) return null;

    // earningsTrend.trend — find current quarter "0q"
    const trend = ((summary.earningsTrend as Record<string, unknown>)?.trend as Record<string, unknown>[] | undefined) ?? [];
    const currentQ = trend.find((t) => t.period === "0q");
    const epsEst = toNum((currentQ?.earningsEstimate as Record<string, unknown>)?.avg);
    const revRaw = toNum((currentQ?.revenueEstimate as Record<string, unknown>)?.avg);
    const revEstB = revRaw != null ? Math.round(revRaw / 1e9 * 10) / 10 : null;

    return { date, epsEst, revEstB };
  } catch { return null; }
}

async function generatePreview(
  ticker: string,
  companyName: string,
  nextDate: string,
  epsEst: number | null,
  revEstB: number | null,
  pastSummaries: { quarter: string; summary: string; epsActual: number | null; surprisePct: number | null; priceMoveDay: number | null }[],
): Promise<{ barToBeat: string; watchPoints: WatchPoint[]; bullSetup: string; bearSetup: string }> {

  const pastContext = pastSummaries.length > 0
    ? pastSummaries.map((s) =>
        `${s.quarter}: EPS $${s.epsActual?.toFixed(2) ?? "?"}, surprise ${s.surprisePct != null ? `${s.surprisePct > 0 ? "+" : ""}${s.surprisePct.toFixed(1)}%` : "?"}, stock ${s.priceMoveDay != null ? `${s.priceMoveDay > 0 ? "+" : ""}${s.priceMoveDay.toFixed(1)}%` : "?"} day-of. ${s.summary}`
      ).join("\n\n")
    : "No past quarter data available.";

  const estimates = [
    epsEst != null ? `EPS estimate: $${epsEst.toFixed(2)}` : null,
    revEstB != null ? `Revenue estimate: $${revEstB}B` : null,
  ].filter(Boolean).join(", ");

  const prompt = `You are a sell-side equity research analyst writing a concise earnings preview for ${companyName} (${ticker}) ahead of their upcoming earnings report on ${nextDate}.

Current consensus: ${estimates || "estimates not available"}

Recent earnings history:
${pastContext}

Write a tight, institutional-quality earnings preview with:

1. "barToBeat": 1-2 sentences on what the company actually needs to deliver to move the stock — not just beat EPS, but what the buy-side whisper is and what's already priced in
2. "watchPoints": exactly 3 items, each with:
   - "title": short label (5-8 words)
   - "why": 1-2 sentences on why this metric moves the stock
   - "metric": the specific number or signal to watch (optional, skip if not applicable)
3. "bullSetup": 1 sentence on the bull case going into print
4. "bearSetup": 1 sentence on the bear case / key risk

Be specific to this company and this quarter. Reference actual end-markets, product cycles, or macro factors relevant to ${ticker}. Do not be generic.

Respond in this exact JSON format (no markdown, no extra text):
{
  "barToBeat": "...",
  "watchPoints": [
    { "title": "...", "why": "...", "metric": "..." },
    { "title": "...", "why": "..." },
    { "title": "...", "why": "...", "metric": "..." }
  ],
  "bullSetup": "...",
  "bearSetup": "..."
}`;

  const msg = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    max_tokens: 800,
    temperature: 0.3,
    messages: [{ role: "user", content: prompt }],
  });

  const text = msg.choices[0]?.message?.content ?? "";
  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        barToBeat: parsed.barToBeat ?? "",
        watchPoints: (parsed.watchPoints ?? []).slice(0, 3),
        bullSetup: parsed.bullSetup ?? "",
        bearSetup: parsed.bearSetup ?? "",
      };
    }
  } catch { /* fall through */ }

  return { barToBeat: text.trim(), watchPoints: [], bullSetup: "", bearSetup: "" };
}

async function main() {
  const args = process.argv.slice(2);
  const tickerFilter = args.find((a) => a.startsWith("--ticker="))?.split("=")[1]?.toUpperCase();
  const force = args.includes("--force");

  if (!process.env.GROQ_API_KEY) {
    console.error("GROQ_API_KEY is required. Get a free key at console.groq.com");
    process.exit(1);
  }

  // Load existing data
  let store: PreviewsStore = {};
  try { store = JSON.parse(fs.readFileSync(PREVIEWS_PATH, "utf8")); } catch { }

  let summaries: Record<string, { quarter: string; summary: string; epsActual: number | null; surprisePct: number | null; priceMoveDay: number | null }[]> = {};
  try {
    const raw = JSON.parse(fs.readFileSync(SUMMARIES_PATH, "utf8"));
    for (const [ticker, arr] of Object.entries(raw as Record<string, { quarter: string; summary: string; epsActual: number | null; surprisePct: number | null; priceMoveDay: number | null }[]>)) {
      summaries[ticker] = arr.slice(0, 2); // last 2 quarters for context
    }
  } catch { }

  const companies = tickerFilter
    ? COMPANY_UNIVERSE.filter((c) => c.ticker === tickerFilter)
    : COMPANY_UNIVERSE;

  console.log(`Checking ${companies.length} companies for upcoming earnings...`);

  for (const company of companies) {
    try {
      const next = await getNextEarningsDate(company.yahooSymbol);
      if (!next) {
        console.log(`  ${company.ticker}: no upcoming date`);
        continue;
      }

      const existing = store[company.ticker];
      if (existing?.nextDate === next.date && !force) {
        console.log(`  ${company.ticker}: preview current (${next.date}), skipping`);
        continue;
      }

      console.log(`\n▸ ${company.ticker} — earnings ${next.date}`);
      console.log(`  EPS est: ${next.epsEst ?? "?"}, Rev est: ${next.revEstB != null ? `$${next.revEstB}B` : "?"}`);

      const pastContext = summaries[company.ticker] ?? [];
      const { barToBeat, watchPoints, bullSetup, bearSetup } = await generatePreview(
        company.ticker,
        company.name,
        next.date,
        next.epsEst,
        next.revEstB,
        pastContext,
      );

      store[company.ticker] = {
        ticker: company.ticker,
        companyName: company.name,
        nextDate: next.date,
        fiscalQuarter: quarterLabel(next.date),
        epsEst: next.epsEst,
        revEstB: next.revEstB,
        barToBeat,
        watchPoints,
        bullSetup,
        bearSetup,
        generatedAt: new Date().toISOString(),
      };

      fs.writeFileSync(PREVIEWS_PATH, JSON.stringify(store, null, 2));
      console.log(`  ✓ Preview written`);

      await sleep(800); // stay inside Groq rate limits
    } catch (e) {
      console.error(`  ✗ ${company.ticker}: ${e}`);
    }
  }

  const count = Object.keys(store).length;
  console.log(`\nDone. ${count} previews in ${PREVIEWS_PATH}`);
}

main().catch((e) => { console.error(e); process.exit(1); });
