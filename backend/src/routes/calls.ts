import { Router } from 'express';
import { supabaseAdmin } from '../lib/supabase.js';
import { analyzeCallTranscript } from '../services/geminiService.js';

const router = Router();

// Create a new call record with analysis
router.post('/', async (req, res) => {
    try {
        const { user_id, language_code, scenario, transcript, duration_seconds } = req.body;

        if (!transcript || !language_code) {
            return res.status(400).json({
                success: false,
                error: { message: 'Transcript and language_code are required' }
            });
        }

        // Fetch cultural profile
        let { data: culturalProfile } = await (supabaseAdmin as any)
            .from('cultural_profiles')
            .select('*')
            .eq('language_code', language_code)
            .single();

        // If not found, generate one on the fly
        if (!culturalProfile) {
            console.log(`Cultural profile missing for ${language_code}, generating...`);
            try {
                // Import locally to avoid circular dependency issues if any, though imports are top level usually
                const { generateCulturalProfile } = await import('../services/geminiService.js');
                const newProfile = await generateCulturalProfile(language_code);

                // Save it for future use
                const { data: savedProfile, error: insertError } = await (supabaseAdmin as any)
                    .from('cultural_profiles')
                    .insert(newProfile)
                    .select()
                    .single();

                if (insertError) {
                    console.error('Failed to save generated profile:', insertError);
                    // Continue with the generated object even if save failed (fallback)
                    culturalProfile = newProfile;
                } else {
                    culturalProfile = savedProfile;
                }
            } catch (genError) {
                console.error('Failed to generate cultural profile:', genError);
                // Last resort fallback
                culturalProfile = {
                    language_code,
                    language_name: language_code,
                    communication_style: 'Standard',
                    formality_level: 5,
                    relationship_building: 'N/A',
                    taboos: [],
                    power_phrases: [],
                    greetings_protocol: 'N/A',
                    business_etiquette: []
                };
            }
        }

        // Analyze the call
        console.log('Analyzing transcript with profile:', culturalProfile.language_name);
        const analysis = await analyzeCallTranscript(transcript, language_code, culturalProfile);
        console.log('Analysis complete. Score:', analysis.score);

        // 1. Save Call Metadata
        console.log('📝 Saving call metadata to DB:', {
            user_id: user_id || 'anonymous',
            org_id: req.body.org_id,
            language_code
        });

        // @ts-ignore
        const { data: call, error: saveError } = await (supabaseAdmin as any)
            .from('calls')
            .insert({
                user_id: user_id || null, // Allow null for anonymous/testing
                org_id: req.body.org_id || null,
                title: `${scenario || 'Sales Call'} - ${new Date().toLocaleDateString()}`,
                external_id: req.body.external_id || undefined,
                // language_code column does not exist in schema, storing in transcript jsonb
                transcript: { language_code: language_code },

                customer_name: 'Prospect', // Placeholder
                duration_seconds: duration_seconds || 0,
                // @ts-ignore
                raw_transcript: transcript,
                status: 'completed',
                analyzed_at: new Date().toISOString()
            })
            .select()
            .single();

        if (saveError) {
            console.error('❌ Call insert error details:', JSON.stringify(saveError, null, 2));
            throw saveError;
        }

        console.log('✅ Call metadata saved. ID:', call.id);

        // 2. Save Call Scores (Separate Table)
        console.log('📝 Saving call scores for call_id:', call.id);

        // @ts-ignore
        const { error: scoresError } = await (supabaseAdmin as any)
            .from('call_scores')
            .insert({
                call_id: call.id,
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

                // 10 Parameters
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

                // We can store cultural scores in raw_response for now as there are no specific columns for them in schema
                raw_response: {
                    cultural_scores: {
                        scoreCulturalAppropriateness: analysis.scoreCulturalAppropriateness,
                        scoreLanguageFormality: analysis.scoreLanguageFormality,
                        scoreRelationshipSensitivity: analysis.scoreRelationshipSensitivity,
                        scoreProtocolAdherence: analysis.scoreProtocolAdherence
                    }
                }
            });

        if (scoresError) {
            console.error('❌ Scores insert error details:', JSON.stringify(scoresError, null, 2));
        } else {
            console.log('✅ Call scores saved successfully for call_id:', call.id);
        }

        if (scoresError) {
            console.error('Scores insert error:', scoresError);
            // Non-fatal? We still have the call. But analysis is lost.
            // Best to verify why it failed.
        }

        res.json({
            success: true,
            call,
            analysis
        });
    } catch (error: any) {
        console.error('Error creating call:', error);
        res.status(500).json({
            success: false,
            error: { message: error.message || 'Failed to create and analyze call' }
        });
    }
});

// Get all calls for a user
router.get('/user/:userId', async (req, res) => {
    try {
        const { userId } = req.params;

        // Join with profiles and call_scores
        const { data: calls, error } = await supabaseAdmin
            .from('calls')
            .select(`
                *,
                call_scores (*)
            `)
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (error) throw error;

        res.json({
            success: true,
            calls,
            count: calls?.length || 0
        });
    } catch (error) {
        console.error('Error fetching calls:', error);
        res.status(500).json({
            success: false,
            error: { message: 'Failed to fetch calls' }
        });
    }
});

// Get a specific call by ID
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const { data: call, error } = await supabaseAdmin
            .from('calls')
            .select(`
                *,
                call_scores (*)
            `)
            .eq('id', id)
            .single();

        if (error || !call) {
            return res.status(404).json({
                success: false,
                error: { message: 'Call not found' }
            });
        }

        res.json({
            success: true,
            call
        });
    } catch (error) {
        console.error('Error fetching call:', error);
        res.status(500).json({
            success: false,
            error: { message: 'Failed to fetch call' }
        });
    }
});

export default router;
