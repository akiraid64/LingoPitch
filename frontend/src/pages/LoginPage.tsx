import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'framer-motion';
import { Mail, Lock, LogIn, ArrowRight, Sparkles } from 'lucide-react';

export default function LoginPage() {
  const navigate = useNavigate();
  const { signIn, signInWithGoogle } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await signIn(email, password);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Failed to sign in');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    setLoading(true);

    try {
      await signInWithGoogle();
    } catch (err: any) {
      setError(err.message || 'Failed to sign in with Google');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-500 via-secondary-500 to-accent-500 relative overflow-hidden flex items-center justify-center p-4">
      {/* Background blobs */}
      <div className="absolute top-0 -left-4 w-72 h-72 bg-accent-400 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
      <div className="absolute top-0 -right-4 w-72 h-72 bg-primary-400 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
      <div className="absolute -bottom-8 left-20 w-72 h-72 bg-secondary-400 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md relative z-10"
      >
        {/* Header Label */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ y: -20 }}
            animate={{ y: 0 }}
            className="inline-block bg-white border-4 border-black px-4 py-1 mb-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
          >
            <span className="font-black uppercase tracking-widest text-sm flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary-500" />
              Welcome Back
            </span>
          </motion.div>
          <h1 className="text-6xl font-black text-white drop-shadow-[4px_4px_0px_rgba(0,0,0,1)] uppercase tracking-tighter mb-2">
            LingoPitch
          </h1>
          <p className="text-white font-bold text-lg bg-black/20 inline-block px-4 py-1 rounded-full backdrop-blur-sm">
            Master Every Market
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white border-8 border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] p-8 relative overflow-hidden">
          {/* Decorative Corner */}
          <div className="absolute top-0 right-0 w-12 h-12 bg-primary-500 border-l-4 border-b-4 border-black"></div>

          <h2 className="text-4xl font-black text-black mb-8 border-b-8 border-primary-500 pb-2 inline-block">
            SIGN IN
          </h2>

          {error && (
            <div className="mb-6 p-4 bg-error-100 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-error-900 font-bold flex items-center gap-3">
              <div className="w-6 h-6 bg-error-500 border-2 border-black flex items-center justify-center text-white text-xs font-black">!</div>
              {error}
            </div>
          )}

          {/* Email/Password Form */}
          <form onSubmit={handleEmailLogin} className="space-y-6 mb-8">
            <div className="group">
              <label className="block text-sm font-black text-black mb-2 uppercase tracking-wide">
                Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-14 pl-12 pr-4 bg-primary-50 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus:translate-x-1 focus:translate-y-1 focus:shadow-none transition-all outline-none font-bold"
                  placeholder="you@email.com"
                  required
                />
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-black" />
              </div>
            </div>

            <div className="group">
              <label className="block text-sm font-black text-black mb-2 uppercase tracking-wide">
                Password
              </label>
              <div className="relative">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full h-14 pl-12 pr-4 bg-accent-50 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus:translate-x-1 focus:translate-y-1 focus:shadow-none transition-all outline-none font-bold"
                  placeholder="••••••••"
                  required
                />
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-black" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-16 bg-primary-500 text-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none active:translate-x-2 active:translate-y-2 transition-all disabled:opacity-50 flex items-center justify-center gap-4 text-xl font-black uppercase tracking-widest"
            >
              {loading ? (
                'PROCESSING...'
              ) : (
                <>
                  GO IN <ArrowRight className="w-6 h-6" />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative mb-8 text-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t-4 border-black opacity-20"></div>
            </div>
            <span className="relative px-4 bg-white text-black font-black italic text-sm">SOCIAL LOGIN</span>
          </div>

          {/* Google Sign In */}
          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full h-14 bg-white border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all font-black flex items-center justify-center gap-3"
          >
            <svg className="w-6 h-6" viewBox="0 0 24 24">
              <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            LOGIN WITH GOOGLE
          </button>

          {/* Footer Link */}
          <div className="mt-10 text-center border-t-4 border-black pt-6">
            <p className="text-black font-bold">
              FIRST TIME HERE?{' '}
              <Link
                to="/signup"
                className="text-primary-600 hover:text-primary-700 underline underline-offset-4 decoration-4 font-black"
              >
                CREATE ACCOUNT
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

