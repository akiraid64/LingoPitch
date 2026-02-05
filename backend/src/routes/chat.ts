import { Router } from 'express';
import { chatWithTeamData } from '../services/chatService.js';
import { supabaseAdmin } from '../lib/supabase.js';

const router = Router();

// Middleware to get user from Supabase token
// We duplicate this simple logic here or import it if you have an auth middleware file
const requireAuth = async (req: any, res: any, next: any) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).json({ success: false, error: 'No authorization header' });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);

    if (error || !user) {
        return res.status(401).json({ success: false, error: 'Invalid token' });
    }

    // Get profile
    const { data: profile } = await supabaseAdmin
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

    if (!profile) {
        return res.status(401).json({ success: false, error: 'Profile not found' });
    }

    req.user = user;
    req.profile = profile;
    next();
};

router.use(requireAuth);

router.post('/', async (req: any, res) => {
    try {
        const { message, conversationHistory } = req.body;
        const profile = req.profile;

        if (!profile.org_id) {
            return res.status(400).json({ success: false, error: 'User has no organization' });
        }

        const result = await chatWithTeamData(
            profile.org_id,
            profile.id,
            profile.role,
            message,
            conversationHistory
        );

        res.json({ success: true, data: result });
    } catch (error: any) {
        console.error('Chat route error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

export default router;
