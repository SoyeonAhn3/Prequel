from datetime import datetime, timezone

from fastapi import APIRouter, Depends

from app.core.supabase import get_supabase
from app.middleware.auth import get_current_user
from app.schemas.user import UserProfile, UserProfileUpdate

router = APIRouter(prefix="/api/users", tags=["users"])


@router.get("/me", response_model=UserProfile)
async def get_my_profile(user: dict = Depends(get_current_user)):
    return user


@router.patch("/me", response_model=UserProfile)
async def update_my_profile(
    body: UserProfileUpdate,
    user: dict = Depends(get_current_user),
):
    update_data = body.model_dump(exclude_none=True)
    if not update_data:
        return user

    sb = get_supabase()
    result = (
        sb.table("users")
        .update(update_data)
        .eq("id", user["id"])
        .execute()
    )
    return result.data[0]


@router.post("/me/agree-terms", response_model=UserProfile)
async def agree_terms(user: dict = Depends(get_current_user)):
    sb = get_supabase()
    result = (
        sb.table("users")
        .update({"agreed_terms_at": datetime.now(timezone.utc).isoformat()})
        .eq("id", user["id"])
        .execute()
    )
    return result.data[0]
