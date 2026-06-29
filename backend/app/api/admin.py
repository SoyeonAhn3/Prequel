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


@router.get("/token-usage")
async def token_usage_timeseries(
    days: int = Query(14, ge=1, le=90),
    _admin: dict = Depends(require_admin),
):
    """일별 토큰 사용량 시계열(캐시 포함). 집계는 /stats와 동일하게 앱에서 수행(MVP 규모)."""
    sb = get_supabase()

    # 구간: 오늘 포함 최근 N일 (UTC 기준).
    today = datetime.now(timezone.utc).date()
    start = today - timedelta(days=days - 1)
    cutoff = datetime(start.year, start.month, start.day, tzinfo=timezone.utc).isoformat()

    rows = (
        sb.table("token_usage")
        .select("input_tokens, output_tokens, cache_read, cache_creation, created_at")
        .gte("created_at", cutoff)
        .execute()
        .data
    )

    # 구간 내 모든 날짜를 0으로 초기화 → 빈 날도 연속 막대로 표시.
    buckets: dict[str, dict] = {}
    for i in range(days):
        d = (start + timedelta(days=i)).isoformat()
        buckets[d] = {"date": d, "input": 0, "output": 0, "cache_read": 0, "cache_creation": 0}

    for r in rows:
        d = (r.get("created_at") or "")[:10]
        b = buckets.get(d)
        if b is None:
            continue
        b["input"] += r.get("input_tokens") or 0
        b["output"] += r.get("output_tokens") or 0
        b["cache_read"] += r.get("cache_read") or 0
        b["cache_creation"] += r.get("cache_creation") or 0

    series = []
    totals = {"input": 0, "output": 0, "cache_read": 0, "cache_creation": 0}
    for d in sorted(buckets):
        b = buckets[d]
        b["total"] = b["input"] + b["output"] + b["cache_read"] + b["cache_creation"]
        series.append(b)
        for k in totals:
            totals[k] += b[k]

    grand_total = sum(totals.values())
    cache_read_pct = round(totals["cache_read"] / grand_total * 100, 1) if grand_total else 0.0

    return {
        "days": days,
        "series": series,
        "totals": {**totals, "total": grand_total},
        "cache_read_pct": cache_read_pct,
    }


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
