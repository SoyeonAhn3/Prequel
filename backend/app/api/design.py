import json
import re

import structlog
from fastapi import APIRouter, Depends, HTTPException

from app.api._shared import (
    DESIGN_STEP_COLS,
    get_interview_context as _get_interview_context,
    parse_json_response as _parse_json_response,
    pick_canonical_session,
)
from app.core.claude_client import chat
from app.core.usage import record_token_usage
from app.core.harness_loader import load_skill
from app.core.supabase import get_supabase
from app.middleware.auth import get_current_user
from app.schemas.design import (
    DesignGenerateRequest,
    DesignSessionOut,
    RequirementUpdateRequest,
)

logger = structlog.get_logger()

router = APIRouter(prefix="/api/design", tags=["design"])

# BL-001: detect when the user has NOT committed to a specific AI model/vendor so
# the design steps don't silently concretize an example (e.g. "GPT-4 같은") into a
# locked decision. A line that mentions a model/vendor AND a deferral cue counts.
_MODEL_TOKENS = ("모델", "llm", "gpt", "claude", "gemini", "ai api", "ai 모델",
                 "ai/ml", "ai 분석", "ai 도구", "vendor", "벤더")
_DEFER_TOKENS = ("추후", "미정", "나중", "아직", "결정 안", "정하지", "정할",
                 "추천 받", "추천받", "결정하지", "고민", "모르",
                 "선택 안", "미선택", "안 정", "안 골", "골라", "정해줘")
# A stored model value that itself reads as "undecided" — don't lock these either.
_UNDECIDED_MARKERS = ("추후", "미정", "tbd", "미확정", "결정")


def _model_undecided(context: str) -> bool:
    """True if the interview context shows the AI model/vendor is still open."""
    low = (context or "").lower()
    for line in low.splitlines():
        if any(m in line for m in _MODEL_TOKENS) and any(d in line for d in _DEFER_TOKENS):
            return True
    return False


def _looks_undecided(model: str) -> bool:
    low = (model or "").lower()
    return any(mk in low for mk in _UNDECIDED_MARKERS)


_UNDECIDED_MODEL = "추후 결정"

# Detect the architecture component that IS the AI/ML model/service so its
# technology can seed the AI-workflow model. Short latin tokens MUST match on a
# word boundary — a bare "ai" substring matched "t[ai]lwind"/"r[ai]lway" and
# wrongly cemented the frontend stack as the AI model (it picked the first hit).
_AI_COMPONENT_RE = re.compile(r"\b(?:ai|ml|gpt|claude|llm)\b")
_AI_COMPONENT_KO = ("모델", "추천", "분석", "임베딩")


def _is_ai_component(blob: str) -> bool:
    low = blob.lower()
    return bool(_AI_COMPONENT_RE.search(low)) or any(k in low for k in _AI_COMPONENT_KO)


def _coerce_ai_workflow(value):
    """Older rows stored ai_workflow as a JSON string; the schema expects an
    object. Parse it back (falling back to a summary-only object) so reads don't
    fail validation. Some rows are double-encoded, so json.loads can yield a
    str/list — and a few are double-encoded (json.dumps applied twice). Decode
    repeatedly until we reach a dict so schema validation never sees a bare str.

    Returns None when there is no workflow yet (BL-011): a not-yet-generated
    step is None in the DB, and coercing that to {} made DesignSessionOut fill
    AiWorkflowData defaults, so the frontend saw a truthy (but empty) workflow,
    never auto-generated, and rendered an empty shell. None keeps `!aiWorkflow`
    true so the AI-workflow step generates as intended."""
    if not value:
        return None
    for _ in range(3):
        if not isinstance(value, str):
            break
        try:
            value = json.loads(value)
        except (json.JSONDecodeError, ValueError):
            return {"summary": value}
    if isinstance(value, dict):
        return value or None
    if isinstance(value, str):
        return {"summary": value} if value else None
    return None


def _get_or_create_session(project_id: str, user_id: str) -> dict:
    """Return the project's canonical design session, creating one only if none
    exists yet.

    Reuses the session holding the most step content (see pick_canonical_session).
    Previously this reused only sessions with status == "in_progress"; because the
    ai-workflow step flips status to "completed", re-entering design afterwards
    found no in_progress row and inserted a fresh, mostly-empty session — stranding
    the real data in an older row that readers then ignored. Use
    DELETE /design/session/{id} to start over from scratch.
    """
    sb = get_supabase()
    existing = (
        sb.table("design_sessions")
        .select("*")
        .eq("project_id", project_id)
        .order("created_at", desc=True)
        .execute()
    )
    canonical = pick_canonical_session(existing.data, DESIGN_STEP_COLS)
    if canonical:
        return canonical

    project = (
        sb.table("projects")
        .select("id, user_id")
        .eq("id", project_id)
        .eq("user_id", user_id)
        .is_("deleted_at", "null")
        .maybe_single()
        .execute()
    )
    if not project.data:
        raise HTTPException(status_code=404, detail="Project not found")

    new_session = (
        sb.table("design_sessions")
        .insert({
            "project_id": project_id,
            "current_step": "requirements",
            "status": "in_progress",
        })
        .execute()
    )
    return new_session.data[0]


def _session_to_out(session: dict) -> DesignSessionOut:
    return DesignSessionOut(
        id=session["id"],
        project_id=session["project_id"],
        current_step=session.get("current_step", "requirements"),
        requirements=session.get("requirements"),
        architecture=session.get("architecture"),
        data_model=session.get("data_model"),
        ai_workflow=_coerce_ai_workflow(session.get("ai_workflow")),
        arch_templates=session.get("arch_templates"),
        status=session.get("status", "in_progress"),
    )


@router.get("/session/{project_id}", response_model=DesignSessionOut)
async def get_design_session(
    project_id: str,
    user: dict = Depends(get_current_user),
):
    sb = get_supabase()
    project = (
        sb.table("projects")
        .select("id, user_id")
        .eq("id", project_id)
        .eq("user_id", user["id"])
        .is_("deleted_at", "null")
        .maybe_single()
        .execute()
    )
    if not project.data:
        raise HTTPException(status_code=404, detail="Project not found")

    result = (
        sb.table("design_sessions")
        .select("*")
        .eq("project_id", project_id)
        .order("created_at", desc=True)
        .execute()
    )
    canonical = pick_canonical_session(result.data, DESIGN_STEP_COLS)
    if not canonical:
        raise HTTPException(status_code=404, detail="Design session not found")

    return _session_to_out(canonical)


@router.delete("/session/{project_id}")
async def reset_design_session(
    project_id: str,
    user: dict = Depends(get_current_user),
):
    sb = get_supabase()
    project = (
        sb.table("projects")
        .select("id, user_id")
        .eq("id", project_id)
        .eq("user_id", user["id"])
        .is_("deleted_at", "null")
        .maybe_single()
        .execute()
    )
    if not project.data:
        raise HTTPException(status_code=404, detail="Project not found")

    sb.table("design_sessions").delete().eq("project_id", project_id).execute()
    return {"ok": True}


# ─── Requirements ─────────────────────────────────────────

@router.post("/requirements/generate", response_model=DesignSessionOut)
async def generate_requirements(
    body: DesignGenerateRequest,
    user: dict = Depends(get_current_user),
):
    sb = get_supabase()
    project = (
        sb.table("projects")
        .select("*")
        .eq("id", body.project_id)
        .eq("user_id", user["id"])
        .is_("deleted_at", "null")
        .maybe_single()
        .execute()
    )
    if not project.data:
        raise HTTPException(status_code=404, detail="Project not found")

    session = _get_or_create_session(body.project_id, user["id"])
    context = _get_interview_context(body.project_id)
    skill_text = load_skill("design-requirements")

    proj = project.data
    user_message = (
        f"프로젝트명: {proj['name']}\n"
        f"프로젝트 유형: {proj.get('project_type', '미정')}\n"
        f"설명: {proj.get('description', '')}\n\n"
        f"{context}"
    )

    system = [{"type": "text", "text": skill_text, "cache_control": {"type": "ephemeral"}}]
    messages = [{"role": "user", "content": user_message}]

    text, usage = chat(system, messages, max_tokens=8192)
    parsed = _parse_json_response(text)
    requirements = parsed.get("requirements", [])

    sb.table("design_sessions").update({
        "requirements": requirements,
        "current_step": "requirements",
    }).eq("id", session["id"]).execute()

    session["requirements"] = requirements
    session["current_step"] = "requirements"

    record_token_usage(user["id"], body.project_id, usage)
    logger.info(
        "requirements_generated",
        project_id=body.project_id,
        count=len(requirements),
        tokens=usage.get("input_tokens", 0) + usage.get("output_tokens", 0),
    )
    return _session_to_out(session)


@router.get("/requirements/{session_id}")
async def get_requirements(
    session_id: str,
    user: dict = Depends(get_current_user),
):
    sb = get_supabase()
    result = (
        sb.table("design_sessions")
        .select("requirements")
        .eq("id", session_id)
        .maybe_single()
        .execute()
    )
    if not result.data:
        raise HTTPException(status_code=404, detail="Session not found")
    return {"requirements": result.data.get("requirements", [])}


@router.put("/requirements/{session_id}/{req_id}")
async def update_requirement(
    session_id: str,
    req_id: str,
    body: RequirementUpdateRequest,
    user: dict = Depends(get_current_user),
):
    sb = get_supabase()
    result = (
        sb.table("design_sessions")
        .select("requirements")
        .eq("id", session_id)
        .maybe_single()
        .execute()
    )
    if not result.data:
        raise HTTPException(status_code=404, detail="Session not found")

    requirements = result.data.get("requirements", [])
    updated = False
    for req in requirements:
        if req["id"] == req_id:
            if body.text is not None:
                req["text"] = body.text
            if body.priority is not None:
                req["priority"] = body.priority
            if body.status is not None:
                req["status"] = body.status
            updated = True
            break

    if not updated:
        raise HTTPException(status_code=404, detail="Requirement not found")

    sb.table("design_sessions").update({"requirements": requirements}).eq("id", session_id).execute()
    return {"requirements": requirements}


@router.put("/requirements/{session_id}")
async def replace_requirements(
    session_id: str,
    body: dict,
    user: dict = Depends(get_current_user),
):
    sb = get_supabase()
    requirements = body.get("requirements", [])
    sb.table("design_sessions").update({"requirements": requirements}).eq("id", session_id).execute()
    return {"requirements": requirements}


# ─── Architecture ─────────────────────────────────────────

_TEMPLATE_PROMPT = """\
당신은 소프트웨어 아키텍트입니다. 프로젝트 정보를 바탕으로 가장 적합한 추천 기술 스택 조합 1가지를 생성하세요.

반드시 아래 JSON 형식으로만 응답하세요:
```json
{
  "templates": [
    {
      "title": "조합 이름",
      "badge": "추천",
      "desc": "기술 스택 나열 + 2~3문장 설명. 왜 이 조합이 최적인지, 어떤 상황에 적합한지."
    }
  ]
}
```

규칙:
1. 가장 쉽고 빠른 시작이 가능하면서도 프로젝트 요구에 충분한 조합을 추천
2. 프로젝트 유형과 요구사항에 맞는 실제 기술 스택 추천
3. desc에 구체적 기술 이름 포함 (예: React, FastAPI, Supabase)
4. 한국어로 작성
"""


@router.post("/architecture/templates")
async def generate_arch_templates(
    body: DesignGenerateRequest,
    user: dict = Depends(get_current_user),
):
    sb = get_supabase()
    project = (
        sb.table("projects")
        .select("*")
        .eq("id", body.project_id)
        .eq("user_id", user["id"])
        .is_("deleted_at", "null")
        .maybe_single()
        .execute()
    )
    if not project.data:
        raise HTTPException(status_code=404, detail="Project not found")

    session = _get_or_create_session(body.project_id, user["id"])

    if session.get("arch_templates"):
        return {"templates": session["arch_templates"]}

    context = _get_interview_context(body.project_id)

    requirements_text = ""
    if session.get("requirements"):
        reqs = session["requirements"]
        requirements_text = "\n## 생성된 요구사항\n" + "\n".join(
            f"- [{r['priority'].upper()}] {r['text']}" for r in reqs
        )

    proj = project.data
    user_message = (
        f"프로젝트명: {proj['name']}\n"
        f"프로젝트 유형: {proj.get('project_type', '미정')}\n"
        f"설명: {proj.get('description', '')}\n\n"
        f"{context}{requirements_text}"
    )

    system = [{"type": "text", "text": _TEMPLATE_PROMPT}]
    messages = [{"role": "user", "content": user_message}]

    text, usage = chat(system, messages, max_tokens=1024)
    parsed = _parse_json_response(text)
    templates = parsed.get("templates", [])

    sb.table("design_sessions").update({
        "arch_templates": templates,
    }).eq("id", session["id"]).execute()

    record_token_usage(user["id"], body.project_id, usage)
    logger.info(
        "arch_templates_generated",
        project_id=body.project_id,
        count=len(templates),
        tokens=usage.get("input_tokens", 0) + usage.get("output_tokens", 0),
    )
    return {"templates": templates}


@router.post("/architecture/generate", response_model=DesignSessionOut)
async def generate_architecture(
    body: DesignGenerateRequest,
    user: dict = Depends(get_current_user),
):
    sb = get_supabase()
    project = (
        sb.table("projects")
        .select("*")
        .eq("id", body.project_id)
        .eq("user_id", user["id"])
        .is_("deleted_at", "null")
        .maybe_single()
        .execute()
    )
    if not project.data:
        raise HTTPException(status_code=404, detail="Project not found")

    session = _get_or_create_session(body.project_id, user["id"])
    context = _get_interview_context(body.project_id)
    skill_text = load_skill("design-architecture")

    requirements_text = ""
    if session.get("requirements"):
        reqs = session["requirements"]
        requirements_text = "\n## 생성된 요구사항\n" + "\n".join(
            f"- [{r['priority'].upper()}] {r['text']}" for r in reqs
        )

    template_text = ""
    if body.template_index is not None and session.get("arch_templates"):
        templates = session["arch_templates"]
        if 0 <= body.template_index < len(templates):
            selected = templates[body.template_index]
            template_text = (
                f"\n\n## 선택된 기술 스택 조합\n"
                f"제목: {selected['title']}\n"
                f"설명: {selected['desc']}\n"
                f"이 조합을 기반으로 아키텍처를 설계하세요."
            )

    ai_model_note = ""
    if _model_undecided(context):
        ai_model_note = (
            "\n\n## AI 모델 미확정 (중요)\n"
            "사용자가 사용할 AI 모델/벤더를 아직 확정하지 않았습니다(인터뷰에서 '추후 결정'). "
            "AI/ML 관련 컴포넌트의 technology에 특정 모델/벤더(GPT-4, Claude 등)를 단정하지 말고 "
            "'LLM API (모델 추후 결정)'처럼 미확정 상태로 표기하세요. "
            "사용자가 예시로 든 모델명을 결정으로 간주하지 마세요."
        )

    proj = project.data
    user_message = (
        f"프로젝트명: {proj['name']}\n"
        f"프로젝트 유형: {proj.get('project_type', '미정')}\n"
        f"설명: {proj.get('description', '')}\n\n"
        f"{context}{requirements_text}{template_text}{ai_model_note}"
    )

    system = [{"type": "text", "text": skill_text, "cache_control": {"type": "ephemeral"}}]
    messages = [{"role": "user", "content": user_message}]

    text, usage = chat(system, messages, max_tokens=8192)
    parsed = _parse_json_response(text)

    architecture = {
        "components": parsed.get("components", []),
        "tech_stack": parsed.get("tech_stack", {}),
        "mermaid_code": parsed.get("mermaid_code", ""),
        "integration_notes": parsed.get("integration_notes", ""),
    }

    sb.table("design_sessions").update({
        "architecture": architecture,
        "current_step": "architecture",
    }).eq("id", session["id"]).execute()

    session["architecture"] = architecture
    session["current_step"] = "architecture"

    record_token_usage(user["id"], body.project_id, usage)
    logger.info(
        "architecture_generated",
        project_id=body.project_id,
        components=len(architecture["components"]),
        tokens=usage.get("input_tokens", 0) + usage.get("output_tokens", 0),
    )
    return _session_to_out(session)


@router.get("/architecture/{session_id}")
async def get_architecture(
    session_id: str,
    user: dict = Depends(get_current_user),
):
    sb = get_supabase()
    result = (
        sb.table("design_sessions")
        .select("architecture")
        .eq("id", session_id)
        .maybe_single()
        .execute()
    )
    if not result.data:
        raise HTTPException(status_code=404, detail="Session not found")
    return {"architecture": result.data.get("architecture")}


@router.put("/architecture/{session_id}")
async def update_architecture(
    session_id: str,
    body: dict,
    user: dict = Depends(get_current_user),
):
    sb = get_supabase()
    sb.table("design_sessions").update({"architecture": body}).eq("id", session_id).execute()
    return {"architecture": body}


# ─── Data Model ───────────────────────────────────────────

@router.post("/data-model/generate", response_model=DesignSessionOut)
async def generate_data_model(
    body: DesignGenerateRequest,
    user: dict = Depends(get_current_user),
):
    sb = get_supabase()
    project = (
        sb.table("projects")
        .select("*")
        .eq("id", body.project_id)
        .eq("user_id", user["id"])
        .is_("deleted_at", "null")
        .maybe_single()
        .execute()
    )
    if not project.data:
        raise HTTPException(status_code=404, detail="Project not found")

    session = _get_or_create_session(body.project_id, user["id"])
    context = _get_interview_context(body.project_id)
    skill_text = load_skill("design-data-model")

    prev_context = ""
    if session.get("requirements"):
        reqs = session["requirements"]
        prev_context += "\n## 요구사항\n" + "\n".join(
            f"- [{r['priority'].upper()}] {r['text']}" for r in reqs
        )
    if session.get("architecture"):
        arch = session["architecture"]
        prev_context += "\n## 아키텍처 구성 요소\n" + "\n".join(
            f"- {c['name']} ({c['technology']}): {c['description']}" for c in arch.get("components", [])
        )

    proj = project.data
    user_message = (
        f"프로젝트명: {proj['name']}\n"
        f"프로젝트 유형: {proj.get('project_type', '미정')}\n"
        f"설명: {proj.get('description', '')}\n\n"
        f"{context}{prev_context}"
    )

    system = [{"type": "text", "text": skill_text, "cache_control": {"type": "ephemeral"}}]
    messages = [{"role": "user", "content": user_message}]

    text, usage = chat(system, messages, max_tokens=8192)
    parsed = _parse_json_response(text)

    data_model = {
        "entities": parsed.get("entities", []),
        "mermaid_code": parsed.get("mermaid_code", ""),
        "relationships": parsed.get("relationships", []),
    }

    sb.table("design_sessions").update({
        "data_model": data_model,
        "current_step": "data-model",
    }).eq("id", session["id"]).execute()

    session["data_model"] = data_model
    session["current_step"] = "data-model"

    record_token_usage(user["id"], body.project_id, usage)
    logger.info(
        "data_model_generated",
        project_id=body.project_id,
        entities=len(data_model["entities"]),
        tokens=usage.get("input_tokens", 0) + usage.get("output_tokens", 0),
    )
    return _session_to_out(session)


@router.get("/data-model/{session_id}")
async def get_data_model(
    session_id: str,
    user: dict = Depends(get_current_user),
):
    sb = get_supabase()
    result = (
        sb.table("design_sessions")
        .select("data_model")
        .eq("id", session_id)
        .maybe_single()
        .execute()
    )
    if not result.data:
        raise HTTPException(status_code=404, detail="Session not found")
    return {"data_model": result.data.get("data_model")}


@router.put("/data-model/{session_id}")
async def update_data_model(
    session_id: str,
    body: dict,
    user: dict = Depends(get_current_user),
):
    sb = get_supabase()
    sb.table("design_sessions").update({"data_model": body}).eq("id", session_id).execute()
    return {"data_model": body}


# ─── AI Workflow ──────────────────────────────────────────

@router.post("/ai-workflow/generate", response_model=DesignSessionOut)
async def generate_ai_workflow(
    body: DesignGenerateRequest,
    user: dict = Depends(get_current_user),
):
    sb = get_supabase()
    project = (
        sb.table("projects")
        .select("*")
        .eq("id", body.project_id)
        .eq("user_id", user["id"])
        .is_("deleted_at", "null")
        .maybe_single()
        .execute()
    )
    if not project.data:
        raise HTTPException(status_code=404, detail="Project not found")

    session = _get_or_create_session(body.project_id, user["id"])
    context = _get_interview_context(body.project_id)
    skill_text = load_skill("design-ai-workflow")

    prev_context = ""
    if session.get("requirements"):
        reqs = session["requirements"]
        prev_context += "\n## 요구사항\n" + "\n".join(
            f"- [{r['priority'].upper()}] {r['text']}" for r in reqs
        )
    arch_ai_model = ""
    if session.get("architecture"):
        arch = session["architecture"]
        prev_context += "\n## 아키텍처\n" + "\n".join(
            f"- {c['name']} ({c['technology']}): {c['description']}" for c in arch.get("components", [])
        )
        for c in arch.get("components", []):
            blob = f"{c.get('name', '')} {c.get('technology', '')} {c.get('role', '')}"
            if _is_ai_component(blob):
                arch_ai_model = c.get("technology", "")
                break
    if session.get("data_model"):
        dm = session["data_model"]
        prev_context += "\n## 데이터 모델\n" + "\n".join(
            f"- {e['name']}: {e['description']}" for e in dm.get("entities", [])
        )

    # BL-001: only lock a model that the USER actually confirmed. If the interview
    # shows the model is still open, or the inherited value itself reads as
    # undecided, keep it undecided instead of cementing an example as a decision.
    undecided = _model_undecided(context) or _looks_undecided(arch_ai_model)

    ai_constraint = ""
    if undecided:
        ai_constraint = (
            f"\n\n## AI 모델 미확정 (중요)\n"
            f"사용자가 사용할 AI 모델/벤더를 아직 확정하지 않았습니다. "
            f"model 필드에 특정 모델/벤더(GPT-4, Claude 등)를 단정하지 말고 '{_UNDECIDED_MODEL}'으로 두세요. "
            f"model_version은 빈 문자열로 두세요. 사용자가 예시로 든 모델명을 결정으로 간주하지 마세요."
        )
    elif arch_ai_model:
        ai_constraint = (
            f"\n\n## 확정된 AI 모델 (벤더 유지 + 정규화)\n"
            f"이전 단계(아키텍처)에서 AI 모델은 '{arch_ai_model}'(으)로 결정되었습니다. "
            f"벤더/모델명은 바꾸지 말고 유지하되, model 필드엔 **깔끔한 벤더/모델명만** 넣으세요. "
            f"위 문자열에 'API'·'최신 버전'·기법(프롬프트 엔지니어링)·배포 방식이 섞여 있으면 "
            f"그 부가설명은 제거해 summary로 옮기고, model_version에는 버전만(모호하면 비움) 두세요."
        )

    proj = project.data
    user_message = (
        f"프로젝트명: {proj['name']}\n"
        f"프로젝트 유형: {proj.get('project_type', '미정')}\n"
        f"설명: {proj.get('description', '')}\n\n"
        f"{context}{prev_context}{ai_constraint}"
    )

    system = [{"type": "text", "text": skill_text, "cache_control": {"type": "ephemeral"}}]
    messages = [{"role": "user", "content": user_message}]

    text, usage = chat(system, messages, max_tokens=8192)
    parsed = _parse_json_response(text)

    ai_workflow = {
        "summary": parsed.get("summary", ""),
        "model": _UNDECIDED_MODEL if undecided else (parsed.get("model") or arch_ai_model or ""),
        "model_version": "" if undecided else parsed.get("model_version", ""),
        "task": parsed.get("task", "AI 처리"),
        "inputs": parsed.get("inputs", []),
        "outputs": parsed.get("outputs", []),
        "fallbacks": parsed.get("fallbacks", []),
        "monitoring": parsed.get("monitoring", []),
    }

    sb.table("design_sessions").update({
        "ai_workflow": ai_workflow,
        "current_step": "ai-workflow",
        "status": "completed",
    }).eq("id", session["id"]).execute()

    session["ai_workflow"] = ai_workflow
    session["current_step"] = "ai-workflow"
    session["status"] = "completed"

    record_token_usage(user["id"], body.project_id, usage)
    logger.info(
        "ai_workflow_generated",
        project_id=body.project_id,
        tokens=usage.get("input_tokens", 0) + usage.get("output_tokens", 0),
    )
    return _session_to_out(session)
