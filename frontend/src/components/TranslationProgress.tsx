/**
 * Translation Progress Bar Component
 * Shows a floating progress bar during translation
 */

import { useTranslation } from '../contexts/TranslationContext';
import { Globe, Check } from 'lucide-react';

export default function TranslationProgress() {
    const { isTranslating, translationProgress, currentLocale } = useTranslation();

    // Don't show if not translating or English
    if (!isTranslating && translationProgress !== 100) {
        return null;
    }

    // Show completion briefly
    if (!isTranslating && translationProgress === 100 && currentLocale && !currentLocale.startsWith('en')) {
        return (
            <div className="fixed bottom-6 right-6 z-[9999] animate-in slide-in-from-bottom-4 fade-in duration-300">
                <div className="bg-green-500 text-white px-4 py-3 rounded-lg shadow-lg border-2 border-black flex items-center gap-3">
                    <Check className="w-5 h-5" />
                    <span className="font-bold text-sm">Translation Complete!</span>
                </div>
            </div>
        );
    }

    // Show progress bar during translation
    if (!isTranslating) {
        return null;
    }

    return (
        <div className="fixed bottom-6 right-6 z-[9999] animate-in slide-in-from-bottom-4 fade-in duration-300">
            <div className="bg-white rounded-lg shadow-xl border-4 border-black p-4 min-w-[280px]">
                {/* Header */}
                <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center animate-pulse">
                        <Globe className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <p className="font-black text-sm uppercase tracking-wide">Translating</p>
                        <p className="text-xs text-gray-500">{currentLocale}</p>
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="relative h-3 bg-gray-200 rounded-full overflow-hidden border-2 border-black">
                    <div
                        className="absolute left-0 top-0 h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300 ease-out"
                        style={{ width: `${translationProgress}%` }}
                    />
                </div>

                {/* Progress Text */}
                <div className="flex justify-between items-center mt-2">
                    <span className="text-xs font-bold text-gray-600">
                        {translationProgress < 50 ? 'Sending strings...' : 'Receiving translations...'}
                    </span>
                    <span className="text-xs font-black text-blue-600">{translationProgress}%</span>
                </div>
            </div>
        </div>
    );
}
