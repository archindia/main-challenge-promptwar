"""
Destinations router — AI-powered destination discovery endpoints.
"""
from fastapi import APIRouter, Header, HTTPException
from typing import Optional
from backend.models.schemas import DestinationRequest, HiddenGemsRequest, AIResponse
from backend.services import gemini_service

router = APIRouter(prefix="/api/destinations", tags=["Destinations"])


@router.post("/discover")
async def discover_destinations(
    request: DestinationRequest,
    x_api_key: Optional[str] = Header(None, alias="X-API-Key"),
):
    """
    Discover personalized AI-recommended travel destinations.
    Returns 4 destination cards with rich details.
    """
    try:
        result = await gemini_service.generate_destination_recommendations(
            query=request.query,
            preferences=request.preferences,
            duration=request.duration,
            country=request.country,
            api_key=x_api_key,
        )
        return {"success": True, "data": result}
    except ValueError as e:
        raise HTTPException(status_code=401, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI generation failed: {str(e)}")


@router.post("/hidden-gems")
async def get_hidden_gems(
    request: HiddenGemsRequest,
    x_api_key: Optional[str] = Header(None, alias="X-API-Key"),
):
    """
    Uncover hidden gem locations near a destination.
    Returns 4 off-the-beaten-path places with insider tips.
    """
    try:
        result = await gemini_service.discover_hidden_gems(
            destination=request.destination,
            interest=request.interest,
            api_key=x_api_key,
        )
        return {"success": True, "data": result}
    except ValueError as e:
        raise HTTPException(status_code=401, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI generation failed: {str(e)}")
