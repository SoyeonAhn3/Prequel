"""claude_client.chat: SDK 예외 → 도메인 예외(AIServiceError) 변환 검증. (Phase 9 #5-A)"""
import anthropic
import pytest

import app.core.claude_client as cc


@pytest.mark.parametrize(
    "exc_type",
    [
        anthropic.APITimeoutError,
        anthropic.APIConnectionError,
        anthropic.RateLimitError,
        anthropic.APIStatusError,
    ],
)
def test_sdk_exception_becomes_aiservice_error(exc_type, monkeypatch):
    class FakeMessages:
        def create(self, **kwargs):
            # 생성자 인자 없이 예외 인스턴스 생성(except 라우팅만 검증)
            raise exc_type.__new__(exc_type)

    class FakeClient:
        messages = FakeMessages()

    monkeypatch.setattr(cc, "_client", FakeClient())

    with pytest.raises(cc.AIServiceError):
        cc.chat(system=[], messages=[])
