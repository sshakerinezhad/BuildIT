# Session Scratchpad

## Last Session (2026-02-01)

### Completed
- **Steps 1-4 complete** - Full backend with Gemini + OpenRouter fallback
- Backend runs at `http://localhost:8000` with Swagger docs at `/docs`

### Key Files
- `backend/main.py` - All backend logic (FastAPI, MongoDB, LLM calls)
- `backend/.env` - API keys (needs fresh Gemini key)
- `backend/venv/` - Python virtual environment

### Running Backend
```bash
cd backend
source venv/bin/activate
uvicorn main:app --reload
```

### Important Gotchas
- **Gemini key leaked** - Replace in `.env` with fresh key from aistudio.google.com
- **Model name** - Use `gemini-2.0-flash` (not 1.5)
- **OpenRouter working** - Currently serving requests as fallback

### Next Up
- Step 5: Frontend (Vite + React)
- Step 6: UI components
- Step 7: Digital Ocean deploy
