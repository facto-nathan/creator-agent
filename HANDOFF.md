# HANDOFF — Creator Coaching AI

## Original Goal

"모두가 크리에이터가 되는 세상" — AI 코칭 에이전트와의 대화를 통해 사용자의 강점을 발견하고, 크리에이터 페르소나/니치를 정의하고, 맞춤 콘텐츠 아이디어를 생성/변형/확장하는 웹앱. 한국 크리에이터 시장 타겟.

핵심 비전: "Everyone, a creator." AI 시대에 기능적 차별화는 사라지고, 자신만의 아이덴티티만 남는다. 사람들이 자기 강점을 찾고 본인만의 채널로 성장할 수 있게.

## Next Vision: Creator Workspace (2026-03-28)

**사용자 방향:** "모든 크리에이터의 시작점과 끝점이 될 수 있는 워크스페이스가 되어야 합니다."

이전 세션에서 "해커톤 → 서비스" 진화를 완료했고, 다음 단계는 "서비스 → 플랫폼"입니다. 단순한 DNA 발견 도구가 아니라 크리에이터의 전체 여정을 지원하는 워크스페이스. CEO Review에서 SCOPE EXPANSION 모드로 이 비전을 탐색해야 합니다.

**핵심 질문:**
- "시작점": 강점 발견 + DNA Card + 아이디어 (현재 완료)
- "끝점": 콘텐츠 기획 → 제작 → 퍼블리싱 → 성장 분석까지?
- 어디까지가 이 제품의 범위이고, 어디서 다른 도구와 연결하는가?

**현재 상태 요약:**
- 적응형 코칭 (5개 핵심 Q + AI 후속 질문)
- 온보딩 분기 (초보/활동 중)
- DNA Card 생성 + 공유 (/dna/[id])
- Creator Compatibility (콜라보 아이디어)
- 트렌드 API (YouTube Korea + 큐레이션 폴백)
- Supabase 세션 저장 (Tied-dev)
- Rate limiting + Analytics
- 23 테스트, 빌드 통과, QA 완료

**남은 TODO (HANDOFF 하단 참조):** Auth, Trend UI 연결, 애니메이션, OG 폰트, E2E 테스트, Sentry, Comparison Workspace

---

## Evolution: Hackathon → Platform (2026-03-28)

해커톤 MVP에서 실제 서비스 기반으로 진화. CEO Review → Design Review → Eng Review → 구현 → QA 완료.

### Review History
- **CEO Review** (`/plan-ceo-review`): SCOPE EXPANSION 모드. 10개 제안 중 9개 승인, 1개(Auth) 연기. Codex outside voice 11개 피드백 반영.
- **Design Review** (`/plan-design-review`): 4/10 → 8/10. DESIGN.md에 11개 결정 추가. Codex + Claude subagent 디자인 외부 목소리 반영.
- **Eng Review** (`/plan-eng-review`): 2 PR 전략 확정. Upstash rate limiting, Vitest + Playwright 테스트 인프라.

### PR #1: Platform Foundation (merged → main)
- **Canonical Schemas** (`src/lib/schemas.ts`): Zod 스키마 + `SCHEMA_VERSION` 버전 관리. `SessionSchema`, `CoachingResponseSchema`, `CreatorDNACardSchema`.
- **Shared AI Client** (`src/lib/ai-client.ts`): Sonnet (분석용) + Haiku (대화용) 이중 모델. `AI_CONFIG`로 retry/token 설정 통합. 4개 API route에서 중복 제거.
- **Supabase Persistence** (`src/lib/supabase.ts`): 익명 세션 CRUD. `createSession()`, `getSession()`, `updateSession()`. Auth 없이 UUID 기반.
- **Rate Limiting** (`middleware.ts`): `@upstash/ratelimit` IP 기반 3req/min + 일일 500회 예산 캡. Upstash 미설정 시 graceful degradation.
- **ChatView Decomposition**: 440줄 god component → hooks로 분리.
  - `useCoachingFlow` (`src/hooks/useCoachingFlow.ts`): 질문 순서, 답변 검증, 인사이트 생성, 후속 질문 지원
  - `useMessageQueue` (`src/hooks/useMessageQueue.ts`): 중첩 setTimeout 체인 → 비동기 메시지 큐. 취소 가능, 테스트 가능.
- **CompactDNACard** (`src/components/CompactDNACard.tsx`): 채팅 내 DNA 카드 요약. "자세히 보기 ▸" 링크로 Profile Sheet 연결.
- **ErrorBoundary** (`src/components/ErrorBoundary.tsx`): React 에러 바운더리. "문제가 발생했어요" + 재시도 버튼.
- **Landing Redesign** (`src/components/Landing.tsx`): 제품 중심 랜딩. DNA Card 견본("감성 큐레이터")이 히어로. "나만의 DNA 카드 만들기" CTA. 기존 "Build your channel" 제거.
- **Shared DNA Card Page** (`src/app/dna/[id]/`): 서버 렌더링 Profile Sheet. Supabase에서 세션 로드. OG 메타 태그. 공유 버튼 (Web Share API + 클립보드). not-found: 따뜻한 빈 상태.
- **OG Image Fix** (`src/app/api/og/route.tsx`): Grid → Flexbox (Satori 호환). 3차 텍스트 컬러 #9C958E → #8A837C (WCAG AA 준수).
- **Session API** (`src/app/api/session/route.ts`): POST 생성, GET 조회, PATCH 업데이트. UUID 검증.
- **Vercel Analytics** (`src/app/layout.tsx`): `@vercel/analytics` 추가.
- **Dead Code 삭제**: Stage1.tsx, Stage2.tsx, Stage4.tsx 제거.
- **Test Infrastructure**: Vitest + @testing-library/react. 21 테스트 (스키마 검증, 코칭 플로우 훅, 메시지 큐 훅).
- **DESIGN.md 업데이트**: 3개 레이아웃 프리미티브 (Conversation Rail, Profile Sheet, Comparison Workspace), border-radius 규율, 6개 신규 컴포넌트 패턴, 대비 수정, 랜딩 리디자인 사양.

### PR #2: Platform Features (merged → main)
- **Adaptive Coaching** (`src/lib/followup.ts`, `/api/followup`): Haiku 모델로 후속 질문 생성. 핵심 질문당 최대 2개. 답변 깊이 평가 → 피상적이면 후속 질문, 충분하면 다음으로.
- **Onboarding Branch** (`src/components/OnboardingBranch.tsx`): 풀스크린 선택. "아직 시작 전이에요" vs "이미 활동 중이에요". 각각 다른 질문 세트 (`src/lib/questions.ts`의 `getQuestions(level)`).
- **Creator Compatibility** (`/api/compat`): 두 DNA Card 결합. Claude Sonnet으로 시너지 분석 + 3개 콜라보 아이디어. `/dna/[id]` 페이지에 "콜라보 아이디어 보기" 버튼.
- **Trends API** (`/api/trends`): YouTube Trending Korea + 큐레이션 폴백. 6시간 캐시. Graceful degradation.
- **Session Persistence**: 코칭 완료 후 자동 Supabase 저장. Compact DNA Card → `/dna/[sessionId]` 링크.
- **"다시 코칭받기"**: 결과 화면에 재코칭 버튼.
- **Type Fix**: Zustand store `setDeepenedIdea`, `setFinalIdea`가 null 허용. `null as never` 제거. `CoachingAnswers`를 동적 키로 변경.
- **23 테스트** (2개 추가: 후속 질문 메커니즘, 온보딩 레벨 선택).

## Current Architecture

```
Vercel Edge Middleware (rate limiting)
  ↓
Next.js 15 App Router
  ├── page.tsx (Landing → ChatView)
  ├── /dna/[id]/ (Profile Sheet, server-rendered)
  ├── /api/coaching (Claude Sonnet → DNA 분석)
  ├── /api/followup (Claude Haiku → 후속 질문)
  ├── /api/ideas (아이디어 생성)
  ├── /api/vary (아이디어 변형)
  ├── /api/deepen (아이디어 확장)
  ├── /api/compat (DNA 호환성 분석)
  ├── /api/trends (YouTube 트렌드 Korea)
  ├── /api/session (Supabase CRUD)
  └── /api/og (OG 이미지 생성)
  ↓
Supabase (Tied-dev project: opcguooryqbdxoqxboqd)
  └── public.sessions (id, schema_version, coaching_answers, dna_result, ideas, created_at)
```

### Tech Stack
- Next.js 15 (App Router, TypeScript, Turbopack)
- Tailwind CSS v4 (`@tailwindcss/postcss`, `@theme`)
- Zustand (상태 관리)
- Framer Motion (애니메이션)
- `@ai-sdk/anthropic` + `ai` (Vercel AI SDK): Sonnet (분석) + Haiku (대화)
- `@supabase/supabase-js` (persistence)
- `@upstash/ratelimit` + `@upstash/redis` (rate limiting)
- `@vercel/analytics` (웹 분석)
- `@vercel/og` (DNA Card 이미지)
- Vitest + `@testing-library/react` (23 테스트)

### Design System (DESIGN.md)
- **Aesthetic:** Quiet Luxury — Toteme, cosmos.so
- **Palette:** Warm cream (#F0EBE3), warm black (#1A1714), tertiary #8A837C (WCAG AA)
- **Font:** Pretendard Variable only
- **Layout Primitives:** Conversation Rail, Profile Sheet, Comparison Workspace
- **Border-radius discipline:** full은 태그+CTA만, xl(16px) 카드, md(6px) 컨트롤
- **Anti-patterns:** 그라데이션 없음, 그림자 없음, 액센트 색상 없음, 3-column 그리드 없음

## Key Files

### Components
- `src/components/ChatView.tsx` — 핵심 오케스트레이터. 온보딩 → 코칭 → DNA Card → Ideas.
- `src/components/Landing.tsx` — DNA Card 견본 히어로 랜딩
- `src/components/CompactDNACard.tsx` — 채팅 내 DNA 요약 (Profile Sheet 링크)
- `src/components/OnboardingBranch.tsx` — "시작 전" vs "활동 중" 풀스크린 선택
- `src/components/ChatBubble.tsx` — AI/User 메시지 버블
- `src/components/ChatInput.tsx` — 하단 입력
- `src/components/DNACard.tsx` — DNA Card 전체 표시 (레거시, Profile Sheet에서 사용)
- `src/components/IdeaCard.tsx` — 아이디어 카드 + 변형 액션
- `src/components/DeepenView.tsx` — 확장 결과 뷰
- `src/components/VaryPanel.tsx` — 커스텀 변형 입력
- `src/components/ErrorBoundary.tsx` — React 에러 바운더리

### Hooks
- `src/hooks/useCoachingFlow.ts` — 질문 순서, 검증, 후속 질문, 온보딩 레벨
- `src/hooks/useMessageQueue.ts` — 비동기 메시지 큐 (setTimeout 대체)

### API Routes
- `src/app/api/coaching/route.ts` — 답변 → 강점분석 + DNA Card
- `src/app/api/followup/route.ts` — 후속 질문 생성 (Haiku)
- `src/app/api/ideas/route.ts` — 5개 아이디어 생성
- `src/app/api/vary/route.ts` — 아이디어 변형 3개
- `src/app/api/deepen/route.ts` — 아이디어 확장 (아웃라인/훅/썸네일/해시태그)
- `src/app/api/compat/route.ts` — 두 DNA Card 호환성 분석
- `src/app/api/trends/route.ts` — 트렌드 데이터
- `src/app/api/session/route.ts` — Supabase 세션 CRUD
- `src/app/api/og/route.tsx` — DNA Card PNG 이미지

### Lib
- `src/lib/ai-client.ts` — 공유 Claude 모델 설정 (Sonnet + Haiku)
- `src/lib/schemas.ts` — Zod 스키마 + 버전 관리
- `src/lib/supabase.ts` — Supabase 클라이언트 + 세션 CRUD
- `src/lib/analyze.ts` — AI 코칭 분석
- `src/lib/followup.ts` — 후속 질문 생성
- `src/lib/ideas.ts` — 아이디어 생성/변형/확장
- `src/lib/questions.ts` — 코칭 질문 (beginner/active 분기)

### Store
- `src/store/useCoachingStore.ts` — Zustand store (동적 키 답변, nullable 타입 수정)
- `src/store/CoachingContext.tsx` — React Context provider

### Config
- `DESIGN.md` — 디자인 시스템 (레이아웃 프리미티브, 컴포넌트 패턴, 대비 수정)
- `CLAUDE.md` — AI 에이전트 행동 규칙
- `TODOS.md` — Auth P1 연기, 애니메이션 프로토타입 미완
- `middleware.ts` — Upstash rate limiting + 일일 예산
- `vitest.config.ts` — 테스트 설정

## Environment Variables

```env
# .env.local
ANTHROPIC_API_KEY=sk-ant-...

# Supabase (Tied-dev)
NEXT_PUBLIC_SUPABASE_URL=https://opcguooryqbdxoqxboqd.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...

# Upstash Redis (선택, 없어도 동작)
UPSTASH_REDIS_REST_URL=https://...upstash.io
UPSTASH_REDIS_REST_TOKEN=AX...
```

## What Remains To Do

### 배포 (즉시)
1. **Upstash Redis 설정** — console.upstash.com에서 생성. 없어도 앱 동작 (rate limiting만 비활성).
2. **Vercel 배포** — env vars 설정 후 `vercel --prod`. 현재 GitHub: `facto-nathan/creator-agent` (main).

### 기능 (P1)
3. **Auth + 사용자 계정** — Supabase auth (Google/Kakao). 세션 "claim" (익명→회원 전환). DNA Card 히스토리.
4. **Trend × DNA 아이디어 통합** — 현재 `/api/trends` API만 존재. ChatView에 트렌드 아이디어 UI 연결 필요.

### 품질 (P2)
5. **Framer Motion 애니메이션** — DNA Card reveal morph (DESIGN.md에 정의됨, 미구현).
6. **OG 이미지 한국어 폰트** — Satori에 Pretendard/Noto Sans KR 폰트 로딩 필요 (현재 기본 폰트).
7. **E2E 테스트** — Playwright로 전체 코칭 플로우 (현재 유닛 테스트만).
8. **Sentry 에러 모니터링** — 패키지 설치됨, 초기화 미완.

### 디자인 (P3)
9. **Comparison Workspace** — 재코칭 DNA 비교 + 호환성 비교 레이아웃 (DESIGN.md에 정의됨).
10. **DNA Card 진화** — 코칭 반복 시 카드 비주얼 변화 (미래 기능).

## QA Status (2026-03-28)
- 랜딩 페이지: ✅ DNA Card 견본 히어로, CTA 동작
- 온보딩 분기: ✅ "시작 전" / "활동 중" 선택 동작
- 코칭 Q1: ✅ Stage label, 프로그레스 도트, 입력 활성
- DNA not-found: ✅ 따뜻한 빈 상태, CTA
- 모바일 (375px): ✅ 완전 반응형
- 콘솔 에러: 0개
- Supabase 세션 API: ✅ 생성/조회 검증 완료
- 빌드: ✅ 모든 라우트 컴파일
- 테스트: ✅ 23/23 통과
