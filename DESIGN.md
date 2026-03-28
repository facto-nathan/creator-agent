# Design System — Creator Coaching AI

## Product Context
- **What this is:** AI 코칭을 통해 사용자의 강점을 발견하고 크리에이터 페르소나/니치를 정의하는 웹앱
- **Who it's for:** 한국 크리에이터 지망생 (유튜브, 인스타그램, 틱톡)
- **Space/industry:** Creator economy, self-discovery, AI coaching
- **Project type:** Web app (Next.js, mobile-first, max-width 480px)

## Aesthetic Direction
- **Direction:** Quiet Luxury — Totême, Toogood 감성. 극도의 절제, 타이포와 여백이 전부.
- **Decoration level:** Minimal — 장식 제로. 그라데이션/글로우/그림자 없음.
- **Mood:** 따뜻한 자기 성찰. X-ray 꽃 사진의 유기적 따뜻함 + 하이엔드 패션의 절제.
- **Reference sites:** toteme-studio.com, cosmos.so, wabi.ai

## Typography
- **All roles:** Pretendard Variable — 한 서체로 통일. weight와 letter-spacing으로 계층 구분.
- **Hero:** 40px / weight 300 (Light) / letter-spacing -0.025em
- **Heading:** 26px / weight 500 (Medium) / letter-spacing -0.015em
- **Body:** 15px / weight 400 (Regular) / line-height 1.75
- **Caption:** 12px / weight 500 (Medium) / letter-spacing 0.02em
- **Label:** 10px / weight 600 (Semibold) / letter-spacing 0.14em / uppercase
- **Loading:** `https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css`
- **Scale:** Hero(40) → H2(26) → H3(20) → Body(15) → Caption(12) → Label(10)

## Color
- **Approach:** Restrained — warm monochrome. 색상은 시맨틱에서만.
- **Background:** #F0EBE3 — warm cream
- **Surface:** #E8E2D8 — warm stone
- **Elevated:** #FFFFFF — white cards
- **Border:** #D6CFC5 — warm border
- **Border subtle:** #E0DAD0
- **Primary text:** #1A1714 — warm black
- **Secondary text:** #6B6560 — warm mid
- **Tertiary text:** #9C958E — muted
- **Stone:** #B8AFA4 — decorative neutral
- **Accent:** #1A1714 (same as primary text — buttons are dark, not colored)
- **Accent inverse:** #F0EBE3
- **Semantic:** success #5A8A6A, warning #A68B4E, error #A65A5A, info #5A7A9A
- **Tag:** bg #E8E2D8, border #D6CFC5, text #6B6560
- **Dark mode:** Not needed for hackathon. If added later: invert to warm dark (#1A1714 bg, #F0EBE3 text), reduce surface contrast.

## Spacing
- **Base unit:** 4px
- **Density:** Comfortable — 코칭 대화는 넉넉하게 숨 쉴 공간
- **Scale:** 2xs(2) xs(4) sm(8) md(16) lg(24) xl(32) 2xl(48) 3xl(64)

## Layout
- **Approach:** Grid-disciplined, mobile-first
- **Max content width:** 480px (desktop에서도 모바일 프레임 유지)
- **Desktop:** 센터 정렬, 480px 컨테이너
- **Navigation:** 단방향 플로우. 뒤로가기 없음.
- **Border radius:** sm:2px, md:6px, lg:10px, xl:16px, full:9999px

## Motion
- **Approach:** Intentional — Framer Motion shared layout animation
- **Transitions:** full-page morph (Stage 간 전환). 요소가 자연스럽게 변환.
- **Easing:** enter(ease-out) exit(ease-in) move(ease-in-out)
- **Duration:** micro(50-100ms) short(150-250ms) medium(250-400ms) long(400-700ms)
- **DNA Card reveal:** 특별한 모멘트. 분석 키워드 → 카드 morph. 400-700ms.

## Component Patterns
- **Buttons:** pill shape (border-radius: full). Primary = dark fill. Secondary = outline. Ghost = underline.
- **Cards:** white (#FFF) background, subtle border (#E0DAD0), rounded (16px). No shadow.
- **Tags:** stone surface (#E8E2D8), pill shape, 12px text.
- **Input:** white background, stone border, 10px radius. Focus: border darkens to tertiary.
- **Progress dots:** 5px circles. done = stone, active = primary, pending = border.

## Anti-patterns
- No gradients, glows, or shadows
- No colored accents (gold, purple, blue) — monochrome only
- No emoji as UI elements
- No decorative blobs, waves, or patterns
- No centered-everything layout
- No 3-column icon grids
- No heavy border-radius on all elements uniformly

## Decisions Log
| Date | Decision | Rationale |
|------|----------|-----------|
| 2026-03-28 | Pretendard only | User requested single font. Weight variation provides hierarchy. |
| 2026-03-28 | Warm cream palette | Inspired by X-ray botanical photography + Totême/Toogood quiet luxury. |
| 2026-03-28 | No accent color | Monochrome warm palette. Color only for semantic states. |
| 2026-03-28 | Light mode only | Warm cream background is the product identity. Dark mode deferred. |
