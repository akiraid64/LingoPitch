import express, { Request, Response } from 'express';
import { supabaseAdmin } from '../lib/supabase.js';

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
                org_id: req.body.org_id || req.body.orgId,
                playbook: req.body.playbook || 'B2B SaaS Sales',
                product_description: req.body.product_description,
                system_prompt: req.body.system_prompt // PASS IT THROUGH
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

// Configure Multer for memory storage (process audio in memory)
import multer from 'multer';
import { GoogleGenerativeAI } from '@google/generative-ai';

const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

/**
 * End voice session and save transcript (Audio -> Gemini -> DB)
 */
router.post('/end-session', upload.single('audio'), async (req: Request, res: Response) => {
    // console.log(`[VOICE-PROXY] Ending session for user: ${req.body.user_id}`);

    // Note: multer processes the file first, so req.body is populated
    const { user_id, duration_seconds, started_at, ended_at, agent_id, product_description, language_code } = req.body;

    if (!user_id) {
        return res.status(400).json({ error: 'Missing required fields (user_id)' });
    }

    if (!req.file) {
        console.error('[VOICE-PROXY] ❌ No audio file received.');
        // Fallback or error? For now, error as this is the new main flow.
        return res.status(400).json({ error: 'No audio recording file provided.' });
    }

    try {
        console.log(`[VOICE-PROXY] 🎤 Received audio file: ${req.file.size} bytes`);

        // Initialize Gemini
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
        // Using gemini-2.5-flash as confirmed available
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        // Convert buffer to base64 for Gemini
        const audioBase64 = req.file.buffer.toString('base64');

        const prompt = `
        You are an expert transcriber. 
        I am sending you an audio recording of a roleplay session between a User (salesperson) and an AI Customer (you).
        
        The product being discussed is: "${product_description || 'Unknown Product'}".
        
        Please provide a highly accurate transcript of the conversation with timestamps.
        - Identify the speakers as "User" and "Customer".
        - The user is the one initiating the sales pitch.
        - The "Customer" is the skeptical/busy persona.
        
        Format the output as follows for each turn:
        [MM:SS] Speaker: <text>
        
        Example:
        [00:00] User: Hi, thanks for taking my call.
        [00:04] Customer: Who is this? I'm in a hurry.
        
        Do not add any other text, just the transcript.
        `;

        console.log('[VOICE-PROXY] 🤖 Sending audio to Gemini for transcription...');
        const result = await model.generateContent([
            prompt,
            {
                inlineData: {
                    mimeType: "audio/webm", // assuming webm from MediaRecorder
                    data: audioBase64
                }
            }
        ]);

        const generatedTranscript = result.response.text();
        console.log('[VOICE-PROXY] ✅ Transcript generated.');
        // console.log(generatedTranscript.substring(0, 100) + '...');

        // Save to Database
        const supabase = supabaseAdmin;

        // 1. Get Org ID
        const { data: profile } = await supabase.from('profiles').select('org_id').eq('id', user_id).single() as any;
        const org_id = profile?.org_id;

        if (!org_id) throw new Error('User has no organization');

        // 2. Create Call Record (so it shows in History)
        const { data: callData, error: callError } = await supabase
            .from('calls')
            .insert({
                org_id,
                user_id,
                title: `Roleplay Session - ${product_description ? product_description.substring(0, 20) + '...' : 'General'}`,
                customer_name: 'AI Roleplay Agent',
                duration_seconds: parseInt(duration_seconds as string) || 0,
                status: 'completed'
            } as any)
            .select()
            .single() as any;

        if (callError) {
            console.error('[VOICE-PROXY] ❌ Failed to create call record:', callError);
            throw callError;
        }
        const call_id = callData.id;

        // 3. Create Voice Session Record
        const { data, error } = await supabase
            .from('voice_sessions')
            .insert({
                user_id,
                org_id,
                call_id, // Link to the call we just created
                transcript: generatedTranscript,
                duration_seconds: parseInt(duration_seconds as string) || 0,
                started_at: started_at || new Date().toISOString(),
                ended_at: ended_at || new Date().toISOString(),
                status: 'completed',
                scenario_type: 'discovery', // matched to DB constraint (cold_call, discovery, objection_handling, closing)
                livekit_room_name: `gemini_audio_${Date.now()}` // Pseudo-room name
            } as any)
            .select()
            .single() as any;

        if (error) {
            console.error('[VOICE-PROXY] ❌ Failed to create voice session:', error);
            throw error;
        }

        console.log(`[VOICE-PROXY] ✅ Session saved: ${data.id} (Linked Call: ${call_id})`);

        // Trigger Analysis
        import('../services/analysisService.js').then(({ analyzeSession }) => {
            analyzeSession({
                sessionId: data.id,
                callId: call_id, // Pass callId for score saving
                transcript: generatedTranscript,
                productDescription: product_description,
                languageCode: language_code || 'en'
            }).catch(err => console.error('Background analysis failed:', err));
        });

        res.json({ success: true, session_id: data.id, transcript: generatedTranscript });

    } catch (error: any) {
        console.error(`[VOICE-PROXY] ❌ Failed to process session:`, error);
        // Log the full error object if possible
        if (error.response) {
            console.error('[VOICE-PROXY] Response data:', error.response.data);
            console.error('[VOICE-PROXY] Response status:', error.response.status);
        }
        res.status(500).json({
            error: 'Failed to process session',
            details: error.message || 'Unknown error',
            full_error: JSON.stringify(error)
        });
    }
});



export default router;
