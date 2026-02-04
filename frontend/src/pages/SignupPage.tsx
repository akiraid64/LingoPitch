import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, User, UserPlus, Building2, Ticket } from 'lucide-react';
import AuthLayout from '../components/AuthLayout';

export default function SignupPage() {
    const navigate = useNavigate();
    const { signUp, signInWithGoogle } = useAuth();
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [orgName, setOrgName] = useState('');
    const [referralCode, setReferralCode] = useState('');
    const [signupType, setSignupType] = useState<'sales_manager' | 'member'>('sales_manager');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const handleSignUp = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess(false);

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        if (signupType === 'sales_manager' && !orgName) {
            setError('Please enter an organization name');
            return;
        }

        if (signupType === 'member' && !referralCode) {
            setError('Please enter a referral code');
            return;
        }

        setLoading(true);

        try {
            await signUp(
                email,
                password,
                fullName,
                signupType === 'sales_manager' ? orgName : undefined,
                signupType === 'member' ? referralCode : undefined,
                signupType
            );
            setSuccess(true);
            setTimeout(() => navigate('/dashboard'), 1500);

        } catch (err: any) {
            setError(err.message || 'Failed to create account');
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSignup = async () => {
        setError('');
        setLoading(true);

        try {
            await signInWithGoogle(signupType, orgName, referralCode);
        } catch (err: any) {
            setError(err.message || 'Failed to sign in with Google');
            setLoading(false);
        }
    };

    return (
        <AuthLayout
            title="Join the Mission"
            subtitle="Create your account to start mastering global markets."
        >
            {error && (
                <div className="mb-6 p-4 bg-red-50 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-red-600 font-bold flex items-center gap-3">
                    <div className="w-6 h-6 bg-red-600 border-2 border-black flex items-center justify-center text-white text-xs font-black">!</div>
                    {error}
                </div>
            )}

            {success && (
                <div className="mb-6 p-6 bg-green-50 border-4 border-black shadow-[6px_6px_0px_0px_rgba(34,197,94,1)] text-green-700">
                    <div className="flex items-center gap-4 mb-3">
                        <div className="w-10 h-10 bg-green-600 border-2 border-black flex items-center justify-center text-white text-xl font-black">✓</div>
                        <h3 className="font-black text-xl uppercase tracking-tight">Account Created!</h3>
                    </div>
                    <p className="font-bold text-sm leading-relaxed">
                        You're all set! Redirecting to your dashboard...
                    </p>
                </div>
            )}

            {/* Type Selector */}
            <div className="flex gap-2 mb-8 p-1 bg-gray-100 border-2 border-black">
                <button
                    onClick={() => setSignupType('sales_manager')}
                    className={`flex-1 h-10 flex items-center justify-center gap-2 font-black text-xs uppercase tracking-widest transition-all ${signupType === 'sales_manager'
                        ? 'bg-black text-white shadow-none'
                        : 'bg-transparent text-gray-400 hover:text-black'
                        }`}
                >
                    <Building2 className="w-4 h-4" />
                    Manager
                </button>
                <button
                    onClick={() => setSignupType('member')}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 font-black text-xs uppercase tracking-widest transition-all ${signupType === 'member'
                        ? 'bg-black text-white shadow-none'
                        : 'bg-transparent text-gray-400 hover:text-black'
                        }`}
                >
                    <Ticket className="w-4 h-4" />
                    Agent
                </button>
            </div>

            <form onSubmit={handleSignUp} className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-[10px] font-black text-black mb-1 uppercase tracking-widest">Full Name</label>
                        <div className="relative group">
                            <input
                                type="text"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                className="w-full h-12 pl-10 pr-4 bg-white border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] focus:translate-x-0.5 focus:translate-y-0.5 focus:shadow-none transition-all outline-none font-bold text-sm"
                                placeholder="John Doe"
                                required
                                disabled={loading}
                            />
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-black transition-colors" />
                        </div>
                    </div>

                    <div>
                        <label className="block text-[10px] font-black text-black mb-1 uppercase tracking-widest">Email</label>
                        <div className="relative group">
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full h-12 pl-10 pr-4 bg-white border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] focus:translate-x-0.5 focus:translate-y-0.5 focus:shadow-none transition-all outline-none font-bold text-sm"
                                placeholder="john@email.com"
                                required
                                disabled={loading}
                            />
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-black transition-colors" />
                        </div>
                    </div>
                </div>

                <AnimatePresence mode="wait">
                    <motion.div
                        key={signupType}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 10 }}
                    >
                        {signupType === 'sales_manager' ? (
                            <div>
                                <label className="block text-[10px] font-black text-black mb-1 uppercase tracking-widest">Organization Name</label>
                                <div className="relative group">
                                    <input
                                        type="text"
                                        value={orgName}
                                        onChange={(e) => setOrgName(e.target.value)}
                                        className="w-full h-12 pl-10 pr-4 bg-white border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] focus:translate-x-0.5 focus:translate-y-0.5 focus:shadow-none transition-all outline-none font-bold text-sm"
                                        placeholder="e.g. Acme Sales Global"
                                        required={signupType === 'sales_manager'}
                                        disabled={loading}
                                    />
                                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-black transition-colors" />
                                </div>
                            </div>
                        ) : (
                            <div>
                                <label className="block text-[10px] font-black text-black mb-1 uppercase tracking-widest text-orange-600">Referral / Org Code</label>
                                <div className="relative group">
                                    <input
                                        type="text"
                                        value={referralCode}
                                        onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
                                        className="w-full h-12 pl-10 pr-4 bg-orange-50 border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] focus:translate-x-0.5 focus:translate-y-0.5 focus:shadow-none transition-all outline-none font-black text-sm tracking-widest"
                                        placeholder="ORG-XXXXXX"
                                        required={signupType === 'member'}
                                        disabled={loading}
                                    />
                                    <Ticket className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-orange-600" />
                                </div>
                            </div>
                        )}
                    </motion.div>
                </AnimatePresence>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-[10px] font-black text-black mb-1 uppercase tracking-widest">Password</label>
                        <div className="relative group">
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full h-12 pl-10 pr-4 bg-white border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] focus:translate-x-0.5 focus:translate-y-0.5 focus:shadow-none transition-all outline-none font-bold text-sm"
                                placeholder="••••••••"
                                required
                                disabled={loading}
                            />
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-black transition-colors" />
                        </div>
                    </div>

                    <div>
                        <label className="block text-[10px] font-black text-black mb-1 uppercase tracking-widest">Confirm</label>
                        <div className="relative group">
                            <input
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="w-full h-12 pl-10 pr-4 bg-white border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] focus:translate-x-0.5 focus:translate-y-0.5 focus:shadow-none transition-all outline-none font-bold text-sm"
                                placeholder="••••••••"
                                required
                                disabled={loading}
                            />
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-black transition-colors" />
                        </div>
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full h-14 bg-black text-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all disabled:opacity-50 flex items-center justify-center gap-3 text-lg font-black uppercase tracking-widest mt-4"
                >
                    {loading ? 'Processing...' : 'Start Mission'}
                    {!loading && <UserPlus className="w-5 h-5" />}
                </button>
            </form>

            <div className="relative my-8">
                <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t-2 border-gray-100"></div>
                </div>
                <div className="relative flex justify-center text-[10px]">
                    <span className="px-4 bg-white text-gray-400 font-bold uppercase tracking-[0.3em]">Alternate Entry</span>
                </div>
            </div>

            <button
                onClick={handleGoogleSignup}
                disabled={loading}
                className="w-full h-12 border-2 border-black bg-white shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all flex items-center justify-center gap-3 font-black text-xs uppercase"
            >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                    <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Sign up with Google
            </button>

            <p className="mt-8 text-center text-sm font-bold text-gray-500">
                ALREADY A MEMBER?{' '}
                <Link to="/login" className="text-black hover:underline underline-offset-4 decoration-2">
                    LOGIN HERE
                </Link>
            </p>
        </AuthLayout>
    );
}

