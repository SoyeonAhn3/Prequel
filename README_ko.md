🌐 [한국어](./README_ko.md) | [English](./README.md)

# Prequel

> Every great project deserves a prequel. AI가 구조화된 인터뷰로 프로젝트 기획의 빈틈을 찾아주는 웹 서비스.

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
- [과금 모델](#과금-모델)
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
| react-i18next | 다국어 (ko/en) — *예정, Phase 9 (아직 미설치)* | JSON 키 분리, 런타임 언어 전환 |
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

킥오프 1회당 예상 비용: **$0.4–0.7** (MVP-2 모델 라우팅 적용 시 $0.3–0.5 목표).

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
│   │   ├── pages/                 # 라우트별 페이지 (8개 화면)
│   │   ├── hooks/                 # useInterview, useAuth 등
│   │   ├── i18n/                  # ko.json, en.json (예정 — Phase 9)
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
│   └── tests/                     # pytest 스위트 — 전체 143개 통과 (최근 실행: 2026-07-21)
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
│   └── Phase9_IntegrationDeploy.md # 🚧 다국어, 테스트 & 배포 (Step 1-3 완료: 법적 + 에러 처리 + pytest 64%)
├── .env.example
└── README.md
```

## 화면 구성

| # | 화면 | 설명 |
|---|---|---|
| 1 | 랜딩 페이지 | 서비스 소개 + 템플릿 갤러리 + 시작하기 |
| 2 | 로그인/회원가입 | OAuth (Google + GitHub) |
| 3 | 내 프로젝트 목록 | 프로젝트 관리 |
| 4 | 인터뷰 (채팅 UI) | 핵심 — 구조화 Q&A + 프로그레스바 |
| 5 | 결과 뷰어 | 킥오프 문서 대시보드 요약 카드 UI |
| 6 | Admin 대시보드 | 사용자/토큰/비용 관리 + 공지 작성 |
| 7 | 사용자 가이드 | 사용법 안내 + FAQ |
| 8 | 공지사항/패치내역 | 업데이트 이력 + 공지 |

## 과금 모델

| 플랜 | 가격 | 내용 |
|---|---|---|
| Free | ₩0 | 계정당 킥오프 2회 |
| Basic | ₩9,900/월 | 월 10회 킥오프 |
| Pro | ₩24,900/월 | 월 30회 킥오프 |

결제 연동(Toss Payments)은 MVP-2에서 구현 예정.

## 현재 상태

| Phase | 상태 | 산출물 |
|---|---|---|
| 기획 & 설계 | ✅ 완료 | 킥오프 문서, 시스템 아키텍처, 데이터 모델, 요구사항 정의 |
| Phase 1: 프로젝트 셋업 | ✅ 완료 | FastAPI/React 스캐폴드, Supabase 6 테이블 + RLS, Alembic, 하네스 동기화 |
| Phase 2: 인증 시스템 | ✅ 완료 | OAuth (Google/GitHub), JWT 미들웨어, RBAC, 로그인/랜딩 페이지 (ui-reference), 슬레이트 블루 디자인 시스템 |
| Phase 3: 프로젝트 관리 | ✅ 완료 | 프로젝트 CRUD API, 무료 쿼터 검증, 내 프로젝트 페이지 (스탯카드, 필터, 검색, 테이블), 생성 모달, 삭제 모달 |
| Phase 4: 인터뷰 파이프라인 | ✅ 완료 | 백엔드 API (6개 엔드포인트), 3컬럼 채팅 UI, 유형 감지, 일시정지/이어하기, 설계 결정 UI — 산출물 29개 (테스트 28/28) |
| Phase 5: 설계 (How) | ✅ 완료 | 9화면 가이드 위저드 (요구사항 → 아키텍처 → 데이터 모델 → AI 워크플로우), 동적 설계 파이프라인, 인터뷰 인사이트 영속화 |
| Phase 6: 평가 & 마무리 | ✅ 완료 | `finalize.py` API (평가 → 완료조건 → 갭 → 체크리스트), 스킬 4종 재작성, 마이그레이션 008, doc v3 엔진, FinalizePage 카드 위저드 — E2E 테스트 대기 |
| Phase 7: 문서 미리보기 & 생성 | ✅ 완료 | 읽을 때 조립 방식 (`doc_model.build_sections`), `GET /document-model` + `GET /export/markdown`, DocumentPreviewPage (2컬럼 TOC + 완성도 + Markdown 다운로드). **대시보드 요약 섹션 렌더링** — 섹션 `kind`별 빌딩블록(스탯 스트립 / 표+chip / 미터 / 레이어 밴드 / 콜아웃), markdown 내보내기 불변. 참고: 점진적 v1→v2→v3 생성은 실시간 조립으로 폐기; **Mermaid 다이어그램 렌더링은 스코프 제외** |
| Phase 8: Admin & 부가 기능 | ✅ 완료 | Admin 대시보드(사용자 관리 + 토큰 사용량 차트 + 활동 로그), 공지 CRUD + 페이지, 호출별 토큰 로깅(캐시 포함), `slowapi` Rate Limiting(인터뷰 20/분, 일반 60/분), `structlog` JSON 로깅, 사용자 가이드 페이지. 후속: BL-003(프롬프트 캐싱), BL-004(dev 우회 로그 귀속) |
| Phase 9: 다국어·테스트·배포 | 🚧 진행 중 | **Step 1-3 완료**: 이용약관/개인정보 페이지(`/terms`, `/privacy`) + 랜딩 푸터·로그인 법적 링크; **에러 처리 통합(NFR-003)** — Claude 타임아웃/재시도 → 503 친절 에러, `apiFetch` 타임아웃 + `ApiError`, 재시도 버튼(4개 화면), Error Boundary, 인터뷰 오프라인 임시저장/자동 재전송; **pytest 커버리지 64%**(#7, DoD 60% 초과 — projects·finalize 엔드포인트 테스트 25개 + 상태유지 `FakeSupabase` 헬퍼) + **E2E 데모 시나리오 작성**(#6, 수동 16 TC, TC-015 AI 선검증, 미실행). 잔여: 다국어 UI(i18n), E2E 실행, Netlify + Railway 배포. 후속: BL-008(프로젝트 이름·설명 수정 UI) |
| MVP-2 (5개 기능) | 📋 예정 | 결제 + 토큰 추적 + 비용 미터 + 갤러리 + 모델 라우팅 |
| v2 | 📋 Planned | 갭 분석, DOCX 내보내기, 공유 링크 |

보안 강화 현황: **BL-021 완료**. `session_id`를 받는 설계·마감 API 8개가 조회·수정 전에 세션 → 삭제되지 않은 프로젝트 → 로그인 사용자 소유권을 확인한다. 실제 Supabase Auth 사용자 A/B와 각 사용자의 로그인 JWT로 회귀 검증해 소유자 요청 8/8 성공, 타 사용자 요청 8/8 동일한 404 및 데이터 불변, 프로젝트 soft delete 후 요청 8/8 거부를 확인했다. 백엔드 전체 테스트는 143개가 통과한다.

### 테스트 시나리오

| Phase | 상태 | 링크 |
|---|---|---|
| Phase 3: 프로젝트 관리 | ✅ 전체 통과 (12/12) | [20260520_Phase3_프로젝트관리.md](test-scenarios/20260520_Phase3_프로젝트관리.md) |
| BL-021: 세션 소유권 / IDOR | ✅ 통과 (실제 Supabase Auth 사용자 A/B JWT 검증) | [BACKLOG.md](BACKLOG.md) |
| Phase 9: E2E 데모 시나리오 | 🚧 작성됨 (16 TC, TC-015 AI 선검증 Pass) | [20260707_E2E데모시나리오.md](test-scenarios/20260707_E2E데모시나리오.md) |

## 로드맵

### MVP-1

| 기능 | 설명 |
|---|---|
| AI 구조화 인터뷰 | 하네스 스킬 프롬프트 기반 채팅형 Q&A |
| 프로젝트 유형 감지 | 사용자 입력에서 7개 유형 중 자동 판별 |
| 킥오프 문서 생성 | Markdown 문서 + 섹션별 카드 UI 미리보기 |
| OAuth + Admin | Google/GitHub 로그인, 사용자/공지 관리 대시보드 |
| 다국어 UI | 한국어 + 영어, 프로젝트 생성 시 고정 |
| 진행률 시각화 | 스텝 프로그레스바로 인터뷰 진행 상태 표시 |
| 일시정지 & 이어하기 | 이벤트 기반 세션 자동 저장 + 마지막 질문 재개 |
| 공지사항/패치내역 | Admin 작성, 사용자 열람 |
| API 비용 최적화 | 프롬프트 STEP 분할 + 캐싱 + 압축 |

### MVP-2

| 기능 | 설명 |
|---|---|
| 토큰 추적 + 한도 | 세션별 토큰/비용 기록, 사용량 기반 제한 |
| 결제 (Toss) | Basic/Pro 플랜 구독 |
| 실시간 비용 미터 | 인터뷰 중 잔여 횟수 실시간 표시 |
| 템플릿 갤러리 | 유형별 샘플 킥오프 결과 쇼케이스 |
| 모델 라우팅 | 단순 턴은 Haiku, 분석/생성 턴은 Sonnet |

### v2

갭 분석 & 정직한 평가, 문서 내보내기 (Markdown/DOCX), 공유 링크를 통한 팀 협업.

## 한계점

- **초기 개발 단계** — Phase 1-8 완료 (셋업, 인증, 프로젝트 관리, 인터뷰 파이프라인, 설계, 평가/마무리, 문서 미리보기 + Markdown 내보내기, Admin & 부가 기능), Phase 9 진행 중 (Step 1-3 — 법적 페이지·에러 처리·pytest 커버리지 64% 완료; 다국어, E2E 실행, 배포 잔여)
- **데스크탑 전용** — 태블릿은 MVP-2, 모바일은 미지원
- **언어 고정** — 프로젝트 언어(ko/en)는 생성 시 고정, 변경하려면 새 프로젝트 생성 필요
- **MVP-1에 결제 없음** — Free 2회 소진 후 유료 전환 불가 (MVP-2까지)
- **런타임 스킬** — AI 프롬프트의 단일 원본은 `backend/skills/`이며 직접 수정합니다. `.claude/skills/`는 별도의 개발용 하네스(CLI)로 런타임과 동기화하지 않습니다

---

<p align="center">Made with AI-assisted development</p>
