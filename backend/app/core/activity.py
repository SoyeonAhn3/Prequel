import structlog

from app.core.supabase import get_supabase

logger = structlog.get_logger()


def record_activity(
    actor: dict | None,
    action: str,
    target_type: str | None = None,
    target_id: str | None = None,
    detail: dict | None = None,
) -> None:
    """관리자 활동을 activity_logs 테이블에 적재한다(시스템 로그 경량판).

    - actor: 행위자 user dict (id·email 사용). 시스템 자동 동작이면 None.
    - action: 'user.suspend', 'announcement.create' 같은 도트 표기.
    - 기록 실패가 원래 요청을 깨면 안 되므로 예외를 삼킨다.
    """
    try:
        get_supabase().table("activity_logs").insert(
            {
                "actor_id": actor["id"] if actor else None,
                "actor_email": actor.get("email") if actor else None,
                "action": action,
                "target_type": target_type,
                "target_id": str(target_id) if target_id is not None else None,
                "detail": detail or {},
            }
        ).execute()
    except Exception as e:  # noqa: BLE001 — 활동 로깅 실패가 요청을 막으면 안 됨
        logger.warning("activity_record_failed", error=str(e), action=action)
