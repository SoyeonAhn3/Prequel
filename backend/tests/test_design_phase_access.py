"""BL-023 설계 AI 생성 엔드포인트의 유료 단계 서버 가드."""
import pytest

import app.api.design as design

from tests._fakes import FakeSupabase


_TS = "2026-01-01T00:00:00+00:00"
_GENERATE_PATHS = (
    "/api/design/requirements/generate",
    "/api/design/architecture/templates",
    "/api/design/architecture/generate",
    "/api/design/data-model/generate",
    "/api/design/ai-workflow/generate",
)


def _project(**over):
    project = {
        "id": "p1",
        "user_id": "u1",
        "name": "테스트 프로젝트",
        "project_type": "Web",
        "description": "설명",
        "language": "ko",
        "status": "designing",
        "credit_charged_at": _TS,
    }
    project.update(over)
    return project


def _install(monkeypatch, fake):
    chat_calls = []
    monkeypatch.setattr(design, "get_supabase", lambda: fake)
    monkeypatch.setattr(design, "_get_interview_context", lambda _project_id: "인터뷰 컨텍스트")
    monkeypatch.setattr(design, "load_skill", lambda name: f"SKILL::{name}")
    monkeypatch.setattr(design, "record_token_usage", lambda *args, **kwargs: None)

    def fake_chat(*args, **kwargs):
        chat_calls.append((args, kwargs))
        return '{"requirements": []}', {"input_tokens": 1, "output_tokens": 1}

    monkeypatch.setattr(design, "chat", fake_chat)
    return chat_calls


@pytest.mark.parametrize("path", _GENERATE_PATHS)
def test_all_design_generators_reject_unpaid_or_wrong_phase_before_claude(
    path, client, monkeypatch,
):
    fake = FakeSupabase({
        "projects": [_project(status="in_progress", credit_charged_at=None)],
        "design_sessions": [],
    })
    chat_calls = _install(monkeypatch, fake)

    response = client.post(path, json={"project_id": "p1"})

    assert response.status_code == 409
    assert chat_calls == []
    assert fake.rows("design_sessions") == []


def test_paid_design_project_can_generate_requirements(client, monkeypatch):
    fake = FakeSupabase({
        "projects": [_project()],
        "design_sessions": [],
    })
    chat_calls = _install(monkeypatch, fake)

    response = client.post("/api/design/requirements/generate", json={"project_id": "p1"})

    assert response.status_code == 200
    assert response.json()["requirements"] == []
    assert len(chat_calls) == 1
    assert len(fake.rows("design_sessions")) == 1


def test_design_generator_hides_other_users_project(client, monkeypatch):
    fake = FakeSupabase({
        "projects": [_project(user_id="u2")],
        "design_sessions": [],
    })
    chat_calls = _install(monkeypatch, fake)

    response = client.post("/api/design/requirements/generate", json={"project_id": "p1"})

    assert response.status_code == 404
    assert chat_calls == []
