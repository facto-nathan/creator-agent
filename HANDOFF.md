# HANDOFF — Creator Coaching AI

## Original Goal

"모두가 크리에이터가 되는 세상" — AI 코칭 에이전트와의 대화를 통해 사용자의 강점을 발견하고, 크리에이터 페르소나/니치를 정의하고, 맞춤 콘텐츠 아이디어를 생성/변형/확장하는 웹앱. 한국 크리에이터 시장 타겟. 해커톤 프로젝트.

핵심 비전: "Everyone, a creator." AI 시대에 기능적 차별화는 사라지고, 자신만의 아이덴티티만 남는다. 사람들이 자기 강점을 찾고 본인만의 채널로 성장할 수 있게.

## What Was Built (Current State)

### Architecture
- **Chat Interface** — 전체 경험이 하나의 채팅으로 통합. Landing → Chat(코칭 5개 질문) → DNA Card(인라인) → Ideas(2패널).
- **Split Layout** — 아이디어 단계에서 좌측 Chat(400px) + 우측 Ideas Panel. 모바일에서는 Chat/Ideas 탭 전환.
- **AI Backend** — Vercel AI SDK + Claude API (`claude-sonnet-4-20250514`). `generateObject()` + Zod 스키마.

### Tech Stack
- Next.js 15 (App Router, TypeScript)
- Tailwind CSS v4 (`@tailwindcss/postcss`, `@theme` 디렉티브)
- Zustand (상태 관리)
- Framer Motion (애니메이션)
- `@ai-sdk/anthropic` + `ai` (Vercel AI SDK)
- `@vercel/og` (DNA Card 이미지 생성)

### Design System (DESIGN.md)
- **Aesthetic:** Quiet Luxury — Toteme, cosmos.so, wabi.ai 영감
- **Palette:** Warm cream (#F0EBE3 배경), warm black (#1A1714 텍스트), stone grays
- **Font:** Pretendard Variable only. weight로 계층 구분.
- **Anti-patterns:** 장식 없음, 그라데이션 없음, 그림자 없음, 액센트 색상 없음

## What Worked

1. **Chat Interface 통합** — 코칭 5개 질문이 채팅으로 자연스럽게 진행됨. 키워드 기반 AI 인사이트 반응 (API 호출 없이 프론트엔드에서 처리).
2. **DNA Card** — AI 분석 후 아키타입/강점/니치/플랫폼을 카드로 표시. 채팅 안에 인라인 렌더링.
3. **아이디어 생성/변형/확장** — 3개 API route (`/api/ideas`, `/api/vary`, `/api/deepen`). 자연어 파싱 ("1번 변형해줘").
4. **Split Layout** — 아이디어 단계에서 2패널 레이아웃. 독립 스크롤.
5. **Tailwind v4** — `@import "tailwindcss"` + `@theme` 디렉티브로 커스텀 토큰 정의. `* { padding: 0 }` 리셋 제거가 핵심이었음 (Tailwind 유틸리티를 덮어씌움).
6. **localStorage 저장** — 세션 데이터(DNA Card + 아이디어 + 확장 결과) 저장.

## What Didn't Work / Known Issues

1. **Split Layout 스크롤 문제** — `h-[calc(100dvh-53px)]`로 수정했지만 아직 검증 필요. 채팅이 길어지면 우측 패널이 밀릴 수 있음.
2. **Trae 충돌** — Trae AI 에디터가 파일을 덮어쓰는 경우가 있었음. `ideas.ts`, API routes가 삭제되어 재생성한 적 있음.
3. **모델 ID** — 처음에 `claude-sonnet-4-5-20250514` (잘못된 ID) 사용. `claude-sonnet-4-20250514`로 수정 완료.
4. **globals.css** — Tailwind v4에서 `@tailwind base/components/utilities` 대신 `@import "tailwindcss"` 사용해야 함. `@font-face`로 CSS URL을 로드하면 안 됨 (layout.tsx의 `<link>` 태그로 해결).
5. **StrictMode 이중 실행** — useEffect에서 AI 인사 메시지가 중복 표시됨. `useRef` guard로 해결.
6. **OG 이미지에서 CSS Grid 사용** — Satori는 Grid 미지원. 아직 수정 안 됨. flexbox로 변경 필요.

## Files Changed (Key Files)

### Core Components
- `src/app/page.tsx` — Landing → ChatView 전환. Stage4 제거됨.
- `src/components/ChatView.tsx` — **핵심 파일**. 전체 플로우 오케스트레이터. 코칭/DNA Card/아이디어 모두 여기서 처리. 2패널 레이아웃.
- `src/components/ChatBubble.tsx` — AI/User 메시지 버블
- `src/components/ChatInput.tsx` — 하단 입력 바
- `src/components/Landing.tsx` — "Build your channel." 랜딩 페이지
- `src/components/DNACard.tsx` — Creator DNA Card 결과 표시
- `src/components/IdeaCard.tsx` — 아이디어 카드 + Variant.ai 인라인 액션
- `src/components/VaryPanel.tsx` — 커스텀 변형 입력
- `src/components/DeepenView.tsx` — 확장 결과 뷰 (아웃라인, 훅, 썸네일, 해시태그)
- `src/components/Stage1.tsx` — (더 이상 사용 안 함, ChatView로 대체)
- `src/components/Stage2.tsx` — (더 이상 사용 안 함)
- `src/components/Stage4.tsx` — (더 이상 사용 안 함, ChatView에 통합)

### API Routes
- `src/app/api/coaching/route.ts` — POST: 답변 5개 → 강점분석 + 페르소나 (3회 재시도)
- `src/app/api/ideas/route.ts` — POST: DNA + 분석 → 5개 아이디어
- `src/app/api/vary/route.ts` — POST: 아이디어 + 방향 → 3개 변형
- `src/app/api/deepen/route.ts` — POST: 아이디어 → 아웃라인/훅/썸네일/해시태그
- `src/app/api/og/route.tsx` — GET: DNA Card PNG 이미지 생성

### Lib
- `src/lib/analyze.ts` — AI 코칭 분석 함수 (generateObject + Zod)
- `src/lib/ideas.ts` — 아이디어 생성/변형/확장 함수 3개
- `src/lib/questions.ts` — 코칭 질문 5개 데이터

### Store
- `src/store/useCoachingStore.ts` — Zustand store (answers, DNA card, ideas, deepened 등)
- `src/store/CoachingContext.tsx` — React Context provider

### Config
- `DESIGN.md` — 디자인 시스템 (색상, 폰트, 스페이싱, 컴포넌트 패턴)
- `CLAUDE.md` — AI 에이전트 행동 규칙
- `IMPLEMENTATION.md` — 구현 명세
- `.env.local` — `ANTHROPIC_API_KEY` (설정 필요)

## What Remains To Do

### 버그 수정 (High Priority)
1. **Split Layout 스크롤** — 우측 Ideas 패널이 채팅 스크롤에 영향받지 않는지 재검증. `h-[calc(100dvh-53px)]` 적용 확인.
2. **OG 이미지 Grid → Flexbox** — `src/app/api/og/route.tsx`에서 `gridTemplateColumns` 사용 중. Satori 미지원. flexbox로 변경.
3. **사용하지 않는 컴포넌트 정리** — Stage1.tsx, Stage2.tsx, Stage4.tsx는 더 이상 사용 안 함. 삭제 가능.
4. **questions.ts 검증** — q4 placeholder 깨진 문자가 이전에 수정되었는지 확인.

### 디자인 폴리싱 (Medium Priority)
5. **채팅 내 DNA Card 크기** — 채팅 안에서 DNA Card가 너무 커서 스크롤이 많이 필요. 컴팩트 버전 고려.
6. **아이디어 카드 선택 시각 피드백** — 선택 상태가 더 명확해야 함.
7. **모바일 Chat/Ideas 탭 전환** — 실제 모바일 디바이스에서 테스트 필요.
8. **에러 상태 UI** — AI API 실패 시 채팅 안에서의 에러 표시 개선.

### 기능 추가 (Low Priority)
9. **저장 세션 복원** — Landing에서 "이전 세션 이어보기" 버튼. localStorage에서 복원.
10. **공유 기능** — DNA Card를 이미지로 다운로드 + SNS 공유 (Web Share API).
11. **Vercel 배포 최적화** — Edge Runtime, rate limiting, 에러 모니터링.
12. **테스트** — Vitest로 핵심 패스 테스트 7개 (API happy path, Zustand store, Zod schema).

### 환경 설정
- `.env.local`에 `ANTHROPIC_API_KEY` 설정 필요
- Dev server: `PORT=3004 npm run dev`
- 현재 GitHub: `facto-nathan/creator-agent` (main 브랜치)
