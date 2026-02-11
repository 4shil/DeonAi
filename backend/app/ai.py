import json
import httpx
from typing import AsyncIterator
from app.config import settings

async def stream_chat_completion(
    messages: list[dict],
    model: str,
    api_key: str | None = None
) -> AsyncIterator[str]:
    """Stream chat completion from OpenRouter"""
    key = api_key or settings.openrouter_api_key
    
    if not key:
        raise ValueError("No API key provided")
    
    headers = {
        "Authorization": f"Bearer {key}",
        "Content-Type": "application/json",
    }
    
    payload = {
        "model": model,
        "messages": messages,
        "stream": True,
    }
    
    async with httpx.AsyncClient(timeout=120.0) as client:
        async with client.stream(
            "POST",
            settings.openrouter_api_url,
            headers=headers,
            json=payload
        ) as response:
            if response.status_code != 200:
                error_text = await response.aread()
                raise Exception(f"OpenRouter error: {response.status_code} - {error_text.decode()}")
            
            async for line in response.aiter_lines():
                if not line.strip() or not line.startswith("data: "):
                    continue
                
                data = line.replace("data: ", "").strip()
                if data == "[DONE]":
                    break
                
                try:
                    chunk = json.loads(data)
                    content = chunk.get("choices", [{}])[0].get("delta", {}).get("content")
                    if content:
                        yield content
                except json.JSONDecodeError:
                    continue

async def fetch_available_models(api_key: str) -> list[dict]:
    """Fetch available models from OpenRouter"""
    headers = {
        "Authorization": f"Bearer {api_key}",
    }
    
    async with httpx.AsyncClient(timeout=30.0) as client:
        response = await client.get(
            "https://openrouter.ai/api/v1/models",
            headers=headers
        )
        if response.status_code != 200:
            raise Exception(f"Failed to fetch models: {response.status_code}")
        
        data = response.json()
        return data.get("data", [])
