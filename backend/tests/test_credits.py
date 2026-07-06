"""projects._check_credits: 크레딧 한도 검사(우회·admin·한도 이내·소진)."""
import pytest
from fastapi import HTTPException

import app.api.projects as pj


def test_bypass_always_passes(monkeypatch):
    monkeypatch.setattr(pj.settings, "DEV_BYPASS_AUTH", True)
    pj._check_credits({"plan": "free", "credits_used": 999})  # 우회 ON → 통과


def test_admin_passes(monkeypatch):
    monkeypatch.setattr(pj.settings, "DEV_BYPASS_AUTH", False)
    pj._check_credits({"role": "admin", "credits_used": 999})  # admin → 무제한


def test_under_limit_passes(monkeypatch):
    monkeypatch.setattr(pj.settings, "DEV_BYPASS_AUTH", False)
    pj._check_credits({"plan": "free", "credits_used": 1})  # free 한도 2 미만


def test_over_limit_raises_403(monkeypatch):
    monkeypatch.setattr(pj.settings, "DEV_BYPASS_AUTH", False)
    with pytest.raises(HTTPException) as exc:
        pj._check_credits({"plan": "free", "credits_used": 2})  # 소진
    assert exc.value.status_code == 403
