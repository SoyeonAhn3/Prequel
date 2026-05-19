# Phase 5 — Document Generation & Result Viewer `🔲 Not Started`

> Build the kickoff document generation engine, Mermaid diagram generation, export API, and result viewer UI.

**Status**: 🔲 Not Started
**Prerequisites**: Phase 4 completion (Interview pipeline, session management)

---

## Overview

Transform completed interview data into deliverable outputs. Backend implements `doc_engine.py` to generate Markdown kickoff documents from interview answers, auto-generates Mermaid architecture diagram code, and provides a Markdown download API. Frontend builds the result viewer with section-based card UI, Mermaid.js SVG rendering, and download buttons. The share button is displayed as disabled (v2 feature).

---

## Deliverables

| # | Task | Area | Status | Related FR |
|---|---|---|---|---|
| 1 | `doc_engine.py` — interview results → Markdown kickoff doc | Backend | 🔲 | FR-003 |
| 2 | Mermaid architecture diagram code generation | Backend | 🔲 | FR-005 |
| 3 | Export API (Markdown download) | Backend | 🔲 | FR-004 |
| 4 | Project status transition to `completed` | Backend | 🔲 | FR-013 |
| 5 | Result viewer — section-based card UI | Frontend | 🔲 | FR-003, FR-004 |
| 6 | Mermaid.js SVG rendering | Frontend | 🔲 | FR-005 |
| 7 | Markdown download button | Frontend | 🔲 | FR-004 |
| 8 | Share button (disabled, v2) | Frontend | 🔲 | — |

---

## Implementation Details

### Document Generation Engine

**File**: `backend/app/core/doc_engine.py`

- Takes full interview answers (from `interview_sessions.messages`)
- Calls Claude API with document generation prompt
- Outputs structured Markdown with sections: Profile, Architecture, Data, Edge Cases, Evaluation, Definition of Done
- Stores generated document in `projects.kickoff_doc`

### Mermaid Diagram Generation

- Included as part of the document generation Claude API call
- Extracted and stored separately in `projects.mermaid_code`
- Validated for Mermaid syntax before storage

### Export API

**File**: `backend/app/api/export.py`

- `GET /api/projects/{id}/export/markdown` — returns Markdown file as streaming download
- Sets proper `Content-Disposition` header for file download
- MVP-1: Markdown only. PDF export planned for v2.

### Result Viewer

**Files**: `frontend/src/pages/ResultPage.tsx`, `frontend/src/components/viewer/`

- Left sidebar: TOC with section navigation (6 sections)
- Header: project name, type tag, status, date, download buttons
- Section cards: Profile, Architecture, Data, Edge Cases, Evaluation, DoD
- Mermaid.js integration for SVG diagram rendering in browser
- Share button displayed as disabled with "(v2)" label

---

## Design Decisions

| Decision | Choice | Rationale |
|---|---|---|
| Document generation | Single Claude API call with full interview context | Better coherence than per-section generation |
| Mermaid validation | Server-side syntax check before storage | Prevent rendering failures on frontend |
| Result viewer | Read-only in MVP-1 (ADR-005) | Inline editing deferred to MVP-2 to limit scope |
| Export format | Markdown only in MVP-1 | PDF (WeasyPrint) adds deployment complexity |

---

## Completion Criteria

- [ ] Interview completion → kickoff document generated and stored
- [ ] Document displays as section-based card UI in result viewer
- [ ] Mermaid diagram renders as SVG in browser
- [ ] Markdown download produces valid `.md` file
- [ ] Share button visible but disabled with v2 indicator
- [ ] Project status changes to `completed` after document generation

---

## Change Log

| Date | Description |
|---|---|
| 2026-05-19 | Initial creation |

---
---

# Phase 5 — 문서 생성 & 결과 뷰어 `🔲 미시작`

> 킥오프 문서 생성 엔진, Mermaid 다이어그램 생성, 내보내기 API, 결과 뷰어 UI 구현.

**상태**: 🔲 미시작
**선행 조건**: Phase 4 완료 (인터뷰 파이프라인, 세션 관리)

---

## 개요

완료된 인터뷰 데이터를 산출물로 변환한다. 백엔드는 인터뷰 답변에서 Markdown 킥오프 문서를 생성하는 `doc_engine.py`, Mermaid 아키텍처 다이어그램 코드 자동 생성, Markdown 다운로드 API를 구현한다. 프론트엔드는 섹션별 카드 UI 결과 뷰어, Mermaid.js SVG 렌더링, 다운로드 버튼을 구현한다. 공유 버튼은 비활성 상태로 표시한다 (v2 기능).

---

## 완료 예정 / 완료 항목

| # | 작업 | 영역 | 상태 | 관련 FR |
|---|---|---|---|---|
| 1 | `doc_engine.py` — 인터뷰 결과 → Markdown 킥오프 문서 생성 | Backend | 🔲 | FR-003 |
| 2 | Mermaid 아키텍처 다이어그램 코드 자동 생성 | Backend | 🔲 | FR-005 |
| 3 | 내보내기 API (Markdown 다운로드) | Backend | 🔲 | FR-004 |
| 4 | 프로젝트 status를 `completed`로 전환 | Backend | 🔲 | FR-013 |
| 5 | 결과 뷰어 — 섹션별 카드 UI | Frontend | 🔲 | FR-003, FR-004 |
| 6 | Mermaid.js SVG 렌더링 | Frontend | 🔲 | FR-005 |
| 7 | Markdown 다운로드 버튼 | Frontend | 🔲 | FR-004 |
| 8 | 공유 버튼 (비활성, v2) | Frontend | 🔲 | — |

---

## 구현 상세

### 문서 생성 엔진

**파일**: `backend/app/core/doc_engine.py`

- 전체 인터뷰 답변(`interview_sessions.messages`)을 입력으로 받음
- 문서 생성 프롬프트로 Claude API 호출
- 구조화된 Markdown 출력: 프로필, 아키텍처, 데이터, 엣지케이스, 평가, 완료조건
- 생성된 문서를 `projects.kickoff_doc`에 저장

### Mermaid 다이어그램 생성

- 문서 생성 Claude API 호출의 일부로 포함
- 별도 추출하여 `projects.mermaid_code`에 저장
- 저장 전 Mermaid 문법 검증

### 내보내기 API

**파일**: `backend/app/api/export.py`

- `GET /api/projects/{id}/export/markdown` — Markdown 파일을 스트리밍 다운로드로 반환
- 파일 다운로드를 위한 `Content-Disposition` 헤더 설정
- MVP-1: Markdown만. PDF 내보내기는 v2 예정.

### 결과 뷰어

**파일**: `frontend/src/pages/ResultPage.tsx`, `frontend/src/components/viewer/`

- 왼쪽 사이드바: 섹션 네비게이션이 있는 TOC (6개 섹션)
- 헤더: 프로젝트명, 유형 태그, 상태, 날짜, 다운로드 버튼
- 섹션 카드: 프로필, 아키텍처, 데이터, 엣지케이스, 평가, 완료조건
- 브라우저에서 SVG 다이어그램 렌더링을 위한 Mermaid.js 통합
- 공유 버튼은 "(v2)" 라벨과 함께 비활성 상태로 표시

---

## 설계 결정 사항

| 결정 | 선택 | 근거 |
|---|---|---|
| 문서 생성 방식 | 전체 인터뷰 컨텍스트를 포함한 단일 Claude API 호출 | 섹션별 생성보다 일관성이 높음 |
| Mermaid 검증 | 저장 전 서버 측 문법 검사 | 프론트엔드 렌더링 실패 방지 |
| 결과 뷰어 | MVP-1에서는 읽기 전용 (ADR-005) | 인라인 편집은 MVP-2로 범위 제한 |
| 내보내기 형식 | MVP-1에서는 Markdown만 | PDF(WeasyPrint)는 배포 복잡성 추가 |

---

## 완료 기준

- [ ] 인터뷰 완료 → 킥오프 문서 생성 및 저장
- [ ] 결과 뷰어에서 문서가 섹션별 카드 UI로 표시
- [ ] Mermaid 다이어그램이 브라우저에서 SVG로 렌더링
- [ ] Markdown 다운로드가 유효한 `.md` 파일 생성
- [ ] 공유 버튼이 v2 표시와 함께 보이되 비활성
- [ ] 문서 생성 후 프로젝트 상태가 `completed`로 변경

---

## 변경 이력

| 날짜 | 내용 |
|---|---|
| 2026-05-19 | 최초 작성 |
