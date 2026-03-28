import { NextResponse } from "next/server";
import { getTrends } from "@/lib/trends";

export async function GET() {
  const { trends, source } = await getTrends();
  return NextResponse.json({
    trends,
    source,
    cached_at: new Date().toISOString(),
  });
}
