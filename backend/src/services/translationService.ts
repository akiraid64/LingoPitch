/**
 * Translation Service using Lingo.dev SDK
 * Provides real-time translation for chat messages and UI text
 */

import { LingoDotDevEngine } from 'lingo.dev/sdk';

// Get API key from env (support both naming conventions)
const apiKey = process.env.LINGODOTDEV_API_KEY || process.env.LINGO_DEV_API_KEY || '';

// Startup validation
console.log('==================================');
console.log('[Lingo.dev] 🚀 Initializing SDK...');
console.log(`[Lingo.dev] 🔑 API Key: ${apiKey ? apiKey.substring(0, 8) + '...' : '❌ NOT SET'}`);
console.log('==================================');

if (!apiKey) {
    console.error('[Lingo.dev] ⚠️ WARNING: No API key found! Set LINGODOTDEV_API_KEY or LINGO_DEV_API_KEY in .env');
}

// Initialize the Lingo.dev engine
const lingoDotDev = new LingoDotDevEngine({
    apiKey,
});

/**
 * Translate text from one language to another
 */
export async function translateText(
    text: string,
    sourceLocale: string | null,
    targetLocale: string
): Promise<string> {
    try {
        const result = await lingoDotDev.localizeText(text, {
            sourceLocale,
            targetLocale,
            fast: true, // Prioritize speed for chat
        });
        return result;
    } catch (error) {
        console.error('Translation error:', error);
        throw error;
    }
}

/**
 * Translate chat messages while preserving speaker names
 */
export async function translateChat(
    messages: Array<{ name: string; text: string }>,
    sourceLocale: string,
    targetLocale: string
): Promise<Array<{ name: string; text: string }>> {
    try {
        const result = await lingoDotDev.localizeChat(messages, {
            sourceLocale,
            targetLocale,
        });
        return result;
    } catch (error) {
        console.error('Chat translation error:', error);
        throw error;
    }
}

/**
 * Translate an object (useful for UI strings)
 */
export async function translateObject<T extends Record<string, string>>(
    obj: T,
    sourceLocale: string,
    targetLocale: string
): Promise<T> {
    try {
        console.log(`[Translation] 📝 Translating object with ${Object.keys(obj).length} keys to ${targetLocale}`);
        const result = await lingoDotDev.localizeObject(obj, {
            sourceLocale,
            targetLocale,
        });
        console.log(`[Translation] ✅ Object translation complete`);
        return result as T;
    } catch (error) {
        console.error('[Translation] ❌ Object translation error:', error);
        throw error;
    }
}

/**
 * Translate an object with progress tracking callback
 * Uses Lingo.dev SDK's progress callback feature
 */
export async function translateObjectWithProgress<T extends Record<string, string>>(
    obj: T,
    sourceLocale: string,
    targetLocale: string,
    onProgress?: (progress: number) => void
): Promise<T> {
    try {
        const keyCount = Object.keys(obj).length;
        console.log(`[Translation] 📝 Starting translation of ${keyCount} strings to ${targetLocale}`);
        console.log(`[Translation] 🔑 Source locale: ${sourceLocale}`);

        const result = await lingoDotDev.localizeObject(
            obj,
            { sourceLocale, targetLocale },
            (progress: number) => {
                console.log(`[Translation] 📊 Progress: ${progress}%`);
                if (onProgress) {
                    onProgress(progress);
                }
            }
        );

        console.log(`[Translation] ✅ Translation complete for ${keyCount} strings`);
        return result as T;
    } catch (error) {
        console.error('[Translation] ❌ Translation with progress error:', error);
        throw error;
    }
}

/**
 * Detect the language of text
 */
export async function detectLanguage(text: string): Promise<string> {
    try {
        const locale = await lingoDotDev.recognizeLocale(text);
        return locale;
    } catch (error) {
        console.error('Language detection error:', error);
        throw error;
    }
}

/**
 * Translate HTML while preserving markup
 */
export async function translateHtml(
    html: string,
    sourceLocale: string,
    targetLocale: string
): Promise<string> {
    try {
        console.log(`[Translation] 🌐 Translating HTML (${html.length} chars) to ${targetLocale}`);
        const result = await lingoDotDev.localizeHtml(html, {
            sourceLocale,
            targetLocale,
        });
        console.log(`[Translation] ✅ HTML translation complete`);
        return result;
    } catch (error) {
        console.error('[Translation] ❌ HTML translation error:', error);
        throw error;
    }
}

/**
 * Translate HTML with progress tracking
 * This is the RECOMMENDED way to translate entire pages
 */
export async function translateHtmlWithProgress(
    html: string,
    sourceLocale: string,
    targetLocale: string,
    onProgress?: (progress: number) => void
): Promise<string> {
    try {
        const htmlLength = html.length;
        console.log(`[Translation] 🌐 Starting HTML translation (${htmlLength} chars) to ${targetLocale}`);

        // Emit starting progress
        if (onProgress) onProgress(10);

        const result = await lingoDotDev.localizeHtml(html, {
            sourceLocale,
            targetLocale,
        });

        // Emit completion
        if (onProgress) onProgress(100);

        console.log(`[Translation] ✅ HTML translation complete (${result.length} chars)`);
        return result;
    } catch (error) {
        console.error('[Translation] ❌ HTML translation with progress error:', error);
        throw error;
    }
}

