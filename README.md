# DeonAI

A terminal-inspired AI chat interface built with Next.js, FastAPI, Supabase, and OpenRouter.

## Stack

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS
- **Backend**: FastAPI, Supabase (PostgreSQL + Auth), OpenRouter
- **Deployment**: Render

## Features

- Dark, terminal-style interface (no glassmorphism)
- Multiple AI model support via OpenRouter
- Streaming responses (Server-Sent Events)
- Conversation management with search
- Keyboard shortcuts (Cmd+N, Cmd+K, Cmd+,)
- Code blocks with syntax detection and copy
- Responsive design with mobile sidebar
- Supabase authentication (email/password)
- User-provided API keys (stored locally)

## Quick Start

### Prerequisites

- Node.js 18+
- Python 3.9+
- Supabase project
- OpenRouter API key

### Backend

```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

### Environment Variables

**Backend** (`.env`):
```
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_JWT_SECRET=your_jwt_secret
CORS_ALLOW_ORIGINS=http://localhost:3000
```

**Frontend** (`.env.local`):
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
```

### Database Setup

Run in Supabase SQL editor:

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

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Cmd+N` | New conversation |
| `Cmd+K` | Search conversations |
| `Cmd+,` | Open settings |
| `Escape` | Close modal / Focus input |
| `/` | Focus input |
| `Enter` | Send message |
| `Shift+Enter` | New line |

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check |
| GET | `/api/conversations` | List conversations |
| POST | `/api/conversations` | Create conversation |
| GET | `/api/conversations/{id}/messages` | Get messages |
| PATCH | `/api/conversations/{id}` | Update conversation |
| DELETE | `/api/conversations/{id}` | Delete conversation |
| POST | `/api/chat` | Stream chat response |

## Design

- Colors: `#0a0a0a`, `#1a1a1a`, `#2a2a2a` (dark grays), `#10b981` (accent green)
- Fonts: Inter (UI), JetBrains Mono (code)
- No animations, no glassmorphism - clean and functional

## License

MIT

---

Built by Ashil
