import { createClient } from "@supabase/supabase-js";

function getClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}

export async function getSubscribers(): Promise<string[]> {
  const supabase = getClient();
  const { data, error } = await supabase.from("subscribers").select("email");
  if (error) throw new Error(`Failed to fetch subscribers: ${error.message}`);
  return (data ?? []).map((row: { email: string }) => row.email);
}
