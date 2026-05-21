from pathlib import Path

_BASE = Path(__file__).parent.parent.parent
SKILLS_DIR = _BASE / "skills"
REFERENCES_DIR = _BASE / "references"


def load_skill(name: str) -> str:
    path = SKILLS_DIR / f"{name}.md"
    if not path.exists():
        raise FileNotFoundError(f"Skill not found: {name}")
    return path.read_text(encoding="utf-8")


def load_reference(name: str) -> str:
    path = REFERENCES_DIR / f"{name}.md"
    if not path.exists():
        raise FileNotFoundError(f"Reference not found: {name}")
    return path.read_text(encoding="utf-8")


def list_references() -> list[str]:
    return [p.stem for p in REFERENCES_DIR.glob("*.md")]
