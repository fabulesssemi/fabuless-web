import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { generateWeeklySummary, saveWeeklySummary } from "@/lib/analyst/weekly";

import { requireCronAuth } from "@/lib/cron-auth";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function GET(request: Request) {
  const authErr = requireCronAuth(request);
  if (authErr) return authErr;

  const { summary, highlights } = await generateWeeklySummary();
  const { ok } = await saveWeeklySummary(summary, highlights);

  if (ok) revalidatePath("/analyst-consensus");

  return NextResponse.json({
    ok,
    week_of: new Date().toISOString().slice(0, 10),
    highlightsCount: highlights.length,
    summaryLength: summary.length,
  });
}
