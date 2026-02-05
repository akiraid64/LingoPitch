import { supabaseAdmin } from '../lib/supabase.js';
import { analyzeCallTranscript, generateCulturalProfile, CulturalProfile } from './geminiService.js';

interface AnalysisParams {
    sessionId: string;
    callId?: string;
    transcript: string;
    playbook?: string;
    productDescription?: string;
    languageCode?: string;
}

export async function analyzeSession({ sessionId, callId, transcript, playbook, productDescription, languageCode = 'en' }: AnalysisParams) {
    console.log(`[ANALYSIS] 🧠 Analyzing session ${sessionId} (${languageCode})...`);

    try {
        // 1. Fetch or Generate Cultural Profile
        let culturalProfile: CulturalProfile | null = null;

        const { data: profileData } = await (supabaseAdmin as any)
            .from('cultural_profiles')
            .select('*')
            .eq('language_code', languageCode)
            .single();

        if (profileData) {
            culturalProfile = profileData;
        } else {
            console.log(`[ANALYSIS] Cultural profile missing for ${languageCode}, generating...`);
            culturalProfile = await generateCulturalProfile(languageCode);
            // Non-blocking save
            (supabaseAdmin as any)
                .from('cultural_profiles')
                .insert(culturalProfile)
                .then(({ error }: any) => {
                    if (error) console.error('Failed to save generated profile:', error);
                });
        }

        // 2. Analyze using the robust shared function
        // Pass product description as context if available
        const context = productDescription ? `PRODUCT/CONTEXT: ${productDescription}\n\n${playbook || ''}` : playbook;

        const analysis = await analyzeCallTranscript(
            transcript,
            languageCode,
            culturalProfile!,
            context
        );

        console.log(`[ANALYSIS] ✨ Analysis complete. Score: ${analysis.score}`);

        // 3. Save to voice_sessions
        const { error } = await (supabaseAdmin.from('voice_sessions') as any)
            .update({
                analysis: analysis // Store full analysis object in JSONB
            })
            .eq('id', sessionId);

        if (error) {
            console.error('[ANALYSIS] ❌ Failed to save analysis to session:', error);
            throw error;
        }

        // 4. Save to call_scores (Detailed Breakdown)
        if (callId) {
            const { error: scoreError } = await supabaseAdmin
                .from('call_scores')
                .insert({
                    call_id: callId,
                    overall_score: analysis.score,
                    summary: analysis.summary,
                    executive_summary: analysis.executiveSummary,
                    communication_analysis: analysis.communicationAnalysis,
                    sentiment: analysis.sentiment,
                    strengths: analysis.strengths,
                    weaknesses: analysis.weaknesses,
                    coaching_tips: analysis.coachingTips,
                    key_takeaways: analysis.keyTakeaways,
                    objection_handling: analysis.objectionHandling,
                    closing_technique: analysis.closingTechnique,

                    // 10 Sales Parameters
                    score_needs_discovery: analysis.scoreNeedsDiscovery,
                    score_value_proposition: analysis.scoreValueProposition,
                    score_decision_process: analysis.scoreDecisionProcess,
                    score_stakeholder_id: analysis.scoreStakeholderId,
                    score_insight_delivery: analysis.scoreInsightDelivery,
                    score_objection_handling: analysis.scoreObjectionHandling,
                    score_active_listening: analysis.scoreActiveListening,
                    score_competition: analysis.scoreCompetition,
                    score_next_steps: analysis.scoreNextSteps,
                    score_call_control: analysis.scoreCallControl,

                    // Cultural Scores (stored in raw_response for now as per schema)
                    raw_response: {
                        cultural_scores: {
                            scoreCulturalAppropriateness: analysis.scoreCulturalAppropriateness,
                            scoreLanguageFormality: analysis.scoreLanguageFormality,
                            scoreRelationshipSensitivity: analysis.scoreRelationshipSensitivity,
                            scoreProtocolAdherence: analysis.scoreProtocolAdherence
                        }
                    }
                } as any);

            if (scoreError) {
                console.error('[ANALYSIS] ⚠️ Failed to save call score:', scoreError);
            } else {
                console.log(`[ANALYSIS] 🏆 Call score saved for call ${callId}`);
            }
        }

        return analysis;
    } catch (error) {
        console.error('[ANALYSIS] ❌ Error analyzing session:', error);
        await (supabaseAdmin.from('voice_sessions') as any)
            .update({ status: 'analysis_failed' })
            .eq('id', sessionId);
    }
}
