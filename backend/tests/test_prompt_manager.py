"""prompt_manager 순수 함수 테스트 — 스텝·이력·캐시 메시지·시스템 프롬프트."""
from copy import deepcopy

from app.core import prompt_manager as pm


def test_get_step_info_in_and_out_of_range():
    assert pm.get_step_info(0)["topic"] == "project_type"
    assert pm.get_step_info(1)["title"] == "주요 사용자"
    assert pm.get_step_info(999) == pm.INTERVIEW_STEPS[-1]  # 범위 밖 → 마지막
    assert pm.get_step_info(-5) == pm.INTERVIEW_STEPS[-1]


def test_extract_step_match_and_miss():
    text = "## STEP 1 첫\n내용1\n## STEP 2 둘\n내용2\n"
    got = pm.extract_step(text, 1)
    assert "첫" in got and "내용1" in got
    assert "STEP 2" not in got  # 다음 스텝 전까지만
    assert pm.extract_step(text, 9) == ""  # 없는 스텝


def test_remove_cli_directives():
    text = "설명\n```bash\nnpm run dev\n```\nCLI 명령어를 실행하세요\n유지될 줄"
    out = pm.remove_cli_directives(text)
    assert "npm run dev" not in out  # bash 블록 제거
    assert "CLI" not in out          # CLI 언급 줄 제거
    assert "유지될 줄" in out


def test_compress_history_keeps_short_as_is():
    msgs = [{"role": "user", "content": f"m{i}"} for i in range(4)]
    assert pm.compress_history(msgs, keep_recent=6) == msgs  # 6 이하면 그대로


def test_compress_history_summarizes_old():
    msgs = [{"role": "assistant" if i % 2 else "user", "content": f"메시지{i}"} for i in range(10)]
    out = pm.compress_history(msgs, keep_recent=6)
    assert len(out) == 7  # 요약 1 + 최근 6
    assert out[0]["content"].startswith("[이전 대화 요약]")
    assert out[1:] == msgs[-6:]  # 최근 6개는 원본 유지


def test_build_cached_interview_messages_places_insights_after_breakpoint():
    messages = [
        {"role": "assistant", "content": "첫 질문", "time": "t1"},
        {"role": "user", "content": "학생용 앱입니다", "time": "t2"},
    ]

    out = pm.build_cached_interview_messages(
        messages,
        insights=[{"label": "주요 사용자", "value": "학생"}],
    )

    assert out[0] == {
        "role": "assistant",
        "content": [{"type": "text", "text": "첫 질문"}],
    }
    latest_blocks = out[-1]["content"]
    assert latest_blocks[0] == {
        "type": "text",
        "text": "학생용 앱입니다",
        "cache_control": {"type": "ephemeral"},
    }
    assert "학생" in latest_blocks[1]["text"]
    assert "cache_control" not in latest_blocks[1]

    breakpoints = [
        block
        for message in out
        for block in message["content"]
        if "cache_control" in block
    ]
    assert len(breakpoints) == 1


def test_build_cached_interview_messages_does_not_mutate_db_messages():
    messages = [
        {"role": "assistant", "content": "질문", "time": "t1", "_meta": {"topics": []}},
        {"role": "user", "content": "답변", "time": "t2", "answer_id": "answer-1"},
    ]
    original = deepcopy(messages)

    pm.build_cached_interview_messages(messages, insights=[])

    assert messages == original


def test_build_cached_interview_messages_preserves_next_turn_cache_prefix():
    first_turn = [
        {"role": "assistant", "content": "첫 질문"},
        {"role": "user", "content": "첫 답변"},
    ]
    second_turn = first_turn + [
        {"role": "assistant", "content": "두 번째 질문"},
        {"role": "user", "content": "두 번째 답변"},
    ]

    first_request = pm.build_cached_interview_messages(
        first_turn,
        insights=[{"label": "목표", "value": "MVP"}],
    )
    second_request = pm.build_cached_interview_messages(
        second_turn,
        insights=[{"label": "목표", "value": "MVP 출시"}],
    )

    # cache_control은 경계 메타데이터이므로 비교에서 제외한다. 첫 요청의
    # breakpoint까지의 실제 역할/텍스트 prefix가 다음 요청에도 그대로 남아야 한다.
    first_prefix = deepcopy(first_request)
    first_prefix[-1]["content"] = [first_prefix[-1]["content"][0]]
    first_prefix[-1]["content"][0].pop("cache_control")
    assert second_request[:len(first_prefix)] == first_prefix


def test_build_cached_interview_messages_requires_latest_user_answer():
    try:
        pm.build_cached_interview_messages([{"role": "assistant", "content": "질문"}])
    except ValueError as exc:
        assert str(exc) == "Interview messages must end with a user message"
    else:
        raise AssertionError("latest user answer validation did not run")


def test_build_system_prompt_contains_only_stable_and_step_blocks():
    blocks = pm.build_system_prompt(
        step_index=1,
        project_name="테스트앱",
        project_type="Web App",
        language="ko",
    )
    assert blocks[0]["cache_control"] == {"type": "ephemeral"}
    assert "테스트앱" in blocks[0]["text"]
    assert "Web App" in blocks[0]["text"]
    assert "한국어로 대화합니다." in blocks[0]["text"]
    assert all("cache_control" in block for block in blocks)
    assert all("\n수집된 정보:\n" not in block["text"] for block in blocks)


def test_build_system_prompt_english_and_no_insights():
    blocks = pm.build_system_prompt(step_index=0, project_name="App", language="en")
    assert "Communicate in English." in blocks[0]["text"]
    # system은 안정 블록만 포함하므로 모든 블록이 cache breakpoint다.
    assert all("cache_control" in b for b in blocks)
