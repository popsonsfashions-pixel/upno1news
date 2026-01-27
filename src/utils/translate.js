/**
 * Translation cache to prevent duplicate API calls
 */
const translationCache = new Map();

/**
 * Translates text using Google Translate API (Free limitation)
 * Uses in-memory cache to prevent duplicate API calls
 * @param {string} text - Text to translate
 * @param {string} targetLang - Target language code ('hi' or 'en')
 * @returns {Promise<string>} Translated text
 */
export async function translateText(text, targetLang) {
    if (!text) return text;

    // Create cache key
    const cacheKey = `${text}::${targetLang}`;

    // Check cache first
    if (translationCache.has(cacheKey)) {
        return translationCache.get(cacheKey);
    }

    let sl = 'auto';
    // If translating TO English and text contains Hindi, force source to Hindi
    // This handles mixed content (Hindi + English words) better than auto-detect
    if (targetLang === 'en' && hasHindiCharacters(text)) {
        sl = 'hi';
    }

    try {
        const response = await fetch('/api/translate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                text,
                targetLang,
                sourceLang: sl
            }),
        });

        if (!response.ok) {
            throw new Error('Translation failed');
        }

        const data = await response.json();
        const translatedText = data.translatedText;

        // Cache the result
        translationCache.set(cacheKey, translatedText);

        // Limit cache size to prevent memory issues (max 500 entries)
        if (translationCache.size > 500) {
            const firstKey = translationCache.keys().next().value;
            translationCache.delete(firstKey);
        }

        return translatedText;
    } catch (error) {
        console.error('Translation error:', error);
        return text;
    }
}

/**
 * Checks if text contains Hindi characters
 */
export function hasHindiCharacters(text) {
    return /[\u0900-\u097F]/.test(text);
}

/**
 * Clear translation cache (useful for testing)
 */
export function clearTranslationCache() {
    translationCache.clear();
}
