# Phase 6 — Evaluation & Finalization `✅ Complete`

> Post-design (or post-kickoff) quality assurance: honest evaluation → completion criteria → gap analysis → dev checklist → document generation.

**Status**: ✅ Complete (Backend ✅, Frontend ✅ — implemented 2026-06-08, pending test)
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
  → doc v3 최종 생성 + 크레딧 차감 + status → completed
  → 문서 미리보기 업데이트 (Phase 7)
```

> **참고**: 문서 미리보기는 Phase 4 AI 제안 완료 시(doc v1) 이미 활성화됨. Phase 6 완료 시 최종 버전(v3)으로 업데이트.

**Skill integration**: Each step uses `load_skill()` from `harness_loader.py` (ADR-006). `prompt_manager.py` applies token optimizations (STEP splitting, CLI removal, conversation compression, Prompt Caching).

> **Note**: "나중에 결정" (save and return to Design later) is deferred to **V2**.

---

## Deliverables

| # | Task | Area | Status | Related FR |
|---|---|---|---|---|
| **Skill Files** | | | | |
| 1 | **Rewrite** 4 skill files for web-app JSON output (mirror `design-*.md`, NOT raw harness copy) into `backend/skills/`: `kickoff-evaluate/done/gap/checklist.md` + run `sync_harness.py` | Backend | ✅ | FR-020 |
| 2 | ~~Copy/adapt reference files to `backend/references/`~~ — **N/A**: skills rewritten as self-contained JSON-output prompts, no external reference files needed | Backend | ➖ | FR-020 |
| 2.5 | Migration `008_finalize_sessions.sql` — `finalize_sessions` table (mirrors 006 `design_sessions`; JSONB cols: evaluation/done_criteria/gaps/checklist) | Backend | ✅ | — |
| **Backend** | | | | |
| 3 | Step management — FINALIZE_REGISTRY with 4 evaluation/finalization steps | Backend | ✅ | FR-001 |
| 4 | `/kickoff-evaluate` API — honest evaluation (4+2 dimensions) | Backend | ✅ | FR-028 |
| 5 | `/kickoff-done` API — completion criteria (DoD) | Backend | ✅ | FR-029 |
| 6 | `/kickoff-gap` API — gap analysis (chat-based) | Backend | ✅ | FR-026 |
| 7 | `/kickoff-checklist` API — dev readiness checklist (chat-based) | Backend | ✅ | FR-027 |
| 8 | Checklist 완료 시 doc v3 자동 생성 + 크레딧 차감 + status `completed` | Backend | ✅ | FR-001, FR-003, FR-012 |
| **Frontend** | | | | |
| 9 | `FinalizePage` + 4 step components (`EvaluateStep`/`DoneStep`/`GapStep`/`ChecklistStep`) — replicate Phase 5 `DesignPage` card wizard; reuse `StepTransition`/`DesignStepFooter`/`Explainer`; auto-generate on entry | Frontend | ✅ | FR-001 |
| 10 | Left rail stepper (4 steps) — adapt `DesignLeftRail`; route `/projects/:projectId/finalize`; enter from design-complete "구현 단계로" | Frontend | ✅ | FR-010 |

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

### Checklist Completion & Doc v3

After STEP 4 (checklist) completes:
1. `doc_engine.py` generates **doc v3** (final) — adds evaluation, DoD, gap resolutions, checklist to existing doc
2. `_increment_credits(user_id)` — 킥오프 완료 크레딧 1회 차감
3. Project status → `completed`
4. Document preview page (Phase 7) auto-updates to show final version

> Note: doc v1 was already generated after Phase 4 AI suggest. doc v2 (if design was done) after Phase 5. Phase 6 produces the final v3.

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
| Checklist → doc v3 | Automatic after checklist completes | doc v3 최종 생성 + 크레딧 차감 + status completed. 별도 Phase 전환 아닌 doc 업데이트 |
| Evaluation/finalization UI | **Replicate Phase 5 card wizard** (`FinalizePage`), NOT ChatCenter | evaluate/done/gap/checklist produce structured results (score tables, checklists) that fit cards better than chat; keeps visual + behavioral consistency with Phase 5 (auto-generate on entry, nav lock during generation, Explainer kept visible). Reverses the original 2026-05-25 ChatCenter decision. Decided 2026-06-04 |
| Design later | Deferred to V2 | Adds complexity (project state tracking, re-entry flow) |
| No status downgrade (2026-06-08) | `design-decision` returns the project unchanged if it is already `completed` | A finished kickoff must not be reset to `evaluating` (or re-charged) when the new design→finalize skip transition re-triggers `design-decision` |

---

## Completion Criteria

- [x] After design completes (or is skipped), evaluate step starts automatically
- [x] All 4 steps (evaluate → done → gap → checklist) run as chat-based interview
- [x] Each step uses `load_skill()` from harness_loader (not hardcoded)
- [x] Checklist completion triggers doc v3 generation + credit deduction + status `completed`
- [x] Left rail stepper shows 4 steps (evaluate → done → gap → checklist)
- [x] Step progress updates correctly as evaluation/finalization proceeds

---

## Change Log

| Date | Description |
|---|---|
| 2026-05-22 | Initial creation — extracted from Phase 4 V4 flow (#29-39) |
| 2026-05-25 | Full restructure: gap/checklist made mandatory (was conditional), removed State A/B/C branching, linear flow, added explicit harness skill references (ADR-006) |
| 2026-05-25 | Phase 5 → Phase 6 renumbered. Phase Complete Modal removed. Flow rewritten: runs after Phase 5 (Design) or directly after Phase 4 if design skipped. STEP 12-15 → 1-4. Checklist completion auto-transitions to Phase 7 |
| 2026-05-26 | Phase 7 점진적 생성 반영: checklist 완료 → doc v3 생성 + 크레딧 차감 + status completed. "Phase 7 전환" → "doc 업데이트" 개념으로 변경. 과금 정책 반영 (횟수제 크레딧) |
| 2026-06-04 | Implementation plan confirmed, status → In Progress. **UI decision reversed: ChatCenter reuse → Phase 5 card wizard (`FinalizePage`)**. Plan: new `finalize_sessions` table (migration 008), new `finalize.py` router (`/api/finalize`, mirrors `design.py`), 4 skills **rewritten** for web-app JSON output (not raw harness copy), shared JSON helpers extracted from design.py, doc_engine extended to v3, checklist-complete triggers credit deduction + status `completed`. Build order: skills → migration → helper extraction → finalize.py → doc v3 → FinalizePage → wiring |
| 2026-06-08 | Bug fix (design→finalize transition). `set_design_decision` now no-ops when the project is already `completed` (no status downgrade, no credit re-charge) — fixes completed projects being reset to `evaluating` by the new skip-to-eval path. Paired with Phase 5 handoff fixes (`goToEvaluation`, `resumeRoute`, DesignPage completed-guard). Restored one test project that had been downgraded completed→evaluating. |
| 2026-06-08 | **Phase 6 implemented, status → Complete** (commit `aea8d05`). Backend: `finalize.py` (`/api/finalize`, STEP_CONFIG = evaluate→done→gap→checklist), `_shared.py` helpers extracted from design.py, 4 skills rewritten (`kickoff-evaluate/done/gap/checklist.md`), migration `008_finalize_sessions.sql`, `doc_engine.generate_final_document` (doc v3). Frontend: `FinalizePage` + `EvaluateStep`/`DoneStep`/`GapStep`/`ChecklistStep`/`FinalizeComplete`/`FinalizeLeftRail`/`FinalizeStates`. Deliverable #2 (reference files) marked N/A — skills are self-contained. Pending: E2E test |
| 2026-07-21 | BL-021 step 1 implemented: added shared `require_owned_session` authorization helper for design/finalize sessions. It validates session→project→owner, excludes soft-deleted projects, and returns the same 404 for missing or inaccessible sessions; 6 helper tests pass. The finalize update endpoint integration remains pending, so the IDOR is not yet mitigated. |
| 2026-07-21 | BL-021 step 2 implemented: wired `require_owned_session` into `PUT /api/finalize/{step}/{session_id}` before any mutation. The shared 32-case endpoint matrix verifies owner 200, other-user/deleted-project/missing-session 404, and no mutation on denial across all eight design/finalize APIs; the full backend suite passes 131 tests. Defensive hardening of the internal get-or-create path remains pending. |
| 2026-07-21 | BL-021 step 3 implemented: `_get_or_create_finalize_session` now receives the shared DB client and user ID, calls `_require_evaluation_access` before any session lookup/insert, and returns `(project, session)` so generation/completion callers no longer duplicate the project query. Ten direct design/finalize helper cases verify authorization-first ordering, owned-session reuse, and single creation; the full backend suite passes 141 tests. Code implementation is complete; pre-production security regression verification remains. |
| 2026-07-21 | BL-021 step 4 completed: a real Supabase integration run used two disposable Auth users and their actual login JWTs against the local backend. All eight owner requests, including the finalize gap update, returned 200; all eight cross-user requests and all eight owner requests after project soft deletion returned the uniform 404, with denied writes leaving data unchanged. The run exposed that `maybe_single()` can return `None` for no row, so `require_owned_session` now handles both response objects and `None`; two regression cases were added and the full backend suite passes 143 tests. All disposable Auth and public data was removed. |

> 설계 후(또는 킥오프 직후) 품질 보증: 정직한 평가 → 완료 조건 → 누락 점검 → 착수 체크리스트 → 문서 생성.

**상태**: ✅ 완료 (Backend ✅, Frontend ✅ — 2026-06-08 구현 완료, 테스트 대기)
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
  → doc v3 최종 생성 + 크레딧 차감 + status → completed
  → 문서 미리보기 업데이트 (Phase 7)
```

> **참고**: 문서 미리보기는 Phase 4 AI 제안 완료 시(doc v1) 이미 활성화됨. Phase 6 완료 시 최종 버전(v3)으로 업데이트.

**스킬 통합**: 각 스텝은 `harness_loader.py`의 `load_skill()`로 스킬 .md를 로드 (ADR-006). `prompt_manager.py`가 토큰 최적화 적용 (STEP 분할, CLI 제거, 대화 압축, Prompt Caching).

> **참고**: "나중에 결정" (설계를 나중에 하기) 기능은 **V2**로 연기.

---

## 완료 예정 / 완료 항목

| # | 작업 | 영역 | 상태 | 관련 FR |
|---|---|---|---|---|
| **스킬 파일** | | | | |
| 1 | 스킬 4개를 웹앱용 JSON 출력으로 **재작성** (`design-*.md` 패턴, 하네스 원본 복사 아님) → `backend/skills/`: `kickoff-evaluate/done/gap/checklist.md` + `sync_harness.py` 실행 | Backend | ✅ | FR-020 |
| 2 | ~~Reference 파일 복사/조정 → `backend/references/`~~ — **해당 없음**: 스킬을 self-contained JSON 출력 프롬프트로 재작성하여 외부 reference 파일 불필요 | Backend | ➖ | FR-020 |
| 2.5 | 마이그레이션 `008_finalize_sessions.sql` — `finalize_sessions` 테이블 (006 `design_sessions` 패턴; JSONB 컬럼: evaluation/done_criteria/gaps/checklist) | Backend | ✅ | — |
| **백엔드** | | | | |
| 3 | 스텝 관리 — FINALIZE_REGISTRY로 4개 평가/마무리 스텝 관리 | Backend | ✅ | FR-001 |
| 4 | `/kickoff-evaluate` API — 정직한 평가 (4+2 차원) | Backend | ✅ | FR-028 |
| 5 | `/kickoff-done` API — 완료 조건 정의 (DoD) | Backend | ✅ | FR-029 |
| 6 | `/kickoff-gap` API — 누락/모순 점검 (채팅 기반) | Backend | ✅ | FR-026 |
| 7 | `/kickoff-checklist` API — 개발 착수 체크리스트 (채팅 기반) | Backend | ✅ | FR-027 |
| 8 | Checklist 완료 시 doc v3 자동 생성 + 크레딧 차감 + status `completed` | Backend | ✅ | FR-001, FR-003, FR-012 |
| **프론트엔드** | | | | |
| 9 | `FinalizePage` + 스텝 컴포넌트 4개 (`EvaluateStep`/`DoneStep`/`GapStep`/`ChecklistStep`) — Phase 5 `DesignPage` 카드 위저드 복제; `StepTransition`/`DesignStepFooter`/`Explainer` 재활용; 진입 시 자동 생성 | Frontend | ✅ | FR-001 |
| 10 | 왼쪽 레일 스테퍼(4스텝) — `DesignLeftRail` 변형; 라우트 `/projects/:projectId/finalize`; 설계 완료 "구현 단계로"에서 진입 | Frontend | ✅ | FR-010 |

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

### Checklist 완료 & doc v3

STEP 4(checklist) 완료 후:
1. `doc_engine.py`가 **doc v3** (최종) 생성 — 평가, 완료조건, 갭 해결, 체크리스트를 기존 문서에 추가
2. `_increment_credits(user_id)` — 킥오프 완료 크레딧 1회 차감
3. 프로젝트 status → `completed`
4. 문서 미리보기 페이지 (Phase 7)가 최종 버전으로 자동 갱신

> 참고: doc v1은 Phase 4 AI 제안 완료 시, doc v2(설계 진행 시)는 Phase 5 완료 시 이미 생성됨. Phase 6은 최종 v3을 생성.

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
| Checklist → doc v3 | checklist 완료 후 자동 | doc v3 최종 생성 + 크레딧 차감 + status completed. 별도 Phase 전환 아닌 doc 업데이트 |
| 평가/마무리 UI | **Phase 5 카드 위저드 복제** (`FinalizePage`), ChatCenter 아님 | 평가/완료조건/갭/체크리스트는 구조화 결과(점수표·체크리스트)라 채팅보다 카드가 적합. Phase 5와 시각·동작 일관성 유지(진입 시 자동 생성, 생성 중 네비 잠금, Explainer 유지). 기존 2026-05-25 ChatCenter 결정을 번복. 2026-06-04 결정 |
| 설계 나중에 | V2로 연기 | 복잡성 추가 (프로젝트 상태 추적, 재진입 흐름) |
| status 강등 방지 (2026-06-08) | `design-decision`은 프로젝트가 이미 `completed`면 변경 없이 그대로 반환 | 완료된 킥오프가 설계→마무리 건너뛰기 전환이 `design-decision`을 재호출할 때 `evaluating`으로 강등(또는 크레딧 재청구)되면 안 됨 |

---

## 완료 기준

- [x] 설계 완료 후 (또는 건너뛰기 후) evaluate 스텝이 자동으로 시작
- [x] 4개 스텝 (evaluate → done → gap → checklist) 모두 채팅 기반 인터뷰로 동작
- [x] 각 스텝이 `load_skill()` 사용 (하드코딩 아님)
- [x] checklist 완료 시 doc v3 생성 + 크레딧 차감 + status `completed`
- [x] 왼쪽 레일 스테퍼가 4개 스텝 표시 (evaluate → done → gap → checklist)
- [x] 평가/마무리 진행에 따라 스텝 진행률 정확히 업데이트

---

## 변경 이력

| 날짜 | 내용 |
|---|---|
| 2026-05-22 | 최초 작성 — Phase 4의 V4 플로우 (#29-39)에서 분리하여 독립 Phase로 생성 |
| 2026-05-25 | 전면 재구조화: gap/checklist 필수화 (기존 조건부 → 필수), State A/B/C 분기 제거, 순차 실행 플로우, 하네스 스킬 참조 명시 (ADR-006) |
| 2026-05-25 | Phase 5 → Phase 6 번호 변경. Phase Complete 모달 삭제. 플로우 재작성: Phase 5(설계) 완료 후 또는 설계 건너뛰기 시 실행. STEP 12-15 → 1-4. checklist 완료 후 Phase 7 자동 전환 |
| 2026-05-26 | Phase 7 점진적 생성 반영: checklist 완료 → doc v3 생성 + 크레딧 차감 + status completed. "Phase 7 전환" → "doc 업데이트" 개념으로 변경. 과금 정책 반영 (횟수제 크레딧) |
| 2026-06-04 | 구현 계획 확정, 상태 → 진행 중. **UI 결정 번복: ChatCenter 재활용 → Phase 5 카드 위저드(`FinalizePage`)**. 계획: 새 `finalize_sessions` 테이블(마이그레이션 008), 새 `finalize.py` 라우터(`/api/finalize`, `design.py` 복제), 스킬 4개 웹앱용 JSON 출력 **재작성**(하네스 원본 복사 아님), design.py JSON 헬퍼 공용 모듈화, doc_engine v3 확장, checklist 완료 시 크레딧 차감 + status `completed`. 구현 순서: 스킬 → 마이그레이션 → 헬퍼 추출 → finalize.py → doc v3 → FinalizePage → 연결 |
| 2026-06-08 | 버그 수정 (설계→마무리 전환). `set_design_decision`이 프로젝트가 이미 `completed`면 아무 변경 없이 반환 (status 강등·크레딧 재청구 없음) — 새 평가-건너뛰기 경로가 완료 프로젝트를 `evaluating`으로 강등시키던 문제 해결. Phase 5 전환 수정(`goToEvaluation`, `resumeRoute`, DesignPage 완료 가드)과 연계. 강등됐던 테스트 프로젝트 1건 복구. |
| 2026-06-08 | **Phase 6 구현 완료, 상태 → 완료** (커밋 `aea8d05`). 백엔드: `finalize.py`(`/api/finalize`, STEP_CONFIG = evaluate→done→gap→checklist), design.py에서 `_shared.py` 헬퍼 추출, 스킬 4개 재작성(`kickoff-evaluate/done/gap/checklist.md`), 마이그레이션 `008_finalize_sessions.sql`, `doc_engine.generate_final_document`(doc v3). 프론트엔드: `FinalizePage` + `EvaluateStep`/`DoneStep`/`GapStep`/`ChecklistStep`/`FinalizeComplete`/`FinalizeLeftRail`/`FinalizeStates`. Deliverable #2(reference 파일)는 N/A 처리 — 스킬이 self-contained. 남은 작업: E2E 테스트 |
| 2026-07-21 | BL-021 1단계 구현: 설계·마감 세션 공통 인가 헬퍼 `require_owned_session` 추가. 세션→프로젝트→소유자를 검증하고, 삭제 프로젝트를 제외하며, 없는 세션과 접근 불가 세션에 동일한 404를 반환한다. 헬퍼 테스트 6개 통과. 마감 수정 API 연결은 남아 있어 IDOR는 아직 차단되지 않았다. |
| 2026-07-21 | BL-021 2단계 구현: `PUT /api/finalize/{step}/{session_id}`가 데이터를 변경하기 전에 `require_owned_session`을 호출하도록 연결했다. 설계·마감 API 8개를 함께 검증하는 엔드포인트 매트릭스 32건에서 소유자 200, 타 사용자·삭제 프로젝트·없는 세션 404, 거부 후 원본 불변을 확인했고 백엔드 전체 131개 테스트가 통과했다. 내부 get-or-create 경로의 방어 강화는 남아 있다. |
| 2026-07-21 | BL-021 3단계 구현: `_get_or_create_finalize_session`이 공통 DB 클라이언트와 사용자 ID를 받아 세션 조회·생성 전에 `_require_evaluation_access`를 실행하고 `(project, session)`을 반환하도록 변경해 생성·완료 호출부의 중복 프로젝트 조회를 제거했다. 설계·마감 직접 헬퍼 테스트 10건으로 인가 우선 순서, 소유 세션 재사용, 신규 세션 1회 생성을 확인했고 백엔드 전체 141개 테스트가 통과했다. 코드 구현은 완료됐으며 프로덕션 전 보안 회귀 검증은 남아 있다. |
| 2026-07-21 | BL-021 4단계 완료: 실제 Supabase에 임시 Auth 사용자 2명을 만들고 각 사용자의 실제 로그인 JWT로 로컬 백엔드를 검증했다. 마감 gap 수정을 포함한 소유자 요청 8개는 모두 200, 타 사용자 교차 요청 8개와 프로젝트 soft delete 후 소유자 요청 8개는 모두 동일한 404였으며, 거부된 수정으로 데이터가 바뀌지 않았다. 이 과정에서 `maybe_single()` 무결과가 `None`일 수 있음을 확인해 `require_owned_session`이 응답 객체와 `None`을 모두 처리하도록 보완하고 회귀 테스트 2개를 추가했다. 백엔드 전체 143개 테스트가 통과했고 임시 Auth·공개 데이터는 모두 정리했다. |
