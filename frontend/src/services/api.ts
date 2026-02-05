const API_URL = (import.meta as any).env.VITE_API_URL || 'http://localhost:3001';

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
    details?: { scenario?: string; duration?: number; userId?: string; orgId?: string }
): Promise<CallAnalysisResponse> {
    console.log('🚀 Sending analysis request for user:', details?.userId, 'Org:', details?.orgId);
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
            user_id: details?.userId,
            org_id: details?.orgId
        }),
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
        throw new Error(data.error?.message || 'Analysis failed');
    }

    return data;
}

/**
 * Upload and index a PDF playbook
 */
export async function uploadPlaybook(
    accessToken: string,
    orgId: string,
    file: File
): Promise<any> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('org_id', orgId);

    const response = await fetch(`${API_URL}/api/playbooks/upload`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
        },
        body: formData,
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
        throw new Error(data.error || 'Playbook upload failed');
    }

    return data;
}

/**
 * Fetch playbooks for an organization
 */
export async function getPlaybooks(
    accessToken: string,
    orgId: string
): Promise<any[]> {
    const response = await fetch(`${API_URL}/api/playbooks?org_id=${orgId}`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
        },
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to fetch playbooks');
    }

    return data.playbooks;
}
