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
    
    if not key:
        raise RuntimeError("No API key provided. Please set your OpenRouter API key in settings.")
    
    headers = {
        "Authorization": f"Bearer {key}",
        "Content-Type": "application/json",
    }
    payload = {
        "model": model_id,
        "messages": messages,
        "stream": True,
    }

    try:
        async with httpx.AsyncClient(timeout=None) as client:
            response = await client.post(
                settings.openrouter_api_url, headers=headers, json=payload
            )
            if response.status_code >= 400:
                error_body = await response.aread()
                error_text = error_body.decode("utf-8", "ignore")
                logger.error(
                    "OpenRouter error: %s %s",
                    response.status_code,
                    error_text,
                )
                
                # Parse error for better user message
                if response.status_code == 401:
                    raise RuntimeError("Invalid API key. Please check your OpenRouter API key.")
                elif response.status_code == 402:
                    raise RuntimeError("Insufficient credits. Please add credits to your OpenRouter account.")
                elif response.status_code == 429:
                    raise RuntimeError("Rate limit exceeded. Please try again later.")
                else:
                    raise RuntimeError(f"OpenRouter error ({response.status_code}): {error_text}")

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
    except httpx.RequestError as e:
        logger.error("Network error connecting to OpenRouter: %s", str(e))
        raise RuntimeError(f"Network error: Unable to connect to OpenRouter. {str(e)}")
