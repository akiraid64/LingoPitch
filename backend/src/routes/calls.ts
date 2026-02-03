import { Router } from 'express';
import { supabaseAdmin } from '../lib/supabase.js';
import { analyzeCallTranscript } from '../services/geminiService.js';

const router = Router();

// Create a new call record with analysis
router.post('/', async (req, res) => {
    try {
        const { user_id, language_code, scenario, transcript, duration_seconds } = req.body;

        if (!transcript || !language_code) {
            return res.status(400).json({
                success: false,
                error: { message: 'Transcript and language_code are required' }
            });
        }

        // Fetch cultural profile
        const { data: culturalProfile, error: profileError } = await supabaseAdmin
            .from('cultural_profiles')
            .select('*')
            .eq('language_code', language_code)
            .single();

        if (profileError || !culturalProfile) {
            return res.status(404).json({
                success: false,
                error: { message: 'Cultural profile not found for this language' }
            });
        }

        // Analyze the call
        const analysis = await analyzeCallTranscript(transcript, language_code, culturalProfile);

        // Save to database
        const { data: call, error: saveError } = await supabaseAdmin
            .from('calls')
            .insert({
                user_id: user_id || 'anonymous',
                language_code,
                scenario: scenario || 'General Sales Call',
                transcript,
                analysis,
                scores: analysis.standard_scores || {},
                cultural_scores: analysis.cultural_scores || {},
                duration_seconds: duration_seconds || 0
            })
            .select()
            .single();

        if (saveError) throw saveError;

        res.json({
            success: true,
            call,
            analysis
        });
    } catch (error) {
        console.error('Error creating call:', error);
        res.status(500).json({
            success: false,
            error: { message: 'Failed to create and analyze call' }
        });
    }
});

// Get all calls for a user
router.get('/user/:userId', async (req, res) => {
    try {
        const { userId } = req.params;

        const { data: calls, error } = await supabaseAdmin
            .from('calls')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (error) throw error;

        res.json({
            success: true,
            calls,
            count: calls?.length || 0
        });
    } catch (error) {
        console.error('Error fetching calls:', error);
        res.status(500).json({
            success: false,
            error: { message: 'Failed to fetch calls' }
        });
    }
});

// Get a specific call by ID
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const { data: call, error } = await supabaseAdmin
            .from('calls')
            .select('*')
            .eq('id', id)
            .single();

        if (error || !call) {
            return res.status(404).json({
                success: false,
                error: { message: 'Call not found' }
            });
        }

        res.json({
            success: true,
            call
        });
    } catch (error) {
        console.error('Error fetching call:', error);
        res.status(500).json({
            success: false,
            error: { message: 'Failed to fetch call' }
        });
    }
});

export default router;
