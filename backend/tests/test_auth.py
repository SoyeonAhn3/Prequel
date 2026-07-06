"""auth.require_admin: admin 통과 / 비-admin 403 차단."""
import asyncio

import pytest
from fastapi import HTTPException

from app.middleware.auth import require_admin


def test_require_admin_allows_admin():
    result = asyncio.run(require_admin(user={"role": "admin", "id": "1"}))
    assert result["role"] == "admin"


def test_require_admin_blocks_non_admin():
    with pytest.raises(HTTPException) as exc:
        asyncio.run(require_admin(user={"role": "user", "id": "1"}))
    assert exc.value.status_code == 403
