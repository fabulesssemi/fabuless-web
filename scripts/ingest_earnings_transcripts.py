"""
Ingest earnings call transcripts from Motley Fool into all three lens tables.
(baker_chunks, dylan_chunks, circuit_chunks)

Transcripts are chunked by speaker turn. CEO/CFO/management turns are given
higher quality scores so the retrieval pipeline surfaces them first.

Usage:
  cd ~/projects/fabuless-web
  source venv/bin/activate
  export COHERE_API_KEY=your_cohere_key
  export SUPABASE_URL=your_supabase_url
  export SUPABASE_SERVICE_KEY=your_supabase_service_key
  python scripts/ingest_earnings_transcripts.py

HOW TO FIND TRANSCRIPT URLS:
  Google: "Nvidia Q1 2026 earnings call transcript site:fool.com"
  Or go to: https://www.fool.com/earnings/call-transcripts/
  URLs look like: https://www.fool.com/earnings/call-transcripts/2025/05/28/nvidia-nvda-q1-2026-earnings-call-transcript/
"""

import os, time, uuid, re
import requests
from bs4 import BeautifulSoup
import cohere
from supabase import create_client

COHERE_API_KEY  = os.environ["COHERE_API_KEY"]
SUPABASE_URL    = os.environ["SUPABASE_URL"]
SUPABASE_KEY    = os.environ["SUPABASE_SERVICE_KEY"]

co = cohere.Client(COHERE_API_KEY)
sb = create_client(SUPABASE_URL, SUPABASE_KEY)

# ── ADD TRANSCRIPT URLS HERE ──────────────────────────────────────────────────
# Format: (company, ticker, quarter, url)
# Find them at: https://www.fool.com/earnings/call-transcripts/
# Google: "[company] [quarter] earnings call transcript site:fool.com"

TRANSCRIPTS = [
    # Example — replace with real URLs:
    # ("Nvidia", "NVDA", "Q1 2026", "https://www.fool.com/earnings/call-transcripts/2025/05/28/nvidia-nvda-q1-2026-earnings-call-transcript/"),
    # ("AMD",    "AMD",  "Q1 2026", "https://www.fool.com/earnings/call-transcripts/2025/04/29/advanced-micro-devices-amd-q1-2026-earnings-call-t/"),
    # ("TSMC",   "TSM",  "Q1 2026", "https://www.fool.com/earnings/call-transcripts/..."),
    # ("ASML",   "ASML", "Q1 2026", "https://www.fool.com/earnings/call-transcripts/..."),
]

# Tables to insert into — all 3 lenses get earnings context
TARGET_TABLES = ["baker_chunks", "dylan_chunks", "circuit_chunks"]

# Speakers that get high quality score (management) vs low (analysts)
MANAGEMENT_TITLES = [
    "ceo", "chief executive", "president", "cfo", "chief financial",
    "coo", "chief operating", "chairman", "founder", "co-founder",
    "jensen", "lisa su", "hock tan", "cc wei", "cristiano amon",
    "sanjay mehrotra", "lip-bu tan", "rene haas", "pat gelsinger",
    "operator",  # operator intros are useful context
]

# ── Scraping ──────────────────────────────────────────────────────────────────

def fetch_transcript(url: str) -> str | None:
    headers = {"User-Agent": "Mozilla/5.0 (compatible; Fabuless/1.0)"}
    try:
        r = requests.get(url, headers=headers, timeout=15)
        r.raise_for_status()
        return r.text
    except Exception as e:
        print(f"  Error fetching {url}: {e}")
        return None


def parse_speaker_turns(html: str) -> list[dict]:
    """
    Parse Motley Fool transcript HTML into speaker turns.
    Returns list of {speaker, text, is_management}.

    Motley Fool format:
      <p><strong>Speaker Name</strong></p>
      <p>Body text paragraph one.</p>
      <p>Body text paragraph two.</p>
      <p><strong>Next Speaker</strong></p>
      ...
    """
    soup = BeautifulSoup(html, "html.parser")

    # Find the article body
    body = (
        soup.find("div", class_=re.compile(r"article-body|article_body|body"))
        or soup.find("article")
        or soup.find("main")
    )
    if not body:
        body = soup

    turns = []
    current_speaker = "Unknown"
    current_text = []

    for tag in body.find_all(["p", "h2", "h3"]):
        text = tag.get_text(" ", strip=True)
        if not text:
            continue

        # Check if this paragraph is a speaker label
        # Motley Fool wraps speaker names in <strong> inside a <p>
        strong = tag.find("strong")
        is_speaker_label = (
            strong is not None
            and strong.get_text(strip=True) == text  # entire paragraph is the name
            and len(text) < 80
            and not text.endswith(".")
        )

        if is_speaker_label:
            # Save previous turn
            if current_text:
                body_text = " ".join(current_text).strip()
                if len(body_text) > 60:
                    is_mgmt = any(t in current_speaker.lower() for t in MANAGEMENT_TITLES)
                    turns.append({
                        "speaker": current_speaker,
                        "text": body_text,
                        "is_management": is_mgmt,
                    })
            current_speaker = text
            current_text = []
        else:
            # Accumulate body text, skip boilerplate
            if any(skip in text.lower() for skip in [
                "this article is a transcript", "fool transcripts",
                "prepared remarks", "questions and answers",
                "call participants", "more earnings call transcripts"
            ]):
                continue
            current_text.append(text)

    # Flush last turn
    if current_text:
        body_text = " ".join(current_text).strip()
        if len(body_text) > 60:
            is_mgmt = any(t in current_speaker.lower() for t in MANAGEMENT_TITLES)
            turns.append({
                "speaker": current_speaker,
                "text": body_text,
                "is_management": is_mgmt,
            })

    return turns


def turns_to_chunks(turns: list[dict], company: str, ticker: str, quarter: str, url: str) -> list[dict]:
    """
    Convert speaker turns into embeddable chunks.
    Prepend speaker + company context so retrieval understands provenance.
    Merge very short consecutive turns from the same speaker.
    """
    chunks = []
    MAX_CHARS = 1200  # ~300 words — good chunk size for retrieval

    i = 0
    while i < len(turns):
        turn = turns[i]
        text = turn["text"]

        # Merge short consecutive same-speaker turns
        while (
            i + 1 < len(turns)
            and turns[i + 1]["speaker"] == turn["speaker"]
            and len(text) + len(turns[i + 1]["text"]) < MAX_CHARS
        ):
            i += 1
            text += " " + turns[i]["text"]

        # Split long single turns
        if len(text) > MAX_CHARS:
            sentences = re.split(r'(?<=[.!?])\s+', text)
            current = ""
            for sent in sentences:
                if len(current) + len(sent) > MAX_CHARS and current:
                    chunks.append(_make_chunk(current, turn, company, ticker, quarter, url))
                    current = sent
                else:
                    current = (current + " " + sent).strip()
            if current:
                chunks.append(_make_chunk(current, turn, company, ticker, quarter, url))
        else:
            chunks.append(_make_chunk(text, turn, company, ticker, quarter, url))

        i += 1

    return chunks


def _make_chunk(text: str, turn: dict, company: str, ticker: str, quarter: str, url: str) -> dict:
    speaker = turn["speaker"]
    is_mgmt = turn["is_management"]
    full_text = f"{company} ({ticker}) — {quarter} Earnings Call\n{speaker}: {text}"
    return {
        "id": str(uuid.uuid4()),
        "source": f"{company} {quarter} Earnings Call",
        "date": quarter_to_date(quarter),
        "url": url,
        "text": full_text.strip(),
        "quality_score": 0.95 if is_mgmt else 0.6,
    }


def quarter_to_date(quarter: str) -> str:
    """Convert 'Q1 2026' → approximate date string."""
    m = re.match(r"Q(\d)\s+(\d{4})", quarter)
    if not m:
        return "2025-01-01"
    q, year = int(m.group(1)), m.group(2)
    month = {1: "02", 2: "05", 3: "08", 4: "11"}[q]
    return f"{year}-{month}-01"


# ── Embed + upsert ────────────────────────────────────────────────────────────

def embed_texts(texts: list[str]) -> list[list[float]]:
    resp = co.embed(
        texts=texts,
        model="embed-english-v3.0",
        input_type="search_document",
        embedding_types=["float"],
    )
    return resp.embeddings.float_


def upsert_chunks(chunks: list[dict], table: str):
    batch_size = 10
    for i in range(0, len(chunks), batch_size):
        batch = chunks[i : i + batch_size]
        texts = [c["text"] for c in batch]
        embeddings = embed_texts(texts)
        rows = [{**c, "embedding": emb} for c, emb in zip(batch, embeddings)]
        sb.table(table).insert(rows).execute()
        print(f"    Inserted {len(rows)} rows into {table}.")
        time.sleep(0.3)


# ── Main ──────────────────────────────────────────────────────────────────────

def main():
    if not TRANSCRIPTS:
        print("""
No transcript URLs configured.

Edit TRANSCRIPTS at the top of this script and add entries like:
  ("Nvidia", "NVDA", "Q1 2026", "https://www.fool.com/earnings/call-transcripts/..."),

Find URLs by Googling:  [company] [quarter] earnings call transcript site:fool.com
        """)
        return

    all_chunks = []

    for company, ticker, quarter, url in TRANSCRIPTS:
        print(f"\nProcessing {company} {quarter}...")
        html = fetch_transcript(url)
        if not html:
            print(f"  Skipping — failed to fetch.")
            continue

        turns = parse_speaker_turns(html)
        print(f"  Parsed {len(turns)} speaker turns.")

        if not turns:
            print(f"  No turns found — check if the URL is correct.")
            continue

        chunks = turns_to_chunks(turns, company, ticker, quarter, url)
        mgmt_chunks = sum(1 for c in chunks if c["quality_score"] >= 0.9)
        print(f"  Generated {len(chunks)} chunks ({mgmt_chunks} management, {len(chunks)-mgmt_chunks} analyst Q&A).")
        all_chunks.extend(chunks)

    if not all_chunks:
        print("\nNo chunks generated. Nothing to insert.")
        return

    print(f"\nInserting {len(all_chunks)} total chunks into {len(TARGET_TABLES)} tables...")
    for table in TARGET_TABLES:
        print(f"\n  → {table}")
        upsert_chunks(all_chunks, table)

    print(f"\nDone! {len(all_chunks)} chunks embedded and inserted.")
    print("The lenses will now have access to these earnings transcripts.")


if __name__ == "__main__":
    main()
