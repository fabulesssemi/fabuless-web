import { NextResponse } from "next/server";
import { sendQuantumNewsletter } from "@/lib/newsletter/quantum-sender";

export const dynamic = "force-dynamic";
export const maxDuration = 120;

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const auth = request.headers.get("authorization");
    if (auth !== `Bearer ${secret}`) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }
  }

  const result = await sendQuantumNewsletter();
  return NextResponse.json({ ...result, date: new Date().toISOString() });
}
