from datetime import datetime, timezone

import structlog
from fastapi import APIRouter, Depends, HTTPException

from app.api._shared import raise_credit_rpc_error, unpack_credit_rpc_project
from app.config import settings
from app.core.doc_engine import generate_kickoff_document
from app.core.usage import record_token_usage
from app.core.supabase import get_supabase
from app.middleware.auth import get_current_user
from app.schemas.project import ProjectCreate, ProjectOut, ProjectUpdate, DesignDecisionRequest

logger = structlog.get_logger()

router = APIRouter(prefix="/api/projects", tags=["projects"])

def _raise_design_decision_error(exc: Exception) -> None:
    """Backward-compatible wrapper retained for existing callers/tests."""
    raise_credit_rpc_error(exc)

@router.get("", response_model=list[ProjectOut])
async def list_projects(user: dict = Depends(get_current_user)):
    sb = get_supabase()
    result = (
        sb.table("projects")
        .select("*")
        .eq("user_id", user["id"])
        .is_("deleted_at", "null")
        .order("created_at", desc=True)
        .execute()
    )
    return result.data


@router.get("/{project_id}", response_model=ProjectOut)
async def get_project(
    project_id: str,
    user: dict = Depends(get_current_user),
):
    sb = get_supabase()
    result = (
        sb.table("projects")
        .select("*")
        .eq("id", project_id)
        .eq("user_id", user["id"])
        .is_("deleted_at", "null")
        .maybe_single()
        .execute()
    )
    if not result.data:
        raise HTTPException(status_code=404, detail="Project not found")
    return result.data


@router.post("", response_model=ProjectOut, status_code=201)
async def create_project(
    body: ProjectCreate,
    user: dict = Depends(get_current_user),
):
    sb = get_supabase()
    result = (
        sb.table("projects")
        .insert({
            "user_id": user["id"],
            "name": body.name,
            "description": body.description,
            "language": body.language,
            "status": "in_progress",
            "current_step": 0,
            "total_steps": 11,
        })
        .execute()
    )

    project = result.data[0]
    logger.info("project_created", project_id=project["id"], user_id=user["id"])
    return project


@router.patch("/{project_id}", response_model=ProjectOut)
async def update_project(
    project_id: str,
    body: ProjectUpdate,
    user: dict = Depends(get_current_user),
):
    sb = get_supabase()
    existing = (
        sb.table("projects")
        .select("id, user_id")
        .eq("id", project_id)
        .eq("user_id", user["id"])
        .is_("deleted_at", "null")
        .maybe_single()
        .execute()
    )
    if not existing.data:
        raise HTTPException(status_code=404, detail="Project not found")

    updates = body.model_dump(exclude_none=True)
    if not updates:
        raise HTTPException(status_code=400, detail="No fields to update")

    result = (
        sb.table("projects")
        .update(updates)
        .eq("id", project_id)
        .execute()
    )
    return result.data[0]


@router.post("/{project_id}/design-decision", response_model=ProjectOut)
async def set_design_decision(
    project_id: str,
    body: DesignDecisionRequest,
    user: dict = Depends(get_current_user),
):
    sb = get_supabase()
    try:
        result = sb.rpc(
            "set_design_decision_atomic",
            {
                "p_project_id": project_id,
                "p_user_id": user["id"],
                "p_decision": body.decision,
                "p_bypass_limit": settings.DEV_BYPASS_AUTH,
            },
        ).execute()
    except Exception as exc:
        _raise_design_decision_error(exc)

    project, charged = unpack_credit_rpc_project(result.data)

    logger.info(
        "design_decision_set",
        project_id=project_id,
        decision=body.decision,
        new_status=project.get("status"),
        charged=charged,
    )
    return project


@router.post("/{project_id}/enter-evaluation", response_model=ProjectOut)
async def enter_evaluation(
    project_id: str,
    user: dict = Depends(get_current_user),
):
    """Advance a paid design project into evaluation without another charge.

    Returning an already-evaluating project makes retries safe when the first
    response was lost after the state update committed.
    """
    sb = get_supabase()
    existing = (
        sb.table("projects")
        .select("*")
        .eq("id", project_id)
        .eq("user_id", user["id"])
        .is_("deleted_at", "null")
        .maybe_single()
        .execute()
    )
    if not existing.data:
        raise HTTPException(status_code=404, detail="Project not found")

    project = existing.data
    if (
        project.get("status") in ("designing", "evaluating")
        and not project.get("credit_charged_at")
    ):
        raise HTTPException(
            status_code=409,
            detail="설계·평가 단계의 크레딧 차감이 확인되지 않습니다.",
        )
    if project.get("status") == "evaluating":
        return project
    if project.get("status") != "designing":
        raise HTTPException(
            status_code=409,
            detail="설계 중인 프로젝트만 평가 단계로 이동할 수 있습니다.",
        )
    updated = (
        sb.table("projects")
        .update({"status": "evaluating"})
        .eq("id", project_id)
        .eq("user_id", user["id"])
        .eq("status", "designing")
        .is_("deleted_at", "null")
        .execute()
    )
    if not updated.data:
        # A concurrent successful retry may have performed the transition first.
        current = (
            sb.table("projects")
            .select("*")
            .eq("id", project_id)
            .eq("user_id", user["id"])
            .is_("deleted_at", "null")
            .maybe_single()
            .execute()
        )
        if current.data and current.data.get("status") == "evaluating":
            return current.data
        raise HTTPException(status_code=409, detail="프로젝트 상태가 변경되어 다시 확인이 필요합니다.")

    project = updated.data[0]
    logger.info("evaluation_entered", project_id=project_id, user_id=user["id"])
    return project

@router.post("/{project_id}/generate-doc")
async def generate_doc(
    project_id: str,
    user: dict = Depends(get_current_user),
):
    # No credit charge: credits are consumed at interview/design start, and the
    # live document (preview + Markdown export) is assembled from session data —
    # this endpoint only (re)generates the optional AI-narrative kickoff_doc.
    sb = get_supabase()
    project = (
        sb.table("projects")
        .select("*")
        .eq("id", project_id)
        .eq("user_id", user["id"])
        .is_("deleted_at", "null")
        .maybe_single()
        .execute()
    )
    if not project.data:
        raise HTTPException(status_code=404, detail="Project not found")

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

    doc_text, usage = generate_kickoff_document(project.data, session.data[0])

    sb.table("projects").update({"kickoff_doc": doc_text}).eq("id", project_id).execute()

    record_token_usage(user["id"], project_id, usage)
    logger.info(
        "kickoff_doc_generated",
        project_id=project_id,
        tokens=usage.get("input_tokens", 0) + usage.get("output_tokens", 0),
    )
    return {"kickoff_doc": doc_text, "usage": usage}


@router.delete("/{project_id}")
async def delete_project(
    project_id: str,
    user: dict = Depends(get_current_user),
):
    sb = get_supabase()

    existing = (
        sb.table("projects")
        .select("id, user_id, deleted_at")
        .eq("id", project_id)
        .maybe_single()
        .execute()
    )

    if not existing.data:
        raise HTTPException(status_code=404, detail="Project not found")

    if existing.data["user_id"] != user["id"] and user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")

    if existing.data.get("deleted_at"):
        raise HTTPException(status_code=400, detail="Project already deleted")

    sb.table("projects").update(
        {"deleted_at": datetime.now(timezone.utc).isoformat()}
    ).eq("id", project_id).execute()

    logger.info("project_deleted", project_id=project_id, user_id=user["id"])
    return {"detail": "Project deleted"}
