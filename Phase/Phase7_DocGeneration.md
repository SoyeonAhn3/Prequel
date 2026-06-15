# Phase 7 — Document Preview & Generation `🟡 In Progress (7a done)`

> A live kickoff-document preview that is **assembled on read** from the project's structured session data — it always reflects the current state of the interview, design, and finalize steps without any pre-generation or storage.

**Status**: 🟡 In Progress — 7a (preview + Markdown export) done; 7b (Mermaid diagrams) remaining
**Prerequisites**: Phase 4 (interview insights), Phase 5 (design), Phase 6 (finalize)

---

## Overview

Phase 7 implements the **live document preview** — a read-only viewer of the kickoff document.

> **⚠️ Implementation note (Phase 7a)**: The shipped design **diverges from the original plan**. The original plan called for *progressive generation* — generating doc v1/v2/v3 at checkpoints, persisting them to `projects.kickoff_doc`, and tracking `doc_version`, triggered automatically after each phase. This was **replaced** by **on-read assembly**: there is no stored document and no `doc_version`. Instead, every request rebuilds the document from the canonical interview / design / finalize sessions via `build_sections()`. The preview is therefore always current, and there are no auto-trigger hooks to maintain.

**Design reference**: `ui-reference/screen-document-preview.jsx`

**How the document is assembled**:

```
GET /document-model  → _load_sections() pulls canonical sessions
                        (interview insights + design + finalize)
                        → build_sections() → 7 sections, each complete | empty
                        → returned with completeness {complete, total, percent}

GET /export/markdown → same _load_sections() → sections_to_markdown()
                        → streamed .md download (complete sections only)
```

**Key rules**:
- The document is assembled live on every read — no stored copy, no version number.
- A section is `complete` only when its backing step data exists and produced content; otherwise `empty` (2-state, not 3).
- The document is read-only (inline editing is V2).
- Markdown download only (no PDF — V2).
- No share feature (V2).
- Empty-document handling lives on the preview page (guidance + "back to interview"), not on the RightPanel button.

---

## Deliverables

| # | Task | Area | Status | Related FR |
|---|---|---|---|---|
| **Backend** | | | | |
| 1 | `doc_model.py` — on-read section assembly (`build_sections`, per-section `*_md` builders, `sections_to_markdown`) | Backend | ✅ | FR-003 |
| 2 | `GET /api/projects/{id}/document-model` — live document model (sections + completeness) JSON | Backend | ✅ | FR-003 |
| 3 | `GET /api/projects/{id}/export/markdown` — MD file download (UTF-8 filename, 404 when nothing complete) | Backend | ✅ | FR-004 |
| 4 | Section status derived exactly from backing data (no markdown guessing) | Backend | ✅ | FR-003 |
| — | ~~Progressive v1/v2/v3 generation + `doc_version` + auto-triggers~~ | Backend | ⛔ Dropped | superseded by on-read assembly |
| **Frontend** | | | | |
| 5 | DocumentPreviewPage — 2-column layout (TOC sidebar + document body) | Frontend | ✅ | FR-003 |
| 6 | TOC sidebar — project meta, completeness card (%/bar/N·M), section contents with status dots | Frontend | ✅ | FR-003 |
| 7 | Document body — per-section cards (Markdown via shared `<Markdown>`) | Frontend | ✅ | FR-003 |
| 8 | Action bar — "DOCUMENT PREVIEW" header + "실시간 업데이트" indicator + Markdown download button | Frontend | ✅ | FR-004 |
| 9 | Empty states — empty document ("아직 문서가 준비되지 않았어요") + per-section "아직 작성되지 않았어요" | Frontend | ✅ | FR-003 |
| 10 | RightPanel "문서 미리보기" button → DocumentPreviewPage; route `/projects/:projectId/document` | Frontend | ✅ | FR-003 |
| 11 | **Mermaid.js SVG rendering** (architecture / ERD diagrams) | Frontend | 🔲 7b | FR-005 |
| 12 | Per-section `kind` + structured `data` exposed via `/document-model` (markdown `content` & export unchanged) | Backend | ✅ 2026-06-15 | FR-003 |
| 13 | Dashboard-summary section rendering — building blocks A–E (stat strip / data table+chips / meter row / layer band / callout), one renderer per `kind` | Frontend | ✅ 2026-06-15 | FR-003 |

---

## Implementation Details

### Document Model (on-read assembly)

**File**: `backend/app/core/doc_model.py`

`build_sections(project, insights, design, finalize, interview_done)` produces **7 canonical sections**. Each is built by a dedicated `*_md` function and is `complete` only when its backing data exists and the builder returns non-empty content:

| # | id | Section | Source | Complete when |
|---|---|---|---|---|
| 01 | `profile` | 프로젝트 프로필 | interview insights + project meta | interview done OR any insight captured |
| 02 | `features` | 기능 정의 | `design.requirements` | requirements present |
| 03 | `architecture` | 시스템 구조 | `design.architecture.components` | components present |
| 04 | `data` | 데이터 구조 | `design.data_model.entities` | entities present |
| 05 | `ai` | AI 흐름 | `design.ai_workflow` | ai_workflow present |
| 06 | `evaluation` | 정직한 평가 | `finalize.evaluation` | evaluation present |
| 07 | `dod` | 완료 조건 | `finalize.done_criteria` / `gaps` / `checklist` | any present |

- **Two states only**: `complete` / `empty` (the original `in-progress` state was dropped).
- `sections_to_markdown()` flattens **only complete sections** into one `.md`, demoting in-content headings (`_demote_headings`) so the section is `h2` and its content starts at `h4` (capped at `h6`).
- `doc_engine.extract_all_insights()` is still used to derive insights from interview messages when `_insights` is absent.

### Section loading

**File**: `backend/app/api/export.py` — `_load_sections(sb, project)`

Shared by both endpoints so the preview and the download reflect the same data:
- interview: latest `completed` session (else most recent), insights from `_insights` or extracted from messages
- design / finalize: canonical session chosen via `pick_canonical_session()` (`DESIGN_STEP_COLS` / `FINALIZE_STEP_COLS`)

### Endpoints

**File**: `backend/app/api/export.py`

| Method | Route | Returns |
|---|---|---|
| `GET` | `/api/projects/{id}/document-model` | `{ project, sections[], completeness{complete,total,percent} }` |
| `GET` | `/api/projects/{id}/export/markdown` | `text/markdown` stream; `404` when no section is complete |

- Both enforce ownership (`user_id`) and `deleted_at is null`.
- Markdown download sets `Content-Disposition` with an ASCII `filename` fallback **and** UTF-8 `filename*` for non-ASCII project names.

### Document Preview Page

**File**: `frontend/src/pages/DocumentPreviewPage.tsx`
**Route**: `/projects/:projectId/document`

2-column layout (based on `screen-document-preview.jsx`):

**Left sidebar** (280px):
- PROJECT label + name + type/language tags
- Completeness card (percent + progress bar + "N / M 섹션 완료")
- CONTENTS: numbered sections with status dots (complete=green / empty=subtle), click to scroll
- "내 프로젝트로" button

**Main area**:
- Action bar: "DOCUMENT PREVIEW" / "킥오프 문서 미리보기" header + "실시간 업데이트" indicator
- Document header: "KICKOFF DOCUMENT · DRAFT", project name (h1), description, type/status tags, Markdown download button
- Section cards: number + title + status badge; complete → `<Markdown>` render, empty → dashed "아직 작성되지 않았어요"

**States**:
- loading spinner
- project not found
- empty document (`completeness.complete === 0`) → "아직 문서가 준비되지 않았어요" + "인터뷰로 돌아가기"

### Preview entry

**File**: `frontend/src/components/interview/RightPanel.tsx`

The "문서 미리보기" button **always navigates** to `/projects/${projectId}/document`. There is no `doc_version` gate or toast — the empty-document case is handled by the preview page itself (unlike the original plan, which gated the button).

### Dashboard summary view (2026-06-15)

Section bodies render as **dashboard-summary blocks** instead of raw markdown. The markdown `content` and the Markdown export are unchanged — only the on-screen rendering differs.

- **Backend** (`doc_model.py`): each section carries `kind` + structured `data` (requirements with priority counts, evaluation dimensions with scores, entity fields, etc.) alongside `content`. `build_sections` adds per-section `*_data` extractors; `/document-model` returns them. `sections_to_markdown` / export untouched. `profile_md` was refactored to share `_profile_grouped` with `profile_data` so markdown output is byte-identical.
- **Frontend**:
  - `components/viewer/blocks.tsx` — building blocks: **A** StatStrip, **B** DataTable + Chip, **C** MeterRow, **D** LayerBand/NodeCard, **E** Callout.
  - `components/viewer/DocSections.tsx` — `DocSectionBody` picks one renderer per `kind` (profile/features/architecture/data/ai/evaluation/dod); unknown kinds fall back to `<Markdown>`.
  - `DocumentPreviewPage` renders complete sections via `DocSectionBody`.
- **Block mapping**: profile → stat + callout + group cards; features → priority stat + chip table; architecture → stat + layer band + tech table; data → stat + per-entity field tables; ai → stat + I/O/fallback tables; evaluation → verdict stat + score meters + recommendation callout; dod → stat + DoD table + gap cards + checklist.
- **Tokens**: gray-minimal; priority red(MUST)/blue(SHOULD)/gray(COULD); eval green/yellow/red; numbers monospace; Pretendard + JetBrains Mono loaded via CDN in `index.html`.

---

## Design Decisions

| Decision | Choice | Rationale |
|---|---|---|
| Generation model | **On-read assembly** (not progressive pre-generation) | Always current; no stored copy, no `doc_version`, no auto-trigger hooks to maintain |
| Document storage | **None** — rebuilt from session data each read | Single source of truth is the structured session data |
| Section states | `complete` / `empty` (2-state) | Section status is derived exactly from backing data; no need to guess "in-progress" |
| Export format | MD only | PDF adds deploy complexity (WeasyPrint). V2 |
| Filename encoding | ASCII `filename` + UTF-8 `filename*` | Header values are latin-1; non-ASCII names need `filename*` |
| Share feature | None | V2 (with link sharing + permissions) |
| Empty-doc handling | On the preview page, not the entry button | Single place to explain "nothing yet"; button stays simple |
| Mermaid rendering | Browser Mermaid.js (7b) | No server, open-source, text→SVG |
| Section rendering | Dashboard-summary blocks from structured `data` (not raw markdown) | Better readability; markdown `content` & export stay unchanged for download |

---

## Completion Criteria

- [x] `GET /document-model` returns live sections + completeness
- [x] Section status derived exactly from backing step data
- [x] Markdown download returns a valid `.md` (UTF-8 filename), 404 when nothing complete
- [x] Preview page: TOC + completeness card + section cards render
- [x] Empty document + empty section states render
- [x] RightPanel "문서 미리보기" → preview page
- [ ] **Mermaid diagrams render as SVG in the architecture / data sections (7b)**

---

## Change Log

| Date | Description |
|---|---|
| 2026-05-22 | Initial creation — extracted from Phase 5 (Design & Doc Generation) |
| 2026-05-25 | Prerequisites unified to Phase 6. Pipeline input sources reordered |
| 2026-05-26 | Full restructure: single-shot → progressive generation (v1/v2/v3). PDF export removed (V2). Share feature removed (V2). UI based on screen-document-preview.jsx |
| 2026-06-15 | **Doc synced to shipped code (Phase 7a).** Progressive generation / `doc_version` / auto-triggers **dropped** in favor of on-read assembly (`doc_model.build_sections`). Endpoints corrected to `GET /document-model` + `GET /export/markdown`. Sections are 2-state (complete/empty). RightPanel button always navigates. Only Mermaid (7b) remains |
| 2026-06-15 | **Dashboard summary view.** Section bodies render as building blocks (stat / table+chips / meter / band / callout) from per-section `kind`+`data` exposed by `/document-model`; markdown `content` & MD export unchanged. Added `blocks.tsx` + `DocSections.tsx`; Pretendard/JetBrains Mono loaded. Mermaid still 7b |

---
---

# Phase 7 — 문서 미리보기 & 생성 `🟡 진행 중 (7a 완료)`

> 프로젝트의 구조화된 세션 데이터에서 **읽을 때마다 실시간으로 조립**되는 라이브 킥오프 문서 미리보기 — 사전 생성·저장 없이 인터뷰/설계/마무리 단계의 현재 상태를 항상 반영한다.

**상태**: 🟡 진행 중 — 7a(미리보기 + Markdown 내보내기) 완료, 7b(Mermaid 다이어그램) 남음
**선행 조건**: Phase 4(인터뷰 인사이트), Phase 5(설계), Phase 6(마무리)

---

## 개요

Phase 7은 **라이브 문서 미리보기** — 킥오프 문서의 읽기 전용 뷰어를 구현한다.

> **⚠️ 구현 노트 (Phase 7a)**: 실제 구현은 **원래 계획과 다르다**. 원래는 *점진적 생성* — 체크포인트마다 doc v1/v2/v3를 생성해 `projects.kickoff_doc`에 저장하고 `doc_version`을 추적하며, 각 Phase 완료 시 자동 트리거하는 방식이었다. 이를 **읽을 때 조립** 방식으로 **대체**했다: 저장된 문서도 `doc_version`도 없다. 대신 매 요청마다 `build_sections()`로 인터뷰/설계/마무리 세션에서 문서를 다시 만든다. 따라서 미리보기는 항상 최신이고, 유지해야 할 자동 트리거 훅도 없다.

**디자인 레퍼런스**: `ui-reference/screen-document-preview.jsx`

**문서 조립 방식**:

```
GET /document-model  → _load_sections()가 표준 세션을 불러옴
                        (인터뷰 인사이트 + 설계 + 마무리)
                        → build_sections() → 7개 섹션, 각 complete | empty
                        → completeness {complete, total, percent}와 함께 반환

GET /export/markdown → 동일한 _load_sections() → sections_to_markdown()
                        → .md 다운로드 스트리밍 (complete 섹션만 포함)
```

**핵심 규칙**:
- 문서는 읽을 때마다 실시간 조립 — 저장본도 버전 번호도 없음
- 섹션은 백업 데이터가 존재하고 내용이 생성됐을 때만 `complete`, 아니면 `empty` (2상태, 3상태 아님)
- 문서는 읽기 전용 (인라인 편집은 V2)
- Markdown 다운로드만 지원 (PDF 없음 — V2)
- 공유 기능 없음 (V2)
- 빈 문서 처리는 RightPanel 버튼이 아니라 미리보기 페이지에서 담당 (안내 + "인터뷰로 돌아가기")

---

## 완료 / 예정 항목

| # | 작업 | 영역 | 상태 | 관련 FR |
|---|---|---|---|---|
| **백엔드** | | | | |
| 1 | `doc_model.py` — 읽을 때 섹션 조립 (`build_sections`, 섹션별 `*_md` 빌더, `sections_to_markdown`) | Backend | ✅ | FR-003 |
| 2 | `GET /api/projects/{id}/document-model` — 라이브 문서 모델(섹션 + 완성도) JSON | Backend | ✅ | FR-003 |
| 3 | `GET /api/projects/{id}/export/markdown` — MD 다운로드 (UTF-8 파일명, complete 없으면 404) | Backend | ✅ | FR-004 |
| 4 | 섹션 상태를 백업 데이터에서 정확히 도출 (markdown 추측 없음) | Backend | ✅ | FR-003 |
| — | ~~점진적 v1/v2/v3 생성 + `doc_version` + 자동 트리거~~ | Backend | ⛔ 폐기 | 읽을 때 조립으로 대체 |
| **프론트엔드** | | | | |
| 5 | DocumentPreviewPage — 2컬럼 레이아웃 (TOC 사이드바 + 문서 본문) | Frontend | ✅ | FR-003 |
| 6 | TOC 사이드바 — 프로젝트 메타, 완성도 카드(%/바/N·M), 상태 도트가 있는 섹션 목차 | Frontend | ✅ | FR-003 |
| 7 | 문서 본문 — 섹션별 카드 (공용 `<Markdown>`으로 렌더) | Frontend | ✅ | FR-003 |
| 8 | 액션바 — "DOCUMENT PREVIEW" 헤더 + "실시간 업데이트" 표시 + Markdown 다운로드 버튼 | Frontend | ✅ | FR-004 |
| 9 | 빈 상태 — 빈 문서("아직 문서가 준비되지 않았어요") + 섹션별 "아직 작성되지 않았어요" | Frontend | ✅ | FR-003 |
| 10 | RightPanel "문서 미리보기" 버튼 → DocumentPreviewPage; 라우트 `/projects/:projectId/document` | Frontend | ✅ | FR-003 |
| 11 | **Mermaid.js SVG 렌더링** (아키텍처 / ERD 다이어그램) | Frontend | 🔲 7b | FR-005 |
| 12 | 섹션별 `kind` + 구조화 `data`를 `/document-model`로 노출 (markdown `content`·내보내기 불변) | Backend | ✅ 2026-06-15 | FR-003 |
| 13 | 대시보드 요약 섹션 렌더링 — 빌딩블록 A~E (스탯 스트립 / 데이터표+chip / 미터행 / 레이어 밴드 / 콜아웃), `kind`별 렌더러 1개 | Frontend | ✅ 2026-06-15 | FR-003 |

---

## 구현 상세

### 문서 모델 (읽을 때 조립)

**파일**: `backend/app/core/doc_model.py`

`build_sections(project, insights, design, finalize, interview_done)`가 **7개 표준 섹션**을 만든다. 각 섹션은 전용 `*_md` 함수로 생성되며, 백업 데이터가 존재하고 빌더가 비어있지 않은 내용을 반환할 때만 `complete`:

| # | id | 섹션 | 소스 | complete 조건 |
|---|---|---|---|---|
| 01 | `profile` | 프로젝트 프로필 | 인터뷰 인사이트 + 프로젝트 메타 | 인터뷰 완료 OR 인사이트 존재 |
| 02 | `features` | 기능 정의 | `design.requirements` | requirements 존재 |
| 03 | `architecture` | 시스템 구조 | `design.architecture.components` | components 존재 |
| 04 | `data` | 데이터 구조 | `design.data_model.entities` | entities 존재 |
| 05 | `ai` | AI 흐름 | `design.ai_workflow` | ai_workflow 존재 |
| 06 | `evaluation` | 정직한 평가 | `finalize.evaluation` | evaluation 존재 |
| 07 | `dod` | 완료 조건 | `finalize.done_criteria` / `gaps` / `checklist` | 하나라도 존재 |

- **2상태만**: `complete` / `empty` (원래의 `in-progress` 상태는 폐기)
- `sections_to_markdown()`은 **complete 섹션만** 하나의 `.md`로 합치며, 내용 내 헤딩을 `_demote_headings`로 한 단계 낮춰 섹션은 `h2`, 내용은 `h4`부터 시작(최대 `h6`)
- `_insights`가 없을 때 인터뷰 메시지에서 인사이트를 도출하기 위해 `doc_engine.extract_all_insights()`를 계속 사용

### 섹션 로딩

**파일**: `backend/app/api/export.py` — `_load_sections(sb, project)`

미리보기와 다운로드가 동일 데이터를 반영하도록 두 엔드포인트가 공유:
- 인터뷰: 최신 `completed` 세션(없으면 가장 최근), 인사이트는 `_insights` 또는 메시지에서 추출
- 설계 / 마무리: `pick_canonical_session()`으로 표준 세션 선택 (`DESIGN_STEP_COLS` / `FINALIZE_STEP_COLS`)

### 엔드포인트

**파일**: `backend/app/api/export.py`

| 메서드 | 라우트 | 반환 |
|---|---|---|
| `GET` | `/api/projects/{id}/document-model` | `{ project, sections[], completeness{complete,total,percent} }` |
| `GET` | `/api/projects/{id}/export/markdown` | `text/markdown` 스트림; complete 섹션이 없으면 `404` |

- 둘 다 소유권(`user_id`)과 `deleted_at is null` 검증
- Markdown 다운로드는 ASCII `filename` 폴백 **및** 비ASCII 프로젝트명용 UTF-8 `filename*`을 함께 설정

### 문서 미리보기 페이지

**파일**: `frontend/src/pages/DocumentPreviewPage.tsx`
**라우트**: `/projects/:projectId/document`

2컬럼 레이아웃 (`screen-document-preview.jsx` 기반):

**왼쪽 사이드바** (280px):
- PROJECT 라벨 + 프로젝트명 + 유형/언어 태그
- 완성도 카드 (퍼센트 + 프로그레스바 + "N / M 섹션 완료")
- CONTENTS: 번호가 매겨진 섹션, 상태 도트(완료=green / 미작성=subtle), 클릭 시 스크롤
- "내 프로젝트로" 버튼

**메인 영역**:
- 액션바: "DOCUMENT PREVIEW" / "킥오프 문서 미리보기" 헤더 + "실시간 업데이트" 표시
- 문서 헤더: "KICKOFF DOCUMENT · DRAFT", 프로젝트명(h1), 설명, 유형/상태 태그, Markdown 다운로드 버튼
- 섹션 카드: 번호 + 제목 + 상태 배지; complete → `<Markdown>` 렌더, empty → dashed "아직 작성되지 않았어요"

**상태**:
- 로딩 스피너
- 프로젝트 없음
- 빈 문서(`completeness.complete === 0`) → "아직 문서가 준비되지 않았어요" + "인터뷰로 돌아가기"

### 미리보기 진입

**파일**: `frontend/src/components/interview/RightPanel.tsx`

"문서 미리보기" 버튼은 **항상** `/projects/${projectId}/document`로 이동한다. `doc_version` 게이트나 토스트는 없다 — 빈 문서 경우는 미리보기 페이지가 처리(원래 계획은 버튼에서 게이트했음).

### 대시보드 요약 뷰 (2026-06-15)

섹션 본문을 원시 markdown 대신 **대시보드 요약 블록**으로 렌더링한다. markdown `content`와 Markdown 내보내기는 불변 — 화면 렌더링만 달라진다.

- **백엔드** (`doc_model.py`): 각 섹션이 `content`와 함께 `kind` + 구조화 `data`(우선순위 카운트가 있는 요구사항, 점수가 있는 평가 항목, 엔티티 필드 등)를 가진다. `build_sections`에 섹션별 `*_data` 추출 함수 추가, `/document-model`이 반환. `sections_to_markdown`·내보내기는 그대로. `profile_md`는 `_profile_grouped`를 `profile_data`와 공유하도록 리팩터해 markdown 출력이 바이트 단위로 동일.
- **프론트엔드**:
  - `components/viewer/blocks.tsx` — 빌딩블록: **A** StatStrip, **B** DataTable + Chip, **C** MeterRow, **D** LayerBand/NodeCard, **E** Callout.
  - `components/viewer/DocSections.tsx` — `DocSectionBody`가 `kind`별 렌더러 1개 선택(profile/features/architecture/data/ai/evaluation/dod); 미지원 kind는 `<Markdown>` 폴백.
  - `DocumentPreviewPage`가 complete 섹션을 `DocSectionBody`로 렌더.
- **블록 매핑**: profile → 스탯+콜아웃+그룹 카드; features → 우선순위 스탯+chip 표; architecture → 스탯+레이어 밴드+기술 표; data → 스탯+엔티티별 필드 표; ai → 스탯+입출력/폴백 표; evaluation → 판정 스탯+점수 미터+권고 콜아웃; dod → 스탯+DoD 표+빈틈 카드+체크리스트.
- **토큰**: 회색 미니멀; 우선순위 빨(MUST)/파(SHOULD)/회(COULD); 평가 초록/노랑/빨강; 숫자 monospace; `index.html`에서 Pretendard + JetBrains Mono CDN 로드.

---

## 설계 결정 사항

| 결정 | 선택 | 근거 |
|---|---|---|
| 생성 방식 | **읽을 때 조립** (점진적 사전 생성 아님) | 항상 최신; 저장본·`doc_version`·자동 트리거 훅 불필요 |
| 문서 저장 | **없음** — 매 읽기마다 세션 데이터에서 재생성 | 단일 진실 공급원은 구조화된 세션 데이터 |
| 섹션 상태 | `complete` / `empty` (2상태) | 상태를 백업 데이터에서 정확히 도출, "in-progress" 추측 불필요 |
| 내보내기 형식 | MD만 | PDF는 배포 복잡성(WeasyPrint) 추가. V2 |
| 파일명 인코딩 | ASCII `filename` + UTF-8 `filename*` | 헤더 값은 latin-1; 비ASCII 이름은 `filename*` 필요 |
| 공유 기능 | 없음 | V2 (링크 공유 + 권한 관리와 함께) |
| 빈 문서 처리 | 진입 버튼이 아닌 미리보기 페이지에서 | "아직 없음"을 한 곳에서 설명, 버튼은 단순 유지 |
| Mermaid 렌더링 | 브라우저 Mermaid.js (7b) | 서버 불필요, 오픈소스, 텍스트→SVG |
| 섹션 렌더링 | 구조화 `data` 기반 대시보드 블록(원시 markdown 아님) | 가독성 향상; 다운로드용 markdown `content`·내보내기는 불변 |

---

## 완료 기준

- [x] `GET /document-model`이 라이브 섹션 + 완성도 반환
- [x] 섹션 상태를 백업 단계 데이터에서 정확히 도출
- [x] Markdown 다운로드가 유효한 `.md`(UTF-8 파일명) 반환, complete 없으면 404
- [x] 미리보기 페이지: TOC + 완성도 카드 + 섹션 카드 렌더
- [x] 빈 문서 + 빈 섹션 상태 렌더
- [x] RightPanel "문서 미리보기" → 미리보기 페이지
- [ ] **아키텍처 / 데이터 섹션에서 Mermaid 다이어그램이 SVG로 렌더 (7b)**

---

## 변경 이력

| 날짜 | 내용 |
|---|---|
| 2026-05-22 | 최초 작성 — Phase 5(설계 & 문서 생성)에서 분리 |
| 2026-05-25 | 선행조건을 Phase 6으로 단일화. 파이프라인 입력 소스 순서 변경 |
| 2026-05-26 | 전면 재구조화: 단발 생성 → 점진적 생성(v1/v2/v3). PDF 내보내기 삭제(V2). 공유 기능 삭제(V2). screen-document-preview.jsx 기반 UI |
| 2026-06-15 | **문서를 실제 코드(Phase 7a)에 맞게 동기화.** 점진적 생성 / `doc_version` / 자동 트리거를 읽을 때 조립(`doc_model.build_sections`)으로 **폐기·대체**. 엔드포인트를 `GET /document-model` + `GET /export/markdown`으로 정정. 섹션은 2상태(complete/empty). RightPanel 버튼은 항상 이동. Mermaid(7b)만 남음 |
| 2026-06-15 | **대시보드 요약 뷰.** 섹션 본문을 `/document-model`이 노출하는 섹션별 `kind`+`data` 기반 빌딩블록(스탯 / 표+chip / 미터 / 밴드 / 콜아웃)으로 렌더링; markdown `content`·MD 내보내기는 불변. `blocks.tsx` + `DocSections.tsx` 추가; Pretendard/JetBrains Mono 로드. Mermaid는 7b 유지 |
