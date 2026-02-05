/**
 * Translation Context
 * Provides real-time translation for all UI strings using Lingo.dev SDK
 */

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useLanguageStore } from '../store/languageStore';
import { FLAT_UI_STRINGS } from '../config/uiStrings';

const API_URL = (import.meta as any).env.VITE_API_URL || 'http://localhost:3001';

interface TranslationContextType {
    t: (key: string) => string;
    isTranslating: boolean;
    translationProgress: number; // 0-100
    currentLocale: string | null;
}

const TranslationContext = createContext<TranslationContextType>({
    t: (key: string) => FLAT_UI_STRINGS[key] || key,
    isTranslating: false,
    translationProgress: 0,
    currentLocale: null,
});

// Cache translations per locale
const translationCache: Record<string, Record<string, string>> = {};

interface TranslationProviderProps {
    children: ReactNode;
}

export function TranslationProvider({ children }: TranslationProviderProps) {
    const { targetLocale } = useLanguageStore();
    const [translations, setTranslations] = useState<Record<string, string>>(FLAT_UI_STRINGS);
    const [isTranslating, setIsTranslating] = useState(false);
    const [translationProgress, setTranslationProgress] = useState(0);

    // Fetch translations when locale changes
    useEffect(() => {
        const fetchTranslations = async () => {
            console.log('[TranslationContext] 🔄 Locale changed to:', targetLocale);

            // If English or no locale, use defaults
            if (!targetLocale || targetLocale.startsWith('en')) {
                console.log('[TranslationContext] ℹ️ Using English (default) strings');
                setTranslations(FLAT_UI_STRINGS);
                setTranslationProgress(0);
                return;
            }

            // Check localStorage cache first (Persistent)
            try {
                const cacheKey = `lingo_ui_strings_${targetLocale}`;
                console.log(`[TranslationContext] 🔍 Checking LOCAL storage for: ${cacheKey}`);

                // DEBUG: Print all keys to see if we are close
                const keys = Object.keys(localStorage).filter(k => k.startsWith('lingo_'));
                console.log('[TranslationContext] 📂 Available lingo keys:', keys);

                const cachedData = localStorage.getItem(cacheKey);

                if (cachedData) {
                    const parsed = JSON.parse(cachedData);
                    // Simple validation: check if it has keys
                    if (Object.keys(parsed).length > 0) {
                        console.log('[TranslationContext] ✅ Using LOCAL storage translations for:', targetLocale);
                        translationCache[targetLocale] = parsed;
                        setTranslations(parsed);
                        setTranslationProgress(100);
                        return;
                    } else {
                        console.warn('[TranslationContext] ⚠️ Local cache found but empty');
                    }
                } else {
                    console.log('[TranslationContext] ❌ Local cache MISS');
                }
            } catch (e) {
                console.warn('[TranslationContext] Failed to read local storage', e);
            }

            // Check memory cache second
            if (translationCache[targetLocale]) {
                console.log('[TranslationContext] ✅ Using MEMORY cached translations for:', targetLocale);
                setTranslations(translationCache[targetLocale]);
                setTranslationProgress(100);
                return;
            }

            // Fetch from backend
            setIsTranslating(true);
            setTranslationProgress(10); // Start progress
            console.log('[TranslationContext] 📡 Fetching translations for:', targetLocale);
            console.log('[TranslationContext] 📦 String count:', Object.keys(FLAT_UI_STRINGS).length);

            try {
                const startTime = Date.now();

                const response = await fetch(`${API_URL}/api/translation/ui-strings`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        strings: FLAT_UI_STRINGS,
                        targetLocale,
                    }),
                });

                setTranslationProgress(50); // Midway progress

                if (!response.ok) {
                    const errorData = await response.json();
                    console.error('[TranslationContext] ❌ API error:', errorData);
                    throw new Error(errorData.error?.message || 'Translation request failed');
                }

                const data = await response.json();
                const duration = Date.now() - startTime;

                if (data.success && data.translated) {
                    console.log(`[TranslationContext] ✅ Translations loaded in ${duration}ms`);
                    console.log('[TranslationContext] 📊 Translated strings:', Object.keys(data.translated).length);

                    translationCache[targetLocale] = data.translated;
                    setTranslations(data.translated);
                    setTranslationProgress(100);

                    // Save to local storage
                    try {
                        const cacheKey = `lingo_ui_strings_${targetLocale}`;
                        localStorage.setItem(cacheKey, JSON.stringify(data.translated));
                    } catch (e) {
                        console.warn('[TranslationContext] Failed to save to local storage', e);
                    }
                } else {
                    console.error('[TranslationContext] ❌ Invalid response:', data);
                    throw new Error('Invalid translation response');
                }
            } catch (error) {
                console.error('[TranslationContext] ❌ Translation failed:', error);
                setTranslations(FLAT_UI_STRINGS);
                setTranslationProgress(0);
            } finally {
                setIsTranslating(false);
            }
        };

        fetchTranslations();
    }, [targetLocale]);

    // Translation function with fallback
    const t = useCallback((key: string): string => {
        const translated = translations[key];
        if (!translated) {
            console.warn(`[TranslationContext] ⚠️ Missing translation for key: "${key}"`);
        }
        return translated || FLAT_UI_STRINGS[key] || key;
    }, [translations]);

    return (
        <TranslationContext.Provider value={{ t, isTranslating, translationProgress, currentLocale: targetLocale }}>
            {children}
        </TranslationContext.Provider>
    );
}

// Hook to use translations
export function useTranslation() {
    const context = useContext(TranslationContext);
    if (!context) {
        throw new Error('useTranslation must be used within a TranslationProvider');
    }
    return context;
}

// Shorthand hook that just returns t()
export function useT() {
    return useTranslation().t;
}
