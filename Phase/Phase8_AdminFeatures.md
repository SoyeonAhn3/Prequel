# Phase 8 — Admin & Supporting Features `🔲 Not Started`

> Build admin dashboard, announcements system, token usage logging, rate limiting, and structured logging.

**Status**: 🔲 Not Started
**Prerequisites**: Phase 7 completion (Document generation, result viewer)

---

## Overview

Implement administrative and operational features. Backend builds the admin API (user management, suspension/deletion), announcements CRUD, token usage logging per session, rate limiting with `slowapi`, and structured JSON logging with `structlog`. Frontend builds the admin dashboard (user management + token statistics), announcements page, and user guide page.

---

## Deliverables

| # | Task | Area | Status | Related FR |
|---|---|---|---|---|
| 1 | Admin API — user list, suspend, delete | Backend | 🔲 | FR-007 |
| 2 | Announcements CRUD API | Backend | 🔲 | FR-008 |
| 3 | Token usage logging (per-session input/output) | Backend | 🔲 | FR-014 |
| 4 | Rate limiting (`slowapi`) — auth 5/min, interview 20/min, general 60/min | Backend | 🔲 | NFR-008 |
| 5 | Structured JSON logging (`structlog`) | Backend | 🔲 | NFR-014 |
| 6 | Admin dashboard (user management + token stats) | Frontend | 🔲 | FR-007 |
| 7 | Announcements page (admin write + user read) | Frontend | 🔲 | FR-008 |
| 8 | User guide page | Frontend | 🔲 | — |

---

## Implementation Details

### Admin API

**File**: `backend/app/api/admin.py`

- `GET /api/admin/users` — paginated user list with search by email
- `PATCH /api/admin/users/{id}/suspend` — set `suspended_at`
- `PATCH /api/admin/users/{id}/unsuspend` — clear `suspended_at`
- `DELETE /api/admin/users/{id}` — soft-delete (set `deleted_at`)
- `GET /api/admin/token-usage` — aggregated token/cost statistics
- All endpoints require `admin` role check

### Announcements API

**File**: `backend/app/api/announcements.py`

- `POST /api/announcements` — create (admin only)
- `GET /api/announcements` — list (public, paginated, type filter)
- `PATCH /api/announcements/{id}` — update (admin only)
- `DELETE /api/announcements/{id}` — delete (admin only)
- `PATCH /api/announcements/{id}/pin` — toggle pinned status

### Token Usage Logging

- Integrated into interview orchestrator (Phase 4)
- Records `input_tokens`, `output_tokens`, `cost_usd` per Claude API call
- Stored in `token_usage` table linked to user, project, and session

### Rate Limiting

**File**: `backend/app/middleware/rate_limit.py`

Using `slowapi` middleware:
- Auth endpoints: 5 requests/minute
- Interview endpoints: 20 requests/minute
- General API: 60 requests/minute
- Returns 429 with `Retry-After` header on limit exceeded

### Admin Dashboard

**Files**: `frontend/src/pages/AdminPage.tsx`, `frontend/src/components/admin/`

- KPI cards: total users, active projects, today's token usage, API avg response time
- Token usage chart (7D/30D/90D toggle)
- User management table with search, plan filter, suspend/detail actions
- Recent signups sidebar

### Announcements Page

**Files**: `frontend/src/pages/AnnouncementsPage.tsx`

- Filter tabs: All / Notice / Patch Notes
- Card list with pinned item badge, type tag, version tag, date
- Admin view: inline create/edit/delete/pin actions

---

## Design Decisions

| Decision | Choice | Rationale |
|---|---|---|
| Rate limiter | `slowapi` (built on `limits`) | FastAPI native, no external dependency |
| Logging library | `structlog` with JSON output | Structured logs with request ID and user ID for debugging |
| Token tracking granularity | Per-API-call, not per-session | Enables detailed cost analysis and optimization |
| Admin access | Backend role check, not separate app | Single deployment, simpler architecture |

---

## Completion Criteria

- [ ] Admin can view user list, suspend/unsuspend, soft-delete users
- [ ] Admin can create/edit/delete/pin announcements
- [ ] Regular users can view announcements list (filtered by type)
- [ ] Token usage logged for each Claude API call with correct costs
- [ ] Rate limiting returns 429 when limits exceeded
- [ ] Admin dashboard displays KPI metrics and token chart
- [ ] User guide page renders with step cards and FAQ

---

## Change Log

| Date | Description |
|---|---|
| 2026-05-19 | Initial creation |

---
---

# Phase 8 — Admin & 부가 기능 `🔲 미시작`

> Admin 대시보드, 공지사항 시스템, 토큰 사용량 로깅, Rate Limiting, 구조화된 로깅 구현.

**상태**: 🔲 미시작
**선행 조건**: Phase 7 완료 (문서 생성, 결과 뷰어)

---

## 개요

관리 및 운영 기능을 구현한다. 백엔드는 Admin API(사용자 관리, 정지/삭제), 공지사항 CRUD, 세션별 토큰 사용량 로깅, `slowapi`를 사용한 Rate Limiting, `structlog`를 사용한 구조화된 JSON 로깅을 구축한다. 프론트엔드는 Admin 대시보드(사용자 관리 + 토큰 통계), 공지사항 페이지, 사용자 가이드 페이지를 구현한다.

---

## 완료 예정 / 완료 항목

| # | 작업 | 영역 | 상태 | 관련 FR |
|---|---|---|---|---|
| 1 | Admin API — 사용자 목록, 정지, 삭제 | Backend | 🔲 | FR-007 |
| 2 | 공지사항 CRUD API | Backend | 🔲 | FR-008 |
| 3 | 토큰 사용량 로깅 (세션별 input/output) | Backend | 🔲 | FR-014 |
| 4 | Rate Limiting (`slowapi`) — 인증 5/분, 인터뷰 20/분, 일반 60/분 | Backend | 🔲 | NFR-008 |
| 5 | 구조화된 JSON 로깅 (`structlog`) | Backend | 🔲 | NFR-014 |
| 6 | Admin 대시보드 (사용자 관리 + 토큰 통계) | Frontend | 🔲 | FR-007 |
| 7 | 공지사항 페이지 (Admin 작성 + 사용자 열람) | Frontend | 🔲 | FR-008 |
| 8 | 사용자 가이드 페이지 | Frontend | 🔲 | — |

---

## 구현 상세

### Admin API

**파일**: `backend/app/api/admin.py`

- `GET /api/admin/users` — 페이지네이션된 사용자 목록 + 이메일 검색
- `PATCH /api/admin/users/{id}/suspend` — `suspended_at` 설정
- `PATCH /api/admin/users/{id}/unsuspend` — `suspended_at` 해제
- `DELETE /api/admin/users/{id}` — 소프트 삭제 (`deleted_at` 설정)
- `GET /api/admin/token-usage` — 집계된 토큰/비용 통계
- 모든 엔드포인트는 `admin` 역할 검사 필요

### 공지사항 API

**파일**: `backend/app/api/announcements.py`

- `POST /api/announcements` — 생성 (Admin 전용)
- `GET /api/announcements` — 목록 (공개, 페이지네이션, 유형 필터)
- `PATCH /api/announcements/{id}` — 수정 (Admin 전용)
- `DELETE /api/announcements/{id}` — 삭제 (Admin 전용)
- `PATCH /api/announcements/{id}/pin` — 상단 고정 토글

### 토큰 사용량 로깅

- 인터뷰 오케스트레이터(Phase 4)에 통합
- Claude API 호출당 `input_tokens`, `output_tokens`, `cost_usd` 기록
- `token_usage` 테이블에 사용자, 프로젝트, 세션과 연결하여 저장

### Rate Limiting

**파일**: `backend/app/middleware/rate_limit.py`

`slowapi` 미들웨어 사용:
- 인증 엔드포인트: 5회/분
- 인터뷰 엔드포인트: 20회/분
- 일반 API: 60회/분
- 한도 초과 시 `Retry-After` 헤더와 함께 429 반환

### Admin 대시보드

**파일**: `frontend/src/pages/AdminPage.tsx`, `frontend/src/components/admin/`

- KPI 카드: 총 사용자, 활성 프로젝트, 오늘 토큰 사용량, API 평균 응답 시간
- 토큰 사용량 차트 (7D/30D/90D 토글)
- 사용자 관리 테이블 (검색, 플랜 필터, 정지/상세 액션)
- 최근 가입 사이드바

### 공지사항 페이지

**파일**: `frontend/src/pages/AnnouncementsPage.tsx`

- 필터 탭: 전체 / 공지 / 패치내역
- 카드 목록 (고정 뱃지, 유형 태그, 버전 태그, 날짜)
- Admin 뷰: 인라인 생성/수정/삭제/고정 액션

---

## 설계 결정 사항

| 결정 | 선택 | 근거 |
|---|---|---|
| Rate Limiter | `slowapi` (`limits` 기반) | FastAPI 네이티브, 외부 의존성 없음 |
| 로깅 라이브러리 | `structlog` JSON 출력 | 요청 ID, 사용자 ID 포함 구조화된 로그로 디버깅 용이 |
| 토큰 추적 단위 | 세션별이 아닌 API 호출별 | 상세 비용 분석 및 최적화 가능 |
| Admin 접근 | 별도 앱이 아닌 백엔드 역할 체크 | 단일 배포, 단순한 아키텍처 |

---

## 완료 기준

- [ ] Admin이 사용자 목록 조회, 정지/해제, 소프트 삭제 가능
- [ ] Admin이 공지사항 생성/수정/삭제/고정 가능
- [ ] 일반 사용자가 공지사항 목록 열람 가능 (유형별 필터)
- [ ] 각 Claude API 호출에 대해 토큰 사용량이 올바른 비용과 함께 기록
- [ ] Rate Limiting이 한도 초과 시 429 반환
- [ ] Admin 대시보드에 KPI 메트릭과 토큰 차트 표시
- [ ] 사용자 가이드 페이지에 단계 카드와 FAQ 렌더링

---

## 변경 이력

| 날짜 | 내용 |
|---|---|
| 2026-05-19 | 최초 작성 |
