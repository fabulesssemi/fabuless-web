/**
 * update-earnings-summaries.ts
 *
 * For each company in COMPANY_UNIVERSE:
 *   1. Fetch last 3 reported quarters' earnings dates + EPS/rev data from Yahoo Finance
 *   2. Locate the Motley Fool transcript URL (tries multiple slug patterns)
 *   3. Fetch + parse the transcript (management turns only)
 *   4. Call Groq (free) to generate a 3-sentence summary + key quote
 *   5. Compute stock price move on earnings day
 *   6. Write to data/earnings-summaries.json
 *
 * Run:
 *   cd ~/projects/fabuless-web
 *   GROQ_API_KEY=gsk_... npx tsx scripts/update-earnings-summaries.ts
 *
 * Or with --ticker=NVDA to refresh a single ticker.
 * Or with --force to regenerate existing summaries (otherwise skips already-done quarters).
 */

import fs from "fs";
import path from "path";
import Groq from "groq-sdk";
import YahooFinance from "yahoo-finance2";
import { COMPANY_UNIVERSE } from "../lib/companies";
import type { EarningsSummary, EarningsSummariesStore } from "../lib/earnings/summaries";

const yf = new YahooFinance({ suppressNotices: ["yahooSurvey"] });
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const DATA_PATH = path.resolve(__dirname, "../data/earnings-summaries.json");
const FOOL_BASE = "https://www.fool.com/earnings/call-transcripts";

// ── Motley Fool company slug map ──────────────────────────────────────────────
// The part before "-{q}{year}-earnings..." in Motley Fool URLs.
// Find by Googling: "[company] earnings call transcript site:fool.com"
const FOOL_COMPANY_SLUG: Record<string, string> = {
  NVDA:      "nvidia-nvda",
  AMD:       "advanced-micro-devices-amd",
  AVGO:      "broadcom-avgo",
  MRVL:      "marvell-technology-mrvl",
  TSM:       "taiwan-semiconductor-manufacturing-tsm",
  ASML:      "asml-asml",
  ARM:       "arm-holdings-arm",
  MU:        "micron-technology-mu",
  INTC:      "intel-intc",
  QCOM:      "qualcomm-qcom",
  AMAT:      "applied-materials-amat",
  LRCX:      "lam-research-lrcx",
  KLAC:      "kla-klac",
  SNPS:      "synopsys-snps",
  CDNS:      "cadence-design-systems-cdns",
  GFS:       "globalfoundries-gfs",
  ASX:       "ase-technology-holding-asx",
  AMKR:      "amkor-technology-amkr",
  ALAB:      "astera-labs-alab",
  SMCI:      "super-micro-computer-smci",
  DELL:      "dell-technologies-dell",
  ANET:      "arista-networks-anet",
  COHR:      "coherent-cohr",
  LITE:      "lumentum-holdings-lite",
  FN:        "fabrinet-fn",
  AAPL:      "apple-aapl",
  GOOGL:     "alphabet-googl",
  AMZN:      "amazon-amzn",
  MSFT:      "microsoft-msft",
  META:      "meta-platforms-meta",
  ORCL:      "oracle-orcl",
  CRWV:      "coreweave-crwv",
  // Non-US — Motley Fool coverage is sparse; will gracefully fail
  "000660.KS": "",
  "005930.KS": "",
  "4063.T":    "",
  "3436.T":    "",
  "8035.T":    "",
  "BESI":    "be-semiconductor-industries-besi",
  "2317.TW": "",
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function sleep(ms: number) { return new Promise((r) => setTimeout(r, ms)); }

function fmtMillions(n: number | null): number | null {
  return n != null ? Math.round(n / 1e6) : null;
}

function quarterLabel(date: string): string {
  const d = new Date(date + "T12:00:00Z");
  const q = Math.ceil((d.getMonth() + 1) / 3);
  return `Q${q} ${d.getFullYear()}`;
}

/** Candidate Motley Fool URLs for a ticker on a given earnings date. */
function candidateUrls(ticker: string, date: string): string[] {
  const slug = FOOL_COMPANY_SLUG[ticker];
  if (!slug) return [];

  const d = new Date(date + "T12:00:00Z");
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const q = Math.ceil((d.getMonth() + 1) / 3);

  const urls: string[] = [];
  // Try report date and ±2 days (transcript is usually posted same day or next day)
  for (let offset = 0; offset <= 2; offset++) {
    const trial = new Date(d);
    trial.setDate(trial.getDate() + offset);
    const ty = trial.getFullYear();
    const tm = String(trial.getMonth() + 1).padStart(2, "0");
    const td = String(trial.getDate()).padStart(2, "0");
    const prefix = `${FOOL_BASE}/${ty}/${tm}/${td}/${slug}`;

    // Fiscal year labeling — Motley Fool uses fiscal year for some companies (NVDA uses FY)
    // Try both calendar year quarter and fiscal year quarter labels
    const calLabel = `q${q}-${yyyy}`;
    const fyLabel = `q${q}-${yyyy + 1}`; // for companies with Jan fiscal year (e.g. NVDA Q1 FY27 = cal Q1 2026)

    urls.push(`${prefix}-${calLabel}-earnings-call-transcript/`);
    urls.push(`${prefix}-${calLabel}-earnings-transcript/`);
    urls.push(`${prefix}-${fyLabel}-earnings-call-transcript/`);
    urls.push(`${prefix}-${fyLabel}-earnings-transcript/`);
  }
  return [...new Set(urls)]; // deduplicate
}

async function headOk(url: string): Promise<boolean> {
  try {
    const r = await fetch(url, { method: "HEAD", redirect: "follow",
      headers: { "User-Agent": "Mozilla/5.0 (compatible; Fabuless/1.0)" } });
    return r.ok;
  } catch { return false; }
}

async function findTranscriptUrl(ticker: string, date: string): Promise<string | null> {
  const candidates = candidateUrls(ticker, date);
  for (const url of candidates) {
    if (await headOk(url)) return url;
    await sleep(200);
  }
  return null;
}

async function fetchTranscriptText(url: string): Promise<string | null> {
  try {
    const r = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; Fabuless/1.0)" },
    });
    if (!r.ok) return null;
    const html = await r.text();

    // Extract text from <p> tags inside the article body
    // Motley Fool: speaker labels are <p><strong>Name</strong></p>
    // Body text is plain <p> paragraphs
    const paragraphs: string[] = [];
    const pRegex = /<p[^>]*>([\s\S]*?)<\/p>/gi;
    let match;
    while ((match = pRegex.exec(html)) !== null) {
      // Strip HTML tags from paragraph
      const text = match[1].replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
      if (text.length > 20) paragraphs.push(text);
    }

    // Skip boilerplate
    const boilerplate = [
      "this article is a transcript",
      "fool transcripts",
      "call participants",
      "more earnings call transcripts",
      "advertisement",
      "premium investing services",
    ];
    const filtered = paragraphs.filter(
      (p) => !boilerplate.some((b) => p.toLowerCase().includes(b))
    );

    return filtered.join("\n\n");
  } catch { return null; }
}

/** Call Claude to summarize transcript + extract key quote. */
async function summarize(ticker: string, company: string, quarter: string, transcriptText: string, epsActual: number | null, epsEstimate: number | null, revActualM: number | null, revEstimateM: number | null, priceMoveDay: number | null): Promise<{ summary: string; keyQuote: string | null }> {
  // Send at most ~6000 chars (mostly prepared remarks)
  const truncated = transcriptText.slice(0, 6000);

  const context = [
    epsActual != null && epsEstimate != null
      ? `EPS: actual $${epsActual.toFixed(2)} vs estimate $${epsEstimate.toFixed(2)} (${epsActual >= epsEstimate ? "beat" : "miss"})`
      : null,
    revActualM != null && revEstimateM != null
      ? `Revenue: actual $${(revActualM / 1000).toFixed(1)}B vs estimate $${(revEstimateM / 1000).toFixed(1)}B`
      : null,
    priceMoveDay != null
      ? `Stock moved ${priceMoveDay >= 0 ? "+" : ""}${priceMoveDay.toFixed(1)}% on earnings day`
      : null,
  ].filter(Boolean).join(". ");

  const prompt = `You are summarizing a ${company} (${ticker}) earnings call for ${quarter}.

Financial context: ${context || "No financial data available."}

Transcript excerpt:
${truncated}

Write a 3-sentence earnings summary:
1. What the headline results were and how they compared to expectations
2. The main narrative or theme management emphasized on the call
3. What guidance or outlook management gave, and why the stock moved the way it did

Then extract the single most important quote from management (if there is one worth highlighting — skip if the transcript is sparse).

Respond in this exact JSON format:
{
  "summary": "...",
  "keyQuote": "..." or null
}`;

  const msg = await groq.chat.completions.create({
    model: "llama-3.1-70b-versatile",
    max_tokens: 600,
    messages: [{ role: "user", content: prompt }],
  });

  const text = msg.choices[0]?.message?.content ?? "";
  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        summary: parsed.summary ?? "",
        keyQuote: parsed.keyQuote ?? null,
      };
    }
  } catch { /* fall through */ }
  return { summary: text.trim(), keyQuote: null };
}

/** % price change on or around the earnings date. */
async function getPriceMoveDay(symbol: string, date: string): Promise<number | null> {
  try {
    const from = new Date(date + "T00:00:00Z");
    from.setDate(from.getDate() - 2);
    const to = new Date(date + "T00:00:00Z");
    to.setDate(to.getDate() + 3);

    const rows = await yf.historical(
      symbol,
      { period1: from, period2: to, interval: "1d" },
      { validateResult: false },
    ) as unknown as { date: Date; close?: number; adjClose?: number }[];

    // Find the trading day on or after the earnings date, and the day before it
    const closes = rows.map((r) => ({
      date: r.date.toISOString().slice(0, 10),
      close: r.adjClose ?? r.close ?? 0,
    })).sort((a, b) => a.date.localeCompare(b.date));

    const idx = closes.findIndex((c) => c.date >= date);
    if (idx < 1) return null;
    const prev = closes[idx - 1].close;
    const curr = closes[idx].close;
    if (!prev) return null;
    return Math.round(((curr - prev) / prev) * 1000) / 10;
  } catch { return null; }
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function processCompany(
  ticker: string,
  symbol: string,
  company: string,
  store: EarningsSummariesStore,
  force: boolean,
): Promise<EarningsSummary[]> {
  console.log(`\n▸ ${ticker} (${company})`);

  // 1. Fetch earnings history from Yahoo
  let history: { date: string; epsActual: number | null; epsEstimate: number | null; surprisePct: number | null; revActual: number | null; revEstimate: number | null }[] = [];
  try {
    const summary = await yf.quoteSummary(
      symbol,
      { modules: ["earningsHistory", "earningsTrend"] as never[] },
      { validateResult: false },
    ) as unknown as {
      earningsHistory?: {
        history?: {
          quarter?: { raw: number };
          epsActual?: { raw: number };
          epsEstimate?: { raw: number };
          surprisePercent?: { raw: number };
          period?: string;
        }[];
      };
    };

    history = (summary.earningsHistory?.history ?? [])
      .filter((h) => h.quarter?.raw)
      .map((h) => {
        const ts = h.quarter!.raw * 1000;
        return {
          date: new Date(ts).toISOString().slice(0, 10),
          epsActual: h.epsActual?.raw ?? null,
          epsEstimate: h.epsEstimate?.raw ?? null,
          surprisePct: h.surprisePercent?.raw != null
            ? Math.round(h.surprisePercent.raw * 100 * 10) / 10
            : null,
          revActual: null,   // Yahoo earningsHistory doesn't have revenue; skip
          revEstimate: null,
        };
      })
      .sort((a, b) => b.date.localeCompare(a.date)) // most recent first
      .slice(0, 3); // last 3 quarters
  } catch (e) {
    console.log(`  ✗ Yahoo fetch failed: ${e}`);
    return store[ticker] ?? [];
  }

  if (history.length === 0) {
    console.log(`  ✗ No earnings history from Yahoo`);
    return store[ticker] ?? [];
  }

  const existing = store[ticker] ?? [];
  const results: EarningsSummary[] = [...existing];

  for (const h of history) {
    const quarter = quarterLabel(h.date);
    const alreadyDone = existing.some((e) => e.date === h.date && e.summary);
    if (alreadyDone && !force) {
      console.log(`  ✓ ${quarter} — already done, skipping`);
      continue;
    }

    console.log(`  → ${quarter} (${h.date})`);

    // 2. Find Motley Fool transcript URL
    const transcriptUrl = await findTranscriptUrl(ticker, h.date);
    if (!transcriptUrl) {
      console.log(`    ✗ No Motley Fool transcript found`);
      // Still create a minimal entry with just the numbers
      const idx = results.findIndex((e) => e.date === h.date);
      const entry: EarningsSummary = {
        ticker, quarter, date: h.date,
        epsActual: h.epsActual, epsEstimate: h.epsEstimate, surprisePct: h.surprisePct,
        revActual: h.revActual, revEstimate: h.revEstimate,
        priceMoveDay: await getPriceMoveDay(symbol, h.date),
        summary: "",
        keyQuote: null,
        transcriptUrl: null,
        generatedAt: new Date().toISOString(),
      };
      if (idx >= 0) results[idx] = entry; else results.push(entry);
      await sleep(500);
      continue;
    }
    console.log(`    ✓ Transcript: ${transcriptUrl}`);

    // 3. Fetch transcript text
    const transcriptText = await fetchTranscriptText(transcriptUrl);
    if (!transcriptText) {
      console.log(`    ✗ Failed to fetch transcript`);
      continue;
    }
    console.log(`    ✓ Fetched ${transcriptText.length} chars`);

    // 4. Stock price move
    const priceMoveDay = await getPriceMoveDay(symbol, h.date);
    console.log(`    ✓ Price move: ${priceMoveDay != null ? `${priceMoveDay >= 0 ? "+" : ""}${priceMoveDay}%` : "N/A"}`);

    // 5. Claude summary
    console.log(`    → Generating summary with Claude...`);
    const { summary, keyQuote } = await summarize(
      ticker, company, quarter, transcriptText,
      h.epsActual, h.epsEstimate,
      fmtMillions(h.revActual), fmtMillions(h.revEstimate),
      priceMoveDay,
    );
    console.log(`    ✓ Summary generated`);

    const entry: EarningsSummary = {
      ticker, quarter, date: h.date,
      epsActual: h.epsActual, epsEstimate: h.epsEstimate, surprisePct: h.surprisePct,
      revActual: fmtMillions(h.revActual), revEstimate: fmtMillions(h.revEstimate),
      priceMoveDay,
      summary,
      keyQuote: keyQuote ?? null,
      transcriptUrl,
      generatedAt: new Date().toISOString(),
    };

    const idx = results.findIndex((e) => e.date === h.date);
    if (idx >= 0) results[idx] = entry; else results.push(entry);

    await sleep(1000); // rate limiting between Claude calls
  }

  // Sort by date descending (most recent first), keep last 3
  return results
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 3);
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
  let store: EarningsSummariesStore = {};
  try {
    store = JSON.parse(fs.readFileSync(DATA_PATH, "utf8"));
  } catch { /* start fresh */ }

  const companies = tickerFilter
    ? COMPANY_UNIVERSE.filter((c) => c.ticker === tickerFilter)
    : COMPANY_UNIVERSE;

  if (tickerFilter && companies.length === 0) {
    console.error(`Ticker ${tickerFilter} not found in COMPANY_UNIVERSE`);
    process.exit(1);
  }

  console.log(`Processing ${companies.length} companies...`);

  for (const company of companies) {
    try {
      const summaries = await processCompany(
        company.ticker,
        company.yahooSymbol,
        company.name,
        store,
        force,
      );
      if (summaries.length > 0) {
        store[company.ticker] = summaries;
      }
      // Write after each company so partial runs are saved
      fs.writeFileSync(DATA_PATH, JSON.stringify(store, null, 2));
      await sleep(500);
    } catch (e) {
      console.error(`  ✗ Error processing ${company.ticker}: ${e}`);
    }
  }

  console.log(`\nDone. Data written to ${DATA_PATH}`);
  const total = Object.values(store).reduce((s, arr) => s + arr.length, 0);
  const withSummary = Object.values(store).reduce((s, arr) => s + arr.filter((e) => e.summary).length, 0);
  console.log(`${total} quarters total, ${withSummary} with full summaries.`);
}

main().catch((e) => { console.error(e); process.exit(1); });
