# LingoPitch Backend - Quick Start Guide

## Database Setup

### 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Wait for it to initialize

### 2. Run Migration

1. In your Supabase dashboard, go to **SQL Editor**
2. Click **New Query**
3. Copy the contents of `supabase/migrations/001_initial_schema.sql`
4. Paste and click **Run**

This creates all tables, indexes, and security policies.

### 3. Get Your Credentials

**Supabase URL & Keys:**
- Go to **Project Settings** → **API**
- Copy `Project URL` → use for `SUPABASE_URL`
- Copy `service_role key` → use for `SUPABASE_SERVICE_KEY`

**Gemini API Key:**
- Go to [ai.google.dev](https://ai.google.dev)
- Click **Get API Key**
- Create a new key → use for `GEMINI_API_KEY`

**LiveKit (Optional):**
- Go to [livekit.io](https://livekit.io)
- Create account and project
- Get API Key, Secret, and WebSocket URL

### 4. Configure .env

```bash
PORT=3001
NODE_ENV=development

# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your-service-role-key

# Gemini AI
GEMINI_API_KEY=your-gemini-api-key

# LiveKit (optional)
LIVEKIT_API_KEY=your-livekit-key
LIVEKIT_API_SECRET=your-livekit-secret
LIVEKIT_URL=wss://your-project.livekit.cloud

# Lingo.dev (optional)
LINGO_DEV_API_KEY=your-lingo-dev-key

# CORS
CORS_ORIGIN=http://localhost:5173
```

### 5. Start Server

```bash
npm run dev
```

Server should start on `http://localhost:3001`

### 6. Test

Visit: `http://localhost:3001/api/health`

Should return:
```json
{
  "status": "healthy",
  "version": "0.1.0",
  "services": { ... }
}
```

## Testing API Endpoints

### Get Supported Languages
```bash
curl http://localhost:3001/api/language/supported
```

### Generate Cultural Profile
```bash
curl http://localhost:3001/api/cultural/es
```

This will generate a Spanish cultural profile using Gemini AI.

### Analyze a Call
```bash
curl -X POST http://localhost:3001/api/calls \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "test-user",
    "language_code": "es",
    "scenario": "Product Demo",
    "transcript": "Hello, I would like to show you our product...",
    "duration_seconds": 180
  }'
```

## Common Issues

**Error: Missing environment variables**
- Make sure all required variables in `.env` are set

**Error: Database connection failed**
- Check your `SUPABASE_URL` and `SUPABASE_SERVICE_KEY`
- Make sure migration was run successfully

**Error: Gemini API error**
- Verify your `GEMINI_API_KEY` is valid
- Check if you have API quota remaining

## Next Steps

1. ✅ Backend is running
2. ✅ Database is set up
3. 🔄 Start the frontend (`cd ../frontend && npm run dev`)
4. 🔄 Test the full application

The frontend should now be able to connect to the backend at `http://localhost:3001`!
