import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { motion } from 'framer-motion';
import { ArrowLeft, Mail, Calendar, TrendingUp, BarChart3, Phone, Clock, AlertCircle } from 'lucide-react';

interface MemberDetails {
    user_id: string;
    full_name: string;
    email: string;
    role: string;
    created_at: string;
}

interface CallRecord {
    id: string;
    created_at: string;
    duration: number;
    transcript: string;
}

export function MemberDetailPage() {
    const { memberId } = useParams<{ memberId: string }>();
    const { profile } = useAuth();
    const navigate = useNavigate();
    const [member, setMember] = useState<MemberDetails | null>(null);
    const [calls, setCalls] = useState<CallRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchMemberData = async () => {
            if (!profile?.org_id || !memberId) {
                setError('Invalid access');
                setLoading(false);
                return;
            }

            try {
                // Fetch member profile
                const { data: memberData, error: memberError } = await supabase
                    .from('profiles')
                    .select('id, full_name, email, role, created_at')
                    .eq('id', memberId)
                    .eq('org_id', profile.org_id)
                    .single();

                if (memberError) throw memberError;
                if (!memberData) {
                    setError('Member not found or not in your organization');
                    setLoading(false);
                    return;
                }

                // Map 'id' to 'user_id' for local state compatibility if needed, 
                // but better to just use the object as is or map it here.
                setMember({
                    ...memberData,
                    user_id: memberData.id
                });

                // Fetch member's calls
                const { data: callsData, error: callsError } = await supabase
                    .from('calls')
                    .select('id, created_at, duration_seconds, transcript')
                    .eq('user_id', memberId)
                    .order('created_at', { ascending: false })
                    .limit(20);

                if (callsError) throw callsError;

                // Map duration_seconds to duration
                const mappedCalls = (callsData || []).map(c => ({
                    ...c,
                    duration: c.duration_seconds
                }));

                setCalls(mappedCalls);

            } catch (err: any) {
                console.error('Error fetching member data:', err);
                setError(err.message || 'Failed to load member data');
            } finally {
                setLoading(false);
            }
        };

        fetchMemberData();
    }, [memberId, profile?.org_id]);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-black border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="font-bold uppercase text-sm text-gray-600">Loading member details...</p>
                </div>
            </div>
        );
    }

    if (error || !member) {
        return (
            <div className="max-w-2xl mx-auto">
                <div className="bg-red-50 border-4 border-black p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                    <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
                    <h2 className="font-black text-2xl uppercase text-center mb-2">Error</h2>
                    <p className="text-center font-bold text-red-600">{error}</p>
                    <button
                        onClick={() => navigate('/team')}
                        className="mt-6 mx-auto block px-6 py-3 bg-black text-white font-black uppercase border-2 border-black hover:bg-gray-800"
                    >
                        Back to Team
                    </button>
                </div>
            </div>
        );
    }

    const totalCalls = calls.length;
    const avgDuration = calls.length > 0
        ? Math.round(calls.reduce((sum, c) => sum + (c.duration || 0), 0) / calls.length / 60)
        : 0;

    return (
        <div className="max-w-7xl mx-auto space-y-8 pb-20">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <button
                    onClick={() => navigate('/team')}
                    className="flex items-center gap-2 mb-6 text-gray-600 hover:text-black font-bold transition-colors"
                >
                    <ArrowLeft className="w-5 h-5" />
                    Back to Team
                </button>

                <div className="bg-white border-8 border-black p-8 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]">
                    <div className="flex items-start gap-6">
                        <div className="w-20 h-20 border-4 border-black bg-orange-200 flex items-center justify-center font-black text-3xl uppercase">
                            {member.full_name?.[0] || 'A'}
                        </div>
                        <div className="flex-1">
                            <h1 className="font-black text-4xl uppercase tracking-tight mb-2">
                                {member.full_name || 'Agent'}
                            </h1>
                            <div className="flex items-center gap-4 flex-wrap">
                                <div className="flex items-center gap-2 text-gray-600">
                                    <Mail className="w-4 h-4" />
                                    <span className="font-bold text-sm">{member.email}</span>
                                </div>
                                <div className="flex items-center gap-2 text-gray-600">
                                    <Calendar className="w-4 h-4" />
                                    <span className="font-bold text-sm">
                                        Joined {new Date(member.created_at).toLocaleDateString()}
                                    </span>
                                </div>
                            </div>
                            <div className={`inline-block mt-4 px-4 py-2 border-2 border-black font-black text-xs uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] ${member.role === 'sales_manager' ? 'bg-orange-400' : 'bg-blue-400 text-white'
                                }`}>
                                {member.role === 'sales_manager' ? 'Manager' : 'Field Agent'}
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Stats Grid */}
            <div className="grid md:grid-cols-4 gap-6">
                {[
                    { icon: Phone, label: 'Total Calls', value: totalCalls.toString(), color: 'blue' },
                    { icon: Clock, label: 'Avg Duration', value: `${avgDuration}min`, color: 'green' },
                    { icon: TrendingUp, label: 'Avg Score', value: '—', color: 'orange' },
                    {
                        icon: BarChart3, label: 'This Week', value: calls.filter(c => {
                            const weekAgo = new Date();
                            weekAgo.setDate(weekAgo.getDate() - 7);
                            return new Date(c.created_at) > weekAgo;
                        }).length.toString(), color: 'purple'
                    },
                ].map((stat, i) => (
                    <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="bg-white border-8 border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]"
                    >
                        <div className="flex items-center justify-between mb-2">
                            <stat.icon className="w-6 h-6 text-gray-600" />
                        </div>
                        <div className="text-4xl font-black mb-1">{stat.value}</div>
                        <div className="text-xs font-black text-gray-500 uppercase tracking-widest">{stat.label}</div>
                    </motion.div>
                ))}
            </div>

            {/* Call History */}
            <div className="bg-white border-8 border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
                <div className="p-6 border-b-8 border-black bg-gray-50">
                    <h2 className="font-black uppercase tracking-tighter text-2xl">Call History</h2>
                    <p className="text-sm font-bold text-gray-600 mt-1">
                        {totalCalls} total calls recorded
                    </p>
                </div>

                <div className="p-6">
                    {calls.length === 0 ? (
                        <div className="text-center py-12">
                            <Phone className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                            <p className="font-bold text-gray-500 uppercase">No calls recorded yet</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {calls.map((call, index) => (
                                <motion.div
                                    key={call.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    className="p-4 border-4 border-black hover:bg-gray-50 transition-colors"
                                >
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="font-black uppercase text-sm mb-1">
                                                Call #{calls.length - index}
                                            </p>
                                            <div className="flex items-center gap-3 text-xs text-gray-600">
                                                <span className="flex items-center gap-1 font-bold">
                                                    <Calendar className="w-3 h-3" />
                                                    {new Date(call.created_at).toLocaleString()}
                                                </span>
                                                {call.duration && (
                                                    <span className="flex items-center gap-1 font-bold">
                                                        <Clock className="w-3 h-3" />
                                                        {Math.round(call.duration / 60)}min
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <button
                                                onClick={() => navigate(`/calls/${call.id}`)}
                                                className="px-3 py-1 bg-black text-white border-2 border-black font-black text-[10px] uppercase hover:bg-gray-800 transition-colors"
                                            >
                                                View
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
