/**
 * update-earnings-summaries.ts
 *
 * For each company in COMPANY_UNIVERSE:
 *   1. Fetch last 2 reported quarters from Yahoo Finance (EPS + quarter dates)
 *   2. Fetch earnings press release from SEC EDGAR (smarter filename matching)
 *   3. Fetch revenue actuals from FMP income statement (stable endpoint)
 *   4. Use Groq (llama-3.3-70b) to generate an investor-grade summary
 *   5. Compute stock price move on earnings day via Yahoo
 *   6. Write to data/earnings-summaries.json
 *
 * Run:
 *   GROQ_API_KEY=gsk_... FMP_API_KEY=... npx tsx scripts/update-earnings-summaries.ts
 *   GROQ_API_KEY=gsk_... FMP_API_KEY=... npx tsx scripts/update-earnings-summaries.ts --ticker=NVDA
 *   GROQ_API_KEY=gsk_... FMP_API_KEY=... npx tsx scripts/update-earnings-summaries.ts --force
 */

import fs from "fs";
import path from "path";
import Groq from "groq-sdk";
import YahooFinance from "yahoo-finance2";
import { COMPANY_UNIVERSE } from "../lib/companies";
import type { EarningsSummary, EarningsSummariesStore } from "../lib/earnings/summaries";

// ── env ───────────────────────────────────────────────────────────────────────
try {
  const lines = fs.readFileSync(path.resolve(process.cwd(), ".env.local"), "utf-8").split("\n");
  for (const line of lines) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const eq = t.indexOf("=");
    if (eq === -1) continue;
    const k = t.slice(0, eq).trim();
    const v = t.slice(eq + 1).trim().replace(/^['"]|['"]$/g, "");
    if (!(k in process.env)) process.env[k] = v;
  }
} catch { /* CI injects env */ }

const yf = new YahooFinance({ suppressNotices: ["yahooSurvey", "ripHistorical"] });
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const DATA_PATH = path.resolve(__dirname, "../data/earnings-summaries.json");
const FMP_BASE = "https://financialmodelingprep.com/stable";
const EDGAR_UA = "Fabuless aharrick05@gmail.com";

// ── CIK map ───────────────────────────────────────────────────────────────────
const TICKER_CIK: Record<string, string> = {
  NVDA:  "0001045810",
  AMD:   "0000002488",
  AVGO:  "0001730168",
  MRVL:  "0001835632",
  TSM:   "0001046179",
  ASML:  "0000937966",
  ARM:   "0001973239",
  MU:    "0000723125",
  INTC:  "0000050863",
  QCOM:  "0000804328",
  AMAT:  "0000006951",
  LRCX:  "0000707549",
  KLAC:  "0000319201",
  SNPS:  "0000883241",
  CDNS:  "0000813672",
  GFS:   "0001709048",
  ASX:   "0001122411",
  AMKR:  "0001090425",
  ALAB:  "0001736297",
  SMCI:  "0001375365",
  DELL:  "0001571123",
  ANET:  "0001596532",
  COHR:  "0000021175",
  LITE:  "0001633978",
  FN:    "0001408710",
  AAPL:  "0000320193",
  GOOGL: "0001652044",
  AMZN:  "0001018724",
  MSFT:  "0000789019",
  META:  "0001326801",
  ORCL:  "0001341439",
  CRWV:  "0002053914",
};

const SIX_K_FILERS = new Set(["TSM", "ASML", "ARM", "GFS", "ASX"]);

// ── Helpers ───────────────────────────────────────────────────────────────────

function sleep(ms: number) { return new Promise((r) => setTimeout(r, ms)); }

function quarterLabel(date: string): string {
  const d = new Date(date + "T12:00:00Z");
  const q = Math.ceil((d.getMonth() + 1) / 3);
  return `Q${q} ${d.getFullYear()}`;
}

function stripHtml(html: string): string {
  return html
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&#8220;|&#8221;|&ldquo;|&rdquo;/g, '"')
    .replace(/&#8212;|&#8213;|&mdash;/g, "—")
    .replace(/&#58;/g, ":")
    .replace(/&#8226;/g, "•")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function fmtRev(millions: number | null): string {
  if (millions == null) return "N/A";
  if (millions >= 1000) return `$${(millions / 1000).toFixed(2)}B`;
  return `$${millions.toFixed(0)}M`;
}

// ── EDGAR press release fetcher ───────────────────────────────────────────────

// Filename patterns that indicate an earnings press release
const PR_PATTERNS = [
  /pr\.htm/i, /pressrelease/i, /press.?rel/i,
  /earnings/i, /results/i, /financial.?results/i,
  /quarterly/i, /ex.?99/i,
];

// Filename patterns that indicate administrative filings (skip these)
const SKIP_PATTERNS = [
  /compensation/i, /director/i, /amendment/i, /bylaws/i,
  /governance/i, /cfocommentary/i, /supplement/i,
];

function isPressRelease(filename: string): boolean {
  const lower = filename.toLowerCase();
  if (SKIP_PATTERNS.some((p) => p.test(lower))) return false;
  return PR_PATTERNS.some((p) => p.test(lower));
}

async function fetchEdgarPressRelease(ticker: string, quarterEndDate: string): Promise<{ text: string; url: string } | null> {
  const cik = TICKER_CIK[ticker];
  if (!cik) return null;

  const targetForm = SIX_K_FILERS.has(ticker) ? "6-K" : "8-K";
  const cikDecimal = cik.replace(/^0+/, "");

  // Earnings calls happen 14-45 days after quarter end (most within 35)
  const windowStart = quarterEndDate;
  const windowEnd = new Date(quarterEndDate + "T00:00:00Z");
  windowEnd.setDate(windowEnd.getDate() + 50);
  const windowEndStr = windowEnd.toISOString().slice(0, 10);

  try {
    const subUrl = `https://data.sec.gov/submissions/CIK${cik}.json`;
    const subR = await fetch(subUrl, { headers: { "User-Agent": EDGAR_UA } });
    if (!subR.ok) return null;

    const sub = await subR.json() as {
      filings: { recent: { form: string[]; filingDate: string[]; accessionNumber: string[]; primaryDocument: string[] } };
    };

    const { form, filingDate, accessionNumber, primaryDocument } = sub.filings.recent;

    const candidates = form
      .map((f, i) => ({ form: f, date: filingDate[i], acc: accessionNumber[i], doc: primaryDocument[i] }))
      .filter((f) => f.form === targetForm && f.date >= windowStart && f.date <= windowEndStr);

    if (candidates.length === 0) return null;

    for (const filing of candidates) {
      const accClean = filing.acc.replace(/-/g, "");
      const indexJsonUrl = `https://www.sec.gov/Archives/edgar/data/${cikDecimal}/${accClean}/index.json`;

      const idxR = await fetch(indexJsonUrl, { headers: { "User-Agent": EDGAR_UA } });
      if (!idxR.ok) continue;

      const idx = await idxR.json() as { directory?: { item?: { name: string; type: string }[] } };
      const items = idx.directory?.item ?? [];

      // Prefer files that match press release patterns, skip admin filings
      const prFiles = items.filter((it) => isPressRelease(it.name));
      const toTry = prFiles.length > 0
        ? prFiles.map((it) => it.name)
        : [filing.doc];

      for (const file of toTry) {
        const fileUrl = `https://www.sec.gov/Archives/edgar/data/${cikDecimal}/${accClean}/${file}`;
        const fileR = await fetch(fileUrl, { headers: { "User-Agent": EDGAR_UA } });
        if (!fileR.ok) continue;

        const html = await fileR.text();
        const text = stripHtml(html);

        if (text.length < 800) continue;
        const lower = text.toLowerCase();
        // Must look like an earnings release
        if (!lower.includes("revenue") || !lower.includes("quarter")) continue;
        if (lower.includes("board of directors") && lower.includes("compensation") && !lower.includes("earnings per")) continue;

        return { text: text.slice(0, 9000), url: fileUrl };
      }

      await sleep(200);
    }

    return null;
  } catch { return null; }
}

// ── FMP: Revenue actuals from income statement ────────────────────────────────

async function fetchFmpRevenue(symbol: string): Promise<Map<string, number>> {
  const apiKey = process.env.FMP_API_KEY;
  if (!apiKey) return new Map();

  try {
    const url = `${FMP_BASE}/income-statement?symbol=${symbol}&period=quarter&limit=8&apikey=${apiKey}`;
    const r = await fetch(url);
    if (!r.ok) return new Map();

    const data = await r.json() as Array<{ date: string; revenue: number }>;
    if (!Array.isArray(data)) return new Map();

    const map = new Map<string, number>();
    for (const row of data) {
      if (row.date && row.revenue) {
        map.set(row.date.slice(0, 10), row.revenue / 1_000_000); // → millions
      }
    }
    return map;
  } catch { return new Map(); }
}

// ── Groq summarizer ───────────────────────────────────────────────────────────

async function summarize(
  ticker: string, company: string, quarter: string,
  sourceText: string,
  epsActual: number | null, epsEstimate: number | null,
  revActual: number | null,
  priceMoveDay: number | null,
): Promise<{ summary: string; keyQuote: string | null }> {
  const epsBeat = epsActual != null && epsEstimate != null
    ? `EPS $${epsActual.toFixed(2)} actual vs $${epsEstimate.toFixed(2)} estimate (${epsActual >= epsEstimate ? "BEAT" : "MISS"} by ${Math.abs(((epsActual - epsEstimate) / epsEstimate) * 100).toFixed(1)}%)`
    : null;
  const revLine = revActual != null ? `Revenue ${fmtRev(revActual)} actual` : null;
  const stockLine = priceMoveDay != null
    ? `Stock moved ${priceMoveDay >= 0 ? "+" : ""}${priceMoveDay.toFixed(1)}% on earnings day`
    : null;

  const context = [epsBeat, revLine, stockLine].filter(Boolean).join(" | ");

  const prompt = `You are writing an earnings recap for ${company} (${ticker}) ${quarter} for a semiconductor equity investor.

Known data: ${context || "See source below."}

Earnings press release:
${sourceText}

Write a 3-sentence investor summary that gives REAL SIGNAL — no fluff:
1. Headline results: EPS and revenue vs expectations, and which specific business SEGMENTS drove the beat or miss (e.g. data center, gaming, automotive, memory). Use the actual numbers.
2. What drove performance: the specific product lines, customers, or macro trends management cited. What were investors most focused on going in, and did reality match?
3. What drove the stock reaction: was it the headline beat, the forward guidance, a specific segment surprise, or something from management's commentary?

Then extract the single best CEO or CFO quote from the text — one that explains drivers or outlook, not a platitude about "strong execution."

Respond with JSON only, no markdown:
{"summary": "...", "keyQuote": "..." or null}`;

  const msg = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    max_tokens: 600,
    temperature: 0.1,
    messages: [{ role: "user", content: prompt }],
  });

  const text = msg.choices[0]?.message?.content ?? "";
  try {
    const m = text.match(/\{[\s\S]*\}/);
    if (m) {
      const p = JSON.parse(m[0]);
      return { summary: p.summary ?? "", keyQuote: p.keyQuote ?? null };
    }
  } catch { /* fall through */ }
  return { summary: text.trim(), keyQuote: null };
}

// ── Price move ────────────────────────────────────────────────────────────────

async function getPriceMoveDay(symbol: string, quarterEndDate: string): Promise<{ pct: number | null; callDate: string | null }> {
  try {
    const from = new Date(quarterEndDate + "T00:00:00Z");
    const to = new Date(quarterEndDate + "T00:00:00Z");
    to.setDate(to.getDate() + 55);

    const rows = await yf.chart(symbol, { period1: from, period2: to, interval: "1d" }) as unknown as {
      quotes?: { date: Date; close?: number | null }[];
    };

    const closes = (rows.quotes ?? [])
      .filter((r) => r.close != null)
      .map((r) => ({ date: r.date.toISOString().slice(0, 10), close: r.close! }))
      .sort((a, b) => a.date.localeCompare(b.date));

    if (closes.length < 2) return { pct: null, callDate: null };

    let maxMove = 0, callDate = null, callPct = null;
    for (let i = 1; i < closes.length; i++) {
      const pct = Math.abs((closes[i].close - closes[i - 1].close) / closes[i - 1].close);
      if (pct > maxMove) {
        maxMove = pct;
        callDate = closes[i].date;
        callPct = Math.round(((closes[i].close - closes[i - 1].close) / closes[i - 1].close) * 1000) / 10;
      }
    }
    return { pct: callPct, callDate };
  } catch { return { pct: null, callDate: null }; }
}

// ── Yahoo earnings history ────────────────────────────────────────────────────

function toDateStr(v: Date | string | number | undefined | null): string | null {
  if (v == null) return null;
  if (v instanceof Date) return v.toISOString().slice(0, 10);
  if (typeof v === "string") return v.slice(0, 10);
  if (typeof v === "number") return new Date(v * 1000).toISOString().slice(0, 10);
  return null;
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function processCompany(
  ticker: string, symbol: string, company: string,
  store: EarningsSummariesStore, force: boolean,
): Promise<EarningsSummary[]> {
  console.log(`\n▸ ${ticker} (${company})`);

  // 1. Yahoo: EPS history + quarter end dates
  let history: { date: string; epsActual: number | null; epsEstimate: number | null; surprisePct: number | null }[] = [];
  try {
    const s = await yf.quoteSummary(symbol, { modules: ["earningsHistory"] as never[] }, { validateResult: false }) as unknown as {
      earningsHistory?: { history?: { quarter?: Date | string | number; epsActual?: number; epsEstimate?: number; surprisePercent?: number }[] };
    };
    history = (s.earningsHistory?.history ?? [])
      .filter((h) => h.quarter != null)
      .map((h) => {
        const date = toDateStr(h.quarter);
        if (!date) return null;
        return {
          date,
          epsActual: h.epsActual ?? null,
          epsEstimate: h.epsEstimate ?? null,
          surprisePct: h.surprisePercent != null ? Math.round(h.surprisePercent * 100 * 10) / 10 : null,
        };
      })
      .filter((h): h is NonNullable<typeof h> => h !== null)
      .sort((a, b) => b.date.localeCompare(a.date))
      .slice(0, 2);
  } catch (e) {
    console.log(`  ✗ Yahoo fetch failed: ${e}`);
    return store[ticker] ?? [];
  }

  if (history.length === 0) {
    console.log(`  ✗ No earnings history from Yahoo`);
    return store[ticker] ?? [];
  }

  // 2. FMP: revenue actuals for this company (one call covers all quarters)
  const revenueMap = await fetchFmpRevenue(symbol);
  await sleep(300);

  const existing = store[ticker] ?? [];
  const results: EarningsSummary[] = [...existing];

  for (const h of history) {
    const quarter = quarterLabel(h.date);
    const alreadyDone = existing.some((e) => e.date === h.date && e.summary);
    if (alreadyDone && !force) {
      console.log(`  ✓ ${quarter} — already done, skipping`);
      continue;
    }

    console.log(`  → ${quarter} (quarter end: ${h.date})`);

    // 3. Price move
    const { pct: priceMoveDay, callDate } = await getPriceMoveDay(symbol, h.date);
    if (callDate) console.log(`    ✓ Earnings day: ${callDate} (${priceMoveDay != null ? `${priceMoveDay >= 0 ? "+" : ""}${priceMoveDay}%` : "?"})`);

    // 4. EDGAR press release
    console.log(`    → Fetching EDGAR press release...`);
    const source = await fetchEdgarPressRelease(ticker, h.date);
    if (source) {
      console.log(`    ✓ Found: ${source.url}`);
    } else {
      console.log(`    ✗ No press release found`);
    }

    // 5. Revenue from FMP income statement — match date within 45 days of quarter end
    let revActual: number | null = null;
    for (const [date, rev] of revenueMap) {
      const diff = Math.abs(new Date(date).getTime() - new Date(h.date + "T00:00:00Z").getTime());
      if (diff < 45 * 24 * 60 * 60 * 1000) { revActual = rev; break; }
    }

    // 6. Groq summary
    let summary = "";
    let keyQuote: string | null = null;
    if (source) {
      console.log(`    → Summarizing...`);
      const result = await summarize(ticker, company, quarter, source.text, h.epsActual, h.epsEstimate, revActual, priceMoveDay);
      summary = result.summary;
      keyQuote = result.keyQuote;
      console.log(`    ✓ Done`);
    }

    const entry: EarningsSummary = {
      ticker, quarter, date: h.date,
      epsActual: h.epsActual, epsEstimate: h.epsEstimate, surprisePct: h.surprisePct,
      revActual, revEstimate: null,
      priceMoveDay,
      summary,
      keyQuote,
      transcriptUrl: source?.url ?? null,
      generatedAt: new Date().toISOString(),
    };

    const idx = results.findIndex((e) => e.date === h.date);
    if (idx >= 0) results[idx] = entry; else results.push(entry);

    await sleep(800);
  }

  return results.sort((a, b) => b.date.localeCompare(a.date)).slice(0, 3);
}

async function main() {
  const args = process.argv.slice(2);
  const tickerFilter = args.find((a) => a.startsWith("--ticker="))?.split("=")[1]?.toUpperCase();
  const force = args.includes("--force");

  if (!process.env.GROQ_API_KEY) {
    console.error("GROQ_API_KEY required — get a free key at console.groq.com");
    process.exit(1);
  }
  if (!process.env.FMP_API_KEY) {
    console.error("FMP_API_KEY required — get a free key at site.financialmodelingprep.com");
    process.exit(1);
  }

  let store: EarningsSummariesStore = {};
  try { store = JSON.parse(fs.readFileSync(DATA_PATH, "utf8")); } catch { }

  const companies = tickerFilter
    ? COMPANY_UNIVERSE.filter((c) => c.ticker === tickerFilter)
    : COMPANY_UNIVERSE;

  if (tickerFilter && companies.length === 0) {
    console.error(`Ticker ${tickerFilter} not in COMPANY_UNIVERSE`);
    process.exit(1);
  }

  console.log(`Processing ${companies.length} companies...`);

  for (const company of companies) {
    try {
      const summaries = await processCompany(company.ticker, company.yahooSymbol, company.name, store, force);
      if (summaries.length > 0) store[company.ticker] = summaries;
      fs.writeFileSync(DATA_PATH, JSON.stringify(store, null, 2));
      await sleep(500);
    } catch (e) {
      console.error(`  ✗ ${company.ticker}: ${e}`);
    }
  }

  const total = Object.values(store).reduce((s, arr) => s + arr.length, 0);
  const withSummary = Object.values(store).reduce((s, arr) => s + arr.filter((e) => e.summary).length, 0);
  console.log(`\nDone. ${total} quarters total, ${withSummary} with summaries.`);
}

main().catch((e) => { console.error(e); process.exit(1); });
