from datetime import datetime
from pydantic import BaseModel, Field


class ProjectCreate(BaseModel):
    name: str = Field(min_length=1, max_length=200)
    description: str = Field(default="", max_length=2000)
    language: str = Field(default="ko", pattern="^(ko|en)$")


class ProjectUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=200)
    description: str | None = Field(default=None, max_length=2000)
    project_type: str | None = Field(default=None, max_length=100)


class DesignDecisionRequest(BaseModel):
    decision: str = Field(pattern="^(design|skip)$")


class ProjectOut(BaseModel):
    id: str
    user_id: str
    name: str
    description: str | None = None
    project_type: str | None = None
    language: str = "ko"
    status: str = "in_progress"
    current_step: int = 0
    total_steps: int = 10
    kickoff_doc: str | None = None
    mermaid_code: str | None = None
    created_at: datetime
    updated_at: datetime
