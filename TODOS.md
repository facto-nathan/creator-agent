# TODOS

## Design System
- [x] `/design-consultation` 실행하여 DESIGN.md 생성 (2026-03-28 완료)
  - **Why:** 현재 색상/타이포/스페이싱 미정의. 엔지니어가 임의 결정하면 제품 정체성 없음.
  - **Depends on:** 없음. 구현 전에 완료 필요.

## Animation Prototype
- [ ] Framer Motion shared layout animation 프로토타입 (Stage 1→2 전환)
  - **Why:** full-page morph 선택했으나 구현 복잡도 있음. 먼저 한 화면 전환을 프로토타입으로 확인.
  - **Fallback:** 너무 복잡하면 fade+slide로 전환.
  - **Depends on:** Next.js 프로젝트 스캐폴딩 완료 후.

## Auth + User Accounts (P1)
- [ ] Supabase auth (Google/Kakao social login) + Postgres 사용자 프로필
  - **What:** 사용자 계정 시스템. 코칭 히스토리, 여러 DNA Card, 저장된 아이디어 관리.
  - **Why:** 재방문 사용자, DNA Card 진화, 커뮤니티 기능, 수익화의 기반. 이것 없이는 모든 세션이 one-shot.
  - **Pros:** 12개월 비전의 핵심 인프라. 세션 "claim" 가능 (익명→회원 전환).
  - **Cons:** 개인정보보호 고려 필요. Supabase 의존도 증가.
  - **Context:** 현재 pre-auth Supabase anonymous rows로 시작. Auth 추가 시 기존 세션을 사용자 계정에 연결.
  - **Effort:** L (human) → M with CC (~30-45 min)
  - **Priority:** P1
  - **Depends on:** Pre-auth Supabase 설정 (현재 스코프에 포함)
  - **Added:** 2026-03-28 via /plan-ceo-review
