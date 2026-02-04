import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Mail, ArrowLeft, Send } from 'lucide-react';
import AuthLayout from '../components/AuthLayout';

export default function ForgotPasswordPage() {
    const { resetPassword } = useAuth();
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess(false);
        setLoading(true);

        try {
            await resetPassword(email);
            setSuccess(true);
        } catch (err: any) {
            setError(err.message || 'Failed to send reset email. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthLayout
            title="Reset Password"
            subtitle="Enter your email to receive a secure password reset link."
        >
            {error && (
                <div className="mb-6 p-4 bg-red-50 border-2 border-black font-bold text-red-600 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                    {error}
                </div>
            )}

            {success ? (
                <div className="space-y-6">
                    <div className="p-6 bg-green-50 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-center">
                        <Send className="w-12 h-12 text-black mx-auto mb-4" />
                        <h2 className="text-xl font-black uppercase mb-2">Email Sent!</h2>
                        <p className="font-bold text-gray-600">
                            Check your inbox for instructions to reset your password.
                        </p>
                    </div>

                    <Link
                        to="/login"
                        className="w-full h-14 bg-black text-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all flex items-center justify-center gap-3 text-lg font-black uppercase tracking-widest mt-8"
                    >
                        Return to Login
                    </Link>
                </div>
            ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-xs font-black text-black mb-2 uppercase tracking-widest">
                            Email Address
                        </label>
                        <div className="relative group">
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full h-14 pl-12 pr-4 bg-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus:translate-x-1 focus:translate-y-1 focus:shadow-none transition-all outline-none font-bold"
                                placeholder="you@email.com"
                                required
                            />
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-black transition-colors" />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full h-14 bg-black text-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all disabled:opacity-50 flex items-center justify-center gap-3 text-lg font-black uppercase tracking-widest mt-8"
                    >
                        {loading ? 'Sending...' : 'Send Reset Link'}
                    </button>

                    <Link
                        to="/login"
                        className="flex items-center justify-center gap-2 text-sm font-black text-gray-400 hover:text-black transition-colors uppercase tracking-widest"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Login
                    </Link>
                </form>
            )}
        </AuthLayout>
    );
}
