---
project: prequel
created: 2026-05-18
language: ko
last_skill: kickoff-skills
completed_skills:
  - kickoff-start
  - kickoff-interview
  - kickoff-suggest
  - kickoff-profile
  - kickoff-evaluate
  - kickoff-done
  - design-requirements
  - design-architecture
  - design-data-model
  - kickoff-gap
  - kickoff-checklist
  - kickoff-skills
skipped_skills: []
---

# Project Kickoff — Prequel

> Every great project deserves a prequel. AI가 먼저 질문하여 프로젝트의 빈틈을 찾아주는 킥오프 웹 도구.

---

## 1. 프로젝트 프로필

### 기본 정보

| 항목 | 내용 |
|---|---|
| 프로젝트명 | Prequel |
| 유형 | Web App |
| 목적 | AI가 구조화된 인터뷰로 프로젝트 기획의 빈틈을 찾아주는 웹 서비스. 비CLI 사용자(기획자, 개발자)도 접근 가능 |
| 주요 사용자 | 기획자, IT 개발자 |
| 데이터 소스 | 사용자 텍스트 입력 + 하네스 스킬 정의 & Reference 파일 (빌드 시 복사, 프롬프트로 사용) + Claude API 응답 |
| 결과 형태 | 웹 화면 (섹션별 카드 UI + 아키텍처 다이어그램) |

### 핵심 기능 (평가 후 조정됨)

| # | 기능 | 단계 |
|---|---|---|
| 1 | AI 구조화 인터뷰 (채팅형 UI) | MVP-1 |
| 2 | 프로젝트 유형 자동 감지 | MVP-1 |
| 3 | 킥오프 문서 생성 + 실시간 미리보기 (카드 UI) | MVP-1 |
| 4 | 아키텍처 다이어그램 자동 생성 (Mermaid.js) | MVP-1 |
| 5 | 토큰 사용량 추적 & 횟수 기반 한도 관리 | MVP-2 |
| 6 | 사용자 인증 (OAuth) + Admin 대시보드 | MVP-1 |
| 7 | 사용자 가이드 | MVP-2 |
| 8 | 공지사항 / 패치내역 | MVP-1 |
| 9 | 갭 분석 & 정직한 평가 | v2 |
| 10 | 문서 내보내기 (Markdown, DOCX) | v2 |
| 11 | 공유 링크 (팀 협업) | v2 |
| 12 | 다국어 UI (한국어 + 영어) | MVP-1 |
| 13 | 프로젝트 템플릿 갤러리 (유형별 샘플 킥오프 쇼케이스) | MVP-2 |
| 14 | 인터뷰 진행률 시각화 (프로그레스바 + 예상 잔여 시간) | MVP-1 |
| 15 | 실시간 비용 미터 (잔여 횟수 실시간 표시) | MVP-2 |
| 16 | 인터뷰 일시정지 & 이어하기 (세션 자동 저장 + 재개) | MVP-1 |
| 17 | API 비용 최적화 (프롬프트 STEP 분할 + CLI 제거 + Reference 필터링 + 대화 압축 + Prompt Caching) | MVP-1 |
| 18 | API 비용 최적화 고도화 (모델 라우팅 Sonnet/Haiku 혼합 + 턴 압축 UI) | MVP-2 |

### 채택된 AI 제안 (평가 후 조정됨)

| # | 아이디어 | 분류 |
|---|---|---|
| 1 | 프로젝트 템플릿 갤러리 — 유형별 샘플 킥오프 결과를 미리 보여주는 쇼케이스 페이지 | MVP-2 |
| 2 | 인터뷰 진행률 시각화 — 스텝 프로그레스바 + 예상 잔여 시간 표시 | MVP-1 |
| 3 | 실시간 비용 미터 — 인터뷰 진행 중 잔여 횟수 실시간 표시 | MVP-2 |

### 사용자 추가 요청 (평가 후 조정됨)

| # | 기능 | 분류 |
|---|---|---|
| 1 | 인터뷰 일시정지 & 이어하기 — 세션 자동 저장 + 내 프로젝트에서 재개 | MVP-1 |

### 기술 스택

| 레이어 | 기술 | 선택 이유 |
|---|---|---|
| 프론트엔드 | React (Vite) + TailwindCSS | SPA에 적합, 가벼움, FastAPI와 역할 분리 명확 |
| 다국어 | react-i18next | ko/en JSON 분리, 런타임 전환 |
| 다이어그램 | Mermaid.js | 오픈소스 무료, 브라우저 로컬 렌더링 |
| 백엔드 | FastAPI (Python) | Claude API SDK Python 우선 지원, 타입 힌팅 |
| DB + Auth | Supabase (PostgreSQL + OAuth) | Auth + DB + RLS 올인원, Free 티어 충분 |
| 결제 | Toss Payments (추후 Stripe/PayPal 추가) | 국내 결제 최적화, 수수료 낮음 (MVP-2) |
| AI API | Claude API (Anthropic) | 하네스 프롬프트 그대로 활용 |

### 과금 모델

| 플랜 | 가격 | 내용 |
|---|---|---|
| Free | ₩0 | 계정당 킥오프 2회 |
| Basic | ₩9,900/월 | 월 10회 킥오프 |
| Pro | ₩24,900/월 | 월 30회 킥오프 |
| Admin | ₩0 | 무제한 (운영자 전용) |

### 주요 화면 (8개)

| # | 화면 | 역할 |
|---|---|---|
| 1 | 랜딩 페이지 | 서비스 소개 + 템플릿 갤러리(샘플 쇼케이스) + 시작하기 |
| 2 | 로그인/회원가입 | OAuth (Google + GitHub) |
| 3 | 내 프로젝트 목록 | 프로젝트 관리 |
| 4 | 인터뷰 (채팅 UI) | 핵심 — 질문/답변 진행 |
| 5 | 결과 뷰어 | 킥오프 문서 카드UI + Mermaid 다이어그램 |
| 6 | Admin 대시보드 | 사용자/토큰/비용 관리 + 공지 작성 |
| 7 | 사용자 가이드 | 사용법 안내 + FAQ |
| 8 | 공지사항/패치내역 | 업데이트 이력 + 공지 |

### 제약사항

| 항목 | 내용 |
|---|---|
| 토큰 비용 | 킥오프 1회당 Claude API 비용 ~$0.4~0.7 (프롬프트 재사용 + STEP 분할 + Prompt Caching 적용) |
| 과금 구조 | 수익 > 원가를 유지하기 위해 횟수 기반 한도 적용 (MVP-2) |
| 하네스 동기화 | 하네스 업데이트 시 스킬 정의(.md) + Reference 파일을 빌드 스크립트로 복사 필요 |
| 보안 — 입력 검증 | XSS, Injection 방지 (FastAPI 입력 검증 + React 출력 이스케이프) |
| 보안 — HTTPS/TLS | 프로덕션 배포 시 필수 적용 |
| 보안 — Rate Limiting | API 엔드포인트에 요청 제한 적용 (남용 방지) |
| 보안 — 결제 데이터 | Toss Payments가 PCI-DSS 처리, 서버에 카드 정보 미저장 (MVP-2) |

### 외부 서비스 의존성

| 서비스 | 용도 | MVP 포함 |
|---|---|---|
| Claude API (Anthropic) | AI 인터뷰 + 문서 생성 | ✅ (필수) |
| Supabase | DB + Auth (Google/GitHub OAuth) | ✅ (필수) |
| Toss Payments | 유료 플랜 결제 | MVP-2 (평가 후 조정됨) |
| Stripe / PayPal | 해외 결제 | ⬜ (선택) |

---

## 2. 시스템 아키텍처

### 전체 흐름

```
사용자 (브라우저)
  ↕ React SPA
  ↕ REST API
FastAPI (백엔드)
  ├→ prompt_manager.py (스킬 .md + Reference → 프롬프트 조합)
  │     ├ STEP 분할 로딩 (현재 단계만)
  │     ├ CLI 섹션 자동 제거
  │     ├ Reference 유형별 필터링
  │     ├ 대화 이력 압축
  │     └ Prompt Caching 적용
  ├→ Claude API (프롬프트 기반 인터뷰 + 문서 생성)
  ├→ Supabase (DB + Auth)
  ├→ Toss Payments (결제, MVP-2)
  └→ 하네스 파일 (빌드 시 복사)
       ├ skills/*/index.md (스킬 정의 → 프롬프트)
       └ skills/*/references/*.md (Reference → 프롬프트)
```

### 프롬프트 재사용 아키텍처

하네스의 스킬 정의(.md)를 Claude API 프롬프트로 직접 사용하여, 하네스 기능을 그대로 웹으로 옮긴다. Python은 프롬프트를 조합하고 최적화하는 얇은 레이어만 담당한다.

```
[하네스 원본]                              [웹 백엔드]
skills/kickoff-interview/index.md  ──복사──→ backend/skills/
skills/*/references/*.md           ──복사──→ backend/references/
                                            ↓
                                   prompt_manager.py가 조합:
                                   1. 현재 STEP만 추출 (STEP 분할)
                                   2. CLI 전용 지시 제거
                                   3. Reference 해당 유형만 필터링
                                   4. 오래된 대화 압축
                                   5. Prompt Caching 적용
                                            ↓
                                   Claude API 호출 → JSON 응답
```

### 각 단계 도구/서비스

| 단계 | 처리 | 도구 |
|---|---|---|
| 입력 | 사용자 아이디어/답변 수집 | React 채팅 UI |
| 인증 | 로그인/회원가입 | Supabase Auth (OAuth) |
| 프롬프트 조합 | 스킬 .md STEP 분할 + Reference 필터링 + 대화 압축 | prompt_manager.py (Python) |
| 인터뷰 진행 | 조합된 프롬프트로 AI 호출 | Claude API (Prompt Caching) |
| 문서 생성 | 인터뷰 결과 → 킥오프 문서 | Claude API + 스킬 .md 프롬프트 |
| 다이어그램 | Mermaid 코드 → SVG | Mermaid.js (브라우저) |
| 저장 | 프로젝트/문서/세션 저장 | Supabase PostgreSQL |
| 결제 | 유료 전환 | Toss Payments (MVP-2) |
| 표시 | 카드 UI + 다이어그램 렌더링 | React + TailwindCSS |

---

## 3. 데이터 구조

### 테이블 설계

**1. users (사용자)**

| 컬럼 | 타입 | 설명 |
|---|---|---|
| id | UUID (PK) | Supabase Auth 연동 |
| email | VARCHAR | 로그인 식별 |
| role | ENUM(user/admin) | 권한 분리 |
| free_used | INTEGER | 무료 사용 횟수 (최대 2) |
| plan | ENUM(free/basic/pro) | 과금 상태 |
| plan_expires_at | TIMESTAMP | 구독 만료일 |
| created_at | TIMESTAMP | 가입일 |

**2. projects (킥오프 프로젝트)**

| 컬럼 | 타입 | 설명 |
|---|---|---|
| id | UUID (PK) | |
| user_id | FK → users | 소유자 |
| name | VARCHAR | 프로젝트명 |
| project_type | VARCHAR | 유형 (Web App, AI 등) |
| language | ENUM(ko/en) | 산출물 언어 |
| status | ENUM(in_progress/completed) | 진행 상태 |
| kickoff_doc | TEXT | 킥오프 문서 (Markdown) |
| mermaid_code | TEXT | 아키텍처 다이어그램 코드 |
| created_at | TIMESTAMP | |
| updated_at | TIMESTAMP | |

**3. interview_sessions (인터뷰 세션)**

| 컬럼 | 타입 | 설명 |
|---|---|---|
| id | UUID (PK) | |
| project_id | FK → projects | |
| step | ENUM(planning/design) | 기획/설계 구분 |
| status | ENUM(active/paused/completed) | 세션 상태 (일시정지/재개 지원) |
| current_question | INTEGER | 현재 진행 중인 질문 번호 (재개 시 사용) |
| messages | JSONB | 채팅 기록 [{role, content, timestamp}] |
| token_used | INTEGER | 세션 토큰 사용량 |
| created_at | TIMESTAMP | |
| paused_at | TIMESTAMP (nullable) | 마지막 일시정지 시각 |

**4. payments (결제 이력)**

| 컬럼 | 타입 | 설명 |
|---|---|---|
| id | UUID (PK) | |
| user_id | FK → users | |
| amount | INTEGER | 결제 금액 (원) |
| method | VARCHAR | 결제 수단 |
| toss_payment_key | VARCHAR | Toss 결제 키 (환불/조회) |
| status | ENUM(success/failed/refunded) | 결제 상태 |
| created_at | TIMESTAMP | |

**5. token_usage (토큰 사용 로그)**

| 컬럼 | 타입 | 설명 |
|---|---|---|
| id | UUID (PK) | |
| user_id | FK → users | |
| project_id | FK → projects | |
| input_tokens | INTEGER | 입력 토큰 |
| output_tokens | INTEGER | 출력 토큰 |
| cost_usd | DECIMAL | 비용 (달러) |
| created_at | TIMESTAMP | |

**6. announcements (공지/패치내역)**

| 컬럼 | 타입 | 설명 |
|---|---|---|
| id | UUID (PK) | |
| type | ENUM(notice/patch) | 공지 vs 패치내역 |
| title | VARCHAR | 제목 |
| content | TEXT | 내용 (Markdown) |
| version | VARCHAR (nullable) | 버전번호 (패치내역용) |
| pinned | BOOLEAN | 상단 고정 여부 |
| created_at | TIMESTAMP | |

### 데이터 볼륨 & 보관

| 항목 | 수치 |
|---|---|
| 킥오프 1회당 데이터 | ~60KB (문서 10KB + 채팅 50KB + 로그 1KB) |
| 초기 사용량 (MVP) | 일 5~20건 |
| 데이터 보관 기간 | 생성 후 5년 (이후 자동 삭제) |
| Supabase Free 한도 도달 | 약 5만 건 (수년간 충분) |

---

## 4. 실패 시나리오 / 엣지케이스

| # | 시나리오 | 영향 | 인식 수준 대응 |
|---|---|---|---|
| 1 | Claude API 장애/지연 | 인터뷰 중단, 문서 생성 불가 | 재시도 + 사용자 알림 |
| 2 | 사용자 킥오프 횟수 소진 | 추가 사용 차단 | 유료 전환 유도 안내 (MVP-2) |
| 3 | Toss Payments 결제 실패 | 유료 전환 불가 | 에러 안내 + 재시도 (MVP-2) |
| 4 | Supabase 장애 | 로그인/데이터 접근 불가 | 점검 안내 페이지 |
| 5 | 인터뷰 중 브라우저 종료/새로고침 | 진행 중 데이터 유실 | 세션 자동 저장으로 복구 |
| 6 | Claude API Rate Limit 초과 (동시 사용자 집중) | 인터뷰 응답 지연/실패 | 요청 큐잉 + 재시도 + 사용자 대기 안내 |
| 7 | 하네스 파일 동기화 누락 / 프롬프트 최적화 오류 | 구버전 스킬 프롬프트 사용, 잘못된 프롬프트 조합 | sync_harness.py 버전 체크 + prompt_manager.py 원본 전체 전송 fallback |

---

## 5. 누락/모순 점검 결과

| # | 유형 | 내용 | 상태 | 해결 방법 |
|---|---|---|---|---|
| 1 | 누락 | 배치 작업 실행 메커니즘 미정의 (소프트 삭제 30일 정리, 5년 보관 만료 삭제) | ✅ 해결 | Supabase pg_cron 확장 사용, 섹션 10-4에 추가 |
| 2 | 누락 | 완료 조건에 프로그레스바(기능#14) 누락 | ✅ 해결 | 섹션 8에 "진행 단계 표시" 완료 조건 추가 |
| 3 | 모순 | 섹션 9-4 호스팅 표기 "Vercel" → 섹션 10-3에서 Netlify 확정 | ✅ 해결 | 섹션 9-4를 "Netlify/Railway"로 수정 |
| 4 | 누락 | Claude API 자체 Rate Limit 리스크 미인식 (동시 50명 시) | ✅ 해결 | 섹션 4에 시나리오#6 추가 (큐잉 + 재시도 + 대기 안내) |
| 5 | 모순 | 섹션 7/6/8의 MVP-1 기능 수 불일치 (7개/9개 → 실제 10개) | ✅ 해결 | 섹션 7, 6, 8의 기능 수를 10개로 통일 |
| 6 | 모순 | 섹션 7 MVP-2 "4개 기능" → 실제 5개 (모델 라우팅 #18 누락) | ✅ 해결 | 섹션 7 MVP-2를 5개로 수정, 모델 라우팅 추가 |
| 7 | 누락 | 섹션 4에 프롬프트 최적화/하네스 동기화 실패 시나리오 없음 | ✅ 해결 | 섹션 4에 시나리오#7 추가 (버전 체크 + fallback) |
| 8 | 누락 | 섹션 8 완료 조건에 API 비용 최적화(기능#17) 대응 항목 없음 | ✅ 해결 | 섹션 8 품질 기준에 프롬프트 최적화 + 비용 $1 이하 조건 추가 |

점검 범위: 카테고리 1~7 전체 (v2 설계 섹션 포함)
1차 점검: 2026-05-18 (4건)
2차 점검: 2026-05-18 (4건 — 프롬프트 재사용 아키텍처 반영 후 재점검)

---

## 6. 개발 착수 체크리스트

> 아래 항목을 모두 확인하면 개발을 시작할 수 있습니다.

### 환경 구성
- [ ] Node.js 18+ 설치 확인
- [ ] Python 3.11+ 설치 확인
- [ ] npm / pip 패키지 매니저 동작 확인

### 데이터 & 접근
- [ ] 하네스 스킬 정의 + Reference 파일 접근 가능 확인 (빌드 시 복사 대상 경로)
- [ ] 테스트용 샘플 인터뷰 시나리오 준비 (기능 검증용)

### 외부 서비스
- [ ] Anthropic 계정 생성 + Claude API 키 발급
- [ ] Supabase 계정 생성 + 프로젝트 생성 (Free 티어)
- [ ] Supabase에서 Google OAuth 클라이언트 ID 연동 (Google Cloud Console)
- [ ] Supabase에서 GitHub OAuth App 연동 (GitHub Settings > Developer)
- [ ] Netlify 계정 생성 + Git 저장소 연동
- [ ] Railway 계정 생성 + Git 저장소 연동
- [ ] Claude API 사용 한도(RPM/TPM) 확인 — 동시 사용자 대비

### 설계 확정
- [ ] MVP-1 범위 최종 확정 (10개 기능)
- [ ] DB 스키마 확정 (섹션 11 엔티티 6개)
- [ ] API 엔드포인트 목록 초안 작성
- [ ] 미해결 의사결정 없음 확인

### 프로젝트 설정
- [ ] Git 저장소 초기화 + .gitignore 설정
- [ ] 프로젝트 폴더 구조 생성 (아래 트리 참조)
- [ ] .env.example 파일 생성 (아래 환경 설정 참조)
- [ ] 하네스 동기화 스크립트 작성 (sync_harness.py — 스킬 .md + Reference 복사)

### 프로젝트 구조 (Project Structure)

```
prequel/
├── frontend/                          # React (Vite) SPA [Netlify]
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── chat/                  # 채팅 UI — 인터뷰 오케스트레이터
│   │   │   ├── viewer/                # 결과 뷰어 — 카드 UI + Mermaid
│   │   │   ├── admin/                 # Admin 대시보드
│   │   │   ├── auth/                  # 로그인/회원가입
│   │   │   └── common/               # ProgressBar, Header, Footer
│   │   ├── pages/                     # 라우트별 페이지 (8개 화면)
│   │   ├── hooks/                     # 커스텀 훅 (useInterview, useAuth 등)
│   │   ├── i18n/                      # 다국어 (ko.json, en.json)
│   │   ├── lib/                       # API 클라이언트, Supabase 클라이언트
│   │   └── App.tsx
│   ├── index.html
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   └── package.json
├── backend/                           # FastAPI [Railway]
│   ├── app/
│   │   ├── api/                       # API 라우터
│   │   │   ├── auth.py                # 인증 엔드포인트
│   │   │   ├── projects.py            # 프로젝트 CRUD (FR-013)
│   │   │   ├── interview.py           # 인터뷰 오케스트레이터 (FR-001)
│   │   │   ├── admin.py               # Admin API (FR-007)
│   │   │   ├── export.py              # Markdown/PDF 내보내기 (FR-004)
│   │   │   └── announcements.py       # 공지사항 (FR-008)
│   │   ├── core/                      # 핵심 로직
│   │   │   ├── prompt_manager.py      # 스킬 .md + Reference → 프롬프트 조합 (STEP 분할, CLI 제거, 필터링, 압축, 캐싱)
│   │   │   └── doc_engine.py          # 인터뷰 결과 → Markdown 생성
│   │   ├── models/                    # SQLAlchemy 모델 (섹션 11 엔티티 6개)
│   │   ├── schemas/                   # Pydantic 요청/응답 스키마
│   │   ├── middleware/                # Auth, Rate Limiting, CORS
│   │   ├── config.py                  # 환경 설정 (Pydantic BaseSettings)
│   │   └── main.py                    # FastAPI 앱 진입점
│   ├── migrations/                    # Alembic 마이그레이션
│   ├── skills/                        # 하네스 스킬 정의 (빌드 시 복사 → 프롬프트로 사용)
│   ├── references/                    # 하네스 Reference 파일 (빌드 시 복사 → 프롬프트로 사용)
│   ├── tests/                         # pytest (핵심 로직 60%+)
│   ├── requirements.txt
│   └── Procfile                       # Railway 배포 설정
├── scripts/
│   └── sync_harness.py                # 하네스 스킬 .md + Reference → backend/ 복사
├── .env.example
├── .gitignore
└── README.md
```

### 환경 설정 (Configuration)

| 변수 | 기본값 | 설명 | 필수 |
|---|---|---|---|
| `ANTHROPIC_API_KEY` | | Claude API 인증 키 | ✅ |
| `SUPABASE_URL` | | Supabase 프로젝트 URL (백엔드) | ✅ |
| `SUPABASE_ANON_KEY` | | Supabase 클라이언트 키 (백엔드) | ✅ |
| `SUPABASE_SERVICE_KEY` | | Supabase 서버 관리자 키 (비공개) | ✅ |
| `VITE_SUPABASE_URL` | | 프론트엔드용 Supabase URL | ✅ |
| `VITE_SUPABASE_ANON_KEY` | | 프론트엔드용 Supabase 키 | ✅ |
| `CORS_ORIGINS` | `http://localhost:5173` | 허용 CORS 도메인 | ✅ |
| `LOG_LEVEL` | `INFO` | 로그 레벨 | |
| `TOSS_CLIENT_KEY` | | Toss Payments 클라이언트 키 | MVP-2 |
| `TOSS_SECRET_KEY` | | Toss Payments 서버 키 | MVP-2 |

**.env.example**:
```
# Claude API
ANTHROPIC_API_KEY=sk-ant-xxx

# Supabase (Backend)
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_ANON_KEY=eyJxxx
SUPABASE_SERVICE_KEY=eyJxxx

# Supabase (Frontend - Vite prefix)
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJxxx

# Server
CORS_ORIGINS=http://localhost:5173
LOG_LEVEL=INFO

# Toss Payments (MVP-2)
# TOSS_CLIENT_KEY=test_ck_xxx
# TOSS_SECRET_KEY=test_sk_xxx
```

생성일: 2026-05-18

---

## 7. 정직한 평가

### 종합 판정: 🟡 조건부 적합

| # | 평가 차원 | 판정 | 한 줄 피드백 |
|---|---|---|---|
| 1 | 차별화 | 🟢 적합 | 구조화 인터뷰 + 갭 분석 + 유형별 맞춤화는 경쟁 도구와 명확히 구분됨 |
| 2 | AI 적절성 | 해당 없음 | 프로젝트 유형이 Web App (AI 유형 아님) |
| 3 | 시장 유효성 | 🟡 조건부 | AI 기획 도구 시장 성장 중이나 경쟁 증가. 구조화 인터뷰가 차별점 |
| 4 | 완성도 기대치 | 🟡 조건부 | MVP 2단계 분리로 리스크 완화됨. MVP-1은 10개 기능으로 실현 가능 |
| 5 | 학습 비용 | 비활성 | 비활성 (프로젝트 배경 정보 없음) |
| 6 | 보안 적절성 | 🟡 조건부 | OAuth 인증 있음. 입력 검증/HTTPS/Rate Limiting 제약사항에 추가 완료 |

### 🟡 상세

#### 시장 유효성

**현재 상태**: Manyfast, Notion AI 등 AI 기획 도구 증가 추세
**개선 제안**: "AI가 질문해서 빈틈을 찾아주는 도구"로 포지셔닝하여 차별화 강조

#### 완성도 기대치

**현재 상태**: MVP를 2단계로 분리하여 리스크 완화
**MVP-1 (10개 기능)**: 인터뷰 + 문서 생성 + 유형 감지 + 다이어그램 + 인증 + Admin + 프로그레스바 + i18n + 공지/패치내역 + 일시정지/이어하기 + API 비용 최적화
**MVP-2 (5개 기능)**: 토큰/결제 관리 + 비용 미터 + 갤러리 + 가이드 + 모델 라우팅

#### 보안 적절성

**현재 상태**: OAuth 인증 설계됨, 보안 항목 제약사항에 추가 완료
**추가된 항목**: 입력 검증(XSS/Injection), HTTPS/TLS, Rate Limiting, 결제 데이터 보호

### 사용자 결정

- 선택: 조정 (MVP 2단계 분리 + 보안 항목 추가)
- 조정 내용: MVP-1(핵심 가치 검증) → MVP-2(상용화) 단계 분리, 보안 제약사항 4건 추가

평가일: 2026-05-18

---

## 8. 완료 조건 (Definition of Done)

> 아래 조건을 모두 만족하면 이 프로젝트는 "완료"입니다.

### 기능 동작 기준
- [ ] 프로젝트 아이디어 입력 시 7개 유형 중 하나로 자동 감지되고, 유형에 맞는 인터뷰 질문(공통 7개 + 유형별 3개)이 제시된다
- [ ] 기획 인터뷰 완료 후 킥오프 문서가 생성되어 섹션별 카드 UI로 표시된다
- [ ] 킥오프 문서에 Mermaid 아키텍처 다이어그램이 포함되고 브라우저에서 SVG로 렌더링된다
- [ ] Google/GitHub OAuth 로그인이 동작하고, Admin 계정으로 공지사항/패치내역 작성이 가능하다
- [ ] 인터뷰 일시정지 → 브라우저 종료 → 재접속 시 마지막 질문부터 데이터 유실 없이 이어하기가 동작한다
- [ ] 인터뷰 진행 중 프로그레스바가 현재 진행 단계를 표시한다
- [ ] 한국어/영어 전환 시 UI 텍스트와 AI 생성 콘텐츠가 선택 언어로 표시된다

### 품질 기준
- [ ] MVP-1 전체 기능(10개)을 순서대로 실행하는 end-to-end 데모 시나리오가 에러 없이 완료된다 *(evaluate 🟡 완성도 대응)*
- [ ] Claude API 장애(타임아웃/5xx) 시 사용자에게 에러 안내가 표시되고 재시도 버튼이 제공된다
- [ ] API 엔드포인트에 입력 검증(XSS/Injection 방지)과 Rate Limiting이 적용되어 있다 *(evaluate 🟡 보안 대응)*
- [ ] 프롬프트 최적화(STEP 분할 + CLI 제거 + Reference 필터링 + Prompt Caching)가 적용되어 킥오프 1회당 API 비용이 $1 이하로 유지된다

### 문서화 기준
- [ ] README에 프로젝트 설명, 로컬 실행 가이드(3단계 이내), 환경 변수(.env) 설정 방법이 포함되어 있다
- [ ] README에 기존 AI 기획 도구(Manyfast 등) 대비 "구조화 인터뷰" 차별점이 명시되어 있다 *(evaluate 🟡 시장 유효성 대응)*

생성일: 2026-05-18

---

## 9. 요구사항 정의

### 9-1. 기능 요구사항 (Functional Requirements)

| ID | 기능 | 설명 | 우선순위 | 출처 |
|---|---|---|---|---|
| FR-001 | AI 구조화 인터뷰 | 하네스 스킬 정의(.md)를 Claude API 프롬프트로 사용하여, 채팅형 UI로 기획/설계 질문을 순차 진행하고 사용자 답변을 수집한다 | 필수 | 섹션 1 기능#1 |
| FR-002 | 프로젝트 유형 자동 감지 | 사용자 아이디어 입력 시 7개 유형 중 하나로 판별하고 확인을 받는다 | 필수 | 섹션 1 기능#2 |
| FR-003 | 킥오프 문서 생성 | 인터뷰 완료 후 Markdown 기반 킥오프 문서를 자동 생성한다 | 필수 | 섹션 1 기능#3 |
| FR-004 | 결과 뷰어 (읽기 전용) | 생성된 문서를 섹션별 카드 UI로 표시하고, Markdown/PDF 다운로드를 제공한다. 인라인 편집은 MVP-2에서 추가한다 | 필수 | 섹션 1 기능#3 + 갭Q1 |
| FR-005 | 아키텍처 다이어그램 | 인터뷰 결과에서 Mermaid 코드를 자동 생성하고 브라우저에서 SVG로 렌더링한다 | 필수 | 섹션 1 기능#4 |
| FR-006 | 사용자 인증 (OAuth) | Google/GitHub OAuth로 로그인/회원가입을 처리한다 | 필수 | 섹션 1 기능#6 |
| FR-007 | Admin 대시보드 | 사용자 목록 조회, 계정 정지/삭제, 공지사항 CRUD, 토큰 사용량 조회 기능을 제공한다 | 필수 | 섹션 1 기능#6 + 갭Q4 |
| FR-008 | 공지사항/패치내역 | Admin이 공지/패치내역을 작성하고, 일반 사용자가 열람한다 | 필수 | 섹션 1 기능#8 |
| FR-009 | 다국어 UI | 한국어/영어를 지원한다. 언어는 프로젝트 생성 시 고정되며 진행 중 변경 불가. 다른 언어가 필요하면 새 프로젝트를 생성해야 한다 | 필수 | 섹션 1 기능#12 |
| FR-010 | 인터뷰 진행률 시각화 | 스텝 프로그레스바와 예상 잔여 시간을 인터뷰 중 실시간 표시한다 | 필수 | 제안#2 |
| FR-011 | 인터뷰 일시정지 & 이어하기 | 이벤트 기반 세션 저장: ①사용자 답변 전송 시 즉시 저장, ②일시정지 버튼 클릭 시 저장, ③브라우저 종료/이탈 시 beforeunload 저장, ④5분 무응답 시 자동 일시정지 + 저장. 재접속 시 마지막 질문부터 재개한다 | 필수 | 섹션 1 기능#16 |
| FR-012 | 무료 횟수 제한 | 계정당 2회 킥오프 완료 후 추가 사용을 차단하고 유료 전환 안내를 표시한다 | 필수 | 섹션 1 과금 + 갭Q3 |
| FR-013 | 프로젝트 CRUD | 내 프로젝트 목록 조회, 새 프로젝트 생성, 프로젝트 삭제를 지원한다 | 필수 | 웹앱 추가영역(CRUD) |
| FR-014 | 토큰 사용량 추적 | 킥오프 세션별 input/output 토큰과 비용을 기록하고 Admin이 조회 가능하다 | 선택 | 섹션 1 기능#5 (MVP-2) |
| FR-015 | 결제 연동 | Toss Payments를 통해 Basic/Pro 플랜 결제 및 구독 관리를 처리한다 | 선택 | 섹션 1 기능#5 (MVP-2) |
| FR-016 | 인라인 편집 | 결과 뷰어에서 킥오프 문서를 직접 편집하고 저장할 수 있다 | 선택 | 갭Q1 (MVP-2) |
| FR-017 | 템플릿 갤러리 | 유형별 샘플 킥오프 결과를 쇼케이스 페이지에서 미리 볼 수 있다 | 선택 | 제안#1 (MVP-2) |
| FR-018 | 이용약관 / 개인정보처리방침 | 이용약관 및 개인정보처리방침 페이지를 제공하고, 회원가입 시 동의를 받는다 | 필수 | 비즈니스 요건 (프로덕션 배포) |
| FR-019 | 사용자 데이터 삭제 요청 | 사용자가 본인 계정 및 관련 데이터(프로젝트, 세션, 토큰 기록) 삭제를 요청할 수 있다 | 필수 | GDPR/개인정보보호법 대응 |
| FR-020 | API 비용 최적화 (프롬프트 하이브리드) | prompt_manager.py가 4가지 최적화를 수행한다: ①스킬 .md STEP 분할 로딩(현재 단계만), ②CLI 전용 섹션 자동 제거, ③Reference 파일 프로젝트 유형별 필터링, ④오래된 대화 이력 압축. Anthropic Prompt Caching을 적용하여 반복 프롬프트 비용을 90% 할인받는다 | 필수 | 섹션 1 기능#17 (비용 최적화) |
| FR-021 | 모델 라우팅 | 단순 확인 턴은 Haiku, 분석/생성 턴은 Sonnet으로 처리한다. 사용자 메시지에서 새 정보가 감지되면 Sonnet으로 재처리한다 | 선택 | 섹션 1 기능#18 (MVP-2) |

### 9-2. 비기능 요구사항 (Non-Functional Requirements)

| ID | 카테고리 | 항목 | 목표 메트릭 | 우선순위 |
|---|---|---|---|---|
| NFR-001 | 성능 | 페이지 로드 시간 | LCP < 2.5s (데스크탑 기준) | 높음 |
| NFR-002 | 성능 | API 응답 시간 (일반) | p95 < 500ms (인증, CRUD, 목록 조회 등) | 높음 |
| NFR-003 | 성능 | AI 인터뷰 응답 시간 | 질문 1건당 < 30s (Claude API 호출 포함) | 중간 |
| NFR-004 | 성능 | Mermaid 렌더링 | 다이어그램 SVG 생성 < 2s | 낮음 |
| NFR-005 | 보안 | 인증/인가 | OAuth 2.0 (Google + GitHub), JWT 토큰 기반 세션 | 높음 |
| NFR-006 | 보안 | 입력 검증 | FastAPI Pydantic 스키마 검증 + React dangerouslySetInnerHTML 미사용 | 높음 |
| NFR-007 | 보안 | HTTPS/TLS | 프로덕션 환경 전 통신 TLS 1.2+ 적용 | 높음 |
| NFR-008 | 보안 | Rate Limiting | 인증 API: 5회/분, 인터뷰 API: 20회/분, 일반 API: 60회/분 | 높음 |
| NFR-009 | 보안 | 데이터 격리 | Supabase RLS — 사용자는 자기 프로젝트만 접근 가능 | 높음 |
| NFR-010 | 확장성 | 동시 사용자 | MVP 목표 50명 동시 접속 시 성능 저하 없음 | 중간 |
| NFR-011 | 확장성 | 데이터 증가 | 프로젝트 5만 건까지 목록 조회 p95 < 1s | 중간 |
| NFR-012 | 유지보수성 | 코드 구조 | 프론트(React)/백(FastAPI) 분리, 컴포넌트 단위 모듈화 | 중간 |
| NFR-013 | 유지보수성 | 테스트 커버리지 | 백엔드 핵심 로직 60% 이상 | 중간 |
| NFR-014 | 유지보수성 | 로깅 | 구조화된 JSON 로깅 (요청 ID, 사용자 ID, 에러 트레이스) | 중간 |
| NFR-015 | 유지보수성 | API 문서 | FastAPI 자동 생성 OpenAPI (Swagger UI) 제공 | 낮음 |
| NFR-016 | 호환성 | 데스크탑 브라우저 | Chrome 90+, Firefox 90+, Safari 15+, Edge 90+ | 중간 |
| NFR-017 | 호환성 | 태블릿 (MVP-2) | iPad Safari, Android Chrome에서 레이아웃 정상 표시 | 낮음 |

**비활성 카테고리:**

| 카테고리 | 비활성 사유 |
|---|---|
| 가용성 | 포트폴리오 성격 프로젝트로, 가용성 SLA 불필요 (장애 시 점검 안내 페이지로 대응) |
| 데이터 품질 | Web App 유형으로 데이터 중심 프로젝트가 아님 (사용자 입력 → AI 생성 흐름) |

### 9-3. 사용자 흐름 (User Flows)

#### 주요 흐름: 신규 킥오프 생성

1. 사용자가 랜딩 페이지에서 "시작하기" 클릭
2. OAuth 로그인 화면 표시 (Google / GitHub 선택)
3. 로그인 성공 → 내 프로젝트 목록 페이지로 이동
4. "새 프로젝트" 클릭 → 언어 선택 (한국어/영어) → 아이디어 입력 화면
5. 사용자가 프로젝트 아이디어를 자유 텍스트로 입력
6. 시스템이 프로젝트 유형을 자동 감지하여 표시 (사용자 확인/수정)
7. 기획 인터뷰 시작 — 채팅 UI에 질문이 순차 표시 (프로그레스바 + 잔여 시간 표시)
8. 사용자 답변 입력 → 세션 즉시 저장 → AI가 다음 질문 제시 (반복)
9. 기획 인터뷰 완료 → 설계 인터뷰 진행 여부 확인
10. 인터뷰 완료 → 킥오프 문서 생성 + Mermaid 다이어그램 코드 생성
11. 결과 뷰어: 섹션별 카드 UI + 아키텍처 다이어그램 SVG 표시
12. 사용자가 Markdown/PDF 다운로드

#### 주요 흐름: 인터뷰 일시정지 & 재개

1. 인터뷰 진행 중 사용자가 "일시정지" 클릭 (또는 브라우저 종료)
2. 시스템이 현재 세션 상태(진행 질문, 채팅 기록)를 즉시 저장
3. 5분 무응답 시에도 자동 일시정지 + 저장
4. 사용자 재접속 → 내 프로젝트 목록에서 "진행 중" 상태 프로젝트 확인
5. "이어하기" 클릭 → 마지막 질문부터 인터뷰 재개

#### 대안 흐름

- **다른 언어로 킥오프**: 한국어 프로젝트 진행 중 영어 버전이 필요하면 → 기존 프로젝트는 유지한 채 새 프로젝트를 영어로 생성
- **유형 수정**: 자동 감지된 유형이 틀린 경우 → 사용자가 직접 유형 선택 후 인터뷰 재시작
- **"추천해줘" 응답**: 사용자가 질문에 "추천해줘" 입력 → AI가 추천안을 제시 → 채택/수정/패스

#### 예외 흐름

- **Claude API 타임아웃/5xx**: 사용자에게 에러 안내 표시 + "재시도" 버튼 제공, 세션 상태는 유지
- **무료 횟수 초과**: 2회 킥오프 완료 후 "새 프로젝트" 클릭 시 → 차단 안내 + "유료 플랜 안내" 표시 (MVP-2에서 결제 연동)
- **OAuth 인증 실패**: 에러 메시지 + 다른 OAuth 제공자 선택 안내
- **Supabase 장애**: 점검 안내 페이지 표시 (로그인/데이터 접근 불가)
- **인터뷰 중 네트워크 끊김**: 미전송 답변은 로컬 임시 저장, 재연결 시 자동 전송 시도

### 9-4. 제약사항 보강

| 유형 | 내용 | 근거 |
|---|---|---|
| 기술 | MVP-1 결과 뷰어는 읽기 전용 (인라인 편집은 MVP-2) | 갭 인터뷰 Q1 |
| 기술 | 데스크탑 전용 (태블릿 MVP-2, 모바일 미지원) | 갭 인터뷰 Q2 |
| 기술 | 언어는 프로젝트 생성 시 고정, 진행 중 변경 불가 (다른 언어는 새 프로젝트) | 사용자 요청 |
| 기술 | Reference 파일은 빌드 시 복사 (런타임 동기화 아님) | 섹션 1 제약사항 |
| 비즈니스 | 무료 2회 소진 시 결제 없이 차단 (MVP-1에 결제 미포함) | 갭 인터뷰 Q3 |
| 비즈니스 | Admin은 사용자 계정 정지/삭제 가능 | 갭 인터뷰 Q4 |
| 비즈니스 | 프로덕션 배포 시 이용약관/개인정보처리방침 필수 | 비즈니스 요건 |
| 비즈니스 | 유료 서비스 운영 시 사업자등록 + PG 정식 계약 필요 (MVP-2 시점) | 비즈니스 요건 |
| 환경 | Supabase Free 티어 한도: DB 500MB, MAU 50K | 섹션 1 기술 스택 |
| 비용 | 킥오프 1회당 Claude API 비용 ~$0.4~0.7 (프롬프트 재사용 + Python 하이브리드 최적화 적용 시) | 섹션 1 제약사항 + 비용 최적화 설계 |
| 인프라 | 프로덕션 배포 인프라 필요: 커스텀 도메인 + SSL, 호스팅 (Netlify/Railway), 모니터링 (Sentry 등) | 비즈니스 요건 |

---

### Revision History

| 날짜 | 섹션 | 변경 내용 | 스킬 |
|---|---|---|---|
| 2026-05-18 | 섹션 9 | 요구사항 정의 최초 작성 (FR 19개, NFR 17개) | design-requirements |
| 2026-05-18 | 섹션 10 | 시스템 아키텍처 상세 최초 작성 (컴포넌트 9개, ADR 5개) | design-architecture |
| 2026-05-18 | 섹션 11 | 데이터 모델 최초 작성 (엔티티 6개, 관계 6개, 정합성 규칙 8개) | design-data-model |
| 2026-05-18 | 섹션 5, 4, 8, 9-4, 10-4 | 누락/모순 점검 — 4건 발견 및 해결 (배치 작업, 프로그레스바, 호스팅 표기, API Rate Limit) | kickoff-gap |
| 2026-05-18 | 섹션 6 | 개발 착수 체크리스트 생성 (19개 항목 + 프로젝트 구조 + 환경 설정) | kickoff-checklist |
| 2026-05-18 | 섹션 1,2,6,9,10 | 프롬프트 재사용 + Python 하이브리드 아키텍처 반영 — 스킬 .md 프롬프트 직접 사용, prompt_manager.py 토큰 최적화 4종, ADR-006, FR-020/021, 프로젝트 구조 skills/ 추가, sync_harness.py, 비용 $0.4~0.7/회 | 수동 |
| 2026-05-18 | 섹션 4,5,6,7,8 | 2차 gap 점검 — MVP-1 기능 수 10개 통일, MVP-2 5개 정정, 프롬프트 최적화 실패 시나리오 추가, 비용 최적화 완료 조건 추가 (8건 누적) | kickoff-gap (재실행) |

---

## 10. 시스템 아키텍처 상세

### 10-1. 시스템 구조 (System Structure)

**아키텍처 패턴**: SPA + REST API

```
┌─────────────────────────────────────────────────┐
│                  클라이언트 (브라우저)               │
│  ┌───────────┐ ┌──────────┐ ┌────────────────┐  │
│  │ 채팅 UI   │ │ 결과 뷰어 │ │ Admin 대시보드  │  │
│  └─────┬─────┘ └────┬─────┘ └───────┬────────┘  │
│        │  React (Vite) + TailwindCSS + i18n      │
│        │     + Mermaid.js (SVG 렌더링)            │
│  [Netlify]                                       │
└────────┼─────────────┼──────────────┼────────────┘
         │ REST API     │              │
         ▼             ▼              ▼
┌─────────────────────────────────────────────────┐
│              FastAPI 백엔드 [Railway]             │
│  ┌───────────┐ ┌──────────┐ ┌────────────────┐  │
│  │인터뷰 오케 │ │문서 생성  │ │ Auth/Admin    │  │
│  │스트레이터  │ │엔진      │ │ 미들웨어       │  │
│  └─────┬─────┘ └────┬─────┘ └───────┬────────┘  │
│        │             │               │            │
│  ┌─────▼─────┐ ┌────▼─────┐         │            │
│  │프롬프트    │ │하네스     │         │            │
│  │매니저     │ │파일 로더  │         │            │
│  │(STEP분할  │ │(스킬.md  │         │            │
│  │ +CLI제거  │ │+Reference)│         │            │
│  │ +필터링   │ │          │         │            │
│  │ +압축)    │ │          │         │            │
│  └─────┬─────┘ └──────────┘         │            │
└────────┼────────────────────────────┼────────────┘
         │                            │
    ┌────▼────┐              ┌───────▼────────┐
    │Claude   │              │   Supabase     │
    │  API    │              │ ┌────────────┐ │
    │(Anthropic)│            │ │ PostgreSQL │ │
    └─────────┘              │ │ + RLS      │ │
                             │ ├────────────┤ │
                             │ │  OAuth     │ │
                             │ │(Google/    │ │
                             │ │ GitHub)    │ │
                             │ └────────────┘ │
                             └────────────────┘
```

**컴포넌트 테이블**

| 컴포넌트 | 역할 | 기술 | 입력 | 출력 |
|---|---|---|---|---|
| 채팅 UI | 인터뷰 질문/답변 진행 | React + TailwindCSS | 사용자 텍스트 입력 | 채팅 메시지 렌더링 |
| 결과 뷰어 | 킥오프 문서 카드 UI 표시 | React + Mermaid.js | Markdown + Mermaid 코드 | 카드 UI + SVG 다이어그램 |
| Admin 대시보드 | 사용자/공지 관리 | React | 관리 데이터 | 관리 화면 |
| 인터뷰 오케스트레이터 | 스킬 순서 제어, 세션 관리 | FastAPI | 사용자 답변 + 세션 상태 | 다음 질문 + 세션 저장 |
| 프롬프트 매니저 | 스킬 .md + Reference → 최적화된 프롬프트 조합 (STEP 분할, CLI 제거, 유형 필터링, 대화 압축, Prompt Caching) | Python (~60줄) | 스킬 .md + Reference + 세션 상태 | Claude API 요청 페이로드 (캐시 블록 포함) |
| 문서 생성 엔진 | 인터뷰 결과 → Markdown 킥오프 문서 | Python | 인터뷰 답변 전체 | Markdown 문서 + Mermaid 코드 |
| 하네스 파일 로더 | 하네스 스킬 .md + Reference 파일 읽기 | Python (파일시스템) | 빌드 시 복사된 파일 | 프롬프트 삽입용 텍스트 |
| Auth 미들웨어 | JWT 검증, 역할 기반 접근 제어 | FastAPI + Supabase Auth | JWT 토큰 | 인증된 사용자 컨텍스트 |
| 파일 내보내기 | Markdown/PDF 생성 + 스트리밍 다운로드 | Python (WeasyPrint) | 킥오프 문서 데이터 | 파일 스트림 |

**통신 매트릭스**

| 소스 | 대상 | 방식 | 프로토콜 | 비고 |
|---|---|---|---|---|
| React SPA | FastAPI | REST API | HTTPS (JSON) | 모든 데이터 요청 |
| FastAPI | Claude API | REST API | HTTPS (JSON) | 인터뷰 질문 생성 |
| FastAPI | Supabase DB | SQL | PostgreSQL (TCP) | CRUD + RLS |
| FastAPI | Supabase Auth | REST API | HTTPS | JWT 검증 |
| React SPA | Supabase Auth | REST API | HTTPS | OAuth 로그인 플로우 |
| React SPA | Mermaid.js | 라이브러리 호출 | 로컬 (브라우저) | SVG 렌더링 |
| FastAPI | Toss Payments | REST API | HTTPS | 결제 처리 (MVP-2) |

### 10-2. 기술 선택 근거 (Tech Selection Rationale)

| 레이어 | 선택 기술 | 비교 대안 | 선택 이유 |
|---|---|---|---|
| 프론트엔드 | React (Vite) | Next.js, Vue | SSR/SEO 불필요 (SPA), FastAPI와 역할 분리 명확, Vite로 빠른 HMR |
| CSS | TailwindCSS | styled-components, CSS Modules | 유틸리티 우선 빠른 프로토타이핑, 번들 크기 작음 |
| 다국어 | react-i18next | react-intl, 자체 구현 | JSON 키 분리 간편, 런타임 전환 지원, 커뮤니티 최대 |
| 다이어그램 | Mermaid.js | D3.js, draw.io embed | 무료 오픈소스, 텍스트 → SVG 자동 변환, 서버 불필요 |
| 백엔드 | FastAPI | Express (Node), Django | Claude SDK Python 우선 지원, Pydantic 타입 검증, 자동 OpenAPI 문서 |
| DB + Auth | Supabase | Firebase, Auth0 + 별도 DB | Auth + PostgreSQL + RLS 올인원, Free 티어 충분 (500MB, 50K MAU) |
| AI API | Claude API + Prompt Caching | GPT-4, Gemini | 하네스 스킬 .md를 프롬프트로 직접 재사용 가능, Prompt Caching으로 반복 프롬프트 90% 할인, Python SDK 성숙 |
| 결제 (MVP-2) | Toss Payments | Stripe, PortOne | 국내 결제 최적화, 수수료 낮음, 추후 PortOne으로 Stripe/PayPal 확장 |
| 프론트 호스팅 | Netlify | Vercel, AWS S3+CF | React SPA에 동등 성능, Git 자동 배포, 무료 SSL + 커스텀 도메인 |
| 백엔드 호스팅 | Railway | Render, AWS EC2 | Cold start 없음, $5/월 시작, Git 자동 배포, FastAPI 네이티브 지원 |
| PDF 생성 | WeasyPrint | reportlab, Puppeteer | HTML/CSS → PDF 변환, Markdown 스타일링 유지, Python 네이티브 |

### 10-3. 배포 구성 (Deployment)

> 외부 사용자 대상 + 비즈니스 목적 → 배포 구성 활성

| 환경 | 프론트엔드 | 백엔드 | DB | 비고 |
|---|---|---|---|---|
| 개발 (dev) | Vite dev server (localhost:5173) | uvicorn (localhost:8000) | Supabase Cloud (Free) | 로컬 개발 |
| 프로덕션 (prod) | Netlify (main 브랜치 자동 배포) | Railway (main 브랜치 자동 배포) | Supabase Cloud (Free → 유료 전환 시 Pro) | Git push → 자동 배포 |

**CI/CD**: Git 자동 배포 (Netlify + Railway 내장). 테스트/린트 파이프라인은 코드 품질 관리 필요 시 GitHub Actions 추가.

**환경 변수 관리**

| 변수 | 용도 | 관리 위치 |
|---|---|---|
| `ANTHROPIC_API_KEY` | Claude API 인증 | Railway 환경 변수 |
| `SUPABASE_URL` | DB 접속 | Railway + Netlify 환경 변수 |
| `SUPABASE_ANON_KEY` | 클라이언트 인증 | Netlify 환경 변수 |
| `SUPABASE_SERVICE_KEY` | 서버 관리자 접근 | Railway 환경 변수 (비공개) |
| `TOSS_CLIENT_KEY` | 결제 클라이언트 (MVP-2) | Netlify 환경 변수 |
| `TOSS_SECRET_KEY` | 결제 서버 (MVP-2) | Railway 환경 변수 (비공개) |

### 10-4. 횡단 관심사 (Cross-cutting Concerns)

| 관심사 | 접근법 | NFR 연계 |
|---|---|---|
| 로깅 | 구조화된 JSON 로깅 (Python `structlog`), 요청 ID + 사용자 ID 포함 | NFR-014 |
| 에러 처리 | FastAPI `@app.exception_handler` + React Error Boundary, Claude API 타임아웃 시 재시도 (최대 2회) | 섹션 4 시나리오#1 |
| 설정 관리 | `.env` 파일 (로컬) + 호스팅 환경 변수 (프로덕션), Pydantic `BaseSettings` | — |
| 테스트 전략 | 백엔드: pytest (핵심 로직 60%+), 프론트: Vitest + React Testing Library (주요 흐름) | NFR-013 |
| Rate Limiting | FastAPI `slowapi` 미들웨어 — 인증 5회/분, 인터뷰 20회/분, 일반 60회/분 | NFR-008 |
| 인증/인가 | Supabase Auth (OAuth) + JWT 미들웨어 + RLS (행 단위 격리) | NFR-005, NFR-009 |
| CORS | FastAPI `CORSMiddleware` — Netlify 도메인만 허용 | NFR-007 |
| i18n | react-i18next (프론트), Claude API 프롬프트에 언어 파라미터 전달 (백엔드) | FR-009 |
| 배치 작업 | Supabase `pg_cron` 확장 — 매일 1회 소프트 삭제 정리 + 5년 보관 만료 삭제 실행 | IR-008, 섹션 11-4 |
| API 비용 최적화 | prompt_manager.py 4개 함수: ①STEP 분할 로딩, ②CLI 섹션 제거, ③Reference 유형 필터링, ④대화 이력 압축 + Anthropic Prompt Caching (cache_control: ephemeral). 최악 시 fallback은 원본 전체 전송 | FR-020, NFR-003 |

### 10-5. 아키텍처 결정 기록 (ADR)

#### ADR-001: SPA + REST API 패턴 선택

**상태**: 채택
**맥락**: 웹앱 유형에서 SSR(Next.js), SPA+API, BFF 패턴 중 선택 필요
**결정**: React (Vite) SPA + FastAPI REST API 분리 구조
**근거**: SSR/SEO 불필요 (로그인 후 사용하는 도구), FastAPI가 Claude SDK와 프롬프트 관리를 담당하므로 백엔드 분리가 자연스러움, Vite의 빠른 개발 경험
**결과**: 프론트/백 독립 배포 가능, API 스펙 기반 병렬 개발 가능, CORS 설정 필요

#### ADR-002: Supabase 올인원 (Auth + DB + RLS)

**상태**: 채택
**맥락**: 인증(Auth0/Firebase Auth), DB(자체 PostgreSQL/PlanetScale), 접근제어를 각각 선택하거나 통합 플랫폼 사용
**결정**: Supabase (PostgreSQL + OAuth + RLS) 단일 플랫폼
**근거**: Auth + DB + 행 단위 보안을 하나의 서비스로 관리, Free 티어(500MB DB, 50K MAU)가 MVP에 충분, PostgreSQL 표준 SQL 사용으로 마이그레이션 용이
**결과**: 벤더 의존성 발생하나, PostgreSQL 표준이므로 이전 비용 낮음

#### ADR-003: 이벤트 기반 세션 저장

**상태**: 채택
**맥락**: 인터뷰 일시정지/재개를 위한 세션 저장 방식 — 주기적(30초마다) vs 이벤트 기반
**결정**: 이벤트 기반 저장 (답변 전송/일시정지/브라우저 이탈/5분 비활성 시)
**근거**: 채팅 UI에서 데이터 변경 시점이 명확(답변 전송), 불필요한 API 호출 감소, 유실 위험 최소화
**결과**: `beforeunload` 이벤트의 브라우저별 동작 차이 검증 필요

#### ADR-004: 프로젝트별 언어 고정

**상태**: 채택
**맥락**: 인터뷰 중 언어 전환 시 기존 대화/문서를 번역할지, 새 프로젝트로 분리할지
**결정**: 언어는 프로젝트 생성 시 고정, 다른 언어 필요 시 새 프로젝트 생성
**근거**: 인터뷰 중간 번역은 Claude API 비용 추가 + 품질 저하 위험, 프로젝트 단위 분리가 데이터 관리에 깔끔
**결과**: 사용자가 같은 프로젝트를 다른 언어로 하려면 처음부터 다시 진행해야 함

#### ADR-005: MVP-1 읽기 전용 결과 뷰어

**상태**: 채택
**맥락**: 결과 뷰어에서 인라인 편집 제공 여부
**결정**: MVP-1은 읽기 전용 + Markdown/PDF 다운로드, MVP-2에서 인라인 편집 추가
**근거**: 핵심 가치는 인터뷰→문서 자동 생성 파이프라인, Markdown 에디터 개발 공수가 크므로 MVP-1 범위 제한
**결과**: 사용자는 다운로드 후 외부 에디터에서 수정 (MVP-1 워크어라운드)

#### ADR-006: 프롬프트 재사용 + 최소 Python 하이브리드

**상태**: 채택
**맥락**: 하네스 기능을 웹으로 옮기는 방식 — ①Python으로 스킬 로직 전체 재구현, ②스킬 .md를 프롬프트로 직접 사용, ③하이브리드 (프롬프트 재사용 + Python 최적화 레이어)
**결정**: ③ 하이브리드 — 스킬 .md + Reference를 Claude API 프롬프트로 직접 사용하되, prompt_manager.py(~60줄)가 4가지 토큰 최적화를 수행
**근거**: Python 재구현은 개발 3~5주 + 하네스 업데이트 시 수동 동기화 필요. 프롬프트 재사용은 개발 1~2주 + 자동 동기화이나 토큰 비용 증가. 하이브리드는 prompt_manager.py 하나로 토큰을 40~50% 절감하여 재구현과 $0.1 차이까지 좁히면서 자동 동기화를 유지
**결과**: 하네스 스킬 수정 → sync_harness.py 실행 → 웹 자동 반영. 토큰 비용 $0.4~0.7/회. MVP-2에서 모델 라우팅 추가 시 $0.3~0.5/회까지 절감 가능

---

## 11. 데이터 모델

> 섹션 3의 6개 테이블을 PostgreSQL 타입으로 구체화하고, 섹션 9 FR에서 도출된 필드를 추가한다.

### 11-1. 엔티티 정의 (Entity Definition)

#### users (사용자)

| 필드 | 타입 | 제약 | 설명 |
|---|---|---|---|
| id | UUID | PK, DEFAULT gen_random_uuid() | Supabase Auth 연동 |
| email | VARCHAR(255) | NOT NULL, UNIQUE | 로그인 식별 |
| display_name | VARCHAR(100) | | OAuth 프로필명 |
| avatar_url | TEXT | | OAuth 프로필 이미지 |
| role | VARCHAR(10) | NOT NULL, DEFAULT 'user', CHECK IN ('user','admin') | 권한 분리 |
| free_used | INTEGER | NOT NULL, DEFAULT 0, CHECK (free_used >= 0 AND free_used <= 2) | 무료 사용 횟수 |
| plan | VARCHAR(10) | NOT NULL, DEFAULT 'free', CHECK IN ('free','basic','pro') | 과금 플랜 |
| plan_expires_at | TIMESTAMPTZ | | 구독 만료일 |
| agreed_terms_at | TIMESTAMPTZ | | 이용약관 동의 시각 (FR-018) |
| suspended_at | TIMESTAMPTZ | | 계정 정지 시각 (FR-007) |
| deleted_at | TIMESTAMPTZ | | 소프트 삭제 시각 (FR-019) |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | 가입일 |
| updated_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | 최종 수정일 |

**인덱스**: `idx_users_email` (UNIQUE), `idx_users_active` (deleted_at IS NULL 부분 인덱스)

#### projects (킥오프 프로젝트)

| 필드 | 타입 | 제약 | 설명 |
|---|---|---|---|
| id | UUID | PK, DEFAULT gen_random_uuid() | |
| user_id | UUID | FK → users(id), NOT NULL | 소유자 |
| name | VARCHAR(200) | NOT NULL | 프로젝트명 |
| project_type | VARCHAR(50) | NOT NULL | 유형 (Web App, AI 등) |
| language | VARCHAR(2) | NOT NULL, CHECK IN ('ko','en') | 산출물 언어 (생성 시 고정) |
| status | VARCHAR(20) | NOT NULL, DEFAULT 'in_progress', CHECK IN ('in_progress','completed') | 진행 상태 |
| kickoff_doc | TEXT | | 킥오프 문서 (Markdown) |
| mermaid_code | TEXT | | 아키텍처 다이어그램 코드 |
| deleted_at | TIMESTAMPTZ | | 소프트 삭제 시각 |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | |
| updated_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | |

**인덱스**: `idx_projects_user` (user_id), `idx_projects_user_active` (user_id WHERE deleted_at IS NULL)

#### interview_sessions (인터뷰 세션)

| 필드 | 타입 | 제약 | 설명 |
|---|---|---|---|
| id | UUID | PK, DEFAULT gen_random_uuid() | |
| project_id | UUID | FK → projects(id), NOT NULL | |
| step | VARCHAR(20) | NOT NULL, CHECK IN ('planning','design') | 기획/설계 구분 |
| status | VARCHAR(20) | NOT NULL, DEFAULT 'active', CHECK IN ('active','paused','completed') | 세션 상태 |
| current_question | INTEGER | NOT NULL, DEFAULT 0 | 현재 질문 번호 (재개 시 사용) |
| messages | JSONB | NOT NULL, DEFAULT '[]'::jsonb | 채팅 기록 [{role, content, timestamp}], 최대 5MB |
| token_used | INTEGER | NOT NULL, DEFAULT 0 | 세션 누적 토큰 |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | |
| paused_at | TIMESTAMPTZ | | 마지막 일시정지 시각 |
| completed_at | TIMESTAMPTZ | | 완료 시각 |

**인덱스**: `idx_sessions_project` (project_id), `idx_sessions_status` (project_id, status)

#### payments (결제 이력 — MVP-2)

| 필드 | 타입 | 제약 | 설명 |
|---|---|---|---|
| id | UUID | PK, DEFAULT gen_random_uuid() | |
| user_id | UUID | FK → users(id), NOT NULL | |
| amount | INTEGER | NOT NULL | 결제 금액 (원) |
| method | VARCHAR(50) | | 결제 수단 |
| toss_payment_key | VARCHAR(200) | | Toss 결제 키 (환불/조회) |
| status | VARCHAR(20) | NOT NULL, CHECK IN ('success','failed','refunded') | 결제 상태 |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | |

**인덱스**: `idx_payments_user` (user_id), `idx_payments_toss_key` (toss_payment_key)

#### token_usage (토큰 사용 로그)

| 필드 | 타입 | 제약 | 설명 |
|---|---|---|---|
| id | UUID | PK, DEFAULT gen_random_uuid() | |
| user_id | UUID | FK → users(id), NOT NULL | |
| project_id | UUID | FK → projects(id), NOT NULL | |
| session_id | UUID | FK → interview_sessions(id) | 세션 단위 추적 |
| input_tokens | INTEGER | NOT NULL, DEFAULT 0 | 입력 토큰 |
| output_tokens | INTEGER | NOT NULL, DEFAULT 0 | 출력 토큰 |
| cost_usd | DECIMAL(10,4) | NOT NULL, DEFAULT 0 | 비용 (달러) |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | |

**인덱스**: `idx_token_user` (user_id), `idx_token_project` (project_id), `idx_token_created` (created_at)

#### announcements (공지/패치내역)

| 필드 | 타입 | 제약 | 설명 |
|---|---|---|---|
| id | UUID | PK, DEFAULT gen_random_uuid() | |
| type | VARCHAR(10) | NOT NULL, CHECK IN ('notice','patch') | 공지 vs 패치내역 |
| title | VARCHAR(300) | NOT NULL | 제목 |
| content | TEXT | NOT NULL | 내용 (Markdown) |
| version | VARCHAR(20) | | 버전번호 (패치내역용) |
| pinned | BOOLEAN | NOT NULL, DEFAULT FALSE | 상단 고정 여부 |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | |

**인덱스**: `idx_announce_type_date` (type, created_at DESC), `idx_announce_pinned` (pinned WHERE pinned = TRUE)

### 11-2. 관계 (Relationships)

| 소스 | 대상 | 관계 | FK | ON DELETE | 설명 |
|---|---|---|---|---|---|
| users | projects | 1:N | projects.user_id | CASCADE | 사용자 삭제 시 프로젝트도 삭제 |
| users | payments | 1:N | payments.user_id | CASCADE | 결제 이력 |
| users | token_usage | 1:N | token_usage.user_id | CASCADE | 토큰 사용 이력 |
| projects | interview_sessions | 1:N | sessions.project_id | CASCADE | 프로젝트당 기획+설계 세션 |
| projects | token_usage | 1:N | token_usage.project_id | CASCADE | 프로젝트별 비용 추적 |
| interview_sessions | token_usage | 1:N | token_usage.session_id | SET NULL | 세션 삭제 시 로그는 유지 |

### 11-3. 정합성 규칙 (Integrity Rules)

| ID | 규칙 | 대상 | 검증 시점 |
|---|---|---|---|
| IR-001 | free 플랜 사용자의 free_used는 2 이하 | users.free_used | 프로젝트 생성 시 (API) |
| IR-002 | 유료 플랜은 plan_expires_at이 미래 날짜여야 활성 | users.plan_expires_at | 인터뷰 시작 시 (API) |
| IR-003 | 프로젝트 language는 생성 후 변경 불가 | projects.language | UPDATE 시 (API + DB 트리거) |
| IR-004 | messages JSONB 크기 5MB 이하 | interview_sessions.messages | 답변 저장 시 (API) |
| IR-005 | deleted_at이 설정된 사용자는 로그인 차단 | users.deleted_at | 로그인 시 (Auth 미들웨어) |
| IR-006 | suspended_at이 설정된 사용자는 새 프로젝트 생성 차단 | users.suspended_at | 프로젝트 생성 시 (API) |
| IR-007 | RLS: 사용자는 자기 user_id의 데이터만 접근 | 전체 테이블 | 모든 쿼리 (Supabase RLS) |
| IR-008 | 소프트 삭제 데이터는 30일 후 하드 삭제 | users, projects | 배치 작업 (일 1회) |

### 11-4. 데이터 생명주기 (Data Lifecycle)

| 데이터 | 생성 시점 | 갱신 주기 | 보관 기간 | 삭제 정책 |
|---|---|---|---|---|
| users | 회원가입 (OAuth) | 프로필/플랜 변경 시 | 탈퇴 요청 후 30일 | 소프트 삭제 → 30일 후 CASCADE 하드 삭제 |
| projects | "새 프로젝트" 클릭 | 인터뷰 진행/문서 생성 시 | 생성 후 5년 | 사용자 삭제 시 CASCADE / 개별 삭제 가능 |
| interview_sessions | 인터뷰 시작 | 답변 전송/일시정지/완료 시 | 프로젝트와 동일 (5년) | 프로젝트 CASCADE |
| payments | 결제 완료 (MVP-2) | 불변 (환불 시 status만 변경) | 5년 (법적 보관) | 보관 기간 후 하드 삭제 |
| token_usage | API 호출 시 | 불변 (append-only) | 5년 | 보관 기간 후 하드 삭제 |
| announcements | Admin 작성 | Admin 수정 시 | 무기한 | Admin 수동 삭제 |

**소프트 삭제 정리 배치**: 매일 1회 실행, `deleted_at < NOW() - INTERVAL '30 days'`인 행을 CASCADE 하드 삭제

### 11-5. 마이그레이션/진화 전략

> 외부 사용자 대상 + 비즈니스 목적 → 마이그레이션 전략 활성

| 항목 | 내용 |
|---|---|
| 마이그레이션 도구 | Alembic (SQLAlchemy 기반, FastAPI 생태계 표준) |
| 버전 관리 | Git 저장소에 마이그레이션 파일 포함, 순차 번호 + 타임스탬프 |
| 적용 방식 | 배포 시 `alembic upgrade head` 자동 실행 (Railway 빌드 스크립트) |
| 롤백 | `alembic downgrade -1` (직전 버전), 프로덕션 적용 전 dev에서 검증 |
| 초기 스키마 | Supabase SQL Editor 또는 Alembic init 마이그레이션으로 생성 |
