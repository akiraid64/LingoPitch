import { Router } from 'express';
import { supabaseAdmin } from '../lib/supabase.js';

const router = Router();

// Track analytics event
router.post('/', async (req, res) => {
    try {
        const { user_id, event_type, event_data } = req.body;

        if (!event_type) {
            return res.status(400).json({
                success: false,
                error: { message: 'event_type is required' }
            });
        }

        const { data: event, error } = await supabaseAdmin
            .from('analytics_events')
            .insert({
                user_id: user_id || 'anonymous',
                event_type,
                event_data: event_data || {}
            })
            .select()
            .single();

        if (error) throw error;

        res.json({
            success: true,
            event
        });
    } catch (error) {
        console.error('Error tracking event:', error);
        res.status(500).json({
            success: false,
            error: { message: 'Failed to track event' }
        });
    }
});

// Get analytics for a user
router.get('/user/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const { event_type, limit = 100 } = req.query;

        let query = supabaseAdmin
            .from('analytics_events')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
            .limit(Number(limit));

        if (event_type) {
            query = query.eq('event_type', event_type);
        }

        const { data: events, error } = await query;

        if (error) throw error;

        res.json({
            success: true,
            events,
            count: events?.length || 0
        });
    } catch (error) {
        console.error('Error fetching analytics:', error);
        res.status(500).json({
            success: false,
            error: { message: 'Failed to fetch analytics' }
        });
    }
});

export default router;
