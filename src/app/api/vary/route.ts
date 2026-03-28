import { NextRequest, NextResponse } from "next/server";
import { generateVariations } from "@/lib/ideas";

export async function POST(request: NextRequest) {
  try {
    const { idea, direction, dnaCard } = await request.json();
    if (!idea || !direction || !dnaCard) {
      return NextResponse.json({ error: "아이디어, 방향, DNA 카드가 필요합니다" }, { status: 400 });
    }

    let lastError: Error | null = null;
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        const result = await generateVariations(idea, direction, dnaCard);
        return NextResponse.json(result);
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        if (attempt < 3) await new Promise((r) => setTimeout(r, 1000 * attempt));
      }
    }
    console.error("Vary API error:", lastError);
    return NextResponse.json({ error: "변형 생성에 실패했습니다." }, { status: 500 });
  } catch {
    return NextResponse.json({ error: "요청을 처리할 수 없습니다" }, { status: 400 });
  }
}
