"""공통 테스트 픽스처.

실제 Supabase·Claude·구글 로그인 없이 핵심 로직을 검증하기 위해
인증 우회 TestClient와 최소 가짜 Supabase 팩토리를 제공한다.
"""
import types

import pytest
from fastapi.testclient import TestClient

from app.main import app
from app.middleware.auth import get_current_user

_TEST_USER = {"id": "u1", "email": "tester@example.com", "role": "admin"}


@pytest.fixture
def client():
    """인증을 우회한 TestClient(가짜 admin 사용자)."""
    app.dependency_overrides[get_current_user] = lambda: _TEST_USER
    yield TestClient(app)
    app.dependency_overrides.clear()


@pytest.fixture
def fake_supabase():
    """주어진 세션을 interview_sessions 조회로 돌려주는 최소 가짜 Supabase 팩토리."""
    def _make(session: dict):
        class Query:
            def __init__(self, data):
                self._data = data

            def select(self, *a, **k):
                return self

            def eq(self, *a, **k):
                return self

            def execute(self):
                return types.SimpleNamespace(data=self._data)

        class SB:
            def table(self, name):
                return Query([session] if name == "interview_sessions" else [])

        return SB()

    return _make
