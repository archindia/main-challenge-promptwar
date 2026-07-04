"""
Pydantic schemas for request/response models.
"""
from pydantic import BaseModel, Field
from typing import Optional, List


# ─── Request Models ────────────────────────────────────────────────────────────

class DestinationRequest(BaseModel):
    query: str = Field(..., description="User's travel interest or destination query")
    preferences: Optional[str] = Field(None, description="Travel preferences (budget, luxury, adventure, etc.)")
    duration: Optional[str] = Field(None, description="Trip duration (e.g., '7 days')")
    country: Optional[str] = Field(None, description="Specific country filter")


class HiddenGemsRequest(BaseModel):
    destination: str = Field(..., description="Main destination to find hidden gems near")
    interest: Optional[str] = Field(None, description="Type of experience (nature, food, art, history)")


class StoryRequest(BaseModel):
    place: str = Field(..., description="Place or destination for the story")
    style: Optional[str] = Field("immersive", description="Storytelling style: immersive, historical, mythological, poetic")


class HeritageRequest(BaseModel):
    destination: str = Field(..., description="Destination to get heritage info for")
    aspect: Optional[str] = Field("all", description="Heritage aspect: art, architecture, traditions, cuisine, festivals")


class EventsRequest(BaseModel):
    destination: str = Field(..., description="Destination for event suggestions")
    month: Optional[str] = Field(None, description="Month for events (e.g., 'December')")
    interest: Optional[str] = Field(None, description="Event type: music, food, cultural, sports, religious")


class ExperienceRequest(BaseModel):
    destination: str = Field(..., description="Destination for authentic experiences")
    type: Optional[str] = Field(None, description="Experience type: cooking, craft, nature, community, wellness")


class CulturalRequest(BaseModel):
    destination: str = Field(..., description="Destination for cultural deep dive")
    topic: Optional[str] = Field("overview", description="Topic: food, customs, language, art, religion, music")


class ChatMessage(BaseModel):
    message: str = Field(..., description="User's message to the AI travel assistant")
    conversation_history: Optional[List[dict]] = Field(default=[], description="Previous conversation turns")
    destination_context: Optional[str] = Field(None, description="Current destination context")


# ─── Response Models ───────────────────────────────────────────────────────────

class AIResponse(BaseModel):
    success: bool
    data: str
    metadata: Optional[dict] = None


class DestinationCard(BaseModel):
    name: str
    country: str
    tagline: str
    description: str
    best_for: List[str]
    best_time: str
    highlights: List[str]


class HiddenGem(BaseModel):
    name: str
    location: str
    why_hidden: str
    description: str
    best_experience: str
    insider_tip: str


class StoryResponse(BaseModel):
    title: str
    place: str
    story: str
    cultural_notes: str


class HeritageSpotlight(BaseModel):
    destination: str
    heritage_sites: List[str]
    traditions: List[str]
    cultural_significance: str
    preservation_efforts: str


class LocalEvent(BaseModel):
    name: str
    type: str
    description: str
    dates: str
    location: str
    cultural_significance: str
    visitor_tips: str


class AuthenticExperience(BaseModel):
    title: str
    category: str
    description: str
    what_to_expect: str
    cultural_insight: str
    how_to_book: str


class ChatResponse(BaseModel):
    reply: str
    suggested_actions: Optional[List[str]] = None
