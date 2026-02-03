import { motion } from 'framer-motion';
import {
    AlertCircle,
    CheckCircle2,
    MessageSquare,
    TrendingUp,
    Clock,
    Users,
    Shield
} from 'lucide-react';
import { useLanguageStore } from '@/store/languageStore';

export function CulturalBriefing() {
    const { culturalProfile, currentLanguageInfo, isLoadingProfile } = useLanguageStore();

    if (isLoadingProfile) {
        return (
            <div className="glass-card">
                <div className="flex items-center justify-center py-12">
                    <div className="w-12 h-12 border-4 border-black border-t-primary-400 rounded-full animate-spin" />
                </div>
            </div>
        );
    }

    if (!culturalProfile) {
        return (
            <div className="brutal-card bg-accent-50">
                <div className="text-center py-8">
                    <AlertCircle className="w-12 h-12 mx-auto mb-4 text-dark-400" />
                    <p className="text-dark-600 font-mono">
                        No cultural profile loaded. Select a language to get started.
                    </p>
                </div>
            </div>
        );
    }

    const getFormalityColor = (level: number) => {
        if (level >= 8) return 'bg-primary-600';
        if (level >= 5) return 'bg-accent-500';
        return 'bg-dark-400';
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
        >
            {/* Header */}
            <div className="glass-card bg-gradient-to-br from-primary-50 to-accent-50">
                <div className="flex items-start gap-4">
                    <div className="text-6xl">{currentLanguageInfo?.flag}</div>
                    <div className="flex-1">
                        <h2 className="font-display font-bold text-3xl uppercase mb-2">
                            Cultural Intelligence: {culturalProfile.countryName}
                        </h2>
                        <p className="text-dark-700 font-mono text-sm">
                            Mastering sales in {currentLanguageInfo?.name}
                        </p>
                    </div>
                </div>
            </div>

            {/* Communication Style */}
            <div className="brutal-card">
                <div className="flex items-center gap-3 mb-4">
                    <MessageSquare className="w-6 h-6 text-primary-600" />
                    <h3 className="font-display font-bold text-xl uppercase">
                        Communication Style
                    </h3>
                </div>
                <div className="flex items-center gap-4">
                    <span className="px-4 py-2 bg-accent-200 border-3 border-black font-bold text-lg uppercase">
                        {culturalProfile.communicationStyle}
                    </span>
                    <p className="text-dark-700 flex-1">
                        {culturalProfile.communicationStyle === 'direct' &&
                            'Be clear and straightforward. Get to the point quickly.'}
                        {culturalProfile.communicationStyle === 'indirect' &&
                            'Read between the lines. Build context before making requests.'}
                        {culturalProfile.communicationStyle === 'hybrid' &&
                            'Balance clarity with politeness. Adapt to the situation.'}
                    </p>
                </div>
            </div>

            {/* Formality & Relationship */}
            <div className="grid md:grid-cols-2 gap-6">
                {/* Formality */}
                <div className="brutal-card">
                    <h3 className="font-display font-bold text-lg uppercase mb-4">
                        Formality Level
                    </h3>
                    <div className="relative mb-4">
                        <div className="h-6 bg-dark-200 border-3 border-black">
                            <div
                                className={`h-full ${getFormalityColor(culturalProfile.formalityLevel)} border-r-3 border-black
                           transition-all duration-500`}
                                style={{ width: `${culturalProfile.formalityLevel * 10}%` }}
                            />
                        </div>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-sm font-mono text-dark-600">Casual</span>
                        <span className="font-display font-bold text-2xl">
                            {culturalProfile.formalityLevel}/10
                        </span>
                        <span className="text-sm font-mono text-dark-600">Formal</span>
                    </div>
                </div>

                {/* Relationship Importance */}
                <div className="brutal-card">
                    <h3 className="font-display font-bold text-lg uppercase mb-4">
                        Relationship Building
                    </h3>
                    <div className="relative mb-4">
                        <div className="h-6 bg-dark-200 border-3 border-black">
                            <div
                                className="h-full bg-accent-500 border-r-3 border-black transition-all duration-500"
                                style={{ width: `${culturalProfile.relationshipImportance * 10}%` }}
                            />
                        </div>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-sm font-mono text-dark-600">Transactional</span>
                        <span className="font-display font-bold text-2xl">
                            {culturalProfile.relationshipImportance}/10
                        </span>
                        <span className="text-sm font-mono text-dark-600">Relationship-First</span>
                    </div>
                </div>
            </div>

            {/* Key Characteristics */}
            <div className="grid md:grid-cols-3 gap-4">
                <div className="glass-card text-center">
                    <Clock className="w-8 h-8 mx-auto mb-2 text-primary-600" />
                    <div className="font-display font-bold text-sm uppercase mb-1">
                        Time Orientation
                    </div>
                    <div className="text-dark-700 font-mono text-xs">
                        {culturalProfile.timeOrientation}
                    </div>
                </div>

                <div className="glass-card text-center">
                    <Users className="w-8 h-8 mx-auto mb-2 text-accent-600" />
                    <div className="font-display font-bold text-sm uppercase mb-1">
                        Decision Making
                    </div>
                    <div className="text-dark-700 font-mono text-xs">
                        {culturalProfile.decisionMaking}
                    </div>
                </div>

                <div className="glass-card text-center">
                    <Shield className="w-8 h-8 mx-auto mb-2 text-primary-600" />
                    <div className="font-display font-bold text-sm uppercase mb-1">
                        Trust Building
                    </div>
                    <div className="text-dark-700 font-mono text-xs">
                        {culturalProfile.trustBuildingTime}
                    </div>
                </div>
            </div>

            {/* Do's and Don'ts */}
            <div className="grid md:grid-cols-2 gap-6">
                {/* Power Phrases */}
                <div className="brutal-card bg-accent-50">
                    <div className="flex items-center gap-2 mb-4">
                        <CheckCircle2 className="w-6 h-6 text-accent-600" />
                        <h3 className="font-display font-bold text-lg uppercase">
                            Power Phrases
                        </h3>
                    </div>
                    <ul className="space-y-2">
                        {culturalProfile.powerPhrases.map((phrase, i) => (
                            <li key={i} className="flex items-start gap-2">
                                <span className="text-accent-600 font-bold">✓</span>
                                <span className="text-dark-800 flex-1">{phrase}</span>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Taboos */}
                <div className="brutal-card bg-red-50">
                    <div className="flex items-center gap-2 mb-4">
                        <AlertCircle className="w-6 h-6 text-red-600" />
                        <h3 className="font-display font-bold text-lg uppercase">
                            Avoid These
                        </h3>
                    </div>
                    <ul className="space-y-2">
                        {culturalProfile.taboos.map((taboo, i) => (
                            <li key={i} className="flex items-start gap-2">
                                <span className="text-red-600 font-bold">✗</span>
                                <span className="text-dark-800 flex-1">{taboo}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            {/* Protocols */}
            <div className="grid md:grid-cols-2 gap-6">
                <div className="brutal-card">
                    <h3 className="font-display font-bold text-lg uppercase mb-3">
                        🤝 Greeting Protocol
                    </h3>
                    <p className="text-dark-700">{culturalProfile.greetingProtocol}</p>
                </div>

                <div className="brutal-card">
                    <h3 className="font-display font-bold text-lg uppercase mb-3">
                        🎯 Closing Protocol
                    </h3>
                    <p className="text-dark-700">{culturalProfile.closingProtocol}</p>
                </div>
            </div>

            {/* Objection Style */}
            <div className="brutal-card bg-primary-50">
                <div className="flex items-center gap-2 mb-3">
                    <TrendingUp className="w-6 h-6 text-primary-600" />
                    <h3 className="font-display font-bold text-lg uppercase">
                        How Objections Are Raised
                    </h3>
                </div>
                <p className="text-dark-800">{culturalProfile.objectionStyle}</p>
            </div>
        </motion.div>
    );
}
