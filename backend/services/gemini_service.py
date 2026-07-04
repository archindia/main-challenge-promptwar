"""
Google Gemini AI Service — Core AI engine for all travel features.
Handles all interactions with Google Generative AI (Gemini 2.0 Flash).
"""
import os
import json
import re
from typing import Optional, List
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

# ─── Model Configuration ───────────────────────────────────────────────────────

GEMINI_MODEL = "gemini-2.0-flash"

GENERATION_CONFIG = {
    "temperature": 0.85,
    "top_p": 0.95,
    "top_k": 40,
    "max_output_tokens": 2048,
}

SYSTEM_PERSONA = """You are 'Wanderlux AI', an expert travel guide with deep knowledge of world cultures,
hidden destinations, history, art, cuisine, and authentic experiences. You craft vivid, inspiring, and
culturally respectful responses that make travelers feel the magic of every destination.
Always be enthusiastic, insightful, and specific. Use rich descriptive language."""


def get_gemini_client(api_key: Optional[str] = None):
    """Initialize and return a configured Gemini model."""
    key = api_key or os.getenv("GEMINI_API_KEY", "")
    if not key:
        raise ValueError("Gemini API key not configured. Set GEMINI_API_KEY in .env or pass it in the request header.")
    genai.configure(api_key=key)
    return genai.GenerativeModel(
        model_name=GEMINI_MODEL,
        generation_config=GENERATION_CONFIG,
        system_instruction=SYSTEM_PERSONA,
    )


def safe_json_parse(text: str, fallback: dict = None) -> dict:
    """Safely parse JSON from Gemini response, handling markdown code blocks."""
    # Remove markdown code fences if present
    cleaned = re.sub(r"```(?:json)?\s*", "", text).replace("```", "").strip()
    try:
        return json.loads(cleaned)
    except json.JSONDecodeError:
        return fallback or {"raw": text}


# ─── Feature 1: Destination Discovery ─────────────────────────────────────────

async def generate_destination_recommendations(
    query: str,
    preferences: Optional[str] = None,
    duration: Optional[str] = None,
    country: Optional[str] = None,
    api_key: Optional[str] = None,
) -> dict:
    """Generate personalized destination recommendations using Gemini AI."""
    model = get_gemini_client(api_key)

    prompt = f"""
    A traveler wants to discover amazing destinations. Generate 4 detailed destination recommendations.

    Their query: "{query}"
    Preferences: {preferences or "open to anything"}
    Trip duration: {duration or "flexible"}
    Country filter: {country or "worldwide"}

    Return a JSON array of exactly 4 destinations with this structure:
    [
      {{
        "name": "Destination Name",
        "country": "Country",
        "tagline": "A short inspiring tagline (max 10 words)",
        "description": "2-3 sentence vivid description of the place",
        "best_for": ["type1", "type2", "type3"],
        "best_time": "Best months to visit",
        "highlights": ["highlight1", "highlight2", "highlight3"],
        "vibe": "One word vibe: Mystical / Vibrant / Serene / Wild / Historic",
        "emoji": "A single relevant emoji"
      }}
    ]
    Return ONLY the JSON array, no other text.
    """

    response = model.generate_content(prompt)
    return {"destinations": safe_json_parse(response.text, fallback=[])}


# ─── Feature 2: Hidden Gems ───────────────────────────────────────────────────

async def discover_hidden_gems(
    destination: str,
    interest: Optional[str] = None,
    api_key: Optional[str] = None,
) -> dict:
    """Uncover off-the-beaten-path hidden gems near a destination."""
    model = get_gemini_client(api_key)

    prompt = f"""
    Uncover 4 hidden gem locations near or within "{destination}" that most tourists miss.
    Interest type: {interest or "any (nature, food, art, history, adventure)"}

    These should be genuinely less-known places with authentic local character.

    Return a JSON array of 4 hidden gems:
    [
      {{
        "name": "Place Name",
        "location": "Specific area/neighborhood/village",
        "why_hidden": "Short reason why it's undiscovered (1 sentence)",
        "description": "Vivid 2-sentence description",
        "best_experience": "The single best thing to do here",
        "insider_tip": "A local secret tip",
        "category": "nature/food/art/history/spiritual/adventure",
        "emoji": "Relevant emoji"
      }}
    ]
    Return ONLY the JSON array.
    """

    response = model.generate_content(prompt)
    return {"gems": safe_json_parse(response.text, fallback=[])}


# ─── Feature 3: Immersive Storytelling ────────────────────────────────────────

async def generate_cultural_story(
    place: str,
    style: str = "immersive",
    api_key: Optional[str] = None,
) -> dict:
    """Generate an immersive narrative story about a place and its culture."""
    model = get_gemini_client(api_key)

    style_guide = {
        "immersive": "Write as if the reader is there — use sensory details, sounds, smells, colors",
        "historical": "Weave history and legends into a compelling narrative",
        "mythological": "Include local myths, legends, and folklore",
        "poetic": "Use lyrical, poetic language with metaphors and imagery",
    }

    prompt = f"""
    Create an immersive travel story about "{place}".
    Style: {style_guide.get(style, style_guide["immersive"])}

    Return a JSON object:
    {{
      "title": "An evocative story title",
      "place": "{place}",
      "opening_hook": "A powerful 1-sentence hook to draw readers in",
      "story": "A rich 3-4 paragraph immersive narrative (400-500 words) about the place, its culture, and spirit",
      "cultural_notes": "2-3 fascinating cultural facts woven into a paragraph",
      "traveler_reflection": "A short inspiring closing thought for the traveler",
      "mood": "The dominant mood/feeling: Mystical / Vibrant / Peaceful / Epic / Romantic"
    }}
    Return ONLY the JSON object.
    """

    response = model.generate_content(prompt)
    return safe_json_parse(response.text, fallback={"title": place, "story": response.text})


# ─── Feature 4: Heritage Insights ─────────────────────────────────────────────

async def get_heritage_insights(
    destination: str,
    aspect: str = "all",
    api_key: Optional[str] = None,
) -> dict:
    """Generate heritage and cultural tradition highlights for a destination."""
    model = get_gemini_client(api_key)

    prompt = f"""
    Provide rich heritage and cultural insights for "{destination}".
    Focus aspect: {aspect}

    Return a JSON object:
    {{
      "destination": "{destination}",
      "overview": "2-sentence cultural overview",
      "heritage_sites": [
        {{"name": "Site Name", "type": "UNESCO/Historical/Religious/Natural", "significance": "Why it matters", "emoji": "emoji"}}
      ],
      "traditions": [
        {{"name": "Tradition Name", "description": "What it is", "when": "When observed", "emoji": "emoji"}}
      ],
      "art_forms": ["art form 1", "art form 2", "art form 3"],
      "culinary_heritage": "2-sentence description of signature cuisine and food culture",
      "language_notes": "Interesting linguistic or greeting facts",
      "preservation_efforts": "What is being done to preserve this culture",
      "did_you_know": ["Fascinating fact 1", "Fascinating fact 2", "Fascinating fact 3"]
    }}
    Return ONLY the JSON object.
    """

    response = model.generate_content(prompt)
    return safe_json_parse(response.text, fallback={"destination": destination, "raw": response.text})


# ─── Feature 5: Local Events ──────────────────────────────────────────────────

async def suggest_local_events(
    destination: str,
    month: Optional[str] = None,
    interest: Optional[str] = None,
    api_key: Optional[str] = None,
) -> dict:
    """Suggest local cultural events, festivals, and activities."""
    model = get_gemini_client(api_key)

    prompt = f"""
    Suggest 5 must-experience local events and festivals in "{destination}".
    Month/Season: {month or "throughout the year"}
    Interest type: {interest or "any (cultural, music, food, religious, art, sports)"}

    Return a JSON array of 5 events:
    [
      {{
        "name": "Event/Festival Name",
        "type": "cultural/music/food/religious/art/sports/market",
        "description": "Vivid 2-sentence description",
        "dates": "When it happens (month/season/specific dates if known)",
        "location": "Specific venue or area",
        "cultural_significance": "Why this event matters culturally",
        "visitor_tips": "One practical tip for visitors",
        "vibe": "Energy level: Electric / Peaceful / Sacred / Festive / Intimate",
        "emoji": "Relevant emoji"
      }}
    ]
    Return ONLY the JSON array.
    """

    response = model.generate_content(prompt)
    return {"events": safe_json_parse(response.text, fallback=[])}


# ─── Feature 6: Authentic Experiences ────────────────────────────────────────

async def get_authentic_experiences(
    destination: str,
    exp_type: Optional[str] = None,
    api_key: Optional[str] = None,
) -> dict:
    """Suggest authentic local experiences to connect visitors with local culture."""
    model = get_gemini_client(api_key)

    prompt = f"""
    Suggest 5 authentic, immersive local experiences in "{destination}" that connect travelers with local culture.
    Experience type: {exp_type or "any (cooking, craft, nature, community, wellness, art, ceremony)"}

    These should be genuine, responsible tourism experiences (NOT generic tourist traps).

    Return a JSON array of 5 experiences:
    [
      {{
        "title": "Experience Title",
        "category": "cooking/craft/nature/community/wellness/art/ceremony/adventure",
        "description": "What this experience involves (2 sentences)",
        "what_to_expect": "Sensory/emotional description of what participating feels like",
        "cultural_insight": "A deeper cultural meaning or lesson from this experience",
        "how_to_book": "How to find and arrange this (local market, guide, NGO, etc.)",
        "duration": "Typical duration",
        "difficulty": "Easy/Moderate/Challenging",
        "emoji": "Relevant emoji"
      }}
    ]
    Return ONLY the JSON array.
    """

    response = model.generate_content(prompt)
    return {"experiences": safe_json_parse(response.text, fallback=[])}


# ─── Feature 7: Cultural Deep Dive ───────────────────────────────────────────

async def get_cultural_deep_dive(
    destination: str,
    topic: str = "overview",
    api_key: Optional[str] = None,
) -> dict:
    """Generate a comprehensive cultural guide for a destination."""
    model = get_gemini_client(api_key)

    prompt = f"""
    Create a rich cultural deep dive guide for "{destination}".
    Topic focus: {topic}

    Return a JSON object:
    {{
      "destination": "{destination}",
      "topic": "{topic}",
      "intro": "An engaging 2-sentence introduction",
      "key_insights": [
        {{"title": "Insight title", "content": "2-3 sentence insight", "emoji": "emoji"}}
      ],
      "dos_and_donts": {{
        "dos": ["Do 1", "Do 2", "Do 3"],
        "donts": ["Don't 1", "Don't 2", "Don't 3"]
      }},
      "essential_phrases": [
        {{"phrase": "Local phrase", "meaning": "English meaning", "pronunciation": "How to say it"}}
      ],
      "signature_dishes": [
        {{"name": "Dish name", "description": "What it is", "where_to_try": "Best place"}}
      ],
      "cultural_calendar": "Overview of main annual cultural events",
      "respectful_travel_tips": ["Tip 1", "Tip 2", "Tip 3"]
    }}
    Return ONLY the JSON object.
    """

    response = model.generate_content(prompt)
    return safe_json_parse(response.text, fallback={"destination": destination, "raw": response.text})


# ─── Feature 8: AI Travel Chat ────────────────────────────────────────────────

async def chat_with_assistant(
    message: str,
    conversation_history: Optional[List[dict]] = None,
    destination_context: Optional[str] = None,
    api_key: Optional[str] = None,
) -> dict:
    """Conversational AI travel assistant with context awareness."""
    key = api_key or os.getenv("GEMINI_API_KEY", "")
    if not key:
        raise ValueError("Gemini API key not configured.")
    
    genai.configure(api_key=key)
    model = genai.GenerativeModel(
        model_name=GEMINI_MODEL,
        generation_config=GENERATION_CONFIG,
        system_instruction=f"""{SYSTEM_PERSONA}
        
        You are having a conversation with a traveler.
        Current destination context: {destination_context or 'General travel planning'}
        
        Keep responses conversational, helpful, and inspiring (2-4 paragraphs max).
        End with 1-2 suggested follow-up questions the user might want to ask.
        Format: Reply naturally, then add a line "💡 You might also ask:" followed by 2 questions.
        """,
    )

    # Build conversation history for multi-turn chat
    history = []
    if conversation_history:
        for turn in conversation_history[-6:]:  # Keep last 6 turns for context
            history.append({
                "role": turn.get("role", "user"),
                "parts": [turn.get("content", "")]
            })

    chat = model.start_chat(history=history)
    response = chat.send_message(message)
    
    reply_text = response.text
    suggested = []
    
    # Extract suggested questions if present
    if "💡 You might also ask:" in reply_text:
        parts = reply_text.split("💡 You might also ask:")
        reply_text = parts[0].strip()
        if len(parts) > 1:
            questions = [q.strip().lstrip("•-123456789. ") for q in parts[1].strip().split("\n") if q.strip()]
            suggested = questions[:2]

    return {
        "reply": reply_text,
        "suggested_actions": suggested
    }
