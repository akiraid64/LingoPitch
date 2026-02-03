# LingoPitch Backend

> Express.js + TypeScript + Supabase + Gemini AI backend for LingoPitch

## Features

- **Language Support**: Info for 80+ languages via Lingo.dev integration
- **Cultural Intelligence**: AI-generated cultural profiles for each market
- **Call Analysis**: Gemini-powered transcript analysis with cultural scoring
- **Voice Roleplay**: LiveKit integration for real-time practice sessions  
- **Analytics**: Event tracking and user progress monitoring
- **User Profiles**: Profile management with stats tracking

## Tech Stack

- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js
- **Database**: Supabase (PostgreSQL)
- **AI**: Google Gemini 2.0 Flash
- **Voice**: LiveKit
- **Localization**: Lingo.dev SDK (planned)

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

Copy `.env.example` to `.env` and fill in your credentials:

```bash
cp .env.example .env
```

Required variables:
- `SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_SERVICE_KEY` - Supabase service role key
- `GEMINI_API_KEY` - Google AI Studio API key
- `LIVEKIT_API_KEY` - LiveKit API key (optional)
- `LIVEKIT_API_SECRET` - LiveKit API secret (optional)
- `LINGO_DEV_API_KEY` - Lingo.dev API key (optional)

### 3. Run Database Migration

1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Create a new query
4. Copy and paste the contents of `supabase/migrations/001_initial_schema.sql`
5. Run the query

This will create:
- `cultural_profiles` table
- `calls` table
- `user_profiles` table
- `analytics_events` table
- Indexes for performance
- Row Level Security (RLS) policies

### 4. Start Development Server

```bash
npm run dev
```

Server will start on `http://localhost:3001`

### 5. Verify Setup

Visit `http://localhost:3001/api/health` - you should see:

```json
{
  "status": "healthy",
  "timestamp": "2024-...",
  "version": "0.1.0",
  "services": {
    "supabase": true,
    "gemini": true,
    "livekit": false,
    "lingoDev": false
  }
}
```

## API Endpoints

### Language
- `GET /api/language/supported` - Get all supported languages
- `GET /api/language/:code` - Get language info by code
- `POST /api/language/detect` - Detect language from text

### Cultural
- `GET /api/cultural` - Get all cultural profiles
- `GET /api/cultural/:languageCode` - Get/generate cultural profile

### Calls
- `POST /api/calls` - Create and analyze a call
- `GET /api/calls/user/:userId` - Get user's calls
- `GET /api/calls/:id` - Get specific call

### Voice
- `POST /api/voice/token` - Generate LiveKit token

### Analytics
- `POST /api/analytics` - Track event
- `GET /api/analytics/user/:userId` - Get user analytics

### Profiles
- `GET /api/profiles/:userId` - Get user profile
- `POST /api/profiles` - Create/update profile
- `PATCH /api/profiles/:userId/stats` - Update profile stats

## Project Structure

```
backend/
├── src/
│   ├── index.ts              # Express server
│   ├── lib/
│   │   └── supabase.ts       # Supabase client
│   ├── routes/
│   │   ├── language.ts       # Language routes
│   │   ├── cultural.ts       # Cultural profile routes
│   │   ├── calls.ts          # Call analysis routes
│   │   ├── voice.ts          # LiveKit routes
│   │   ├── analytics.ts      # Analytics routes
│   │   └── profiles.ts       # User profile routes
│   ├── services/
│   │   └── geminiService.ts  # Gemini AI integration
│   └── types/
│       └── database.ts       # TypeScript types
├── supabase/
│   └── migrations/
│       └── 001_initial_schema.sql
├── package.json
├── tsconfig.json
└── .env.example
```

## Development

```bash
# Development with auto-reload
npm run dev

# Type checking
npm run typecheck

# Build for production
npm run build

# Start production server
npm start
```

## Production Deployment

1. Build the project: `npm run build`
2. Set environment variables on your hosting platform
3. Run database migrations on production Supabase
4. Start with: `npm start`

## Notes

- The backend uses Supabase service role key to bypass RLS for flexibility
- Cultural profiles are cached in the database after first generation
- LiveKit is optional - voice features will be disabled without credentials
- Lingo.dev integration is planned for enhanced localization

---

Made with ❤️ for LingoPitch
