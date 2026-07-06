"""doc_model 순수 함수 테스트 — 섹션 조립·마크다운·ai_workflow 강제 변환."""
import json

from app.core import doc_model as dm


def test_coerce_ai_workflow_variants():
    assert dm._coerce_ai_workflow({"model": "x"}) == {"model": "x"}
    assert dm._coerce_ai_workflow('{"model": "y"}') == {"model": "y"}  # JSON 문자열
    double = json.dumps(json.dumps({"model": "z"}))
    assert dm._coerce_ai_workflow(double) == {"model": "z"}  # 이중 인코딩
    assert dm._coerce_ai_workflow("그냥 문자열") == {"summary": "그냥 문자열"}  # 비JSON
    assert dm._coerce_ai_workflow(None) == {}


def test_build_sections_all_empty():
    sections = dm.build_sections(project={"name": "P"}, insights=[], design={}, finalize={})
    assert len(sections) == 7
    assert all(s["status"] == "empty" for s in sections)
    assert all(s["content"] == "" and s["data"] is None for s in sections)


def test_build_sections_profile_complete_when_interview_done():
    sections = dm.build_sections(
        project={"name": "P", "project_type": "Web App", "language": "ko"},
        insights=[], design={}, finalize={}, interview_done=True,
    )
    profile = next(s for s in sections if s["id"] == "profile")
    assert profile["status"] == "complete"  # 인터뷰 완료면 메타만으로 complete
    assert "P" in profile["content"]


def test_build_sections_full_data_all_complete():
    project = {"name": "AI앱", "project_type": "AI/ML", "language": "ko", "description": "설명"}
    insights = [{"label": "주요 사용자", "value": "학생"}, {"label": "리스크", "value": "비용"}]
    design = {
        "requirements": [{"priority": "must", "text": "로그인", "acceptance_criteria": "OAuth"}],
        "architecture": {
            "components": [{"name": "API", "technology": "FastAPI", "description": "서버"}],
            "tech_stack": {"backend": "FastAPI"},
        },
        "data_model": {
            "entities": [{"name": "User", "description": "사용자",
                          "fields": [{"name": "id", "type": "uuid"}]}]
        },
        "ai_workflow": {"summary": "요약", "model": "claude", "task": "분류"},
    }
    finalize = {
        "evaluation": {"overall_level": "green", "recommendation": "좋음",
                       "dimensions": [{"name": "가치", "level": "green", "score": 8, "comment": "굿"}]},
        "done_criteria": {"criteria": [{"text": "배포", "measurable": True}]},
        "gaps": {"gaps": [{"severity": "high", "type": "보안", "issue": "인증"}]},
        "checklist": {"items": [{"task": "셋업", "done": False}]},
    }
    sections = dm.build_sections(project, insights, design, finalize, interview_done=True)
    by_id = {s["id"]: s for s in sections}
    for sid in ("profile", "features", "architecture", "data", "ai", "evaluation", "dod"):
        assert by_id[sid]["status"] == "complete", f"{sid} 는 complete 여야 함"
        assert by_id[sid]["data"] is not None


def test_sections_to_markdown_includes_only_complete():
    sections = [
        {"id": "profile", "title": "프로필", "status": "complete", "content": "내용A"},
        {"id": "features", "title": "기능", "status": "empty", "content": ""},
    ]
    md = dm.sections_to_markdown({"name": "내프로젝트", "project_type": "Web"}, sections)
    assert md.startswith("# 내프로젝트")
    assert "## 1. 프로필" in md
    assert "내용A" in md
    assert "기능" not in md  # empty 섹션은 제외
    assert "완성도 1/2 섹션" in md


def test_demote_headings_pushes_below_and_keeps_fences():
    md = "# 제목\n일반\n```\n# 코드안 유지\n```"
    out = dm._demote_headings(md, by=2)
    assert "### 제목" in out       # h1 → h3
    assert "# 코드안 유지" in out   # 코드펜스 안은 유지
