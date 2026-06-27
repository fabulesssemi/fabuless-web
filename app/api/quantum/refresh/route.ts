import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { runQuantumUpdate } from "@/lib/quantum/updater";
import { requireCronAuth } from "@/lib/cron-auth";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

export async function GET(request: Request) {
  const authErr = requireCronAuth(request);
  if (authErr) return authErr;

  const force = new URL(request.url).searchParams.get("force") === "1";
  const result = await runQuantumUpdate(force);
  revalidatePath("/quantum");

  return NextResponse.json({ ...result, date: new Date().toISOString() });
}
