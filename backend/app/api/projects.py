from datetime import datetime, timezone

import structlog
from fastapi import APIRouter, Depends, HTTPException

from app.config import settings
from app.core.doc_engine import generate_kickoff_document
from app.core.supabase import get_supabase
from app.middleware.auth import get_current_user
from app.schemas.project import ProjectCreate, ProjectOut, ProjectUpdate, DesignDecisionRequest

logger = structlog.get_logger()

router = APIRouter(prefix="/api/projects", tags=["projects"])

PLAN_LIMITS = {"free": 2, "basic": 10, "pro": 30, "admin": 999999}


def _check_credits(user: dict):
    if settings.DEV_BYPASS_AUTH:
        return
    plan = user.get("plan", "free")
    if plan == "admin" or user.get("role") == "admin":
        return
    limit = PLAN_LIMITS.get(plan, 2)
    used = user.get("credits_used", 0)
    if used >= limit:
        raise HTTPException(
            status_code=403,
            detail=f"사용 횟수({limit}회)를 모두 소진했습니다. 유료 플랜으로 업그레이드하세요.",
        )


def _increment_credits(user_id: str):
    sb = get_supabase()
    user = sb.table("users").select("credits_used").eq("id", user_id).single().execute()
    current = user.data.get("credits_used", 0)
    sb.table("users").update({"credits_used": current + 1}).eq("id", user_id).execute()


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

    # Never move a finished project backwards. Re-entering design/skip on a
    # completed kickoff must not downgrade its status (or re-charge credits).
    if existing.data["status"] == "completed":
        return existing.data

    if body.decision == "design":
        _check_credits(user)

    new_status = "designing" if body.decision == "design" else "evaluating"
    result = (
        sb.table("projects")
        .update({"status": new_status})
        .eq("id", project_id)
        .execute()
    )

    if body.decision == "design":
        _increment_credits(user["id"])

    logger.info(
        "design_decision_set",
        project_id=project_id,
        decision=body.decision,
        new_status=new_status,
    )
    return result.data[0]


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
