from datetime import datetime, timezone, timedelta

from fastapi import APIRouter, Depends, HTTPException, Query

from app.core.activity import record_activity
from app.core.supabase import get_supabase
from app.middleware.auth import require_admin

router = APIRouter(prefix="/api/admin", tags=["admin"])


@router.get("/stats")
async def get_stats(_admin: dict = Depends(require_admin)):
    sb = get_supabase()

    users_total = sb.table("users").select("id", count="exact").execute().count
    week_ago = (datetime.now(timezone.utc) - timedelta(days=7)).isoformat()
    users_new_7d = (
        sb.table("users")
        .select("id", count="exact")
        .gte("created_at", week_ago)
        .execute()
        .count
    )

    projects_active = (
        sb.table("projects")
        .select("id", count="exact")
        .eq("status", "in_progress")
        .is_("deleted_at", "null")
        .execute()
        .count
    )
    projects_completed = (
        sb.table("projects")
        .select("id", count="exact")
        .eq("status", "completed")
        .is_("deleted_at", "null")
        .execute()
        .count
    )

    # 토큰 총량(캐시 포함). 행 수가 적은 MVP 단계라 합산은 앱에서 수행.
    rows = (
        sb.table("token_usage")
        .select("input_tokens, output_tokens, cache_read, cache_creation")
        .execute()
        .data
    )
    tokens_total = sum(
        (r["input_tokens"] + r["output_tokens"] + r["cache_read"] + r["cache_creation"])
        for r in rows
    )

    return {
        "users_total": users_total,
        "users_new_7d": users_new_7d,
        "projects_active": projects_active,
        "projects_completed": projects_completed,
        "tokens_total": tokens_total,
    }


@router.get("/logs")
async def list_logs(
    limit: int = Query(50, ge=1, le=200),
    _admin: dict = Depends(require_admin),
):
    sb = get_supabase()
    result = (
        sb.table("activity_logs")
        .select("*")
        .order("created_at", desc=True)
        .limit(limit)
        .execute()
    )
    return {"logs": result.data}


@router.get("/users")
async def list_users(
    offset: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    _admin: dict = Depends(require_admin),
):
    sb = get_supabase()
    result = (
        sb.table("users")
        .select("*", count="exact")
        .order("created_at", desc=True)
        .range(offset, offset + limit - 1)
        .execute()
    )
    return {"users": result.data, "total": result.count}


@router.post("/users/{user_id}/suspend")
async def suspend_user(user_id: str, admin: dict = Depends(require_admin)):
    sb = get_supabase()
    existing = sb.table("users").select("id").eq("id", user_id).execute()
    if not existing.data:
        raise HTTPException(status_code=404, detail="User not found")

    result = (
        sb.table("users")
        .update({"suspended_at": datetime.now(timezone.utc).isoformat()})
        .eq("id", user_id)
        .execute()
    )
    record_activity(admin, "user.suspend", "user", user_id, {"email": result.data[0].get("email")})
    return result.data[0]


@router.post("/users/{user_id}/unsuspend")
async def unsuspend_user(user_id: str, admin: dict = Depends(require_admin)):
    sb = get_supabase()
    result = (
        sb.table("users")
        .update({"suspended_at": None})
        .eq("id", user_id)
        .execute()
    )
    if not result.data:
        raise HTTPException(status_code=404, detail="User not found")
    record_activity(admin, "user.unsuspend", "user", user_id, {"email": result.data[0].get("email")})
    return result.data[0]


@router.post("/users/{user_id}/delete")
async def soft_delete_user(user_id: str, admin: dict = Depends(require_admin)):
    sb = get_supabase()
    existing = sb.table("users").select("id").eq("id", user_id).execute()
    if not existing.data:
        raise HTTPException(status_code=404, detail="User not found")

    result = (
        sb.table("users")
        .update({"deleted_at": datetime.now(timezone.utc).isoformat()})
        .eq("id", user_id)
        .execute()
    )
    record_activity(admin, "user.delete", "user", user_id, {"email": result.data[0].get("email")})
    return result.data[0]


@router.post("/users/{user_id}/restore")
async def restore_user(user_id: str, admin: dict = Depends(require_admin)):
    sb = get_supabase()
    result = (
        sb.table("users")
        .update({"deleted_at": None})
        .eq("id", user_id)
        .execute()
    )
    if not result.data:
        raise HTTPException(status_code=404, detail="User not found")
    record_activity(admin, "user.restore", "user", user_id, {"email": result.data[0].get("email")})
    return result.data[0]
