# Phase 6 — Design (How) `🔲 Not Started`

> Post-interview design phase: requirements → architecture → data model → AI workflow, using a wizard-style shell UI designed for beginners.

**Status**: 🔲 Not Started
**Prerequisites**: Phase 5 completion (Phase transition & validation flow)

---

## Overview

After Phase 5 completes (evaluation + completion criteria + phase transition modal), the user chooses to enter the Design phase. Phase 6 transforms collected interview insights into structured design artifacts through 4 sequential design steps.

**Pipeline order**: `/design-requirements` → `/design-architecture` → `/design-data-model` → `/design-ai-workflow`

Each design skill takes interview insights + accepted suggestions as input and produces structured output. The pipeline feeds forward — requirements inform architecture, architecture informs data model.

**Design UI** is a dedicated wizard-style shell (not chat-based), designed for **"people who don't know much about design/architecture"** — leaning on examples, visual choices, and plain Korean explanations. Reference: `ui-reference/screen-design-shell.jsx`

> **Note**: Gap analysis (`/kickoff-gap`) and dev checklist (`/kickoff-checklist`) are handled in Phase 5's V4 flow when the user declines Design. "Design later" feature (return to Design after skipping) is deferred to **V2**.

---

## Deliverables

| # | Task | Area | Status | Related FR |
|---|---|---|---|---|
| 1 | `/design-requirements` — functional/non-functional requirements generation | Backend | 🔲 | FR-022 |
| 2 | Requirements review UI (priority matrix, accept/edit) | Frontend | 🔲 | FR-022 |
| 3 | `/design-architecture` — system architecture design | Backend | 🔲 | FR-023 |
| 4 | Architecture review UI (component diagram, tech stack) | Frontend | 🔲 | FR-023 |
| 5 | `/design-data-model` — data model & schema design | Backend | 🔲 | FR-024 |
| 6 | Data model review UI (ERD, field descriptions) | Frontend | 🔲 | FR-024 |
| 7 | `/design-ai-workflow` — AI/ML pipeline design (AI-only, no user interaction) | Backend | 🔲 | FR-025 |
| 8 | Design Shell UI — 3-column wizard layout with beginner-friendly primitives | Frontend | 🔲 | — |

---

## Implementation Details

### Design Skills

#### `/design-requirements`

**Files**: `backend/app/api/design.py`, `backend/skills/design-requirements.md`

- Takes interview insights + accepted suggestions as input
- Calls Claude API to generate functional and non-functional requirements
- Outputs structured requirements with priority (Must/Should/Could), category, and acceptance criteria
- User reviews requirements in a priority matrix UI: accept, edit priority, or add custom requirements

**Endpoints**:
- `POST /api/design/requirements/generate` — generate requirements from session data
- `GET /api/design/requirements/{session_id}` — retrieve requirements
- `PUT /api/design/requirements/{req_id}` — update requirement (priority, text, status)

#### `/design-architecture`

**Files**: `backend/app/api/design.py`, `backend/skills/design-architecture.md`

- Takes requirements + interview context as input
- Generates system architecture: component breakdown, technology recommendations, integration points
- Produces Mermaid component diagram code
- User reviews architecture in visual UI: approve components, adjust tech stack choices

**Endpoints**:
- `POST /api/design/architecture/generate` — generate architecture from requirements
- `GET /api/design/architecture/{session_id}` — retrieve architecture design
- `PUT /api/design/architecture/{session_id}` — update architecture decisions

#### `/design-data-model`

**Files**: `backend/app/api/design.py`, `backend/skills/design-data-model.md`

- Takes requirements + architecture as input
- Generates data model: entities, relationships, field definitions, indexes
- Produces Mermaid ERD code
- User reviews in ERD UI: validate entities, adjust field types, add constraints

**Endpoints**:
- `POST /api/design/data-model/generate` — generate data model
- `GET /api/design/data-model/{session_id}` — retrieve data model
- `PUT /api/design/data-model/{session_id}` — update data model

#### `/design-ai-workflow` (AI-only)

**Files**: `backend/app/api/design.py`, `backend/skills/design-ai-workflow.md`

- Runs automatically without user interaction
- Takes all prior design outputs (requirements, architecture, data model) as input
- Generates AI/ML workflow design: model selection, training pipeline, inference flow, evaluation metrics
- Stored as part of session data; included in final document generation (Phase 7)
- Only applicable when project type involves AI/ML; skipped otherwise

**Endpoint**:
- `POST /api/design/ai-workflow/generate` — auto-generate AI workflow (no review UI)

### Design Shell UI

**Design reference**: `ui-reference/screen-design-shell.jsx`

The Design UI is a dedicated wizard-style shell, separate from the interview chat UI. It is designed for **"people who don't know much about design/architecture"** — leaning on examples, visual choices, and plain Korean.

**Layout** (3-column):
- **Left rail** (264px): Phase navigator — "설계 단계" header, project meta, phase progress (Phase 2 of 3), 4 design step cards (기능 정의 / 시스템 구조 / 데이터 구조 / AI 흐름) with icons and done/active/pending states, help link
- **Main content** (flex): Step header (step number, name, title, subtitle, question progress) → step-specific content → footer (← 이전 / 건너뛰기 / 다음 단계)
- **Right helper panel** (300px, optional): Contextual help content per step

**Beginner-friendly primitives**:
- `Explainer` — "이게 뭐예요?" card with plain Korean explanation, technical term badge, and example
- `TemplateCard` — visual template chooser (pick from presets, selectable with check mark)
- `ExampleBox` — shows what a "good answer" looks like (green-tinted card)

**Design steps**:
| # | ID | Title | Subtitle |
|---|---|---|---|
| 01 | requirements | 기능 정의 | 무엇을 만들지 |
| 02 | architecture | 시스템 구조 | 어떻게 연결할지 |
| 03 | data-model | 데이터 구조 | 무엇을 저장할지 |
| 04 | ai-workflow | AI 흐름 | AI를 어떻게 쓸지 |

**Components** (from `screen-design-shell.jsx`):
- `DesignShell` — 3-column layout shell (left rail + main + optional right helper)
- `DesignStepHeader` — step header with number, name, title, subtitle, question progress
- `DesignStepFooter` — footer with ← 이전 / 건너뛰기 / 다음 단계 buttons + auto-save indicator
- `DesignIcon` — step-specific icons (features, arch, data, ai, help, bulb, eye, check)
- `AiMarkD` — Design phase variant of AI mark badge

**Navigation**: Back/Next buttons in footer, auto-save indicator, skip option. Each step has its own content area within the main column.

---

## Design Decisions

| Decision | Choice | Rationale |
|---|---|---|
| Design skill ordering | Requirements → Architecture → Data Model → AI Workflow | Each builds on the previous; requirements inform architecture, architecture informs data model |
| Design UI approach | Wizard-style shell (not chat-based) | Designed for beginners — visual choices, templates, plain Korean explanations |
| AI Workflow automation | No user review UI | AI/ML pipeline design is technical and benefits from uninterrupted AI reasoning |
| Skill files | Copy from `AI-Project-Kickoff-Harness/.claude/skills/` | Existing skill definitions reused, added as dynamic steps |

---

## Completion Criteria

- [ ] Requirements generated and user-reviewed after interview completion
- [ ] Architecture design generated from requirements
- [ ] Data model generated from architecture
- [ ] AI workflow auto-generated (when applicable)
- [ ] Design Shell UI renders with 3-column wizard layout
- [ ] Beginner-friendly primitives (Explainer, TemplateCard, ExampleBox) functional
- [ ] Step navigation (back/next/skip) works correctly
- [ ] All design outputs stored in session data for Phase 7 consumption

---

## Change Log

| Date | Description |
|---|---|
| 2026-05-22 | Initial creation — extracted from Phase 5 (Design & Doc Generation) |

---
---

# Phase 6 — 설계 (How) `🔲 미시작`

> 인터뷰 후 설계 단계: 요구사항 → 아키텍처 → 데이터 모델 → AI 워크플로우, 초보자를 위한 wizard 형태 쉘 UI.

**상태**: 🔲 미시작
**선행 조건**: Phase 5 완료 (Phase 전환 & 검증 플로우)

---

## 개요

Phase 5 완료 (평가 + 완료 조건 + Phase 전환 모달) 후, 설계 단계 진행을 선택하면 Phase 6에 진입한다. 수집된 인터뷰 인사이트를 4단계 순차 설계를 통해 구조화된 설계 산출물로 변환한다.

**파이프라인 순서**: `/design-requirements` → `/design-architecture` → `/design-data-model` → `/design-ai-workflow`

각 설계 스킬은 인터뷰 인사이트 + 수락된 제안을 입력으로 받아 구조화된 출력을 생성한다. 파이프라인은 순차적으로 연결 — 요구사항이 아키텍처를, 아키텍처가 데이터 모델을 결정한다.

**설계 UI**는 인터뷰 채팅 UI와 별도의 wizard 형태 전용 쉘이다. **"설계/아키텍처를 잘 모르는 사용자"** 를 위해 예시, 시각적 선택지, 쉬운 한국어 설명으로 구성. 레퍼런스: `ui-reference/screen-design-shell.jsx`

> **참고**: 갭 분석 (`/kickoff-gap`)과 개발 체크리스트 (`/kickoff-checklist`)는 Phase 5의 V4 플로우에서 처리 (설계를 거부할 경우). "설계를 나중에 하고 싶을 때" 기능은 **V2**로 연기.

---

## 완료 예정 / 완료 항목

| # | 작업 | 영역 | 상태 | 관련 FR |
|---|---|---|---|---|
| 1 | `/design-requirements` — 기능/비기능 요구사항 생성 | Backend | 🔲 | FR-022 |
| 2 | 요구사항 검토 UI (우선순위 매트릭스, 수락/수정) | Frontend | 🔲 | FR-022 |
| 3 | `/design-architecture` — 시스템 아키텍처 설계 | Backend | 🔲 | FR-023 |
| 4 | 아키텍처 검토 UI (컴포넌트 다이어그램, 기술 스택) | Frontend | 🔲 | FR-023 |
| 5 | `/design-data-model` — 데이터 모델 & 스키마 설계 | Backend | 🔲 | FR-024 |
| 6 | 데이터 모델 검토 UI (ERD, 필드 설명) | Frontend | 🔲 | FR-024 |
| 7 | `/design-ai-workflow` — AI/ML 파이프라인 설계 (AI 전용, 사용자 상호작용 없음) | Backend | 🔲 | FR-025 |
| 8 | 설계 쉘 UI — 3컬럼 wizard 레이아웃 + 초보자 친화 프리미티브 | Frontend | 🔲 | — |

---

## 구현 상세

### 설계 스킬

#### `/design-requirements`

**파일**: `backend/app/api/design.py`, `backend/skills/design-requirements.md`

- 인터뷰 인사이트 + 수락된 제안을 입력으로 사용
- Claude API를 호출하여 기능 및 비기능 요구사항 생성
- 우선순위 (Must/Should/Could), 카테고리, 인수 기준이 포함된 구조화 요구사항 출력
- 우선순위 매트릭스 UI에서 사용자가 검토: 수락, 우선순위 수정, 커스텀 요구사항 추가

**엔드포인트**:
- `POST /api/design/requirements/generate` — 세션 데이터에서 요구사항 생성
- `GET /api/design/requirements/{session_id}` — 요구사항 조회
- `PUT /api/design/requirements/{req_id}` — 요구사항 업데이트 (우선순위, 텍스트, 상태)

#### `/design-architecture`

**파일**: `backend/app/api/design.py`, `backend/skills/design-architecture.md`

- 요구사항 + 인터뷰 컨텍스트를 입력으로 사용
- 시스템 아키텍처 생성: 컴포넌트 분해, 기술 추천, 통합 포인트
- Mermaid 컴포넌트 다이어그램 코드 생성
- 비주얼 UI에서 사용자 검토: 컴포넌트 승인, 기술 스택 조정

**엔드포인트**:
- `POST /api/design/architecture/generate` — 요구사항에서 아키텍처 생성
- `GET /api/design/architecture/{session_id}` — 아키텍처 설계 조회
- `PUT /api/design/architecture/{session_id}` — 아키텍처 결정 업데이트

#### `/design-data-model`

**파일**: `backend/app/api/design.py`, `backend/skills/design-data-model.md`

- 요구사항 + 아키텍처를 입력으로 사용
- 데이터 모델 생성: 엔티티, 관계, 필드 정의, 인덱스
- Mermaid ERD 코드 생성
- ERD UI에서 사용자 검토: 엔티티 확인, 필드 타입 조정, 제약조건 추가

**엔드포인트**:
- `POST /api/design/data-model/generate` — 데이터 모델 생성
- `GET /api/design/data-model/{session_id}` — 데이터 모델 조회
- `PUT /api/design/data-model/{session_id}` — 데이터 모델 업데이트

#### `/design-ai-workflow` (AI 전용)

**파일**: `backend/app/api/design.py`, `backend/skills/design-ai-workflow.md`

- 사용자 상호작용 없이 자동 실행
- 이전 설계 출력 전체 (요구사항, 아키텍처, 데이터 모델)를 입력으로 사용
- AI/ML 워크플로우 설계 생성: 모델 선정, 학습 파이프라인, 추론 흐름, 평가 지표
- 세션 데이터로 저장; Phase 7 최종 문서 생성에 포함
- 프로젝트 유형이 AI/ML 관련일 때만 적용; 아닌 경우 건너뜀

**엔드포인트**:
- `POST /api/design/ai-workflow/generate` — AI 워크플로우 자동 생성 (검토 UI 없음)

### 설계 쉘 UI

**디자인 레퍼런스**: `ui-reference/screen-design-shell.jsx`

설계 UI는 인터뷰 채팅 UI와 별도의 wizard 형태 전용 쉘이다. **"설계/아키텍처를 잘 모르는 사용자"** 를 위해 예시, 시각적 선택지, 쉬운 한국어로 구성.

**레이아웃** (3컬럼):
- **왼쪽 레일** (264px): Phase 네비게이터 — "설계 단계" 헤더, 프로젝트 메타, Phase 진행률 (Phase 2 of 3), 설계 4단계 카드 (기능 정의 / 시스템 구조 / 데이터 구조 / AI 흐름) + 아이콘 + done/active/pending 상태, 도움말 링크
- **메인 콘텐츠** (flex): 스텝 헤더 (스텝 번호, 이름, 제목, 부제, 질문 진행률) → 스텝별 콘텐츠 → 푸터 (← 이전 / 건너뛰기 / 다음 단계)
- **오른쪽 도우미 패널** (300px, 선택): 스텝별 맥락 도움말

**초보자 친화 프리미티브**:
- `Explainer` — "이게 뭐예요?" 카드 (쉬운 한국어 설명, 기술 용어 배지, 예시)
- `TemplateCard` — 시각적 템플릿 선택기 (프리셋에서 선택, 체크 표시)
- `ExampleBox` — "좋은 예시" 카드 (초록 톤)

**설계 단계**:
| # | ID | 제목 | 부제 |
|---|---|---|---|
| 01 | requirements | 기능 정의 | 무엇을 만들지 |
| 02 | architecture | 시스템 구조 | 어떻게 연결할지 |
| 03 | data-model | 데이터 구조 | 무엇을 저장할지 |
| 04 | ai-workflow | AI 흐름 | AI를 어떻게 쓸지 |

**컴포넌트** (`screen-design-shell.jsx` 기반):
- `DesignShell` — 3컬럼 레이아웃 쉘 (왼쪽 레일 + 메인 + 선택적 오른쪽 도우미)
- `DesignStepHeader` — 스텝 헤더 (번호, 이름, 제목, 부제, 질문 진행률)
- `DesignStepFooter` — 푸터 (← 이전 / 건너뛰기 / 다음 단계 버튼 + 자동 저장 표시)
- `DesignIcon` — 스텝별 아이콘 (features, arch, data, ai, help, bulb, eye, check)
- `AiMarkD` — 설계 Phase 전용 AI 마크 배지

**네비게이션**: 푸터에 이전/다음 버튼, 자동 저장 표시, 건너뛰기 옵션. 각 단계는 메인 영역에 자체 콘텐츠 보유.

---

## 설계 결정 사항

| 결정 | 선택 | 근거 |
|---|---|---|
| 설계 스킬 순서 | 요구사항 → 아키텍처 → 데이터 모델 → AI 워크플로우 | 각 단계가 이전 단계를 기반으로 구축; 요구사항이 아키텍처를, 아키텍처가 데이터 모델을 결정 |
| 설계 UI 방식 | Wizard 형태 전용 쉘 (채팅 아님) | 초보자 대상 — 시각적 선택지, 템플릿, 쉬운 한국어 설명 |
| AI 워크플로우 자동화 | 사용자 검토 UI 없음 | AI/ML 파이프라인 설계는 기술적이며 연속적인 AI 추론이 유리 |
| 스킬 파일 | `AI-Project-Kickoff-Harness/.claude/skills/`에서 복사 | 기존 스킬 정의를 재활용, 동적 스텝으로 추가 |

---

## 완료 기준

- [ ] 인터뷰 완료 후 요구사항 생성 및 사용자 검토 완료
- [ ] 요구사항에서 아키텍처 설계 생성
- [ ] 아키텍처에서 데이터 모델 생성
- [ ] AI 워크플로우 자동 생성 (해당 시)
- [ ] 설계 쉘 UI가 3컬럼 wizard 레이아웃으로 렌더링
- [ ] 초보자 친화 프리미티브 (Explainer, TemplateCard, ExampleBox) 동작
- [ ] 스텝 네비게이션 (이전/다음/건너뛰기) 정상 동작
- [ ] 모든 설계 출력이 Phase 7 소비를 위해 세션 데이터에 저장

---

## 변경 이력

| 날짜 | 내용 |
|---|---|
| 2026-05-22 | 최초 작성 — Phase 5 (설계 & 문서 생성)에서 분리 |
