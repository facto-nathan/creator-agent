# 구현 계획 — Creator Coaching AI

> 이 문서는 /office-hours, /plan-design-review, /design-consultation, /plan-eng-review를 거쳐 확정된 최종 구현 계획입니다. 구현 에이전트는 이 문서와 DESIGN.md를 따라 코드를 작성합니다.

## 제품 개요

AI 코칭을 통해 사용자의 강점을 발견하고, 크리에이터 페르소나와 니치를 정의하고, 콘텐츠 아이디어를 생성하는 웹앱. 한국 크리에이터 시장 타겟.

## 구현 범위

### Phase 1 (데모 필수 — 먼저 완성)
- Landing 페이지
- Stage 1: 코칭 질문 5개 (한 화면에 하나씩)
- Stage 2: AI 분석 → Creator DNA Card 결과
- Creator DNA Card 이미지 생성 (공유용)

### Phase 2 (확장)
- Stage 3: 레퍼런스 크리에이터 매칭

### Phase 2.5 (Stage 4+5 통합 — variant.com 벤치마크)
- Stage 4+5: 콘텐츠 아이디어 생성 + 아이디어 확장 (단일 연속 경험)

---

## 기술 스택

| Layer | Package | Version |
|-------|---------|---------|
| Framework | Next.js | 15 (App Router) |
| Language | TypeScript | 5.x |
| Styling | Tailwind CSS | 4.x |
| AI | @ai-sdk/anthropic + ai (Vercel AI SDK) | latest |
| State | Zustand | latest |
| Animation | Framer Motion | latest |
| Card Image | @vercel/og (Satori + resvg) | latest |
| Deploy | Vercel | — |

## 프로젝트 초기화

```bash
npx create-next-app@latest creator-coaching --typescript --tailwind --app --src-dir --no-eslint
cd creator-coaching
npm install zustand framer-motion ai @ai-sdk/anthropic zod @vercel/og
```

## 파일 구조

```
src/
├── app/
│   ├── layout.tsx              # Pretendard 폰트 로딩 + 글로벌 스타일
│   ├── page.tsx                # Landing
│   ├── coaching/
│   │   └── page.tsx            # Stage 1: 코칭 질문
│   ├── result/
│   │   └── page.tsx            # Stage 2: DNA Card 결과
│   ├── api/
│   │   ├── coaching/
│   │   │   └── route.ts        # POST: 답변 5개 → 강점분석 + 페르소나
│   │   ├── ideas/
│   │   │   └── route.ts        # POST: 페르소나 → 콘텐츠 아이디어 (Phase 2)
│   │   └── og/
│   │       └── route.tsx       # GET: DNA Card PNG 이미지
├── components/
│   ├── QuestionCard.tsx        # 개별 질문 UI
│   ├── DNACard.tsx             # DNA Card 결과 UI
│   ├── AnalyzingScreen.tsx     # 분석 대기 화면
│   └── ErrorScreen.tsx         # 에러 상태 화면
├── lib/
│   ├── schemas.ts              # Zod 스키마 (전체)
│   ├── store.ts                # Zustand store
│   └── questions.ts            # 코칭 질문 5개 데이터
└── data/
    └── creators.json           # 레퍼런스 크리에이터 DB (Phase 2)
```

## 디자인 규칙

**반드시 DESIGN.md를 읽고 따를 것.** 핵심 요약:

- 폰트: Pretendard Variable만. weight로 계층 구분.
- 색상: warm cream 배경(#F0EBE3), warm black 텍스트(#1A1714). 액센트 색상 없음.
- 버튼: pill shape. Primary = dark fill (#1A1714). Secondary = outline. Ghost = underline.
- 카드: 흰색 배경, #E0DAD0 보더, 16px radius. 그림자 없음.
- 태그: #E8E2D8 배경, pill shape.
- 장식: 없음. 그라데이션, 글로우, 그림자, 이모지 없음.

## 환경 변수

```env
# .env.local
ANTHROPIC_API_KEY=sk-ant-...
```

---

## 상세 구현 명세

### 1. `src/app/layout.tsx`

```
- Pretendard Variable 로딩 (CDN link 태그)
- <html lang="ko">
- body: bg-[#F0EBE3] text-[#1A1714] font-[Pretendard]
- max-width 480px 센터 정렬 컨테이너
- min-height 100dvh
```

### 2. `src/app/page.tsx` — Landing

```
구성:
- 상단 여백 (전체 높이의 ~40%)
- 제목: "당신만의 크리에이터 DNA를 발견하세요" (Hero 스타일: 40px, weight 300)
- 부제: "5개의 질문으로 숨겨진 강점을 찾고, 콘텐츠 여정을 시작하세요." (Body 스타일)
- CTA: "시작하기" (Primary 버튼, pill)
- 하단: "약 8분 소요" (Label 스타일)

동작:
- "시작하기" 클릭 → /coaching으로 이동
- Framer Motion fade-in 애니메이션
```

### 3. `src/lib/questions.ts` — 코칭 질문

```typescript
export const COACHING_QUESTIONS = [
  "시간 가는 줄 모르고 빠져드는 순간은 언제인가요?",
  "친구들이 당신에게 자주 조언을 구하는 분야는?",
  "어릴 때 가장 즐겼던 활동은 무엇이었나요?",
  "다른 사람보다 쉽게 하는 일이 있다면?",
  "가장 최근에 몰입했던 경험은?",
] as const;
```

### 4. `src/lib/schemas.ts` — Zod 스키마

```typescript
import { z } from "zod";

export const StrengthProfileSchema = z.object({
  talents: z.array(z.string()),
  emotions: z.array(z.string()),
  interests: z.array(z.string()),
  communication_style: z.string(),
});

export const PersonaSchema = z.object({
  persona_name: z.string(),        // "분석적 스토리텔러"
  archetype: z.string(),           // "The Analytical Storyteller"
  primary_niche: z.string(),       // "테크 × 일상"
  secondary_niche: z.string(),     // "생산성 & 자기계발"
  content_style: z.string(),       // "깊이 있는 분석 + 개인 경험"
  platform_fit: z.array(z.string()), // ["YouTube", "블로그"]
  tone: z.string(),                // "신뢰감 있고 따뜻한"
  top_strengths: z.array(z.string()).length(3), // 상위 3개 강점 태그
});

// API 응답: Stage 1+2 합산
export const CoachingResultSchema = z.object({
  strengthProfile: StrengthProfileSchema,
  persona: PersonaSchema,
});

export const ContentIdeaSchema = z.object({
  title: z.string(),
  hook: z.string(),
  format: z.string(),       // "YouTube · 롱폼", "Instagram · 캐러셀" 등
  platform: z.string(),
  tags: z.array(z.string()),
});

export type StrengthProfile = z.infer<typeof StrengthProfileSchema>;
export type Persona = z.infer<typeof PersonaSchema>;
export type CoachingResult = z.infer<typeof CoachingResultSchema>;
export type ContentIdea = z.infer<typeof ContentIdeaSchema>;
```

### 5. `src/lib/store.ts` — Zustand Store

```typescript
import { create } from "zustand";
import type { Persona, StrengthProfile, ContentIdea } from "./schemas";

type Stage = "landing" | "coaching" | "analyzing" | "dna-card" | "references" | "ideas";

interface CoachingStore {
  // Stage 1
  currentQuestion: number;
  answers: string[];

  // Results
  strengthProfile: StrengthProfile | null;
  persona: Persona | null;
  ideas: ContentIdea[];

  // UI
  stage: Stage;
  isLoading: boolean;
  error: string | null;

  // Actions
  setAnswer: (index: number, answer: string) => void;
  nextQuestion: () => void;
  setStage: (stage: Stage) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setResults: (profile: StrengthProfile, persona: Persona) => void;
  setIdeas: (ideas: ContentIdea[]) => void;
  reset: () => void;
}
```

### 6. `src/app/coaching/page.tsx` — Stage 1: 코칭 질문

```
구성:
- 프로그레스 도트 (5개, 5px 원형) — 상단 센터
- 질문 번호: "QUESTION 01" (Label 스타일: 10px, 600, uppercase)
- 질문 텍스트 (H2 스타일: 26px, weight 500)
- 텍스트 입력: textarea (흰색 배경, stone 보더, 10px radius)
- "다음" 버튼 (Primary, pill) — 우측 하단

동작:
- 한 번에 하나의 질문만 표시
- Framer Motion AnimatePresence로 질문 간 fade + slide up 전환
- 입력 검증: 10자 미만이면 "조금 더 자세히 이야기해주세요" 안내
- 빈 답변으로 "다음" 클릭 불가 (버튼 비활성화)
- 5번째 질문 답변 후 → /api/coaching 호출 → 분석 화면 표시

분석 대기 화면 (AnalyzingScreen):
- "당신의 강점을 분석하고 있어요" (H2)
- 사용자 답변에서 키워드를 1.5초 간격으로 하나씩 표시
- AI 호출 완료 후 → /result로 이동 (Framer Motion morph)
```

### 7. `src/app/api/coaching/route.ts` — AI API

```
POST /api/coaching
Body: { answers: string[5] }
Response: { strengthProfile: StrengthProfile, persona: Persona }

구현:
1. 입력 검증 (answers 배열 길이 5, 각 10자 이상)
2. generateObject() 호출 #1: 답변 5개 → StrengthProfile
   - model: anthropic("claude-sonnet-4-5-20250514")
   - schema: StrengthProfileSchema
   - system prompt: 한국어 코칭 전문가 역할
3. generateObject() 호출 #2: StrengthProfile → Persona
   - model: anthropic("claude-sonnet-4-5-20250514")
   - schema: PersonaSchema
   - system prompt: 크리에이터 코칭 전문가, 한국 크리에이터 시장 이해

에러 처리:
- 3회 재시도 (exponential backoff: 1s, 2s, 4s)
- 최종 실패 시 500 + { error: "분석에 실패했습니다. 잠시 후 다시 시도해주세요." }
- generateObject 파싱 실패 시 재시도. 3회 후 generateText + 수동 파싱 fallback.

시스템 프롬프트 (호출 #1):
"""
당신은 한국의 크리에이터 코칭 전문가입니다. 사용자의 5개 답변을 분석하여
숨겨진 재능, 감정적 강점, 관심사, 커뮤니케이션 스타일을 추출합니다.

답변에서 표면적인 내용이 아닌 근본적인 패턴을 찾아주세요:
- 반복되는 테마 (예: 구조화, 창작, 분석, 소통)
- 감정적 드라이버 (예: 성취감, 연결감, 호기심)
- 자연스러운 관심 영역
- 소통 방식의 특징

한국어로 응답하세요. 각 항목을 3-5개의 구체적 키워드로 표현하세요.
"""

시스템 프롬프트 (호출 #2):
"""
당신은 한국 크리에이터 시장의 전문 코치입니다.
사용자의 강점 프로필을 기반으로 크리에이터 페르소나를 생성합니다.

- persona_name: 한국어 2-3단어 (예: "분석적 스토리텔러", "감성 큐레이터")
- archetype: 영문 번역 (예: "The Analytical Storyteller")
- primary_niche: 메인 콘텐츠 영역 (예: "테크 × 일상")
- secondary_niche: 보조 영역 (예: "생산성 & 자기계발")
- platform_fit: 가장 적합한 플랫폼 1-2개
- top_strengths: 가장 두드러지는 강점 3개를 짧은 태그로

한국 크리에이터 생태계에 맞는 현실적인 니치를 추천하세요.
"""
```

### 8. `src/app/result/page.tsx` — Stage 2: DNA Card 결과

```
구성:
- "YOUR CREATOR DNA" (Label 스타일)
- DNACard 컴포넌트 (핵심 결과 표시)
- 공유하기 버튼 (Primary, pill) + 다운로드 버튼 (Secondary, pill)
- "다음 단계로" (Ghost 버튼 — Phase 2 구현 후 활성화)

동작:
- Zustand store에서 persona 데이터 읽기
- persona가 없으면 / (Landing)으로 redirect
- "공유하기" → Web Share API (navigator.share) 또는 클립보드 복사
- "다운로드" → /api/og?data=... 에서 PNG 다운로드
```

### 9. `src/components/DNACard.tsx`

```
구성 (DESIGN.md 기준):
- 흰색 카드 (#FFF), #E0DAD0 보더, 16px radius
- "ARCHETYPE" (Label 스타일)
- persona_name (H2 스타일: 26px, weight 500)
- archetype 영문 (Caption 스타일, tertiary 색상)
- 구분선 또는 여백
- "강점" 섹션: top_strengths를 태그로 표시
- "니치" 섹션: primary_niche (17px, weight 500) + secondary_niche (12px, tertiary)
- "추천 플랫폼" 섹션: platform_fit을 버튼형 태그로

크기: max-width 340px, padding 32px 24px
```

### 10. `src/app/api/og/route.tsx` — DNA Card 이미지

```
GET /api/og?data={base64 encoded persona JSON}
Response: PNG image (1200x630 또는 1080x1080)

구현:
- @vercel/og의 ImageResponse 사용
- Pretendard 폰트 파일을 fetch → ArrayBuffer로 로딩
  (CDN에서 .woff2 또는 .ttf 다운로드)
- DNACard와 동일한 레이아웃을 JSX로 구현
- Satori CSS 제약 준수: flexbox만, CSS Grid 불가

주의:
- Satori에서 한글 렌더링을 위해 Pretendard .ttf 파일 필요
- 폰트 파일은 public/ 또는 외부 URL에서 fetch
- Fallback: Satori가 한글 깨지면 Noto Sans KR로 대체
```

### 11. `src/components/ErrorScreen.tsx`

```
구성:
- "분석에 잠시 문제가 생겼어요" (H2)
- "네트워크 상태를 확인하고 다시 시도해주세요." (Body, secondary 색상)
- "다시 시도" 버튼 (Secondary, pill)

동작:
- "다시 시도" → 마지막 API 호출 재시도
```

---

## 화면 전환 흐름

```
  Landing ──[시작하기]──► Coaching Q1
                           │
                     [fade+slide up]
                           │
                         Q2 → Q3 → Q4 → Q5
                                          │
                                    [API 호출]
                                          │
                                   Analyzing Screen
                                   (키워드 표시)
                                          │
                                  [morph transition]
                                          │
                                      DNA Card
                                     /        \
                               [공유하기]  [다운로드]
```

전환 구현: Framer Motion `AnimatePresence` + `motion.div`
- 질문 간: `opacity` 0→1 + `y` 20→0 (250ms, ease-out)
- 분석→DNA Card: `layoutId` 공유로 요소가 자연스럽게 변환 (400ms)
- Fallback: morph가 복잡하면 fade+slide로 대체

---

## 테스트 (Vitest)

```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom
```

### 핵심 테스트 7개

```
__tests__/
├── api/
│   ├── coaching.test.ts     # /api/coaching happy path + validation
│   └── og.test.ts           # /api/og happy path
├── lib/
│   ├── schemas.test.ts      # Zod 스키마 검증
│   └── store.test.ts        # Zustand store actions (3 테스트)
```

1. `/api/coaching` — 유효한 답변 5개 → 200 + CoachingResult 반환
2. `/api/coaching` — 빈 배열 → 400
3. `schemas` — PersonaSchema에 필수 필드 누락 → parse 실패
4. `schemas` — 올바른 데이터 → parse 성공
5. `store.setAnswer` — 인덱스와 값이 올바르게 저장
6. `store.nextQuestion` — currentQuestion 증가, 5에서 멈춤
7. `store.reset` — 모든 상태 초기화

---

## 배포

```bash
# Vercel CLI
npm i -g vercel
vercel --prod
```

환경 변수 `ANTHROPIC_API_KEY`를 Vercel 대시보드에서 설정.

Rate limiting: Vercel Edge Middleware로 IP당 분당 3세션 제한 (Phase 2에서 추가).

---

## Stage 4+5 통합 상세 구현 명세 (variant.com 벤치마크)

> variant.com의 "Generate → Select → Vary → Iterate" 패턴을 벤치마킹.
> DNA Card 이후 한 페이지 내 스크롤로 자연스럽게 이어지는 구조.

### 화면 전환 흐름

```
DNA Card
   │
   ▼
[콘텐츠 아이디어 보기] 버튼 (Primary, pill)
   │
   ▼
GENERATE: AI가 5개 아이디어 생성 (로딩 애니메이션)
   │
   ▼
SELECT: 카드 리스트, 탭으로 선택 (다중 선택 가능)
   │
   ▼
[이 아이디어를 확장해보세요] 버튼
   │
   ▼
VARY: 선택한 아이디어 변형
  - 프리셋: "다른 플랫폼으로" / "다른 각도로" / "다른 톤으로"
  - 자유 입력: "좋은데, 더 MZ세대 감성으로"
  - AI가 3개 변형 생성
  - 변형에서 다시 선택 → 재변형 가능 (variant.com 루프)
   │
   ▼
[이 아이디어로 확정] 버튼
   │
   ▼
DEEPEN: 선택한 아이디어 깊이 확장
  - 콘텐츠 아웃라인 (3-5 섹션)
  - 오프닝 훅 초안
  - 썸네일/커버 문구
  - 해시태그 추천
```

### 파일 구조 (추가분)

```
src/
├── app/api/
│   ├── ideas/
│   │   └── route.ts          # POST: dnaCard + analysis → 아이디어 5개
│   ├── vary/
│   │   └── route.ts          # POST: idea + direction + dnaCard → 변형 3개
│   └── deepen/
│       └── route.ts          # POST: idea + dnaCard → 확장 콘텐츠
├── components/
│   ├── Stage4.tsx            # 오케스트레이터 (generate/select/vary/deepen 서브 스테이지)
│   ├── IdeaCard.tsx          # 개별 아이디어 카드 (선택 가능)
│   ├── VaryPanel.tsx         # 변형 컨트롤 (프리셋 + 자유 입력)
│   └── DeepenView.tsx        # 깊이 확장 뷰
└── lib/
    └── ideas.ts              # Zod 스키마 + AI 함수 (generateContentIdeas, generateVariations, deepenIdea)
```

### 12. `src/lib/ideas.ts` — 스키마 + AI 함수

```typescript
// Zod 스키마
ContentIdeaSchema = z.object({
  id: z.string(),             // "idea-1", "var-1" 등
  title: z.string(),          // "MZ세대를 위한 감성 브이로그"
  hook: z.string(),           // 한 줄 훅
  format: z.string(),         // "숏폼", "브이로그", "카드뉴스" 등
  platform: z.string(),       // "youtube", "instagram" 등
  tags: z.array(z.string()).min(2).max(5),
})

ContentIdeasResponseSchema = z.object({
  ideas: z.array(ContentIdeaSchema).length(5),
})

VariationResponseSchema = z.object({
  variations: z.array(ContentIdeaSchema).min(2).max(3),
})

DeepenedIdeaSchema = z.object({
  outline: z.array(z.object({
    section_title: z.string(),
    description: z.string(),
  })).min(3).max(5),
  opening_hook: z.string(),    // 오프닝 2-3문장
  thumbnail_copy: z.string(),  // 썸네일/커버 문구
  hashtags: z.array(z.string()).min(5).max(10),
})
```

```
함수 3개:
1. generateContentIdeas(dnaCard, analysis) → 5개 아이디어
   - model: anthropic("claude-sonnet-4-5-20250514")
   - schema: ContentIdeasResponseSchema
   - 시스템 프롬프트: 크리에이터 DNA 기반 콘텐츠 아이디어 생성

2. generateVariations(idea, direction, dnaCard) → 3개 변형
   - 원래 아이디어의 핵심 유지 + 지정 방향으로 변형
   - 각 변형은 서로 다른 접근 방식

3. deepenIdea(idea, dnaCard) → 확장 콘텐츠 기획
   - 아웃라인, 오프닝 훅, 썸네일 문구, 해시태그
```

### 13. API Routes (3개)

```
POST /api/ideas
Body: { dnaCard: CreatorDNACard, analysis: AnalysisResult }
Response: { ideas: ContentIdea[5] }
에러 처리: 기존 /api/coaching과 동일 (3회 재시도, exponential backoff)

POST /api/vary
Body: { idea: ContentIdea, direction: string, dnaCard: CreatorDNACard }
Response: { variations: ContentIdea[2-3] }

POST /api/deepen
Body: { idea: ContentIdea, dnaCard: CreatorDNACard }
Response: { outline[], opening_hook, thumbnail_copy, hashtags[] }
```

### 14. Store 확장 — `src/store/useCoachingStore.ts`

```typescript
// 새 인터페이스
interface ContentIdea {
  id: string;
  title: string;
  hook: string;
  format: string;
  platform: string;
  tags: string[];
}

interface DeepenedIdea {
  outline: { section_title: string; description: string }[];
  opening_hook: string;
  thumbnail_copy: string;
  hashtags: string[];
}

type IdeaStage = "generate" | "select" | "vary" | "deepen";

// 새 state 필드
contentIdeas: ContentIdea[] | null;
selectedIdeaIds: string[];
variations: ContentIdea[] | null;
deepenedIdea: DeepenedIdea | null;
ideaStage: IdeaStage;
finalIdea: ContentIdea | null;

// 새 actions
setContentIdeas(ideas) → ideas 저장
toggleIdeaSelection(id) → 선택/해제 토글
setVariations(variations) → 변형 저장 (교체, 누적 안 함)
setDeepenedIdea(idea) → 확장 결과 저장
setIdeaStage(stage) → 서브 스테이지 전환
setFinalIdea(idea) → 확정 아이디어 저장
reset() → 모든 새 필드 포함 초기화
```

### 15. `src/components/IdeaCard.tsx`

```
Props: idea: ContentIdea, isSelected: boolean, onToggle: () => void

구성:
- 흰색 카드 (bg-elevated, border border-border-subtle, rounded-xl, p-md)
- 제목: text-h3 font-medium
- 훅: text-body text-secondary-text (1-2줄)
- 포맷 + 플랫폼: 태그 pill로 표시
- tags: pill row (bg-surface rounded-full text-caption)

선택 상태:
- border → border-primary-text (보더만 진하게, 배경 변화 없음)
- 우상단에 체크 아이콘 (simple SVG path)

애니메이션:
- motion.div: opacity 0→1, y 10→0, staggered delay (index * 0.1)
- cursor-pointer
```

### 16. `src/components/VaryPanel.tsx`

```
Props: selectedIdeas: ContentIdea[], onVary: (direction: string) => void, isLoading: boolean

구성:
- 헤딩: "어떤 방향으로 변형할까요?" (text-h3)
- 프리셋 버튼 3개 (한 줄):
  - "다른 플랫폼으로" / "다른 각도로" / "다른 톤으로"
  - Secondary outline pill (border border-border text-primary-text rounded-full)
  - 클릭 시 onVary(presetText) 호출
- 자유 입력:
  - input: bg-elevated border border-border-subtle rounded-lg p-md text-body
  - placeholder: "예: 좋은데, 더 MZ세대 감성으로"
  - Enter 키 제출
- isLoading 시 버튼 비활성화 + 스피너
```

### 17. `src/components/DeepenView.tsx`

```
Props: idea: ContentIdea, deepened: DeepenedIdea

구성:
- 상단: 아이디어 제목 (text-h2), 플랫폼/포맷 태그
- "콘텐츠 구조" 섹션 (text-label uppercase):
  - 번호 매긴 아웃라인 카드들 (흰색 카드)
  - section_title: text-body font-medium
  - description: text-caption text-secondary-text
  - staggered fade-in 애니메이션
- "오프닝 훅" 섹션:
  - 흰색 카드, border-l-2 border-stone
  - opening_hook 텍스트
- "썸네일 / 커버 문구" 섹션:
  - 흰색 카드, thumbnail_copy 텍스트
- "추천 해시태그" 섹션:
  - pill row (태그 스타일)

하단 버튼:
- "다른 아이디어 보기" (Secondary, pill) → select 단계로 복귀
- "처음으로" (Ghost, underline) → 페이지 리로드
```

### 18. `src/components/Stage4.tsx` — 오케스트레이터

```
구성:
- useCoaching()에서 store 읽기
- ideaStage에 따라 AnimatePresence mode="wait"으로 서브 스테이지 렌더링

서브 스테이지:

[generate]
- 마운트 시 /api/ideas 자동 호출 (dnaCard + analysisResult)
- 로딩 키워드 애니메이션 (Stage2 패턴 재활용):
  "아이디어를 탐색하고 있어요..."
  "당신의 DNA에 맞는 콘텐츠를 찾고 있어요..."
  "다양한 플랫폼을 검토하고 있어요..."
- 완료 시 ideaStage → "select"

[select]
- IdeaCard 5개 렌더링
- 다중 선택 가능 (toggleIdeaSelection)
- "이 아이디어를 확장해보세요" 버튼 (1개 이상 선택 시 활성화)
- 클릭 시 ideaStage → "vary"

[vary]
- 선택한 아이디어 표시
- VaryPanel 렌더링
- 프리셋 또는 자유 입력 시 /api/vary 호출
- 변형 결과 IdeaCard들로 표시
- "다시 변형하기" → 재변형 (variations 교체, 누적 안 함)
- "이 아이디어로 확정" → ideaStage → "deepen"

[deepen]
- /api/deepen 호출 (finalIdea + dnaCard)
- 로딩 후 DeepenView 렌더링
- "다른 아이디어 보기" → ideaStage → "select" (contentIdeas 유지)

Vary 루프 핵심 규칙:
- 한 번에 하나의 아이디어만 변형 (다중 선택은 북마킹용)
- 재변형 시 variations를 완전 교체 (누적 안 함)
```

### 19. 기존 컴포넌트 수정

```
DNACard.tsx:
- onNext?: () => void prop 추가
- "카드 이미지 저장"과 "처음으로" 사이에 "콘텐츠 아이디어 보기" Primary 버튼 추가
- 클릭 시 onNext?.() 호출

Stage2.tsx:
- onNext?: () => void prop 추가
- DNACard에 onNext 전달

page.tsx:
- stage union에 "stage4" 추가: "landing" | "stage1" | "stage2" | "stage4"
- Stage4 컴포넌트 임포트 및 렌더링
- Stage2에 onNext={() => setStage("stage4")} 전달
- Stage4 전환 애니메이션: fade + scale (Stage2와 동일)
```

### AI 프롬프트 설계

```
아이디어 생성 프롬프트:
"""
당신은 한국 크리에이터 코칭 전문가입니다. 다음 크리에이터 DNA를 기반으로 5가지 콘텐츠 아이디어를 제안해주세요.

크리에이터 아키타입: {archetype_name}
핵심 강점: {strengths}
주요 니치: {primary_niche}
보조 니치: {secondary_niche}
추천 플랫폼: {recommended_platforms}
분위기: {mood}

분석 결과:
- 재능: {talents}
- 감정 특성: {emotions}
- 관심 분야: {interests}
- 소통 스타일: {communication_style}

요구사항:
1. 각 아이디어는 이 크리에이터의 DNA에 맞는 구체적인 콘텐츠 주제
2. 다양한 format (숏폼, 브이로그, 카드뉴스, 릴스, 블로그 등) 혼합
3. 추천 플랫폼 우선, 다른 플랫폼도 포함 가능
4. hook은 시청자의 관심을 끌 수 있는 한 줄 문장
5. tags는 관련 키워드 2-5개
"""

변형 프롬프트:
"""
기존 콘텐츠 아이디어를 주어진 방향으로 변형해주세요.
원래 아이디어의 핵심 가치를 유지하면서 3가지 변형을 만들어주세요.
각 변형은 서로 다른 접근 방식이어야 합니다.
크리에이터의 DNA와 강점에 맞게 유지해주세요.
"""

확장 프롬프트:
"""
선택된 콘텐츠 아이디어를 실행 가능한 콘텐츠 기획으로 확장해주세요.
1. outline: 3-5개 섹션으로 콘텐츠 구조
2. opening_hook: 시청자를 사로잡을 오프닝 (2-3문장)
3. thumbnail_copy: 짧고 강렬한 문구
4. hashtags: 플랫폼에 맞는 해시태그 5-10개
"""
```

---

## Coaching Conversation UI — AI Agent 느낌 디자인

> 전체 앱을 Chat Interface가 아닌 "Coaching Conversation" 패턴으로 전환.
> AI 코치가 질문하고, 사용자가 답하고, 코치가 반응하는 1:1 코칭 느낌.
> ChatGPT wrapper가 아닌 therapist's office 무드.

### Landing 페이지 변경

```
현재: 정적 히어로 (헤드라인 + 버튼)
변경: AI 코치가 인사하며 시작하는 구조

구성:
- "YOUR AI COACH" (Label 스타일, uppercase)
- 활성 인디케이터: 작은 pulsing dot (stone → primary-text 반복, 2s)
- 헤드라인: "모두의 안에 크리에이터가 있다" (유지)
- AI 코치 라인: "AI 코치가 당신의 강점을 발견합니다" (caption, stone 색상)
- "시작하기" 버튼 (Primary, pill)
- "약 3분 소요" (유지)

핵심 차이:
- "YOUR AI COACH" 레이블 + pulsing dot으로 Agent 존재감 설정
- 부제가 Agent의 역할을 명시 ("AI 코치가 ~ 합니다")
```

### Stage 1 (코칭 질문) 변경

```
현재: 폼 스타일 (progress dots → 질문 번호 → 질문 → textarea → 버튼)
변경: 코칭 대화 스타일

구성:
- 상단: "YOUR AI COACH" 레이블 + 활성 인디케이터
- 구분선: 1px, border-subtle 색상
- 코치 인트로: "첫 번째 질문이에요." (caption, tertiary)
- 질문 텍스트: 24px, font-light, left-aligned
- 여백
- textarea: 기존과 동일 (white, stone border, 10px radius)
- 글자 수 카운터
- 하단: progress dots (5개) + "다음" 버튼 (Primary, pill)

핵심 변경 — 질문 전환 시 AI 코치 반응:
1. 사용자가 "다음" 클릭
2. textarea 내용 저장
3. 코치 상태 변경: "● 듣고 있어요..." (fade in, 0.3s)
4. 1초 후: 코치 반응 표시 (fade in)
   - 사용자 답변에서 핵심 키워드 추출 (클라이언트 로직)
   - 반응 문구: "{키워드}에 대한 이야기, 흥미롭네요." 패턴
   - 또는 고정 전환 문구 5개 (질문별):
     Q1→Q2: "몰입의 경험이 당신의 핵심 에너지군요."
     Q2→Q3: "주변 사람들이 인정하는 강점이 보이네요."
     Q3→Q4: "어릴 때의 즐거움에 힌트가 숨어있어요."
     Q4→Q5: "자연스럽게 잘하는 것, 중요한 단서예요."
5. 0.5초 후: "다음 질문입니다." (fade in)
6. 0.5초 후: 새 질문 slide in (기존 AnimatePresence 패턴)

구현 방식:
- 키워드 추출: 사용자 답변에서 명사/키워드 추출 (간단한 정규식 또는 split)
- API 호출 없음. 전환 문구는 하드코딩 또는 키워드 템플릿
- 전환 애니메이션: motion.div staggered children, 각 0.5s delay
```

### Stage 2 (분석 대기 화면) 변경

```
현재: 스피너 + 키워드 표시
변경: AI 코치가 "분석 중" 상태를 안내

구성:
- "YOUR AI COACH" 레이블
- 상태: "● 분석하고 있어요..." (pulsing dot 활성)
- 기존 키워드 표시 애니메이션 유지하되,
  코치가 "말하는" 형태로:
  "타고난 재능을 발견하고 있어요..."
  "감정적 강점을 분석하고 있어요..."
  "고유한 페르소나를 구성하고 있어요..."
- 완료 시: "발견했어요!" → DNA Card morph
```

### 디자인 규칙 추가

```
AI 코치 아이덴티티:
- 이름: "YOUR AI COACH" (Label 스타일: 10px, 600, uppercase, 0.14em tracking)
- 색상: tertiary-text (#9C958E)
- 활성 인디케이터: 6px 원형 dot
  - 기본: stone 색상
  - 활성(pulsing): stone ↔ primary-text, ease-in-out, 2s infinite
  - "듣고 있어요" 상태: primary-text 고정
- 코치 반응 텍스트: caption 스타일 (12px, 500), secondary-text 색상
- 코치 전환 문구: body 스타일 (15px, 400), primary-text, italic 아님

Anti-patterns:
- 채팅 버블 형태 금지 (말풍선, 좌우 정렬 대화)
- AI 아바타/프로필 이미지 금지
- 타이핑 인디케이터 (점 세 개 애니메이션) 금지
- "AI가 생각하고 있습니다..." 같은 메타 텍스트 금지
```

---

## 구현 순서

### Phase 1 (완료)
1. 프로젝트 초기화 + Tailwind 설정 + Pretendard 로딩
2. `lib/schemas.ts` + `lib/questions.ts` + `lib/store.ts`
3. Landing 페이지
4. Coaching 페이지 (질문 UI + 전환 애니메이션)
5. `/api/coaching` API Route
6. Analyzing Screen + Result 페이지 + DNACard 컴포넌트
7. `/api/og` DNA Card 이미지 생성
8. Error Screen
9. 테스트 7개
10. Vercel 배포

### Phase 1.5 — Coaching Conversation UI (AI Agent 느낌)
11. Landing 페이지 리디자인 ("YOUR AI COACH" + pulsing dot + Agent 카피)
12. Stage 1 코칭 대화 전환 (코치 인트로 + 전환 반응 + 키워드 추출)
13. Stage 2 분석 화면 Agent 느낌 적용 (코치 상태 안내)
14. `lib/coachResponses.ts` — 전환 문구 데이터 + 키워드 추출 유틸

### Phase 2.5 — Stage 4+5 통합
11. `lib/ideas.ts` — Zod 스키마 + AI 함수 3개
12. API Routes: `/api/ideas`, `/api/vary`, `/api/deepen`
13. Store 확장 (ContentIdea, DeepenedIdea, IdeaStage 등)
14. 리프 컴포넌트: IdeaCard, VaryPanel, DeepenView
15. Stage4 오케스트레이터 컴포넌트
16. 기존 수정: DNACard (onNext + CTA), Stage2 (onNext 전달), page.tsx (stage4 추가)
