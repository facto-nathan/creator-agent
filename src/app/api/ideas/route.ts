import { NextRequest, NextResponse } from "next/server";
import { generateContentIdeas } from "@/lib/ideas";

async function fetchTrends(baseUrl: string) {
  try {
    const res = await fetch(`${baseUrl}/api/trends`, { next: { revalidate: 21600 } });
    if (!res.ok) return [];
    const data = await res.json();
    return data.trends || [];
  } catch {
    return [];
  }
}

export async function POST(request: NextRequest) {
  try {
    const { dnaCard, analysis } = await request.json();
    if (!dnaCard || !analysis) {
      return NextResponse.json({ error: "DNA 카드와 분석 결과가 필요합니다" }, { status: 400 });
    }

    // Fetch trends in parallel with idea generation setup
    const origin = request.nextUrl.origin;
    const trends = await fetchTrends(origin);

    const result = await generateContentIdeas(dnaCard, analysis, trends);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Ideas API error:", error);
    return NextResponse.json({ error: "아이디어 생성에 실패했습니다." }, { status: 500 });
  }
}
