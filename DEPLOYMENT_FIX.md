# Deployment Fix Instructions

## Issue
Frontend is trying to connect to old backend URL: `chatbot-backend-unb3.onrender.com`
Should connect to: `chatbot-backend-rwrg.onrender.com`

## Solution

### Option 1: Manual Environment Variable Update (Quickest)
1. Go to Render Dashboard: https://dashboard.render.com
2. Navigate to your `chatbot-frontend` service
3. Go to **Environment** tab
4. Find or add: `NEXT_PUBLIC_API_BASE_URL`
5. Set value to: `https://chatbot-backend-rwrg.onrender.com`
6. Click **Save Changes**
7. Render will automatically redeploy

### Option 2: Verify Backend is Running
1. Check if backend service `chatbot-backend-rwrg` exists and is running
2. If not, you may need to create it or rename the existing one
3. Check the backend logs for any errors

### Option 3: Force Redeploy
1. Go to Render Dashboard
2. Select `chatbot-frontend` service
3. Click **Manual Deploy** > **Deploy latest commit**
4. This will pick up the updated environment variables from render.yaml

## Verify Fix
After deployment completes:
- Visit: https://chatbot-frontend-unb3.onrender.com
- The connection error should be gone
- You should see the auth page

## Backend Health Check
Test if backend is accessible:
```bash
curl https://chatbot-backend-rwrg.onrender.com/health
```

Should return: `{"status":"ok"}`
