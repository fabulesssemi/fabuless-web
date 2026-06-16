#!/usr/bin/env python3
"""
publish.py — Parse a Fabuless pipeline draft, write one-liners via Claude,
update lib/issues.ts, create archive page, and git push.

Usage:
  python publish.py draft_2026-06-XX.txt [--auto]

  --auto  Non-interactive: include all stories, use auto-generated title,
          skip the git push (the CI workflow handles committing).
"""

import sys
import os
import re
import json
import subprocess
from datetime import datetime
from pathlib import Path

import anthropic

# ── Paths ─────────────────────────────────────────────────────────────────────
# When running in GitHub Actions the CWD is the fabuless-web repo root.
# When running locally, fall back to ~/projects/fabuless-web.
_script_dir = Path(__file__).resolve().parent
_repo_root_candidate = _script_dir.parent.parent  # scripts/python → scripts → repo root
FABULESS_WEB = _repo_root_candidate if (_repo_root_candidate / "lib" / "issues.ts").exists() \
               else Path.home() / "projects" / "fabuless-web"
ISSUES_TS    = FABULESS_WEB / "lib" / "issues.ts"
ARCHIVE_DIR  = FABULESS_WEB / "app" / "archive"

# ── One-liner prompt ───────────────────────────────────────────────────────────
ONELINER_PROMPT = """You write one-liners for Fabuless Semi, a weekly semiconductor industry briefing for investors.

A one-liner is ONE short sentence (max 15 words) that states the single most investment-relevant implication of the story.
- Plain English, no jargon
- State a specific fact, risk, or shift — not a vague "this matters"
- No hype, no "this changes everything"
- Examples of good one-liners:
  "$10B TSMC commitment deepens AMD's single-supplier risk at peak cross-strait tension."
  "ADI's CEO backs AI demand with hard order data — not vague optionality."
  "ASML High-NA delay hands TSMC another 12 months of leading-edge moat."

Return ONLY the one-liner sentence. No quotes, no explanation."""

# ── Issue title prompt ─────────────────────────────────────────────────────────
TITLE_PROMPT = """You write issue titles for Fabuless Semi, a weekly semiconductor briefing for investors.

Given a list of story headlines from this week's issue, write a punchy 8-12 word title that names the 2-3 biggest themes.
Format: "[Theme 1], [Theme 2], and [Theme 3]"
Example: "AMD's $10B Taiwan Bet, Nvidia's Investor Fatigue, and the High-NA EUV Delay"

Return ONLY the title. No quotes, no explanation."""


def parse_draft(path: str):
    """Parse the pipeline draft into a list of story dicts and podcast list."""
    text = Path(path).read_text()
    stories = []
    podcasts = []

    # Split on story separators
    story_blocks = re.split(r"-{40,}", text)

    for block in story_blocks:
        block = block.strip()
        if not block:
            continue

        # Skip SKIP'd stories
        if "SKIP:" in block:
            continue

            # Podcast block: "SHOW NAME: Episode Title"
        podcast_header = re.match(r"^(THE CIRCUIT|CHIP STOCK INVESTOR|INVEST LIKE THE BEST):\s*(.+)", block, re.I)
        if podcast_header:
            url_m      = re.search(r"URL:\s*(.+)", block)
            image_m    = re.search(r"IMAGE:\s*(.+)", block)
            oneliner_m = re.search(r"ONE-LINER:\s*(.+)", block)
            if url_m:
                oneliner_val = None
                if oneliner_m and "[YOUR" not in oneliner_m.group(1):
                    oneliner_val = oneliner_m.group(1).strip()
                podcasts.append({
                    "show":     podcast_header.group(1).strip().title(),
                    "title":    podcast_header.group(2).strip(),
                    "url":      url_m.group(1).strip(),
                    "image":    image_m.group(1).strip() if image_m else None,
                    "oneliner": oneliner_val,
                })
            continue

        # Story block
        headline_m  = re.search(r"HEADLINE:\s*(.+)", block)
        url_m       = re.search(r"URL:\s*(.+)", block)
        image_m     = re.search(r"IMAGE:\s*(.+)", block)
        source_m    = re.search(r"STORY \d+ — (.+)", block)
        category_m  = re.search(r"### (.+?) ###", block)
        summary_m   = re.search(r"SUMMARY:\s*([\s\S]+?)(?=ONE-LINER:|$)", block)
        oneliner_m  = re.search(r"ONE-LINER:\s*(.+)", block)

        if not headline_m or not url_m:
            continue

        oneliner_val = None
        if oneliner_m and "[YOUR" not in oneliner_m.group(1):
            oneliner_val = oneliner_m.group(1).strip()

        stories.append({
            "headline": headline_m.group(1).strip(),
            "url":      url_m.group(1).strip(),
            "image":    image_m.group(1).strip() if image_m else None,
            "source":   source_m.group(1).strip() if source_m else "Unknown",
            "summary":  summary_m.group(1).strip() if summary_m else "",
            "oneliner": oneliner_val,
        })

    # Assign categories based on order in draft (### CATEGORY ### headers)
    # Re-parse to get category assignments
    category_map = {}
    current_cat = "Other"
    for block in re.split(r"-{40,}", text):
        cat_m = re.search(r"### (.+?) ###", block)
        if cat_m:
            raw = cat_m.group(1).strip().title()
            if "compute" in raw.lower():
                current_cat = "Compute"
            elif "memory" in raw.lower() or "network" in raw.lower():
                current_cat = "Memory & Networking"
            elif "capital" in raw.lower():
                current_cat = "Capital Flows"
            elif "geo" in raw.lower() or "policy" in raw.lower():
                current_cat = "Geopolitics & Policy"
            else:
                current_cat = "Other"
        hl_m = re.search(r"HEADLINE:\s*(.+)", block)
        if hl_m:
            category_map[hl_m.group(1).strip()] = current_cat

    for s in stories:
        s["category"] = category_map.get(s["headline"], "Other")

    return stories, podcasts


def generate_oneliners(client, stories):
    """Use Claude to generate one-liners for stories that don't have one."""
    for s in stories:
        if s["oneliner"]:
            continue
        prompt = f"Headline: {s['headline']}\nSource: {s['source']}\nSummary: {s['summary'][:800]}"
        msg = client.messages.create(
            model="claude-sonnet-4-6",
            max_tokens=80,
            system=ONELINER_PROMPT,
            messages=[{"role": "user", "content": prompt}],
        )
        s["oneliner"] = msg.content[0].text.strip().strip('"')
        print(f"  ✓ one-liner: {s['headline'][:50]}...")


def generate_title(client, stories):
    headlines = "\n".join(f"- {s['headline']}" for s in stories[:8])
    msg = client.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=60,
        system=TITLE_PROMPT,
        messages=[{"role": "user", "content": f"Headlines:\n{headlines}"}],
    )
    return msg.content[0].text.strip().strip('"')


def get_current_issue_number():
    """Read the current latest issue number from issues.ts."""
    text = ISSUES_TS.read_text()
    m = re.search(r"number:\s*(\d+)", text)
    return int(m.group(1)) if m else 2


def js_str(s):
    if s is None:
        return "null"
    escaped = s.replace("\\", "\\\\").replace('"', '\\"').replace("\n", "\\n")
    return f'"{escaped}"'


def build_issue_ts(issue_num, date_str, title, stories, podcasts):
    """Build the TypeScript Issue object string."""
    VALID_CATS = {"Compute", "Capital Flows", "Geopolitics & Policy", "Memory & Networking", "Other"}

    # Group stories by category
    from collections import defaultdict, OrderedDict
    cat_order = ["Compute", "Memory & Networking", "Capital Flows", "Geopolitics & Policy", "Other"]
    grouped = defaultdict(list)
    for s in stories:
        cat = s["category"] if s["category"] in VALID_CATS else "Other"
        grouped[cat].append(s)

    sections_ts = ""
    for cat in cat_order:
        if not grouped[cat]:
            continue
        stories_ts = ""
        for s in grouped[cat]:
            stories_ts += f"""          {{
            headline: {js_str(s['headline'])},
            url: {js_str(s['url'])},
            source: {js_str(s['source'])},
            image: {js_str(s['image'])},
            oneliner: {js_str(s['oneliner'])},
          }},\n"""
        sections_ts += f"""      {{
        category: "{cat}",
        stories: [
{stories_ts}        ],
      }},\n"""

    podcasts_ts = ""
    for p in podcasts:
        podcasts_ts += f"""    {{
      show: {js_str(p['show'])},
      title: {js_str(p['title'])},
      url: {js_str(p['url'])},
      image: {js_str(p.get('image'))},
      oneliner: {js_str(p.get('oneliner'))},
    }},\n"""

    return f"""  {{
    number: {issue_num},
    date: "{date_str}",
    slug: "issue-{issue_num}",
    title: {js_str(title)},
    sections: [
{sections_ts}    ],
    podcasts: [
{podcasts_ts}    ],
    earnings: [],
    quotes: [],
  }},"""


def insert_issue_into_ts(new_issue_ts: str):
    """Insert new Issue at the top of the issues[] array in lib/issues.ts."""
    text = ISSUES_TS.read_text()
    # Find 'export const issues: Issue[] = ['
    marker = "export const issues: Issue[] = ["
    idx = text.index(marker)
    insert_at = idx + len(marker) + 1  # after the opening newline
    new_text = text[:insert_at] + new_issue_ts + "\n" + text[insert_at:]
    ISSUES_TS.write_text(new_text)


def create_archive_page(issue_num: int):
    """Create app/archive/issue-N/page.tsx."""
    dir_path = ARCHIVE_DIR / f"issue-{issue_num}"
    dir_path.mkdir(parents=True, exist_ok=True)
    page_path = dir_path / "page.tsx"
    page_path.write_text(f"""import Link from "next/link";
import {{ getIssueBySlug }} from "@/lib/issues";
import {{ IssueView }} from "@/app/components/IssueView";
import {{ notFound }} from "next/navigation";

export default function Issue{issue_num}Page() {{
  const issue = getIssueBySlug("issue-{issue_num}");
  if (!issue) notFound();

  return (
    <div className="max-w-6xl mx-auto px-6 pt-12 pb-16">
      <div className="mb-8 pb-6 border-b border-gray-200">
        <Link href="/archive" className="text-xs text-[#0E7490] hover:underline uppercase tracking-widest">
          ← Archive
        </Link>
        <div className="mt-3 text-sm text-gray-400">Issue {{issue.number}} · {{issue.date}}</div>
        <h1 className="font-sans text-3xl text-[#374151] tracking-tight leading-tight mt-1">
          {{issue.title}}
        </h1>
      </div>

      <IssueView issue={{issue}} showEarnings={{false}} />
    </div>
  );
}}
""")
    print(f"  ✓ Created {page_path.relative_to(FABULESS_WEB)}")


def update_archive_page_list(issue_num: int, title: str, date_str: str):
    """Add the new issue to app/archive/page.tsx hardcoded list."""
    archive_page = FABULESS_WEB / "app" / "archive" / "page.tsx"
    text = archive_page.read_text()
    # Find the issues array in the archive page and prepend the new entry
    new_entry = f'  {{ number: {issue_num}, slug: "issue-{issue_num}", title: {js_str(title)}, date: "{date_str}" }},'
    # Look for the array start
    marker = "const archivedIssues"
    if marker not in text:
        print("  ⚠ Could not auto-update archive page — update it manually.")
        return
    # Find opening [ of the array
    bracket_idx = text.index("[", text.index(marker))
    insert_at = bracket_idx + 1
    new_text = text[:insert_at] + "\n" + new_entry + text[insert_at:]
    archive_page.write_text(new_text)
    print(f"  ✓ Updated archive/page.tsx")


def git_push(issue_num: int, date_str: str):
    msg = f"Issue {issue_num} — {date_str}"
    cmds = [
        ["git", "-C", str(FABULESS_WEB), "add", "."],
        ["git", "-C", str(FABULESS_WEB), "commit", "-m", msg],
        ["git", "-C", str(FABULESS_WEB), "push"],
    ]
    for cmd in cmds:
        result = subprocess.run(cmd, capture_output=True, text=True)
        if result.returncode != 0:
            print(f"  ✗ {' '.join(cmd)}\n{result.stderr}")
            return False
        print(f"  ✓ {' '.join(cmd[2:])}")
    return True


def main():
    args = sys.argv[1:]
    auto = "--auto" in args
    positional = [a for a in args if not a.startswith("--")]

    if not positional:
        print("Usage: python publish.py <draft_file.txt> [--auto]")
        sys.exit(1)

    draft_path = positional[0]
    print(f"\nFabuless Publisher — {datetime.now().strftime('%B %d, %Y')}")
    if auto:
        print("  (auto mode — no interactive prompts)")
    print("=" * 50)

    # 1. Parse draft
    print("\n[1/5] Parsing draft...")
    stories, podcasts = parse_draft(draft_path)
    print(f"  {len(stories)} stories, {len(podcasts)} podcasts")
    if not stories:
        print("No stories found — check draft format.")
        sys.exit(1)

    print("\nStories found:")
    for i, s in enumerate(stories):
        print(f"  {i+1}. [{s['category']}] {s['headline'][:70]}")

    if auto:
        print(f"\n  → Auto mode: including all {len(stories)} stories")
    else:
        print("\nWhich stories to include? Enter numbers separated by commas (e.g. 1,2,3,5)")
        print("Or press Enter to include ALL:")
        selection = input("> ").strip()
        if selection:
            indices = [int(x.strip()) - 1 for x in selection.split(",")]
            stories = [stories[i] for i in indices if 0 <= i < len(stories)]
        print(f"  → {len(stories)} stories selected")

    # 2. Generate one-liners
    print("\n[2/5] Writing one-liners via Claude...")
    client = anthropic.Anthropic()
    generate_oneliners(client, stories)

    # 3. Generate title
    print("\n[3/5] Generating issue title...")
    auto_title = generate_title(client, stories)
    print(f"  Auto-title: {auto_title}")
    if auto:
        title = auto_title
        print("  → Using auto-generated title")
    else:
        custom = input("  Press Enter to use this title, or type a custom one: ").strip()
        title = custom if custom else auto_title

    # 4. Build and inject Issue
    issue_num = get_current_issue_number() + 1
    date_str  = datetime.now().strftime("%B %-d, %Y")
    print(f"\n[4/5] Building Issue #{issue_num} ({date_str})...")

    issue_ts = build_issue_ts(issue_num, date_str, title, stories, podcasts)
    insert_issue_into_ts(issue_ts)
    print("  ✓ Updated lib/issues.ts")

    create_archive_page(issue_num)

    print(f"\n{'='*50}")
    print(f"Issue #{issue_num}: {title}")
    print(f"Date: {date_str}")
    print(f"Stories: {len(stories)}")
    for s in stories:
        print(f"  · {s['headline'][:60]}")
        print(f"    → {s['oneliner']}")
    print(f"{'='*50}")

    if auto:
        print("\n✅ Issue built. Git commit/push handled by CI.")
        return

    # 5. Git push (interactive mode only)
    push = input("\nPush to GitHub (auto-deploys to fabuless.ai)? (y/n): ").strip().lower()
    if push == "y":
        print("\n[5/5] Pushing to GitHub...")
        ok = git_push(issue_num, date_str)
        if ok:
            print("\n✅ Issue live on fabuless.ai in ~30 seconds.")
    else:
        print("\nStopped before push. Run manually:")
        print(f"  cd {FABULESS_WEB} && git add . && git commit -m 'Issue {issue_num}' && git push")


if __name__ == "__main__":
    main()
