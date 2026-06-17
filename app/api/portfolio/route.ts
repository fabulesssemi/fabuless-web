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
  if (!session?.user?.id) return NextResponse.json({ holdings: [] });

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

  const { holdings } = await req.json();
  const supabase = getSupabase();

  await supabase
    .from("user_portfolios")
    .upsert({ user_id: session.user.id, holdings, updated_at: new Date().toISOString() }, { onConflict: "user_id" });

  return NextResponse.json({ ok: true });
}
