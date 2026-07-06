import anthropic
from anthropic import Anthropic

from app.config import settings

_client: Anthropic | None = None


class AIServiceError(Exception):
    """Claude 호출이 재시도 후에도 실패했을 때 던지는 도메인 예외.

    main.py의 전역 핸들러가 이를 잡아 503 + 사용자용 한국어 메시지로 변환한다.
    """


def get_claude() -> Anthropic:
    global _client
    if _client is None:
        _client = Anthropic(
            api_key=settings.ANTHROPIC_API_KEY,
            timeout=60.0,   # SDK 기본 10분 → 60초 (웹 UX 기준)
            max_retries=2,  # 429/5xx/529/타임아웃 시 SDK가 자동 재시도 (기본값 명시)
        )
    return _client


def chat(
    system: list[dict],
    messages: list[dict],
    max_tokens: int = 1024,
    model: str = "claude-sonnet-4-6",
) -> tuple[str, dict]:
    client = get_claude()
    try:
        response = client.messages.create(
            model=model,
            max_tokens=max_tokens,
            system=system,
            messages=messages,
        )
    except (anthropic.APITimeoutError, anthropic.APIConnectionError) as e:
        raise AIServiceError("AI 응답이 지연되고 있어요. 잠시 후 다시 시도해주세요.") from e
    except anthropic.RateLimitError as e:
        raise AIServiceError("요청이 많아 잠시 대기 중이에요. 잠시 후 다시 시도해주세요.") from e
    except anthropic.APIStatusError as e:
        raise AIServiceError("AI 서버에 일시적인 문제가 있어요. 다시 시도해주세요.") from e
    text = response.content[0].text
    usage = {
        "input_tokens": response.usage.input_tokens,
        "output_tokens": response.usage.output_tokens,
        "cache_read": getattr(response.usage, "cache_read_input_tokens", 0),
        "cache_creation": getattr(response.usage, "cache_creation_input_tokens", 0),
    }
    return text, usage
