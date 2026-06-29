# Phase 8 — Admin & Supporting Features `✅ Completed`

> Build admin dashboard, announcements system, token usage logging, rate limiting, and structured logging.

**Status**: ✅ Completed (2026-06-29)
**Prerequisites**: Phase 7 completion (Document generation, result viewer)

---

## Overview

Implement administrative and operational features. Backend builds the admin API (user management, suspension/deletion), announcements CRUD, token usage logging per session, rate limiting with `slowapi`, and structured JSON logging with `structlog`. Frontend builds the admin dashboard (user management + token statistics), announcements page, and user guide page.

---

## Deliverables

| # | Task | Area | Status | Related FR |
|---|---|---|---|---|
| 1 | Admin API — user list, suspend/unsuspend, soft-delete/restore | Backend | ✅ | FR-007 |
| 2 | Announcements CRUD API | Backend | ✅ | FR-008 |
| 3 | Token usage logging (per-call, incl. cache; cost not calculated) | Backend | ✅ | FR-014 |
| 4 | Rate limiting (`slowapi`) — interview 20/min, general 60/min (auth tier dropped) | Backend | ✅ | NFR-008 |
| 5 | Structured JSON logging (`structlog`) | Backend | ✅ | NFR-014 |
| 6 | Admin dashboard (user mgmt + token chart + activity log) | Frontend | ✅ | FR-007 |
| 7 | Announcements page (admin write + user read) | Frontend | ✅ | FR-008 |
| 8 | User guide page | Frontend | ✅ | — |

---

## Implementation Details

### Admin API

**File**: `backend/app/api/admin.py`

- `GET /api/admin/stats` — KPI aggregates (total users, new 7d, active/completed projects, total tokens incl. cache)
- `GET /api/admin/users` — paginated user list with email search
- `POST /api/admin/users/{id}/suspend` · `/unsuspend` — set/clear `suspended_at`
- `POST /api/admin/users/{id}/delete` · `/restore` — soft-delete / restore (`deleted_at`)
- `GET /api/admin/logs` — recent admin activity log
- `GET /api/admin/token-usage?days=14|30` — daily token usage timeseries (input/output/cache_read/cache_creation + cache-read %)
- All endpoints require `admin` role (`require_admin`)

### Announcements API

**File**: `backend/app/api/announcements.py`

- `POST /api/announcements` — create (admin)
- `GET /api/announcements` — list (login required, type filter, pinned-first sort)
- `PATCH /api/announcements/{id}` — update (admin; pin toggled here — no separate `/pin`)
- `DELETE /api/announcements/{id}` — delete (admin)

### Token Usage Logging

**File**: `backend/app/core/usage.py`

- `record_token_usage` wired into all Claude calls (interview / design / finalize / projects)
- Records `input_tokens`, `output_tokens`, `cache_read`, `cache_creation` per call
- **Cost not calculated** (decision: accurate token counts only — no `cost_usd`)
- Stored in `token_usage` (interview also sets `session_id`)

### Activity Logging (admin actions)

**File**: `backend/app/core/activity.py` (migration `009` adds `activity_logs`)

- `record_activity` on user suspend/unsuspend/delete/restore + announcement create/update/delete
- ⚠️ Under `DEV_BYPASS_AUTH` the actor is always `dev@localhost` (intended — see BACKLOG BL-004)

### Rate Limiting

**File**: `backend/app/core/ratelimit.py`

Using `slowapi` (IP-based, `get_remote_address`):
- General API: 60 requests/minute (global default via `SlowAPIMiddleware`)
- Interview start/answer: 20 requests/minute (`@limiter.limit`)
- Auth tier dropped — no backend login endpoint (Supabase handles auth on the frontend)
- Returns 429 `{"error": "Rate limit exceeded: ..."}`; `SlowAPIMiddleware` added before CORS so 429 carries CORS headers

### Structured Logging

**File**: `backend/app/main.py`

- `structlog` JSON renderer configured at startup

### Admin Dashboard

**Files**: `frontend/src/pages/AdminPage.tsx`, `frontend/src/lib/admin.ts`

- KPI cards: total users, active projects, completed projects, total tokens (incl. cache)
- Token usage chart (S4): hand-rolled CSS stacked bars, 14D/30D toggle, cache-read % indicator (flags BL-003)
- User management table (search, suspend/unsuspend/delete/restore)
- Recent signups + activity log panels
- Single-page dashboard (sidebar multi-page mockup deferred)

### Announcements Page

**Files**: `frontend/src/pages/NoticesPage.tsx` (route `/notices`), `frontend/src/components/notices/AnnouncementModal.tsx`

- Filter tabs: All / Notice / Patch Notes + search + client-side pagination
- Card list with pinned-first sort, type tag, version (patches only), date
- Admin controls (role `admin` + admin-mode toggle): create / edit / delete via modal

### User Guide Page

**File**: `frontend/src/pages/GuidePage.tsx` (route `/guide`)

- Static 5-step usage guide + tips; also fixed the previously-broken `/guide` nav link

---

## Design Decisions

| Decision | Choice | Rationale |
|---|---|---|
| Rate limiter | `slowapi` (built on `limits`) | FastAPI native, no external dependency |
| Rate-limit key | IP-based (`get_remote_address`) | Works regardless of dev-bypass; per-user keying deferred |
| Logging library | `structlog` with JSON output | Structured logs for debugging |
| Token tracking granularity | Per-API-call (incl. cache tokens) | Detailed analysis; cache tokens captured separately |
| Token cost | Not calculated — counts only | Cache tokens make exact cost tricky; counts suffice for now |
| Activity-log actor in dev | Always `dev@localhost` under `DEV_BYPASS_AUTH` | Intended; real attribution verified at deploy (BL-004) |
| Admin access | Backend role check, not separate app | Single deployment, simpler architecture |

> **Known follow-ups** (see `BACKLOG.md`): BL-003 prompt-caching inefficiency (interview re-sends volatile content inside the cached prefix → low cache-read %), BL-004 dev-bypass activity-log attribution (verify at deploy).

---

## Completion Criteria

- [x] Admin can view user list, suspend/unsuspend, soft-delete/restore users
- [x] Admin can create/edit/delete/pin announcements
- [x] Regular users can view announcements list (filtered by type)
- [x] Token usage logged per Claude API call (counts incl. cache; cost not calculated by decision)
- [x] Rate limiting returns 429 when limits exceeded
- [x] Admin dashboard displays KPI metrics + token chart
- [x] User guide page renders with step cards and tips

---

## Change Log

| Date | Description |
|---|---|
| 2026-05-19 | Initial creation |
| 2026-06-29 | Phase 8 completed (S1–S8). Rate limiting IP-based, auth tier dropped. Token logging records counts incl. cache (no cost). Announcements page = `NoticesPage` (`/notices`). Admin dashboard gained token chart (S4) + activity log. Follow-ups: BL-003, BL-004. |

---
---

# Phase 8 — Admin & 부가 기능 `✅ 완료`

> Admin 대시보드, 공지사항 시스템, 토큰 사용량 로깅, Rate Limiting, 구조화된 로깅 구현.

**상태**: ✅ 완료 (2026-06-29)
**선행 조건**: Phase 7 완료 (문서 생성, 결과 뷰어)

---

## 개요

관리 및 운영 기능을 구현한다. 백엔드는 Admin API(사용자 관리, 정지/삭제), 공지사항 CRUD, 세션별 토큰 사용량 로깅, `slowapi`를 사용한 Rate Limiting, `structlog`를 사용한 구조화된 JSON 로깅을 구축한다. 프론트엔드는 Admin 대시보드(사용자 관리 + 토큰 통계), 공지사항 페이지, 사용자 가이드 페이지를 구현한다.

---

## 완료 예정 / 완료 항목

| # | 작업 | 영역 | 상태 | 관련 FR |
|---|---|---|---|---|
| 1 | Admin API — 사용자 목록, 정지/해제, 소프트삭제/복원 | Backend | ✅ | FR-007 |
| 2 | 공지사항 CRUD API | Backend | ✅ | FR-008 |
| 3 | 토큰 사용량 로깅 (호출별, 캐시 포함; 비용 계산 안 함) | Backend | ✅ | FR-014 |
| 4 | Rate Limiting (`slowapi`) — 인터뷰 20/분, 일반 60/분 (인증 티어 드롭) | Backend | ✅ | NFR-008 |
| 5 | 구조화된 JSON 로깅 (`structlog`) | Backend | ✅ | NFR-014 |
| 6 | Admin 대시보드 (사용자 관리 + 토큰 차트 + 활동 로그) | Frontend | ✅ | FR-007 |
| 7 | 공지사항 페이지 (Admin 작성 + 사용자 열람) | Frontend | ✅ | FR-008 |
| 8 | 사용자 가이드 페이지 | Frontend | ✅ | — |

---

## 구현 상세

### Admin API

**파일**: `backend/app/api/admin.py`

- `GET /api/admin/stats` — KPI 집계 (총 사용자, 최근 7일 신규, 활성/완료 프로젝트, 총 토큰(캐시 포함))
- `GET /api/admin/users` — 페이지네이션된 사용자 목록 + 이메일 검색
- `POST /api/admin/users/{id}/suspend` · `/unsuspend` — `suspended_at` 설정/해제
- `POST /api/admin/users/{id}/delete` · `/restore` — 소프트 삭제 / 복원 (`deleted_at`)
- `GET /api/admin/logs` — 최근 관리자 활동 로그
- `GET /api/admin/token-usage?days=14|30` — 일별 토큰 사용량 시계열 (input/output/cache_read/cache_creation + 캐시읽기 %)
- 모든 엔드포인트는 `admin` 역할 검사 필요 (`require_admin`)

### 공지사항 API

**파일**: `backend/app/api/announcements.py`

- `POST /api/announcements` — 생성 (Admin 전용)
- `GET /api/announcements` — 목록 (로그인 필요, 유형 필터, 고정 우선 정렬)
- `PATCH /api/announcements/{id}` — 수정 (Admin; 고정 토글도 여기서 — 별도 `/pin` 없음)
- `DELETE /api/announcements/{id}` — 삭제 (Admin)

### 토큰 사용량 로깅

**파일**: `backend/app/core/usage.py`

- 모든 Claude 호출(인터뷰/설계/마무리/프로젝트)에 `record_token_usage` 배선
- 호출당 `input_tokens`, `output_tokens`, `cache_read`, `cache_creation` 기록
- **비용 계산 안 함** (결정: 정확한 토큰량만 — `cost_usd` 없음)
- `token_usage` 테이블에 저장 (인터뷰는 `session_id`도 채움)

### 활동 로깅 (관리자 행동)

**파일**: `backend/app/core/activity.py` (마이그레이션 `009`로 `activity_logs` 추가)

- 사용자 정지/해제/삭제/복원 + 공지 생성/수정/삭제 시 `record_activity`
- ⚠️ `DEV_BYPASS_AUTH` 켜진 동안 행위자는 항상 `dev@localhost` (의도된 동작 — BACKLOG BL-004 참고)

### Rate Limiting

**파일**: `backend/app/core/ratelimit.py`

`slowapi` 사용 (IP 기준, `get_remote_address`):
- 일반 API: 60회/분 (`SlowAPIMiddleware` 전역 기본)
- 인터뷰 start/answer: 20회/분 (`@limiter.limit`)
- 인증 티어 드롭 — 백엔드 로그인 엔드포인트 없음 (인증은 프론트의 Supabase 처리)
- 429 `{"error": "Rate limit exceeded: ..."}` 반환; `SlowAPIMiddleware`를 CORS보다 먼저 추가해 429에도 CORS 헤더 부착

### 구조화된 로깅

**파일**: `backend/app/main.py`

- 시작 시 `structlog` JSON 렌더러 설정

### Admin 대시보드

**파일**: `frontend/src/pages/AdminPage.tsx`, `frontend/src/lib/admin.ts`

- KPI 카드: 총 사용자, 활성 프로젝트, 완료 프로젝트, 총 토큰(캐시 포함)
- 토큰 사용량 차트 (S4): 직접 구현 CSS 누적 막대, 14D/30D 토글, 캐시읽기 % 표시(BL-003 적신호)
- 사용자 관리 테이블 (검색, 정지/해제/삭제/복원)
- 최근 가입 + 활동 로그 패널
- 단일 페이지 대시보드 (시안의 사이드바 멀티페이지는 보류)

### 공지사항 페이지

**파일**: `frontend/src/pages/NoticesPage.tsx` (라우트 `/notices`), `frontend/src/components/notices/AnnouncementModal.tsx`

- 필터 탭: 전체 / 공지 / 패치내역 + 검색 + 클라이언트 페이지네이션
- 카드 목록 (고정 우선 정렬, 유형 태그, 버전(패치만), 날짜)
- Admin 컨트롤 (role `admin` + 관리자모드 토글): 모달로 생성/수정/삭제

### 사용자 가이드 페이지

**파일**: `frontend/src/pages/GuidePage.tsx` (라우트 `/guide`)

- 정적 5단계 사용법 + 팁; 기존에 깨져있던 `/guide` 네비 링크도 수정

---

## 설계 결정 사항

| 결정 | 선택 | 근거 |
|---|---|---|
| Rate Limiter | `slowapi` (`limits` 기반) | FastAPI 네이티브, 외부 의존성 없음 |
| 레이트리밋 키 | IP 기준 (`get_remote_address`) | dev 우회와 무관하게 동작; 사용자별 키는 추후 |
| 로깅 라이브러리 | `structlog` JSON 출력 | 디버깅용 구조화된 로그 |
| 토큰 추적 단위 | API 호출별 (캐시 토큰 포함) | 상세 분석; 캐시 토큰 별도 집계 |
| 토큰 비용 | 계산 안 함 — 토큰량만 | 캐시 토큰 때문에 정확 비용 까다로워 토큰량으로 충분 |
| dev 환경 활동로그 행위자 | `DEV_BYPASS_AUTH` 시 항상 `dev@localhost` | 의도된 동작; 실제 귀속은 배포 시 검증 (BL-004) |
| Admin 접근 | 별도 앱이 아닌 백엔드 역할 체크 | 단일 배포, 단순한 아키텍처 |

> **알려진 후속 과제** (`BACKLOG.md` 참고): BL-003 프롬프트 캐싱 비효율(인터뷰가 캐시 prefix 안에 매번 바뀌는 내용을 넣어 캐시읽기 % 낮음), BL-004 dev 우회 활동로그 귀속(배포 시 검증).

---

## 완료 기준

- [x] Admin이 사용자 목록 조회, 정지/해제, 소프트 삭제/복원 가능
- [x] Admin이 공지사항 생성/수정/삭제/고정 가능
- [x] 일반 사용자가 공지사항 목록 열람 가능 (유형별 필터)
- [x] 각 Claude API 호출에 대해 토큰 사용량 기록 (캐시 포함; 비용은 결정에 따라 미계산)
- [x] Rate Limiting이 한도 초과 시 429 반환
- [x] Admin 대시보드에 KPI 메트릭과 토큰 차트 표시
- [x] 사용자 가이드 페이지에 단계 카드와 팁 렌더링

---

## 변경 이력

| 날짜 | 내용 |
|---|---|
| 2026-05-19 | 최초 작성 |
| 2026-06-29 | Phase 8 완료 (S1–S8). 레이트리밋 IP기준·인증 티어 드롭. 토큰 로깅은 캐시 포함 토큰량 기록(비용 X). 공지 페이지 = `NoticesPage`(`/notices`). 대시보드에 토큰 차트(S4) + 활동 로그 추가. 후속: BL-003, BL-004. |
