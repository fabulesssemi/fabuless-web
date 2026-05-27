#!/usr/bin/env python3
"""
Weekly insider trading updater for Fabuless.
Scrapes Finviz for the Fabuless 12 + broader semi universe,
analyzes with Claude API, rewrites lib/insider-trading.ts.

Runs automatically via GitHub Actions every Monday 9am ET.
Can also be run manually: python scripts/update_insider_trading.py
"""

import os
import json
import datetime
import requests
from anthropic import Anthropic

# ── Config ────────────────────────────────────────────────────────────────────

ANTHROPIC_API_KEY = os.environ["ANTHROPIC_API_KEY"]
FIRECRAWL_API_KEY = os.environ["FIRECRAWL_API_KEY"]

# Fabuless 12 — always covered first (matches fabuless.ai/companies)
FABULESS_12 = [
    "NVDA",   # NVIDIA
    "AMD",    # Advanced Micro Devices
    "AVGO",   # Broadcom
    "MRVL",   # Marvell
    "TSM",    # TSMC ADR
    "ASML",   # ASML
    "ARM",    # Arm Holdings
    "MU",     # Micron
    "INTC",   # Intel
    "QCOM",   # Qualcomm
    # SK Hynix (000660.KS) and Samsung (005930.KS) are Korean-listed;
    # Finviz coverage is limited — Claude will note them with available data
]

# Broader universe to include in the scrape
BROADER_UNIVERSE = ["LRCX", "KLAC", "AMAT", "ONTO", "ENTG", "SNPS", "CDNS", "LSCC", "MCHP"]

TODAY = datetime.date.today()
TODAY_ISO = TODAY.isoformat()
SIX_MONTHS_AGO = TODAY - datetime.timedelta(days=180)
WINDOW_LABEL = f"{SIX_MONTHS_AGO.strftime('%b %d')} – {TODAY.strftime('%b %d, %Y')}"

# ── Firecrawl helpers ─────────────────────────────────────────────────────────

def firecrawl_scrape(url: str, max_chars: int = 5000) -> str:
    """Scrape a URL using Firecrawl API and return markdown."""
    headers = {"Authorization": f"Bearer {FIRECRAWL_API_KEY}"}
    try:
        resp = requests.post(
            "https://api.firecrawl.dev/v1/scrape",
            headers=headers,
            json={"url": url, "formats": ["markdown"]},
            timeout=30,
        )
        resp.raise_for_status()
        data = resp.json()
        return data.get("data", {}).get("markdown", "")[:max_chars]
    except Exception as e:
        print(f"  ⚠️  Could not scrape {url}: {e}")
        return ""


def collect_insider_data() -> str:
    """Pull insider trading data from Finviz for all coverage tickers."""
    print("📡 Scraping Finviz insider trading data...")

    # Main insider trading feed (all companies, last 100 transactions)
    main = firecrawl_scrape("https://finviz.com/insidertrading.ashx?tc=1", max_chars=12000)

    # Per-ticker quote pages — each quote page includes an insider trading table
    ticker_snippets = {}
    all_tickers = FABULESS_12 + BROADER_UNIVERSE
    for ticker in all_tickers:
        print(f"  → {ticker}")
        page = firecrawl_scrape(
            f"https://finviz.com/quote.ashx?t={ticker}",
            max_chars=3000,
        )
        if page:
            ticker_snippets[ticker] = page

    # Assemble the context block
    lines = [f"# Finviz Insider Trading Data — {WINDOW_LABEL} (6-month window)\n"]
    lines.append(f"## Main Feed (recent across all names)\n{main}\n")
    for ticker, snippet in ticker_snippets.items():
        lines.append(f"## {ticker}\n{snippet}\n")

    return "\n".join(lines)


# ── Claude analysis ───────────────────────────────────────────────────────────

SCHEMA = """{
  "generatedDate": "YYYY-MM-DD",
  "lookbackWindow": "MMM DD – DD, YYYY",
  "executiveSummary": "2–3 sentence market summary covering the 2-week window, key tape events, and overall signal quality.",
  "watchlist": [
    {
      "rank": 1,
      "ticker": "TICKER",
      "company": "Full company name",
      "price": "~$XXX",
      "signal": "Plain-language description of the insider signal (who bought, how much, when, significance).",
      "lastInsiderBuy": "$XXXk @ $XXX (Mon YYYY)",
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
      "signal": "Plain-language description of the red flag (who sold, volume, pattern)."
    }
  ]
}"""

def analyze_with_claude(raw_data: str) -> dict:
    """Send raw Finviz data to Claude, get back structured JSON."""
    print("🤖 Analyzing with Claude...")
    client = Anthropic(api_key=ANTHROPIC_API_KEY)

    prompt = f"""You are a buy-side equity research analyst covering large-cap semiconductors.

Today is {TODAY.strftime("%B %d, %Y")}. Analyze the insider trading data below covering the 6-month window {WINDOW_LABEL}.

CRITICAL RANKING RULE: A signal is ACTIONABLE as long as the insider has NOT subsequently sold, regardless of when they bought.
A CFO who bought $500k in January and still holds is MORE interesting than no recent activity.
Rank by signal quality × conviction, NOT by recency. An open 6-month-old buy outranks no signal.

## Fabuless 12 — ALWAYS include all of these in the watchlist first:
NVDA (NVIDIA), AMD, AVGO (Broadcom), MRVL (Marvell), TSM (TSMC), ASML, ARM (Arm Holdings),
MU (Micron), INTC (Intel), QCOM (Qualcomm), SK Hynix (000660.KS), Samsung (005930.KS)

Even if there is no actionable signal for a Fabuless 12 name, include it with
conviction = "MODERATE" and an honest explanation of the insider posture.

## Conviction levels:
- VERY HIGH → CFO/CEO open-market buy $500k+ (position still held)
- HIGH → multiple insiders buying, or single large buy $250k+ (position still held)
- MOD-HIGH → single significant buy $100k–$250k (position still held)
- MODERATE → no buys but also no alarming sells; or routine option exercises held
- AVOID → cluster selling (3+ insiders), large directional exits
- CAUTIOUS → CEO/CFO selling heavily but likely 10b5-1

## Stars: 5=VERY HIGH, 4=HIGH, 3=MOD-HIGH, 2=MODERATE, 1=AVOID/CAUTIOUS

## Rules:
- Watchlist: exactly 10 items. First 10 from the Fabuless 12, ranked by signal strength.
- RedFlags: only names with genuinely alarming patterns (cluster sells, full liquidations) within 6 months.
- "stillOpen" = true if the insider who bought in the 6-month window has NOT subsequently sold.
- All prices approximate based on data available.

## Raw data:
{raw_data[:16000]}

Return ONLY a valid JSON object matching this schema. No markdown fences, no extra text.

Schema:
{SCHEMA}"""

    message = client.messages.create(
        model="claude-opus-4-5",
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
    """Regenerate lib/insider-trading.ts from structured data."""

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

    # Pre-join outside f-string (backslashes not allowed in f-string expressions in Python <3.12)
    watchlist_block = ",\n".join(watchlist_items)
    red_flags_block = ",\n".join(red_flag_items)

    # Trailing commas — only when the block is non-empty (empty block + trailing comma = invalid TS)
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
    print(f"\n🚀 Fabuless Insider Trading Updater — {TODAY_ISO}\n")

    raw_data = collect_insider_data()
    structured = analyze_with_claude(raw_data)
    structured["generatedDate"] = TODAY_ISO  # always use today's date

    script_dir = os.path.dirname(os.path.abspath(__file__))
    repo_root = os.path.dirname(script_dir)
    output_path = os.path.join(repo_root, "lib", "insider-trading.ts")

    write_typescript(structured, output_path)
    print("\n✅ Insider trading data updated.\n")


if __name__ == "__main__":
    main()
