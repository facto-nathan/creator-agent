import { NextRequest, NextResponse } from "next/server";
import { generateFollowUp } from "@/lib/followup";

export async function POST(request: NextRequest) {
  try {
    const { core_question, answer, previous_answers } = await request.json();

    if (!core_question || !answer) {
      return NextResponse.json(
        { error: "질문과 답변이 필요합니다." },
        { status: 400 },
      );
    }

    const result = await generateFollowUp(
      core_question,
      answer,
      previous_answers || [],
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error("Follow-up error:", error);
    // On failure, don't block the flow — just skip the follow-up
    return NextResponse.json({ needsFollowUp: false, question: "" });
  }
}
