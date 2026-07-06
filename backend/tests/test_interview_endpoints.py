"""인터뷰 엔드포인트 통합 테스트(start·answer) — 가짜 Supabase + 가짜 chat.

인터뷰 로직의 제어 흐름(세션 생성·단계 진행·응답 조립)을 실제 DB/Claude 없이 검증.
"""
import app.api.interview as iv
import app.core.usage as usage_mod


class _Result:
    def __init__(self, data):
        self.data = data


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
    def __init__(self, tables):
        self.tables = tables

    def table(self, name):
        return _Table(name, self.tables.get(name, []))


def _install(monkeypatch, tables, chat_json):
    sb = _SB(tables)
    monkeypatch.setattr(iv, "get_supabase", lambda: sb)
    monkeypatch.setattr(usage_mod, "get_supabase", lambda: sb)
    monkeypatch.setattr(iv, "chat", lambda **k: (chat_json, {"input_tokens": 10, "output_tokens": 5}))


def test_start_creates_session_and_returns_first_question(client, monkeypatch):
    project = {"id": "p1", "name": "P", "project_type": "Web", "language": "ko",
               "description": "d", "user_id": "u1"}
    _install(
        monkeypatch,
        {"projects": [project], "interview_sessions": []},
        '{"message":"첫질문","step_complete":false,"insights":[],"topics":[],"example_answers":[]}',
    )
    r = client.post("/api/interview/start", json={"project_id": "p1"})
    assert r.status_code == 200
    body = r.json()
    assert body["question"] == "첫질문"
    assert body["current_step"] == 0


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
