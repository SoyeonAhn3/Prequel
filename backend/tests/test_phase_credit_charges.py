"""BL-023 단계별 과금 SQL 마이그레이션 계약 테스트.

로컬 단위 테스트에서는 Supabase PostgreSQL을 띄우지 않으므로, 마이그레이션이
반드시 포함해야 하는 잠금·멱등성·상태 전이·권한 계약을 정적으로 검증한다.
실제 동시성/롤백 동작은 마이그레이션 적용 후 Supabase 통합 테스트에서 확인한다.
"""
import re
from pathlib import Path


MIGRATION_PATH = (
    Path(__file__).parents[2]
    / "supabase"
    / "migrations"
    / "012_phase_credit_charges.sql"
)


def _migration() -> str:
    return MIGRATION_PATH.read_text(encoding="utf-8")


def _function_body(sql: str, function_name: str) -> str:
    match = re.search(
        rf"CREATE OR REPLACE FUNCTION public\.{function_name}\(.*?\)"
        rf".*?AS \$\$(.*?)\$\$;",
        sql,
        flags=re.DOTALL,
    )
    assert match, f"{function_name} 함수 정의가 없습니다"
    return match.group(1)


def test_migration_adds_independent_interview_charge_marker_and_legacy_backfill():
    sql = _migration()
    preamble = sql.split("CREATE OR REPLACE FUNCTION", 1)[0]

    assert "ADD COLUMN IF NOT EXISTS interview_credit_charged_at TIMESTAMPTZ" in preamble
    assert "FROM public.interview_sessions" in preamble
    assert "MIN(created_at)" in preamble
    assert "interview_credit_charged_at IS NULL" in preamble
    # 기존 세션은 차감 완료 표시만 백필하고 사용자 사용량은 소급 증가시키지 않는다.
    assert "UPDATE public.users" not in preamble


def test_start_interview_atomic_locks_and_charges_once():
    body = _function_body(_migration(), "start_interview_atomic")

    assert body.count("FOR UPDATE") >= 2
    assert "project.id = p_project_id" in body
    assert "project.user_id = p_user_id" in body
    assert "project.deleted_at IS NULL" in body
    assert "v_project.interview_credit_charged_at IS NOT NULL" in body
    assert "v_project.status <> 'in_progress'" in body
    assert "CREDIT_LIMIT_EXCEEDED" in body
    assert "SET credits_used = credits_used + 1" in body
    assert "SET interview_credit_charged_at = NOW()" in body
    assert "'charged', FALSE" in body
    assert "'charged', TRUE" in body

    # 모든 단계별 과금 RPC는 프로젝트→사용자 순서로 잠가 교착 가능성을 줄인다.
    project_lock = body.index("FROM public.projects AS project")
    state_guard = body.index("v_project.status <> 'in_progress'")
    charged_guard = body.index("v_project.interview_credit_charged_at IS NOT NULL")
    user_lock = body.index("FROM public.users AS app_user")
    assert project_lock < state_guard < charged_guard < user_lock


def test_design_decision_requires_completed_interview_and_uses_second_marker():
    body = _function_body(_migration(), "set_design_decision_atomic")

    assert "FROM public.interview_sessions AS interview" in body
    assert "interview.status = 'completed'" in body
    assert "INTERVIEW_NOT_COMPLETED" in body
    assert "IF p_decision = 'skip'" in body
    assert "SET status = 'completed'" in body
    assert "SET status = 'evaluating'" not in body
    assert "v_project.credit_charged_at IS NULL" in body
    assert "SET status = 'designing'" in body
    assert "credit_charged_at = NOW()" in body
    assert "SET credits_used = credits_used + 1" in body


def test_design_decision_preserves_completed_projects_and_lock_order():
    body = _function_body(_migration(), "set_design_decision_atomic")

    completed_guard = body.index("v_project.status = 'completed'")
    interview_guard = body.index("FROM public.interview_sessions AS interview")
    skip_branch = body.index("IF p_decision = 'skip'")
    design_charge_guard = body.index("v_project.credit_charged_at IS NULL")
    project_lock = body.index("FROM public.projects AS project")
    user_lock = body.index("FROM public.users AS app_user")

    # 완료/패스/재진입 분기는 사용자 행을 잠그기 전에 끝나므로 사용량을 건드리지 않는다.
    assert completed_guard < interview_guard < skip_branch < design_charge_guard < user_lock
    assert project_lock < user_lock
    assert body.count("FOR UPDATE") >= 2


def test_phase_credit_rpcs_are_service_role_only():
    sql = _migration()

    for function_name in ("start_interview_atomic", "set_design_decision_atomic"):
        signature = (
            f"public.{function_name}(UUID, UUID, BOOLEAN)"
            if function_name == "start_interview_atomic"
            else f"public.{function_name}(UUID, UUID, TEXT, BOOLEAN)"
        )
        assert f"REVOKE ALL ON FUNCTION {signature}" in sql
        assert f"GRANT EXECUTE ON FUNCTION {signature}" in sql

    assert sql.count("FROM PUBLIC, anon, authenticated") == 2
    assert sql.count("TO service_role") == 2


def test_browser_roles_cannot_forge_credit_or_phase_tables_directly():
    sql = _migration()

    assert "REVOKE INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public" in sql
    assert "FROM anon, authenticated" in sql
    assert "ALTER DEFAULT PRIVILEGES IN SCHEMA public" in sql
    assert "REVOKE INSERT, UPDATE, DELETE ON TABLES FROM anon, authenticated" in sql
