# Next Steps (Detailed)

This guide walks you through the remaining manual steps and how to verify the app end-to-end.

## 1) Supabase Dashboard Setup (Required)

1. Open your Supabase project.
2. Go to Authentication -> Providers.
3. Enable Email and Magic Link.
4. Go to Authentication -> URL Configuration.
5. Add redirect URLs:
   - http://localhost:3000
   - Your production frontend URL (once deployed)
6. Go to Project Settings -> API.
7. Copy the Project URL and anon public key.
8. Go to Project Settings -> JWT Settings.
9. Copy the JWT secret.

## 2) Environment Variables (Required)

Create or update these files:

- Root .env (backend):

  OPENROUTER_API_KEY=your_openrouter_key
  OPENROUTER_API_URL=https://openrouter.ai/api/v1/chat/completions
  SUPABASE_URL=https://your-project.supabase.co
  SUPABASE_ANON_KEY=your_supabase_anon_key
  SUPABASE_JWT_SECRET=your_jwt_secret
  ALLOWED_MODEL_IDS=google/gemini-2.0-flash-exp:free,meta-llama/llama-3-8b-instruct:free
  CORS_ALLOW_ORIGINS=http://localhost:3000

- Frontend [frontend/.env.local](frontend/.env.local):

  NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
  NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
  NEXT_PUBLIC_API_BASE_URL=http://localhost:8000

Notes:
- Keep keys out of source control.
- Restart servers after changing env vars.

## 3) Run the Backend (FastAPI)

1. Open a terminal in the project root.
2. Run:

   cd backend
   python -m venv .venv
   ./.venv/Scripts/Activate.ps1
   pip install -r requirements.txt
   uvicorn app.main:app --reload --port 8000

3. Confirm health:
   - Visit http://localhost:8000/health

## 4) Run the Frontend (Next.js)

1. Open a new terminal.
2. Run:

   cd frontend
   npm install
   npm run dev

3. Open http://localhost:3000

## 5) Manual Test Checklist

1. Sign in with Magic Link.
2. Create a new conversation (sidebar -> New).
3. Send a message and confirm streaming response appears.
4. Rename the conversation and confirm it persists after reload.
5. Delete a conversation and confirm it disappears.
6. Refresh the page and confirm last selection is restored.
7. Disconnect backend and confirm the API error banner appears.

## 6) Supabase RLS Verification

1. Create two test users (two different emails).
2. Log in as user A and create a conversation.
3. Log in as user B and verify user A's conversations are not visible.

## 7) Deployment Plan

Frontend:
- Deploy on Vercel (or similar).
- Set the frontend env vars in the hosting dashboard.

Backend:
- Deploy on Render/Railway/Fly (or similar).
- Set backend env vars in the hosting dashboard.
- Update CORS_ALLOW_ORIGINS to include your production frontend URL.

Supabase:
- Update redirect URLs to include production frontend.

## 8) Optional Improvements

- Add a toast system for errors and success states.
- Add pagination to conversation list if it grows.
- Add a model picker based on ALLOWED_MODEL_IDS from the backend.

## 9) Troubleshooting

- "Missing Supabase env vars": ensure frontend .env.local exists and restart Next.js.
- "Failed to fetch": ensure backend is running on port 8000 and CORS is set.
- "Invalid token": verify SUPABASE_JWT_SECRET matches Supabase project settings.
