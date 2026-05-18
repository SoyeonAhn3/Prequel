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
        → 킥오프 문서 자동 생성 (Markdown 섹션 + Mermaid 다이어그램)
          → 결과 뷰어: 카드 UI + 아키텍처 다이어그램 (SVG)
```

**일시정지 & 이어하기**: 답변할 때마다 세션이 자동 저장된다. 브라우저를 닫고 나중에 돌아와도 마지막 질문부터 이어할 수 있다.

## 기술 스택

| Technology | Role | Why |
|---|---|---|
| React (Vite) | 프론트엔드 SPA | 가볍고 백엔드와 역할 분리 명확, 빠른 HMR |
| TailwindCSS | 스타일링 | 유틸리티 우선 빠른 프로토타이핑, 작은 번들 |
| react-i18next | 다국어 (ko/en) | JSON 키 분리, 런타임 언어 전환 |
| Mermaid.js | 아키텍처 다이어그램 | 오픈소스 텍스트→SVG, 브라우저에서 렌더링 |
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
| 전체 인터뷰 데이터 | 문서 생성 + 다이어그램 합성 | 킥오프 문서 (Markdown) + Mermaid 코드 |

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
- Python 3.11+
- [Anthropic API 키](https://console.anthropic.com/)
- [Supabase 프로젝트](https://supabase.com/) (Free 티어)

### 설치 및 실행

```bash
# 클론
git clone https://github.com/your-username/prequel.git
cd prequel

# 백엔드
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000

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
│   │   │   ├── chat/              # 채팅 UI — 인터뷰 오케스트레이터
│   │   │   ├── viewer/            # 결과 뷰어 — 카드 UI + Mermaid
│   │   │   ├── admin/             # Admin 대시보드
│   │   │   ├── auth/              # 로그인/회원가입
│   │   │   └── common/            # ProgressBar, Header, Footer
│   │   ├── pages/                 # 라우트별 페이지 (8개 화면)
│   │   ├── hooks/                 # useInterview, useAuth 등
│   │   ├── i18n/                  # ko.json, en.json
│   │   └── lib/                   # API 클라이언트, Supabase 클라이언트
│   └── package.json
├── backend/                       # FastAPI [Railway]
│   ├── app/
│   │   ├── api/                   # API 라우터
│   │   ├── core/
│   │   │   ├── prompt_manager.py  # 스킬 .md → 최적화된 Claude 프롬프트
│   │   │   └── doc_engine.py      # 인터뷰 결과 → Markdown 문서
│   │   ├── models/                # SQLAlchemy (6개 테이블)
│   │   ├── schemas/               # Pydantic 요청/응답
│   │   └── middleware/            # Auth, Rate Limiting, CORS
│   ├── skills/                    # 하네스 스킬 .md (빌드 시 복사)
│   ├── references/                # 하네스 Reference 파일 (빌드 시 복사)
│   └── tests/
├── scripts/
│   └── sync_harness.py            # 하네스 스킬 → backend/ 동기화
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
| 5 | 결과 뷰어 | 킥오프 문서 카드 UI + Mermaid 다이어그램 |
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

| Phase | Status | Deliverable |
|---|---|---|
| 기획 & 설계 | ✅ Done | 킥오프 문서, 시스템 아키텍처, 데이터 모델, 요구사항 정의 |
| MVP-1 (10개 기능) | 📋 Planned | 인터뷰 + 문서 생성 + 인증 + Admin + i18n + 일시정지/이어하기 |
| MVP-2 (5개 기능) | 📋 Planned | 결제 + 토큰 추적 + 비용 미터 + 갤러리 + 모델 라우팅 |
| v2 | 📋 Planned | 갭 분석, DOCX 내보내기, 공유 링크 |

## 로드맵

### MVP-1

| 기능 | 설명 |
|---|---|
| AI 구조화 인터뷰 | 하네스 스킬 프롬프트 기반 채팅형 Q&A |
| 프로젝트 유형 감지 | 사용자 입력에서 7개 유형 중 자동 판별 |
| 킥오프 문서 생성 | Markdown 문서 + 섹션별 카드 UI 미리보기 |
| 아키텍처 다이어그램 | Mermaid.js 자동 생성, SVG 렌더링 |
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

- **개발 전 단계** — 기획/설계 완료, 아직 구현된 코드 없음
- **데스크탑 전용** — 태블릿은 MVP-2, 모바일은 미지원
- **언어 고정** — 프로젝트 언어(ko/en)는 생성 시 고정, 변경하려면 새 프로젝트 생성 필요
- **MVP-1에 결제 없음** — Free 2회 소진 후 유료 전환 불가 (MVP-2까지)
- **하네스 동기화** — 스킬 파일 업데이트 시 `sync_harness.py`로 수동 동기화 필요

---

<p align="center">Made with AI-assisted development</p>
