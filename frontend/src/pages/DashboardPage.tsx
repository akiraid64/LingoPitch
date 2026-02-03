import { motion } from 'framer-motion';
import { TrendingUp, Award, Target } from 'lucide-react';

export function DashboardPage() {
    return (
        <div className="min-h-screen bg-gradient-to-b from-dark-50 to-accent-50 py-12 px-4">
            <div className="max-w-7xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-12"
                >
                    <h1 className="font-display font-bold text-5xl md:text-6xl uppercase mb-4">
                        Dashboard
                    </h1>
                    <p className="text-xl text-dark-700 font-medium">
                        Track your progress across languages and improve your cultural IQ.
                    </p>
                </motion.div>

                {/* Stats Grid */}
                <div className="grid md:grid-cols-3 gap-6 mb-12">
                    {[
                        { icon: TrendingUp, label: 'Avg Score', value: '78', change: '+12%' },
                        { icon: Award, label: 'Cultural IQ', value: '85', change: '+8%' },
                        { icon: Target, label: 'Calls Analyzed', value: '24', change: '+5' },
                    ].map((stat, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="brutal-card bg-white"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <stat.icon className="w-8 h-8 text-primary-600" />
                                <span className="px-3 py-1 bg-accent-200 border-2 border-black
                                 font-mono font-bold text-xs">
                                    {stat.change}
                                </span>
                            </div>
                            <div className="font-display font-bold text-4xl mb-1">
                                {stat.value}
                            </div>
                            <div className="text-dark-600 font-mono text-sm uppercase">
                                {stat.label}
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Recent Activity */}
                <div className="brutal-card bg-white">
                    <h2 className="font-display font-bold text-2xl uppercase mb-6">
                        Recent Activity
                    </h2>
                    <div className="space-y-4">
                        {[
                            { lang: '🇯🇵', name: 'Japanese', score: 82, type: 'Practice' },
                            { lang: '🇩🇪', name: 'German', score: 91, type: 'Analysis' },
                            { lang: '🇮🇳', name: 'Hindi', score: 76, type: 'Practice' },
                        ].map((activity, i) => (
                            <div
                                key={i}
                                className="flex items-center justify-between p-4 bg-dark-50 border-3 border-black"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="text-3xl">{activity.lang}</div>
                                    <div>
                                        <div className="font-display font-bold">{activity.name}</div>
                                        <div className="text-sm text-dark-600 font-mono">{activity.type}</div>
                                    </div>
                                </div>
                                <div className="score-badge bg-primary-400">
                                    {activity.score}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
