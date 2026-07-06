# Phase 9 — i18n, Integration Testing & Deployment `🚧 In Progress`

> Apply multilingual support, build the landing page, conduct E2E testing, and deploy to production.

**Status**: 🚧 In Progress — Step 1 (legal pages & landing footer) + Step 2 (error handling `#5`) done
**Prerequisites**: Phase 8 completion (Admin features, rate limiting, logging)

---

## Overview

The final phase brings everything together. Apply `react-i18next` for Korean/English UI switching with language parameter passed to Claude API prompts. Build the landing page and legal pages (Terms of Service, Privacy Policy). Conduct end-to-end testing covering all 10 MVP-1 features. Set up deployment pipeline with Netlify (frontend) and Railway (backend), finalize CORS and environment variables for production.

---

## Deliverables

| # | Task | Area | Status | Related FR |
|---|---|---|---|---|
| 1 | i18n setup — `ko.json`, `en.json`, runtime switching | Frontend | 🔲 | FR-009 |
| 2 | Claude API prompt language parameter | Backend | 🔲 | FR-009 |
| 3 | Landing page (service intro + "Get Started") | Frontend | 🚧 | — |
| 4 | Terms of Service / Privacy Policy pages | Frontend | ✅ | FR-018 |
| 5 | Error handling integration (Claude API timeout → retry, network drop → offline save) | Common | ✅ | NFR-003 |
| 6 | E2E demo scenario test (10 features sequential execution) | Common | 🔲 | DoD |
| 7 | pytest backend coverage 60%+ on core logic | Backend | 🔲 | NFR-013 |
| 8 | Deployment setup (Netlify + Railway, env vars, CI/CD) | Common | 🔲 | — |
| 9 | CORS finalization (Netlify domain) | Backend | 🔲 | NFR-007 |
| 10 | Production environment verification | Common | 🔲 | — |

### Progress — Step 1 (2026-07-01, commit `3ca88ba`)

Legal pages and landing polish shipped:

- **Terms / Privacy** (`#4` ✅) — `pages/TermsPage.tsx`, `pages/PrivacyPage.tsx`, shared `components/common/LegalPage.tsx` layout, Korean content in `content/legal.ts` (Markdown-rendered). Reachable at `/terms`, `/privacy` without login.
- **Landing page** (`#3` 🚧) — footer added with Terms/Privacy links; hero height adjusted so the footer shows without scrolling. Login page gained legal links + a consent notice.
- Follow-up **BL-005**: legal pages carry placeholder contact/officer info — replace with real details before public launch.

Remaining in Phase 9: i18n (`#1`, `#2`), testing (`#6`, `#7`), deployment (`#8`–`#10`).

### Progress — Step 2 (2026-07-06) — Error handling integration (`#5` ✅)

End-to-end error handling shipped across backend and frontend:

- **Backend friendly errors** — `core/claude_client.py`: 60s timeout + `max_retries=2` on the Anthropic client; SDK exceptions (`APITimeoutError`/`APIConnectionError`, `RateLimitError`, `APIStatusError`) converted to a domain `AIServiceError`. `main.py` global handler maps it to **503 + Korean message + `retryable: true`**.
- **Frontend timeout & typed errors** — `lib/api.ts`: `apiFetch` gains a 120s `AbortController` timeout and throws `ApiError` (`status`/`retryable`); network failures (fetch `TypeError`) also surface as retryable.
- **Retry buttons** — reusable `hooks/useRetryable.ts` + shared `components/common/ErrorBanner.tsx`, wired into the four AI-calling screens (Interview, Design, Finalize, Document). Retry re-runs the full operation (API call + post-processing).
- **Error Boundary** — `components/common/ErrorBoundary.tsx` wraps `<Routes>` in `App.tsx`; a render crash shows a fallback instead of a white screen and logs the error.
- **Interview offline resilience** — `lib/interviewDraft.ts` persists an unsent answer to `localStorage`; auto-resends on the `online` event; offline banner in `InterviewPage.tsx`.
- Follow-up **BL-007**: duplicate-send risk on interview answers needs a server-side idempotency key.

Verified: frontend `tsc -b` + production build pass; backend `py_compile` + in-process test confirming the `AIServiceError` → 503 mapping.

---

## Implementation Details

### i18n Integration

**Files**: `frontend/src/i18n/ko.json`, `frontend/src/i18n/en.json`, `frontend/src/i18n/index.ts`

- `react-i18next` setup with JSON key separation
- Runtime language switching via UI toggle (TopBar)
- All static UI text extracted to translation files
- Claude API prompts receive project language parameter for AI-generated content language

### Landing Page

**Files**: `frontend/src/pages/LandingPage.tsx`

- Hero section: tagline, description, CTA buttons ("Get Started", "Sample Results")
- Product preview card showing interview in action
- Stats bar (7 types, ~30 min, $0.5/session)
- No authentication required to view

### Legal Pages

**Files**: `frontend/src/pages/TermsPage.tsx`, `frontend/src/pages/PrivacyPage.tsx`

- Static content pages with Markdown rendering
- Linked from login page and footer
- Terms agreement recorded in `users.agreed_terms_at` (Phase 2)

### Error Handling Integration

- **Claude API timeout/5xx**: user-facing error message + retry button, session state preserved
- **Supabase outage**: maintenance page display
- **Network disconnection during interview**: local temporary save of unsent answer, auto-retry on reconnection
- React Error Boundary for unhandled frontend errors

### E2E Testing

End-to-end demo scenario covering all 10 MVP-1 features in order:
1. Landing page access → "Get Started"
2. OAuth login (Google)
3. New project creation (Korean, Web App idea)
4. Type auto-detection confirmation
5. Interview: answer 10 questions with progress bar tracking
6. Pause → close browser → resume from last question
7. Interview completion → kickoff document generated
8. Result viewer: card UI + Mermaid diagram rendered
9. Markdown download
10. Admin: create announcement, view token usage

### Deployment

**Frontend (Netlify)**:
- Connect Git repository, auto-deploy on `main` branch push
- Environment variables: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`
- Custom domain + free SSL

**Backend (Railway)**:
- Connect Git repository, auto-deploy on `main` branch push
- Environment variables: `ANTHROPIC_API_KEY`, `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_KEY`, `CORS_ORIGINS`
- `Procfile`: `web: uvicorn app.main:app --host 0.0.0.0 --port $PORT`

---

## Design Decisions

| Decision | Choice | Rationale |
|---|---|---|
| i18n library | `react-i18next` | JSON key separation, runtime switching, largest community |
| Landing page auth | No auth required | Public-facing page for user acquisition |
| Test strategy | E2E scenario + pytest unit | E2E validates user flow, pytest validates core logic |
| Deployment | Netlify + Railway | Git auto-deploy, no cold start (Railway), free SSL (Netlify) |

---

## Completion Criteria

- [ ] Korean ↔ English UI switching works on all pages
- [ ] AI-generated content respects project language setting
- [x] Landing page accessible without login
- [x] Terms/Privacy pages accessible and linked from login
- [ ] E2E demo scenario (10 features) completes without errors
- [ ] Backend core logic test coverage ≥ 60%
- [ ] Production deployment live on custom domain
- [ ] CORS correctly restricts to Netlify production domain

---

## Change Log

| Date | Description |
|---|---|
| 2026-05-19 | Initial creation |
| 2026-07-03 | Step 1 done — legal pages (Terms/Privacy) + landing footer & login legal links; status → In Progress |
| 2026-07-06 | Step 2 done — error handling integration (#5 ✅): backend 503/`AIServiceError`, frontend timeout/`ApiError` + retry buttons (4 screens), Error Boundary, interview offline draft/auto-resend. BL-007 logged. |

---
---

# Phase 9 — 다국어, 통합 테스트 & 배포 `🚧 진행 중`

> 다국어 지원 적용, 랜딩 페이지 구축, E2E 테스트 수행, 프로덕션 배포.

**상태**: 🚧 진행 중 — Step 1 (법적 페이지·랜딩 푸터) + Step 2 (에러 처리 `#5`) 완료
**선행 조건**: Phase 8 완료 (Admin 기능, Rate Limiting, 로깅)

---

## 개요

마지막 Phase로 모든 것을 통합한다. `react-i18next`로 한국어/영어 UI 전환을 적용하고 Claude API 프롬프트에 언어 파라미터를 전달한다. 랜딩 페이지와 법적 페이지(이용약관, 개인정보처리방침)를 구축한다. MVP-1의 10개 기능 전체를 커버하는 E2E 테스트를 수행한다. Netlify(프론트엔드)와 Railway(백엔드)로 배포 파이프라인을 설정하고, 프로덕션용 CORS와 환경 변수를 최종 확정한다.

---

## 완료 예정 / 완료 항목

| # | 작업 | 영역 | 상태 | 관련 FR |
|---|---|---|---|---|
| 1 | i18n 적용 — `ko.json`, `en.json`, 런타임 전환 | Frontend | 🔲 | FR-009 |
| 2 | Claude API 프롬프트 언어 파라미터 전달 | Backend | 🔲 | FR-009 |
| 3 | 랜딩 페이지 (서비스 소개 + "시작하기") | Frontend | 🚧 | — |
| 4 | 이용약관 / 개인정보처리방침 페이지 | Frontend | ✅ | FR-018 |
| 5 | 에러 처리 통합 (Claude API 타임아웃 → 재시도, 네트워크 끊김 → 오프라인 저장) | 공통 | ✅ | NFR-003 |
| 6 | E2E 데모 시나리오 테스트 (10개 기능 순차 실행) | 공통 | 🔲 | DoD |
| 7 | pytest 백엔드 핵심 로직 60%+ 커버리지 | Backend | 🔲 | NFR-013 |
| 8 | 배포 설정 (Netlify + Railway, 환경 변수, CI/CD) | 공통 | 🔲 | — |
| 9 | CORS 최종 설정 (Netlify 도메인) | Backend | 🔲 | NFR-007 |
| 10 | 프로덕션 환경 검증 | 공통 | 🔲 | — |

### 진행 상황 — Step 1 (2026-07-01, 커밋 `3ca88ba`)

법적 페이지와 랜딩 다듬기 반영:

- **이용약관 / 개인정보처리방침** (`#4` ✅) — `pages/TermsPage.tsx`, `pages/PrivacyPage.tsx`, 공용 `components/common/LegalPage.tsx` 레이아웃, 한국어 본문 `content/legal.ts`(Markdown 렌더링). 로그인 없이 `/terms`, `/privacy` 접근 가능.
- **랜딩 페이지** (`#3` 🚧) — 약관·개인정보 링크가 담긴 푸터 추가, 히어로 높이 조정으로 스크롤 없이 푸터 노출. 로그인 페이지에 법적 링크·동의 안내문 추가.
- 후속 **BL-005**: 법적 페이지의 연락처·책임자 정보가 임시값 — 정식 오픈 전 실제 정보로 교체 필요.

Phase 9 잔여: i18n (`#1`, `#2`), 테스트 (`#6`, `#7`), 배포 (`#8`~`#10`).

### 진행 상황 — Step 2 (2026-07-06) — 에러 처리 통합 (`#5` ✅)

백엔드·프론트 전반의 에러 처리 반영:

- **백엔드 친절한 에러** — `core/claude_client.py`: Anthropic 클라이언트에 60초 타임아웃 + `max_retries=2`, SDK 예외(`APITimeoutError`/`APIConnectionError`, `RateLimitError`, `APIStatusError`)를 도메인 예외 `AIServiceError`로 변환. `main.py` 전역 핸들러가 **503 + 한국어 메시지 + `retryable: true`**로 매핑.
- **프론트 타임아웃·타입 에러** — `lib/api.ts`: `apiFetch`에 120초 `AbortController` 타임아웃 + `ApiError`(`status`/`retryable`), 네트워크 실패(fetch `TypeError`)도 재시도 가능으로 처리.
- **재시도 버튼** — 공용 `hooks/useRetryable.ts` + `components/common/ErrorBanner.tsx`를 AI 호출 4개 화면(인터뷰·설계·마감·문서)에 연결. 재시도는 API 호출+후처리 전체를 다시 실행.
- **Error Boundary** — `components/common/ErrorBoundary.tsx`가 `App.tsx`에서 `<Routes>`를 감싸 렌더 크래시 시 흰 화면 대신 fallback + 에러 로깅.
- **인터뷰 오프라인 대비** — `lib/interviewDraft.ts`로 미전송 답변을 `localStorage`에 저장, `online` 이벤트에 자동 재전송, `InterviewPage.tsx` 오프라인 배너.
- 후속 **BL-007**: 인터뷰 답변 중복 전송 위험 → 서버측 멱등성 키 필요.

검증: 프론트 `tsc -b` + 프로덕션 빌드 통과, 백엔드 `py_compile` + `AIServiceError` → 503 매핑 인프로세스 테스트 확인.

---

## 구현 상세

### i18n 통합

**파일**: `frontend/src/i18n/ko.json`, `frontend/src/i18n/en.json`, `frontend/src/i18n/index.ts`

- JSON 키 분리 방식의 `react-i18next` 설정
- TopBar의 UI 토글로 런타임 언어 전환
- 모든 정적 UI 텍스트를 번역 파일로 추출
- AI 생성 콘텐츠 언어를 위해 Claude API 프롬프트에 프로젝트 언어 파라미터 전달

### 랜딩 페이지

**파일**: `frontend/src/pages/LandingPage.tsx`

- 히어로 섹션: 태그라인, 설명, CTA 버튼 ("시작하기", "샘플 결과 보기")
- 인터뷰 진행을 보여주는 제품 미리보기 카드
- 통계 바 (7가지 유형, ~30분, $0.5/회)
- 로그인 없이 접근 가능

### 법적 페이지

**파일**: `frontend/src/pages/TermsPage.tsx`, `frontend/src/pages/PrivacyPage.tsx`

- Markdown 렌더링이 포함된 정적 콘텐츠 페이지
- 로그인 페이지와 푸터에서 링크
- 이용약관 동의는 `users.agreed_terms_at`에 기록 (Phase 2)

### 에러 처리 통합

- **Claude API 타임아웃/5xx**: 사용자 에러 메시지 + 재시도 버튼, 세션 상태 유지
- **Supabase 장애**: 점검 안내 페이지 표시
- **인터뷰 중 네트워크 끊김**: 미전송 답변 로컬 임시 저장, 재연결 시 자동 전송 시도
- 처리되지 않은 프론트엔드 에러를 위한 React Error Boundary

### E2E 테스트

MVP-1의 10개 기능을 순서대로 커버하는 E2E 데모 시나리오:
1. 랜딩 페이지 접근 → "시작하기"
2. OAuth 로그인 (Google)
3. 새 프로젝트 생성 (한국어, Web App 아이디어)
4. 유형 자동 감지 확인
5. 인터뷰: 10개 질문 답변 + 프로그레스바 추적
6. 일시정지 → 브라우저 종료 → 마지막 질문부터 재개
7. 인터뷰 완료 → 킥오프 문서 생성
8. 결과 뷰어: 카드 UI + Mermaid 다이어그램 렌더링
9. Markdown 다운로드
10. Admin: 공지사항 작성, 토큰 사용량 조회

### 배포

**프론트엔드 (Netlify)**:
- Git 저장소 연결, `main` 브랜치 push 시 자동 배포
- 환경 변수: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`
- 커스텀 도메인 + 무료 SSL

**백엔드 (Railway)**:
- Git 저장소 연결, `main` 브랜치 push 시 자동 배포
- 환경 변수: `ANTHROPIC_API_KEY`, `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_KEY`, `CORS_ORIGINS`
- `Procfile`: `web: uvicorn app.main:app --host 0.0.0.0 --port $PORT`

---

## 설계 결정 사항

| 결정 | 선택 | 근거 |
|---|---|---|
| i18n 라이브러리 | `react-i18next` | JSON 키 분리, 런타임 전환, 커뮤니티 최대 |
| 랜딩 페이지 인증 | 인증 불필요 | 사용자 유치를 위한 공개 페이지 |
| 테스트 전략 | E2E 시나리오 + pytest 유닛 | E2E는 사용자 흐름 검증, pytest는 핵심 로직 검증 |
| 배포 | Netlify + Railway | Git 자동 배포, 콜드 스타트 없음(Railway), 무료 SSL(Netlify) |

---

## 완료 기준

- [ ] 한국어 ↔ 영어 UI 전환이 모든 페이지에서 동작
- [ ] AI 생성 콘텐츠가 프로젝트 언어 설정을 따름
- [x] 랜딩 페이지가 로그인 없이 접근 가능
- [x] 이용약관/개인정보처리방침 페이지 접근 가능 및 로그인에서 링크
- [ ] E2E 데모 시나리오 (10개 기능) 에러 없이 완료
- [ ] 백엔드 핵심 로직 테스트 커버리지 ≥ 60%
- [ ] 커스텀 도메인에서 프로덕션 배포 완료
- [ ] CORS가 Netlify 프로덕션 도메인으로 올바르게 제한

---

## 변경 이력

| 날짜 | 내용 |
|---|---|
| 2026-05-19 | 최초 작성 |
| 2026-07-03 | Step 1 완료 — 법적 페이지(약관/개인정보) + 랜딩 푸터·로그인 법적 링크; 상태 → 진행 중 |
| 2026-07-06 | Step 2 완료 — 에러 처리 통합(#5 ✅): 백엔드 503/`AIServiceError`, 프론트 타임아웃/`ApiError` + 재시도 버튼(4개 화면), Error Boundary, 인터뷰 오프라인 임시저장/자동 재전송. BL-007 등록. |
