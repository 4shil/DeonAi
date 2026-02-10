import os


def get_env(name: str, default: str | None = None) -> str:
    value = os.getenv(name, default)
    if value is None:
        raise RuntimeError(f"Missing required env var: {name}")
    return value


class Settings:
    def __init__(self) -> None:
        self.openrouter_api_key = get_env("OPENROUTER_API_KEY")
        self.supabase_url = get_env("SUPABASE_URL")
        self.supabase_anon_key = get_env("SUPABASE_ANON_KEY")
        self.supabase_jwt_secret = get_env("SUPABASE_JWT_SECRET")
        self.openrouter_api_url = os.getenv(
            "OPENROUTER_API_URL", "https://openrouter.ai/api/v1/chat/completions"
        )
        self.cors_allow_origins = os.getenv("CORS_ALLOW_ORIGINS", "*")


settings = Settings()
