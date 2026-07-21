"""BL-022 원자적 크레딧 차감의 API 오류 매핑과 SQL 계약 테스트."""
from pathlib import Path

import pytest
from fastapi import HTTPException

import app.api.projects as projects


class RpcError(Exception):
    def __init__(self, message):
        super().__init__(message)
        self.message = message


def test_credit_limit_error_becomes_403():
    with pytest.raises(HTTPException) as exc:
        projects._raise_design_decision_error(RpcError("CREDIT_LIMIT_EXCEEDED:2"))
    assert exc.value.status_code == 403
    assert "2회" in exc.value.detail


def test_missing_project_error_becomes_404():
    with pytest.raises(HTTPException) as exc:
        projects._raise_design_decision_error(RpcError("PROJECT_NOT_FOUND"))
    assert exc.value.status_code == 404


def test_incomplete_interview_error_becomes_409():
    with pytest.raises(HTTPException) as exc:
        projects._raise_design_decision_error(RpcError("INTERVIEW_NOT_COMPLETED"))
    assert exc.value.status_code == 409


def test_invalid_project_state_error_becomes_409():
    with pytest.raises(HTTPException) as exc:
        projects._raise_design_decision_error(RpcError("INVALID_PROJECT_STATE:designing"))
    assert exc.value.status_code == 409


def test_unknown_rpc_error_is_not_hidden():
    original = RpcError("DATABASE_UNAVAILABLE")
    with pytest.raises(RpcError) as exc:
        projects._raise_design_decision_error(original)
    assert exc.value is original


def test_atomic_credit_migration_has_required_guards():
    migration = (
        Path(__file__).parents[2]
        / "supabase"
        / "migrations"
        / "011_atomic_credit_charge.sql"
    ).read_text(encoding="utf-8")

    assert migration.count("FOR UPDATE") >= 2
    assert "UPDATE public.users" in migration
    assert "credits_used = credits_used + 1" in migration
    assert "UPDATE public.projects" in migration
    assert "credit_charged_at = NOW()" in migration
    assert "CREDIT_LIMIT_EXCEEDED" in migration
    assert "REVOKE ALL ON FUNCTION" in migration
    assert "TO service_role" in migration
