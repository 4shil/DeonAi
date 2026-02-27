# DeonAi

A terminal-inspired AI chat interface with multi-model support, conversation history, and user authentication. Frontend in Next.js, backend in FastAPI, persistence via Supabase.

![demo](https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExYWZhZmpzM3IxeHBncGlhY3kwNWhxdjZ3Mno1djhxcG8wdWZteGt2ZCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/26tn33aiTi1jkl6H6/giphy.gif)

---

## Stack

**Frontend**
- Next.js 14 + TypeScript
- Tailwind CSS
- Supabase JS client (auth)

**Backend**
- FastAPI + Uvicorn
- httpx (OpenRouter API calls)
- PyJWT (token verification)
- Supabase Python client

**Infrastructure**
- Supabase (auth + database)
- OpenRouter (model routing — access 200+ models with one API key)

---

## Architecture

```
Browser (Next.js)
    ↓ auth via Supabase
FastAPI backend
    ↓ forwards requests
OpenRouter API → any LLM (GPT, Claude, Mistral, etc.)
    ↑
Supabase — stores conversation history + user data
```

---

## Getting started

### Prerequisites

- Node.js 18+
- Python 3.10+
- A [Supabase](https://supabase.com) project
- An [OpenRouter](https://openrouter.ai) API key

### Backend

```bash
cd backend
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
cp ../.env.example .env  # fill in your keys
uvicorn app.main:app --reload
```

### Frontend

```bash
cd frontend
npm install
cp ../.env.example .env.local  # fill in NEXT_PUBLIC_ vars
npm run dev
```

Visit `http://localhost:3000`.

---

## Environment variables

```bash
# Backend
OPENROUTER_API_KEY=
OPENROUTER_API_URL=
SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_JWT_SECRET=
CORS_ALLOW_ORIGINS=http://localhost:3000

# Frontend
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
```

---

## Project structure

```
DeonAi/
├── backend/
│   └── app/
│       ├── main.py        # FastAPI app init
│       ├── routes.py      # API route handlers
│       ├── ai.py          # OpenRouter integration
│       ├── auth.py        # JWT verification
│       ├── database.py    # Supabase client
│       └── config.py      # Env config
├── frontend/
│   ├── app/               # Next.js app router
│   ├── components/
│   │   ├── ChatInterface.tsx
│   │   ├── ChatInput.tsx
│   │   ├── MessageBubble.tsx
│   │   ├── Sidebar.tsx         # Conversation list
│   │   ├── SettingsModal.tsx
│   │   ├── AuthGate.tsx
│   │   ├── Header.tsx
│   │   └── TypingIndicator.tsx
│   └── lib/
│       └── supabase.ts
├── supabase/
│   └── schema.sql         # Database schema
└── .env.example
```

---

## Database

Run `supabase/schema.sql` in your Supabase SQL editor to set up the required tables.

---

## Deployment

A `render.yaml` is included for one-click deploy to [Render](https://render.com). Set environment variables in the Render dashboard.

---

## License

MIT
