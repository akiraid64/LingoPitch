import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { motion } from 'framer-motion';
import { Building2, Ticket, CheckCircle, AlertCircle, Save } from 'lucide-react';

function OrganizationSettings({ org }: { org: any }) {
    console.log('[SETTINGS] 🟦 OrganizationSettings Render - Org:', org?.id);

    useEffect(() => {
        console.log('[SETTINGS] 🚀 OrganizationSettings MOUNTED and ACTIVE');
    }, []);

    const { updateOrganization } = useAuth();

    const [description, setDescription] = useState(org.product_description || '');
    const [scenario, setScenario] = useState(org.roleplay_scenario || '');
    const [saving, setSaving] = useState(false);
    const [lastAttempt, setLastAttempt] = useState<string | null>(null);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);


    const handleSave = async () => {
        const timestamp = new Date().toLocaleTimeString();
        setLastAttempt(timestamp);
        console.log(`[SETTINGS] 🔘 [${timestamp}] handleSave started`);

        if (!org?.id) {
            console.error('[SETTINGS] ❌ No Org ID found!');
            alert('CRITICAL ERROR: Organization ID is missing. Check logs.');
            setMessage({ type: 'error', text: 'Error: Organization ID is missing.' });
            return;
        }

        setSaving(true);
        setMessage(null);
        try {
            const baseUrl = (import.meta as any).env.VITE_API_URL || 'http://localhost:3001';
            console.log('[SETTINGS] 🔗 Requesting:', `${baseUrl}/api/organization/${org.id}/settings`);

            const response = await fetch(`${baseUrl}/api/organization/${org.id}/settings`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ product_description: description })
            });

            console.log('[SETTINGS] 📥 Response Status:', response.status);

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ error: 'Unknown server error' }));
                console.error('[SETTINGS] ❌ Response Error:', errorData);
                alert(`API Error (${response.status}): ${errorData.error || response.statusText}`);
                throw new Error(errorData.error || 'Failed to save settings');
            }

            const data = await response.json();
            console.log('[SETTINGS] ✅ Success:', data);

            if (data.organization?.roleplay_scenario) {
                setScenario(data.organization.roleplay_scenario);
            }

            // Also update the local auth context so the rest of the app knows
            await updateOrganization(org.id, {
                product_description: description,
                roleplay_scenario: data.organization.roleplay_scenario
            });

            setMessage({ type: 'success', text: `Success! Persona recrafted at ${timestamp}` });
            alert('Persona recrafted successfully!');
        } catch (err: any) {
            console.error('[SETTINGS] ❌ Catch:', err);
            alert(`Error during save: ${err.message}`);
            setMessage({ type: 'error', text: `Failed: ${err.message}` });
        } finally {
            setSaving(false);
            console.log(`[SETTINGS] 🔚 [${timestamp}] handleSave ended`);
        }
    };


    return (
        <div className="space-y-6">
            <div>
                <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">
                    Product Context for AI Roleplay
                </label>
                <div className="text-xs text-gray-600 mb-2 font-bold">
                    Describe what your team sells. The AI customers will use this to ask relevant questions.
                </div>
                <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full h-32 px-4 py-3 bg-white border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus:translate-x-1 focus:translate-y-1 focus:shadow-none transition-all outline-none font-medium text-sm resize-none"
                    placeholder="e.g. We sell a B2B SaaS platform for inventory management that helps small retailers reduce stockouts..."
                />
            </div>

            {message && (
                <div className={`p-4 border-2 border-black font-bold text-sm flex items-center gap-2 ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                    }`}>
                    {message.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                    {message.text}
                </div>
            )}

            <button
                onClick={handleSave}
                disabled={saving}
                className="px-6 py-3 bg-black text-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all disabled:opacity-50 flex items-center gap-2 font-black uppercase tracking-widest text-sm"
            >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Save & Recraft Persona
            </button>

            {lastAttempt && (
                <div className="mt-2 text-[10px] font-bold text-gray-400 uppercase tracking-tighter">
                    Last attempt: {lastAttempt}
                </div>
            )}

            {scenario && (

                <div className="mt-8 pt-8 border-t-4 border-black border-dashed">
                    <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3">
                        Current AI Persona (System Prompt)
                    </label>
                    <div className="bg-yellow-50 border-4 border-black p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] relative overflow-hidden">
                        <div className="absolute top-0 right-0 bg-black text-white px-3 py-1 text-[10px] font-black uppercase tracking-tighter">
                            Active Persona
                        </div>
                        <div className="prose prose-sm max-w-none">
                            <pre className="whitespace-pre-wrap font-mono text-[11px] leading-relaxed text-gray-800">
                                {scenario}
                            </pre>
                        </div>
                    </div>
                    <p className="mt-4 text-[10px] text-gray-500 font-bold italic">
                        * This persona is dynamically generated by Gemini 2.5 Flash whenever you update your product context.
                    </p>
                </div>
            )}
        </div>

    );
}

// Simple internal loader to avoid import issues if not available
function Loader2({ className }: { className?: string }) {
    return <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 1 1-6.219-8.56" /></svg>;
}

export function SettingsPage() {
    const { profile, joinOrganization } = useAuth();
    const [referralCode, setReferralCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const handleJoinOrganization = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess(false);
        setLoading(true);

        try {
            await joinOrganization(referralCode);
            setSuccess(true);
            setReferralCode('');
        } catch (err: any) {
            setError(err.message || 'Failed to join organization');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-12 pb-20">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <h1 className="font-black text-5xl md:text-6xl uppercase tracking-tight mb-2">
                    Settings
                </h1>
                <p className="text-gray-600 font-bold uppercase text-xs tracking-widest">
                    Manage Your Account
                </p>
            </motion.div>

            {/* Profile Info */}
            <div className="bg-white border-8 border-black p-8 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]">
                <h2 className="font-black text-2xl uppercase mb-6">Profile Information</h2>
                <div className="space-y-4">
                    <div>
                        <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Name</label>
                        <p className="font-bold text-lg">{profile?.full_name || 'N/A'}</p>
                    </div>
                    <div>
                        <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Role</label>
                        <div className={`inline-block px-3 py-1 border-2 border-black font-black text-[10px] uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] ${profile?.role === 'sales_manager' || profile?.role === 'manager' ? 'bg-orange-400 text-black' : 'bg-blue-400 text-white'
                            }`}>
                            {profile?.role === 'sales_manager' || profile?.role === 'manager' ? 'Mission Command' : 'Field Agent'}
                        </div>
                    </div>
                    {profile?.organizations && (
                        <div>
                            <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Organization</label>
                            <p className="font-bold text-lg flex items-center gap-2">
                                <Building2 className="w-5 h-5" />
                                {profile.organizations.name}
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Organization Settings (Manager Only) */}
            {(profile?.role === 'sales_manager' || profile?.role === 'manager') && profile?.organizations && (
                <div className="bg-white border-8 border-black p-8 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]">
                    <h2 className="font-black text-2xl uppercase mb-6 flex items-center gap-3">
                        <Building2 className="w-6 h-6" />
                        Organization Settings
                    </h2>

                    <OrganizationSettings org={profile.organizations} />
                </div>
            )}

            {/* Join Organization (if not already in one) */}
            {!profile?.org_id && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white border-8 border-black p-8 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]"
                >
                    <h2 className="font-black text-2xl uppercase mb-2 flex items-center gap-3">
                        <Ticket className="w-6 h-6 text-orange-600" />
                        Join an Organization
                    </h2>
                    <p className="text-sm font-bold text-gray-600 mb-6">
                        Enter a referral code to join an existing organization and collaborate with your team.
                    </p>

                    {error && (
                        <div className="mb-4 p-4 bg-red-50 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-red-600 font-bold flex items-center gap-3">
                            <AlertCircle className="w-5 h-5" />
                            {error}
                        </div>
                    )}

                    {success && (
                        <div className="mb-4 p-4 bg-green-50 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-green-600 font-bold flex items-center gap-3">
                            <CheckCircle className="w-5 h-5" />
                            Successfully joined organization! Refreshing...
                        </div>
                    )}

                    <form onSubmit={handleJoinOrganization} className="space-y-4">
                        <div>
                            <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">
                                Referral Code
                            </label>
                            <input
                                type="text"
                                value={referralCode}
                                onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
                                className="w-full h-14 px-4 bg-white border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus:translate-x-1 focus:translate-y-1 focus:shadow-none transition-all outline-none font-black text-lg tracking-widest"
                                placeholder="XXXXXXXX"
                                required
                                disabled={loading}
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full h-14 bg-black text-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all disabled:opacity-50 flex items-center justify-center gap-3 text-lg font-black uppercase tracking-widest"
                        >
                            {loading ? 'Joining...' : 'Join Organization'}
                        </button>
                    </form>
                </motion.div>
            )}
        </div>
    );
}
