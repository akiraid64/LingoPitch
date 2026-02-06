"""
Cartesia Voice Agent HTTP Bridge

This service acts as a bridge between the TypeScript backend and Cartesia's hosted Calls API.
It handles:
1. Fetching Gemini-generated prompts from TypeScript backend
2.Creating Cartesia access tokens for client authentication
3. Returning WebSocket connection details for the frontend

NO LOCAL AGENT SERVER NEEDED - Cartesia hosts everything!
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import httpx
import os
from dotenv import load_dotenv

load_dotenv()

app = FastAPI()

# Allow requests from TypeScript backend and frontend
allowed_origins = [
    "http://localhost:3001", 
    "http://localhost:5173", 
    "http://127.0.0.1:3001", 
    "http://127.0.0.1:5173",
    "https://sublime-nature-production.up.railway.app",  # Production Frontend
    "https://lingopitch-production.up.railway.app"       # Production Backend
]

# Add origins from env var
extra_origins = os.getenv("ALLOWED_ORIGINS", "").split(",")
for origin in extra_origins:
    if origin.strip():
        allowed_origins.append(origin.strip())

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_methods=["*"],
    allow_headers=["*"],
)

class SessionRequest(BaseModel):
    language_code: str
    user_id: str
    org_id: str | None = None  # Traceability
    playbook: str = "B2B SaaS Sales"
    product_description: str | None = None
    system_prompt: str | None = None  # Optional prompt override

class SessionResponse(BaseModel):
    agent_id: str
    websocket_url: str
    access_token: str
    system_prompt: str
    metadata: dict

@app.post("/api/voice/start-session", response_model=SessionResponse)
async def start_session(request: SessionRequest):
    """
    1. Check for manual prompt override or fetch from TS backend
    2. Create Cartesia access token
    3. Return WebSocket connection details
    """
    print(f"[HTTP] Starting session for user: {request.user_id} (Org: {request.org_id})")
    
    final_prompt = request.system_prompt
    
    # Step 1: Get prompt (either from request or from backend)
    if final_prompt:
        print(f"[HTTP] ✅ Using manual prompt override ({len(final_prompt)} chars)")
    else:
        print("[HTTP] 📡 Fetching generated prompt from TS backend...")
        async with httpx.AsyncClient() as client:
            try:
                typescript_backend_url = os.getenv("TYPESCRIPT_BACKEND_URL", "http://localhost:3001")
                response = await client.post(
                    f"{typescript_backend_url}/api/roleplay/generate-prompt",
                    json={
                        "languageCode": request.language_code,
                        "productDescription": request.product_description,
                        "orgId": request.org_id
                    },
                    timeout=30.0
                )
                response.raise_for_status()
                prompt_data = response.json()
                final_prompt = prompt_data["prompt"]
                print(f"[HTTP] 📥 Received prompt from backend ({len(final_prompt)} chars)")
            except Exception as e:
                print(f"[HTTP] ❌ Failed to fetch prompt: {str(e)}")
                raise HTTPException(status_code=500, detail=f"Failed to fetch prompt: {str(e)}")
    
    # Step 2: Create Cartesia access token
    cartesia_api_key = os.getenv("CARTESIA_API_KEY")
    if not cartesia_api_key:
        raise HTTPException(status_code=500, detail="CARTESIA_API_KEY not configured")
    
    try:
        async with httpx.AsyncClient() as client:
            token_response = await client.post(
                "https://api.cartesia.ai/access-token",
                headers={
                    "X-API-Key": cartesia_api_key,
                    "Cartesia-Version": "2025-04-16"
                },
                json={
                    "grants": { "agent": True },
                    "expires_in": 3600
                }
            )
            token_response.raise_for_status()
            access_token = token_response.json().get("access_token") or token_response.json().get("token")
            # print(f"[HTTP] 🔑 Access Token created")
    except Exception as e:
        print(f"[HTTP] ❌ Failed to create access token: {str(e)}")
        if hasattr(e, 'response') and e.response:
             print(f"[HTTP] ❌ API Response: {e.response.text}")
        raise HTTPException(status_code=500, detail=f"Failed to create access token: {str(e)}")
    
    # Step 3: Prepare metadata for the agent
    metadata = {
        "language_code": request.language_code,
        "user_id": request.user_id,
        "org_id": request.org_id,
        "playbook": request.playbook,
        "system_prompt": final_prompt
    }
    
    # Hardcoded as requested
    agent_id = "agent_bVJVHJEoXdAsKXL1hxrFMX"
    
    # Corrected URL format: /agents/stream/{agent_id}
    websocket_url = f"wss://api.cartesia.ai/agents/stream/{agent_id}"
    print(f"[HTTP] 🔌 Using WebSocket URL: {websocket_url}")
    
    return SessionResponse(
        agent_id=f"cartesia_agent_{request.user_id}",
        websocket_url=websocket_url,
        access_token=access_token,
        system_prompt=final_prompt,
        metadata=metadata
    )

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("HTTP_PORT", 8001))
    print(f"🌐 Starting Cartesia Voice Bridge v2.0 on port {port}...")
    print(f"📡 Connecting to TypeScript backend: {os.getenv('TYPESCRIPT_BACKEND_URL', 'http://localhost:3001')}")
    print(f"🎙️ Using Cartesia hosted agents")
    uvicorn.run(app, host="0.0.0.0", port=port,
        log_level="info"
    )
