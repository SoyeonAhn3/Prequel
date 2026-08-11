# Phase document template

Use this template only when creating a new `Phase/PhaseN_[EnglishPascalCase].md` file. Replace every bracketed placeholder with repository-backed content and omit optional fields that do not apply.

## Contents

- English Phase section
- Korean Phase section

```markdown
# Phase N — [English Phase Name] `[✅ Completed | 🚧 In Progress | 🔲 Not Started | ⏸ On Hold]`

> [One-line English description]

**Status**: [status and concise evidence-based qualifier]
**Completed**: YYYY-MM-DD
**Prerequisites**: [prior Phase or required capability]

---

## Overview

[Describe the Phase outcome in 2–4 lines.]

---

## Deliverables

| # | Task | Area | Status | Related Requirement |
|---|---|---|---|---|
| 1 | [deliverable] | [Backend/Frontend/Database/Common] | [status] | [ID or —] |

---

## Implementation Details

### [Capability]

**Files**: `[verified/path]`

- [Implemented behavior]
- [Important interface, class, function, endpoint, or component]
- [Verification or known limitation]

---

## Design Decisions

| Decision | Rationale |
|---|---|
| [decision] | [reason and tradeoff] |

---

## Prerequisites & Dependencies

- [dependency and current state]

---

## Completion Criteria

- [ ] [criterion]

---

## Change Log

| Date | Description |
|---|---|
| YYYY-MM-DD | Initial creation |

---
---

# Phase N — [한국어 Phase 이름] `[✅ 완료 | 🚧 진행 중 | 🔲 미시작 | ⏸ 보류]`

> [한국어 한 줄 설명]

**상태**: [상태와 근거 기반의 짧은 설명]
**완료일**: YYYY-MM-DD
**선행 조건**: [이전 Phase 또는 필요한 기능]

---

## 개요

[Phase의 결과를 2~4줄로 설명한다.]

---

## 완료 예정 / 완료 항목

| # | 작업 | 영역 | 상태 | 관련 요구사항 |
|---|---|---|---|---|
| 1 | [완료 항목] | [백엔드/프론트엔드/데이터베이스/공통] | [상태] | [ID 또는 —] |

---

## 구현 상세

### [기능]

**파일**: `[검증된/경로]`

- [구현된 동작]
- [주요 인터페이스, 클래스, 함수, 엔드포인트 또는 컴포넌트]
- [검증 결과 또는 알려진 제한사항]

---

## 설계 결정 사항

| 결정 | 근거 |
|---|---|
| [결정] | [이유와 트레이드오프] |

---

## 선행 조건 및 의존성

- [의존성과 현재 상태]

---

## 완료 기준

- [ ] [완료 기준]

---

## 변경 이력

| 날짜 | 내용 |
|---|---|
| YYYY-MM-DD | 최초 작성 |
```
