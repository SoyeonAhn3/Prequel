import json
from datetime import datetime, timezone

import structlog
from fastapi import APIRouter, Depends, HTTPException

from app.core.supabase import get_supabase
from app.core.claude_client import chat
from app.core.prompt_manager import (
    INTERVIEW_STEPS,
    build_system_prompt,
    compress_history,
    get_step_info,
)
from app.middleware.auth import get_current_user
from app.schemas.interview import (
    ExampleAnswer,
    InsightItem,
    InterviewAnswerRequest,
    InterviewPauseRequest,
    InterviewResponse,
    InterviewResumeRequest,
    InterviewStartRequest,
    InterviewStatusResponse,
    MessageItem,
    StepItem,
)

logger = structlog.get_logger()
router = APIRouter(prefix="/api/interview", tags=["interview"])

TOTAL_STEPS = len(INTERVIEW_STEPS)


def _repair_truncated_json(text: str) -> dict | None:
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
    return None


def _parse_ai_response(text: str) -> dict:
    import re

    fallback = {
        "message": text,
        "insights": [],
        "step_complete": False,
        "topics": [],
        "importance": None,
        "example_answers": [],
    }
    cleaned = text.strip()

    # Try direct JSON parse first
    try:
        if cleaned.startswith("{"):
            return json.loads(cleaned)
    except json.JSONDecodeError:
        pass

    # Extract JSON from ```json ... ``` code block
    m = re.search(r"```(?:json)?\s*\n?(\{.*?\})\s*\n?```", cleaned, re.DOTALL)
    if m:
        try:
            return json.loads(m.group(1))
        except json.JSONDecodeError:
            pass

    # Extract any JSON object in the text
    brace_start = cleaned.find("{")
    if brace_start != -1:
        depth = 0
        for i in range(brace_start, len(cleaned)):
            if cleaned[i] == "{":
                depth += 1
            elif cleaned[i] == "}":
                depth -= 1
                if depth == 0:
                    try:
                        return json.loads(cleaned[brace_start : i + 1])
                    except json.JSONDecodeError:
                        break

    # Truncated JSON recovery — token limit may have cut the response mid-JSON
    if brace_start is not None and brace_start != -1:
        repaired = _repair_truncated_json(cleaned[brace_start:])
        if repaired and "message" in repaired:
            return {**fallback, **repaired}

    return fallback


def _build_steps_list(current_step: int, session_insights: list[dict]) -> list[StepItem]:
    steps = []
    for i, step_def in enumerate(INTERVIEW_STEPS):
        if i < current_step:
            summary_parts = [
                ins["value"]
                for ins in session_insights
                if ins.get("step") == i
            ]
            summary = " · ".join(summary_parts[:2]) if summary_parts else None
            steps.append(StepItem(title=step_def["title"], status="done", summary=summary))
        elif i == current_step:
            steps.append(StepItem(title=step_def["title"], status="active"))
        else:
            steps.append(StepItem(title=step_def["title"], status="pending"))
    return steps


def _build_response(
    session: dict,
    question: str | None,
    topics: list[str],
    importance: str | None,
    example_answers: list[dict],
    session_insights: list[dict],
    new_insights: list[dict] | None = None,
) -> InterviewResponse:
    current_step = session["current_question"]
    step_info = get_step_info(current_step)

    insights_out = []
    for ins in session_insights:
        insights_out.append(InsightItem(
            label=ins["label"],
            value=ins["value"],
            is_new=False,
        ))
    if new_insights:
        for ins in new_insights:
            insights_out.append(InsightItem(
                label=ins["label"],
                value=ins["value"],
                is_new=True,
            ))

    messages_raw = session.get("messages") or []
    messages_out = []
    for msg in messages_raw[-10:]:
        messages_out.append(MessageItem(
            role="ai" if msg["role"] == "assistant" else "user",
            text=msg["content"],
            time=msg.get("time"),
        ))

    user_answers = [m for m in messages_raw if m["role"] == "user"]

    return InterviewResponse(
        session_id=session["id"],
        status=session["status"],
        current_step=current_step,
        total_steps=TOTAL_STEPS,
        step_title=step_info["title"],
        question=question,
        topics=topics,
        importance=importance,
        example_answers=[ExampleAnswer(**ea) for ea in example_answers],
        insights=insights_out,
        steps=_build_steps_list(current_step, session_insights),
        messages=messages_out,
        answer_count=len(user_answers),
    )


def _get_session_insights(session: dict) -> list[dict]:
    return session.get("_insights") or []


def _save_session(session_id: str, updates: dict):
    sb = get_supabase()
    sb.table("interview_sessions").update(updates).eq("id", session_id).execute()


@router.post("/start", response_model=InterviewResponse)
async def start_interview(
    body: InterviewStartRequest,
    user: dict = Depends(get_current_user),
):
    sb = get_supabase()

    project = (
        sb.table("projects")
        .select("*")
        .eq("id", body.project_id)
        .eq("user_id", user["id"])
        .is_("deleted_at", "null")
        .execute()
    )
    if not project.data:
        raise HTTPException(status_code=404, detail="Project not found")
    project = project.data[0]

    existing = (
        sb.table("interview_sessions")
        .select("*")
        .eq("project_id", body.project_id)
        .in_("status", ["active", "paused"])
        .execute()
    )
    if existing.data:
        session = existing.data[0]
        if session["status"] == "active":
            sb.table("interview_sessions").update({"status": "paused"}).eq("id", session["id"]).execute()
        return await resume_interview(
            body=InterviewResumeRequest(session_id=session["id"]),
            user=user,
        )

    system_prompt = build_system_prompt(
        step_index=0,
        project_name=project["name"],
        project_type=project.get("project_type"),
        language=project.get("language", "ko"),
    )

    first_message = {
        "role": "user",
        "content": f"프로젝트 이름: {project['name']}\n설명: {project.get('description', '(없음)')}",
    }

    ai_text, usage = chat(system=system_prompt, messages=[first_message], max_tokens=2048)
    parsed = _parse_ai_response(ai_text)

    now = datetime.now(timezone.utc).isoformat()
    messages = [
        first_message,
        {
            "role": "assistant",
            "content": parsed["message"],
            "time": now,
            "_meta": {
                "topics": parsed.get("topics", []),
                "importance": parsed.get("importance"),
                "example_answers": parsed.get("example_answers", []),
            },
        },
    ]

    insights = []
    for ins in parsed.get("insights", []):
        insights.append({**ins, "step": 0})

    session_data = {
        "project_id": body.project_id,
        "step": "planning",
        "status": "active",
        "current_question": 0,
        "messages": messages,
        "token_used": usage.get("input_tokens", 0) + usage.get("output_tokens", 0),
    }
    result = sb.table("interview_sessions").insert(session_data).execute()
    session = result.data[0]
    session["_insights"] = insights
    _save_session(session["id"], {"_insights": insights})

    if project.get("project_type") is None and parsed.get("insights"):
        type_insight = next(
            (i for i in parsed["insights"] if "유형" in i.get("label", "")),
            None,
        )
        if type_insight:
            sb.table("projects").update(
                {"project_type": type_insight["value"]}
            ).eq("id", body.project_id).execute()

    logger.info("interview_started", session_id=session["id"], project_id=body.project_id)

    return _build_response(
        session=session,
        question=parsed["message"],
        topics=parsed.get("topics", []),
        importance=parsed.get("importance"),
        example_answers=parsed.get("example_answers", []),
        session_insights=[],
        new_insights=insights,
    )


@router.post("/answer", response_model=InterviewResponse)
async def submit_answer(
    body: InterviewAnswerRequest,
    user: dict = Depends(get_current_user),
):
    sb = get_supabase()

    result = (
        sb.table("interview_sessions")
        .select("*, projects!inner(name, project_type, language, user_id)")
        .eq("id", body.session_id)
        .eq("status", "active")
        .execute()
    )
    if not result.data:
        raise HTTPException(status_code=404, detail="Active session not found")

    session = result.data[0]
    project = session["projects"]

    if project["user_id"] != user["id"]:
        raise HTTPException(status_code=403, detail="Not authorized")

    messages = session.get("messages") or []
    now = datetime.now(timezone.utc).isoformat()
    messages.append({"role": "user", "content": body.answer, "time": now})

    current_step = session["current_question"]
    all_insights = session.get("_insights") or []

    system_prompt = build_system_prompt(
        step_index=current_step,
        project_name=project["name"],
        project_type=project.get("project_type"),
        language=project.get("language", "ko"),
        insights=all_insights,
    )

    api_messages = compress_history([
        {"role": m["role"], "content": m["content"]} for m in messages
    ])

    ai_text, usage = chat(system=system_prompt, messages=api_messages, max_tokens=2048)
    parsed = _parse_ai_response(ai_text)

    messages.append({
        "role": "assistant",
        "content": parsed["message"],
        "time": now,
        "_meta": {
            "topics": parsed.get("topics", []),
            "importance": parsed.get("importance"),
            "example_answers": parsed.get("example_answers", []),
        },
    })

    new_insights = []
    for ins in parsed.get("insights", []):
        new_insights.append({**ins, "step": current_step})
    existing_labels = {ins["label"] for ins in new_insights}
    all_insights = [i for i in all_insights if i["label"] not in existing_labels]
    all_insights.extend(new_insights)

    next_step = current_step
    status = "active"
    if parsed.get("step_complete", False):
        next_step = current_step + 1
        if next_step >= TOTAL_STEPS:
            status = "completed"
            next_step = TOTAL_STEPS - 1

    total_tokens = session.get("token_used", 0) + usage.get("input_tokens", 0) + usage.get("output_tokens", 0)

    updates: dict = {
        "messages": messages,
        "current_question": next_step,
        "token_used": total_tokens,
        "_insights": all_insights,
    }
    if status == "completed":
        updates["status"] = "completed"
        updates["completed_at"] = now
    _save_session(body.session_id, updates)

    sb.table("projects").update({
        "current_step": next_step,
    }).eq("id", session["project_id"]).execute()

    session["messages"] = messages
    session["current_question"] = next_step
    session["status"] = status
    session["_insights"] = all_insights
    session["token_used"] = total_tokens

    logger.info(
        "answer_submitted",
        session_id=body.session_id,
        step=next_step,
        step_advanced=next_step != current_step,
    )

    return _build_response(
        session=session,
        question=parsed["message"],
        topics=parsed.get("topics", []),
        importance=parsed.get("importance"),
        example_answers=parsed.get("example_answers", []),
        session_insights=[i for i in all_insights if i not in new_insights],
        new_insights=new_insights,
    )


@router.post("/pause")
async def pause_interview(
    body: InterviewPauseRequest,
    user: dict = Depends(get_current_user),
):
    sb = get_supabase()

    result = (
        sb.table("interview_sessions")
        .select("*, projects!inner(user_id)")
        .eq("id", body.session_id)
        .eq("status", "active")
        .execute()
    )
    if not result.data:
        raise HTTPException(status_code=404, detail="Active session not found")

    if result.data[0]["projects"]["user_id"] != user["id"]:
        raise HTTPException(status_code=403, detail="Not authorized")

    now = datetime.now(timezone.utc).isoformat()
    _save_session(body.session_id, {"status": "paused", "paused_at": now})

    logger.info("interview_paused", session_id=body.session_id)
    return {"detail": "Interview paused", "session_id": body.session_id}


@router.post("/resume", response_model=InterviewResponse)
async def resume_interview(
    body: InterviewResumeRequest,
    user: dict = Depends(get_current_user),
):
    sb = get_supabase()

    result = (
        sb.table("interview_sessions")
        .select("*, projects!inner(name, project_type, language, user_id)")
        .eq("id", body.session_id)
        .eq("status", "paused")
        .execute()
    )
    if not result.data:
        raise HTTPException(status_code=404, detail="Paused session not found")

    session = result.data[0]
    if session["projects"]["user_id"] != user["id"]:
        raise HTTPException(status_code=403, detail="Not authorized")

    _save_session(body.session_id, {"status": "active", "paused_at": None})
    session["status"] = "active"

    messages = session.get("messages") or []
    last_ai = None
    last_meta: dict = {}
    for msg in reversed(messages):
        if msg["role"] == "assistant":
            last_ai = msg["content"]
            last_meta = msg.get("_meta", {})
            break

    session["_insights"] = session.get("_insights") or []
    logger.info("interview_resumed", session_id=body.session_id)

    return _build_response(
        session=session,
        question=last_ai,
        topics=last_meta.get("topics", []),
        importance=last_meta.get("importance"),
        example_answers=last_meta.get("example_answers", []),
        session_insights=session.get("_insights") or [],
    )


@router.get("/status/{session_id}", response_model=InterviewStatusResponse)
async def get_interview_status(
    session_id: str,
    user: dict = Depends(get_current_user),
):
    sb = get_supabase()

    result = (
        sb.table("interview_sessions")
        .select("*, projects!inner(user_id)")
        .eq("id", session_id)
        .execute()
    )
    if not result.data:
        raise HTTPException(status_code=404, detail="Session not found")

    session = result.data[0]
    if session["projects"]["user_id"] != user["id"]:
        raise HTTPException(status_code=403, detail="Not authorized")

    current_step = session["current_question"]
    step_info = get_step_info(current_step)
    messages = session.get("messages") or []
    answer_count = sum(1 for m in messages if m["role"] == "user")

    return InterviewStatusResponse(
        session_id=session["id"],
        project_id=session["project_id"],
        status=session["status"],
        current_step=current_step,
        total_steps=TOTAL_STEPS,
        step_title=step_info["title"],
        answer_count=answer_count,
        token_used=session.get("token_used", 0),
    )


@router.get("/session/{project_id}")
async def get_session_by_project(
    project_id: str,
    user: dict = Depends(get_current_user),
):
    sb = get_supabase()

    project = (
        sb.table("projects")
        .select("id, user_id")
        .eq("id", project_id)
        .eq("user_id", user["id"])
        .execute()
    )
    if not project.data:
        raise HTTPException(status_code=404, detail="Project not found")

    try:
        result = (
            sb.table("interview_sessions")
            .select("id, status, current_question, token_used, created_at, paused_at, _insights")
            .eq("project_id", project_id)
            .order("created_at", desc=True)
            .limit(1)
            .execute()
        )
    except Exception:
        result = (
            sb.table("interview_sessions")
            .select("id, status, current_question, token_used, created_at, paused_at")
            .eq("project_id", project_id)
            .order("created_at", desc=True)
            .limit(1)
            .execute()
        )
    if not result.data:
        return {"session": None, "insights": []}

    session_data = result.data[0]
    raw_insights = session_data.pop("_insights", None) or []
    insights = [
        {"label": ins.get("label", ""), "value": ins.get("value", "")}
        for ins in raw_insights
    ]
    return {"session": session_data, "insights": insights}
