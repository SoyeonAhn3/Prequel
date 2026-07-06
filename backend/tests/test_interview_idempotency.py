"""인터뷰 답변 멱등성(BL-007): 같은 answer_id 재요청 시 진행·Claude 호출 없음."""
import app.api.interview as iv


def _fail_if_called(*args, **kwargs):
    raise AssertionError("중복 답변인데 chat()이 호출됨 — 멱등성 실패")


def test_duplicate_answer_does_not_advance(client, monkeypatch, fake_supabase):
    session = {
        "id": "s1",
        "status": "active",
        "current_question": 3,
        "token_used": 100,
        "project_id": "p1",
        "messages": [
            {"role": "user", "content": "이전 답변", "answer_id": "X", "time": "t0"},
            {
                "role": "assistant",
                "content": "AI 질문",
                "time": "t1",
                "_meta": {"topics": ["주제"], "importance": "", "example_answers": []},
            },
        ],
        "_insights": [],
        "projects": {
            "name": "P",
            "project_type": "web",
            "language": "ko",
            "user_id": "u1",
        },
    }
    monkeypatch.setattr(iv, "get_supabase", lambda: fake_supabase(session))
    monkeypatch.setattr(iv, "chat", _fail_if_called)  # 중복이면 호출되면 안 됨

    r = client.post(
        "/api/interview/answer",
        json={"session_id": "s1", "answer": "이전 답변", "answer_id": "X"},
    )

    assert r.status_code == 200
    assert r.json()["current_step"] == 3  # 진행 안 됨 = 중복 무시(멱등성 정상)
