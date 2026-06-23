from datetime import datetime

from pydantic import BaseModel, Field


class AnnouncementCreate(BaseModel):
    type: str = Field(pattern="^(notice|patch)$")
    title: str = Field(min_length=1, max_length=80)
    content: str = Field(min_length=1, max_length=2000)
    version: str | None = Field(default=None, max_length=20)
    pinned: bool = False


class AnnouncementUpdate(BaseModel):
    type: str | None = Field(default=None, pattern="^(notice|patch)$")
    title: str | None = Field(default=None, min_length=1, max_length=80)
    content: str | None = Field(default=None, min_length=1, max_length=2000)
    version: str | None = Field(default=None, max_length=20)
    pinned: bool | None = None


class AnnouncementOut(BaseModel):
    id: str
    type: str
    title: str
    content: str
    version: str | None = None
    pinned: bool
    created_at: datetime
