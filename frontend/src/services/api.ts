const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export interface ChatMessage {
    role: 'user' | 'model';
    parts: Array<{ text: string }>;
}

export interface ChatResponse {
    response: string;
    conversationHistory: ChatMessage[];
}

/**
 * Send a message to the AI chat
 */
export async function sendChatMessage(
    accessToken: string,
    message: string,
    conversationHistory: ChatMessage[] = []
): Promise<ChatResponse> {
    const response = await fetch(`${API_URL}/api/chat`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
            message,
            conversationHistory,
        }),
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
        throw new Error(data.error?.message || 'Chat failed');
    }

    return data.data;
    return data.data;
}

export interface CallAnalysisResponse {
    call: any; // Type this better if possible, but any is fine for now
    analysis: any;
}

export async function analyzeCall(
    accessToken: string,
    transcript: string,
    languageCode: string = 'en',
    details?: { scenario?: string; duration?: number; userId?: string }
): Promise<CallAnalysisResponse> {
    console.log('🚀 Sending analysis request for user:', details?.userId);
    const response = await fetch(`${API_URL}/api/calls`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
            transcript,
            language_code: languageCode,
            scenario: details?.scenario,
            duration_seconds: details?.duration,
            user_id: details?.userId
        }),
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
        throw new Error(data.error?.message || 'Analysis failed');
    }

    return data;
}
