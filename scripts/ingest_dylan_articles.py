"""
Ingest SemiAnalysis articles by Dylan Patel into the lens tables.

Each article is a .txt file in scripts/dylan_articles/ with this header format:
  TITLE: <title>
  SOURCE: <source>
  DATE: YYYY-MM-DD
  URL: <url>
  (blank line)
  <article body>

Usage:
  cd ~/projects/fabuless-web
  source venv/bin/activate
  export COHERE_API_KEY=your_cohere_key
  export SUPABASE_URL=your_supabase_url
  export SUPABASE_SERVICE_KEY=your_supabase_service_key
  python scripts/ingest_dylan_articles.py

To ingest into a specific table only:
  python scripts/ingest_dylan_articles.py --tables dylan_chunks

To preview without inserting:
  python scripts/ingest_dylan_articles.py --dry-run
"""

import os, sys, time, uuid, re, argparse
from pathlib import Path
import cohere
from supabase import create_client

COHERE_API_KEY = os.environ["COHERE_API_KEY"]
SUPABASE_URL   = os.environ["SUPABASE_URL"]
SUPABASE_KEY   = os.environ["SUPABASE_SERVICE_KEY"]

co = cohere.Client(COHERE_API_KEY)
sb = create_client(SUPABASE_URL, SUPABASE_KEY)

# Directory where article .txt files live
ARTICLES_DIR = Path(__file__).parent / "dylan_articles"

# Tables to insert into — all 3 lenses benefit from this knowledge
DEFAULT_TABLES = ["dylan_chunks", "baker_chunks", "circuit_chunks"]

# Chunk size — ~300 words is good for retrieval
MAX_CHUNK_CHARS = 1200
MIN_CHUNK_CHARS = 200


# ── Parse article files ────────────────────────────────────────────────────────

def parse_article_file(path: Path) -> dict | None:
    """Parse a .txt article file into metadata + body."""
    text = path.read_text(encoding="utf-8").strip()
    lines = text.split("\n")

    meta = {}
    body_start = 0

    for i, line in enumerate(lines):
        if line.startswith("TITLE:"):
            meta["title"] = line[6:].strip()
        elif line.startswith("SOURCE:"):
            meta["source"] = line[7:].strip()
        elif line.startswith("DATE:"):
            meta["date"] = line[5:].strip()
        elif line.startswith("URL:"):
            meta["url"] = line[4:].strip()
        elif line.strip() == "" and i > 0 and all(k in meta for k in ["title", "source", "date", "url"]):
            body_start = i + 1
            break

    if not all(k in meta for k in ["title", "source", "date", "url"]):
        print(f"  WARNING: Missing header fields in {path.name}, skipping.")
        return None

    body = "\n".join(lines[body_start:]).strip()
    if len(body) < 100:
        print(f"  WARNING: Body too short in {path.name}, skipping.")
        return None

    return {**meta, "body": body, "filename": path.name}


# ── Chunking ──────────────────────────────────────────────────────────────────

def chunk_article(article: dict) -> list[dict]:
    """
    Split article body into retrieval-sized chunks.
    Tries to split on paragraph breaks first, then sentences.
    Prepends title context to each chunk so retrieval understands provenance.
    """
    body = article["body"]
    title = article["title"]
    source = article["source"]
    date = article["date"]
    url = article["url"]

    # Split into paragraphs
    paragraphs = [p.strip() for p in re.split(r"\n\s*\n", body) if p.strip()]

    chunks = []
    current = ""

    for para in paragraphs:
        # Skip very short boilerplate lines
        if len(para) < 40:
            continue
        # Skip navigation/subscribe lines
        if any(skip in para.lower() for skip in [
            "subscribe", "share", "read full story", "sign up",
            "get the app", "start your substack", "© 202",
            "substack is the home", "privacy", "collection notice",
        ]):
            continue

        if len(current) + len(para) + 2 <= MAX_CHUNK_CHARS:
            current = (current + "\n\n" + para).strip()
        else:
            if current and len(current) >= MIN_CHUNK_CHARS:
                chunks.append(_make_chunk(current, title, source, date, url))
            # If para itself is too long, split by sentences
            if len(para) > MAX_CHUNK_CHARS:
                sentences = re.split(r'(?<=[.!?])\s+', para)
                current = ""
                for sent in sentences:
                    if len(current) + len(sent) + 1 <= MAX_CHUNK_CHARS:
                        current = (current + " " + sent).strip()
                    else:
                        if current and len(current) >= MIN_CHUNK_CHARS:
                            chunks.append(_make_chunk(current, title, source, date, url))
                        current = sent
                if current and len(current) >= MIN_CHUNK_CHARS:
                    chunks.append(_make_chunk(current, title, source, date, url))
                    current = ""
            else:
                current = para

    if current and len(current) >= MIN_CHUNK_CHARS:
        chunks.append(_make_chunk(current, title, source, date, url))

    return chunks


def _make_chunk(text: str, title: str, source: str, date: str, url: str) -> dict:
    full_text = f"{source} — {title}\n\n{text.strip()}"
    return {
        "id": str(uuid.uuid4()),
        "source": source,
        "date": date,
        "url": url,
        "text": full_text,
        "quality_score": 0.9,
    }


# ── Embed + upsert ────────────────────────────────────────────────────────────

def embed_texts(texts: list[str]) -> list[list[float]]:
    resp = co.embed(
        texts=texts,
        model="embed-english-v3.0",
        input_type="search_document",
        embedding_types=["float"],
    )
    return resp.embeddings.float_


def upsert_chunks(chunks: list[dict], table: str, dry_run: bool = False):
    batch_size = 10
    for i in range(0, len(chunks), batch_size):
        batch = chunks[i : i + batch_size]
        if dry_run:
            print(f"    [DRY RUN] Would insert {len(batch)} rows into {table}")
            continue
        texts = [c["text"] for c in batch]
        embeddings = embed_texts(texts)
        rows = [{**c, "embedding": emb} for c, emb in zip(batch, embeddings)]
        sb.table(table).insert(rows).execute()
        print(f"    Inserted {len(rows)} rows into {table}.")
        time.sleep(0.3)


# ── Main ──────────────────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--tables", nargs="+", default=DEFAULT_TABLES,
                        help="Tables to insert into (default: all 3)")
    parser.add_argument("--dry-run", action="store_true",
                        help="Parse and chunk but don't insert")
    parser.add_argument("--file", type=str, default=None,
                        help="Process only this specific .txt file")
    args = parser.parse_args()

    if not ARTICLES_DIR.exists():
        print(f"Articles directory not found: {ARTICLES_DIR}")
        print("Create it and add .txt article files.")
        return

    # Find article files
    if args.file:
        files = [ARTICLES_DIR / args.file]
    else:
        files = sorted(ARTICLES_DIR.glob("*.txt"))

    if not files:
        print(f"No .txt files found in {ARTICLES_DIR}")
        return

    print(f"Found {len(files)} article file(s)")
    print(f"Target tables: {args.tables}")
    if args.dry_run:
        print("DRY RUN — no data will be inserted\n")

    all_chunks = []

    for path in files:
        print(f"\nProcessing: {path.name}")
        article = parse_article_file(path)
        if not article:
            continue

        chunks = chunk_article(article)
        print(f"  → {len(chunks)} chunks from '{article['title']}'")

        if chunks:
            # Show a preview of the first chunk
            preview = chunks[0]["text"][:150].replace("\n", " ")
            print(f"  Preview: {preview}...")

        all_chunks.extend(chunks)

    if not all_chunks:
        print("\nNo chunks generated.")
        return

    print(f"\n{'='*60}")
    print(f"Total: {len(all_chunks)} chunks from {len(files)} article(s)")
    print(f"Inserting into: {args.tables}")

    for table in args.tables:
        print(f"\n  → {table}")
        upsert_chunks(all_chunks, table, dry_run=args.dry_run)

    if not args.dry_run:
        print(f"\nDone! {len(all_chunks)} chunks embedded and inserted into {len(args.tables)} table(s).")
    else:
        print(f"\nDry run complete. Run without --dry-run to insert.")


if __name__ == "__main__":
    main()
