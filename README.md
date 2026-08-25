🌐 [한국어](./README_ko.md) | [English](./README.md)

# Prequel

> Every great project deserves a prequel. An AI-powered web tool that conducts structured interviews to find gaps in your project planning.

🔗 **Live**: https://prequel-production.netlify.app

https://github.com/user-attachments/assets/bec615fa-9401-4c1d-9820-8c3417265120

## Overview

Most AI planning tools generate documents from a single prompt. Prequel takes a different approach — it **interviews** you. Through structured, type-specific questions, it systematically uncovers blind spots in your project plan before a single line of code is written.

Built for planners and developers who want to validate project ideas through AI-guided questioning, not just AI-generated text.

## Table of Contents

- [How It Works](#how-it-works)
- [Technology Stack](#technology-stack)
- [AI Components](#ai-components)
- [Quick Start](#quick-start)
- [Project Structure](#project-structure)
- [Screens](#screens)
- [Credits & Cost Model](#credits--cost-model)
- [Current Status](#current-status)
- [Roadmap](#roadmap)
- [Limitations](#limitations)

## How It Works

```
User enters project idea
  → AI detects project type (1 of 7 categories)
    → Structured interview: common questions + type-specific questions
      → Progress bar tracks completion status
        → Kickoff document generated (Markdown sections)
          → Result viewer: dashboard-summary card UI
```

**Pause & resume**: Sessions auto-save on every answer. Close the browser, come back later — pick up from the last question.

## Technology Stack

| Technology | Role | Why |
|---|---|---|
| React (Vite) | Frontend SPA | Lightweight, clear separation from backend, fast HMR |
| TailwindCSS | Styling | Utility-first rapid prototyping, small bundle |
| FastAPI | Backend API | Claude SDK Python-first, Pydantic validation, auto OpenAPI |
| Supabase | DB + Auth + RLS | PostgreSQL + OAuth + Row-Level Security, all-in-one free tier |
| Claude API | AI interview + doc generation | Reuses harness skill prompts, Prompt Caching (90% cost cut) |
| Netlify | Frontend hosting | Git auto-deploy, free SSL |
| Railway | Backend hosting | No cold start, native FastAPI support, $5/mo |

## AI Components

| Input | Processing | Output |
|---|---|---|
| Project idea (free text) | Type detection (7 categories) | Detected type + user confirmation |
| User answers per question | Structured Q&A via skill prompts | Next question tailored to project type |
| Full interview data | Document generation | Kickoff doc (Markdown) |

### Prompt Architecture

Harness skill definitions (`.md` files) are used directly as Claude API prompts — no reimplementation. `prompt_manager.py` (~60 lines) applies 4 optimizations:

1. **STEP splitting** — sends only the current interview step
2. **CLI removal** — strips CLI-specific instructions from prompts
3. **Reference filtering** — includes only type-relevant reference files
4. **Conversation compression** — summarizes older turns to reduce tokens
5. **Prompt Caching** — Anthropic cache for repeated prompt blocks

Estimated cost per kickoff: **$0.4–0.7**. A real Anthropic A/B run measured an 83% cache-read ratio and an **88% cut in full-price input tokens** after the caching rework (BL-003). Further per-phase model tiering was dropped together with monetization — see [BL-020](BACKLOG.md).

## Quick Start

### Prerequisites

- Node.js 18+
- Python 3.12+ (3.14 not supported — missing pre-built wheels)
- [uv](https://docs.astral.sh/uv/) (Python package manager)
- [Anthropic API key](https://console.anthropic.com/)
- [Supabase project](https://supabase.com/) (free tier)

### Setup

```bash
# Clone
git clone https://github.com/SoyeonAhn3/Prequel.git
cd prequel

# Backend
cd backend
uv venv .venv --python 3.12
uv pip install -r requirements.txt --python .venv/Scripts/python.exe  # Windows
# uv pip install -r requirements.txt --python .venv/bin/python        # macOS/Linux
.venv/Scripts/python -m uvicorn app.main:app --reload --port 8000

# Frontend (new terminal)
cd frontend
npm install
npm run dev
```

### Environment Variables

Copy `.env.example` to `.env` and fill in your keys:

```env
# Claude API
ANTHROPIC_API_KEY=sk-ant-xxx

# Supabase (Backend)
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_ANON_KEY=eyJxxx
SUPABASE_SERVICE_KEY=eyJxxx

# Supabase (Frontend)
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJxxx

# Server
CORS_ORIGINS=http://localhost:5173
LOG_LEVEL=INFO
```

## Project Structure

```
prequel/
├── frontend/                      # React SPA [Netlify]
│   ├── src/
│   │   ├── components/
│   │   │   ├── interview/         # Interview UI — LeftRail, ChatCenter, RightPanel, AiMark
│   │   │   ├── viewer/            # Doc preview — dashboard blocks (blocks.tsx, DocSections.tsx)
│   │   │   ├── projects/          # New project modal, delete confirm
│   │   │   ├── admin/             # Admin dashboard
│   │   │   ├── auth/              # Login / signup
│   │   │   └── common/            # Badge, ProgressBar, Header, Footer
│   │   ├── pages/                 # Route pages (9 screens)
│   │   ├── hooks/                 # useInterview, useAuth, etc.
│   │   └── lib/                   # API client, Supabase client
│   └── package.json
├── backend/                       # FastAPI [Railway]
│   ├── app/
│   │   ├── api/                   # Route handlers (auth, projects, interview)
│   │   ├── core/
│   │   │   ├── prompt_manager.py  # Skill .md → optimized Claude prompt
│   │   │   ├── claude_client.py   # Anthropic API singleton wrapper
│   │   │   ├── harness_loader.py  # Skill + reference file loader
│   │   │   └── doc_engine.py      # Interview results → Markdown doc
│   │   ├── models/                # SQLAlchemy (6 tables)
│   │   ├── schemas/               # Pydantic request/response
│   │   └── middleware/            # Auth, Rate Limiting, CORS
│   ├── skills/                    # Runtime AI prompts (.md) — single source of truth
│   ├── references/                # Reference files for prompts
│   └── tests/                     # pytest — 148 unit/API + 4 opt-in real Supabase integration tests
├── scripts/
│   └── sync_harness.py            # ⛔ Deprecated (BL-002) — backend/skills is the source of truth
├── supabase/
│   └── migrations/                # SQL migration files (001~011)
├── Phase/
│   ├── Phase1_ProjectSetup.md     # ✅ Project setup & infrastructure
│   ├── Phase2_AuthSystem.md       # ✅ Auth & user system
│   ├── Phase3_ProjectManagement.md # ✅ Project CRUD & quota
│   ├── Phase4_InterviewPipeline.md # ✅ AI interview pipeline (core)
│   ├── Phase5_Design.md           # ✅ Design phase (How) — 9-screen wizard
│   ├── Phase6_EvalFinalize.md     # ✅ Evaluation & finalization
│   ├── Phase7_DocGeneration.md    # ✅ Document preview & generation (Markdown export; Mermaid out of scope)
│   ├── Phase8_AdminFeatures.md    # ✅ Admin & supporting features
│   └── Phase9_IntegrationDeploy.md # ✅ Testing & deployment (Playwright 9/9 + real Supabase 3/3; 18/18 TCs)
├── .env.example
└── README.md
```

## Screens

| # | Screen | Description |
|---|---|---|
| 1 | Landing page | Service intro + stats + "Get Started" + "샘플 결과 보기" link |
| 2 | Login / Signup | OAuth (Google + GitHub) |
| 3 | My Projects | Project list + management |
| 4 | Interview (Chat UI) | Core — structured Q&A with progress bar |
| 5 | Result Viewer | Kickoff document dashboard-summary cards |
| 6 | Admin Dashboard | User/token/cost management + announcements |
| 7 | User Guide | How-to + FAQ |
| 8 | Announcements | Updates + patch notes |
| 9 | Sample Document | Public, no-login preview of a real completed kickoff document (`/templates`) — a static snapshot of one project, not a live per-user page |

## Credits & Cost Model

The service runs entirely on free credits. Each account gets **2 credits**, charged per phase on first entry:

| Phase | Credits | Notes |
|---|---|---|
| Interview (first entry) | 1 | Refresh, re-entry, resume, and retry never re-charge |
| Design + Evaluation (first entry) | 1 | One set — entering evaluation after design is free |
| Skip design/evaluation | 0 | Goes straight to the document |
| Document preview / Markdown export | 0 | Always free |

Charging is **atomic**: each phase is stamped on the project row (`interview_credit_charged_at` / `credit_charged_at`) inside a Postgres RPC that takes `SELECT ... FOR UPDATE` row locks and is executable by `service_role` only — browsers cannot write `credits_used` directly. Verified against real Supabase: concurrent requests on the same project charge exactly once, and two projects racing for the last credit produce exactly one success (4/4 concurrency + 3/3 real-JWT browser tests).

### Paid plans — designed, deliberately not built

Basic (₩9,900/mo · 10 kickoffs) and Pro (₩24,900/mo · 30 kickoffs) were specified during planning, but payment integration is **intentionally out of scope**. Turning on real payments requires business registration and e-commerce filing — non-engineering prerequisites with no bearing on the product. The project therefore ships the metering layer that a payment provider would sit on top of, and stops there.

## Current Status

| Phase | Status | Deliverable |
|---|---|---|
| Planning & Design | ✅ Done | Kickoff document, architecture, data model, requirements |
| Phase 1: Project Setup | ✅ Done | FastAPI/React scaffold, Supabase 6 tables + RLS, Alembic, harness sync |
| Phase 2: Auth System | ✅ Done | OAuth (Google/GitHub), JWT middleware, RBAC, login/landing page (ui-reference), slate blue design system |
| Phase 3: Project Management | ✅ Done | Project CRUD API, free quota enforcement, My Projects page (stat cards, filters, search, table), new project modal, delete modal |
| Phase 4: Interview Pipeline | ✅ Done | Backend API (6 endpoints), 3-column chat UI, type detection, pause/resume, design-decision UI — all 29 deliverables (test 28/28) |
| Phase 5: Design (How) | ✅ Done | 9-screen guided wizard (requirements → architecture → data model → AI workflow), dynamic design pipeline, interview insights persistence |
| Phase 6: Evaluation & Finalization | ✅ Done | `finalize.py` API (evaluate → done → gap → checklist), 4 rewritten skills, migration 008, doc v3 engine, FinalizePage card wizard |
| Phase 7: Doc Preview & Generation | ✅ Done | On-read document assembly (`doc_model.build_sections`), `GET /document-model` + `GET /export/markdown`, DocumentPreviewPage (2-col TOC + completeness + Markdown download). **Dashboard-summary section rendering** — building blocks (stat strip / table+chips / meter / layer band / callout) per section `kind`, markdown export unchanged. Note: progressive v1→v2→v3 generation dropped in favor of live assembly; **Mermaid diagram rendering removed from scope** |
| Phase 8: Admin & Supporting | ✅ Done | Admin dashboard (user mgmt + token usage chart + activity log), announcements CRUD + page, per-call token logging (incl. cache), `slowapi` rate limiting (interview 20/min, general 60/min), `structlog` JSON logging, user guide page. BL-003 prompt caching completed with real Anthropic A/B verification; BL-004 tracked separately. |
| Phase 9: Testing & Deploy | ✅ Done | Legal pages, integrated error handling, account purge, pytest ≥60%, and production deployment (Netlify + Railway) are done. Deterministic Playwright is **9/9 Pass**, the opt-in real-Supabase billing suite is **3/3 Pass**, and the numbered E2E contract is **18/18 Pass** — real Google/GitHub OAuth login (TC-002) and the full interview → design/evaluation → document flow against the live Anthropic API (TC-018) are both confirmed live in production (2026-08-25). Multilingual UI was dropped from scope. |
| Monetization | ❌ Out of scope | Payment, cost meter, and model tiering deliberately dropped — the verified free-credit metering layer ships instead |
| v2 | 📋 Planned | DOCX export, share links, "decide design later" re-entry |

Security hardening update: **BL-021 is complete**. All eight design/finalization APIs that accept a `session_id` now validate session → active project → authenticated owner before reads or writes. The regression suite passed with two real Supabase Auth users and actual login JWTs: 8/8 owner requests succeeded, 8/8 cross-user requests were hidden with 404 and caused no mutation, and 8/8 requests were denied after project soft deletion. The current backend suite passes 148 tests with 5 opt-in integration tests skipped by default.

### Test Scenarios

| Phase | Status | Link |
|---|---|---|
| Phase 3: Project Management | ✅ Pass (12/12) | [20260520_Phase3_프로젝트관리.md](test-scenarios/20260520_Phase3_프로젝트관리.md) |
| BL-021: Session ownership / IDOR | ✅ Pass (real Supabase Auth A/B JWT verification) | [BACKLOG.md](BACKLOG.md) |
| BL-022/023: Atomic phase credits | ✅ Real Supabase concurrency 4/4 + actual-JWT browser billing 3/3 Pass; TC-018 AI-generation leg confirmed live in production (2026-08-25) | [BACKLOG.md](BACKLOG.md) |
| Phase 9: E2E Demo Scenario | ✅ 18/18 Pass; deterministic Playwright 9/9 + real-Supabase billing 3/3 Pass | [20260707_E2E데모시나리오.md](test-scenarios/20260707_E2E데모시나리오.md) |

## Roadmap

### MVP-1

| Feature | Description |
|---|---|
| AI structured interview | Chat-based Q&A using harness skill prompts |
| Project type detection | Auto-detect 1 of 7 project types from user input |
| Kickoff doc generation | Markdown document with section-based card UI preview |
| OAuth + Admin | Google/GitHub login, admin dashboard for user/announcement management |
| Progress visualization | Step progress bar showing interview completion |
| Pause & resume | Event-based session save + resume from last question |
| Announcements | Admin-authored notices and patch notes |
| Phase-based credits | Atomic per-phase charging with row locks + idempotent charge stamps |
| API cost optimization | Prompt STEP splitting + caching + compression |

### Out of Scope — deliberately dropped

| Feature | Why dropped |
|---|---|
| Payment (Toss) | Needs business registration + e-commerce filing — non-engineering prerequisites |
| Real-time cost meter | Only meaningful once paid plans exist |
| Model tiering / routing | Existed solely to fix paid-tier unit economics ([BL-020](BACKLOG.md)) |
| Multilingual UI (ko/en) | The interview skills driving every AI response are authored in Korean, so an English shell would still return Korean output. A partial translation reads as a defect rather than a feature, and the audience is Korean-speaking. Korean-only is now a stated limitation, not a gap |

What these would have been built on top of — per-phase credit metering — **is** implemented and verified. See [Credits & Cost Model](#credits--cost-model).

### Still Planned

Nothing outstanding at MVP-1 scope — see [v2](#v2) below for what's next.

The Claude model is pinned at a single call site (`claude_client.py`) and is **updated by hand when there's a reason to** — not tracked as pending work. A generation bump is a small migration rather than a string swap: newer models think by default, which changes response parsing, `max_tokens` budgeting, and token counts. The steps and the traps are recorded in [BL-020](BACKLOG.md).

### v2

Document export (DOCX), team collaboration via share links, and re-entering design after choosing to skip it.

## Limitations

- **Early development** — Phase 1-9 complete (legal/error handling/account purge/pytest/deployment/full E2E all done; deterministic Playwright 9/9, real-Supabase billing 3/3, numbered E2E contract 18/18 Pass)
- **Desktop only** — tablet and mobile are not supported
- **Korean only** — UI and AI-generated documents are Korean. Multilingual support is out of scope (see [Roadmap](#out-of-scope--deliberately-dropped))
- **No payment, by design** — 2 free credits per account with no upgrade path; monetization is out of scope, and the credit system exists to demonstrate the metering layer rather than to sell anything
- **Runtime skills** — `backend/skills/` is the single source of truth for AI prompts; edit those files directly. `.claude/skills/` is the separate dev harness (CLI) and is not synced to runtime

---

<p align="center">Made with AI-assisted development</p>
