import { RoleplayAgent } from '@/components/RoleplayAgent';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

export function RoleplayPage() {
    return (
        <div className="min-h-screen bg-gradient-to-b from-dark-50 to-dark-100 py-12 px-4">
            <div className="max-w-4xl mx-auto">
                {/* Page Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-12 text-center"
                >
                    <div className="flex items-center justify-center gap-3 mb-4">
                        <Sparkles className="w-12 h-12 text-primary-500" />
                        <h1 className="font-display font-bold text-5xl md:text-6xl uppercase">
                            AI Roleplay
                        </h1>
                    </div>
                    <p className="text-xl text-gray-400">
                        Practice sales calls with culturally-aware AI customers
                    </p>
                </motion.div>

                {/* Roleplay Agent Component */}
                <RoleplayAgent />

                {/* Info Section */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="mt-16 bg-dark-800/50 border border-dark-700 rounded-lg p-6"
                >
                    <h3 className="font-bold text-lg mb-3">How it works:</h3>
                    <ul className="space-y-2 text-sm text-gray-400">
                        <li>• Select your target language from the header</li>
                        <li>• Gemini AI generates a culturally-aware customer profile</li>
                        <li>• Click "Start Roleplay" to begin voice conversation</li>
                        <li>• Practice your pitch with real-time cultural feedback</li>
                    </ul>
                </motion.div>
            </div>
        </div>
    );
}
