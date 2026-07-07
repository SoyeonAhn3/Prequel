# Backlog

프로젝트 진행 중 발견한 개선/수정 항목을 기록한다. (생성: 2026-06-15)

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

## BL-003 · 프롬프트 캐싱이 작동 안 함 (인터뷰 토큰 과소비) 🟡

**상태**: 🟡 구조 수정 완료(방향 A) — **단, Phase 1 측정 결과 캐시 prefix가 1024 토큰 미만이라 캐싱 미작동.** 실제 절감은 방향 B(메시지 이력 캐싱) 필요.

### 적용한 수정 (2026-07-01, 방향 A · 시스템 프롬프트 재구조화)
`build_system_prompt`(`prompt_manager.py`)를 캐시 friendly 구조로 재배치. 시그니처·반환 타입(list[dict]) 불변이라 호출부(`interview.py` 2곳) 영향 없음.
- **캐시 블록 1** (`cache_control`) = 인터뷰 내내 불변인 것만: 역할 + 규칙 + project_name/type + 응답형식 JSON 스펙.
- **캐시 블록 2** (`cache_control`, 2번째 breakpoint) = `step_content`(현재 단계 스킬 섹션). 기존엔 유일 breakpoint *뒤*라 아예 캐시 안 됐음(원인 ②) → 이제 한 step 내 모든 턴에서 read 적중.
- **블록 3** (캐시 X) = 누적 `insights`를 breakpoint *뒤* 별도 블록으로 분리. 매 답변마다 커지지만 앞의 안정 prefix를 더 이상 무효화하지 않음(원인 ① 해소).
- 로컬 구조 검증: 같은 step 두 턴에서 블록0·블록1 바이트 동일, 블록2(insights)만 변화, breakpoint 2개 확인.
- 미적용(차기): 원인 ③ 메시지 캐싱(`compress_history`와 상충) / 원인 ⑤ 출력 형식 축소 — 효과 측정 후 판단.

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

### 다음 단계 (방향 B · 메시지 이력 캐싱)
토큰 대부분은 system이 아니라 **대화 이력(messages)** 에 있고 턴이 쌓이며 금방 1024를 넘음. 실제 절감은:
1. 캐시 breakpoint를 **마지막 메시지**(system 아님)에 부여 → system+messages 전체 prefix가 캐시됨.
2. `compress_history`(매 턴 이력 재작성 → prefix 불안정)를 재설계 — 압축 임계 상향 or 안정 prefix + 말미 breakpoint.
   → 토큰 절감(압축) ↔ 캐싱(prefix 유지) 트레이드오프 측정 후 결정.
**발견일**: 2026-06-29
**관련 영역**: `backend/app/core/prompt_manager.py`, `backend/app/api/interview.py`, `backend/app/core/claude_client.py` (부차: `design.py`, `doc_engine.py`)
**대표 사례**: 새 프로젝트를 인터뷰 step4(데이터 소스)까지 진행 → 21회 호출·73,120 토큰. 모델 `claude-sonnet-4-6`. 비용 약 $0.31(≈430원).

### 문제
73.1K 토큰 분해 시 **cache_creation(13,268) > cache_read(5,952)** — 캐시를 *만들기만* 하고 거의 *못 읽음*. 즉 프롬프트 캐싱이 사실상 작동하지 않아 input 45,752 토큰(전체 63%)이 대부분 풀 가격으로 나감. 캐싱이 제대로 되면 이 입력의 상당 부분이 cache_read(입력단가의 0.1배)로 전환되어 흐름 비용이 체감상 절반 이하로 떨어져야 함. (절대 비용은 작으나, 사용자 스케일 시 누적 비효율.)

> 캐싱 원리: 프롬프트는 **prefix 바이트 완전 일치**일 때만 캐시 재사용됨. breakpoint 앞부분이 1바이트라도 바뀌면 그 뒤 전부 무효화.

### 근본 원인 (인과 사슬)
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

### 해결 방향
**A. 인터뷰 시스템 프롬프트 재구조화 (핵심·최대 효과)** — `build_system_prompt`를 prefix 안정 순서로:
  1. **캐시 블록 1** = 전 인터뷰 동안 불변인 것만: 역할 + 규칙 + 응답형식 JSON 스펙 + project_name + project_type. 여기에 `cache_control`.
  2. **캐시 블록 2** = `step_content`(현재 단계 스킬 섹션). 여기에도 `cache_control`(2번째 breakpoint). → 한 step 내 모든 턴에서 read 적중.
  3. **`insights`(누적)는 breakpoint 뒤** 별도 system 블록(캐시 X)으로 분리하거나 마지막 user 메시지로 이동 → 안정 prefix 보존.
**B. 메시지 캐싱(선택)** — `compress_history` 재검토. 캐싱을 살리려면 압축 대신 마지막 assistant 턴 끝에 breakpoint를 두고 이력 유지 + 토큰이 정말 문제일 때만 더 큰 임계에서 압축. 트레이드오프 측정 후 결정.
**C. 효과 검증** — 수정 후 동일 인터뷰 재현 → `response.usage`에서 **cache_read >> cache_creation** 및 풀가격 input 급감 확인. cache_read가 여전히 0이면 silent invalidator 잔존 → 두 호출의 렌더된 prompt 바이트 diff로 추적.
**D. 부차** — design/doc는 현 구조 유지(영향 작음). 여력 시 `doc_engine`의 `생성일`만 캐시 블록 밖으로(경미 개선).

### 완료 조건
동일 step4 인터뷰 재현 시 캐시 적중률 `cache_read / (input + cache_read + cache_creation)` 유의미 상승 + 풀가격 input 토큰 대폭 감소. (Phase 8 S4/S5/S6와 독립된 최적화 항목.)

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

## BL-005 · 법적 페이지 컴플라이언스 후속 (정식 오픈·유료 전환 전) 🟡

**상태**: 발견 (2026-07-01). Phase 9 Step 1에서 약관·개인정보 초안 작성하며 도출. 배포/정식 오픈 전 처리.
**관련 영역**: `frontend/src/content/legal.ts`, `frontend/src/pages/{Terms,Privacy}Page.tsx`, `backend/app/api/admin.py`(`soft_delete_user`), 결제(MVP-2)

### (a) 임시값 → 실제 정보 반영
- **개인정보 보호책임자**: 현재 "Prequel"(임시). 법적으로는 **실명 기재 원칙** → 정식 오픈 전 실명·직책 반영.
- **연락처 이메일**: `support@prequel.io`는 **현재 실제 수신되지 않는 주소**. 실수신 가능한 메일로 교체 필요 (약관·개인정보·로그인 화면 공통).

### (b) 개인정보 완전 파기(hard delete) 기능
- 현재 계정 삭제(`admin.py:soft_delete_user`)는 **soft delete**(`deleted_at` 타임스탬프)만 수행 → 개인정보가 DB에 그대로 잔존, `restore_user`로 복구도 됨.
- 개인정보처리방침의 "파기" 완전 이행을 위해 **물리적 삭제 또는 익명화** 기능 필요. 현재 방침은 "완전 파기는 support 이메일로 요청"으로 우회 표기해 둠.
- 이용자 셀프 계정 삭제 UI 없음(관리자만 가능) → 정식 오픈 시 셀프 삭제/요청 창구 검토.

### (c) 유료 전환(MVP-2) 시 법적 요건
- 결제 도입 시 **사업자등록·통신판매업 신고·사업자정보 표시**(전자상거래법) 의무화 → 약관/방침에 상호·사업자번호·주소 추가.
- 국외 이전(Anthropic·Supabase 미국)은 현재 **고지**만 함 → 정식 서비스는 회원가입 시 **국외이전 명시적 동의** 절차 권장.
- (선택) 만 14세 미만 이용 제한 문구 추가 검토.

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

## BL-008 · 프로젝트 이름·설명 수정 UI 부재 (⋮ 메뉴에 "수정" 추가) 🆕

**상태**: 🆕 대기 (미착수)
**발견일**: 2026-07-07
**관련 영역**: `frontend/src/pages/MyProjectsPage.tsx`(⋮ 행 메뉴), `frontend/src/components/projects/`(수정 모달 신규), 백엔드는 기구현

### 문제
사용자가 프로젝트를 생성한 뒤 **이름·설명을 수정할 방법이 없다.** `/projects` 목록의 ⋮(점 세 개) 메뉴에는 `이어하기 / 설계 이어하기 / 결과 보기(평가 이어하기) / 삭제`만 있고 **"수정"이 없어** 오타나 설명 변경 시 프로젝트를 새로 만들어야 한다.

### 참고 (구현 부담 낮음)
백엔드 `PATCH /api/projects/{id}`(`ProjectUpdate`: `name`/`description`/`project_type`)는 **이미 구현돼 있음** → 프론트 UI만 추가하면 됨.

### 해결 방향
- ⋮ 메뉴에 `수정` 항목 추가 → 이름·설명 편집 모달(생성 모달 2단계 재활용 또는 간단 모달) → `PATCH /projects/{id}` 호출 → 목록 즉시 갱신.
