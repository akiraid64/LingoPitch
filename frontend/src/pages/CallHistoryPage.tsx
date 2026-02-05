import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Phone, Search, Clock, User, TrendingUp } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface Call {
    id: string;
    title: string;
    customer_name: string;
    created_at: string;
    duration_seconds: number;
    status: string;
    call_scores: {
        overall_score: number;
    } | null;
}

export default function CallHistoryPage() {
    const { profile } = useAuth();
    const [calls, setCalls] = useState<Call[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState<'date' | 'score' | 'duration'>('date');
    const [filterScore, setFilterScore] = useState<'all' | 'high' | 'medium' | 'low'>('all');

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
                title,
                customer_name,
                created_at,
                duration_seconds,
                status,
                call_scores (
                    overall_score
                )
            `)
            .eq('user_id', profile.id)
            .order('created_at', { ascending: false });

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

    // Filter and sort
    const filteredCalls = calls.filter(call => {
        const matchesSearch =
            call.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            call.customer_name?.toLowerCase().includes(searchTerm.toLowerCase());

        if (!matchesSearch) return false;

        if (filterScore === 'all') return true;
        const score = call.call_scores?.overall_score || 0;
        if (filterScore === 'high') return score >= 80;
        if (filterScore === 'medium') return score >= 60 && score < 80;
        if (filterScore === 'low') return score < 60;
        return true;
    }).sort((a, b) => {
        if (sortBy === 'date') {
            return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        }
        if (sortBy === 'score') {
            const scoreA = a.call_scores?.overall_score || 0;
            const scoreB = b.call_scores?.overall_score || 0;
            return scoreB - scoreA;
        }
        if (sortBy === 'duration') {
            return (b.duration_seconds || 0) - (a.duration_seconds || 0);
        }
        return 0;
    });

    // Calculate summary stats
    const totalCalls = calls.length;
    const avgScore = calls.length > 0
        ? calls.reduce((sum, call) => sum + (call.call_scores?.overall_score || 0), 0) / calls.length
        : 0;
    const totalDuration = calls.reduce((sum, call) => sum + (call.duration_seconds || 0), 0);
    const avgDuration = totalCalls > 0 ? totalDuration / totalCalls : 0;

    const formatDuration = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}m ${secs}s`;
    };

    const getScoreColor = (score: number) => {
        if (score >= 80) return 'bg-green-400';
        if (score >= 60) return 'bg-yellow-400';
        return 'bg-red-400';
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="w-16 h-16 border-8 border-black border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="font-black uppercase text-sm">Loading Calls...</p>
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
            >
                <h1 className="font-black text-5xl md:text-6xl uppercase tracking-tight mb-2">
                    Call History
                </h1>
                <p className="text-gray-600 font-bold uppercase text-xs tracking-widest">
                    Your complete call archive
                </p>
            </motion.div>

            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] p-6"
                >
                    <div className="flex items-center justify-between mb-2">
                        <Phone className="w-8 h-8" />
                        <div className="text-4xl font-black">{totalCalls}</div>
                    </div>
                    <p className="text-xs font-black uppercase text-gray-500">Total Calls</p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] p-6"
                >
                    <div className="flex items-center justify-between mb-2">
                        <TrendingUp className="w-8 h-8" />
                        <div className="text-4xl font-black">{Math.round(avgScore)}</div>
                    </div>
                    <p className="text-xs font-black uppercase text-gray-500">Avg Score</p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-white border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] p-6"
                >
                    <div className="flex items-center justify-between mb-2">
                        <Clock className="w-8 h-8" />
                        <div className="text-4xl font-black">{Math.round(avgDuration / 60)}</div>
                    </div>
                    <p className="text-xs font-black uppercase text-gray-500">Avg Mins</p>
                </motion.div>
            </div>

            {/* Filters and Search */}
            <div className="bg-white border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Search */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search calls..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 border-4 border-black font-bold uppercase text-sm focus:outline-none focus:ring-4 focus:ring-blue-400"
                        />
                    </div>

                    {/* Sort */}
                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value as 'date' | 'score' | 'duration')}
                        className="px-4 py-3 border-4 border-black font-black uppercase text-sm focus:outline-none focus:ring-4 focus:ring-blue-400 bg-white"
                    >
                        <option value="date">Sort by Date</option>
                        <option value="score">Sort by Score</option>
                        <option value="duration">Sort by Duration</option>
                    </select>

                    {/* Filter */}
                    <select
                        value={filterScore}
                        onChange={(e) => setFilterScore(e.target.value as 'all' | 'high' | 'medium' | 'low')}
                        className="px-4 py-3 border-4 border-black font-black uppercase text-sm focus:outline-none focus:ring-4 focus:ring-blue-400 bg-white"
                    >
                        <option value="all">All Scores</option>
                        <option value="high">High (80+)</option>
                        <option value="medium">Medium (60-79)</option>
                        <option value="low">Low (&lt;60)</option>
                    </select>
                </div>
            </div>

            {/* Calls List */}
            <div className="space-y-4">
                {filteredCalls.length === 0 ? (
                    <div className="bg-white border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] p-12 text-center">
                        <Phone className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                        <p className="font-black uppercase text-gray-400">No calls found</p>
                    </div>
                ) : (
                    filteredCalls.map((call, index) => {
                        const score = call.call_scores?.overall_score || 0;
                        return (
                            <motion.div
                                key={call.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className="bg-white border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 transition-all"
                            >
                                <div className="p-6 flex items-center gap-6">
                                    {/* Score Badge */}
                                    <div className={`${getScoreColor(score)} border-4 border-black w-20 h-20 flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]`}>
                                        <div className="text-center">
                                            <div className="text-3xl font-black">{score}</div>
                                            <div className="text-[8px] font-black uppercase">Score</div>
                                        </div>
                                    </div>

                                    {/* Call Details */}
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-black text-xl uppercase mb-1 truncate">
                                            {call.title || 'Untitled Call'}
                                        </h3>
                                        <div className="flex items-center gap-4 text-sm">
                                            <div className="flex items-center gap-1">
                                                <User className="w-4 h-4" />
                                                <span className="font-bold">{call.customer_name || 'Unknown'}</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Clock className="w-4 h-4" />
                                                <span className="font-bold">{formatDuration(call.duration_seconds || 0)}</span>
                                            </div>
                                            <div className="text-gray-500 font-bold">
                                                {new Date(call.created_at).toLocaleDateString()}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Status */}
                                    <div className={`px-4 py-2 border-2 border-black font-black text-xs uppercase ${call.status === 'completed' ? 'bg-green-200' : 'bg-gray-200'
                                        }`}>
                                        {call.status}
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })
                )}
            </div>
        </div>
    );
}
