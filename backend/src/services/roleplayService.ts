import { GoogleGenerativeAI } from '@google/generative-ai';
import { supabaseAdmin } from '../lib/supabase.js';
import type { LanguageVariant } from '../config/languages.js';

const PROMPT_GENERATOR_TEMPLATE = `You are a world-class actor and roleplay expert.
You are playing the role of a potential customer, NOT the salesperson.
Your goal is to provide a realistic sales roleplay scenario for the user (who is the salesperson).

**YOUR ROLE:**
- Name: [Invent a local name based on region]
- Region: {{nativeName}} ({{accent}} accent)
- Language: {{language}}
- Context: You are a cold lead. You did NOT ask for this call.

**YOUR PROBLEM (THE REASON FOR THE SALES OPPORTUNITY):**
- Based on the product description below, invent a specific, realistic PAIN POINT or BUSINESS PROBLEM that this person is facing.
- You are frustrated or stressed by this problem, but you do not yet know the user's product is the solution.
- You should mention symptoms of this problem naturally during the conversation.

**CRITICAL INSTRUCTIONS:**
1. **START:** You must WAIT for the user to speak first. If there is silence, say "Hello? Who is this?" with suspicion.
2. **ANTI-ASSISTANT:** You are NOT a helpful AI. You are a busy person with a problem.
   - NEVER ask "How can I help you?".
   - NEVER say "Is there anything else?".
   - If the user asks "What can I do for you?", reply: "You called me! Who are you?".
3. **TONE:** Skeptical, busy, slightly annoyed initially.
4. **KNOWLEDGE:** You know NOTHING about the user's company unless told.
5. **CULTURAL AUTHENTICITY:**
   - Use authentic {{accent}} expressions and sentence structures.
   - Follow typical {{nativeName}} business etiquette (e.g. directness vs politeness).
   - If the region is high-context, be indirect. If low-context, be direct.

**PRODUCT CONTEXT (What the user is selling):**
{{product_description}}

**SCENARIO:**
{{playbook_content}}

**OUTPUT DIRECTIVE:**
Generate a system prompt for an ElevenLabs/Cartesia agent that embodies this specific persona.
The prompt should instruct the agent to BE this person completely.
Return ONLY the prompt text.`;

interface GeneratePromptParams {
    languageCode: string;
    langInfo: LanguageVariant;
    playbook: string;
    productDescription?: string;
}

export async function generateRoleplayPrompt({ languageCode, langInfo, playbook, productDescription }: GeneratePromptParams): Promise<string> {
    console.log(`[ROLEPLAY] 🌍 Generating prompt for: ${languageCode}`);
    console.log(`[ROLEPLAY] 📍 Region: ${langInfo.accent}`);

    // Check cache first (todo: add productDescription dependency to cache key)
    const { data: cached, error: cacheError } = await supabaseAdmin
        .from('roleplay_prompts')
        .select('*')
        .eq('language_code', languageCode)
        .single() as any;

    // For now, bypass cache if we have custom product description to ensure freshness
    // This allows the user to update their settings and immediately see effects.
    if (cached && !cacheError && !productDescription) {
        console.log(`[ROLEPLAY] ✅ Using cached prompt`);
        return cached.generated_prompt;
    } else if (cached && !cacheError && productDescription) {
        console.log(`[ROLEPLAY] ⚠️ Bypassing cache to include custom product context.`);
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
        .replace('{{company_name}}', 'Lingo.dev') // Could be dynamic
        .replace('{{product_description}}', productDescription || 'A generic B2B software product')
        .replace('{{playbook_content}}', playbook);

    const result = await model.generateContent(prompt);
    const generatedPrompt = result.response.text();

    console.log(`[ROLEPLAY] ✨ Generated prompt (${generatedPrompt.length} chars)`);
    console.log(`[ROLEPLAY] 📝 Preview: ${generatedPrompt.substring(0, 200)}...`);
    console.log(`[ROLEPLAY] 📄 FULL PROMPT:\n${generatedPrompt}\n`);


    // Save to cache (upsert to handle updates)
    // Save to cache (upsert to handle updates)
    const { error: upsertError } = await (supabaseAdmin
        .from('roleplay_prompts') as any)
        .upsert({
            language_code: languageCode,
            generated_prompt: generatedPrompt,
            playbook_version: 'v1.1', // Incremented to invalidate cache for new persona
            updated_at: new Date().toISOString()
        }, {
            onConflict: 'language_code'
        });

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
