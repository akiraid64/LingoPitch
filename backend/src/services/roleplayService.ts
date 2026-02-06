import { GoogleGenerativeAI } from '@google/generative-ai';
import { supabaseAdmin } from '../lib/supabase.js';
import type { LanguageVariant } from '../config/languages.js';

const PROMPT_GENERATOR_TEMPLATE = `You are a world-class actor and roleplay expert specializing in B2B sales psychology.
You are playing the role of a potential customer, NOT the salesperson.
Your goal is to provide a realistic, tough, and culturally nuanced roleplay.

**YOUR PERSONA (THE SOURCE OF TRUTH):**
{{org_scenario}}

**YOUR IDENTITY IN THIS CALL:**
- Name: {{persona_name}}
- Region/Target Market: {{nativeName}}
- Regional Accent: {{accent}}
- Language: {{language}}
- Conversation Context: You are a cold lead on a busy day.

**CULTURAL & BEHAVIORAL HARDENING:**
1. **AUTHENTICITY:** Use {{accent}} expressions, local idioms, and regional sentence structures.
2. **BEHAVIORAL RIGOR:**
   - **Directness:** Follow {{nativeName}} norms for directness (e.g., US is blunt/ROI-focused, UK is polite but skeptical).
   - **Decision Making:** Use the decision-making style defined in your persona (Analytical, Emotional, Bureaucratic, etc.).
3. **TABOOS:** Strictly avoid topics considered inappropriate in {{nativeName}} business culture.
4. **ANTI-ASSISTANT MENTALITY:**
   - NEVER ask "How can I help you?".
   - NEVER say "Is there anything else?".
   - Initially act as a "Gatekeeper": suspicious, busy, and questioning the salesperson's value.

**OUTPUT DIRECTIVE:**
Generate a comprehensive system prompt for a voice agent (ElevenLabs/Cartesia).
The prompt must instruct the agent to COMPLETELY EMBODY this persona.
Include instructions on tone, pacing, and specific cultural quirks.
Return ONLY the final prompt text.`;

interface GeneratePromptParams {
    languageCode: string;
    langInfo: LanguageVariant;
    productDescription?: string;
    orgId?: string;
}

export async function generateRoleplayPrompt({ languageCode, langInfo, productDescription, orgId }: GeneratePromptParams): Promise<string> {
    console.log(`[ROLEPLAY] 🌍 Generating prompt for: ${languageCode} (Org: ${orgId || 'None'})`);
    console.log(`[ROLEPLAY] 📍 Region: ${langInfo.accent}`);

    // Check cache first
    let cached = null;
    let cacheError = null;

    try {
        if (orgId) {
            const result = await (supabaseAdmin
                .from('roleplay_prompts') as any)
                .select('*')
                .eq('language_code', languageCode)
                .eq('org_id', orgId)
                .single();
            cached = result.data;
            cacheError = result.error;
        } else {
            const result = await (supabaseAdmin
                .from('roleplay_prompts') as any)
                .select('*')
                .eq('language_code', languageCode)
                .single();
            cached = result.data;
            cacheError = result.error;
        }
    } catch (e) {
        console.warn(`[ROLEPLAY] ⚠️ Cache lookup failed (possibly missing org_id column):`, e);
    }

    // Use cache if we found it and there are no critical errors
    if (cached && !cacheError && !productDescription) {
        console.log(`[ROLEPLAY] ✅ Using cached prompt for Org: ${orgId || 'Global'}`);
        return cached.generated_prompt;
    }

    // 1. Fetch Organization Scenario if available
    let orgScenario = productDescription || 'A busy business owner facing inventory issues.';
    if (orgId) {
        const { data: orgData } = await (supabaseAdmin
            .from('organizations') as any)
            .select('roleplay_scenario, name')
            .eq('id', orgId)
            .single();

        if (orgData?.roleplay_scenario) {
            console.log(`[ROLEPLAY] 📋 Using persistent Org Scenario (Length: ${orgData.roleplay_scenario.length})`);
            console.log(`[ROLEPLAY] 📋 Scenario Preview: ${orgData.roleplay_scenario.substring(0, 100)}...`);
            orgScenario = orgData.roleplay_scenario;
        } else {
            console.log('[ROLEPLAY] ⚠️ Org found but no roleplay_scenario, using default/productDescription');
        }
    } else {
        console.log('[ROLEPLAY] ℹ️ No Org ID provided, using global default');
    }

    console.log(`[ROLEPLAY] 🤖 Calling Gemini 2.5 Flash to generate prompt...`);
    console.log(`[ROLEPLAY] 🔍 Input Scenario for Generation: "${orgScenario.substring(0, 50)}..."`);

    // Generate with Gemini
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });


    const personaNames: Record<string, string[]> = {
        'en-US': ['Alex Miller', 'Jordan Smith', 'Taylor Reed', 'Casey Taylor'],
        'en-GB': ['Oliver Wright', 'Charlotte Evans', 'James Harrison'],
        'fr-FR': ['Lucas Bernard', 'Chloé Dubois', 'Julien Moreau'],
        'es-ES': ['Mateo García', 'Elena Rodríguez', 'Diego López'],
        'de-DE': ['Maximilian Schmidt', 'Lukas Weber', 'Julia Hoffmann']
    };

    const possibleNames = personaNames[languageCode] || ['Sam Rivera', 'Jamie Vance'];
    const personaName = possibleNames[Math.floor(Math.random() * possibleNames.length)];

    const prompt = PROMPT_GENERATOR_TEMPLATE
        .replace('{{language}}', langInfo.language)
        .replace('{{nativeName}}', langInfo.nativeName)
        .replace('{{accent}}', langInfo.accent)
        .replace('{{code}}', langInfo.code)
        .replace('{{persona_name}}', personaName)
        .replace('{{org_scenario}}', orgScenario || "A skeptical potential customer interested in your product.");


    const result = await model.generateContent(prompt);
    const generatedPrompt = result.response.text();

    console.log(`[ROLEPLAY] ✨ Generated prompt (${generatedPrompt.length} chars)`);
    console.log(`[ROLEPLAY] 📝 Preview: ${generatedPrompt.substring(0, 200)}...`);


    // Save to cache (upsert to handle updates)
    try {
        const upsertData: any = {
            language_code: languageCode,
            generated_prompt: generatedPrompt,
            playbook_version: 'v1.1',
            updated_at: new Date().toISOString()
        };

        if (orgId) {
            upsertData.org_id = orgId;
        }

        try {
            const { error: upsertError } = await (supabaseAdmin
                .from('roleplay_prompts') as any)
                .upsert(upsertData, {
                    onConflict: orgId ? ['org_id', 'language_code'] : 'language_code'
                });

            if (upsertError) {
                console.error(`[ROLEPLAY] ⚠️ Failed to cache prompt (check if org_id column/unique constraint exists):`, upsertError.message);
            } else {
                console.log(`[ROLEPLAY] 💾 Cached for future use`);
            }
        } catch (upsertErr: any) {
            console.warn(`[ROLEPLAY] ⚠️ Unexpected error during cache upsert (skipping cache):`, upsertErr.message);
        }
    } catch (e) {
        console.warn(`[ROLEPLAY] ⚠️ Cache save failed:`, e);
    }

    return generatedPrompt;
}

export async function getPlaybookContent(): Promise<string> {
    // Playbook is now handled via org_scenario or separated entirely.
    return "DEPRECATED: Using organization-specific dynamic scenarios instead.";
}
