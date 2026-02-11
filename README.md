# DeonAI - Complete Rebuild v2.0

## Overview
Modern AI chat application with OpenRouter integration, user authentication, and conversation management.

## Tech Stack

### Backend
- FastAPI (Python)
- Supabase (PostgreSQL + Auth)
- OpenRouter API (AI models)
- JWT authentication
- Streaming responses

### Frontend
- Next.js 14 (React)
- TypeScript
- Tailwind CSS
- Supabase Auth
- Server-Sent Events (SSE)

## Features
- ✅ User authentication (email/password)
- ✅ Multiple AI models via OpenRouter
- ✅ Conversation management
- ✅ Real-time streaming responses
- ✅ User-provided API keys
- ✅ Mobile responsive
- ✅ Dark theme UI

## Setup Instructions

### 1. Supabase Database Setup

Run this SQL in your Supabase SQL editor:

```sql
-- Conversations table
CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  model_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Messages table
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Policies for conversations
CREATE POLICY "Users can view own conversations"
  ON conversations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own conversations"
  ON conversations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own conversations"
  ON conversations FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own conversations"
  ON conversations FOR DELETE
  USING (auth.uid() = user_id);

-- Policies for messages
CREATE POLICY "Users can view messages in own conversations"
  ON messages FOR SELECT
  USING (
    conversation_id IN (
      SELECT id FROM conversations WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create messages in own conversations"
  ON messages FOR INSERT
  WITH CHECK (
    conversation_id IN (
      SELECT id FROM conversations WHERE user_id = auth.uid()
    )
  );
```

### 2. Environment Variables

#### Backend (Render)
Set these in your Render backend service:
- `SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_ANON_KEY` - Your Supabase anon key
- `SUPABASE_JWT_SECRET` - Your Supabase JWT secret
- `OPENROUTER_API_KEY` - (optional) Server-side fallback key

#### Frontend (Render)
Set these in your Render frontend service:
- `NEXT_PUBLIC_SUPABASE_URL` - Same as backend
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Same as backend
- `NEXT_PUBLIC_API_BASE_URL` - Your backend URL

### 3. Local Development

#### Backend
```bash
cd backend
pip install -r requirements.txt
# Set environment variables in .env
uvicorn app.main:app --reload --port 8000
```

#### Frontend
```bash
cd frontend
npm install
# Set environment variables in .env.local
npm run dev
```

### 4. Deployment to Render

1. Push code to GitHub
2. Connect Render to your repository
3. Render will auto-detect render.yaml
4. Set environment variables in Render dashboard
5. Deploy!

## Usage

1. Sign up or sign in
2. Add your OpenRouter API key (get one at https://openrouter.ai/keys)
3. Start chatting!
4. Create multiple conversations
5. Switch between AI models

## API Endpoints

- `GET /health` - Health check
- `GET /api/conversations` - List user's conversations
- `POST /api/conversations` - Create new conversation
- `GET /api/conversations/{id}/messages` - Get conversation messages
- `PATCH /api/conversations/{id}` - Update conversation
- `DELETE /api/conversations/{id}` - Delete conversation
- `POST /api/chat` - Send message and stream response
- `POST /api/models` - Fetch available models

## Architecture

```
Frontend (Next.js)
    ↓
Supabase Auth
    ↓
Backend API (FastAPI)
    ↓
├─ Supabase DB (conversations, messages)
└─ OpenRouter API (AI models)
```

## License
MIT
