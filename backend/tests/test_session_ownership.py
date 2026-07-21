"""Ownership checks shared by design and finalization session APIs."""

from copy import deepcopy

import pytest
from fastapi import HTTPException

import app.api.design as design
import app.api.finalize as finalize
from app.api._shared import require_owned_session
from tests._fakes import FakeSupabase


_DESIGN_SESSION = {
    "id": "d1",
    "project_id": "p1",
    "current_step": "requirements",
    "status": "in_progress",
    "requirements": [{"id": "r1", "text": "original", "priority": "must", "status": "pending"}],
    "architecture": {"components": []},
    "data_model": {"entities": []},
}
_FINALIZE_SESSION = {
    "id": "f1",
    "project_id": "p1",
    "current_step": "gap",
    "status": "in_progress",
    "gaps": {"original": True},
}
_OWNERSHIP_ENDPOINTS = [
    ("GET", "/api/design/requirements/d1", None),
    ("PUT", "/api/design/requirements/d1/r1", {"text": "changed"}),
    ("PUT", "/api/design/requirements/d1", {"requirements": []}),
    ("GET", "/api/design/architecture/d1", None),
    ("PUT", "/api/design/architecture/d1", {"components": [{"name": "API"}]}),
    ("GET", "/api/design/data-model/d1", None),
    ("PUT", "/api/design/data-model/d1", {"entities": [{"name": "User"}]}),
    ("PUT", "/api/finalize/gap/f1", {"data": {"new": True}}),
]
_GET_OR_CREATE_KINDS = ["design", "finalize"]


def _endpoint_fake(project_user_id="u1", deleted_at=None, include_sessions=True):
    return FakeSupabase({
        "projects": [{"id": "p1", "user_id": project_user_id, "deleted_at": deleted_at}],
        "design_sessions": [deepcopy(_DESIGN_SESSION)] if include_sessions else [],
        "finalize_sessions": [deepcopy(_FINALIZE_SESSION)] if include_sessions else [],
    })


def _install_endpoint_fake(monkeypatch, fake):
    monkeypatch.setattr(design, "get_supabase", lambda: fake)
    monkeypatch.setattr(finalize, "get_supabase", lambda: fake)


def _request(client, method, path, body):
    kwargs = {"json": body} if body is not None else {}
    return client.request(method, path, **kwargs)


def _valid_project(kind, **overrides):
    project = {
        "id": "p1",
        "user_id": "u1",
        "deleted_at": None,
        "credit_charged_at": "2026-07-21T00:00:00Z",
        "status": "designing" if kind == "design" else "evaluating",
    }
    project.update(overrides)
    return project


def _session_table(kind):
    return "design_sessions" if kind == "design" else "finalize_sessions"


def _session_row(kind):
    return deepcopy(_DESIGN_SESSION if kind == "design" else _FINALIZE_SESSION)


def _call_get_or_create(kind, fake):
    if kind == "design":
        return design._get_or_create_session(fake, "p1", "u1")
    return finalize._get_or_create_finalize_session(fake, "p1", "u1")


@pytest.mark.parametrize("table_name", ["design_sessions", "finalize_sessions"])
def test_require_owned_session_returns_session_for_owner(table_name):
    session = {"id": "s1", "project_id": "p1", "status": "in_progress"}
    fake = FakeSupabase({
        table_name: [session],
        "projects": [{"id": "p1", "user_id": "u1", "deleted_at": None}],
    })

    assert require_owned_session(fake, table_name, "s1", "u1") == session


@pytest.mark.parametrize(
    ("sessions", "projects"),
    [
        ([], [{"id": "p1", "user_id": "u1", "deleted_at": None}]),
        ([{"id": "s1", "project_id": "p1"}], [{"id": "p1", "user_id": "u2", "deleted_at": None}]),
        ([{"id": "s1", "project_id": "p1"}], [{"id": "p1", "user_id": "u1", "deleted_at": "2026-07-21T00:00:00Z"}]),
    ],
    ids=["missing-session", "different-owner", "deleted-project"],
)
def test_require_owned_session_hides_missing_or_inaccessible_resources(sessions, projects):
    fake = FakeSupabase({"design_sessions": sessions, "projects": projects})

    with pytest.raises(HTTPException) as exc_info:
        require_owned_session(fake, "design_sessions", "s1", "u1")

    assert exc_info.value.status_code == 404
    assert exc_info.value.detail == "Session not found"


@pytest.mark.parametrize("none_result_table", ["design_sessions", "projects"])
def test_require_owned_session_handles_none_result_from_maybe_single(monkeypatch, none_result_table):
    fake = FakeSupabase({
        "design_sessions": [{"id": "s1", "project_id": "p1"}],
        "projects": [{"id": "p1", "user_id": "u1", "deleted_at": None}],
    })
    original_table = fake.table

    def table(name):
        query = original_table(name)
        if name == none_result_table:
            query.execute = lambda: None
        return query

    monkeypatch.setattr(fake, "table", table)

    with pytest.raises(HTTPException) as exc_info:
        require_owned_session(fake, "design_sessions", "s1", "u1")

    assert exc_info.value.status_code == 404
    assert exc_info.value.detail == "Session not found"


def test_require_owned_session_rejects_unsupported_table():
    with pytest.raises(ValueError, match="Unsupported owned-session table"):
        require_owned_session(FakeSupabase(), "interview_sessions", "s1", "u1")


@pytest.mark.parametrize(("method", "path", "body"), _OWNERSHIP_ENDPOINTS)
def test_session_endpoint_allows_owner(client, monkeypatch, method, path, body):
    fake = _endpoint_fake()
    _install_endpoint_fake(monkeypatch, fake)

    response = _request(client, method, path, body)

    assert response.status_code == 200


@pytest.mark.parametrize(("method", "path", "body"), _OWNERSHIP_ENDPOINTS)
@pytest.mark.parametrize(
    ("project_user_id", "deleted_at", "include_sessions"),
    [
        ("u2", None, True),
        ("u1", "2026-07-21T00:00:00Z", True),
        ("u1", None, False),
    ],
    ids=["different-owner", "deleted-project", "missing-session"],
)
def test_session_endpoint_hides_inaccessible_resource_without_mutation(
    client,
    monkeypatch,
    method,
    path,
    body,
    project_user_id,
    deleted_at,
    include_sessions,
):
    fake = _endpoint_fake(project_user_id, deleted_at, include_sessions)
    before_design = deepcopy(fake.rows("design_sessions"))
    before_finalize = deepcopy(fake.rows("finalize_sessions"))
    _install_endpoint_fake(monkeypatch, fake)

    response = _request(client, method, path, body)

    assert response.status_code == 404
    assert response.json()["detail"] == "Session not found"
    assert fake.rows("design_sessions") == before_design
    assert fake.rows("finalize_sessions") == before_finalize


@pytest.mark.parametrize("kind", _GET_OR_CREATE_KINDS)
@pytest.mark.parametrize(
    ("project_overrides", "expected_status"),
    [
        ({"user_id": "u2"}, 404),
        ({"deleted_at": "2026-07-21T00:00:00Z"}, 404),
        ({"status": "interviewing"}, 409),
    ],
    ids=["different-owner", "deleted-project", "invalid-phase"],
)
def test_get_or_create_authorizes_before_session_access(
    kind,
    project_overrides,
    expected_status,
):
    table_name = _session_table(kind)
    fake = FakeSupabase({
        "projects": [_valid_project(kind, **project_overrides)],
        table_name: [_session_row(kind)],
    })
    before = deepcopy(fake.rows(table_name))
    table_calls = []
    original_table = fake.table

    def tracked_table(name):
        table_calls.append(name)
        return original_table(name)

    fake.table = tracked_table

    with pytest.raises(HTTPException) as exc_info:
        _call_get_or_create(kind, fake)

    assert exc_info.value.status_code == expected_status
    assert table_calls == ["projects"]
    assert fake.rows(table_name) == before


@pytest.mark.parametrize("kind", _GET_OR_CREATE_KINDS)
def test_get_or_create_reuses_owned_session(kind):
    table_name = _session_table(kind)
    existing = _session_row(kind)
    fake = FakeSupabase({
        "projects": [_valid_project(kind)],
        table_name: [existing],
    })

    project, session = _call_get_or_create(kind, fake)

    assert project["id"] == "p1"
    assert session["id"] == existing["id"]
    assert len(fake.rows(table_name)) == 1


@pytest.mark.parametrize("kind", _GET_OR_CREATE_KINDS)
def test_get_or_create_creates_one_session_for_owner(kind):
    table_name = _session_table(kind)
    fake = FakeSupabase({
        "projects": [_valid_project(kind)],
        table_name: [],
    })

    project, session = _call_get_or_create(kind, fake)

    assert project["id"] == "p1"
    assert session["project_id"] == "p1"
    assert len(fake.rows(table_name)) == 1
