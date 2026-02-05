import { motion } from 'framer-motion';
import { TrendingUp, Award, Target, Copy, Building2, ShieldCheck, Users } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export function DashboardPage() {
    const { profile } = useAuth();
    const [stats, setStats] = useState({
        avgScore: 0,
        totalCalls: 0,
        culturalIq: 0
    });
    const [recentCalls, setRecentCalls] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        if (profile?.id) {
            fetchDashboardData();
        }
    }, [profile?.id]);

    const fetchDashboardData = async () => {
        console.log('📊 DASHBOARD: Fetching data for user:', profile?.id);
        if (!profile?.id) {
            console.warn('⚠️ DASHBOARD: No profile ID found, aborting fetch.');
            setLoading(false);
            return;
        }

        try {
            // Fetch recent calls with scores
            const { data: calls, error } = await supabase
                .from('calls')
                .select(`
                    id,
                    title,
                    created_at,
                    transcript,
                    call_scores (
                        overall_score,
                        raw_response
                    )
                `)
                .eq('user_id', profile?.id)
                .order('created_at', { ascending: false })
                .limit(5);

            if (error) {
                console.error('❌ DASHBOARD: Error fetching calls:', error);
                throw error;
            }

            console.log('✅ DASHBOARD: Fetched calls:', calls);

            // Calculate stats from ALL calls (separate query for valid stats if needed, 
            // but for now let's use the recent ones or a separate aggregate query)
            // For a better aggregate, let's fetch a light version of all calls
            const { data: allCalls } = await supabase
                .from('calls')
                .select('call_scores(overall_score)')
                .eq('user_id', profile?.id);

            let totalScore = 0;
            let count = 0;
            allCalls?.forEach((c: any) => {
                const s = c.call_scores?.[0]?.overall_score || c.call_scores?.overall_score;
                if (s) {
                    totalScore += s;
                    count++;
                }
            });

            setStats({
                avgScore: count > 0 ? Math.round(totalScore / count) : 0,
                totalCalls: allCalls?.length || 0,
                culturalIq: 0 // Placeholder until we have a real metric for this
            });

            setRecentCalls(calls || []);
        } catch (err) {
            console.error('Error fetching dashboard data:', err);
        } finally {
            setLoading(false);
        }
    };

    const copyReferral = () => {
        const code = profile?.organizations?.referral_code;
        if (code) {
            navigator.clipboard.writeText(code);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="w-16 h-16 border-8 border-black border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto space-y-12 pb-20">
            {/* Header Section */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col md:flex-row md:items-end justify-between gap-6"
            >
                <div>
                    <h1 className="font-black text-5xl md:text-6xl uppercase tracking-tight mb-2">
                        Dashboard
                    </h1>
                    <div className="flex items-center gap-2">
                        <div className={`px-3 py-1 border-2 border-black font-black text-[10px] uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] ${profile?.role === 'sales_manager' || profile?.role === 'manager' ? 'bg-orange-400 text-black' : 'bg-blue-400 text-white'
                            }`}>
                            {profile?.role === 'sales_manager' || profile?.role === 'manager' ? 'Mission Command' : 'Field Agent'}
                        </div>
                        <p className="text-gray-600 font-bold uppercase text-xs tracking-widest pl-2">
                            {profile?.full_name || 'Agent'}'s Current Status
                        </p>
                    </div>
                </div>

                {/* Organization Details for Managers */}
                {(profile?.role === 'sales_manager' || profile?.role === 'manager') && profile?.organizations && (
                    <div className="flex bg-white border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] divide-x-4 divide-black">
                        <div className="px-6 py-4 flex flex-col justify-center">
                            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Company</p>
                            <p className="font-black text-sm uppercase flex items-center gap-2">
                                <Building2 className="w-4 h-4" />
                                {profile.organizations.name}
                            </p>
                        </div>
                        <div className="px-6 py-4 flex flex-col justify-center bg-gray-50">
                            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Referral Code</p>
                            <div className="flex items-center gap-3">
                                <span className="font-mono font-black text-lg text-orange-600 tracking-tighter">
                                    {profile.organizations.referral_code}
                                </span>
                                <button
                                    onClick={copyReferral}
                                    className="p-1 border-2 border-black hover:bg-black hover:text-white transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
                                >
                                    {copied ? <div className="text-[8px] font-bold px-1">COPIED</div> : <Copy className="w-3 h-3" />}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Organization Details for Members */}
                {profile?.role === 'member' && profile?.organizations && (
                    <div className="bg-white border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] px-6 py-4">
                        <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Unit</p>
                        <p className="font-black text-sm uppercase flex items-center gap-2">
                            <ShieldCheck className="w-4 h-4 text-blue-600" />
                            {profile.organizations.name}
                        </p>
                    </div>
                )}
            </motion.div>

            {/* Stats Grid */}
            <div className="grid md:grid-cols-3 gap-8">
                {[
                    { icon: TrendingUp, label: 'Avg Score', value: stats.avgScore, color: 'orange' },
                    { icon: Award, label: 'Cultural IQ', value: 'N/A', color: 'green' },
                    { icon: Target, label: 'Missions', value: stats.totalCalls, color: 'blue' },
                ].map((stat, i) => (
                    <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="bg-white border-8 border-black p-8 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]"
                    >
                        <div className="flex items-center justify-between mb-2">
                            <div className="p-3 border-4 border-black bg-gray-50">
                                <stat.icon className="w-8 h-8" />
                            </div>
                        </div>
                        <div className="font-black text-6xl mt-4 mb-2">{stat.value}</div>
                        <div className="font-black text-gray-400 uppercase tracking-wide text-xs">
                            {stat.label}
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Main Content Area */}
            <div className="grid lg:grid-cols-3 gap-8">
                {/* Recent Missions */}
                <div className="lg:col-span-2 bg-white border-8 border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]">
                    <div className="p-6 border-b-8 border-black bg-gray-50 flex items-center justify-between">
                        <h2 className="font-black uppercase tracking-tighter text-xl flex items-center gap-3">
                            <TrendingUp className="w-6 h-6" />
                            Recent Field Missions
                        </h2>
                        <button className="px-3 py-1 bg-black text-white text-[10px] font-black uppercase">View All</button>
                    </div>
                    <div className="p-6 space-y-4">
                        {recentCalls.length === 0 ? (
                            <div className="text-center py-8 text-gray-400 font-bold uppercase">No missions executed yet</div>
                        ) : (
                            recentCalls.map((call, i) => {
                                const score = Array.isArray(call.call_scores)
                                    ? call.call_scores[0]?.overall_score
                                    : call.call_scores?.overall_score;
                                const langCode = call.transcript?.language_code || '??';

                                return (
                                    <div key={i} className="flex items-center justify-between p-6 border-4 border-black bg-white hover:bg-gray-50 transition-colors shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5">
                                        <div className="flex items-center gap-6">
                                            <div className="text-2xl font-black uppercase text-gray-300 w-12">{langCode}</div>
                                            <div>
                                                <div className="font-black text-lg uppercase tracking-tight">{call.title}</div>
                                                <div className="text-xs text-gray-500 font-bold uppercase tracking-widest leading-none mt-1">
                                                    {new Date(call.created_at).toLocaleDateString()}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="w-14 h-14 border-4 border-black bg-black text-white flex items-center justify-center font-black text-xl">
                                            {score || '-'}
                                        </div>
                                    </div>
                                )
                            })
                        )}
                    </div>
                </div>

                {/* Team / Secondary Info */}
                <div className="space-y-8">
                    {profile?.role === 'sales_manager' && (
                        <div className="bg-black text-white border-4 border-black p-8 shadow-[8px_8px_0px_0px_rgba(249,115,22,1)]">
                            <h3 className="font-black uppercase text-sm mb-4 flex items-center gap-2">
                                <Users className="w-5 h-5 text-orange-400" />
                                Elite Squad Status
                            </h3>
                            <div className="space-y-6">
                                <div>
                                    <div className="flex justify-between text-[10px] font-black uppercase mb-1">
                                        <span>Target Performance</span>
                                        <span>84%</span>
                                    </div>
                                    <div className="h-4 w-full border-2 border-white bg-gray-800">
                                        <div className="h-full bg-orange-500 w-[84%] border-r-2 border-white" />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-3 border-2 border-gray-700 bg-gray-900">
                                        <p className="text-[10px] text-gray-500 font-black uppercase">Active</p>
                                        <p className="text-xl font-black">8</p>
                                    </div>
                                    <div className="p-3 border-2 border-gray-700 bg-gray-900">
                                        <p className="text-[10px] text-gray-500 font-black uppercase">Standby</p>
                                        <p className="text-xl font-black">4</p>
                                    </div>
                                </div>
                                <button className="w-full h-12 border-2 border-white bg-white text-black font-black uppercase text-xs tracking-widest hover:bg-orange-500 hover:text-white transition-all">
                                    Manage Roster
                                </button>
                            </div>
                        </div>
                    )}

                    <div className="bg-white border-8 border-black p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                        <h3 className="font-black uppercase text-sm mb-2 flex items-center gap-2">
                            <Award className="w-5 h-5 text-blue-500" />
                            Next Promotion
                        </h3>
                        <p className="text-xs font-bold text-gray-600 leading-relaxed mb-4">
                            You're 24,000 EXP away from becoming a "Cultural Sensei". Complete 3 highly formal German negotiations to accelerate progress.
                        </p>
                        <div className="h-6 w-full border-4 border-black bg-gray-100">
                            <div className="h-full bg-blue-500 w-[65%] border-r-4 border-black" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
