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
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3001", "http://localhost:5173", "http://127.0.0.1:3001", "http://127.0.0.1:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)

class SessionRequest(BaseModel):
    language_code: str
    user_id: str
    playbook: str = "B2B SaaS Sales"
    product_description: str | None = None

class SessionResponse(BaseModel):
    agent_id: str
    websocket_url: str
    access_token: str
    system_prompt: str
    metadata: dict

@app.get("/health")
async def health():
    return {"status": "ok", "service": "cartesia-voice-bridge"}

@app.post("/api/voice/start-session", response_model=SessionResponse)
async def start_session(request: SessionRequest):
    """
    1. Fetch Gemini-generated prompt from TypeScript backend
    2. Create Cartesia access token
    3. Return WebSocket connection details
    """
    print(f"[HTTP] Starting session for user: {request.user_id}")
    print(f"[HTTP] Language: {request.language_code}, Playbook: {request.playbook}")
    
    # Step 1: Fetch prompt from TypeScript backend
    async with httpx.AsyncClient() as client:
        try:
            typescript_backend_url = os.getenv("TYPESCRIPT_BACKEND_URL", "http://localhost:3001")
            print(f"[HTTP] URL: {typescript_backend_url}/api/roleplay/generate-prompt")
            
            response = await client.post(
                f"{typescript_backend_url}/api/roleplay/generate-prompt",
                json={
                    "languageCode": request.language_code,
                    "productDescription": request.product_description
                },
                timeout=30.0 # Increased timeout
            )
            
            print(f"[HTTP] Prompt Response Status: {response.status_code}")
            print(f"[HTTP] Prompt Response Body Preview: {response.text[:200]}")
            
            response.raise_for_status()
            prompt_data = response.json()
            
            print(f"[HTTP] ✅ Received prompt ({len(prompt_data.get('prompt', ''))} chars)")
        except httpx.HTTPStatusError as e:
            print(f"[HTTP] ❌ Backend returned error: {e.response.status_code} - {e.response.text}")
            raise HTTPException(status_code=500, detail=f"Backend error: {e.response.text}")
        except Exception as e:
            print(f"[HTTP] ❌ Failed to fetch prompt: {str(e)}")
            import traceback
            traceback.print_exc()
            raise HTTPException(status_code=500, detail=f"Failed to fetch prompt: {str(e)}")
    
    # Step 2: Create Cartesia access token
    cartesia_api_key = os.getenv("CARTESIA_API_KEY")
    if not cartesia_api_key:
        raise HTTPException(status_code=500, detail="CARTESIA_API_KEY not configured")
    
    try:
        async with httpx.AsyncClient() as client:
            print(f"[HTTP] Requesting access token from https://api.cartesia.ai/access-token")
            token_response = await client.post(
                "https://api.cartesia.ai/access-token",
                headers={
                    "X-API-Key": cartesia_api_key,
                    "Cartesia-Version": "2025-04-16"
                },
                json={
                    "grants": {
                        "agent": True  # Required permission for voice agents
                    },
                    "expires_in": 3600  # 1 hour validity
                }
            )
            # Print full response for debugging
            print(f"[HTTP] Token Response Status: {token_response.status_code}")
            print(f"[HTTP] Token Response Headers: {token_response.headers}")
            print(f"[HTTP] Token Response Body: {token_response.text}")
            
            token_response.raise_for_status()
            access_token = token_response.json().get("access_token") or token_response.json().get("token")
            
            if not access_token:
                 print(f"[HTTP] ❌ Access token missing from response keys: {token_response.json().keys()}")
                 raise ValueError("Access token not found in response")

            print(f"[HTTP] ✅ Created access token (valid for 1 hour)")
    except httpx.HTTPStatusError as e:
        print(f"[HTTP] ❌ Access Token Error: {e.response.text}")
        raise HTTPException(status_code=500, detail=f"Failed to create access token: {e.response.text}")
    except Exception as e:
        print(f"[HTTP] ❌ Failed to create access token: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to create access token: {str(e)}")
    
    # Step 3: Prepare metadata for the agent
    # This will be passed to Cartesia and available in the agent's context
    metadata = {
        "language_code": request.language_code,
        "user_id": request.user_id,
        "playbook": request.playbook,
        "system_prompt": prompt_data["prompt"]
    }
    
    # Use the agent ID provided by the user
    agent_id = "agent_hVL2nqC4ojsVmKzu1NA2MF"
    
    # Return connection details for frontend
    return SessionResponse(
        agent_id=f"cartesia_agent_{request.user_id}",
        websocket_url=f"wss://api.cartesia.ai/agents/stream/{agent_id}",
        access_token=access_token,
        system_prompt=prompt_data["prompt"],
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
