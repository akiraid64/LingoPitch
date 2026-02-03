import { Router } from 'express';
import { supabaseAdmin } from '../lib/supabase.js';
import { generateCulturalProfile } from '../services/geminiService.js';

const router = Router();

// Get cultural profile for a language
router.get('/:languageCode', async (req, res) => {
    try {
        const { languageCode } = req.params;

        // First, check if profile exists in database
        const { data: existingProfile, error: fetchError } = await supabaseAdmin
            .from('cultural_profiles')
            .select('*')
            .eq('language_code', languageCode)
            .single();

        if (existingProfile && !fetchError) {
            return res.json({
                success: true,
                profile: existingProfile,
                source: 'database'
            });
        }

        // If not found, generate using Gemini AI
        console.log(`Generating cultural profile for ${languageCode}...`);
        const generatedProfile = await generateCulturalProfile(languageCode);

        // Save to database for future use
        const { data: savedProfile, error: saveError } = await supabaseAdmin
            .from('cultural_profiles')
            .insert(generatedProfile)
            .select()
            .single();

        if (saveError) {
            console.error('Failed to save profile:', saveError);
            // Still return the generated profile even if save fails
            return res.json({
                success: true,
                profile: generatedProfile,
                source: 'generated'
            });
        }

        res.json({
            success: true,
            profile: savedProfile,
            source: 'generated'
        });
    } catch (error) {
        console.error('Error fetching cultural profile:', error);
        res.status(500).json({
            success: false,
            error: { message: 'Failed to fetch cultural profile' }
        });
    }
});

// Get all cultural profiles
router.get('/', async (_req, res) => {
    try {
        const { data: profiles, error } = await supabaseAdmin
            .from('cultural_profiles')
            .select('*')
            .order('language_name');

        if (error) throw error;

        res.json({
            success: true,
            profiles,
            count: profiles?.length || 0
        });
    } catch (error) {
        console.error('Error fetching profiles:', error);
        res.status(500).json({
            success: false,
            error: { message: 'Failed to fetch cultural profiles' }
        });
    }
});

export default router;
