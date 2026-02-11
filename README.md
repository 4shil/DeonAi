# DeonAI v2.0 - Modern UI Edition

![DeonAI](https://img.shields.io/badge/DeonAI-v2.0-purple?style=for-the-badge)
![Status](https://img.shields.io/badge/Status-Production-success?style=for-the-badge)

## ✨ Features

### 🎨 Modern UI/UX
- **Glassmorphic Design** - Beautiful glass-effect components with backdrop blur
- **Animated Gradients** - Dynamic background with floating color orbs
- **Smooth Animations** - Micro-interactions and transitions throughout
- **Responsive Layout** - Perfect on desktop, tablet, and mobile
- **Dark Theme** - Easy on the eyes with vibrant accent colors

### 🤖 AI Capabilities
- **Multiple Models** - Choose from various OpenRouter models
- **Streaming Responses** - Real-time AI responses as they generate
- **Conversation Management** - Save, load, and manage multiple chats
- **User API Keys** - Bring your own OpenRouter API key

### 🔐 Security
- **Supabase Authentication** - Secure email/password auth
- **JWT Tokens** - Secure API communication
- **Row-Level Security** - Database-level access control
- **Encrypted Storage** - Secure credential handling

## 🚀 Tech Stack

### Frontend
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **Custom Animations** - Hand-crafted CSS animations

### Backend
- **FastAPI** - Modern Python API framework
- **Supabase** - PostgreSQL database + Auth
- **OpenRouter** - AI model aggregation
- **Server-Sent Events** - Real-time streaming

### Deployment
- **Render** - Auto-deploy from GitHub
- **render.yaml** - Infrastructure as code

## 🎯 Quick Start

### 1. Clone Repository
```bash
git clone https://github.com/4shil/DeonAi.git
cd DeonAi
```

### 2. Setup Supabase

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

-- RLS Policies
CREATE POLICY "Users can manage own conversations"
  ON conversations FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage messages in own conversations"
  ON messages FOR ALL
  USING (
    conversation_id IN (
      SELECT id FROM conversations WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    conversation_id IN (
      SELECT id FROM conversations WHERE user_id = auth.uid()
    )
  );
```

### 3. Environment Variables

#### Backend (`.env` or Render)
```env
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_JWT_SECRET=your_jwt_secret
OPENROUTER_API_KEY=optional_fallback_key
CORS_ALLOW_ORIGINS=https://your-frontend.onrender.com
```

#### Frontend (`.env.local` or Render)
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
NEXT_PUBLIC_API_BASE_URL=https://your-backend.onrender.com
```

### 4. Local Development

#### Backend
```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

#### Frontend
```bash
cd frontend
npm install
npm run dev
```

Visit `http://localhost:3000`

### 5. Deploy to Render

1. Push to GitHub
2. Connect Render to your repo
3. Render auto-detects `render.yaml`
4. Set environment variables in dashboard
5. Deploy! 🎉

## 📱 Screenshots

### Login Screen
Glassmorphic authentication with animated gradient background

### Chat Interface
Modern message bubbles with smooth streaming and beautiful transitions

### Sidebar
Elegant conversation list with hover effects and gradients

## 🎨 Design System

### Colors
- **Primary Gradient**: Blue → Purple → Pink
- **Background**: Dark with animated gradients
- **Glass Effect**: rgba(255, 255, 255, 0.05-0.08)
- **Borders**: White with 10-20% opacity

### Animations
- **Gradient Shift**: 15s infinite background animation
- **Float**: 20s floating orbs with blur
- **Fade In**: 0.5s smooth element appearances
- **Hover Lift**: 0.3s transform on hover
- **Shimmer**: 3s infinite shine effect

### Typography
- **System Fonts**: -apple-system, BlinkMacSystemFont, Segoe UI
- **Weights**: 400 (regular), 600 (semibold), 700 (bold)
- **Tracking**: Wide for headings, normal for body

## 📚 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check |
| GET | `/api/conversations` | List conversations |
| POST | `/api/conversations` | Create conversation |
| GET | `/api/conversations/{id}/messages` | Get messages |
| PATCH | `/api/conversations/{id}` | Update conversation |
| DELETE | `/api/conversations/{id}` | Delete conversation |
| POST | `/api/chat` | Stream chat response |
| POST | `/api/models` | Fetch available models |

## 🔧 Configuration

### Available Models
- `google/gemini-2.0-flash-exp:free` - Google's latest
- `meta-llama/llama-3-8b-instruct:free` - Meta's Llama 3
- *Add more in the model selector*

### Rate Limiting
- 100 requests per 60 seconds (configurable)
- Per-user tracking via JWT

## 🤝 Contributing

Contributions welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

MIT License - Use freely!

## 🙏 Acknowledgments

- **Supabase** - Backend infrastructure
- **OpenRouter** - AI model access
- **Render** - Hosting platform
- **Tailwind CSS** - Styling framework

## 📞 Support

For issues or questions:
- GitHub Issues: [Create an issue](https://github.com/4shil/DeonAi/issues)
- Documentation: See README.md

---

Built with 💜 by Ashil
