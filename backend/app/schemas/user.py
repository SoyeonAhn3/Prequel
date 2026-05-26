from datetime import datetime
from pydantic import BaseModel


class UserProfile(BaseModel):
    id: str
    email: str
    display_name: str | None = None
    avatar_url: str | None = None
    role: str = "user"
    credits_used: int = 0
    plan: str = "free"
    plan_expires_at: datetime | None = None
    agreed_terms_at: datetime | None = None
    suspended_at: datetime | None = None
    deleted_at: datetime | None = None
    created_at: datetime
    updated_at: datetime


class UserProfileUpdate(BaseModel):
    display_name: str | None = None
    avatar_url: str | None = None
