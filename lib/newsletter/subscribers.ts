import { createClient } from "@supabase/supabase-js";

function getClient() {
  const key = process.env.SUPABASE_SERVICE_KEY;
  if (!key) throw new Error("SUPABASE_SERVICE_KEY is not set");
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, key);
}

export async function getSubscribers(): Promise<string[]> {
  const supabase = getClient();
  const { data, error } = await supabase.from("subscribers").select("email");
  if (error) {
    console.error("[subscribers] fetch failed:", error.message);
    return [];
  }
  return (data ?? []).map((row: { email: string }) => row.email);
}
