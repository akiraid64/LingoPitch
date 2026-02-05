import { Router } from 'express';
import { chatWithTeamData } from '../services/chatService.js';
import { supabaseAdmin } from '../lib/supabase.js';
import { translateText } from '../services/translationService.js';
import { getLanguageByCode } from '../config/languages.js';

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
        const { message, conversationHistory, targetLocale } = req.body;
        const profile = req.profile;

        if (!profile.org_id) {
            return res.status(400).json({ success: false, error: 'User has no organization' });
        }

        let result = await chatWithTeamData(
            profile.org_id,
            profile.id,
            profile.role,
            message,
            conversationHistory
        );

        // If targetLocale is provided and not English, translate the response
        if (targetLocale && !targetLocale.startsWith('en')) {
            try {
                const langConfig = getLanguageByCode(targetLocale);
                const lingoDotDevCode = langConfig?.lingoDotDevCode || targetLocale.split('-')[0];

                console.log(`🌐 Translating response to ${targetLocale} (${lingoDotDevCode})`);

                const translatedResponse = await translateText(
                    result.response,
                    'en', // Source is always English from AI
                    lingoDotDevCode
                );

                result = {
                    ...result,
                    response: translatedResponse,
                } as any;
            } catch (translateError) {
                console.error('Translation failed, returning original:', translateError);
                // Continue with original response if translation fails
            }
        }

        res.json({ success: true, data: result });
    } catch (error: any) {
        console.error('Chat route error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

export default router;
