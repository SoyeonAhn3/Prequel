"""Phase 6 — Evaluation & Finalization API.

Four chat-driven steps run in sequence, each building on the previous result:
    evaluate -> done -> gap -> checklist
Mirrors design.py's generate pattern; shared helpers come from _shared.py.
"""
import json

import structlog
from fastapi import APIRouter, Depends, HTTPException

from app.api._shared import (
    get_design_context,
    get_interview_context,
    parse_json_response,
)
from app.core.claude_client import chat
from app.core.doc_engine import generate_final_document
from app.core.harness_loader import load_skill
from app.core.supabase import get_supabase
from app.middleware.auth import get_current_user
from app.schemas.finalize import (
    FinalizeGenerateRequest,
    FinalizeSessionOut,
    FinalizeUpdateRequest,
)

logger = structlog.get_logger()

router = APIRouter(prefix="/api/finalize", tags=["finalize"])

# step -> (skill file, result column, next step)
STEP_CONFIG = {
    "evaluate":  {"skill": "kickoff-evaluate",  "column": "evaluation",    "next": "done"},
    "done":      {"skill": "kickoff-done",      "column": "done_criteria", "next": "gap"},
    "gap":       {"skill": "kickoff-gap",       "column": "gaps",          "next": "checklist"},
    "checklist": {"skill": "kickoff-checklist", "column": "checklist",     "next": "checklist"},
}

_STEP_ORDER = ["evaluate", "done", "gap", "checklist"]
_STEP_LABELS = {
    "evaluate": "정직한 평가",
    "done": "완료 조건",
    "gap": "빈틈 점검",
    "checklist": "착수 체크리스트",
}


# ─── Helpers ──────────────────────────────────────────────

def _verify_project(sb, project_id: str, user_id: str) -> dict:
    project = (
        sb.table("projects")
        .select("*")
        .eq("id", project_id)
        .eq("user_id", user_id)
        .is_("deleted_at", "null")
        .maybe_single()
        .execute()
    )
    if not project.data:
        raise HTTPException(status_code=404, detail="Project not found")
    return project.data


def _get_or_create_finalize_session(project_id: str) -> dict:
    sb = get_supabase()
    result = (
        sb.table("finalize_sessions")
        .select("*")
        .eq("project_id", project_id)
        .eq("status", "in_progress")
        .order("created_at", desc=True)
        .limit(1)
        .execute()
    )
    if result.data:
        return result.data[0]

    new_session = (
        sb.table("finalize_sessions")
        .insert({
            "project_id": project_id,
            "current_step": "evaluate",
            "status": "in_progress",
        })
        .execute()
    )
    return new_session.data[0]


def _finalize_to_out(session: dict) -> FinalizeSessionOut:
    return FinalizeSessionOut(
        id=session["id"],
        project_id=session["project_id"],
        current_step=session.get("current_step", "evaluate"),
        evaluation=session.get("evaluation"),
        done_criteria=session.get("done_criteria"),
        gaps=session.get("gaps"),
        checklist=session.get("checklist"),
        status=session.get("status", "in_progress"),
    )


def _prior_results_context(session: dict, step: str) -> str:
    """Accumulate earlier steps' results so each step sees the prior ones."""
    idx = _STEP_ORDER.index(step)
    parts = []
    for prev in _STEP_ORDER[:idx]:
        col = STEP_CONFIG[prev]["column"]
        val = session.get(col)
        if val:
            parts.append(
                f"\n\n## 이전 단계 — {_STEP_LABELS[prev]}\n"
                f"```json\n{json.dumps(val, ensure_ascii=False)}\n```"
            )
    return "".join(parts)


def _finalize_complete(sb, project: dict, project_id: str, session: dict) -> None:
    """After checklist: generate doc v3, mark project + session completed.
    Credits are NOT deducted here — they were already charged at interview start
    and design start. Phase 6 (evaluation/finalization) does not charge."""
    interview = (
        sb.table("interview_sessions")
        .select("*")
        .eq("project_id", project_id)
        .eq("status", "completed")
        .order("created_at", desc=True)
        .limit(1)
        .execute()
    )
    interview_data = interview.data[0] if interview.data else {"messages": []}
    design_ctx = get_design_context(project_id)

    doc_text, usage = generate_final_document(project, interview_data, session, design_ctx)

    sb.table("projects").update(
        {"kickoff_doc": doc_text, "status": "completed"}
    ).eq("id", project_id).execute()
    sb.table("finalize_sessions").update(
        {"status": "completed"}
    ).eq("id", session["id"]).execute()
    session["status"] = "completed"

    logger.info(
        "finalize_completed",
        project_id=project_id,
        tokens=usage.get("input_tokens", 0) + usage.get("output_tokens", 0),
    )


def _generate(step: str, body: FinalizeGenerateRequest, user: dict) -> FinalizeSessionOut:
    cfg = STEP_CONFIG[step]
    sb = get_supabase()
    project = _verify_project(sb, body.project_id, user["id"])
    session = _get_or_create_finalize_session(body.project_id)

    # Entering evaluation moves the project from designing/in_progress to evaluating.
    if step == "evaluate" and project.get("status") not in ("evaluating", "completed"):
        sb.table("projects").update({"status": "evaluating"}).eq("id", body.project_id).execute()

    interview_ctx = get_interview_context(body.project_id)
    design_ctx = get_design_context(body.project_id)
    prior_ctx = _prior_results_context(session, step)
    skill_text = load_skill(cfg["skill"])

    design_block = f"\n\n{design_ctx}" if design_ctx else ""
    user_message = (
        f"프로젝트명: {project['name']}\n"
        f"프로젝트 유형: {project.get('project_type', '미정')}\n"
        f"설명: {project.get('description', '')}\n\n"
        f"{interview_ctx}{design_block}{prior_ctx}"
    )

    system = [{"type": "text", "text": skill_text, "cache_control": {"type": "ephemeral"}}]
    messages = [{"role": "user", "content": user_message}]

    text, usage = chat(system, messages, max_tokens=8192)
    parsed = parse_json_response(text)

    updates = {cfg["column"]: parsed, "current_step": cfg["next"]}
    sb.table("finalize_sessions").update(updates).eq("id", session["id"]).execute()
    session.update(updates)

    if step == "checklist":
        _finalize_complete(sb, project, body.project_id, session)

    logger.info(
        "finalize_step_generated",
        step=step,
        project_id=body.project_id,
        tokens=usage.get("input_tokens", 0) + usage.get("output_tokens", 0),
    )
    return _finalize_to_out(session)


# ─── Generate endpoints ───────────────────────────────────

@router.post("/evaluate", response_model=FinalizeSessionOut)
async def generate_evaluate(body: FinalizeGenerateRequest, user: dict = Depends(get_current_user)):
    return _generate("evaluate", body, user)


@router.post("/done", response_model=FinalizeSessionOut)
async def generate_done(body: FinalizeGenerateRequest, user: dict = Depends(get_current_user)):
    return _generate("done", body, user)


@router.post("/gap", response_model=FinalizeSessionOut)
async def generate_gap(body: FinalizeGenerateRequest, user: dict = Depends(get_current_user)):
    return _generate("gap", body, user)


@router.post("/checklist", response_model=FinalizeSessionOut)
async def generate_checklist(body: FinalizeGenerateRequest, user: dict = Depends(get_current_user)):
    return _generate("checklist", body, user)


# ─── Read & update ────────────────────────────────────────

@router.get("/session/{project_id}", response_model=FinalizeSessionOut)
async def get_finalize_session(project_id: str, user: dict = Depends(get_current_user)):
    sb = get_supabase()
    _verify_project(sb, project_id, user["id"])
    result = (
        sb.table("finalize_sessions")
        .select("*")
        .eq("project_id", project_id)
        .order("created_at", desc=True)
        .limit(1)
        .execute()
    )
    if not result.data:
        raise HTTPException(status_code=404, detail="Finalize session not found")
    return _finalize_to_out(result.data[0])


@router.put("/{step}/{session_id}", response_model=FinalizeSessionOut)
async def update_finalize_step(
    step: str,
    session_id: str,
    body: FinalizeUpdateRequest,
    user: dict = Depends(get_current_user),
):
    if step not in STEP_CONFIG:
        raise HTTPException(status_code=400, detail="Invalid step")
    column = STEP_CONFIG[step]["column"]
    sb = get_supabase()
    result = (
        sb.table("finalize_sessions")
        .update({column: body.data})
        .eq("id", session_id)
        .execute()
    )
    if not result.data:
        raise HTTPException(status_code=404, detail="Finalize session not found")
    return _finalize_to_out(result.data[0])
