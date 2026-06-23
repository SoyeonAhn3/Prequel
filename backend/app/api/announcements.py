from fastapi import APIRouter, Depends, HTTPException, Query

from app.core.activity import record_activity
from app.core.supabase import get_supabase
from app.middleware.auth import get_current_user, require_admin
from app.schemas.announcement import AnnouncementCreate, AnnouncementUpdate

router = APIRouter(prefix="/api/announcements", tags=["announcements"])


@router.get("")
async def list_announcements(
    type: str | None = Query(default=None, pattern="^(notice|patch)$"),
    _user: dict = Depends(get_current_user),
):
    sb = get_supabase()
    query = sb.table("announcements").select("*")
    if type:
        query = query.eq("type", type)
    # 고정 공지를 먼저, 그다음 최신순.
    result = query.order("pinned", desc=True).order("created_at", desc=True).execute()
    return {"announcements": result.data}


@router.post("")
async def create_announcement(
    body: AnnouncementCreate,
    admin: dict = Depends(require_admin),
):
    sb = get_supabase()
    data = body.model_dump()
    # 버전은 패치내역에만 의미가 있다.
    if data["type"] != "patch":
        data["version"] = None
    result = sb.table("announcements").insert(data).execute()
    created = result.data[0]
    record_activity(admin, "announcement.create", "announcement", created["id"], {"title": created["title"]})
    return created


@router.patch("/{announcement_id}")
async def update_announcement(
    announcement_id: str,
    body: AnnouncementUpdate,
    admin: dict = Depends(require_admin),
):
    sb = get_supabase()
    existing = (
        sb.table("announcements").select("*").eq("id", announcement_id).execute()
    )
    if not existing.data:
        raise HTTPException(status_code=404, detail="Announcement not found")
    current = existing.data[0]

    data = body.model_dump(exclude_unset=True)
    if not data:
        return current

    final_type = data.get("type", current["type"])
    if final_type != "patch":
        data["version"] = None

    result = (
        sb.table("announcements").update(data).eq("id", announcement_id).execute()
    )
    record_activity(admin, "announcement.update", "announcement", announcement_id, {"title": result.data[0]["title"]})
    return result.data[0]


@router.delete("/{announcement_id}")
async def delete_announcement(
    announcement_id: str,
    admin: dict = Depends(require_admin),
):
    sb = get_supabase()
    existing = (
        sb.table("announcements").select("id").eq("id", announcement_id).execute()
    )
    if not existing.data:
        raise HTTPException(status_code=404, detail="Announcement not found")

    sb.table("announcements").delete().eq("id", announcement_id).execute()
    record_activity(admin, "announcement.delete", "announcement", announcement_id)
    # apiFetch가 항상 .json()을 호출하므로 본문을 반환한다.
    return {"ok": True}
