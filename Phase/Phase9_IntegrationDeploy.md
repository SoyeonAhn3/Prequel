# Phase 9 — Integration Testing & Deployment `✅ Done`

> Build the landing page, conduct E2E testing, and deploy to production.

**Status**: ✅ Done — Steps 1–10 complete; deterministic Playwright 9/9, real-Supabase Playwright 3/3, and numbered E2E contract 18/18 Pass. Multilingual support (`#1`, `#2`) dropped from scope on 2026-08-11; production deployment (Netlify + Railway), real OAuth (TC-002), and the full interview → design/evaluation → document flow against the live Anthropic API (TC-018) are all confirmed live in production as of 2026-08-25.
**Prerequisites**: Phase 8 completion (Admin features, rate limiting, logging)

---

## Overview

The final phase brings everything together. Build the landing page and legal pages (Terms of Service, Privacy Policy). Conduct end-to-end testing covering the MVP-1 features. Set up deployment pipeline with Netlify (frontend) and Railway (backend), finalize CORS and environment variables for production.

---

## Deliverables

| # | Task | Area | Status | Related FR |
|---|---|---|---|---|
| 1 | ~~i18n setup — `ko.json`, `en.json`, runtime switching~~ | Frontend | ❌ Out of scope | ~~FR-009~~ |
| 2 | ~~Claude API prompt language parameter~~ | Backend | ❌ Out of scope | ~~FR-009~~ |
| 3 | Landing page (service intro + "Get Started") | Frontend | ✅ | — |
| 4 | Terms of Service / Privacy Policy pages | Frontend | ✅ | FR-018 |
| 5 | Error handling integration (Claude API timeout → retry, network drop → offline save) | Common | ✅ | NFR-003 |
| 6 | E2E demo scenario test (10 features sequential execution) | Common | ✅ | DoD |
| 7 | pytest backend coverage 60%+ on core logic | Backend | ✅ | NFR-013 |
| 8 | Deployment setup (Netlify + Railway, env vars, CI/CD) | Common | ✅ | — |
| 9 | CORS finalization (Netlify domain) | Backend | ✅ | NFR-007 |
| 10 | Production environment verification | Common | ✅ | — |

### Progress — Step 1 (2026-07-01, commit `3ca88ba`)

Legal pages and landing polish shipped:

- **Terms / Privacy** (`#4` ✅) — `pages/TermsPage.tsx`, `pages/PrivacyPage.tsx`, shared `components/common/LegalPage.tsx` layout, Korean content in `content/legal.ts` (Markdown-rendered). Reachable at `/terms`, `/privacy` without login.
- **Landing page** (`#3` 🚧) — footer added with Terms/Privacy links; hero height adjusted so the footer shows without scrolling. Login page gained legal links + a consent notice.
- Follow-up **BL-005**: legal pages carry placeholder contact/officer info — replace with real details before public launch.

Remaining in Phase 9 *(as of Step 1)*: i18n (`#1`, `#2`), E2E testing (`#6`), deployment (`#8`–`#10`). — i18n was later dropped from scope in Step 8.

### Progress — Step 2 (2026-07-06) — Error handling integration (`#5` ✅)

End-to-end error handling shipped across backend and frontend:

- **Backend friendly errors** — `core/claude_client.py`: 60s timeout + `max_retries=2` on the Anthropic client; SDK exceptions (`APITimeoutError`/`APIConnectionError`, `RateLimitError`, `APIStatusError`) converted to a domain `AIServiceError`. `main.py` global handler maps it to **503 + Korean message + `retryable: true`**.
- **Frontend timeout & typed errors** — `lib/api.ts`: `apiFetch` gains a 120s `AbortController` timeout and throws `ApiError` (`status`/`retryable`); network failures (fetch `TypeError`) also surface as retryable.
- **Retry buttons** — reusable `hooks/useRetryable.ts` + shared `components/common/ErrorBanner.tsx`, wired into the four AI-calling screens (Interview, Design, Finalize, Document). Retry re-runs the full operation (API call + post-processing).
- **Error Boundary** — `components/common/ErrorBoundary.tsx` wraps `<Routes>` in `App.tsx`; a render crash shows a fallback instead of a white screen and logs the error.
- **Interview offline resilience** — `lib/interviewDraft.ts` persists an unsent answer to `localStorage`; auto-resends on the `online` event; offline banner in `InterviewPage.tsx`.
- Follow-up **BL-007**: duplicate-send risk on interview answers needs a server-side idempotency key.

Verified: frontend `tsc -b` + production build pass; backend `py_compile` + in-process test confirming the `AIServiceError` → 503 mapping.

### Progress — Step 3 (2026-07-07) — pytest coverage 60%+ (`#7` ✅)

Backend core-logic coverage crossed the DoD threshold:

- **New tests** — `tests/test_projects_endpoints.py` (16) covers the project CRUD + design-decision (idempotent credit charge) + generate-doc + soft-delete flows; `tests/test_finalize_endpoints.py` (9) covers the Phase 6 evaluate→checklist generate chain, session read/update, and 404/400 branches, which also exercises `api/_shared.py` context builders + JSON parsing.
- **Shared fake** — `tests/_fakes.py` adds a stateful in-memory `FakeSupabase` (select/insert/update/delete + eq/is_/in_/order/limit/single/maybe_single) so writes are reflected by later reads — unlike the stateless fake in the interview tests.
- **Result** — `55% → 64%` (target ≥ 60%), 34 → 59 tests. `api/projects.py` 36→98%, `api/finalize.py` 32→98%, `api/_shared.py` 15→51%.

Run: `.venv/Scripts/python -m pytest --cov=app --cov-report=term-missing`.

### Progress — Step 4 (2026-07-07) — E2E demo scenario authored (`#6` 🚧)

A manual E2E test checklist was authored at `test-scenarios/20260707_E2E데모시나리오.md` — **16 TCs** covering the 10-feature happy path plus edge/failure cases (interview pause→resume, offline draft/auto-resend, AI-503 retry, empty-name guard, credit exhaustion, answer idempotency). Expected results were pinned to the app's real strings/routes by reading the source (note: interview is **11 steps** not 10; type auto-detection happens **during** the interview; announcements live on `/notices`, not `/admin`).

AI-verifiable parts were **pre-checked**: **TC-015 (answer idempotency) passes** via `test_interview_idempotency.py`; TC-011/012/013/014/016 had their code backbones (messages, routes, wiring) confirmed in source. Human-tester execution is still pending, so `#6` stays 🚧.

Follow-up **BL-008** was later implemented on 2026-07-13: the project row menu now opens the name/description edit UI backed by `PATCH /projects/{id}`.

### Progress — Step 5 (2026-07-22) — E2E contract refresh and Playwright foundation (`#6` 🚧)

- **Current contract** — `test-scenarios/20260707_E2E데모시나리오.md` was aligned with BL-023's current credit policy. The obsolete skip→`/finalize` expectation and "unlimited interview" wording were removed; TC-007 was reset for post-policy-change verification; TC-017/018 cover skip→document with no extra charge and the full two-credit design/evaluation path. The suite now has **18 numbered TCs: 9 Pass, 9 pending**.
- **Playwright setup** — `@playwright/test` and Chromium installed; `frontend/playwright.config.ts` starts an isolated public frontend on `5177`, an auth-bypass app frontend on `5178`, and the backend on `8001`, while retaining screenshot/video/trace artifacts on failure. `vite.config.ts` accepts environment-driven test port and API proxy target without changing normal development defaults.
- **Smoke coverage** — `frontend/e2e/public.spec.ts` automates TC-001 plus public Terms/Privacy access. `npm run test:e2e` starts both servers and reports **2/2 passing**. The first run correctly exposed an ambiguous legal-page heading locator; the selector was tightened and the rerun passed.
- **Verification** — frontend production build passed, targeted ESLint for the new config/tests passed, and production dependency audit reported 0 vulnerabilities. Real Google OAuth, offline/503 flows, and BL-023 browser/database evidence remain pending, so deliverable `#6` stays 🚧.

### Progress — Step 6 (2026-07-22) — Deterministic browser automation (`#6` 🚧)

- **Protected-screen isolation** — the public project keeps auth bypass disabled on `5177`, while protected browser tests use a separate `5178` frontend with auth bypass enabled. `frontend/e2e/support/fixtures.ts` intercepts every `/api/**` request and returns 501 for an unhandled path, preventing accidental real Supabase or Anthropic traffic.
- **Automated contract cases** — `projects.spec.ts` covers TC-011 (blank/whitespace name, zero POSTs); `interview-resilience.spec.ts` covers TC-013 (offline draft, same `answerId` resend, draft cleanup) and TC-014 (503 + retryable error, successful retry); `document.spec.ts` covers TC-016 (safe empty state, no download button, export API 404); `routing.spec.ts` verifies `designing`→design, `evaluating`→finalize, and `completed`→document redirects.
- **Result** — the first full run passed 7/9 and exposed one product accessibility finding (the visible project-name label is not programmatically associated with its input) plus one harness issue (a route mock still fulfilled while Chromium was offline). The functional locator/network simulation were corrected; focused rerun passed 3/3 and the final full suite passed **9/9**. The label association remains a non-blocking follow-up.
- **Contract status** — TC-001/011/013/014/016 now have Playwright evidence. TC-016 was aligned to the shipped UX: completeness 0 hides the Markdown button, while direct export returns 404. The numbered scenario is now **13/18 Pass**; TC-002/007/012/017/018 remain real OAuth/current-decision/credit-flow gates.

### Progress — Step 7 (2026-07-22) — Real Supabase staged-credit E2E (`#6` 🚧)

- **Opt-in real-service harness** — `frontend/e2e/billing.real.spec.ts` creates a unique disposable Supabase Auth user, public profile, projects, and completed-session fixtures. `npm run test:e2e:supabase` enables the `real-supabase` Playwright project only for that explicit command, uses actual login JWTs with `DEV_BYPASS_AUTH=false`, attaches billing snapshots, and deletes/verifies Auth plus all related public rows in teardown.
- **Actual browser/database evidence** — TC-012 confirms the 2/2 UI lock, HTTP 403 before session/token work, unchanged charge stamp, and already-charged re-entry. TC-007/017 confirm the current decision UI, "later" no-op, skip→document HTTP 200, `credits_used=1`, `status=completed`, no design charge, idempotent retry/re-entry, and Markdown filename/content. TC-018's billing slice confirms the first design decision changes 1→2 credits and `designing`, while refresh, duplicate decision, and `enter-evaluation` keep exactly 2 credits.
- **No accidental AI spend** — completed interview/design rows are deterministic fixtures and `/finalize/evaluate` is blocked in this billing-only suite. The full TC-018 design/finalize AI generation and final document path therefore remains pending and is not counted as a numbered Pass.
- **Verification** — real Supabase RPC concurrency **4/4**, real-service browser **3/3**, deterministic browser **9/9**, backend **148 passed / 5 skipped**, targeted ESLint and production build all pass. A separate prefix scan found zero disposable public users, projects, or activity logs after teardown; per-test cleanup also reports zero Auth users and related rows. The numbered contract is now **16/18 Pass**, with TC-002 and the AI-generation remainder of TC-018 still open.

### Progress — Step 8 (2026-08-11) — Account purge and scope close-out

- **Account purge (BL-005 (b))** — `core/purge.py` deletes every row a user owns in FK-reverse order, then the `auth.users` record, then re-counts to confirm nothing survived. Exposed as `DELETE /api/users/me` (self) and `POST /api/admin/users/{id}/purge` (admin); soft delete stays for suspend/restore. Two traps drove the explicit ordering: `activity_logs.actor_id` is `ON DELETE SET NULL` so rows survive with `actor_email` intact, and `public.users` has no FK to `auth.users`, so neither side cascades to the other. Frontend adds a typed-confirmation modal in the profile menu, and the privacy policy now points at that instead of an unmonitored support address. **13 new tests; backend 161 passed / 5 skipped.**
- **Scope decisions** — monetization (payment, cost meter, model tiering) was dropped on 2026-08-11, and multilingual support (`#1`, `#2`) followed for the reasons recorded above. Both are now documented as deliberate exclusions rather than gaps.
- **Documentation reconciliation** — BL-023 was still marked "browser E2E pending" although Step 7's TC-017 had already covered exactly that path with real Supabase evidence; it is now closed. Deliverable `#3` is marked done: the MVP-1 landing scope (intro, CTA, stats, footer, legal links) shipped in Step 1, and the template gallery it was waiting on is a separately tracked planned item, not Phase 9 work.
- **Three loose ends closed** — (1) the top-nav **템플릿** tab pointed at `/templates`, which has no route, so the catch-all bounced logged-in users out to the landing page; the tab is removed until the gallery exists. (2) `deriveValidationRules` still parsed relationships with the `→`-only regex that `parseRelationship` had already outgrown in P5-14, so the data-model step rendered **zero** relationship-based integrity rules for the `A 1--N B` format the skill actually emits; both call sites now share one parser, with a `structured` flag so the loose whitespace fallback can't produce nonsense rules. (3) The TC-011 accessibility finding is fixed — 9 labels across the new-project, edit-project, and announcement modals are associated with their controls (the two announcement "labels" that front button groups got `role="group"`/`aria-pressed` instead, since `htmlFor` cannot target a button), and TC-011 now locates the input via `getByLabel` so the association is a regression test rather than a note.
- **Verification** — deterministic Playwright **9/9**, backend **161 passed / 5 skipped**, `tsc -b` clean. ESLint is unchanged at 41 problems (40 errors, 1 warning), all pre-existing.

### Progress — Step 9 (2026-08-24) — Production deployment

- **Backend (Railway)** — `backend/Procfile` (`uvicorn app.main:app --host 0.0.0.0 --port $PORT`) and `backend/.python-version` (`3.12`, since 3.14 lacks prebuilt wheels) added so Railpack can build the service with Root Directory set to `backend`. Environment variables set: `ANTHROPIC_API_KEY`, `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_KEY`, `CORS_ORIGINS`, `LOG_LEVEL=INFO`, `DEV_BYPASS_AUTH=false`. Live at `https://prequel-production.up.railway.app`, `/health` returns `{"status":"ok"}`.
- **Frontend (Netlify)** — `frontend/netlify.toml` added: build command `npm run build`, publish `dist`, an `/api/*` redirect proxying to the Railway backend (the app's `fetch('/api/...')` calls stay relative, so no frontend code changed), and a SPA fallback (`/* → /index.html`) for React Router refresh. Environment variables set: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_DEV_BYPASS_AUTH=false`. Live at `https://prequel-production.netlify.app`.
- **CORS (`#9`)** — Railway `CORS_ORIGINS` updated to include the Netlify domain; confirmed working by a successful project-creation call from the deployed frontend (browser → Netlify redirect → Railway → Supabase, no CORS rejection).
- **Supabase Auth** — Site URL and Redirect URLs (Authentication → URL Configuration) updated to the Netlify domain.
- **Real OAuth confirmed (`TC-002` ✅)** — Google and GitHub login both verified working end-to-end on the production Netlify site, closing the last fully-manual E2E gate; the numbered contract moves from 16/18 to **17/18**.
- **Production bug found and fixed** — `MyProjectsPage.tsx`'s quota card still read "유료 전환 시 월 10~30회 사용 가능" ("upgrade to a paid plan for 10-30/month"), left over from before monetization was dropped from scope (2026-08-11). Since the site is now actually public, this advertised an upgrade path that does not exist. Replaced with "무료 2회는 계정당 고정이에요" ("the 2 free credits are fixed per account"). `tsc -b` clean.
- **Scope note** — no custom domain purchased (Railway/Netlify default subdomains only, acceptable for this scope).

### Progress — Step 10 (2026-08-25) — TC-018 AI-generation leg verified in production

- **Full live flow** — the complete interview → design/evaluation → finalize → document path was exercised end-to-end against the live Anthropic API on the production deployment (Netlify + Railway), not a local/staging environment.
- **Result** — the run completed successfully with no errors, closing the last open gate in the numbered E2E contract. The suite is now **18/18 Pass** (deterministic Playwright 9/9 + real-Supabase billing 3/3 + all numbered TCs including TC-002 and TC-018).
- **Phase 9 status** — with `#6` and `#10` both complete, Phase 9 is done.

---

## Implementation Details

### Multilingual Support — dropped (2026-08-11)

`react-i18next` was never installed and `#1`/`#2` are now out of scope. The deciding factor was that the two deliverables are not independent: every AI response is produced by the 18 Korean-authored skill prompts in `backend/skills/`, so an English UI shell would still return Korean interview questions and Korean kickoff documents. Delivering real English support means localizing the prompt corpus, not just extracting UI strings — and a partially translated app reads as a defect rather than a feature. The audience is Korean-speaking, so the value did not justify that scope.

Korean-only is now recorded as a product limitation in both READMEs instead of an unfinished task. FR-009 is withdrawn rather than deferred.

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
5. Interview: complete the 11-step flow with progress tracking
6. Pause → close browser → resume from last question
7. Interview completion → choose design/evaluation or skip directly to the document
8. Result viewer: structured section cards and completeness status (Mermaid is out of scope)
9. Markdown download
10. Admin: create announcement, view token usage

Automation foundation: `frontend/playwright.config.ts` + `frontend/e2e/*.spec.ts`. Run deterministic cases with `npm run test:e2e`; run the opt-in disposable real-Supabase billing suite with `npm run test:e2e:supabase`. Real OAuth and AI-spending generation remain explicit gates.

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
| Multilingual support | Dropped; Korean-only | Real English support requires localizing the Korean skill prompts, not just the UI shell; a partial translation would look broken and the audience is Korean-speaking |
| Landing page auth | No auth required | Public-facing page for user acquisition |
| Test strategy | Playwright + manual real-service E2E + pytest | Playwright covers repeatable browser behavior, manual/integration gates verify OAuth and real Supabase/AI boundaries, pytest validates core logic |
| Deployment | Netlify + Railway | Git auto-deploy, no cold start (Railway), free SSL (Netlify) |

---

## Completion Criteria

- [x] Landing page accessible without login
- [x] Terms/Privacy pages accessible and linked from login
- [x] Users can permanently purge their own account and personal data (BL-005 (b))
- [x] E2E demo scenario completes without errors — 18/18 Pass (TC-018 AI-generation leg verified live in production, 2026-08-25)
- [x] Backend core logic test coverage ≥ 60% (64%)
- [x] Production deployment live (Netlify + Railway; default subdomains, no custom domain purchased)
- [x] CORS correctly restricts to Netlify production domain
- ~~Korean ↔ English UI switching works on all pages~~ — withdrawn (out of scope)
- ~~AI-generated content respects project language setting~~ — withdrawn (out of scope)

---

## Change Log

| Date | Description |
|---|---|
| 2026-05-19 | Initial creation |
| 2026-07-03 | Step 1 done — legal pages (Terms/Privacy) + landing footer & login legal links; status → In Progress |
| 2026-07-06 | Step 2 done — error handling integration (#5 ✅): backend 503/`AIServiceError`, frontend timeout/`ApiError` + retry buttons (4 screens), Error Boundary, interview offline draft/auto-resend. BL-007 logged. |
| 2026-07-07 | Step 3 done — pytest coverage 60%+ (#7 ✅): +25 tests for projects & finalize endpoints, stateful `FakeSupabase` helper; 55% → 64%. |
| 2026-07-07 | Step 4 — E2E demo scenario authored (#6 🚧): 16 manual TCs at `test-scenarios/20260707_…`, TC-015 AI-preverified; BL-008 logged (project name/desc edit UI). |
| 2026-07-22 | Step 5 — E2E contract refreshed to 18 TCs for BL-023; Playwright/Chromium foundation added with isolated 5177/8001 servers, failure artifacts, TC-001 + legal-page smoke automation. `npm run test:e2e` 2/2, targeted ESLint and production build pass; numbered contract 9/18 Pass, #6 remains in progress. |
| 2026-07-22 | Step 6 — deterministic protected-screen automation added on isolated auth-bypass frontend 5178 with fail-closed API mocks. TC-011/013/014/016 + three state redirects pass; full Playwright suite is 9/9 and numbered contract 13/18 Pass. One non-blocking project-name label/input accessibility finding remains. |
| 2026-07-22 | Step 7 — opt-in real-Supabase Playwright billing suite added with disposable Auth/JWT fixtures and zero-row teardown verification. Real RPC 4/4 + browser 3/3 pass; TC-007/012/017 are now Pass and TC-018 billing transitions pass without Anthropic spend. Numbered contract 16/18; OAuth and TC-018's AI-generation remainder remain. |
| 2026-08-11 | Step 8 — account purge shipped (BL-005 (b)): FK-ordered hard delete + auth user removal + residual re-check, self/admin endpoints, typed-confirmation modal, privacy policy rewritten; 13 new tests, backend 161 passed / 5 skipped. Multilingual support (#1, #2) dropped from scope and FR-009 withdrawn; monetization already dropped. BL-023 closed against Step 7's TC-017 evidence and #3 marked done. Remaining: deployment (#8–#10), TC-002, TC-018 AI leg. |
| 2026-08-24 | Step 9 — production deployment shipped: Railway backend (`Procfile`, `.python-version`, env vars) + Netlify frontend (`netlify.toml` with `/api` proxy redirect + SPA fallback, env vars), CORS opened to the Netlify domain, Supabase Auth redirect URLs updated. Real Google/GitHub OAuth confirmed live (TC-002 ✅), numbered contract 16/18 → 17/18. Found and fixed a stale paid-plan upsell string left over from the monetization scope-drop. Remaining: TC-018's AI-generation leg. |

---
---

# Phase 9 — 통합 테스트 & 배포 `🚧 진행 중`

> 랜딩 페이지 구축, E2E 테스트 수행, 프로덕션 배포.

**상태**: 🚧 진행 중 — Step 1~9 완료; 결정적 Playwright 9/9, 실제 Supabase Playwright 3/3, 번호형 E2E 계약 17/18 Pass. 다국어(`#1`·`#2`)는 2026-08-11에 범위 제외했고, 프로덕션 배포(Netlify + Railway)와 실제 OAuth(TC-002)는 2026-08-24에 확인 완료했다. 잔여는 TC-018 AI 생성 구간뿐이다.
**선행 조건**: Phase 8 완료 (Admin 기능, Rate Limiting, 로깅)

---

## 개요

마지막 Phase로 모든 것을 통합한다. 랜딩 페이지와 법적 페이지(이용약관, 개인정보처리방침)를 구축한다. MVP-1 기능을 커버하는 E2E 테스트를 수행한다. Netlify(프론트엔드)와 Railway(백엔드)로 배포 파이프라인을 설정하고, 프로덕션용 CORS와 환경 변수를 최종 확정한다.

---

## 완료 예정 / 완료 항목

| # | 작업 | 영역 | 상태 | 관련 FR |
|---|---|---|---|---|
| 1 | ~~i18n 적용 — `ko.json`, `en.json`, 런타임 전환~~ | Frontend | ❌ 범위 제외 | ~~FR-009~~ |
| 2 | ~~Claude API 프롬프트 언어 파라미터 전달~~ | Backend | ❌ 범위 제외 | ~~FR-009~~ |
| 3 | 랜딩 페이지 (서비스 소개 + "시작하기") | Frontend | ✅ | — |
| 4 | 이용약관 / 개인정보처리방침 페이지 | Frontend | ✅ | FR-018 |
| 5 | 에러 처리 통합 (Claude API 타임아웃 → 재시도, 네트워크 끊김 → 오프라인 저장) | 공통 | ✅ | NFR-003 |
| 6 | E2E 데모 시나리오 테스트 (10개 기능 순차 실행) | 공통 | 🚧 | DoD |
| 7 | pytest 백엔드 핵심 로직 60%+ 커버리지 | Backend | ✅ | NFR-013 |
| 8 | 배포 설정 (Netlify + Railway, 환경 변수, CI/CD) | 공통 | ✅ | — |
| 9 | CORS 최종 설정 (Netlify 도메인) | Backend | ✅ | NFR-007 |
| 10 | 프로덕션 환경 검증 | 공통 | 🚧 | — |

### 진행 상황 — Step 1 (2026-07-01, 커밋 `3ca88ba`)

법적 페이지와 랜딩 다듬기 반영:

- **이용약관 / 개인정보처리방침** (`#4` ✅) — `pages/TermsPage.tsx`, `pages/PrivacyPage.tsx`, 공용 `components/common/LegalPage.tsx` 레이아웃, 한국어 본문 `content/legal.ts`(Markdown 렌더링). 로그인 없이 `/terms`, `/privacy` 접근 가능.
- **랜딩 페이지** (`#3` 🚧) — 약관·개인정보 링크가 담긴 푸터 추가, 히어로 높이 조정으로 스크롤 없이 푸터 노출. 로그인 페이지에 법적 링크·동의 안내문 추가.
- 후속 **BL-005**: 법적 페이지의 연락처·책임자 정보가 임시값 — 정식 오픈 전 실제 정보로 교체 필요.

Phase 9 잔여 *(Step 1 시점)*: i18n (`#1`, `#2`), E2E 테스트 (`#6`), 배포 (`#8`~`#10`). — i18n은 이후 Step 8에서 범위 제외했다.

### 진행 상황 — Step 2 (2026-07-06) — 에러 처리 통합 (`#5` ✅)

백엔드·프론트 전반의 에러 처리 반영:

- **백엔드 친절한 에러** — `core/claude_client.py`: Anthropic 클라이언트에 60초 타임아웃 + `max_retries=2`, SDK 예외(`APITimeoutError`/`APIConnectionError`, `RateLimitError`, `APIStatusError`)를 도메인 예외 `AIServiceError`로 변환. `main.py` 전역 핸들러가 **503 + 한국어 메시지 + `retryable: true`**로 매핑.
- **프론트 타임아웃·타입 에러** — `lib/api.ts`: `apiFetch`에 120초 `AbortController` 타임아웃 + `ApiError`(`status`/`retryable`), 네트워크 실패(fetch `TypeError`)도 재시도 가능으로 처리.
- **재시도 버튼** — 공용 `hooks/useRetryable.ts` + `components/common/ErrorBanner.tsx`를 AI 호출 4개 화면(인터뷰·설계·마감·문서)에 연결. 재시도는 API 호출+후처리 전체를 다시 실행.
- **Error Boundary** — `components/common/ErrorBoundary.tsx`가 `App.tsx`에서 `<Routes>`를 감싸 렌더 크래시 시 흰 화면 대신 fallback + 에러 로깅.
- **인터뷰 오프라인 대비** — `lib/interviewDraft.ts`로 미전송 답변을 `localStorage`에 저장, `online` 이벤트에 자동 재전송, `InterviewPage.tsx` 오프라인 배너.
- 후속 **BL-007**: 인터뷰 답변 중복 전송 위험 → 서버측 멱등성 키 필요.

검증: 프론트 `tsc -b` + 프로덕션 빌드 통과, 백엔드 `py_compile` + `AIServiceError` → 503 매핑 인프로세스 테스트 확인.

### 진행 상황 — Step 3 (2026-07-07) — pytest 커버리지 60%+ (`#7` ✅)

백엔드 핵심 로직 커버리지가 DoD 기준을 넘어섰다:

- **신규 테스트** — `tests/test_projects_endpoints.py`(16개): 프로젝트 CRUD + 설계결정(멱등 크레딧 차감) + 문서생성 + 소프트삭제 흐름. `tests/test_finalize_endpoints.py`(9개): Phase 6 evaluate→checklist 생성 체인, 세션 조회/수정, 404/400 분기 — `api/_shared.py`의 컨텍스트 조립·JSON 파싱도 함께 커버.
- **공용 가짜** — `tests/_fakes.py`에 상태 유지 인메모리 `FakeSupabase`(select/insert/update/delete + eq/is_/in_/order/limit/single/maybe_single) 추가. 쓰기가 이후 읽기에 반영됨(인터뷰 테스트의 무상태 가짜와 대비).
- **결과** — `55% → 64%`(목표 ≥ 60%), 테스트 34 → 59개. `api/projects.py` 36→98%, `api/finalize.py` 32→98%, `api/_shared.py` 15→51%.

실행: `.venv/Scripts/python -m pytest --cov=app --cov-report=term-missing`.

### 진행 상황 — Step 4 (2026-07-07) — E2E 데모 시나리오 작성 (`#6` 🚧)

수동 E2E 테스트 체크리스트를 `test-scenarios/20260707_E2E데모시나리오.md`에 작성 — **16개 TC**로 10개 기능 정상 흐름 + 엣지/실패(인터뷰 일시정지→재개, 오프라인 임시저장/자동 재전송, AI-503 재시도, 빈 이름 가드, 크레딧 소진, 답변 멱등성)를 아우름. 예상 결과는 소스를 읽어 앱의 실제 문구·라우트에 맞춤(참고: 인터뷰는 **11단계**이며 10이 아님; 유형 자동감지는 인터뷰 **도중** 발생; 공지는 `/admin`이 아닌 `/notices`).

AI검증 가능한 부분은 **선검증**: **TC-015(답변 멱등성)는 `test_interview_idempotency.py`로 Pass 확인**, TC-011/012/013/014/016은 코드 근거(문구·라우트·배선)를 소스에서 확인. 사람 테스터의 실행은 아직 남아 `#6`는 🚧 유지.

후속 **BL-008**은 2026-07-13 구현 완료: 프로젝트 행 메뉴에서 이름·설명 수정 UI를 열고 `PATCH /projects/{id}`로 저장한다.

### 진행 상황 — Step 5 (2026-07-22) — E2E 계약 갱신 및 Playwright 기반 (`#6` 🚧)

- **현재 계약** — `test-scenarios/20260707_E2E데모시나리오.md`를 BL-023의 현행 크레딧 정책과 맞췄다. 폐기된 패스→`/finalize` 예상과 "인터뷰 무제한" 문구를 제거하고, TC-007을 정책 변경 후 재검증 대상으로 전환했으며, TC-017/018로 패스→문서 무차감 흐름과 설계·평가 총 2크레딧 흐름을 추가했다. 현재 **번호형 TC 18건 중 9 Pass, 9건 대기**다.
- **Playwright 설정** — `@playwright/test`와 Chromium을 설치했다. `frontend/playwright.config.ts`가 공개 프론트 `5177`, 인증 우회 앱 프론트 `5178`, 백엔드 `8001`을 격리 실행하고, 실패 시 screenshot/video/trace를 보존한다. `vite.config.ts`는 평상시 개발 기본값을 유지하면서 테스트 포트와 API 프록시 대상을 환경 변수로 받을 수 있다.
- **Smoke 범위** — `frontend/e2e/public.spec.ts`가 TC-001과 공개 약관/개인정보 페이지 접근을 자동화한다. `npm run test:e2e`로 두 서버를 자동 시작해 **2/2 통과**했다. 첫 실행에서 법적 페이지의 중복 제목 locator가 모호한 것을 확인해 선택자를 구체화했고 재실행에 성공했다.
- **검증** — 프론트 프로덕션 빌드, 신규 설정/테스트 대상 ESLint가 통과했고 운영 의존성 audit는 취약점 0건이었다. 실제 Google OAuth, 오프라인/503 흐름, BL-023 브라우저·DB 증거는 남아 있어 `#6`은 🚧 유지한다.

### 진행 상황 — Step 6 (2026-07-22) — 결정적 브라우저 자동화 (`#6` 🚧)

- **보호 화면 격리** — 공개 프로젝트는 `5177`에서 인증 우회를 끄고, 보호 화면 테스트는 `5178`의 별도 인증 우회 프론트를 사용한다. `frontend/e2e/support/fixtures.ts`는 모든 `/api/**` 요청을 가로채며 미정의 경로를 501로 닫아 실제 Supabase·Anthropic 호출이 발생하지 않게 한다.
- **자동화 계약** — `projects.spec.ts`는 TC-011(빈값/공백, POST 0건), `interview-resilience.spec.ts`는 TC-013(offline draft·동일 `answerId` 재전송·draft 삭제)과 TC-014(503 retryable 에러·재시도 성공), `document.spec.ts`는 TC-016(안전한 빈 상태·다운로드 버튼 미노출·export API 404), `routing.spec.ts`는 `designing`→설계·`evaluating`→마감·`completed`→문서 리다이렉트를 검증한다.
- **결과** — 첫 전체 실행은 7/9가 통과했고 제품 접근성 발견 1건(프로젝트 이름의 시각적 label이 input과 프로그램적으로 연결되지 않음)과 하네스 문제 1건(Chromium offline 중에도 route mock이 응답함)을 확인했다. 기능 locator와 네트워크 시뮬레이션을 보정해 집중 재실행 3/3, 최종 전체 **9/9 통과**했다. label 연결은 비차단 후속 개선으로 남겼다.
- **계약 상태** — TC-001/011/013/014/016에 Playwright 증거를 반영했다. TC-016은 실제 UX인 "완성도 0%에서 Markdown 버튼 미노출, 직접 export는 404"로 갱신했다. 번호형 시나리오는 **13/18 Pass**이며 TC-002/007/012/017/018은 실제 OAuth·현행 선택 분기·과금 흐름 게이트로 남아 있다.

### 진행 상황 — Step 7 (2026-07-22) — 실제 Supabase 단계별 과금 E2E (`#6` 🚧)

- **명시 실행형 실서비스 하네스** — `frontend/e2e/billing.real.spec.ts`가 고유한 일회용 Supabase Auth 사용자·public 프로필·프로젝트·완료 세션 fixture를 만든다. `npm run test:e2e:supabase`를 명시 실행할 때만 `real-supabase` Playwright 프로젝트가 활성화되며, `DEV_BYPASS_AUTH=false`에서 실제 로그인 JWT로 호출하고 과금 스냅샷을 첨부한 뒤 Auth와 모든 관련 public 행을 삭제·0건 검증한다.
- **실제 브라우저·DB 증거** — TC-012는 2/2 UI 차단, 세션·토큰 생성 전 HTTP 403, 차감 도장 불변, 이미 차감된 프로젝트 재접속을 확인했다. TC-007/017은 현행 선택 UI, `나중에 결정하기` 무변경, 패스→문서 HTTP 200, `credits_used=1`, `status=completed`, 설계 도장 없음, 재요청·재진입 멱등성, Markdown 파일명·내용을 확인했다. TC-018 과금 구간은 최초 설계 결정에서 1→2크레딧·`designing`, 새로고침·중복 결정·`enter-evaluation` 후에도 정확히 2크레딧 유지를 확인했다.
- **의도치 않은 AI 비용 방지** — 완료 인터뷰·설계 행은 결정적 fixture를 사용하고 `/finalize/evaluate`는 이 과금 전용 스위트에서 차단했다. 따라서 TC-018의 설계/마감 AI 생성과 최종 문서 전체 경로는 대기 상태이며 번호형 Pass로 계산하지 않았다.
- **검증** — 실제 Supabase RPC 동시성 **4/4**, 실서비스 브라우저 **3/3**, 결정적 브라우저 **9/9**, 백엔드 **148 passed / 5 skipped**, 대상 ESLint와 프로덕션 빌드가 모두 통과했다. 별도 prefix 조회에서도 일회용 public 사용자·프로젝트·활동 로그가 0건이었고, 각 테스트 정리 결과 Auth 사용자와 관련 행도 모두 0건이다. 번호형 계약은 **16/18 Pass**, 잔여는 TC-002와 TC-018 AI 생성 구간이다.

### 진행 상황 — Step 8 (2026-08-11) — 계정 파기 및 범위 확정

- **계정 완전 파기 (BL-005 (b))** — `core/purge.py`가 사용자 소유 행을 FK 역순으로 지우고 `auth.users`까지 삭제한 뒤 잔존 행을 재확인한다. `DELETE /api/users/me`(본인)과 `POST /api/admin/users/{id}/purge`(관리자)로 노출하고, 이용 정지·복구용 soft delete는 그대로 유지한다. 명시 순서가 필요한 이유는 두 가지 함정 때문이다 — `activity_logs.actor_id`가 `ON DELETE SET NULL`이라 행이 남으면서 `actor_email`이 그대로 보존되고, `public.users`와 `auth.users` 사이에는 FK가 없어 어느 쪽도 서로를 연쇄 삭제하지 않는다. 프론트는 프로필 메뉴에 확인 문구 입력식 모달을 추가했고, 개인정보처리방침은 수신되지 않던 support 주소 대신 이 기능을 안내한다. **신규 테스트 13개, 백엔드 161 passed / 5 skipped.**
- **범위 확정** — 2026-08-11에 수익화(결제·비용 미터·모델 티어링)를 제외했고, 다국어(`#1`·`#2`)도 같은 날 아래 사유로 제외했다. 둘 다 미완료 항목이 아니라 **의도적 제외**로 문서화했다.
- **문서 정합성** — BL-023이 "브라우저 E2E 대기"로 남아 있었으나 Step 7의 TC-017이 실제 Supabase 증거로 같은 경로를 이미 검증했으므로 완료 처리했다. 산출물 `#3`도 완료로 정정했다 — MVP-1 랜딩 범위(소개·CTA·통계·푸터·법적 링크)는 Step 1에서 끝났고, 대기 사유였던 템플릿 갤러리는 Phase 9가 아니라 별도 계획 항목이다.
- **잔여 3건 정리** — (1) 상단 네비게이션의 **템플릿** 탭이 라우트 없는 `/templates`를 가리켜, 로그인 사용자가 catch-all에 걸려 랜딩으로 튕겨 나갔다. 갤러리를 만들 때까지 탭을 제거했다. (2) `deriveValidationRules`가 P5-14에서 이미 고친 `parseRelationship`과 달리 `→` 전용 정규식을 그대로 써서, 스킬이 실제로 내보내는 `A 1--N B` 포맷에서는 관계 기반 정합성 규칙이 **한 건도** 표시되지 않았다. 두 호출부가 파서 하나를 공유하도록 합치고, 공백 분리 폴백이 엉뚱한 규칙을 만들지 않도록 `structured` 플래그를 뒀다. (3) TC-011 접근성 지적을 해결했다 — 새 프로젝트·프로젝트 수정·공지 모달의 label 9곳을 입력 요소와 연결했고(공지의 버튼 묶음 2곳은 `htmlFor` 대상이 아니라 `role="group"`·`aria-pressed`로 처리), TC-011이 `getByLabel`로 입력칸을 찾게 해 연결 자체를 회귀 테스트로 고정했다.
- **검증** — 결정적 Playwright **9/9**, 백엔드 **161 passed / 5 skipped**, `tsc -b` 통과. ESLint는 41건(오류 40·경고 1)으로 변동 없으며 모두 기존 항목이다.

### 진행 상황 — Step 9 (2026-08-24) — 프로덕션 배포

- **백엔드 (Railway)** — `backend/Procfile`(`uvicorn app.main:app --host 0.0.0.0 --port $PORT`)과 `backend/.python-version`(`3.12`, 3.14는 사전 빌드 wheel 없어 미지원)을 추가해 Railpack이 Root Directory `backend` 기준으로 빌드하게 했다. 환경변수 설정: `ANTHROPIC_API_KEY`·`SUPABASE_URL`·`SUPABASE_ANON_KEY`·`SUPABASE_SERVICE_KEY`·`CORS_ORIGINS`·`LOG_LEVEL=INFO`·`DEV_BYPASS_AUTH=false`. `https://prequel-production.up.railway.app`에서 서비스 중, `/health`가 `{"status":"ok"}` 반환.
- **프론트엔드 (Netlify)** — `frontend/netlify.toml` 추가: 빌드 명령 `npm run build`, publish `dist`, `/api/*` 요청을 Railway 백엔드로 전달하는 리다이렉트(앱의 `fetch('/api/...')` 상대경로 호출은 그대로 유지 — 프론트 코드 변경 없음), React Router 새로고침용 SPA 폴백(`/* → /index.html`). 환경변수 설정: `VITE_SUPABASE_URL`·`VITE_SUPABASE_ANON_KEY`·`VITE_DEV_BYPASS_AUTH=false`. `https://prequel-production.netlify.app`에서 서비스 중.
- **CORS (`#9`)** — Railway `CORS_ORIGINS`에 Netlify 도메인을 추가. 배포된 프론트에서 프로젝트 생성 API 호출이 성공(브라우저 → Netlify 리다이렉트 → Railway → Supabase, CORS 차단 없음)한 것으로 동작 확인.
- **Supabase Auth** — Authentication → URL Configuration의 Site URL·Redirect URLs를 Netlify 도메인으로 갱신.
- **실제 OAuth 확인 (`TC-002` ✅)** — 프로덕션 Netlify 사이트에서 구글·깃허브 로그인 모두 end-to-end로 정상 동작 확인. 마지막까지 남아있던 완전 수동 E2E 게이트가 닫혔고, 번호형 계약이 16/18 → **17/18**로 올라갔다.
- **프로덕션에서 발견·수정한 버그** — `MyProjectsPage.tsx`의 쿼터 카드가 "유료 전환 시 월 10~30회 사용 가능" 문구를 여전히 표시하고 있었다. 2026-08-11 수익화 범위 제외 이전에 만들어진 채 남아있던 것으로, 사이트가 실제로 공개된 지금 상태에서는 **존재하지 않는 업그레이드 경로를 광고**하는 셈이었다. "무료 2회는 계정당 고정이에요"로 교체했다. `tsc -b` 통과.
- **`#10` 잔여** — 인터뷰 → 설계/평가 → 문서 전체 흐름을 프로덕션의 실제 Anthropic API로 아직 실행해보지 않았다(TC-018 AI 생성 구간). 커스텀 도메인은 구매하지 않음(Railway/Netlify 기본 서브도메인만 사용, 현재 범위에서는 충분하다고 판단).

---

## 구현 상세

### 다국어 지원 — 제외 (2026-08-11)

`react-i18next`는 설치된 적이 없고 `#1`·`#2`는 범위에서 제외한다. 결정적인 이유는 두 산출물이 서로 독립적이지 않다는 점이다. 모든 AI 응답은 `backend/skills/`의 한국어로 작성된 스킬 프롬프트 18개가 만들어내므로, UI 껍데기만 영어로 바꿔도 영어 화면에서 한국어 질문과 한국어 킥오프 문서가 나온다. 실제 영어 지원은 UI 문자열 추출이 아니라 **프롬프트 자산 전체의 현지화**를 의미하고, 일부만 번역된 앱은 기능이 아니라 결함으로 보인다. 대상 사용자가 한국어권이라 그 공수를 정당화할 가치가 없었다.

한국어 전용은 이제 미완료 과제가 아니라 두 README의 **제품 한계점**으로 기록한다. FR-009는 연기가 아니라 철회한다.

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
5. 인터뷰: 11단계 완료 + 진행률 추적
6. 일시정지 → 브라우저 종료 → 마지막 질문부터 재개
7. 인터뷰 완료 → 설계·평가 진행 또는 문서로 바로 패스 선택
8. 결과 뷰어: 구조화 섹션 카드 + 완성도 상태(Mermaid는 스코프 제외)
9. Markdown 다운로드
10. Admin: 공지사항 작성, 토큰 사용량 조회

자동화 기반은 `frontend/playwright.config.ts`와 `frontend/e2e/*.spec.ts`다. 결정적 테스트는 `npm run test:e2e`, 일회용 실제 Supabase 과금 테스트는 `npm run test:e2e:supabase`로 명시 실행한다. 실제 OAuth와 비용이 발생하는 AI 생성은 별도 게이트로 유지한다.

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
| 다국어 지원 | 제외, 한국어 전용 | 진짜 영어 지원은 UI가 아니라 한국어 스킬 프롬프트 현지화가 필요하고, 일부 번역 상태는 결함으로 보이며, 대상 사용자가 한국어권 |
| 랜딩 페이지 인증 | 인증 불필요 | 사용자 유치를 위한 공개 페이지 |
| 테스트 전략 | Playwright + 실서비스 수동 E2E + pytest | Playwright는 반복 가능한 브라우저 동작, 수동/통합 게이트는 실제 OAuth·Supabase·AI 경계, pytest는 핵심 로직 검증 |
| 배포 | Netlify + Railway | Git 자동 배포, 콜드 스타트 없음(Railway), 무료 SSL(Netlify) |

---

## 완료 기준

- [x] 랜딩 페이지가 로그인 없이 접근 가능
- [x] 이용약관/개인정보처리방침 페이지 접근 가능 및 로그인에서 링크
- [x] 이용자가 본인 계정과 개인정보를 직접 완전 파기 가능 (BL-005 (b))
- [ ] E2E 데모 시나리오 에러 없이 완료 — 17/18, TC-018 AI 생성 구간만 잔여
- [x] 백엔드 핵심 로직 테스트 커버리지 ≥ 60% (64%)
- [x] 프로덕션 배포 완료 (Netlify + Railway, 기본 서브도메인 — 커스텀 도메인은 구매하지 않음)
- [x] CORS가 Netlify 프로덕션 도메인으로 올바르게 제한
- ~~한국어 ↔ 영어 UI 전환이 모든 페이지에서 동작~~ — 철회 (범위 제외)
- ~~AI 생성 콘텐츠가 프로젝트 언어 설정을 따름~~ — 철회 (범위 제외)

---

## 변경 이력

| 날짜 | 내용 |
|---|---|
| 2026-05-19 | 최초 작성 |
| 2026-07-03 | Step 1 완료 — 법적 페이지(약관/개인정보) + 랜딩 푸터·로그인 법적 링크; 상태 → 진행 중 |
| 2026-07-06 | Step 2 완료 — 에러 처리 통합(#5 ✅): 백엔드 503/`AIServiceError`, 프론트 타임아웃/`ApiError` + 재시도 버튼(4개 화면), Error Boundary, 인터뷰 오프라인 임시저장/자동 재전송. BL-007 등록. |
| 2026-07-07 | Step 3 완료 — pytest 커버리지 60%+(#7 ✅): projects·finalize 엔드포인트 테스트 25개 추가, 상태 유지 `FakeSupabase` 헬퍼; 55% → 64%. |
| 2026-07-07 | Step 4 — E2E 데모 시나리오 작성(#6 🚧): 수동 16 TC(`test-scenarios/20260707_…`), TC-015 AI 선검증; BL-008 등록(프로젝트 이름·설명 수정 UI). |
| 2026-07-22 | Step 5 — BL-023 기준 E2E 계약을 18개 TC로 갱신하고 Playwright/Chromium 기반 추가(격리 포트 5177/8001, 실패 증거 보존, TC-001+법적 페이지 smoke 자동화). `npm run test:e2e` 2/2, 신규 대상 ESLint·프로덕션 빌드 통과; 번호형 계약 9/18 Pass로 #6 진행 중 유지. |
| 2026-07-22 | Step 6 — 인증 우회 프론트 5178과 미정의 API를 차단하는 mock으로 결정적 보호 화면 자동화 추가. TC-011/013/014/016 및 상태 리다이렉트 3건 통과, Playwright 전체 9/9·번호형 계약 13/18 Pass. 프로젝트 이름 label/input 접근성 연결 1건은 비차단 후속으로 남김. |
| 2026-07-22 | Step 7 — 일회용 Auth/JWT fixture와 정리 0건 검증을 갖춘 명시 실행형 실제 Supabase Playwright 과금 스위트 추가. 실제 RPC 4/4·브라우저 3/3 통과, TC-007/012/017 Pass 및 TC-018 과금 전환 통과. 번호형 계약 16/18, OAuth와 TC-018 AI 생성 잔여. |
| 2026-08-11 | Step 8 — 계정 완전 파기 구현(BL-005 (b)): FK 역순 물리 삭제 + auth 사용자 삭제 + 잔존 행 재확인, 본인·관리자 엔드포인트, 확인 문구 입력식 모달, 개인정보처리방침 개정. 신규 테스트 13개, 백엔드 161 passed / 5 skipped. 다국어(#1·#2) 범위 제외·FR-009 철회(수익화는 앞서 제외). BL-023을 Step 7의 TC-017 증거로 완료 처리하고 #3도 완료로 정정. 잔여: 배포(#8~#10)·TC-002·TC-018 AI 구간. |
| 2026-08-24 | Step 9 — 프로덕션 배포 완료: Railway 백엔드(`Procfile`·`.python-version`·환경변수) + Netlify 프론트(`netlify.toml`의 `/api` 프록시 리다이렉트 + SPA 폴백·환경변수), CORS를 Netlify 도메인으로 개방, Supabase Auth 리다이렉트 URL 갱신. 실제 구글/깃허브 OAuth 프로덕션에서 확인(TC-002 ✅), 번호형 계약 16/18 → 17/18. 수익화 범위 제외 당시 남아있던 유료 전환 문구 버그 발견·수정. 잔여: TC-018 AI 생성 구간. |
