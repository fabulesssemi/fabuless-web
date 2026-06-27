import { NextResponse } from "next/server";
import { sendQuantumNewsletter } from "@/lib/newsletter/quantum-sender";
import { requireCronAuth } from "@/lib/cron-auth";

export const dynamic = "force-dynamic";
export const maxDuration = 120;

export async function GET(request: Request) {
  const authErr = requireCronAuth(request);
  if (authErr) return authErr;

  const result = await sendQuantumNewsletter();
  return NextResponse.json({ ...result, date: new Date().toISOString() });
}
