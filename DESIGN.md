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
- **Tertiary text:** #8A837C — muted (updated for WCAG AA contrast on cream bg)
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
- **Border radius discipline:** `full` for tags + primary CTA ONLY. `xl(16px)` for cards. `md(6px)` for controls/inputs/panels. Do not use `rounded-full` on everything.

## Layout Primitives (Platform)
Three core layouts. Every new screen maps to one of these.

### 1. Conversation Rail
- Chat-based coaching flow with stage labels in chrome bar
- Stage label: current stage only (e.g., "Coaching · Q3/5", "DNA Card", "Ideas")
- Compact DNA Card: single row summary in chat, links to full Profile Sheet
- Bottom: input bar (coaching phase) or action bar (ideas phase)

### 2. Profile Sheet
- Standalone page for DNA Card viewing and sharing (`/dna/[sessionId]`)
- Full DNA Card display with sharing controls
- CTAs: "나도 DNA 카드 만들기" (primary) + "콜라보 아이디어 보기" (secondary)
- This is the viral artifact page. Must be gorgeous.

### 3. Comparison Workspace
- Side-by-side layout for re-coaching and compatibility mode
- Desktop: two cards at 220px each with 40px gap within 480px
- Mobile: stacked vertically with tab switcher (Before/After or Me/Friend)
- Diff summary below cards

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

### New Component Patterns (Platform)
- **Stage Label:** 10px/600/uppercase label in chrome bar. Stone bg (#E8E2D8), 4px radius. Current stage only.
- **Compact DNA Card:** Single row in chat. Archetype name + "자세히 보기 ▸". White bg, subtle border, 10px radius. Links to Profile Sheet.
- **Share Toast:** Fixed bottom toast. "링크가 복사되었어요" white bg, 6px radius, fade in/out 200ms.
- **Share Mechanism:** Web Share API on mobile (native share sheet). Desktop: clipboard copy + SNS buttons (Twitter, Instagram, KakaoTalk).
- **Comparison Layout:** Two cards side-by-side (desktop) or stacked with tabs (mobile). Diff summary below.
- **Trend Badge:** Small pill on idea cards. "📈 트렌드" (functional exception to emoji rule). Stone surface, 12px text.
- **Collab Badge:** On compatibility idea cards. "COLLAB" label + both archetype names in header.
- **Onboarding Branch:** Full-screen selection. Two large tappable areas with descriptions. "아직 시작 전이에요" + "이미 활동 중이에요". Same layout feel as coaching Qs.

### Landing Page (Platform)
- **Hero:** DNA Card specimen as visual anchor. Sample archetype: "감성 큐레이터".
  - Strengths: 공감력, 분석력, 스토리텔링
  - Niche: 라이프스타일 × 자기계발
  - Platforms: YouTube, Instagram
- **Specimen behavior:** Live component with subtle tilt on hover. Not static image.
- **CTA:** "나만의 DNA 카드 만들기" (primary, dark pill, full width)
- **Sub-copy:** "AI 코칭으로 크리에이터 강점을 발견하고 나만의 콘텐츠 전략을 설계하세요"
- **Footer:** "약 8분 소요" (label style)
- **Removed:** Generic "Build your channel" hero copy. Removed 3-feature strip (Strength/Niche/Content).

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
| 2026-03-28 | Tertiary text darkened | #9C958E → #8A837C for WCAG AA contrast compliance on cream bg. |
| 2026-03-28 | 3 layout primitives | Conversation Rail, Profile Sheet, Comparison Workspace. Prevents "stacked cards" anti-pattern. |
| 2026-03-28 | Product-first landing | DNA Card specimen as hero. Removed generic "Build your channel" copy. Shows the product, not marketing. |
| 2026-03-28 | Full-screen onboarding | "시작 전" vs "활동 중" as intentional first decision, not quick modal. |
| 2026-03-28 | Compact DNA in chat | Full DNA Card only on standalone Profile Sheet. Chat gets compact summary row. |
| 2026-03-28 | Border-radius discipline | full only for tags + CTA. xl for cards. md for controls. No uniform bubbly radius. |
| 2026-03-28 | 감성 큐레이터 specimen | Landing page DNA Card sample. Warm, relatable, represents emotional intelligence angle. |
