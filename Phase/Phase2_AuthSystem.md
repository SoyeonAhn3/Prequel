# Phase 2 — Auth & User System `🔲 Not Started`

> Implement Supabase OAuth authentication, JWT middleware, role-based access control, and login UI.

**Status**: 🔲 Not Started
**Prerequisites**: Phase 1 completion (FastAPI skeleton, Supabase DB, React setup)

---

## Overview

Build the authentication and user management layer. Backend implements JWT verification middleware using Supabase Auth, role-based access control (user/admin), user profile API, account suspension/soft-delete logic, and terms-of-service agreement recording. Frontend implements OAuth login page (Google + GitHub), auth guard for route protection, and the common layout (TopBar, routing structure).

---

## Deliverables

| # | Task | Area | Status | Related FR |
|---|---|---|---|---|
| 1 | Supabase Auth JWT verification middleware | Backend | 🔲 | FR-006 |
| 2 | Role-based access control (user/admin) | Backend | 🔲 | FR-007 |
| 3 | User profile read/update API | Backend | 🔲 | FR-006 |
| 4 | Account suspension / soft-delete logic | Backend | 🔲 | FR-019 |
| 5 | Terms-of-service agreement recording | Backend | 🔲 | FR-018 |
| 6 | Supabase Auth client setup | Frontend | 🔲 | FR-006 |
| 7 | Login/Signup page (Google + GitHub OAuth) | Frontend | 🔲 | FR-006 |
| 8 | Auth guard (redirect when unauthenticated) | Frontend | 🔲 | — |
| 9 | Common layout (TopBar, routing structure) | Frontend | 🔲 | — |

---

## Implementation Details

### JWT Middleware

**Files**: `backend/app/middleware/auth.py`

- Extracts JWT from `Authorization: Bearer` header
- Validates token against Supabase Auth
- Attaches authenticated user context to request state
- Blocks requests from soft-deleted (`deleted_at`) or suspended (`suspended_at`) users

### Role-Based Access Control

- `user` role: access own data only (enforced by RLS + API layer)
- `admin` role: access all users, manage announcements, view token usage
- Decorator or dependency injection pattern for route-level role checks

### OAuth Login Page

**Files**: `frontend/src/pages/LoginPage.tsx`, `frontend/src/lib/supabase.ts`

- Supabase client initialization with `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
- Google OAuth button + GitHub OAuth button
- Post-login redirect to My Projects page
- Terms agreement checkbox before first login

### Common Layout

**Files**: `frontend/src/components/common/TopBar.tsx`, `frontend/src/App.tsx`

- TopBar with logo, navigation links, user avatar, remaining quota display
- React Router setup for 8 page routes
- Auth guard wrapper component

---

## Design Decisions

| Decision | Choice | Rationale |
|---|---|---|
| Auth token storage | Supabase client handles (httpOnly cookie) | Avoid manual localStorage JWT management |
| Suspended user handling | Block at middleware, not DB level | Faster feedback, no RLS complexity |
| Terms agreement | Record timestamp in `agreed_terms_at` | Legal compliance (FR-018) |

---

## Completion Criteria

- [ ] Google OAuth login → JWT issued → authenticated API call works E2E
- [ ] GitHub OAuth login works E2E
- [ ] Admin role can access admin-only endpoints; user role gets 403
- [ ] Soft-deleted user cannot log in
- [ ] Suspended user gets clear error message
- [ ] Unauthenticated access redirects to login page

---

## Change Log

| Date | Description |
|---|---|
| 2026-05-19 | Initial creation |

---
---

# Phase 2 — 인증 & 사용자 시스템 `🔲 미시작`

> Supabase OAuth 인증, JWT 미들웨어, 역할 기반 접근 제어, 로그인 UI 구현.

**상태**: 🔲 미시작
**선행 조건**: Phase 1 완료 (FastAPI 스켈레톤, Supabase DB, React 설정)

---

## 개요

인증 및 사용자 관리 레이어를 구축한다. 백엔드는 Supabase Auth를 사용한 JWT 검증 미들웨어, 역할 기반 접근 제어(user/admin), 사용자 프로필 API, 계정 정지/소프트 삭제 로직, 이용약관 동의 기록을 구현한다. 프론트엔드는 OAuth 로그인 페이지(Google + GitHub), 인증 가드(라우트 보호), 공통 레이아웃(TopBar, 라우팅 구조)을 구현한다.

---

## 완료 예정 / 완료 항목

| # | 작업 | 영역 | 상태 | 관련 FR |
|---|---|---|---|---|
| 1 | Supabase Auth JWT 검증 미들웨어 | Backend | 🔲 | FR-006 |
| 2 | 역할 기반 접근 제어 (user/admin) | Backend | 🔲 | FR-007 |
| 3 | 사용자 프로필 조회/수정 API | Backend | 🔲 | FR-006 |
| 4 | 계정 정지 / 소프트 삭제 로직 | Backend | 🔲 | FR-019 |
| 5 | 이용약관 동의 기록 | Backend | 🔲 | FR-018 |
| 6 | Supabase Auth 클라이언트 설정 | Frontend | 🔲 | FR-006 |
| 7 | 로그인/회원가입 페이지 (Google + GitHub OAuth) | Frontend | 🔲 | FR-006 |
| 8 | 인증 가드 (미로그인 시 리다이렉트) | Frontend | 🔲 | — |
| 9 | 공통 레이아웃 (TopBar, 라우팅 구조) | Frontend | 🔲 | — |

---

## 구현 상세

### JWT 미들웨어

**파일**: `backend/app/middleware/auth.py`

- `Authorization: Bearer` 헤더에서 JWT 추출
- Supabase Auth로 토큰 검증
- 인증된 사용자 컨텍스트를 요청 상태에 첨부
- 소프트 삭제(`deleted_at`) 또는 정지(`suspended_at`)된 사용자 요청 차단

### 역할 기반 접근 제어

- `user` 역할: 자신의 데이터만 접근 가능 (RLS + API 레이어 강제)
- `admin` 역할: 전체 사용자 접근, 공지 관리, 토큰 사용량 조회
- 라우트 수준 역할 검사를 위한 데코레이터 또는 의존성 주입 패턴

### OAuth 로그인 페이지

**파일**: `frontend/src/pages/LoginPage.tsx`, `frontend/src/lib/supabase.ts`

- `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`로 Supabase 클라이언트 초기화
- Google OAuth 버튼 + GitHub OAuth 버튼
- 로그인 후 내 프로젝트 페이지로 리다이렉트
- 최초 로그인 시 이용약관 동의 체크박스

### 공통 레이아웃

**파일**: `frontend/src/components/common/TopBar.tsx`, `frontend/src/App.tsx`

- 로고, 네비게이션 링크, 사용자 아바타, 잔여 쿼타 표시가 포함된 TopBar
- 8개 페이지 라우트를 위한 React Router 설정
- 인증 가드 래퍼 컴포넌트

---

## 설계 결정 사항

| 결정 | 선택 | 근거 |
|---|---|---|
| Auth 토큰 저장 방식 | Supabase 클라이언트가 처리 (httpOnly 쿠키) | 수동 localStorage JWT 관리 회피 |
| 정지 사용자 처리 | DB 수준이 아닌 미들웨어에서 차단 | 빠른 피드백, RLS 복잡성 회피 |
| 이용약관 동의 | `agreed_terms_at`에 타임스탬프 기록 | 법적 컴플라이언스 (FR-018) |

---

## 완료 기준

- [ ] Google OAuth 로그인 → JWT 발급 → 인증된 API 호출까지 E2E 동작
- [ ] GitHub OAuth 로그인 E2E 동작
- [ ] Admin 역할은 관리자 전용 엔드포인트 접근 가능; user 역할은 403
- [ ] 소프트 삭제된 사용자는 로그인 불가
- [ ] 정지된 사용자는 명확한 에러 메시지 수신
- [ ] 미인증 접근 시 로그인 페이지로 리다이렉트

---

## 변경 이력

| 날짜 | 내용 |
|---|---|
| 2026-05-19 | 최초 작성 |
