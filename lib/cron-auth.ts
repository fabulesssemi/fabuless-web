import { NextResponse } from "next/server";

/**
 * Returns a 401/500 Response if the request is not authorized to call a
 * cron/admin route, or null if auth passes.
 *
 * CRON_SECRET must be set in the environment. When running on Vercel, the
 * platform automatically sends `Authorization: Bearer <CRON_SECRET>` for
 * scheduled cron invocations — so legitimate cron calls always pass.
 */
export function requireCronAuth(request: Request): NextResponse | null {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    console.error("[cron-auth] CRON_SECRET env var is not set — refusing request");
    return NextResponse.json({ error: "Server misconfigured: CRON_SECRET not set" }, { status: 500 });
  }
  const auth = request.headers.get("authorization");
  if (auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  return null;
}
