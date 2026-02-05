# Cartesia Voice Agent

Python microservice using Cartesia Line SDK for voice roleplay training.

## Architecture

```
TypeScript Backend (Gemini Prompts) → Python Agent (Cartesia SDK) → Frontend (WebSocket)
```

## Setup

1. **Install Python dependencies**:
```bash
pip install -r requirements.txt
# or using uv (faster):
uv pip install -r requirements.txt
```

2. **Configure environment variables**:
```bash
cp .env.example .env
# Edit .env with your API keys
```

3. **Get Cartesia API Key**:
   - Sign up at https://cartesia.ai
   - Get your API key from the dashboard
   - Add to `.env` file

4. **Get Voice IDs**:
   - Browse Cartesia's voice library
   - Update `VOICE_MAPPING` in `agent.py` with actual voice IDs for each language

## Running

### Option 1: Run both servers together (recommended)

```bash
# Terminal 1: Start the Cartesia agent (WebSocket server)
python agent.py

# Terminal 2: Start the HTTP bridge
python server.py
```

### Option 2: Development mode

```bash
# Auto-reload on file changes
uvicorn server:app --reload --port 8001
```

## Endpoints

### HTTP Bridge (Port 8001)
- `POST /api/voice/start-session` - Start a new voice session
- `GET /health` - Health check

### Voice Agent (Port 8000)
- WebSocket `/voice-stream` - Audio streaming

## Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `CARTESIA_API_KEY` | Cartesia API key | `sk_cart_...` |
| `GEMINI_API_KEY` | Google Gemini API key | `AIza...` |
| `TYPESCRIPT_BACKEND_URL` | URL of TypeScript backend | `http://localhost:3001` |
| `PORT` | Voice agent WebSocket port | `8000` |
| `HTTP_PORT` | HTTP bridge port | `8001` |

## How It Works

1. **Frontend** calls `/api/voice/start-session` with language code
2. **HTTP Bridge** fetches Gemini-generated prompt from TypeScript backend
3. **Frontend** connects to WebSocket with prompt metadata
4. **Voice Agent** initializes Cartesia LlmAgent with custom prompt
5. **User** speaks → **Agent** responds in culturally-aware manner

## Testing

```bash
# Test prompt fetching
curl -X POST http://localhost:8001/api/voice/start-session \
  -H "Content-Type: application/json" \
  -d '{
    "language_code": "es-MX",
    "user_id": "test123",
    "playbook": "B2B SaaS Sales"
  }'
```

## Supported Languages

Update `VOICE_MAPPING` in `agent.py` with actual Cartesia voice IDs:
- English (en)
- Spanish (es)
- French (fr)
- German (de)
- Italian (it)
- Portuguese (pt)
- Japanese (ja)
- Chinese (zh)
- Korean (ko)
- Hindi (hi)

## Troubleshooting

### "Module not found: cartesia-line"
```bash
pip install cartesia-line
```

### "Connection refused" on WebSocket
Make sure `agent.py` is running on port 8000

### "Timeout fetching prompt"
Check that TypeScript backend is running on port 3001
