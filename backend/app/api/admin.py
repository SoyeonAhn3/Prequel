from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, Query

from app.core.supabase import get_supabase
from app.middleware.auth import require_admin

router = APIRouter(prefix="/api/admin", tags=["admin"])


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
async def suspend_user(user_id: str, _admin: dict = Depends(require_admin)):
    sb = get_supabase()
    existing = sb.table("users").select("id").eq("id", user_id).maybe_single().execute()
    if not existing.data:
        raise HTTPException(status_code=404, detail="User not found")

    result = (
        sb.table("users")
        .update({"suspended_at": datetime.now(timezone.utc).isoformat()})
        .eq("id", user_id)
        .execute()
    )
    return result.data[0]


@router.post("/users/{user_id}/unsuspend")
async def unsuspend_user(user_id: str, _admin: dict = Depends(require_admin)):
    sb = get_supabase()
    result = (
        sb.table("users")
        .update({"suspended_at": None})
        .eq("id", user_id)
        .execute()
    )
    if not result.data:
        raise HTTPException(status_code=404, detail="User not found")
    return result.data[0]


@router.post("/users/{user_id}/delete")
async def soft_delete_user(user_id: str, _admin: dict = Depends(require_admin)):
    sb = get_supabase()
    existing = sb.table("users").select("id").eq("id", user_id).maybe_single().execute()
    if not existing.data:
        raise HTTPException(status_code=404, detail="User not found")

    result = (
        sb.table("users")
        .update({"deleted_at": datetime.now(timezone.utc).isoformat()})
        .eq("id", user_id)
        .execute()
    )
    return result.data[0]


@router.post("/users/{user_id}/restore")
async def restore_user(user_id: str, _admin: dict = Depends(require_admin)):
    sb = get_supabase()
    result = (
        sb.table("users")
        .update({"deleted_at": None})
        .eq("id", user_id)
        .execute()
    )
    if not result.data:
        raise HTTPException(status_code=404, detail="User not found")
    return result.data[0]
