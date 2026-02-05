import { GoogleGenerativeAI } from '@google/generative-ai';
import { supabaseAdmin } from '../lib/supabase.js';

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
    console.warn('GEMINI_API_KEY not set - Chat features will fail');
}

const ai = new GoogleGenerativeAI(apiKey || 'dummy');

/**
 * Load ALL organization data upfront for full context
 */
async function loadFullOrgContext(orgId: string, userId: string, userRole: string) {
    const isRep = userRole === 'rep';

    // 1. Get all team members
    const { data: members } = await supabaseAdmin
        .from('profiles')
        .select('id, full_name, email, role, created_at')
        .eq('org_id', orgId);

    // 2. Get ALL calls with full details
    // Note: We need to be careful with column names matching your schema
    // Your schema has 'calls' and 'call_scores'
    const callQuery = supabaseAdmin
        .from('calls')
        .select(`
            id,
            title,
            customer_name,
            created_at,
            raw_transcript,
            user_id,
            profiles!calls_user_id_fkey (
                full_name,
                email
            ),
            call_scores (
                overall_score,
                sentiment,
                summary,
                executive_summary,
                strengths,
                weaknesses,
                coaching_tips,
                key_takeaways,
                objection_handling,
                closing_technique,
                communication_analysis,
                score_needs_discovery,
                score_value_proposition,
                score_decision_process,
                score_stakeholder_id,
                score_insight_delivery,
                score_objection_handling,
                score_active_listening,
                score_competition,
                score_next_steps,
                score_call_control
            )
        `)
        .eq('org_id', orgId)
        .order('created_at', { ascending: false });

    // Filter to user's own calls if rep
    if (isRep) {
        callQuery.eq('user_id', userId);
    }

    const { data: calls } = await callQuery;

    // 3. Get organization info
    const { data: org } = await supabaseAdmin
        .from('organizations')
        .select('*')
        .eq('id', orgId)
        .single();

    // 4. Get playbooks
    const { data: playbooks } = await supabaseAdmin
        .from('playbook_chunks')
        .select('playbook_name, text_content, created_at')
        .eq('org_id', orgId);

    return {
        members: members || [],
        calls: calls || [],
        organization: org,
        playbooks: playbooks || [],
    };
}

/**
 * Format loaded data into context string
 */
function formatOrgContext(data: any, isRep: boolean) {
    let context = '\n\n=== COMPLETE ORGANIZATION DATA ===\n\n';

    // Team Members
    context += '## Team Members\n';
    if (data.members) {
        data.members.forEach((m: any) => {
            context += `- **${m.full_name || m.email}** (${m.email}) - Role: ${m.role}, Joined: ${new Date(m.created_at).toLocaleDateString()}\n`;
        });
    }

    // Calls with full details
    context += '\n## All Calls\n';
    if (data.calls) {
        data.calls.forEach((call: any) => {
            const score = call.call_scores?.[0];
            const rep = call.profiles?.full_name || call.profiles?.email || 'Unknown Rep';
            const date = new Date(call.created_at).toLocaleDateString();
            const time = new Date(call.created_at).toLocaleTimeString();

            context += `\n### Call: "${call.title || 'Untitled Call'}"\n`;
            context += `- **Rep:** ${rep}\n`;
            context += `- **Date:** ${date} at ${time}\n`;
            context += `- **Customer:** ${call.customer_name || 'N/A'}\n`;

            if (score) {
                context += `- **Overall Score:** ${score.overall_score}/100\n`;
                context += `- **Sentiment:** ${score.sentiment}\n`;
                context += `- **Summary:** ${score.summary}\n`;

                if (score.strengths?.length > 0) {
                    context += `- **Strengths:**\n`;
                    // Handle if it's JSON array or JSONB
                    const strengths = Array.isArray(score.strengths) ? score.strengths : [];
                    strengths.forEach((s: string) => context += `  - ${s}\n`);
                }

                if (score.weaknesses?.length > 0) {
                    context += `- **Weaknesses:**\n`;
                    const weaknesses = Array.isArray(score.weaknesses) ? score.weaknesses : [];
                    weaknesses.forEach((w: string) => context += `  - ${w}\n`);
                }

                if (score.coaching_tips?.length > 0) {
                    context += `- **Coaching Tips:**\n`;
                    const tips = Array.isArray(score.coaching_tips) ? score.coaching_tips : [];
                    tips.forEach((t: string) => context += `  - ${t}\n`);
                }

                // Parameter scores
                context += `- **Parameter Scores:**\n`;
                context += `  - Needs Discovery: ${score.score_needs_discovery || 'N/A'}\n`;
                context += `  - Value Proposition: ${score.score_value_proposition || 'N/A'}\n`;
                context += `  - Decision Process: ${score.score_decision_process || 'N/A'}\n`;
                context += `  - Stakeholder ID: ${score.score_stakeholder_id || 'N/A'}\n`;
                context += `  - Insight Delivery: ${score.score_insight_delivery || 'N/A'}\n`;
                context += `  - Objection Handling: ${score.score_objection_handling || 'N/A'}\n`;
                context += `  - Active Listening: ${score.score_active_listening || 'N/A'}\n`;
                context += `  - Competition: ${score.score_competition || 'N/A'}\n`;
                context += `  - Next Steps: ${score.score_next_steps || 'N/A'}\n`;
                context += `  - Call Control: ${score.score_call_control || 'N/A'}\n`;
            }
        });
    }

    // Playbooks
    if (data.playbooks && data.playbooks.length > 0) {
        context += '\n## Sales Playbooks\n';
        const playbooksByName = new Map();
        data.playbooks.forEach((p: any) => {
            if (!playbooksByName.has(p.playbook_name)) {
                playbooksByName.set(p.playbook_name, []);
            }
            playbooksByName.get(p.playbook_name).push(p.text_content);
        });

        playbooksByName.forEach((chunks, name) => {
            context += `\n### ${name}\n`;
            chunks.forEach((chunk: string) => {
                context += `${chunk}\n\n`;
            });
        });
    }

    context += '\n=== END ORGANIZATION DATA ===\n';
    return context;
}

/**
 * Chat with AI using full context
 */
export async function chatWithTeamData(
    orgId: string,
    userId: string,
    userRole: string,
    userMessage: string,
    conversationHistory: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }> = []
) {
    try {
        // Use gemini-2.5-flash as it's the latest fast model
        const model = ai.getGenerativeModel({ model: 'gemini-2.5-flash' });
        const isRep = userRole === 'rep';

        // Load ALL data upfront
        console.log('[Chat] Loading full organization context...');
        const orgData = await loadFullOrgContext(orgId, userId, userRole);
        const fullContext = formatOrgContext(orgData, isRep);

        console.log(`[Chat] Loaded ${orgData.calls?.length || 0} calls, ${orgData.members?.length || 0} members, ${orgData.playbooks?.length || 0} playbook chunks`);

        const systemInstruction = `You are an AI analytics assistant for LingoPitch, a sales coaching platform.

You help ${isRep ? 'sales representatives' : 'sales managers'} analyze ${isRep ? 'their own performance' : 'their team\'s performance'}.

**IMPORTANT:** You have access to the organization's database. If the "COMPLETE ORGANIZATION DATA" section is empty or has no calls, it means there is NO DATA available in the system yet.

HANDLING MISSING DATA:
1. **Global Empty State**: If there are 0 calls in the system, say: "Nothing has been started yet. I don't see any call data in the system."
2. **Specific Person Empty State**: If asked about a user (e.g., "Did Aditya perform calls?") and they have 0 calls in the data provided, say: "That person has done nothing yet."
3. **API/Fetch Error**: If you cannot verify the data for some reason, say: "Can't fetch AI data."

- DO NOT ask the user to provide data.
- DO NOT hallucinate calls that are not in the context.
- Answer questions using the data provided in the COMPLETE ORGANIZATION DATA section
- Be flexible with names - "Aditya Sabat" and "Aditya kumar Sabat" are the same person
- When asked about specific dates, filter the calls by the date in the data
- Provide detailed analysis including scores, strengths, weaknesses, and coaching tips
- Always cite specific data points and numbers
- Compare performance across team members when relevant
- Format responses with markdown: **bold** for metrics, bullets for lists, ## for headers
- If asked about a call, provide the full analysis including all parameter scores
- Use the playbook knowledge when answering sales methodology questions
- When reviewing calls, STRICTLY cross-reference with the 'Sales Playbooks' section to identify missed steps, deviations, or missed opportunities based on the company's specific guidelines.`;

        // Build conversation - inject context in FIRST user message if no history
        const contents = [];

        if (conversationHistory.length === 0) {
            // First message: include context
            contents.push({
                role: 'user',
                parts: [{ text: `${fullContext}\n\nUser Question: ${userMessage}` }],
            });
        } else {
            // Subsequent messages: use history + new message
            contents.push(...conversationHistory.map(msg => ({
                role: msg.role,
                parts: msg.parts,
            })));
            contents.push({
                role: 'user',
                parts: [{ text: userMessage }],
            });
        }

        // Generate response
        const result = await model.generateContent({
            contents: contents as any,
            systemInstruction: systemInstruction
        });

        const response = result.response;
        const text = response.text();

        return {
            response: text,
            conversationHistory: [
                ...conversationHistory,
                { role: 'user' as const, parts: [{ text: userMessage }] },
                { role: 'model' as const, parts: [{ text: text }] },
            ],
        };
    } catch (error) {
        console.error('Chat error:', error);
        throw new Error('Failed to process chat message');
    }
}
