# Cartesia AI Migration - Setup Guide

## 📋 Prerequisites

- Python 3.9+ installed
- Node.js 18+ installed
- Cartesia API account (sign up at https://cartesia.ai)
- Gemini API key (from Google AI Studio)

---

## 🚀 Setup Steps

### 1. Python Voice Agent Setup

```bash
cd voice-agent

# Install dependencies
pip install -r requirements.txt
# OR using uv (faster):
uv pip install -r requirements.txt
```

### 2. Get Cartesia API Keys

1. Sign up at https://cartesia.ai
2. Navigate to dashboard → API Keys
3. Create a new API key
4. Browse voice library to get voice IDs for each language

### 3. Configure Environment Variables

**Python (.env):**
```bash
cd voice-agent
cp .env.example .env
# Edit .env with your actual keys:
CARTESIA_API_KEY=sk_cart_your_key_here
GEMINI_API_KEY=AIza_your_gemini_key_here
TYPESCRIPT_BACKEND_URL=http://localhost:3001
PORT=8000
HTTP_PORT=8001
```

**TypeScript Backend (.env):**
```bash
# Add to existing backend/.env:
PYTHON_AGENT_URL=http://localhost:8001
```

**Frontend (.env):**
```bash
# Remove old ElevenLabs vars, keep existing Supabase vars
# Optionally add:
VITE_PYTHON_AGENT_URL=http://localhost:8001
```

### 4. Update Voice IDs

Edit `voice-agent/agent.py` and update the `VOICE_MAPPING` dictionary with actual Cartesia voice IDs from their dashboard:

```python
VOICE_MAPPING = {
    "en": "YOUR_ENGLISH_VOICE_ID",
    "es": "YOUR_SPANISH_VOICE_ID",
    "fr": "YOUR_FRENCH_VOICE_ID",
    # ... etc
}
```

### 5. Remove ElevenLabs Dependency

```bash
cd frontend
npm uninstall @elevenlabs/react
```

---

## ▶️ Running the Full Stack

You'll need **4 terminals**:

### Terminal 1: TypeScript Backend
```bash
cd backend
npm run dev
```

### Terminal 2: Python Voice Agent (WebSocket)
```bash
cd voice-agent
python agent.py
```

### Terminal 3: Python HTTP Bridge
```bash
cd voice-agent
python server.py
```

### Terminal 4: Frontend
```bash
cd frontend
npm run dev
```

---

## 🧪 Testing the Setup

### 1. Health Check
```bash
curl http://localhost:8001/health
```

Expected output:
```json
{
  "status": "ok",
  "service": "voice-agent-bridge"
}
```

### 2. Backend Health Check
```bash
curl http://localhost:3001/api/voice-agent/health
```

### 3. Test Session Creation
```bash
curl -X POST http://localhost:3001/api/voice-agent/start-session \
  -H "Content-Type: application/json" \
  -d '{
    "language_code": "es-MX",
    "user_id": "test123",
    "playbook": "B2B SaaS Sales"
  }'
```

Expected output:
```json
{
  "agent_id": "cartesia_agent_test123",
  "websocket_url": "ws://localhost:8000/voice-stream",
  "system_prompt": "You are Maria Rodriguez, Director of Operations...",
  "metadata": {...}
}
```

### 4. Test Frontend
1. Navigate to http://localhost:5173/arena
2. Select a language (e.g., Spanish)
3. Click "Start Practice"
4. Grant microphone permissions
5. Speak and listen for response

---

## 🔧 Troubleshooting

### "cartesia-line not found"
```bash
cd voice-agent
pip install cartesia-line
```

### "Connection refused" on WebSocket
Make sure `agent.py` is running on port 8000

### "Timeout fetching prompt"
- Check TypeScript backend is running on port 3001
- Verify `TYPESCRIPT_BACKEND_URL` in Python `.env`
- Check network/firewall settings

### "Invalid voice ID"
- Get actual voice IDs from Cartesia dashboard
- Update `VOICE_MAPPING` in `agent.py`

### Frontend errors
- Check browser console for detailed errors
- Ensure microphone permissions granted
- Verify WebSocket URL is correct

---

## 📝 Next Steps

1. Test with multiple languages
2. Implement custom tools (order lookup, CRM integration)
3. Add multi-agent handoffs (Spanish → English escalation)
4. Implement analytics and session recording
5. Deploy to production

---

## 🎯 Architecture Summary

```
Frontend (React/TypeScript)
    ↓ HTTP Request
TypeScript Backend (Express)
    ↓ Fetch Gemini Prompt
    ↓ Proxy to Python
Python HTTP Bridge (FastAPI)
    ↓ Return Session Info
Frontend connects WebSocket
    ↓
Python Voice Agent (Cartesia Line SDK)
    ↓ Real-time Audio
Cartesia TTS/STT Infrastructure
```

**Key Flow:**
1. User selects language → Frontend
2. Frontend requests session → TypeScript backend
3. Backend generates Gemini prompt (cached in Supabase)
4. TypeScript proxies to Python bridge
5. Python bridge returns WebSocket URL + metadata
6. Frontend connects WebSocket to Python agent
7. Python agent initializes with Gemini prompt
8. Real-time voice conversation begins!
