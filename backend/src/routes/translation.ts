/**
 * Translation API Routes
 * Provides endpoints for real-time translation using Lingo.dev SDK
 */

import { Router, Request, Response } from 'express';
import { translateText, translateChat, detectLanguage, translateHtmlWithProgress } from '../services/translationService.js';
import { SUPPORTED_LANGUAGES, getLanguageByCode } from '../config/languages.js';

const router = Router();

/**
 * GET /api/translation/languages
 * Returns all supported languages with their metadata
 */
router.get('/languages', (_req: Request, res: Response) => {
    res.json({
        success: true,
        count: SUPPORTED_LANGUAGES.length,
        languages: SUPPORTED_LANGUAGES
    });
});

/**
 * POST /api/translation/translate
 * Translate text to a target language
 * Body: { text: string, sourceLocale?: string, targetLocale: string }
 */
router.post('/translate', async (req: Request, res: Response) => {
    try {
        const { text, sourceLocale, targetLocale } = req.body;

        if (!text || !targetLocale) {
            return res.status(400).json({
                success: false,
                error: { message: 'text and targetLocale are required' }
            });
        }

        // Map variant code to Lingo.dev base code
        const targetLang = getLanguageByCode(targetLocale);
        const lingoDotDevTarget = targetLang?.lingoDotDevCode || targetLocale;

        let lingoDotDevSource = sourceLocale;
        if (sourceLocale) {
            const sourceLang = getLanguageByCode(sourceLocale);
            lingoDotDevSource = sourceLang?.lingoDotDevCode || sourceLocale;
        }

        const translated = await translateText(text, lingoDotDevSource, lingoDotDevTarget);

        res.json({
            success: true,
            original: text,
            translated,
            sourceLocale: sourceLocale || 'auto-detect',
            targetLocale
        });
    } catch (error: any) {
        console.error('Translation error:', error);
        res.status(500).json({
            success: false,
            error: { message: error.message || 'Translation failed' }
        });
    }
});

/**
 * POST /api/translation/translate-chat
 * Translate chat messages while preserving speaker names
 * Body: { messages: Array<{name, text}>, sourceLocale: string, targetLocale: string }
 */
router.post('/translate-chat', async (req: Request, res: Response) => {
    try {
        const { messages, sourceLocale, targetLocale } = req.body;

        if (!messages || !Array.isArray(messages) || !targetLocale) {
            return res.status(400).json({
                success: false,
                error: { message: 'messages array and targetLocale are required' }
            });
        }

        const targetLang = getLanguageByCode(targetLocale);
        const sourceLang = getLanguageByCode(sourceLocale);

        const translated = await translateChat(
            messages,
            sourceLang?.lingoDotDevCode || sourceLocale || 'en',
            targetLang?.lingoDotDevCode || targetLocale
        );

        res.json({
            success: true,
            translated
        });
    } catch (error: any) {
        console.error('Chat translation error:', error);
        res.status(500).json({
            success: false,
            error: { message: error.message || 'Chat translation failed' }
        });
    }
});

/**
 * POST /api/translation/detect
 * Detect the language of text
 * Body: { text: string }
 */
router.post('/detect', async (req: Request, res: Response) => {
    try {
        const { text } = req.body;

        if (!text) {
            return res.status(400).json({
                success: false,
                error: { message: 'text is required' }
            });
        }

        const locale = await detectLanguage(text);

        res.json({
            success: true,
            locale,
            text: text.substring(0, 50) + (text.length > 50 ? '...' : '')
        });
    } catch (error: any) {
        console.error('Language detection error:', error);
        res.status(500).json({
            success: false,
            error: { message: error.message || 'Language detection failed' }
        });
    }
});

/**
 * POST /api/translation/ui-strings
 * Translate all UI strings at once using localizeObject
 * Body: { strings: Record<string, string>, targetLocale: string }
 */
router.post('/ui-strings', async (req: Request, res: Response) => {
    const startTime = Date.now();

    try {
        const { strings, targetLocale } = req.body;

        console.log(`[UI-Strings] 🌐 Request received for locale: ${targetLocale}`);
        console.log(`[UI-Strings] 📦 String count: ${Object.keys(strings || {}).length}`);

        if (!strings || typeof strings !== 'object') {
            console.log('[UI-Strings] ❌ Invalid strings object');
            return res.status(400).json({
                success: false,
                error: { message: 'strings object is required' }
            });
        }

        if (!targetLocale) {
            console.log('[UI-Strings] ❌ Missing targetLocale');
            return res.status(400).json({
                success: false,
                error: { message: 'targetLocale is required' }
            });
        }

        // If English, just return the original strings
        if (targetLocale.startsWith('en')) {
            console.log('[UI-Strings] ℹ️ English requested, returning original strings');
            return res.json({
                success: true,
                translated: strings,
                fromCache: false,
                duration: Date.now() - startTime
            });
        }

        // Map the target locale to Lingo.dev code
        // Map the target locale to Lingo.dev code
        const targetLang = getLanguageByCode(targetLocale);
        const lingoDotDevTarget = targetLang?.lingoDotDevCode || targetLocale;

        console.log(`[UI-Strings] 🔄 Translating to: ${lingoDotDevTarget}`);

        // Use the translation service with progress tracking
        const { translateObjectWithProgress } = await import('../services/translationService.js');

        const translated = await translateObjectWithProgress(
            strings,
            'en',
            lingoDotDevTarget,
            (progress) => {
                console.log(`[UI-Strings] 📊 Translation progress: ${progress}%`);
            }
        );

        const duration = Date.now() - startTime;
        console.log(`[UI-Strings] ✅ Translation complete in ${duration}ms`);

        res.json({
            success: true,
            translated,
            targetLocale,
            stringCount: Object.keys(translated).length,
            duration
        });
    } catch (error: any) {
        const duration = Date.now() - startTime;
        console.error(`[UI-Strings] ❌ Translation failed after ${duration}ms:`, error);
        res.status(500).json({
            success: false,
            error: { message: error.message || 'UI strings translation failed' }
        });
    }
});

/**
 * POST /api/translation/html
 * Translate entire HTML page - CSS, JS, attributes stay unchanged
 */
router.post('/html', async (req: Request, res: Response) => {
    const startTime = Date.now();
    try {
        const { html, targetLocale } = req.body;
        console.log(`[HTML] 🌐 Request: ${targetLocale}, ${html?.length || 0} chars`);

        if (!html || !targetLocale) {
            return res.status(400).json({ success: false, error: { message: 'html and targetLocale required' } });
        }
        if (targetLocale.startsWith('en')) {
            return res.json({ success: true, html, duration: 0 });
        }

        const targetLang = getLanguageByCode(targetLocale);
        const translatedHtml = await translateHtmlWithProgress(html, 'en', targetLang?.lingoDotDevCode || targetLocale);
        console.log(`[HTML] ✅ Done in ${Date.now() - startTime}ms`);
        res.json({ success: true, html: translatedHtml, duration: Date.now() - startTime });
    } catch (error: any) {
        console.error('[HTML] ❌ Failed:', error);
        res.status(500).json({ success: false, error: { message: error.message } });
    }
});

/**
 * POST /api/translation/ui-strings
 * Translate an object of UI strings
 * Body: { strings: Record<string, string>, targetLocale: string }
 */
router.post('/ui-strings', async (req: Request, res: Response) => {
    try {
        const { strings, targetLocale } = req.body;

        if (!strings || !targetLocale) {
            return res.status(400).json({
                success: false,
                error: { message: 'strings object and targetLocale are required' }
            });
        }

        const targetLang = getLanguageByCode(targetLocale);
        const lingoDotDevTarget = targetLang?.lingoDotDevCode || targetLocale;

        // Note: lingo.dev SDK has localizeObject
        // We'll use the service to handle the engine details
        const { translateObject } = await import('../services/translationService.js');
        const translated = await translateObject(strings, 'en', lingoDotDevTarget);

        res.json({
            success: true,
            translated
        });
    } catch (error: any) {
        console.error('UI strings translation error:', error);
        res.status(500).json({
            success: false,
            error: { message: error.message || 'UI strings translation failed' }
        });
    }
});

export default router;
