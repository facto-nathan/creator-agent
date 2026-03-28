import { NextRequest, NextResponse } from "next/server";
import { analyzeCoaching, CoachingResponse } from "@/lib/analyze";

const MAX_RETRIES = 3;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { answers } = body;

    if (!answers || typeof answers !== "object") {
      return NextResponse.json(
        { error: "답변 데이터가 필요합니다" },
        { status: 400 }
      );
    }

    const { q1, q2, q3, q4, q5 } = answers;
    if (!q1 || !q2 || !q3 || !q4 || !q5) {
      return NextResponse.json(
        { error: "모든 질문에 대한 답변을 입력해주세요" },
        { status: 400 }
      );
    }

    let lastError: Error | null = null;
    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        const result: CoachingResponse = await analyzeCoaching({ q1, q2, q3, q4, q5 });
        return NextResponse.json(result);
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        if (attempt < MAX_RETRIES) {
          await new Promise((resolve) => setTimeout(resolve, 1000 * attempt));
        }
      }
    }

    console.error("Coaching API error after retries:", lastError);
    return NextResponse.json(
      { error: "분석 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요." },
      { status: 500 }
    );
  } catch (error) {
    console.error("Coaching API parse error:", error);
    return NextResponse.json(
      { error: "요청을 처리할 수 없습니다" },
      { status: 400 }
    );
  }
}