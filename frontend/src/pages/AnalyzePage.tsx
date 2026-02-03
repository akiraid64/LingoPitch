import { motion } from 'framer-motion';
import { Upload, FileText } from 'lucide-react';

export function AnalyzePage() {
    return (
        <div className="min-h-screen bg-gradient-to-b from-dark-50 to-primary-50 py-12 px-4">
            <div className="max-w-4xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-12"
                >
                    <h1 className="font-display font-bold text-5xl md:text-6xl uppercase mb-4">
                        Analyze Calls
                    </h1>
                    <p className="text-xl text-dark-700 font-medium">
                        Upload a real call transcript and get scored on 10 sales parameters
                        + 4 cultural intelligence metrics.
                    </p>
                </motion.div>

                {/* Upload Area */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="brutal-card bg-white text-center py-16"
                >
                    <div className="w-24 h-24 mx-auto mb-6 bg-accent-200 border-4 border-black shadow-brutal
                          flex items-center justify-center">
                        <Upload className="w-12 h-12" />
                    </div>

                    <h2 className="font-display font-bold text-3xl uppercase mb-4">
                        Upload Transcript
                    </h2>

                    <p className="text-dark-600 mb-8 max-w-md mx-auto">
                        Drop your .txt, .vtt, or .srt file here, or paste your transcript below
                    </p>

                    <button className="btn-brutal mb-8">
                        Choose File
                    </button>

                    <div className="max-w-2xl mx-auto">
                        <textarea
                            placeholder="Or paste your transcript here..."
                            className="w-full h-64 px-6 py-4 border-4 border-black font-mono text-sm
                         resize-none focus:outline-none focus:ring-4 focus:ring-accent-300"
                        />
                    </div>

                    <button className="btn-brutal-secondary mt-6">
                        Analyze with AI
                    </button>
                </motion.div>

                {/* Info Cards */}
                <div className="grid md:grid-cols-2 gap-6 mt-8">
                    <div className="glass-card">
                        <h3 className="font-display font-bold text-lg uppercase mb-3">
                            📊 Standard Parameters
                        </h3>
                        <ul className="text-sm text-dark-700 space-y-1 font-mono">
                            <li>• Needs Discovery</li>
                            <li>• Value Proposition</li>
                            <li>• Decision Process</li>
                            <li>• Stakeholder ID</li>
                            <li>• Objection Handling</li>
                            <li>+ 5 more...</li>
                        </ul>
                    </div>

                    <div className="glass-card bg-accent-50">
                        <h3 className="font-display font-bold text-lg uppercase mb-3">
                            🌍 Cultural Intelligence
                        </h3>
                        <ul className="text-sm text-dark-700 space-y-1 font-mono">
                            <li>• Cultural Awareness</li>
                            <li>• Relationship Pacing</li>
                            <li>• Formality Match</li>
                            <li>• Regional Sensitivity</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}
