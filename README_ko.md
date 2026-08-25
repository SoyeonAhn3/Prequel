🌐 [한국어](./README_ko.md) | [English](./README.md)

# Prequel

> Every great project deserves a prequel. AI가 구조화된 인터뷰로 프로젝트 기획의 빈틈을 찾아주는 웹 서비스.

🔗 **Live**: https://prequel-production.netlify.app

https://github.com/user-attachments/assets/bec615fa-9401-4c1d-9820-8c3417265120

## 개요

대부분의 AI 기획 도구는 한 번의 프롬프트로 문서를 생성한다. Prequel은 다르다 — AI가 **질문한다**. 프로젝트 유형에 맞는 구조화된 질문을 통해, 코드를 작성하기 전에 기획의 빈틈을 체계적으로 찾아낸다.

AI가 생성한 텍스트가 아니라, AI의 질문을 통해 프로젝트 아이디어를 검증하고 싶은 기획자와 개발자를 위한 서비스.

## 목차

- [동작 흐름](#동작-흐름)
- [기술 스택](#기술-스택)
- [AI 구성 요소](#ai-구성-요소)
- [빠른 시작](#빠른-시작)
- [프로젝트 구조](#프로젝트-구조)
- [화면 구성](#화면-구성)
- [크레딧 & 비용 모델](#크레딧--비용-모델)
- [현재 상태](#현재-상태)
- [로드맵](#로드맵)
- [한계점](#한계점)

## 동작 흐름

```
사용자가 프로젝트 아이디어 입력
  → AI가 프로젝트 유형 자동 감지 (7개 카테고리 중 1개)
    → 구조화 인터뷰 시작: 공통 질문 + 유형별 질문
      → 프로그레스바로 진행률 표시
        → 킥오프 문서 자동 생성 (Markdown 섹션)
          → 결과 뷰어: 대시보드 요약 카드 UI
```

**일시정지 & 이어하기**: 답변할 때마다 세션이 자동 저장된다. 브라우저를 닫고 나중에 돌아와도 마지막 질문부터 이어할 수 있다.

## 기술 스택

| Technology | Role | Why |
|---|---|---|
| React (Vite) | 프론트엔드 SPA | 가볍고 백엔드와 역할 분리 명확, 빠른 HMR |
| TailwindCSS | 스타일링 | 유틸리티 우선 빠른 프로토타이핑, 작은 번들 |
| FastAPI | 백엔드 API | Claude SDK Python 우선 지원, Pydantic 검증, 자동 OpenAPI |
| Supabase | DB + Auth + RLS | PostgreSQL + OAuth + 행 단위 보안, 올인원 Free 티어 |
| Claude API | AI 인터뷰 + 문서 생성 | 하네스 스킬 프롬프트 재사용, Prompt Caching (90% 비용 절감) |
| Netlify | 프론트엔드 호스팅 | Git 자동 배포, 무료 SSL |
| Railway | 백엔드 호스팅 | Cold start 없음, FastAPI 네이티브 지원, $5/월 |

## AI 구성 요소

| 입력 | 처리 | 출력 |
|---|---|---|
| 프로젝트 아이디어 (자유 텍스트) | 유형 감지 (7개 카테고리) | 감지된 유형 + 사용자 확인 |
| 질문별 사용자 답변 | 스킬 프롬프트 기반 구조화 Q&A | 프로젝트 유형에 맞춘 다음 질문 |
| 전체 인터뷰 데이터 | 문서 생성 | 킥오프 문서 (Markdown) |

### 프롬프트 아키텍처

하네스 스킬 정의(`.md` 파일)를 Claude API 프롬프트로 직접 사용한다 — 로직 재구현 없음. `prompt_manager.py`(~60줄)가 4가지 최적화를 수행:

1. **STEP 분할** — 현재 인터뷰 단계만 전송
2. **CLI 제거** — 프롬프트에서 CLI 전용 지시 제거
3. **Reference 필터링** — 유형에 맞는 Reference 파일만 포함
4. **대화 압축** — 오래된 턴을 요약하여 토큰 절감
5. **Prompt Caching** — 반복 프롬프트 블록에 Anthropic 캐시 적용

킥오프 1회당 예상 비용: **$0.4–0.7**. 실제 Anthropic A/B 측정에서 캐시 읽기 비율 83%, 풀가격 입력 토큰 **88% 감소**를 확인했다(BL-003). 단계별 모델 티어링은 수익화와 함께 범위에서 제외했다 — [BL-020](BACKLOG.md) 참고.

## 빠른 시작

### 사전 요구사항

- Node.js 18+
- Python 3.12+ (3.14 미지원 — pre-built wheel 부재)
- [uv](https://docs.astral.sh/uv/) (Python 패키지 매니저)
- [Anthropic API 키](https://console.anthropic.com/)
- [Supabase 프로젝트](https://supabase.com/) (Free 티어)

### 설치 및 실행

```bash
# 클론
git clone https://github.com/SoyeonAhn3/Prequel.git
cd prequel

# 백엔드
cd backend
uv venv .venv --python 3.12
uv pip install -r requirements.txt --python .venv/Scripts/python.exe  # Windows
# uv pip install -r requirements.txt --python .venv/bin/python        # macOS/Linux
.venv/Scripts/python -m uvicorn app.main:app --reload --port 8000

# 프론트엔드 (새 터미널)
cd frontend
npm install
npm run dev
```

### 환경 변수

`.env.example`을 `.env`로 복사하고 키를 입력:

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

## 프로젝트 구조

```
prequel/
├── frontend/                      # React SPA [Netlify]
│   ├── src/
│   │   ├── components/
│   │   │   ├── interview/         # 인터뷰 UI — LeftRail, ChatCenter, RightPanel, AiMark
│   │   │   ├── viewer/            # 문서 미리보기 — 대시보드 블록 (blocks.tsx, DocSections.tsx)
│   │   │   ├── projects/          # 새 프로젝트 모달, 삭제 확인
│   │   │   ├── admin/             # Admin 대시보드
│   │   │   ├── auth/              # 로그인/회원가입
│   │   │   └── common/            # Badge, ProgressBar, Header, Footer
│   │   ├── pages/                 # 라우트별 페이지 (9개 화면)
│   │   ├── hooks/                 # useInterview, useAuth 등
│   │   └── lib/                   # API 클라이언트, Supabase 클라이언트
│   └── package.json
├── backend/                       # FastAPI [Railway]
│   ├── app/
│   │   ├── api/                   # API 라우터
│   │   ├── core/
│   │   │   ├── prompt_manager.py  # 스킬 .md → 최적화된 Claude 프롬프트
│   │   │   ├── claude_client.py   # Anthropic API 싱글톤 래퍼
│   │   │   ├── harness_loader.py  # 스킬 + Reference 파일 로더
│   │   │   └── doc_engine.py      # 인터뷰 결과 → Markdown 문서
│   │   ├── models/                # SQLAlchemy (6개 테이블)
│   │   ├── schemas/               # Pydantic 요청/응답
│   │   └── middleware/            # Auth, Rate Limiting, CORS
│   ├── skills/                    # 런타임 AI 프롬프트 (.md) — 단일 원본
│   ├── references/                # 프롬프트용 Reference 파일
│   └── tests/                     # pytest — 단위/API 148개 + 실제 Supabase opt-in 통합 4개
├── scripts/
│   └── sync_harness.py            # ⛔ 폐기 (BL-002) — backend/skills가 단일 원본
├── supabase/
│   └── migrations/                # SQL 마이그레이션 파일 (001~011)
├── Phase/
│   ├── Phase1_ProjectSetup.md     # ✅ 프로젝트 셋업 & 인프라
│   ├── Phase2_AuthSystem.md       # ✅ 인증 & 사용자 시스템
│   ├── Phase3_ProjectManagement.md # ✅ 프로젝트 CRUD & 쿼터
│   ├── Phase4_InterviewPipeline.md # ✅ AI 인터뷰 파이프라인 (핵심)
│   ├── Phase5_Design.md           # ✅ 설계 단계 (How) — 9화면 위저드
│   ├── Phase6_EvalFinalize.md     # ✅ 평가 & 마무리
│   ├── Phase7_DocGeneration.md    # ✅ 문서 미리보기 & 생성 (Markdown 내보내기; Mermaid 스코프 제외)
│   ├── Phase8_AdminFeatures.md    # ✅ Admin & 부가 기능
│   └── Phase9_IntegrationDeploy.md # ✅ 테스트 & 배포 (Playwright 9/9 + 실제 Supabase 3/3, E2E 18/18)
├── .env.example
└── README.md
```

## 화면 구성

| # | 화면 | 설명 |
|---|---|---|
| 1 | 랜딩 페이지 | 서비스 소개 + 통계 + 시작하기 + "샘플 결과 보기" 링크 |
| 2 | 로그인/회원가입 | OAuth (Google + GitHub) |
| 3 | 내 프로젝트 목록 | 프로젝트 관리 |
| 4 | 인터뷰 (채팅 UI) | 핵심 — 구조화 Q&A + 프로그레스바 |
| 5 | 결과 뷰어 | 킥오프 문서 대시보드 요약 카드 UI |
| 6 | Admin 대시보드 | 사용자/토큰/비용 관리 + 공지 작성 |
| 7 | 사용자 가이드 | 사용법 안내 + FAQ |
| 8 | 공지사항/패치내역 | 업데이트 이력 + 공지 |
| 9 | 샘플 문서 | 실제 완성된 킥오프 문서를 로그인 없이 미리 보는 공개 화면(`/templates`) — 프로젝트 1개를 정적으로 스냅샷한 것, 실시간 개인별 페이지 아님 |

## 크레딧 & 비용 모델

서비스는 무료 크레딧만으로 운영한다. 계정당 **2크레딧**이 주어지고, 단계별 최초 진입 시에만 차감된다.

| 단계 | 차감 | 비고 |
|---|---|---|
| 인터뷰 최초 진입 | 1 | 새로고침·재접속·이어하기·재시도는 추가 차감 없음 |
| 설계 + 평가 최초 진입 | 1 | 한 세트 — 설계 후 평가 진입은 무차감 |
| 설계·평가 건너뛰기 | 0 | 바로 문서 화면으로 이동 |
| 문서 미리보기 / Markdown 내보내기 | 0 | 항상 무료 |

차감은 **원자적**이다. 프로젝트 행에 단계별 차감 도장(`interview_credit_charged_at` / `credit_charged_at`)을 찍고, 이를 `SELECT ... FOR UPDATE` 행 잠금이 걸린 Postgres RPC 안에서 처리한다. 이 RPC는 `service_role`만 실행할 수 있어 브라우저가 `credits_used`를 직접 위조할 수 없다. 실제 Supabase로 검증했다 — 같은 프로젝트 동시 요청은 정확히 1회만 차감되고, 잔여 1크레딧을 두 프로젝트가 경쟁하면 정확히 하나만 성공한다(동시성 4/4 + 실제 JWT 브라우저 3/3).

### 유료 플랜 — 설계만 하고 의도적으로 미구현

기획 단계에서 Basic(₩9,900/월 · 월 10회)과 Pro(₩24,900/월 · 월 30회)를 정의했으나, 결제 연동은 **의도적으로 범위에서 제외**했다. 실제 결제를 켜려면 사업자등록·통신판매업 신고 등 개발과 무관한 선행 요건이 필요하기 때문이다. 따라서 결제 모듈이 올라탈 **계측(metering) 레이어까지만** 구현하고 마무리했다.

## 현재 상태

| Phase | 상태 | 산출물 |
|---|---|---|
| 기획 & 설계 | ✅ 완료 | 킥오프 문서, 시스템 아키텍처, 데이터 모델, 요구사항 정의 |
| Phase 1: 프로젝트 셋업 | ✅ 완료 | FastAPI/React 스캐폴드, Supabase 6 테이블 + RLS, Alembic, 하네스 동기화 |
| Phase 2: 인증 시스템 | ✅ 완료 | OAuth (Google/GitHub), JWT 미들웨어, RBAC, 로그인/랜딩 페이지 (ui-reference), 슬레이트 블루 디자인 시스템 |
| Phase 3: 프로젝트 관리 | ✅ 완료 | 프로젝트 CRUD API, 무료 쿼터 검증, 내 프로젝트 페이지 (스탯카드, 필터, 검색, 테이블), 생성 모달, 삭제 모달 |
| Phase 4: 인터뷰 파이프라인 | ✅ 완료 | 백엔드 API (6개 엔드포인트), 3컬럼 채팅 UI, 유형 감지, 일시정지/이어하기, 설계 결정 UI — 산출물 29개 (테스트 28/28) |
| Phase 5: 설계 (How) | ✅ 완료 | 9화면 가이드 위저드 (요구사항 → 아키텍처 → 데이터 모델 → AI 워크플로우), 동적 설계 파이프라인, 인터뷰 인사이트 영속화 |
| Phase 6: 평가 & 마무리 | ✅ 완료 | `finalize.py` API (평가 → 완료조건 → 갭 → 체크리스트), 스킬 4종 재작성, 마이그레이션 008, doc v3 엔진, FinalizePage 카드 위저드 |
| Phase 7: 문서 미리보기 & 생성 | ✅ 완료 | 읽을 때 조립 방식 (`doc_model.build_sections`), `GET /document-model` + `GET /export/markdown`, DocumentPreviewPage (2컬럼 TOC + 완성도 + Markdown 다운로드). **대시보드 요약 섹션 렌더링** — 섹션 `kind`별 빌딩블록(스탯 스트립 / 표+chip / 미터 / 레이어 밴드 / 콜아웃), markdown 내보내기 불변. 참고: 점진적 v1→v2→v3 생성은 실시간 조립으로 폐기; **Mermaid 다이어그램 렌더링은 스코프 제외** |
| Phase 8: Admin & 부가 기능 | ✅ 완료 | Admin 대시보드(사용자 관리 + 토큰 사용량 차트 + 활동 로그), 공지 CRUD + 페이지, 호출별 토큰 로깅(캐시 포함), `slowapi` Rate Limiting(인터뷰 20/분, 일반 60/분), `structlog` JSON 로깅, 사용자 가이드 페이지. BL-003 프롬프트 캐싱은 실제 Anthropic A/B 검증으로 완료했으며 BL-004는 별도 추적. |
| Phase 9: 테스트·배포 | ✅ 완료 | 법적 페이지, 에러 처리 통합, 계정 완전 파기, pytest 60% 이상, 프로덕션 배포(Netlify + Railway)까지 완료했다. 결정적 Playwright **9/9 Pass**, 명시 실행형 실제 Supabase 과금 스위트 **3/3 Pass**, 번호형 E2E 계약 **18/18 Pass** — 실제 구글/깃허브 OAuth 로그인(TC-002)과 실제 Anthropic API를 대상으로 한 인터뷰→설계/평가→문서 전체 흐름(TC-018)을 모두 프로덕션에서 확인했다(2026-08-25). 다국어 UI는 범위에서 제외했다. |
| 수익화 | ❌ 범위 제외 | 결제·비용 미터·모델 티어링을 의도적으로 제외. 대신 검증 완료된 무료 크레딧 계측 레이어를 산출물로 남김 |
| v2 | 📋 예정 | DOCX 내보내기, 공유 링크, "설계 나중에 결정" 재진입 |

보안 강화 현황: **BL-021 완료**. `session_id`를 받는 설계·마감 API 8개가 조회·수정 전에 세션 → 삭제되지 않은 프로젝트 → 로그인 사용자 소유권을 확인한다. 실제 Supabase Auth 사용자 A/B와 각 사용자의 로그인 JWT로 회귀 검증해 소유자 요청 8/8 성공, 타 사용자 요청 8/8 동일한 404 및 데이터 불변, 프로젝트 soft delete 후 요청 8/8 거부를 확인했다. 현재 백엔드 테스트는 148개가 통과하고 명시 실행형 통합 테스트 5개는 기본 실행에서 skip된다.

### 테스트 시나리오

| Phase | 상태 | 링크 |
|---|---|---|
| Phase 3: 프로젝트 관리 | ✅ 전체 통과 (12/12) | [20260520_Phase3_프로젝트관리.md](test-scenarios/20260520_Phase3_프로젝트관리.md) |
| BL-021: 세션 소유권 / IDOR | ✅ 통과 (실제 Supabase Auth 사용자 A/B JWT 검증) | [BACKLOG.md](BACKLOG.md) |
| BL-022/023: 단계별 원자 과금 | ✅ 실제 Supabase 동시성 4/4 + 실제 JWT 브라우저 과금 3/3 통과, TC-018 AI 생성 구간까지 완료 | [BACKLOG.md](BACKLOG.md) |
| Phase 9: E2E 데모 시나리오 | ✅ 18/18 Pass, 결정적 Playwright 9/9 + 실제 Supabase 과금 3/3 Pass | [20260707_E2E데모시나리오.md](test-scenarios/20260707_E2E데모시나리오.md) |

## 로드맵

### MVP-1

| 기능 | 설명 |
|---|---|
| AI 구조화 인터뷰 | 하네스 스킬 프롬프트 기반 채팅형 Q&A |
| 프로젝트 유형 감지 | 사용자 입력에서 7개 유형 중 자동 판별 |
| 킥오프 문서 생성 | Markdown 문서 + 섹션별 카드 UI 미리보기 |
| OAuth + Admin | Google/GitHub 로그인, 사용자/공지 관리 대시보드 |
| 진행률 시각화 | 스텝 프로그레스바로 인터뷰 진행 상태 표시 |
| 일시정지 & 이어하기 | 이벤트 기반 세션 자동 저장 + 마지막 질문 재개 |
| 공지사항/패치내역 | Admin 작성, 사용자 열람 |
| 단계별 크레딧 | 행 잠금 기반 원자 차감 + 멱등 차감 도장 |
| API 비용 최적화 | 프롬프트 STEP 분할 + 캐싱 + 압축 |

### 범위 제외 — 의도적으로 접은 것

| 기능 | 제외 이유 |
|---|---|
| 결제 (Toss) | 사업자등록·통신판매업 신고 등 개발 외 선행 요건이 필요 |
| 실시간 비용 미터 | 유료 플랜이 있어야 의미가 생김 |
| 모델 티어링/라우팅 | 유료 플랜 유닛 이코노믹스 정렬이 유일한 명분이었음([BL-020](BACKLOG.md)) |
| 다국어 UI (ko/en) | 모든 AI 응답을 만드는 인터뷰 스킬이 한국어로 작성돼 있어, UI만 영어로 바꾸면 영어 화면에 한국어 문서가 나온다. 일부만 번역된 상태는 기능이 아니라 결함으로 보이고, 대상 사용자도 한국어권이다. 한국어 전용을 **한계점으로 명시**하는 편이 정직하다 |

이 기능들이 올라탔을 **단계별 크레딧 계측은 이미 구현·검증 완료**다. [크레딧 & 비용 모델](#크레딧--비용-모델) 참고.

### 남은 계획

MVP-1 범위에서 남은 항목 없음 — 다음 단계는 아래 [v2](#v2) 참고.

Claude 모델은 `claude_client.py` 한 곳에 고정돼 있고, **필요할 때 수동으로 갱신**한다(대기 중인 작업이 아니다). 세대 갱신은 문자열 교체가 아니라 작은 마이그레이션이다 — 최신 모델은 thinking이 기본으로 켜져 응답 파싱·`max_tokens` 배분·토큰 수가 함께 달라진다. 절차와 함정은 [BL-020](BACKLOG.md)에 정리해 뒀다.

### v2

문서 내보내기(DOCX), 팀 협업용 공유 링크, 설계를 건너뛴 뒤 나중에 다시 들어가 진행하는 재진입.

## 한계점

- **초기 개발 단계** — Phase 1-9 완료(법적·에러 처리·계정 파기·pytest·배포·전체 E2E 모두 완료, 결정적 Playwright 9/9·실제 Supabase 과금 3/3·번호형 E2E 계약 18/18 Pass)
- **데스크탑 전용** — 태블릿·모바일 미지원
- **한국어 전용** — UI와 AI 생성 문서 모두 한국어다. 다국어는 범위 제외([로드맵](#범위-제외--의도적으로-접은-것) 참고)
- **결제 없음 (의도적 결정)** — 계정당 무료 2크레딧뿐이며 유료 전환 경로 없음. 수익화는 범위 제외이고, 크레딧 시스템은 판매가 아니라 계측 레이어 구현을 보여주기 위한 것
- **런타임 스킬** — AI 프롬프트의 단일 원본은 `backend/skills/`이며 직접 수정합니다. `.claude/skills/`는 별도의 개발용 하네스(CLI)로 런타임과 동기화하지 않습니다

---

<p align="center">Made with AI-assisted development</p>
