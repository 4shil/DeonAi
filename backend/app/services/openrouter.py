import json
import logging
from typing import AsyncIterator

import httpx

from app.core.config import settings

logger = logging.getLogger("chatbot.openrouter")


async def fetch_models(api_key: str) -> list[dict]:
    """Fetch available models from OpenRouter"""
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
    }
    
    async with httpx.AsyncClient(timeout=30.0) as client:
        try:
            response = await client.get(
                "https://openrouter.ai/api/v1/models",
                headers=headers
            )
            if response.status_code >= 400:
                error_body = await response.aread()
                logger.error(
                    "OpenRouter models fetch error: %s %s",
                    response.status_code,
                    error_body.decode("utf-8", "ignore"),
                )
                raise RuntimeError(
                    f"OpenRouter error: {response.status_code} {error_body.decode('utf-8', 'ignore')}"
                )
            
            data = response.json()
            return data.get("data", [])
        except Exception as e:
            logger.error("Failed to fetch models from OpenRouter: %s", str(e))
            raise


async def stream_chat(messages: list[dict[str, str]], model_id: str, api_key: str | None = None) -> AsyncIterator[str]:
    # Use user-provided API key if available, otherwise fall back to server key
    key = api_key or settings.openrouter_api_key
    headers = {
        "Authorization": f"Bearer {key}",
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
            logger.error(
                "OpenRouter error: %s %s",
                response.status_code,
                error_body.decode("utf-8", "ignore"),
            )
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
