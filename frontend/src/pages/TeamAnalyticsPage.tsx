import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, TrendingUp, Award, Target, BarChart3 } from 'lucide-react';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer } from 'recharts';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface TeamMember {
    id: string;
    full_name: string;
    email: string;
    avg_score: number;
    total_calls: number;
}

interface ClusterScore {
    parameter: string;
    avgScore: number;
}

export default function TeamAnalyticsPage() {
    const { profile } = useAuth();
    const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
    const [clusterScores, setClusterScores] = useState<ClusterScore[]>([]);
    const [loading, setLoading] = useState(true);
    const [timePeriod, setTimePeriod] = useState<'7d' | '30d' | '90d'>('30d');

    useEffect(() => {
        fetchTeamData();
    }, [profile, timePeriod]);

    const fetchTeamData = async () => {
        if (!profile?.org_id) {
            console.log('⚠️ Analytics: No org_id in profile');
            return;
        }

        console.log('\n========================================');
        console.log('📊 FETCHING TEAM ANALYTICS');
        console.log('========================================');
        console.log('Org ID:', profile.org_id);
        console.log('Time Period:', timePeriod);
        console.log('========================================\n');

        setLoading(true);
        const daysAgo = timePeriod === '7d' ? 7 : timePeriod === '30d' ? 30 : 90;
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - daysAgo);

        // Fetch all team members
        console.log('🔍 Step 1: Fetching team members...');
        const { data: members, error: membersError } = await supabase
            .from('profiles')
            .select('id, full_name, email')
            .eq('org_id', profile.org_id);

        if (membersError) {
            console.error('❌ Error fetching team:', membersError);
            setLoading(false);
            return;
        }

        console.log('✅ Found', members?.length || 0, 'team members:');
        members?.forEach((m, i) => {
            console.log(`  ${i + 1}. ${m.full_name} (${m.email})`);
        });
        console.log('');

        // Fetch calls and scores for each member
        const teamData: TeamMember[] = [];
        const allScores: any[] = [];

        for (const member of members || []) {
            const { data: calls, error: callsError } = await supabase
                .from('calls')
                .select(`
                    id,
                    call_scores!inner (
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
                .eq('user_id', member.id)
                .gte('created_at', cutoffDate.toISOString());

            if (!callsError && calls) {
                const scoresWithData = calls.map(c => c.call_scores).flat();
                allScores.push(...scoresWithData);

                const avgScore = calls.length > 0
                    ? calls.reduce((sum, call) => sum + (call.call_scores[0]?.overall_score || 0), 0) / calls.length
                    : 0;

                teamData.push({
                    ...member,
                    avg_score: Math.round(avgScore),
                    total_calls: calls.length,
                });
            }
        }

        setTeamMembers(teamData);

        // Calculate cluster scores
        if (allScores.length > 0) {
            const parameters = [
                { key: 'score_needs_discovery', label: 'Discovery' },
                { key: 'score_value_proposition', label: 'Value Prop' },
                { key: 'score_decision_process', label: 'Decision' },
                { key: 'score_stakeholder_id', label: 'Stakeholder' },
                { key: 'score_insight_delivery', label: 'Insights' },
                { key: 'score_objection_handling', label: 'Objections' },
                { key: 'score_active_listening', label: 'Listening' },
                { key: 'score_competition', label: 'Competition' },
                { key: 'score_next_steps', label: 'Next Steps' },
                { key: 'score_call_control', label: 'Control' },
            ];

            const clusters = parameters.map(param => ({
                parameter: param.label,
                avgScore: Math.round(
                    allScores.reduce((sum, score) => sum + (score[param.key] || 0), 0) / allScores.length
                ),
            }));

            setClusterScores(clusters);
        }

        setLoading(false);
    };

    const topPerformers = [...teamMembers].sort((a, b) => b.avg_score - a.avg_score).slice(0, 5);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="w-16 h-16 border-8 border-black border-t-purple-500 rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="font-black uppercase text-sm">Loading Analytics...</p>
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
                        Team Analytics
                    </h1>
                    <p className="text-gray-600 font-bold uppercase text-xs tracking-widest">
                        Performance insights across your team
                    </p>
                </div>

                {/* Time Period Selector */}
                <div className="flex gap-2 border-4 border-black bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                    {(['7d', '30d', '90d'] as const).map((period) => (
                        <button
                            key={period}
                            onClick={() => setTimePeriod(period)}
                            className={`px-6 py-3 font-black text-sm uppercase transition-all ${timePeriod === period
                                ? 'bg-black text-white'
                                : 'bg-white text-black hover:bg-gray-100'
                                }`}
                        >
                            {period === '7d' ? '7 Days' : period === '30d' ? '30 Days' : '90 Days'}
                        </button>
                    ))}
                </div>
            </motion.div>

            {/* Team Overview Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-gradient-to-br from-purple-400 to-purple-600 border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] p-6 text-white"
                >
                    <div className="flex items-center justify-between mb-2">
                        <Users className="w-10 h-10" />
                        <div className="text-5xl font-black">{teamMembers.length}</div>
                    </div>
                    <p className="text-xs font-black uppercase">Team Members</p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-gradient-to-br from-blue-400 to-blue-600 border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] p-6 text-white"
                >
                    <div className="flex items-center justify-between mb-2">
                        <TrendingUp className="w-10 h-10" />
                        <div className="text-5xl font-black">
                            {Math.round(teamMembers.reduce((sum, m) => sum + m.avg_score, 0) / (teamMembers.length || 1))}
                        </div>
                    </div>
                    <p className="text-xs font-black uppercase">Team Avg Score</p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-gradient-to-br from-green-400 to-green-600 border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] p-6 text-white"
                >
                    <div className="flex items-center justify-between mb-2">
                        <BarChart3 className="w-10 h-10" />
                        <div className="text-5xl font-black">
                            {teamMembers.reduce((sum, m) => sum + m.total_calls, 0)}
                        </div>
                    </div>
                    <p className="text-xs font-black uppercase">Total Calls</p>
                </motion.div>
            </div>

            {/* Skills Radar Chart */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-white border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] p-6"
            >
                <h2 className="font-black text-2xl uppercase mb-6 flex items-center gap-2">
                    <Target className="w-6 h-6" />
                    Team Skills Overview
                </h2>
                {clusterScores.length > 0 ? (
                    <div className="flex justify-center">
                        <ResponsiveContainer width="100%" height={400}>
                            <RadarChart data={clusterScores}>
                                <PolarGrid stroke="#000" strokeWidth={2} />
                                <PolarAngleAxis
                                    dataKey="parameter"
                                    stroke="#000"
                                    strokeWidth={2}
                                    style={{ fontFamily: 'inherit', fontWeight: 900, fontSize: 11 }}
                                />
                                <PolarRadiusAxis
                                    angle={90}
                                    domain={[0, 100]}
                                    stroke="#000"
                                    strokeWidth={2}
                                    style={{ fontFamily: 'inherit', fontWeight: 900 }}
                                />
                                <Radar
                                    name="Team Average"
                                    dataKey="avgScore"
                                    stroke="#000"
                                    fill="#a78bfa"
                                    fillOpacity={0.6}
                                    strokeWidth={3}
                                />
                            </RadarChart>
                        </ResponsiveContainer>
                    </div>
                ) : (
                    <p className="text-center text-gray-400 font-bold uppercase py-12">No data available</p>
                )}
            </motion.div>

            {/* Top Performers Leaderboard */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="bg-white border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] p-6"
            >
                <h2 className="font-black text-2xl uppercase mb-6 flex items-center gap-2">
                    <Award className="w-6 h-6" />
                    Top Performers
                </h2>
                <div className="space-y-4">
                    {topPerformers.map((member, index) => (
                        <div
                            key={member.id}
                            className={`flex items-center gap-4 p-4 border-4 border-black ${index === 0 ? 'bg-yellow-100' : index === 1 ? 'bg-gray-100' : index === 2 ? 'bg-orange-100' : 'bg-white'
                                }`}
                        >
                            <div className="w-12 h-12 bg-black text-white border-2 border-black flex items-center justify-center font-black text-xl">
                                {index + 1}
                            </div>
                            <div className="flex-1">
                                <p className="font-black uppercase text-lg">{member.full_name}</p>
                                <p className="font-bold text-sm text-gray-600">{member.total_calls} calls</p>
                            </div>
                            <div className={`px-6 py-3 border-4 border-black font-black text-2xl ${member.avg_score >= 80 ? 'bg-green-400' : member.avg_score >= 60 ? 'bg-yellow-400' : 'bg-red-400'
                                }`}>
                                {member.avg_score}
                            </div>
                        </div>
                    ))}
                    {topPerformers.length === 0 && (
                        <p className="text-center text-gray-400 font-bold uppercase py-8">No performance data yet</p>
                    )}
                </div>
            </motion.div>
        </div>
    );
}
