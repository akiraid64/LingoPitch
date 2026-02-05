import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useConversation } from '@elevenlabs/react';
import { useLanguageStore } from '@/store/languageStore';
import { Loader2, Mic, MicOff, Sparkles, Volume2, VolumeX } from 'lucide-react';
import { useTranslation } from '@/contexts/TranslationContext';

const API_URL = import.meta.env?.VITE_API_URL || 'http://localhost:3001';
const ELEVENLABS_AGENT_ID = import.meta.env?.VITE_ELEVENLABS_AGENT_ID || '';

export function ArenaPage() {
    const { currentLanguageInfo, targetLocale } = useLanguageStore();
    const { t } = useTranslation();
    const [isGenerating, setIsGenerating] = useState(false);
    const [customPrompt, setCustomPrompt] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const conversation = useConversation({
        agentId: ELEVENLABS_AGENT_ID,
    });

    const { startSession, endSession, status } = conversation;

    // Generate prompt when language changes
    useEffect(() => {
        async function generatePrompt() {
            console.log(`[ARENA] 🌍 Language changed to: ${targetLocale}`);
            setIsGenerating(true);
            setError(null);

            try {
                console.log(`[ARENA] 🔄 Fetching culturally-aware prompt from backend...`);
                const response = await fetch(`${API_URL}/api/roleplay/generate-prompt`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ languageCode: targetLocale }),
                });

                if (!response.ok) {
                    throw new Error(`Backend error: HTTP ${response.status}`);
                }

                const data = await response.json();
                console.log(`[ARENA] ✅ Received prompt (${data.prompt.length} chars)`);
                console.log(`[ARENA] 📝 Preview: ${data.prompt.substring(0, 150)}...`);

                setCustomPrompt(data.prompt);
            } catch (err) {
                console.error(`[ARENA] ❌ Failed to generate prompt:`, err);
                setError(err instanceof Error ? err.message : 'Failed to generate prompt');
            } finally {
                setIsGenerating(false);
            }
        }

        generatePrompt();
    }, [targetLocale]);

    const handleStart = async () => {
        if (!customPrompt) {
            console.error('[ARENA] ⚠️ No prompt available');
            return;
        }

        console.log(`[ARENA] 🎙️ Starting ElevenLabs session with Gemini-generated prompt...`);
        console.log(`[ARENA] 📜 Prompt length: ${customPrompt.length} chars`);

        try {
            await startSession({
                overrides: {
                    agent: {
                        prompt: {
                            prompt: customPrompt,
                        },
                    },
                },
            } as any);
            console.log(`[ARENA] ✅ Session started successfully!`);
        } catch (err) {
            console.error(`[ARENA] ❌ Session start failed:`, err);
            setError('Failed to start roleplay session. Check console for details.');
        }
    };

    const handleEnd = () => {
        console.log(`[ARENA] 🛑 Ending session...`);
        endSession();
    };

    const isConnected = status === 'connected';
    const isConnecting = status === 'connecting';

    return (
        <div className="min-h-screen bg-gradient-to-b from-dark-50 to-dark-100 py-12 px-4">
            <div className="max-w-7xl mx-auto">
                {/* Page Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-12 text-center"
                >
                    <div className="flex items-center justify-center gap-4 mb-4">
                        <Sparkles className="w-12 h-12 text-primary-500" />
                        <h1 className="font-display font-bold text-5xl md:text-6xl uppercase">
                            {t('arena.title')}
                        </h1>
                    </div>
                    <p className="text-xl text-gray-400">
                        Practice with AI customers from <span className="text-primary-500 font-bold">{currentLanguageInfo?.name || 'any region'}</span>
                    </p>
                </motion.div>

                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Main Roleplay Area */}
                    <div className="lg:col-span-2">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="brutal-card bg-dark-800 p-8"
                        >
                            {/* Status Display */}
                            <div className="text-center mb-8">
                                <div className="flex items-center justify-center gap-3 mb-4">
                                    {isGenerating && <Loader2 className="w-8 h-8 animate-spin text-primary-500" />}
                                    {isConnected && <Mic className="w-8 h-8 text-green-500 animate-pulse" />}
                                    {!isGenerating && !isConnected && <Mic className="w-8 h-8 text-gray-500" />}
                                </div>

                                <h2 className="text-2xl font-bold mb-2">
                                    {isGenerating && '🌍 Generating Cultural Context...'}
                                    {!isGenerating && !isConnected && '🎙️ Ready to Start Training'}
                                    {isConnected && '🗣️ Conversation In Progress'}
                                    {isConnecting && '⏳ Connecting...'}
                                </h2>

                                <p className="text-gray-400">
                                    {isGenerating && 'Gemini AI is creating a culturally-aware customer persona...'}
                                    {!isGenerating && !isConnected && 'Click "Start Roleplay" to begin voice conversation'}
                                    {isConnected && 'Speak naturally - the AI customer is listening'}
                                </p>
                            </div>

                            {/* Error Display */}
                            {error && (
                                <div className="bg-red-900/20 border-2 border-red-500 rounded-lg p-4 mb-6">
                                    <p className="text-red-400 font-bold">❌ {error}</p>
                                </div>
                            )}

                            {/* Loading State */}
                            {isGenerating && (
                                <div className="flex flex-col items-center space-y-4 py-8">
                                    <Loader2 className="w-12 h-12 animate-spin text-primary-400" />
                                    <div className="text-center">
                                        <p className="text-primary-400 font-medium">Analyzing cultural context...</p>
                                        <p className="text-sm text-gray-500">This takes 2-3 seconds on first load</p>
                                    </div>
                                </div>
                            )}

                            {/* Control Buttons */}
                            <div className="flex flex-col items-center gap-4">
                                {!isConnected ? (
                                    <button
                                        onClick={handleStart}
                                        disabled={isGenerating || !customPrompt || isConnecting}
                                        className="btn-brutal flex items-center gap-3 px-12 py-5 text-xl disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <Mic className="w-6 h-6" />
                                        {isConnecting ? 'Connecting...' : 'Start Roleplay'}
                                    </button>
                                ) : (
                                    <button
                                        onClick={handleEnd}
                                        className="btn-brutal flex items-center gap-2 px-8 py-4 bg-red-600 hover:bg-red-700"
                                    >
                                        <MicOff className="w-5 h-5" />
                                        End Session
                                    </button>
                                )}
                            </div>

                            {/* Connection Status */}
                            <div className="mt-6 text-center">
                                <p className="text-xs text-gray-500">
                                    Status: <span className="font-mono text-primary-400">{status}</span>
                                </p>
                            </div>
                        </motion.div>

                        {/* Debug Panel (Dev only) */}
                        {import.meta.env?.DEV && customPrompt && (
                            <motion.details
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="mt-6 brutal-card bg-dark-900 p-4"
                            >
                                <summary className="cursor-pointer text-sm text-gray-400 hover:text-gray-200 font-medium">
                                    🔍 View Generated Prompt (Debug Mode)
                                </summary>
                                <pre className="mt-3 p-3 bg-dark-950 rounded text-xs overflow-auto max-h-60 text-gray-300">
                                    {customPrompt}
                                </pre>
                            </motion.details>
                        )}
                    </div>

                    {/* Sidebar - Info */}
                    <div className="space-y-6">
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="brutal-card bg-primary-900/20 border-primary-500/30 p-6"
                        >
                            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                                <Sparkles className="w-5 h-5 text-primary-500" />
                                AI-Powered Training
                            </h3>
                            <ul className="space-y-3 text-sm text-gray-300">
                                <li className="flex items-start gap-2">
                                    <span className="text-primary-500 mt-1">•</span>
                                    <span><strong>Gemini 2.0 Flash</strong> generates culturally-aware customer personas</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-primary-500 mt-1">•</span>
                                    <span><strong>ElevenLabs AI</strong> powers natural voice conversations</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-primary-500 mt-1">•</span>
                                    <span><strong>24 Languages</strong> with authentic accents and cultural context</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-primary-500 mt-1">•</span>
                                    <span><strong>Smart Caching</strong> - instant load after first generation</span>
                                </li>
                            </ul>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 }}
                            className="brutal-card bg-dark-800 p-6"
                        >
                            <h3 className="font-bold text-lg mb-4">How It Works</h3>
                            <ol className="space-y-3 text-sm text-gray-300">
                                <li className="flex gap-3">
                                    <span className="font-bold text-primary-500">1.</span>
                                    <span>Select target language from header</span>
                                </li>
                                <li className="flex gap-3">
                                    <span className="font-bold text-primary-500">2.</span>
                                    <span>Gemini generates cultural profile</span>
                                </li>
                                <li className="flex gap-3">
                                    <span className="font-bold text-primary-500">3.</span>
                                    <span>Click "Start Roleplay" to begin</span>
                                </li>
                                <li className="flex gap-3">
                                    <span className="font-bold text-primary-500">4.</span>
                                    <span>Practice your pitch naturally</span>
                                </li>
                            </ol>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 }}
                            className="brutal-card bg-dark-800 p-6"
                        >
                            <h3 className="font-bold text-lg mb-4">Current Region</h3>
                            <div className="flex items-center gap-3">
                                <span className="text-4xl">{currentLanguageInfo?.flag}</span>
                                <div>
                                    <p className="font-bold text-primary-500">{currentLanguageInfo?.name}</p>
                                    <p className="text-sm text-gray-400">{currentLanguageInfo?.nativeName}</p>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>
        </div>
    );
}
