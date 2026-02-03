import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
    Globe2,
    Mic,
    BarChart3,
    Sparkles,
    ArrowRight,
    Languages,
    Brain,
    Target,
    TrendingUp
} from 'lucide-react';
import { useLanguageStore } from '@/store/languageStore';

export function HomePage() {
    const { currentLanguageInfo, availableLanguages } = useLanguageStore();

    return (
        <div className="overflow-hidden">
            {/* Hero Section */}
            <section className="relative min-h-[90vh] flex items-center justify-center px-4 py-20">
                {/* Animated Background Grid */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#0000_1px,transparent_1px),linear-gradient(to_bottom,#0000_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)] opacity-20" />

                {/* Floating Elements */}
                <div className="absolute top-20 left-10 w-32 h-32 bg-accent-300 border-4 border-black shadow-brutal animate-float" />
                <div className="absolute bottom-40 right-20 w-24 h-24 bg-primary-400 border-4 border-black shadow-brutal animate-float" style={{ animationDelay: '1s' }} />

                <div className="relative z-10 max-w-6xl mx-auto text-center">
                    {/* Badge */}
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-flex items-center gap-2 px-6 py-3 mb-8
                       bg-accent-200 border-3 border-black shadow-brutal-sm
                       font-display font-bold text-sm uppercase"
                    >
                        <Sparkles className="w-5 h-5" />
                        <span>Powered by Lingo.dev AI</span>
                    </motion.div>

                    {/* Main Title */}
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="font-display font-bold text-6xl md:text-8xl lg:text-9xl
                       uppercase tracking-tight mb-6 leading-none"
                    >
                        <span className="gradient-text">Train</span> to Sell
                        <br />
                        <span className="text-stroke text-transparent">Anywhere</span>
                    </motion.h1>

                    {/* Subtitle */}
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-xl md:text-2xl text-dark-700 mb-12 max-w-3xl mx-auto font-body font-medium"
                    >
                        Master sales in <strong className="text-primary-600">{availableLanguages.length}+ languages</strong>.
                        Practice with AI prospects. Get cultural intelligence coaching.
                        Close deals globally.
                    </motion.p>

                    {/* CTA Buttons */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="flex flex-wrap items-center justify-center gap-4"
                    >
                        <Link to="/arena" className="btn-brutal group">
                            Start Training
                            <ArrowRight className="inline-block ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </Link>

                        <Link to="/analyze" className="btn-brutal-outline">
                            Analyze a Call
                        </Link>
                    </motion.div>

                    {/* Stats */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="mt-16 grid grid-cols-3 gap-4 max-w-3xl mx-auto"
                    >
                        {[
                            { value: '80+', label: 'Languages' },
                            { value: '10+', label: 'Cultural Norms' },
                            { value: '4', label: 'Skill Parameters' },
                        ].map((stat, i) => (
                            <div
                                key={i}
                                className="glass-card text-center"
                            >
                                <div className="font-display font-bold text-4xl text-primary-600">
                                    {stat.value}
                                </div>
                                <div className="text-sm text-dark-600 font-mono uppercase">
                                    {stat.label}
                                </div>
                            </div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-20 px-4 bg-gradient-to-b from-white to-accent-50">
                <div className="max-w-7xl mx-auto">
                    <h2 className="section-title text-center">
                        How It Works
                    </h2>

                    <div className="grid md:grid-cols-3 gap-8 mt-16">
                        {/* Feature 1 */}
                        <motion.div
                            initial={{ opacity: 0, y: 40 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0 }}
                            className="brutal-card group"
                        >
                            <div className="w-16 h-16 bg-primary-400 border-4 border-black shadow-brutal-sm
                              flex items-center justify-center mb-6
                              group-hover:rotate-12 transition-transform duration-300">
                                <Languages className="w-8 h-8" />
                            </div>
                            <h3 className="font-display font-bold text-2xl uppercase mb-4">
                                1. Select Language
                            </h3>
                            <p className="text-dark-700 leading-relaxed">
                                Choose from <strong>80+ languages</strong>. Our AI instantly
                                generates cultural context, taboos, and power phrases for
                                that region.
                            </p>
                        </motion.div>

                        {/* Feature 2 */}
                        <motion.div
                            initial={{ opacity: 0, y: 40 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.1 }}
                            className="brutal-card group"
                        >
                            <div className="w-16 h-16 bg-accent-300 border-4 border-black shadow-brutal-sm
                              flex items-center justify-center mb-6
                              group-hover:rotate-12 transition-transform duration-300">
                                <Mic className="w-8 h-8" />
                            </div>
                            <h3 className="font-display font-bold text-2xl uppercase mb-4">
                                2. Practice with AI
                            </h3>
                            <p className="text-dark-700 leading-relaxed">
                                Roleplay with AI prospects who <strong>behave authentically</strong>
                                for their culture. Get real-time hints when you make cultural mistakes.
                            </p>
                        </motion.div>

                        {/* Feature 3 */}
                        <motion.div
                            initial={{ opacity: 0, y: 40 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.2 }}
                            className="brutal-card group"
                        >
                            <div className="w-16 h-16 bg-primary-300 border-4 border-black shadow-brutal-sm
                              flex items-center justify-center mb-6
                              group-hover:rotate-12 transition-transform duration-300">
                                <Brain className="w-8 h-8" />
                            </div>
                            <h3 className="font-display font-bold text-2xl uppercase mb-4">
                                3. Get Scored
                            </h3>
                            <p className="text-dark-700 leading-relaxed">
                                Receive a <strong>Cultural IQ Score</strong> plus 10 standard
                                sales parameters. Track your improvement over time.
                            </p>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Current Language Spotlight */}
            {currentLanguageInfo && (
                <section className="py-20 px-4 bg-dark-900 text-white relative overflow-hidden">
                    {/* Decorative Elements */}
                    <div className="absolute top-10 right-10 w-64 h-64 bg-primary-500/20 blur-3xl rounded-full" />
                    <div className="absolute bottom-10 left-10 w-64 h-64 bg-accent-500/20 blur-3xl rounded-full" />

                    <div className="max-w-5xl mx-auto relative z-10">
                        <div className="text-center mb-12">
                            <div className="text-8xl mb-4">{currentLanguageInfo.flag}</div>
                            <h2 className="font-display font-bold text-5xl uppercase mb-4">
                                Currently Training In
                            </h2>
                            <p className="text-3xl text-accent-300 font-display">
                                {currentLanguageInfo.name}
                            </p>
                        </div>

                        <div className="glass-card-dark">
                            <div className="grid md:grid-cols-2 gap-8">
                                <div>
                                    <h3 className="font-display font-bold text-xl uppercase mb-4 text-accent-300">
                                        Cultural Context Active
                                    </h3>
                                    <ul className="space-y-2 text-dark-200">
                                        <li className="flex items-center gap-2">
                                            <Target className="w-5 h-5 text-primary-400" />
                                            Communication style adapted
                                        </li>
                                        <li className="flex items-center gap-2">
                                            <Target className="w-5 h-5 text-primary-400" />
                                            Formality level calibrated
                                        </li>
                                        <li className="flex items-center gap-2">
                                            <Target className="w-5 h-5 text-primary-400" />
                                            Cultural taboos loaded
                                        </li>
                                        <li className="flex items-center gap-2">
                                            <Target className="w-5 h-5 text-primary-400" />
                                            Power phrases ready
                                        </li>
                                    </ul>
                                </div>

                                <div className="flex items-center justify-center">
                                    <Link
                                        to="/arena"
                                        className="px-8 py-4 bg-primary-400 text-black border-4 border-white
                               shadow-[8px_8px_0px_0px_rgba(255,255,255,1)]
                               font-display font-bold text-xl uppercase
                               hover:translate-x-2 hover:translate-y-2
                               hover:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]
                               transition-all duration-200"
                                    >
                                        Start Practicing
                                        <ArrowRight className="inline-block ml-2 w-6 h-6" />
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            )}

            {/* CTA Section */}
            <section className="py-20 px-4 bg-primary-400 relative overflow-hidden">
                {/* Pattern Overlay */}
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute inset-0" style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
                    }} />
                </div>

                <div className="max-w-4xl mx-auto text-center relative z-10">
                    <h2 className="font-display font-bold text-5xl md:text-6xl uppercase mb-6 leading-tight">
                        Ready to Close Deals
                        <br />
                        Globally?
                    </h2>
                    <p className="text-xl text-dark-800 mb-8 font-medium">
                        Join sales teams mastering international markets with AI-powered cultural intelligence.
                    </p>

                    <div className="flex flex-wrap items-center justify-center gap-4">
                        <Link
                            to="/arena"
                            className="px-8 py-4 bg-dark-900 text-white border-4 border-black
                         shadow-brutal font-display font-bold text-xl uppercase
                         hover:translate-x-2 hover:translate-y-2 hover:shadow-brutal-sm
                         transition-all duration-200"
                        >
                            Get Started Free
                        </Link>

                        <Link
                            to="/dashboard"
                            className="px-8 py-4 bg-white text-black border-4 border-black
                         shadow-brutal font-display font-bold text-xl uppercase
                         hover:translate-x-2 hover:translate-y-2 hover:shadow-brutal-sm
                         transition-all duration-200"
                        >
                            View Dashboard
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
}
