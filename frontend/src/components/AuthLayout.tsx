import { motion } from 'framer-motion';
import { Zap, Globe2 } from 'lucide-react';
import { Link } from 'react-router-dom';

interface AuthLayoutProps {
    title: string;
    subtitle: string;
    children: React.ReactNode;
}

export default function AuthLayout({ title, subtitle, children }: AuthLayoutProps) {
    return (
        <div className="h-screen flex bg-white font-sans text-black overflow-hidden">
            {/* Left Panel - Form */}
            <div className="w-full lg:w-[55%] flex flex-col h-full overflow-y-auto">
                {/* Header */}
                <header className="p-8 flex justify-between items-center">
                    <Link to="/" className="flex items-center gap-3 group">
                        <div className="w-10 h-10 bg-black flex items-center justify-center border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] group-hover:shadow-none group-hover:translate-x-[2px] group-hover:translate-y-[2px] transition-all">
                            <Zap className="text-white w-6 h-6 fill-white" />
                        </div>
                        <span className="text-2xl font-black tracking-tighter uppercase">LingoPitch</span>
                    </Link>

                    <div className="flex items-center gap-2 px-4 py-2 border-2 border-black font-bold text-sm shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[1px] hover:translate-y-[1px] transition-all cursor-pointer">
                        <Globe2 className="w-4 h-4" />
                        EN
                    </div>
                </header>

                {/* Form Area */}
                <main className="flex-1 flex items-center justify-center px-8 py-12">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="w-full max-w-md"
                    >
                        <div className="mb-10">
                            <h1 className="text-4xl font-black uppercase tracking-tight mb-3">
                                {title}
                            </h1>
                            <p className="text-gray-600 font-medium">
                                {subtitle}
                            </p>
                        </div>
                        {children}
                    </motion.div>
                </main>

                {/* Footer (Mobile Only) */}
                <footer className="p-8 text-center lg:hidden">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                        © {new Date().getFullYear()} LingoPitch. All Rights Reserved.
                    </p>
                </footer>
            </div>

            {/* Right Panel - Art Panel */}
            <div className="hidden lg:block lg:w-[45%] relative overflow-hidden bg-black border-l-8 border-black">
                <img
                    src="/lingopitch_auth_art.png"
                    alt="LingoPitch Auth Art"
                    className="absolute inset-0 w-full h-full object-cover opacity-80"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60"></div>

                {/* Overlay Text */}
                <div className="absolute bottom-12 left-12 right-12">
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.5 }}
                        className="bg-white/10 backdrop-blur-md border-2 border-white/20 p-8 shadow-2xl"
                    >
                        <h3 className="text-2xl font-black text-white uppercase tracking-tighter mb-2"> Mastering Global Sales </h3>
                        <p className="text-white/80 font-medium">
                            The ultimate cultural intelligence platform for elite sales teams worldwide.
                        </p>
                    </motion.div>
                </div>

                <div className="absolute bottom-6 left-0 right-0 text-center">
                    <p className="text-white/40 text-xs font-bold uppercase tracking-[0.3em]">
                        © {new Date().getFullYear()} LingoPitch International
                    </p>
                </div>
            </div>
        </div>
    );
}
