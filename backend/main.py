"""
WanderLux AI — GenAI-Powered Travel & Cultural Discovery Platform
FastAPI Backend Entry Point
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from backend.routers import destinations, cultural, storytelling, events, chat

# ─── App Configuration ─────────────────────────────────────────────────────────

app = FastAPI(
    title="🌍 WanderLux AI — Travel & Cultural Discovery",
    description="""
    A GenAI-powered platform that helps travelers discover destinations and engage 
    with local culture in meaningful ways. Powered by Google Gemini 2.0 Flash.
    
    ## Features
    - 🗺️ **Destination Discovery** — Personalized AI destination recommendations
    - 💎 **Hidden Gems** — Off-the-beaten-path secret spots
    - 📖 **Immersive Storytelling** — AI-generated cultural narratives
    - 🏛️ **Heritage Insights** — UNESCO sites, traditions, and cultural significance
    - 🎉 **Local Events** — Festivals, markets, and cultural events
    - 🤝 **Authentic Experiences** — Local guides and immersive activities
    - 🌐 **Cultural Deep Dive** — Food, customs, language, and etiquette
    - 💬 **AI Travel Chat** — Conversational travel planning assistant
    
    ## Authentication
    Pass your **Google Gemini API key** in the `X-API-Key` header,
    or set `GEMINI_API_KEY` in your `.env` file.
    Get a free key at: https://aistudio.google.com
    """,
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# ─── CORS — Allow frontend to call backend ────────────────────────────────────

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, restrict to your frontend domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── Register Routers ─────────────────────────────────────────────────────────

app.include_router(destinations.router)
app.include_router(cultural.router)
app.include_router(storytelling.router)
app.include_router(events.router)
app.include_router(chat.router)

# ─── Root & Health Endpoints ──────────────────────────────────────────────────

@app.get("/", tags=["Root"])
async def root():
    return {
        "app": "WanderLux AI",
        "version": "1.0.0",
        "status": "🟢 Running",
        "powered_by": "Google Gemini 2.0 Flash",
        "docs": "/docs",
        "endpoints": {
            "discover_destinations": "POST /api/destinations/discover",
            "hidden_gems": "POST /api/destinations/hidden-gems",
            "generate_story": "POST /api/stories/generate",
            "heritage_insights": "POST /api/cultural/heritage",
            "cultural_deep_dive": "POST /api/cultural/deep-dive",
            "authentic_experiences": "POST /api/cultural/experiences",
            "local_events": "POST /api/events/suggest",
            "ai_chat": "POST /api/chat/message",
        },
    }


@app.get("/health", tags=["Root"])
async def health_check():
    return JSONResponse(content={"status": "healthy", "service": "WanderLux AI Backend"})


# ─── Run Directly ─────────────────────────────────────────────────────────────

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, reload=True)
