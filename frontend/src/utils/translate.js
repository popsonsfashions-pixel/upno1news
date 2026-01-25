/**
 * Translates text using Google Translate API (Free limitation)
 * @param {string} text - Text to translate
 * @param {string} targetLang - Target language code ('hi' or 'en')
 * @returns {Promise<string>} Translated text
 */
export async function translateText(text, targetLang) {
    if (!text) return text;

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
        return data.translatedText;
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
