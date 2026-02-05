import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai';

// Initialize Gemini
const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
    console.error('FATAL: GEMINI_API_KEY environment variable is not set');
}
const genai = new GoogleGenerativeAI(apiKey || 'dummy');

// --- Types ---

export interface CulturalProfile {
    language_code: string;
    language_name: string;
    communication_style: string;
    formality_level: number;
    relationship_building: string;
    decision_making: string;
    negotiation_approach: string;
    taboos: string[];
    power_phrases: string[];
    greetings_protocol: string;
    business_etiquette: string[];
}

export interface ParameterScores {
    scoreNeedsDiscovery: number;
    scoreValueProposition: number;
    scoreDecisionProcess: number;
    scoreStakeholderId: number;
    scoreInsightDelivery: number;
    scoreObjectionHandling: number;
    scoreActiveListening: number;
    scoreCompetition: number;
    scoreNextSteps: number;
    scoreCallControl: number;
}

export interface CulturalScores {
    scoreCulturalAppropriateness: number;
    scoreLanguageFormality: number;
    scoreRelationshipSensitivity: number;
    scoreProtocolAdherence: number;
}

export interface AnalysisResult extends ParameterScores, CulturalScores {
    score: number; // Weighted overall score
    summary: string;
    executiveSummary: string;
    communicationAnalysis: string;
    sentiment: 'Positive' | 'Neutral' | 'Negative' | 'Mixed';
    strengths: string[];
    weaknesses: string[];
    coachingTips: string[];
    keyTakeaways: string[];
    objectionHandling: string;
    closingTechnique: string;
}

// 10 Scoring Parameters Weights (Sales Agent Standard)
const PARAMETER_WEIGHTS = {
    scoreNeedsDiscovery: 0.15,
    scoreValueProposition: 0.12,
    scoreDecisionProcess: 0.10,
    scoreStakeholderId: 0.12,
    scoreInsightDelivery: 0.08,
    scoreObjectionHandling: 0.12,
    scoreActiveListening: 0.08,
    scoreCompetition: 0.08,
    scoreNextSteps: 0.10,
    scoreCallControl: 0.05,
} as const;

// --- Functions ---

export async function generateCulturalProfile(languageCode: string): Promise<CulturalProfile> {
    const model = genai.getGenerativeModel({ model: 'gemini-2.5-flash' }); // Updated to 2.5

    const prompt = `Generate a comprehensive cultural business profile for sales professionals targeting ${languageCode} language markets.

Provide detailed information in the following JSON format:
{
  "language_code": "${languageCode}",
  "language_name": "Name of language in English",
  "communication_style": "Direct/Indirect, High-context/Low-context description (2-3 sentences)",
  "formality_level": 1-10 (1=very informal, 10=extremely formal),
  "relationship_building": "How relationships are built in business (2-3 sentences)",
  "decision_making": "How business decisions are typically made (2-3 sentences)",
  "negotiation_approach": "Typical negotiation style and approach (2-3 sentences)",
  "taboos": ["List of 5-7 cultural taboos or things to avoid in business"],
  "power_phrases": ["List of 5-7 culturally appropriate phrases for business success"],
  "greetings_protocol": "How to properly greet and address business partners (2-3 sentences)",
  "business_etiquette": ["List of 5-7 key business etiquette rules"]
}

Focus on practical, actionable information that will help sales professionals succeed in this market. Be specific and culturally accurate.`;

    try {
        const result = await model.generateContent({
            contents: [{ role: 'user', parts: [{ text: prompt }] }]
        });
        const response = result.response.text();
        const jsonMatch = response.match(/```json\n([\s\S]*?)\n```/) || response.match(/\{[\s\S]*\}/);
        if (!jsonMatch) throw new Error('Failed to extract JSON from Gemini response');
        return JSON.parse(jsonMatch[1] || jsonMatch[0]);
    } catch (error) {
        console.error('Error generating cultural profile:', error);
        // Fallback
        return {
            language_code: languageCode,
            language_name: languageCode.toUpperCase(),
            communication_style: 'Profile generation failed.',
            formality_level: 5,
            relationship_building: 'N/A',
            decision_making: 'N/A',
            negotiation_approach: 'N/A',
            taboos: [],
            power_phrases: [],
            greetings_protocol: 'N/A',
            business_etiquette: []
        };
    }
}


export async function generateEmbedding(text: string): Promise<number[]> {
    const model = genai.getGenerativeModel({ model: "text-embedding-004" });

    try {
        const result = await model.embedContent(text);
        return result.embedding.values;
    } catch (error) {
        console.error('Error generating embedding:', error);
        throw new Error('Failed to generate embedding');
    }
}

export async function analyzeCallTranscript(
    transcript: string,
    languageCode: string,
    culturalProfile: CulturalProfile,
    playbookContext?: string
): Promise<AnalysisResult> {
    // Use the robust model requested
    const model = genai.getGenerativeModel({
        model: 'gemini-2.5-flash',
        generationConfig: { responseMimeType: "application/json" } // Force JSON
    });

    const systemInstruction = `You are an expert AI Sales Coach and Cultural Analyst for LingoPitch.
    
    Your task is to analyze sales calls using proven methodologies (MEDDPICC, SPIN) AND Cultural Intelligence for the ${culturalProfile.language_name} market.

    ${playbookContext ? `
    IMPORTANT: The following Sales Playbook knowledge should be used as the primary coaching methodology for this analysis:
    ---
    ${playbookContext}
    ---
    ` : ''}

    CONTEXT - CULTURAL PROFILE:
    - Communication Style: ${culturalProfile.communication_style}
    - Formality Level: ${culturalProfile.formality_level}/10
    - Relationship Building: ${culturalProfile.relationship_building}
    - Key Taboos: ${culturalProfile.taboos.join(', ')}

    SCORING CRITERIA (0-100):
    
    1. NEEDS DISCOVERY (15%): Effectiveness in uncovering needs. 
    2. VALUE PROPOSITION (12%): Quantifiable benefits tied to needs.
    3. DECISION PROCESS (10%): Understanding timeline and buying steps.
    4. STAKEHOLDER ID (12%): Identifying decision makers/budget holders.
    5. INSIGHT DELIVERY (8%): Challenging assumptions, delivering unique value.
    6. OBJECTION HANDLING (12%): Clarifying and resolving concerns.
    7. ACTIVE LISTENING (8%): Talk-time balance, paraphrasing.
    8. COMPETITION (8%): Differentiation awareness.
    9. NEXT STEPS (10%): Clear, committed next steps.
    10. CALL CONTROL (5%): Agenda setting and time management.

    CULTURAL INTELLIGENCE (Separate Scores 0-100):
    1. Cultural Appropriateness: Adherence to cultural norms.
    2. Language Formality: Matching the expected formality level (${culturalProfile.formality_level}).
    3. Relationship Sensitivity: Building trust according to cultural expectations.
    4. Protocol Adherence: Following greetings and etiquette conventions.

    OUTPUT:
    Provide a JSON object containing all scores and detailed qualitative analysis.`;

    const prompt = `Analyze the following transcript:
    
    ${transcript}
    
    Return the analysis in the specified JSON format.`;

    try {
        const result = await model.generateContent({
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            systemInstruction: { role: 'system', parts: [{ text: systemInstruction }] },
            generationConfig: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: SchemaType.OBJECT,
                    properties: {
                        scoreNeedsDiscovery: { type: SchemaType.INTEGER },
                        scoreValueProposition: { type: SchemaType.INTEGER },
                        scoreDecisionProcess: { type: SchemaType.INTEGER },
                        scoreStakeholderId: { type: SchemaType.INTEGER },
                        scoreInsightDelivery: { type: SchemaType.INTEGER },
                        scoreObjectionHandling: { type: SchemaType.INTEGER },
                        scoreActiveListening: { type: SchemaType.INTEGER },
                        scoreCompetition: { type: SchemaType.INTEGER },
                        scoreNextSteps: { type: SchemaType.INTEGER },
                        scoreCallControl: { type: SchemaType.INTEGER },

                        // Cultural Scores
                        scoreCulturalAppropriateness: { type: SchemaType.INTEGER },
                        scoreLanguageFormality: { type: SchemaType.INTEGER },
                        scoreRelationshipSensitivity: { type: SchemaType.INTEGER },
                        scoreProtocolAdherence: { type: SchemaType.INTEGER },

                        summary: { type: SchemaType.STRING },
                        executiveSummary: { type: SchemaType.STRING },
                        communicationAnalysis: { type: SchemaType.STRING },
                        sentiment: { type: SchemaType.STRING, enum: ["Positive", "Neutral", "Negative", "Mixed"] },
                        strengths: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
                        weaknesses: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
                        coachingTips: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
                        keyTakeaways: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
                        objectionHandling: { type: SchemaType.STRING },
                        closingTechnique: { type: SchemaType.STRING }
                    },
                    required: ["scoreNeedsDiscovery", "scoreValueProposition", "scoreDecisionProcess", "scoreStakeholderId", "scoreInsightDelivery", "scoreObjectionHandling", "scoreActiveListening", "scoreCompetition", "scoreNextSteps", "scoreCallControl", "scoreCulturalAppropriateness", "scoreLanguageFormality", "scoreRelationshipSensitivity", "scoreProtocolAdherence", "summary", "executiveSummary", "coachingTips"]
                }
            }
        });

        const text = result.response.text();

        // Parse the JSON directly (Gemini 2.5/Flash often returns pure JSON with responseMimeType)
        let aiResult: any;
        try {
            aiResult = JSON.parse(text);
        } catch (e) {
            // Fallback for markdown code blocks
            const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/) || text.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                aiResult = JSON.parse(jsonMatch[1] || jsonMatch[0]);
            } else {
                throw new Error("Invalid JSON format");
            }
        }

        // Calculate weighted score
        const weightedScore = Math.round(
            (aiResult.scoreNeedsDiscovery || 0) * PARAMETER_WEIGHTS.scoreNeedsDiscovery +
            (aiResult.scoreValueProposition || 0) * PARAMETER_WEIGHTS.scoreValueProposition +
            (aiResult.scoreDecisionProcess || 0) * PARAMETER_WEIGHTS.scoreDecisionProcess +
            (aiResult.scoreStakeholderId || 0) * PARAMETER_WEIGHTS.scoreStakeholderId +
            (aiResult.scoreInsightDelivery || 0) * PARAMETER_WEIGHTS.scoreInsightDelivery +
            (aiResult.scoreObjectionHandling || 0) * PARAMETER_WEIGHTS.scoreObjectionHandling +
            (aiResult.scoreActiveListening || 0) * PARAMETER_WEIGHTS.scoreActiveListening +
            (aiResult.scoreCompetition || 0) * PARAMETER_WEIGHTS.scoreCompetition +
            (aiResult.scoreNextSteps || 0) * PARAMETER_WEIGHTS.scoreNextSteps +
            (aiResult.scoreCallControl || 0) * PARAMETER_WEIGHTS.scoreCallControl
        );

        return {
            ...aiResult,
            score: weightedScore
        };

    } catch (error) {
        console.error('Error analyzing transcript:', error);
        throw new Error('Failed to analyze call transcript');
    }
}

