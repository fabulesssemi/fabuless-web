/**
 * update-earnings-summaries.ts
 *
 * For each company in COMPANY_UNIVERSE:
 *   1. Fetch last 3 reported quarters from Yahoo Finance (EPS data + dates)
 *   2. Find the earnings press release on SEC EDGAR (8-K filing, always free/reliable)
 *   3. Fallback: try Motley Fool transcript for full Q&A color
 *   4. Call Groq (free) to generate a 3-sentence summary + key quote
 *   5. Compute stock price move on earnings day
 *   6. Write to data/earnings-summaries.json
 *
 * Run:
 *   GROQ_API_KEY=gsk_... npx tsx scripts/update-earnings-summaries.ts
 *   GROQ_API_KEY=gsk_... npx tsx scripts/update-earnings-summaries.ts --ticker=NVDA
 *   GROQ_API_KEY=gsk_... npx tsx scripts/update-earnings-summaries.ts --force
 */

import fs from "fs";
import path from "path";
import Groq from "groq-sdk";
import YahooFinance from "yahoo-finance2";
import { COMPANY_UNIVERSE } from "../lib/companies";
import type { EarningsSummary, EarningsSummariesStore } from "../lib/earnings/summaries";

const yf = new YahooFinance({ suppressNotices: ["yahooSurvey", "ripHistorical"] });
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const DATA_PATH = path.resolve(__dirname, "../data/earnings-summaries.json");
const FOOL_BASE = "https://www.fool.com/earnings/call-transcripts";
// EDGAR requires a User-Agent with contact info
const EDGAR_UA = "Fabuless aharrick05@gmail.com";

// ── CIK map — SEC Central Index Key for each ticker ──────────────────────────
// Look up at: https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&company=nvidia&CIK=&type=8-K
const TICKER_CIK: Record<string, string> = {
  NVDA:  "0001045810",
  AMD:   "0000002488",
  AVGO:  "0001730168",
  MRVL:  "0001835632",
  TSM:   "0001046179",
  ASML:  "0000937556",
  ARM:   "0001973239",
  MU:    "0000723125",
  INTC:  "0000050863",
  QCOM:  "0000804328",
  AMAT:  "0000006951",
  LRCX:  "0000707549",
  KLAC:  "0000319201",
  SNPS:  "0000883241",
  CDNS:  "0000813672",
  GFS:   "0001816316",
  ASX:   "0001109189",
  AMKR:  "0001090425",
  ALAB:  "0001990169",
  SMCI:  "0000910638",
  DELL:  "0001571123",
  ANET:  "0001313925",
  COHR:  "0000021175",
  LITE:  "0001166388",
  FN:    "0001102993",
  AAPL:  "0000320193",
  GOOGL: "0001652044",
  AMZN:  "0001018724",
  MSFT:  "0000789019",
  META:  "0001326801",
  ORCL:  "0001341439",
  CRWV:  "0002053914",
};

// Motley Fool company slug map (fallback)
const FOOL_COMPANY_SLUG: Record<string, string> = {
  NVDA:  "nvidia-nvda",
  AMD:   "advanced-micro-devices-amd",
  AVGO:  "broadcom-avgo",
  MRVL:  "marvell-technology-mrvl",
  TSM:   "taiwan-semiconductor-manufacturing-tsm",
  ASML:  "asml-asml",
  ARM:   "arm-holdings-arm",
  MU:    "micron-technology-mu",
  INTC:  "intel-intc",
  QCOM:  "qualcomm-qcom",
  AMAT:  "applied-materials-amat",
  LRCX:  "lam-research-lrcx",
  KLAC:  "kla-klac",
  SNPS:  "synopsys-snps",
  CDNS:  "cadence-design-systems-cdns",
  GFS:   "globalfoundries-gfs",
  ASX:   "ase-technology-holding-asx",
  AMKR:  "amkor-technology-amkr",
  ALAB:  "astera-labs-alab",
  SMCI:  "super-micro-computer-smci",
  DELL:  "dell-technologies-dell",
  ANET:  "arista-networks-anet",
  COHR:  "coherent-cohr",
  LITE:  "lumentum-holdings-lite",
  FN:    "fabrinet-fn",
  AAPL:  "apple-aapl",
  GOOGL: "alphabet-googl",
  AMZN:  "amazon-amzn",
  MSFT:  "microsoft-msft",
  META:  "meta-platforms-meta",
  ORCL:  "oracle-orcl",
  CRWV:  "coreweave-crwv",
};

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
    .replace(/&#8212;|&mdash;/g, "—")
    .replace(/&#58;/g, ":")
    .replace(/&#8226;/g, "•")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

// ── EDGAR 8-K fetcher (PRIMARY) ───────────────────────────────────────────────

/**
 * Uses EDGAR submissions API to find earnings 8-K filings in a date window,
 * then fetches the press release exhibit (EX-99.1).
 */
async function fetchEdgar8K(ticker: string, quarterEndDate: string): Promise<{ text: string; url: string } | null> {
  const cik = TICKER_CIK[ticker];
  if (!cik) return null;

  const cikDecimal = cik.replace(/^0+/, "");
  const windowStart = quarterEndDate; // quarter end
  const windowEnd = new Date(quarterEndDate + "T00:00:00Z");
  windowEnd.setDate(windowEnd.getDate() + 65);
  const windowEndStr = windowEnd.toISOString().slice(0, 10);

  try {
    // 1. Fetch submission history — gives all 8-K filings with dates
    const subUrl = `https://data.sec.gov/submissions/CIK${cik}.json`;
    const subR = await fetch(subUrl, { headers: { "User-Agent": EDGAR_UA } });
    if (!subR.ok) return null;

    const sub = await subR.json() as {
      filings: {
        recent: {
          form: string[];
          filingDate: string[];
          accessionNumber: string[];
          primaryDocument: string[];
        };
      };
    };

    const { form, filingDate, accessionNumber, primaryDocument } = sub.filings.recent;

    // 2. Find 8-K filings in the earnings window
    const candidates = form
      .map((f, i) => ({ form: f, date: filingDate[i], acc: accessionNumber[i], doc: primaryDocument[i] }))
      .filter((f) => f.form === "8-K" && f.date >= windowStart && f.date <= windowEndStr);

    if (candidates.length === 0) return null;

    // 3. For each candidate 8-K, use the JSON index API to find EX-99 exhibit by TYPE
    for (const filing of candidates) {
      const accClean = filing.acc.replace(/-/g, "");
      const indexJsonUrl = `https://www.sec.gov/Archives/edgar/data/${cikDecimal}/${accClean}/index.json`;

      const idxR = await fetch(indexJsonUrl, { headers: { "User-Agent": EDGAR_UA } });
      if (!idxR.ok) continue;

      const idx = await idxR.json() as {
        directory?: { item?: { name: string; type: string }[] };
      };

      const items = idx.directory?.item ?? [];

      // Find EX-99.1 (press release) — by exhibit TYPE, not filename
      const exhibit = items.find((it) =>
        it.type === "EX-99.1" || it.type === "EX-99" || it.type === "EX-99.2"
      ) ?? items.find((it) => it.name.toLowerCase().includes("ex99"));

      const toTry = exhibit ? [exhibit.name] : [filing.doc];

      for (const file of toTry) {
        const fileUrl = `https://www.sec.gov/Archives/edgar/data/${cikDecimal}/${accClean}/${file}`;
        const fileR = await fetch(fileUrl, { headers: { "User-Agent": EDGAR_UA } });
        if (!fileR.ok) continue;

        const html = await fileR.text();
        const text = stripHtml(html);

        if (text.length < 1000) continue;
        const lower = text.toLowerCase();
        if (!lower.includes("revenue") && !lower.includes("earnings") && !lower.includes("quarter")) continue;

        return { text: text.slice(0, 8000), url: fileUrl };
      }

      await sleep(200);
    }

    return null;
  } catch { return null; }
}

// ── Motley Fool fallback ──────────────────────────────────────────────────────

async function headOk(url: string): Promise<boolean> {
  try {
    const r = await fetch(url, { method: "HEAD", redirect: "follow",
      headers: { "User-Agent": "Mozilla/5.0 (compatible; Fabuless/1.0)" } });
    return r.ok;
  } catch { return false; }
}

/** Try to find a Motley Fool transcript by searching their site for the company + quarter year. */
async function findMotleyFoolTranscript(ticker: string, quarterEndDate: string): Promise<{ text: string; url: string } | null> {
  const slug = FOOL_COMPANY_SLUG[ticker];
  if (!slug) return null;

  const d = new Date(quarterEndDate + "T12:00:00Z");
  const year = d.getFullYear();
  const q = Math.ceil((d.getMonth() + 1) / 3);

  // Build candidate URL slugs — try calendar year AND fiscal year labels, with/without "call"
  const labels = [
    `q${q}-${year}`, `q${q}-${year + 1}`, `q${q}-${year - 1}`,
  ];
  const suffixes = ["earnings-call-transcript", "earnings-transcript"];

  // Try dates from quarterEnd to quarterEnd + 60 days in 1-week jumps (less requests)
  const dates: string[] = [];
  for (let offset = 0; offset <= 60; offset += 7) {
    const trial = new Date(d);
    trial.setDate(trial.getDate() + offset);
    dates.push(`${trial.getFullYear()}/${String(trial.getMonth() + 1).padStart(2, "0")}/${String(trial.getDate()).padStart(2, "0")}`);
  }

  for (const datePath of dates) {
    for (const label of labels) {
      for (const suffix of suffixes) {
        const url = `${FOOL_BASE}/${datePath}/${slug}-${label}-${suffix}/`;
        if (await headOk(url)) {
          const r = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0 (compatible; Fabuless/1.0)" } });
          if (!r.ok) continue;
          const html = await r.text();
          const text = stripHtml(html).slice(0, 8000);
          if (text.length > 500) return { text, url };
        }
        await sleep(150);
      }
    }
  }
  return null;
}

// ── Groq summarizer ───────────────────────────────────────────────────────────

async function summarize(
  ticker: string, company: string, quarter: string,
  sourceText: string, sourceType: "EDGAR" | "MotleyFool",
  epsActual: number | null, epsEstimate: number | null,
  priceMoveDay: number | null,
): Promise<{ summary: string; keyQuote: string | null }> {
  const context = [
    epsActual != null && epsEstimate != null
      ? `EPS: actual $${epsActual.toFixed(2)} vs estimate $${epsEstimate.toFixed(2)} (${epsActual >= epsEstimate ? "beat" : "miss"})`
      : null,
    priceMoveDay != null
      ? `Stock moved ${priceMoveDay >= 0 ? "+" : ""}${priceMoveDay.toFixed(1)}% on earnings day`
      : null,
  ].filter(Boolean).join(". ");

  const sourceNote = sourceType === "EDGAR"
    ? "SEC 8-K earnings press release"
    : "Motley Fool earnings call transcript";

  const prompt = `You are summarizing ${company} (${ticker}) ${quarter} earnings for investors. Source: ${sourceNote}.

Financial context: ${context || "See source text."}

Source text:
${sourceText}

Write a 3-sentence earnings summary:
1. Headline results and how they compared to expectations (be specific with numbers from the text)
2. Main narrative or theme management emphasized — what drove results
3. Guidance or outlook, and why the stock moved the way it did

Then extract the single best CEO/CFO quote from the text (verbatim if present, else null).

JSON only, no markdown:
{"summary": "...", "keyQuote": "..." or null}`;

  const msg = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    max_tokens: 500,
    temperature: 0.2,
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
    to.setDate(to.getDate() + 65);

    const rows = await yf.chart(symbol, { period1: from, period2: to, interval: "1d" }) as unknown as {
      quotes?: { date: Date; close?: number | null }[];
    };

    const closes = (rows.quotes ?? [])
      .filter((r) => r.close != null)
      .map((r) => ({ date: r.date.toISOString().slice(0, 10), close: r.close! }))
      .sort((a, b) => a.date.localeCompare(b.date));

    if (closes.length < 2) return { pct: null, callDate: null };

    // Find biggest single-day move in window — likely the earnings day
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

  // 1. Fetch earnings history from Yahoo
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

    // 2. Price move (also tells us when the call happened)
    const { pct: priceMoveDay, callDate } = await getPriceMoveDay(symbol, h.date);
    if (callDate) console.log(`    ✓ Earnings call day: ${callDate} (${priceMoveDay != null ? `${priceMoveDay >= 0 ? "+" : ""}${priceMoveDay}%` : "?"})`);

    // 3. Fetch source text — EDGAR first, Motley Fool fallback
    let source: { text: string; url: string; type: "EDGAR" | "MotleyFool" } | null = null;

    console.log(`    → Trying EDGAR 8-K...`);
    const edgar = await fetchEdgar8K(ticker, h.date);
    if (edgar) {
      source = { ...edgar, type: "EDGAR" };
      console.log(`    ✓ EDGAR: ${edgar.url}`);
    } else {
      console.log(`    ✗ EDGAR not found, trying Motley Fool...`);
      const fool = await findMotleyFoolTranscript(ticker, h.date);
      if (fool) {
        source = { ...fool, type: "MotleyFool" };
        console.log(`    ✓ Motley Fool: ${fool.url}`);
      } else {
        console.log(`    ✗ No source found — storing numbers only`);
      }
    }

    // 4. Generate summary
    let summary = "";
    let keyQuote: string | null = null;
    if (source) {
      console.log(`    → Summarizing with Groq...`);
      const result = await summarize(ticker, company, quarter, source.text, source.type, h.epsActual, h.epsEstimate, priceMoveDay);
      summary = result.summary;
      keyQuote = result.keyQuote;
      console.log(`    ✓ Summary done`);
    }

    const entry: EarningsSummary = {
      ticker, quarter, date: h.date,
      epsActual: h.epsActual, epsEstimate: h.epsEstimate, surprisePct: h.surprisePct,
      revActual: null, revEstimate: null,
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
    console.error("GROQ_API_KEY is required. Get a free key at console.groq.com");
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
      await sleep(300);
    } catch (e) {
      console.error(`  ✗ ${company.ticker}: ${e}`);
    }
  }

  const total = Object.values(store).reduce((s, arr) => s + arr.length, 0);
  const withSummary = Object.values(store).reduce((s, arr) => s + arr.filter((e) => e.summary).length, 0);
  console.log(`\nDone. ${total} quarters total, ${withSummary} with summaries.`);
}

main().catch((e) => { console.error(e); process.exit(1); });
