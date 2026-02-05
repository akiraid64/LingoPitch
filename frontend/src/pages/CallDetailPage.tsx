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
                // Fetch call with scores and profile info
                const { data, error } = await supabase
                    .from('calls')
                    .select(`
                        *,
                        call_scores (*),
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

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4">
            <div className="max-w-5xl mx-auto space-y-8">
                {/* Header Actions */}
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-gray-600 hover:text-black font-bold transition-colors"
                >
                    <ArrowLeft className="w-5 h-5" />
                    Back
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
                            <h1 className="font-black text-3xl md:text-4xl uppercase tracking-tight mb-4">
                                {call.title || 'Untitled Call'}
                            </h1>

                            <div className="flex flex-wrap gap-6 text-sm font-bold text-gray-600">
                                <div className="flex items-center gap-2">
                                    <User className="w-4 h-4" />
                                    {call.profiles?.full_name || call.profiles?.email || 'Unknown User'}
                                </div>
                                <div className="flex items-center gap-2">
                                    <Calendar className="w-4 h-4" />
                                    {new Date(call.created_at).toLocaleString()}
                                </div>
                                <div className="flex items-center gap-2">
                                    <Clock className="w-4 h-4" />
                                    {Math.round(call.duration_seconds / 60)} mins
                                </div>
                                <div className="flex items-center gap-2">
                                    <Phone className="w-4 h-4" />
                                    {call.customer_name || 'Prospect'}
                                </div>
                            </div>
                        </div>

                        <div className="text-center shrink-0">
                            <div className={`text-6xl font-black p-6 border-4 border-black mb-2 ${overallScore >= 80 ? 'bg-green-400' : overallScore >= 60 ? 'bg-yellow-400' : 'bg-red-400'
                                }`}>
                                {overallScore}
                            </div>
                            <p className="font-bold uppercase text-xs tracking-widest text-gray-500">Overall Score</p>
                        </div>
                    </div>
                </div>

                {scoreData ? (
                    <>
                        {/* Executive Summary */}
                        <div className="bg-white border-4 border-black p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                            <h3 className="font-black text-xl uppercase mb-4 flex items-center gap-2">
                                <CheckCircle className="w-6 h-6" />
                                Executive Summary
                            </h3>
                            <p className="text-lg leading-relaxed text-gray-800">
                                {scoreData.executive_summary || scoreData.summary || 'No summary available.'}
                            </p>
                        </div>

                        {/* Analysis Grid */}
                        <div className="grid md:grid-cols-2 gap-6">
                            {/* Sales Parameters */}
                            <div className="bg-white border-4 border-black p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
                                <h3 className="font-black text-xl uppercase mb-6 border-b-4 border-gray-100 pb-2">Sales Scorecard</h3>
                                <div className="space-y-4">
                                    <ScoreRow label="Needs Discovery" score={scoreData.score_needs_discovery} />
                                    <ScoreRow label="Value Proposition" score={scoreData.score_value_proposition} />
                                    <ScoreRow label="Decision Process" score={scoreData.score_decision_process} />
                                    <ScoreRow label="Objection Handling" score={scoreData.score_objection_handling} />
                                    <ScoreRow label="Closing Steps" score={scoreData.score_next_steps} />
                                    <ScoreRow label="Active Listening" score={scoreData.score_active_listening} />
                                </div>
                            </div>

                            {/* Coaching & Cultural */}
                            <div className="space-y-6">
                                <div className="bg-purple-100 border-4 border-black p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
                                    <h3 className="font-black text-xl uppercase mb-4 text-purple-900">Coaching Tips</h3>
                                    <ul className="space-y-3">
                                        {scoreData.coaching_tips?.map((tip, i) => (
                                            <li key={i} className="flex gap-3 bg-white p-3 border-2 border-black">
                                                <span className="font-black text-purple-600">#{i + 1}</span>
                                                <span className="font-medium text-sm">{tip}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                <div className="bg-blue-100 border-4 border-black p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
                                    <h3 className="font-black text-xl uppercase mb-4 text-blue-900">Cultural Intel</h3>
                                    <div className="space-y-3">
                                        {/* Note: Cultural scores are in raw_response in current implementation */}
                                        <div className="flex justify-between items-center bg-white p-2 border-2 border-black">
                                            <span className="font-bold text-sm">Appropriateness</span>
                                            <span className="font-black">{scoreData.raw_response?.cultural_scores?.scoreCulturalAppropriateness || '-'}</span>
                                        </div>
                                        <div className="flex justify-between items-center bg-white p-2 border-2 border-black">
                                            <span className="font-bold text-sm">Formality Match</span>
                                            <span className="font-black">{scoreData.raw_response?.cultural_scores?.scoreLanguageFormality || '-'}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="bg-yellow-50 border-4 border-black p-8 text-center text-yellow-800 font-bold">
                        Analysis processing or not available for this call.
                    </div>
                )}
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
