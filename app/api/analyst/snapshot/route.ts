import { NextResponse } from "next/server";
import { COMPANY_UNIVERSE } from "@/lib/companies";
import { fetchRawSnapshot } from "@/lib/analyst/core";
import { saveSnapshot } from "@/lib/analyst/snapshots";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

// Daily snapshot capture. Wired to a Vercel cron (see vercel.json) and also
// runnable manually. If CRON_SECRET is set, requests must send
// `Authorization: Bearer <CRON_SECRET>` (Vercel cron does this automatically).
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const auth = request.headers.get("authorization");
    if (auth !== `Bearer ${secret}`) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }
  }

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
