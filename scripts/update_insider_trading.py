#!/usr/bin/env python3
"""
Weekly insider trading updater for Fabuless.
Pulls Form 4 filings directly from SEC EDGAR API (free, official, no scraping blocks).
Analyzes with Claude. Rewrites lib/insider-trading.ts.

Runs automatically via GitHub Actions every Monday 9am ET.
Can also be run manually: python scripts/update_insider_trading.py
"""

import os
import json
import datetime
import time
import xml.etree.ElementTree as ET
import requests
from anthropic import Anthropic

# ── Config ────────────────────────────────────────────────────────────────────

ANTHROPIC_API_KEY = os.environ["ANTHROPIC_API_KEY"]

# SEC requires a User-Agent with contact info
EDGAR_HEADERS = {
    "User-Agent": "Fabuless Information Services bot@fabuless.ai",
    "Accept-Encoding": "gzip, deflate",
}

TODAY = datetime.date.today()
TODAY_ISO = TODAY.isoformat()
SIX_MONTHS_AGO = TODAY - datetime.timedelta(days=180)
WINDOW_LABEL = f"{SIX_MONTHS_AGO.strftime('%b %d')} – {TODAY.strftime('%b %d, %Y')}"

# Fabuless 12 tickers (EDGAR lookups use US-listed tickers)
FABULESS_12 = [
    "NVDA", "AMD", "AVGO", "MRVL", "TSM", "ASML",
    "ARM", "MU", "INTC", "QCOM",
    # SK Hynix and Samsung are Korean-listed — no EDGAR Form 4s
]

# ── EDGAR helpers ─────────────────────────────────────────────────────────────

# Pre-load the EDGAR company tickers map once at startup
_CIK_MAP: dict[str, str] = {}

def _load_cik_map():
    """Download the full EDGAR company→CIK map (one request, cached in memory)."""
    global _CIK_MAP
    if _CIK_MAP:
        return
    try:
        resp = requests.get(
            "https://www.sec.gov/files/company_tickers.json",
            headers=EDGAR_HEADERS,
            timeout=20,
        )
        resp.raise_for_status()
        data = resp.json()
        # data is {index: {cik_str, ticker, title}}
        for entry in data.values():
            tk = entry.get("ticker", "").upper()
            cik = str(entry.get("cik_str", "")).zfill(10)
            if tk:
                _CIK_MAP[tk] = cik
        print(f"  ℹ️  Loaded {len(_CIK_MAP)} CIKs from EDGAR")
    except Exception as e:
        print(f"  ⚠️  Could not load EDGAR CIK map: {e}")


def get_cik(ticker: str) -> str | None:
    """Look up CIK for a ticker using the EDGAR company tickers map."""
    _load_cik_map()
    return _CIK_MAP.get(ticker.upper())


def get_recent_form4s(cik: str, ticker: str) -> list[dict]:
    """Fetch recent Form 4 filings from EDGAR submissions API."""
    url = f"https://data.sec.gov/submissions/CIK{cik}.json"
    try:
        resp = requests.get(url, headers=EDGAR_HEADERS, timeout=20)
        resp.raise_for_status()
        data = resp.json()
    except Exception as e:
        print(f"  ⚠️  Submissions fetch failed for {ticker}: {e}")
        return []

    filings = data.get("filings", {}).get("recent", {})
    forms = filings.get("form", [])
    dates = filings.get("filingDate", [])
    accessions = filings.get("accessionNumber", [])
    primary_docs = filings.get("primaryDocument", [])

    results = []
    cutoff = SIX_MONTHS_AGO.isoformat()
    for i, form in enumerate(forms):
        if form != "4":
            continue
        date = dates[i] if i < len(dates) else ""
        if date < cutoff:
            continue
        acc = accessions[i] if i < len(accessions) else ""
        doc = primary_docs[i] if i < len(primary_docs) else ""
        results.append({"date": date, "accession": acc, "doc": doc})

    return results[:20]  # cap at 20 most recent


def parse_form4_xml(accession: str, doc: str, cik: str) -> dict | None:
    """Download and parse a Form 4 XML filing from EDGAR."""
    acc_clean = accession.replace("-", "")
    # Strip XSLT path prefix (e.g. "xslF345X06/") — keep only the filename
    doc_file = doc.split("/")[-1] if "/" in doc else doc
    url = f"https://www.sec.gov/Archives/edgar/data/{int(cik)}/{acc_clean}/{doc_file}"
    try:
        resp = requests.get(url, headers=EDGAR_HEADERS, timeout=15)
        resp.raise_for_status()
        text = resp.text
        # EDGAR XML often has <?xml-stylesheet?> PIs and non-standard namespace
        # declarations that break stdlib ET. Use regex extraction instead.
    except Exception as e:
        print(f"    ⚠️  Could not download {accession}: {e}")
        return None

    import re

    def extract(tag: str) -> str | None:
        """Extract the text content of the first matching XML tag."""
        m = re.search(rf"<{tag}[^>]*>\s*([^<]+)\s*</{tag}>", text, re.IGNORECASE)
        return m.group(1).strip() if m else None

    def extract_all_blocks(tag: str) -> list[str]:
        """Extract all occurrences of a tag's full content."""
        return re.findall(rf"<{tag}[^>]*>(.*?)</{tag}>", text, re.IGNORECASE | re.DOTALL)

    # Reporter info
    reporter_name = extract("rptOwnerName")
    title = extract("officerTitle")
    is_director = extract("isDirector") == "1"
    is_officer = extract("isOfficer") == "1"
    is_ten_pct = extract("isTenPercentOwner") == "1"

    # Non-derivative transactions
    transactions = []
    for block in extract_all_blocks("nonDerivativeTransaction"):
        def bval(t):
            m = re.search(rf"<{t}[^>]*>\s*([^<]+)\s*</{t}>", block, re.IGNORECASE)
            return m.group(1).strip() if m else None
        code = bval("transactionCode")
        shares = bval("transactionShares")
        if shares is None:
            # Try value child
            m2 = re.search(r"<transactionShares>.*?<value>\s*([^<]+)\s*</value>", block, re.IGNORECASE | re.DOTALL)
            shares = m2.group(1).strip() if m2 else None
        price_m = re.search(r"<transactionPricePerShare>.*?<value>\s*([^<]+)\s*</value>", block, re.IGNORECASE | re.DOTALL)
        price = price_m.group(1).strip() if price_m else bval("transactionPricePerShare")
        date_m = re.search(r"<transactionDate>.*?<value>\s*([^<]+)\s*</value>", block, re.IGNORECASE | re.DOTALL)
        date = date_m.group(1).strip() if date_m else bval("transactionDate")
        owned_m = re.search(r"<sharesOwnedFollowingTransaction>.*?<value>\s*([^<]+)\s*</value>", block, re.IGNORECASE | re.DOTALL)
        owned_after = owned_m.group(1).strip() if owned_m else None
        transactions.append({
            "code": code,
            "shares": shares,
            "price": price,
            "date": date,
            "sharesOwnedAfter": owned_after,
        })

    # Derivative transactions
    deriv_transactions = []
    for block in extract_all_blocks("derivativeTransaction"):
        def dval(t):
            m = re.search(rf"<{t}[^>]*>\s*([^<]+)\s*</{t}>", block, re.IGNORECASE)
            return m.group(1).strip() if m else None
        code = dval("transactionCode")
        date_m = re.search(r"<transactionDate>.*?<value>\s*([^<]+)\s*</value>", block, re.IGNORECASE | re.DOTALL)
        date = date_m.group(1).strip() if date_m else dval("transactionDate")
        deriv_transactions.append({"code": code, "date": date})

    if not reporter_name and not transactions and not deriv_transactions:
        print(f"    ⚠️  No data extracted from {accession}")
        return None

    return {
        "reporter": reporter_name,
        "title": title,
        "isDirector": is_director,
        "isOfficer": is_officer,
        "isTenPct": is_ten_pct,
        "transactions": transactions,
        "derivativeTransactions": deriv_transactions,
    }


def collect_insider_data() -> str:
    """Pull Form 4 insider data from EDGAR for all coverage tickers."""
    print("📡 Fetching insider trading data from SEC EDGAR...")

    all_sections = [
        f"# SEC EDGAR Form 4 Insider Transactions — {WINDOW_LABEL} (6-month window)\n",
        f"Data sourced directly from SEC EDGAR Form 4 filings (official source).\n",
        f"Transaction codes: P=Open-market purchase, S=Sale, A=Award/grant, F=Tax withholding, M=Option exercise\n\n",
    ]

    for ticker in FABULESS_12:
        print(f"  → {ticker}")
        cik = get_cik(ticker)
        if not cik:
            all_sections.append(f"## {ticker}\nCIK lookup failed — no EDGAR data available.\n\n")
            time.sleep(0.3)
            continue

        form4s = get_recent_form4s(cik, ticker)
        if not form4s:
            all_sections.append(f"## {ticker} (CIK {cik})\nNo Form 4 filings found in the 6-month window.\n\n")
            time.sleep(0.3)
            continue

        section_lines = [f"## {ticker} (CIK {cik}) — {len(form4s)} Form 4 filing(s) in window\n"]
        parsed_count = 0
        for filing in form4s[:8]:  # parse up to 8 filings per ticker
            parsed = parse_form4_xml(filing["accession"], filing["doc"], cik)
            if not parsed:
                continue
            parsed_count += 1
            section_lines.append(f"### Filing date: {filing['date']}")
            role = []
            if parsed["isOfficer"]: role.append(f"Officer ({parsed['title'] or 'unknown title'})")
            if parsed["isDirector"]: role.append("Director")
            if parsed["isTenPct"]: role.append("10%+ Owner")
            section_lines.append(f"Reporter: {parsed['reporter']} — {', '.join(role) if role else 'Unspecified'}")
            if parsed["transactions"]:
                section_lines.append("Non-derivative transactions:")
                for tx in parsed["transactions"]:
                    val = ""
                    if tx["shares"] and tx["price"]:
                        try:
                            val = f" (≈${float(tx['shares']) * float(tx['price']):,.0f} total)"
                        except:
                            pass
                    section_lines.append(
                        f"  Code={tx['code']}, Shares={tx['shares']}, Price=${tx['price']}, Date={tx['date']}, OwnedAfter={tx['sharesOwnedAfter']}{val}"
                    )
            if parsed["derivativeTransactions"]:
                section_lines.append("Derivative transactions (options/warrants):")
                for tx in parsed["derivativeTransactions"]:
                    section_lines.append(f"  Code={tx['code']}, Date={tx['date']}")
            section_lines.append("")
            time.sleep(0.1)  # be polite to EDGAR

        if parsed_count == 0:
            section_lines.append("Could not parse filing XML.\n")

        all_sections.append("\n".join(section_lines))
        time.sleep(0.4)  # rate limit: EDGAR allows ~10 req/sec

    # Add note about Korean-listed stocks
    all_sections.append(
        "## SK Hynix (000660.KS) and Samsung Electronics (005930.KS)\n"
        "Korean Stock Exchange listed. Form 4 filings not required with SEC. "
        "Insider disclosures follow DART (Korean FSS) rules — not available via EDGAR.\n"
    )

    return "\n".join(all_sections)


# ── Claude analysis ───────────────────────────────────────────────────────────

SCHEMA = """{
  "generatedDate": "YYYY-MM-DD",
  "lookbackWindow": "MMM DD – DD, YYYY",
  "executiveSummary": "2–3 sentence summary of the overall insider tape quality and any standout signals.",
  "watchlist": [
    {
      "rank": 1,
      "ticker": "TICKER",
      "company": "Full company name",
      "price": "~$XXX",
      "signal": "Plain-language description of the insider signal based on actual Form 4 data.",
      "lastInsiderBuy": "$XXXk @ $XX.XX (Mon YYYY) or N/A",
      "stillOpen": true,
      "conviction": "VERY HIGH",
      "thesis": "1–2 sentence investable thesis.",
      "stars": 5
    }
  ],
  "redFlags": [
    {
      "ticker": "TICKER",
      "company": "Full company name",
      "severity": "STRONG AVOID",
      "signal": "Plain-language description of the red flag."
    }
  ]
}"""


def analyze_with_claude(raw_data: str) -> dict:
    """Send EDGAR Form 4 data to Claude, get back structured JSON."""
    print("🤖 Analyzing with Claude...")
    client = Anthropic(api_key=ANTHROPIC_API_KEY)

    prompt = f"""You are a buy-side equity research analyst covering large-cap semiconductors.

Today is {TODAY.strftime("%B %d, %Y")}. Analyze the SEC EDGAR Form 4 insider trading data below covering the 6-month window {WINDOW_LABEL}.

TRANSACTION CODES:
- P = Open-market purchase (MOST BULLISH — executive spent real money)
- S = Open-market sale (potentially bearish if large/clustered)
- A = Award/grant (not informative — compensation)
- F = Tax withholding on vesting (not a bearish signal)
- M = Option exercise (neutral unless accompanied by same-day sale)
- G = Gift
- D = Disposition to issuer

CRITICAL: Only "P" transactions count as meaningful insider BUYING. Awards (A), option exercises (M), and tax forfeitures (F) are routine compensation mechanics — NOT signals.

RANKING RULE: Rank by signal quality × conviction, NOT by recency.
A CFO who made an open-market P-coded purchase 4 months ago and still holds is FAR more interesting than routine F-coded forfeitures.

## Fabuless 12 — ALWAYS include all of these in the watchlist:
NVDA (NVIDIA), AMD, AVGO (Broadcom), MRVL (Marvell), TSM (TSMC), ASML, ARM (Arm Holdings),
MU (Micron), INTC (Intel), QCOM (Qualcomm), SK Hynix (000660.KS), Samsung (005930.KS)

Even if there is no actionable signal, include the name with conviction = "MODERATE" and an honest explanation.

## Conviction levels:
- VERY HIGH → CFO/CEO open-market P-buy $500k+ (position still held)
- HIGH → multiple insiders P-buying, or single P-buy $250k+
- MOD-HIGH → single P-buy $100k–$250k
- MODERATE → no P-buys but no alarming sales either; routine F/A/M only
- AVOID → cluster S-selling (3+ insiders), large directional exits by officers
- CAUTIOUS → CEO/CFO selling heavily (likely 10b5-1 but worth flagging)

## Stars: 5=VERY HIGH, 4=HIGH, 3=MOD-HIGH, 2=MODERATE, 1=AVOID/CAUTIOUS

## Rules:
- Watchlist: exactly 10 items (first 10 from Fabuless 12, ranked by signal strength)
- RedFlags: only names with genuinely alarming patterns (cluster S-sells, full liquidations by C-suite)
- "stillOpen" = true only if the insider made a P-buy and has NOT subsequently filed an S-sale
- Prices: use approximate current market prices (NVDA ~$205, AMD ~$165, AVGO ~$245, MRVL ~$90, TSM ~$180, ASML ~$730, ARM ~$140, MU ~$130, INTC ~$22, QCOM ~$160)
- If no P-coded transactions exist for a company, say so clearly and assign MODERATE

## Raw EDGAR Form 4 Data:
{raw_data[:18000]}

Return ONLY a valid JSON object matching this schema. No markdown fences, no extra text.

Schema:
{SCHEMA}"""

    message = client.messages.create(
        model="claude-haiku-4-5-20251001",
        max_tokens=4096,
        messages=[{"role": "user", "content": prompt}],
    )

    text = message.content[0].text.strip()

    # Strip markdown fences if model adds them
    if text.startswith("```"):
        text = "\n".join(text.split("\n")[1:])
    if text.endswith("```"):
        text = "\n".join(text.split("\n")[:-1])

    return json.loads(text.strip())


# ── TypeScript writer ─────────────────────────────────────────────────────────

def ts_str(s: str) -> str:
    return json.dumps(str(s))

def ts_bool(b: bool) -> str:
    return "true" if b else "false"

def write_typescript(data: dict, output_path: str):
    watchlist_items = []
    for item in data["watchlist"]:
        watchlist_items.append(
            f"""    {{
      rank: {int(item["rank"])},
      ticker: {ts_str(item["ticker"])},
      company: {ts_str(item["company"])},
      price: {ts_str(item["price"])},
      signal: {ts_str(item["signal"])},
      lastInsiderBuy: {ts_str(item["lastInsiderBuy"])},
      stillOpen: {ts_bool(item["stillOpen"])},
      conviction: {ts_str(item["conviction"])},
      thesis: {ts_str(item["thesis"])},
      stars: {int(item["stars"])},
    }}"""
        )

    red_flag_items = []
    for flag in data["redFlags"]:
        red_flag_items.append(
            f"""    {{
      ticker: {ts_str(flag["ticker"])},
      company: {ts_str(flag["company"])},
      severity: {ts_str(flag["severity"])},
      signal: {ts_str(flag["signal"])},
    }}"""
        )

    watchlist_block = ",\n".join(watchlist_items)
    red_flags_block = ",\n".join(red_flag_items)
    watchlist_trailing = "," if watchlist_items else ""
    red_flags_trailing = "," if red_flag_items else ""

    ts = f'''export type ConvictionLevel = "VERY HIGH" | "HIGH" | "MOD-HIGH" | "MODERATE" | "AVOID" | "CAUTIOUS";

export interface WatchlistItem {{
  rank: number;
  ticker: string;
  company: string;
  price: string;
  signal: string;
  lastInsiderBuy: string;
  stillOpen: boolean;
  conviction: ConvictionLevel;
  thesis: string;
  stars: number;
}}

export interface RedFlag {{
  ticker: string;
  company: string;
  severity: "STRONG AVOID" | "AVOID" | "CAUTIOUS";
  signal: string;
}}

export interface InsiderTradingData {{
  generatedDate: string;
  lookbackWindow: string;
  executiveSummary: string;
  watchlist: WatchlistItem[];
  redFlags: RedFlag[];
}}

// ⚠️  AUTO-GENERATED — do not edit manually.
// Updated every Monday by the Fabuless Insider Trading Agent (GitHub Actions).
// Source: SEC EDGAR Form 4 filings (official regulatory source).
// Last run: {data["generatedDate"]}
export const insiderTradingData: InsiderTradingData = {{
  generatedDate: {ts_str(data["generatedDate"])},
  lookbackWindow: {ts_str(data["lookbackWindow"])},
  executiveSummary: {ts_str(data["executiveSummary"])},
  watchlist: [
{watchlist_block}{watchlist_trailing}
  ],
  redFlags: [
{red_flags_block}{red_flags_trailing}
  ],
}};
'''

    with open(output_path, "w") as f:
        f.write(ts)

    print(f"✅ Written → {output_path}")


# ── Main ──────────────────────────────────────────────────────────────────────

def main():
    print(f"\n🚀 Fabuless Insider Trading Updater — {TODAY_ISO}")
    print(f"📅 Window: {WINDOW_LABEL}\n")

    raw_data = collect_insider_data()
    print(f"\n📊 Collected {len(raw_data):,} chars of EDGAR data")

    structured = analyze_with_claude(raw_data)
    structured["generatedDate"] = TODAY_ISO

    script_dir = os.path.dirname(os.path.abspath(__file__))
    repo_root = os.path.dirname(script_dir)
    output_path = os.path.join(repo_root, "lib", "insider-trading.ts")

    write_typescript(structured, output_path)
    print("\n✅ Insider trading data updated successfully.\n")


if __name__ == "__main__":
    main()
