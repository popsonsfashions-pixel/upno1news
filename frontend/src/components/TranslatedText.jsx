"use client";

import { useState, useEffect } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { translateText, hasHindiCharacters } from '@/utils/translate';

export default function TranslatedText({ text }) {
    const { language } = useLanguage();
    const [translated, setTranslated] = useState('');

    useEffect(() => {
        if (!text) return;

        const hasHindi = hasHindiCharacters(text);
        let shouldTranslate = false;

        if (language === 'hi' && !hasHindi) {
            shouldTranslate = true;
        } else if (language === 'en' && hasHindi) {
            shouldTranslate = true;
        }

        if (shouldTranslate) {
            translateText(text, language)
                .then(res => setTranslated(res))
                .catch(err => console.error("Text translation error", err));
        } else {
            setTranslated('');
        }
    }, [text, language]);

    return translated || text;
}
