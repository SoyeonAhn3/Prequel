"""prompt_manager 순수 함수 테스트 — 스텝 정보·추출·CLI 제거·이력 압축·시스템 프롬프트."""
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


def test_build_system_prompt_stable_block_and_insights():
    blocks = pm.build_system_prompt(
        step_index=1,
        project_name="테스트앱",
        project_type="Web App",
        language="ko",
        insights=[{"label": "주요 사용자", "value": "학생"}],
    )
    assert blocks[0]["cache_control"] == {"type": "ephemeral"}
    assert "테스트앱" in blocks[0]["text"]
    assert "Web App" in blocks[0]["text"]
    assert "한국어로 대화합니다." in blocks[0]["text"]
    # insights는 캐시 안 되는 마지막 블록
    assert "학생" in blocks[-1]["text"]
    assert "cache_control" not in blocks[-1]


def test_build_system_prompt_english_and_no_insights():
    blocks = pm.build_system_prompt(step_index=0, project_name="App", language="en")
    assert "Communicate in English." in blocks[0]["text"]
    # insights 없으면 캐시 안 되는 volatile 블록이 없음 → 모든 블록에 cache_control 존재
    assert all("cache_control" in b for b in blocks)
