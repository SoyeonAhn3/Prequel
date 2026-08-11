from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException

from app.core.activity import record_activity
from app.core.purge import purge_user
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


@router.delete("/me")
async def delete_my_account(user: dict = Depends(get_current_user)):
    """본인 계정과 관련 개인정보를 완전 파기한다. 되돌릴 수 없다. (BL-005 (b))

    관리자 계정은 스스로 삭제할 수 없다 — 마지막 관리자가 자신을 지우면
    관리 화면에 아무도 접근할 수 없는 상태가 되기 때문이다. 다른 관리자가
    `POST /api/admin/users/{id}/purge` 로 처리한다.
    """
    if user.get("role") == "admin":
        raise HTTPException(
            status_code=403,
            detail="관리자 계정은 본인이 삭제할 수 없어요. 다른 관리자에게 요청해주세요.",
        )

    result = purge_user(user["id"])

    if not result.complete:
        raise HTTPException(
            status_code=500,
            detail="계정 삭제를 끝내지 못했어요. 잠시 후 다시 시도하거나 문의해주세요.",
        )

    # 감사 기록에도 개인정보를 남기지 않는다 — 행위자·대상 식별자 없이 건수만 남긴다.
    record_activity(None, "user.purge", None, None, {"initiator": "self", "deleted_rows": result.total_deleted})
    return {"deleted": True, "deleted_rows": result.total_deleted}
