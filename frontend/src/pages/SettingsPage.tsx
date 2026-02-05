import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { motion } from 'framer-motion';
import { Building2, Ticket, CheckCircle, AlertCircle, Save } from 'lucide-react';

function OrganizationSettings({ org }: { org: any }) {
    const { updateOrganization } = useAuth();
    const [description, setDescription] = useState(org.product_description || '');
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    const handleSave = async () => {
        setSaving(true);
        setMessage(null);
        try {
            await updateOrganization(org.id, { product_description: description });
            setMessage({ type: 'success', text: 'Product description updated!' });
        } catch (err) {
            setMessage({ type: 'error', text: 'Failed to save changes.' });
        } finally {
            setSaving(false);
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
                Save Changes
            </button>
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
