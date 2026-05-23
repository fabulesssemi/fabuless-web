// Manually capture today's analyst snapshots into Supabase.
// Run: npx tsx scripts/snapshot-analysts.ts
// (Requires the analyst_snapshots table — see lib/analyst/schema.sql.)
import { COMPANY_UNIVERSE } from "../lib/companies";
import { fetchRawSnapshot } from "../lib/analyst/core";
import { saveSnapshot } from "../lib/analyst/snapshots";

async function main() {
  const date = new Date().toISOString().slice(0, 10);
  console.log(`Capturing analyst snapshots for ${date}...\n`);

  let ok = 0;
  for (const meta of COMPANY_UNIVERSE) {
    const snap = await fetchRawSnapshot(meta);
    const res = await saveSnapshot(snap);
    const pt = snap.avgPriceTarget != null ? `$${snap.avgPriceTarget.toFixed(0)}` : "—";
    console.log(
      `${res.ok ? "✓" : "✗"} ${meta.ticker.padEnd(10)} ${(snap.consensusRating ?? "—").padEnd(12)} PT ${pt}`,
    );
    if (res.ok) ok++;
  }

  console.log(`\nSaved ${ok}/${COMPANY_UNIVERSE.length} snapshots.`);
  if (ok === 0) {
    console.log(
      "If all failed, the analyst_snapshots table may not exist yet — run lib/analyst/schema.sql in Supabase.",
    );
  }
  process.exit(0);
}

main();
