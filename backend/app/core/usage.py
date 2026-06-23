import structlog

from app.core.supabase import get_supabase

logger = structlog.get_logger()


def record_token_usage(
    user_id: str,
    project_id: str,
    usage: dict,
    session_id: str | None = None,
) -> None:
    """claude 호출의 토큰 사용량을 token_usage 테이블에 적재한다.

    - 정확한 토큰량 집계만 목적 — 비용(cost_usd)은 계산하지 않는다(기본값 0).
    - input/output/cache_read/cache_creation 4종을 모두 저장.
    - session_id 는 interview_sessions 만 참조(FK)하므로 인터뷰에서만 전달하고,
      설계/마무리/킥오프 생성은 None 으로 둔다.
    - 토큰 적재가 실패해도 원래 요청을 깨면 안 되므로 예외를 삼킨다.
    """
    try:
        get_supabase().table("token_usage").insert(
            {
                "user_id": user_id,
                "project_id": project_id,
                "session_id": session_id,
                "input_tokens": usage.get("input_tokens", 0),
                "output_tokens": usage.get("output_tokens", 0),
                "cache_read": usage.get("cache_read", 0),
                "cache_creation": usage.get("cache_creation", 0),
            }
        ).execute()
    except Exception as e:  # noqa: BLE001 — 토큰 로깅 실패가 요청을 막으면 안 됨
        logger.warning("token_usage_record_failed", error=str(e), project_id=project_id)
