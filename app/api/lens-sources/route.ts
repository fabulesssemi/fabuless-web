import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function getSupabase() {
  return createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

const TABLE_MAP: Record<string, string> = {
  baker: "baker_chunks",
  dylan: "dylan_chunks",
  circuit: "circuit_chunks",
};

export async function GET(req: NextRequest) {
  const lens = req.nextUrl.searchParams.get("lens");
  if (!lens || !TABLE_MAP[lens]) {
    return NextResponse.json({ sources: [] }, { status: 400 });
  }
  const { data, error } = await getSupabase()
    .from(TABLE_MAP[lens])
    .select("source")
    .order("source");
  if (error) return NextResponse.json({ sources: [] }, { status: 500 });
  const unique = [...new Set((data ?? []).map((r: any) => r.source as string))].filter(Boolean).sort();
  return NextResponse.json({ sources: unique });
}
