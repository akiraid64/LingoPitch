import { useState, useEffect } from 'react';
import { useConversation } from '@elevenlabs/react';
import { useLanguageStore } from '@/store/languageStore';
import { Loader2, Mic, MicOff } from 'lucide-react';

const API_URL = import.meta.env?.VITE_API_URL || 'http://localhost:3001';
const ELEVENLABS_AGENT_ID = import.meta.env?.VITE_ELEVENLABS_AGENT_ID || '';

export function RoleplayAgent() {
    const { targetLocale } = useLanguageStore();
    const [isGenerating, setIsGenerating] = useState(false);
    const [customPrompt, setCustomPrompt] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const { startSession, endSession, status } = useConversation({
        agentId: ELEVENLABS_AGENT_ID,
    });

    // Generate prompt when language changes
    useEffect(() => {
        async function generatePrompt() {
            console.log(`[ROLEPLAY] 🌍 Language changed to: ${targetLocale}`);
            setIsGenerating(true);
            setError(null);

            try {
                console.log(`[ROLEPLAY] 🔄 Fetching prompt from backend...`);
                const response = await fetch(`${API_URL}/api/roleplay/generate-prompt`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ languageCode: targetLocale }),
                });

                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}`);
                }

                const data = await response.json();
                console.log(`[ROLEPLAY] ✅ Received prompt (${data.prompt.length} chars)`);
                console.log(`[ROLEPLAY] 📝 Preview: ${data.prompt.substring(0, 200)}...`);

                setCustomPrompt(data.prompt);
            } catch (err) {
                console.error(`[ROLEPLAY] ❌ Failed to generate prompt:`, err);
                setError(err instanceof Error ? err.message : 'Failed to generate prompt');
            } finally {
                setIsGenerating(false);
            }
        }

        generatePrompt();
    }, [targetLocale]);

    const handleStart = async () => {
        if (!customPrompt) {
            console.error('[ROLEPLAY] ⚠️ No prompt available');
            return;
        }

        console.log(`[ROLEPLAY] 🎙️ Starting ElevenLabs session with override...`);
        console.log(`[ROLEPLAY] 📜 Prompt length: ${customPrompt.length} chars`);

        try {
            await startSession({
                overrides: {
                    agent: {
                        prompt: {
                            prompt: customPrompt,
                        },
                    },
                },
            } as any); // Type assertion needed due to SDK version mismatch
            console.log(`[ROLEPLAY] ✅ Session started`);
        } catch (err) {
            console.error(`[ROLEPLAY] ❌ Session start failed:`, err);
            setError('Failed to start roleplay session');
        }
    };

    const handleEnd = () => {
        console.log(`[ROLEPLAY] 🛑 Ending session...`);
        endSession();
    };

    const isConnected = status === 'connected';
    const isConnecting = status === 'connecting';

    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6">
            {/* Status Display */}
            <div className="text-center space-y-2">
                <h2 className="text-3xl font-bold">AI Roleplay Training</h2>
                <p className="text-gray-400">
                    {isGenerating && '🌍 Generating cultural context...'}
                    {!isGenerating && !isConnected && 'Ready to start your training session'}
                    {isConnected && '🎙️ Session in progress'}
                </p>
            </div>

            {/* Error Display */}
            {error && (
                <div className="bg-red-900/20 border border-red-500 rounded-lg p-4 max-w-md">
                    <p className="text-red-400 text-sm">❌ {error}</p>
                </div>
            )}

            {/* Loading State */}
            {isGenerating && (
                <div className="flex items-center space-x-3 text-primary-400">
                    <Loader2 className="w-6 h-6 animate-spin" />
                    <span>Preparing culturally-aware customer...</span>
                </div>
            )}

            {/* Control Buttons */}
            <div className="flex gap-4">
                {!isConnected ? (
                    <button
                        onClick={handleStart}
                        disabled={isGenerating || !customPrompt || isConnecting}
                        className="btn-brutal flex items-center gap-2 px-8 py-4 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Mic className="w-5 h-5" />
                        {isConnecting ? 'Connecting...' : 'Start Roleplay'}
                    </button>
                ) : (
                    <button
                        onClick={handleEnd}
                        className="btn-brutal-secondary flex items-center gap-2 px-8 py-4 text-lg"
                    >
                        <MicOff className="w-5 h-5" />
                        End Session
                    </button>
                )}
            </div>

            {/* Status Indicator */}
            <div className="text-sm text-gray-500">
                Status: <span className="font-mono">{status}</span>
            </div>

            {/* Debug Info (Development only) */}
            {import.meta.env?.DEV && customPrompt && (
                <details className="mt-8 max-w-2xl w-full">
                    <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-300">
                        🔍 View Generated Prompt (Debug)
                    </summary>
                    <pre className="mt-2 p-4 bg-dark-800 rounded text-xs overflow-auto max-h-60">
                        {customPrompt}
                    </pre>
                </details>
            )}
        </div>
    );
}
