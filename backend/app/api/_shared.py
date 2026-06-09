"""Shared helpers for AI-generation session endpoints (design, finalize).

Table-independent utilities: interview/design context builders + Claude JSON
response parsing with truncation repair. Kept here so both design.py and
finalize.py reuse one copy.
"""
import json
import re

from fastapi import HTTPException

from app.core.supabase import get_supabase


DESIGN_STEP_COLS = ("requirements", "architecture", "data_model", "ai_workflow")
FINALIZE_STEP_COLS = ("evaluation", "done_criteria", "gaps", "checklist")


def session_content_score(session: dict, columns: tuple[str, ...]) -> int:
    """Count how many of the named step columns are populated (non-empty)."""
    return sum(1 for col in columns if session.get(col))


def pick_canonical_session(sessions: list[dict], columns: tuple[str, ...]) -> dict | None:
    """From a project's session rows, return the one holding the most step
    content. Ties resolve to the most recently created. Returns None if empty.

    A project can accumulate duplicate session rows (a completed session that a
    later step re-forked). Readers AND the get-or-create path both use this so
    they converge on the same canonical row instead of whichever happens to be
    newest — which may be a mostly-empty duplicate.
    """
    if not sessions:
        return None
    return max(
        sessions,
        key=lambda s: (session_content_score(s, columns), s.get("created_at") or ""),
    )


def get_interview_context(project_id: str) -> str:
    """Latest completed interview as a markdown context block. Raises 400 if none."""
    sb = get_supabase()
    session = (
        sb.table("interview_sessions")
        .select("*")
        .eq("project_id", project_id)
        .eq("status", "completed")
        .order("created_at", desc=True)
        .limit(1)
        .execute()
    )
    if not session.data:
        raise HTTPException(status_code=400, detail="완료된 인터뷰 세션이 없습니다")

    s = session.data[0]
    messages = s.get("messages", [])
    insights = s.get("_insights", [])

    parts = []
    for ins in insights:
        parts.append(f"- {ins.get('label', '')}: {ins.get('value', '')}")

    conversation = []
    for msg in messages[-20:]:
        role = msg.get("role", "user")
        text = msg.get("content", "")
        conversation.append(f"[{role}] {text}")

    return (
        "## 인터뷰 인사이트\n" + "\n".join(parts)
        + "\n\n## 최근 대화 내용\n" + "\n".join(conversation)
    )


def get_design_context(project_id: str) -> str:
    """Latest design session as a markdown context block. Returns '' if design
    was skipped (no session) — Phase 6 must work with or without design."""
    sb = get_supabase()
    result = (
        sb.table("design_sessions")
        .select("*")
        .eq("project_id", project_id)
        .order("created_at", desc=True)
        .execute()
    )
    s = pick_canonical_session(result.data, DESIGN_STEP_COLS)
    if not s:
        return ""

    parts = []

    reqs = s.get("requirements")
    if reqs:
        parts.append("## 요구사항\n" + "\n".join(
            f"- [{(r.get('priority') or '').upper()}] {r.get('text', '')}" for r in reqs
        ))

    arch = s.get("architecture")
    if arch and arch.get("components"):
        parts.append("## 아키텍처\n" + "\n".join(
            f"- {c.get('name', '')} ({c.get('technology', '')}): {c.get('description', '')}"
            for c in arch["components"]
        ))

    dm = s.get("data_model")
    if dm and dm.get("entities"):
        parts.append("## 데이터 모델\n" + "\n".join(
            f"- {e.get('name', '')}: {e.get('description', '')}" for e in dm["entities"]
        ))

    aw = s.get("ai_workflow")
    if isinstance(aw, dict) and (aw.get("model") or aw.get("task")):
        parts.append(f"## AI 흐름\n- 모델: {aw.get('model', '')} / 작업: {aw.get('task', '')}")
    elif isinstance(aw, str) and aw.strip():
        parts.append("## AI 흐름\n" + aw[:500])

    return "\n\n".join(parts)


def parse_json_response(text: str) -> dict:
    """Parse Claude JSON, stripping code fences and repairing truncation."""
    text = text.strip()
    if text.startswith("```"):
        lines = text.split("\n")
        lines = lines[1:]
        if lines and lines[-1].strip() == "```":
            lines = lines[:-1]
        text = "\n".join(lines)
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        return repair_truncated_json(text)


def repair_truncated_json(text: str) -> dict:
    """Recover a JSON object truncated mid-stream by Claude's token limit."""
    last_good = -1
    for m in re.finditer(r'(?:,|\{|\[)\s*$', text, re.MULTILINE):
        last_good = m.start()

    for end in range(len(text), max(len(text) - 2000, 0), -1):
        candidate = text[:end].rstrip()
        if candidate.endswith(','):
            candidate = candidate[:-1]
        opens = candidate.count('{') - candidate.count('}')
        open_arrays = candidate.count('[') - candidate.count(']')
        if opens < 0 or open_arrays < 0:
            continue
        candidate += ']' * open_arrays + '}' * opens
        try:
            return json.loads(candidate)
        except json.JSONDecodeError:
            continue

    raise ValueError("Could not repair truncated JSON response from Claude")
