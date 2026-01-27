import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect, useMemo, memo } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { translateText, hasHindiCharacters } from '@/utils/translate';
import styles from './NewsCard.module.css';

/**
 * NewsCard Component
 * Adapts layout based on variant prop
 * Memoized for performance
 * 
 * @param {Object} props
 * @param {'hero' | 'list' | 'sidebar'} props.variant - Card size variant
 * @param {string} props.title - Article title
 * @param {string} props.excerpt - Article excerpt (optional)
 * @param {string} props.image - Image URL
 * @param {string} props.category - Category name
 * @param {string} props.time - Time ago string
 * @param {boolean} props.isLive - Show live badge
 * @param {boolean} props.isMain - Whether this is the main hero card
 * @param {string} props.href - Link URL
 */
function NewsCard({
    variant = 'list',
    title,
    excerpt,
    image,
    category,
    time,
    isLive = false,
    isMain = false,
    href = '#',
}) {
    const { language } = useLanguage();
    const [translatedTitle, setTranslatedTitle] = useState('');
    const [translatedExcerpt, setTranslatedExcerpt] = useState('');

    useEffect(() => {
        // Reset translation if language matches source or if content changes
        if (!title) return;

        const hasHindi = hasHindiCharacters(title + (excerpt || ''));
        let shouldTranslate = false;

        if (language === 'hi' && !hasHindi) {
            shouldTranslate = true;
        } else if (language === 'en' && hasHindi) {
            shouldTranslate = true;
        }

        if (shouldTranslate) {
            // Translations are now cached in translate.js
            Promise.all([
                translateText(title, language),
                excerpt ? translateText(excerpt, language) : Promise.resolve('')
            ]).then(([newTitle, newExcerpt]) => {
                setTranslatedTitle(newTitle);
                setTranslatedExcerpt(newExcerpt);
            }).catch(err => console.error("Card translation error", err));
        } else {
            setTranslatedTitle('');
            setTranslatedExcerpt('');
        }
    }, [title, excerpt, language]);

    // Memoize computed classes
    const cardClasses = useMemo(() => [
        styles.card,
        styles[variant],
        isMain && variant === 'hero' ? styles.heroMain : '',
    ].filter(Boolean).join(' '), [variant, isMain]);

    const displayTitle = translatedTitle || title;
    const displayExcerpt = translatedExcerpt || excerpt;

    // Determine image sizes based on variant for responsive loading
    const imageSizes = useMemo(() => {
        switch (variant) {
            case 'hero':
                return '(max-width: 768px) 100vw, 50vw';
            case 'sidebar':
                return '(max-width: 768px) 100vw, 300px';
            default:
                return '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw';
        }
    }, [variant, isMain]);

    return (
        <Link href={href} className={cardClasses}>
            <div className={styles.image}>
                <Image
                    src={image}
                    alt={displayTitle || 'News image'}
                    fill
                    sizes={imageSizes}
                    priority={variant === 'hero' && isMain}
                    loading={variant === 'hero' && isMain ? 'eager' : 'lazy'}
                    style={{ objectFit: 'cover' }}
                />
                {variant === 'hero' && <div className={styles.overlay} />}
            </div>

            <div className={styles.content}>
                {category && (
                    <span className={styles.category}>{category}</span>
                )}

                <h3 className={styles.title}>
                    {isLive && <span className={styles.liveBadge}>Live</span>}
                    {displayTitle}
                </h3>

                {displayExcerpt && variant !== 'sidebar' && (
                    <p className={styles.excerpt}>{displayExcerpt}</p>
                )}

                {time && (
                    <div className={styles.meta}>
                        <span>{time}</span>
                    </div>
                )}
            </div>
        </Link>
    );
}

// Memoize the component to prevent unnecessary re-renders
export default memo(NewsCard);
