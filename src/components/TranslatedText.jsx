"use client";

import { useState, useEffect, useMemo, memo } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { translateText, hasHindiCharacters } from '@/utils/translate';

function TranslatedText({ text }) {
    const { language } = useLanguage();
    const [translated, setTranslated] = useState('');

    // Memoize translation detection
    const shouldTranslate = useMemo(() => {
        if (!text) return false;
        const hasHindi = hasHindiCharacters(text);
        if (language === 'hi' && !hasHindi) return true;
        if (language === 'en' && hasHindi) return true;
        return false;
    }, [text, language]);

    useEffect(() => {
        if (!text || !shouldTranslate) {
            setTranslated('');
            return;
        }

        translateText(text, language)
            .then(res => setTranslated(res))
            .catch(err => console.error("Text translation error", err));
    }, [text, language, shouldTranslate]);

    return translated || text;
}

// Memoize to prevent unnecessary re-renders
export default memo(TranslatedText);
