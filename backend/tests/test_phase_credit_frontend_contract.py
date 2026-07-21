"""BL-023 프런트엔드 단계 이동 계약 테스트.

프런트엔드에는 별도 브라우저 테스트 러너가 없으므로, 라우팅과 API 연결의
핵심 계약은 정적으로 고정하고 TypeScript 빌드로 타입/JSX를 함께 검증한다.
"""
from pathlib import Path


FRONTEND_SRC = Path(__file__).parents[2] / "frontend" / "src"


def _source(relative_path: str) -> str:
    return (FRONTEND_SRC / relative_path).read_text(encoding="utf-8")


def _between(source: str, start: str, end: str) -> str:
    return source.split(start, 1)[1].split(end, 1)[0]


def test_interview_decision_routes_and_profile_refresh_match_credit_policy():
    source = _source("pages/InterviewPage.tsx")
    start = _between(source, "const startInterview", "useEffect(() => {\n    startInterview()")
    decision = _between(source, "const handleDesignDecision", "const handleTypeConfirm")

    assert "finally(refetchProfile)" in start
    assert "/design-decision" in decision
    assert "await refetchProfile()" in decision
    assert "navigate(`/projects/${projectId}/design`)" in decision
    assert "navigate(`/projects/${projectId}/document`)" in decision
    assert "navigate(`/projects/${projectId}/finalize`)" not in decision


def test_design_enters_evaluation_through_dedicated_no_charge_endpoint():
    source = _source("pages/DesignPage.tsx")
    transition = _between(source, "const goToEvaluation", "useEffect(() => {")

    assert "/enter-evaluation" in transition
    assert "method: 'POST'" in transition
    assert "navigate(`/projects/${projectId}/finalize`)" in transition
    assert transition.index("/enter-evaluation") < transition.index("/finalize")
    assert "/design-decision" not in source


def test_completed_design_reentry_returns_to_transition_screen():
    source = _source("pages/DesignPage.tsx")
    completed_branch = _between(
        source,
        "if (designSession.status === 'completed')",
        "return",
    )

    assert "navigate(" not in completed_branch
    assert "setSession(designSession)" in completed_branch
    assert "setScreen({ kind: 'complete' })" in completed_branch


def test_completed_projects_open_document_while_evaluating_projects_resume_finalize():
    source = _source("pages/MyProjectsPage.tsx")
    route = _between(source, "function resumeRoute", "export default function")

    assert "status === 'evaluating'" in route
    assert "`/projects/${project.id}/finalize`" in route
    assert "status === 'completed'" in route
    assert "`/projects/${project.id}/document`" in route


def test_finalize_page_does_not_bypass_evaluation_transition():
    source = _source("pages/FinalizePage.tsx")

    assert "proj.status === 'designing'" in source
    assert "navigate(`/projects/${projectId}/design`, { replace: true })" in source
    assert "proj.status !== 'evaluating'" in source


def test_credit_copy_describes_skip_and_reentry_without_extra_charge():
    interview = _source("pages/InterviewPage.tsx")
    modal = _source("components/projects/NewProjectModal.tsx")
    design_welcome = _source("components/design/DesignWelcome.tsx")

    assert "설계와 평가를 모두 건너뛰고 인터뷰 요약 문서로 바로 이동합니다." in interview
    assert "추가 크레딧 없음" in interview
    assert "인터뷰는 무제한" not in modal
    assert "평가 단계로 이동할 때는 크레딧이 추가로 차감되지 않습니다." in design_welcome
