from fastapi import Depends, HTTPException, Request

from app.core.supabase import get_supabase


def _extract_token(request: Request) -> str:
    auth_header = request.headers.get("Authorization", "")
    if not auth_header.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing or invalid Authorization header")
    return auth_header[7:]


async def get_current_user(request: Request) -> dict:
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
