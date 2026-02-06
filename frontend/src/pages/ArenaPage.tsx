import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { useLanguageStore } from '@/store/languageStore';
import { Loader2, Mic, MicOff, Sparkles, Clock } from 'lucide-react';
import { useTranslation } from '@/contexts/TranslationContext';
import { useAuth } from '@/contexts/AuthContext';
import { CartesiaVoiceClient } from '@/services/cartesiaClient';
import { supabase } from '@/lib/supabase';
import { useEffect } from 'react';

// Internal Timer Component
function Timer({ isRunning }: { isRunning: boolean }) {
    const [seconds, setSeconds] = useState(0);

    useEffect(() => {
        let interval: ReturnType<typeof setTimeout>;
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
    const { profile } = useAuth();
    const [client] = useState(() => new CartesiaVoiceClient(
        () => console.log('[ARENA] ✅ Connected'),
        () => console.log('[ARENA] Disconnected'),
        (err) => console.error('[ARENA] Error:', err)
    ));
    const [isConnecting, setIsConnecting] = useState(false);
    const [isConnected, setIsConnected] = useState(false);
    const [isMicActive, setIsMicActive] = useState(false);
    const agentIdRef = useRef<string | null>(null); // Ref to avoid stale closure in callbacks
    const [error, setError] = useState<string | null>(null);

    const [systemPrompt, setSystemPrompt] = useState<string>('Generating persona...');
    const [isGeneratingPrompt, setIsGeneratingPrompt] = useState(false);

    // Fetch initial prompt or when language changes
    useEffect(() => {
        const fetchPrompt = async () => {
            setIsGeneratingPrompt(true);
            try {
                const orgId = profile?.organizations?.id || '';
                const response = await fetch(`${API_URL}/api/roleplay/prompt/${targetLocale}?orgId=${orgId}`);
                if (response.ok) {
                    const data = await response.json();
                    setSystemPrompt(data.prompt);
                }
            } catch (err) {
                console.error('[ARENA] Failed to fetch prompt:', err);
                setSystemPrompt('Failed to load persona briefing.');
            } finally {
                setIsGeneratingPrompt(false);
            }
        };

        if (targetLocale) {
            // Safety: If we are already connected and language changes, 
            // end the session to prevent persona mismatch.
            if (isConnected) {
                console.log('[ARENA] 🌍 Language changed mid-session. Ending current session for consistency.');
                endSession();
            }
            fetchPrompt();
        }
    }, [targetLocale, profile?.organizations?.id]);

    const startSession = async () => {
        console.log(`[ARENA] 🚀 Starting voice session for: ${targetLocale}`);
        setIsConnecting(true);
        setError(null);
        agentIdRef.current = null;

        try {
            // (which fetches Gemini prompt and proxies to Python agent)
            console.log('[ARENA] 📡 Requesting session from backend...');

            // Get product description from profile organization
            // Note: We use 'any' casting because TS definitions for profile might not be fully updated
            const productDesc = (currentLanguageInfo as any)?.product_description ||
                (profile?.organizations?.product_description);

            console.log('[ARENA] 📦 Product Context:', productDesc ? `${productDesc.substring(0, 50)}...` : '(None)');



            const response = await fetch(`${API_URL}/api/voice-agent/start-session`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    language_code: targetLocale,
                    // Use current user ID or a valid 0000... fallback for unauthenticated testing to avoid DB UUID errors
                    user_id: profile?.id || '00000000-0000-0000-0000-000000000000',
                    orgId: profile?.organizations?.id,
                    system_prompt: systemPrompt, // PASS THE VISIBLE PROMPT
                    playbook: 'B2B SaaS Sales',
                    product_description: productDesc
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.details || 'Failed to start session');
            }

            const sessionData = await response.json();
            console.log('[ARENA] ✅ Session created:', sessionData.agent_id);
            agentIdRef.current = sessionData.agent_id;
            console.log('[ARENA] 📝 System prompt length:', sessionData.system_prompt.length);

            // Connect to Cartesia voice agent
            console.log('[ARENA] 🔌 Connecting to voice agent WebSocket...');
            const accessToken = sessionData.access_token || '';
            await client.connect(sessionData.websocket_url, sessionData.metadata, accessToken);

            // Start microphone
            console.log('[ARENA] 🎤 Starting microphone...');
            await client.startMicrophone();
            setIsMicActive(true);
            setIsConnected(true); // Ensure connected state is set
            setSessionStartTime(Date.now());

            console.log('[ARENA] 🚀 Voice roleplay started!');

        } catch (err) {
            console.error('[ARENA] ❌ Failed to start session:', err);
            setError(err instanceof Error ? err.message : 'Failed to start session');
            endSession();
        } finally {
            setIsConnecting(false);
        }
    };

    const [sessionStartTime, setSessionStartTime] = useState<number | null>(null);

    const [isProcessing, setIsProcessing] = useState(false);

    const [transcript, setTranscript] = useState<string | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analysisResult, setAnalysisResult] = useState<{ overall_score: number; summary: string } | null>(null);

    const pollForAnalysis = async (sessionId: string) => {
        setIsAnalyzing(true);
        setAnalysisResult(null);

        let attempts = 0;
        const maxAttempts = 30; // 30 * 2s = 60s timeout

        const interval = setInterval(async () => {
            attempts++;
            if (attempts > maxAttempts) {
                clearInterval(interval);
                setIsAnalyzing(false);
                return;
            }

            const { data } = await supabase
                .from('voice_sessions')
                .select('analysis')
                .eq('id', sessionId)
                .single();

            if (data?.analysis) {
                clearInterval(interval);
                setAnalysisResult({
                    overall_score: data.analysis.score,
                    summary: data.analysis.summary
                });
                setIsAnalyzing(false);
            }
        }, 2000);
    };

    const endSession = async () => {
        console.log('[ARENA] Ending session...');
        if (client) {
            setIsProcessing(true); // Start loading state
            setTranscript(null);
            setAnalysisResult(null);
            setIsAnalyzing(false);

            // Get the recorded audio blob instead of a text transcript
            const audioBlob = await client.disconnectAndGetBlob();

            const endTime = Date.now();
            const duration = sessionStartTime ? Math.round((endTime - sessionStartTime) / 1000) : 0;

            console.log(`[ARENA] Session ended. Audio size: ${audioBlob.size} bytes`);

            // Save session audio to backend for Gemini/Gemini
            try {
                const formData = new FormData();
                const userId = profile?.id || '00000000-0000-0000-0000-000000000000';

                formData.append('audio', audioBlob, 'session_recording.webm');
                formData.append('user_id', userId);
                formData.append('agent_id', agentIdRef.current || '');
                formData.append('duration_seconds', duration.toString());
                formData.append('started_at', sessionStartTime ? new Date(sessionStartTime).toISOString() : new Date().toISOString());
                formData.append('ended_at', new Date().toISOString());

                const productDesc = (currentLanguageInfo as any)?.product_description || (profile?.organizations?.product_description) || '';
                formData.append('product_description', productDesc);
                formData.append('language_code', targetLocale || 'en'); // Required for analysis

                console.log('[ARENA] 🎙️ Uploading session audio...', { size: audioBlob.size, duration });

                const resp = await fetch(`${API_URL}/api/voice-agent/end-session`, {
                    method: 'POST',
                    body: formData
                });

                if (resp.ok) {
                    console.log('[ARENA] ✅ Audio uploaded and transcript generated successfully');
                    const respData = await resp.json();
                    console.log('[ARENA] Server response:', respData);

                    setTranscript(respData.transcript);

                    // Start polling for analysis
                    if (respData.session_id) {
                        pollForAnalysis(respData.session_id);
                    }
                } else {
                    const errText = await resp.text();
                    console.error(`[ARENA] ❌ Failed to save session. Status: ${resp.status}`, errText);
                    setError(`Failed to save session: ${errText}`);
                }
            } catch (e) {
                console.error('[ARENA] Failed to save session:', e);
                setError('Failed to save session. Please try again.');
            }
        }
        setIsConnected(false);
        setIsMicActive(false);
        setSessionStartTime(null);
        setIsProcessing(false); // End loading state
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
        <div className="h-screen bg-dark-50 relative overflow-hidden font-body flex flex-col">
            {/* Background Grid Pattern */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#0000000a_1px,transparent_1px),linear-gradient(to_bottom,#0000000a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />

            {/* Compact Header Bar */}
            <div className="relative z-10 border-b-4 border-black bg-white px-6 py-3 flex items-center justify-between shadow-brutal-sm shrink-0">
                <div className="flex items-center gap-4">
                    <div className="bg-accent-200 border-2 border-black px-3 py-1 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                        <Sparkles className="w-4 h-4 text-black inline-block mr-2" />
                        <span className="font-display font-bold uppercase text-xs tracking-wider">Arena</span>
                    </div>
                    <h1 className="font-display font-bold text-2xl uppercase tracking-tight hidden md:block">
                        {t('arena.title')}
                    </h1>
                </div>

                {/* Language Info - Compact */}
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-3">
                        <span className="text-2xl">{currentLanguageInfo?.flag}</span>
                        <div className="leading-none">
                            <div className="font-display font-bold text-sm uppercase">{currentLanguageInfo?.nativeName}</div>
                            <div className="font-mono text-[10px] text-gray-500">{currentLanguageInfo?.code}</div>
                        </div>
                    </div>
                    {/* Timer */}
                    {isConnected && (
                        <div className="font-mono font-bold text-xl flex items-center gap-2 bg-dark-100 px-3 py-1 border-2 border-black">
                            <Clock className="w-4 h-4" />
                            <Timer isRunning={isConnected} />
                        </div>
                    )}
                </div>
            </div>

            {/* Main Stage */}
            <div className="flex-1 relative z-10 p-4 flex items-center justify-center min-h-0">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="w-full max-w-7xl h-full flex gap-4"
                >
                    {/* Mission Briefing Sidebar */}
                    <div className="w-80 shrink-0 flex flex-col gap-4">
                        <div className="flex-1 bg-white border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex flex-col overflow-hidden">
                            <div className="bg-black text-white px-4 py-2 font-display font-bold uppercase text-sm tracking-wider">
                                {t('arena.mission_briefing')}
                            </div>
                            <div className="p-4 flex-1 overflow-y-auto">
                                <h4 className="font-display font-bold uppercase text-xs text-gray-400 mb-2">{t('arena.active_persona')}</h4>
                                {isGeneratingPrompt ? (
                                    <div className="flex items-center gap-2 text-gray-500 italic text-sm">
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        <span>{t('arena.crafting_persona')}</span>

                                    </div>
                                ) : (
                                    <div className="bg-gray-50 border-2 border-black p-3 font-mono text-[11px] leading-relaxed whitespace-pre-wrap">
                                        {systemPrompt}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Interaction Panel */}
                    <div className="flex-1 bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-6 md:p-8 flex flex-col items-center justify-center relative overflow-hidden">

                        {/* Error Message Overlay */}
                        {error && (
                            <div className="absolute top-4 left-4 right-4 z-50 p-3 bg-red-100 border-4 border-red-500 text-red-700 font-bold flex items-center gap-3 shadow-brutal-sm">
                                <span className="text-xl">❌</span>
                                {error}
                            </div>
                        )}

                        {/* STATES */}
                        {isProcessing ? (
                            <div className="text-center">
                                <div className="w-20 h-20 mx-auto border-4 border-black border-t-indigo-500 rounded-full animate-spin mb-6" />
                                <h3 className="font-display font-bold text-2xl uppercase mb-2">{t('arena.analyzing_session')}</h3>
                                <p className="text-gray-600 font-medium">{t('arena.calculating_score')}</p>
                            </div>
                        ) : !isConnected && transcript ? (
                            <div className="w-full h-full flex flex-col">
                                <h3 className="font-display font-bold text-3xl uppercase mb-4 text-center shrink-0">{t('arena.mission_debrief')}</h3>

                                <div className="flex-1 min-h-0 flex flex-col md:flex-row gap-6">
                                    {/* Transcript */}
                                    <div className="flex-1 bg-gray-50 border-4 border-black p-4 font-mono text-sm overflow-y-auto whitespace-pre-wrap">
                                        {transcript}
                                    </div>

                                    {/* Score */}
                                    <div className="w-full md:w-80 shrink-0 flex flex-col gap-4">
                                        {isAnalyzing ? (
                                            <div className="flex-1 flex items-center justify-center border-4 border-black bg-accent-50">
                                                <Loader2 className="w-8 h-8 animate-spin mr-2" />
                                                <span className="font-bold uppercase">{t('arena.scoring')}</span>
                                            </div>
                                        ) : analysisResult && (
                                            <div className="flex-1 bg-accent-50 border-4 border-black p-6 shadow-brutal-sm flex flex-col">
                                                <div className="flex justify-between items-start mb-4">
                                                    <span className="font-display font-bold uppercase text-lg">{t('arena.cultural_iq')}</span>
                                                    <div className={`text-5xl font-black ${analysisResult.overall_score >= 80 ? 'text-green-600' :
                                                        analysisResult.overall_score >= 60 ? 'text-yellow-600' : 'text-red-600'
                                                        }`}>
                                                        {analysisResult.overall_score}
                                                    </div>
                                                </div>
                                                <p className="text-sm font-medium leading-relaxed overflow-y-auto flex-1">
                                                    {analysisResult.summary}
                                                </p>
                                            </div>
                                        )}

                                        <button
                                            onClick={() => {
                                                setTranscript(null);
                                                setAnalysisResult(null);
                                                setError(null);
                                                startSession();
                                            }}
                                            disabled={isAnalyzing}
                                            className="btn-brutal w-full py-4 text-sm"
                                        >
                                            {t('arena.next_mission')}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            // IDLE / CONNECTED
                            <div className="text-center w-full max-w-lg">
                                {/* Mic Viz */}
                                <div className="mb-8 relative h-48 flex items-center justify-center">
                                    <motion.div
                                        className={`w-36 h-36 border-4 border-black rounded-full flex items-center justify-center shadow-brutal transition-colors duration-300 ${isConnected
                                            ? (isMicActive ? 'bg-green-500' : 'bg-red-500')
                                            : 'bg-gray-100'
                                            }`}
                                        animate={isConnected && isMicActive ? { scale: [1, 1.05, 1] } : {}}
                                        transition={{ repeat: Infinity, duration: 1.5 }}
                                    >
                                        {isConnected ? (
                                            isMicActive ? <Mic className="w-16 h-16 text-black" /> : <MicOff className="w-16 h-16 text-white" />
                                        ) : (
                                            <Mic className="w-16 h-16 text-gray-400" />
                                        )}
                                    </motion.div>
                                </div>

                                {/* Text Status */}
                                <h2 className="font-display font-bold text-4xl uppercase mb-2">
                                    {isConnected ? (isMicActive ? t('arena.adjusting') : t('arena.muted')) : t('arena.ready_to_train')}
                                </h2>
                                <p className="text-lg text-gray-600 mb-8 font-medium">
                                    {isConnected ? t('arena.speak_naturally') : `${t('arena.practice_skills')} (${currentLanguageInfo?.nativeName})`}
                                </p>

                                {/* Buttons */}
                                {!isConnected ? (
                                    <button
                                        onClick={startSession}
                                        disabled={isConnecting}
                                        className="btn-brutal w-full text-xl py-4 flex items-center justify-center gap-3 disabled:opacity-50"
                                    >
                                        {isConnecting ? <Loader2 className="animate-spin" /> : <Mic />}
                                        {t('arena.start_simulation')}
                                    </button>
                                ) : (
                                    <div className="flex gap-4">
                                        <button onClick={toggleMic} className="flex-1 btn-brutal-outline py-4">
                                            {isMicActive ? t('arena.mute') : t('arena.unmute')}
                                        </button>
                                        <button onClick={endSession} className="flex-1 btn-brutal bg-red-500 text-white border-black py-4 hover:bg-red-600">
                                            {t('arena.end_session')}
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </motion.div>
            </div>

            {/* Footer / How it works - Very Compact */}
            <div className="bg-white border-t-4 border-black p-3 z-10 shrink-0">
                <div className="container mx-auto flex items-center justify-between text-xs font-bold uppercase tracking-wider text-gray-500">
                    <div className="hidden md:flex gap-6">
                        <span className="flex items-center gap-2"><span className="w-2 h-2 bg-black rounded-full" /> Gemini 2.5 Persona</span>
                        <span className="flex items-center gap-2"><span className="w-2 h-2 bg-black rounded-full" /> Cartesia Voice</span>
                        <span className="flex items-center gap-2"><span className="w-2 h-2 bg-black rounded-full" /> Culture Check</span>
                    </div>
                    <div>
                        Lingo.dev Arena v1.0
                    </div>
                </div>
            </div>
        </div>
    );
}

