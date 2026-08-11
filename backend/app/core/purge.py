"""계정 완전 파기(hard delete) — 개인정보처리방침 '파기' 조항 이행. (BACKLOG BL-005 (b))

soft delete(`users.deleted_at`)는 관리자의 이용 정지·복구 목적이라 그대로 두고,
이 모듈은 되돌릴 수 없는 물리 삭제만 담당한다. 둘은 용도가 다르므로 공존한다.

public 테이블 대부분은 users/projects 에 ON DELETE CASCADE 가 걸려 있어
`users` 한 행만 지워도 연쇄 삭제되지만, 아래 이유로 순서를 코드에 고정한다.

1. `activity_logs.actor_id` 는 ON DELETE SET NULL 이라 **행이 남는다.**
   그런데 `actor_email`·`detail` 은 일반 컬럼이라 개인정보가 그대로 보존된다.
   또 `target_id` 는 FK 가 아니어서 이 사용자를 가리키는 행도 남는다.
2. `public.users` 와 `auth.users` 사이에는 FK 가 없다(004 트리거가 id 만 공유).
   따라서 어느 쪽을 지워도 반대쪽은 자동으로 지워지지 않는다.
3. 마이그레이션을 SQL Editor 수동 실행으로 적용해 왔으므로 환경별 CASCADE
   설정이 어긋날 수 있다. 명시 삭제는 그 편차에 영향받지 않는다.

삭제 순서는 참조 방향의 역순이다. 특히 `token_usage.session_id` 는
ON DELETE SET NULL 이라 `interview_sessions` 보다 **먼저** 지워야 행이 남지 않는다.
`auth.users` 는 마지막에 지운다 — 먼저 지우면 public 데이터 삭제가 실패했을 때
사용자가 다시 로그인해 재시도할 방법이 사라진다.
"""
from dataclasses import dataclass, field

import structlog

from app.core.supabase import get_supabase

logger = structlog.get_logger()


@dataclass
class PurgeResult:
    """파기 결과. `deleted` 는 테이블별 삭제 행 수, `residual` 은 남은 행 수."""

    deleted: dict[str, int] = field(default_factory=dict)
    residual: dict[str, int] = field(default_factory=dict)
    auth_deleted: bool = False
    auth_error: str | None = None

    @property
    def total_deleted(self) -> int:
        return sum(self.deleted.values())

    @property
    def complete(self) -> bool:
        """개인정보가 한 건도 남지 않았는지."""
        return self.auth_deleted and not self.residual


def _count(result) -> int:
    """PostgREST delete 응답의 행 수. 표현(representation) 미반환 시 0으로 본다."""
    return len(getattr(result, "data", None) or [])


def _delete_eq(sb, table: str, column: str, value: str) -> int:
    return _count(sb.table(table).delete().eq(column, value).execute())


def _delete_in(sb, table: str, column: str, values: list[str]) -> int:
    if not values:
        return 0
    return _count(sb.table(table).delete().in_(column, values).execute())


def _count_eq(sb, table: str, column: str, value: str) -> int:
    result = sb.table(table).select("id").eq(column, value).execute()
    return len(getattr(result, "data", None) or [])


def _count_in(sb, table: str, column: str, values: list[str]) -> int:
    if not values:
        return 0
    result = sb.table(table).select("id").in_(column, values).execute()
    return len(getattr(result, "data", None) or [])


def _project_ids(sb, user_id: str) -> list[str]:
    """soft delete 된 프로젝트도 포함한다 — 파기는 모든 행을 지운다."""
    result = sb.table("projects").select("id").eq("user_id", user_id).execute()
    return [row["id"] for row in (getattr(result, "data", None) or [])]


def _delete_auth_user(sb, user_id: str) -> tuple[bool, str | None]:
    """auth.users 행을 지운다. 이미 없으면 성공으로 본다(재시도 안전)."""
    try:
        sb.auth.admin.delete_user(user_id)
        return True, None
    except Exception as e:  # noqa: BLE001 — SDK 예외 타입이 버전마다 달라 문자열로 판별
        message = str(e)
        lowered = message.lower()
        if "not found" in lowered or "404" in lowered or "user_not_found" in lowered:
            return True, None
        logger.error("purge_auth_delete_failed", user_id=user_id, error=message)
        return False, message


def purge_user(user_id: str) -> PurgeResult:
    """사용자의 모든 개인정보를 물리 삭제한다. 되돌릴 수 없다.

    이미 일부만 지워진 상태에서 다시 호출해도 안전하다(없는 행은 0건 삭제).
    auth 사용자 삭제가 실패하면 `auth_deleted=False` 로 돌려주므로,
    호출자는 실패를 사용자에게 알리고 재시도할 수 있다.
    """
    sb = get_supabase()
    project_ids = _project_ids(sb, user_id)
    deleted: dict[str, int] = {}

    if project_ids:
        # activity_logs 는 FK 가 없어 프로젝트를 지워도 남는다 — 먼저 지운다.
        deleted["activity_logs.project_target"] = _delete_in(sb, "activity_logs", "target_id", project_ids)
        # token_usage.session_id 는 SET NULL 이라 세션보다 먼저 지워야 한다.
        deleted["token_usage.project"] = _delete_in(sb, "token_usage", "project_id", project_ids)
        deleted["finalize_sessions"] = _delete_in(sb, "finalize_sessions", "project_id", project_ids)
        deleted["design_sessions"] = _delete_in(sb, "design_sessions", "project_id", project_ids)
        deleted["interview_sessions"] = _delete_in(sb, "interview_sessions", "project_id", project_ids)
        deleted["projects"] = _delete_in(sb, "projects", "id", project_ids)

    # 프로젝트에 매달리지 않은 잔여 행(대개 0건)까지 사용자 기준으로 한 번 더 정리.
    deleted["token_usage.user"] = _delete_eq(sb, "token_usage", "user_id", user_id)
    deleted["payments"] = _delete_eq(sb, "payments", "user_id", user_id)
    # actor_email·detail 에 개인정보가 있어 SET NULL 로는 부족하다.
    deleted["activity_logs.actor"] = _delete_eq(sb, "activity_logs", "actor_id", user_id)
    deleted["activity_logs.user_target"] = _delete_eq(sb, "activity_logs", "target_id", user_id)
    deleted["users"] = _delete_eq(sb, "users", "id", user_id)

    auth_deleted, auth_error = _delete_auth_user(sb, user_id)

    residual = {
        name: count
        for name, count in {
            "projects": _count_in(sb, "projects", "id", project_ids),
            "interview_sessions": _count_in(sb, "interview_sessions", "project_id", project_ids),
            "design_sessions": _count_in(sb, "design_sessions", "project_id", project_ids),
            "finalize_sessions": _count_in(sb, "finalize_sessions", "project_id", project_ids),
            "token_usage": _count_eq(sb, "token_usage", "user_id", user_id),
            "payments": _count_eq(sb, "payments", "user_id", user_id),
            "activity_logs": _count_eq(sb, "activity_logs", "actor_id", user_id),
            "users": _count_eq(sb, "users", "id", user_id),
        }.items()
        if count
    }

    result = PurgeResult(
        deleted=deleted,
        residual=residual,
        auth_deleted=auth_deleted,
        auth_error=auth_error,
    )

    if residual:
        logger.error("purge_residual_rows", user_id=user_id, residual=residual)
    logger.info(
        "purge_user",
        user_id=user_id,
        total_deleted=result.total_deleted,
        auth_deleted=auth_deleted,
        complete=result.complete,
    )
    return result
