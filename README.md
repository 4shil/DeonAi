# DeonAi

Minimal chat app with a FastAPI backend, Next.js frontend, Supabase auth, and OpenRouter streaming.

## Setup

1. Create a Supabase project and run the schema in [supabase/schema.sql](supabase/schema.sql).
2. Create a root .env file with backend settings:

```env
OPENROUTER_API_KEY=your_openrouter_key
OPENROUTER_API_URL=https://openrouter.ai/api/v1/chat/completions
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_JWT_SECRET=your_jwt_secret
CORS_ALLOW_ORIGINS=http://localhost:3000
```

3. Create [frontend/.env.local](frontend/.env.local) with frontend settings:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
```

## Run

Backend:

```powershell
cd backend
python -m venv .venv
./.venv/Scripts/Activate.ps1
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

Frontend:

```powershell
cd frontend
npm install
npm run dev
```

## Manual test checklist

- Sign in with Supabase magic link.
- Create a new conversation from the sidebar.
- Send a message and verify streaming response.
- Rename a conversation and confirm it persists.
- Delete a conversation and confirm list updates.
- Refresh the page and confirm the last selection is restored.
