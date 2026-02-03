import { Router } from 'express';

const router = Router();

// Mock data for 80+ languages (in production, integrate with Lingo.dev API)
const SUPPORTED_LANGUAGES = [
    { code: 'en', name: 'English', nativeName: 'English', flag: '🇬🇧' },
    { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸' },
    { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷' },
    { code: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪' },
    { code: 'zh', name: 'Chinese', nativeName: '中文', flag: '🇨🇳' },
    { code: 'ja', name: 'Japanese', nativeName: '日本語', flag: '🇯🇵' },
    { code: 'ko', name: 'Korean', nativeName: '한국어', flag: '🇰🇷' },
    { code: 'ar', name: 'Arabic', nativeName: 'العربية', flag: '🇸🇦' },
    { code: 'pt', name: 'Portuguese', nativeName: 'Português', flag: '🇵🇹' },
    { code: 'ru', name: 'Russian', nativeName: 'Русский', flag: '🇷🇺' },
    { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', flag: '🇮🇳' },
    { code: 'it', name: 'Italian', nativeName: 'Italiano', flag: '🇮🇹' },
    { code: 'tr', name: 'Turkish', nativeName: 'Türkçe', flag: '🇹🇷' },
    { code: 'pl', name: 'Polish', nativeName: 'Polski', flag: '🇵🇱' },
    { code: 'nl', name: 'Dutch', nativeName: 'Nederlands', flag: '🇳🇱' },
    // Add more languages as needed...
];

// Get all supported languages
router.get('/supported', async (_req, res) => {
    try {
        res.json({
            success: true,
            languages: SUPPORTED_LANGUAGES,
            count: SUPPORTED_LANGUAGES.length
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: { message: 'Failed to fetch languages' }
        });
    }
});

// Get language info by code
router.get('/:code', async (req, res) => {
    try {
        const { code } = req.params;
        const language = SUPPORTED_LANGUAGES.find(lang => lang.code === code);

        if (!language) {
            return res.status(404).json({
                success: false,
                error: { message: 'Language not found' }
            });
        }

        res.json({
            success: true,
            language
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: { message: 'Failed to fetch language info' }
        });
    }
});

// Detect language from text
router.post('/detect', async (req, res) => {
    try {
        const { text } = req.body;

        if (!text) {
            return res.status(400).json({
                success: false,
                error: { message: 'Text is required' }
            });
        }

        // In production, use Lingo.dev or Google Translate API
        // For now, return English as default
        const detectedLanguage = SUPPORTED_LANGUAGES[0];

        res.json({
            success: true,
            language: detectedLanguage,
            confidence: 0.95
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: { message: 'Failed to detect language' }
        });
    }
});

export default router;
