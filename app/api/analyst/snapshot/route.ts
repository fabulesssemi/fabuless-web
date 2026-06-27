import { NextResponse } from "next/server";
import { COMPANY_UNIVERSE } from "@/lib/companies";
import { fetchRawSnapshot } from "@/lib/analyst/core";
import { saveSnapshot } from "@/lib/analyst/snapshots";

import { requireCronAuth } from "@/lib/cron-auth";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function GET(request: Request) {
  const authErr = requireCronAuth(request);
  if (authErr) return authErr;

  const results = await Promise.allSettled(
    COMPANY_UNIVERSE.map(async (meta) => {
      const snap = await fetchRawSnapshot(meta);
      const { ok } = await saveSnapshot(snap);
      return { ticker: meta.ticker, ok };
    }),
  );

  const saved: string[] = [];
  const failed: string[] = [];
  for (const r of results) {
    if (r.status === "fulfilled" && r.value.ok) saved.push(r.value.ticker);
    else if (r.status === "fulfilled") failed.push(r.value.ticker);
  }

  return NextResponse.json({
    date: new Date().toISOString().slice(0, 10),
    savedCount: saved.length,
    saved,
    failed,
  });
}
