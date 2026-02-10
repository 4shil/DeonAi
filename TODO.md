# To-Do List (Step by Step)

## 1. Planning and Setup
- [ ] Confirm final requirements and edge cases (auth flow, threading, models).
- [ ] Define success criteria and non-goals.
- [ ] Create repo and basic README.
- [ ] Set up environment variables plan (OpenRouter key, Supabase URL/anon key, JWT secret).

## 2. Supabase Data Model and Security
- [ ] Create `conversations` table with fields: id, user_id, title, model_id, created_at.
- [ ] Create `messages` table with fields: id, conversation_id, role, content, created_at.
- [ ] Add indexes for user_id and conversation_id.
- [ ] Enable Row Level Security (RLS) for both tables.
- [ ] Add RLS policies to allow users to read/write only their own rows.

## 3. Supabase Auth
- [ ] Enable Magic Link and Email auth providers.
- [ ] Configure redirect URLs for local and production.
- [ ] Verify JWT settings for backend validation.

## 4. Backend (FastAPI)
- [ ] Create FastAPI project structure.
- [ ] Configure settings and env loading.
- [ ] Add Supabase client for database operations.
- [ ] Add JWT verification middleware/dependency.
- [ ] Implement GET `/api/conversations`.
- [ ] Implement DELETE `/api/conversations/{id}`.
- [ ] Implement POST `/api/chat` (streaming endpoint).

## 5. OpenRouter Streaming Integration
- [ ] Add OpenRouter client with model selector.
- [ ] Stream tokens to the client using SSE or chunked response.
- [ ] Persist user and assistant messages to Supabase.
- [ ] Handle errors and partial responses safely.

## 6. Frontend (Next.js)
- [ ] Initialize Next.js app with Tailwind and Lucide.
- [ ] Implement global layout and theme (high-contrast, no glassmorphism).
- [ ] Build sidebar layout (threads list + create/delete).
- [ ] Build main chat area (message list + composer).
- [ ] Add model dropdown with required models.

## 7. Frontend Auth and Data Flow
- [ ] Integrate Supabase client in Next.js.
- [ ] Implement sign-in page and session handling.
- [ ] Attach JWT to backend API calls.
- [ ] Fetch and render conversations.
- [ ] Create, switch, and delete threads.

## 8. Chat UX and Streaming
- [ ] Send user message and open streaming response.
- [ ] Render assistant tokens live.
- [ ] Show loading states and errors.
- [ ] Ensure message persistence after streaming ends.

## 9. Responsive and Accessibility
- [ ] Make sidebar collapsible on mobile.
- [ ] Verify contrast, typography, and spacing.
- [ ] Keyboard focus and basic ARIA labels.

## 10. Testing and Hardening
- [ ] Test auth flows (sign-in, sign-out, session restore).
- [ ] Test streaming under slow network.
- [ ] Validate RLS with multiple users.
- [ ] Add input validation and request limits.

## 11. Deployment
- [ ] Configure production env vars.
- [ ] Deploy frontend (Vercel or similar).
- [ ] Deploy backend (Railway/Fly/Render).
- [ ] Confirm Supabase URLs and JWT settings.

## 12. Post-Launch
- [ ] Set up basic logging and monitoring.
- [ ] Track error rates and latency.
- [ ] Gather feedback and prioritize fixes.
