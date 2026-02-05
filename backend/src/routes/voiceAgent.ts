import express, { Request, Response } from 'express';

const router = express.Router();

const PYTHON_AGENT_URL = process.env.PYTHON_AGENT_URL || 'http://localhost:8001';

/**
 * Proxy endpoint to start a voice session with Python Cartesia agent
 * 
 * Flow:
 * 1. Frontend calls this endpoint
 * 2. This proxies to Python HTTP bridge (server.py)
 * 3. Python bridge fetches Gemini prompt from roleplayService
 * 4. Returns WebSocket URL for frontend to connect
 */
router.post('/start-session', async (req: Request, res: Response) => {
    console.log(`[VOICE-PROXY] Starting voice session for user: ${req.body.user_id}`);
    console.log(`[VOICE-PROXY] Language: ${req.body.language_code}`);

    try {
        const response = await fetch(`${PYTHON_AGENT_URL}/api/voice/start-session`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                language_code: req.body.language_code || 'en',
                user_id: req.body.user_id || 'anonymous',
                playbook: req.body.playbook || 'B2B SaaS Sales'
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`[VOICE-PROXY] Python agent error: ${errorText}`);
            throw new Error(`Python agent returned ${response.status}: ${errorText}`);
        }

        const data = await response.json() as {
            agent_id: string;
            websocket_url: string;
            system_prompt: string;
            metadata: Record<string, unknown>;
        };
        console.log(`[VOICE-PROXY] ✅ Session created: ${data.agent_id}`);
        console.log(`[VOICE-PROXY] WebSocket URL: ${data.websocket_url}`);

        res.json(data);
    } catch (error) {
        console.error(`[VOICE-PROXY] ❌ Failed to start voice session:`, error);
        res.status(500).json({
            error: 'Failed to start voice session',
            details: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});

/**
 * Health check endpoint
 */
router.get('/health', async (req: Request, res: Response) => {
    try {
        const response = await fetch(`${PYTHON_AGENT_URL}/health`);
        const data = await response.json() as { status: string };

        res.json({
            typescript_backend: 'ok',
            python_agent: data.status,
            connection: 'ok'
        });
    } catch (error) {
        res.status(503).json({
            typescript_backend: 'ok',
            python_agent: 'unreachable',
            connection: 'failed',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});

export default router;
