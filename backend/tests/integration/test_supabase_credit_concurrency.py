r"""Opt-in concurrency tests for BL-022/023 against a real Supabase project.

Run from ``backend/`` with::

    $env:RUN_SUPABASE_INTEGRATION="1"
    .\.venv\Scripts\python.exe -m pytest tests/integration/test_supabase_credit_concurrency.py -q

Every test creates uniquely named disposable public users/projects and removes
them in fixture teardown. Independent Supabase clients issue the competing RPC
requests so the test exercises PostgreSQL row locking rather than an in-process
fake or a shared HTTP client.
"""

from __future__ import annotations

import os
import uuid
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime, timezone
from threading import Barrier

import pytest
from supabase import create_client

from app.config import settings


pytestmark = pytest.mark.skipif(
    os.getenv("RUN_SUPABASE_INTEGRATION") != "1",
    reason="set RUN_SUPABASE_INTEGRATION=1 to use the configured real Supabase project",
)


class SupabaseCreditHarness:
    """Create isolated credit fixtures and guarantee best-effort cleanup."""

    def __init__(self) -> None:
        if not settings.SUPABASE_URL or not settings.SUPABASE_SERVICE_KEY:
            pytest.fail("SUPABASE_URL and SUPABASE_SERVICE_KEY are required")
        self.url = settings.SUPABASE_URL
        self.service_key = settings.SUPABASE_SERVICE_KEY
        self.admin = create_client(self.url, self.service_key)
        self.run_id = uuid.uuid4().hex[:12]
        self.user_ids: list[str] = []
        self.project_ids: list[str] = []

    @staticmethod
    def _data(result):
        return getattr(result, "data", None)

    def create_user(self, *, credits_used: int = 0) -> str:
        user_id = str(uuid.uuid4())
        result = self.admin.table("users").insert({
            "id": user_id,
            "email": f"bl-credit-{self.run_id}-{len(self.user_ids)}@example.com",
            "display_name": "BL credit concurrency test",
            "role": "user",
            "plan": "free",
            "credits_used": credits_used,
        }).execute()
        assert self._data(result), "disposable user insert returned no data"
        self.user_ids.append(user_id)
        return user_id

    def create_project(
        self,
        user_id: str,
        *,
        interview_charged: bool = False,
    ) -> str:
        project_id = str(uuid.uuid4())
        payload = {
            "id": project_id,
            "user_id": user_id,
            "name": f"BL credit concurrency {self.run_id}",
            "project_type": "web",
            "language": "ko",
            "status": "in_progress",
            "description": "Disposable BL-022/023 integration test",
        }
        if interview_charged:
            payload["interview_credit_charged_at"] = datetime.now(timezone.utc).isoformat()
        result = self.admin.table("projects").insert(payload).execute()
        assert self._data(result), "disposable project insert returned no data"
        self.project_ids.append(project_id)
        return project_id

    def complete_interview(self, project_id: str) -> None:
        result = self.admin.table("interview_sessions").insert({
            "project_id": project_id,
            "step": "planning",
            "status": "completed",
            "current_question": 11,
            "messages": [],
            "token_used": 0,
        }).execute()
        assert self._data(result), "completed interview fixture insert returned no data"

    def rpc(self, name: str, params: dict):
        client = create_client(self.url, self.service_key)
        return self._data(client.rpc(name, params).execute())

    def concurrent_rpc(self, name: str, params: list[dict]):
        clients = [create_client(self.url, self.service_key) for _ in params]
        barrier = Barrier(len(params))

        def invoke(index: int):
            try:
                barrier.wait(timeout=15)
                result = clients[index].rpc(name, params[index]).execute()
                return {"ok": True, "data": self._data(result)}
            except Exception as exc:  # PostgREST errors are part of the assertion surface.
                return {"ok": False, "error": str(exc)}

        with ThreadPoolExecutor(max_workers=len(params)) as executor:
            return list(executor.map(invoke, range(len(params))))

    def user(self, user_id: str) -> dict:
        result = self.admin.table("users").select("*").eq("id", user_id).single().execute()
        return self._data(result)

    def project(self, project_id: str) -> dict:
        result = self.admin.table("projects").select("*").eq("id", project_id).single().execute()
        return self._data(result)

    def cleanup(self) -> None:
        errors = []
        for project_id in reversed(self.project_ids):
            try:
                self.admin.table("interview_sessions").delete().eq("project_id", project_id).execute()
                self.admin.table("projects").delete().eq("id", project_id).execute()
            except Exception as exc:  # Continue so one failure does not strand every fixture.
                errors.append(f"project cleanup failed: {type(exc).__name__}")
        for user_id in reversed(self.user_ids):
            try:
                self.admin.table("users").delete().eq("id", user_id).execute()
            except Exception as exc:
                errors.append(f"user cleanup failed: {type(exc).__name__}")

        remaining_projects = []
        remaining_users = []
        if self.project_ids:
            remaining_projects = self._data(
                self.admin.table("projects").select("id").in_("id", self.project_ids).execute()
            ) or []
        if self.user_ids:
            remaining_users = self._data(
                self.admin.table("users").select("id").in_("id", self.user_ids).execute()
            ) or []
        if errors or remaining_projects or remaining_users:
            pytest.fail(
                "Supabase integration cleanup failed: "
                f"errors={errors}, projects={len(remaining_projects)}, users={len(remaining_users)}"
            )


@pytest.fixture
def credit_harness():
    harness = SupabaseCreditHarness()
    try:
        yield harness
    finally:
        harness.cleanup()


def _params(project_id: str, user_id: str) -> dict:
    return {
        "p_project_id": project_id,
        "p_user_id": user_id,
        "p_bypass_limit": False,
    }


def _assert_exactly_one_charge(results) -> None:
    assert all(item["ok"] for item in results), results
    charged = [item["data"]["charged"] for item in results]
    assert sorted(charged) == [False, True]


def _assert_one_limit_failure(results) -> None:
    successes = [item for item in results if item["ok"]]
    failures = [item for item in results if not item["ok"]]
    assert len(successes) == 1, results
    assert successes[0]["data"]["charged"] is True
    assert len(failures) == 1, results
    assert "CREDIT_LIMIT_EXCEEDED:2" in failures[0]["error"]


def test_same_project_concurrent_interview_and_design_charge_once_each(credit_harness):
    user_id = credit_harness.create_user()
    project_id = credit_harness.create_project(user_id)

    interview_params = _params(project_id, user_id)
    interview_results = credit_harness.concurrent_rpc(
        "start_interview_atomic",
        [interview_params, interview_params],
    )
    _assert_exactly_one_charge(interview_results)
    assert credit_harness.user(user_id)["credits_used"] == 1
    assert credit_harness.project(project_id)["interview_credit_charged_at"] is not None

    credit_harness.complete_interview(project_id)
    design_params = {**interview_params, "p_decision": "design"}
    design_results = credit_harness.concurrent_rpc(
        "set_design_decision_atomic",
        [design_params, design_params],
    )
    _assert_exactly_one_charge(design_results)

    retry = credit_harness.rpc("set_design_decision_atomic", design_params)
    project = credit_harness.project(project_id)
    assert retry["charged"] is False
    assert credit_harness.user(user_id)["credits_used"] == 2
    assert project["status"] == "designing"
    assert project["credit_charged_at"] is not None


def test_concurrent_interviews_on_different_projects_cannot_exceed_free_limit(credit_harness):
    user_id = credit_harness.create_user(credits_used=1)
    project_ids = [credit_harness.create_project(user_id) for _ in range(2)]

    results = credit_harness.concurrent_rpc(
        "start_interview_atomic",
        [_params(project_id, user_id) for project_id in project_ids],
    )
    _assert_one_limit_failure(results)

    projects = [credit_harness.project(project_id) for project_id in project_ids]
    assert credit_harness.user(user_id)["credits_used"] == 2
    assert sum(project["interview_credit_charged_at"] is not None for project in projects) == 1
    assert all(project["status"] == "in_progress" for project in projects)


def test_concurrent_designs_on_different_projects_cannot_exceed_free_limit(credit_harness):
    user_id = credit_harness.create_user(credits_used=1)
    project_ids = [
        credit_harness.create_project(user_id, interview_charged=True)
        for _ in range(2)
    ]
    for project_id in project_ids:
        credit_harness.complete_interview(project_id)

    results = credit_harness.concurrent_rpc(
        "set_design_decision_atomic",
        [
            {**_params(project_id, user_id), "p_decision": "design"}
            for project_id in project_ids
        ],
    )
    _assert_one_limit_failure(results)

    projects = [credit_harness.project(project_id) for project_id in project_ids]
    assert credit_harness.user(user_id)["credits_used"] == 2
    assert sum(project["credit_charged_at"] is not None for project in projects) == 1
    assert sorted(project["status"] for project in projects) == ["designing", "in_progress"]


def test_skip_after_completed_interview_is_idempotent_and_free(credit_harness):
    user_id = credit_harness.create_user(credits_used=1)
    project_id = credit_harness.create_project(user_id, interview_charged=True)
    credit_harness.complete_interview(project_id)
    params = {**_params(project_id, user_id), "p_decision": "skip"}

    first = credit_harness.rpc("set_design_decision_atomic", params)
    retry = credit_harness.rpc("set_design_decision_atomic", params)
    project = credit_harness.project(project_id)

    assert first["charged"] is False
    assert retry["charged"] is False
    assert credit_harness.user(user_id)["credits_used"] == 1
    assert project["status"] == "completed"
    assert project["credit_charged_at"] is None
