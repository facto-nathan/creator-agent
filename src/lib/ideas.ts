import { generateObject } from "ai";
import { anthropic } from "@ai-sdk/anthropic";
import { z } from "zod";
import type { CreatorDNACard, AnalysisResult } from "@/store/useCoachingStore";

export const ContentIdeaSchema = z.object({
  id: z.string(),
  title: z.string(),
  hook: z.string(),
  format: z.string(),
  platform: z.string(),
  tags: z.array(z.string()).min(2).max(5),
});

const ContentIdeasResponseSchema = z.object({
  ideas: z.array(ContentIdeaSchema).min(3).max(5),
});

const VariationResponseSchema = z.object({
  variations: z.array(ContentIdeaSchema).min(2).max(3),
});

export const DeepenedIdeaSchema = z.object({
  outline: z.array(z.object({
    section_title: z.string(),
    description: z.string(),
  })).min(3).max(5),
  opening_hook: z.string(),
  thumbnail_copy: z.string(),
  hashtags: z.array(z.string()).min(5).max(10),
});

export type ContentIdea = z.infer<typeof ContentIdeaSchema>;
export type DeepenedIdea = z.infer<typeof DeepenedIdeaSchema>;

export async function generateContentIdeas(dnaCard: CreatorDNACard, analysis: AnalysisResult) {
  const result = await generateObject({
    model: anthropic("claude-sonnet-4-20250514"),
    schema: ContentIdeasResponseSchema,
    prompt: `당신은 한국 크리에이터 코칭 전문가입니다. 다음 크리에이터 DNA를 기반으로 5가지 콘텐츠 아이디어를 제안해주세요.

크리에이터 아키타입: ${dnaCard.archetype_name}
핵심 강점: ${dnaCard.strengths.join(", ")}
주요 니치: ${dnaCard.primary_niche}
보조 니치: ${dnaCard.secondary_niche}
추천 플랫폼: ${dnaCard.recommended_platforms.join(", ")}
분위기: ${dnaCard.mood}

분석 결과:
- 재능: ${analysis.talents.join(", ")}
- 감정 특성: ${analysis.emotions.join(", ")}
- 관심 분야: ${analysis.interests.join(", ")}
- 소통 스타일: ${analysis.communication_style}

요구사항:
1. 각 아이디어는 구체적인 콘텐츠 주제
2. 다양한 format (숏폼, 브이로그, 카드뉴스, 릴스, 블로그 등) 혼합
3. hook은 시청자의 관심을 끌 수 있는 한 줄 문장
4. tags는 관련 키워드 2-5개
5. 각 id는 "idea-1", "idea-2" 등으로 부여`,
    maxOutputTokens: 2048,
  });
  return result.object;
}

export async function generateVariations(idea: ContentIdea, direction: string, dnaCard: CreatorDNACard) {
  const result = await generateObject({
    model: anthropic("claude-sonnet-4-20250514"),
    schema: VariationResponseSchema,
    prompt: `기존 콘텐츠 아이디어를 "${direction}" 방향으로 변형해주세요.

원래 아이디어:
- 제목: ${idea.title}
- 훅: ${idea.hook}
- 포맷: ${idea.format}
- 플랫폼: ${idea.platform}

크리에이터: ${dnaCard.archetype_name}
강점: ${dnaCard.strengths.join(", ")}

요구사항:
1. 원래 핵심 가치를 유지하면서 3가지 변형
2. 각 변형은 서로 다른 접근 방식
3. 각 id는 "var-1", "var-2", "var-3"으로 부여`,
    maxOutputTokens: 1024,
  });
  return result.object;
}

export async function deepenIdea(idea: ContentIdea, dnaCard: CreatorDNACard) {
  const result = await generateObject({
    model: anthropic("claude-sonnet-4-20250514"),
    schema: DeepenedIdeaSchema,
    prompt: `선택된 콘텐츠 아이디어를 실행 가능한 콘텐츠 기획으로 확장해주세요.

아이디어:
- 제목: ${idea.title}
- 훅: ${idea.hook}
- 포맷: ${idea.format}
- 플랫폼: ${idea.platform}

크리에이터: ${dnaCard.archetype_name}
강점: ${dnaCard.strengths.join(", ")}
니치: ${dnaCard.primary_niche}

요구사항:
1. outline: 3-5개 섹션으로 콘텐츠 구조
2. opening_hook: 시청자를 사로잡을 오프닝 (2-3문장)
3. thumbnail_copy: 짧고 강렬한 썸네일/커버 문구
4. hashtags: ${idea.platform}에 맞는 해시태그 5-10개`,
    maxOutputTokens: 1024,
  });
  return result.object;
}
