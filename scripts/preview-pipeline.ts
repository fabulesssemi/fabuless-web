// ---------------------------------------------------------------------------
// preview-pipeline.ts
// Runs the full homepage pipeline (RSS fetch + Claude story picks + podcast
// picks) and pretty-prints results to the terminal.
// Does NOT write to Supabase — safe to run as a demo without touching the site.
//
// Run with:
//   env -u ANTHROPIC_API_KEY -u ANTHROPIC_BASE_URL npx tsx scripts/preview-pipeline.ts
// ---------------------------------------------------------------------------

// Load .env.local so the Anthropic API key is available when running via tsx
import { readFileSync } from "fs";
import { resolve } from "path";
try {
  const envPath = resolve(process.cwd(), ".env.local");
  const lines = readFileSync(envPath, "utf-8").split("\n");
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    const val = trimmed.slice(eq + 1).trim().replace(/^['"]|['"]$/g, "");
    if (!(key in process.env)) process.env[key] = val; // don't override if already set
  }
} catch { /* .env.local missing — fine in CI */ }

import { fetchAllNewsItems, fetchAllPodcastFeeds } from "../lib/editorial/sources";
import { generateTopStories, generatePodcastPicks } from "../lib/editorial/curate-stories";

const RESET  = "\x1b[0m";
const BOLD   = "\x1b[1m";
const DIM    = "\x1b[2m";
const AMBER  = "\x1b[33m";
const GREEN  = "\x1b[32m";
const CYAN   = "\x1b[36m";
const WHITE  = "\x1b[97m";

function hr(char = "─", width = 72) {
  console.log(DIM + char.repeat(width) + RESET);
}

function header(text: string) {
  console.log("");
  hr("═");
  console.log(BOLD + AMBER + "  " + text + RESET);
  hr("═");
}

function step(emoji: string, text: string) {
  console.log(`\n${BOLD}${WHITE}${emoji}  ${text}${RESET}`);
}

// ── Main ────────────────────────────────────────────────────────────────────

async function main() {
  console.clear();
  header("FABULESS PIPELINE — PREVIEW RUN (read-only, nothing saves to the site)");

  // ── Step 1: Fetch RSS feeds ───────────────────────────────────────────────
  step("📡", "Fetching RSS feeds from all 13 sources…");
  console.log(DIM + "  Reuters · CNBC · NextPlatform · SemiWiki · Chipstrat · Benzinga · EE Times · Tom's Hardware · Silicon Leverage · Ars Technica · The Register · WCCFtech · Digitimes" + RESET);

  const [allNewsItems, podcastFeeds] = await Promise.all([
    fetchAllNewsItems(),
    fetchAllPodcastFeeds(10),
  ]);

  const withImages = allNewsItems.filter((i) => i.image !== null);
  console.log(GREEN + `\n  ✓ ${allNewsItems.length} total articles fetched  (${withImages.length} have images — these go to Claude)` + RESET);

  const feedSummary = podcastFeeds.map((f) => `${f.show} (${f.episodes.length} eps)`).join(" · ");
  console.log(GREEN + `  ✓ Podcast feeds loaded: ${feedSummary}` + RESET);

  // ── Step 2: Claude picks stories ──────────────────────────────────────────
  step("🤖", "Asking Claude to pick the top semiconductor investment stories…");
  console.log(DIM + "  This takes ~10–20 seconds. Claude is reading all articles and writing one-liners." + RESET);

  const t0 = Date.now();
  const homepage = await generateTopStories(allNewsItems);
  const storiesMs = Date.now() - t0;

  if (!homepage) {
    console.log("\n  ✗ Story generation failed — no stories returned.");
    process.exit(1);
  }

  console.log(GREEN + `\n  ✓ Done in ${(storiesMs / 1000).toFixed(1)}s — Claude picked ${homepage.topStories.length} stories` + RESET);

  // ── Step 3: Claude picks podcasts ─────────────────────────────────────────
  step("🎙️", "Asking Claude to pick the best podcast episode per show…");

  const t1 = Date.now();
  const podcastPicks = await generatePodcastPicks(podcastFeeds);
  const podcastMs = Date.now() - t1;

  console.log(GREEN + `  ✓ Done in ${(podcastMs / 1000).toFixed(1)}s — ${podcastPicks.length} podcast picks` + RESET);

  // ── Results ───────────────────────────────────────────────────────────────

  header("RESULTS");

  // Issue title
  console.log(BOLD + AMBER + "\n  ISSUE TITLE" + RESET);
  console.log("  " + BOLD + WHITE + homepage.issueTitle + RESET);

  // Stories
  console.log(BOLD + AMBER + "\n  TOP STORIES  " + DIM + `(${homepage.topStories.length} selected)` + RESET);
  hr();

  homepage.topStories.forEach((s, i) => {
    const num = `${i + 1}`.padStart(2, " ");
    console.log(`\n  ${BOLD}${num}. ${WHITE}${s.headline}${RESET}`);
    console.log(`      ${CYAN}[${s.category}]${RESET}  ${DIM}${s.source}${RESET}`);
    console.log(`      ${s.oneliner}`);
    console.log(`      ${DIM}${s.url}${RESET}`);
    console.log(`      ${DIM}image: ${s.image ?? "null"}${RESET}`);
  });

  // Podcasts
  if (podcastPicks.length > 0) {
    console.log(BOLD + AMBER + "\n\n  PODCAST PICKS" + RESET);
    hr();
    podcastPicks.forEach((p) => {
      console.log(`\n  ${BOLD}${WHITE}${p.show}${RESET}`);
      console.log(`  "${p.title}"`);
      console.log(`  ${p.oneliner}`);
      console.log(`  ${DIM}${p.url}${RESET}`);
    });
  }

  // Footer
  const totalMs = Date.now() - t0;
  console.log("");
  hr();
  console.log(DIM + `\n  Total time: ${(totalMs / 1000).toFixed(1)}s  ·  Nothing was saved to the website.` + RESET);
  console.log(DIM + "  To push these picks live, run the full pipeline: curl http://localhost:3000/api/homepage/refresh" + RESET);
  console.log("");
}

main().catch((err) => {
  console.error("\n  ✗ Pipeline error:", err);
  process.exit(1);
});
