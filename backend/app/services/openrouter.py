import json
from typing import AsyncIterator

import httpx

from app.core.config import settings


async def stream_chat(messages: list[dict[str, str]], model_id: str) -> AsyncIterator[str]:
    headers = {
        "Authorization": f"Bearer {settings.openrouter_api_key}",
        "Content-Type": "application/json",
    }
    payload = {
        "model": model_id,
        "messages": messages,
        "stream": True,
    }

    async with httpx.AsyncClient(timeout=None) as client:
        response = await client.post(
            settings.openrouter_api_url, headers=headers, json=payload
        )
        if response.status_code >= 400:
            error_body = await response.aread()
            raise RuntimeError(
                f"OpenRouter error: {response.status_code} {error_body.decode('utf-8', 'ignore')}"
            )

        async for line in response.aiter_lines():
            if not line or not line.startswith("data: "):
                continue
            data = line.removeprefix("data: ").strip()
            if data == "[DONE]":
                break
            try:
                payload = json.loads(data)
            except json.JSONDecodeError:
                continue

            choices = payload.get("choices") or []
            if not choices:
                continue
            delta = choices[0].get("delta") or {}
            token = delta.get("content")
            if token:
                yield token
