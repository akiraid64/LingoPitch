import { Router } from 'express';
import { supabaseAdmin } from '../lib/supabase.js';

const router = Router();

// Get user profile
router.get('/:userId', async (req, res) => {
    try {
        const { userId } = req.params;

        const { data: profile, error } = await supabaseAdmin
            .from('user_profiles')
            .select('*')
            .eq('user_id', userId)
            .single();

        if (error && error.code !== 'PGRST116') { // PGRST116 = not found
            throw error;
        }

        if (!profile) {
            return res.status(404).json({
                success: false,
                error: { message: 'Profile not found' }
            });
        }

        res.json({
            success: true,
            profile
        });
    } catch (error) {
        console.error('Error fetching profile:', error);
        res.status(500).json({
            success: false,
            error: { message: 'Failed to fetch profile' }
        });
    }
});

// Create or update user profile
router.post('/', async (req, res) => {
    try {
        const { user_id, full_name, company, role, target_languages } = req.body;

        if (!user_id || !full_name) {
            return res.status(400).json({
                success: false,
                error: { message: 'user_id and full_name are required' }
            });
        }

        // Check if profile exists
        const { data: existing } = await supabaseAdmin
            .from('user_profiles')
            .select('id')
            .eq('user_id', user_id)
            .single();

        let profile;
        if (existing) {
            // Update existing profile
            const { data, error } = await supabaseAdmin
                .from('user_profiles')
                .update({
                    full_name,
                    company: company || null,
                    role: role || null,
                    target_languages: target_languages || []
                })
                .eq('user_id', user_id)
                .select()
                .single();

            if (error) throw error;
            profile = data;
        } else {
            // Create new profile
            const { data, error } = await supabaseAdmin
                .from('user_profiles')
                .insert({
                    user_id,
                    full_name,
                    company: company || null,
                    role: role || null,
                    target_languages: target_languages || [],
                    practice_count: 0,
                    average_score: 0,
                    cultural_iq: 0
                })
                .select()
                .single();

            if (error) throw error;
            profile = data;
        }

        res.json({
            success: true,
            profile
        });
    } catch (error) {
        console.error('Error saving profile:', error);
        res.status(500).json({
            success: false,
            error: { message: 'Failed to save profile' }
        });
    }
});

// Update profile stats (called after each practice session)
router.patch('/:userId/stats', async (req, res) => {
    try {
        const { userId } = req.params;
        const { practice_count, average_score, cultural_iq } = req.body;

        const updateData: any = {};
        if (practice_count !== undefined) updateData.practice_count = practice_count;
        if (average_score !== undefined) updateData.average_score = average_score;
        if (cultural_iq !== undefined) updateData.cultural_iq = cultural_iq;

        const { data: profile, error } = await supabaseAdmin
            .from('user_profiles')
            .update(updateData)
            .eq('user_id', userId)
            .select()
            .single();

        if (error) throw error;

        res.json({
            success: true,
            profile
        });
    } catch (error) {
        console.error('Error updating stats:', error);
        res.status(500).json({
            success: false,
            error: { message: 'Failed to update profile stats' }
        });
    }
});

export default router;
