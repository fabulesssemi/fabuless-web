import { auth } from "@/auth";
import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY!
  );
}

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const supabase = getSupabase();
  const { data } = await supabase
    .from("user_portfolios")
    .select("holdings")
    .eq("user_id", session.user.id)
    .single();

  return NextResponse.json({ holdings: data?.holdings ?? [] });
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: { holdings?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { holdings } = body;
  if (!Array.isArray(holdings) || holdings.length > 200) {
    return NextResponse.json({ error: "Invalid holdings" }, { status: 400 });
  }
  for (const h of holdings) {
    if (!h || typeof h.ticker !== "string" || h.ticker.length > 12) {
      return NextResponse.json({ error: "Invalid holding entry" }, { status: 400 });
    }
  }

  const supabase = getSupabase();
  const { error } = await supabase
    .from("user_portfolios")
    .upsert({ user_id: session.user.id, holdings, updated_at: new Date().toISOString() }, { onConflict: "user_id" });

  if (error) {
    console.error("[portfolio] upsert failed:", error.message);
    return NextResponse.json({ error: "Failed to save" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
