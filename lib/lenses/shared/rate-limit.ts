/**
 * Persistent rate limiter backed by Supabase.
 * Limits each IP to MAX_REQUESTS per 24-hour rolling window.
 * Works correctly across Vercel serverless instances (no in-memory state).
 *
 * Supabase table required (run once in SQL editor):
 *   create table if not exists lens_rate_limits (
 *     ip text primary key,
 *     count int not null default 0,
 *     window_start timestamptz not null default now()
 *   );
 */

import { createClient } from "@supabase/supabase-js";

const MAX_REQUESTS = 10;
const WINDOW_MS = 24 * 60 * 60 * 1000; // 24 hours

// Use service key so this table doesn't need RLS
function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY!
  );
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number; // questions left in the window
  resetAt: number;   // unix ms when the window resets
}

export async function rateLimit(ip: string): Promise<RateLimitResult> {
  const supabase = getSupabase();
  const now = Date.now();

  try {
    const { data } = await supabase
      .from("lens_rate_limits")
      .select("count, window_start")
      .eq("ip", ip)
      .single();

    const windowExpired = !data || new Date(data.window_start).getTime() < now - WINDOW_MS;

    if (windowExpired) {
      // No record or window expired — start fresh
      await supabase.from("lens_rate_limits").upsert(
        { ip, count: 1, window_start: new Date(now).toISOString() },
        { onConflict: "ip" }
      );
      return { allowed: true, remaining: MAX_REQUESTS - 1, resetAt: now + WINDOW_MS };
    }

    const resetAt = new Date(data.window_start).getTime() + WINDOW_MS;

    if (data.count >= MAX_REQUESTS) {
      return { allowed: false, remaining: 0, resetAt };
    }

    await supabase
      .from("lens_rate_limits")
      .update({ count: data.count + 1 })
      .eq("ip", ip);

    return { allowed: true, remaining: MAX_REQUESTS - (data.count + 1), resetAt };
  } catch {
    // If Supabase is unreachable, fail open so users aren't blocked
    return { allowed: true, remaining: MAX_REQUESTS, resetAt: now + WINDOW_MS };
  }
}
