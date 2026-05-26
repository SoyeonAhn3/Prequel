# Phase 7 — Document Preview & Generation `🔲 Not Started`

> Progressive live document preview that builds up as the pipeline proceeds: first available after AI suggest, updated after design and evaluation.

**Status**: 🔲 Not Started
**Prerequisites**: Phase 4 completion (AI suggest step), Phase 5/6 for updates

---

## Overview

Phase 7 implements the **live document preview** — a read-only viewer that progressively builds the kickoff document as the user advances through the pipeline. Unlike a single-shot generation at the end, the document is generated and updated at 3 key checkpoints.

**Design reference**: `ui-reference/screen-document-preview.jsx`

**Document generation checkpoints**:

```
Phase 4 AI suggest 완료 → doc v1 생성 (인터뷰 + 제안)
                           → 미리보기 활성화 (RightPanel "문서 미리보기" 버튼)

Phase 5 설계 완료 → doc v2 업데이트 (+ 요구사항/아키텍처/데이터 모델/AI 워크플로우)

Phase 6 평가&마무리 완료 → doc v3 최종 (+ 평가/완료조건/갭/체크리스트)
```

**Design skip path**:
```
Phase 4 AI suggest 완료 → doc v1
Phase 6 평가&마무리 완료 → doc v2 최종 (설계 섹션 없음)
```

**Key rules**:
- AI 제안 완료 전에 미리보기 클릭 시 → "AI 제안 단계 이후에 미리보기가 가능합니다" 안내
- 문서는 읽기 전용 (인라인 편집은 V2)
- MD 다운로드만 지원 (PDF 다운로드 X)
- 공유 기능 없음 (V2)

---

## Deliverables

| # | Task | Area | Status | Related FR |
|---|---|---|---|---|
| **Backend** | | | | |
| 1 | `doc_engine.py` — 점진적 문서 생성 (v1/v2/v3 단계별) | Backend | 🔲 | FR-003 |
| 2 | `POST /api/projects/{id}/generate-doc` — 단계별 문서 생성 트리거 | Backend | ✅ | FR-003 |
| 3 | `GET /api/projects/{id}/export/markdown` — MD 파일 다운로드 API | Backend | 🔲 | FR-004 |
| 4 | Phase 4 suggest 완료 시 doc v1 자동 생성 트리거 | Backend | 🔲 | FR-003 |
| 5 | Phase 5 설계 완료 시 doc v2 자동 업데이트 트리거 | Backend | 🔲 | FR-003 |
| 6 | Phase 6 체크리스트 완료 시 doc v3 최종 생성 + status `completed` 전환 | Backend | 🔲 | FR-003, FR-013 |
| **Frontend** | | | | |
| 7 | DocumentPreviewPage — 2컬럼 레이아웃 (TOC 사이드바 + 문서 본문) | Frontend | 🔲 | FR-003 |
| 8 | TOC 사이드바 — 프로젝트 메타, 문서 완성도, 섹션 목차 (완료/작성 중/미작성) | Frontend | 🔲 | FR-003 |
| 9 | 문서 본문 — 섹션별 카드 렌더링 (Markdown) | Frontend | 🔲 | FR-003 |
| 10 | 상단 액션바 — "DOCUMENT PREVIEW" 헤더 + MD 다운로드 버튼 | Frontend | 🔲 | FR-004 |
| 11 | 미리보기 비활성 상태 — AI 제안 전 안내 메시지 | Frontend | 🔲 | FR-003 |
| 12 | RightPanel "문서 미리보기" 버튼 → DocumentPreviewPage 연결 | Frontend | 🔲 | FR-003 |
| 13 | Mermaid.js SVG 렌더링 (아키텍처/ERD 다이어그램) | Frontend | 🔲 | FR-005 |

---

## Implementation Details

### Document Generation Engine (Progressive)

**File**: `backend/app/core/doc_engine.py` (이미 생성됨)

3단계 점진적 생성. 각 단계에서 `generate_kickoff_document()`를 호출하되, 입력 소스가 다르다:

| Version | Trigger | Input Sources | Sections |
|---|---|---|---|
| v1 | Phase 4 AI suggest 완료 | 인터뷰 인사이트 + 채택된 제안 | 프로필, 대상 사용자, 핵심 기능, 기술 스택, 데이터 소스, 성공 지표, 리스크, AI 제안 |
| v2 | Phase 5 설계 완료 | v1 + 요구사항/아키텍처/데이터 모델/AI 워크플로우 | v1 + 기능 정의, 시스템 구조, 데이터 구조, AI 흐름 |
| v3 | Phase 6 체크리스트 완료 | v2 + 평가/완료조건/갭/체크리스트 | v2 + 정직한 평가, 완료 조건, 다음 단계 |

- `projects.kickoff_doc`에 최신 문서를 덮어쓰기 저장
- `projects.doc_version`으로 현재 문서 버전 추적 (1/2/3)
- 설계 건너뛰기 시: v1 → v2(최종), v2에서 설계 섹션 제외

### Document Sections (screen-document-preview.jsx 기준)

| # | Section | Phase Source | Status Example |
|---|---|---|---|
| 01 | 프로젝트 프로필 | Phase 4 (v1) | complete |
| 02 | 기능 정의 | Phase 5 (v2) 또는 Phase 4 간략 | complete / empty |
| 03 | 시스템 구조 | Phase 5 (v2) | complete / empty |
| 04 | 데이터 구조 | Phase 5 (v2) | in-progress / empty |
| 05 | AI 흐름 | Phase 5 (v2) | empty (설계 건너뛰기 시) |
| 06 | 정직한 평가 | Phase 6 (v3) | complete / empty |
| 07 | 완료 조건 | Phase 6 (v3) | complete / empty |

각 섹션은 3가지 상태를 가진다:
- `complete` — 해당 Phase 완료, 내용 채워짐
- `in-progress` — 해당 Phase 진행 중
- `empty` — 아직 해당 Phase 미진행

### Export API

**File**: `backend/app/api/export.py`

- `GET /api/projects/{id}/export/markdown` — MD 파일 스트리밍 다운로드
- `Content-Disposition: attachment; filename="{project_name}_kickoff.md"`
- `projects.kickoff_doc`이 없으면 404
- PDF 내보내기 없음 (V2)

### Document Preview Page

**File**: `frontend/src/pages/DocumentPreviewPage.tsx`

**Route**: `/projects/:projectId/document`

2컬럼 레이아웃 (screen-document-preview.jsx 기반):

**왼쪽 사이드바** (280px):
- PROJECT 라벨 + 프로젝트명 + 유형/언어 태그
- 문서 완성도 카드 (N% + 프로그레스바 + "N / M 섹션 완료")
- CONTENTS 목차: 섹션별 번호, 제목, 상태 도트 (완료=green / 작성 중=accent / 미작성=gray), Phase 라벨 (P1/P2)
- "인터뷰로 돌아가기" 버튼

**메인 영역** (flex):
- 상단 액션바: "DOCUMENT PREVIEW" + "킥오프 문서 미리보기" 헤더, "실시간 업데이트" 표시, Markdown 다운로드 버튼
- 문서 헤더: "KICKOFF DOCUMENT · vN DRAFT · 날짜", 프로젝트명 (h1), 한줄 설명, 유형/상태 태그
- 섹션별 카드 (DocSection 컴포넌트): 번호 + 제목 + 상태 배지, Markdown 렌더링 (기존 `<Markdown>` 컴포넌트 재활용)
- complete 섹션: 내용 렌더링
- in-progress 섹션: 스피너 + "작성 중" 안내 + "이어 작성" 버튼
- empty 섹션: dashed border + "아직 작성되지 않았어요" + 안내 텍스트
- 하단 푸터: "Last updated · N분 전"

### Preview Availability Logic

**RightPanel "문서 미리보기" 버튼 동작**:

```
if (project.doc_version >= 1) {
  → navigate(`/projects/${projectId}/document`)
} else {
  → toast("AI 제안 단계 이후에 미리보기가 가능합니다")
}
```

### Auto-trigger Integration

각 Phase 완료 시 doc 자동 생성 트리거 위치:

| Trigger Point | Where | Action |
|---|---|---|
| AI suggest step_complete | `interview.py` answer handler | `generate_kickoff_document(version=1)` |
| Design Phase 5 완료 | `design.py` ai-workflow complete | `generate_kickoff_document(version=2)` |
| Phase 6 checklist 완료 | `finalize.py` checklist complete | `generate_kickoff_document(version=3)` + status → `completed` |

---

## Design Decisions

| Decision | Choice | Rationale |
|---|---|---|
| Document generation | Progressive (v1→v2→v3), not single-shot | 사용자가 중간 결과를 확인하며 다음 단계 진행 여부 판단 가능 |
| Document storage | `kickoff_doc` 단일 컬럼 덮어쓰기 | 버전 히스토리는 V2. 현재는 최신 문서만 유지 |
| Export format | MD only | PDF는 배포 복잡성 추가 (WeasyPrint 의존). V2 고려 |
| Share feature | 없음 | V2에서 링크 공유 + 권한 관리와 함께 추가 |
| Preview access | AI 제안 완료 후 활성화 | 그 전에는 문서화할 충분한 인사이트가 없음 |
| Section status | complete / in-progress / empty 3상태 | 사용자가 어디까지 진행했고 뭐가 남았는지 한눈에 파악 |
| Mermaid rendering | 브라우저 Mermaid.js | 서버 불필요, 오픈소스, 텍스트→SVG 변환 |

---

## Completion Criteria

- [ ] AI 제안 완료 시 문서 v1 자동 생성, 미리보기 활성화
- [ ] 설계 완료 시 문서 v2 업데이트 (설계 섹션 추가)
- [ ] 평가&마무리 완료 시 문서 v3 최종 생성 + 프로젝트 status `completed`
- [ ] 설계 건너뛰기 시 v1 → v2(최종)으로 정상 적응
- [ ] AI 제안 전 미리보기 클릭 시 안내 메시지 표시
- [ ] 문서 미리보기 페이지: TOC + 섹션 카드 + 상태 표시 정상 렌더링
- [ ] Markdown 다운로드 버튼 → 유효한 `.md` 파일 다운로드
- [ ] Mermaid 다이어그램이 설계 섹션에서 SVG로 렌더링

---

## Change Log

| Date | Description |
|---|---|
| 2026-05-22 | Initial creation — extracted from Phase 5 (Design & Doc Generation) |
| 2026-05-25 | Prerequisites unified to Phase 6. Pipeline input sources reordered |
| 2026-05-26 | Full restructure: single-shot → progressive generation (v1/v2/v3). PDF export removed (V2). Share feature removed (V2). Preview activates after AI suggest, not after all phases. UI based on screen-document-preview.jsx |

---
---

# Phase 7 — 문서 미리보기 & 생성 `🔲 미시작`

> 파이프라인 진행에 따라 점진적으로 갱신되는 라이브 문서 미리보기: AI 제안 이후 활성화, 설계/평가 완료 시 업데이트.

**상태**: 🔲 미시작
**선행 조건**: Phase 4 완료 (AI 제안 스텝), Phase 5/6은 업데이트용

---

## 개요

Phase 7은 **라이브 문서 미리보기**를 구현한다 — 사용자가 파이프라인을 진행하면서 킥오프 문서가 점진적으로 채워지는 읽기 전용 뷰어. 마지막에 한번 생성하는 방식이 아니라, 3개 핵심 체크포인트에서 문서를 생성/업데이트한다.

**디자인 레퍼런스**: `ui-reference/screen-document-preview.jsx`

**문서 생성 체크포인트**:

```
Phase 4 AI 제안 완료 → doc v1 생성 (인터뷰 + 제안)
                        → 미리보기 활성화 (RightPanel "문서 미리보기" 버튼)

Phase 5 설계 완료 → doc v2 업데이트 (+ 요구사항/아키텍처/데이터 모델/AI 워크플로우)

Phase 6 평가&마무리 완료 → doc v3 최종 (+ 평가/완료조건/갭/체크리스트)
```

**설계 건너뛰기 경로**:
```
Phase 4 AI 제안 완료 → doc v1
Phase 6 평가&마무리 완료 → doc v2 최종 (설계 섹션 없음)
```

**핵심 규칙**:
- AI 제안 완료 전에 미리보기 클릭 시 → "AI 제안 단계 이후에 미리보기가 가능합니다" 안내
- 문서는 읽기 전용 (인라인 편집은 V2)
- MD 다운로드만 지원 (PDF 다운로드 X)
- 공유 기능 없음 (V2)

---

## 완료 예정 / 완료 항목

| # | 작업 | 영역 | 상태 | 관련 FR |
|---|---|---|---|---|
| **백엔드** | | | | |
| 1 | `doc_engine.py` — 점진적 문서 생성 (v1/v2/v3 단계별) | Backend | 🔲 | FR-003 |
| 2 | `POST /api/projects/{id}/generate-doc` — 단계별 문서 생성 트리거 | Backend | ✅ | FR-003 |
| 3 | `GET /api/projects/{id}/export/markdown` — MD 파일 다운로드 API | Backend | 🔲 | FR-004 |
| 4 | Phase 4 suggest 완료 시 doc v1 자동 생성 트리거 | Backend | 🔲 | FR-003 |
| 5 | Phase 5 설계 완료 시 doc v2 자동 업데이트 트리거 | Backend | 🔲 | FR-003 |
| 6 | Phase 6 체크리스트 완료 시 doc v3 최종 생성 + status `completed` 전환 | Backend | 🔲 | FR-003, FR-013 |
| **프론트엔드** | | | | |
| 7 | DocumentPreviewPage — 2컬럼 레이아웃 (TOC 사이드바 + 문서 본문) | Frontend | 🔲 | FR-003 |
| 8 | TOC 사이드바 — 프로젝트 메타, 문서 완성도, 섹션 목차 (완료/작성 중/미작성) | Frontend | 🔲 | FR-003 |
| 9 | 문서 본문 — 섹션별 카드 렌더링 (Markdown) | Frontend | 🔲 | FR-003 |
| 10 | 상단 액션바 — "DOCUMENT PREVIEW" 헤더 + MD 다운로드 버튼 | Frontend | 🔲 | FR-004 |
| 11 | 미리보기 비활성 상태 — AI 제안 전 안내 메시지 | Frontend | 🔲 | FR-003 |
| 12 | RightPanel "문서 미리보기" 버튼 → DocumentPreviewPage 연결 | Frontend | 🔲 | FR-003 |
| 13 | Mermaid.js SVG 렌더링 (아키텍처/ERD 다이어그램) | Frontend | 🔲 | FR-005 |

---

## 구현 상세

### 문서 생성 엔진 (점진적)

**파일**: `backend/app/core/doc_engine.py` (이미 생성됨)

3단계 점진적 생성. 각 단계에서 `generate_kickoff_document()`를 호출하되, 입력 소스가 다르다:

| 버전 | 트리거 | 입력 소스 | 섹션 |
|---|---|---|---|
| v1 | Phase 4 AI 제안 완료 | 인터뷰 인사이트 + 채택된 제안 | 프로필, 대상 사용자, 핵심 기능, 기술 스택, 데이터 소스, 성공 지표, 리스크, AI 제안 |
| v2 | Phase 5 설계 완료 | v1 + 요구사항/아키텍처/데이터 모델/AI 워크플로우 | v1 + 기능 정의, 시스템 구조, 데이터 구조, AI 흐름 |
| v3 | Phase 6 체크리스트 완료 | v2 + 평가/완료조건/갭/체크리스트 | v2 + 정직한 평가, 완료 조건, 다음 단계 |

- `projects.kickoff_doc`에 최신 문서를 덮어쓰기 저장
- `projects.doc_version`으로 현재 문서 버전 추적 (1/2/3)
- 설계 건너뛰기 시: v1 → v2(최종), v2에서 설계 섹션 제외

### 문서 섹션 (screen-document-preview.jsx 기준)

| # | 섹션 | Phase 소스 | 상태 예시 |
|---|---|---|---|
| 01 | 프로젝트 프로필 | Phase 4 (v1) | complete |
| 02 | 기능 정의 | Phase 5 (v2) 또는 Phase 4 간략 | complete / empty |
| 03 | 시스템 구조 | Phase 5 (v2) | complete / empty |
| 04 | 데이터 구조 | Phase 5 (v2) | in-progress / empty |
| 05 | AI 흐름 | Phase 5 (v2) | empty (설계 건너뛰기 시) |
| 06 | 정직한 평가 | Phase 6 (v3) | complete / empty |
| 07 | 완료 조건 | Phase 6 (v3) | complete / empty |

각 섹션은 3가지 상태를 가진다:
- `complete` — 해당 Phase 완료, 내용 채워짐
- `in-progress` — 해당 Phase 진행 중
- `empty` — 아직 해당 Phase 미진행

### 내보내기 API

**파일**: `backend/app/api/export.py`

- `GET /api/projects/{id}/export/markdown` — MD 파일 스트리밍 다운로드
- `Content-Disposition: attachment; filename="{project_name}_kickoff.md"`
- `projects.kickoff_doc`이 없으면 404
- PDF 내보내기 없음 (V2)

### 문서 미리보기 페이지

**파일**: `frontend/src/pages/DocumentPreviewPage.tsx`

**라우트**: `/projects/:projectId/document`

2컬럼 레이아웃 (screen-document-preview.jsx 기반):

**왼쪽 사이드바** (280px):
- PROJECT 라벨 + 프로젝트명 + 유형/언어 태그
- 문서 완성도 카드 (N% + 프로그레스바 + "N / M 섹션 완료")
- CONTENTS 목차: 섹션별 번호, 제목, 상태 도트 (완료=green / 작성 중=accent / 미작성=gray), Phase 라벨 (P1/P2)
- "인터뷰로 돌아가기" 버튼

**메인 영역** (flex):
- 상단 액션바: "DOCUMENT PREVIEW" + "킥오프 문서 미리보기" 헤더, "실시간 업데이트" 표시, Markdown 다운로드 버튼
- 문서 헤더: "KICKOFF DOCUMENT · vN DRAFT · 날짜", 프로젝트명 (h1), 한줄 설명, 유형/상태 태그
- 섹션별 카드 (DocSection 컴포넌트): 번호 + 제목 + 상태 배지, Markdown 렌더링 (기존 `<Markdown>` 컴포넌트 재활용)
- complete 섹션: 내용 렌더링
- in-progress 섹션: 스피너 + "작성 중" 안내 + "이어 작성" 버튼
- empty 섹션: dashed border + "아직 작성되지 않았어요" + 안내 텍스트
- 하단 푸터: "Last updated · N분 전"

### 미리보기 활성화 로직

**RightPanel "문서 미리보기" 버튼 동작**:

```
if (project.doc_version >= 1) {
  → navigate(`/projects/${projectId}/document`)
} else {
  → toast("AI 제안 단계 이후에 미리보기가 가능합니다")
}
```

### 자동 트리거 연동

각 Phase 완료 시 문서 자동 생성 트리거 위치:

| 트리거 시점 | 위치 | 동작 |
|---|---|---|
| AI suggest step_complete | `interview.py` answer handler | `generate_kickoff_document(version=1)` |
| 설계 Phase 5 완료 | `design.py` ai-workflow complete | `generate_kickoff_document(version=2)` |
| Phase 6 checklist 완료 | `finalize.py` checklist complete | `generate_kickoff_document(version=3)` + status → `completed` |

---

## 설계 결정 사항

| 결정 | 선택 | 근거 |
|---|---|---|
| 문서 생성 방식 | 점진적 (v1→v2→v3), 단발 생성 아님 | 사용자가 중간 결과를 확인하며 다음 단계 진행 여부 판단 가능 |
| 문서 저장 | `kickoff_doc` 단일 컬럼 덮어쓰기 | 버전 히스토리는 V2. 현재는 최신 문서만 유지 |
| 내보내기 형식 | MD만 | PDF는 배포 복잡성 추가 (WeasyPrint 의존). V2 고려 |
| 공유 기능 | 없음 | V2에서 링크 공유 + 권한 관리와 함께 추가 |
| 미리보기 접근 | AI 제안 완료 후 활성화 | 그 전에는 문서화할 충분한 인사이트가 없음 |
| 섹션 상태 | complete / in-progress / empty 3상태 | 사용자가 어디까지 진행했고 뭐가 남았는지 한눈에 파악 |
| Mermaid 렌더링 | 브라우저 Mermaid.js | 서버 불필요, 오픈소스, 텍스트→SVG 변환 |

---

## 완료 기준

- [ ] AI 제안 완료 시 문서 v1 자동 생성, 미리보기 활성화
- [ ] 설계 완료 시 문서 v2 업데이트 (설계 섹션 추가)
- [ ] 평가&마무리 완료 시 문서 v3 최종 생성 + 프로젝트 status `completed`
- [ ] 설계 건너뛰기 시 v1 → v2(최종)으로 정상 적응
- [ ] AI 제안 전 미리보기 클릭 시 안내 메시지 표시
- [ ] 문서 미리보기 페이지: TOC + 섹션 카드 + 상태 표시 정상 렌더링
- [ ] Markdown 다운로드 버튼 → 유효한 `.md` 파일 다운로드
- [ ] Mermaid 다이어그램이 설계 섹션에서 SVG로 렌더링

---

## 변경 이력

| 날짜 | 내용 |
|---|---|
| 2026-05-22 | 최초 작성 — Phase 5 (설계 & 문서 생성)에서 분리 |
| 2026-05-25 | 선행조건을 Phase 6으로 단일화. 파이프라인 입력 소스 순서 변경 |
| 2026-05-26 | 전면 재구조화: 단발 생성 → 점진적 생성 (v1/v2/v3). PDF 내보내기 삭제 (V2). 공유 기능 삭제 (V2). AI 제안 이후 미리보기 활성화. screen-document-preview.jsx 기반 UI 설계 반영 |
