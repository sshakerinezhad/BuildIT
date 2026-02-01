"""
BuildIT Backend - FastAPI application with MongoDB and LLM integration.

Single-file backend for speed of development. Contains:
- MongoDB connection via motor (async)
- GET /api/kits - list available kits
- POST /api/generate - unified generation endpoint (build/reverse modes)
- GET /health - health check
"""

import json
import os
from contextlib import asynccontextmanager
from typing import Literal

import google.generativeai as genai
import httpx
from bson import ObjectId
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel

# Load environment variables
load_dotenv()

MONGODB_URI = os.getenv("MONGODB_URI")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")

# MongoDB client - initialized on startup
db_client: AsyncIOMotorClient | None = None
db = None

# Pre-defined kits to seed on startup
SEED_KITS = [
    {
        "name": "Arduino Starter Kit",
        "parts": [
            "Arduino Uno",
            "Breadboard",
            "LEDs (assorted)",
            "Resistors (220Ω, 1kΩ, 10kΩ)",
            "Jumper Wires",
            "Push Buttons",
            "Potentiometer",
            "USB Cable",
        ],
    },
    {
        "name": "Motor Kit",
        "parts": [
            "L298N Motor Driver",
            "DC Motors x2",
            "Wheels x2",
            "Battery Holder (4xAA)",
            "Robot Chassis",
            "Caster Wheel",
            "Motor Mounting Brackets",
        ],
    },
    {
        "name": "Sensor Pack",
        "parts": [
            "HC-SR04 Ultrasonic Sensor",
            "IR Line Sensors x2",
            "Photoresistors x3",
            "PIR Motion Sensor",
            "DHT11 Temperature/Humidity Sensor",
            "Buzzer",
        ],
    },
]


async def seed_kits():
    """Seed initial kits to MongoDB if collection is empty."""
    if db is None:
        return

    count = await db.kits.count_documents({})
    if count == 0:
        result = await db.kits.insert_many(SEED_KITS)
        print(f"Seeded {len(result.inserted_ids)} kits to MongoDB")
    else:
        print(f"Kits collection already has {count} documents, skipping seed")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Handle startup and shutdown events."""
    global db_client, db

    # Startup: connect to MongoDB
    if not MONGODB_URI:
        raise RuntimeError("MONGODB_URI environment variable not set")

    db_client = AsyncIOMotorClient(MONGODB_URI)
    db = db_client.buildit  # database name

    # Verify connection
    try:
        await db_client.admin.command("ping")
        print("Successfully connected to MongoDB")
    except Exception as e:
        print(f"Failed to connect to MongoDB: {e}")
        raise

    # Seed kits if collection is empty
    await seed_kits()

    yield

    # Shutdown: close MongoDB connection
    if db_client:
        db_client.close()
        print("MongoDB connection closed")


app = FastAPI(
    title="BuildIT API",
    description="Generate project instructions from building kits using AI",
    version="0.1.0",
    lifespan=lifespan,
)

# CORS middleware - allow frontend to call API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure appropriately for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# =============================================================================
# Pydantic Models
# =============================================================================

class Kit(BaseModel):
    """A building kit with its parts."""
    id: str
    name: str
    parts: list[str]


class GenerateRequest(BaseModel):
    """Request body for the unified generate endpoint."""
    mode: Literal["build", "reverse"]
    kits: list[str] = []  # kit IDs - for build mode
    custom_parts: list[str] = []  # user-added parts not in kits
    goal: str  # what to build OR what to reverse-engineer


class GenerateResponse(BaseModel):
    """Response from the generate endpoint."""
    model_used: str  # "gemini" or "openrouter"
    overview: str  # brief description of the project
    steps: list[str]  # ordered build instructions
    wiring: str = ""  # wiring instructions (build mode)
    firmware: str = ""  # Arduino code (build mode)
    parts_needed: list[str] = []  # parts list (reverse mode)
    estimated_cost: str = ""  # cost estimate (reverse mode)
    where_to_buy: list[str] = []  # purchase links (reverse mode)
    tips: list[str] = []  # optional tips/warnings


class HealthResponse(BaseModel):
    """Health check response."""
    status: str
    mongodb: str


# =============================================================================
# Gemini Integration
# =============================================================================

# Configure Gemini
if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)


async def get_parts_for_kits(kit_ids: list[str]) -> dict[str, list[str]]:
    """Fetch parts for given kit IDs from MongoDB."""
    if db is None:
        return {}

    kits_parts = {}
    for kit_id in kit_ids:
        try:
            doc = await db.kits.find_one({"_id": ObjectId(kit_id)})
            if doc:
                kits_parts[doc["name"]] = doc.get("parts", [])
        except Exception:
            continue
    return kits_parts


async def call_gemini(prompt: str) -> str:
    """Call Gemini API and return the response text."""
    model = genai.GenerativeModel("gemini-2.0-flash")
    response = model.generate_content(prompt)
    return response.text


async def call_openrouter(prompt: str) -> str:
    """Call OpenRouter API and return the response text."""
    async with httpx.AsyncClient() as client:
        response = await client.post(
            "https://openrouter.ai/api/v1/chat/completions",
            headers={
                "Authorization": f"Bearer {OPENROUTER_API_KEY}",
                "Content-Type": "application/json",
            },
            json={
                "model": "google/gemini-2.0-flash-001",
                "messages": [{"role": "user", "content": prompt}],
            },
            timeout=60.0,
        )
        response.raise_for_status()
        data = response.json()
        return data["choices"][0]["message"]["content"]


async def call_llm(prompt: str) -> tuple[str, str]:
    """
    Call LLM with Gemini as primary, OpenRouter as fallback.
    Returns (response_text, model_used).
    """
    # Try Gemini first
    if GEMINI_API_KEY:
        try:
            text = await call_gemini(prompt)
            return text, "gemini"
        except Exception as e:
            print(f"Gemini failed: {e}, falling back to OpenRouter")

    # Fallback to OpenRouter
    if OPENROUTER_API_KEY:
        try:
            text = await call_openrouter(prompt)
            return text, "openrouter"
        except Exception as e:
            raise RuntimeError(f"OpenRouter also failed: {e}")

    raise RuntimeError("No LLM API keys configured")


def build_prompt_build_mode(
    kits_parts: dict[str, list[str]], custom_parts: list[str], goal: str
) -> str:
    """Create prompt for build mode."""
    parts_list = []
    for kit_name, parts in kits_parts.items():
        parts_list.append(f"{kit_name}: {', '.join(parts)}")

    # Add custom parts section if any were provided
    custom_section = ""
    if custom_parts:
        custom_section = f"\nCustom Parts: {', '.join(custom_parts)}"

    return f"""You are an expert robotics and electronics instructor. A user wants to build a project using specific parts.

AVAILABLE PARTS:
{chr(10).join(parts_list)}{custom_section}

USER'S GOAL: {goal}

Generate a complete build guide. Respond in this exact JSON format:
{{
    "overview": "Brief 2-3 sentence description of the project",
    "steps": ["Step 1: ...", "Step 2: ...", ...],
    "wiring": "Detailed wiring instructions with pin connections",
    "firmware": "Complete Arduino code with comments",
    "tips": ["Tip 1", "Tip 2", ...]
}}

IMPORTANT: Return ONLY valid JSON, no markdown code blocks or extra text."""


def build_prompt_reverse_mode(goal: str) -> str:
    """Create prompt for reverse mode."""
    return f"""You are an expert robotics and electronics instructor. A user wants to build something and needs to know what parts to buy.

USER'S GOAL: {goal}

Generate a complete shopping list and build guide. Respond in this exact JSON format:
{{
    "overview": "Brief 2-3 sentence description of the project",
    "parts_needed": ["Part 1", "Part 2", ...],
    "estimated_cost": "$XX - $XX USD estimated total",
    "where_to_buy": ["Amazon: search for X", "Adafruit: product Y", ...],
    "steps": ["Step 1: ...", "Step 2: ...", ...],
    "tips": ["Tip 1", "Tip 2", ...]
}}

IMPORTANT: Return ONLY valid JSON, no markdown code blocks or extra text."""


def parse_gemini_response(text: str) -> dict:
    """Parse Gemini response, handling potential JSON issues."""
    # Strip markdown code blocks if present
    text = text.strip()
    if text.startswith("```json"):
        text = text[7:]
    if text.startswith("```"):
        text = text[3:]
    if text.endswith("```"):
        text = text[:-3]

    return json.loads(text.strip())


# =============================================================================
# Routes
# =============================================================================

@app.get("/health", response_model=HealthResponse)
async def health_check():
    """Check API and database health."""
    mongodb_status = "disconnected"

    if db_client:
        try:
            await db_client.admin.command("ping")
            mongodb_status = "connected"
        except Exception:
            mongodb_status = "error"

    return HealthResponse(status="ok", mongodb=mongodb_status)


@app.get("/api/kits", response_model=list[Kit])
async def list_kits():
    """
    List all available building kits.

    Returns kits from MongoDB. Empty list if no kits seeded yet.
    """
    if db is None:
        raise HTTPException(status_code=503, detail="Database not connected")

    kits = []
    cursor = db.kits.find({})

    async for doc in cursor:
        kits.append(Kit(
            id=str(doc["_id"]),
            name=doc["name"],
            parts=doc.get("parts", []),
        ))

    return kits


@app.post("/api/generate", response_model=GenerateResponse)
async def generate_instructions(request: GenerateRequest):
    """
    Generate build instructions using AI.

    Modes:
    - build: Given kit(s) and a goal, generate instructions to build it
    - reverse: Given a goal (thing to build), list parts needed and instructions

    Uses Gemini as primary, falls back to OpenRouter if needed.
    """
    if not GEMINI_API_KEY and not OPENROUTER_API_KEY:
        raise HTTPException(status_code=503, detail="No LLM API keys configured")

    try:
        if request.mode == "build":
            # Get parts from selected kits
            kits_parts = await get_parts_for_kits(request.kits)
            if not kits_parts:
                raise HTTPException(
                    status_code=400,
                    detail="No valid kits selected. Please select at least one kit.",
                )

            prompt = build_prompt_build_mode(kits_parts, request.custom_parts, request.goal)
            response_text, model_used = await call_llm(prompt)
            data = parse_gemini_response(response_text)

            return GenerateResponse(
                model_used=model_used,
                overview=data.get("overview", ""),
                steps=data.get("steps", []),
                wiring=data.get("wiring", ""),
                firmware=data.get("firmware", ""),
                tips=data.get("tips", []),
            )

        else:  # reverse mode
            prompt = build_prompt_reverse_mode(request.goal)
            response_text, model_used = await call_llm(prompt)
            data = parse_gemini_response(response_text)

            return GenerateResponse(
                model_used=model_used,
                overview=data.get("overview", ""),
                steps=data.get("steps", []),
                parts_needed=data.get("parts_needed", []),
                estimated_cost=data.get("estimated_cost", ""),
                where_to_buy=data.get("where_to_buy", []),
                tips=data.get("tips", []),
            )

    except json.JSONDecodeError as e:
        raise HTTPException(status_code=500, detail=f"Failed to parse AI response: {e}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Generation failed: {e}")


# =============================================================================
# Main
# =============================================================================

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
