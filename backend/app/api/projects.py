from datetime import datetime, timezone

import structlog
from fastapi import APIRouter, Depends, HTTPException

from app.core.supabase import get_supabase
from app.middleware.auth import get_current_user
from app.schemas.project import ProjectCreate, ProjectOut

logger = structlog.get_logger()

router = APIRouter(prefix="/api/projects", tags=["projects"])

FREE_QUOTA_LIMIT = 2


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


@router.post("", response_model=ProjectOut, status_code=201)
async def create_project(
    body: ProjectCreate,
    user: dict = Depends(get_current_user),
):
    if user["plan"] == "free" and user["free_used"] >= FREE_QUOTA_LIMIT:
        raise HTTPException(
            status_code=403,
            detail="무료 플랜의 킥오프 횟수(2회)를 모두 사용했습니다. 유료 플랜으로 업그레이드하세요.",
        )

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
            "total_steps": 10,
        })
        .execute()
    )

    project = result.data[0]
    logger.info("project_created", project_id=project["id"], user_id=user["id"])
    return project


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
