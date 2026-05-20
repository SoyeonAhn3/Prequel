🌐 [한국어](./README_ko.md) | [English](./README.md)

# Prequel

> Every great project deserves a prequel. An AI-powered web tool that conducts structured interviews to find gaps in your project planning.

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
- [Pricing](#pricing)
- [Current Status](#current-status)
- [Roadmap](#roadmap)
- [Limitations](#limitations)

## How It Works

```
User enters project idea
  → AI detects project type (1 of 7 categories)
    → Structured interview: common questions + type-specific questions
      → Progress bar tracks completion status
        → Kickoff document generated (Markdown sections + Mermaid diagram)
          → Result viewer: card UI + architecture diagram (SVG)
```

**Pause & resume**: Sessions auto-save on every answer. Close the browser, come back later — pick up from the last question.

## Technology Stack

| Technology | Role | Why |
|---|---|---|
| React (Vite) | Frontend SPA | Lightweight, clear separation from backend, fast HMR |
| TailwindCSS | Styling | Utility-first rapid prototyping, small bundle |
| react-i18next | Multilingual (ko/en) | JSON key separation, runtime language switching |
| Mermaid.js | Architecture diagrams | Open-source text-to-SVG, rendered in browser |
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
| Full interview data | Document generation + diagram synthesis | Kickoff doc (Markdown) + Mermaid code |

### Prompt Architecture

Harness skill definitions (`.md` files) are used directly as Claude API prompts — no reimplementation. `prompt_manager.py` (~60 lines) applies 4 optimizations:

1. **STEP splitting** — sends only the current interview step
2. **CLI removal** — strips CLI-specific instructions from prompts
3. **Reference filtering** — includes only type-relevant reference files
4. **Conversation compression** — summarizes older turns to reduce tokens
5. **Prompt Caching** — Anthropic cache for repeated prompt blocks

Estimated cost per kickoff: **$0.4–0.7** (MVP-2 model routing targets $0.3–0.5).

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
│   │   │   ├── chat/              # Chat UI — interview orchestrator
│   │   │   ├── viewer/            # Result viewer — card UI + Mermaid
│   │   │   ├── projects/          # New project modal, delete confirm
│   │   │   ├── admin/             # Admin dashboard
│   │   │   ├── auth/              # Login / signup
│   │   │   └── common/            # ProgressBar, Header, Footer
│   │   ├── pages/                 # Route pages (8 screens)
│   │   ├── hooks/                 # useInterview, useAuth, etc.
│   │   ├── i18n/                  # ko.json, en.json
│   │   └── lib/                   # API client, Supabase client
│   └── package.json
├── backend/                       # FastAPI [Railway]
│   ├── app/
│   │   ├── api/                   # Route handlers
│   │   ├── core/
│   │   │   ├── prompt_manager.py  # Skill .md → optimized Claude prompt
│   │   │   └── doc_engine.py      # Interview results → Markdown doc
│   │   ├── models/                # SQLAlchemy (6 tables)
│   │   ├── schemas/               # Pydantic request/response
│   │   └── middleware/            # Auth, Rate Limiting, CORS
│   ├── skills/                    # Harness skill .md (build-time copy)
│   ├── references/                # Harness reference files (build-time copy)
│   └── tests/
├── scripts/
│   └── sync_harness.py            # Sync harness skills → backend/
├── supabase/
│   └── migrations/                # SQL migration files (001~005)
├── Phase/
│   ├── Phase1_ProjectSetup.md     # ✅ Project setup & infrastructure
│   ├── Phase2_AuthSystem.md       # ✅ Auth & user system
│   ├── Phase3_ProjectManagement.md # ✅ Project CRUD & quota
│   ├── Phase4_InterviewPipeline.md # 🔲 AI interview pipeline (core)
│   ├── Phase5_DocGeneration.md    # 🔲 Document generation & result viewer
│   ├── Phase6_AdminFeatures.md    # 🔲 Admin & supporting features
│   └── Phase7_IntegrationDeploy.md # 🔲 i18n, testing & deployment
├── .env.example
└── README.md
```

## Screens

| # | Screen | Description |
|---|---|---|
| 1 | Landing page | Service intro + template gallery + "Get Started" |
| 2 | Login / Signup | OAuth (Google + GitHub) |
| 3 | My Projects | Project list + management |
| 4 | Interview (Chat UI) | Core — structured Q&A with progress bar |
| 5 | Result Viewer | Kickoff document cards + Mermaid diagram |
| 6 | Admin Dashboard | User/token/cost management + announcements |
| 7 | User Guide | How-to + FAQ |
| 8 | Announcements | Updates + patch notes |

## Pricing

| Plan | Price | Includes |
|---|---|---|
| Free | ₩0 | 2 kickoffs per account |
| Basic | ₩9,900/mo | 10 kickoffs/month |
| Pro | ₩24,900/mo | 30 kickoffs/month |

Payment integration is planned for MVP-2.

## Current Status

| Phase | Status | Deliverable |
|---|---|---|
| Planning & Design | ✅ Done | Kickoff document, architecture, data model, requirements |
| Phase 1: Project Setup | ✅ Done | FastAPI/React scaffold, Supabase 6 tables + RLS, Alembic, harness sync |
| Phase 2: Auth System | ✅ Done | OAuth (Google/GitHub), JWT middleware, RBAC, login/landing page (ui-reference), slate blue design system |
| Phase 3: Project Management | ✅ Done | Project CRUD API, free quota enforcement, My Projects page (stat cards, filters, search, table), new project modal, delete modal |
| Phase 4: Interview Pipeline | 🔲 Not Started | Prompt manager, interview orchestrator, chat UI |
| Phase 5: Doc Generation | 🔲 Not Started | doc_engine, Mermaid diagram, result viewer |
| Phase 6: Admin Features | 🔲 Not Started | Admin dashboard, announcements, rate limiting |
| Phase 7: Integration & Deploy | 🔲 Not Started | i18n, E2E testing, Netlify + Railway deploy |
| MVP-2 (5 features) | 📋 Planned | Payment + token tracking + cost meter + gallery + model routing |
| v2 | 📋 Planned | Gap analysis, DOCX export, share links |

### Test Scenarios

| Phase | Status | Link |
|---|---|---|
| Phase 3: Project Management | 🟡 Partial (2/12 Pass) | [20260520_Phase3_프로젝트관리.md](test-scenarios/20260520_Phase3_프로젝트관리.md) |

## Roadmap

### MVP-1

| Feature | Description |
|---|---|
| AI structured interview | Chat-based Q&A using harness skill prompts |
| Project type detection | Auto-detect 1 of 7 project types from user input |
| Kickoff doc generation | Markdown document with section-based card UI preview |
| Architecture diagram | Auto-generated Mermaid.js diagram, SVG rendering |
| OAuth + Admin | Google/GitHub login, admin dashboard for user/announcement management |
| Multilingual UI | Korean + English, fixed per project at creation |
| Progress visualization | Step progress bar showing interview completion |
| Pause & resume | Event-based session save + resume from last question |
| Announcements | Admin-authored notices and patch notes |
| API cost optimization | Prompt STEP splitting + caching + compression |

### MVP-2

| Feature | Description |
|---|---|
| Token tracking + quota | Per-session token/cost logging, usage-based limits |
| Payment (Toss) | Basic/Pro plan subscription |
| Real-time cost meter | Live remaining quota display during interview |
| Template gallery | Sample kickoff results by project type |
| Model routing | Haiku for simple turns, Sonnet for analysis/generation |

### v2

Gap analysis & honest evaluation, document export (Markdown/DOCX), team collaboration via share links.

## Limitations

- **Early development** — Phase 1-3 (infrastructure + auth + project management) complete, core features in progress
- **Desktop only** — Tablet support in MVP-2, mobile not planned
- **Language lock** — Project language (ko/en) fixed at creation; changing requires a new project
- **No payment in MVP-1** — Free tier (2 kickoffs) with no upgrade path until MVP-2
- **Harness sync** — Skill files must be manually synced via `sync_harness.py` when updated

---

<p align="center">Made with AI-assisted development</p>
