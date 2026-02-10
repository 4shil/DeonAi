# To-Do List (Step by Step)

## 1. Planning and Setup
- [ ] Confirm final requirements and edge cases (auth flow, threading, models).
- [ ] Define success criteria and non-goals.
- [x] Create repo and basic README.
- [x] Set up environment variables plan (OpenRouter key, Supabase URL/anon key, JWT secret).

## 2. Supabase Data Model and Security
- [x] Create `conversations` table with fields: id, user_id, title, model_id, created_at.
- [x] Create `messages` table with fields: id, conversation_id, role, content, created_at.
- [x] Add indexes for user_id and conversation_id.
- [x] Enable Row Level Security (RLS) for both tables.
- [x] Add RLS policies to allow users to read/write only their own rows.

## 3. Supabase Auth
- [ ] Enable Magic Link and Email auth providers.
- [ ] Configure redirect URLs for local and production.
- [ ] Verify JWT settings for backend validation.

## 4. Backend (FastAPI)
- [x] Create FastAPI project structure.
- [x] Configure settings and env loading.
- [x] Add Supabase client for database operations.
- [x] Add JWT verification middleware/dependency.
- [x] Implement GET `/api/conversations`.
- [x] Implement DELETE `/api/conversations/{id}`.
- [x] Implement POST `/api/chat` (streaming endpoint).

## 5. OpenRouter Streaming Integration
- [x] Add OpenRouter client with model selector.
- [x] Stream tokens to the client using SSE or chunked response.
- [x] Persist user and assistant messages to Supabase.
- [x] Handle errors and partial responses safely.

## 6. Frontend (Next.js)
- [x] Initialize Next.js app with Tailwind and Lucide.
- [x] Implement global layout and theme (high-contrast, no glassmorphism).
- [x] Build sidebar layout (threads list + create/delete).
- [x] Build main chat area (message list + composer).
- [x] Add model dropdown with required models.

## 7. Frontend Auth and Data Flow
- [x] Integrate Supabase client in Next.js.
- [x] Implement sign-in page and session handling.
- [x] Attach JWT to backend API calls.
- [x] Fetch and render conversations.
- [x] Create, switch, and delete threads.

## 8. Chat UX and Streaming
- [x] Send user message and open streaming response.
- [x] Render assistant tokens live.
- [x] Show loading states and errors.
- [x] Ensure message persistence after streaming ends.

## 9. Responsive and Accessibility
- [x] Make sidebar collapsible on mobile.
- [ ] Verify contrast, typography, and spacing.
- [x] Keyboard focus and basic ARIA labels.

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
