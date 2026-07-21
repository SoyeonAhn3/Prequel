"""프로젝트 CRUD 엔드포인트 통합 테스트 — 상태 유지 가짜 Supabase.

목록/조회/생성/수정/설계결정/문서생성/삭제의 제어 흐름과
404·403·400 분기를 실제 DB 없이 검증한다.
"""
import app.api.projects as pr
import app.core.usage as usage_mod

from tests._fakes import FakeSupabase

_TS = "2026-01-01T00:00:00+00:00"


def _project(pid="p1", user_id="u1", **over):
    base = {
        "id": pid,
        "user_id": user_id,
        "name": "테스트 프로젝트",
        "description": "설명",
        "language": "ko",
        "status": "in_progress",
        "current_step": 0,
        "total_steps": 11,
        "created_at": _TS,
        "updated_at": _TS,
    }
    base.update(over)
    return base


def _design_decision_rpc(fake, params):
    project = next(
        (
            row for row in fake.rows("projects")
            if row["id"] == params["p_project_id"]
            and row["user_id"] == params["p_user_id"]
            and not row.get("deleted_at")
        ),
        None,
    )
    if project is None:
        raise RuntimeError("PROJECT_NOT_FOUND")
    if project["status"] == "completed":
        return {"project": dict(project), "charged": False}
    if params["p_decision"] == "skip":
        project["status"] = "completed"
        return {"project": dict(project), "charged": False}
    if project.get("credit_charged_at"):
        project["status"] = "designing"
        return {"project": dict(project), "charged": False}

    user = next((row for row in fake.rows("users") if row["id"] == params["p_user_id"]), None)
    if user is None:
        raise RuntimeError("USER_NOT_FOUND")

    limit = None
    if not params["p_bypass_limit"] and user.get("role") != "admin":
        limit = {"free": 2, "basic": 10, "pro": 30}.get(user.get("plan", "free"), 2)
    if limit is not None and user.get("credits_used", 0) >= limit:
        raise RuntimeError(f"CREDIT_LIMIT_EXCEEDED:{limit}")

    user["credits_used"] = user.get("credits_used", 0) + 1
    project["status"] = "designing"
    project["credit_charged_at"] = _TS
    return {"project": dict(project), "charged": True}


def _install(monkeypatch, fake):
    monkeypatch.setattr(pr, "get_supabase", lambda: fake)
    monkeypatch.setattr(usage_mod, "get_supabase", lambda: fake)
    monkeypatch.setattr(pr.settings, "DEV_BYPASS_AUTH", False)
    fake.register_rpc(
        "set_design_decision_atomic",
        lambda params: _design_decision_rpc(fake, params),
    )


# ── 목록 / 조회 ────────────────────────────────────────────

def test_list_returns_only_own_active_projects(client, monkeypatch):
    fake = FakeSupabase({"projects": [
        _project("p1", "u1"),
        _project("p2", "u1"),
        _project("p3", "u2"),                        # 남의 것
        _project("p4", "u1", deleted_at=_TS),        # 소프트 삭제됨
    ]})
    _install(monkeypatch, fake)
    r = client.get("/api/projects")
    assert r.status_code == 200
    ids = {p["id"] for p in r.json()}
    assert ids == {"p1", "p2"}


def test_get_project_found(client, monkeypatch):
    _install(monkeypatch, FakeSupabase({"projects": [_project("p1", "u1")]}))
    r = client.get("/api/projects/p1")
    assert r.status_code == 200
    assert r.json()["id"] == "p1"


def test_get_project_not_found(client, monkeypatch):
    _install(monkeypatch, FakeSupabase({"projects": []}))
    r = client.get("/api/projects/missing")
    assert r.status_code == 404


# ── 생성 ───────────────────────────────────────────────────

def test_create_project(client, monkeypatch):
    fake = FakeSupabase({"projects": []})
    _install(monkeypatch, fake)
    r = client.post("/api/projects", json={"name": "새 프로젝트", "language": "ko"})
    assert r.status_code == 201
    body = r.json()
    assert body["name"] == "새 프로젝트"
    assert body["user_id"] == "u1"
    assert body["status"] == "in_progress"
    assert len(fake.rows("projects")) == 1


# ── 수정 ───────────────────────────────────────────────────

def test_update_project_success(client, monkeypatch):
    _install(monkeypatch, FakeSupabase({"projects": [_project("p1", "u1")]}))
    r = client.patch("/api/projects/p1", json={"name": "바뀐 이름"})
    assert r.status_code == 200
    assert r.json()["name"] == "바뀐 이름"


def test_update_project_not_found(client, monkeypatch):
    _install(monkeypatch, FakeSupabase({"projects": []}))
    r = client.patch("/api/projects/none", json={"name": "x"})
    assert r.status_code == 404


def test_update_project_no_fields(client, monkeypatch):
    _install(monkeypatch, FakeSupabase({"projects": [_project("p1", "u1")]}))
    r = client.patch("/api/projects/p1", json={})
    assert r.status_code == 400


# ── 설계 결정 (크레딧 멱등 차감) ───────────────────────────

def test_design_decision_charges_credit_first_time(client, monkeypatch):
    fake = FakeSupabase({
        "projects": [_project("p1", "u1", status="in_progress")],
        "users": [{"id": "u1", "credits_used": 0}],
    })
    _install(monkeypatch, fake)
    r = client.post("/api/projects/p1/design-decision", json={"decision": "design"})
    assert r.status_code == 200
    body = r.json()
    assert body["status"] == "designing"
    proj = fake.rows("projects")[0]
    assert proj.get("credit_charged_at")                 # 차감 시각 기록
    assert fake.rows("users")[0]["credits_used"] == 1    # 1회 증가


def test_design_decision_reentry_does_not_charge_again(client, monkeypatch):
    fake = FakeSupabase({
        "projects": [_project("p1", "u1", status="evaluating", credit_charged_at=_TS)],
        "users": [{"id": "u1", "plan": "free", "role": "user", "credits_used": 2}],
    })
    _install(monkeypatch, fake)
    r = client.post("/api/projects/p1/design-decision", json={"decision": "design"})
    assert r.status_code == 200
    assert r.json()["status"] == "designing"
    assert fake.rows("users")[0]["credits_used"] == 2
    assert len(fake.rpc_calls) == 1


def test_design_decision_exhausted_rolls_back(client, monkeypatch):
    fake = FakeSupabase({
        "projects": [_project("p1", "u1", status="in_progress")],
        "users": [{"id": "u1", "plan": "free", "role": "user", "credits_used": 2}],
    })
    _install(monkeypatch, fake)
    r = client.post("/api/projects/p1/design-decision", json={"decision": "design"})
    assert r.status_code == 403
    assert "2회" in r.json()["detail"]
    assert fake.rows("projects")[0]["status"] == "in_progress"
    assert not fake.rows("projects")[0].get("credit_charged_at")
    assert fake.rows("users")[0]["credits_used"] == 2


def test_design_decision_dev_bypass_skips_limit_but_records_usage(client, monkeypatch):
    fake = FakeSupabase({
        "projects": [_project("p1", "u1", status="in_progress")],
        "users": [{"id": "u1", "plan": "free", "role": "user", "credits_used": 999}],
    })
    _install(monkeypatch, fake)
    monkeypatch.setattr(pr.settings, "DEV_BYPASS_AUTH", True)
    r = client.post("/api/projects/p1/design-decision", json={"decision": "design"})
    assert r.status_code == 200
    assert fake.rows("users")[0]["credits_used"] == 1000
    assert fake.rpc_calls[0][1]["p_bypass_limit"] is True


def test_design_decision_skip_completes_without_charge(client, monkeypatch):
    fake = FakeSupabase({"projects": [_project("p1", "u1")]})
    _install(monkeypatch, fake)
    r = client.post("/api/projects/p1/design-decision", json={"decision": "skip"})
    assert r.status_code == 200
    assert r.json()["status"] == "completed"


def test_design_decision_requires_completed_interview(client, monkeypatch):
    fake = FakeSupabase({"projects": [_project("p1", "u1")]})
    _install(monkeypatch, fake)

    def incomplete(_params):
        raise RuntimeError("INTERVIEW_NOT_COMPLETED")

    fake.register_rpc("set_design_decision_atomic", incomplete)
    r = client.post("/api/projects/p1/design-decision", json={"decision": "design"})
    assert r.status_code == 409
    assert "인터뷰" in r.json()["detail"]


def test_design_decision_completed_is_noop(client, monkeypatch):
    fake = FakeSupabase({"projects": [_project("p1", "u1", status="completed")]})
    _install(monkeypatch, fake)
    r = client.post("/api/projects/p1/design-decision", json={"decision": "design"})
    assert r.status_code == 200
    assert r.json()["status"] == "completed"   # 뒤로 되돌리지 않음


def test_design_decision_project_not_found(client, monkeypatch):
    _install(monkeypatch, FakeSupabase({"projects": []}))
    r = client.post("/api/projects/none/design-decision", json={"decision": "design"})
    assert r.status_code == 404


# ── 평가 진입 (추가 차감 없음) ─────────────────────────────

def test_enter_evaluation_changes_only_project_status(client, monkeypatch):
    fake = FakeSupabase({
        "projects": [_project("p1", "u1", status="designing", credit_charged_at=_TS)],
        "users": [{"id": "u1", "credits_used": 2}],
    })
    _install(monkeypatch, fake)
    r = client.post("/api/projects/p1/enter-evaluation")
    assert r.status_code == 200
    assert r.json()["status"] == "evaluating"
    assert fake.rows("users")[0]["credits_used"] == 2
    assert fake.rpc_calls == []


def test_enter_evaluation_retry_is_idempotent(client, monkeypatch):
    fake = FakeSupabase({
        "projects": [_project("p1", "u1", status="evaluating", credit_charged_at=_TS)],
        "users": [{"id": "u1", "credits_used": 2}],
    })
    _install(monkeypatch, fake)
    first = client.post("/api/projects/p1/enter-evaluation")
    second = client.post("/api/projects/p1/enter-evaluation")
    assert first.status_code == second.status_code == 200
    assert fake.rows("users")[0]["credits_used"] == 2


def test_enter_evaluation_rejects_unpaid_or_wrong_phase(client, monkeypatch):
    unpaid = FakeSupabase({"projects": [_project("p1", "u1", status="designing")]})
    _install(monkeypatch, unpaid)
    assert client.post("/api/projects/p1/enter-evaluation").status_code == 409

    wrong_phase = FakeSupabase({
        "projects": [_project("p1", "u1", status="in_progress", credit_charged_at=_TS)],
    })
    _install(monkeypatch, wrong_phase)
    assert client.post("/api/projects/p1/enter-evaluation").status_code == 409


def test_enter_evaluation_hides_other_users_project(client, monkeypatch):
    fake = FakeSupabase({
        "projects": [_project("p1", "u2", status="designing", credit_charged_at=_TS)],
    })
    _install(monkeypatch, fake)
    assert client.post("/api/projects/p1/enter-evaluation").status_code == 404


# ── 문서 생성 ──────────────────────────────────────────────

def test_generate_doc(client, monkeypatch):
    fake = FakeSupabase({
        "projects": [_project("p1", "u1")],
        "interview_sessions": [
            {"id": "s1", "project_id": "p1", "status": "completed",
             "messages": [], "created_at": _TS},
        ],
    })
    _install(monkeypatch, fake)
    monkeypatch.setattr(
        pr, "generate_kickoff_document",
        lambda project, session: ("# 킥오프 문서", {"input_tokens": 10, "output_tokens": 5}),
    )
    r = client.post("/api/projects/p1/generate-doc")
    assert r.status_code == 200
    assert r.json()["kickoff_doc"] == "# 킥오프 문서"
    assert fake.rows("projects")[0]["kickoff_doc"] == "# 킥오프 문서"


def test_generate_doc_no_completed_session(client, monkeypatch):
    fake = FakeSupabase({
        "projects": [_project("p1", "u1")],
        "interview_sessions": [],
    })
    _install(monkeypatch, fake)
    r = client.post("/api/projects/p1/generate-doc")
    assert r.status_code == 400


# ── 삭제 (소프트 삭제) ─────────────────────────────────────

def test_delete_project_soft_deletes(client, monkeypatch):
    fake = FakeSupabase({"projects": [_project("p1", "u1")]})
    _install(monkeypatch, fake)
    r = client.delete("/api/projects/p1")
    assert r.status_code == 200
    assert fake.rows("projects")[0].get("deleted_at")   # 실제 삭제 아님, 표시만


def test_delete_project_not_found(client, monkeypatch):
    _install(monkeypatch, FakeSupabase({"projects": []}))
    r = client.delete("/api/projects/none")
    assert r.status_code == 404


def test_delete_project_already_deleted(client, monkeypatch):
    fake = FakeSupabase({"projects": [_project("p1", "u1", deleted_at=_TS)]})
    _install(monkeypatch, fake)
    r = client.delete("/api/projects/p1")
    assert r.status_code == 400
