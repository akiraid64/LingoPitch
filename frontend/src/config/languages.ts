/**
 * Language Configuration for Lingo.dev Translation
 * 12 Languages | 24 Accents/Variants
 * 
 * Each entry includes human-readable descriptions so users
 * understand what each accent means (not just codes).
 */

export interface LanguageVariant {
    code: string;           // ISO code (e.g., "en-US")
    language: string;       // Base language name
    accent: string;         // Human-readable accent/region
    flag: string;           // Emoji flag
    nativeName: string;     // Name in native script
    description: string;    // Full description for UI
    lingoDotDevCode: string; // Code to send to Lingo.dev API
}

export const SUPPORTED_LANGUAGES: LanguageVariant[] = [
    // ===== ENGLISH (5 variants) =====
    {
        code: 'en-US',
        language: 'English',
        accent: 'United States',
        flag: '🇺🇸',
        nativeName: 'English',
        description: 'English (Original)',
        lingoDotDevCode: 'en'
    },
    {
        code: 'en-GB',
        language: 'English',
        accent: 'United Kingdom',
        flag: '🇬🇧',
        nativeName: 'English',
        description: 'English (British)',
        lingoDotDevCode: 'en'
    },
    {
        code: 'en-AU',
        language: 'English',
        accent: 'Australia',
        flag: '🇦🇺',
        nativeName: 'English',
        description: 'English (Australian)',
        lingoDotDevCode: 'en'
    },
    {
        code: 'en-CA',
        language: 'English',
        accent: 'Canada',
        flag: '🇨🇦',
        nativeName: 'English',
        description: 'English (Canadian)',
        lingoDotDevCode: 'en'
    },
    {
        code: 'en-IE',
        language: 'English',
        accent: 'Ireland',
        flag: '🇮🇪',
        nativeName: 'English',
        description: 'English (Irish)',
        lingoDotDevCode: 'en'
    },

    // ===== SPANISH (2 variants) =====
    {
        code: 'es-ES',
        language: 'Spanish',
        accent: 'Spain',
        flag: '🇪🇸',
        nativeName: 'Español',
        description: 'Spanish (Castilian - Spain)',
        lingoDotDevCode: 'es'
    },
    {
        code: 'es-419',
        language: 'Spanish',
        accent: 'Latin America',
        flag: '🌎',
        nativeName: 'Español',
        description: 'Spanish (Latin American)',
        lingoDotDevCode: 'es'
    },

    // ===== FRENCH (2 variants) =====
    {
        code: 'fr-FR',
        language: 'French',
        accent: 'France',
        flag: '🇫🇷',
        nativeName: 'Français',
        description: 'French (France)',
        lingoDotDevCode: 'fr'
    },
    {
        code: 'fr-CA',
        language: 'French',
        accent: 'Canada (Québec)',
        flag: '🇨🇦',
        nativeName: 'Français',
        description: 'French (Canadian/Québécois)',
        lingoDotDevCode: 'fr'
    },

    // ===== PORTUGUESE (2 variants) =====
    {
        code: 'pt-PT',
        language: 'Portuguese',
        accent: 'Portugal',
        flag: '🇵🇹',
        nativeName: 'Português',
        description: 'Portuguese (European)',
        lingoDotDevCode: 'pt'
    },
    {
        code: 'pt-BR',
        language: 'Portuguese',
        accent: 'Brazil',
        flag: '🇧🇷',
        nativeName: 'Português',
        description: 'Portuguese (Brazilian)',
        lingoDotDevCode: 'pt'
    },

    // ===== GERMAN (1 variant) =====
    {
        code: 'de-DE',
        language: 'German',
        accent: 'Germany',
        flag: '🇩🇪',
        nativeName: 'Deutsch',
        description: 'German (Standard)',
        lingoDotDevCode: 'de'
    },

    // ===== CHINESE (2 variants) =====
    {
        code: 'zh-CN',
        language: 'Chinese',
        accent: 'Mainland China',
        flag: '🇨🇳',
        nativeName: '简体中文',
        description: 'Chinese (Simplified/Mandarin)',
        lingoDotDevCode: 'zh'
    },
    {
        code: 'zh-HK',
        language: 'Chinese',
        accent: 'Hong Kong',
        flag: '🇭🇰',
        nativeName: '繁體中文',
        description: 'Chinese (Cantonese)',
        lingoDotDevCode: 'zh'
    },

    // ===== ARABIC (3 variants) =====
    {
        code: 'ar-SA',
        language: 'Arabic',
        accent: 'Saudi Arabia',
        flag: '🇸🇦',
        nativeName: 'العربية',
        description: 'Arabic (Saudi)',
        lingoDotDevCode: 'ar'
    },
    {
        code: 'ar-AE',
        language: 'Arabic',
        accent: 'UAE',
        flag: '🇦🇪',
        nativeName: 'العربية',
        description: 'Arabic (Emirati)',
        lingoDotDevCode: 'ar'
    },
    {
        code: 'ar-EG',
        language: 'Arabic',
        accent: 'Egypt',
        flag: '🇪🇬',
        nativeName: 'العربية',
        description: 'Arabic (Egyptian)',
        lingoDotDevCode: 'ar'
    },

    // ===== DUTCH (2 variants) =====
    {
        code: 'nl-NL',
        language: 'Dutch',
        accent: 'Netherlands',
        flag: '🇳🇱',
        nativeName: 'Nederlands',
        description: 'Dutch (Netherlands)',
        lingoDotDevCode: 'nl'
    },
    {
        code: 'nl-BE',
        language: 'Dutch',
        accent: 'Belgium',
        flag: '🇧🇪',
        nativeName: 'Vlaams',
        description: 'Dutch (Flemish/Belgian)',
        lingoDotDevCode: 'nl'
    },

    // ===== HINDI (1 variant) =====
    {
        code: 'hi-IN',
        language: 'Hindi',
        accent: 'India',
        flag: '🇮🇳',
        nativeName: 'हिन्दी',
        description: 'Hindi (India)',
        lingoDotDevCode: 'hi'
    },

    // ===== ITALIAN (1 variant) =====
    {
        code: 'it-IT',
        language: 'Italian',
        accent: 'Italy',
        flag: '🇮🇹',
        nativeName: 'Italiano',
        description: 'Italian (Italy)',
        lingoDotDevCode: 'it'
    },

    // ===== JAPANESE (1 variant) =====
    {
        code: 'ja-JP',
        language: 'Japanese',
        accent: 'Japan',
        flag: '🇯🇵',
        nativeName: '日本語',
        description: 'Japanese (Japan)',
        lingoDotDevCode: 'ja'
    },

    // ===== KOREAN (1 variant) =====
    {
        code: 'ko-KR',
        language: 'Korean',
        accent: 'South Korea',
        flag: '🇰🇷',
        nativeName: '한국어',
        description: 'Korean (South Korea)',
        lingoDotDevCode: 'ko'
    },
];

// Helper: Get all unique base languages for grouping in UI
export const getLanguageGroups = () => {
    const groups: { [key: string]: LanguageVariant[] } = {};
    SUPPORTED_LANGUAGES.forEach(lang => {
        if (!groups[lang.language]) {
            groups[lang.language] = [];
        }
        groups[lang.language].push(lang);
    });
    return groups;
};

// Helper: Find language by code
export const getLanguageByCode = (code: string): LanguageVariant | undefined => {
    return SUPPORTED_LANGUAGES.find(l => l.code === code);
};

// Default language
export const DEFAULT_LANGUAGE = SUPPORTED_LANGUAGES[0]; // en-US
