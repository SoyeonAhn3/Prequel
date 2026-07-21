"""Phase 6 — Evaluation & Finalization API.

Four chat-driven steps run in sequence, each building on the previous result:
    evaluate -> done -> gap -> checklist
Mirrors design.py's generate pattern; shared helpers come from _shared.py.
"""
import json

import structlog
from fastapi import APIRouter, Depends, HTTPException

from app.api._shared import (
    FINALIZE_STEP_COLS,
    get_design_context,
    get_interview_context,
    parse_json_response,
    pick_canonical_session,
    require_owned_session,
)
from app.core.claude_client import chat
from app.core.usage import record_token_usage
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


def _require_evaluation_access(sb, project_id: str, user_id: str) -> dict:
    """Require the paid design/evaluation set before AI finalize generation."""
    project = _verify_project(sb, project_id, user_id)
    if (
        project.get("status") not in ("evaluating", "completed")
        or not project.get("credit_charged_at")
    ):
        raise HTTPException(
            status_code=409,
            detail="설계·평가 단계 진입 후 평가를 생성할 수 있습니다.",
        )
    return project


def _get_or_create_finalize_session(
    sb,
    project_id: str,
    user_id: str,
) -> tuple[dict, dict]:
    """Authorize the project, then return it with its canonical finalize session.

    Reuses the session holding the most step content (see pick_canonical_session)
    so re-running a step updates the existing row instead of forking a new one. The
    checklist step flips status to "completed", which the old in_progress-only
    filter could not reuse — the same duplicate-row bug fixed in design.

    Authorization deliberately happens before any session lookup or insert so
    this helper remains safe even if a future caller omits an outer access check.
    """
    project = _require_evaluation_access(sb, project_id, user_id)
    existing = (
        sb.table("finalize_sessions")
        .select("*")
        .eq("project_id", project_id)
        .order("created_at", desc=True)
        .execute()
    )
    canonical = pick_canonical_session(existing.data, FINALIZE_STEP_COLS)
    if canonical:
        return project, canonical

    new_session = (
        sb.table("finalize_sessions")
        .insert({
            "project_id": project_id,
            "current_step": "evaluate",
            "status": "in_progress",
        })
        .execute()
    )
    return project, new_session.data[0]


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

    record_token_usage(project["user_id"], project_id, usage)
    logger.info(
        "finalize_completed",
        project_id=project_id,
        tokens=usage.get("input_tokens", 0) + usage.get("output_tokens", 0),
    )


def _generate(step: str, body: FinalizeGenerateRequest, user: dict) -> FinalizeSessionOut:
    cfg = STEP_CONFIG[step]
    sb = get_supabase()
    project, session = _get_or_create_finalize_session(
        sb, body.project_id, user["id"]
    )

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

    # BL-017: 평가·빈틈은 8192 토큰 + 깊은 분석(BL-018)이라 60초를 넘길 수 있음.
    text, usage = chat(system, messages, max_tokens=8192, timeout=180.0)
    parsed = parse_json_response(text)

    updates = {cfg["column"]: parsed, "current_step": cfg["next"]}
    sb.table("finalize_sessions").update(updates).eq("id", session["id"]).execute()
    session.update(updates)

    if step == "checklist":
        _finalize_complete(sb, project, body.project_id, session)

    record_token_usage(user["id"], body.project_id, usage)
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


@router.post("/complete", response_model=FinalizeSessionOut)
async def complete_finalize(body: FinalizeGenerateRequest, user: dict = Depends(get_current_user)):
    """Idempotent finalize completion (BL-016).

    Runs final-document generation and marks the project + session completed.
    Safe to retry: if a prior completion failed *after* the checklist was saved
    (e.g. the doc-gen Claude call timed out), the project was stranded in
    'evaluating' with no kickoff_doc and no way to finish — the checklist step no
    longer auto-generates because its content already exists. This re-runs only
    the completion, without regenerating the checklist.
    """
    sb = get_supabase()
    project, session = _get_or_create_finalize_session(
        sb, body.project_id, user["id"]
    )
    if not session.get("checklist"):
        raise HTTPException(status_code=400, detail="착수 체크리스트까지 먼저 생성해주세요.")
    _finalize_complete(sb, project, body.project_id, session)
    return _finalize_to_out(session)


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
        .execute()
    )
    canonical = pick_canonical_session(result.data, FINALIZE_STEP_COLS)
    if not canonical:
        raise HTTPException(status_code=404, detail="Finalize session not found")
    return _finalize_to_out(canonical)


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
    require_owned_session(sb, "finalize_sessions", session_id, user["id"])
    result = (
        sb.table("finalize_sessions")
        .update({column: body.data})
        .eq("id", session_id)
        .execute()
    )
    if not result.data:
        raise HTTPException(status_code=404, detail="Finalize session not found")
    return _finalize_to_out(result.data[0])
