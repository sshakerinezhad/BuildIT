# BuildIT - Master Plan

## What It Is
AI-powered robotics build planner with two modes:
- **Build Mode**: I have these parts → What can I build & how?
- **Reverse Mode**: I want to build this → What parts do I need?

## Required APIs
| API | Role |
|-----|------|
| MongoDB | Store kits, parts database, generated plans |
| Gemini | Core AI for plan generation |
| OpenRouter | Fallback/alternative LLM |
| Digital Ocean | Hosting |

---

## Step-by-Step Implementation

### Step 1: Backend Setup ✓
- [x] Create `backend/main.py` with FastAPI
- [x] Add MongoDB connection (Atlas free tier)
- [x] Create `.env` for API keys
- [x] Install dependencies

**Files:** `backend/main.py`, `backend/requirements.txt`, `backend/.env`, `backend/.env.example`, `.gitignore`

### Step 2: MongoDB - Seed Data ✓
- [x] Seed 3 pre-defined kits (Arduino Starter, Motor Kit, Sensor Pack)
- [x] Create `GET /api/kits` endpoint

**Implementation note:** Auto-seeds on startup if kits collection is empty.

### Step 3: Gemini Integration ✓
- [x] Create `POST /api/generate` endpoint
- [x] Build Mode prompt: parts → build plan
- [x] Reverse Mode prompt: goal → parts list + where to buy

**Gotcha:** Original API key was flagged as leaked. Replace in `backend/.env` with fresh key from https://aistudio.google.com/app/apikey

### Step 4: OpenRouter Fallback ✓
- [x] Add OpenRouter as alternative model
- [x] Auto-fallback when Gemini fails
- [x] Response includes `model_used` field

### Step 5: Frontend Setup
- [ ] Create Vite + React app
- [ ] Install react-markdown for output rendering
- [ ] Basic layout with dark theme

### Step 6: Frontend - UI Components
- [ ] Mode toggle: Build Mode / Reverse Mode
- [ ] Kit selector (multi-select for Build Mode)
- [ ] Goal input text field
- [ ] Generate button with loading state
- [ ] Tabbed results view: Overview | Steps | Wiring/Parts | Code

### Step 7: Digital Ocean Deploy
- [ ] Dockerize backend
- [ ] Deploy to DO App Platform
- [ ] Set environment variables
- [ ] Get live URL

---

## API Endpoints

```
GET  /api/kits       → List all kits from MongoDB
POST /api/generate   → Unified endpoint (mode: "build" | "reverse" in body)
GET  /health         → Health check
```

**Note:** Simplified from separate build/reverse endpoints to single unified endpoint.

---

## Running the Backend

```bash
cd backend
source venv/bin/activate
uvicorn main:app --reload
# API docs: http://localhost:8000/docs
```

---

## Verification Checklist
- [x] MongoDB: Kits load on page open
- [ ] Gemini: Build mode generates plan (needs fresh API key)
- [ ] Gemini: Reverse mode generates shopping list (needs fresh API key)
- [x] OpenRouter: Fallback works if Gemini fails
- [ ] DO: App accessible via public URL
