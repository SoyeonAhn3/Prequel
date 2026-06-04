import json
from datetime import datetime, timezone

from app.core.claude_client import chat
from app.core.harness_loader import load_skill


def extract_all_insights(messages: list[dict]) -> list[dict]:
    insights: list[dict] = []
    seen = set()
    for msg in messages:
        if msg.get("role") != "assistant":
            continue
        content = msg.get("content", "")
        try:
            parsed = json.loads(content)
            for ins in parsed.get("insights", []):
                key = (ins.get("label", ""), ins.get("value", ""))
                if key not in seen:
                    seen.add(key)
                    insights.append(ins)
        except (json.JSONDecodeError, TypeError):
            pass
        meta = msg.get("_meta", {})
        if meta:
            for ins in meta.get("insights", []):
                key = (ins.get("label", ""), ins.get("value", ""))
                if key not in seen:
                    seen.add(key)
                    insights.append(ins)
    return insights


def extract_conversation_summary(messages: list[dict]) -> str:
    parts = []
    for msg in messages:
        role = "AI" if msg["role"] == "assistant" else "사용자"
        content = msg.get("content", "")
        if msg["role"] == "assistant":
            try:
                parsed = json.loads(content)
                content = parsed.get("message", content)
            except (json.JSONDecodeError, TypeError):
                pass
        if len(content) > 300:
            content = content[:300] + "..."
        parts.append(f"[{role}] {content}")
    return "\n".join(parts)


def generate_kickoff_document(project: dict, session: dict) -> tuple[str, dict]:
    messages = session.get("messages") or []
    insights = extract_all_insights(messages)
    conversation = extract_conversation_summary(messages)

    try:
        skill_text = load_skill("kickoff-document")
    except FileNotFoundError:
        skill_text = ""

    today = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    language = project.get("language", "ko")
    lang_instruction = "한국어로 작성합니다." if language == "ko" else "Write in English."

    insights_text = "\n".join(
        f"- {ins['label']}: {ins['value']}" for ins in insights
    ) if insights else "(수집된 인사이트 없음)"

    system_prompt = [
        {
            "type": "text",
            "text": (
                f"당신은 Prequel의 킥오프 문서 생성기입니다.\n"
                f"인터뷰에서 수집된 정보를 바탕으로 구조화된 킥오프 문서를 마크다운으로 작성합니다.\n\n"
                f"규칙:\n"
                f"- {lang_instruction}\n"
                f"- 순수 마크다운만 출력합니다. JSON이나 코드 펜스로 감싸지 마세요.\n"
                f"- 인터뷰에서 수집된 정보만 사용합니다. 추측하지 마세요.\n"
                f"- 수집되지 않은 항목은 '미정'으로 표기하거나 해당 섹션을 생략합니다.\n\n"
                f"프로젝트: {project.get('name', '(이름 없음)')}\n"
                f"유형: {project.get('project_type', '미정')}\n"
                f"설명: {project.get('description', '(없음)')}\n"
                f"생성일: {today}\n"
            ),
            "cache_control": {"type": "ephemeral"},
        },
    ]

    if skill_text:
        system_prompt.append({
            "type": "text",
            "text": f"\n문서 구조 가이드:\n{skill_text}",
        })

    user_message = (
        f"아래는 인터뷰에서 수집된 인사이트와 대화 내용입니다. "
        f"이를 바탕으로 킥오프 문서를 작성해주세요.\n\n"
        f"## 수집된 인사이트\n{insights_text}\n\n"
        f"## 인터뷰 대화 요약\n{conversation}"
    )

    doc_text, usage = chat(
        system=system_prompt,
        messages=[{"role": "user", "content": user_message}],
        max_tokens=4096,
    )

    return doc_text, usage


def generate_final_document(
    project: dict,
    interview_session: dict,
    finalize_session: dict,
    design_context: str = "",
) -> tuple[str, dict]:
    """Phase 6 doc v3 — synthesize interview + design + evaluation/done/gap/checklist
    into one complete kickoff document. Returns (markdown, usage)."""
    messages = interview_session.get("messages") or []
    insights = extract_all_insights(messages)
    conversation = extract_conversation_summary(messages)

    try:
        skill_text = load_skill("kickoff-document")
    except FileNotFoundError:
        skill_text = ""

    today = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    language = project.get("language", "ko")
    lang_instruction = "한국어로 작성합니다." if language == "ko" else "Write in English."

    insights_text = "\n".join(
        f"- {ins['label']}: {ins['value']}" for ins in insights
    ) if insights else "(수집된 인사이트 없음)"

    def _j(value) -> str:
        return json.dumps(value, ensure_ascii=False, indent=2) if value else "(없음)"

    finalize_text = (
        f"## 정직한 평가\n{_j(finalize_session.get('evaluation'))}\n\n"
        f"## 완료 조건 (DoD)\n{_j(finalize_session.get('done_criteria'))}\n\n"
        f"## 빈틈 점검\n{_j(finalize_session.get('gaps'))}\n\n"
        f"## 착수 체크리스트\n{_j(finalize_session.get('checklist'))}"
    )

    system_prompt = [
        {
            "type": "text",
            "text": (
                f"당신은 Prequel의 최종 킥오프 문서 생성기입니다.\n"
                f"인터뷰·설계·평가·완료조건·빈틈점검·체크리스트를 종합하여 완성된 킥오프 문서를 마크다운으로 작성합니다.\n\n"
                f"규칙:\n"
                f"- {lang_instruction}\n"
                f"- 순수 마크다운만 출력합니다. JSON이나 코드 펜스로 감싸지 마세요.\n"
                f"- 제공된 정보만 사용합니다. 추측하지 마세요.\n"
                f"- '정직한 평가'는 6개 차원의 점수(🟢/🟡/🔴 + 점수)와 종합 판정, AI 권고를 표로 정리한 별도 섹션으로 반드시 포함합니다.\n"
                f"- 완료 조건(DoD)·빈틈 점검·착수 체크리스트도 각각 별도 섹션으로 포함합니다.\n"
                f"- 설계 정보가 제공되면 시스템 구조·데이터 모델 섹션도 포함합니다.\n\n"
                f"프로젝트: {project.get('name', '(이름 없음)')}\n"
                f"유형: {project.get('project_type', '미정')}\n"
                f"설명: {project.get('description', '(없음)')}\n"
                f"생성일: {today}\n"
            ),
            "cache_control": {"type": "ephemeral"},
        },
    ]

    if skill_text:
        system_prompt.append({
            "type": "text",
            "text": f"\n문서 구조 가이드:\n{skill_text}",
        })

    design_block = f"\n\n# 설계\n{design_context}" if design_context else ""
    user_message = (
        f"아래 정보를 종합하여 완성된 최종 킥오프 문서를 작성해주세요.\n\n"
        f"## 수집된 인사이트\n{insights_text}\n\n"
        f"## 인터뷰 대화 요약\n{conversation}"
        f"{design_block}\n\n"
        f"# 평가 및 마무리\n{finalize_text}"
    )

    doc_text, usage = chat(
        system=system_prompt,
        messages=[{"role": "user", "content": user_message}],
        max_tokens=8192,
    )

    return doc_text, usage
