
import { Router, Request, Response } from 'express';
import { supabaseAdmin } from '../lib/supabase.js';
import { recraftOrganizationScenario } from '../services/scenarioService.js';

const router = Router();

/**
 * POST /api/organization/:id/settings
 * Update organization settings and trigger persona recraft
 */
router.post('/:id/settings', async (req: Request, res: Response) => {
    const { id } = req.params;
    console.log(`\n[ORG API] 🚀 --- START: Settings Update for Org: ${id} ---`);
    try {
        const { product_description } = req.body;
        console.log('[ORG API] 📦 Body:', JSON.stringify(req.body));

        if (!product_description) {
            console.warn('[ORG API] ⚠️ Missing product_description');
            return res.status(400).json({ error: 'product_description is required' });
        }

        // 1. Update the description (and trigger recraft)
        console.log('[ORG API] 🛠️ Calling recraftOrganizationScenario...');
        const newScenario = await recraftOrganizationScenario(id as string, product_description);
        console.log('[ORG API] ✅ Recraft complete. Scenario length:', newScenario.length);

        const { data: org, error: fetchError } = await (supabaseAdmin
            .from('organizations') as any)
            .select('*')
            .eq('id', id as string)
            .single();


        if (fetchError) {
            console.error('[ORG API] ❌ Fetch Error:', fetchError);
            throw fetchError;
        }

        console.log('[ORG API] 🎉 Success! Returning updated org.');
        return res.json({
            success: true,
            message: 'Settings updated and persona recrafted!',
            organization: org,
            scenario_preview: newScenario.substring(0, 150) + '...'
        });

    } catch (error: any) {
        console.error('[ORG API] ❌ FATAL ERROR:', error);
        return res.status(500).json({
            error: 'Failed to update organization settings',
            details: error instanceof Error ? error.message : 'Unknown error',
            fullError: error, // EXPOSE THE WHOLE OBJECT
            stack: error instanceof Error ? error.stack : undefined
        });

    } finally {
        console.log(`[ORG API] 🏁 --- END: Settings Update for Org: ${id} ---\n`);
    }
});

export default router;
