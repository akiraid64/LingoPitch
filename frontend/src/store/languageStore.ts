import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CulturalProfile {
    languageCode: string;
    countryName: string;
    communicationStyle: 'direct' | 'indirect' | 'hybrid';
    formalityLevel: number; // 1-10
    relationshipImportance: number; // 1-10
    timeOrientation: 'punctual' | 'flexible' | 'relationship-based';
    decisionMaking: 'individual' | 'consensus' | 'hierarchical';
    taboos: string[];
    powerPhrases: string[];
    greetingProtocol: string;
    closingProtocol: string;
    objectionStyle: string;
    trustBuildingTime: string;
}

export interface LanguageInfo {
    code: string;
    name: string;
    nativeName: string;
    flag: string;
    region: string;
}

interface LanguageState {
    // Current language
    currentLanguage: string;
    currentLanguageInfo: LanguageInfo | null;

    // Translation target locale (for Lingo.dev)
    targetLocale: string | null;

    // Cultural profile
    culturalProfile: CulturalProfile | null;
    isLoadingProfile: boolean;

    // Available languages (from Lingo.dev)
    availableLanguages: LanguageInfo[];

    // Actions
    setLanguage: (langCode: string) => Promise<void>;
    setTargetLocale: (localeCode: string | null) => void;
    fetchCulturalProfile: (langCode: string) => Promise<void>;
    loadAvailableLanguages: () => Promise<void>;
}

export const useLanguageStore = create<LanguageState>()(
    persist(
        (set, get) => ({
            currentLanguage: 'en',
            currentLanguageInfo: {
                code: 'en',
                name: 'English (Original)',
                nativeName: 'English',
                flag: '🇺🇸',
                region: 'United States',
            },
            targetLocale: null, // No translation by default (English)
            culturalProfile: null,
            isLoadingProfile: false,
            availableLanguages: [],

            setLanguage: async (langCode: string) => {
                const state = get();

                // Don't reload if same language
                if (state.currentLanguage === langCode) return;

                set({ isLoadingProfile: true });

                try {
                    // Fetch language info
                    const langInfo = await fetch(`/api/language/info?code=${langCode}`)
                        .then(res => res.json());

                    // Fetch cultural profile
                    await get().fetchCulturalProfile(langCode);

                    set({
                        currentLanguage: langCode,
                        currentLanguageInfo: langInfo.data,
                        isLoadingProfile: false,
                    });

                    // Update i18n
                    if (typeof window !== 'undefined') {
                        window.dispatchEvent(new CustomEvent('languageChanged', { detail: langCode }));
                    }
                } catch (error) {
                    console.error('Failed to set language:', error);
                    set({ isLoadingProfile: false });
                }
            },

            setTargetLocale: (localeCode: string | null) => {
                console.log('🔄 languageStore: Setting targetLocale to:', localeCode);
                set({ targetLocale: localeCode });
            },

            fetchCulturalProfile: async (langCode: string) => {
                try {
                    const response = await fetch(`/api/cultural/profile?lang=${langCode}`);
                    const data = await response.json();

                    set({ culturalProfile: data.profile });
                } catch (error) {
                    console.error('Failed to fetch cultural profile:', error);
                    set({ culturalProfile: null });
                }
            },

            loadAvailableLanguages: async () => {
                try {
                    const response = await fetch('/api/language/supported');
                    const data = await response.json();
                    set({ availableLanguages: data.languages });
                } catch (error) {
                    console.error('Failed to load languages:', error);
                }
            },
        }),
        {
            name: 'lingo-language-storage-v2',
            partialize: (state) => ({
                currentLanguage: state.currentLanguage,
                currentLanguageInfo: state.currentLanguageInfo,
                targetLocale: state.targetLocale, // Persist selection
            }),
        }
    )
);
