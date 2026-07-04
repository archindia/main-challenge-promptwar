"""
Cultural router — Heritage insights and cultural deep dive endpoints.
"""
from fastapi import APIRouter, Header, HTTPException
from typing import Optional
from backend.models.schemas import HeritageRequest, CulturalRequest
from backend.services import gemini_service

router = APIRouter(prefix="/api/cultural", tags=["Cultural"])


@router.post("/heritage")
async def get_heritage(
    request: HeritageRequest,
    x_api_key: Optional[str] = Header(None, alias="X-API-Key"),
):
    """
    Get rich heritage and tradition insights for a destination.
    Covers UNESCO sites, traditions, art forms, and culinary heritage.
    """
    try:
        result = await gemini_service.get_heritage_insights(
            destination=request.destination,
            aspect=request.aspect or "all",
            api_key=x_api_key,
        )
        return {"success": True, "data": result}
    except ValueError as e:
        raise HTTPException(status_code=401, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI generation failed: {str(e)}")


@router.post("/deep-dive")
async def cultural_deep_dive(
    request: CulturalRequest,
    x_api_key: Optional[str] = Header(None, alias="X-API-Key"),
):
    """
    Get a comprehensive cultural guide including food, customs, language, and etiquette.
    """
    try:
        result = await gemini_service.get_cultural_deep_dive(
            destination=request.destination,
            topic=request.topic or "overview",
            api_key=x_api_key,
        )
        return {"success": True, "data": result}
    except ValueError as e:
        raise HTTPException(status_code=401, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI generation failed: {str(e)}")


@router.post("/experiences")
async def get_experiences(
    destination: str,
    exp_type: Optional[str] = None,
    x_api_key: Optional[str] = Header(None, alias="X-API-Key"),
):
    """
    Get authentic local experience recommendations for a destination.
    """
    try:
        result = await gemini_service.get_authentic_experiences(
            destination=destination,
            exp_type=exp_type,
            api_key=x_api_key,
        )
        return {"success": True, "data": result}
    except ValueError as e:
        raise HTTPException(status_code=401, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI generation failed: {str(e)}")
