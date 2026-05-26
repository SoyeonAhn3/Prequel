# Phase 5 — Design (How) `In Progress`

> Post-kickoff design phase: 9-screen guided flow — welcome → requirements → architecture → data model → AI workflow → completion, with step transitions between each. Wizard-style shell UI designed for beginners.

**Status**: In Progress (Backend ✅, Frontend rewriting)
**Prerequisites**: Phase 4 completion (Kickoff + user chose to proceed with design)
**Design reference**: `ui-reference/design-phase-flow-standalone.jsx` (9 screens, standalone)

---

## Overview

After Phase 4 kickoff completes and the user chooses to proceed with design, Phase 5 transforms collected interview insights into structured design artifacts through a **9-screen guided flow**.

### Screen flow (9 screens)

```
00 · Welcome → 01-A · Requirements → 01→02 Transition
→ 02-A · Architecture → 02→03 Transition
→ 03-A · Data Model → 03→04 Transition
→ 04-A · AI Workflow → 05 · Complete
```

**Pipeline order**: `/design-requirements` → `/design-architecture` → `/design-data-model` → `/design-ai-workflow`

Each design skill takes interview insights + prior step outputs as input and produces structured output. The pipeline feeds forward — requirements inform architecture, architecture informs data model. Each design skill is loaded via `load_skill()` from `harness_loader.py` (ADR-006).

**Design UI** is a 9-screen guided wizard (not chat-based), designed for **"people who don't know much about design/architecture"** — featuring AI question bubbles, clickable suggestion lists, template choosers, visual pipeline diagrams, and plain Korean explanations. Uses the shared `Frame` + `TopBar` for consistent app navigation.

> **Note**: After design completes, Phase 6 (Evaluation & Finalization) runs evaluate → done → gap → checklist. "Design later" feature is deferred to **V2**.

> **Scope exclusion**: AI model selection (Sonnet/Haiku/Opus picker) and cost estimation are deferred to V2.

---

## Deliverables

### Backend (✅ Complete — no changes needed)

| # | Task | Status | Related FR |
|---|---|---|---|
| B1 | `/design-requirements` — functional/non-functional requirements generation | ✅ | FR-022 |
| B2 | `/design-architecture` — system architecture design | ✅ | FR-023 |
| B3 | `/design-data-model` — data model & schema design | ✅ | FR-024 |
| B4 | `/design-ai-workflow` — AI/ML pipeline design | ✅ | FR-025 |
| B5 | `design_sessions` DB table + migration (006) | ✅ | — |
| B6 | Truncated JSON auto-repair (`_repair_truncated_json`) | ✅ | — |
| B7 | Project status routing (`designing` status support) | ✅ | — |

### Frontend (Rewriting — match `design-phase-flow-standalone.jsx`)

| # | Task | Status |
|---|---|---|
| F1 | Shared `Frame` + `TopBar` component (56px nav bar, tabs, user avatar, credits) | |
| F2 | Shared `Btn` component (primary/secondary/ghost/soft/danger × sm/md/lg) | |
| F3 | `AiQuestion` component — AI question bubble (AiMarkD + accent border + hint) | |
| F4 | `AiSuggestionList` component — clickable suggestion cards with + button | |
| F5 | `StepTransition` component — step complete/summary/next preview full-page | |
| F6 | `ScreenDesignWelcome` — welcome page (4-step preview cards, CTA) | |
| F7 | `ScreenDesignStep1Start` — requirements (AiQuestion + empty state + suggestions + direct input) | |
| F8 | `ScreenDesignStep2Start` — architecture (TemplateCard selection + SVG diagram + component explanations) | |
| F9 | `ScreenDesignStep3Start` — data model (3-col entity grid + relationship cards + validation rules) | |
| F10 | `ScreenDesignStep4Start` — AI workflow (INPUT→AI→OUTPUT pipeline + fallback strategy) | |
| F11 | `ScreenDesignComplete` — completion page (stats + summary + export buttons + Phase 3 CTA) | |
| F12 | `ArchHelperPanel` — right 300px panel (guide + glossary) | |
| F13 | `DataHelperPanel` — right 300px panel (Excel analogy + type explanations) | |
| F14 | `AiHelperPanel` — right 300px panel (3-question guide + fallback tips) | |
| F15 | `DesignStepFooter` update — step-specific primary labels ("시스템 구조로 →" etc.) | |
| F16 | `DesignShell` update — integrate Frame wrapper + right helper panel slot | |
| F17 | `AiSuggestionList` dynamic data binding — connect to backend recommendation based on interview context | |
| F18 | `ArchitectureStep` dynamic SVG generation — render diagram from `session.architecture.components[]` | |
| F19 | `AiWorkflowStep` dynamic IO pipeline — parse `session.ai_workflow` for INPUT/OUTPUT lists | |
| F20 | `StepTransition` dynamic summaries — extract summary from each step's session data | |
| F21 | `DataModelStep` dynamic validation rules — derive integrity rules from `session.data_model` analysis | |

---

## 9-Screen Specification

### Screen 00 · `ScreenDesignWelcome` (진입)

Full-page welcome, centered content (maxWidth 760px).

- "PHASE 2 of 3 · 시작" pill badge
- Title: "이제 **설계 단계**를 시작할게요"
- Subtitle: "네 가지 질문에 답하시면 됩니다"
- 2×2 grid: 4 step preview cards (icon 40px + step number + name + question + ~5분)
- "완료하면 얻는 것" green info box (check icon + description)
- Primary CTA: "네, 설계를 시작할게요" (accent + shadow)
- Ghost CTA: "나중에 결정할게요"

### Screen 01-A · `ScreenDesignStep1Start` (기능 정의)

DesignShell with activeStep="requirements", no helper panel.

- `DesignStepHeader`: "이 도구가 할 수 있는 일을 정의해볼까요?", currentQ=1, totalQ=5
- `AiQuestion`: "사용자가 이 도구를 사용하면서 **꼭 할 수 있어야 하는 일**이 무엇인가요?" + hint
- Empty state card: "아직 추가된 기능이 없어요" (features icon + dashed border)
- `AiSuggestionList`: AI-generated suggestions with clickable + buttons for individual addition
- Direct input area: text input with "Enter로 추가" hint + "+ 추가" Btn
- Footer: "다음 질문 →"

### Screen 01→02 · `StepTransition` (기능→시스템)

Full-page transition (maxWidth 680px, centered).

- Green check icon (56px) + "STEP 01 COMPLETE"
- "기능 정의 완료!" title
- Summary card: bullet list of what was defined + "편집" link
- Next preview: accentSoft card with "다음 · STEP 02" + "시스템 구조" + preview text
- Buttons: "이전 단계 다시 보기" (secondary) + "시스템 구조 시작하기" (primary)

### Screen 02-A · `ScreenDesignStep2Start` (시스템 구조)

DesignShell with activeStep="architecture", helperPanel={ArchHelperPanel}.

- `DesignStepHeader`: "이 도구의 부품들을 골라볼까요?", currentQ=3, totalQ=5
- `Explainer`: "시스템 구조 = 아키텍처 (Architecture)"
- "추천 조합 골라보기" — 3-column `TemplateCard` grid (간단/확장/실시간)
- "선택한 조합 미리보기" — **custom SVG architecture diagram** (color-coded boxes + arrows)
  - Blue (accentSoft) = user-facing, Green (greenSoft) = storage, Amber (amberSoft) = AI
  - Color legend at bottom
- "각 부품을 왜 골랐나요?" — component explanation cards (emoji + name + reason + "자동 선택됨" badge)
- Footer: "데이터 구조로 →"

### Screen 02→03 · `StepTransition` (시스템→데이터)

Same pattern as 01→02 with architecture summary.

### Screen 03-A · `ScreenDesignStep3Start` (데이터 구조)

DesignShell with activeStep="data-model", helperPanel={DataHelperPanel}.

- `DesignStepHeader`: "저장해야 할 정보를 정리해볼까요?", currentQ=4, totalQ=5
- `Explainer`: "데이터 구조 = 데이터 모델 (Data Model)"
- "저장할 정보 그룹 (테이블)" — **3-column entity card grid**:
  - Header: emoji icon + table name + field count badge
  - Field list: name + type mono badge + status color (필수=red, 자동=green, 선택=subtle)
  - "+ 항목 추가" dashed button per table
- "그룹 간 연결 관계" — relationship cards:
  - from → arrow SVG → to + description + cardinality badge (1:N)
- "+ 새 정보 그룹 추가" full-width dashed button
- "정합성 규칙 (자동 검증)" — check/warning items with "해결하기 →" for unresolved
- Footer: "AI 흐름으로 →"

### Screen 03→04 · `StepTransition` (데이터→AI)

Same pattern with data model summary.

### Screen 04-A · `ScreenDesignStep4Start` (AI 흐름)

DesignShell with activeStep="ai-workflow", helperPanel={AiHelperPanel}.

- `DesignStepHeader`: "AI가 무엇을 받고 무엇을 만들지 정해볼까요?", currentQ=5, totalQ=5
- `Explainer`: "AI 흐름 = AI Workflow"
- "AI의 입출력 흐름" — **5-column visual pipeline**:
  - INPUT card (accentSoft) → arrow → AI Claude card (gradient, model name + task badge) → arrow → OUTPUT card (greenSoft)
- "실패하면 어떻게 할까요? (폴백 전략)" — fallback rule cards:
  - Icon (timeout/error/cost) + condition + action + status ("정의됨" badge or "채우기 →" button)
- Footer: "다음 →"

> **Scope exclusion**: model selection TemplateCards (Sonnet/Haiku/Opus) and "예상 월 비용" cost estimation bar are deferred to V2.

### Screen 05 · `ScreenDesignComplete` (완료)

Full-page completion, centered content (maxWidth 760px).

- Emoji bob animation (🎉✨🎯🚀)
- "PHASE 2 COMPLETE" badge + "설계 단계 완료!" title
- Stats card: 100% + 4/4 steps + "설계 문서 v1.0 생성 완료" + time + item count
- 4-row summary table: step icon + name + stats + "완료" badge
- 3 export buttons: Markdown 다운로드, PDF 다운로드, 공유 링크
- Phase 3 CTA: gradient card "구현 단계로 넘어갈까요?" + "시작하기"

---

## Shared Components

### `Frame` + `TopBar`

Shared app chrome used across all pages.

- TopBar (56px): Logo + nav tabs (내 프로젝트, 템플릿, 공지사항, 가이드) + credits pill + language + user avatar
- Frame wraps TopBar + content area (flex column, full height)

### `Btn`

Shared button with 5 kinds × 3 sizes:

| Kind | Background | Text | Border |
|------|-----------|------|--------|
| primary | accent | white | accent |
| secondary | surface | text | borderStrong |
| ghost | transparent | text | transparent |
| soft | accentSoft | accent | transparent |
| danger | surface | red | borderStrong |

Sizes: sm (h30, 12.5px), md (h36, 13.5px), lg (h46, 15px)

### `AiQuestion`

AI question bubble: AiMarkD (36px) + accent-bordered card (14px radius, shadow) containing:
- "AI가 묻는 질문" mono label with accent dot
- Question text (15.5px, semibold)
- Optional hint (accentSoft box with bulb icon)

### `AiSuggestionList`

Suggestion panel: surface card with border, containing:
- "AI 추천 — 클릭으로 추가" mono header with bulb icon
- Button list: each item = dashed circle "+" + text + "추가" label

### `StepTransition`

Full-page step completion screen:
- Green gradient check icon (56px)
- "STEP {N} COMPLETE" mono label
- "{step name} 완료!" title
- Summary card with bullet points + "편집" link
- Next step preview (accentSoft card with icon + step info)
- "이전 단계 다시 보기" + "{next step} 시작하기" buttons

### Helper Panels (300px right column)

| Panel | Key Content |
|-------|------------|
| `ArchHelperPanel` | "이 단계 가이드" + ExampleBox + 용어사전 (프론트엔드/백엔드/DB/API) |
| `DataHelperPanel` | "엑셀로 비유하면?" + EXCEL 비유 diagram + 타입 설명 chips + 팁 |
| `AiHelperPanel` | 3-question numbered guide (입력/출력/폴백) + JSON 예시 ExampleBox + 비용 알림 (amber) |

---

## Implementation Details

### Backend (✅ Complete — preserved from v1)

**Files**: `backend/app/api/design.py`, `backend/skills/design-*.md`, `backend/app/schemas/design.py`

- 11 endpoints: session CRUD + 4 generate + 3 GET + 3 PUT
- 4 skill files loaded via `load_skill()` with prompt caching
- `_repair_truncated_json()` for Claude token limit truncation recovery
- `design_sessions` table (JSONB columns for requirements/architecture/data_model)
- `max_tokens=8192` for generation calls

### Frontend (Rewriting)

**Reusable from v1** (no changes needed):
- `DesignLeftRail.tsx` — 264px left rail with step cards ✅
- `DesignStepHeader.tsx` — breadcrumb + title ✅
- `Explainer.tsx` — "이게 뭐예요?" card ✅
- `ExampleBox.tsx` — green example card ✅
- `TemplateCard.tsx` — selectable template card ✅
- `DesignIcon.tsx` — 8 SVG icons ✅
- `types.ts` — step definitions + types ✅

**To modify**:
- `DesignPage.tsx` — add screen state machine (welcome → step → transition → complete), integrate Frame, add right panel slot
- `DesignStepFooter.tsx` — use Btn component, step-specific labels

**To create (new)**:
- `Frame.tsx` + `TopBar.tsx` — shared app chrome (in `components/common/`)
- `Btn.tsx` — shared button (in `components/common/`)
- `AiQuestion.tsx` — AI question bubble
- `AiSuggestionList.tsx` — clickable suggestion list
- `StepTransition.tsx` — step complete/transition screen
- `DesignWelcome.tsx` — welcome screen content
- `DesignComplete.tsx` — completion screen content
- `RequirementsStep.tsx` — **rewrite**: AiQuestion + empty state + suggestions + input
- `ArchitectureStep.tsx` — **rewrite**: TemplateCard selection + SVG diagram + explanations
- `DataModelStep.tsx` — **rewrite**: 3-col entity grid + relationships + validation
- `AiWorkflowStep.tsx` — **rewrite**: pipeline visualization + fallback strategy
- `ArchHelperPanel.tsx` — right panel for architecture
- `DataHelperPanel.tsx` — right panel for data model
- `AiHelperPanel.tsx` — right panel for AI workflow

---

## Design Decisions

| Decision | Choice | Rationale |
|---|---|---|
| Design skill ordering | Requirements → Architecture → Data Model → AI Workflow | Each builds on the previous |
| Design UI approach | 9-screen guided flow with transitions | Beginners need clear progress markers and celebration between steps |
| Screen state machine | welcome → step → transition → step → ... → complete | Reference defines 9 distinct screens, not in-place step switching |
| AI question pattern | `AiQuestion` bubble + `AiSuggestionList` | Users click to add rather than AI-generates-everything |
| Architecture visualization | Custom SVG diagram (not Mermaid) | Color-coded boxes with legends are more beginner-friendly than Mermaid text |
| Model selection | Deferred to V2 | Simplifies AI workflow step; Claude Sonnet used as default |
| Cost estimation | Deferred to V2 | Requires usage tracking infrastructure not yet built |
| Shared Frame | Wrap all pages in `Frame` + `TopBar` | Consistent navigation across the app |

---

## Completion Criteria

- [ ] `Frame` + `TopBar` renders consistently across all pages
- [ ] Welcome screen shows 4-step preview with CTA
- [ ] Requirements step: AiQuestion + AiSuggestionList + direct input functional
- [ ] Architecture step: TemplateCard selection + SVG diagram renders
- [ ] Data Model step: 3-col entity grid + relationship visualization + validation rules
- [ ] AI Workflow step: INPUT→AI→OUTPUT pipeline + fallback strategy cards
- [ ] StepTransition screens show between each step with summary
- [ ] Complete screen shows stats + summary + export buttons
- [ ] Helper panels render for Architecture, Data Model, AI Workflow steps
- [ ] All backend endpoints remain functional (no regression)
- [ ] All design outputs stored in session data for Phase 7 consumption
- [ ] All step UIs render dynamically from backend session data (no hardcoded placeholder data)

---

## Change Log

| Date | Description |
|---|---|
| 2026-05-22 | Initial creation — extracted from old Phase 5 (Design & Doc Generation) |
| 2026-05-25 | Updated: gap/checklist now mandatory, added load_skill() references (ADR-006) |
| 2026-05-25 | Phase 6 → Phase 5 renumbered |
| 2026-05-26 | v1 complete: Backend 11 endpoints + 4 skills + DB migration. Frontend 10 components (basic wizard). E2E tested |
| 2026-05-26 | v2 rewrite: Frontend rewriting to match `design-phase-flow-standalone.jsx`. 9-screen flow (welcome + 4 steps + 3 transitions + complete). Added Frame/TopBar, AiQuestion, AiSuggestionList, StepTransition, 3 helper panels, step-specific content rewrite. Backend preserved. Model selection + cost estimation deferred to V2 |
| 2026-05-26 | F17-F21 added: dynamic data binding tasks for AiSuggestionList, SVG diagram, IO pipeline, transition summaries, validation rules. Completion criteria updated to require no hardcoded placeholder data |

---
---

# Phase 5 — 설계 (How) `진행 중`

> 킥오프 후 설계 단계: 9개 화면 가이드 흐름 — 환영 → 요구사항 → 아키텍처 → 데이터 모델 → AI 워크플로우 → 완료, 각 단계 사이에 전환 화면 포함. 초보자를 위한 wizard 형태 쉘 UI.

**상태**: 진행 중 (백엔드 ✅, 프론트엔드 재작성 중)
**선행 조건**: Phase 4 완료 (킥오프 + 설계 진행 선택)
**디자인 레퍼런스**: `ui-reference/design-phase-flow-standalone.jsx` (9개 화면, 독립형)

---

## 개요

Phase 4 킥오프 완료 후 설계 진행을 선택하면 Phase 5에 진입한다. 수집된 인터뷰 인사이트를 **9개 화면 가이드 흐름**을 통해 구조화된 설계 산출물로 변환한다.

### 화면 흐름 (9개 화면)

```
00 · 환영 → 01-A · 기능 정의 → 01→02 전환
→ 02-A · 시스템 구조 → 02→03 전환
→ 03-A · 데이터 구조 → 03→04 전환
→ 04-A · AI 흐름 → 05 · 완료
```

**파이프라인 순서**: `/design-requirements` → `/design-architecture` → `/design-data-model` → `/design-ai-workflow`

각 설계 스킬은 인터뷰 인사이트 + 이전 단계 출력을 입력으로 받아 구조화된 출력을 생성한다. 파이프라인은 순차적으로 연결 — 요구사항이 아키텍처를, 아키텍처가 데이터 모델을 결정한다. 각 설계 스킬은 `harness_loader.py`의 `load_skill()`로 로드 (ADR-006).

**설계 UI**는 9개 화면 가이드형 wizard (채팅 아님)로, **"설계/아키텍처를 잘 모르는 사용자"** 를 위해 AI 질문 말풍선, 클릭형 추천 리스트, 템플릿 선택기, 시각적 파이프라인 다이어그램, 쉬운 한국어 설명으로 구성. 공유 `Frame` + `TopBar`로 일관된 앱 네비게이션 제공.

> **참고**: 설계 완료 후 Phase 6(평가 & 마무리)에서 evaluate → done → gap → checklist 실행. "설계를 나중에" 기능은 **V2**로 연기.

> **범위 제외**: AI 모델 선택 (Sonnet/Haiku/Opus 선택기) 및 비용 추정은 V2로 연기.

---

## 완료 예정 / 완료 항목

### 백엔드 (✅ 완료 — 변경 없음)

| # | 작업 | 상태 | 관련 FR |
|---|---|---|---|
| B1 | `/design-requirements` — 기능/비기능 요구사항 생성 | ✅ | FR-022 |
| B2 | `/design-architecture` — 시스템 아키텍처 설계 | ✅ | FR-023 |
| B3 | `/design-data-model` — 데이터 모델 & 스키마 설계 | ✅ | FR-024 |
| B4 | `/design-ai-workflow` — AI/ML 파이프라인 설계 | ✅ | FR-025 |
| B5 | `design_sessions` DB 테이블 + 마이그레이션 (006) | ✅ | — |
| B6 | 잘린 JSON 자동 복구 (`_repair_truncated_json`) | ✅ | — |
| B7 | 프로젝트 상태 라우팅 (`designing` 상태 지원) | ✅ | — |

### 프론트엔드 (재작성 중 — `design-phase-flow-standalone.jsx` 기준)

| # | 작업 | 상태 |
|---|---|---|
| F1 | 공유 `Frame` + `TopBar` 컴포넌트 (56px 네비, 탭, 유저 아바타, 크레딧) | |
| F2 | 공유 `Btn` 컴포넌트 (primary/secondary/ghost/soft/danger × sm/md/lg) | |
| F3 | `AiQuestion` 컴포넌트 — AI 질문 말풍선 (AiMarkD + accent 테두리 + 힌트) | |
| F4 | `AiSuggestionList` 컴포넌트 — 클릭형 추천 카드 (+ 버튼으로 개별 추가) | |
| F5 | `StepTransition` 컴포넌트 — 스텝 완료/요약/다음 미리보기 전체 화면 | |
| F6 | `ScreenDesignWelcome` — 환영 페이지 (4단계 미리보기 카드, CTA) | |
| F7 | `ScreenDesignStep1Start` — 기능 정의 (AiQuestion + 빈 상태 + 추천 + 직접 입력) | |
| F8 | `ScreenDesignStep2Start` — 시스템 구조 (TemplateCard 선택 + SVG 다이어그램 + 부품 설명) | |
| F9 | `ScreenDesignStep3Start` — 데이터 구조 (3컬럼 엔티티 그리드 + 관계 카드 + 정합성 규칙) | |
| F10 | `ScreenDesignStep4Start` — AI 흐름 (INPUT→AI→OUTPUT 파이프라인 + 폴백 전략) | |
| F11 | `ScreenDesignComplete` — 완료 페이지 (통계 + 요약 + 내보내기 + Phase 3 CTA) | |
| F12 | `ArchHelperPanel` — 우측 300px 패널 (가이드 + 용어사전) | |
| F13 | `DataHelperPanel` — 우측 300px 패널 (엑셀 비유 + 타입 설명) | |
| F14 | `AiHelperPanel` — 우측 300px 패널 (3가지 질문 가이드 + 폴백 팁) | |
| F15 | `DesignStepFooter` 업데이트 — 스텝별 primary 라벨 ("시스템 구조로 →" 등) | |
| F16 | `DesignShell` 업데이트 — Frame 래퍼 통합 + 우측 헬퍼 패널 슬롯 | |
| F17 | `AiSuggestionList` 동적 데이터 바인딩 — 인터뷰 컨텍스트 기반 백엔드 추천 API 연결 | |
| F18 | `ArchitectureStep` SVG 동적 생성 — `session.architecture.components[]` 기반 다이어그램 렌더링 | |
| F19 | `AiWorkflowStep` IO 파이프라인 동적 렌더 — `session.ai_workflow` 파싱하여 INPUT/OUTPUT 리스트 생성 | |
| F20 | `StepTransition` 요약 동적 생성 — 각 단계 세션 데이터에서 실제 요약 추출 | |
| F21 | `DataModelStep` 정합성 규칙 동적 생성 — `session.data_model` 분석 기반 검증 규칙 도출 | |

---

## 9개 화면 상세 명세

### 화면 00 · `ScreenDesignWelcome` (진입)

전체 화면 환영, 중앙 정렬 콘텐츠 (maxWidth 760px).

- "PHASE 2 of 3 · 시작" 알약 배지
- 제목: "이제 **설계 단계**를 시작할게요"
- 부제: "네 가지 질문에 답하시면 됩니다"
- 2×2 그리드: 4단계 미리보기 카드 (아이콘 40px + 스텝 번호 + 이름 + 질문 + ~5분)
- "완료하면 얻는 것" 초록 info 박스 (체크 아이콘 + 설명)
- 메인 CTA: "네, 설계를 시작할게요" (accent + 그림자)
- 고스트 CTA: "나중에 결정할게요"

### 화면 01-A · `ScreenDesignStep1Start` (기능 정의)

DesignShell, activeStep="requirements", 헬퍼 패널 없음.

- `DesignStepHeader`: "이 도구가 할 수 있는 일을 정의해볼까요?", currentQ=1, totalQ=5
- `AiQuestion`: "사용자가 이 도구를 사용하면서 **꼭 할 수 있어야 하는 일**이 무엇인가요?" + 힌트
- 빈 상태 카드: "아직 추가된 기능이 없어요" (features 아이콘 + 점선 테두리)
- `AiSuggestionList`: AI 생성 추천 항목 (클릭형 + 버튼으로 개별 추가)
- 직접 입력 영역: 텍스트 입력 + "Enter로 추가" 힌트 + "+ 추가" Btn
- 푸터: "다음 질문 →"

### 화면 01→02 · `StepTransition` (기능→시스템)

전체 화면 전환 (maxWidth 680px, 중앙 정렬).

- 초록 그라데이션 체크 아이콘 (56px) + "STEP 01 COMPLETE"
- "기능 정의 완료!" 제목
- 요약 카드: bullet list + "편집" 링크
- 다음 미리보기: accentSoft 카드 + "다음 · STEP 02" + "시스템 구조" + 미리보기 텍스트
- 버튼: "이전 단계 다시 보기" (secondary) + "시스템 구조 시작하기" (primary)

### 화면 02-A · `ScreenDesignStep2Start` (시스템 구조)

DesignShell, activeStep="architecture", helperPanel={ArchHelperPanel}.

- `DesignStepHeader`: "이 도구의 부품들을 골라볼까요?", currentQ=3, totalQ=5
- `Explainer`: "시스템 구조 = 아키텍처 (Architecture)"
- "추천 조합 골라보기" — 3컬럼 `TemplateCard` 그리드 (간단/확장/실시간)
- "선택한 조합 미리보기" — **커스텀 SVG 아키텍처 다이어그램** (색상 코딩 박스 + 화살표)
  - 파란(accentSoft)=사용자 화면, 초록(greenSoft)=저장소, 노란(amberSoft)=AI
  - 하단 색상 범례
- "각 부품을 왜 골랐나요?" — 컴포넌트 설명 카드 (이모지 + 이름 + 이유 + "자동 선택됨" 배지)
- 푸터: "데이터 구조로 →"

### 화면 02→03 · `StepTransition` (시스템→데이터)

01→02와 동일 패턴, 아키텍처 요약 포함.

### 화면 03-A · `ScreenDesignStep3Start` (데이터 구조)

DesignShell, activeStep="data-model", helperPanel={DataHelperPanel}.

- `DesignStepHeader`: "저장해야 할 정보를 정리해볼까요?", currentQ=4, totalQ=5
- `Explainer`: "데이터 구조 = 데이터 모델 (Data Model)"
- "저장할 정보 그룹 (테이블)" — **3컬럼 엔티티 카드 그리드**:
  - 헤더: 이모지 아이콘 + 테이블명 + 필드 수 배지
  - 필드 리스트: 이름 + 타입 mono 배지 + 상태 색상 (필수=red, 자동=green, 선택=subtle)
  - "+ 항목 추가" dashed 버튼 (테이블별)
- "그룹 간 연결 관계" — 관계 카드:
  - from → 화살표 SVG → to + 설명 + 카디널리티 배지 (1:N)
- "+ 새 정보 그룹 추가" 전체 너비 dashed 버튼
- "정합성 규칙 (자동 검증)" — 체크/경고 항목 + "해결하기 →"
- 푸터: "AI 흐름으로 →"

### 화면 03→04 · `StepTransition` (데이터→AI)

동일 패턴, 데이터 모델 요약 포함.

### 화면 04-A · `ScreenDesignStep4Start` (AI 흐름)

DesignShell, activeStep="ai-workflow", helperPanel={AiHelperPanel}.

- `DesignStepHeader`: "AI가 무엇을 받고 무엇을 만들지 정해볼까요?", currentQ=5, totalQ=5
- `Explainer`: "AI 흐름 = AI Workflow"
- "AI의 입출력 흐름" — **5컬럼 시각적 파이프라인**:
  - INPUT 카드 (accentSoft) → 화살표 → AI Claude 카드 (그라데이션, 모델명+태스크 배지) → 화살표 → OUTPUT 카드 (greenSoft)
- "실패하면 어떻게 할까요? (폴백 전략)" — 폴백 룰 카드:
  - 아이콘 (타임아웃/에러/비용) + 조건 + 대응 + 상태 ("정의됨" 배지 또는 "채우기 →" 버튼)
- 푸터: "다음 →"

> **범위 제외**: 모델 선택 TemplateCard (Sonnet/Haiku/Opus) 및 "예상 월 비용" 바는 V2로 연기.

### 화면 05 · `ScreenDesignComplete` (완료)

전체 화면 완료, 중앙 정렬 콘텐츠 (maxWidth 760px).

- 이모지 bob 애니메이션 (🎉✨🎯🚀)
- "PHASE 2 COMPLETE" 배지 + "설계 단계 완료!" 제목
- 통계 카드: 100% + 4/4 단계 + "설계 문서 v1.0 생성 완료" + 소요시간 + 항목 수
- 4행 요약 테이블: 스텝 아이콘 + 이름 + stats + "완료" 배지
- 3개 내보내기 버튼: Markdown 다운로드, PDF 다운로드, 공유 링크
- Phase 3 CTA: 그라데이션 카드 "구현 단계로 넘어갈까요?" + "시작하기"

---

## 공유 컴포넌트

### `Frame` + `TopBar`

모든 페이지에서 사용하는 공유 앱 크롬.

- TopBar (56px): 로고 + 네비 탭 (내 프로젝트, 템플릿, 공지사항, 가이드) + 크레딧 알약 + 언어 + 유저 아바타
- Frame은 TopBar + 콘텐츠 영역을 감싸는 래퍼 (flex column, 전체 높이)

### `Btn`

5가지 종류 × 3가지 크기의 공유 버튼:

| 종류 | 배경 | 텍스트 | 테두리 |
|------|------|-------|--------|
| primary | accent | 흰색 | accent |
| secondary | surface | text | borderStrong |
| ghost | 투명 | text | 투명 |
| soft | accentSoft | accent | 투명 |
| danger | surface | red | borderStrong |

크기: sm (h30, 12.5px), md (h36, 13.5px), lg (h46, 15px)

### `AiQuestion`

AI 질문 말풍선: AiMarkD (36px) + accent 테두리 카드 (14px radius, 그림자):
- "AI가 묻는 질문" mono 라벨 + accent 점
- 질문 텍스트 (15.5px, semibold)
- 선택적 힌트 (accentSoft 박스 + bulb 아이콘)

### `AiSuggestionList`

추천 패널: surface 카드 + 테두리:
- "AI 추천 — 클릭으로 추가" mono 헤더 + bulb 아이콘
- 버튼 리스트: 항목별 = dashed "+" 원 + 텍스트 + "추가" 라벨

### `StepTransition`

전체 화면 스텝 완료 전환:
- 초록 그라데이션 체크 아이콘 (56px)
- "STEP {N} COMPLETE" mono 라벨
- "{스텝명} 완료!" 제목
- 요약 카드 (bullet list + "편집" 링크)
- 다음 스텝 미리보기 (accentSoft 카드 + 아이콘 + 스텝 정보)
- "이전 단계 다시 보기" + "{다음 스텝} 시작하기" 버튼

### 헬퍼 패널 (300px 우측 컬럼)

| 패널 | 주요 내용 |
|------|---------|
| `ArchHelperPanel` | "이 단계 가이드" + ExampleBox + 용어사전 (프론트엔드/백엔드/DB/API) |
| `DataHelperPanel` | "엑셀로 비유하면?" + EXCEL 비유 다이어그램 + 타입 설명 칩 + 팁 |
| `AiHelperPanel` | 3가지 질문 번호 가이드 (입력/출력/폴백) + JSON 예시 ExampleBox + 비용 알림 (amber) |

---

## 구현 상세

### 백엔드 (✅ 완료 — v1에서 유지)

**파일**: `backend/app/api/design.py`, `backend/skills/design-*.md`, `backend/app/schemas/design.py`

- 11개 엔드포인트: 세션 CRUD + 생성 4개 + 조회 3개 + 수정 3개
- 4개 스킬 파일: `load_skill()`로 로드, Prompt Caching 적용
- `_repair_truncated_json()`: Claude 토큰 한도 잘림 자동 복구
- `design_sessions` 테이블 (requirements/architecture/data_model JSONB 컬럼)
- 생성 호출 시 `max_tokens=8192`

### 프론트엔드 (재작성 중)

**v1에서 재사용 (변경 없음)**:
- `DesignLeftRail.tsx` — 264px 왼쪽 레일 + 스텝 카드 ✅
- `DesignStepHeader.tsx` — 빵부스러기 + 제목 ✅
- `Explainer.tsx` — "이게 뭐예요?" 카드 ✅
- `ExampleBox.tsx` — 초록 예시 카드 ✅
- `TemplateCard.tsx` — 선택 가능 템플릿 카드 ✅
- `DesignIcon.tsx` — 8개 SVG 아이콘 ✅
- `types.ts` — 스텝 정의 + 타입 ✅

**수정 필요**:
- `DesignPage.tsx` — 화면 상태 머신 추가 (welcome → step → transition → complete), Frame 통합, 우측 패널 슬롯
- `DesignStepFooter.tsx` — Btn 컴포넌트 사용, 스텝별 라벨

**신규 생성**:
- `Frame.tsx` + `TopBar.tsx` — 공유 앱 크롬 (`components/common/`)
- `Btn.tsx` — 공유 버튼 (`components/common/`)
- `AiQuestion.tsx` — AI 질문 말풍선
- `AiSuggestionList.tsx` — 클릭형 추천 리스트
- `StepTransition.tsx` — 스텝 완료/전환 화면
- `DesignWelcome.tsx` — 환영 화면 콘텐츠
- `DesignComplete.tsx` — 완료 화면 콘텐츠
- `RequirementsStep.tsx` — **재작성**: AiQuestion + 빈 상태 + 추천 + 입력
- `ArchitectureStep.tsx` — **재작성**: TemplateCard 선택 + SVG 다이어그램 + 설명
- `DataModelStep.tsx` — **재작성**: 3컬럼 엔티티 그리드 + 관계 + 검증
- `AiWorkflowStep.tsx` — **재작성**: 파이프라인 시각화 + 폴백 전략
- `ArchHelperPanel.tsx` — 아키텍처 우측 패널
- `DataHelperPanel.tsx` — 데이터 모델 우측 패널
- `AiHelperPanel.tsx` — AI 워크플로우 우측 패널

---

## 설계 결정 사항

| 결정 | 선택 | 근거 |
|------|------|------|
| 설계 스킬 순서 | 요구사항 → 아키텍처 → 데이터 모델 → AI 워크플로우 | 각 단계가 이전을 기반으로 구축 |
| 설계 UI 방식 | 9개 화면 가이드 흐름 + 전환 화면 | 초보자에게 명확한 진행 표시와 단계 완료 축하가 필요 |
| 화면 상태 머신 | welcome → step → transition → step → ... → complete | 레퍼런스가 9개 별개 화면 정의, in-place 스위칭 아님 |
| AI 질문 패턴 | `AiQuestion` 말풍선 + `AiSuggestionList` | 전체 일괄 생성이 아닌 클릭으로 개별 추가 |
| 아키텍처 시각화 | 커스텀 SVG 다이어그램 (Mermaid 아님) | 색상 코딩 박스 + 범례가 초보자에게 더 친화적 |
| 모델 선택 | V2로 연기 | AI 워크플로우 단계 단순화; Claude Sonnet을 기본값으로 사용 |
| 비용 추정 | V2로 연기 | 아직 구축되지 않은 사용량 추적 인프라 필요 |
| 공유 Frame | 모든 페이지를 `Frame` + `TopBar`로 래핑 | 앱 전체의 일관된 네비게이션 |

---

## 완료 기준

- [ ] `Frame` + `TopBar`가 모든 페이지에서 일관되게 렌더링
- [ ] 환영 화면에 4단계 미리보기 + CTA 표시
- [ ] 기능 정의 스텝: AiQuestion + AiSuggestionList + 직접 입력 동작
- [ ] 시스템 구조 스텝: TemplateCard 선택 + SVG 다이어그램 렌더링
- [ ] 데이터 구조 스텝: 3컬럼 엔티티 그리드 + 관계 시각화 + 정합성 규칙
- [ ] AI 흐름 스텝: INPUT→AI→OUTPUT 파이프라인 + 폴백 전략 카드
- [ ] StepTransition 화면이 각 단계 사이에 요약과 함께 표시
- [ ] 완료 화면에 통계 + 요약 + 내보내기 버튼 표시
- [ ] 아키텍처, 데이터 모델, AI 워크플로우 스텝에 헬퍼 패널 렌더링
- [ ] 모든 백엔드 엔드포인트 정상 동작 유지 (회귀 없음)
- [ ] 모든 설계 출력이 Phase 7 소비를 위해 세션 데이터에 저장
- [ ] 모든 스텝 UI가 백엔드 세션 데이터 기반으로 동적 렌더링 (하드코딩된 플레이스홀더 데이터 없음)

---

## 변경 이력

| 날짜 | 내용 |
|------|------|
| 2026-05-22 | 최초 작성 — 구 Phase 5 (설계 & 문서 생성)에서 분리 |
| 2026-05-25 | 업데이트: gap/checklist 필수화, load_skill() 참조 추가 (ADR-006) |
| 2026-05-25 | Phase 6 → Phase 5 번호 변경 |
| 2026-05-26 | v1 완료: 백엔드 11개 엔드포인트 + 스킬 4개 + DB 마이그레이션. 프론트엔드 10개 컴포넌트 (기본 wizard). E2E 테스트 완료 |
| 2026-05-26 | v2 재작성: `design-phase-flow-standalone.jsx` 기준 프론트엔드 재작성. 9개 화면 흐름 (환영 + 스텝 4개 + 전환 3개 + 완료). Frame/TopBar, AiQuestion, AiSuggestionList, StepTransition, 헬퍼 패널 3개, 스텝별 콘텐츠 재작성 추가. 백엔드 유지. 모델 선택 + 비용 추정 V2로 연기 |
| 2026-05-26 | F17-F21 추가: AiSuggestionList, SVG 다이어그램, IO 파이프라인, 전환 요약, 정합성 규칙의 동적 데이터 바인딩 작업. 완료 기준에 하드코딩 플레이스홀더 데이터 없음 조건 추가 |
