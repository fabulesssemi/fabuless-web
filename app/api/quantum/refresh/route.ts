import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { runQuantumUpdate } from "@/lib/quantum/updater";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const auth = request.headers.get("authorization");
    if (auth !== `Bearer ${secret}`) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }
  }

  const force = new URL(request.url).searchParams.get("force") === "1";
  const result = await runQuantumUpdate(force);
  revalidatePath("/quantum");

  return NextResponse.json({ ...result, date: new Date().toISOString() });
}
