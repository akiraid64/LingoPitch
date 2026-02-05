import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CheckCircle, AlertCircle, ArrowLeft, Calendar, Clock, User, Phone } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

interface CallDetail {
    id: string;
    title: string;
    created_at: string;
    duration_seconds: number;
    transcript: string; // or JSON
    customer_name: string;
    call_scores: Array<{
        overall_score: number;
        summary: string;
        executive_summary: string;
        sentiment: string;
        strengths: string[];
        weaknesses: string[];
        coaching_tips: string[];
        score_needs_discovery: number;
        score_value_proposition: number;
        score_decision_process: number;
        score_stakeholder_id: number;
        score_insight_delivery: number;
        score_objection_handling: number;
        score_active_listening: number;
        score_competition: number;
        score_next_steps: number;
        score_call_control: number;
        raw_response: any;
    }>;
    profiles?: {
        full_name: string;
        email: string;
    };
    voice_sessions?: Array<{
        transcript: string;
    }>;
}

export default function CallDetailPage() {
    const { callId } = useParams<{ callId: string }>();
    const { session } = useAuth();
    const navigate = useNavigate();
    const [call, setCall] = useState<CallDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchCall = async () => {
            if (!callId || !session?.access_token) return;

            try {
                // Fetch call with scores, profile info AND voice_sessions (for transcript)
                const { data, error } = await supabase
                    .from('calls')
                    .select(`
                        *,
                        call_scores (*),
                        voice_sessions (*),
                        profiles:user_id (full_name, email)
                    `)
                    .eq('id', callId)
                    .single();

                if (error) throw error;
                if (!data) throw new Error('Call not found');

                setCall(data);
            } catch (err: any) {
                console.error('Error fetching call:', err);
                setError(err.message || 'Failed to load call details');
            } finally {
                setLoading(false);
            }
        };

        fetchCall();
    }, [callId, session]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="w-16 h-16 border-4 border-black border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (error || !call) {
        return (
            <div className="max-w-2xl mx-auto mt-20 p-8 bg-red-50 border-4 border-black">
                <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
                <h2 className="font-black text-2xl uppercase text-center mb-2">Error</h2>
                <p className="text-center font-bold text-red-600">{error || 'Call not found'}</p>
                <button
                    onClick={() => navigate(-1)}
                    className="mt-6 mx-auto block px-6 py-3 bg-black text-white font-black uppercase"
                >
                    Go Back
                </button>
            </div>
        );
    }

    const scoreData = call.call_scores?.[0];
    const overallScore = scoreData?.overall_score || 0;
    // Prefer transcript from voice_sessions if available
    // Prefer transcript from voice_sessions if available, otherwise check if call.transcript is a string
    const transcript = call.voice_sessions?.[0]?.transcript || (typeof call.transcript === 'string' ? call.transcript : '');

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4">
            <div className="max-w-6xl mx-auto space-y-8">
                {/* Header Actions */}
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-gray-600 hover:text-black font-bold transition-colors"
                >
                    <ArrowLeft className="w-5 h-5" />
                    Back to History
                </button>

                {/* Call Header Card */}
                <div className="bg-white border-8 border-black p-8 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]">
                    <div className="flex flex-col md:flex-row justify-between gap-8">
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <span className={`px-3 py-1 font-black text-xs uppercase ${overallScore >= 80 ? 'bg-green-400' : overallScore >= 60 ? 'bg-yellow-400' : 'bg-red-400'
                                    }`}>
                                    {overallScore >= 80 ? 'Excellent' : overallScore >= 60 ? 'Average' : 'Needs Work'}
                                </span>
                                <span className="text-gray-500 font-mono text-xs uppercase">{call.id}</span>
                            </div>
                            <h1 className="font-black text-3xl md:text-5xl uppercase tracking-tight mb-4">
                                {call.title || 'Untitled Call'}
                            </h1>

                            <div className="flex flex-wrap gap-6 text-sm font-bold text-gray-600">
                                <div className="flex items-center gap-2">
                                    <User className="w-5 h-5 text-black" />
                                    {call.profiles?.full_name || call.profiles?.email || 'Unknown User'}
                                </div>
                                <div className="flex items-center gap-2">
                                    <Calendar className="w-5 h-5 text-black" />
                                    {new Date(call.created_at).toLocaleString()}
                                </div>
                                <div className="flex items-center gap-2">
                                    <Clock className="w-5 h-5 text-black" />
                                    {Math.round(call.duration_seconds || 0)}s
                                </div>
                                <div className="flex items-center gap-2">
                                    <Phone className="w-5 h-5 text-black" />
                                    {call.customer_name || 'Prospect'} (AI Agent)
                                </div>
                            </div>
                        </div>

                        <div className="text-center shrink-0">
                            <div className={`text-7xl font-black p-6 border-4 border-black mb-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] ${overallScore >= 80 ? 'bg-green-400' : overallScore >= 60 ? 'bg-yellow-400' : 'bg-red-400'
                                }`}>
                                {overallScore}
                            </div>
                            <p className="font-bold uppercase text-xs tracking-widest text-gray-500">Overall Score</p>
                        </div>
                    </div>
                </div>

                <div className="grid lg:grid-cols-3 gap-8">
                    {/* LEFT COLUMN: Transcript & Summary */}
                    <div className="lg:col-span-2 space-y-8">

                        {/* Executive Summary */}
                        {scoreData && (
                            <div className="bg-white border-4 border-black p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                                <h3 className="font-black text-xl uppercase mb-4 flex items-center gap-2">
                                    <CheckCircle className="w-6 h-6" />
                                    Executive Summary
                                </h3>
                                <p className="text-lg leading-relaxed text-gray-800 font-medium border-l-4 border-yellow-400 pl-4">
                                    {scoreData.executive_summary || scoreData.summary || 'No summary available.'}
                                </p>
                            </div>
                        )}

                        {/* Transcript Viewer */}
                        <div className="bg-white border-4 border-black p-0 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
                            <div className="bg-gray-100 border-b-4 border-black p-4 flex items-center justify-between">
                                <h3 className="font-black text-xl uppercase flex items-center gap-2">
                                    <span className="text-2xl">📝</span> Session Transcript
                                </h3>
                                <button
                                    onClick={() => navigator.clipboard.writeText(transcript || '')}
                                    className="text-xs font-bold uppercase hover:underline"
                                >
                                    Copy Text
                                </button>
                            </div>
                            <div className="p-6 max-h-[500px] overflow-y-auto font-mono text-sm leading-relaxed whitespace-pre-wrap bg-gray-50">
                                {transcript || (
                                    <span className="text-gray-400 italic">No transcript available for this session.</span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* RIGHT COLUMN: Scores & Coaching */}
                    <div className="space-y-8">
                        {scoreData ? (
                            <>
                                {/* Sales Scorecard */}
                                <div className="bg-white border-4 border-black p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
                                    <h3 className="font-black text-xl uppercase mb-6 border-b-4 border-gray-100 pb-2">Sales Scorecard</h3>
                                    <div className="space-y-5">
                                        <ScoreRow label="Needs Discovery" score={scoreData.score_needs_discovery} />
                                        <ScoreRow label="Value Proposition" score={scoreData.score_value_proposition} />
                                        <ScoreRow label="Decision Process" score={scoreData.score_decision_process} />
                                        <ScoreRow label="Objection Handling" score={scoreData.score_objection_handling} />
                                        <ScoreRow label="Closing Steps" score={scoreData.score_next_steps} />
                                        <ScoreRow label="Active Listening" score={scoreData.score_active_listening} />
                                    </div>
                                </div>

                                {/* Coaching Tips */}
                                <div className="bg-purple-100 border-4 border-black p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
                                    <h3 className="font-black text-xl uppercase mb-4 text-purple-900 flex items-center gap-2">
                                        <span className="text-2xl">💡</span> Coaching Tips
                                    </h3>
                                    <ul className="space-y-4">
                                        {scoreData.coaching_tips?.map((tip, i) => (
                                            <li key={i} className="flex gap-3 items-start bg-white p-3 border-2 border-black shadow-brutal-sm">
                                                <span className="font-black text-purple-600 bg-purple-100 w-6 h-6 flex items-center justify-center border border-black rounded-full shrink-0 text-xs">{i + 1}</span>
                                                <span className="font-medium text-sm leading-tight">{tip}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                {/* Cultural Intel */}
                                <div className="bg-blue-100 border-4 border-black p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
                                    <h3 className="font-black text-xl uppercase mb-4 text-blue-900 flex items-center gap-2">
                                        <span className="text-2xl">🌍</span> Cultural Intel
                                    </h3>
                                    <div className="space-y-3">
                                        <div className="flex justify-between items-center bg-white p-3 border-2 border-black">
                                            <span className="font-bold text-sm">Appropriateness</span>
                                            <span className="font-black text-blue-600">{scoreData.raw_response?.cultural_scores?.scoreCulturalAppropriateness || '-'}</span>
                                        </div>
                                        <div className="flex justify-between items-center bg-white p-3 border-2 border-black">
                                            <span className="font-bold text-sm">Formality Match</span>
                                            <span className="font-black text-blue-600">{scoreData.raw_response?.cultural_scores?.scoreLanguageFormality || '-'}</span>
                                        </div>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="bg-yellow-50 border-4 border-black p-8 text-center text-yellow-800 font-bold shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
                                <p className="mb-2 text-3xl">⏳</p>
                                <p>Detailed analysis is not available for this call.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

function ScoreRow({ label, score }: { label: string; score: number }) {
    let colorClass = 'bg-red-500';
    if (score >= 80) colorClass = 'bg-green-500';
    else if (score >= 60) colorClass = 'bg-yellow-400';

    return (
        <div className="flex items-center justify-between gap-4">
            <span className="font-bold text-sm">{label}</span>
            <div className="flex items-center gap-3 flex-1 justify-end">
                <div className="w-24 h-3 bg-gray-200 border border-black rounded-full overflow-hidden">
                    <div className={`h-full border-r border-black ${colorClass}`} style={{ width: `${score}%` }} />
                </div>
                <span className="font-black font-mono w-8 text-right text-sm">{score}</span>
            </div>
        </div>
    );
}
