import os
from typing import Optional

class Settings:
    def __init__(self):
        # Supabase
        self.supabase_url: str = os.getenv("SUPABASE_URL", "")
        self.supabase_anon_key: str = os.getenv("SUPABASE_ANON_KEY", "")
        self.supabase_jwt_secret: str = os.getenv("SUPABASE_JWT_SECRET", "")
        
        # OpenRouter
        self.openrouter_api_key: str = os.getenv("OPENROUTER_API_KEY", "")
        self.openrouter_api_url: str = os.getenv(
            "OPENROUTER_API_URL", 
            "https://openrouter.ai/api/v1/chat/completions"
        )
        
        # CORS
        self.cors_origins: list[str] = os.getenv(
            "CORS_ALLOW_ORIGINS", 
            "*"
        ).split(",")
        
        # Rate limiting
        self.rate_limit_requests: int = int(os.getenv("RATE_LIMIT_MAX_REQUESTS", "100"))
        self.rate_limit_window: int = int(os.getenv("RATE_LIMIT_WINDOW_SECONDS", "60"))

settings = Settings()
