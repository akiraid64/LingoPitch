import { useState } from 'react';
import { motion } from 'framer-motion';
import { useLanguageStore } from '@/store/languageStore';
import { Loader2, Mic, MicOff, Sparkles, Clock } from 'lucide-react';
import { useTranslation } from '@/contexts/TranslationContext';
import { CartesiaVoiceClient } from '@/services/cartesiaClient';
import { useEffect } from 'react';

// Internal Timer Component
function Timer({ isRunning }: { isRunning: boolean }) {
    const [seconds, setSeconds] = useState(0);

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isRunning) {
            interval = setInterval(() => {
                setSeconds(s => s + 1);
            }, 1000);
        } else {
            setSeconds(0);
        }
        return () => clearInterval(interval);
    }, [isRunning]);

    const formatTime = (totalSeconds: number) => {
        const mins = Math.floor(totalSeconds / 60);
        const secs = totalSeconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-gray-100 dark:bg-gray-700 rounded-full text-sm font-medium text-gray-600 dark:text-gray-300">
            <Clock className="w-4 h-4" />
            <span>{formatTime(seconds)}</span>
        </div>
    );
}

const API_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:3001';

export function ArenaPage() {
    const { currentLanguageInfo, targetLocale } = useLanguageStore();
    const { t } = useTranslation();
    const [client] = useState(() => new CartesiaVoiceClient(
        () => console.log('[ARENA] ✅ Connected'),
        () => console.log('[ARENA] Disconnected'),
        (err) => console.error('[ARENA] Error:', err)
    ));
    const [isConnecting, setIsConnecting] = useState(false);
    const [isConnected, setIsConnected] = useState(false);
    const [isMicActive, setIsMicActive] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const startSession = async () => {
        console.log(`[ARENA] 🎙️ Starting voice session for: ${targetLocale}`);
        setIsConnecting(true);
        setError(null);

        try {
            // Step 1: Request session from TypeScript backend
            // (which fetches Gemini prompt and proxies to Python agent)
            console.log('[ARENA] 🔄 Requesting session from backend...');
            const response = await fetch(`${API_URL}/api/voice-agent/start-session`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    language_code: targetLocale,
                    user_id: 'user123', // TODO: Get from auth
                    playbook: 'B2B SaaS Sales'
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.details || 'Failed to start session');
            }

            const sessionData = await response.json();
            console.log('[ARENA] ✅ Session created:', sessionData.agent_id);
            console.log('[ARENA] 📝 System prompt length:', sessionData.system_prompt.length);

            // Connect to Cartesia voice agent
            console.log('[ARENA] 🔌 Connecting to voice agent WebSocket...');
            const accessToken = sessionData.access_token || '';
            await client.connect(sessionData.websocket_url, sessionData.metadata, accessToken);

            // Start microphone
            console.log('[ARENA] 🎤 Starting microphone...');
            await client.startMicrophone();
            setIsMicActive(true);

            console.log('[ARENA] 🚀 Voice roleplay started!');

        } catch (err) {
            console.error('[ARENA] ❌ Failed to start session:', err);
            setError(err instanceof Error ? err.message : 'Failed to start session');
            endSession();
        } finally {
            setIsConnecting(false);
        }
    };

    const endSession = () => {
        console.log('[ARENA] Ending session...');
        client.disconnect();
        setIsConnected(false);
        setIsMicActive(false);
    };

    const toggleMic = () => {
        if (isMicActive) {
            client.stopMicrophone();
            setIsMicActive(false);
        } else {
            client.startMicrophone();
            setIsMicActive(true);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-indigo-950">
            <div className="container mx-auto px-4 py-12">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="max-w-4xl mx-auto"
                >
                    {/* Header */}
                    <div className="text-center mb-12">
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: 'spring', stiffness: 200 }}
                            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-full mb-6"
                        >
                            <Sparkles className="w-5 h-5" />
                            <span className="font-semibold">AI-Powered Voice Roleplay</span>
                        </motion.div>

                        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
                            {t('arena.title')}
                        </h1>
                        <p className="text-xl text-gray-600 dark:text-gray-300">
                            {t('arena.subtitle')}
                        </p>
                    </div>

                    {/* Language Info */}
                    <motion.div
                        className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl mb-8"
                        whileHover={{ scale: 1.02 }}
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                                    {t('arena.current_language')}
                                </p>
                                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                                    {currentLanguageInfo?.nativeName}
                                </h3>
                                <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                                    {currentLanguageInfo?.region} • {currentLanguageInfo?.code}
                                </p>
                            </div>
                            <div className="text-6xl">
                                {currentLanguageInfo?.flag}
                            </div>
                        </div>
                    </motion.div>

                    {/* Voice Session Control */}
                    <motion.div
                        className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.2 }}
                    >
                        {/* Error Message */}
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg"
                            >
                                <p className="text-red-800 dark:text-red-200 text-sm">
                                    ❌ {error}
                                </p>
                            </motion.div>
                        )}

                        {/* Not Connected State */}
                        {!isConnected && (
                            <div className="text-center">
                                <motion.button
                                    onClick={startSession}
                                    disabled={isConnecting}
                                    className="group relative inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-full font-semibold text-lg shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                    whileHover={!isConnecting ? { scale: 1.05 } : {}}
                                    whileTap={!isConnecting ? { scale: 0.95 } : {}}
                                >
                                    {isConnecting ? (
                                        <>
                                            <Loader2 className="w-6 h-6 animate-spin" />
                                            <span>{t('arena.connecting')}</span>
                                        </>
                                    ) : (
                                        <>
                                            <Mic className="w-6 h-6" />
                                            <span>{t('arena.start_practice')}</span>
                                        </>
                                    )}
                                </motion.button>

                                <p className="mt-6 text-sm text-gray-500 dark:text-gray-400">
                                    {t('arena.powered_by')} <strong>Cartesia AI</strong> + <strong>Gemini 2.5 Flash</strong>
                                </p>
                            </div>
                        )}

                        {/* Connected State */}
                        {isConnected && (
                            <div className="space-y-6">
                                {/* Mic Visualization */}
                                <div className="text-center">
                                    <motion.div
                                        className={`inline-flex items-center justify-center w-32 h-32 rounded-full ${isMicActive
                                            ? 'bg-gradient-to-r from-green-400 to-emerald-600'
                                            : 'bg-gray-300 dark:bg-gray-600'
                                            }`}
                                        animate={isMicActive ? {
                                            scale: [1, 1.1, 1],
                                        } : {}}
                                        transition={{
                                            repeat: Infinity,
                                            duration: 1.5
                                        }}
                                    >
                                        {isMicActive ? (
                                            <Mic className="w-16 h-16 text-white" />
                                        ) : (
                                            <MicOff className="w-16 h-16 text-white" />
                                        )}
                                    </motion.div>

                                    <p className="mt-4 text-lg font-semibold text-gray-900 dark:text-white">
                                        {isMicActive ? t('arena.listening') : t('arena.muted')}
                                    </p>
                                </div>

                                {/* Controls */}
                                <div className="flex items-center justify-center gap-4">
                                    <motion.button
                                        onClick={toggleMic}
                                        className={`px-6 py-3 rounded-full font-semibold transition-all ${isMicActive
                                            ? 'bg-yellow-500 hover:bg-yellow-600 text-white'
                                            : 'bg-green-500 hover:bg-green-600 text-white'
                                            }`}
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                    >
                                        {isMicActive ? t('arena.mute') : t('arena.unmute')}
                                    </motion.button>

                                    <motion.button
                                        onClick={endSession}
                                        className="px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-full font-semibold transition-all"
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                    >
                                        {t('arena.end_session')}
                                    </motion.button>
                                </div>

                                {/* Session Info */}
                                <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
                                    <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
                                        🧠 {t('arena.culturally_aware')} •
                                        🎙️ {t('arena.real_time')} •
                                        ✨ {t('arena.gemini_powered')}
                                    </p>
                                </div>

                                {/* Call Duration */}
                                <div className="text-center pt-4">
                                    <Timer isRunning={isConnected} />
                                </div>
                            </div>
                        )}
                    </motion.div>

                    {/* How It Works */}
                    <motion.div
                        className="mt-8 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-2xl p-6"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4 }}
                    >
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                            <Sparkles className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                            {t('arena.how_it_works')}
                        </h3>
                        <ol className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                            <li>1️⃣ Gemini 2.5 Flash generates a culturally-aware roleplay character</li>
                            <li>2️⃣ Cartesia AI creates a voice agent with your custom scenario</li>
                            <li>3️⃣ Speak naturally and receive real-time, culturally-appropriate responses</li>
                            <li>4️⃣ Practice sales techniques with realistic customer personas</li>
                        </ol>
                    </motion.div>
                </motion.div>
            </div>
        </div>
    );
}
