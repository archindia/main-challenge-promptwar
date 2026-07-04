"""
Events router — Local cultural events and festival suggestion endpoints.
"""
from fastapi import APIRouter, Header, HTTPException
from typing import Optional
from backend.models.schemas import EventsRequest
from backend.services import gemini_service

router = APIRouter(prefix="/api/events", tags=["Events"])


@router.post("/suggest")
async def suggest_events(
    request: EventsRequest,
    x_api_key: Optional[str] = Header(None, alias="X-API-Key"),
):
    """
    Suggest local cultural events, festivals, and activities for a destination.
    Filter by month and interest type.
    """
    try:
        result = await gemini_service.suggest_local_events(
            destination=request.destination,
            month=request.month,
            interest=request.interest,
            api_key=x_api_key,
        )
        return {"success": True, "data": result}
    except ValueError as e:
        raise HTTPException(status_code=401, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI generation failed: {str(e)}")


@router.get("/categories")
async def get_event_categories():
    """List available event/interest categories."""
    return {
        "categories": [
            {"id": "cultural", "label": "Cultural", "emoji": "🎭"},
            {"id": "music", "label": "Music & Dance", "emoji": "🎵"},
            {"id": "food", "label": "Food & Cuisine", "emoji": "🍜"},
            {"id": "religious", "label": "Religious & Spiritual", "emoji": "🕌"},
            {"id": "art", "label": "Art & Craft", "emoji": "🎨"},
            {"id": "sports", "label": "Sports & Adventure", "emoji": "🏔️"},
            {"id": "market", "label": "Markets & Bazaars", "emoji": "🏪"},
        ]
    }
