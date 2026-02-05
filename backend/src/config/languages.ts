/**
 * Language Configuration for Backend
 * Matches frontend/src/config/languages.ts
 */

export interface LanguageVariant {
    code: string;
    language: string;
    accent: string;
    flag: string;
    nativeName: string;
    description: string;
    lingoDotDevCode: string;
}

export const SUPPORTED_LANGUAGES: LanguageVariant[] = [
    // ENGLISH
    { code: 'en-US', language: 'English', accent: 'United States', flag: '🇺🇸', nativeName: 'English', description: 'English (American)', lingoDotDevCode: 'en' },
    { code: 'en-GB', language: 'English', accent: 'United Kingdom', flag: '🇬🇧', nativeName: 'English', description: 'English (British)', lingoDotDevCode: 'en' },
    { code: 'en-AU', language: 'English', accent: 'Australia', flag: '🇦🇺', nativeName: 'English', description: 'English (Australian)', lingoDotDevCode: 'en' },
    { code: 'en-CA', language: 'English', accent: 'Canada', flag: '🇨🇦', nativeName: 'English', description: 'English (Canadian)', lingoDotDevCode: 'en' },
    { code: 'en-IE', language: 'English', accent: 'Ireland', flag: '🇮🇪', nativeName: 'English', description: 'English (Irish)', lingoDotDevCode: 'en' },
    // SPANISH
    { code: 'es-ES', language: 'Spanish', accent: 'Spain', flag: '🇪🇸', nativeName: 'Español', description: 'Spanish (Castilian)', lingoDotDevCode: 'es' },
    { code: 'es-419', language: 'Spanish', accent: 'Latin America', flag: '🌎', nativeName: 'Español', description: 'Spanish (Latin American)', lingoDotDevCode: 'es' },
    // FRENCH
    { code: 'fr-FR', language: 'French', accent: 'France', flag: '🇫🇷', nativeName: 'Français', description: 'French (France)', lingoDotDevCode: 'fr' },
    { code: 'fr-CA', language: 'French', accent: 'Canada', flag: '🇨🇦', nativeName: 'Français', description: 'French (Québécois)', lingoDotDevCode: 'fr' },
    // PORTUGUESE
    { code: 'pt-PT', language: 'Portuguese', accent: 'Portugal', flag: '🇵🇹', nativeName: 'Português', description: 'Portuguese (European)', lingoDotDevCode: 'pt' },
    { code: 'pt-BR', language: 'Portuguese', accent: 'Brazil', flag: '🇧🇷', nativeName: 'Português', description: 'Portuguese (Brazilian)', lingoDotDevCode: 'pt' },
    // GERMAN
    { code: 'de-DE', language: 'German', accent: 'Germany', flag: '🇩🇪', nativeName: 'Deutsch', description: 'German (Standard)', lingoDotDevCode: 'de' },
    // CHINESE
    { code: 'zh-CN', language: 'Chinese', accent: 'Mainland China', flag: '🇨🇳', nativeName: '简体中文', description: 'Chinese (Simplified/Mandarin)', lingoDotDevCode: 'zh' },
    { code: 'zh-HK', language: 'Chinese', accent: 'Hong Kong', flag: '🇭🇰', nativeName: '繁體中文', description: 'Chinese (Cantonese)', lingoDotDevCode: 'zh' },
    // ARABIC
    { code: 'ar-SA', language: 'Arabic', accent: 'Saudi Arabia', flag: '🇸🇦', nativeName: 'العربية', description: 'Arabic (Saudi)', lingoDotDevCode: 'ar' },
    { code: 'ar-AE', language: 'Arabic', accent: 'UAE', flag: '🇦🇪', nativeName: 'العربية', description: 'Arabic (Emirati)', lingoDotDevCode: 'ar' },
    { code: 'ar-EG', language: 'Arabic', accent: 'Egypt', flag: '🇪🇬', nativeName: 'العربية', description: 'Arabic (Egyptian)', lingoDotDevCode: 'ar' },
    // DUTCH
    { code: 'nl-NL', language: 'Dutch', accent: 'Netherlands', flag: '🇳🇱', nativeName: 'Nederlands', description: 'Dutch (Netherlands)', lingoDotDevCode: 'nl' },
    { code: 'nl-BE', language: 'Dutch', accent: 'Belgium', flag: '🇧🇪', nativeName: 'Vlaams', description: 'Dutch (Flemish)', lingoDotDevCode: 'nl' },
    // HINDI
    { code: 'hi-IN', language: 'Hindi', accent: 'India', flag: '🇮🇳', nativeName: 'हिन्दी', description: 'Hindi (India)', lingoDotDevCode: 'hi' },
    // ITALIAN
    { code: 'it-IT', language: 'Italian', accent: 'Italy', flag: '🇮🇹', nativeName: 'Italiano', description: 'Italian (Italy)', lingoDotDevCode: 'it' },
    // JAPANESE
    { code: 'ja-JP', language: 'Japanese', accent: 'Japan', flag: '🇯🇵', nativeName: '日本語', description: 'Japanese (Japan)', lingoDotDevCode: 'ja' },
    // KOREAN
    { code: 'ko-KR', language: 'Korean', accent: 'South Korea', flag: '🇰🇷', nativeName: '한국어', description: 'Korean (South Korea)', lingoDotDevCode: 'ko' },
];

export const getLanguageByCode = (code: string): LanguageVariant | undefined => {
    return SUPPORTED_LANGUAGES.find(l => l.code === code);
};
