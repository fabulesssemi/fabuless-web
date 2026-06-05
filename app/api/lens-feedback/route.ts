import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: NextRequest) {
  try {
    const { lens, question, answer, thumbs_up } = await req.json();

    const supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_KEY!
    );

    await supabase.from("lens_feedback").insert({
      lens,
      question,
      answer,
      thumbs_up,
    });

    return NextResponse.json({ ok: true });
  } catch {
    // Feedback failures are silent — don't break the UX
    return NextResponse.json({ ok: false });
  }
}
