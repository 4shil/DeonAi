from supabase import create_client, Client
from app.config import settings

def get_supabase_client(access_token: str) -> Client:
    """Create Supabase client with user's access token"""
    client = create_client(settings.supabase_url, settings.supabase_anon_key)
    client.auth.set_session(access_token, "")
    return client

def get_service_client() -> Client:
    """Create Supabase client with service key (for admin operations)"""
    return create_client(settings.supabase_url, settings.supabase_anon_key)
