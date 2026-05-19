# Phase 4 — AI Interview Pipeline `🔲 Not Started`

> Build the core AI interview system: prompt manager, interview orchestrator, session management, and chat UI.

**Status**: 🔲 Not Started
**Prerequisites**: Phase 3 completion (Project CRUD, quota enforcement)

---

## Overview

This is the most critical phase of the entire project. It implements the heart of Prequel — the AI-powered structured interview pipeline. Backend builds the harness file loader, `prompt_manager.py` with 4 token optimizations + Prompt Caching, project type auto-detection, the interview orchestrator (start → question → answer → next question loop), and session management with event-based saving and pause/resume. Frontend builds the chat UI, type detection confirmation, progress bar, and session save/resume functionality.

---

## Deliverables

| # | Task | Area | Status | Related FR |
|---|---|---|---|---|
| 1 | Harness file loader (skill .md + Reference reading) | Backend | 🔲 | FR-020 |
| 2 | `prompt_manager.py` — STEP splitting | Backend | 🔲 | FR-020 |
| 3 | `prompt_manager.py` — CLI section removal | Backend | 🔲 | FR-020 |
| 4 | `prompt_manager.py` — Reference type-based filtering | Backend | 🔲 | FR-020 |
| 5 | `prompt_manager.py` — Conversation history compression | Backend | 🔲 | FR-020 |
| 6 | `prompt_manager.py` — Anthropic Prompt Caching | Backend | 🔲 | FR-020 |
| 7 | Project type auto-detection API | Backend | 🔲 | FR-002 |
| 8 | Interview orchestrator (start → question → answer loop) | Backend | 🔲 | FR-001 |
| 9 | Session management — event-based saving | Backend | 🔲 | FR-011, ADR-003 |
| 10 | Session pause/resume API | Backend | 🔲 | FR-011 |
| 11 | 5-minute inactivity auto-pause logic | Backend | 🔲 | FR-011 |
| 12 | Chat UI component (message list + input + send) | Frontend | 🔲 | FR-001 |
| 13 | Project type detection result confirm/edit UI | Frontend | 🔲 | FR-002 |
| 14 | Progress bar (current step indicator) | Frontend | 🔲 | FR-010 |
| 15 | Pause button + `beforeunload` session save | Frontend | 🔲 | FR-011 |
| 16 | Resume from project list ("In Progress" → resume) | Frontend | 🔲 | FR-011 |

---

## Implementation Details

### Harness File Loader

**Files**: `backend/app/core/harness_loader.py`

- Reads skill `.md` files from `backend/skills/`
- Reads reference files from `backend/references/`
- Provides raw text content to `prompt_manager.py`

### Prompt Manager

**File**: `backend/app/core/prompt_manager.py` (~60 lines)

Four optimization functions + Prompt Caching:

1. **STEP splitting** — extracts only the current interview step from skill `.md`, reducing token count by sending only relevant instructions
2. **CLI removal** — strips CLI-specific directives (e.g., "run this command", terminal instructions) from prompts
3. **Reference filtering** — includes only reference files relevant to the detected project type (e.g., Web App references for web projects)
4. **Conversation compression** — summarizes older conversation turns to reduce accumulated token usage
5. **Prompt Caching** — applies `cache_control: ephemeral` to repeated prompt blocks for 90% cost reduction on cache hits

**Fallback**: if optimization fails, send full original prompt (higher cost but guaranteed functionality)

### Interview Orchestrator

**File**: `backend/app/api/interview.py`

- `POST /api/interview/start` — initialize session, detect project type
- `POST /api/interview/answer` — receive user answer, save session, generate next question
- `POST /api/interview/pause` — pause session, save state
- `POST /api/interview/resume` — resume from last question
- `GET /api/interview/status` — current step, progress percentage

**Flow**: User idea → type detection → confirmation → planning interview (common 7 + type-specific 3 questions) → optional design interview → completion

### Session Management (ADR-003)

Event-based saving triggers:
1. On user answer submission → immediate save
2. On pause button click → save
3. On browser close/navigation (`beforeunload`) → save
4. On 5-minute inactivity → auto-pause + save

### Chat UI

**Files**: `frontend/src/components/chat/ChatUI.tsx`, `frontend/src/hooks/useInterview.ts`

- Message list with AI/user bubble styling
- Quick action chips: "recommend", "skip", "re-ask"
- Input area with Enter to send, Shift+Enter for newline
- Left rail: project info, progress bar, step list (done/active/pending)
- Auto-save indicator

---

## Design Decisions

| Decision | Choice | Rationale |
|---|---|---|
| Prompt optimization approach | Hybrid — reuse skill .md + Python optimization layer (ADR-006) | Balance between development speed and token cost |
| Session save strategy | Event-based, not periodic (ADR-003) | Chat UI has clear data change points (answer submission) |
| Type detection | Single API call at project start | One-time cost, user can override |
| Question count | Common 7 + type-specific 3 = ~10 questions | Balances depth and user fatigue |

---

## Completion Criteria

- [ ] Idea input → type auto-detected and displayed for user confirmation
- [ ] Full interview loop: question → answer → next question works E2E
- [ ] Pause → browser close → reopen → resume from last question with no data loss
- [ ] 5-minute inactivity triggers auto-pause
- [ ] Progress bar accurately shows current step / total steps
- [ ] Quick action chips ("recommend", "skip") function correctly
- [ ] API cost per kickoff ≤ $1 (prompt optimization effective)

---

## Change Log

| Date | Description |
|---|---|
| 2026-05-19 | Initial creation |

---
---

# Phase 4 — AI 인터뷰 파이프라인 `🔲 미시작`

> 핵심 AI 인터뷰 시스템 구축: 프롬프트 매니저, 인터뷰 오케스트레이터, 세션 관리, 채팅 UI.

**상태**: 🔲 미시작
**선행 조건**: Phase 3 완료 (프로젝트 CRUD, 쿼터 적용)

---

## 개요

전체 프로젝트에서 가장 중요한 Phase이다. Prequel의 핵심인 AI 기반 구조화 인터뷰 파이프라인을 구현한다. 백엔드는 하네스 파일 로더, 4가지 토큰 최적화 + Prompt Caching이 적용된 `prompt_manager.py`, 프로젝트 유형 자동 감지, 인터뷰 오케스트레이터(시작 → 질문 → 답변 → 다음 질문 루프), 이벤트 기반 저장과 일시정지/재개를 포함한 세션 관리를 구축한다. 프론트엔드는 채팅 UI, 유형 감지 확인, 프로그레스바, 세션 저장/재개 기능을 구현한다.

---

## 완료 예정 / 완료 항목

| # | 작업 | 영역 | 상태 | 관련 FR |
|---|---|---|---|---|
| 1 | 하네스 파일 로더 (스킬 .md + Reference 읽기) | Backend | 🔲 | FR-020 |
| 2 | `prompt_manager.py` — STEP 분할 로딩 | Backend | 🔲 | FR-020 |
| 3 | `prompt_manager.py` — CLI 전용 섹션 제거 | Backend | 🔲 | FR-020 |
| 4 | `prompt_manager.py` — Reference 유형별 필터링 | Backend | 🔲 | FR-020 |
| 5 | `prompt_manager.py` — 대화 이력 압축 | Backend | 🔲 | FR-020 |
| 6 | `prompt_manager.py` — Anthropic Prompt Caching 적용 | Backend | 🔲 | FR-020 |
| 7 | 프로젝트 유형 자동 감지 API | Backend | 🔲 | FR-002 |
| 8 | 인터뷰 오케스트레이터 (시작 → 질문 → 답변 루프) | Backend | 🔲 | FR-001 |
| 9 | 세션 관리 — 이벤트 기반 저장 | Backend | 🔲 | FR-011, ADR-003 |
| 10 | 세션 일시정지/재개 API | Backend | 🔲 | FR-011 |
| 11 | 5분 무응답 자동 일시정지 로직 | Backend | 🔲 | FR-011 |
| 12 | 채팅 UI 컴포넌트 (메시지 목록 + 입력 + 전송) | Frontend | 🔲 | FR-001 |
| 13 | 프로젝트 유형 감지 결과 확인/수정 UI | Frontend | 🔲 | FR-002 |
| 14 | 프로그레스바 (현재 단계 표시) | Frontend | 🔲 | FR-010 |
| 15 | 일시정지 버튼 + `beforeunload` 세션 저장 | Frontend | 🔲 | FR-011 |
| 16 | 이어하기 (프로젝트 목록에서 "진행 중" → 재개) | Frontend | 🔲 | FR-011 |

---

## 구현 상세

### 하네스 파일 로더

**파일**: `backend/app/core/harness_loader.py`

- `backend/skills/`에서 스킬 `.md` 파일 읽기
- `backend/references/`에서 Reference 파일 읽기
- `prompt_manager.py`에 원본 텍스트 콘텐츠 제공

### 프롬프트 매니저

**파일**: `backend/app/core/prompt_manager.py` (~60줄)

4가지 최적화 함수 + Prompt Caching:

1. **STEP 분할** — 스킬 `.md`에서 현재 인터뷰 단계만 추출, 관련 지시만 전송하여 토큰 수 절감
2. **CLI 제거** — 프롬프트에서 CLI 전용 지시문(예: "이 명령 실행", 터미널 지시) 제거
3. **Reference 필터링** — 감지된 프로젝트 유형에 관련된 Reference 파일만 포함 (예: 웹 프로젝트엔 Web App Reference만)
4. **대화 압축** — 오래된 대화 턴을 요약하여 누적 토큰 사용량 절감
5. **Prompt Caching** — 반복 프롬프트 블록에 `cache_control: ephemeral` 적용, 캐시 히트 시 90% 비용 절감

**폴백**: 최적화 실패 시 원본 전체 전송 (비용 증가하나 기능 보장)

### 인터뷰 오케스트레이터

**파일**: `backend/app/api/interview.py`

- `POST /api/interview/start` — 세션 초기화, 프로젝트 유형 감지
- `POST /api/interview/answer` — 사용자 답변 수신, 세션 저장, 다음 질문 생성
- `POST /api/interview/pause` — 세션 일시정지, 상태 저장
- `POST /api/interview/resume` — 마지막 질문부터 재개
- `GET /api/interview/status` — 현재 스텝, 진행률

**흐름**: 사용자 아이디어 → 유형 감지 → 확인 → 기획 인터뷰 (공통 7 + 유형별 3 질문) → 설계 인터뷰(선택) → 완료

### 세션 관리 (ADR-003)

이벤트 기반 저장 트리거:
1. 사용자 답변 전송 시 → 즉시 저장
2. 일시정지 버튼 클릭 시 → 저장
3. 브라우저 종료/이탈 시 (`beforeunload`) → 저장
4. 5분 무응답 시 → 자동 일시정지 + 저장

### 채팅 UI

**파일**: `frontend/src/components/chat/ChatUI.tsx`, `frontend/src/hooks/useInterview.ts`

- AI/사용자 버블 스타일링이 적용된 메시지 목록
- 퀵 액션 칩: "추천해줘", "건너뛰기", "다시 질문"
- 입력 영역: Enter로 전송, Shift+Enter로 줄바꿈
- 왼쪽 레일: 프로젝트 정보, 프로그레스바, 스텝 목록 (done/active/pending)
- 자동 저장 표시

---

## 설계 결정 사항

| 결정 | 선택 | 근거 |
|---|---|---|
| 프롬프트 최적화 방식 | 하이브리드 — 스킬 .md 재사용 + Python 최적화 레이어 (ADR-006) | 개발 속도와 토큰 비용 간 균형 |
| 세션 저장 전략 | 주기적이 아닌 이벤트 기반 (ADR-003) | 채팅 UI는 데이터 변경 시점이 명확 (답변 전송) |
| 유형 감지 | 프로젝트 시작 시 단일 API 호출 | 일회성 비용, 사용자가 재정의 가능 |
| 질문 수 | 공통 7 + 유형별 3 = ~10개 질문 | 깊이와 사용자 피로 간 균형 |

---

## 완료 기준

- [ ] 아이디어 입력 → 유형 자동 감지 후 사용자 확인 화면 표시
- [ ] 전체 인터뷰 루프: 질문 → 답변 → 다음 질문 E2E 동작
- [ ] 일시정지 → 브라우저 종료 → 재접속 → 마지막 질문부터 데이터 유실 없이 재개
- [ ] 5분 무응답 시 자동 일시정지 트리거
- [ ] 프로그레스바가 현재 스텝 / 전체 스텝을 정확히 표시
- [ ] 퀵 액션 칩 ("추천해줘", "건너뛰기") 정상 동작
- [ ] 킥오프 1회당 API 비용 ≤ $1 (프롬프트 최적화 유효)

---

## 변경 이력

| 날짜 | 내용 |
|---|---|
| 2026-05-19 | 최초 작성 |
