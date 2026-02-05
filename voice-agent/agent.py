import os
from typing import Optional
from line import CallRequest
from line.llm_agent import LlmAgent, LlmConfig, end_call
from line.voice_agent_app import AgentEnv, VoiceAgentApp, PreCallResult
from dotenv import load_dotenv

load_dotenv()

# Voice configuration per language (Cartesia Voice IDs)
# You'll need to get actual voice IDs from Cartesia dashboard
VOICE_MAPPING = {
    "en": "a0e99841-438c-4a64-b679-ae501e7d6091",  # English (placeholder)
    "es": "b2c1d3e4-438c-4a64-b679-ae501e7d6092",  # Spanish (placeholder)
    "fr": "c3d2e1f5-438c-4a64-b679-ae501e7d6093",  # French (placeholder)
    "de": "d4e3f2a6-438c-4a64-b679-ae501e7d6094",  # German (placeholder)
    "it": "e5f4a3b7-438c-4a64-b679-ae501e7d6095",  # Italian (placeholder)
    "pt": "f6a5b4c8-438c-4a64-b679-ae501e7d6096",  # Portuguese (placeholder)
    "ja": "a7b6c5d9-438c-4a64-b679-ae501e7d6097",  # Japanese (placeholder)
    "zh": "b8c7d6ea-438c-4a64-b679-ae501e7d6098",  # Chinese (placeholder)
    "ko": "c9d8e7fb-438c-4a64-b679-ae501e7d6099",  # Korean (placeholder)
    "hi": "dae9f8ac-438c-4a64-b679-ae501e7d609a",  # Hindi (placeholder)
}

async def pre_call_handler(call_request: CallRequest) -> Optional[PreCallResult]:
    """
    Configure TTS/STT based on language metadata from frontend.
    This ensures the voice agent speaks in the correct language and accent.
    """
    language_code = call_request.metadata.get("language_code", "en") if call_request.metadata else "en"
    
    # Extract base language (e.g., "es-MX" -> "es")
    base_lang = language_code.split('-')[0] if '-' in language_code else language_code
    
    # Get voice ID for this language (fallback to English if not found)
    voice_id = VOICE_MAPPING.get(base_lang, VOICE_MAPPING["en"])
    
    print(f"[PRE-CALL] Configuring voice for language: {language_code} (base: {base_lang})")
    print(f"[PRE-CALL] Using voice ID: {voice_id}")
    
    return PreCallResult(
        config={
            "tts": {
                "voice": voice_id,
                "model": "sonic-3",  # Cartesia's best TTS model
                "language": base_lang,
            },
            "stt": {
                "language": base_lang,
            }
        }
    )

async def get_agent(env: AgentEnv, call_request: CallRequest):
    """
    Create LLM-powered voice agent with Gemini-generated custom prompt.
    
    The system_prompt comes from your TypeScript backend's Gemini 2.5 Flash generation,
    ensuring culturally-aware, context-rich roleplay scenarios.
    """
    
    # Extract custom prompt from metadata (passed from frontend via TypeScript backend)
    system_prompt = call_request.metadata.get("system_prompt") if call_request.metadata else None
    language_code = call_request.metadata.get("language_code", "en") if call_request.metadata else "en"
    user_id = call_request.metadata.get("user_id", "anonymous") if call_request.metadata else "anonymous"
    
    if not system_prompt:
        # Fallback if no prompt provided
        system_prompt = "You are a helpful sales training assistant. Engage in realistic sales roleplay scenarios."
    
    print(f"[AGENT] Creating agent for user: {user_id}")
    print(f"[AGENT] Language: {language_code}")
    print(f"[AGENT] System prompt length: {len(system_prompt)} characters")
    print(f"[AGENT] Prompt preview: {system_prompt[:150]}...")
    
    # Use Gemini 2.5 Flash as the LLM (via LiteLLM)
    # This allows the agent to use the same Gemini model that generated the prompt!
    return LlmAgent(
        model="gemini/gemini-2.5-flash-preview-09-2025",
        api_key=os.getenv("GEMINI_API_KEY"),
        tools=[end_call],  # Add more tools as needed
        config=LlmConfig(
            system_prompt=system_prompt,
            introduction="",  # Empty = wait for user to speak first
            temperature=0.7,  # Slightly creative but consistent
            max_tokens=150,  # Keep responses concise for natural conversation
        ),
    )

# Create the Cartesia Voice Agent App
app = VoiceAgentApp(
    get_agent=get_agent,
    pre_call_handler=pre_call_handler
)

if __name__ == "__main__":
    port = int(os.getenv("PORT", 8000))
    print(f"🎙️  Starting Cartesia Voice Agent on port {port}...")
    print(f"🧠 Using Gemini model: gemini-2.5-flash-preview-09-2025")
    print(f"🌍 Supported languages: {', '.join(VOICE_MAPPING.keys())}")
    app.run(host="0.0.0.0", port=port)
