# Phase 7 — Document Generation & Export `🔲 Not Started`

> Generate the final kickoff document from all pipeline outputs, render Mermaid diagrams, and provide Markdown export with a section-based result viewer.

**Status**: 🔲 Not Started
**Prerequisites**: Phase 6 completion (Design skills) OR Phase 5 gap/checklist flow (if Design was skipped)

---

## Overview

Phase 7 is the final production step of the pipeline. The document engine takes all accumulated outputs — interview insights, evaluation, completion criteria, design artifacts (if applicable), gap resolutions, and dev checklist — and generates a comprehensive Markdown kickoff document with Mermaid diagrams. The result viewer displays the document as section-based cards, and users can download the Markdown file.

**Pipeline input sources**:
- Phase 4: Interview insights, AI suggestions
- Phase 5: Evaluation, completion criteria, gap resolutions (if applicable), dev checklist (if applicable)
- Phase 6: Requirements, architecture, data model, AI workflow (if Design was chosen)

---

## Deliverables

| # | Task | Area | Status | Related FR |
|---|---|---|---|---|
| 1 | `doc_engine.py` — all results → Markdown kickoff doc | Backend | 🔲 | FR-003 |
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

- Runs LAST, after all prior phases are complete
- Takes full pipeline output: interview insights, suggestions, evaluation, completion criteria, requirements, architecture, data model, AI workflow
- Calls Claude API with document generation prompt
- Outputs structured Markdown with sections: Profile, Evaluation, Definition of Done, Requirements, Architecture, Data Model, AI Workflow (if applicable), Edge Cases
- Stores generated document in `projects.kickoff_doc`
- Adapts sections based on which pipeline steps were completed (with/without Design phase)

### Mermaid Diagram Generation

- Included as part of the document generation Claude API call
- Also incorporates Mermaid code generated during architecture and data model design steps (Phase 6)
- Extracted and stored separately in `projects.mermaid_code`
- Validated for Mermaid syntax before storage

### Export API

**File**: `backend/app/api/export.py`

- `GET /api/projects/{id}/export/markdown` — returns Markdown file as streaming download
- Sets proper `Content-Disposition` header for file download
- MVP-1: Markdown only. PDF export planned for v2.

### Result Viewer

**Files**: `frontend/src/pages/ResultPage.tsx`, `frontend/src/components/viewer/`

- Left sidebar: TOC with section navigation (~10 sections)
- Header: project name, type tag, status, date, download buttons
- Section cards: Profile, Requirements, Architecture, Data Model, AI Workflow, Edge Cases, Gap Resolutions, Checklist, Evaluation, DoD
- Mermaid.js integration for SVG diagram rendering in browser
- Share button displayed as disabled with "(v2)" label

---

## Design Decisions

| Decision | Choice | Rationale |
|---|---|---|
| Document generation | Single Claude API call with full pipeline context | Better coherence than per-section generation; richer input than interview-only |
| Mermaid validation | Server-side syntax check before storage | Prevent rendering failures on frontend |
| Result viewer | Read-only in MVP-1 (ADR-005) | Inline editing deferred to MVP-2 to limit scope |
| Export format | Markdown only in MVP-1 | PDF (WeasyPrint) adds deployment complexity |
| Adaptive sections | Include/exclude based on completed steps | Users who skip Design still get a valid document |

---

## Completion Criteria

- [ ] Kickoff document generated incorporating all pipeline outputs (interview + evaluation + design if applicable)
- [ ] Document displays as section-based card UI in result viewer
- [ ] Mermaid diagram renders as SVG in browser
- [ ] Markdown download produces valid `.md` file
- [ ] Share button visible but disabled with v2 indicator
- [ ] Project status changes to `completed` after document generation
- [ ] Document adapts correctly when Design phase was skipped (gap/checklist path)

---

## Change Log

| Date | Description |
|---|---|
| 2026-05-22 | Initial creation — extracted from Phase 5 (Design & Doc Generation) |

---
---

# Phase 7 — 문서 생성 & 내보내기 `🔲 미시작`

> 전체 파이프라인 출력에서 최종 킥오프 문서 생성, Mermaid 다이어그램 렌더링, Markdown 내보내기 + 섹션별 결과 뷰어.

**상태**: 🔲 미시작
**선행 조건**: Phase 6 완료 (설계 스킬) 또는 Phase 5 갭/체크리스트 플로우 (설계를 건너뛴 경우)

---

## 개요

Phase 7은 파이프라인의 최종 생산 단계이다. 문서 엔진이 축적된 모든 출력 — 인터뷰 인사이트, 평가, 완료 조건, 설계 산출물 (해당 시), 갭 해결, 개발 체크리스트 — 을 종합하여 Mermaid 다이어그램이 포함된 종합 Markdown 킥오프 문서를 생성한다. 결과 뷰어가 문서를 섹션별 카드로 표시하고, 사용자가 Markdown 파일을 다운로드할 수 있다.

**파이프라인 입력 소스**:
- Phase 4: 인터뷰 인사이트, AI 제안
- Phase 5: 평가, 완료 조건, 갭 해결 (해당 시), 개발 체크리스트 (해당 시)
- Phase 6: 요구사항, 아키텍처, 데이터 모델, AI 워크플로우 (설계를 선택한 경우)

---

## 완료 예정 / 완료 항목

| # | 작업 | 영역 | 상태 | 관련 FR |
|---|---|---|---|---|
| 1 | `doc_engine.py` — 전체 결과 → Markdown 킥오프 문서 | Backend | 🔲 | FR-003 |
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

- 모든 이전 Phase 완료 후 **맨 마지막**에 실행
- 전체 파이프라인 출력을 입력으로 사용: 인터뷰 인사이트, 제안, 평가, 완료 조건, 요구사항, 아키텍처, 데이터 모델, AI 워크플로우
- 문서 생성 프롬프트로 Claude API 호출
- 구조화된 Markdown 출력: 프로필, 평가, 완료조건, 요구사항, 아키텍처, 데이터 모델, AI 워크플로우 (해당 시), 엣지케이스
- 생성된 문서를 `projects.kickoff_doc`에 저장
- 완료된 파이프라인 단계에 따라 섹션을 적응적으로 포함/제외 (설계 Phase 유무)

### Mermaid 다이어그램 생성

- 문서 생성 Claude API 호출의 일부로 포함
- 아키텍처 및 데이터 모델 설계 단계 (Phase 6)에서 생성된 Mermaid 코드도 통합
- 별도 추출하여 `projects.mermaid_code`에 저장
- 저장 전 Mermaid 문법 검증

### 내보내기 API

**파일**: `backend/app/api/export.py`

- `GET /api/projects/{id}/export/markdown` — Markdown 파일을 스트리밍 다운로드로 반환
- 파일 다운로드를 위한 `Content-Disposition` 헤더 설정
- MVP-1: Markdown만. PDF 내보내기는 v2 예정.

### 결과 뷰어

**파일**: `frontend/src/pages/ResultPage.tsx`, `frontend/src/components/viewer/`

- 왼쪽 사이드바: 섹션 네비게이션이 있는 TOC (~10개 섹션)
- 헤더: 프로젝트명, 유형 태그, 상태, 날짜, 다운로드 버튼
- 섹션 카드: 프로필, 요구사항, 아키텍처, 데이터 모델, AI 워크플로우, 엣지케이스, 갭 해결, 체크리스트, 평가, 완료조건
- 브라우저에서 SVG 다이어그램 렌더링을 위한 Mermaid.js 통합
- 공유 버튼은 "(v2)" 라벨과 함께 비활성 상태로 표시

---

## 설계 결정 사항

| 결정 | 선택 | 근거 |
|---|---|---|
| 문서 생성 방식 | 전체 파이프라인 컨텍스트를 포함한 단일 Claude API 호출 | 섹션별 생성보다 일관성이 높음; 인터뷰만보다 풍부한 입력 |
| Mermaid 검증 | 저장 전 서버 측 문법 검사 | 프론트엔드 렌더링 실패 방지 |
| 결과 뷰어 | MVP-1에서는 읽기 전용 (ADR-005) | 인라인 편집은 MVP-2로 범위 제한 |
| 내보내기 형식 | MVP-1에서는 Markdown만 | PDF(WeasyPrint)는 배포 복잡성 추가 |
| 적응형 섹션 | 완료된 단계에 따라 포함/제외 | 설계를 건너뛴 사용자도 유효한 문서 생성 |

---

## 완료 기준

- [ ] 전체 파이프라인 출력 (인터뷰 + 평가 + 해당 시 설계)을 반영한 킥오프 문서 생성
- [ ] 결과 뷰어에서 문서가 섹션별 카드 UI로 표시
- [ ] Mermaid 다이어그램이 브라우저에서 SVG로 렌더링
- [ ] Markdown 다운로드가 유효한 `.md` 파일 생성
- [ ] 공유 버튼이 v2 표시와 함께 보이되 비활성
- [ ] 문서 생성 후 프로젝트 상태가 `completed`로 변경
- [ ] 설계 Phase를 건너뛴 경우 (갭/체크리스트 경로) 문서가 정상적으로 적응

---

## 변경 이력

| 날짜 | 내용 |
|---|---|
| 2026-05-22 | 최초 작성 — Phase 5 (설계 & 문서 생성)에서 분리 |
