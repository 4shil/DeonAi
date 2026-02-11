# DeonAi - Updated Features

## Recent Updates

### User-Provided API Key Support
- Users can now provide their own OpenRouter API key
- API key is stored securely in browser localStorage
- Access the API key settings via the 🔑 button in the chat header

### Dynamic AI Model Selection
- Models are now fetched dynamically from OpenRouter based on your API key
- Select from all available models in the dropdown
- Models update automatically when you change your API key

### How to Use

1. **Get an OpenRouter API Key**
   - Visit [openrouter.ai/keys](https://openrouter.ai/keys)
   - Create an account and generate an API key

2. **Add Your API Key**
   - On first launch, you'll be prompted to enter your API key
   - You can change it anytime by clicking the 🔑 API Key button

3. **Select Your Model**
   - Choose from the dropdown in the chat header
   - All models available to your API key will be listed

### Technical Details

**Backend Changes:**
- `/api/chat` now accepts optional `api_key` parameter
- New `/api/models` endpoint fetches available models
- `openrouter.py` updated to support user-provided keys

**Frontend Changes:**
- New `ApiKeyModal` component for API key management
- Dynamic model loading from OpenRouter
- API key stored in localStorage
- Model dropdown populated from API response

### Environment Variables

The app still supports server-side API key as fallback:
```env
OPENROUTER_API_KEY=sk-or-v1-...
```

If a user doesn't provide their own key, the server key (if configured) will be used.

### Security Notes

- API keys are stored in browser localStorage only
- Keys are sent directly to the backend and not exposed in logs
- Users have full control over their API keys
- No keys are stored in the database
