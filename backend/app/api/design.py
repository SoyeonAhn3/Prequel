import json

import structlog
from fastapi import APIRouter, Depends, HTTPException

from app.core.claude_client import chat
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


def _get_or_create_session(project_id: str, user_id: str) -> dict:
    sb = get_supabase()
    result = (
        sb.table("design_sessions")
        .select("*")
        .eq("project_id", project_id)
        .eq("status", "in_progress")
        .order("created_at", desc=True)
        .limit(1)
        .execute()
    )
    if result.data:
        return result.data[0]

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


def _get_interview_context(project_id: str) -> str:
    sb = get_supabase()
    session = (
        sb.table("interview_sessions")
        .select("*")
        .eq("project_id", project_id)
        .eq("status", "completed")
        .order("created_at", desc=True)
        .limit(1)
        .execute()
    )
    if not session.data:
        raise HTTPException(status_code=400, detail="완료된 인터뷰 세션이 없습니다")

    s = session.data[0]
    messages = s.get("messages", [])
    insights = s.get("insights", [])

    parts = []
    for ins in insights:
        parts.append(f"- {ins.get('label', '')}: {ins.get('value', '')}")

    conversation = []
    for msg in messages[-20:]:
        role = msg.get("role", "user")
        text = msg.get("text", "")
        conversation.append(f"[{role}] {text}")

    return (
        "## 인터뷰 인사이트\n" + "\n".join(parts)
        + "\n\n## 최근 대화 내용\n" + "\n".join(conversation)
    )


def _parse_json_response(text: str) -> dict:
    text = text.strip()
    if text.startswith("```"):
        lines = text.split("\n")
        lines = lines[1:]
        if lines and lines[-1].strip() == "```":
            lines = lines[:-1]
        text = "\n".join(lines)
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        return _repair_truncated_json(text)


def _repair_truncated_json(text: str) -> dict:
    import re
    # find the last successfully closed property (: "value",  or : [...],  or : {...},)
    # by searching backwards for a clean break point
    last_good = -1
    for m in re.finditer(r'(?:,|\{|\[)\s*$', text, re.MULTILINE):
        last_good = m.start()

    # try progressively trimming from the end
    for end in range(len(text), max(len(text) - 2000, 0), -1):
        candidate = text[:end].rstrip()
        # remove trailing comma
        if candidate.endswith(','):
            candidate = candidate[:-1]
        # close open brackets
        opens = candidate.count('{') - candidate.count('}')
        open_arrays = candidate.count('[') - candidate.count(']')
        if opens < 0 or open_arrays < 0:
            continue
        candidate += ']' * open_arrays + '}' * opens
        try:
            return json.loads(candidate)
        except json.JSONDecodeError:
            continue

    raise ValueError("Could not repair truncated JSON response from Claude")


def _session_to_out(session: dict) -> DesignSessionOut:
    return DesignSessionOut(
        id=session["id"],
        project_id=session["project_id"],
        current_step=session.get("current_step", "requirements"),
        requirements=session.get("requirements"),
        architecture=session.get("architecture"),
        data_model=session.get("data_model"),
        ai_workflow=session.get("ai_workflow"),
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
        .limit(1)
        .execute()
    )
    if not result.data:
        raise HTTPException(status_code=404, detail="Design session not found")

    return _session_to_out(result.data[0])


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


# ─── Architecture ─────────────────────────────────────────

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

    proj = project.data
    user_message = (
        f"프로젝트명: {proj['name']}\n"
        f"프로젝트 유형: {proj.get('project_type', '미정')}\n"
        f"설명: {proj.get('description', '')}\n\n"
        f"{context}{requirements_text}"
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
    skill_text = load_skill("design-ai-workflow")

    prev_context = ""
    if session.get("requirements"):
        reqs = session["requirements"]
        prev_context += "\n## 요구사항\n" + "\n".join(
            f"- [{r['priority'].upper()}] {r['text']}" for r in reqs
        )
    if session.get("architecture"):
        arch = session["architecture"]
        prev_context += "\n## 아키텍처\n" + "\n".join(
            f"- {c['name']} ({c['technology']}): {c['description']}" for c in arch.get("components", [])
        )
    if session.get("data_model"):
        dm = session["data_model"]
        prev_context += "\n## 데이터 모델\n" + "\n".join(
            f"- {e['name']}: {e['description']}" for e in dm.get("entities", [])
        )

    proj = project.data
    user_message = (
        f"프로젝트명: {proj['name']}\n"
        f"프로젝트 유형: {proj.get('project_type', '미정')}\n"
        f"설명: {proj.get('description', '')}\n\n"
        f"{prev_context}"
    )

    system = [{"type": "text", "text": skill_text, "cache_control": {"type": "ephemeral"}}]
    messages = [{"role": "user", "content": user_message}]

    text, usage = chat(system, messages, max_tokens=8192)

    sb.table("design_sessions").update({
        "ai_workflow": text,
        "current_step": "ai-workflow",
        "status": "completed",
    }).eq("id", session["id"]).execute()

    session["ai_workflow"] = text
    session["current_step"] = "ai-workflow"
    session["status"] = "completed"

    logger.info(
        "ai_workflow_generated",
        project_id=body.project_id,
        tokens=usage.get("input_tokens", 0) + usage.get("output_tokens", 0),
    )
    return _session_to_out(session)
