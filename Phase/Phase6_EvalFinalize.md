# Phase 6 — Evaluation & Finalization `🔲 Not Started`

> Post-design (or post-kickoff) quality assurance: honest evaluation → completion criteria → gap analysis → dev checklist → document generation.

**Status**: 🔲 Not Started
**Prerequisites**: Phase 5 (Design) completion, or Phase 4 (Kickoff) with design skipped

---

## Overview

After the design phase (Phase 5) completes — or directly after Phase 4 kickoff if design was skipped — Phase 6 runs 4 mandatory quality steps in sequence. These evaluate the project, define completion criteria, find gaps, and create a dev readiness checklist. All 4 steps are mandatory — they are quality assurance, not conditional branches.

**Design reference**: `ui-reference/screen-interview-v4.jsx`

**User flow** (runtime execution order):
```
Phase 5(설계) 완료 또는 Phase 4에서 설계 건너뛰기
  → STEP 1: /kickoff-evaluate (정직한 평가)
  → STEP 2: /kickoff-done (완료 조건 정의)
  → STEP 3: /kickoff-gap (누락/모순 점검)
  → STEP 4: /kickoff-checklist (개발 착수 체크리스트)
  → Phase 7 (문서 생성 → 결과 뷰어 → 다운로드)
```

**Skill integration**: Each step uses `load_skill()` from `harness_loader.py` (ADR-006). `prompt_manager.py` applies token optimizations (STEP splitting, CLI removal, conversation compression, Prompt Caching).

> **Note**: "나중에 결정" (save and return to Design later) is deferred to **V2**.

---

## Deliverables

| # | Task | Area | Status | Related FR |
|---|---|---|---|---|
| **Skill Files** | | | | |
| 1 | Copy skill files from harness to `backend/skills/`: `kickoff-evaluate.md`, `kickoff-done.md`, `kickoff-gap.md`, `kickoff-checklist.md` | Backend | 🔲 | FR-020 |
| 2 | Copy reference files from harness to `backend/references/`: `evaluation-criteria.md`, `done-criteria-templates.md`, `gap-rules.md` | Backend | 🔲 | FR-020 |
| **Backend** | | | | |
| 3 | Step management — FINALIZE_REGISTRY with 4 evaluation/finalization steps | Backend | 🔲 | FR-001 |
| 4 | `/kickoff-evaluate` API — honest evaluation (4+2 dimensions) | Backend | 🔲 | FR-028 |
| 5 | `/kickoff-done` API — completion criteria (DoD) | Backend | 🔲 | FR-029 |
| 6 | `/kickoff-gap` API — gap analysis (chat-based) | Backend | 🔲 | FR-026 |
| 7 | `/kickoff-checklist` API — dev readiness checklist (chat-based) | Backend | 🔲 | FR-027 |
| 8 | Phase 7 auto-transition after checklist completes | Backend | 🔲 | FR-001 |
| **Frontend** | | | | |
| 9 | Evaluation/finalization step chat UI (reuse ChatCenter) | Frontend | 🔲 | FR-001 |
| 10 | Left rail stepper — show 4 steps dynamically | Frontend | 🔲 | FR-010 |

---

## Implementation Details

### Step Management

Phase 6 uses its own FINALIZE_REGISTRY with 4 steps. After Phase 5 (Design) completes or design is skipped from Phase 4, the system initializes a new session with these steps:

| STEP | Skill | Description |
|---|---|---|
| 1 | `kickoff-evaluate` | 4+2 dimension project evaluation (scope clarity, feasibility, tech maturity, risk + 2 type-specific) |
| 2 | `kickoff-done` | Measurable completion criteria (DoD) |
| 3 | `kickoff-gap` | Missing info, contradictions, blind spot detection |
| 4 | `kickoff-checklist` | Dev readiness checklist (project structure, env vars, first steps) |

Each step is loaded via `load_skill()` and processed by `prompt_manager.py` with STEP splitting. Steps 1-4 reuse the same ChatCenter interview UI — no new components needed.

### /kickoff-evaluate (STEP 1)

**Skill source**: `backend/skills/kickoff-evaluate.md` + `backend/references/evaluation-criteria.md`

Evaluates the project across 4 common dimensions + 2 type-specific dimensions:
- Common: scope clarity, feasibility, technical maturity, risk
- Type-specific: varies by project type (e.g., data quality for AI/ML, UX complexity for web)

Returns structured evaluation with scores and recommendations.

### /kickoff-done (STEP 2)

**Skill source**: `backend/skills/kickoff-done.md` + `backend/references/done-criteria-templates.md`

Generates measurable completion criteria (Definition of Done):
- Must-have features
- Quality gates
- Performance thresholds
- Deployment requirements

### /kickoff-gap (STEP 3)

**Skill source**: `backend/skills/kickoff-gap.md` + `backend/references/gap-rules.md`

Chat-based gap analysis:
- Identifies missing information from interview
- Finds contradictions between answers
- Highlights blind spots in planning
- Suggests areas needing clarification

### /kickoff-checklist (STEP 4)

**Skill source**: `backend/skills/kickoff-checklist.md`

Chat-based dev readiness checklist:
- Project directory structure
- Environment variables (.env)
- Dependency list
- First development steps
- CI/CD setup recommendations

### Phase 7 Transition

After STEP 4 (checklist) completes, the system automatically transitions to Phase 7:
- Project status changes to `generating`
- `doc_engine.py` generates the final kickoff document
- Result viewer displays the document as section-based cards
- User downloads Markdown via download button

### Skill Files (from AI-Project-Kickoff-Harness)

| Skill | Files to Copy | Purpose |
|---|---|---|
| `kickoff-evaluate` | `SKILL.md` → `backend/skills/kickoff-evaluate.md`, `references/evaluation-criteria.md` → `backend/references/` | 4+2 dimension project evaluation |
| `kickoff-done` | `SKILL.md` → `backend/skills/kickoff-done.md`, `references/done-criteria-templates.md` → `backend/references/` | Measurable completion criteria |
| `kickoff-gap` | `SKILL.md` → `backend/skills/kickoff-gap.md`, `references/gap-rules.md` → `backend/references/` | Missing/contradiction detection |
| `kickoff-checklist` | `SKILL.md` → `backend/skills/kickoff-checklist.md` | Dev readiness checklist |

---

## Design Decisions

| Decision | Choice | Rationale |
|---|---|---|
| Step flow | 4 steps mandatory, linear sequence | All are quality assurance steps — always run regardless of design choice |
| Step management | FINALIZE_REGISTRY with independent step numbering | Clean separation from Phase 4 (kickoff) and Phase 5 (design) |
| Phase 7 transition | Automatic after checklist completes | No user decision needed — always proceeds to document generation |
| Evaluation/gap/checklist UI | Reuse ChatCenter | Consistent UX, no new UI components |
| Design later | Deferred to V2 | Adds complexity (project state tracking, re-entry flow) |

---

## Completion Criteria

- [ ] After design completes (or is skipped), evaluate step starts automatically
- [ ] All 4 steps (evaluate → done → gap → checklist) run as chat-based interview
- [ ] Each step uses `load_skill()` from harness_loader (not hardcoded)
- [ ] Checklist completion triggers automatic Phase 7 transition
- [ ] Left rail stepper shows 4 steps (evaluate → done → gap → checklist)
- [ ] Step progress updates correctly as evaluation/finalization proceeds

---

## Change Log

| Date | Description |
|---|---|
| 2026-05-22 | Initial creation — extracted from Phase 4 V4 flow (#29-39) |
| 2026-05-25 | Full restructure: gap/checklist made mandatory (was conditional), removed State A/B/C branching, linear flow, added explicit harness skill references (ADR-006) |
| 2026-05-25 | Phase 5 → Phase 6 renumbered. Phase Complete Modal removed. Flow rewritten: runs after Phase 5 (Design) or directly after Phase 4 if design skipped. STEP 12-15 → 1-4. Checklist completion auto-transitions to Phase 7 |

---
---

# Phase 6 — 평가 & 마무리 `🔲 미시작`

> 설계 후(또는 킥오프 직후) 품질 보증: 정직한 평가 → 완료 조건 → 누락 점검 → 착수 체크리스트 → 문서 생성.

**상태**: 🔲 미시작
**선행 조건**: Phase 5(설계) 완료 또는 Phase 4(킥오프)에서 설계 건너뛰기

---

## 개요

설계 Phase(Phase 5) 완료 후 — 또는 Phase 4 킥오프에서 설계를 건너뛴 경우 직접 — Phase 6이 4개의 필수 품질 검증 스텝을 순차적으로 실행한다. 프로젝트 품질을 평가하고, 완료 조건을 정의하고, 누락을 점검하고, 개발 착수 체크리스트를 생성한다. 4개 스텝 모두 필수 — 설계 단계 진행 여부와 무관하게 항상 실행.

**디자인 레퍼런스**: `ui-reference/screen-interview-v4.jsx`

**사용자 실행 순서** (런타임):
```
Phase 5(설계) 완료 또는 Phase 4에서 설계 건너뛰기
  → STEP 1: /kickoff-evaluate (정직한 평가)
  → STEP 2: /kickoff-done (완료 조건 정의)
  → STEP 3: /kickoff-gap (누락/모순 점검)
  → STEP 4: /kickoff-checklist (개발 착수 체크리스트)
  → Phase 7 (문서 생성 → 결과 뷰어 → 다운로드)
```

**스킬 통합**: 각 스텝은 `harness_loader.py`의 `load_skill()`로 스킬 .md를 로드 (ADR-006). `prompt_manager.py`가 토큰 최적화 적용 (STEP 분할, CLI 제거, 대화 압축, Prompt Caching).

> **참고**: "나중에 결정" (설계를 나중에 하기) 기능은 **V2**로 연기.

---

## 완료 예정 / 완료 항목

| # | 작업 | 영역 | 상태 | 관련 FR |
|---|---|---|---|---|
| **스킬 파일** | | | | |
| 1 | 하네스에서 스킬 파일 복사: `kickoff-evaluate.md`, `kickoff-done.md`, `kickoff-gap.md`, `kickoff-checklist.md` → `backend/skills/` | Backend | 🔲 | FR-020 |
| 2 | 하네스에서 Reference 파일 복사: `evaluation-criteria.md`, `done-criteria-templates.md`, `gap-rules.md` → `backend/references/` | Backend | 🔲 | FR-020 |
| **백엔드** | | | | |
| 3 | 스텝 관리 — FINALIZE_REGISTRY로 4개 평가/마무리 스텝 관리 | Backend | 🔲 | FR-001 |
| 4 | `/kickoff-evaluate` API — 정직한 평가 (4+2 차원) | Backend | 🔲 | FR-028 |
| 5 | `/kickoff-done` API — 완료 조건 정의 (DoD) | Backend | 🔲 | FR-029 |
| 6 | `/kickoff-gap` API — 누락/모순 점검 (채팅 기반) | Backend | 🔲 | FR-026 |
| 7 | `/kickoff-checklist` API — 개발 착수 체크리스트 (채팅 기반) | Backend | 🔲 | FR-027 |
| 8 | checklist 완료 시 Phase 7 자동 전환 | Backend | 🔲 | FR-001 |
| **프론트엔드** | | | | |
| 9 | 평가/마무리 스텝 채팅 UI (ChatCenter 재활용) | Frontend | 🔲 | FR-001 |
| 10 | 왼쪽 레일 스테퍼에 4개 스텝 동적 표시 | Frontend | 🔲 | FR-010 |

---

## 구현 상세

### 스텝 관리

Phase 6은 자체 FINALIZE_REGISTRY에 4개 스텝을 사용한다. Phase 5(설계) 완료 후 또는 Phase 4에서 설계를 건너뛴 후, 시스템이 다음 스텝으로 새 세션을 초기화한다:

| STEP | 스킬 | 설명 |
|---|---|---|
| 1 | `kickoff-evaluate` | 4+2 차원 프로젝트 평가 (범위 명확성, 실현가능성, 기술 성숙도, 리스크 + 유형별 2개) |
| 2 | `kickoff-done` | 측정 가능한 완료 기준 (DoD) 생성 |
| 3 | `kickoff-gap` | 누락 정보, 모순, 사각지대 탐지 |
| 4 | `kickoff-checklist` | 개발 착수 체크리스트 (프로젝트 구조, env 변수, 첫 단계) |

각 스텝은 `load_skill()`로 로드, `prompt_manager.py`의 STEP 분할로 처리. STEP 1-4는 인터뷰와 동일한 ChatCenter UI를 재활용 — 새 컴포넌트 불필요.

### /kickoff-evaluate (STEP 1)

**스킬 소스**: `backend/skills/kickoff-evaluate.md` + `backend/references/evaluation-criteria.md`

4개 공통 차원 + 2개 유형별 차원으로 프로젝트 평가:
- 공통: 범위 명확성, 실현가능성, 기술 성숙도, 리스크
- 유형별: 프로젝트 유형에 따라 다름 (예: AI/ML은 데이터 품질, 웹은 UX 복잡성)

점수와 권고사항이 포함된 구조화 평가 반환.

### /kickoff-done (STEP 2)

**스킬 소스**: `backend/skills/kickoff-done.md` + `backend/references/done-criteria-templates.md`

측정 가능한 완료 기준 (Definition of Done) 생성:
- 필수 기능 목록
- 품질 게이트
- 성능 임계값
- 배포 요구사항

### /kickoff-gap (STEP 3)

**스킬 소스**: `backend/skills/kickoff-gap.md` + `backend/references/gap-rules.md`

채팅 기반 갭 분석:
- 인터뷰에서 빠진 정보 식별
- 답변 간 모순 발견
- 기획 사각지대 강조
- 명확화 필요 영역 제안

### /kickoff-checklist (STEP 4)

**스킬 소스**: `backend/skills/kickoff-checklist.md`

채팅 기반 개발 착수 체크리스트:
- 프로젝트 디렉토리 구조
- 환경 변수 (.env)
- 의존성 목록
- 첫 개발 단계
- CI/CD 설정 권장사항

### Phase 7 전환

STEP 4(checklist) 완료 후 시스템이 자동으로 Phase 7로 전환:
- 프로젝트 상태가 `generating`으로 변경
- `doc_engine.py`가 최종 킥오프 문서 생성
- 결과 뷰어가 문서를 섹션별 카드로 표시
- 사용자가 Markdown 다운로드 버튼으로 내보내기

### 스킬 파일 (AI-Project-Kickoff-Harness에서)

| 스킬 | 복사할 파일 | 용도 |
|---|---|---|
| `kickoff-evaluate` | `SKILL.md` → `backend/skills/kickoff-evaluate.md`, `references/evaluation-criteria.md` → `backend/references/` | 4+2 차원 프로젝트 평가 |
| `kickoff-done` | `SKILL.md` → `backend/skills/kickoff-done.md`, `references/done-criteria-templates.md` → `backend/references/` | 측정 가능한 완료 기준 |
| `kickoff-gap` | `SKILL.md` → `backend/skills/kickoff-gap.md`, `references/gap-rules.md` → `backend/references/` | 누락/모순 탐지 |
| `kickoff-checklist` | `SKILL.md` → `backend/skills/kickoff-checklist.md` | 개발 착수 체크리스트 |

---

## 설계 결정 사항

| 결정 | 선택 | 근거 |
|---|---|---|
| 스텝 플로우 | 4개 스텝 필수, 순차 실행 | 모두 품질 보증 스텝 — 설계 여부와 무관하게 항상 실행 |
| 스텝 관리 | FINALIZE_REGISTRY에 독립 스텝 번호 | Phase 4(킥오프), Phase 5(설계)와 명확한 분리 |
| Phase 7 전환 | checklist 완료 후 자동 | 사용자 결정 불필요 — 항상 문서 생성으로 진행 |
| 평가/갭/체크리스트 UI | ChatCenter 재활용 | 일관된 UX, 새 UI 컴포넌트 불필요 |
| 설계 나중에 | V2로 연기 | 복잡성 추가 (프로젝트 상태 추적, 재진입 흐름) |

---

## 완료 기준

- [ ] 설계 완료 후 (또는 건너뛰기 후) evaluate 스텝이 자동으로 시작
- [ ] 4개 스텝 (evaluate → done → gap → checklist) 모두 채팅 기반 인터뷰로 동작
- [ ] 각 스텝이 `load_skill()` 사용 (하드코딩 아님)
- [ ] checklist 완료 시 Phase 7로 자동 전환
- [ ] 왼쪽 레일 스테퍼가 4개 스텝 표시 (evaluate → done → gap → checklist)
- [ ] 평가/마무리 진행에 따라 스텝 진행률 정확히 업데이트

---

## 변경 이력

| 날짜 | 내용 |
|---|---|
| 2026-05-22 | 최초 작성 — Phase 4의 V4 플로우 (#29-39)에서 분리하여 독립 Phase로 생성 |
| 2026-05-25 | 전면 재구조화: gap/checklist 필수화 (기존 조건부 → 필수), State A/B/C 분기 제거, 순차 실행 플로우, 하네스 스킬 참조 명시 (ADR-006) |
| 2026-05-25 | Phase 5 → Phase 6 번호 변경. Phase Complete 모달 삭제. 플로우 재작성: Phase 5(설계) 완료 후 또는 설계 건너뛰기 시 실행. STEP 12-15 → 1-4. checklist 완료 후 Phase 7 자동 전환 |
