import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { config } from 'dotenv';
import languageRoutes from './routes/language.js';
import culturalRoutes from './routes/cultural.js';
import callsRoutes from './routes/calls.js';
import voiceRoutes from './routes/voice.js';
import analyticsRoutes from './routes/analytics.js';
import profilesRoutes from './routes/profiles.js';
import chatRoutes from './routes/chat.js';

config();

// Validate required environment variables
const requiredEnvVars = ['GEMINI_API_KEY', 'SUPABASE_URL', 'SUPABASE_SERVICE_KEY'];
for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
        console.error(`FATAL: ${envVar} environment variable is not set`);
        process.exit(1);
    }
}

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet());

// CORS configuration
const allowedOrigins = (process.env.CORS_ORIGIN || 'http://localhost:5173')
    .split(',')
    .map(origin => origin.trim());

app.use(cors({
    origin: (origin, callback) => {
        // Allow requests with no origin (mobile apps, Postman, etc.)
        if (!origin) return callback(null, true);

        if (allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true
}));

app.use(express.json({ limit: '10mb' }));

// Routes
app.use('/api/language', languageRoutes);      // Language info and switching
app.use('/api/cultural', culturalRoutes);      // Cultural profiles
app.use('/api/calls', callsRoutes);           // Call analysis
app.use('/api/voice', voiceRoutes);           // Voice roleplay
app.use('/api/analytics', analyticsRoutes);   // Analytics
app.use('/api/profiles', profilesRoutes);     // User profiles
app.use('/api/chat', chatRoutes);             // Advisor Chat

// Health check endpoint
app.get('/api/health', (_req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        version: '0.1.0',
        services: {
            supabase: !!process.env.SUPABASE_URL,
            gemini: !!process.env.GEMINI_API_KEY,
            livekit: !!process.env.LIVEKIT_API_KEY,
            lingoDev: !!process.env.LINGO_DEV_API_KEY,
        }
    });
});

// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, _next: express.NextFunction) => {
    console.error('Error:', err.message);
    const message = process.env.NODE_ENV === 'production'
        ? 'Internal server error'
        : err.message;

    res.status(500).json({
        success: false,
        error: {
            code: 'INTERNAL_ERROR',
            message
        }
    });
});

app.listen(PORT, () => {
    console.log(`🚀 LingoPitch backend running on http://localhost:${PORT}`);
    console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
});
