# Phase 3 — Project Management `🔲 Not Started`

> Implement project CRUD API, free usage quota enforcement, language locking, and My Projects page.

**Status**: 🔲 Not Started
**Prerequisites**: Phase 2 completion (Auth system, JWT middleware, login UI)

---

## Overview

Build the project management layer that allows users to create, list, and delete kickoff projects. Enforce the free quota limit (2 kickoffs per account), lock project language at creation time, and build the My Projects frontend page with status indicators and quota display.

---

## Deliverables

| # | Task | Area | Status | Related FR |
|---|---|---|---|---|
| 1 | Project CRUD API (create/list/delete) | Backend | 🔲 | FR-013 |
| 2 | Free usage quota check (free_used <= 2) | Backend | 🔲 | FR-012 |
| 3 | Language locking at project creation (ko/en) | Backend | 🔲 | FR-009, ADR-004 |
| 4 | My Projects list page | Frontend | 🔲 | FR-013 |
| 5 | New project creation (language select + idea input) | Frontend | 🔲 | FR-013 |
| 6 | Project deletion | Frontend | 🔲 | FR-013 |
| 7 | Quota exceeded blocking UI | Frontend | 🔲 | FR-012 |

---

## Implementation Details

### Project CRUD API

**Files**: `backend/app/api/projects.py`, `backend/app/schemas/project.py`

- `POST /api/projects` — create new project (validates free_used, sets language)
- `GET /api/projects` — list user's projects (filtered by `deleted_at IS NULL`)
- `DELETE /api/projects/{id}` — soft-delete project (set `deleted_at`)
- All endpoints require authenticated user (JWT middleware)
- RLS ensures user can only access own projects

### Free Quota Enforcement

**Logic flow**:
1. On `POST /api/projects`: check `users.free_used` value
2. If `free_used >= 2` and `plan == 'free'`: return 403 with quota exceeded message
3. On project completion (status → `completed`): increment `free_used`
4. Paid plans bypass this check (MVP-2)

### My Projects Page

**Files**: `frontend/src/pages/ProjectsPage.tsx`

- Dashboard cards: usage quota, completed count, in-progress count
- Filter tabs: All / In Progress / Completed
- Project table with name, type, status tag, language, date
- Progress bar for in-progress projects
- "New Project" button → language selection modal → idea input

---

## Design Decisions

| Decision | Choice | Rationale |
|---|---|---|
| Quota increment timing | On project completion, not creation | User shouldn't lose a quota if they abandon mid-interview |
| Project deletion | Soft-delete (`deleted_at`) | Reversible, consistent with user deletion pattern |
| Language change | Blocked after creation (ADR-004) | Mid-interview translation would increase API cost and reduce quality |

---

## Completion Criteria

- [ ] Create project → appears in list with correct type and language
- [ ] Delete project → removed from list (soft-deleted)
- [ ] Third project creation on free plan → blocked with clear message
- [ ] Language field is immutable after project creation
- [ ] My Projects page shows correct status tags and progress bars

---

## Change Log

| Date | Description |
|---|---|
| 2026-05-19 | Initial creation |

---
---

# Phase 3 — 프로젝트 관리 `🔲 미시작`

> 프로젝트 CRUD API, 무료 횟수 제한, 언어 고정, 내 프로젝트 페이지 구현.

**상태**: 🔲 미시작
**선행 조건**: Phase 2 완료 (인증 시스템, JWT 미들웨어, 로그인 UI)

---

## 개요

사용자가 킥오프 프로젝트를 생성, 조회, 삭제할 수 있는 프로젝트 관리 레이어를 구축한다. 무료 쿼터 제한(계정당 2회), 프로젝트 생성 시 언어 고정을 적용하고, 상태 표시와 쿼터 디스플레이가 포함된 내 프로젝트 프론트엔드 페이지를 구현한다.

---

## 완료 예정 / 완료 항목

| # | 작업 | 영역 | 상태 | 관련 FR |
|---|---|---|---|---|
| 1 | 프로젝트 CRUD API (생성/목록/삭제) | Backend | 🔲 | FR-013 |
| 2 | 무료 횟수 체크 (free_used <= 2) | Backend | 🔲 | FR-012 |
| 3 | 프로젝트 생성 시 언어 고정 (ko/en) | Backend | 🔲 | FR-009, ADR-004 |
| 4 | 내 프로젝트 목록 페이지 | Frontend | 🔲 | FR-013 |
| 5 | 새 프로젝트 생성 (언어 선택 + 아이디어 입력) | Frontend | 🔲 | FR-013 |
| 6 | 프로젝트 삭제 | Frontend | 🔲 | FR-013 |
| 7 | 무료 횟수 소진 시 차단 안내 UI | Frontend | 🔲 | FR-012 |

---

## 구현 상세

### 프로젝트 CRUD API

**파일**: `backend/app/api/projects.py`, `backend/app/schemas/project.py`

- `POST /api/projects` — 새 프로젝트 생성 (free_used 검증, 언어 설정)
- `GET /api/projects` — 사용자 프로젝트 목록 조회 (`deleted_at IS NULL` 필터)
- `DELETE /api/projects/{id}` — 프로젝트 소프트 삭제 (`deleted_at` 설정)
- 모든 엔드포인트는 인증 필요 (JWT 미들웨어)
- RLS로 사용자 자신의 프로젝트만 접근 가능

### 무료 쿼터 적용

**로직 흐름**:
1. `POST /api/projects` 시: `users.free_used` 값 확인
2. `free_used >= 2`이고 `plan == 'free'`: 403 반환 + 쿼터 초과 메시지
3. 프로젝트 완료(status → `completed`) 시: `free_used` 증가
4. 유료 플랜은 이 검사를 우회 (MVP-2)

### 내 프로젝트 페이지

**파일**: `frontend/src/pages/ProjectsPage.tsx`

- 대시보드 카드: 사용량 쿼터, 완료 수, 진행 중 수
- 필터 탭: 전체 / 진행 중 / 완료
- 프로젝트 테이블 (이름, 유형, 상태 태그, 언어, 날짜)
- 진행 중 프로젝트의 프로그레스바
- "새 프로젝트" 버튼 → 언어 선택 모달 → 아이디어 입력

---

## 설계 결정 사항

| 결정 | 선택 | 근거 |
|---|---|---|
| 쿼터 증가 시점 | 프로젝트 완료 시 (생성 시가 아님) | 인터뷰 중단 시 쿼터가 소모되면 안 됨 |
| 프로젝트 삭제 | 소프트 삭제 (`deleted_at`) | 되돌릴 수 있으며 사용자 삭제 패턴과 일관 |
| 언어 변경 | 생성 후 차단 (ADR-004) | 인터뷰 중간 번역은 API 비용 증가 + 품질 저하 |

---

## 완료 기준

- [ ] 프로젝트 생성 → 목록에 올바른 유형과 언어로 표시
- [ ] 프로젝트 삭제 → 목록에서 제거 (소프트 삭제)
- [ ] 무료 플랜에서 3번째 프로젝트 생성 → 명확한 메시지와 함께 차단
- [ ] 언어 필드가 프로젝트 생성 후 변경 불가
- [ ] 내 프로젝트 페이지에 올바른 상태 태그와 프로그레스바 표시

---

## 변경 이력

| 날짜 | 내용 |
|---|---|
| 2026-05-19 | 최초 작성 |
