import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Award, Target, Zap, BarChart3 } from 'lucide-react';
import { Area, AreaChart, ResponsiveContainer, XAxis, YAxis, Tooltip, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface CallWithScore {
    id: string;
    created_at: string;
    call_scores: {
        overall_score: number;
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
    } | null;
}

export default function MyProgressPage() {
    const { profile } = useAuth();
    const [calls, setCalls] = useState<CallWithScore[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchCalls();
    }, [profile]); // Removed timePeriod dependency

    const fetchCalls = async () => {
        if (!profile?.id) return;

        setLoading(true);

        const { data, error } = await supabase
            .from('calls')
            .select(`
                id,
                created_at,
                call_scores (
                    overall_score,
                    score_needs_discovery,
                    score_value_proposition,
                    score_decision_process,
                    score_stakeholder_id,
                    score_insight_delivery,
                    score_objection_handling,
                    score_active_listening,
                    score_competition,
                    score_next_steps,
                    score_call_control
                )
            `)
            .eq('user_id', profile.id)
            .order('created_at', { ascending: true });

        if (error) {
            console.error('Error fetching calls:', error);
        } else {
            // Transform data to match our interface (call_scores comes as array from Supabase)
            const transformedData = (data || []).map(call => ({
                ...call,
                call_scores: Array.isArray(call.call_scores) ? call.call_scores[0] : call.call_scores
            }));
            setCalls(transformedData);
        }
        setLoading(false);
    };

    // Calculate stats
    const avgScore = calls.length > 0
        ? calls.reduce((sum, call) => sum + (call.call_scores?.overall_score || 0), 0) / calls.length
        : 0;

    const bestScore = calls.length > 0
        ? Math.max(...calls.map(call => call.call_scores?.overall_score || 0))
        : 0;

    const totalCalls = calls.length;

    // Weekly trend data
    const weeklyData = calls.slice(-7).map((call) => ({
        day: new Date(call.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
        score: Number(call.call_scores?.overall_score || 0),
    }));

    // Skills breakdown (average of all parameters)
    const skillsData = calls.length > 0 ? [
        {
            skill: 'Discovery',
            score: Number(calls.reduce((sum, c) => sum + Number(c.call_scores?.score_needs_discovery || 0), 0) / calls.length),
        },
        {
            skill: 'Value Prop',
            score: Number(calls.reduce((sum, c) => sum + Number(c.call_scores?.score_value_proposition || 0), 0) / calls.length),
        },
        {
            skill: 'Decision',
            score: Number(calls.reduce((sum, c) => sum + Number(c.call_scores?.score_decision_process || 0), 0) / calls.length),
        },
        {
            skill: 'Stakeholder',
            score: Number(calls.reduce((sum, c) => sum + Number(c.call_scores?.score_stakeholder_id || 0), 0) / calls.length),
        },
        {
            skill: 'Insights',
            score: Number(calls.reduce((sum, c) => sum + Number(c.call_scores?.score_insight_delivery || 0), 0) / calls.length),
        },
        {
            skill: 'Objections',
            score: Number(calls.reduce((sum, c) => sum + Number(c.call_scores?.score_objection_handling || 0), 0) / calls.length),
        },
        {
            skill: 'Listening',
            score: Number(calls.reduce((sum, c) => sum + Number(c.call_scores?.score_active_listening || 0), 0) / calls.length),
        },
        {
            skill: 'Competition',
            score: Number(calls.reduce((sum, c) => sum + Number(c.call_scores?.score_competition || 0), 0) / calls.length),
        },
        {
            skill: 'Next Steps',
            score: Number(calls.reduce((sum, c) => sum + Number(c.call_scores?.score_next_steps || 0), 0) / calls.length),
        },
        {
            skill: 'Control',
            score: Number(calls.reduce((sum, c) => sum + Number(c.call_scores?.score_call_control || 0), 0) / calls.length),
        },
    ] : [];

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="w-16 h-16 border-8 border-black border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="font-black uppercase text-sm">Loading Progress...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto space-y-8 pb-20">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col md:flex-row md:items-end justify-between gap-6"
            >
                <div>
                    <h1 className="font-black text-5xl md:text-6xl uppercase tracking-tight mb-2">
                        My Progress
                    </h1>
                    <p className="text-gray-600 font-bold uppercase text-xs tracking-widest">
                        Track your performance over time
                    </p>
                </div>

                {/* Time Period Selector Removed */}
            </motion.div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-gradient-to-br from-blue-400 to-blue-600 border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] p-6 text-white"
                >
                    <div className="flex items-center justify-between mb-2">
                        <TrendingUp className="w-10 h-10" />
                        <div className="text-5xl font-black">{Math.round(avgScore)}</div>
                    </div>
                    <p className="text-xs font-black uppercase">Average Score</p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-gradient-to-br from-orange-400 to-orange-600 border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] p-6 text-white"
                >
                    <div className="flex items-center justify-between mb-2">
                        <Award className="w-10 h-10" />
                        <div className="text-5xl font-black">{bestScore}</div>
                    </div>
                    <p className="text-xs font-black uppercase">Best Score</p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-gradient-to-br from-green-400 to-green-600 border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] p-6 text-white"
                >
                    <div className="flex items-center justify-between mb-2">
                        <Zap className="w-10 h-10" />
                        <div className="text-5xl font-black">{totalCalls}</div>
                    </div>
                    <p className="text-xs font-black uppercase">Total Calls</p>
                </motion.div>
            </div>

            {/* Performance Trend Chart */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-white border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] p-6"
            >
                <h2 className="font-black text-2xl uppercase mb-6 flex items-center gap-2">
                    <BarChart3 className="w-6 h-6" />
                    Performance Trend
                </h2>
                {weeklyData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                        <AreaChart data={weeklyData}>
                            <XAxis
                                dataKey="day"
                                stroke="#000"
                                strokeWidth={3}
                                style={{ fontFamily: 'inherit', fontWeight: 900, fontSize: 12 }}
                            />
                            <YAxis
                                stroke="#000"
                                strokeWidth={3}
                                style={{ fontFamily: 'inherit', fontWeight: 900, fontSize: 12 }}
                                domain={[0, 100]}
                            />
                            <Tooltip
                                contentStyle={{
                                    border: '4px solid black',
                                    boxShadow: '4px 4px 0px 0px rgba(0,0,0,1)',
                                    fontWeight: 900,
                                    textTransform: 'uppercase',
                                }}
                            />
                            <Area
                                type="monotone"
                                dataKey="score"
                                stroke="#000"
                                strokeWidth={4}
                                fill="#60a5fa"
                                connectNulls
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                ) : (
                    <p className="text-center text-gray-400 font-bold uppercase py-12">No data for this period</p>
                )}
            </motion.div>

            {/* Skills Breakdown (Radar Chart) */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="bg-white border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] p-6"
            >
                <h2 className="font-black text-2xl uppercase mb-6 flex items-center gap-2">
                    <Target className="w-6 h-6" />
                    Skills Breakdown
                </h2>
                {skillsData.length > 0 ? (
                    <div className="flex justify-center">
                        <ResponsiveContainer width="100%" height={400}>
                            <RadarChart cx="50%" cy="50%" outerRadius="65%" data={skillsData}>
                                <PolarGrid stroke="#000" strokeWidth={2} />
                                <PolarAngleAxis
                                    dataKey="skill"
                                    stroke="#000"
                                    strokeWidth={2}
                                    style={{ fontFamily: 'inherit', fontWeight: 900, fontSize: 10 }}
                                />
                                <PolarRadiusAxis
                                    angle={30}
                                    domain={[0, 100]}
                                    stroke="#000"
                                    strokeWidth={2}
                                    style={{ fontFamily: 'inherit', fontWeight: 900 }}
                                />
                                <Radar
                                    name="Skill Score"
                                    dataKey="score"
                                    stroke="#000"
                                    fill="#60a5fa"
                                    fillOpacity={0.6}
                                    strokeWidth={3}
                                />
                            </RadarChart>
                        </ResponsiveContainer>
                    </div>
                ) : (
                    <p className="text-center text-gray-400 font-bold uppercase py-12">No skills data available</p>
                )}
            </motion.div>
        </div>
    );
}

