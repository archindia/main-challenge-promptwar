"""
Storytelling router — Immersive AI-generated travel narrative endpoints.
"""
from fastapi import APIRouter, Header, HTTPException
from typing import Optional
from backend.models.schemas import StoryRequest
from backend.services import gemini_service

router = APIRouter(prefix="/api/stories", tags=["Storytelling"])


@router.post("/generate")
async def generate_story(
    request: StoryRequest,
    x_api_key: Optional[str] = Header(None, alias="X-API-Key"),
):
    """
    Generate an immersive cultural story about a destination.
    Styles: immersive, historical, mythological, poetic.
    """
    try:
        result = await gemini_service.generate_cultural_story(
            place=request.place,
            style=request.style or "immersive",
            api_key=x_api_key,
        )
        return {"success": True, "data": result}
    except ValueError as e:
        raise HTTPException(status_code=401, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI generation failed: {str(e)}")


@router.get("/styles")
async def get_story_styles():
    """List available storytelling styles."""
    return {
        "styles": [
            {"id": "immersive", "label": "Immersive", "description": "Sensory-rich, you-are-there narrative", "emoji": "🌟"},
            {"id": "historical", "label": "Historical", "description": "History and legends woven together", "emoji": "📜"},
            {"id": "mythological", "label": "Mythological", "description": "Local myths and folklore", "emoji": "🐉"},
            {"id": "poetic", "label": "Poetic", "description": "Lyrical and metaphorical prose", "emoji": "🌸"},
        ]
    }
