"""Phase 7a — Document export API.

Streams the stored kickoff document as a downloadable Markdown file.
PDF export is deliberately out of scope (V2).
"""
import re
from urllib.parse import quote

import structlog
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import Response

from app.api._shared import (
    DESIGN_STEP_COLS,
    FINALIZE_STEP_COLS,
    pick_canonical_session,
)
from app.core.doc_engine import extract_all_insights
from app.core.doc_model import build_sections, sections_to_markdown
from app.core.supabase import get_supabase
from app.middleware.auth import get_current_user

logger = structlog.get_logger()

router = APIRouter(prefix="/api/projects", tags=["export"])


def _ascii_slug(name: str) -> str:
    """ASCII-only fallback for the Content-Disposition filename.
    Header values are latin-1 encoded, so non-ASCII names need filename*."""
    slug = re.sub(r"[^A-Za-z0-9_\-]+", "_", (name or "").strip()).strip("_")
    return slug or "kickoff"


def _load_sections(sb, project: dict) -> list[dict]:
    """Assemble the live document sections for a project from its canonical
    interview/design/finalize sessions. Shared by the preview (JSON) and the
    Markdown export so both reflect the same structured data."""
    project_id = project["id"]

    interviews = (
        sb.table("interview_sessions")
        .select("*")
        .eq("project_id", project_id)
        .order("created_at", desc=True)
        .execute()
    )
    insights, interview_done = [], False
    if interviews.data:
        completed = [s for s in interviews.data if s.get("status") == "completed"]
        interview_done = bool(completed)
        row = completed[0] if completed else interviews.data[0]
        insights = row.get("_insights") or extract_all_insights(row.get("messages") or [])

    design = pick_canonical_session(
        sb.table("design_sessions").select("*").eq("project_id", project_id)
        .order("created_at", desc=True).execute().data,
        DESIGN_STEP_COLS,
    ) or {}
    finalize = pick_canonical_session(
        sb.table("finalize_sessions").select("*").eq("project_id", project_id)
        .order("created_at", desc=True).execute().data,
        FINALIZE_STEP_COLS,
    ) or {}

    return build_sections(project, insights, design, finalize, interview_done)


@router.get("/{project_id}/export/markdown")
async def export_markdown(
    project_id: str,
    user: dict = Depends(get_current_user),
):
    sb = get_supabase()
    project = (
        sb.table("projects")
        .select("*")
        .eq("id", project_id)
        .eq("user_id", user["id"])
        .is_("deleted_at", "null")
        .maybe_single()
        .execute()
    )
    if not project.data:
        raise HTTPException(status_code=404, detail="Project not found")

    sections = _load_sections(sb, project.data)
    if not any(s["status"] == "complete" for s in sections):
        raise HTTPException(status_code=404, detail="아직 다운로드할 내용이 없습니다")

    doc = sections_to_markdown(project.data, sections)
    name = project.data.get("name") or "kickoff"
    ascii_filename = f"{_ascii_slug(name)}_kickoff.md"
    utf8_filename = quote(f"{name}_kickoff.md")

    logger.info("kickoff_doc_exported", project_id=project_id)
    return Response(
        content=doc,
        media_type="text/markdown; charset=utf-8",
        headers={
            "Content-Disposition": (
                f'attachment; filename="{ascii_filename}"; '
                f"filename*=UTF-8''{utf8_filename}"
            )
        },
    )


@router.get("/{project_id}/document-model")
async def get_document_model(
    project_id: str,
    user: dict = Depends(get_current_user),
):
    """Live document model assembled from structured session data (Phase 7a).

    Each section's status is exact — derived from whether its backing step data
    exists — rather than guessed from the generated markdown.
    """
    sb = get_supabase()
    project = (
        sb.table("projects")
        .select("*")
        .eq("id", project_id)
        .eq("user_id", user["id"])
        .is_("deleted_at", "null")
        .maybe_single()
        .execute()
    )
    if not project.data:
        raise HTTPException(status_code=404, detail="Project not found")
    p = project.data

    sections = _load_sections(sb, p)
    complete = sum(1 for s in sections if s["status"] == "complete")
    total = len(sections)
    return {
        "project": {
            "id": p["id"],
            "name": p.get("name"),
            "project_type": p.get("project_type"),
            "description": p.get("description"),
            "language": p.get("language", "ko"),
            "status": p.get("status"),
        },
        "sections": sections,
        "completeness": {
            "complete": complete,
            "total": total,
            "percent": round(complete / total * 100) if total else 0,
        },
    }
