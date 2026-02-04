import { GoogleGenerativeAI } from '@google/generative-ai';

const genai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

interface CulturalProfile {
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

export async function generateCulturalProfile(languageCode: string): Promise<CulturalProfile> {
    const model = genai.getGenerativeModel({ model: 'gemini-1.5-flash' });

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
        const result = await model.generateContent(prompt);
        const response = result.response.text();

        // Extract JSON from response (handle markdown code blocks)
        const jsonMatch = response.match(/```json\n([\s\S]*?)\n```/) || response.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            throw new Error('Failed to extract JSON from Gemini response');
        }

        const profileData = JSON.parse(jsonMatch[1] || jsonMatch[0]);
        return profileData;
    } catch (error) {
        console.error('Error generating cultural profile:', error);

        // Return a basic fallback profile
        return {
            language_code: languageCode,
            language_name: languageCode.toUpperCase(),
            communication_style: 'Please configure cultural profile for this language.',
            formality_level: 5,
            relationship_building: 'Cultural profile generation failed. Please try again.',
            decision_making: 'N/A',
            negotiation_approach: 'N/A',
            taboos: ['Profile generation failed'],
            power_phrases: ['Please regenerate profile'],
            greetings_protocol: 'N/A',
            business_etiquette: ['Please configure manually']
        };
    }
}

export async function analyzeCallTranscript(
    transcript: string,
    languageCode: string,
    culturalProfile: CulturalProfile
): Promise<any> {
    const model = genai.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `Analyze this sales call transcript for a ${languageCode} market with the following cultural context:

Cultural Profile:
- Communication Style: ${culturalProfile.communication_style}
- Formality Level: ${culturalProfile.formality_level}/10
- Relationship Building: ${culturalProfile.relationship_building}
- Key Taboos: ${culturalProfile.taboos.join(', ')}

Transcript:
${transcript}

Provide a comprehensive analysis in JSON format with:
1. Standard sales scores (1-10 for each):
   - Rapport building
   - Needs discovery
   - Value proposition
   - Objection handling
   - Closing technique
   - Overall communication

2. Cultural intelligence scores (1-10 for each):
   - Cultural appropriateness
   - Language formality
   - Relationship sensitivity
   - Protocol adherence

3. Detailed feedback with specific examples from the transcript
4. Actionable improvement suggestions

Return only valid JSON.`;

    try {
        const result = await model.generateContent(prompt);
        const response = result.response.text();

        const jsonMatch = response.match(/```json\n([\s\S]*?)\n```/) || response.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            throw new Error('Failed to extract analysis JSON');
        }

        return JSON.parse(jsonMatch[1] || jsonMatch[0]);
    } catch (error) {
        console.error('Error analyzing transcript:', error);
        throw new Error('Failed to analyze call transcript');
    }
}
