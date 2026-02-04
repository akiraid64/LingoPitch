import { Shield, Users, AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Navigate, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

interface TeamMember {
    id: string;
    full_name: string;
    email: string;
    role: string;
    created_at: string;
}

interface Organization {
    id: string;
    name: string;
    referral_code: string;
}

export default function TeamPage() {
    const { profile, user } = useAuth();
    const navigate = useNavigate();
    const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
    const [organization, setOrganization] = useState<Organization | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Security check - only managers can access this page
    if (profile && profile.role !== 'sales_manager' && profile.role !== 'manager') {
        return <Navigate to="/dashboard" replace />;
    }

    useEffect(() => {
        const fetchData = async () => {
            if (!profile?.org_id) {
                console.log('⚠️ TeamPage: No org_id in profile');
                setLoading(false);
                return;
            }

            console.log('\n========================================');
            console.log('👥 FETCHING TEAM DATA');
            console.log('========================================');
            console.log('Profile:', {
                id: profile.id,
                org_id: profile.org_id,
                role: profile.role,
                name: profile.full_name
            });
            console.log('User ID:', user?.id);
            console.log('========================================\n');

            try {
                // Fetch organization data
                console.log('🔍 Step 1: Fetching organization data...');
                const { data: orgData, error: orgError } = await supabase
                    .from('organizations')
                    .select('id, name, referral_code')
                    .eq('id', profile.org_id)
                    .single();

                if (orgError) {
                    console.error('❌ Organization fetch failed:', orgError);
                    throw orgError;
                }
                console.log('✅ Organization found:', orgData.name, '| Referral Code:', orgData.referral_code);
                setOrganization(orgData);

                // Fetch team members (exclude the current manager)
                console.log('\n🔍 Step 2: Fetching team members...');
                console.log('Query: profiles WHERE org_id =', profile.org_id, 'AND id !=', user?.id);
                const { data, error: fetchError } = await supabase
                    .from('profiles')
                    .select('id, full_name, email, role, created_at')
                    .eq('org_id', profile.org_id)
                    .neq('id', user?.id) // Exclude current user (manager)
                    .order('created_at', { ascending: false });

                if (fetchError) {
                    console.error('❌ Team members fetch failed:', fetchError);
                    throw fetchError;
                }

                console.log('✅ Found', data?.length || 0, 'team members (excluding self):');
                data?.forEach((m, i) => {
                    console.log(`  ${i + 1}. ${m.full_name} (${m.email}) - Role: ${m.role}`);
                });
                console.log('');

                setTeamMembers(data || []);
            } catch (err: any) {
                console.error('❌ Error fetching team data:', err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [profile?.org_id, user?.id]);

    const activeAgents = teamMembers.filter(m => m.role === 'rep').length;
    const totalMembers = teamMembers.length;

    return (
        <div className="max-w-6xl mx-auto space-y-10 pb-20">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black uppercase tracking-tight mb-2">
                        Team <span className="text-blue-500">Command</span>
                    </h1>
                    <p className="text-gray-600 font-bold uppercase text-xs tracking-widest">
                        {organization?.name || 'Your Organization'}
                    </p>
                </div>
            </header>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {[
                    { label: 'Active Agents', value: activeAgents.toString(), color: 'blue' },
                    { label: 'Total Members', value: totalMembers.toString(), color: 'orange' },
                    { label: 'Referral Code', value: organization?.referral_code || 'N/A', color: 'green' },
                ].map((stat) => (
                    <div key={stat.label} className="p-6 bg-white border-8 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1">{stat.label}</p>
                        <p className="text-4xl font-black">{stat.value}</p>
                    </div>
                ))}
            </div>

            {/* Team List */}
            <div className="bg-white border-8 border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
                <div className="p-6 border-b-8 border-black bg-gray-50 flex items-center justify-between">
                    <h2 className="font-black uppercase tracking-tighter text-xl flex items-center gap-3">
                        <Shield className="w-6 h-6" />
                        Team Roster
                    </h2>
                </div>

                <div className="overflow-x-auto">
                    {loading ? (
                        <div className="p-12 text-center">
                            <p className="font-bold text-gray-500 uppercase text-sm">Loading team members...</p>
                        </div>
                    ) : error ? (
                        <div className="p-12 text-center">
                            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                            <p className="font-bold text-red-600 uppercase text-sm">{error}</p>
                        </div>
                    ) : teamMembers.length === 0 ? (
                        <div className="p-12 text-center">
                            <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                            <h3 className="font-black text-xl uppercase mb-2">No Team Members Yet</h3>
                            <p className="text-gray-600 font-bold text-sm mb-6">
                                Share your referral code <span className="px-2 py-1 bg-yellow-100 border-2 border-black font-black">{organization?.referral_code}</span> with agents to build your team!
                            </p>
                        </div>
                    ) : (
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b-4 border-black">
                                    <th className="p-6 text-xs font-black uppercase tracking-widest text-gray-400">Agent</th>
                                    <th className="p-6 text-xs font-black uppercase tracking-widest text-gray-400">Role</th>
                                    <th className="p-6 text-xs font-black uppercase tracking-widest text-gray-400">Email</th>
                                    <th className="p-6 text-xs font-black uppercase tracking-widest text-gray-400">Joined</th>
                                </tr>
                            </thead>
                            <tbody>
                                {teamMembers.map((member) => (
                                    <tr
                                        key={member.id}
                                        onClick={() => navigate(`/team/${member.id}`)}
                                        className="border-b-4 border-black hover:bg-blue-50 transition-colors cursor-pointer"
                                    >
                                        <td className="p-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 border-4 border-black bg-orange-200 flex items-center justify-center font-black text-lg uppercase">
                                                    {member.full_name?.[0] || 'A'}
                                                </div>
                                                <div>
                                                    <p className="font-black uppercase text-sm">{member.full_name || 'Agent'}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-6">
                                            <span className={`px-3 py-1 border-2 border-black font-black text-[10px] uppercase ${member.role === 'manager' ? 'bg-orange-400' : 'bg-blue-400 text-white'
                                                }`}>
                                                {member.role === 'manager' ? 'Manager' : 'Agent'}
                                            </span>
                                        </td>
                                        <td className="p-6 font-bold text-sm text-gray-600">{member.email}</td>
                                        <td className="p-6 font-bold text-sm text-gray-600">
                                            {new Date(member.created_at).toLocaleDateString()}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
}
