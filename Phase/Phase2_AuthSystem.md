# Phase 2 — Auth & User System `✅ Completed`

> Implement Supabase OAuth authentication, JWT middleware, role-based access control, login UI, landing page, and slate blue design system.

**Status**: ✅ Completed
**Prerequisites**: Phase 1 completion (FastAPI skeleton, Supabase DB, React setup)

---

## Overview

Build the authentication and user management layer. Backend implements JWT verification middleware using Supabase Auth, role-based access control (user/admin), user profile API, account suspension/soft-delete logic, and terms-of-service agreement recording. Frontend implements OAuth login page (Google + GitHub), auth guard for route protection, common layout (TopBar, routing structure), slate blue design system from ui-reference, and the public landing page.

---

## Deliverables

| # | Task | Area | Status | Related FR |
|---|---|---|---|---|
| 1 | Supabase Auth JWT verification middleware | Backend | ✅ | FR-006 |
| 2 | Role-based access control (user/admin) | Backend | ✅ | FR-007 |
| 3 | User profile read/update API | Backend | ✅ | FR-006 |
| 4 | Account suspension / soft-delete logic | Backend | ✅ | FR-019 |
| 5 | Terms-of-service agreement recording | Backend | ✅ | FR-018 |
| 6 | Supabase Auth client setup | Frontend | ✅ | FR-006 |
| 7 | Login/Signup page (Google + GitHub OAuth) | Frontend | ✅ | FR-006 |
| 8 | Auth guard (redirect when unauthenticated) | Frontend | ✅ | — |
| 9 | Common layout (TopBar, routing structure) | Frontend | ✅ | — |
| 10 | Slate blue design system (ui-reference palette) | Frontend | ✅ | — |
| 11 | Login page redesign (2-panel split layout) | Frontend | ✅ | FR-006 |
| 12 | Landing page (service intro, CTA, preview card) | Frontend | ✅ | FR-001 |

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

### Slate Blue Design System

**Files**: `frontend/src/index.css`

- Migrated from warm tone palette to slate blue palette based on `ui-reference/screens.jsx`
- 16 color tokens updated: accent `#4a6b8a`, bg `#f8f9fb`, surface-alt `#eff1f5`, etc.
- All existing components (TopBar, AuthGuard, Layout) automatically inherit the new palette

### Login Page Redesign

**Files**: `frontend/src/pages/LoginPage.tsx`

- 2-panel split layout matching `ui-reference/screen-login.jsx`
- Left panel (420px): logo, STEP 1/4 indicator, headline, value propositions checklist, footer
- Right panel: Google/GitHub OAuth buttons, terms notice, support email
- Existing OAuth logic preserved

### Landing Page

**Files**: `frontend/src/pages/LandingPage.tsx`, `frontend/src/App.tsx`

- Public page at `/` — no authentication required
- Custom header (logo, nav links: 가이드/공지사항/로그인, CTA button)
- Hero section: beta badge, headline, description, two CTA buttons
- Stats row: project types, average time, cost per session
- Right preview card: interview chat mockup with progress bar
- Floating architecture diagram mini-card
- Based on `ui-reference/screen-landing.jsx`

---

## Design Decisions

| Decision | Choice | Rationale |
|---|---|---|
| Auth token storage | Supabase client handles (httpOnly cookie) | Avoid manual localStorage JWT management |
| Suspended user handling | Block at middleware, not DB level | Faster feedback, no RLS complexity |
| Terms agreement | Record timestamp in `agreed_terms_at` | Legal compliance (FR-018) |

---

## Completion Criteria

- [x] Google OAuth login → JWT issued → authenticated API call works E2E
- [x] GitHub OAuth login works E2E
- [x] Admin role can access admin-only endpoints; user role gets 403
- [x] Soft-deleted user cannot log in
- [x] Suspended user gets clear error message
- [x] Unauthenticated access redirects to login page
- [x] Slate blue palette applied, login page matches ui-reference 2-panel layout
- [x] Landing page renders at `/` with hero, CTA, preview card

---

## Change Log

| Date | Description |
|---|---|
| 2026-05-19 | Initial creation |
| 2026-05-20 | Phase 2 completed — all 9 deliverables implemented and E2E verified |
| 2026-05-20 | Added #10-12: slate blue design system, login redesign, landing page. All implemented — Status → Completed |

---
---

# Phase 2 — 인증 & 사용자 시스템 `✅ 완료`

> Supabase OAuth 인증, JWT 미들웨어, 역할 기반 접근 제어, 로그인 UI, 랜딩 페이지, 슬레이트 블루 디자인 시스템 구현.

**상태**: ✅ 완료
**선행 조건**: Phase 1 완료 (FastAPI 스켈레톤, Supabase DB, React 설정)

---

## 개요

인증 및 사용자 관리 레이어를 구축한다. 백엔드는 Supabase Auth를 사용한 JWT 검증 미들웨어, 역할 기반 접근 제어(user/admin), 사용자 프로필 API, 계정 정지/소프트 삭제 로직, 이용약관 동의 기록을 구현한다. 프론트엔드는 OAuth 로그인 페이지(Google + GitHub), 인증 가드(라우트 보호), 공통 레이아웃(TopBar, 라우팅 구조), ui-reference 기반 슬레이트 블루 디자인 시스템, 공개 랜딩 페이지를 구현한다.

---

## 완료 예정 / 완료 항목

| # | 작업 | 영역 | 상태 | 관련 FR |
|---|---|---|---|---|
| 1 | Supabase Auth JWT 검증 미들웨어 | Backend | ✅ | FR-006 |
| 2 | 역할 기반 접근 제어 (user/admin) | Backend | ✅ | FR-007 |
| 3 | 사용자 프로필 조회/수정 API | Backend | ✅ | FR-006 |
| 4 | 계정 정지 / 소프트 삭제 로직 | Backend | ✅ | FR-019 |
| 5 | 이용약관 동의 기록 | Backend | ✅ | FR-018 |
| 6 | Supabase Auth 클라이언트 설정 | Frontend | ✅ | FR-006 |
| 7 | 로그인/회원가입 페이지 (Google + GitHub OAuth) | Frontend | ✅ | FR-006 |
| 8 | 인증 가드 (미로그인 시 리다이렉트) | Frontend | ✅ | — |
| 9 | 공통 레이아웃 (TopBar, 라우팅 구조) | Frontend | ✅ | — |
| 10 | 슬레이트 블루 디자인 시스템 (ui-reference 팔레트) | Frontend | ✅ | — |
| 11 | 로그인 페이지 리디자인 (2패널 분할 레이아웃) | Frontend | ✅ | FR-006 |
| 12 | 랜딩 페이지 (서비스 소개, CTA, 프리뷰 카드) | Frontend | ✅ | FR-001 |

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

### 슬레이트 블루 디자인 시스템

**파일**: `frontend/src/index.css`

- 웜톤 팔레트에서 `ui-reference/screens.jsx` 기반 슬레이트 블루 팔레트로 전환
- 16개 색상 토큰 업데이트: accent `#4a6b8a`, bg `#f8f9fb`, surface-alt `#eff1f5` 등
- 기존 컴포넌트(TopBar, AuthGuard, Layout) 자동 적용

### 로그인 페이지 리디자인

**파일**: `frontend/src/pages/LoginPage.tsx`

- `ui-reference/screen-login.jsx` 기준 2패널 분할 레이아웃
- 왼쪽 패널 (420px): 로고, STEP 1/4 인디케이터, 헤드라인, 가치 제안 체크리스트, 푸터
- 오른쪽 패널: Google/GitHub OAuth 버튼, 약관 안내, 서포트 이메일
- 기존 OAuth 로직 보존

### 랜딩 페이지

**파일**: `frontend/src/pages/LandingPage.tsx`, `frontend/src/App.tsx`

- `/` 경로의 공개 페이지 — 인증 불필요
- 전용 헤더 (로고, 네비 링크: 가이드/공지사항/로그인, CTA 버튼)
- 히어로 섹션: 베타 배지, 헤드라인, 설명, CTA 버튼 2개
- 통계 행: 프로젝트 유형 수, 평균 소요 시간, 회당 비용
- 우측 프리뷰 카드: 인터뷰 채팅 목업 + 진행률 바
- 플로팅 아키텍처 다이어그램 미니 카드
- `ui-reference/screen-landing.jsx` 기반

---

## 설계 결정 사항

| 결정 | 선택 | 근거 |
|---|---|---|
| Auth 토큰 저장 방식 | Supabase 클라이언트가 처리 (httpOnly 쿠키) | 수동 localStorage JWT 관리 회피 |
| 정지 사용자 처리 | DB 수준이 아닌 미들웨어에서 차단 | 빠른 피드백, RLS 복잡성 회피 |
| 이용약관 동의 | `agreed_terms_at`에 타임스탬프 기록 | 법적 컴플라이언스 (FR-018) |

---

## 완료 기준

- [x] Google OAuth 로그인 → JWT 발급 → 인증된 API 호출까지 E2E 동작
- [x] GitHub OAuth 로그인 E2E 동작
- [x] Admin 역할은 관리자 전용 엔드포인트 접근 가능; user 역할은 403
- [x] 소프트 삭제된 사용자는 로그인 불가
- [x] 정지된 사용자는 명확한 에러 메시지 수신
- [x] 미인증 접근 시 로그인 페이지로 리다이렉트
- [x] 슬레이트 블루 팔레트 적용, 로그인 페이지가 ui-reference 2패널 레이아웃과 일치
- [x] 랜딩 페이지가 `/`에서 히어로, CTA, 프리뷰 카드와 함께 렌더링

---

## 변경 이력

| 날짜 | 내용 |
|---|---|
| 2026-05-19 | 최초 작성 |
| 2026-05-20 | Phase 2 완료 — 9개 항목 모두 구현 및 E2E 검증 완료 |
| 2026-05-20 | #10-12 추가: 슬레이트 블루 디자인 시스템, 로그인 리디자인, 랜딩 페이지. 모두 구현 완료 — 상태 → 완료 |
