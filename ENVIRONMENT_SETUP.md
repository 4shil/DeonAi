# Environment Variables Setup for Render

## Backend Service: chatbot-backend-rwrg

You need to set these environment variables in the Render dashboard:

### Required Variables:

1. **OPENROUTER_API_KEY**
   - Get from: https://openrouter.ai/keys
   - Example: `sk-or-v1-...`
   - Note: Can be left empty if users will provide their own keys

2. **SUPABASE_URL**
   - Get from your Supabase project: https://app.supabase.com
   - Go to: Project Settings > API
   - Copy the "Project URL"
   - Example: `https://xxxxxxxxxxxxx.supabase.co`

3. **SUPABASE_ANON_KEY**
   - Get from your Supabase project: https://app.supabase.com
   - Go to: Project Settings > API
   - Copy the "anon public" key
   - Example: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

4. **SUPABASE_JWT_SECRET**
   - Get from your Supabase project: https://app.supabase.com
   - Go to: Project Settings > API
   - Copy the "JWT Secret"
   - Example: Long secret string

### Already Set (from render.yaml):
- CORS_ALLOW_ORIGINS
- ALLOWED_MODEL_IDS
- RATE_LIMIT_MAX_REQUESTS
- RATE_LIMIT_WINDOW_SECONDS

## Frontend Service: chatbot-frontend-unb3

### Required Variables:

1. **NEXT_PUBLIC_SUPABASE_URL**
   - Same as backend SUPABASE_URL
   - Example: `https://xxxxxxxxxxxxx.supabase.co`

2. **NEXT_PUBLIC_SUPABASE_ANON_KEY**
   - Same as backend SUPABASE_ANON_KEY
   - Example: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

3. **NEXT_PUBLIC_API_BASE_URL**
   - Value: `https://chatbot-backend-rwrg.onrender.com`
   - Should already be set from render.yaml

## How to Set Variables on Render:

1. Go to https://dashboard.render.com
2. Select the service (backend or frontend)
3. Go to **Environment** tab
4. Click **Add Environment Variable**
5. Enter the key and value
6. Click **Save Changes**
7. Service will automatically redeploy

## Supabase Database Setup:

Make sure you have these tables in your Supabase database:

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

-- Enable Row Level Security
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies for conversations
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

-- RLS Policies for messages
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

## Testing:

After setting all variables and redeploying:

1. **Test backend health:**
   ```bash
   curl https://chatbot-backend-rwrg.onrender.com/health
   ```
   Should return: `{"status":"ok"}`

2. **Test frontend:**
   Visit: https://chatbot-frontend-unb3.onrender.com
   You should see the login page

3. **Sign up and test:**
   - Create an account
   - Add your OpenRouter API key
   - Start chatting!

## Troubleshooting:

If you see "Failed to start chat stream":
- Check all environment variables are set correctly
- Check Supabase database tables exist
- Check RLS policies are set up
- Check backend logs in Render for specific errors
