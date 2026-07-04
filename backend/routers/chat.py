"""
Chat router — AI Travel Assistant conversational endpoints.
"""
from fastapi import APIRouter, Header, HTTPException
from typing import Optional
from backend.models.schemas import ChatMessage
from backend.services import gemini_service

router = APIRouter(prefix="/api/chat", tags=["AI Chat"])


@router.post("/message")
async def send_chat_message(
    request: ChatMessage,
    x_api_key: Optional[str] = Header(None, alias="X-API-Key"),
):
    """
    Send a message to the AI Travel Assistant and get a contextual response.
    Supports multi-turn conversation with history.
    """
    try:
        result = await gemini_service.chat_with_assistant(
            message=request.message,
            conversation_history=request.conversation_history or [],
            destination_context=request.destination_context,
            api_key=x_api_key,
        )
        return {"success": True, "data": result}
    except ValueError as e:
        raise HTTPException(status_code=401, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI chat failed: {str(e)}")


@router.get("/starters")
async def get_conversation_starters():
    """Get suggested conversation starters for the AI travel assistant."""
    return {
        "starters": [
            "What's the best time to visit Japan for cherry blossoms?",
            "Suggest a 7-day cultural itinerary for Morocco",
            "What are must-try street foods in Bangkok?",
            "Tell me about the history of Machu Picchu",
            "What cultural etiquette should I know before visiting India?",
            "Find me a hidden gem beach in Southeast Asia",
            "What festivals happen in Spain in summer?",
            "Recommend authentic cooking classes in Italy",
        ]
    }
