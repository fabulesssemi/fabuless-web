import { NextResponse } from "next/server";
import { getUpcomingEarnings } from "@/lib/earnings";

export async function GET() {
  const results = await getUpcomingEarnings();
  return NextResponse.json(results, {
    headers: {
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
