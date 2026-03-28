import { NextRequest, NextResponse } from "next/server";
import { generateContentIdeas } from "@/lib/ideas";

export async function POST(request: NextRequest) {
  try {
    const { dnaCard, analysis } = await request.json();
    if (!dnaCard || !analysis) {
      return NextResponse.json({ error: "DNA 카드와 분석 결과가 필요합니다" }, { status: 400 });
    }

    let lastError: Error | null = null;
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        const result = await generateContentIdeas(dnaCard, analysis);
        return NextResponse.json(result);
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        if (attempt < 3) await new Promise((r) => setTimeout(r, 1000 * attempt));
      }
    }
    console.error("Ideas API error:", lastError);
    return NextResponse.json({ error: "아이디어 생성에 실패했습니다." }, { status: 500 });
  } catch {
    return NextResponse.json({ error: "요청을 처리할 수 없습니다" }, { status: 400 });
  }
}
