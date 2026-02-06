import { GoogleGenerativeAI } from '@google/generative-ai';
import { supabaseAdmin } from '../lib/supabase.js';

const SCENARIO_CRAFTER_TEMPLATE = `You are a sales psychology and cultural intelligence expert. 
Your task is to take a product description and turn it into a specific, high-stakes roleplay persona for an AI voice agent.

**GOAL:** Create a "Hardened Customer" persona with deep cultural and professional baggage.

**PRODUCT DESCRIPTION:** 
{{product_description}}

**YOUR OUTPUT MUST BE A DETAILED PERSONA PROFILE CONTAINING:**
1. **The Core Pain Point:** A specific, urgent business problem they are facing.
2. **Personality & Vibe:** Their professional role, mood, and personality (e.g., "Pragmatic and skeptical VP").
3. **Cultural Behaviors**: 
   - Communication style (Direct vs Indirect).
   - Business etiquette norms for their region.
   - Pacing and linguistic quirks.
4. **Decision-making & ROI**: How they evaluate value and what data they need.
5. **Cultural Taboos**: 3-4 specific things the salesperson should NEVER do or say in this context.
6. **Specific Objections**: 2-3 tough questions they will definitely ask.

Keep the tone realistic, professional, and slightly irritable. Use the provided product description as the business context.
Return ONLY the formatted profile text, no introduction or conclusion.`;

/**
 * Recrafts an organization's roleplay scenario based on their product description.
 * This is triggered whenever a manager updates settings.
 */
export async function recraftOrganizationScenario(orgId: string, productDescription: string): Promise<string> {
    console.log(`[SCENARIO] 🛠️ --- START: recraftOrganizationScenario for Org: ${orgId} ---`);
    console.log(`[SCENARIO] 📝 Description Preview: "${productDescription.substring(0, 50)}..."`);

    try {
        // 1. Generate new scenario with Gemini
        console.log('[SCENARIO] 🤖 Initializing Gemini...');
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            console.error('[SCENARIO] ❌ MISSING GEMINI_API_KEY');
            throw new Error('GEMINI_API_KEY is not configured on the server');
        }

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });


        const prompt = SCENARIO_CRAFTER_TEMPLATE.replace('{{product_description}}', productDescription);
        console.log('[SCENARIO] 📤 Sending prompt to Gemini...');

        const result = await model.generateContent(prompt);
        const generatedScenario = result.response.text();

        if (!generatedScenario) {
            console.error('[SCENARIO] ❌ Gemini returned empty content');
            throw new Error('Gemini failed to generate scenario');
        }

        console.log(`[SCENARIO] ✨ New scenario generated (${generatedScenario.length} chars)`);
        console.log(`[SCENARIO] 📄 Preview: ${generatedScenario.substring(0, 100)}...`);

        // 2. Save to organization record
        console.log('[SCENARIO] 💾 Updating organization record in Supabase...');
        const { data, error } = await (supabaseAdmin
            .from('organizations') as any)
            .update({
                roleplay_scenario: generatedScenario,
                product_description: productDescription
            })
            .eq('id', orgId)
            .select();

        if (error) {
            console.error('[SCENARIO] ❌ Supabase Update Error:', error);
            throw error;
        }

        console.log('[SCENARIO] ✅ Supabase update successful. Rows affected:', data?.length);

        // 3. Invalidate prompt cache for this ORG
        console.log(`[SCENARIO] 🗑️ Clearing prompt cache for Org: ${orgId}...`);
        const { error: deleteError } = await (supabaseAdmin
            .from('roleplay_prompts') as any)
            .delete()
            .eq('org_id', orgId);

        if (deleteError) {
            console.warn('[SCENARIO] ⚠️ Failed to clear prompt cache (non-critical):', deleteError.message);
        } else {
            console.log('[SCENARIO] ✅ Cache cleared successfully.');
        }

        console.log(`[SCENARIO] 🏁 --- END: recraftOrganizationScenario SUCCESS ---`);


        return generatedScenario;
    } catch (err) {
        console.error('[SCENARIO] ❌ CRITICAL FAILURE:', err);
        throw err;
    }
}
