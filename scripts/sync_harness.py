"""
sync_harness.py — 하네스 스킬 .md + Reference 파일을 backend/로 복사

Usage:
    python scripts/sync_harness.py [harness_skills_path]

Default harness path: .claude/skills/
"""

import shutil
import sys
from pathlib import Path

BACKEND_DIR = Path(__file__).resolve().parent.parent / "backend"
DEFAULT_HARNESS = Path(__file__).resolve().parent.parent / ".claude" / "skills"


def sync(harness_path: Path):
    skills_dest = BACKEND_DIR / "skills"
    refs_dest = BACKEND_DIR / "references"

    skills_dest.mkdir(exist_ok=True)
    refs_dest.mkdir(exist_ok=True)

    # Clear existing
    for f in skills_dest.glob("*.md"):
        f.unlink()
    for f in refs_dest.glob("*.md"):
        f.unlink()

    skill_count = 0
    ref_count = 0

    for skill_dir in harness_path.iterdir():
        if not skill_dir.is_dir():
            continue

        # Copy skill index/SKILL.md
        for name in ["index.md", "SKILL.md"]:
            src = skill_dir / name
            if src.exists():
                dest = skills_dest / f"{skill_dir.name}.md"
                shutil.copy2(src, dest)
                skill_count += 1
                break

        # Copy reference files
        ref_dir = skill_dir / "references"
        if ref_dir.exists():
            for ref_file in ref_dir.glob("*.md"):
                dest = refs_dest / f"{skill_dir.name}_{ref_file.name}"
                shutil.copy2(ref_file, dest)
                ref_count += 1

    print(f"Synced {skill_count} skills, {ref_count} references to backend/")


if __name__ == "__main__":
    harness_path = Path(sys.argv[1]) if len(sys.argv) > 1 else DEFAULT_HARNESS
    if not harness_path.exists():
        print(f"Harness path not found: {harness_path}")
        sys.exit(1)
    sync(harness_path)
