# Phase 3 — Project Management `✅ Completed`

> Implement project CRUD API, free usage quota enforcement, language locking, and My Projects page.

**Status**: ✅ Completed
**Prerequisites**: Phase 2 completion (Auth system, JWT middleware, login UI)

---

## Overview

Build the project management layer that allows users to create, list, and delete kickoff projects. Enforce the free quota limit (2 kickoffs per account), lock project language at creation time, and build the My Projects frontend page with status indicators and quota display.

---

## Deliverables

| # | Task | Area | Status | Related FR |
|---|---|---|---|---|
| 1 | Project CRUD API (create/list/delete) | Backend | ✅ | FR-013 |
| 2 | Free usage quota check (free_used <= 2) | Backend | ✅ | FR-012 |
| 3 | Language locking at project creation (ko/en) | Backend | ✅ | FR-009, ADR-004 |
| 4 | My Projects list page | Frontend | ✅ | FR-013 |
| 5 | New project creation (language select + idea input) | Frontend | ✅ | FR-013 |
| 6 | Project deletion | Frontend | ✅ | FR-013 |
| 7 | Quota exceeded blocking UI | Frontend | ✅ | FR-012 |

---

## Implementation Details

### Project CRUD API

**Files**: `backend/app/api/projects.py`, `backend/app/schemas/project.py`

- `GET /api/projects` — list user's projects (filtered by `deleted_at IS NULL`, ordered by `created_at DESC`)
- `POST /api/projects` — create new project (validates `free_used >= 2` for free plan → 403, sets language)
- `DELETE /api/projects/{id}` — soft-delete project (ownership check, sets `deleted_at`)
- All endpoints require authenticated user (JWT `get_current_user` dependency)
- RLS ensures user can only access own projects

### Free Quota Enforcement

**Logic flow**:
1. On `POST /api/projects`: check `users.free_used` value and `plan`
2. If `free_used >= 2` and `plan == 'free'`: return 403 with quota exceeded message
3. On project completion (status → `completed`): increment `free_used` (Phase 4)
4. Paid plans bypass this check (MVP-2)

### Database Migration

**File**: `supabase/migrations/005_add_project_columns.sql`

- Added `description` (TEXT, default `''`), `current_step` (INT, default 0), `total_steps` (INT, default 10) to `projects`
- Made `project_type` nullable (type is detected by AI after project creation)

### My Projects Page

**Files**: `frontend/src/pages/MyProjectsPage.tsx`, `frontend/src/hooks/useProjects.ts`

- 4 stat cards: usage quota (with progress bar), completed count, in-progress count, remaining quota warning
- Filter tabs: All / In Progress / Completed (with counts)
- Search bar for project name filtering
- Project table with name, type, status tag, language, date, context menu
- Progress bar for in-progress projects (based on `current_step / total_steps`)

### New Project Modal

**File**: `frontend/src/components/projects/NewProjectModal.tsx`

- 2-step flow: language selection (ko/en with flag cards) → name + description input
- Language note: immutable after creation (ADR-004)
- Quota exceeded state: shows blocking message with upgrade suggestion

### Delete Confirmation Modal

**File**: `frontend/src/components/projects/DeleteConfirmModal.tsx`

- Confirmation dialog with project name display
- Soft-delete note: "삭제된 프로젝트는 복구할 수 있습니다"

---

## Design Decisions

| Decision | Choice | Rationale |
|---|---|---|
| Quota increment timing | On project completion, not creation | User shouldn't lose a quota if they abandon mid-interview |
| Project deletion | Soft-delete (`deleted_at`) | Reversible, consistent with user deletion pattern |
| Language change | Blocked after creation (ADR-004) | Mid-interview translation would increase API cost and reduce quality |

---

## Completion Criteria

- [x] Create project → appears in list with correct type and language
- [x] Delete project → removed from list (soft-deleted)
- [x] Third project creation on free plan → blocked with clear message
- [x] Language field is immutable after project creation
- [x] My Projects page shows correct status tags and progress bars

---

## Change Log

| Date | Description |
|---|---|
| 2026-05-19 | Initial creation |
| 2026-05-20 | Phase 3 completed: CRUD API, quota enforcement, My Projects page, new project modal, delete modal, DB migration 005 |
| 2026-07-21 | BL-022 real Supabase concurrency verification completed. Added four opt-in integration scenarios in `backend/tests/integration/test_supabase_credit_concurrency.py`; the design-charge cases prove same-project concurrent requests charge once, cross-project requests with one remaining free credit allow only one charge, retries are idempotent, and rejected competitors leave no partial project mutation. All disposable rows were removed. The real integration run passed 4 tests; the default backend suite passed 143 tests with those 4 safely skipped. |

---
---

# Phase 3 — 프로젝트 관리 `✅ 완료`

> 프로젝트 CRUD API, 무료 횟수 제한, 언어 고정, 내 프로젝트 페이지 구현.

**상태**: ✅ 완료
**선행 조건**: Phase 2 완료 (인증 시스템, JWT 미들웨어, 로그인 UI)

---

## 개요

사용자가 킥오프 프로젝트를 생성, 조회, 삭제할 수 있는 프로젝트 관리 레이어를 구축한다. 무료 쿼터 제한(계정당 2회), 프로젝트 생성 시 언어 고정을 적용하고, 상태 표시와 쿼터 디스플레이가 포함된 내 프로젝트 프론트엔드 페이지를 구현한다.

---

## 완료 예정 / 완료 항목

| # | 작업 | 영역 | 상태 | 관련 FR |
|---|---|---|---|---|
| 1 | 프로젝트 CRUD API (생성/목록/삭제) | Backend | ✅ | FR-013 |
| 2 | 무료 횟수 체크 (free_used <= 2) | Backend | ✅ | FR-012 |
| 3 | 프로젝트 생성 시 언어 고정 (ko/en) | Backend | ✅ | FR-009, ADR-004 |
| 4 | 내 프로젝트 목록 페이지 | Frontend | ✅ | FR-013 |
| 5 | 새 프로젝트 생성 (언어 선택 + 아이디어 입력) | Frontend | ✅ | FR-013 |
| 6 | 프로젝트 삭제 | Frontend | ✅ | FR-013 |
| 7 | 무료 횟수 소진 시 차단 안내 UI | Frontend | ✅ | FR-012 |

---

## 구현 상세

### 프로젝트 CRUD API

**파일**: `backend/app/api/projects.py`, `backend/app/schemas/project.py`

- `GET /api/projects` — 사용자 프로젝트 목록 조회 (`deleted_at IS NULL` 필터, `created_at DESC` 정렬)
- `POST /api/projects` — 새 프로젝트 생성 (free 플랜 `free_used >= 2` 시 403, 언어 설정)
- `DELETE /api/projects/{id}` — 프로젝트 소프트 삭제 (소유권 확인, `deleted_at` 설정)
- 모든 엔드포인트는 인증 필요 (JWT `get_current_user` 의존성)
- RLS로 사용자 자신의 프로젝트만 접근 가능

### 무료 쿼터 적용

**로직 흐름**:
1. `POST /api/projects` 시: `users.free_used` 값과 `plan` 확인
2. `free_used >= 2`이고 `plan == 'free'`: 403 반환 + 쿼터 초과 메시지
3. 프로젝트 완료(status → `completed`) 시: `free_used` 증가 (Phase 4)
4. 유료 플랜은 이 검사를 우회 (MVP-2)

### 데이터베이스 마이그레이션

**파일**: `supabase/migrations/005_add_project_columns.sql`

- `description` (TEXT, 기본값 `''`), `current_step` (INT, 기본값 0), `total_steps` (INT, 기본값 10) 추가
- `project_type`을 nullable로 변경 (프로젝트 생성 후 AI가 유형을 감지)

### 내 프로젝트 페이지

**파일**: `frontend/src/pages/MyProjectsPage.tsx`, `frontend/src/hooks/useProjects.ts`

- 스탯 카드 4개: 사용량 쿼터 (프로그레스바 포함), 완료 수, 진행 중 수, 잔여 쿼터 경고
- 필터 탭: 전체 / 진행 중 / 완료 (카운트 표시)
- 검색바: 프로젝트 이름 필터링
- 프로젝트 테이블 (이름, 유형, 상태 태그, 언어, 날짜, 컨텍스트 메뉴)
- 진행 중 프로젝트의 프로그레스바 (`current_step / total_steps` 기반)

### 새 프로젝트 생성 모달

**파일**: `frontend/src/components/projects/NewProjectModal.tsx`

- 2단계 플로우: 언어 선택 (ko/en 국기 카드) → 이름 + 설명 입력
- 언어 고정 안내: 생성 후 변경 불가 (ADR-004)
- 쿼터 초과 상태: 업그레이드 안내와 함께 차단 메시지 표시

### 삭제 확인 모달

**파일**: `frontend/src/components/projects/DeleteConfirmModal.tsx`

- 프로젝트 이름 표시와 함께 확인 대화상자
- 소프트 삭제 안내: "삭제된 프로젝트는 복구할 수 있습니다"

---

## 설계 결정 사항

| 결정 | 선택 | 근거 |
|---|---|---|
| 쿼터 증가 시점 | 프로젝트 완료 시 (생성 시가 아님) | 인터뷰 중단 시 쿼터가 소모되면 안 됨 |
| 프로젝트 삭제 | 소프트 삭제 (`deleted_at`) | 되돌릴 수 있으며 사용자 삭제 패턴과 일관 |
| 언어 변경 | 생성 후 차단 (ADR-004) | 인터뷰 중간 번역은 API 비용 증가 + 품질 저하 |

---

## 완료 기준

- [x] 프로젝트 생성 → 목록에 올바른 유형과 언어로 표시
- [x] 프로젝트 삭제 → 목록에서 제거 (소프트 삭제)
- [x] 무료 플랜에서 3번째 프로젝트 생성 → 명확한 메시지와 함께 차단
- [x] 언어 필드가 프로젝트 생성 후 변경 불가
- [x] 내 프로젝트 페이지에 올바른 상태 태그와 프로그레스바 표시

---

## 변경 이력

| 날짜 | 내용 |
|---|---|
| 2026-05-19 | 최초 작성 |
| 2026-05-20 | Phase 3 완료: CRUD API, 쿼터 검증, 내 프로젝트 페이지, 생성 모달, 삭제 모달, DB 마이그레이션 005 |
| 2026-07-21 | BL-022 실제 Supabase 동시성 검증 완료. `backend/tests/integration/test_supabase_credit_concurrency.py`에 opt-in 통합 시나리오 4개를 추가했다. 설계 차감 검증에서 같은 프로젝트 동시 요청은 1회만 차감되고, 무료 크레딧이 1회 남은 서로 다른 프로젝트 경쟁은 하나만 성공하며, 재시도는 멱등이고 거부된 요청은 프로젝트에 부분 변경을 남기지 않음을 확인했다. 임시 행은 모두 삭제했다. 실제 통합 테스트 4개, 기본 백엔드 테스트 143개 통과(통합 4개 안전 skip). |
