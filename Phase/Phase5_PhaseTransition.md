# Phase 5 — Phase Transition & Validation `🔲 Not Started`

> Post-interview flow: AI suggestion review → honest evaluation → completion criteria → phase complete modal → gap analysis + dev checklist branch.

**Status**: 🔲 Not Started
**Prerequisites**: Phase 4 completion (Interview pipeline + `/kickoff-suggest`)

---

## Overview

After the interview (Phase 4) and suggestion review (`/kickoff-suggest`) complete, Phase 5 handles the transition between Phase 1 (What + Why) and Phase 2 (How). It adds evaluation and completion criteria steps, then presents a modal asking the user to proceed to Design or stay for reinforcement (gap analysis + dev checklist).

**Design reference**: `ui-reference/screen-interview-v4.jsx`

**Flow**:
```
/kickoff-suggest (Phase 4) → State A: propose evaluation
  → /kickoff-evaluate → /kickoff-done → State B: phase complete modal
    → Yes → Phase 6 (Design)
    → No  → State C: /kickoff-gap → /kickoff-checklist
```

> **Note**: "Design later" feature (return to Design after skipping) is deferred to **V2**.

---

## Deliverables

| # | Task | Area | Status | Related FR |
|---|---|---|---|---|
| **Skill Integration** | | | | |
| 1 | Copy skill files: `kickoff-evaluate`, `kickoff-done`, `kickoff-gap`, `kickoff-checklist` from harness | Backend | 🔲 | FR-020 |
| 2 | Dynamic step system — add steps at runtime based on user decisions | Backend | 🔲 | FR-001 |
| 3 | `InterviewResponse` phase transition signals (`propose`, `phase_complete`, `gap_branch`) | Backend | 🔲 | FR-001 |
| 4 | `/kickoff-evaluate` — honest evaluation step integration (4+2 dimensions) | Backend | 🔲 | FR-028 |
| 5 | `/kickoff-done` — completion criteria step integration (DoD) | Backend | 🔲 | FR-029 |
| 6 | `/kickoff-gap` — gap analysis step integration (chat-based) | Backend | 🔲 | FR-026 |
| 7 | `/kickoff-checklist` — dev readiness checklist step integration (chat-based) | Backend | 🔲 | FR-027 |
| **V4 UI** | | | | |
| 8 | V4 State A — AI next-step proposal card UI (정직한 평가 + 완료 조건 제안) | Frontend | 🔲 | FR-001 |
| 9 | V4 State B — Phase 1 complete modal (Design / Reinforce / Later) | Frontend | 🔲 | FR-001 |
| 10 | V4 State C — Gap + Checklist branch UI with "설계로 전환" link | Frontend | 🔲 | FR-001 |
| 11 | Dynamic step addition in left rail stepper | Frontend | 🔲 | FR-010 |

---

## Implementation Details

### State A — AI Proposes Next Sub-step

When the AI suggestion step (STEP 11) completes, instead of ending the interview, the system displays a proposal card asking the user to proceed with:
- **STEP 12: 정직한 평가** (`/kickoff-evaluate`) — evaluates the project across 4+2 dimensions (scope clarity, feasibility, etc.)
- **STEP 13: 완료 조건** (`/kickoff-done`) — generates measurable completion criteria (DoD)

User options: "네, 진행할게요" (accept) / "나중에" (defer).

UI: Green completion banner for idea phase + AI avatar with proposal text + two step preview cards (08: 정직한 평가, 09: 완료 조건) + estimated time + CTA buttons.

### State B — Phase 1 Complete Modal

After steps 12-13 complete, a modal overlay appears:
- Celebrates Phase 1 completion with accent gradient check icon
- "PHASE 1 COMPLETE" label + "아이디어 제안 완료!" title
- Phase 2 preview card (설계 단계: 기능 분해 · 아키텍처 · 데이터 모델 · AI 워크플로우, 약 20분)
- Info note: "지금 멈춰도 괜찮아요. 누락된 부분 점검이나 개발 착수 체크리스트를 먼저 받을 수도 있습니다."
- Three options:
  1. "네, 설계 단계로 진행" → navigates to Phase 6 Design UI
  2. "아니오, 보강만 도와주세요" → enters Gap+Checklist branch (State C)
  3. "나중에 결정" → returns to project list

### State C — Gap + Checklist Branch

If user declines Design phase, two additional steps are dynamically added:
- **STEP 14: 누락 점검 (Gap)** (`/kickoff-gap`) — gap analysis as AI chat
- **STEP 15: 착수 체크리스트** (`/kickoff-checklist`) — dev readiness checklist as AI chat

UI features:
- "BRANCH" banner: "설계 단계는 건너뛰고 보강 작업을 진행하고 있습니다 · 설계로 전환"
- Completed `/kickoff-gap` shown dimmed with "리포트 보기" link
- Active `/kickoff-checklist` with topic tags (프로젝트 구조, .env 변수) and question progress
- Quick actions: "AI 추천받기", "건너뛰기", "설계 단계로 전환"
- Left rail updates: progress shows extended steps (10/11, 11/11), phaseLabel = "보강 진행 중"

### Dynamic Step System

- `INTERVIEW_STEPS` remains the base list (11 steps); additional steps are appended to the session based on user decisions
- Session stores `dynamic_steps` field with the added step definitions
- `InterviewResponse` gains `transition_type` field: `null` (normal) / `propose` (State A) / `phase_complete` (State B) / `gap_branch` (State C)
- Frontend reads `transition_type` to render the appropriate UI state instead of the normal chat flow

### Skill Files (from AI-Project-Kickoff-Harness)

| Skill | Source | Purpose |
|---|---|---|
| `kickoff-evaluate` | `SKILL.md` + `references/evaluation-criteria.md` | 4+2 dimension project evaluation |
| `kickoff-done` | `SKILL.md` + `references/done-criteria-templates.md` | Measurable completion criteria |
| `kickoff-gap` | `SKILL.md` + `references/gap-rules.md` | Missing/contradiction detection |
| `kickoff-checklist` | `SKILL.md` | Dev readiness checklist + project structure + .env |

---

## Design Decisions

| Decision | Choice | Rationale |
|---|---|---|
| Step addition approach | Dynamic append to session, not fixed list | User may skip evaluation or gap analysis |
| Transition signal | `transition_type` field in response | Frontend can switch rendering mode without complex state detection |
| Gap/Checklist as chat | Reuse interview ChatCenter component | Consistent UX, no new UI component needed |
| Design later | Deferred to V2 | Adds complexity (project state tracking, re-entry flow) |

---

## Completion Criteria

- [ ] After AI suggestion, proposal card appears with accept/defer options
- [ ] "네, 진행할게요" adds evaluation + done steps and proceeds
- [ ] Evaluation and completion criteria steps work as chat-based interview
- [ ] Phase complete modal appears after steps 12-13 with 3 options
- [ ] "설계 단계로 진행" navigates to Phase 6 Design page
- [ ] "보강만 도와주세요" adds gap + checklist steps with BRANCH banner
- [ ] "나중에 결정" returns to project list with session preserved
- [ ] Left rail stepper dynamically updates with added steps
- [ ] "설계로 전환" link works from gap/checklist branch

---

## Change Log

| Date | Description |
|---|---|
| 2026-05-22 | Initial creation — extracted from Phase 4 V4 flow (#29-39) into dedicated Phase 5 |

---
---

# Phase 5 — Phase 전환 & 검증 `🔲 미시작`

> 인터뷰 후 플로우: AI 제안 검토 → 정직한 평가 → 완료 조건 → Phase 완료 모달 → 갭 분석 + 개발 체크리스트 분기.

**상태**: 🔲 미시작
**선행 조건**: Phase 4 완료 (인터뷰 파이프라인 + `/kickoff-suggest`)

---

## 개요

인터뷰(Phase 4)와 제안 검토(`/kickoff-suggest`) 완료 후, Phase 5는 Phase 1(What + Why)과 Phase 2(How) 사이의 전환을 처리한다. 평가와 완료 조건 스텝을 추가한 뒤, 설계로 진행할지 보강(갭 분석 + 개발 체크리스트)으로 갈지 모달로 묻는다.

**디자인 레퍼런스**: `ui-reference/screen-interview-v4.jsx`

**흐름**:
```
/kickoff-suggest (Phase 4) → State A: 평가 제안
  → /kickoff-evaluate → /kickoff-done → State B: Phase 완료 모달
    → 예 → Phase 6 (설계)
    → 아니오 → State C: /kickoff-gap → /kickoff-checklist
```

> **참고**: "설계를 나중에 하고 싶을 때" 기능은 **V2**로 연기.

---

## 완료 예정 / 완료 항목

| # | 작업 | 영역 | 상태 | 관련 FR |
|---|---|---|---|---|
| **스킬 통합** | | | | |
| 1 | 스킬 파일 복사: `kickoff-evaluate`, `kickoff-done`, `kickoff-gap`, `kickoff-checklist` (하네스에서) | Backend | 🔲 | FR-020 |
| 2 | 동적 스텝 시스템 — 사용자 결정에 따라 런타임에 스텝 추가 | Backend | 🔲 | FR-001 |
| 3 | `InterviewResponse`에 Phase 전환 신호 (`propose`, `phase_complete`, `gap_branch`) | Backend | 🔲 | FR-001 |
| 4 | `/kickoff-evaluate` — 정직한 평가 스텝 통합 (4+2 차원) | Backend | 🔲 | FR-028 |
| 5 | `/kickoff-done` — 완료 조건 스텝 통합 (DoD) | Backend | 🔲 | FR-029 |
| 6 | `/kickoff-gap` — 누락 점검 스텝 통합 (채팅 기반) | Backend | 🔲 | FR-026 |
| 7 | `/kickoff-checklist` — 착수 체크리스트 스텝 통합 (채팅 기반) | Backend | 🔲 | FR-027 |
| **V4 UI** | | | | |
| 8 | V4 State A — AI 다음 단계 제안 카드 UI (정직한 평가 + 완료 조건) | Frontend | 🔲 | FR-001 |
| 9 | V4 State B — Phase 1 완료 모달 (설계 / 보강 / 나중에) | Frontend | 🔲 | FR-001 |
| 10 | V4 State C — Gap + Checklist 분기 UI + "설계로 전환" 링크 | Frontend | 🔲 | FR-001 |
| 11 | 왼쪽 레일 스테퍼에 동적 스텝 추가 | Frontend | 🔲 | FR-010 |

---

## 구현 상세

### State A — AI 다음 단계 제안

AI 제안 스텝 (STEP 11) 완료 시, 인터뷰를 끝내지 않고 제안 카드를 표시하여 다음 진행을 묻는다:
- **STEP 12: 정직한 평가** (`/kickoff-evaluate`) — 4+2 차원으로 프로젝트 평가 (범위 명확성, 실현가능성 등)
- **STEP 13: 완료 조건** (`/kickoff-done`) — 측정 가능한 완료 기준 생성 (DoD)

사용자 선택지: "네, 진행할게요" (수락) / "나중에" (보류).

UI: 초록 완료 배너 (아이디어 단계 완료) + AI 아바타 + 제안 텍스트 + 스텝 미리보기 카드 2개 (08: 정직한 평가, 09: 완료 조건) + 예상 소요 시간 + CTA 버튼.

### State B — Phase 1 완료 모달

스텝 12-13 완료 후, 모달 오버레이 표시:
- accent 그라디언트 체크 아이콘으로 Phase 1 완료 축하
- "PHASE 1 COMPLETE" 라벨 + "아이디어 제안 완료!" 제목
- Phase 2 미리보기 카드 (설계 단계: 기능 분해 · 아키텍처 · 데이터 모델 · AI 워크플로우, 약 20분)
- 안내: "지금 멈춰도 괜찮아요. 누락된 부분 점검이나 개발 착수 체크리스트를 먼저 받을 수도 있습니다."
- 세 가지 선택지:
  1. "네, 설계 단계로 진행" → Phase 6 설계 UI로 이동
  2. "아니오, 보강만 도와주세요" → Gap+Checklist 분기 진입 (State C)
  3. "나중에 결정" → 프로젝트 목록으로 복귀

### State C — Gap + Checklist 분기

설계를 거부하면 두 개의 추가 스텝이 동적으로 추가:
- **STEP 14: 누락 점검 (Gap)** (`/kickoff-gap`) — AI 채팅으로 갭 분석
- **STEP 15: 착수 체크리스트** (`/kickoff-checklist`) — AI 채팅으로 개발 준비 체크리스트

UI 특징:
- "BRANCH" 배너: "설계 단계는 건너뛰고 보강 작업을 진행하고 있습니다 · 설계로 전환"
- 완료된 `/kickoff-gap`은 흐리게 표시 + "리포트 보기" 링크
- 활성 `/kickoff-checklist`에 주제 태그 (프로젝트 구조, .env 변수) + 질문 진행률
- 퀵 액션: "AI 추천받기", "건너뛰기", "설계 단계로 전환"
- 왼쪽 레일 업데이트: 확장된 스텝으로 진행률 표시 (10/11, 11/11), phaseLabel = "보강 진행 중"

### 동적 스텝 시스템

- `INTERVIEW_STEPS`는 기본 리스트 (11스텝)로 유지; 사용자 결정에 따라 세션에 추가 스텝 첨부
- 세션에 `dynamic_steps` 필드 저장
- `InterviewResponse`에 `transition_type` 필드 추가: `null` (일반) / `propose` (State A) / `phase_complete` (State B) / `gap_branch` (State C)
- 프론트엔드가 `transition_type`을 읽어 일반 채팅 대신 해당 UI 상태 렌더링

### 스킬 파일 (AI-Project-Kickoff-Harness에서)

| 스킬 | 소스 | 용도 |
|---|---|---|
| `kickoff-evaluate` | `SKILL.md` + `references/evaluation-criteria.md` | 4+2 차원 프로젝트 평가 |
| `kickoff-done` | `SKILL.md` + `references/done-criteria-templates.md` | 측정 가능한 완료 기준 |
| `kickoff-gap` | `SKILL.md` + `references/gap-rules.md` | 누락/모순 탐지 |
| `kickoff-checklist` | `SKILL.md` | 개발 준비 체크리스트 + 프로젝트 구조 + .env |

---

## 설계 결정 사항

| 결정 | 선택 | 근거 |
|---|---|---|
| 스텝 추가 방식 | 세션에 동적 append, 고정 리스트 아님 | 사용자가 평가나 갭 분석을 건너뛸 수 있음 |
| 전환 신호 | 응답의 `transition_type` 필드 | 복잡한 상태 감지 없이 프론트엔드가 렌더링 모드 전환 |
| Gap/Checklist 방식 | 인터뷰 ChatCenter 컴포넌트 재활용 | 일관된 UX, 새 UI 컴포넌트 불필요 |
| 설계 나중에 | V2로 연기 | 복잡성 추가 (프로젝트 상태 추적, 재진입 흐름) |

---

## 완료 기준

- [ ] AI 제안 후 제안 카드가 수락/보류 옵션과 함께 표시
- [ ] "네, 진행할게요"로 평가 + 완료 조건 스텝 추가 및 진행
- [ ] 평가와 완료 조건 스텝이 채팅 기반 인터뷰로 동작
- [ ] 스텝 12-13 완료 후 Phase 완료 모달이 3개 옵션과 함께 표시
- [ ] "설계 단계로 진행"이 Phase 6 설계 페이지로 이동
- [ ] "보강만 도와주세요"가 BRANCH 배너와 함께 gap + checklist 스텝 추가
- [ ] "나중에 결정"이 세션 보존 상태로 프로젝트 목록 복귀
- [ ] 왼쪽 레일 스테퍼가 추가된 스텝으로 동적 업데이트
- [ ] gap/checklist 분기에서 "설계로 전환" 링크 동작

---

## 변경 이력

| 날짜 | 내용 |
|---|---|
| 2026-05-22 | 최초 작성 — Phase 4의 V4 플로우 (#29-39)에서 분리하여 독립 Phase 5로 생성 |
