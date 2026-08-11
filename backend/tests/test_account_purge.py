"""계정 완전 파기(hard delete) 테스트 — BACKLOG BL-005 (b).

soft delete 와 달리 복구 경로가 없으므로, "정말 한 건도 남지 않는지"와
"남의 데이터를 건드리지 않는지"를 함께 본다. 특히 activity_logs 는
FK 가 SET NULL 이라 행이 남고 actor_email 에 개인정보가 보존되는데,
이 함정을 실제로 막았는지 검증하는 것이 이 파일의 핵심이다.
"""
import app.api.admin as admin_mod
import app.api.users as users_mod
import app.core.activity as activity_mod
import app.core.purge as purge_mod

from app.main import app
from app.middleware.auth import get_current_user
from tests._fakes import FakeSupabase

_TS = "2026-01-01T00:00:00+00:00"
_EMAIL = "tester@example.com"
_OTHER_EMAIL = "other@example.com"


def _graph():
    """u1(파기 대상)과 u2(무관한 사용자)의 데이터가 뒤섞인 상태."""
    return FakeSupabase({
        "users": [
            {"id": "u1", "email": _EMAIL, "role": "user", "credits_used": 2},
            {"id": "u2", "email": _OTHER_EMAIL, "role": "user", "credits_used": 1},
        ],
        "projects": [
            {"id": "p1", "user_id": "u1", "name": "프로젝트1"},
            {"id": "p2", "user_id": "u1", "name": "삭제된 프로젝트", "deleted_at": _TS},
            {"id": "p3", "user_id": "u2", "name": "남의 프로젝트"},
        ],
        "interview_sessions": [
            {"id": "s1", "project_id": "p1"},
            {"id": "s2", "project_id": "p2"},
            {"id": "s3", "project_id": "p3"},
        ],
        "design_sessions": [
            {"id": "d1", "project_id": "p1"},
            {"id": "d2", "project_id": "p3"},
        ],
        "finalize_sessions": [
            {"id": "f1", "project_id": "p1"},
            {"id": "f2", "project_id": "p3"},
        ],
        "token_usage": [
            {"id": "t1", "user_id": "u1", "project_id": "p1", "session_id": "s1"},
            {"id": "t2", "user_id": "u1", "project_id": "p2", "session_id": None},
            {"id": "t3", "user_id": "u2", "project_id": "p3", "session_id": "s3"},
        ],
        "payments": [
            {"id": "pay1", "user_id": "u1"},
            {"id": "pay2", "user_id": "u2"},
        ],
        "activity_logs": [
            # 행위자가 파기 대상 — actor_id 는 SET NULL 이지만 actor_email 이 남는다.
            {"id": "a1", "actor_id": "u1", "actor_email": _EMAIL, "action": "user.login", "target_id": None},
            # 대상이 파기 대상 사용자 / 그의 프로젝트 — FK 가 없어 그냥 남는다.
            {"id": "a2", "actor_id": "admin1", "actor_email": "admin@x.com", "action": "user.suspend", "target_id": "u1"},
            {"id": "a3", "actor_id": "u1", "actor_email": _EMAIL, "action": "project.create", "target_id": "p1"},
            # 무관한 행 — 남아야 한다.
            {"id": "a4", "actor_id": "u2", "actor_email": _OTHER_EMAIL, "action": "user.login", "target_id": None},
        ],
    })


def _install(monkeypatch, fake):
    monkeypatch.setattr(purge_mod, "get_supabase", lambda: fake)
    monkeypatch.setattr(activity_mod, "get_supabase", lambda: fake)
    monkeypatch.setattr(admin_mod, "get_supabase", lambda: fake)
    monkeypatch.setattr(users_mod, "get_supabase", lambda: fake)


def _as(user_id="u1", role="user", email=_EMAIL):
    app.dependency_overrides[get_current_user] = lambda: {"id": user_id, "email": email, "role": role}


def _all_rows(fake):
    tables = [
        "users", "projects", "interview_sessions", "design_sessions",
        "finalize_sessions", "token_usage", "payments", "activity_logs",
    ]
    return [(name, row) for name in tables for row in fake.rows(name)]


# ── 본인 삭제 ──────────────────────────────────────────────

def test_self_delete_removes_every_trace(client, monkeypatch):
    fake = _graph()
    _install(monkeypatch, fake)
    _as()

    r = client.delete("/api/users/me")
    assert r.status_code == 200
    assert r.json()["deleted"] is True
    assert r.json()["deleted_rows"] > 0

    # public.users 와 auth.users 는 FK 가 없어 둘 다 명시 삭제돼야 한다.
    assert [u["id"] for u in fake.rows("users")] == ["u2"]
    assert fake.auth.admin.deleted_users == ["u1"]

    # 어느 테이블에도 파기 대상의 식별자가 남지 않는다.
    for name, row in _all_rows(fake):
        assert row.get("user_id") != "u1", f"{name} 에 user_id=u1 잔존"
        assert row.get("actor_id") != "u1", f"{name} 에 actor_id=u1 잔존"
        assert row.get("project_id") not in {"p1", "p2"}, f"{name} 에 프로젝트 잔존"


def test_self_delete_removes_email_from_activity_logs(client, monkeypatch):
    """actor_id 가 SET NULL 이라 행만 남으면 actor_email 로 개인정보가 보존된다."""
    fake = _graph()
    _install(monkeypatch, fake)
    _as()

    assert client.delete("/api/users/me").status_code == 200

    remaining = [row for _, row in _all_rows(fake)]
    assert all(_EMAIL not in str(row.values()) for row in remaining)
    # 남의 로그는 그대로. (파기 직후 남기는 user.purge 감사 기록은 제외)
    kept = [a["id"] for a in fake.rows("activity_logs") if a["action"] != "user.purge"]
    assert kept == ["a4"]


def test_self_delete_keeps_other_users_data(client, monkeypatch):
    fake = _graph()
    _install(monkeypatch, fake)
    _as()

    assert client.delete("/api/users/me").status_code == 200

    assert [p["id"] for p in fake.rows("projects")] == ["p3"]
    assert [s["id"] for s in fake.rows("interview_sessions")] == ["s3"]
    assert [d["id"] for d in fake.rows("design_sessions")] == ["d2"]
    assert [f["id"] for f in fake.rows("finalize_sessions")] == ["f2"]
    assert [t["id"] for t in fake.rows("token_usage")] == ["t3"]
    assert [p["id"] for p in fake.rows("payments")] == ["pay2"]


def test_self_delete_audit_record_has_no_personal_data(client, monkeypatch):
    fake = _graph()
    _install(monkeypatch, fake)
    _as()

    assert client.delete("/api/users/me").status_code == 200

    purge_logs = [a for a in fake.rows("activity_logs") if a["action"] == "user.purge"]
    assert len(purge_logs) == 1
    record = purge_logs[0]
    assert record["actor_id"] is None
    assert record["actor_email"] is None
    assert record["target_id"] is None
    assert record["detail"]["initiator"] == "self"


def test_self_delete_is_blocked_for_admin(client, monkeypatch):
    """마지막 관리자가 자신을 지우면 관리 화면에 아무도 못 들어간다."""
    fake = _graph()
    _install(monkeypatch, fake)
    _as(role="admin")

    r = client.delete("/api/users/me")
    assert r.status_code == 403
    assert fake.rows("users")  # 아무것도 지워지지 않았다
    assert fake.auth.admin.deleted_users == []


def test_self_delete_is_idempotent(client, monkeypatch):
    fake = _graph()
    _install(monkeypatch, fake)
    _as()

    assert client.delete("/api/users/me").status_code == 200
    second = client.delete("/api/users/me")
    assert second.status_code == 200
    assert second.json()["deleted_rows"] == 0


def test_self_delete_reports_auth_failure(client, monkeypatch):
    """auth 사용자가 남으면 파기가 끝난 게 아니므로 실패로 알린다."""
    fake = _graph()
    fake.auth.admin.error = RuntimeError("service unavailable")
    _install(monkeypatch, fake)
    _as()

    r = client.delete("/api/users/me")
    assert r.status_code == 500
    assert fake.auth.admin.deleted_users == []


def test_purge_treats_missing_auth_user_as_done(monkeypatch):
    """이미 지워진 auth 사용자는 실패가 아니다 — 재시도 안전성."""
    fake = _graph()
    fake.auth.admin.error = RuntimeError("User not found")
    _install(monkeypatch, fake)

    result = purge_mod.purge_user("u1")
    assert result.auth_deleted is True
    assert result.complete is True


# ── 관리자 파기 ────────────────────────────────────────────

def test_admin_can_purge_another_user(client, monkeypatch):
    fake = _graph()
    _install(monkeypatch, fake)
    _as(user_id="admin1", role="admin", email="admin@x.com")

    r = client.post("/api/admin/users/u1/purge")
    assert r.status_code == 200
    assert [u["id"] for u in fake.rows("users")] == ["u2"]
    assert fake.auth.admin.deleted_users == ["u1"]


def test_admin_purge_records_audit_with_admin_actor(client, monkeypatch):
    fake = _graph()
    _install(monkeypatch, fake)
    _as(user_id="admin1", role="admin", email="admin@x.com")

    client.post("/api/admin/users/u1/purge")

    purge_logs = [a for a in fake.rows("activity_logs") if a["action"] == "user.purge"]
    assert len(purge_logs) == 1
    assert purge_logs[0]["actor_id"] == "admin1"
    assert purge_logs[0]["target_id"] == "u1"
    assert purge_logs[0]["detail"]["initiator"] == "admin"


def test_admin_cannot_purge_self(client, monkeypatch):
    fake = _graph()
    fake.rows("users").append({"id": "admin1", "email": "admin@x.com", "role": "admin"})
    _install(monkeypatch, fake)
    _as(user_id="admin1", role="admin", email="admin@x.com")

    r = client.post("/api/admin/users/admin1/purge")
    assert r.status_code == 403
    assert any(u["id"] == "admin1" for u in fake.rows("users"))


def test_admin_purge_unknown_user_returns_404(client, monkeypatch):
    fake = _graph()
    _install(monkeypatch, fake)
    _as(user_id="admin1", role="admin", email="admin@x.com")

    r = client.post("/api/admin/users/nope/purge")
    assert r.status_code == 404
    assert fake.auth.admin.deleted_users == []


def test_soft_delete_still_only_marks_the_row(client, monkeypatch):
    """파기와 이용 정지는 별개 동작 — soft delete 는 그대로 남아야 한다."""
    fake = _graph()
    _install(monkeypatch, fake)
    _as(user_id="admin1", role="admin", email="admin@x.com")

    r = client.post("/api/admin/users/u1/delete")
    assert r.status_code == 200
    user = next(u for u in fake.rows("users") if u["id"] == "u1")
    assert user["deleted_at"]
    assert fake.auth.admin.deleted_users == []
    assert fake.rows("projects")  # 데이터는 남아 있다
