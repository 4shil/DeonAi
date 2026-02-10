from __future__ import annotations

import time
from collections import deque
from dataclasses import dataclass


@dataclass
class RateLimitResult:
    allowed: bool
    retry_after: int


class RateLimiter:
    def __init__(self) -> None:
        self._events: dict[str, deque[float]] = {}

    def allow(self, key: str, limit: int, window_seconds: int) -> RateLimitResult:
        if limit <= 0 or window_seconds <= 0:
            return RateLimitResult(allowed=True, retry_after=0)

        now = time.monotonic()
        window_start = now - window_seconds
        events = self._events.get(key)
        if events is None:
            events = deque()
            self._events[key] = events

        while events and events[0] < window_start:
            events.popleft()

        if len(events) >= limit:
            retry_after = max(1, int(window_seconds - (now - events[0])) + 1)
            return RateLimitResult(allowed=False, retry_after=retry_after)

        events.append(now)
        return RateLimitResult(allowed=True, retry_after=0)
