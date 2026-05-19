# Phase 1 — Project Setup & Infrastructure `✅ Completed`

> Set up monorepo structure, FastAPI/React scaffolding, Supabase DB schema, and development tooling.

**Status**: ✅ Completed
**Prerequisites**: None (first phase)

---

## Overview

Establish the foundational project structure for both frontend and backend. Create the Supabase project with all 6 database tables, configure Alembic migrations, set up environment variables, and write the harness sync script. By the end of this phase, both `localhost:8000/docs` (FastAPI Swagger) and `localhost:5173` (React dev server) should be accessible.

---

## Deliverables

| # | Task | Area | Status | Related FR |
|---|---|---|---|---|
| 1 | Project folder structure (kickoff doc Section 6) | Common | ✅ | — |
| 2 | `.env.example`, `.gitignore` configuration | Common | ✅ | — |
| 3 | FastAPI app skeleton (`main.py`, `config.py`, CORS) | Backend | ✅ | — |
| 4 | Supabase project creation + 6 table schema | Backend | ✅ | — |
| 5 | Alembic migration initial setup | Backend | ✅ | — |
| 6 | RLS policies (all tables + admin full access) | Backend | ✅ | NFR-009 |
| 7 | `sync_harness.py` — harness skill .md + Reference copy script | Scripts | ✅ | FR-020 |
| 8 | Vite + React + TailwindCSS initial setup | Frontend | ✅ | — |
| 9 | API role grants (anon, authenticated, service_role) | Backend | ✅ | — |

---

## Implementation Details

### FastAPI Skeleton

**Files**: `backend/app/main.py`, `backend/app/config.py`

- FastAPI app with CORS middleware configured
- Pydantic `BaseSettings` for environment variable management
- Health check endpoint (`GET /health`)
- Structured logging setup with `structlog`

### Database Schema (Supabase)

**Tables** (from kickoff doc Section 11):
- `users` — Supabase Auth linked, role/plan/quota management
- `projects` — kickoff project with type, language, status, document
- `interview_sessions` — chat history, step tracking, pause/resume
- `payments` — payment records (MVP-2, schema created now)
- `token_usage` — per-session token/cost logging
- `announcements` — admin notices and patch notes

### Harness Sync Script

**File**: `scripts/sync_harness.py`

Copies harness skill definitions (`.md`) and reference files to `backend/skills/` and `backend/references/` for use as Claude API prompts.

---

## Design Decisions

| Decision | Choice | Rationale |
|---|---|---|
| DB schema creation timing | All 6 tables at Phase 1 | Avoid schema migration during feature phases |
| Alembic vs raw SQL | Both | Alembic initialized for future use; initial schema via SQL files in Supabase SQL Editor |
| RLS setup timing | Phase 1 | Security foundation must exist before any data operations |
| Python version | 3.12 (via uv venv) | Python 3.14 lacks pre-built wheels for pydantic-core, psycopg2 |
| psycopg2 vs psycopg3 | psycopg3 (`psycopg[binary]`) | Better Python 3.12+ support, actively maintained |
| DB direct connection | Deferred | Corporate network blocks port 5432; backend uses Supabase REST API |
| Auto-expose new tables | Disabled | Manual GRANT + RLS for tighter security control |

---

## Completion Criteria

- [x] `uvicorn app.main:app --reload` runs at `localhost:8000`
- [x] `GET /health` returns `{"status":"ok","version":"0.1.0"}`
- [x] `npm run dev` runs at `localhost:5173`
- [x] Vite proxy `/api` → `localhost:8000` working
- [x] All 6 Supabase tables created with correct types and constraints
- [x] RLS policies active on all 6 tables + admin full access
- [x] API role grants (anon, authenticated, service_role) applied
- [x] `sync_harness.py` copies 7 skills, 6 references to `backend/`
- [x] Supabase REST API connection verified from backend

---

## Change Log

| Date | Description |
|---|---|
| 2026-05-19 | Initial creation |
| 2026-05-19 | All deliverables completed — Phase 1 done |

---
---

# Phase 1 — 프로젝트 셋업 & 인프라 `✅ 완료`

> 모노레포 구조, FastAPI/React 스캐폴딩, Supabase DB 스키마, 개발 도구 설정.

**상태**: ✅ 완료
**선행 조건**: 없음 (첫 번째 Phase)

---

## 개요

프론트엔드와 백엔드의 기초 프로젝트 구조를 구축한다. 6개 테이블로 Supabase 프로젝트를 생성하고, Alembic 마이그레이션을 설정하고, 환경 변수를 구성하고, 하네스 동기화 스크립트를 작성한다. 이 Phase 완료 시 `localhost:8000/docs`(FastAPI Swagger)와 `localhost:5173`(React dev server) 모두 접근 가능해야 한다.

---

## 완료 예정 / 완료 항목

| # | 작업 | 영역 | 상태 | 관련 FR |
|---|---|---|---|---|
| 1 | 프로젝트 폴더 구조 생성 (킥오프 문서 섹션 6 기준) | 공통 | ✅ | — |
| 2 | `.env.example`, `.gitignore` 설정 | 공통 | ✅ | — |
| 3 | FastAPI 앱 스켈레톤 (`main.py`, `config.py`, CORS) | Backend | ✅ | — |
| 4 | Supabase 프로젝트 생성 + 6개 테이블 스키마 | Backend | ✅ | — |
| 5 | Alembic 마이그레이션 초기 설정 | Backend | ✅ | — |
| 6 | RLS 정책 설정 (전체 테이블 + admin 전체 접근) | Backend | ✅ | NFR-009 |
| 7 | `sync_harness.py` — 하네스 스킬 .md + Reference 복사 스크립트 | Scripts | ✅ | FR-020 |
| 8 | Vite + React + TailwindCSS 초기 설정 | Frontend | ✅ | — |
| 9 | API 역할 권한 부여 (anon, authenticated, service_role) | Backend | ✅ | — |

---

## 구현 상세

### FastAPI 스켈레톤

**파일**: `backend/app/main.py`, `backend/app/config.py`

- CORS 미들웨어가 설정된 FastAPI 앱
- Pydantic `BaseSettings`로 환경 변수 관리
- 헬스 체크 엔드포인트 (`GET /health`)
- `structlog` 기반 구조화된 로깅 설정

### 데이터베이스 스키마 (Supabase)

**테이블** (킥오프 문서 섹션 11 기준):
- `users` — Supabase Auth 연동, 역할/플랜/쿼타 관리
- `projects` — 킥오프 프로젝트, 유형/언어/상태/문서
- `interview_sessions` — 채팅 기록, 스텝 추적, 일시정지/재개
- `payments` — 결제 이력 (MVP-2, 스키마만 선행 생성)
- `token_usage` — 세션별 토큰/비용 로깅
- `announcements` — 관리자 공지 및 패치내역

### 하네스 동기화 스크립트

**파일**: `scripts/sync_harness.py`

하네스 스킬 정의(.md)와 Reference 파일을 `backend/skills/`, `backend/references/`로 복사하여 Claude API 프롬프트로 사용할 수 있도록 한다.

---

## 설계 결정 사항

| 결정 | 선택 | 근거 |
|---|---|---|
| DB 스키마 생성 시점 | Phase 1에서 6개 테이블 전부 | 기능 Phase에서 스키마 마이그레이션 회피 |
| Alembic vs 순수 SQL | 병행 | Alembic 초기화 완료; 초기 스키마는 Supabase SQL Editor에서 SQL 파일로 실행 |
| RLS 설정 시점 | Phase 1 | 보안 기반이 데이터 작업 전에 존재해야 함 |
| Python 버전 | 3.12 (uv venv) | Python 3.14는 pydantic-core, psycopg2 등 pre-built wheel 미지원 |
| psycopg2 vs psycopg3 | psycopg3 (`psycopg[binary]`) | Python 3.12+ 호환성, 활발한 유지보수 |
| DB 직접 연결 | 보류 | 회사 네트워크에서 포트 5432 차단; 백엔드는 Supabase REST API 사용 |
| 테이블 자동 노출 | 비활성화 | 수동 GRANT + RLS로 세밀한 보안 제어 |

---

## 완료 기준

- [x] `uvicorn app.main:app --reload`가 `localhost:8000`에서 실행
- [x] `GET /health`가 `{"status":"ok","version":"0.1.0"}` 반환
- [x] `npm run dev`가 `localhost:5173`에서 실행
- [x] Vite 프록시 `/api` → `localhost:8000` 동작 확인
- [x] Supabase 6개 테이블이 올바른 타입과 제약조건으로 생성
- [x] 전체 6개 테이블에 RLS 정책 활성화 + admin 전체 접근
- [x] API 역할 권한 (anon, authenticated, service_role) 부여 완료
- [x] `sync_harness.py`가 7개 스킬, 6개 참조를 `backend/`로 복사
- [x] 백엔드에서 Supabase REST API 연결 확인

---

## 변경 이력

| 날짜 | 내용 |
|---|---|
| 2026-05-19 | 최초 작성 |
| 2026-05-19 | 전체 항목 완료 — Phase 1 완료 |
