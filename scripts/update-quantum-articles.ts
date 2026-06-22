/**
 * update-quantum-articles.ts
 *
 * Fetches curated quantum + consciousness RSS feeds, filters by relevance,
 * generates summaries via Claude Haiku, marks top stories, and saves to Supabase.
 *
 * Run:
 *   set -a && source .env.local && set +a
 *   npx tsx scripts/update-quantum-articles.ts
 *   npx tsx scripts/update-quantum-articles.ts --force
 */

import { runQuantumUpdate } from "../lib/quantum/updater";

const force = process.argv.includes("--force");
console.log(`Running quantum update (force=${force})...`);

runQuantumUpdate(force)
  .then(({ added, total }) => {
    console.log(`Done. Added: ${added}, Total in DB: ${total}`);
  })
  .catch((e) => { console.error(e); process.exit(1); });
