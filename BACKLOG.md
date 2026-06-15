# Backlog

프로젝트 진행 중 발견한 개선/수정 항목을 기록한다. (생성: 2026-06-15)

---

## BL-001 · 설계 단계가 "미확정 AI 모델"을 임의로 확정함 🟡

**상태**: 코드·프롬프트 수정 완료 (2026-06-15). 신규 생성부터 적용. 기존 데이터 보정은 미결.
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

### 미결정 사항
- 기존 "등기부등본 AI 해석기" 프로젝트 데이터(`design_sessions.ai_workflow.model = "OpenAI GPT-4"`, 아키텍처 AI 컴포넌트 technology): 근본 수정은 신규 생성부터 적용됨. 기존 건은 (1) 설계 재생성 또는 (2) 1회 수동 보정 필요 — 진행 여부 결정 대기.

---

## BL-002 · `.claude/skills`와 `backend/skills` 불일치 (sync_harness 무용/위험) 🟡

**상태**: 발견 (2026-06-15)
**관련 영역**: `scripts/sync_harness.py`, `.claude/skills/*`, `backend/skills/*`, README

### 문제
README·설계상 `sync_harness.py`가 `.claude/skills` → `backend/skills`를 동기화하는 것으로 되어 있으나, 실제 두 곳의 내용이 **완전히 다름**:
- `.claude/skills/design-architecture/SKILL.md` = 옛 CLI 하네스 워크플로우(v2.0, 파일 기반 `_kickoff.md` 섹션 편집).
- `backend/skills/design-architecture.md` = API용 JSON 출력 프롬프트(런타임 `load_skill`이 사용).

즉 런타임 프롬프트는 `.claude/skills`에서 생성된 게 아니라 별도 수기 관리되어 디버전됨. `sync_harness.py`를 돌리면 런타임 프롬프트가 옛 CLI 버전으로 덮여 **AI 인터뷰/설계가 깨짐**.

### 해결 방향(택1)
- (A) `backend/skills`를 단일 진실 공급원으로 확정하고 `sync_harness.py` 및 README의 동기화 서술 제거/수정.
- (B) `.claude/skills`의 API용 변형을 별도 디렉터리로 정리하고 sync 대상을 그쪽으로 한정.
