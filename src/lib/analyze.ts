import { generateObject } from "ai";
import { anthropic } from "@ai-sdk/anthropic";
import { z } from "zod";

const CoachingResponseSchema = z.object({
  analysis: z.object({
    talents: z.array(z.string()).min(3).max(5),
    emotions: z.array(z.string()).min(2).max(4),
    interests: z.array(z.string()).min(2).max(4),
    communication_style: z.string(),
  }),
  creator_dna: z.object({
    archetype_name: z.string(),
    archetype_icon: z.string(),
    strengths: z.array(z.string()).min(3).max(5),
    primary_niche: z.string(),
    secondary_niche: z.string(),
    recommended_platforms: z.array(z.string()).min(1).max(3),
    mood: z.string(),
    color: z.string(),
  }),
});

export type CoachingResponse = z.infer<typeof CoachingResponseSchema>;

export async function analyzeCoaching(answers: {
  q1: string;
  q2: string;
  q3: string;
  q4: string;
  q5: string;
}): Promise<CoachingResponse> {
  const prompt = `당신은 크리에이터 코칭 전문가입니다. 다음 5가지 질문에 대한 사용자의 답변을 분석하여 강점과 크리에이터 페르소나를 도출해주세요.

답변 1: ${answers.q1}
답변 2: ${answers.q2}
답변 3: ${answers.q3}
답변 4: ${answers.q4}
답변 5: ${answers.q5}

분석 요구사항:
1. talents: 사용자가 타고난 재능과 강점 (3-5개)
2. emotions: 답변에서 드러나는 감정적 특성과 에너지원 (2-4개)
3. interests: 깊이 빠져드는 관심 분야 (2-4개)
4. communication_style: 해당 크리에이터의 소통 스타일

Creator DNA Card 요구사항:
- archetype_name: 크리에이터 아키타입 이름 (예: "감성 스토리텔러", "실용主义 크리에이터" 등)
- archetype_icon: 아키타입에 맞는 심플한 아이콘 이름 (SVG icon 이름)
- strengths: 핵심 강점 3-5개
- primary_niche: 주요 니치/카테고리
- secondary_niche: 보조 니치
- recommended_platforms: 추천 플랫폼 (youtube, instagram, tiktok, blog 중)
- mood: 크리에이터의 분위기/무드
- color: 카드 대표 색상 (hex 코드, warm palette 내)

한국 크리에이터 시장에 맞게 분석해주세요.`;

  const result = await generateObject({
    model: anthropic("claude-sonnet-4-20250514"),
    schema: CoachingResponseSchema,
    prompt,
    maxOutputTokens: 2048,
  });

  return result.object;
}
