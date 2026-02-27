# DeonAi

A terminal-inspired AI chat interface. Dark, minimal, keyboard-driven. Built with Next.js on the frontend and FastAPI on the backend, using Supabase for auth and storage and OpenRouter for model access.

![terminal chat interface](https://media.giphy.com/media/26tn33aiTi1jkl6H6/giphy.gif)

## Stack

- **Frontend:** Next.js 14, TypeScript, Tailwind CSS
- **Backend:** FastAPI (Python)
- **Auth & Database:** Supabase (PostgreSQL + Row Level Security)
- **AI:** OpenRouter (bring your own API key)
- **Deployment:** Render

## Getting Started

### Prerequisites

- Node.js 18+
- Python 3.9+
- Supabase project
- OpenRouter API key

### Backend

```bash
cd backend
pip install -r requirements.txt
cp .env.example .env   # fill in your values
uvicorn app.main:app --reload --port 8000
```

### Frontend

```bash
cd frontend
npm install
cp .env.local.example .env.local   # fill in your values
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment Variables

**Backend** (`backend/.env`):

```
SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_JWT_SECRET=
CORS_ALLOW_ORIGINS=http://localhost:3000
```

**Frontend** (`frontend/.env.local`):

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
```

## Database Setup

Run the following in your Supabase SQL editor:

```sql
CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  model_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own conversations"
  ON conversations FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage messages in own conversations"
  ON messages FOR ALL
  USING (conversation_id IN (SELECT id FROM conversations WHERE user_id = auth.uid()))
  WITH CHECK (conversation_id IN (SELECT id FROM conversations WHERE user_id = auth.uid()));
```

## Project Structure

```
DeonAi/
├── frontend/
│   ├── app/            # Next.js app router pages
│   ├── components/     # UI components
│   └── lib/            # Supabase client, utilities
└── backend/
    ├── app/
    │   ├── main.py     # FastAPI entrypoint
    │   ├── routes/     # API route handlers
    │   └── services/   # OpenRouter, Supabase logic
    └── requirements.txt
```

## Keyboard Shortcuts

| Shortcut       | Action                  |
|----------------|-------------------------|
| `Cmd+N`        | New conversation        |
| `Cmd+K`        | Search conversations    |
| `Cmd+,`        | Open settings           |
| `Escape`       | Close modal / blur      |
| `/`            | Focus input             |
| `Enter`        | Send message            |
| `Shift+Enter`  | Insert newline          |

## API Reference

| Method | Endpoint                              | Description              |
|--------|---------------------------------------|--------------------------|
| GET    | `/health`                             | Health check             |
| GET    | `/api/conversations`                  | List conversations       |
| POST   | `/api/conversations`                  | Create conversation      |
| GET    | `/api/conversations/{id}/messages`    | Get messages             |
| PATCH  | `/api/conversations/{id}`             | Rename conversation      |
| DELETE | `/api/conversations/{id}`             | Delete conversation      |
| POST   | `/api/chat`                           | Stream chat (SSE)        |

## License

MIT
