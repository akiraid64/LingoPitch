import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Mic, Play, Square, Info } from 'lucide-react';
import { useLanguageStore } from '@/store/languageStore';
import { CulturalBriefing } from '@/components/CulturalBriefing';
import { useTranslation } from '@/contexts/TranslationContext';

export function ArenaPage() {
    const { currentLanguageInfo, culturalProfile } = useLanguageStore();
    const { t } = useTranslation();
    const [showBriefing, setShowBriefing] = useState(true);
    const [isInCall, setIsInCall] = useState(false);

    return (
        <div className="min-h-screen bg-gradient-to-b from-dark-50 to-accent-50 py-12 px-4">
            <div className="max-w-7xl mx-auto">
                {/* Page Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-12"
                >
                    <h1 className="font-display font-bold text-5xl md:text-6xl uppercase mb-4">
                        {t('arena.title')}
                    </h1>
                    <p className="text-xl text-dark-700 font-medium">
                        {t('arena.subtitle')} - {currentLanguageInfo?.name || 'Any Region'}
                    </p>
                </motion.div>

                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Left: Cultural Briefing */}
                    <div className="lg:col-span-2">
                        {showBriefing ? (
                            <div>
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="font-display font-bold text-2xl uppercase">
                                        {t('arena.culturalBriefing')}
                                    </h2>
                                    <button
                                        onClick={() => setShowBriefing(false)}
                                        className="btn-brutal-outline text-sm px-4 py-2"
                                    >
                                        Hide Briefing
                                    </button>
                                </div>
                                <CulturalBriefing />
                            </div>
                        ) : (
                            <div className="brutal-card bg-primary-50 text-center py-12">
                                <Info className="w-12 h-12 mx-auto mb-4 text-primary-600" />
                                <h3 className="font-display font-bold text-2xl uppercase mb-4">
                                    Briefing Hidden
                                </h3>
                                <p className="text-dark-700 mb-6">
                                    Ready to start practicing?
                                </p>
                                <button
                                    onClick={() => setShowBriefing(true)}
                                    className="btn-brutal-secondary"
                                >
                                    Show Briefing
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Right: Call Controls */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-24 space-y-6">
                            {/* Language Indicator */}
                            <div className="glass-card text-center">
                                <div className="text-6xl mb-4">{currentLanguageInfo?.flag}</div>
                                <div className="font-display font-bold text-xl uppercase">
                                    {currentLanguageInfo?.name}
                                </div>
                                <div className="language-badge mt-4 w-full justify-center">
                                    {culturalProfile?.communicationStyle || 'direct'}
                                </div>
                            </div>

                            {/* Call Controls */}
                            <div className="brutal-card bg-gradient-to-br from-primary-50 to-accent-50">
                                <h3 className="font-display font-bold text-lg uppercase mb-6 text-center">
                                    Voice Practice
                                </h3>

                                {!isInCall ? (
                                    <button
                                        onClick={() => setIsInCall(true)}
                                        className="w-full btn-brutal flex items-center justify-center gap-3"
                                    >
                                        <Play className="w-6 h-6" />
                                        <span>{t('arena.startSession')}</span>
                                    </button>
                                ) : (
                                    <div className="space-y-4">
                                        {/* Active Call Indicator */}
                                        <div className="p-6 bg-red-100 border-4 border-black text-center">
                                            <div className="flex items-center justify-center gap-2 mb-2">
                                                <div className="w-3 h-3 bg-red-600 rounded-full animate-pulse" />
                                                <span className="font-display font-bold uppercase text-sm">
                                                    Live Call
                                                </span>
                                            </div>
                                            <div className="font-mono text-2xl font-bold">
                                                05:32
                                            </div>
                                        </div>

                                        {/* Audio Visualizer Placeholder */}
                                        <div className="p-6 bg-dark-900 border-4 border-black">
                                            <div className="flex items-end justify-center gap-1 h-24">
                                                {[...Array(20)].map((_, i) => (
                                                    <div
                                                        key={i}
                                                        className="w-2 bg-accent-400 animate-pulse"
                                                        style={{
                                                            height: `${Math.random() * 100}%`,
                                                            animationDelay: `${i * 0.05}s`,
                                                        }}
                                                    />
                                                ))}
                                            </div>
                                        </div>

                                        {/* End Call */}
                                        <button
                                            onClick={() => setIsInCall(false)}
                                            className="w-full px-6 py-4 bg-red-500 text-white border-4 border-black
                                 shadow-brutal font-display font-bold text-xl uppercase
                                 hover:translate-x-2 hover:translate-y-2 hover:shadow-brutal-sm
                                 transition-all duration-200 flex items-center justify-center gap-3"
                                        >
                                            <Square className="w-6 h-6" />
                                            <span>{t('arena.endSession')}</span>
                                        </button>
                                    </div>
                                )}

                                {!isInCall && (
                                    <div className="mt-6 p-4 bg-accent-100 border-3 border-black">
                                        <p className="text-sm text-dark-700 font-mono">
                                            💡 Tip: Review the cultural briefing before starting.
                                            The AI will adapt based on {currentLanguageInfo?.name} norms.
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Scenario Selector */}
                            <div className="brutal-card">
                                <h3 className="font-display font-bold text-sm uppercase mb-4">
                                    Select Scenario
                                </h3>
                                <div className="space-y-2">
                                    {['Cold Call', 'Discovery', 'Objection Handling', 'Closing'].map(
                                        (scenario) => (
                                            <button
                                                key={scenario}
                                                className="w-full px-4 py-3 bg-white border-3 border-black
                                   hover:bg-accent-100 hover:translate-x-1
                                   transition-all duration-150 text-left
                                   font-display font-bold text-sm uppercase"
                                            >
                                                {scenario}
                                            </button>
                                        )
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
