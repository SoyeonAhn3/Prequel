# Backlog

프로젝트 진행 중 발견한 개선/수정 항목을 기록한다. (생성: 2026-06-15)

> **범위 결정 — 수익화 제외 (2026-08-11)**
> 결제·비용 미터·모델 티어링을 개발 범위에서 제외한다. 결제 연동 자체는 난이도가 낮은 반면, 실제로 켜려면 사업자등록·통신판매업 신고 등 **개발과 무관한 선행 요건**이 필요해 개인 프로젝트에서 실효성이 없다고 판단했다.
> 대신 이미 구현·검증을 마친 **단계별 원자 크레딧 과금**([[BL-022]]·[[BL-023]])을 "수익화를 고려해 설계한 계측 레이어"로 남긴다 — 행 잠금 RPC, 멱등 차감 도장, `service_role` 전용 권한, 실제 Supabase 동시성 4/4 + 실제 JWT 브라우저 3/3 검증.
> **영향**: [[BL-020]] 폐기(모델 상수 정리만 잔존) · [[BL-005]] (c) 폐기 · README 요금제 표를 "설계만 하고 의도적 미구현"으로 재작성 · MVP-2 로드맵의 결제/비용 미터/모델 라우팅 항목 제거.

> **범위 결정 — 다국어(i18n) 제외 (2026-08-11)**
> Phase 9 산출물 `#1`(UI i18n)·`#2`(프롬프트 언어 파라미터)를 제외하고 **FR-009를 철회**한다. 두 산출물이 독립적이지 않은 게 결정적이었다 — 모든 AI 응답을 만드는 `backend/skills/` 프롬프트 18개가 한국어로 작성돼 있어, UI만 영어로 바꾸면 영어 화면에서 한국어 질문·한국어 문서가 나온다. 진짜 영어 지원 = 프롬프트 자산 현지화이고, 일부만 번역된 상태는 기능이 아니라 결함으로 보인다. 대상 사용자가 한국어권이라 공수 대비 가치가 없다.
> **영향**: Phase 9 `#1`·`#2` ❌ · 완료 기준 2건 철회 · README 기술스택의 `react-i18next` 행과 MVP-1 "다국어 UI" 제거 · 한계점을 "언어 고정"에서 **"한국어 전용"**으로 교체 · `frontend/src/i18n/` 구조 표기 삭제(실제로 존재한 적 없음).

---

## BL-001 · 설계 단계가 "미확정 AI 모델"을 임의로 확정함 ✅

**상태**: ✅ 완료 (2026-07-01). 코드·프롬프트 수정 완료(2026-06-15), 신규 생성부터 정상 적용. 기존 오염 데이터 1회성 보정은 **하지 않기로 결정** → 종료.
**발견일**: 2026-06-15
**관련 영역**: `backend/app/api/design.py`, `backend/skills/design-architecture.md`, `backend/skills/design-ai-workflow.md`
**대표 사례**: "등기부등본 AI 해석기" 프로젝트 → AI 흐름에 `모델 · OpenAI GPT-4 / gpt-4o`로 표기됨

### 문제
사용자는 모델을 확정하지 않았는데(인터뷰에서 "GPT-4 *같은* LLM, 어떤 걸 쓸지는 나중에 정할게" → 인사이트에 "구체적 선택은 추후 결정"으로 저장됨), 설계 파이프라인이 이를 무시하고 OpenAI GPT-4 / gpt-4o로 확정해 문서에 표기함. Prequel 자체는 Claude 기반인데도 OpenAI로 박힘.

### 근본 원인 (인과 사슬)
```
① 인터뷰 ✅  →  ② 아키텍처 ❌  →  ③ AI 흐름 ❌(잠금)
```
1. **인터뷰**: "추후 결정"이 인사이트에 정확히 저장됨. 이 인사이트는 `get_interview_context`(`_shared.py:61`)로 설계 LLM 호출에 그대로 전달됨.
2. **아키텍처**(`design-architecture.md` 규칙 #3 "각 구성요소에 구체적 기술스택 명시", #8 "AI 컴포넌트 필수"): 모든 컴포넌트에 구체 기술을 강제 → LLM이 AI 엔진 `technology`에 "OpenAI GPT-4 API"를 채움(사용자 예시를 결정으로 간주).
3. **AI 흐름**(`design.py:610-627`의 `arch_ai_model` 추출 + "확정된 AI 모델 (변경 금지)" 제약, `design-ai-workflow.md` 규칙 #1): 아키텍처에서 모델을 추출해 "변경 금지"로 잠금 → 우연히 박힌 GPT-4가 확정으로 굳어짐.

**결론**: 설계 파이프라인 전체에 "모델 미정" 개념이 없음. "추후 결정" 신호가 LLM에 도달해도 스킬에 "미정이면 확정하지 말라"는 규칙이 없어 무시됨.

### 적용한 수정 (방식 b: 프롬프트 + 코드 키워드 감지) ✅
1. `design.py` — `_model_undecided(context)`(모델/벤더 토큰 + 보류 토큰이 같은 줄에 있으면 미확정으로 판단) + `_looks_undecided(model)` 헬퍼 추가.
   - `generate_architecture`: 미확정이면 user_message에 "AI 모델 미확정 (중요)" 지시 주입.
   - `generate_ai_workflow`: `undecided = _model_undecided(context) or _looks_undecided(arch_ai_model)`. 미확정이면 "변경 금지" 잠금 대신 "미확정" 지시 주입, `model="추후 결정"`·`model_version=""` 강제. 확정된 경우에만 기존 "변경 금지" 유지.
2. `backend/skills/design-architecture.md` — 규칙 #9 추가(미확정이면 AI 컴포넌트 technology를 `"LLM API (모델 추후 결정)"`로, 예시 모델명을 결정으로 간주 금지).
3. `backend/skills/design-ai-workflow.md` — 규칙 #1을 "모델 미확정 (최우선)"으로 교체(미확정이면 `model="추후 결정"`), 규칙 재번호.

⚠️ **`sync_harness.py` 실행 금지** — `.claude/skills/*/SKILL.md`는 런타임용 API 프롬프트와 **완전히 다른 옛 CLI 워크플로우 버전**이라, 동기화하면 런타임 프롬프트를 덮어써 망가뜨림. 런타임 파일(`backend/skills/*.md`)만 직접 수정함. (→ BL-002 참고)

### 미결정 사항 → ✅ 종결 (2026-07-01)
- 기존 "등기부등본 AI 해석기" 프로젝트 데이터(`design_sessions.ai_workflow.model = "OpenAI GPT-4"`, 아키텍처 AI 컴포넌트 technology)의 1회성 보정은 **하지 않기로 결정**. 근본 수정이 신규 생성부터 적용되므로, 기존 오염 건은 사용자가 해당 프로젝트 설계를 재생성하면 자연 교정됨. 별도 마이그레이션/수동 보정 없이 BL-001 종료.

---

## BL-002 · `.claude/skills`와 `backend/skills` 불일치 (sync_harness 무용/위험) ✅

**상태**: ✅ 완료 (2026-07-01, 방향 A) — `sync_harness.py` 무력화 + 문서 정정.
**관련 영역**: `scripts/sync_harness.py`, `.claude/skills/*`, `backend/skills/*`, README

### 문제
README·설계상 `sync_harness.py`가 `.claude/skills` → `backend/skills`를 동기화하는 것으로 되어 있으나, 실제 두 곳의 내용이 **완전히 다름**:
- `.claude/skills/design-architecture/SKILL.md` = 옛 CLI 하네스 워크플로우(v2.0, 파일 기반 `_kickoff.md` 섹션 편집).
- `backend/skills/design-architecture.md` = API용 JSON 출력 프롬프트(런타임 `load_skill`이 사용).

즉 런타임 프롬프트는 `.claude/skills`에서 생성된 게 아니라 별도 수기 관리되어 디버전됨. `sync_harness.py`를 돌리면 런타임 프롬프트가 옛 CLI 버전으로 덮여 **AI 인터뷰/설계가 깨짐**.

### 해결 방향(택1)
- (A) `backend/skills`를 단일 진실 공급원으로 확정하고 `sync_harness.py` 및 README의 동기화 서술 제거/수정. ← **채택**
- (B) `.claude/skills`의 API용 변형을 별도 디렉터리로 정리하고 sync 대상을 그쪽으로 한정.

### 적용한 수정 (2026-07-01, 방향 A)
- **`scripts/sync_harness.py`를 실행 거부 스텁으로 교체.** 이제 실행하면 경고 출력 후 `exit(1)` — backend/skills 삭제·덮어쓰기 불가. (삭제 대신 스텁으로 남겨 폐기 사유 기록 + 재생성 방지.)
- **코드 전수 점검으로 확인된 실제 피해**: sync는 `backend/skills/*` 전체를 `unlink` 후 `.claude` 버전으로 복사. 특히 `backend/skills/kickoff-document.md`는 `.claude`에 대응 폴더가 없어 **삭제만 되고 복구 안 됨** → `doc_engine.load_skill("kickoff-document")` 즉사. (인터뷰·설계·마무리 프롬프트도 옛 CLI 버전으로 덮여 깨짐.)
- **원본 검증**: `backend/skills` 18개 + `backend/references` 7개 모두 git 추적 중(gitignore 무관) → 단일 원본으로 안전.
- **문서 정정**: README(영/한)의 프로젝트 구조 주석(`backend/skills`·`references`·`sync_harness.py`)과 한계점의 "하네스 동기화" 항목을 "backend/skills가 단일 원본·직접 수정 / `.claude/skills`는 별도 개발용 하네스"로 수정.
- **결정 확정**: 런타임은 `backend/skills/`의 스킬만 사용. `.claude/skills/`(개발용 하네스)는 런타임과 무관하며 손대지 않음.

---

## BL-003 · 프롬프트 캐싱이 작동 안 함 (인터뷰 토큰 과소비) ✅

**상태**: ✅ **완료 (2026-07-21)** — 방향 B 런타임 연동 후 실제 `claude-sonnet-4-6` A/B 6회 호출에서 워밍 후 캐시 읽기 비율 **83.10%**, 변경 전 대비 풀가격 입력 토큰 **88.47% 감소**, `cache_read 3,166 > cache_creation 1,734`를 확인했다.

### 적용한 수정 (2026-07-01, 방향 A · 시스템 프롬프트 재구조화)
`build_system_prompt`(`prompt_manager.py`)를 캐시 friendly 구조로 재배치. 시그니처·반환 타입(list[dict]) 불변이라 호출부(`interview.py` 2곳) 영향 없음.
- **캐시 블록 1** (`cache_control`) = 인터뷰 내내 불변인 것만: 역할 + 규칙 + project_name/type + 응답형식 JSON 스펙.
- **캐시 블록 2** (`cache_control`, 2번째 breakpoint) = `step_content`(현재 단계 스킬 섹션). 기존엔 유일 breakpoint *뒤*라 아예 캐시 안 됐음(원인 ②) → 이제 한 step 내 모든 턴에서 read 적중.
- **블록 3** (캐시 X) = 누적 `insights`를 breakpoint *뒤* 별도 블록으로 분리. 매 답변마다 커지지만 앞의 안정 prefix를 더 이상 무효화하지 않음(원인 ① 해소).
- 로컬 구조 검증: 같은 step 두 턴에서 블록0·블록1 바이트 동일, 블록2(insights)만 변화, breakpoint 2개 확인.
- 당시 미적용이던 원인 ③ 메시지 캐싱은 2026-07-21 방향 B 1·2단계에서 구현했다. 원인 ⑤ 출력 형식 축소는 캐시 효과 측정 후 판단한다.

### 적용 범위 & 후속 단계 현황 (2026-07-01 코드 전수 점검)
`cache_control` 관점에서 백엔드 전체를 grep 점검한 결과:
- **인터뷰 + AI 제안** (`interview.py` → `build_system_prompt`): 유일하게 캐싱이 *깨져* 있던 곳 + **멀티턴**(세션당 수십 호출)이라 이득 최대 → **이번에 수정(✅).**
- **설계 4종** (`design.py:235/474/578/712`) + **마무리** (`finalize.py:187`): 이미 `system=[skill_text + cache_control]` 구조로 캐싱 적용됨. 휘발 내용은 user_message에 둬서 구조 정상. 단 각 단계가 **원샷(1회 생성)**이라 cross-call 이득은 원래 작음 → 손댈 필요 낮음.
- **문서 생성** (`doc_engine.py:70-93`): 캐시 블록에 `생성일:{today}`(매일 무효화) + `skill_text`(문서 구조 가이드)가 breakpoint *뒤*라 미캐시 — 인터뷰 옛 버그와 같은 패턴. 단 원샷이라 영향 작음 → 선택적 개선(D).
- **결론**: 후속 단계는 "미적용"이 아니라 "이미 기본 캐싱 + 원샷이라 추가 이득 작음". 추가 개발 우선순위 낮음.

### Phase 1 측정 결과 (2026-07-01, 무료 `count_tokens` · 모델 claude-sonnet-4-6)
`build_system_prompt`의 캐시 대상 prefix(block1+block2) 토큰 실측:

| step | block1 | 캐시 prefix(block1+2) | 전체 system | 판정 |
|---|---|---|---|---|
| 0 | 729 | **1002** | 1067 | ❌ < 1024 |
| 3 | 729 | **868** | 933 | ❌ < 1024 |
| 9 | 729 | **914** | 979 | ❌ < 1024 |

- **핵심 발견**: 캐시 prefix가 **868~1002 토큰**으로 Sonnet 최소 캐시 크기 **1024 미달** → `cache_control`이 무시되어 **캐싱 자체가 안 걸림**. 방향 A(시스템 프롬프트 재구조화)는 구조적으로 정답(insights 무효화 버그 제거·회귀 없음)이나, **그것만으로는 절감 효과 없음**.
- **역설**: 옛 코드는 insights가 캐시 블록 안에 쌓여 크기를 1024 위로 채워 캐시가 *생성*은 됐으나 매 턴 무효화되어 못 읽음(낭비). 새 코드는 prefix가 고정 ~900토큰이라 아예 미생성 — 낭비되던 cache_write 프리미엄(25%)은 사라졌으나 목표 절감은 미달성.
- **무료 검증 이득**: Phase 2(유료 실호출) 전에 count_tokens(무과금)로 판정 → 헛돈 방지.

### 방향 B 1단계 구현 (2026-07-21 · 메시지 빌더/계약 테스트)
- `prompt_manager.build_cached_interview_messages()`를 추가했다. DB의 원본 메시지를 변경하지 않고 전체 대화 이력을 Claude text block 형식으로 변환한다.
- 최신 사용자 답변 블록에 메시지 cache breakpoint 1개를 배치하고, 매 턴 달라지는 누적 `insights`는 같은 메시지의 breakpoint 뒤 비캐시 블록으로 이동할 수 있게 구성했다.
- 입력이 최신 사용자 답변으로 끝나지 않거나 role/content 계약이 잘못된 경우 즉시 실패하도록 경계를 명시했다.
- `test_prompt_manager.py`에 breakpoint 위치·insights 순서·원본 불변·다음 턴 공통 prefix 보존·입력 계약 테스트를 추가했으며, 해당 파일 **11개 테스트가 통과**했다.
- 이 1단계 시점에는 런타임 미적용이었으며, 아래 2단계에서 실제 `/answer` 경로까지 연결했다.

### 방향 B 2단계 구현 (2026-07-21 · 인터뷰 런타임 연동)
- `build_system_prompt()`에서 `insights` 인자와 가변 system 블록을 제거했다. 시스템 프롬프트는 인터뷰 고정 규칙·프로젝트 메타·현재 step 지시만 포함한다.
- `POST /api/interview/answer`가 `compress_history()` 대신 `build_cached_interview_messages()`를 사용한다. DB에는 기존 문자열 메시지를 그대로 저장하고 Claude 요청만 text block으로 변환하므로 API·DB 스키마 변경은 없다.
- 6개 초과 이력도 요약문으로 다시 쓰지 않고 전체를 전달한다. 최신 사용자 답변까지를 캐시 prefix로 지정하고 누적 insights는 breakpoint 뒤에 둔다.
- API 계약 테스트에서 기존 8개 메시지 + 최신 답변 1개가 모두 유지되고, system에 실제 insight 데이터가 없으며, insights가 메시지 breakpoint 뒤에 있고, 전체 breakpoint가 **3개(허용 4개 이하)**임을 확인했다.
- **검증**: 관련 테스트 21개 통과, 전체 백엔드 테스트 **148개 통과·실제 Supabase opt-in 4개 안전 skip**.

### 방향 B 3단계 완료 (2026-07-21 · 실제 Anthropic A/B 검증)
- **로컬 전용 자동화**: 실제 A/B 측정 하네스는 `RUN_ANTHROPIC_INTEGRATION=1`에서만 비용을 쓰도록 만들었고, 사용자 요청에 따라 `.git/info/exclude`에 등록해 로컬에만 보관한다. GitHub에는 해당 유료 테스트 코드를 올리지 않는다.
- **비교 조건**: 0-based step 3(네 번째 단계인 데이터 소스), 동일한 9개 초기 메시지와 누적 insights를 사용했다. 후보와 변경 전 방식은 고유 프로젝트 이름으로 캐시를 격리하고 각각 3회씩 5분 TTL 안에 순차 호출했다.
- **사전 검사**: 후보 메시지 breakpoint까지의 prefix는 **1,539토큰**으로 Sonnet 최소 캐시 크기 1,024를 넘었다.

| 방식/호출 | input | cache creation | cache read | output |
|---|---:|---:|---:|---:|
| 방향 B 1회(워밍) | 117 | 1,536 | 0 | 510 |
| 방향 B 2회 | 185 | 94 | 1,536 | 511 |
| 방향 B 3회 | 261 | 104 | 1,630 | 463 |
| 변경 전 1회 | 1,675 | 0 | 0 | 442 |
| 변경 전 2회 | 1,842 | 0 | 0 | 432 |
| 변경 전 3회 | 2,027 | 0 | 0 | 463 |

- **판정**: 워밍 후 `cache_read / (input + cache_read + cache_creation) = 83.10%`로 목표 30%를 넘었다. 워밍 후 평균 풀가격 input은 변경 전 1,934.5에서 방향 B 223으로 줄어 **88.47% 감소**했다.
- **기능 확인**: 실제 응답 6건 모두 인터뷰 JSON으로 파싱됐고 `message`가 존재했다. 로컬 실측 테스트 **1개 통과(51.68초)**. 로컬 전용 파일을 제외한 Git 추적 대상 기준 백엔드 테스트는 **148개 통과·실제 Supabase opt-in 4개 안전 skip**.
- 장기 대화용 고정 청크 압축과 출력 형식 축소는 이번 완료 조건에 필요하지 않아 별도 최적화 후보로 남긴다.
**발견일**: 2026-06-29
**관련 영역**: `backend/app/core/prompt_manager.py`, `backend/app/api/interview.py`, `backend/app/core/claude_client.py` (부차: `design.py`, `doc_engine.py`)
**대표 사례**: 새 프로젝트를 인터뷰 step4(데이터 소스)까지 진행 → 21회 호출·73,120 토큰. 모델 `claude-sonnet-4-6`. 비용 약 $0.31(≈430원).

### 문제
73.1K 토큰 분해 시 **cache_creation(13,268) > cache_read(5,952)** — 캐시를 *만들기만* 하고 거의 *못 읽음*. 즉 프롬프트 캐싱이 사실상 작동하지 않아 input 45,752 토큰(전체 63%)이 대부분 풀 가격으로 나감. 캐싱이 제대로 되면 이 입력의 상당 부분이 cache_read(입력단가의 0.1배)로 전환되어 흐름 비용이 체감상 절반 이하로 떨어져야 함. (절대 비용은 작으나, 사용자 스케일 시 누적 비효율.)

> 캐싱 원리: 프롬프트는 **prefix 바이트 완전 일치**일 때만 캐시 재사용됨. breakpoint 앞부분이 1바이트라도 바뀌면 그 뒤 전부 무효화.

### 근본 원인 (인과 사슬 · 수정 전 진단)
**원인 ① (최대 원인) — 인터뷰 시스템 프롬프트의 캐시 블록 안에 매 턴 바뀌는 내용이 박힘.**
- `prompt_manager.build_system_prompt`: `cache_control: ephemeral`이 `blocks[0]`(=`base`)에 붙음(`prompt_manager.py:131-137`). 그런데 `base` 안에 **누적되는 `insights`**(`:112-115`)와 `project_type`(`:109-110`)이 포함됨.
- 답변마다 인사이트가 쌓여 `base` 텍스트가 매번 달라짐 → 캐시 prefix가 매 호출 무효화 → 매번 cache write, cross-call read = 0. → **`cache_creation > cache_read`의 직접 원인.**

**원인 ② — 가장 큰 안정 콘텐츠(스킬 지시문)가 유일한 breakpoint 뒤에 있어 아예 캐시 안 됨.**
- `step_content`(=`extract_step`로 뽑은 인터뷰 스킬 섹션)는 `blocks[1]`, 즉 캐시 breakpoint *뒤*에 위치(`:139-143`, cache_control 없음) → 절대 캐시되지 않음. 한 step 내 여러 턴에서 동일한데도 매번 풀 가격 재처리.

**원인 ③ — 메시지(대화 이력)에 캐시 breakpoint 없음 + `compress_history`가 캐싱과 상충.**
- `interview.py:335`의 `chat()` 호출은 messages에 cache_control을 붙이지 않음.
- `compress_history`(`prompt_manager.py:43-62`, keep_recent=6)는 6턴 초과 시 오래된 메시지를 매번 1개 요약 메시지로 *재작성* → 메시지 prefix가 매 호출 달라짐 → 메시지 캐싱 원천 불가. (input 토큰은 줄지만 캐싱은 못 함 — 트레이드오프)

**원인 ④ (구조 부차) — `base` 내부에 안정/휘발 콘텐츠가 섞임.**
- `base` 순서: 규칙(안정) → project_name → project_type → insights(휘발) → 응답형식 JSON 스펙(안정). 안정 콘텐츠가 휘발 콘텐츠 양옆에 흩어져, breakpoint를 잘 둬도 안정부만 독립 캐시하기 어려움.

**원인 ⑤ (캐싱 외 효율) — 호출 수 21 + 출력 형식 비대.**
- 매 턴 JSON 객체(message+insights+example_answers+topics+importance) 출력, max_tokens=2048 → 출력 토큰 부풀음. step4까지 21회 호출(평균 3,500토큰/호출).

**설계·문서 경로는 구조가 더 나음(영향 작음):**
- `design.py:235` 등: `system=[스킬텍스트만]`(순수 안정), 휘발 내용은 user_message에 둠 → 구조 OK. 단 각 설계 단계는 **1회성(one-shot) 생성**이고 단계별 스킬이 달라 cross-call 캐시 효과는 작음(같은 단계 5분내 재생성 때만 도움).
- `doc_engine.py:83`: 캐시 블록에 `생성일: {today}` 포함 → 날짜 바뀌면 무효화(경미). 문서 생성도 1회성이라 영향 작음.

### 해결 방향 (수정 전 계획 · A/B/C 완료)
**A. 인터뷰 시스템 프롬프트 재구조화 (핵심·최대 효과)** — `build_system_prompt`를 prefix 안정 순서로:
  1. **캐시 블록 1** = 전 인터뷰 동안 불변인 것만: 역할 + 규칙 + 응답형식 JSON 스펙 + project_name + project_type. 여기에 `cache_control`.
  2. **캐시 블록 2** = `step_content`(현재 단계 스킬 섹션). 여기에도 `cache_control`(2번째 breakpoint). → 한 step 내 모든 턴에서 read 적중.
  3. **`insights`(누적)는 breakpoint 뒤** 별도 system 블록(캐시 X)으로 분리하거나 마지막 user 메시지로 이동 → 안정 prefix 보존.
**B. 메시지 캐싱(선택)** — `compress_history` 재검토. 캐싱을 살리려면 압축 대신 마지막 assistant 턴 끝에 breakpoint를 두고 이력 유지 + 토큰이 정말 문제일 때만 더 큰 임계에서 압축. 트레이드오프 측정 후 결정.
**C. 효과 검증** — 수정 후 동일 인터뷰 재현 → `response.usage`에서 **cache_read >> cache_creation** 및 풀가격 input 급감 확인. cache_read가 여전히 0이면 silent invalidator 잔존 → 두 호출의 렌더된 prompt 바이트 diff로 추적.
**D. 부차** — design/doc는 현 구조 유지(영향 작음). 여력 시 `doc_engine`의 `생성일`만 캐시 블록 밖으로(경미 개선).

### 완료 조건
- ✅ 동일 step4 인터뷰 재현에서 워밍 후 캐시 읽기 비율 83.10%(목표 30% 이상).
- ✅ 변경 전 방식 대비 워밍 후 풀가격 input 토큰 88.47% 감소.
- ✅ `cache_read 3,166 > cache_creation 1,734`, 실제 응답 JSON 6/6 파싱 성공.

> 갱신(2026-06-29): S4 토큰 차트가 캐시읽기 비율(<30% 시 "⚠ 낮음(BL-003)")을 표시 → 이 수정의 **측정 도구**로 활용. 수정 전후를 `/admin` 차트로 비교 가능.

---

## BL-004 · 개발 인증 우회 시 활동 로그 행위자가 항상 `dev@localhost` (정상 동작, 실사용자 귀속 검증) ✅

**상태**: ✅ **검증 완료 (2026-07-06, 로컬)** — `DEV_BYPASS_AUTH=false` + rodion 실제 구글 로그인 → 공지 작성(admin 전용) 시 활동 로그 actor가 `rodion45673@gmail.com`(id `142c47ae`)로 정확히 기록됨(과거 `dev@localhost` 해소). 실제 로그인·admin 권한 인식·실사용자 귀속 3건 동시 확인. 비-admin 403은 코드(`require_admin`)로 확인, 수동 테스트 생략. 프로덕션 배포 env는 `false` 유지, 로컬은 개발 편의로 `DEV_BYPASS_AUTH=true` 원복 완료(2026-07-06).
**사전 준비**: rodion admin 승격 완료(2026-06-29).
**발견일**: 2026-06-29
**관련 영역**: `backend/app/middleware/auth.py`, `backend/app/core/activity.py`, `.env`(`DEV_BYPASS_AUTH`/`VITE_DEV_BYPASS_AUTH`), `users` 테이블
**대표 사례**: 프론트에서 rodion(rodion45673@gmail.com)으로 로그인한 상태로 공지 삭제 → 활동 로그 actor가 `dev@localhost`로 기록됨.

### 현상
로그인 계정은 rodion인데 활동 로그의 행위자(actor_email)가 `dev@localhost`로 찍힘. 또한 role=user인 rodion이 관리자 화면·삭제 동작에 접근됨.

### 원인 (정상 동작)
- `.env`에 **`DEV_BYPASS_AUTH=true`(백엔드)·`VITE_DEV_BYPASS_AUTH=true`(프론트)** 가 켜져 있음.
- `auth.py:get_current_user`의 첫 분기(`:44~45`): 우회 ON이면 **토큰을 검증하지 않고** `_DEV_MOCK_USER`(`dev@localhost`, role=admin)를 무조건 반환. → 누가 로그인했든 백엔드는 dev 사용자로 처리.
- `record_activity`(`activity.py`)는 전달받은 actor를 그대로 기록할 뿐 → **코드 정상.** dev@localhost가 찍히는 건 우회 모드의 의도된 결과.
- 프론트도 우회 ON이라 rodion(user)이 관리자 UI에 접근 가능했던 것(권한 버그 아님).

### 운영 환경(우회 OFF)에서의 올바른 동작
- `get_current_user`(`:47~78`)가 실제 Supabase 토큰 검증 → **실제 로그인 관리자**를 식별 → 로그에 진짜 이메일 기록.
- 비-admin은 `require_admin`(`:82`)에서 **403**으로 차단 → admin 동작 자체 불가.

### 사전 준비 (완료)
- **rodion role을 user→admin으로 승격**(2026-06-29, `users` 테이블 직접 UPDATE, id `142c47ae-7f85-4a94-9de5-835355464689`). 배포 검증 시 rodion으로 admin 동작을 테스트할 수 있게 하기 위함. (불필요해지면 user로 원복 가능)

### 배포 시 검증 체크리스트
1. `.env`에서 `DEV_BYPASS_AUTH=false` + `VITE_DEV_BYPASS_AUTH=false`로 변경.
2. 백엔드 수동 재시작 + 프론트 새로고침.
3. rodion(현재 admin)으로 **실제 로그인** → 공지 작성/삭제 → 활동 로그에 `rodion45673@gmail.com`로 기록되는지 확인.
4. 비-admin 계정으로 admin 동작 시도 → 403 차단 확인.
5. (선택) 테스트 후 rodion을 user로 원복할지 검토.

> 결론: 현재 로컬에서 모든 활동 로그가 `dev@localhost`로 나오는 것은 정상. 실제 귀속은 우회를 끈 배포 환경에서만 확인 가능.

---

## BL-005 · 법적 페이지 컴플라이언스 후속 (정식 오픈 전) 🟡

**상태**: 🟡 (b) ✅ 완료 (2026-08-11) · (a) ⏸ 배포 직전 · (c) ❌ 폐기. Phase 9 Step 1에서 약관·개인정보 초안 작성하며 도출. **무료 서비스라도 실제 구글 계정으로 개인정보를 수집하므로 (a)는 배포·정식 오픈 전 필수**다.
**관련 영역**: `frontend/src/content/legal.ts`, `frontend/src/pages/{Terms,Privacy}Page.tsx`, `backend/app/core/purge.py`, `backend/app/api/users.py`·`admin.py`, `frontend/src/components/common/DeleteAccountModal.tsx`·`TopBar.tsx`

### (a) 임시값 → 실제 정보 반영 → ⏸ 배포 직전으로 보류
- **개인정보 보호책임자**: 현재 "Prequel"(임시). 법적으로는 **실명 기재 원칙** → 정식 오픈 전 실명·직책 반영.
- **연락처 이메일**: `support@prequel.io`는 **현재 실제 수신되지 않는 주소**. 실수신 가능한 메일로 교체 필요 (약관·개인정보·로그인 화면 공통).
- ⚠️ **지금 하지 않는 이유**: 이 저장소는 공개 레포다. 배포 몇 주 전에 실명·개인 이메일을 커밋하면 그 시점부터 공개되고 git 히스토리에도 영구히 남는다. 값을 넣는 작업 자체는 10분이므로 **배포 직전에 일괄 반영**한다. (b) 완료로 "완전 파기 요청 창구"로서의 이메일 의존은 사라졌다.
- 국외이전 명시적 동의·만 14세 미만 문구도 이때 함께 반영한다.

### (b) 개인정보 완전 파기(hard delete) 기능 → ✅ 완료 (2026-08-11)
**구현**
- `backend/app/core/purge.py` — `purge_user(user_id)`. FK 역순 물리 삭제 후 잔존 행을 재확인하고 `PurgeResult(deleted, residual, auth_deleted)`를 돌려준다. 이미 일부만 지워진 상태에서 재호출해도 안전하다.
- `DELETE /api/users/me` — 본인 파기. **관리자는 차단**(마지막 관리자가 자신을 지우면 관리 화면에 아무도 접근 못 함) → 다른 관리자가 처리.
- `POST /api/admin/users/{id}/purge` — 관리자 파기. 본인 대상은 차단, 없는 사용자는 404.
- `DeleteAccountModal.tsx` + `TopBar` 프로필 메뉴 항목. `계정을 삭제합니다` 문구를 그대로 입력해야 버튼이 활성화되고, 성공 시 즉시 로그아웃 후 랜딩으로 이동한다.
- 개인정보처리방침 4·5항을 "직접 삭제 가능"으로 교체 — 수신되지 않는 support 메일에 파기 창구를 의존하던 우회 문구 제거.

**설계 판단**
- **soft delete 는 유지**한다. `deleted_at`(이용 정지·복구)과 파기(복구 불가)는 용도가 다르므로 공존시키고, 관리자 화면에서 별도 동작으로 노출한다.
- **명시 삭제 순서를 코드에 고정**했다. public 테이블 대부분은 CASCADE 가 걸려 있지만 ① `activity_logs.actor_id` 는 `ON DELETE SET NULL` 이라 행이 남고 `actor_email`·`detail` 에 개인정보가 그대로 보존되며, ② `public.users` ↔ `auth.users` 사이에는 FK 가 없어(`004` 트리거가 id 만 공유) 한쪽을 지워도 반대쪽이 남는다. ③ 마이그레이션이 SQL Editor 수동 실행이라 환경별 CASCADE 편차 가능성도 있다.
- `token_usage.session_id` 가 `SET NULL` 이라 `interview_sessions` 보다 **먼저** 지운다. `auth.users` 는 **마지막**에 지운다(먼저 지우면 실패 시 사용자가 다시 로그인해 재시도할 방법이 없어짐).
- 감사 기록은 본인 파기 시 `actor_id`·`actor_email`·`target_id` 를 모두 비우고 건수만 남긴다 — 파기 기록 자체가 개인정보가 되지 않도록.

**검증**: `tests/test_account_purge.py` **13개 통과** — 전 테이블 흔적 제거, activity_logs 이메일 제거, 타 사용자 데이터 불변, 감사 기록 무개인정보, 관리자 본인 삭제 차단(양쪽), 404, 멱등성, auth 삭제 실패 시 500, 이미 삭제된 auth 사용자는 성공 처리, soft delete 동작 불변. 백엔드 전체 **161 passed / 5 skipped**, `tsc -b`·ESLint·프로덕션 빌드 통과.

**잔여**: 실제 Supabase 대상 파기 검증은 배포 전 1회 수동 확인 권장(가짜 Supabase 기반 자동 테스트만 존재). `DEV_BYPASS_AUTH=true` 환경에서는 dev 사용자가 자동 재생성되므로 파기 테스트에 적합하지 않다.

### (c) 유료 전환 시 법적 요건 → ❌ 폐기 (2026-08-11)
수익화를 범위에서 제외해 결제를 도입하지 않으므로 아래 요건은 발생하지 않는다. **오히려 이 항목의 무게가 결제를 접은 근거 중 하나였다** — 기록으로만 남긴다.
- ~~결제 도입 시 **사업자등록·통신판매업 신고·사업자정보 표시**(전자상거래법) 의무화 → 약관/방침에 상호·사업자번호·주소 추가.~~
- 국외 이전(Anthropic·Supabase 미국)은 현재 **고지**만 함 → ⚠️ **이 건은 무료 서비스에도 해당**하므로 (a)(b)와 함께 처리한다. 정식 오픈 시 회원가입 단계의 **국외이전 명시적 동의** 절차 권장.
- (선택) 만 14세 미만 이용 제한 문구 추가 검토 — 무료 서비스에도 해당, 유지.

---

## BL-006 · 크레딧(무료 2회) 표시·차감 로직 불일치 — 사용량이 항상 0/2로 표시됨 ✅

**상태**: ✅ 완료 (2026-07-03). ①(a) 필드명 교체 + ②(c) 문구 정정 + ③(b) 중복 차감 가드 + ④(d) dev 카운트 0 리셋 모두 완료.
**발견일**: 2026-07-03
**관련 영역**: `frontend/src/hooks/useAuth.ts`, `pages/MyProjectsPage.tsx`, `components/common/TopBar.tsx`, `pages/AdminPage.tsx`, `lib/admin.ts`, `components/projects/NewProjectModal.tsx` / `backend/app/api/projects.py` / `supabase/migrations/006_design_sessions.sql`
**대표 사례**: dev@localhost 계정 — 프로젝트 3개(완료 2·진행중 1), 실제 `credits_used=7`인데 화면엔 "이번 달 사용 **0/2** · **2회 남았어요**"로 표시.

### 현재 과금 로직 (백엔드 설계 — 이 자체는 의도)
- 크레딧 차감 시점 = **설계(How) 단계 진입 시 1회** (`POST /projects/{id}/design-decision`, decision="design" → `_check_credits` + `_increment_credits`, `projects.py:154-169`). 프로젝트 생성·인터뷰·설계 스킵·문서 생성은 차감 없음(생성은 개수 제한도 없음).
- 한도: `PLAN_LIMITS = {free: 2, basic: 10, pro: 30, admin: 무제한}` (`projects.py:17`). free는 **계정 통산**(리셋 로직 없음), 월간은 유료 플랜 개념.

### 문제 (4건)
**(a) [핵심] 필드명 개명 미반영 — 프론트가 존재하지 않는 필드를 읽음.**
마이그레이션 006이 `users.free_used` → `credits_used`로 개명(+CHECK 제약 교체), 백엔드는 스키마·로직 모두 이행 완료(`schemas/user.py:11`). 그러나 **프론트 5곳이 여전히 `free_used`를 참조** → API 응답에 없는 키라 `?? 0`으로 항상 0:
- `useAuth.ts:12`(타입) / `MyProjectsPage.tsx:66`(0/2·남은 횟수 표시, `isQuotaExceeded` 항상 false → 생성 차단 무력화) / `TopBar.tsx:35` / `lib/admin.ts:16`(타입) / `AdminPage.tsx:288`(`${u.free_used}/2` → **"undefined/2"** 표시 추정)
→ 실제 사용량이 화면에 나올 수 없는 구조. 무료 한도 소진 사용자도 계속 "2회 남음"으로 보임.

**(b) 중복 차감 — 설계 재진입 시 매번 +1.**
`design-decision`은 `status=="completed"`만 재차감을 막음(`projects.py:154`). **designing/evaluating 상태에서 다시 design 결정을 보내면 그때마다 `_increment_credits` 실행** → dev 계정 credits_used=7(프로젝트 3개 대비)의 원인. 프로젝트당 1회 차감 보장 없음.

**(c) 문구·개념 불일치.**
- `MyProjectsPage.tsx:115` "이번 달 사용" — free는 통산 2회라 "이번 달"이 부정확.
- `NewProjectModal.tsx:47` "무료 플랜은 2회까지 킥오프를 **생성**할 수 있습니다" — 실제 차감·차단 지점은 생성이 아니라 **설계 진입**. 생성은 무제한.

**(d) 체크/차감 비대칭 (기록용, 동작 특성).**
`_check_credits`는 `DEV_BYPASS_AUTH=true` 또는 admin이면 통과(`projects.py:21-25`)하지만 `_increment_credits`는 **조건 없이 항상 실행**(`projects.py:169`) → dev/admin 모드에서 차단은 없는데 카운트만 쌓임. dev 계정 7이 커진 배경.

### 해결 방향
1. **(a) 프론트 5곳 `free_used` → `credits_used` 개명** — 타입+참조 일괄 교체. 표시·차단 즉시 복구. (최우선, 저위험)
2. **(c) 문구 수정** — "이번 달 사용" → "사용한 킥오프"(또는 "크레딧") / NewProjectModal 안내를 "설계 단계 진입 시 1회 차감" 의미로 정정. 정책을 바꾸는 게 아니라 문구를 로직에 맞춤.
3. **(b) 중복 차감 가드** — 프로젝트당 1회 차감 보장: designing/evaluating(=이미 차감된) 상태 재진입 시 차감 생략, 또는 projects에 `credit_charged_at` 기록 후 존재 시 스킵. 방식 결정 필요.
4. **(d)는 수정 여부 선택** — dev 모드에서 increment도 스킵할지(카운트 오염 방지) 결정. dev 계정 `credits_used=7`은 테스트 잔여물 — 보정할지 BL-001처럼 방치할지 결정.

### 적용한 수정 (2026-07-03, ①+②)
- **①(a) 필드명 교체 완료** — 프론트 5곳 `free_used` → `credits_used`: `useAuth.ts`(타입)·`lib/admin.ts`(타입)·`MyProjectsPage.tsx`(로컬 변수 `freeUsed`→`creditsUsed` + 소스)·`TopBar.tsx`(동일)·`AdminPage.tsx`(`${u.credits_used}/2`). 이제 실측 사용량 표시·`isQuotaExceeded`·`remaining` 정상 동작. grep `free_used`/`freeUsed` 프론트 0건, `tsc -b` 0에러.
- **방어 코드 추가** — `credits_used`가 한도(2)를 넘을 수 있어(③ 미수정 + dev 오염) 시각 요소 클램프: MyProjects 막대 `Math.min(creditsUsed/2, 1)*100%`, TopBar 잔여 `Math.max(0, freeLimit-creditsUsed)`. 큰 숫자 자체(예 dev 7)는 정직하게 그대로 표기.
- **②(c) 문구 정정 완료** — MyProjects 쿼터 카드 라벨 "이번 달 사용" → **"누적 사용"**(free는 월간이 아니라 통산). NewProjectModal 안내 "2회까지 킥오프를 생성" → **"설계 단계를 2회까지 진행 (프로젝트 생성·인터뷰는 무제한)"**(차감 지점을 생성→설계 진입으로 정정).
- **검증**: dev 계정(`credits_used=7`)에서 화면이 이제 "누적 사용 7/2·막대 100%·잔여 0/2·무료 소진 경고"로 실데이터 표시(과거 "0/2" 가짜값 해소). **7/2는 정상 — ③ 중복 차감 + dev 테스트 오염의 실측값.**

### 적용한 수정 (2026-07-03, ③ 중복 차감 가드)
- **마이그레이션**: `projects.credit_charged_at TIMESTAMPTZ` 추가 + 백필(`status='designing'`인 기존 프로젝트를 결제됨 처리). Supabase SQL Editor 수동 실행 완료.
- **`projects.py` `set_design_decision`**: `charge = decision=="design" and not existing.credit_charged_at`. `charge`일 때만 `_check_credits`(검사)·`credit_charged_at` 기록·`_increment_credits`(+1). → **프로젝트당 1회 멱등 차감** + 재진입 시 검사/차감 모두 스킵(한도 소진자도 자기 설계 재진입 가능 — 증상 B 해소). `_check_credits`/`_increment_credits`는 여전히 유일 호출부.
- **라이브 검증**(임시 프로젝트 생성→설계 2회→삭제): credits_used 7(생성 후 불변)→**8**(설계#1)→**8**(설계#2 불변)→삭제. 두 호출 다 HTTP 200. 가드 정상 동작 확인.
- 참고: 프로젝트 삭제는 크레딧 환불 안 함(의도). 테스트로 dev credits_used 7→8, 테스트 프로젝트는 삭제됨.

### 완료 조건
- ~~AdminPage 실측 표시("undefined/2" 해소)~~ ✅ ① / ~~재진입 시 credits_used 불변~~ ✅ ③(검증) / ~~차단 로직 복구~~ ✅ ① / ~~"설계 2회 = credits 2" 등식~~ ✅ ③.
- ~~(④) dev 계정 `credits_used` 오염값 정리~~ ✅ **0으로 리셋 완료**(2026-07-03, `users` 테이블 직접 UPDATE, id `0000…0000`). 기존 프로젝트의 `credit_charged_at` 도장은 유지되므로 재진입해도 재차감 없음 — 차감 흐름을 다시 테스트하려면 새 프로젝트 생성 필요.

---

## BL-007 · 인터뷰 답변 중복 전송 가능성 (멱등성 키) ✅

**상태**: ✅ **완료 (2026-07-06)** — 멱등성 키(`answer_id`)로 해결. 마이그레이션 없이 user 메시지에 answer_id를 저장하고 직전 답변 id와 비교해 중복을 판별.
**발견일**: 2026-07-06
**관련 영역**: `backend/app/api/interview.py`(`/interview/answer`), `frontend/src/pages/InterviewPage.tsx`, `frontend/src/lib/interviewDraft.ts`

### 문제
`/interview/answer`는 비멱등 POST — 부를 때마다 인터뷰를 1칸 진행시킨다. 서버가 답변을 정상 처리했으나 **응답만 유실**된 경우(네트워크 끊김), 클라이언트는 실패로 판단해 임시저장 후 재연결 시 **같은 답변을 재전송** → 인터뷰가 이중 진행될 수 있다. 수동 재시도 버튼도 동일 위험을 가진다.

### 근본 원인
클라이언트는 "서버가 못 받음"과 "서버는 처리했으나 응답 유실"을 구분할 수 없다. 두 경우 모두 "응답 없음"으로 보여, 재전송이 안전한지 알 수 없다.

### 해결 방향 (서버측)
- **멱등성 키**: 클라이언트가 답변마다 고유 ID(예: `answer_id`)를 부여해 전송. 서버는 처리한 ID를 기록해두고, 같은 ID가 다시 오면 재처리하지 않고 이전 결과만 반환.
- 또는 **순번 체크**: 서버가 세션의 현재 질문 번호를 확인해, 이미 답이 있는 질문이면 재적용하지 않음.

### 적용한 수정 (2026-07-06, 멱등성 키 방식) ✅
**마이그레이션 없이** 해결 — `answer_id`를 user 메시지(`messages` JSON)에 저장하고 직전 답변 id와 비교.
- **백엔드** `schemas/interview.py`: `InterviewAnswerRequest.answer_id: str | None`(하위호환). `api/interview.py` `/answer`: Claude 호출 전 "직전 user 답변 answer_id == 요청 answer_id"면 재처리·크레딧·Claude 없이 현재 상태 반환(`_current_state_response` 헬퍼, `/resume`과 공유). user 메시지에 answer_id 저장.
- **프론트** `lib/interviewDraft.ts`: 초안에 `answerId` 저장. `InterviewPage.tsx` `handleSend`: 새 답변=`crypto.randomUUID()` 생성, 재전송(재시도 버튼·자동 재전송)=같은 id 재사용. 자동 재전송이 `draft.answerId` 전달.
- **검증**: 인프로세스 테스트(TestClient) — 같은 answer_id 재요청 시 `current_step` 불변 + Claude 미호출 확인. 프론트 tsc·프로덕션 빌드 통과.
- **한계/설계**: "직전 답변 1건" 기준으로 판별(중복은 항상 직전 답변 재전송 + `sending` 가드로 동시 전송 차단이라 충분). answer_id 없는 구 요청은 기존대로 동작.

### 현재 완화 (D에서 적용, 위 수정의 보조)
- 임시저장은 프로젝트당 1건만 유지, 전송 성공 시 즉시 삭제.
- `sending` 가드로 동시 중복 전송 방지.

---

## BL-008 · 프로젝트 이름·설명 수정 UI 부재 (⋮ 메뉴에 "수정" 추가) ✅

**상태**: ✅ **구현 완료 (2026-07-13)** — `/projects` ⋮ 메뉴에 "수정" 추가 → `EditProjectModal`(이름·설명 편집) → `useProjects.updateProject`→`PATCH /projects/{id}` → 목록 즉시 갱신. 프론트만, 백엔드 무변경, `tsc -b` OK.
**발견일**: 2026-07-07
**관련 영역**: `frontend/src/pages/MyProjectsPage.tsx`(⋮ 행 메뉴), `frontend/src/components/projects/`(수정 모달 신규), 백엔드는 기구현

### 문제
사용자가 프로젝트를 생성한 뒤 **이름·설명을 수정할 방법이 없다.** `/projects` 목록의 ⋮(점 세 개) 메뉴에는 `이어하기 / 설계 이어하기 / 결과 보기(평가 이어하기) / 삭제`만 있고 **"수정"이 없어** 오타나 설명 변경 시 프로젝트를 새로 만들어야 한다.

### 참고 (구현 부담 낮음)
백엔드 `PATCH /api/projects/{id}`(`ProjectUpdate`: `name`/`description`/`project_type`)는 **이미 구현돼 있음** → 프론트 UI만 추가하면 됨.

### 해결 방향
- ⋮ 메뉴에 `수정` 항목 추가 → 이름·설명 편집 모달(생성 모달 2단계 재활용 또는 간단 모달) → `PATCH /projects/{id}` 호출 → 목록 즉시 갱신.

---

## BL-009 · AI 모델 추천이 구형 GPT-4o로 편향됨 (BL-001 후속·강화) ✅

**상태**: ✅ **구현 완료 (A+C, 2026-07-13)** — (A) `design-ai-workflow.md` 규칙 3: 구형 특정 모델(GPT-4 등) 단정 금지, 벤더 카테고리+선정 기준 제시, 예시는 "최신 세대"+추천 명시. (C) `design-architecture.md` 규칙 9: **인터뷰에서 구체 모델을 명시 안 하면 미확정으로 간주** + 임의로 구형 모델 지어내기 금지. `design.py` `_DEFER_TOKENS` 확장. py_compile OK·재시작.
**발견일**: 2026-07-13
**관련 영역**: `backend/skills/design-ai-workflow.md`(규칙 #3), `backend/skills/design-architecture.md`(AI 컴포넌트 technology 규칙), `backend/app/api/design.py`(`_model_undecided` 토큰/판정)
**연관**: [[BL-001]] — 설계가 미확정 모델을 임의 확정하는 문제. 그 수정은 "모델 토큰 + 보류 단어가 **같은 줄**"일 때만 미확정 처리라 아래 케이스를 못 잡음.

### 문제
사용자가 인터뷰에서 "AI로 분석하고 싶다"처럼 **모델을 명시하지 않고** 말하면, 설계 AI 워크플로우가 **구형 GPT-4o를 추천**한다. Prequel 자신은 Claude 기반인데도 OpenAI 구모델이 박히는 역설(BL-001에서도 지적).

### 근본 원인 (조사 완료, 2026-07-13)
`chat()` 기본 모델은 `claude-sonnet-4-6`(`claude_client.py:31`)이고, `gpt-4o`는 **코드/프롬프트에 하드코딩된 곳이 없음**(방어 문구뿐: `design.py:461,694`). 즉 추천은 LLM이 그때그때 생성한다.
1. `design-ai-workflow.md` 규칙 #3이 "정해진 모델이 없으면 프로젝트 유형에 맞는 접근법을 추천하라"고 시킴 → 추천 LLM이 자유 선택.
2. 프롬프트에 **"최신 세대 우선"·"현행 모델 목록"** 같은 기준이 없음 → LLM이 학습 데이터에서 가장 흔한 GPT-4o를 디폴트로 집음.
3. 추천 LLM의 **지식 컷오프** 때문에 더 최신 모델은 학습에 적게 들어와 GPT-4o로 회귀.
4. BL-001의 `_model_undecided()`는 모델 토큰 + 보류 단어가 같은 줄일 때만 미확정 판정(`design.py:39-45`) → 보류 뉘앙스 없는 표현은 미검출.

### 해결 방향 — A+C 채택 (미구현)
- **A. 특정 모델명 미기재 (핵심)**: 모델이 사용자 확정이 아니면 `model`에 구체 모델명/버전 대신 **"범용 LLM API (요구사항 기반 추후 선정)"** 같은 카테고리 + **선정 기준**(컨텍스트 길이·비용·멀티모달 여부 등)만 출력. → 구형 모델명 노출 원천 차단·유지보수 0·벤더 중립. 수정: `design-ai-workflow.md` 규칙 #3, `design-architecture.md` AI 컴포넌트 technology 규칙에 동일 원칙 적용.
- **C. 미확정 감지 강화**: `_model_undecided`의 토큰/판정을 넓혀 "AI로 분석/추천하고 싶다"처럼 보류 단어 없는 표현도 미확정으로 보게 함(또는 사용자가 모델을 **명시하지 않았으면 기본 미확정**으로 간주).
- **B (미채택, 후속 옵션)**: 현행 모델 카탈로그를 프롬프트에 주입해 최신 모델을 구체 추천 — 목록을 **수동 갱신**해야 해 유지보수 부담(또 낡음). 구체 모델명이 꼭 필요해지면 나중에 얹기.

### 완료 조건 (구현 시)
- 모델 미명시 인터뷰에서 설계 AI 워크플로우 `model`이 특정 벤더/구모델(GPT-4o 등)로 채워지지 않음.
- "AI로 분석" 류 표현도 미확정으로 잡혀 추천/미확정 표기가 일관됨.

---

## BL-010 · 인터뷰 "수집된 정보" 패널 한 턴 지연 (insight가 다음 턴에 반영) ✅

**상태**: ✅ **완화 구현 (2026-07-13)** — `prompt_manager.py` 인터뷰 규칙에 "직전 사용자 답변에서 확정된 정보는 다음 턴으로 미루지 말고 이번 응답의 insights에 즉시 포함(한 턴 지연 금지)" 추가. **코드 버그가 아닌 LLM 타이밍 특성이라 확률적 개선**(100% 보장 아님). py_compile OK·재시작.
**발견일**: 2026-07-13
**관련 영역**: `backend/app/core/prompt_manager.py`(`build_system_prompt` 응답 JSON 스펙), `backend/app/api/interview.py`(`submit_answer`). (무관 확인: `frontend/src/pages/InterviewPage.tsx`·`components/interview/RightPanel.tsx` — 지연 로직 없음)
**대표 사례**: 기술 스택(STEP 5)에서 백엔드/DB를 답해도 우측 "수집된 정보"에 바로 안 뜨고, 다음 질문(배포 환경)을 답한 뒤에야 백엔드/DB 카드가 등장.

### 현상
답변 N에서 확정된 정보의 insight 카드가 답변 N+1을 제출한 뒤에야 우측 패널에 반영됨(한 턴 지연, off-by-one처럼 보임).

### 원인 (조사 완료, 2026-07-13 — 코드 버그 아님)
- 프론트는 응답의 insights를 그대로 교체 표시(`InterviewPage.tsx:167`, 매핑 `:85-90`), 백엔드는 이번 턴 Claude 응답의 `parsed["insights"]`를 같은 응답에 즉시 반환(`interview.py:389-394, 441-442`). **양측 어디에도 지연 로직 없음** — step 완료를 기다리지 않음.
- 실제 원인은 **Claude가 직전에 닫힌 주제의 insight를 그 다음 턴에 커밋**하는 emission 타이밍. 응답 JSON 스펙(`prompt_manager.py:121-128`)에 "이번 답변에서 확정된 정보를 이번 응답 insights에 즉시 넣어라"는 강제가 없어 생기는 확률적 동작.
- 참고: 좌측 레일 단계 요약은 원래 단계 완료 시에만 채워짐(`_build_steps_list`, `interview.py:109-116`) — 우측 패널(턴마다 갱신)과 혼동 주의.

### 해결 방향 (선택·완화)
- 인터뷰 시스템 프롬프트에 규칙 추가: **"직전 사용자 답변에서 확정된 정보는 반드시 이번 응답의 `insights`에 즉시 포함한다"** (`prompt_manager.py`의 stable 블록 규칙 목록 또는 응답 형식 안내에).
- 확률적 개선(100% 보장 아님), 회귀 위험 낮음(프롬프트 1줄). 효과는 실제 인터뷰로 관찰 필요.

### 완료 조건 (구현 시)
- 한 주제(예: 백엔드/DB)를 답한 **그 턴에** 해당 insight 카드가 즉시 등장(다음 답변을 기다리지 않음).

---

## BL-011 · 시스템 구조 단계 가이드 문구가 실제 UX와 불일치 (존재하지 않는 입력 안내) ✅

**상태**: ✅ **구현 완료 (2026-07-13)** — `ArchHelperPanel.tsx`의 ExampleBox("'잘 모르겠어요'라고 입력…" — 존재하지 않는 입력 조작)를 자동 생성 현실에 맞게 교체("AI가 자동으로 만들고, 마음에 안 들면 '다시 시도'"). 용어 사전은 유지. tsc OK.
**발견일**: 2026-07-13
**관련 영역**: `frontend/src/components/design/ArchHelperPanel.tsx`, (동작 근거) `frontend/src/components/design/ArchitectureStep.tsx`

### 문제
아키텍처(시스템 구조) 단계는 **완전 자동**이다 — 진입 시 추천 조합(템플릿)을 자동 로드하고(`ArchitectureStep.tsx` `useEffect`→`onLoadTemplates`), 템플릿이 오면 자동으로 첫 조합을 생성한다(`autoGenRef`→`onGenerate(0)`). **사용자 입력창이나 조합 선택 UI가 없다.** 그런데 가이드 패널의 ExampleBox가 `"잘 모르겠어요"라고 입력하시면, AI가 비슷한 프로젝트의 조합을 추천…`이라며 **존재하지 않는 텍스트 입력 조작**을 안내해 오해를 준다. 첫 줄 "**추천 조합을 선택하시면**"도 실제론 '선택' 없이 자동 생성이라 어감이 안 맞음.

### 해결 방향
- ExampleBox를 자동 생성 현실에 맞게 교체. 예: "이 단계는 AI가 **자동으로** 추천 조합을 만들어 보여줘요. 훑어보고 마음에 안 들면 **다시 시도**로 재생성할 수 있어요."
- 첫 줄 "선택하시면" → "기다리시면" 소폭 수정.
- **용어 사전**(프론트엔드/백엔드/데이터베이스/API)은 초보에게 유용하므로 유지.

---

## BL-012 · 인터뷰 "기술 스택" 단계와 설계 "시스템 구조" 단계 중복 ✅

**상태**: ✅ **구현 완료 (2026-07-14, 방향 개선 A)** — 인터뷰 S5를 "기술 스택 완전 확정"에서 **"선호도+이유 확인"**으로 재정의. 실제 스택 확정·아키텍처 생성은 설계 2단계에 위임(중복 제거). 프롬프트 1개(`backend/skills/kickoff-interview.md` STEP 5)만 수정, **코드·스키마·마이그레이션·단계 수(11 유지) 변경 0**. `.claude/skills` 미변경·`sync_harness.py` 미실행([[BL-002]]). `load_skill`이 매 호출 파일을 새로 읽어 재시작 불필요.
**발견일**: 2026-07-13
**관련 영역**: `backend/app/core/prompt_manager.py`(`INTERVIEW_STEPS` S5 tech_stack), `backend/skills/kickoff-interview.md`(STEP 5), 설계 아키텍처(`frontend/src/components/design/ArchitectureStep.tsx` + `backend/app/api/design.py` `generate_architecture`)

### 문제
인터뷰 11단계와 설계 4단계를 대응시키면 중복이 있다. **가장 심한 중복 = 기술 스택**: 인터뷰 S5(기술 스택 — 프론트/백엔드/DB/배포)에서 대화로 다 물어본 뒤, 설계 2단계(시스템 구조)에서 **같은 내용을 컴포넌트+tech_stack으로 다시** 만든다 → 사용자가 "아까 말한 걸 또?" 체감. (부차 중복: 인터뷰 S4 데이터 소스 ↔ 설계 3 데이터 구조 / 인터뷰 S3 핵심가치·S8·S9 심화 ↔ 설계 1 요구사항 — 중간 정도, '구체화'로 정당화 가능.)

### 참고
설계는 인터뷰를 `_get_interview_context`로 **입력받아 재료로 사용**하므로 순수 중복은 아님. 단 기술 스택만큼은 재료 활용보다 **재수집**에 가까움.

### 해결 방향 (후보)
- 인터뷰 S5(기술 스택)를 가볍게 축소("정해둔 스택 있으세요? 없으면 설계 단계에서 추천해드려요")하고, **실제 스택 확정은 설계 2단계에 위임** → 인터뷰 단축 + 중복 제거.
- 설계 흐름을 바꾸는 변경이므로 신중 검토 필요(회귀·문서 동기화 영향).

### 채택 방향 & 근거 (2026-07-14 논의)
- **인터뷰 S5 삭제(B) 대신 재정의(A) 채택.** 삭제는 `INTERVIEW_STEPS` 11→10, `extract_step` STEP 번호·진행바·테스트·E2E 문서("11단계")까지 깨져 고위험. 재정의는 프롬프트만 손대 저위험.
- **"왜 이 기술?" 교육은 이미 설계 단계 담당** — `ArchitectureStep.tsx`의 "각 부품을 왜 골랐나요?"(component `description`) + Explainer(초보용 비유). 인터뷰는 원래 가르치지 않고 묻기만 했으므로, S5 슬림화로 교육이 사라지지 않음.
- **S5의 두 역할 분리**: (a) 사용자 본인의 선호·이유 수집 = **유지**(설계가 대신 못 함), (b) 아키텍처 완전 확정 = **제거**(설계 2단계와 중복). → S5를 "선호+이유 elicitation"으로 재정의해 (a) 보존·(b) 제거.
- 설계 흐름은 미변경 — 설계는 `_get_interview_context`로 사용자 선호를 존중하고, 없으면 기존대로 템플릿 추천. (사용자에게 조합 선택권을 주는 방향 2는 별도 큰 작업으로 보류.)

### 적용한 수정 (2026-07-14)
- **`backend/skills/kickoff-interview.md` STEP 5** 재작성 — 제목 유지("기술 스택", 부제 "선호도 확인"), 내용을 "완전 확정"에서 "이미 정한 기술·그 이유·피하고 싶은 것"만 가볍게 확인 + "정해둔 게 없으면 설계 단계에서 이유와 함께 추천" 안내 + "확정 선호만 인사이트로, 미정은 '설계 단계에서 추천 예정'으로, 예시 기술명을 확정으로 간주 금지"([[BL-001]]/[[BL-009]] 원칙과 정합).
- **검증**: `load_skill`(`harness_loader.py`)이 `backend/skills/`에서 매 호출 파일을 새로 읽음(캐시 없음) → 재시작 없이 다음 인터뷰 호출부터 반영. 단계 수·코드·스키마 무변경이라 tsc/py_compile 불필요.

### 완료 조건
- ~~인터뷰 S5가 기술 스택을 재확정하지 않고 선호+이유만 가볍게 수집~~ ✅
- ~~정해둔 스택이 없어도 사용자를 압박하지 않고 설계로 위임~~ ✅
- (관찰) 실제 인터뷰에서 S5가 짧아지고 "아까 말한 걸 또?" 체감이 줄었는지 — 사람 테스트 시 확인.

---

## BL-013 · 설계 "AI 흐름" 단계가 빈 껍데기로 뜨고 자동 생성 안 됨 ✅

**상태**: ✅ **완료 (2026-07-13)** — `_coerce_ai_workflow`가 미생성(None)일 때 `None`을 반환하도록 수정. 실측 HTTP로 검증.
**발견일**: 2026-07-13
**관련 영역**: `backend/app/api/design.py`(`_coerce_ai_workflow`), (증상) `frontend/src/components/design/AiWorkflowStep.tsx`
**대표 사례**: "등기부 등본 AI 해석기"(활성 프로젝트 `2f8e9275`, 설계 data-model까지 진행, `ai_workflow=None`)에서 AI 흐름 단계가 빈 화면으로만 뜨고 생성이 안 됨.

### 근본 원인 (코드 버그)
`_coerce_ai_workflow(None)`이 `None`이 아니라 **`{}`**를 반환 → `DesignSessionOut(ai_workflow={})`가 `AiWorkflowData` 기본값(`model="Claude"`, inputs/outputs/fallbacks=`[]`)으로 채움 → `GET /design/session`이 `ai_workflow`를 **null이 아닌 빈 객체**로 반환. 프론트 `AiWorkflowStep`은 `aiWorkflow`가 truthy가 되어 ① `useEffect`의 `!aiWorkflow`가 false → **자동 생성이 절대 안 돎**, ② 빈 껍데기(입력·출력·폴백 전부 비어있음)만 렌더. 모든 generate 엔드포인트가 `_session_to_out`를 거치므로 **저장된 세션으로 AI 흐름에 도달하는 모든 AI/ML 프로젝트**가 동일 증상.

### 적용한 수정 (2026-07-13)
- `_coerce_ai_workflow`: 시작에 `if not value: return None`, 마지막 `return {}`→`return None`, dict/str 분기도 빈 값이면 `None` 반환. 레거시 이중 인코딩 문자열 → dict 디코딩은 그대로 유지.
- **검증**: 단위 테스트(None/빈값→None, 정상 dict 보존, 단일·이중 인코딩 문자열→dict, garbage→summary 폴백) + 백엔드 재시작 후 실측 `GET /api/design/session/2f8e9275…` → `ai_workflow: null` 확인. → 프론트 `!aiWorkflow`가 true가 되어 AI 흐름 자동 생성 정상화.

---

## BL-014 · 설계 AI 흐름의 `model` 필드에 지저분한 blob이 들어감 (모델명 정규화 필요) ✅

**상태**: ✅ **구현 완료 (2026-07-13)** — `model` 필드는 벤더/모델명만, `API`·`최신 버전`·기법(프롬프트 엔지니어링)·배포 방식은 model_version·summary로. `design-ai-workflow.md`(model 필드 설명 + 규칙 2 정규화), `design-architecture.md`(규칙 10 technology 간결화), `design.py`(확정 모델 주입문을 "변경 금지"→"벤더 유지+정규화"로). py_compile OK·재시작. (예: "OpenAI GPT API (최신 버전, 프롬프트 엔지니어링)" → model "OpenAI GPT".)
**발견일**: 2026-07-13
**관련 영역**: `backend/skills/design-ai-workflow.md`, `backend/skills/design-architecture.md`(AI 컴포넌트 technology 규칙), `backend/app/api/design.py`(`generate_ai_workflow`의 `arch_ai_model` 복사 + "확정된 AI 모델 변경 금지" 경로 `:697-702, 720`)
**연관**: [[BL-009]] — **별개 문제.** BL-009는 "미확정인데 멋대로 GPT-4o 추천", BL-014는 "사용자가 확정했는데 **표기가 지저분**".
**대표 사례**: "등기부 등본 AI 해석기"(`2f8e9275`) — AI 박스 model 타이틀에 `OpenAI GPT API (최신 버전, 프롬프트 엔지니어링)` 표시(BL-013 수정으로 생성이 되게 된 뒤 관찰됨).

### 문제
`model` 필드는 깔끔한 모델명 하나여야 하는데, **벤더(OpenAI) + 형태(API) + 버전문구(최신 버전) + 기법(프롬프트 엔지니어링)** 이 한 덩어리로 들어감. `model_version`은 빈칸.

| 칸 | 지금 | 기대 |
|---|---|---|
| model | `OpenAI GPT API (최신 버전, 프롬프트 엔지니어링)` | `OpenAI GPT` (벤더/모델명만) |
| model_version | (빈칸) | `최신(미지정)` 또는 빈칸 |
| task | 등기부 등본 위험도 분석 및 해석 | 그대로 |
| summary | — | 기법(프롬프트 엔지니어링)·API 호출 방식은 여기로 |

### 근본 원인 (데이터 조회로 확정, 2026-07-13)
사용자 벤더 선택(OpenAI) 자체는 정당 — **표기/정규화만 문제.** 체인:
1. 인터뷰: 사용자가 `OpenAI GPT 최신 버전`(모델) + `프롬프트 엔지니어링`(기법)을 **별개로** 선택.
2. 설계 아키텍처 생성: AI 컴포넌트 `AI 분석 엔진(LLM)`의 `technology`를 `"OpenAI GPT API (최신 버전, 프롬프트 엔지니어링)"` **한 덩어리로 합침**.
3. 설계 AI 흐름 생성: `_model_undecided`/`_looks_undecided` 모두 False(사용자가 정했으므로) → `undecided=False` → "확정된 AI 모델 (변경 금지)" 경로가 `arch_ai_model`을 `model`에 **그대로 복사**(`design.py:720` `parsed.get("model") or arch_ai_model`).

### 해결 방향 (추천: 프롬프트 정규화)
- `design-ai-workflow.md`: `model`엔 **벤더/모델명만**("OpenAI GPT", "Claude" 등), "API"·"최신 버전"·기법(프롬프트 엔지니어링)은 넣지 말 것. 버전 → `model_version`, 기법·배포 방식 → `summary`.
- `design-architecture.md`: AI 컴포넌트 `technology`도 모델명 위주로 짧게.
- 코드 정규식 파싱(대안)보다 프롬프트 정규화가 회귀 위험 낮음.

### 완료 조건 (구현 시)
- AI 박스 model 타이틀이 깔끔한 모델명(예: "OpenAI GPT")으로, 버전·기법은 각 필드로 분리 표시.
- 기존 오염 프로젝트(등기부)는 설계 재생성 시 자연 교정([[BL-001]] 방식).

---

## BL-015 · 마감 단계 AI 산출물(정직한 평가·빈틈 점검)이 사용자 동의 없이 반영됨 — 채택/제외 큐레이션 필요 ✅

**상태**: ✅ **완료 (2026-08-25)** — 빈틈 ✕는 2026-07-13에 완료됐고, 나머지였던 평가(evaluation) 큐레이션도 이번에 마무리. `EvaluateStep.tsx`에 차원별 ✕(제외) 버튼 + AI 권고 ✕ 버튼 추가, `FinalizePage.tsx`에 `handleUpdateEvaluation`→`PUT /finalize/evaluate/{id}`(기존 generic 엔드포인트, 신규 코드 없음) 배선. 남긴 항목만 `_prior_results_context`·최종 문서에 반영. 스키마 무변경·백엔드 무변경, `tsc -b` + 프로덕션 빌드 OK.
**발견일**: 2026-07-13
**관련 영역**: `frontend/src/components/finalize/GapStep.tsx`·`EvaluateStep.tsx`·`DoneStep.tsx`(기존 ✕ 패턴), `frontend/src/pages/FinalizePage.tsx`(`handleUpdateDone` 배선), `backend/app/api/finalize.py`(`_prior_results_context` + generic `PUT /finalize/{step}`), `backend/app/core/doc_engine.py`·`doc_model.py`(문서 삽입)

### 문제
마감 단계의 AI 산출물이 **사용자가 채택 여부를 표시하지 않았는데** 자동으로 반영된다. 두 경로:
1. **다음 단계 전파** — `_prior_results_context`(finalize.py:115)가 평가→완료조건→빈틈→체크리스트로 이전 결과를 다음 단계 AI 입력에 자동 포함.
2. **최종 문서 삽입** — `generate_final_document`(doc_engine.py:140-157, "반드시 포함" 지시) + `build_sections`가 "정직한 평가"·"빈틈 점검"을 최종 킥오프 문서 섹션으로 항상 포함.

**완료 조건(DoneStep)은 이미 ✕로 제외 가능**(`onUpdate`→`PUT`)하지만 **빈틈(GapStep)·평가(EvaluateStep)는 읽기 전용**이라 걸러낼 수 없음. (요구사항/아키텍처를 자동 수정하진 않음 — 문서·하류 반영만.)
**대표 사례**: 등기부 — 빈틈 suggestion "공공 API 3종→1종으로 줄이고 나머지는 MVP2로" 가 사용자 채택 없이 문서/하류에 반영됨.

### 해결 방향 (추천: 채택/제외 큐레이션으로 통일)
- **빈틈(gap)에 ✕ 추가** — DoneStep 패턴 복사(`onUpdate` + `remove(idx)`), `PUT /finalize/gap/{session_id}`는 **이미 generic 지원**(finalize.py:251). 남긴 항목만 `_prior_results_context`·`generate_final_document`에 반영됨.
- **평가(evaluation)** — 항목 삭제보다 **AI 권고(recommendation) dismiss** 또는 **"문서에 포함" 토글**이 자연스러움(평가는 assessment라 리스트가 아님).
- 원칙: **"AI 산출물은 사용자가 채택한 것만 반영."**
- ⚠️ 문서·다음 단계 생성 **전에** PUT 저장돼야 제외가 반영됨(완료조건과 동일 흐름).

### 공수 추정 (2026-07-13 배선 확인 기준)
- **빈틈 ✕만**: ~1~2h. GapStep.tsx `onUpdate`+✕(~15줄), FinalizePage `handleUpdateGap`+배선(~8줄), **백엔드 변경 0, 마이그레이션 0**.
- 평가(권고 dismiss/문서포함 토글)까지 확장: **+1~2h**(dimensions 구조라 살짝 더).

### 적용한 수정 (2026-08-25, 평가 큐레이션)
- **`EvaluateStep.tsx`**: `onUpdate?: (evaluation: Evaluation) => void` prop 추가. 6개 차원 카드마다 `removeDimension(idx)`(배열에서 제거) ✕ 버튼, "AI 권고" 박스에 `dismissRecommendation()`(`recommendation: ''`로 비움, 기존 `evaluation!.recommendation &&` 조건으로 자동 숨김) ✕ 버튼. 모든 차원을 제외하면 "모든 평가 항목을 제외했어요" 빈 상태 표시(`GapStep.tsx`의 빈 상태 패턴과 동일).
- **`FinalizePage.tsx`**: `handleUpdateEvaluation` 추가 — `handleUpdateGap`과 동일 패턴, `PUT /finalize/evaluate/{session.id}`(기존 generic 엔드포인트를 `step="evaluate"`로 호출, 백엔드 신규 코드 0줄). `<EvaluateStep onUpdate={handleUpdateEvaluation} />` 배선.
- **검증**: `tsc -b` + `vite build` 프로덕션 빌드 통과.
- **한계**: gap과 동일 — 문서·다음 단계가 이미 생성된 뒤에 제외하면 소급 반영 안 됨(재생성해야 반영).

### 완료 조건
- ~~빈틈 항목을 ✕로 제외 가능 + 제외분이 최종 문서·다음 단계에 들어가지 않음.~~ ✅ (2026-07-13)
- ~~평가를 문서에 포함할지 사용자가 선택.~~ ✅ (2026-08-25, 차원별 ✕ + AI 권고 ✕)

---

## BL-016 · 마감 완료 처리 실패 시 복구 경로 없음 (프로젝트가 evaluating에 갇힘) ✅

**상태**: ✅ **구현 완료 (2026-07-13)** — 멱등 완료 엔드포인트 + 프론트 재시도 버튼. 정적 검증(py_compile·tsc·endpoint 등록) 통과. **복구 로직 end-to-end 검증됨**(등기부를 타임아웃 300초로 재실행 → 127초 만에 `completed`+`kickoff_doc` 생성). ⚠️ **단, 기본 타임아웃(백엔드 60초·프론트 120초)으로는 큰 문서 완료가 여전히 실패** → 후속 [[BL-017]] 필요.
**발견일**: 2026-07-13
**관련 영역**: `backend/app/api/finalize.py`(`_generate` checklist 경로 `:193-198`, `_finalize_complete` `:130-161`), `backend/app/core/doc_engine.py`(`generate_final_document` `chat` 호출 `:183`), `frontend/src/components/finalize/ChecklistStep.tsx`·`FinalizeComplete.tsx`·`pages/FinalizePage.tsx`
**대표 사례**: 등기부(`2f8e9275`) — 마감 4단계(평가·완료조건·빈틈·체크리스트) **내용은 전부 저장**됐는데 `finalize_session.status=in_progress`·`project.status=evaluating`·`kickoff_doc=비어있음`.

### 문제 (원자성 부재 + 복구 경로 없음)
체크리스트 단계가 두 작업을 연달아 하는데 원자적이지 않음:
1. 체크리스트 생성 → DB 저장(`finalize.py:193-194`) — **커밋됨**.
2. `_finalize_complete()`: 최종 문서 생성(Claude, `doc_engine.py:183`) → `project.status=completed`+`kickoff_doc` → `finalize_session.status=completed`.

**②의 Claude 호출이 실패**(큰 문서라 타임아웃/일시적 503 추정, 코드엔 데이터 버그 없음)하면 ①만 커밋된 **부분 상태로 굳음**. 게다가:
- `_finalize_complete`는 `_generate("checklist")` 안에서만 호출됨 → 독립 재실행 경로 없음.
- 프론트 `ChecklistStep` 자동생성 가드가 "체크리스트 이미 있으면 재생성 안 함"이라 재시도가 안 걸림.
- → **복구 경로 없이 evaluating에 영구히 갇힘.**

### 해결 방향 (추천)
- **백엔드**: `_finalize_complete`를 독립 **멱등** 엔드포인트 `POST /finalize/complete/{project_id}`로 노출(기존 로직 재사용 ~15줄). 4단계가 다 있으면 문서 재생성 후 `status=completed`, 다시 불러도 안전.
- **프론트**: 마감 세션이 **"4단계 다 있는데 status ≠ completed"** 이면 "완료 처리 다시 시도" 버튼 노출 → 위 엔드포인트 호출. → **갇힌 프로젝트 복구 + 향후 재시도** 동시 해결.
- (선택 보강) 문서 생성 성공 **후에** 체크리스트를 저장하도록 순서 조정 → 신규 실패 시 체크리스트가 안 남아 기존 auto-gen이 자연 복구.

### 공수
- 백엔드 엔드포인트 ~15줄(기존 함수 재사용) + 프론트 감지·버튼 ~20~30줄, **마이그레이션 없음**. 총 **~2~3h**(중간·저위험).

### 적용한 수정 (2026-07-13)
- **백엔드** `finalize.py`: 멱등 엔드포인트 `POST /finalize/complete` 추가 — 기존 `_finalize_complete` 재사용, 체크리스트 없으면 400, 다시 불러도 안전. (기존 `_generate("checklist")` 경로는 그대로 유지.)
- **프론트** `FinalizePage.tsx`: `handleComplete` 추가 — `status==='completed'`면 화면만 전환(불필요한 재생성 방지), 아니면 `/finalize/complete` 호출(`useRetryable`로 실패 시 재시도). 체크리스트 단계의 primary/skip 버튼을 `handleNext`(단순 화면전환) → `handleComplete`(백엔드 검증)로 교체. → 서버가 실제 완료하지 않은 프로젝트에 "완료" 화면을 띄우지 않음 + 갇힌 프로젝트 복구.
- **검증**: `py_compile` OK, 프론트 `tsc -b` OK, 백엔드 재시작 후 `/openapi.json`에 `/api/finalize/complete` 등록 확인.

### 완료 조건
- ~~완료 처리가 실패해도 "완료 처리 다시 시도"로 재실행 가능~~ ✅ (체크리스트 단계 "마무리 완료" = 멱등 완료 호출)
- ~~등기부 등 이미 갇힌 프로젝트가 완료됨~~ ✅ (2026-07-13, 타임아웃 300초 인프로세스 재실행으로 `completed`+`kickoff_doc` 생성). **단 기본 타임아웃 하에서 UI 버튼으로 성공하려면 [[BL-017]] 선행 필요.**

---

## BL-017 · 최종 킥오프 문서 생성이 타임아웃(60초/120초)으로 실패 — 큰 프로젝트 완료 불가 ✅

**상태**: ✅ **구현 완료 (2026-07-13)** — `chat()` per-call `timeout` 파라미터 추가, 최종 문서 300초·마감 생성 180초·프론트 300초로 상향. 정적 검증(py_compile·tsc) 통과 + 재시작. (300초면 성공은 [[BL-016]] 검증서 실측: 등기부 최종 문서 127초.)
**발견일**: 2026-07-13 ([[BL-016]] 검증 중 발견)
**관련 영역**: `backend/app/core/claude_client.py`(`chat` timeout=60s·max_retries=2), `backend/app/core/doc_engine.py`(`generate_final_document` `chat(... max_tokens=8192)`), `frontend/src/lib/api.ts`(`apiFetch` 120s AbortController), `frontend/src/pages/FinalizePage.tsx`(`handleComplete`)
**대표 사례**: 등기부(`2f8e9275`) — 최종 문서 생성이 **실제 127초** 소요. 기본 60초 타임아웃×재시도2로도 실패해 `POST /finalize/complete`가 503. 타임아웃 300초로 재실행하니 127초 만에 성공(문서 9,584자, tokens 32,136).

### 근본 원인 (확정)
최종 킥오프 문서는 인터뷰+설계+평가·완료조건·빈틈·체크리스트를 **전부 종합**하고 `max_tokens=8192`로 긴 출력을 생성 → 내용 많은 프로젝트는 **60초를 초과**(등기부 127초). `chat()`의 60초 타임아웃(×2 재시도)이 이를 죽이고, 설령 백엔드를 늘려도 프론트 `apiFetch` 120초가 다시 죽임. → 큰 프로젝트는 **완료 자체가 불가**. (이게 [[BL-016]]에서 프로젝트가 evaluating에 갇힌 실제 유발 원인.)

### 해결 방향
- **백엔드**: `chat()`에 per-call `timeout` 파라미터 추가(SDK `messages.create(..., timeout=...)` 또는 `with_options`). `generate_final_document`은 긴 타임아웃(예: 240~300초)으로 호출. (기본 호출은 60초 유지.)
- **프론트**: `apiFetch`에 per-call 타임아웃 오버라이드 추가, `handleComplete`(완료 호출)에 긴 타임아웃(예: 300초) 지정.
- (대안·더 견고) 문서 생성을 **스트리밍** 또는 **백그라운드 잡+폴링**으로 전환하면 단일 요청 타임아웃 의존을 제거 — 규모 커지면 권장. 우선은 타임아웃 상향으로 충분.

### 공수
- 타임아웃 상향(백엔드 `chat` 파라미터 + doc_engine 호출 + `apiFetch` 오버라이드 + handleComplete): ~1~2h, 마이그레이션 없음.
- 스트리밍/백그라운드 잡 전환(대안): 별도·큰 작업.

### 적용한 수정 (2026-07-13)
- **백엔드** `claude_client.py`: `chat(..., timeout: float | None)` 추가 — 지정 시 `client.with_options(timeout=...)`, 미지정이면 기본 60초 유지(인터뷰 등 빠른 호출).
- `doc_engine.py` `generate_final_document`: `timeout=300`. `finalize.py` `_generate`(평가·완료조건·빈틈·체크리스트): `timeout=180`(BL-018로 프롬프트가 깊어져 출력↑ 대비).
- **프론트** `FinalizePage.tsx`: `AI_GEN_TIMEOUT_MS=300_000`을 `handleGenerate`(마감 4단계)·`handleComplete`에 전달(`apiFetch`는 기존 `timeoutMs` 파라미터 활용, 시그니처 변경 없음).
- 검증: `py_compile` OK, `tsc -b` OK, 재시작 완료. (design.py 생성 4종은 이번 범위 밖 — 필요 시 후속.)

### 완료 조건 (구현 시)
- 등기부처럼 큰 프로젝트도 UI "마무리 완료" 버튼으로 타임아웃 없이 완료됨.

---

## BL-018 · 평가·빈틈 점검이 "판단형 비판"을 못 함 — 도메인·전제·규제 리스크 미포착 🚧

**상태**: ✅ **Phase 1(F2+F3) 완료·실측 통과 (2026-07-13)** — `kickoff-evaluate.md`·`kickoff-gap.md`에 도메인 전문가 프레이밍 + 보편 축(전제 타당성·치명적 실패모드) + 도출식 도메인/규제 슬롯(억지 금지) + 보수 편향 완화. 스키마 무변경(`dict`)이라 프론트/문서 영향 0.
**실측 (등기부, 읽기전용 재생성, 모델 변경 없이 Sonnet 4.6)**: 종합 **yellow→red**로 뒤집힘. **마스킹↔핵심가치(전제 red 3), 오류 비대칭/거짓안전(실패모드 red 3), 변호사법·공인중개사법(도메인·규제 red 2), LLM 환각(AI적절성 yellow 5)** — 4대 근본 문제를 모두 포착(기존 프롬프트는 전부 놓쳤음). 빈틈도 9→11건, 근본 4개 포함. 빈틈 생성 77초(→BL-017 없었으면 60초 타임아웃으로 죽었을 것, 상호 검증).
**→ F1(모델 격상)은 F2+F3만으로 효과가 충분해 보류 후보.** F4(2-패스)도 불필요해 보임.
**발견일**: 2026-07-13
**관련 영역**: `backend/skills/kickoff-evaluate.md`, `backend/skills/kickoff-gap.md`(프롬프트), `backend/app/core/claude_client.py`(`chat` 모델/추론 설정), `backend/app/api/finalize.py`(`_generate`)
**대표 사례**: `pre-requirement/등기부 등본 AI 해석기_kickoff.md` — 앱의 평가/빈틈이 **엔지니어링 빈틈**(3종 API vs 1종 모순, 주소 마스킹↔공공API 충돌, Railway ephemeral 스토리지, 10건 표본 부족)은 잘 잡았으나, **근본 문제를 통째로 놓침**: ①개인정보 마스킹이 위험판단 핵심가치를 무력화(소유자·날짜가 사기 신호), ②변호사법·공인중개사법 존폐 리스크, ③OCR 전제(등기부는 인터넷등기소 정형 PDF), ④90% 정확도의 오류 비대칭(위험 놓침 비용이 훨씬 큼), ⑤법적 사실 추출을 LLM 환각에 맡김, ⑥신호등 3단계의 false reassurance. 사용자가 같은 md를 **Opus 4.8 max**로 돌리면 이런 근본 문제가 잡힘.

### 근본 원인 (진단)
- **① 비판이 앱에서 가장 약한 설정으로 돌아감** — evaluate·gap이 `chat()` 기본값(**Sonnet 4.6**, **thinking 꺼짐**, 단일 패스). 모순·전제·도메인 리스크 찾기는 깊은 추론이 가장 크게 기여하는 작업인데 얕은 1패스로 처리.
- **② 닫힌 분류표** — evaluate는 고정 6차원(차별화/AI/시장/완성도/학습/보안), gap은 고정 7카테고리(전부 엔지니어링/정합성). "규제·전제·도메인 함정"이 들어갈 칸이 없어 탈락.
- **③ 깊이 억제 지시** — gap "명확한 것만·오탐 금지·없으면 빈 배열"(과소보고 편향), 양쪽 "킥오프 수준만·1~2문장"(파고들 공간 차단).
- **④ 도메인 전문성 스캐폴딩 부재** — 그냥 "평가자/검토자". 도메인 전문가 시각 없음 → 일반적(엔지니어링) 시각만.

### 설계 원칙 (사용자 논의로 확정)
1. **"목록 확장"이 아니라 "렌즈 도출"** — 규제·법률/도메인 리스크는 **프로젝트마다 다름**(부동산=변호사법 존폐급, 할일앱=무관). 고정 차원으로 박으면 억지 오탐/빈칸 = 현재 실수 반복. → 프로젝트에서 **도출**하고 무관하면 정직하게 "없음". (앱의 기존 `applicable` 조건부 패턴의 확장)
2. **기존 JSON 스키마 안에서 해결** — `dimensions[]`·`gaps[]` 구조 유지, 내용만 풍부하게. 항목 추가만으로 프론트(`EvaluateStep`·`GapStep`)가 그대로 렌더 → **프론트·문서 코드 변경 0.**

### 수정안 (F1~F4)
| 수정 | 겨냥 원인 | 내용 | 대상 | 모델변경 | 난이도 |
|---|---|---|---|---|---|
| **F1. 비판 단계만 모델·추론 격상** | ① | evaluate·gap(+최종문서)만 상위 모델(Sonnet 5/Opus 4.8)+thinking/effort↑. 인터뷰 턴은 유지 | `claude_client.py`, `finalize.py` | ✅ | 중·비용↑ |
| **F2. 닫힌 목록→열린 도출** | ②④ | 보편 축 2개(전제 타당성·치명적 실패모드) + 열린 슬롯("도메인 전문가라면? 규제·함정 도출, 없으면 '없음', 억지 금지") + 도메인 전문가 프레이밍 | `kickoff-evaluate.md`, `kickoff-gap.md` | ❌ | **낮음·무료** |
| **F3. "보수·얕게" 제약 완화** | ③ | gap "명확한 것만"→confidence 표기+coverage 우선 / "킥오프 수준만·1~2문장" 완화 | 같은 두 스킬 | ❌ | 낮음 |
| **F4. (선택) 2-패스 자기비판** | ①③ | 1차 평가 후 "놓친 근본 문제·틀린 전제는?" 재질문 | `finalize.py` | 선택 | 중·호출↑ |

### 의존성
- **F1**은 thinking 켜면 느려짐 → **[[BL-017]](타임아웃) 선행 필요**, 비용은 **[[BL-003]](캐싱)·[[BL-009]](모델전략)** 과 함께 판단.
- **F2·F3는 완전 독립** — 모델 안 바꾸고 프롬프트만으로 즉시 가능.

### 추천 순서 (싼 것부터 검증)
1. **Phase 1 (무료·저위험): F2 + F3** → 등기부 md 재생성으로 "근본 문제 잡히나" 실측. 충분하면 종료.
2. **Phase 2 (부족 시): F1** → [[BL-017]]과 세트.
3. **Phase 3 (선택): F4.**

### 완료 조건 (구현 시)
- 등기부 md 재생성 시 평가/빈틈이 마스킹↔핵심가치 모순·규제(변호사법) 리스크·전제(OCR)·오류 비대칭 중 **다수를 실제로 포착**.
- 무관한 프로젝트(할일앱 등)에선 규제/도메인 슬롯이 **억지 오탐 없이 "없음"** 으로 나옴.

---

## BL-019 · 시스템 구조 미리보기 다이어그램의 긴 컴포넌트명/역할이 잘림 — 마우스 오버로 전문 표시 ✅

**상태**: ✅ **구현 완료 (2026-07-14)** — `ArchitectureStep.tsx`의 `DynamicArchDiagram` 각 박스 `<g>`에 `<title>` 추가(전체 name + technology + 역할, 줄바꿈 구분). 브라우저 네이티브 호버 툴팁으로 전문 노출. 레이아웃·상태관리 변경 0, `tsc -b` 통과, Vite HMR 반영. (실제 호버 표시는 브라우저에서 확인 필요.)
**발견일**: 2026-07-14
**관련 영역**: `frontend/src/components/design/ArchitectureStep.tsx`(`DynamicArchDiagram`의 박스 `<text>` — name `slice(0,15)+'…'`, role `slice(0,17)+'…'`)

### 문제
설계 "시스템 구조 미리보기" 다이어그램의 박스는 SVG 폭이 고정(BOX_W=130)이라 긴 이름/역할을 자른다: name은 16자 초과 시 15자+`…`, role은 18자 초과 시 17자+`…`. 예: 컴포넌트 "Power Automate (Cloud + Desktop)" → 박스에 **"Power Automate …"** 로만 보여 전문을 알 수 없다.

### 참고 (범위 한정)
다이어그램 **아래** "각 부품을 왜 골랐나요?" 리스트(`ArchitectureStep` 하단)는 전체 name·technology·description이 이미 다 보인다. 잘림은 **SVG 다이어그램 박스에 한정**.

### 해결 방향
- **A (추천·최소)**: 각 박스 `<g>` 안에 `<title>{comp.name}</title>`(+ role/technology) 자식 요소 추가 → 브라우저 **네이티브 호버 툴팁**으로 전문 표시. 레이아웃·상태관리 변경 0, 접근성도 개선. 공수 ~15~30분.
- **B (선택·리치)**: `onMouseEnter`로 커스텀 HTML 툴팁(스타일링 가능하나 hover 상태·좌표 계산 필요).

### 완료 조건
- ~~잘린 박스에 마우스를 올리면 컴포넌트 전체 이름/역할이 툴팁으로 보인다.~~ ✅ (name + technology + 역할)

---

## BL-020 · 단계별 모델 티어링 — 인터뷰(무료·고볼륨)=경량 모델 / 평가(유료·판단)=상위 모델 ❌

**상태**: ❌ **폐기 (2026-08-11)** — 수익화를 개발 범위에서 제외하면서 이 항목의 유일한 명분(**유료 플랜 유닛 이코노믹스 정렬**)이 사라졌다. 유료 티어가 없으면 "무료 미끼 단가를 낮춘다"는 전제 자체가 성립하지 않고, 실사용자 트래픽도 없어 비용 절감 실익이 없다. 아래 티어링 맵·모델 단가 조사·품질 리스크 분석은 **판단 근거로 보존**한다.

**모델 갱신 정책 — 수동 (2026-08-11 확정)**
- **상수 정리는 이미 되어 있다.** 코드 점검 결과 모델 ID는 `claude_client.py:31`의 `chat(model="claude-sonnet-4-6")` 기본값 **한 곳뿐**이고, 어떤 호출부도 `model=`을 넘기지 않는다. BL-020 본문의 "모델 ID가 코드 곳곳에 흩어져 있다"는 서술은 **사실과 달랐다**. 추가 작업 없음.
- **세대 갱신은 자동화하지 않고 필요할 때 손으로 한다.** `validate_models()`(기동 시 폐기 감지)도 도입하지 않는다 — 호출 지점이 한 곳이라 자동 감지의 이득이 없고, 갱신 자체가 재검증을 동반하는 판단 작업이라 자동화 대상이 아니다.
- **지금 올리지 않는 이유**: 현행 프롬프트 18개가 `claude-sonnet-4-6` 기준으로 튜닝돼 있고, [[BL-003]]의 캐시 83%·입력 토큰 88% 절감도 이 모델에서 측정한 값이다. 실사용자가 없는 상태에서 모델을 바꾸면 튜닝 유효성과 실측치를 다시 확인해야 하는데 얻는 게 없다. `claude-sonnet-4-6`은 정상 서비스 중인 모델이며 "한 세대 전"이 곧 고장은 아니다.
- [[BL-018]] F1(평가 단계 모델·추론 격상)은 **품질 근거로는 여전히 유효**하나, F2+F3만으로 충분하다는 실측이 있어 보류 상태를 유지한다. 비용 정렬 명분만 함께 소멸했다.

### ⚠️ 나중에 수동으로 갱신할 때 물리는 것 (Sonnet 4.6 → Sonnet 5 기준, 2026-08-11 조사)
모델 문자열만 바꾸면 **런타임이 깨진다.** 아래는 실제 코드 대조 결과다.

| # | 변경점 | 이 코드에 미치는 영향 |
|---|---|---|
| 1 | **thinking이 기본 ON** | Sonnet 4.6은 `thinking` 미지정 = 꺼짐, Sonnet 5는 **켜짐**이 기본이다. |
| 2 | **응답 파싱이 깨진다** 🔴 | `claude_client.py:53`이 `response.content[0].text`를 무조건 읽는다. thinking이 켜지면 `content[0]`이 thinking 블록이라 `.text`가 없어 **인터뷰·설계·평가·문서 생성 전부 실패**한다. |
| 3 | **`max_tokens`가 thinking까지 포함** | 기본 1024인데 thinking이 나눠 쓰면 답변이 중간에 잘린다(설계·마감은 8192라 여유 있음). |
| 4 | **토크나이저 변경** | 같은 글이 약 30% 더 많은 토큰이 된다 → [[BL-003]] 실측치와 캐시 최소 크기 판단을 다시 재야 한다. |
| — | 안전 확인됨 | `temperature`·`top_p`·`top_k`를 쓰지 않으므로 Sonnet 5의 파라미터 400은 해당 없음. 프롬프트 캐시 최소 크기도 1024로 동일해 [[BL-003]] 구조는 유효. |

**갱신 절차**: ① `thinking={"type": "disabled"}`를 명시하거나 응답 파싱을 텍스트 블록 탐색으로 바꾼다 → ② `max_tokens` 기본값을 재점검한다 → ③ `count_tokens`로 [[BL-003]] 수치를 다시 잰다 → ④ 인터뷰~최종 문서까지 1회 완주해 프롬프트 준수(JSON 형식·insight 추출)를 확인한다.

**발견일**: 2026-07-14 · **폐기일**: 2026-08-11
**관련 영역**: `backend/app/core/claude_client.py`(`chat(model=...)`), `backend/app/api/interview.py`·`design.py`·`finalize.py`, `backend/app/core/doc_engine.py`
**연관**: [[BL-003]](인터뷰 토큰 과소비·캐싱 — 비용 절감의 나머지 절반) · [[BL-018]] F1(비판 단계 모델·추론 격상 = 이 티어링의 "상위" 절반, 여기로 통합·조율) · [[BL-017]](thinking 켜면 느려짐 → per-call 타임아웃 필요, 이미 있음)

### 배경 (수익화 유닛 이코노믹스)
- 비용 구조가 **뒤집혀** 있음: 무료가 될 **인터뷰**(멀티턴, [[BL-003]] 실측 step4까지 73k토큰≈$0.31, 완주 ~$0.6~0.9)가 유료가 될 **설계/평가**(원샷 합 ~60~100k)보다 **비쌈**. 무료 미끼가 제일 비싼 부분.
- 해결: **가격은 지불의사(가치)에, 비용은 모델 티어로 따로 관리.** 인터뷰를 경량 모델로 내리면 미끼 단가가 몇 분의 1 → 손실 리더 감당 가능. 상위 모델은 돈 받는 평가에만.

### 현재 상태 (실측)
- `chat(system, messages, max_tokens=1024, model="claude-sonnet-4-6", timeout=None)` — **이미 `model` 파라미터 지원.** 그런데 **모든 호출이 기본값(sonnet-4-6) 단일 모델.**
- `thinking`/추론강도 파라미터는 **아직 없음** → 상위 티어에 extended thinking 주려면 `chat()`에 추가 필요([[BL-018]] F1과 동일 작업).

### 티어링 맵 (호출부 → 티어)
| 티어 | 대상 호출부 | 성격 | 제안 모델 |
|---|---|---|---|
| **경량** | 인터뷰 `interview.py:237`(start)·`:375`(answer, AI제안 포함), 인터뷰-only 문서 `doc_engine.py:102` | 무료·고볼륨·대화형 수집 | Haiku급 |
| **중급(현행 유지)** | 설계 4종 `design.py:247/486/590/726`(+템플릿 `:406`) | 유료·원샷·구조화 | 현행 Sonnet |
| **상위** | 평가/빈틈/완료조건/체크리스트 `finalize.py:191`, 최종 종합문서 `doc_engine.py:183` | 유료·판단/비판·돈값 | Sonnet 5 / Opus 4.8 (+thinking) |

### 구현 방향
1. 티어 상수 정의(예: `MODEL_LIGHT`/`MODEL_MID`/`MODEL_HEAVY`) 후 호출부에서 `chat(..., model=...)`로 주입. **`chat()` 시그니처 이미 지원 → 저위험.**
2. 상위 티어용 `chat()`에 `thinking`/effort 파라미터 추가([[BL-018]] F1 흡수). 느려지므로 per-call 타임아웃([[BL-017]]) 활용.
3. `record_token_usage`/admin 차트가 모델별로 구분되면 티어별 비용 가시화(선택).

### 모델 선정·감지 방식 (2026-07-14 조사, claude-api 스킬 근거)
**핵심: "현재 가장 높은 모델"을 자동 감지하는 API는 없다.** Anthropic Models API(`client.models.list()`/`retrieve(id)`)는 모델 목록·컨텍스트·기능(vision/thinking/effort)·폐기 여부는 주지만, **지능 랭킹 필드가 없음** → 어느 게 "최상위"인지는 **사람이 큐레이션**한다. 따라서 "최신 최고 모델 자동 선택"은 불가능하고, **티어별 모델을 단일 상수로 지정 + 새 모델 출시 시 그 상수만 갱신**이 정석. (이게 [[BL-009]]/[[BL-014]] "구형 모델이 박히는" 문제의 코드 레벨 방지책.)

**현재(2026-07 기준) 모델·단가:**

| 모델 | ID | 입력/출력 $/1M | 티어 매핑 |
|---|---|---|---|
| Claude Fable 5 | `claude-fable-5` | $10 / $50 | 최상위(오버스펙 — thinking 항상 켜짐·30일 보존 필수 등 API 상이, 채택 보류) |
| Claude Opus 4.8 | `claude-opus-4-8` | $5 / $25 | **상위(채택 후보)** — 평가/최종문서 |
| Claude Sonnet 5 | `claude-sonnet-5` | $3 / $15 | **중급(채택 후보)** — 설계 |
| Claude Haiku 4.5 | `claude-haiku-4-5` | $1 / $5 | **경량(채택 후보)** — 인터뷰 |

> ⚠️ 현재 코드 기본값 `claude-sonnet-4-6`은 **한 세대 전 Sonnet**(현행은 Sonnet 5). 티어링과 함께 갱신 검토.

**권장 구현 패턴 (단일 상수 + 폐기 자동 감지):**
```python
# claude_client.py — 티어별 모델 = 단일 진실 공급원. 새 세대 나오면 여기 3줄만 수정.
MODELS = {
    "light": "claude-haiku-4-5",   # 인터뷰(무료·고볼륨)
    "mid":   "claude-sonnet-5",    # 설계(유료·원샷)
    "heavy": "claude-opus-4-8",    # 평가/최종문서(유료·판단)
}

def validate_models(client) -> None:
    """서버 기동 시 1회: 지정 모델이 아직 살아있는지 확인(폐기 감지)."""
    available = {m.id for m in client.models.list()}
    for tier, model_id in MODELS.items():
        if model_id not in available:
            logger.warning(f"[모델] {tier}={model_id} 목록에 없음 — 폐기/변경 가능성")
```
- 효과: ① 모델 ID가 코드 곳곳에 흩어지지 않음(현재 안티패턴 해소) ② 자동 랭킹은 못 해도 **폐기(404 예정) 감지는 자동** ③ 새 세대 교체 = 3줄.
- 유지보수: 새 모델 출시 시 `client.models.list()` 또는 공식 모델 문서로 확인 후 상수 갱신(월 1회~분기 점검이면 충분). **날짜 접미사 없는 alias 사용**(`claude-opus-4-8`, `claude-...-20250514` 금지).

### ⚠️ 핵심 리스크 (반드시 검증 후 적용)
- **인터뷰 품질이 곧 이 제품의 강점이자 전환 미끼**("인터뷰가 너무 잘돼 있다"는 사용자 평가). 인터뷰를 경량 모델로 내리면 **그 강점이 훼손될 위험**. → **맹목적 스왑 금지.** 실제 인터뷰를 경량 vs 현행으로 **나란히 돌려 질문 품질·insight 추출을 실측**한 뒤에만 확정. 품질 저하가 크면 경량 대신 "중급 + 캐싱([[BL-003]])"으로 비용을 잡는 대안.
- 모델 ID·단가는 구현 시 확정(품질/비용 실측 필요).

### 추천 순서 (→ 폐기, 기록용)
1. ~~상위 티어(평가/최종문서) 먼저 격상 — 돈값·품질↑, [[BL-018]] F1과 세트.~~
2. ~~경량 티어(인터뷰) 다운 — **품질 실측 게이트 통과 시에만.**~~

### 완료 조건 (→ 폐기, 기록용)
- ~~인터뷰 호출 단가가 유의미하게 하락하되 인터뷰 품질(insight 수·질)은 실측상 유지.~~
- ~~평가/빈틈이 상위 모델+추론으로 근본 문제 포착률↑.~~

### 남긴 것 → 없음 (2026-08-11)
모델 상수 정리는 이미 충족돼 있고(ID가 `claude_client.py` 한 곳), 세대 갱신은 위 "수동 갱신" 정책으로 넘겼다. 기동 시 폐기 감지(`validate_models()`)도 도입하지 않는다. **BL-020에 남은 작업은 없다.**


---

## BL-021 · 설계·마감 세션 API 소유권 검사 누락(IDOR) — 타 사용자 데이터 조회·변조 가능 ✅

**상태**: ✅ **완료 (2026-07-21, 1~4단계 완료 · 출시 차단 해제)** — 공통 소유권 검사 헬퍼를 8개 `session_id` 기반 API에 적용하고 내부 세션 생성·재사용 헬퍼도 접근 검사를 선행하도록 강화했다. 백엔드 전체 143개 테스트와 실제 Supabase의 임시 사용자 A/B 로그인 JWT 보안 회귀 검증이 모두 통과했다.
**심각도**: Critical — Broken Access Control / IDOR(Insecure Direct Object Reference)
**발견일**: 2026-07-20 (코드 전수 점검, 기존 `pre-requirement/code-review-report.txt`의 Critical #1 재확인)
**관련 영역**: `backend/app/core/supabase.py`, `backend/app/api/_shared.py`, `backend/app/api/design.py`, `backend/app/api/finalize.py`, 백엔드 권한 테스트

### 문제
수정 전에는 정상 로그인한 사용자 A의 토큰이 "요청자가 A"라는 사실만 증명할 뿐, URL의 `session_id`가 A 소유라는 사실까지 검증하지 않았다. 아래 API는 로그인은 확인했지만 조회·수정 쿼리에 `user["id"]` 또는 연결된 `projects.user_id` 조건이 없었다.

- `GET /api/design/requirements/{session_id}`
- `PUT /api/design/requirements/{session_id}/{req_id}`
- `PUT /api/design/requirements/{session_id}`
- `GET /api/design/architecture/{session_id}`
- `PUT /api/design/architecture/{session_id}`
- `GET /api/design/data-model/{session_id}`
- `PUT /api/design/data-model/{session_id}`
- `PUT /api/finalize/{step}/{session_id}`

따라서 수정 전에는 사용자 A가 개발자 도구·Postman·curl 등으로 요청의 `session_id`를 사용자 B의 값으로 바꾸면 백엔드가 로그인 성공만 확인한 뒤 B의 세션을 처리할 수 있었다. UUID는 로그·화면 캡처·오류·다른 API 결함 등으로 유출될 수 있으므로 접근 권한으로 사용할 수 없다.

### 발생 가능한 피해
- 타 사용자의 요구사항·아키텍처·데이터 모델 등 사업/기술 정보 열람.
- 타 사용자의 요구사항·아키텍처·데이터 모델·마감 결과 덮어쓰기.
- 변조된 데이터가 평가와 최종 킥오프 문서까지 전파되어 프로젝트 전체 결과 오염.
- `dict` 형태의 비정상 데이터를 저장해 피해 사용자의 화면 렌더링·문서 생성 오류 유발.
- 사용자 데이터 격리 실패에 따른 신뢰·보안·컴플라이언스 문제.

### 근본 원인
1. 인증(Authentication: 누구인가)과 인가(Authorization: 이 데이터의 주인인가)를 동일하게 취급함.
2. 프로젝트 ID 기반 API는 대체로 `.eq("user_id", user["id"])`를 적용하지만 세션 ID 기반 API에는 같은 규칙이 누락됨.
3. 서버가 `SUPABASE_SERVICE_KEY`를 사용하므로 DB RLS가 최종 방어선이 되지 못함.
4. 다중 사용자 교차 접근을 검증하는 부정 권한 테스트가 없음.

### 해결 방향
1. ✅ `backend/app/api/_shared.py`에 설계·마감 세션 소유권 검사 헬퍼를 추가한다. (2026-07-21)
   - `session_id`로 세션을 조회하고 세션의 `project_id`를 확인한다.
   - 삭제되지 않은 프로젝트의 `projects.user_id == user["id"]`일 때만 세션을 반환한다.
   - 세션이 없거나 소유자가 다르면 모두 404를 반환해 리소스 존재 여부도 숨긴다.
   - 구현: `require_owned_session`; 설계·마감 테이블 허용 목록과 소유자 성공/없는 세션/타 사용자/삭제 프로젝트/미지원 테이블 테스트 6개 추가.
2. ✅ 위 8개 API가 조회·수정 전에 반드시 공통 헬퍼를 호출하도록 변경한다. (2026-07-21)
   - 조회 API는 헬퍼가 반환한 소유 세션을 사용하고, 수정 API는 헬퍼 검증이 성공한 뒤에만 `UPDATE`한다.
   - 8개 API 각각에 대해 소유자 200, 타 사용자·삭제 프로젝트·없는 세션 404, 거부 후 원본 불변을 검증하는 엔드포인트 테스트 32개를 추가했다.
3. ✅ `_get_or_create_session`처럼 세션을 먼저 찾는 내부 헬퍼도 프로젝트 소유권 확인을 선행하도록 방어적으로 정리한다. (2026-07-21)
   - 설계·마감 헬퍼가 공통 DB 클라이언트와 `user_id`를 받아 단계 접근 검사를 먼저 수행하고 `(project, session)`을 반환한다.
   - 호출부의 중복 프로젝트 검사를 제거해 쿼리 수를 늘리지 않으면서, 타 사용자·삭제 프로젝트·잘못된 단계에서는 세션 조회·생성 자체가 실행되지 않게 했다.
   - 직접 헬퍼 테스트 10개로 선행 검사 순서, 기존 세션 재사용, 신규 세션 1회 생성을 검증했다.
4. ✅ 실제 Supabase와 서로 다른 사용자 A/B의 로그인 JWT로 보안 회귀를 검증한다. (2026-07-21)
   - 실제 `maybe_single()` 무결과 응답이 `None`일 수 있음을 확인해 공통 헬퍼가 응답 객체와 `None`을 모두 안전하게 처리하도록 보완하고 회귀 테스트 2개를 추가했다.
   - 소유자 A의 8개 요청은 200, 사용자 B의 교차 접근 8개와 soft delete 후 소유자 A의 접근 8개는 모두 404였고, 거부된 수정으로 데이터가 바뀌지 않음을 확인했다.
   - 검증에 사용한 임시 Auth 사용자·프로필·프로젝트·설계/마감 세션은 테스트 종료 시 모두 삭제했다.
5. 관리자 교차 접근이 필요하면 일반 사용자 API가 아니라 별도 Admin API와 명시적 권한 규칙으로 제공한다.
6. 장기적으로 사용자 JWT 기반 Supabase 클라이언트/RLS를 검토하되 현재 구조에서는 백엔드 소유권 검사를 필수 방어선으로 유지한다.

### 검증 결과
- ✅ 사용자 A가 자신의 설계·마감 세션을 조회·수정하면 200.
- ✅ 사용자 B가 A의 `session_id`로 조회·수정하면 404.
- ✅ 거부된 수정 후 A의 원본 데이터가 변경되지 않았는지 확인.
- ✅ 삭제된 프로젝트의 세션 접근은 소유자에게도 404.
- ✅ 위 8개 API 모두 소유자 성공/비소유자 거부 회귀 테스트 추가 (`test_session_ownership.py`, 전체 백엔드 143개 통과).
- ✅ 실제 Supabase + 실제 로그인 JWT 사용자 A/B 검증 통과: A 소유자 요청 8개 성공, B 교차 요청 8개 거부 및 원본 불변, soft delete 후 A 요청 8개 거부, 임시 데이터 정리 완료.

### 실제 변경 범위
- 백엔드 공통 헬퍼 + 설계 API 7개 + 마감 API 1개 + 권한 테스트.
- 프론트엔드·DB 스키마·마이그레이션 변경 없음.
- 정상 사용자의 요청 형식과 화면 흐름은 변경 없음.

### 완료 조건
- ✅ 위 8개 API가 세션→프로젝트→사용자 소유권을 확인한다.
- ✅ 다른 로그인 사용자의 세션 ID로 조회·수정 시 일관되게 404를 반환한다.
- ✅ 거부된 요청으로 대상 데이터가 변경되지 않는다.
- ✅ 소유자 정상 동작과 비소유자 거부 테스트가 자동화되어 통과한다.
- ✅ 프로덕션 배포 전 실제 Supabase 연동 보안 회귀 테스트 전체 통과.

---

## BL-022 · 크레딧 확인·차감이 비원자적 — 동시 요청 시 중복/누락·한도 초과 가능 ✅

**상태**: ✅ **완료 (2026-07-21)** — `011`·`012`의 행 잠금 기반 RPC와 백엔드 원자 차감 흐름을 실제 Supabase에서 병렬 검증했다. 같은 프로젝트의 동시 설계 요청은 정확히 1회만 차감됐고, 잔여 1크레딧으로 서로 다른 프로젝트가 경쟁할 때 하나만 성공해 무료 한도를 초과하지 않았다.
**심각도**: Critical — 과금/사용량 무결성, Race Condition
**발견일**: 2026-07-20 (코드 전수 점검, 기존 `pre-requirement/code-review-report.txt`의 Critical #2 재확인)
**관련 영역**: `backend/app/api/projects.py`(`_check_credits`, `_increment_credits`, `set_design_decision`), `supabase/migrations/010_credit_charged_at.sql`, 신규 DB RPC 마이그레이션, 동시성 테스트
**연관**: [[BL-006]]은 프로젝트별 중복 차감 표시를 추가했지만 여러 DB 요청 사이의 동시성·트랜잭션 문제는 해결하지 못함.

### 문제
현재 `POST /api/projects/{project_id}/design-decision`의 차감 흐름은 다음 세 단계로 나뉜다.

1. 요청 시작 시 읽어온 사용자 정보로 잔여 크레딧 확인.
2. 프로젝트에 `credit_charged_at` 기록.
3. `users.credits_used`를 다시 읽고 `현재값 + 1`로 갱신.

각 단계가 별도 Supabase REST 요청이어서 하나의 트랜잭션으로 묶이지 않는다.

### 발생 가능한 시나리오
- **같은 프로젝트 동시 진입**: 두 요청이 모두 미차감으로 판단해 `credits_used`가 두 번 증가할 수 있음.
- **사용량 증가 누락**: 두 요청이 `credits_used=0`을 동시에 읽고 모두 1을 저장하면 실제 두 번 사용했지만 1로 기록됨(Lost Update).
- **한도 초과 사용**: 무료 한도가 1회 남은 사용자가 서로 다른 두 프로젝트에 동시에 진입하면 두 요청이 모두 한도 검사를 통과할 수 있음.
- **부분 실패**: 프로젝트에 `credit_charged_at`은 기록됐지만 사용자 카운트 증가가 실패하면 재시도해도 카운트가 영구 누락될 수 있음.

### 근본 원인
1. 과금 상태를 바꾸는 여러 쿼리가 DB 트랜잭션 밖에서 실행됨.
2. `_increment_credits`가 `SELECT → Python에서 +1 → UPDATE` 방식이라 동시 요청을 직렬화하지 못함.
3. `_check_credits(user)`가 요청 시작 시점의 오래된 사용자 스냅샷을 사용함.
4. 프로젝트별 멱등 표시(`credit_charged_at`)를 조건부 갱신·사용자 카운트와 같은 트랜잭션으로 묶지 않음.

### 해결 방향
Supabase PostgreSQL RPC 함수 하나에서 설계 결정과 차감을 원자적으로 처리한다. 예: `set_design_decision_atomic(project_id, user_id, decision)`.

함수 내부 동작:
1. 대상 프로젝트와 사용자의 DB 행을 `SELECT ... FOR UPDATE`로 잠근다.
2. 프로젝트가 요청 사용자의 소유인지, 삭제/완료 상태가 아닌지 확인한다.
3. `decision='skip'`이면 차감 없이 상태만 `evaluating`으로 변경한다.
4. `decision='design'`이고 이미 `credit_charged_at`이 있으면 재차감 없이 기존 결과를 반환한다.
5. 최초 설계 진입이면 잠금 상태의 최신 `credits_used`로 플랜 한도를 확인한다.
6. 프로젝트 `status='designing'`·`credit_charged_at=NOW()`와 사용자 `credits_used=credits_used+1`을 같은 트랜잭션에서 갱신한다.
7. 어느 단계든 실패하면 전체를 롤백해 프로젝트 표시와 사용자 카운트가 항상 일치하게 한다.

백엔드 `set_design_decision`은 `_check_credits`와 `_increment_credits`를 따로 호출하지 않고 위 RPC 결과만 사용한다. 관리자·개발 우회 계정의 카운트를 기록할지 면제할지는 함수 구현 전에 정책을 확정한다.

### 적용한 수정 (2026-07-20)
- **DB 마이그레이션** `supabase/migrations/011_atomic_credit_charge.sql`: `set_design_decision_atomic` RPC 추가. 프로젝트·사용자 행을 `FOR UPDATE`로 잠그고 소유권·완료 상태·기존 차감·최신 사용량을 확인한 뒤 프로젝트 상태/차감 시각과 `credits_used + 1`을 한 트랜잭션에서 처리한다.
- **권한 제한**: 신규 RPC의 `PUBLIC`·`anon`·`authenticated` 실행 권한을 회수하고 백엔드 `service_role`에만 실행 권한 부여.
- **백엔드** `backend/app/api/projects.py`: `_check_credits`·`_increment_credits`와 다중 REST 갱신을 제거하고 RPC 1회 호출로 교체. 한도 소진·프로젝트/사용자 없음·잘못된 결정 오류를 기존 HTTP 응답으로 매핑.
- **기존 정책 유지**: 완료 프로젝트 상태 강등 방지, 설계 재진입 추가 차감 방지, 설계 건너뛰기 무차감, `DEV_BYPASS_AUTH` 한도 우회(사용량 기록은 유지).
- **테스트 인프라** `backend/tests/_fakes.py`: RPC 핸들러·호출 기록 지원 추가.
- **회귀 테스트**: 최초 차감·재진입·한도 소진 시 무변경·개발 우회·건너뛰기·완료 프로젝트·404와 SQL 잠금/권한 계약 검증.
- **검증**: 대상 테스트 23개 통과, 전체 백엔드 62개 통과, 커버리지 64%.
- **DB 적용**: `011_atomic_credit_charge.sql`을 실제 Supabase에 적용 완료.
- **실제 동시성 검증 완료 (2026-07-21)**: `backend/tests/integration/test_supabase_credit_concurrency.py`를 추가해 독립 Supabase 클라이언트의 병렬 RPC로 같은 프로젝트 멱등 차감과 서로 다른 프로젝트의 한도 경쟁을 검증했다. 실패한 경쟁 요청은 프로젝트 상태·차감 도장을 남기지 않았고, 모든 임시 사용자·프로젝트·세션은 fixture 종료 시 삭제됐다.

### 검증 결과
- ✅ 같은 프로젝트에 동시 설계 진입 요청 2개 → 프로젝트와 `credits_used`가 정확히 1회만 차감.
- ✅ 크레딧 1회가 남은 상태에서 서로 다른 프로젝트 2개에 동시 진입 → 하나만 성공하고 다른 요청은 `CREDIT_LIMIT_EXCEEDED:2`로 거부.
- ✅ 이미 차감된 프로젝트 재진입 → 성공하지만 추가 차감 없음.
- ✅ `decision='skip'` → `completed`로 이동하고 재시도에도 차감 없음 (`012`의 확정 단계별 정책).
- ✅ 완료 프로젝트 재요청 → 상태 강등·추가 차감 없음(로컬 API/SQL 계약 테스트).
- ✅ 한도 경쟁에서 거부된 프로젝트는 상태·차감 도장이 변경되지 않아 부분 저장 없음.

### 실제 변경 범위
- 신규 Supabase SQL 마이그레이션(예: `011_atomic_credit_charge.sql`)과 RPC 함수.
- `backend/app/api/projects.py` 차감 흐름을 RPC 1회 호출로 교체.
- `FakeSupabase`의 RPC 지원 또는 별도 DB 통합 테스트 추가.
- 프론트엔드 요청 형식은 유지 가능.

### 완료 조건
- ✅ 프로젝트 차감 표시와 사용자 크레딧 증가가 하나의 DB 트랜잭션에서 처리된다.
- ✅ 같은 프로젝트 재요청은 멱등이며 추가 차감되지 않는다.
- ✅ 서로 다른 프로젝트의 동시 요청도 플랜 한도를 초과하지 못한다.
- ✅ 중간 실패 시 부분 저장 없이 전체 롤백된다.
- ✅ 단일 요청·재시도·동시 요청·한도 초과 테스트가 자동화되어 통과한다.
- ✅ 프로덕션 배포 전 실제 Supabase 환경에서 동시성 검증을 완료한다.

---

## BL-023 · 인터뷰 1회 + 설계·평가 세트 1회 단계별 과금 및 패스 흐름 ✅

**상태**: ✅ **완료 (2026-08-11 종결)** — 1~5단계 구현과 실제 Supabase 동시성 검증은 2026-07-21에 끝났고, 마지막까지 남아 있던 **브라우저 패스→문서→Markdown E2E는 2026-07-22 Phase 9 Step 7의 TC-017이 이미 검증**했다(실제 Supabase·실제 로그인 JWT). 상태 갱신이 누락돼 있던 것을 2026-08-11 문서 점검에서 확인해 종결한다.
**TC-017 실행 증거**: `design-decision` HTTP 200 → `/document` 이동, 인터뷰 인사이트 렌더, `TC-017 실제 패스 문서_kickoff.md` 다운로드 및 본문 확인, 중복 `skip` HTTP 200(멱등), `credits_used=1`·`status=completed`·설계 차감 없음, 프로젝트 목록 재진입 성공.
**심각도**: High — 과금 정책 불일치, 사용자 이동 흐름 오류
**발견일**: 2026-07-20 (과금 정책 재확인)
**관련 영역**: `supabase/migrations/012_phase_credit_charges.sql`, `backend/app/api/_shared.py`, `backend/app/api/interview.py`, `backend/app/api/projects.py`, `backend/app/api/design.py`, `backend/app/api/finalize.py`, `backend/tests/test_phase_credit_charges.py`, `backend/tests/test_design_phase_access.py`, `backend/tests/test_phase_credit_frontend_contract.py`, `frontend/src/hooks/useAuth.ts`, `frontend/src/pages/InterviewPage.tsx`, `frontend/src/pages/DesignPage.tsx`, `frontend/src/pages/FinalizePage.tsx`, `frontend/src/pages/MyProjectsPage.tsx`, `frontend/src/components/design/DesignWelcome.tsx`, `frontend/src/components/design/DesignComplete.tsx`
**연관**: [[BL-022]]의 원자적 설계 차감은 유지하되, 인터뷰 차감과 단계별 이동 정책을 추가한다. 실제 Supabase에 적용된 `011`은 수정하지 않고 `012`에서 보완한다.

### 확정 요구사항
1. 사용자가 프로젝트의 인터뷰에 최초 진입하면 크레딧을 1회 차감한다.
2. 같은 프로젝트의 인터뷰를 새로고침·재접속·재시도·일시정지 후 재개해도 추가 차감하지 않는다.
3. 인터뷰 완료 후 `설계 진행`을 선택해 설계에 최초 진입하면 크레딧을 1회 추가 차감한다.
4. 설계와 평가는 하나의 유료 단계 세트이며, 설계를 마치고 평가에 진입할 때는 추가 차감하지 않는다.
5. 인터뷰 완료 후 `건너뛰기`를 선택하면 설계와 평가를 모두 건너뛰고 인터뷰 요약 문서 페이지로 바로 이동한다.
6. 설계·평가를 건너뛴 경우에도 기존 Markdown 내보내기 API로 인터뷰 요약 `.md` 파일을 다운로드할 수 있어야 한다.
7. 모든 단계를 진행한 프로젝트의 총 차감은 정확히 2회다.

### 기대 사용량
| 사용자 흐름 | 인터뷰 차감 | 설계·평가 차감 | 총 차감 |
|---|---:|---:|---:|
| 인터뷰만 시작하고 종료 | 1 | 0 | 1 |
| 인터뷰 완료 후 설계·평가 패스 | 1 | 0 | 1 |
| 인터뷰 완료 후 설계·평가 모두 진행 | 1 | 1 | 2 |
| 인터뷰 또는 설계 재접속 | 추가 없음 | 추가 없음 | 기존 값 유지 |

### 구현 전 코드와의 차이
- `POST /api/interview/start`는 프로젝트와 기존 세션을 확인하고 Claude 첫 질문을 생성하지만 크레딧을 차감하지 않는다. 따라서 인터뷰만 사용한 뒤 종료하면 사용량이 0으로 남는다.
- `POST /api/projects/{project_id}/design-decision`에서 `decision='design'`인 경우에만 `011` RPC가 1회 차감하므로 전체 과정을 완료해도 현재 총 차감은 1회다.
- 인터뷰 화면의 `decision='skip'`은 현재 프로젝트를 `evaluating`으로 바꾸고 `/finalize`로 이동하므로, 설계·평가 전체 패스 및 인터뷰 요약 페이지 이동 요구사항과 다르다.
- 설계 완료 후 평가 진입도 같은 `decision='skip'`을 재사용한다. 인터뷰 직후의 전체 패스와 설계 완료 후 평가 진입은 의미가 다르므로 하나의 동작으로 유지하면 상태 전환 오류가 발생할 수 있다.
- 평가·문서 미리보기·Markdown 내보내기에는 별도 크레딧 차감이 없어 설계와 평가를 한 세트로 처리하는 부분은 이미 요구사항에 맞는다.

### DB 변경 방향 — `012_phase_credit_charges.sql`
이미 적용된 `011` 파일은 수정하지 않는다. 새 `012` 마이그레이션에서 다음을 수행한다.

1. `projects.interview_credit_charged_at TIMESTAMPTZ` 컬럼을 추가한다.
   - `NULL`: 이 프로젝트의 인터뷰는 아직 미차감.
   - 값 있음: 인터뷰 차감 완료. 재접속해도 다시 차감하지 않음.
   - 기존 `projects.credit_charged_at`은 설계·평가 세트의 차감 표시로 계속 사용한다.
2. `start_interview_atomic(project_id, user_id, bypass_limit)` RPC를 추가한다.
   - 프로젝트와 사용자 행을 `SELECT ... FOR UPDATE`로 잠근다.
   - 프로젝트 소유권·삭제 여부를 확인한다.
   - 인터뷰가 이미 차감됐으면 `charged=false`로 성공 반환한다.
   - 최초 인터뷰이면 최신 `credits_used`와 플랜 한도를 확인한다.
   - `users.credits_used = credits_used + 1`과 `projects.interview_credit_charged_at = NOW()`를 같은 트랜잭션에서 처리한다.
   - 어느 한 작업이라도 실패하면 두 변경을 모두 롤백한다.
3. 기존 인터뷰 세션이 있는 프로젝트는 재접속 시 갑자기 차감되지 않도록 `interview_credit_charged_at`을 기존 세션 생성 시각으로 백필한다. 기존 `credits_used`는 소급 증가시키지 않는다.
4. `set_design_decision_atomic`은 `CREATE OR REPLACE FUNCTION`으로 교체한다.
   - `design`: 기존처럼 설계 최초 진입만 1회 차감하고 `designing`으로 전환한다.
   - `skip`: 설계·평가 세트를 모두 건너뛰고 차감 없이 문서 결과를 볼 수 있는 종료 상태로 전환한다.
5. 신규/교체 RPC는 브라우저에서 직접 실행하지 못하도록 `PUBLIC`·`anon`·`authenticated` 권한을 회수하고 `service_role`에만 실행 권한을 부여한다.

### 적용한 수정 (2026-07-20, 1·2단계)
- **계약 테스트** `backend/tests/test_phase_credit_charges.py`: 인터뷰 차감 도장·기존 세션 백필·프로젝트→사용자 행 잠금 순서·한도 검사·완료 인터뷰 선행 조건·`skip → completed`·설계 차감 도장·RPC 실행 권한·브라우저 직접 쓰기 차단을 검증하는 테스트 6개 추가.
- **DB 마이그레이션 초안** `supabase/migrations/012_phase_credit_charges.sql`: `interview_credit_charged_at` 추가, 기존 인터뷰 세션 최초 생성 시각 백필(사용량 소급 증가 없음), `start_interview_atomic` 신규 추가, `set_design_decision_atomic` 단계별 정책으로 교체, 두 RPC의 `service_role` 전용 권한 설정. 브라우저 역할(`anon`·`authenticated`)이 `credits_used`·상태·차감 도장·세션을 직접 위조하지 못하도록 `public` 테이블 쓰기 권한과 이후 기본 쓰기 권한도 회수한다.
- **추가 방어**: 인터뷰 최초 차감은 `in_progress` 프로젝트에서만 허용하고, 설계 진행/패스 결정은 완료된 인터뷰 세션이 있을 때만 허용한다.
- **검증**: 전체 백엔드 테스트 87개 통과. 로컬 PostgreSQL/Docker 미실행 상태이므로 실제 SQL 실행·동시성 검증은 아직 수행하지 않았다.

### 백엔드 변경 방향 → ✅ 구현 완료 (2026-07-20, 3단계)
1. `POST /api/interview/start`가 Claude를 호출하기 전에 `start_interview_atomic`을 호출한다.
   - 한도를 소진했으면 403을 반환하고 Claude 비용을 발생시키지 않는다.
   - Claude 첫 질문 생성이 실패해 사용자가 재시도해도 인터뷰 크레딧은 다시 차감하지 않는다.
2. 인터뷰 직후 설계 여부 결정은 기존 `POST /api/projects/{project_id}/design-decision`을 사용한다.
   - `design`: 설계·평가 세트 1회 차감.
   - `skip`: 추가 차감 없이 요약 문서 단계로 종료.
3. 설계 완료 후 평가 진입은 별도 `POST /api/projects/{project_id}/enter-evaluation` API로 분리한다.
   - 로그인 사용자와 프로젝트 소유권을 확인한다.
   - 현재 프로젝트가 `designing` 상태인지 확인한다.
   - 프로젝트 상태만 `evaluating`으로 변경하고 크레딧은 변경하지 않는다.

### 적용한 수정 (2026-07-20, 3단계)
- **공통 RPC 처리** `backend/app/api/_shared.py`: 크레딧 한도·프로젝트/사용자 없음·인터뷰 미완료·잘못된 프로젝트 상태 오류를 403/404/409로 일관되게 변환하고 `{project, charged}` 응답을 검증한다.
- **인터뷰 시작** `backend/app/api/interview.py`: 프로젝트 조회/Claude 호출보다 먼저 `start_interview_atomic`을 호출한다. 한도·상태 오류 시 Claude를 호출하지 않고, 차감 후 Claude가 실패해도 같은 프로젝트 재시도는 DB 도장으로 추가 차감되지 않는다.
- **평가 진입** `backend/app/api/projects.py`: `POST /{project_id}/enter-evaluation` 추가. 소유권·삭제 여부·`designing` 상태·설계 차감 도장을 확인하고 상태만 조건부 갱신하며, 이미 `evaluating`이면 성공 반환해 재시도에 안전하다.
- **유료 단계 서버 가드** `backend/app/api/design.py`·`finalize.py`: 설계 생성 5개 API는 `designing + credit_charged_at`, 평가/완료 생성은 `evaluating|completed + credit_charged_at`을 요구한다. 기존 평가 API가 `in_progress/designing`을 스스로 `evaluating`으로 올리던 우회 경로는 제거했다.
- **API 회귀 테스트**: 인터뷰 한도 소진 시 Claude 미호출, Claude 실패 재시도 1회 차감, 설계 생성 5개 우회 차단, 평가 진입 무차감·멱등성, 무차감/잘못된 상태/타 사용자 접근 차단을 자동화했다.

### 프론트엔드 변경 방향
1. `InterviewPage`의 `설계 진행`은 기존처럼 `/projects/{id}/design`으로 이동한다.
2. `InterviewPage`의 `건너뛰기`는 `/projects/{id}/finalize`가 아니라 `/projects/{id}/document`로 이동한다.
3. `DesignPage`의 설계 완료 동작은 `decision='skip'`을 보내지 않고 신규 `enter-evaluation` API를 호출한 뒤 `/projects/{id}/finalize`로 이동한다.
4. `MyProjectsPage`에서 완료 프로젝트를 다시 열 때 `/finalize`가 아니라 `/document`로 이동해 결과와 Markdown 다운로드를 바로 제공한다.
5. 기존 `DocumentPreviewPage`와 `GET /api/projects/{project_id}/export/markdown`을 재사용하므로 별도 다운로드 기능은 새로 만들지 않는다.

### 적용한 수정 (2026-07-20, 4단계)
- **인터뷰 분기** `InterviewPage.tsx`: `design`은 설계 화면, `skip`은 평가를 거치지 않고 문서 화면으로 이동한다. 인터뷰 시작 요청과 설계 결정 요청 뒤 사용자 프로필을 다시 조회해 차감된 크레딧이 다음 화면과 프로젝트 목록에 즉시 반영된다.
- **단계별 재접속**: 인터뷰 URL로 설계·평가·완료 프로젝트를 열면 각각 현재 설계·평가·문서 화면으로 교정한다. `FinalizePage`도 `designing` 상태를 직접 허용하지 않고 설계 화면으로 되돌려 평가 진입 API 우회를 막는다.
- **평가 진입 분리** `DesignPage.tsx`: 기존 `decision='skip'` 재사용을 제거하고 `POST /projects/{id}/enter-evaluation` 성공 후에만 평가 화면으로 이동한다. 실패 시 현재 화면과 오류/재시도를 유지하고, 완료된 설계 세션 재접속도 완료 화면에서 같은 전환을 거친다.
- **완료 프로젝트** `MyProjectsPage.tsx`: 프로젝트명 클릭과 `결과 보기`가 모두 `/document`를 열도록 통일했다. 목록 진입 때 프로필을 갱신하며, 프로필 갱신 함수는 안정적인 콜백으로 고정해 재렌더링에 따른 인터뷰 시작 재호출을 방지했다.
- **안내 문구·중복 클릭 방지**: 인터뷰 선택 화면에 설계·평가 세트 1크레딧/패스 추가 차감 없음을 표시하고, 설계→평가 이동 중 버튼을 잠근다. 기존 “인터뷰 무제한” 안내도 단계별 과금 정책에 맞게 교체했다.
- **프론트 계약 테스트** `backend/tests/test_phase_credit_frontend_contract.py`: 인터뷰 분기, 전용 평가 API, 완료 설계 재접속, 완료 프로젝트 문서 경로, 평가 우회 차단, 과금 문구 계약 6개를 추가했다.
- **검증**: 전체 백엔드/계약 테스트 **93개 통과**, `npx tsc -b` 통과, `npx vite build --configLoader native` 프로덕션 번들 성공. 기본 ESLint 전체 실행은 이번 변경 전부터 존재한 React Hooks/`any` 규칙 오류로 실패하며, 이번 변경 범위에서 새 타입 오류는 없다.
- **DB 적용**: 사용자 확인 기준 `012_phase_credit_charges.sql` 실제 Supabase 적용 완료. 실제 Supabase를 대상으로 한 동시 요청/E2E 검증은 아직 수행하지 않았다.

### 오류·재시도 정책
- 인터뷰 차감 RPC가 실패하면 인터뷰를 시작하지 않는다.
- 크레딧 차감이 성공한 뒤 Claude 호출이 실패하면 차감 표시는 유지한다. 같은 프로젝트의 재시도에서는 추가 차감 없이 Claude 호출만 다시 수행한다.
- 설계 진입 요청을 여러 번 보내도 `credit_charged_at`으로 프로젝트당 1회만 차감한다.
- 평가 진입·문서 조회·Markdown 다운로드는 크레딧을 변경하지 않는다.

### 실제 Supabase 동시성 검증 (2026-07-21, 5단계)
- **자동화**: `backend/tests/integration/test_supabase_credit_concurrency.py`에 `RUN_SUPABASE_INTEGRATION=1` opt-in 테스트 4개를 추가했다. 기본 단위 테스트에서는 실제 DB 쓰기를 막기 위해 skip한다.
- **같은 프로젝트**: 인터뷰 병렬 요청 2개와 설계 병렬 요청 2개에서 각 단계별 `charged`가 정확히 `true` 1건·`false` 1건이었고, 최종 `credits_used=2`를 확인했다. 설계 재시도도 추가 차감하지 않았다.
- **서로 다른 프로젝트**: 잔여 1크레딧 상태의 인터뷰 경쟁과 설계 경쟁에서 각각 하나만 성공하고 다른 하나는 `CREDIT_LIMIT_EXCEEDED:2`로 거부됐다. 최종 사용량은 한도 2를 넘지 않았고 거부된 프로젝트는 변경되지 않았다.
- **패스**: 완료 인터뷰 후 `skip`과 재시도 모두 무차감이며 프로젝트가 `completed`로 유지됐다.
- **격리·정리**: 테스트별 고유 사용자·프로젝트를 사용했고 fixture가 인터뷰 세션→프로젝트→사용자 순서로 삭제한 뒤 잔존 행 0건을 검증했다.
- **결과**: 실제 Supabase 통합 테스트 4개 통과, 기본 백엔드 회귀 테스트 143개 통과·통합 테스트 4개 안전 skip.

### 테스트 계획
- 신규 프로젝트의 첫 `/api/interview/start` → `credits_used` 정확히 +1, `interview_credit_charged_at` 기록.
- 같은 프로젝트 인터뷰 시작 요청 2개 동시 실행 → 인터뷰 차감은 정확히 1회.
- 인터뷰 새로고침·재접속·재시도·resume → 추가 차감 없음.
- 인터뷰 한도 소진 → 403, 인터뷰 세션 및 Claude 호출 없음, DB 변경 없음.
- 인터뷰 완료 후 `design` → `credits_used` 추가 +1, 전체 누적 2회.
- 설계 재진입 → 추가 차감 없음.
- 설계 완료 후 평가 진입 → 상태만 `evaluating`, 사용량 변화 없음.
- 인터뷰 완료 후 `skip` → 사용량 변화 없음, 문서 페이지 이동, 인터뷰 요약 Markdown 다운로드 성공.
- 전체 흐름 완료 → 인터뷰 1회 + 설계·평가 1회로 총 2회.
- 기존 인터뷰 세션 보유 프로젝트 재접속 → 소급 또는 중복 차감 없음.
- 다른 사용자의 프로젝트 ID로 인터뷰·설계·평가 상태 변경 요청 → 404, 사용량과 프로젝트 모두 변경 없음.

### 완료 조건
- ✅ 인터뷰와 설계·평가 세트가 서로 독립적인 프로젝트별 차감 표시를 가진다.
- ✅ 각 단계는 최초 진입 시에만 1회 차감되고 새로고침·재접속·동시 요청으로 중복 차감되지 않는다.
- ✅ 인터뷰만 사용하면 1회, 전체 과정을 사용하면 정확히 2회 차감된다.
- ✅ 설계·평가 패스 사용자가 무차감·완료 상태로 인터뷰 요약 문서와 Markdown 다운로드까지 바로 이동한다 (Phase 9 Step 7 TC-017, 실제 Supabase 브라우저 검증).
- ✅ 설계 완료 후 평가 진입에는 추가 차감이 없다(백엔드·프론트 계약 테스트).
- ✅ 신규 단위·API 테스트와 실제 Supabase 동시성 검증이 통과한다.
