# Architecture Patterns Reference

`design-architecture` 스킬이 섹션 10(시스템 아키텍처 상세)을 생성할 때 참조하는 아키텍처 패턴 카탈로그.
프로젝트 유형에 따라 적합한 패턴을 제안하고, 선택 근거를 ADR에 기록한다.

---

## 유형별 아키텍처 패턴

### 웹앱 (WebApp)

| 패턴 | 적합한 경우 | 구조 |
|---|---|---|
| MVC / MTV | 서버 렌더링 중심, 관리자 페이지 | Controller → Model ↔ DB, View → Template |
| SPA + REST API | 프론트/백 분리, 인터랙티브 UI | Frontend(React/Vue) ↔ API Server ↔ DB |
| SSR + Hydration | SEO 필요 + 인터랙티브 | Next.js/Nuxt → Server Render → Client Hydrate |
| BFF (Backend for Frontend) | 복수 클라이언트 (웹+모바일) | Client → BFF → Microservices |

**공통 고려사항**: 라우팅, 상태 관리, 인증 흐름, 에러 페이지

### 데이터 파이프라인 (Pipeline)

| 패턴 | 적합한 경우 | 구조 |
|---|---|---|
| Batch ETL | 주기적 대량 처리 | Extract → Transform → Load (스케줄 기반) |
| Streaming | 실시간/준실시간 처리 | Source → Stream Processor → Sink |
| Hybrid (Lambda) | 배치 + 실시간 모두 필요 | Batch Layer + Speed Layer → Serving Layer |
| ELT | 클라우드 DW 활용 | Extract → Load → Transform (DW 내부) |

**공통 고려사항**: 스키마 관리, 재처리 전략, 모니터링, 백프레셔

### AI 프로젝트

| 패턴 | 적합한 경우 | 구조 |
|---|---|---|
| Training + Serving | 커스텀 모델 학습 후 배포 | Data → Train → Model Registry → Serving API |
| RAG (Retrieval-Augmented) | LLM + 도메인 지식 | Query → Retriever → LLM → Response |
| Agent / Tool-use | 복합 작업 자동화 | Input → Agent → Tool Calls → Output |
| Batch Inference | 대량 데이터 일괄 추론 | Data → Model → Batch Results |

**공통 고려사항**: 모델 버저닝, 실험 추적, 폴백 전략, 비용 관리

### 자동화 (Automation)

| 패턴 | 적합한 경우 | 구조 |
|---|---|---|
| Event-Driven | 외부 이벤트에 반응 | Event Source → Handler → Action |
| Cron/Schedule | 주기적 실행 | Scheduler → Task → Result/Notification |
| Reactive Pipeline | 연쇄 작업 | Trigger → Step 1 → Step 2 → ... → Notify |
| State Machine | 복잡한 상태 전이 | Event → State Check → Transition → Action |

**공통 고려사항**: 멱등성, 재시도, 알림, 로깅

### BI (Business Intelligence)

| 패턴 | 적합한 경우 | 구조 |
|---|---|---|
| Direct Query | 소규모, 실시간 필요 | Dashboard → Query Engine → DB |
| Semantic Layer | 지표 정의 일관성 필요 | Dashboard → Metrics Layer → DB |
| OLAP Cube | 다차원 분석, 대규모 | ETL → Cube → Dashboard |
| Embedded Analytics | 기존 앱에 BI 통합 | App → Embedded Dashboard → Data Source |

**공통 고려사항**: 데이터 새로고침 주기, 캐싱, 접근 제어, 지표 거버넌스

### CLI

| 패턴 | 적합한 경우 | 구조 |
|---|---|---|
| Subcommand Tree | 기능이 많은 CLI | main → parser → subcommand → action |
| Pipeline (stdin/stdout) | Unix 파이프 연동 | input → process → output (composable) |
| Interactive REPL | 대화형 인터페이스 | loop(prompt → parse → execute → display) |
| Task Runner | 빌드/배포 자동화 | config → task graph → execute |

**공통 고려사항**: 인자 파싱, 도움말 생성, 종료 코드, 설정 파일

### 라이브러리 (Library)

| 패턴 | 적합한 경우 | 구조 |
|---|---|---|
| Functional | 상태 없는 유틸리티 | pure functions, composable |
| Class-based OOP | 상태 관리 필요 | Client/Builder/Manager 클래스 |
| Plugin / Extension | 확장 가능한 구조 | Core + Plugin Interface + Plugins |
| Middleware | 요청/응답 파이프라인 | Handler → Middleware Chain → Core |

**공통 고려사항**: 공개 API 설계, 하위 호환, 에러 처리, 문서화

---

## 공통 횡단 관심사 (Cross-cutting Concerns)

모든 프로젝트 유형에 공통으로 고려해야 하는 패턴:

| 관심사 | 패턴/접근법 |
|---|---|
| 로깅 | 구조화된 로깅 (JSON), 로그 레벨 (DEBUG/INFO/WARN/ERROR) |
| 에러 처리 | 에러 분류 (재시도 가능/불가), 사용자 메시지 vs 내부 로그 분리 |
| 설정 관리 | 환경변수 → 설정 파일 → 기본값 우선순위, 환경별 분리 (dev/prod) |
| 테스트 전략 | 단위 → 통합 → E2E 피라미드, 테스트 픽스처 관리 |
| 의존성 주입 | 인터페이스 기반 추상화, 테스트 시 mock 교체 |
| 관측 가능성 | 로그 + 메트릭 + 트레이싱 (프로덕션 시) |

---

## ADR (Architecture Decision Record) 템플릿

섹션 10-5에 기록하는 아키텍처 결정 기록 형식:

```markdown
### ADR-001: [결정 제목]

**상태**: 채택 / 보류 / 폐기
**맥락**: [왜 이 결정이 필요했는가]
**결정**: [무엇을 선택했는가]
**근거**: [왜 이 선택인가 — 비교 대안 포함]
**결과**: [이 결정으로 인한 영향]
```

### ADR 작성 기준

아래 상황에서 ADR을 작성한다:
- 주요 기술 선택 (프레임워크, DB, 인프라)
- 아키텍처 패턴 선택
- 트레이드오프가 있는 설계 결정
- 기존 섹션 2(설계 인터뷰)와 다른 방향을 선택한 경우
