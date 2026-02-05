import { GoogleGenerativeAI } from '@google/generative-ai';
import { supabaseAdmin } from '../lib/supabase.js';
import type { LanguageVariant } from '../config/languages.js';

const PROMPT_GENERATOR_TEMPLATE = `You are an expert in international sales training and cultural intelligence.

Generate a detailed ElevenLabs Conversational AI system prompt for a sales roleplay customer with these specs:

LANGUAGE: {{language}} ({{nativeName}})
ACCENT/REGION: {{accent}} ({{code}})
PLAYBOOK CONTEXT:
{{playbook_content}}

Your generated prompt MUST include:
1. **Identity**: "You are a potential customer in [Region]..."
2. **Language Directive**: "You speak [Language] with a [Accent] accent. Use authentic regional expressions and pronunciation."
3. **Cultural Behaviors**: 
   - Communication style (direct/indirect)
   - Business etiquette norms
   - Appropriate greetings
   - Decision-making approach
   - Negotiation style
4. **Cultural Taboos**: 3-5 specific things to avoid in this culture
5. **Personality**: Based on typical [Region] customer archetype
6. **Product Knowledge**: Align difficulty with playbook

OUTPUT FORMAT: Return ONLY the system prompt text (no markdown, no explanations, no meta-commentary).`;

interface GeneratePromptParams {
    languageCode: string;
    langInfo: LanguageVariant;
    playbook: string;
}

export async function generateRoleplayPrompt({ languageCode, langInfo, playbook }: GeneratePromptParams): Promise<string> {
    console.log(`[ROLEPLAY] 🌍 Generating prompt for: ${languageCode}`);
    console.log(`[ROLEPLAY] 📍 Region: ${langInfo.accent}`);

    // Check cache first
    const { data: cached, error: cacheError } = await supabaseAdmin
        .from('roleplay_prompts')
        .select('*')
        .eq('language_code', languageCode)
        .single() as any; // Type assertion until DB types regenerate

    if (cached && !cacheError) {
        console.log(`[ROLEPLAY] ✅ Using cached prompt`);
        return cached.generated_prompt;
    }

    console.log(`[ROLEPLAY] 📖 Playbook loaded (${playbook.length} chars)`);
    console.log(`[ROLEPLAY] 🤖 Calling Gemini 2.5 Flash to generate prompt...`);

    // Generate with Gemini
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const prompt = PROMPT_GENERATOR_TEMPLATE
        .replace('{{language}}', langInfo.language)
        .replace('{{nativeName}}', langInfo.nativeName)
        .replace('{{accent}}', langInfo.accent)
        .replace('{{code}}', langInfo.code)
        .replace('{{playbook_content}}', playbook);

    const result = await model.generateContent(prompt);
    const generatedPrompt = result.response.text();

    console.log(`[ROLEPLAY] ✨ Generated prompt (${generatedPrompt.length} chars)`);
    console.log(`[ROLEPLAY] 📝 Preview: ${generatedPrompt.substring(0, 200)}...`);
    console.log(`[ROLEPLAY] 📄 FULL PROMPT:\n${generatedPrompt}\n`);


    // Save to cache (upsert to handle updates)
    const { error: upsertError } = await (supabaseAdmin
        .from('roleplay_prompts')
        .upsert({
            language_code: languageCode,
            generated_prompt: generatedPrompt,
            playbook_version: 'v1.0', // TODO: Make dynamic
            updated_at: new Date().toISOString()
        }, {
            onConflict: 'language_code'
        }) as any); // Type assertion until DB types regenerate

    if (upsertError) {
        console.error(`[ROLEPLAY] ⚠️ Failed to cache prompt:`, upsertError);
    } else {
        console.log(`[ROLEPLAY] 💾 Cached for future use`);
    }

    return generatedPrompt;
}

export async function getPlaybookContent(): Promise<string> {
    // TODO: Replace with actual playbook from database
    return `Product: Lingo.dev - AI-powered sales training platform
    
Target Market: B2B SaaS sales teams
Price Point: $49-199 per user/month

Key Features:
- AI roleplay with cultural intelligence
- Real-time feedback on sales calls
- 24 language variants with authentic accents
- Integration with CRM systems

Value Proposition: 
Train your sales team to sell globally with AI-powered cultural intelligence.`;
}
