"""Pydantic schemas for Phase 6 (Evaluation & Finalization)."""
from pydantic import BaseModel


class FinalizeGenerateRequest(BaseModel):
    project_id: str


class FinalizeUpdateRequest(BaseModel):
    data: dict


class FinalizeSessionOut(BaseModel):
    id: str
    project_id: str
    current_step: str = "evaluate"
    evaluation: dict | None = None
    done_criteria: dict | None = None
    gaps: dict | None = None
    checklist: dict | None = None
    status: str = "in_progress"
