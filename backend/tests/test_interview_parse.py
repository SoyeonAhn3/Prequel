"""interview._parse_ai_response: AI 응답에서 JSON 추출(직접·펜스·임베드·폴백)."""
import app.api.interview as iv


def test_parse_direct_json():
    r = iv._parse_ai_response('{"message": "안녕", "step_complete": true}')
    assert r["message"] == "안녕"
    assert r["step_complete"] is True


def test_parse_fenced_json():
    text = '여기요:\n```json\n{"message": "본문"}\n```'
    r = iv._parse_ai_response(text)
    assert r["message"] == "본문"


def test_parse_embedded_json():
    text = '설명 {"message": "중간"} 뒤'
    r = iv._parse_ai_response(text)
    assert r["message"] == "중간"


def test_parse_non_json_falls_back_to_raw_text():
    r = iv._parse_ai_response("그냥 평범한 텍스트")
    assert r["message"] == "그냥 평범한 텍스트"
    assert r["insights"] == []
    assert r["step_complete"] is False
