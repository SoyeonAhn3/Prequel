"""마감(Phase 6) 엔드포인트 통합 테스트 — 상태 유지 가짜 Supabase.

evaluate/checklist 생성 흐름과 세션 조회·수정 분기를 검증한다.
_shared.py 의 인터뷰/설계 컨텍스트 조립·JSON 파싱도 함께 커버된다.
Claude 호출(chat)·스킬 로딩(load_skill)·최종 문서 생성은 가짜로 대체.
"""
import app.api.finalize as fin
import app.api._shared as shared
import app.core.usage as usage_mod

from tests._fakes import FakeSupabase

_TS = "2026-01-01T00:00:00+00:00"


def _project(status="designing", **over):
    base = {
        "id": "p1", "user_id": "u1", "name": "테스트 프로젝트",
        "project_type": "Web", "description": "설명",
        "status": status, "created_at": _TS,
    }
    base.update(over)
    return base


def _completed_interview():
    return {
        "id": "iv1", "project_id": "p1", "status": "completed",
        "created_at": _TS,
        "messages": [
            {"role": "user", "content": "웹앱을 만들고 싶어요"},
            {"role": "assistant", "content": "어떤 기능이 필요한가요?"},
        ],
        "_insights": [{"label": "목표", "value": "MVP 출시"}],
    }


def _install(monkeypatch, fake, chat_json='{"score": 5, "summary": "좋음"}'):
    """세 모듈(finalize·_shared·usage)의 get_supabase 를 같은 가짜로 연결."""
    monkeypatch.setattr(fin, "get_supabase", lambda: fake)
    monkeypatch.setattr(shared, "get_supabase", lambda: fake)
    monkeypatch.setattr(usage_mod, "get_supabase", lambda: fake)
    monkeypatch.setattr(fin, "load_skill", lambda name: f"SKILL::{name}")
    monkeypatch.setattr(
        fin, "chat",
        lambda system, messages, max_tokens=8192: (chat_json, {"input_tokens": 10, "output_tokens": 5}),
    )


# ── 생성: evaluate ─────────────────────────────────────────

def test_evaluate_creates_session_and_flips_status(client, monkeypatch):
    fake = FakeSupabase({
        "projects": [_project(status="designing")],
        "interview_sessions": [_completed_interview()],
        "design_sessions": [],
        "finalize_sessions": [],
    })
    _install(monkeypatch, fake)
    r = client.post("/api/finalize/evaluate", json={"project_id": "p1"})
    assert r.status_code == 200
    body = r.json()
    assert body["evaluation"] == {"score": 5, "summary": "좋음"}
    assert body["current_step"] == "done"          # 다음 단계로 진행
    # 프로젝트 상태가 evaluating 으로 전환
    assert fake.rows("projects")[0]["status"] == "evaluating"
    # 마감 세션이 새로 생성됨
    assert len(fake.rows("finalize_sessions")) == 1


def test_evaluate_requires_completed_interview(client, monkeypatch):
    fake = FakeSupabase({
        "projects": [_project()],
        "interview_sessions": [],        # 완료된 인터뷰 없음 → 400
        "design_sessions": [],
        "finalize_sessions": [],
    })
    _install(monkeypatch, fake)
    r = client.post("/api/finalize/evaluate", json={"project_id": "p1"})
    assert r.status_code == 400


def test_generate_project_not_found(client, monkeypatch):
    _install(monkeypatch, FakeSupabase({"projects": []}))
    r = client.post("/api/finalize/evaluate", json={"project_id": "nope"})
    assert r.status_code == 404


# ── 생성: checklist → 완료 처리 ────────────────────────────

def test_checklist_completes_project(client, monkeypatch):
    fake = FakeSupabase({
        "projects": [_project(status="evaluating")],
        "interview_sessions": [_completed_interview()],
        "design_sessions": [],
        "finalize_sessions": [{
            "id": "f1", "project_id": "p1", "current_step": "checklist",
            "status": "in_progress", "created_at": _TS,
            "evaluation": {"score": 5}, "done_criteria": {"a": 1},
            "gaps": {"b": 2},
        }],
    })
    _install(monkeypatch, fake, chat_json='{"items": ["할 일1", "할 일2"]}')
    monkeypatch.setattr(
        fin, "generate_final_document",
        lambda project, interview, session, design_ctx: ("# 최종 문서", {"input_tokens": 20, "output_tokens": 8}),
    )
    r = client.post("/api/finalize/checklist", json={"project_id": "p1"})
    assert r.status_code == 200
    assert r.json()["status"] == "completed"
    # 프로젝트도 completed + 문서 저장
    proj = fake.rows("projects")[0]
    assert proj["status"] == "completed"
    assert proj["kickoff_doc"] == "# 최종 문서"


# ── 조회 ───────────────────────────────────────────────────

def test_get_finalize_session(client, monkeypatch):
    fake = FakeSupabase({
        "projects": [_project()],
        "finalize_sessions": [{
            "id": "f1", "project_id": "p1", "current_step": "gap",
            "status": "in_progress", "created_at": _TS,
            "evaluation": {"score": 5}, "done_criteria": {"a": 1},
        }],
    })
    _install(monkeypatch, fake)
    r = client.get("/api/finalize/session/p1")
    assert r.status_code == 200
    body = r.json()
    assert body["id"] == "f1"
    assert body["evaluation"] == {"score": 5}


def test_get_finalize_session_not_found(client, monkeypatch):
    fake = FakeSupabase({"projects": [_project()], "finalize_sessions": []})
    _install(monkeypatch, fake)
    r = client.get("/api/finalize/session/p1")
    assert r.status_code == 404


# ── 수정 ───────────────────────────────────────────────────

def test_update_finalize_step(client, monkeypatch):
    fake = FakeSupabase({
        "projects": [_project()],
        "finalize_sessions": [{
            "id": "f1", "project_id": "p1", "current_step": "gap",
            "status": "in_progress", "created_at": _TS, "gaps": {"old": True},
        }],
    })
    _install(monkeypatch, fake)
    r = client.put("/api/finalize/gap/f1", json={"data": {"new": True}})
    assert r.status_code == 200
    assert r.json()["gaps"] == {"new": True}


def test_update_finalize_invalid_step(client, monkeypatch):
    _install(monkeypatch, FakeSupabase({"finalize_sessions": []}))
    r = client.put("/api/finalize/bogus/f1", json={"data": {}})
    assert r.status_code == 400


def test_update_finalize_step_not_found(client, monkeypatch):
    _install(monkeypatch, FakeSupabase({"finalize_sessions": []}))
    r = client.put("/api/finalize/gap/missing", json={"data": {"x": 1}})
    assert r.status_code == 404
