from fastapi import Depends, HTTPException, Request

from app.config import settings
from app.core.supabase import get_supabase

_DEV_MOCK_USER: dict = {
    "id": "00000000-0000-0000-0000-000000000000",
    "email": "dev@localhost",
    "display_name": "Dev User",
    "avatar_url": None,
    "role": "admin",
    "free_used": 0,
    "plan": "free",
    "plan_expires_at": None,
    "agreed_terms_at": "2026-01-01T00:00:00+00:00",
    "created_at": "2026-01-01T00:00:00+00:00",
    "updated_at": "2026-01-01T00:00:00+00:00",
}


def _extract_token(request: Request) -> str:
    auth_header = request.headers.get("Authorization", "")
    if not auth_header.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing or invalid Authorization header")
    return auth_header[7:]


def _ensure_dev_user() -> dict:
    sb = get_supabase()
    result = (
        sb.table("users")
        .select("*")
        .eq("id", _DEV_MOCK_USER["id"])
        .execute()
    )
    if result.data:
        return result.data[0]
    insert_data = {k: v for k, v in _DEV_MOCK_USER.items() if k not in ("created_at", "updated_at")}
    sb.table("users").insert(insert_data).execute()
    return _DEV_MOCK_USER


async def get_current_user(request: Request) -> dict:
    if settings.DEV_BYPASS_AUTH:
        return _ensure_dev_user()

    token = _extract_token(request)
    sb = get_supabase()

    try:
        auth_response = sb.auth.get_user(token)
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

    if not auth_response or not auth_response.user:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

    auth_user = auth_response.user

    result = (
        sb.table("users")
        .select("*")
        .eq("id", str(auth_user.id))
        .maybe_single()
        .execute()
    )

    if not result.data:
        raise HTTPException(status_code=404, detail="User profile not found")

    user = result.data

    if user.get("deleted_at"):
        raise HTTPException(status_code=403, detail="Account deleted")
    if user.get("suspended_at"):
        raise HTTPException(status_code=403, detail="Account suspended")

    return user


async def require_admin(user: dict = Depends(get_current_user)) -> dict:
    if user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    return user
