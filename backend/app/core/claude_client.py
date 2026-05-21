from anthropic import Anthropic

from app.config import settings

_client: Anthropic | None = None


def get_claude() -> Anthropic:
    global _client
    if _client is None:
        _client = Anthropic(api_key=settings.ANTHROPIC_API_KEY)
    return _client


def chat(
    system: list[dict],
    messages: list[dict],
    max_tokens: int = 1024,
    model: str = "claude-sonnet-4-6",
) -> tuple[str, dict]:
    client = get_claude()
    response = client.messages.create(
        model=model,
        max_tokens=max_tokens,
        system=system,
        messages=messages,
    )
    text = response.content[0].text
    usage = {
        "input_tokens": response.usage.input_tokens,
        "output_tokens": response.usage.output_tokens,
        "cache_read": getattr(response.usage, "cache_read_input_tokens", 0),
        "cache_creation": getattr(response.usage, "cache_creation_input_tokens", 0),
    }
    return text, usage
