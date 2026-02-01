# Session Scratchpad

## Last Session (2026-02-01)

### Completed
- **Step 7 (partial)** - Deployment configuration done
  - Created `backend/Dockerfile` and `.dockerignore`
  - Updated `frontend/src/App.jsx` to use `VITE_API_URL` env var
  - Created `frontend/.env.production.example`
  - Frontend build verified working

### Architecture Decision
Chose **separate deployments** over single container:
- Backend: DO App Platform Service (container)
- Frontend: DO App Platform Static Site
- Why: Scales independently, static site is cheaper/faster

### Files Changed This Session
- `backend/Dockerfile` - Created
- `backend/.dockerignore` - Created
- `frontend/src/App.jsx:5` - API_URL now reads from env var
- `frontend/.env.production.example` - Created

### Next Up
Deploy to Digital Ocean:
1. Push code to GitHub (if not already)
2. Create DO App with backend service
3. Note the backend URL
4. Create DO Static Site for frontend with `VITE_API_URL` set
5. Test end-to-end

### Running Locally
```bash
# Terminal 1: Backend
cd backend && source venv/bin/activate && uvicorn main:app --reload

# Terminal 2: Frontend
cd frontend && npm run dev
```

### Important Notes
- **Gemini key** - Still needs fresh key from aistudio.google.com
- **CORS** - Backend allows all origins (`*`), consider restricting to frontend domain in production
