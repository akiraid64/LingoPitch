import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, User, UserPlus, ArrowRight, Building2, Ticket, Sparkles } from 'lucide-react';

export default function SignupPage() {
    const navigate = useNavigate();
    const { signUp, signInWithGoogle } = useAuth();
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [orgName, setOrgName] = useState('');
    const [referralCode, setReferralCode] = useState('');
    const [signupType, setSignupType] = useState<'manager' | 'member'>('manager');
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

        if (signupType === 'manager' && !orgName) {
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
                signupType === 'manager' ? orgName : undefined,
                signupType === 'member' ? referralCode : undefined
            );
            setSuccess(true);
            setTimeout(() => navigate('/dashboard'), 2000);
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
            await signInWithGoogle();
        } catch (err: any) {
            setError(err.message || 'Failed to sign up with Google');
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-accent-500 via-primary-500 to-secondary-500 relative overflow-hidden flex items-center justify-center p-4 py-12">
            {/* Background patterns */}
            <div className="absolute inset-0 opacity-20 pointer-events-none">
                <div className="absolute top-0 left-0 w-full h-full" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, black 1px, transparent 0)', backgroundSize: '40px 40px' }}></div>
            </div>

            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-lg relative z-10"
            >
                {/* Header */}
                <div className="text-center mb-10">
                    <motion.div
                        initial={{ y: -20 }}
                        animate={{ y: 0 }}
                        className="inline-block bg-white border-4 border-black px-4 py-1 mb-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                    >
                        <span className="font-black uppercase tracking-widest text-sm flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-accent-500" />
                            Join the Elite
                        </span>
                    </motion.div>
                    <h1 className="text-6xl font-black text-white drop-shadow-[4px_4px_0px_rgba(0,0,0,1)] uppercase tracking-tighter mb-2">
                        LingoPitch
                    </h1>
                    <p className="text-white font-bold text-lg bg-black/20 inline-block px-4 py-1 rounded-full backdrop-blur-sm">
                        The Future of Global Sales Training
                    </p>
                </div>

                {/* Signup Card */}
                <div className="bg-white border-8 border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] p-8 relative">
                    <h2 className="text-4xl font-black text-black mb-8 border-b-8 border-accent-500 pb-2 inline-block uppercase">
                        Create Account
                    </h2>

                    {error && (
                        <motion.div
                            initial={{ x: -10 }}
                            animate={{ x: 0 }}
                            className="mb-6 p-4 bg-error-100 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-error-900 font-bold flex items-center gap-3"
                        >
                            <div className="w-6 h-6 bg-error-500 border-2 border-black flex items-center justify-center text-white text-xs font-black">!</div>
                            {error}
                        </motion.div>
                    )}

                    {success && (
                        <div className="mb-6 p-4 bg-success-100 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-success-900 font-bold">
                            🚀 ACCOUNT CREATED! LAUNCHING DASHBOARD...
                        </div>
                    )}

                    {/* Type Selector */}
                    <div className="flex gap-4 mb-8">
                        <button
                            onClick={() => setSignupType('manager')}
                            className={`flex-1 py-4 border-4 border-black font-black uppercase tracking-tight transition-all flex flex-col items-center gap-2 ${signupType === 'manager'
                                    ? 'bg-primary-400 translate-x-1 translate-y-1 shadow-none'
                                    : 'bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
                                }`}
                        >
                            <Building2 className="w-6 h-6" />
                            Sales Manager
                        </button>
                        <button
                            onClick={() => setSignupType('member')}
                            className={`flex-1 py-4 border-4 border-black font-black uppercase tracking-tight transition-all flex flex-col items-center gap-2 ${signupType === 'member'
                                    ? 'bg-accent-400 translate-x-1 translate-y-1 shadow-none'
                                    : 'bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
                                }`}
                        >
                            <Ticket className="w-6 h-6" />
                            Have Code
                        </button>
                    </div>

                    <form onSubmit={handleSignUp} className="space-y-6">
                        {/* Common Fields */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-xs font-black text-black mb-1 uppercase tracking-widest">Full Name</label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={fullName}
                                        onChange={(e) => setFullName(e.target.value)}
                                        className="w-full h-12 pl-10 pr-4 bg-gray-50 border-4 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] focus:translate-x-0.5 focus:translate-y-0.5 focus:shadow-none transition-all outline-none font-bold text-sm"
                                        placeholder="John Sterling"
                                        required
                                        disabled={loading}
                                    />
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-black" />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-black text-black mb-1 uppercase tracking-widest">Email</label>
                                <div className="relative">
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full h-12 pl-10 pr-4 bg-gray-50 border-4 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] focus:translate-x-0.5 focus:translate-y-0.5 focus:shadow-none transition-all outline-none font-bold text-sm"
                                        placeholder="john@sales.com"
                                        required
                                        disabled={loading}
                                    />
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-black" />
                                </div>
                            </div>
                        </div>

                        {/* Dynamic Field Based on Type */}
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={signupType}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 10 }}
                            >
                                {signupType === 'manager' ? (
                                    <div>
                                        <label className="block text-xs font-black text-black mb-1 uppercase tracking-widest text-primary-600">Organization Name</label>
                                        <div className="relative">
                                            <input
                                                type="text"
                                                value={orgName}
                                                onChange={(e) => setOrgName(e.target.value)}
                                                className="w-full h-12 pl-10 pr-4 bg-primary-50 border-4 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] focus:translate-x-0.5 focus:translate-y-0.5 focus:shadow-none transition-all outline-none font-black text-sm"
                                                placeholder="e.g. Acme Sales Global"
                                                required={signupType === 'manager'}
                                                disabled={loading}
                                            />
                                            <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary-600" />
                                        </div>
                                    </div>
                                ) : (
                                    <div>
                                        <label className="block text-xs font-black text-black mb-1 uppercase tracking-widest text-accent-600">Referral / Org Code</label>
                                        <div className="relative">
                                            <input
                                                type="text"
                                                value={referralCode}
                                                onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
                                                className="w-full h-12 pl-10 pr-4 bg-accent-50 border-4 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] focus:translate-x-0.5 focus:translate-y-0.5 focus:shadow-none transition-all outline-none font-black text-sm tracking-[0.2em]"
                                                placeholder="ORG-XXXXXX"
                                                required={signupType === 'member'}
                                                disabled={loading}
                                            />
                                            <Ticket className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-accent-600" />
                                        </div>
                                    </div>
                                )}
                            </motion.div>
                        </AnimatePresence>

                        {/* Passwords */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-xs font-black text-black mb-1 uppercase tracking-widest">Password</label>
                                <div className="relative">
                                    <input
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full h-12 pl-10 pr-4 bg-gray-50 border-4 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] focus:translate-x-0.5 focus:translate-y-0.5 focus:shadow-none transition-all outline-none font-bold text-sm"
                                        placeholder="••••••••"
                                        required
                                        disabled={loading}
                                    />
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-black" />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-black text-black mb-1 uppercase tracking-widest">Confirm</label>
                                <div className="relative">
                                    <input
                                        type="password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className="w-full h-12 pl-10 pr-4 bg-gray-50 border-4 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] focus:translate-x-0.5 focus:translate-y-0.5 focus:shadow-none transition-all outline-none font-bold text-sm"
                                        placeholder="••••••••"
                                        required
                                        disabled={loading}
                                    />
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-black" />
                                </div>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full h-16 bg-black text-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(255,255,255,0.2)] hover:bg-gray-900 active:translate-x-1 active:translate-y-1 active:shadow-none transition-all disabled:opacity-50 flex items-center justify-center gap-4 text-xl font-black uppercase tracking-widest mt-4"
                        >
                            {loading ? (
                                'LAUNCHING...'
                            ) : (
                                <>
                                    START MISSION <UserPlus className="w-6 h-6" />
                                </>
                            )}
                        </button>
                    </form>

                    {/* Divider */}
                    <div className="relative my-8 text-center">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t-4 border-black opacity-10"></div>
                        </div>
                        <span className="relative px-4 bg-white text-black font-black italic text-xs uppercase opacity-60 tracking-wider">Alt Entry</span>
                    </div>

                    {/* Google Sign Up */}
                    <button
                        onClick={handleGoogleSignup}
                        disabled={loading}
                        className="w-full h-14 bg-white border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all font-black flex items-center justify-center gap-3"
                    >
                        <svg className="w-6 h-6" viewBox="0 0 24 24">
                            <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                            <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                            <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                            <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                        </svg>
                        SIGN UP WITH GOOGLE
                    </button>

                    {/* Login Link */}
                    <div className="mt-8 text-center border-t-4 border-black pt-6">
                        <p className="text-black font-bold">
                            ALREADY A MEMBER?{' '}
                            <Link
                                to="/login"
                                className="text-accent-600 hover:text-accent-700 underline underline-offset-4 decoration-4 font-black"
                            >
                                LOGIN HERE
                            </Link>
                        </p>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}

