from supabase import create_client, Client

from app.core.config import settings


def get_supabase_client() -> Client:
    return create_client(settings.supabase_url, settings.supabase_anon_key)


def get_user_supabase_client(access_token: str) -> Client:
    client = create_client(settings.supabase_url, settings.supabase_anon_key)
    client.postgrest.auth(access_token)
    return client
