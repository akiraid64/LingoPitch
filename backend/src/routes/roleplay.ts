import { Router, Request, Response } from 'express';
import { generateRoleplayPrompt } from '../services/roleplayService.js';
import { getLanguageByCode } from '../config/languages.js';

const router = Router();

/**
 * POST /api/roleplay/generate-prompt
 * Generate a culturally-aware ElevenLabs prompt for a specific language
 */
router.post('/generate-prompt', async (req: Request, res: Response) => {
    try {
        const { languageCode, productDescription, orgId } = req.body;

        if (!languageCode) {
            return res.status(400).json({ error: 'languageCode is required' });
        }

        console.log(`[ROLEPLAY API] 🌍 Request for language: ${languageCode}`);

        // Get language info
        const langInfo = getLanguageByCode(languageCode);
        if (!langInfo) {
            console.error(`[ROLEPLAY API] ❌ Invalid language code: ${languageCode}`);
            return res.status(404).json({ error: 'Language not found' });
        }

        // Generate prompt (will use cache if available)
        const prompt = await generateRoleplayPrompt({
            languageCode,
            langInfo,
            productDescription,
            orgId
        });

        console.log(`[ROLEPLAY API] ✅ Prompt ready (${prompt.length} chars)`);

        return res.json({ prompt });
    } catch (error) {
        console.error('[ROLEPLAY API] ❌ Error:', error);
        return res.status(500).json({
            error: 'Failed to generate prompt',
            details: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});

/**
 * GET /api/roleplay/prompt/:languageCode
 * Retrieve cached prompt for a language
 */
router.get('/prompt/:languageCode', async (req: Request, res: Response) => {
    try {
        const languageCode = req.params.languageCode as string;
        const orgId = req.query.orgId as string;

        console.log(`[ROLEPLAY API] 📖 Fetching cached prompt for: ${languageCode} (Org: ${orgId})`);

        const langInfo = getLanguageByCode(languageCode);
        if (!langInfo) {
            return res.status(404).json({ error: 'Language not found' });
        }

        const prompt = await generateRoleplayPrompt({
            languageCode: languageCode as string,
            langInfo,
            orgId
        });


        return res.json({ prompt });
    } catch (error) {
        console.error('[ROLEPLAY API] ❌ Error:', error);
        return res.status(500).json({
            error: 'Failed to retrieve prompt',
            details: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});

export default router;
