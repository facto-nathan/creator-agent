import { NextRequest, NextResponse } from "next/server";
import { analyzeCoaching } from "@/lib/analyze";
import type { CoachingResponse } from "@/lib/schemas";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { answers } = body;

    if (!answers || typeof answers !== "object") {
      return NextResponse.json(
        { error: "답변 데이터가 필요합니다" },
        { status: 400 },
      );
    }

    // Accept both keyed (q1-q5) and record-style answers
    const answerValues = Object.values(answers);
    if (answerValues.length < 5 || answerValues.some((v) => !v || (v as string).length < 10)) {
      return NextResponse.json(
        { error: "모든 질문에 대한 답변을 입력해주세요 (최소 10자)" },
        { status: 400 },
      );
    }

    const result: CoachingResponse = await analyzeCoaching(answers);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Coaching API error:", error);
    return NextResponse.json(
      { error: "분석 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요." },
      { status: 500 },
    );
  }
}