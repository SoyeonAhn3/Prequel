# README section rules

## Contents

- Baseline sections
- Conditional sections
- API documentation split
- Project-type detection
- Scan targets
- Writing rules

## Baseline sections

Use these sections unless the repository type or explicit user request makes one irrelevant:

1. **Language switch** — place `🌐 [한국어](./README_ko.md) | [English](./README.md)` at the top.
2. **Project name and one-line description** — state what the project does without slogans.
3. **Overview** — explain the problem, target user, and approach in a few paragraphs.
4. **Table of contents** — link only sections that exist.
5. **How it works** — summarize the main flow in five to seven steps or a compact diagram.
6. **Technology stack** — list technology, role, and an evidenced reason when available.
7. **Quick start** — prerequisites, installation, safe environment setup, and verified commands.
8. **Project structure** — show only important directories and files with concise descriptions.
9. **Current status** — distinguish completed, in-progress, planned, blocked, deprecated, and out-of-scope work.
10. **Footer** — use the existing repository convention; otherwise omit decorative claims.

For Phase-based repositories, use a compact status table:

```markdown
| Phase | Status | Deliverable |
|---|---|---|
| Phase 1 — Foundation | ✅ Done | Project skeleton and core infrastructure |
| Phase 2 — Core | 🚧 In Progress | Primary application workflow |
```

## Conditional sections

Add only sections supported by repository evidence.

### AI components

Include when AI SDKs, model clients, prompt assets, or inference code exist. Explain:

- what AI receives and produces;
- which work is deterministic versus model-generated;
- model-selection or fallback behavior when implemented;
- failure handling and whether output is advisory or authoritative.

### Reliability and operations

Include when scheduling, queues, retries, rate limiting, logging, monitoring, or batch pipelines exist. Describe only implemented safeguards and operational constraints.

### Tests and quality

Include when test files or test commands exist. List verified commands and evidence-backed results. Do not reuse stale coverage percentages without a current report or clearly dated source.

### Documentation

Include when meaningful supporting documents exist. Link only maintained, user-relevant documents; do not enumerate every Markdown file.

### Screens, examples, or usage

Include for user-facing applications, libraries, or CLIs when screenshots, examples, sample inputs, or stable usage flows exist.

### Pricing or plans

Include only when pricing or plan limits are part of the implemented product and are verified in code or approved product documentation.

### Architecture

Include when system boundaries or data flows materially help users or contributors understand the project. Prefer a compact text or Mermaid diagram that matches the implementation.

### Docker or deployment

Include when Dockerfiles, compose files, deployment configuration, or verified deployment instructions exist. Do not claim a service is deployed merely because configuration files exist.

### License and contributing

Include only when `LICENSE*` or `CONTRIBUTING.md` exists, and link to the actual file.

### Limitations and roadmap

Include when known constraints or planned work are documented. Separate limitations from planned features and label dates or versions when relevant.

## API documentation split

When API endpoints exist:

- summarize the API purpose and base path in the README;
- place endpoint details in `docs/API.md` unless an authoritative API document already exists;
- document method, path, authentication, purpose, request fields, response fields, and meaningful error cases from code or schemas;
- include request and response examples only when they can be derived safely;
- avoid real tokens, user data, production URLs, and secret headers.

## Project-type detection

Assign multiple tags when appropriate.

| Type | Evidence |
|---|---|
| web | React, Vue, Angular, Next.js, FastAPI, Express, Django, Flask, routes, or browser assets |
| cli | executable entry points, `bin`, argparse, Click, Typer, Commander, or shell command interfaces |
| library | package exports, publishing configuration, public modules, or reusable SDK structure |
| ai | OpenAI, Anthropic, LangChain, Google GenAI, Transformers, Torch, prompt, or inference code |
| automation | schedulers, queues, cron, Celery, Airflow, workers, or pipeline orchestration |
| data | pandas, Spark, ETL, analytics, transformation, or dataset-processing code |

## Scan targets

| Target | Evidence to collect |
|---|---|
| `package.json`, lockfiles | scripts, runtime dependencies, package metadata |
| `requirements*.txt`, `pyproject.toml`, `Pipfile` | Python dependencies and commands |
| `go.mod`, `Cargo.toml`, Gradle files | language and build system |
| entry points and app bootstrap | runtime flow and startup commands |
| routers, controllers, schemas, tests | API behavior and examples |
| `.env.example` and config code | environment-variable names and purposes |
| test directories and CI | test commands and verified automation |
| `Dockerfile*`, compose, deployment config | container or deployment workflow |
| `Phase/`, roadmap, backlog | current status and planned scope |
| `LICENSE*`, `CONTRIBUTING.md` | license and contribution guidance |

Never scan secret values from `.env`, private keys, credentials, or token stores for README generation.

## Writing rules

| Rule | Application |
|---|---|
| Evidence first | Describe only files, behavior, and status supported by the repository or user-provided facts. |
| Concise core | Keep onboarding information in the README and move detailed reference material to `docs/`. |
| Bilingual parity | Keep English and Korean section order, facts, links, commands, and status equivalent. |
| Verified commands | Use commands found in manifests, automation, or project instructions. |
| Safe examples | Use placeholders for tokens, IDs, URLs, emails, and user data. |
| Relative links | Prefer repository-relative links and verify their targets. |
| Honest status | Separate implemented, verified, planned, deprecated, and out-of-scope items. |
| Minimal marketing | Avoid unsupported superlatives and performance claims. |
