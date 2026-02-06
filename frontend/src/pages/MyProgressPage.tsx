
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Award, Target, Zap, BarChart3, Loader2 } from 'lucide-react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    RadialLinearScale,
    Title,
    Tooltip,
    Legend,
    Filler,
} from 'chart.js';
import { Bar, Radar } from 'react-chartjs-2';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

// Register ChartJS components
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    RadialLinearScale,
    Title,
    Tooltip,
    Legend,
    Filler
);

interface CallScore {
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
}

interface CallWithScore {
    id: string;
    created_at: string;
    call_scores?: CallScore | CallScore[];
}

export default function MyProgressPage() {
    const { profile } = useAuth();
    const [calls, setCalls] = useState<CallWithScore[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchCalls();
    }, [profile]);

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
            console.error('Error fetching progress:', error);
        } else {
            const formattedData = (data || []).map((c: any) => ({
                ...c,
                call_scores: Array.isArray(c.call_scores) ? c.call_scores[0] : c.call_scores
            }));
            setCalls(formattedData);
        }
        setLoading(false);
    };

    // 1. Weekly Data (Bar Chart)
    const weeklyData = calls.slice(-7).map((call) => {
        const score = Number((call.call_scores as CallScore)?.overall_score || 0);
        return {
            day: new Date(call.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
            score: score,
        };
    });

    const barChartData = {
        labels: weeklyData.map(d => d.day),
        datasets: [
            {
                label: 'Performance Score',
                data: weeklyData.map(d => d.score),
                backgroundColor: '#8b5cf6',
                borderColor: 'black',
                borderWidth: 3,
                hoverBackgroundColor: '#a78bfa',
            },
        ],
    };

    const barOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            tooltip: {
                backgroundColor: 'black',
                titleColor: 'white',
                bodyColor: 'white',
                titleFont: { weight: 'bold' as const, family: 'inherit' },
                padding: 12,
                cornerRadius: 0,
            },
        },
        scales: {
            x: {
                grid: { display: false },
                ticks: { color: 'black', font: { weight: 'bold' as const } },
                border: { color: 'black', width: 3 },
            },
            y: {
                grid: { color: '#e5e7eb' },
                ticks: { color: 'black', font: { weight: 'bold' as const } },
                border: { color: 'black', width: 3 },
                min: 0,
                max: 100,
            },
        },
    };

    // 2. Skills Radar
    const skillKeys: (keyof CallScore)[] = [
        'score_needs_discovery',
        'score_value_proposition',
        'score_decision_process',
        'score_stakeholder_id',
        'score_insight_delivery',
        'score_objection_handling',
        'score_active_listening',
        'score_competition',
        'score_next_steps',
        'score_call_control'
    ];

    const formatSkillName = (key: string) =>
        key.replace('score_', '').split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
            .replace('Id', '')
            .replace('Needs', '')
            .trim();

    const skillsData = skillKeys.map(key => {
        const getScore = (c: CallWithScore) => {
            const scores = c.call_scores as any;
            return Number(scores?.[key] || 0);
        };
        return {
            skill: formatSkillName(key),
            score: Number(calls.reduce((sum, c) => sum + getScore(c), 0) / (calls.length || 1)),
        };
    });

    const radarChartData = {
        labels: skillsData.map(s => s.skill),
        datasets: [
            {
                label: 'Skill Proficiency',
                data: skillsData.map(s => s.score),
                backgroundColor: 'rgba(250, 204, 21, 0.7)',
                borderColor: 'black',
                borderWidth: 3,
                pointBackgroundColor: 'black',
                pointBorderColor: 'white',
            },
        ],
    };

    const radarOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            tooltip: { backgroundColor: 'black', cornerRadius: 0 }
        },
        scales: {
            r: {
                angleLines: { color: '#d1d5db' },
                grid: { color: '#9ca3af', lineWidth: 2 },
                pointLabels: { color: 'black', font: { size: 11, weight: 'bold' as const } },
                ticks: { display: false, stepSize: 20 },
                min: 0,
                max: 100,
            },
        },
    };

    if (loading) {
        return (
            <div className="h-screen flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-12 h-12 animate-spin text-violet-600" />
                    <p className="font-black uppercase tracking-widest text-gray-400">Loading Stats...</p>
                </div>
            </div>
        );
    }

    const totalCalls = calls.length;
    const avgScore = totalCalls > 0
        ? Math.round(calls.reduce((sum, c) => sum + Number((c.call_scores as CallScore)?.overall_score || 0), 0) / totalCalls)
        : 0;

    return (
        <div className="max-w-6xl mx-auto space-y-10 pb-20">
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col md:flex-row md:items-end justify-between gap-6"
            >
                <div>
                    <h1 className="text-5xl font-black uppercase tracking-tighter mb-2">
                        My <span className="text-violet-600">Progress</span>
                    </h1>
                    <p className="text-gray-600 font-bold uppercase tracking-widest text-sm">
                        Track your evolution from Rookie to Legend
                    </p>
                </div>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="bg-white border-4 border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex items-center justify-between"
                >
                    <div>
                        <p className="text-xs font-black uppercase text-gray-400 tracking-wider">Total Missions</p>
                        <p className="text-5xl font-black mt-2">{totalCalls}</p>
                    </div>
                    <div className="bg-black text-white p-3 rotate-3">
                        <Zap className="w-8 h-8" />
                    </div>
                </motion.div>

                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white border-4 border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex items-center justify-between"
                >
                    <div>
                        <p className="text-xs font-black uppercase text-gray-400 tracking-wider">Avg Score</p>
                        <p className="text-5xl font-black mt-2 text-violet-600">{avgScore}</p>
                    </div>
                    <div className="bg-violet-600 text-white p-3 -rotate-3">
                        <Award className="w-8 h-8" />
                    </div>
                </motion.div>

                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="bg-black text-white border-4 border-black p-6 shadow-[8px_8px_0px_0px_rgba(139,92,246,1)] flex items-center justify-between"
                >
                    <div>
                        <p className="text-xs font-black uppercase text-gray-400 tracking-wider">Current Streak</p>
                        <p className="text-5xl font-black mt-2">🔥 {totalCalls > 0 ? 3 : 0}</p>
                    </div>
                </motion.div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white border-4 border-black p-8 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]"
                >
                    <div className="flex items-center gap-3 mb-8">
                        <div className="p-2 bg-violet-100 border-2 border-black">
                            <TrendingUp className="w-6 h-6 text-violet-600" />
                        </div>
                        <h2 className="text-2xl font-black uppercase tracking-tight">Performance Trend</h2>
                    </div>

                    <div className="h-[350px] w-full">
                        {weeklyData.length > 0 ? (
                            <Bar data={barChartData} options={barOptions} />
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center border-4 border-dashed border-gray-200">
                                <BarChart3 className="w-12 h-12 text-gray-300 mb-2" />
                                <p className="font-bold text-gray-400 uppercase">No Roleplay Data Yet</p>
                            </div>
                        )}
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-white border-4 border-black p-8 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]"
                >
                    <div className="flex items-center gap-3 mb-8">
                        <div className="p-2 bg-yellow-100 border-2 border-black">
                            <Target className="w-6 h-6 text-yellow-600" />
                        </div>
                        <h2 className="text-2xl font-black uppercase tracking-tight">Skills Matrix</h2>
                    </div>

                    <div className="h-[350px] w-full flex justify-center">
                        {skillsData.find(s => s.score > 0) ? (
                            <Radar data={radarChartData} options={radarOptions} />
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center border-4 border-dashed border-gray-200 w-full">
                                <Target className="w-12 h-12 text-gray-300 mb-2" />
                                <p className="font-bold text-gray-400 uppercase">Need Data to Map Skills</p>
                            </div>
                        )}
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
