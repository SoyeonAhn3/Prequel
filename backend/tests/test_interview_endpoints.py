"""인터뷰 엔드포인트 통합 테스트(start·answer) — 가짜 Supabase + 가짜 chat.

인터뷰 로직의 제어 흐름(세션 생성·단계 진행·응답 조립)을 실제 DB/Claude 없이 검증.
"""
import app.api.interview as iv
import app.core.usage as usage_mod
from fastapi import HTTPException


class _Result:
    def __init__(self, data):
        self.data = data


class _RpcQuery:
    def __init__(self, handler, params):
        self.handler, self.params = handler, params

    def execute(self):
        return _Result(self.handler(self.params))


class _Table:
    def __init__(self, name, rows):
        self.name, self.rows = name, rows
        self.op, self.payload, self._single = "select", None, False

    def select(self, *a, **k):
        self.op = "select"
        return self

    def insert(self, data, *a, **k):
        self.op, self.payload = "insert", data
        return self

    def update(self, data, *a, **k):
        self.op, self.payload = "update", data
        return self

    def eq(self, *a, **k):
        return self

    def in_(self, *a, **k):
        return self

    def is_(self, *a, **k):
        return self

    def order(self, *a, **k):
        return self

    def limit(self, *a, **k):
        return self

    def single(self):
        self._single = True
        return self

    def maybe_single(self):
        self._single = True
        return self

    def execute(self):
        if self.op == "insert":
            data = [{**self.payload, "id": self.payload.get("id", "new-id")}]
        elif self.op == "update":
            data = []
        else:
            data = self.rows
        if self._single:
            return _Result(data[0] if data else None)
        return _Result(data)


class _SB:
    def __init__(self, tables, rpc_handler=None):
        self.tables = tables
        self.rpc_calls = []
        self.chat_calls = []
        self._rpc_handler = rpc_handler or self._start_interview_rpc

    def table(self, name):
        return _Table(name, self.tables.get(name, []))

    def rpc(self, name, params):
        self.rpc_calls.append((name, dict(params)))
        assert name == "start_interview_atomic"
        return _RpcQuery(self._rpc_handler, params)

    def _start_interview_rpc(self, params):
        project = next(
            (
                row for row in self.tables.get("projects", [])
                if row.get("id") == params["p_project_id"]
                and row.get("user_id") == params["p_user_id"]
            ),
            None,
        )
        if project is None:
            raise RuntimeError("PROJECT_NOT_FOUND")
        charged = not project.get("interview_credit_charged_at")
        if charged:
            project["interview_credit_charged_at"] = "2026-01-01T00:00:00+00:00"
        return {"project": dict(project), "charged": charged}


def _install(monkeypatch, tables, chat_json, rpc_handler=None):
    sb = _SB(tables, rpc_handler=rpc_handler)
    monkeypatch.setattr(iv, "get_supabase", lambda: sb)
    monkeypatch.setattr(usage_mod, "get_supabase", lambda: sb)
    monkeypatch.setattr(iv.settings, "DEV_BYPASS_AUTH", False)

    def fake_chat(**kwargs):
        sb.chat_calls.append(kwargs)
        return chat_json, {"input_tokens": 10, "output_tokens": 5}

    monkeypatch.setattr(iv, "chat", fake_chat)
    return sb


def test_start_creates_session_and_returns_first_question(client, monkeypatch):
    project = {"id": "p1", "name": "P", "project_type": "Web", "language": "ko",
               "description": "d", "user_id": "u1"}
    sb = _install(
        monkeypatch,
        {"projects": [project], "interview_sessions": []},
        '{"message":"첫질문","step_complete":false,"insights":[],"topics":[],"example_answers":[]}',
    )
    r = client.post("/api/interview/start", json={"project_id": "p1"})
    assert r.status_code == 200
    body = r.json()
    assert body["question"] == "첫질문"
    assert body["current_step"] == 0
    assert sb.rpc_calls == [("start_interview_atomic", {
        "p_project_id": "p1", "p_user_id": "u1", "p_bypass_limit": False,
    })]
    assert len(sb.chat_calls) == 1


def test_start_credit_exhaustion_stops_before_claude(client, monkeypatch):
    def exhausted(_params):
        raise RuntimeError("CREDIT_LIMIT_EXCEEDED:2")

    sb = _install(
        monkeypatch,
        {"projects": [], "interview_sessions": []},
        "{}",
        rpc_handler=exhausted,
    )
    r = client.post("/api/interview/start", json={"project_id": "p1"})
    assert r.status_code == 403
    assert "2회" in r.json()["detail"]
    assert sb.chat_calls == []


def test_start_wrong_project_phase_stops_before_claude(client, monkeypatch):
    def wrong_phase(_params):
        raise RuntimeError("INVALID_PROJECT_STATE:designing")

    sb = _install(
        monkeypatch,
        {"projects": [], "interview_sessions": []},
        "{}",
        rpc_handler=wrong_phase,
    )
    r = client.post("/api/interview/start", json={"project_id": "p1"})
    assert r.status_code == 409
    assert sb.chat_calls == []


def test_start_retry_after_claude_failure_does_not_recharge(client, monkeypatch):
    project = {
        "id": "p1", "name": "P", "project_type": "Web", "language": "ko",
        "description": "d", "user_id": "u1", "status": "in_progress",
    }
    charge_state = {"marked": False, "credits_used": 0}

    def atomic_charge(_params):
        charged = not charge_state["marked"]
        if charged:
            charge_state["marked"] = True
            charge_state["credits_used"] += 1
        return {"project": dict(project), "charged": charged}

    sb = _install(
        monkeypatch,
        {"projects": [project], "interview_sessions": []},
        "{}",
        rpc_handler=atomic_charge,
    )

    def failed_chat(**kwargs):
        sb.chat_calls.append(kwargs)
        raise HTTPException(status_code=503, detail="AI service temporarily unavailable")

    monkeypatch.setattr(iv, "chat", failed_chat)
    first = client.post("/api/interview/start", json={"project_id": "p1"})
    second = client.post("/api/interview/start", json={"project_id": "p1"})

    assert first.status_code == second.status_code == 503
    assert charge_state["credits_used"] == 1
    assert len(sb.rpc_calls) == 2
    assert len(sb.chat_calls) == 2


def test_answer_advances_step_when_complete(client, monkeypatch):
    session = {
        "id": "s1", "status": "active", "current_question": 3, "token_used": 0, "project_id": "p1",
        "messages": [
            {"role": "user", "content": "a", "answer_id": "OLD"},
            {"role": "assistant", "content": "q", "_meta": {}},
        ],
        "_insights": [],
        "projects": {"name": "P", "project_type": "Web", "language": "ko", "user_id": "u1"},
    }
    _install(
        monkeypatch,
        {"interview_sessions": [session], "projects": [{"id": "p1", "user_id": "u1"}]},
        '{"message":"다음","step_complete":true,"insights":[],"topics":[],"example_answers":[]}',
    )
    r = client.post("/api/interview/answer",
                    json={"session_id": "s1", "answer": "내답변", "answer_id": "NEW"})
    assert r.status_code == 200
    assert r.json()["current_step"] == 4  # step_complete → 한 칸 진행


def test_answer_uses_full_history_cache_boundary_and_uncached_insights(client, monkeypatch):
    history = []
    for index in range(4):
        history.extend([
            {"role": "user", "content": f"이전 답변 {index}"},
            {"role": "assistant", "content": f"이전 질문 {index}", "_meta": {}},
        ])
    session = {
        "id": "s1", "status": "active", "current_question": 3, "token_used": 0,
        "project_id": "p1", "messages": history,
        "_insights": [{"label": "주요 사용자", "value": "학생", "step": 1}],
        "projects": {"name": "P", "project_type": "Web", "language": "ko", "user_id": "u1"},
    }
    sb = _install(
        monkeypatch,
        {"interview_sessions": [session], "projects": [{"id": "p1", "user_id": "u1"}]},
        '{"message":"다음","step_complete":false,"insights":[],"topics":[],"example_answers":[]}',
    )

    response = client.post(
        "/api/interview/answer",
        json={"session_id": "s1", "answer": "새 답변", "answer_id": "NEW"},
    )

    assert response.status_code == 200
    call = sb.chat_calls[0]
    assert len(call["messages"]) == 9  # 8개 기존 이력 + 최신 답변, 압축 없음
    assert all(
        "[이전 대화 요약]" not in block["text"]
        for message in call["messages"]
        for block in message["content"]
    )

    system_text = "".join(block["text"] for block in call["system"])
    assert "\n수집된 정보:\n" not in system_text
    assert "- 주요 사용자: 학생" not in system_text

    latest_blocks = call["messages"][-1]["content"]
    assert latest_blocks[0] == {
        "type": "text",
        "text": "새 답변",
        "cache_control": {"type": "ephemeral"},
    }
    assert "학생" in latest_blocks[1]["text"]
    assert "cache_control" not in latest_blocks[1]

    breakpoints = sum(
        "cache_control" in block for block in call["system"]
    ) + sum(
        "cache_control" in block
        for message in call["messages"]
        for block in message["content"]
    )
    assert breakpoints == 3
    assert breakpoints <= 4


def test_status_returns_session_info(client, monkeypatch):
    session = {
        "id": "s1", "status": "active", "current_question": 2, "token_used": 42,
        "project_id": "p1",
        "messages": [{"role": "user", "content": "a"}, {"role": "assistant", "content": "q"}],
        "projects": {"user_id": "u1"},
    }
    _install(monkeypatch, {"interview_sessions": [session]}, "{}")
    r = client.get("/api/interview/status/s1")
    assert r.status_code == 200
    body = r.json()
    assert body["status"] == "active"
    assert body["current_step"] == 2
    assert body["answer_count"] == 1  # user 메시지 1개
    assert body["token_used"] == 42


def test_session_by_project_returns_latest(client, monkeypatch):
    session = {
        "id": "s1", "status": "active", "current_question": 2, "token_used": 42,
        "created_at": "t", "paused_at": None, "_insights": [{"label": "L", "value": "V"}],
    }
    _install(
        monkeypatch,
        {"projects": [{"id": "p1", "user_id": "u1"}], "interview_sessions": [session]},
        "{}",
    )
    r = client.get("/api/interview/session/p1")
    assert r.status_code == 200
    body = r.json()
    assert body["session"]["id"] == "s1"
    assert body["insights"] == [{"label": "L", "value": "V"}]


def test_resume_returns_current_state(client, monkeypatch):
    session = {
        "id": "s1", "status": "paused", "current_question": 3, "token_used": 10,
        "project_id": "p1",
        "messages": [
            {"role": "user", "content": "a"},
            {"role": "assistant", "content": "재개질문", "_meta": {"topics": ["t"]}},
        ],
        "_insights": [],
        "projects": {"name": "P", "language": "ko", "user_id": "u1"},
    }
    _install(monkeypatch, {"interview_sessions": [session]}, "{}")
    r = client.post("/api/interview/resume", json={"session_id": "s1"})
    assert r.status_code == 200
    body = r.json()
    assert body["question"] == "재개질문"  # 마지막 AI 메시지 = 현재 상태
    assert body["current_step"] == 3
