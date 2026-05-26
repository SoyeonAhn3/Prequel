# Phase 4 — AI Interview Pipeline `✅ Complete`

> Build the core AI interview system: prompt manager, interview orchestrator, session management, and chat UI.

**Status**: ✅ Complete
**Prerequisites**: Phase 3 completion (Project CRUD, quota enforcement)

---

## Overview

This is the most critical phase of the entire project. It implements the heart of Prequel — the AI-powered structured interview pipeline. Backend builds the harness file loader, `prompt_manager.py` with 4 token optimizations + Prompt Caching, project type auto-detection, the interview orchestrator (start → question → answer → next question loop), and session management with event-based saving and pause/resume. Frontend builds the chat UI, type detection confirmation, progress bar, and session save/resume functionality.

---

## Deliverables

| # | Task | Area | Status | Related FR |
|---|---|---|---|---|
| 1 | Harness file loader (skill .md + Reference reading) | Backend | ✅ | FR-020 |
| 2 | `prompt_manager.py` — STEP splitting | Backend | ✅ | FR-020 |
| 3 | `prompt_manager.py` — CLI section removal | Backend | ✅ | FR-020 |
| 4 | `prompt_manager.py` — Reference type-based filtering | Backend | ⏭️ N/A | FR-020 |
| 5 | `prompt_manager.py` — Conversation history compression | Backend | ✅ | FR-020 |
| 6 | `prompt_manager.py` — Anthropic Prompt Caching | Backend | ✅ | FR-020 |
| 7 | Project type auto-detection API | Backend | ✅ | FR-002 |
| 8 | Interview orchestrator (start → question → answer loop) | Backend | ✅ | FR-001 |
| 9 | Session management — event-based saving | Backend | ✅ | FR-011, ADR-003 |
| 10 | Session pause/resume API | Backend | ✅ | FR-011 |
| 11 | 5-minute inactivity auto-pause logic | Frontend | ✅ | FR-011 |
| 12 | Chat UI — 3-column layout (left rail / center chat / right insights) | Frontend | ✅ | FR-001 |
| 13 | Chat UI — message bubbles (AI/user) + dimmed history + "모두 보기" | Frontend | ✅ | FR-001 |
| 14 | Chat UI — current question card (topic tags, importance, 예시 답변 보기) | Frontend | ✅ | FR-001 |
| 15 | Chat UI — input area (char counter, Enter/Shift+Enter hints, send) | Frontend | ✅ | FR-001 |
| 16 | Chat UI — quick action chips (AI 추천받기, 건너뛰기, 다시 질문해줘) | Frontend | ✅ | FR-001 |
| 17 | Left rail — AI persona, project meta, phase indicator (1 of 3) | Frontend | ✅ | FR-010 |
| 18 | Left rail — progress card (N/10, remaining time, progress bar) | Frontend | ✅ | FR-010 |
| 19 | Left rail — vertical stepper (done+summary / active / pending) | Frontend | ✅ | FR-010 |
| 20 | Right panel — captured insights (collected info cards, NEW badge, pending) | Frontend | ✅ | FR-001 |
| 21 | Right panel — document preview button + auto-save indicator | Frontend | ✅ | FR-011 |
| 22 | Center top bar — breadcrumb (STEP > topic > question #) + pause button | Frontend | ✅ | FR-011 |
| 23 | Center bottom — stats bar (elapsed time, answer count, avg answer time) | Frontend | ✅ | FR-010 |
| 24 | Project type detection result confirm/edit UI | Frontend | ✅ | FR-002 |
| 25 | Pause button + `beforeunload` session save | Frontend | ✅ | FR-011 |
| 26 | Resume from project list ("In Progress" → resume) | Frontend | ✅ | FR-011 |
| 27 | `/kickoff-suggest` — skill-based AI suggestions (`load_skill()` conversion done) | Backend | ✅ | FR-021 |
| 28 | ~~Suggestion review UI~~ (replaced by chat UI, no separate UI needed) | — | ✅ | FR-021 |
| 29 | Design decision UI (proceed to design / skip selection cards) | Frontend + Backend | ✅ | FR-001 |

> **V4 Phase Transition Flow** (#29-39) → **Phase 6**으로 분리됨

---

## Implementation Details

### Harness File Loader

**Files**: `backend/app/core/harness_loader.py`

- Reads skill `.md` files from `backend/skills/`
- Reads reference files from `backend/references/`
- Provides raw text content to `prompt_manager.py`

### Prompt Manager

**File**: `backend/app/core/prompt_manager.py`

Implemented optimizations:

1. **STEP splitting** (`extract_step()`) — regex-based extraction of current STEP section from skill `.md`, sends only relevant instructions
2. **CLI removal** (`remove_cli_directives()`) — strips bash/shell code blocks and CLI keywords from prompts
3. **Reference filtering** — 🔲 Not yet implemented (planned for type-specific reference inclusion)
4. **Conversation compression** (`compress_history()`) — summarizes older messages, keeps recent 6 turns
5. **Prompt Caching** (`build_system_prompt()`) — applies `cache_control: {"type": "ephemeral"}` to system prompt blocks

Additional: `INTERVIEW_STEPS` list (10 steps with title and topic), `build_system_prompt()` constructs cached system prompt with JSON response format instruction.

### Claude Client

**File**: `backend/app/core/claude_client.py`

Singleton Anthropic client wrapper:
- `chat(system, messages, max_tokens, model)` → returns `(text, usage_dict)`
- Default model: `claude-sonnet-4-6`
- Token usage tracking (input + output tokens)

### Interview Skill Definition

**File**: `backend/skills/kickoff-interview.md`

10-step structured interview flow:
- Common steps (1-7): 프로젝트 유형 감지, 주요 사용자, 핵심 가치, 데이터 소스, 기술 스택, 성공 지표, 리스크
- Type-specific steps (8-10): 유형별 심화 질문 3개
- Claude responds in structured JSON: `{message, insights[], step_complete, example_answers[]}`

### Interview Orchestrator

**File**: `backend/app/api/interview.py`

6 endpoints implemented and tested:
- `POST /api/interview/start` — initialize session, send first question via Claude
- `POST /api/interview/answer` — receive user answer, advance step when Claude returns `step_complete: true`, generate next question
- `POST /api/interview/pause` — pause session, save state
- `POST /api/interview/resume` — resume from last question
- `GET /api/interview/status/{session_id}` — current step, progress, messages
- `GET /api/interview/session/{project_id}` — find active session for a project

**Key implementation details**:
- `_parse_ai_response()` — parses Claude's JSON response with markdown code fence fallback
- `_build_steps_list()` — builds step status list (done/active/pending) from current step
- Auto-detects project type from first response insights and updates projects table
- Token tracking: accumulates input+output tokens in `session.token_used`

**Flow**: User idea → type detection → confirmation → planning interview (common 7 + type-specific 3 questions) → `/kickoff-suggest` → design decision → Phase 5 (Design) or Phase 6 (Evaluation & Finalization)

### Post-Interview: `/kickoff-suggest`

**Skill file**: `backend/skills/kickoff-suggest.md` (copy from harness)
**API file**: `backend/app/api/suggest.py` (to be created)

After the 10-step interview completes, the system triggers `/kickoff-suggest` as STEP 11:
- Loads skill via `load_skill("kickoff-suggest")` from `harness_loader.py`
- Takes all collected interview insights as input context
- Calls Claude API to generate actionable suggestions (feature ideas, technical approaches, risk mitigations)
- Returns structured suggestion list with category, priority, and rationale
- User reviews suggestions in chat UI: accept, reject, or request alternatives
- Accepted suggestions are stored and carried forward to Phase 5 design and Phase 6 evaluation as additional context

> **Current state**: ✅ Converted to `load_skill("kickoff-suggest")` — hardcoded STEP 11 removed.

> **After suggest** → User chooses to proceed to Phase 5 (Design) or skip to Phase 6 (Evaluation & Finalization)

### Interview Schemas

**File**: `backend/app/schemas/interview.py`

Request models: `InterviewStartRequest`, `InterviewAnswerRequest`, `InterviewPauseRequest`, `InterviewResumeRequest`
Response models: `InsightItem`, `ExampleAnswer`, `StepItem`, `MessageItem`, `InterviewResponse`, `InterviewStatusResponse`

### Session Management (ADR-003)

Event-based saving triggers:
1. On user answer submission → immediate save
2. On pause button click → save
3. On browser close/navigation (`beforeunload`) → save
4. On 5-minute inactivity → auto-pause + save

### Chat UI (3-Column Layout)

**Files**: `frontend/src/pages/InterviewPage.tsx`, `frontend/src/components/interview/LeftRail.tsx`, `frontend/src/components/interview/ChatCenter.tsx`, `frontend/src/components/interview/RightPanel.tsx`, `frontend/src/components/interview/AiMark.tsx`, `frontend/src/components/interview/types.ts`

**Status**: UI shell complete with mock data. Frontend ↔ Backend API connection not yet implemented.

**Design reference**: `ui-reference/screen-interview-v3.jsx`

**Left rail** (268px fixed):
- AI persona: gradient "P" mark + "Prequel" name + green status dot
- Project meta: project name, type tag (AI/ML), language tag (KO)
- Phase indicator: "PHASE 1 of 3" + mini progress bars
- Progress card: large step counter (3/10), "기획 인터뷰" label, progress bar, estimated remaining time
- Vertical stepper: done steps (green check + italic answer summary), active step (accent pulse + "질문 3/3"), pending steps (numbered gray circles)

**Center** (flex):
- Top bar breadcrumb: "STEP 04 > 데이터 소스 > 3번째 질문" + help button + pause button
- Previous conversation: dimmed (opacity 0.55) + "모두 보기 (N)" expand link
- Message bubbles: AI (left, white bg, border, AI mark avatar) / User (right, accent bg, white text, initial avatar) + timestamps
- Current question card (accent border, shadow):
  - Header strip: topic tags ("데이터 출처", "측정 지표") + importance level ("중요도 높음")
  - AI avatar + question text with bold accent highlights
  - Collapsible "예시 답변 보기" hint with bullet-point examples
  - Meta: estimated answer time, insight extraction count
- Quick action chips: "AI 추천받기" (primary), "건너뛰기" (outlined), "다시 질문해줘" (outlined)
- Input area: text field + blinking cursor, `Enter` send / `Shift+Enter` newline hints, character counter (N/500), send button
- Stats bar: elapsed time, answer count, avg answer time, status indicator ("순조롭게 진행 중")

**Right panel** (284px fixed):
- "수집된 정보" header + collected count badge (3/8)
- Description: "답변에 따라 자동으로 킥오프 문서가 작성됩니다"
- Captured info cards: completed (gray bg, label + value), new (green bg + "NEW" badge), pending (dashed border + dot animation + "답변 중")
- "문서 미리보기" button
- Auto-save indicator: "자동 저장됨 · 방금 전" + "브라우저를 닫아도 안전합니다"

---

## Design Decisions

| Decision | Choice | Rationale |
|---|---|---|
| Prompt optimization approach | Hybrid — reuse skill .md + Python optimization layer (ADR-006) | Balance between development speed and token cost |
| Session save strategy | Event-based, not periodic (ADR-003) | Chat UI has clear data change points (answer submission) |
| Type detection | Single API call at project start | One-time cost, user can override |
| Question count | Common 7 + type-specific 3 = ~10 questions | Balances depth and user fatigue |
| Claude response format | Structured JSON (`{message, insights[], step_complete, example_answers[]}`) | Enables reliable parsing, insight extraction, and step advancement |
| Badge component extraction | Common `<Badge>` with 4 variants (accent, muted, green, amber) | Replaced 5 inline badge/tag repetitions across 3 files |
| Icon library | `lucide-react` (tree-shakeable) | Replaced 17 inline SVGs across 4 files; consistent icon sizing and styling |
| Chat UI components | `interview/` directory (LeftRail, ChatCenter, RightPanel, AiMark, types) | Separate from `chat/` directory; each panel is an independent component with typed props |

---

## Completion Criteria

- [x] Idea input → type auto-detected and displayed for user confirmation
- [x] Full interview loop: question → answer → next question works E2E
- [x] Pause → browser close → reopen → resume from last question with no data loss
- [x] 5-minute inactivity triggers auto-pause
- [x] Progress bar accurately shows current step / total steps
- [x] Quick action chips ("recommend", "skip") function correctly
- [x] `/kickoff-suggest` generates suggestions using `load_skill()` (not hardcoded)

---

## Change Log

| Date | Description |
|---|---|
| 2026-05-19 | Initial creation |
| 2026-05-21 | Chat UI deliverables expanded (#12-26): 3-column layout, right insights panel, question card details, stats bar, breadcrumb — based on `screen-interview-v3.jsx` gap analysis |
| 2026-05-21 | Backend complete (#1-10 ✅): harness_loader, prompt_manager (STEP split, CLI removal, compression, caching), claude_client, interview API (6 endpoints), schemas — all tested E2E with curl |
| 2026-05-21 | Frontend UI shell complete (#12-23 ✅): InterviewPage, LeftRail, ChatCenter, RightPanel, AiMark — mock data, 3-column layout |
| 2026-05-21 | Code cleanup: Badge component extracted (5 repetitions → 1 common component), lucide-react adopted (17 inline SVGs replaced) |
| 2026-05-22 | Added `/kickoff-suggest` (#27-28): post-interview AI suggestion generation + review UI as Phase 4 deliverables |
| 2026-05-22 | Implemented #11 (5-min auto-pause, frontend), #24 (type confirm/edit UI), #25 (beforeunload save), #26 (paused project resume). #4 marked N/A (no type-specific references yet) |
| 2026-05-22 | Added V4 Phase Transition Flow (#29-39): dynamic step system, kickoff-evaluate/done/gap/checklist skill integration, proposal card, phase complete modal, gap branch UI. Design skills (How) moved to Phase 5. "Design later" feature deferred to V2 |
| 2026-05-25 | Restructured: #27 kickoff-suggest reverted to 🔲 (hardcoded → load_skill), removed API cost criteria, updated suggest section with harness integration (ADR-006) |
| 2026-05-25 | Phase references updated: Design = Phase 5, Evaluation = Phase 6. Added design decision deliverable (#29) |
| 2026-05-26 | Phase 4 complete: #27 load_skill() conversion confirmed ✅, #29 design decision UI confirmed ✅. All 29 deliverables done. Billing changed to usage-based credits (credits_used). Test scenarios 28/28 Pass |

---
---

# Phase 4 — AI 인터뷰 파이프라인 `✅ 완료`

> 핵심 AI 인터뷰 시스템 구축: 프롬프트 매니저, 인터뷰 오케스트레이터, 세션 관리, 채팅 UI.

**상태**: ✅ 완료
**선행 조건**: Phase 3 완료 (프로젝트 CRUD, 쿼터 적용)

---

## 개요

전체 프로젝트에서 가장 중요한 Phase이다. Prequel의 핵심인 AI 기반 구조화 인터뷰 파이프라인을 구현한다. 백엔드는 하네스 파일 로더, 4가지 토큰 최적화 + Prompt Caching이 적용된 `prompt_manager.py`, 프로젝트 유형 자동 감지, 인터뷰 오케스트레이터(시작 → 질문 → 답변 → 다음 질문 루프), 이벤트 기반 저장과 일시정지/재개를 포함한 세션 관리를 구축한다. 프론트엔드는 채팅 UI, 유형 감지 확인, 프로그레스바, 세션 저장/재개 기능을 구현한다.

---

## 완료 예정 / 완료 항목

| # | 작업 | 영역 | 상태 | 관련 FR |
|---|---|---|---|---|
| 1 | 하네스 파일 로더 (스킬 .md + Reference 읽기) | Backend | ✅ | FR-020 |
| 2 | `prompt_manager.py` — STEP 분할 로딩 | Backend | ✅ | FR-020 |
| 3 | `prompt_manager.py` — CLI 전용 섹션 제거 | Backend | ✅ | FR-020 |
| 4 | `prompt_manager.py` — Reference 유형별 필터링 | Backend | ⏭️ N/A | FR-020 |
| 5 | `prompt_manager.py` — 대화 이력 압축 | Backend | ✅ | FR-020 |
| 6 | `prompt_manager.py` — Anthropic Prompt Caching 적용 | Backend | ✅ | FR-020 |
| 7 | 프로젝트 유형 자동 감지 API | Backend | ✅ | FR-002 |
| 8 | 인터뷰 오케스트레이터 (시작 → 질문 → 답변 루프) | Backend | ✅ | FR-001 |
| 9 | 세션 관리 — 이벤트 기반 저장 | Backend | ✅ | FR-011, ADR-003 |
| 10 | 세션 일시정지/재개 API | Backend | ✅ | FR-011 |
| 11 | 5분 무응답 자동 일시정지 로직 | Frontend | ✅ | FR-011 |
| 12 | 채팅 UI — 3컬럼 레이아웃 (왼쪽 레일 / 중앙 채팅 / 오른쪽 인사이트) | Frontend | ✅ | FR-001 |
| 13 | 채팅 UI — 메시지 버블 (AI/사용자) + 흐린 이전 대화 + "모두 보기" | Frontend | ✅ | FR-001 |
| 14 | 채팅 UI — 현재 질문 카드 (주제 태그, 중요도, 예시 답변 보기) | Frontend | ✅ | FR-001 |
| 15 | 채팅 UI — 입력 영역 (글자수 카운터, Enter/Shift+Enter 힌트, 전송) | Frontend | ✅ | FR-001 |
| 16 | 채팅 UI — 퀵 액션 칩 (AI 추천받기, 건너뛰기, 다시 질문해줘) | Frontend | ✅ | FR-001 |
| 17 | 왼쪽 레일 — AI 페르소나, 프로젝트 메타, Phase 표시 (1 of 3) | Frontend | ✅ | FR-010 |
| 18 | 왼쪽 레일 — 진행률 카드 (N/10, 남은 시간, 프로그레스바) | Frontend | ✅ | FR-010 |
| 19 | 왼쪽 레일 — 세로 스테퍼 (완료+요약 / 진행 중 / 예정) | Frontend | ✅ | FR-010 |
| 20 | 오른쪽 패널 — 수집된 정보 (인사이트 카드, NEW 배지, 대기 애니메이션) | Frontend | ✅ | FR-001 |
| 21 | 오른쪽 패널 — 문서 미리보기 버튼 + 자동 저장 표시 | Frontend | ✅ | FR-011 |
| 22 | 중앙 상단 바 — 빵부스러기 (STEP > 주제 > 질문 #) + 일시정지 버튼 | Frontend | ✅ | FR-011 |
| 23 | 중앙 하단 — 통계 바 (진행 시간, 답변 수, 평균 답변 시간) | Frontend | ✅ | FR-010 |
| 24 | 프로젝트 유형 감지 결과 확인/수정 UI | Frontend | ✅ | FR-002 |
| 25 | 일시정지 버튼 + `beforeunload` 세션 저장 | Frontend | ✅ | FR-011 |
| 26 | 이어하기 (프로젝트 목록에서 "진행 중" → 재개) | Frontend | ✅ | FR-011 |
| 27 | `/kickoff-suggest` — 스킬 기반 AI 제안 (`load_skill()` 전환 완료) | Backend | ✅ | FR-021 |
| 28 | ~~제안 검토 UI~~ (채팅 UI로 대체, 별도 UI 불필요) | — | ✅ | FR-021 |
| 29 | 설계 진행 여부 선택 UI (suggest 완료 후 표시) | Frontend + Backend | ✅ | FR-001 |

> **V4 Phase 전환 플로우** (#29-39) → **Phase 6**으로 분리됨

---

## 구현 상세

### 하네스 파일 로더

**파일**: `backend/app/core/harness_loader.py`

- `backend/skills/`에서 스킬 `.md` 파일 읽기
- `backend/references/`에서 Reference 파일 읽기
- `prompt_manager.py`에 원본 텍스트 콘텐츠 제공

### 프롬프트 매니저

**파일**: `backend/app/core/prompt_manager.py`

구현된 최적화:

1. **STEP 분할** (`extract_step()`) — 정규식 기반으로 스킬 `.md`에서 현재 STEP 섹션만 추출, 관련 지시만 전송
2. **CLI 제거** (`remove_cli_directives()`) — bash/shell 코드 블록 및 CLI 키워드 제거
3. **Reference 필터링** — 🔲 미구현 (유형별 Reference 포함 계획)
4. **대화 압축** (`compress_history()`) — 오래된 메시지 요약, 최근 6개 턴 유지
5. **Prompt Caching** (`build_system_prompt()`) — 시스템 프롬프트 블록에 `cache_control: {"type": "ephemeral"}` 적용

추가: `INTERVIEW_STEPS` 리스트 (10개 스텝, 제목+주제), `build_system_prompt()`가 JSON 응답 형식 지시를 포함한 캐시된 시스템 프롬프트 구성.

### Claude 클라이언트

**파일**: `backend/app/core/claude_client.py`

싱글톤 Anthropic 클라이언트 래퍼:
- `chat(system, messages, max_tokens, model)` → `(text, usage_dict)` 반환
- 기본 모델: `claude-sonnet-4-6`
- 토큰 사용량 추적 (input + output 토큰)

### 인터뷰 스킬 정의

**파일**: `backend/skills/kickoff-interview.md`

10단계 구조화 인터뷰 플로우:
- 공통 단계 (1-7): 프로젝트 유형 감지, 주요 사용자, 핵심 가치, 데이터 소스, 기술 스택, 성공 지표, 리스크
- 유형별 단계 (8-10): 유형별 심화 질문 3개
- Claude가 구조화 JSON으로 응답: `{message, insights[], step_complete, example_answers[]}`

### 인터뷰 오케스트레이터

**파일**: `backend/app/api/interview.py`

6개 엔드포인트 구현 및 테스트 완료:
- `POST /api/interview/start` — 세션 초기화, Claude로 첫 질문 전송
- `POST /api/interview/answer` — 사용자 답변 수신, Claude가 `step_complete: true` 반환 시 스텝 전진, 다음 질문 생성
- `POST /api/interview/pause` — 세션 일시정지, 상태 저장
- `POST /api/interview/resume` — 마지막 질문부터 재개
- `GET /api/interview/status/{session_id}` — 현재 스텝, 진행률, 메시지
- `GET /api/interview/session/{project_id}` — 프로젝트의 활성 세션 조회

**주요 구현 상세**:
- `_parse_ai_response()` — Claude JSON 응답 파싱 (마크다운 코드 펜스 폴백)
- `_build_steps_list()` — 현재 스텝에서 단계 상태 리스트 구성 (done/active/pending)
- 첫 응답 인사이트에서 프로젝트 유형 자동 감지 후 projects 테이블 업데이트
- 토큰 추적: input+output 토큰을 `session.token_used`에 누적

**흐름**: 사용자 아이디어 → 유형 감지 → 확인 → 기획 인터뷰 (공통 7 + 유형별 3 질문) → `/kickoff-suggest` → 설계 진행 여부 선택 → Phase 5(설계) 또는 Phase 6(평가 & 마무리)

### 인터뷰 후: `/kickoff-suggest`

**스킬 파일**: `backend/skills/kickoff-suggest.md` (하네스에서 복사)
**API 파일**: `backend/app/api/suggest.py` (신규 생성 예정)

10단계 인터뷰 완료 후 시스템이 STEP 11로 `/kickoff-suggest`를 실행:
- `harness_loader.py`의 `load_skill("kickoff-suggest")`로 스킬 로드
- 수집된 인터뷰 인사이트 전체를 입력 컨텍스트로 사용
- Claude API를 호출하여 실행 가능한 제안 생성 (기능 아이디어, 기술 접근법, 리스크 완화)
- 카테고리, 우선순위, 근거가 포함된 구조화된 제안 목록 반환
- 채팅 UI에서 사용자가 각 제안을 수락, 거부, 대안 요청 가능
- 수락된 제안은 저장되어 Phase 5 설계 및 Phase 6 평가의 추가 컨텍스트로 전달

> **현재 상태**: ✅ `load_skill("kickoff-suggest")`로 전환 완료 — 하드코딩 제거됨.

> **suggest 이후** → 설계 진행 여부 선택. 설계 선택 시 Phase 5(설계), 건너뛰기 시 Phase 6(평가 & 마무리)

### 인터뷰 스키마

**파일**: `backend/app/schemas/interview.py`

요청 모델: `InterviewStartRequest`, `InterviewAnswerRequest`, `InterviewPauseRequest`, `InterviewResumeRequest`
응답 모델: `InsightItem`, `ExampleAnswer`, `StepItem`, `MessageItem`, `InterviewResponse`, `InterviewStatusResponse`

### 세션 관리 (ADR-003)

이벤트 기반 저장 트리거:
1. 사용자 답변 전송 시 → 즉시 저장
2. 일시정지 버튼 클릭 시 → 저장
3. 브라우저 종료/이탈 시 (`beforeunload`) → 저장
4. 5분 무응답 시 → 자동 일시정지 + 저장

### 채팅 UI (3컬럼 레이아웃)

**파일**: `frontend/src/pages/InterviewPage.tsx`, `frontend/src/components/interview/LeftRail.tsx`, `frontend/src/components/interview/ChatCenter.tsx`, `frontend/src/components/interview/RightPanel.tsx`, `frontend/src/components/interview/AiMark.tsx`, `frontend/src/components/interview/types.ts`

**현황**: 목데이터로 UI 껍데기 완료. 프론트엔드 ↔ 백엔드 API 연결 미구현.

**디자인 레퍼런스**: `ui-reference/screen-interview-v3.jsx`

**왼쪽 레일** (268px 고정):
- AI 페르소나: 그라디언트 "P" 마크 + "Prequel" 이름 + 초록 상태 점
- 프로젝트 메타: 프로젝트명, 유형 태그 (AI/ML), 언어 태그 (KO)
- Phase 표시: "PHASE 1 of 3" + 미니 프로그레스 바
- 진행률 카드: 큰 스텝 카운터 (3/10), "기획 인터뷰" 라벨, 프로그레스바, 남은 시간 예상
- 세로 스테퍼: 완료 (초록 체크 + 이탤릭 답변 요약), 진행 중 (accent 맥동 + "질문 3/3"), 예정 (번호 회색 원)

**중앙** (flex):
- 상단 바 빵부스러기: "STEP 04 > 데이터 소스 > 3번째 질문" + 도움말 버튼 + 일시정지 버튼
- 이전 대화: 흐리게 처리 (opacity 0.55) + "모두 보기 (N)" 펼치기 링크
- 메시지 버블: AI (왼쪽, 흰 배경, 테두리, AI 마크 아바타) / 사용자 (오른쪽, accent 배경, 흰 글씨, 이니셜 아바타) + 타임스탬프
- 현재 질문 카드 (accent 테두리, 그림자):
  - 헤더 스트립: 주제 태그 ("데이터 출처", "측정 지표") + 중요도 ("중요도 높음")
  - AI 아바타 + 질문 텍스트 (강조 부분 accent 볼드)
  - 접이식 "예시 답변 보기" 힌트 (bullet 예시 목록)
  - 메타: 예상 답변 시간, 인사이트 추출 개수
- 퀵 액션 칩: "AI 추천받기" (primary), "건너뛰기" (outlined), "다시 질문해줘" (outlined)
- 입력 영역: 텍스트 필드 + 깜빡이는 커서, `Enter` 전송 / `Shift+Enter` 줄바꿈 힌트, 글자수 카운터 (N/500), 전송 버튼
- 통계 바: 진행 시간, 답변 수, 평균 답변 시간, 상태 표시 ("순조롭게 진행 중")

**오른쪽 패널** (284px 고정):
- "수집된 정보" 헤더 + 수집 카운트 배지 (3/8)
- 안내: "답변에 따라 자동으로 킥오프 문서가 작성됩니다"
- 수집 정보 카드: 완료 (회색 배경, 라벨+값), 신규 (초록 배경 + "NEW" 배지), 대기 (점선 테두리 + 점 애니메이션 + "답변 중")
- "문서 미리보기" 버튼
- 자동 저장 표시: "자동 저장됨 · 방금 전" + "브라우저를 닫아도 안전합니다"

---

## 설계 결정 사항

| 결정 | 선택 | 근거 |
|---|---|---|
| 프롬프트 최적화 방식 | 하이브리드 — 스킬 .md 재사용 + Python 최적화 레이어 (ADR-006) | 개발 속도와 토큰 비용 간 균형 |
| 세션 저장 전략 | 주기적이 아닌 이벤트 기반 (ADR-003) | 채팅 UI는 데이터 변경 시점이 명확 (답변 전송) |
| 유형 감지 | 프로젝트 시작 시 단일 API 호출 | 일회성 비용, 사용자가 재정의 가능 |
| 질문 수 | 공통 7 + 유형별 3 = ~10개 질문 | 깊이와 사용자 피로 간 균형 |
| Claude 응답 형식 | 구조화 JSON (`{message, insights[], step_complete, example_answers[]}`) | 안정적인 파싱, 인사이트 추출, 스텝 전진 가능 |
| Badge 컴포넌트 추출 | 공통 `<Badge>` 4가지 변형 (accent, muted, green, amber) | 3개 파일에서 5회 반복되던 인라인 배지 대체 |
| 아이콘 라이브러리 | `lucide-react` (트리셰이킹 지원) | 4개 파일의 17개 인라인 SVG 대체; 일관된 사이즈·스타일링 |
| 채팅 UI 컴포넌트 | `interview/` 디렉토리 (LeftRail, ChatCenter, RightPanel, AiMark, types) | `chat/`과 분리; 각 패널이 타입된 props의 독립 컴포넌트 |

---

## 완료 기준

- [x] 아이디어 입력 → 유형 자동 감지 후 사용자 확인 화면 표시
- [x] 전체 인터뷰 루프: 질문 → 답변 → 다음 질문 E2E 동작
- [x] 일시정지 → 브라우저 종료 → 재접속 → 마지막 질문부터 데이터 유실 없이 재개
- [x] 5분 무응답 시 자동 일시정지 트리거
- [x] 프로그레스바가 현재 스텝 / 전체 스텝을 정확히 표시
- [x] 퀵 액션 칩 ("추천해줘", "건너뛰기") 정상 동작
- [x] `/kickoff-suggest`가 `load_skill()` 사용하여 제안 생성 (하드코딩 아님)

---

## 변경 이력

| 날짜 | 내용 |
|---|---|
| 2026-05-19 | 최초 작성 |
| 2026-05-21 | 채팅 UI 항목 확장 (#12-26): 3컬럼 레이아웃, 오른쪽 인사이트 패널, 질문 카드 상세, 통계 바, 빵부스러기 — `screen-interview-v3.jsx` 갭 분석 기반 |
| 2026-05-21 | 백엔드 완료 (#1-10 ✅): harness_loader, prompt_manager (STEP 분할, CLI 제거, 압축, 캐싱), claude_client, 인터뷰 API (6개 엔드포인트), 스키마 — curl로 E2E 테스트 완료 |
| 2026-05-21 | 프론트엔드 UI 껍데기 완료 (#12-23 ✅): InterviewPage, LeftRail, ChatCenter, RightPanel, AiMark — 목데이터, 3컬럼 레이아웃 |
| 2026-05-21 | 코드 정리: Badge 컴포넌트 추출 (5회 반복 → 공통 1개), lucide-react 도입 (인라인 SVG 17개 대체) |
| 2026-05-22 | `/kickoff-suggest` 추가 (#27-28): 인터뷰 후 AI 제안 생성 + 검토 UI를 Phase 4 항목으로 추가 |
| 2026-05-22 | #11 (5분 자동 일시정지, 프론트엔드), #24 (유형 확인/수정 UI), #25 (beforeunload 저장), #26 (일시정지 프로젝트 재개) 구현. #4는 N/A (유형별 Reference 미존재) |
| 2026-05-22 | V4 Phase 전환 플로우 추가 (#29-39): 동적 스텝 시스템, kickoff-evaluate/done/gap/checklist 스킬 통합, 제안 카드, Phase 완료 모달, Gap 분기 UI. 설계 스킬 (How)은 Phase 5로 이동. "설계를 나중에" 기능은 V2로 연기 |
| 2026-05-25 | 재구조화: #27 kickoff-suggest 🔲로 변경 (하드코딩 → load_skill 전환), API 비용 기준 삭제, suggest 섹션 하네스 통합 반영 (ADR-006) |
| 2026-05-25 | Phase 참조 업데이트: 설계 = Phase 5, 평가 = Phase 6. 설계 진행 여부 선택 deliverable (#29) 추가 |
| 2026-05-26 | Phase 4 완료: #27 load_skill() 전환 확인 ✅, #29 설계 진행 여부 선택 UI 확인 ✅. 전체 29개 deliverable 완료. 과금 모델 횟수제(credits_used)로 변경. 테스트 시나리오 28/28 Pass |
