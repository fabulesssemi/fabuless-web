import { NextResponse } from "next/server";
import { getHomepageContent } from "@/lib/homepage";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  const content = await getHomepageContent();
  if (!content) return NextResponse.json(null);
  return NextResponse.json(content);
}
