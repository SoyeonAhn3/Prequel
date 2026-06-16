"""Assemble the live kickoff document model from structured session data.

Phase 7a (structured rewrite): instead of parsing the generated markdown blob to
guess which sections exist, we read the interview/design/finalize session rows
directly. Each canonical section maps to a specific data source, so its status
(complete vs empty) is exact — no heuristics. Pure functions only (no DB access);
the API layer fetches the sessions and passes them in.
"""
import json
import re


def _coerce_ai_workflow(value):
    """ai_workflow should be a dict, but some legacy rows stored it as a JSON
    string — and a few are double-encoded (json.dumps applied twice), so one
    decode yields a str that is itself a JSON object. Decode repeatedly until we
    reach a dict (or can't), so downstream .get() calls are always safe."""
    for _ in range(3):
        if not isinstance(value, str):
            break
        try:
            value = json.loads(value)
        except (json.JSONDecodeError, ValueError):
            return {"summary": value}
    if isinstance(value, dict):
        return value
    if isinstance(value, str):
        return {"summary": value}
    return {}


def _cell(value) -> str:
    """Make a value safe to drop into a markdown table cell."""
    return str(value or "").replace("|", "\\|").replace("\n", " ").strip()


# ─── Per-section markdown builders ────────────────────────

# Labels already shown in the meta table — don't repeat them as bullets.
_PROFILE_SKIP = ("프로젝트명", "프로젝트 유형", "감지된 프로젝트 유형")

# Group raw interview insights into document-friendly categories by their label.
# (Grouping by interview step is unreliable — captured content often doesn't
# match the nominal step title.) First matching group wins; order matters.
_PROFILE_GROUPS = [
    ("대상 사용자", ("주요 사용자", "사용자 그룹", "사용자 기술", "사용 빈도", "사용 맥락", "타겟 사용")),
    ("해결하는 문제", ("pain", "페인", "문제 상황", "타겟 문제")),
    ("핵심 기능", ("핵심 기능", "기능 1", "기능 2", "mvp", "채택 제안", "결과 ui", "ui 방식", "해석 방식", "오류 대응", "개발 철학")),
    ("성공 지표", ("성공", "지표", "측정", "목표 수치")),
    ("리스크 · 대응", ("리스크", "위험 요소", "법적", "면책")),
    ("데이터 · 입력", ("파일", "ocr", "데이터", "저장", "보관", "민감", "보호", "일정")),
    ("기술 · 인프라", ("프론트", "백엔드", "ai/ml", "ai 도구", "파싱", "배포", "인증", "모델", "스택")),
]
_PROFILE_EMPTY_VALUES = {"미정", "없음", "-", ""}


def _classify_insight(label: str) -> str:
    low = label.lower()
    for header, keywords in _PROFILE_GROUPS:
        if any(k in low for k in keywords):
            return header
    return "기타"


def _profile_grouped(project: dict, insights: list[dict]):
    """Shared profile extraction used by both the markdown and the data view, so
    they never drift. Returns (lead_sentence, [(group_header, [values])])."""
    # Lead sentence: project description, else an overview-ish insight.
    lead = (project.get("description") or "").strip()
    if not lead:
        for ins in insights:
            label = ins.get("label", "")
            if label.startswith("핵심 기능") or "서비스 형태" in label:
                lead = (ins.get("value") or "").strip()
                break

    # Group insights into categories (dict preserves the _PROFILE_GROUPS order).
    groups: dict[str, list[str]] = {h: [] for h, _ in _PROFILE_GROUPS}
    groups["기타"] = []
    seen = set()
    for ins in insights:
        label = ins.get("label", "")
        val = (ins.get("value") or "").strip()
        if not label or val in _PROFILE_EMPTY_VALUES or val in seen:
            continue
        if any(s in label for s in _PROFILE_SKIP):
            continue
        seen.add(val)
        groups[_classify_insight(label)].append(val)

    ordered = [(h, v) for h, v in groups.items() if v]
    return lead, ordered


def profile_md(project: dict, insights: list[dict]) -> str:
    lines = ["| 항목 | 내용 |", "|---|---|", f"| 프로젝트명 | {_cell(project.get('name'))} |"]
    if project.get("project_type"):
        lines.append(f"| 유형 | {_cell(project['project_type'])} |")
    lines.append(f"| 언어 | {_cell(project.get('language', 'ko'))} |")

    lead, groups = _profile_grouped(project, insights)
    if lead:
        lines += ["", f"> {lead}"]
    for header, vals in groups:
        lines += ["", f"**{header}**", ""]
        lines += [f"- {v}" for v in vals]

    return "\n".join(lines).strip()


def profile_data(project: dict, insights: list[dict]) -> dict:
    lead, groups = _profile_grouped(project, insights)
    return {
        "meta": {
            "name": project.get("name") or "",
            "project_type": project.get("project_type") or "",
            "language": project.get("language", "ko"),
        },
        "lead": lead,
        "groups": [{"label": h, "items": v} for h, v in groups],
    }


def features_md(requirements: list[dict] | None) -> str:
    if not requirements:
        return ""
    order = {"must": 0, "should": 1, "could": 2}
    rs = sorted(requirements, key=lambda r: order.get((r.get("priority") or "").lower(), 9))
    lines = []
    for r in rs:
        pri = (r.get("priority") or "").upper()
        badge = f"`{pri}` " if pri else ""
        lines.append(f"- {badge}{r.get('text', '')}")
        if r.get("acceptance_criteria"):
            lines.append(f"  - 완료기준: {r['acceptance_criteria']}")
    return "\n".join(lines)


def architecture_md(arch: dict | None) -> str:
    arch = arch or {}
    lines = []
    comps = arch.get("components") or []
    if comps:
        lines += ["**구성 요소**", ""]
        for c in comps:
            tech = f" ({c.get('technology', '')})" if c.get("technology") else ""
            lines.append(f"- **{c.get('name', '')}**{tech} — {c.get('description', '')}")
    ts = arch.get("tech_stack") or {}
    if ts:
        lines += ["", "**기술 스택**", ""]
        lines += [f"- {k}: {v}" for k, v in ts.items()]
    if arch.get("integration_notes"):
        lines += ["", arch["integration_notes"]]
    if arch.get("mermaid_code"):
        lines += ["", "```mermaid", arch["mermaid_code"], "```"]
    return "\n".join(lines)


def data_model_md(dm: dict | None) -> str:
    dm = dm or {}
    lines = []
    for e in dm.get("entities") or []:
        lines.append(f"**{e.get('name', '')}** — {e.get('description', '')}")
        fields = e.get("fields") or []
        if fields:
            lines += ["", "| 필드 | 타입 | 제약 | 설명 |", "|---|---|---|---|"]
            for f in fields:
                lines.append(
                    f"| {_cell(f.get('name'))} | {_cell(f.get('type'))} | "
                    f"{_cell(f.get('constraints'))} | {_cell(f.get('description'))} |"
                )
            lines.append("")
    rels = dm.get("relationships") or []
    if rels:
        lines += ["**관계**"] + [f"- {r}" for r in rels]
    return "\n".join(lines).strip()


def ai_workflow_md(value) -> str:
    aw = _coerce_ai_workflow(value)
    if not aw:
        return ""
    lines = []
    if aw.get("summary"):
        lines += [aw["summary"], ""]
    meta = []
    if aw.get("model"):
        ver = f" ({aw['model_version']})" if aw.get("model_version") else ""
        meta.append(f"**모델**: {aw['model']}{ver}")
    if aw.get("task"):
        meta.append(f"**작업**: {aw['task']}")
    if meta:
        lines += [" · ".join(meta), ""]

    def block(title, items, fmt):
        if items:
            lines.append(f"**{title}**")
            lines.extend(f"- {fmt(it)}" for it in items)
            lines.append("")

    block("입력", aw.get("inputs"), lambda i: f"{i.get('name', '')}: {i.get('description', '')}")
    block("출력", aw.get("outputs"),
          lambda o: f"{o.get('name', '')}: {o.get('description', '')}"
                    + (f" ({o['format']})" if o.get("format") else ""))
    block("폴백 전략", aw.get("fallbacks"), lambda f: f"{f.get('condition', '')} → {f.get('action', '')}")
    if aw.get("monitoring"):
        lines += ["**모니터링**"] + [f"- {m}" for m in aw["monitoring"]]
    return "\n".join(lines).strip()


_LEVEL_EMOJI = {"green": "🟢", "yellow": "🟡", "red": "🔴"}


def evaluation_md(ev: dict | None) -> str:
    ev = ev or {}
    lines = []
    if ev.get("overall_level"):
        lines += [f"**종합 판정**: {ev['overall_level']}", ""]
    if ev.get("recommendation"):
        lines += [f"> {ev['recommendation']}", ""]
    for d in ev.get("dimensions") or []:
        if d.get("applicable") is False:
            continue
        emoji = _LEVEL_EMOJI.get((d.get("level") or "").lower(), "")
        score = f" ({d['score']}/10)" if d.get("score") is not None else ""
        lines.append(f"- {emoji} **{d.get('name', '')}**{score} — {d.get('comment', '')}")
    return "\n".join(lines).strip()


_SEVERITY_EMOJI = {"high": "🔴", "medium": "🟡", "low": "🟢"}


def dod_md(done_criteria: dict | None, gaps: dict | None, checklist: dict | None) -> str:
    lines = []
    crit = (done_criteria or {}).get("criteria") or []
    if crit:
        lines += ["**완료 조건 (DoD)**", ""]
        for c in crit:
            cat = f"`{c.get('category', '')}` " if c.get("category") else ""
            mark = " *(측정가능)*" if c.get("measurable") else ""
            lines.append(f"- {cat}{c.get('text', '')}{mark}")
        lines.append("")
    gp = (gaps or {}).get("gaps") or []
    if gp:
        lines += ["**빈틈 점검**", ""]
        for g in gp:
            sev = _SEVERITY_EMOJI.get((g.get("severity") or "").lower(), "")
            lines.append(f"- {sev} **{g.get('type', '')}** — {g.get('issue', '')}")
            if g.get("suggestion"):
                lines.append(f"  - 제안: {g['suggestion']}")
        lines.append("")
    items = (checklist or {}).get("items") or []
    if items:
        lines += ["**착수 체크리스트**", ""]
        for it in items:
            box = "[x]" if it.get("done") else "[ ]"
            area = f"`{it.get('area', '')}` " if it.get("area") else ""
            lines.append(f"- {box} {area}{it.get('task', '')}")
    return "\n".join(lines).strip()


# ─── Per-section structured data (Phase 7a dashboard view) ─
# These mirror the *_md builders' data sources but return the raw structures so
# the frontend can render dashboard blocks (stat strips, tables, meters, bands)
# instead of flattened markdown. The markdown export is unaffected.

def features_data(requirements: list[dict] | None) -> dict:
    reqs = requirements or []
    order = {"must": 0, "should": 1, "could": 2}
    rs = sorted(reqs, key=lambda r: order.get((r.get("priority") or "").lower(), 9))
    items = [{
        "priority": (r.get("priority") or "").upper(),
        "text": r.get("text", ""),
        "acceptance_criteria": r.get("acceptance_criteria") or "",
    } for r in rs]
    counts = {"MUST": 0, "SHOULD": 0, "COULD": 0}
    for it in items:
        if it["priority"] in counts:
            counts[it["priority"]] += 1
    return {"requirements": items, "counts": counts}


def architecture_data(arch: dict | None) -> dict:
    arch = arch or {}
    comps = [{
        "name": c.get("name", ""),
        "technology": c.get("technology") or "",
        "description": c.get("description") or "",
    } for c in (arch.get("components") or [])]
    return {
        "components": comps,
        "tech_stack": dict(arch.get("tech_stack") or {}),
        "integration_notes": arch.get("integration_notes") or "",
        "has_mermaid": bool(arch.get("mermaid_code")),
    }


def data_model_data(dm: dict | None) -> dict:
    dm = dm or {}
    entities = []
    for e in dm.get("entities") or []:
        entities.append({
            "name": e.get("name", ""),
            "description": e.get("description") or "",
            "fields": [{
                "name": f.get("name", ""),
                "type": f.get("type") or "",
                "constraints": f.get("constraints") or "",
                "description": f.get("description") or "",
            } for f in (e.get("fields") or [])],
        })
    return {"entities": entities, "relationships": list(dm.get("relationships") or [])}


def ai_workflow_data(value) -> dict:
    aw = _coerce_ai_workflow(value)
    if not aw:
        return {}
    return {
        "summary": aw.get("summary") or "",
        "model": aw.get("model") or "",
        "model_version": aw.get("model_version") or "",
        "task": aw.get("task") or "",
        "inputs": [{"name": i.get("name", ""), "description": i.get("description", "")}
                   for i in (aw.get("inputs") or [])],
        "outputs": [{"name": o.get("name", ""), "description": o.get("description", ""),
                     "format": o.get("format") or ""} for o in (aw.get("outputs") or [])],
        "fallbacks": [{"condition": f.get("condition", ""), "action": f.get("action", "")}
                      for f in (aw.get("fallbacks") or [])],
        "monitoring": list(aw.get("monitoring") or []),
    }


def evaluation_data(ev: dict | None) -> dict:
    ev = ev or {}
    dims = []
    for d in ev.get("dimensions") or []:
        if d.get("applicable") is False:
            continue
        dims.append({
            "name": d.get("name", ""),
            "level": (d.get("level") or "").lower(),
            "score": d.get("score"),
            "comment": d.get("comment") or "",
        })
    return {
        "overall_level": (ev.get("overall_level") or "").lower(),
        "recommendation": ev.get("recommendation") or "",
        "dimensions": dims,
    }


def dod_data(done_criteria: dict | None, gaps: dict | None, checklist: dict | None) -> dict:
    criteria = [{
        "category": c.get("category") or "",
        "text": c.get("text", ""),
        "measurable": bool(c.get("measurable")),
    } for c in ((done_criteria or {}).get("criteria") or [])]
    gp = [{
        "severity": (g.get("severity") or "").lower(),
        "type": g.get("type") or "",
        "issue": g.get("issue") or "",
        "suggestion": g.get("suggestion") or "",
    } for g in ((gaps or {}).get("gaps") or [])]
    items = [{
        "area": it.get("area") or "",
        "task": it.get("task", ""),
        "done": bool(it.get("done")),
    } for it in ((checklist or {}).get("items") or [])]
    return {"criteria": criteria, "gaps": gp, "checklist": items}


# ─── Section assembly ─────────────────────────────────────

def build_sections(
    project: dict,
    insights: list[dict],
    design: dict,
    finalize: dict,
    interview_done: bool = False,
) -> list[dict]:
    """Build the 7 canonical sections. Each section's status is exact: it's
    'complete' only when its backing data exists and produced content.

    The profile is complete once the interview is done (or any insight was
    captured) — the project's own metadata is real profile content even when an
    older interview extracted no structured insights.
    """
    design = design or {}
    finalize = finalize or {}

    arch = design.get("architecture")
    dm = design.get("data_model")
    aw = design.get("ai_workflow")
    reqs = design.get("requirements")
    ev = finalize.get("evaluation")
    dc, gaps, checklist = finalize.get("done_criteria"), finalize.get("gaps"), finalize.get("checklist")

    specs = [
        ("profile", "프로젝트 프로필", interview_done or bool(insights),
         profile_md(project, insights), profile_data(project, insights)),
        ("features", "기능 정의", bool(reqs),
         features_md(reqs), features_data(reqs)),
        ("architecture", "시스템 구조", bool((arch or {}).get("components")),
         architecture_md(arch), architecture_data(arch)),
        ("data", "데이터 구조", bool((dm or {}).get("entities")),
         data_model_md(dm), data_model_data(dm)),
        ("ai", "AI 흐름", bool(aw),
         ai_workflow_md(aw), ai_workflow_data(aw)),
        ("evaluation", "정직한 평가", bool(ev),
         evaluation_md(ev), evaluation_data(ev)),
        ("dod", "완료 조건", bool(dc or gaps or checklist),
         dod_md(dc, gaps, checklist), dod_data(dc, gaps, checklist)),
    ]

    sections = []
    for sid, title, present, content, data in specs:
        complete = bool(present and content and content.strip())
        sections.append({
            "id": sid,
            "title": title,
            "kind": sid,
            "status": "complete" if complete else "empty",
            "content": content if complete else "",
            "data": data if complete else None,
        })
    return sections


def _demote_headings(md: str, by: int = 2) -> str:
    """Push any ATX headings inside section content below the section header so
    the combined document keeps a sane outline (section is h2, so content
    headings start at h4; capped at h6). Section builders use **bold** sub-labels,
    but free-text fields (e.g. a legacy ai_workflow summary) can carry raw `#`.
    Headings inside fenced code blocks are left untouched."""
    out, in_fence = [], False
    for line in md.split("\n"):
        if line.lstrip().startswith("```"):
            in_fence = not in_fence
        elif not in_fence:
            m = re.match(r"^(#{1,6}) ", line)
            if m:
                line = "#" * min(len(m.group(1)) + by, 6) + " " + line[m.end():]
        out.append(line)
    return "\n".join(out)


def sections_to_markdown(project: dict, sections: list[dict]) -> str:
    """Flatten the document model into one Markdown file for download — the same
    content the live preview shows. Only complete sections are included; empty
    ones are omitted so the download reflects the document as it stands."""
    complete = [s for s in sections if s.get("status") == "complete"]
    lines = [f"# {project.get('name', '킥오프 문서')}"]
    tags = []
    if project.get("project_type"):
        tags.append(str(project["project_type"]))
    tags.append(f"완성도 {len(complete)}/{len(sections)} 섹션")
    lines += ["", " · ".join(tags), "", "---"]
    for i, s in enumerate(complete, 1):
        lines += ["", f"## {i}. {s['title']}", "", _demote_headings(s.get("content", ""))]
    return "\n".join(lines).strip() + "\n"
