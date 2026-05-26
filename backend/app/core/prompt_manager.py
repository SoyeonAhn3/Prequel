import re

from app.core.harness_loader import load_skill

INTERVIEW_STEPS = [
    {"title": "프로젝트 유형 감지", "topic": "project_type"},
    {"title": "주요 사용자", "topic": "target_users"},
    {"title": "핵심 가치", "topic": "core_value"},
    {"title": "데이터 소스", "topic": "data_sources"},
    {"title": "기술 스택", "topic": "tech_stack"},
    {"title": "성공 지표", "topic": "success_metrics"},
    {"title": "리스크", "topic": "risks"},
    {"title": "유형별 심화 (1/3)", "topic": "type_deep_1"},
    {"title": "유형별 심화 (2/3)", "topic": "type_deep_2"},
    {"title": "마무리 확인", "topic": "wrap_up"},
    {"title": "AI 제안", "topic": "suggestions"},
]


def get_step_info(step_index: int) -> dict:
    if 0 <= step_index < len(INTERVIEW_STEPS):
        return INTERVIEW_STEPS[step_index]
    return INTERVIEW_STEPS[-1]


def extract_step(skill_text: str, step_number: int) -> str:
    pattern = rf"(## STEP {step_number}\b.*?)(?=## STEP \d+\b|\Z)"
    match = re.search(pattern, skill_text, re.DOTALL)
    if match:
        return match.group(1).strip()
    return ""


def remove_cli_directives(text: str) -> str:
    text = re.sub(r"```(?:bash|shell|cmd|powershell).*?```", "", text, flags=re.DOTALL)
    lines = [
        line for line in text.split("\n")
        if not re.search(r"\b(CLI|터미널|명령어를 실행|command line)\b", line, re.IGNORECASE)
    ]
    return "\n".join(lines)


def compress_history(messages: list[dict], keep_recent: int = 6) -> list[dict]:
    if len(messages) <= keep_recent:
        return messages

    old = messages[:-keep_recent]
    recent = messages[-keep_recent:]

    parts = []
    for msg in old:
        role = "AI" if msg["role"] == "assistant" else "사용자"
        content = msg["content"]
        if len(content) > 120:
            content = content[:120] + "..."
        parts.append(f"- {role}: {content}")

    summary_msg = {
        "role": "user",
        "content": f"[이전 대화 요약]\n" + "\n".join(parts),
    }
    return [summary_msg] + recent


def build_system_prompt(
    step_index: int,
    project_name: str,
    project_type: str | None = None,
    language: str = "ko",
    insights: list[dict] | None = None,
) -> list[dict]:
    try:
        skill_text = load_skill("kickoff-interview")
    except FileNotFoundError:
        skill_text = ""

    step_number = step_index + 1

    if INTERVIEW_STEPS[step_index]["topic"] == "suggestions":
        try:
            step_content = load_skill("kickoff-suggest")
        except FileNotFoundError:
            step_content = ""
    else:
        step_content = extract_step(skill_text, step_number)

    step_content = remove_cli_directives(step_content)

    lang_instruction = "한국어로 대화합니다." if language == "ko" else "Communicate in English."

    base = (
        f"당신은 Prequel의 AI 인터뷰어입니다. "
        f"프로젝트 킥오프 문서를 작성하기 위해 사용자에게 구조화된 질문을 합니다.\n\n"
        f"규칙:\n"
        f"- {lang_instruction}\n"
        f"- 한 번에 하나의 질문만 합니다.\n"
        f"- 사용자의 답변이 충분하면 다음 주제로 넘어갑니다.\n"
        f"- 답변이 모호하면 한 번만 추가 질문합니다.\n"
        f"- 친근하지만 전문적인 톤을 유지합니다.\n"
        f"- 이미 수집된 정보를 반복 질문하지 않습니다.\n\n"
        f"프로젝트: {project_name}\n"
    )

    if project_type:
        base += f"감지된 유형: {project_type}\n"

    if insights:
        base += "\n수집된 정보:\n"
        for ins in insights:
            base += f"- {ins['label']}: {ins['value']}\n"

    base += (
        "\n응답 형식:\n"
        "반드시 아래 JSON 객체만 출력하세요. JSON 앞뒤에 어떤 텍스트도, 코드 펜스(```)도 붙이지 마세요.\n"
        '{\n'
        '  "message": "사용자에게 보여줄 대화 메시지 (마크다운 사용 가능)",\n'
        '  "insights": [{"label": "항목명", "value": "추출된 값"}],\n'
        '  "step_complete": false,\n'
        '  "topics": ["관련 주제 태그"],\n'
        '  "importance": "높음",\n'
        '  "example_answers": [{"label": "예시 항목", "text": "예시 내용"}]\n'
        '}\n'
        "중요: message 필드 안에 대화 내용을 넣고, JSON 바깥에는 아무것도 쓰지 마세요.\n"
    )

    blocks = [
        {
            "type": "text",
            "text": base,
            "cache_control": {"type": "ephemeral"},
        },
    ]

    if step_content:
        blocks.append({
            "type": "text",
            "text": f"\n현재 단계 지시사항:\n{step_content}",
        })

    return blocks
