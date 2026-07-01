"""
sync_harness.py — DEPRECATED (BL-002, 2026-07-01). 실행하지 마세요.

배경
    원래 이 스크립트는 `.claude/skills/`(이 저장소의 개발용 Claude Code 하네스,
    옛 CLI 워크플로우)를 `backend/skills/`(런타임 API 프롬프트)로 복사하도록
    설계됐습니다. 그러나 두 디렉토리는 내용이 완전히 다른 별개의 것으로 갈라졌습니다:

      - .claude/skills/  = 개발용 하네스 (슬래시 커맨드 · CLI 워크플로우)
      - backend/skills/  = 런타임이 load_skill()로 읽는 API용 프롬프트 (단일 원본)

    이 스크립트를 실행하면 backend/skills/*.md 를 전부 삭제한 뒤 .claude 버전으로
    덮어써, 인터뷰·설계·마무리 프롬프트가 깨지고 backend 전용 파일
    (예: kickoff-document.md — .claude 에 대응 폴더 없음)은 영구 삭제됩니다.

결정 (BL-002)
    backend/skills/ 를 단일 진실 공급원(single source of truth)으로 확정.
    스킬을 수정하려면 backend/skills/*.md 를 직접 편집하세요. 동기화 단계는 없습니다.

이 파일은 삭제하지 않고 스텁으로 남겨 둡니다 — 왜 폐기됐는지 기록을 보존하고,
누군가 동일한 동기화 스크립트를 다시 만드는 것을 막기 위함입니다.
"""

import sys


def main() -> int:
    sys.stderr.write(
        "sync_harness.py 는 폐기되었습니다 (BL-002).\n"
        "backend/skills/ 가 런타임 스킬의 단일 원본입니다 — 직접 수정하세요.\n"
        "이 스크립트는 backend/skills 를 삭제·덮어써 AI 기능을 깨뜨리므로 실행을 거부합니다.\n"
    )
    return 1


if __name__ == "__main__":
    sys.exit(main())
