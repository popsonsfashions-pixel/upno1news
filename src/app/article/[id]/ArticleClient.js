"use client";

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useArticle, useAds, createStatus } from '@/hooks/useFirestore';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';
import Header from '@/components/Header/Header';
import AdBanner from '@/components/AdBanner/AdBanner';
import { translateText, hasHindiCharacters } from '@/utils/translate';
import styles from './article.module.css';

export default function ArticleClient() {
    const { id } = useParams();
    const { article, loading, error } = useArticle(id);
    const { language, t } = useLanguage();
    const { user, isAdmin } = useAuth();
    const { ads } = useAds({ activeOnly: true });
    const [postingToStatus, setPostingToStatus] = useState(false);

    const sidebarAds = ads.filter(ad =>
        (ad.position === 'sidebar' || !ad.position) &&
        (ad.target === 'articles' || ad.target === 'all' || !ad.target)
    );
    const middleAds = ads.filter(ad =>
        ad.position === 'article_middle' &&
        (ad.target === 'articles' || ad.target === 'all' || !ad.target)
    );
    const bottomAds = ads.filter(ad =>
        ad.position === 'article_bottom' &&
        (ad.target === 'articles' || ad.target === 'all' || !ad.target)
    );

    const [translatedTitle, setTranslatedTitle] = useState('');
    const [translatedContent, setTranslatedContent] = useState('');
    const [isTranslating, setIsTranslating] = useState(false);

    // Translate content when language changes
    useEffect(() => {
        if (!article) return;

        // Check if content has Hindi characters
        const hasHindi = hasHindiCharacters(article.title + article.content);

        let shouldTranslate = false;

        // Condition 1: User wants Hindi, but content is NOT Hindi (English)
        if (language === 'hi' && !hasHindi) {
            shouldTranslate = true;
        }
        // Condition 2: User wants English, but content IS Hindi
        else if (language === 'en' && hasHindi) {
            shouldTranslate = true;
        }

        if (shouldTranslate) {
            setIsTranslating(true);
            Promise.all([
                translateText(article.title, language),
                translateText(article.content, language)
            ]).then(([title, content]) => {
                setTranslatedTitle(title);
                setTranslatedContent(content);
                setIsTranslating(false);
            })
                .catch(err => {
                    console.error("Translation failed", err);
                    setIsTranslating(false);
                });
        } else {
            // No translation needed (already in target language)
            setTranslatedTitle('');
            setTranslatedContent('');
            setIsTranslating(false);
        }
    }, [article, language]);

    // Inject Open Graph meta tags for social sharing
    useEffect(() => {
        if (!article) return;

        const firstImage = article.images?.[0]?.url || 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=1200&h=630&fit=crop';
        const description = article.content?.substring(0, 160)?.replace(/\n/g, ' ') || 'Read the latest news on UP News No.1';
        const pageUrl = typeof window !== 'undefined' ? window.location.href : '';

        // Helper to update meta tag
        const updateMeta = (property, content, isName = false) => {
            const attr = isName ? 'name' : 'property';
            let meta = document.querySelector(`meta[${attr}="${property}"]`);
            if (!meta) {
                meta = document.createElement('meta');
                meta.setAttribute(attr, property);
                document.head.appendChild(meta);
            }
            meta.setAttribute('content', content);
        };

        // Update page title
        document.title = `${article.title} | UP News No.1`;

        // Open Graph tags
        updateMeta('og:title', article.title);
        updateMeta('og:description', description);
        updateMeta('og:image', firstImage);
        updateMeta('og:image:width', '1200');
        updateMeta('og:image:height', '630');
        updateMeta('og:url', pageUrl);
        updateMeta('og:type', 'article');
        updateMeta('og:site_name', 'UP News No.1');

        // Twitter Card tags
        updateMeta('twitter:card', 'summary_large_image', true);
        updateMeta('twitter:title', article.title, true);
        updateMeta('twitter:description', description, true);
        updateMeta('twitter:image', firstImage, true);

        // Cleanup on unmount
        return () => {
            document.title = 'UP News No.1';
        };
    }, [article]);

    if (loading) {
        return (
            <>
                <Header />
                <main className={styles.main}>
                    <div className="container">
                        <div className={styles.skeletonLoading}>
                            <div className={styles.skeletonLayout}>
                                <div className={styles.skeletonArticle}>
                                    {/* Category & Title */}
                                    <div className={`${styles.skeleton} ${styles.skeletonCategory}`}></div>
                                    <div className={`${styles.skeleton} ${styles.skeletonTitle}`}></div>
                                    <div className={`${styles.skeleton} ${styles.skeletonTitle2}`}></div>

                                    {/* Author Bar */}
                                    <div className={styles.skeletonAuthorBar}>
                                        <div className={`${styles.skeleton} ${styles.skeletonAvatar}`}></div>
                                        <div className={styles.skeletonAuthorInfo}>
                                            <div className={`${styles.skeleton} ${styles.skeletonAuthorName}`}></div>
                                            <div className={`${styles.skeleton} ${styles.skeletonAuthorDate}`}></div>
                                        </div>
                                    </div>

                                    {/* Image */}
                                    <div className={`${styles.skeleton} ${styles.skeletonImage}`}></div>

                                    {/* Content paragraphs */}
                                    {[1, 2, 3, 4, 5].map(i => (
                                        <div key={i} className={`${styles.skeleton} ${styles.skeletonParagraph}`} style={{ width: `${90 - i * 5}%` }}></div>
                                    ))}
                                </div>

                                <div className={styles.skeletonSidebar}>
                                    <div className={`${styles.skeleton} ${styles.skeletonSidebarBox}`}></div>
                                    <div className={`${styles.skeleton} ${styles.skeletonSidebarBox}`}></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </>
        );
    }

    if (error || !article) {
        return (
            <>
                <Header />
                <main className={styles.main}>
                    <div className="container">
                        <div className={styles.notFound}>
                            <h1>{language === 'hi' ? 'लेख नहीं मिला' : 'Article Not Found'}</h1>
                            <p>{error || (language === 'hi' ? 'यह लेख मौजूद नहीं है।' : 'The article does not exist.')}</p>
                            <Link href="/" className={styles.backBtn}>
                                ← {language === 'hi' ? 'होम पर वापस जाएं' : 'Back to Home'}
                            </Link>
                        </div>
                    </div>
                </main>
            </>
        );
    }

    const displayTitle = translatedTitle || article.title;
    const displayContent = translatedContent || article.content;

    // Smart image grouping
    const images = article.images || [];
    const heroImages = images.filter(img => img.position === 'hero');
    const topImages = images.filter(img => img.position === 'top');
    const leftImages = images.filter(img => img.position === 'left');
    const rightImages = images.filter(img => img.position === 'right');
    const centerImages = images.filter(img => img.position === 'center');
    const bottomImages = images.filter(img => img.position === 'bottom');
    const galleryImages = images.filter(img => img.position === 'gallery');
    const autoImages = images.filter(img => img.position === 'auto' || !img.position);

    const distributeAutoImages = () => {
        if (autoImages.length === 0) return { top: [], middle: [], bottom: [] };
        if (autoImages.length === 1) return { top: autoImages, middle: [], bottom: [] };
        if (autoImages.length === 2) return { top: [autoImages[0]], middle: [], bottom: [autoImages[1]] };

        const third = Math.ceil(autoImages.length / 3);
        return {
            top: autoImages.slice(0, third),
            middle: autoImages.slice(third, third * 2),
            bottom: autoImages.slice(third * 2)
        };
    };

    const autoDistributed = distributeAutoImages();
    const paragraphs = displayContent?.split('\n').filter(p => p.trim()) || [];
    const contentThird = Math.ceil(paragraphs.length / 3);

    return (
        <>
            <Header />
            <main className={styles.main}>
                {/* Hero Image */}
                {heroImages.length > 0 && (
                    <div className={styles.heroSection}>
                        <img src={heroImages[0].url} alt={heroImages[0].caption || displayTitle} />
                        <div className={styles.heroOverlay}>
                            <div className="container">
                                <span className={styles.heroCategory}>{article.category || 'News'}</span>
                                <h1 className={styles.heroTitle}>{displayTitle}</h1>
                                {isTranslating && <span className={styles.translating}>🔄 {language === 'hi' ? 'अनुवाद हो रहा है...' : 'Translating...'}</span>}
                            </div>
                        </div>
                    </div>
                )}

                <div className="container">
                    <div className={styles.articleLayout}>
                        <article className={styles.article}>
                            {/* Meta */}
                            {heroImages.length === 0 && (
                                <>
                                    <div className={styles.breadcrumb}>
                                        <Link href="/" className={styles.breadcrumbHome}>
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                                                <polyline points="9 22 9 12 15 12 15 22" />
                                            </svg>
                                            {language === 'hi' ? 'होम' : 'Home'}
                                        </Link>
                                        <span className={styles.breadcrumbSep}>›</span>
                                        <span className={styles.breadcrumbCategory}>{article.category || 'News'}</span>
                                    </div>
                                    <div className={styles.meta}>
                                        <span className={styles.category}>{article.category || 'News'}</span>
                                        <span className={styles.dot}>•</span>
                                        <span className={styles.date}>
                                            {article.created_at?.toLocaleDateString?.(language === 'hi' ? 'hi-IN' : 'en-IN', {
                                                day: 'numeric',
                                                month: 'long',
                                                year: 'numeric'
                                            })}
                                        </span>
                                    </div>
                                    <h1 className={styles.title}>
                                        {displayTitle}
                                        {isTranslating && <span className={styles.translatingInline}>🔄</span>}
                                    </h1>
                                </>
                            )}

                            {/* Author Bar */}
                            <div className={styles.authorBar}>
                                <div className={styles.authorAvatar}>
                                    <img src="/logo.png" alt="UP News No.1" className={styles.authorAvatarImg} />
                                </div>
                                <div className={styles.authorInfo}>
                                    <span className={styles.authorName}>
                                        {article.author_name || article.author_email?.split('@')[0]?.replace(/[._]/g, ' ')?.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') || 'UP News Reporter'}
                                    </span>
                                    <span className={styles.publishDate}>
                                        {t('publishedOn')} {article.created_at?.toLocaleDateString?.(language === 'hi' ? 'hi-IN' : 'en-IN', {
                                            day: 'numeric',
                                            month: 'long',
                                            year: 'numeric'
                                        })}
                                    </span>
                                </div>
                                <div className={styles.shareButtons}>
                                    <button
                                        className={styles.shareWhatsapp}
                                        onClick={() => {
                                            const url = window.location.href;
                                            const text = `${displayTitle} - ${url}`;
                                            window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
                                        }}
                                    >
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                                        </svg>
                                        WhatsApp
                                    </button>
                                    <button
                                        className={styles.shareFacebook}
                                        onClick={() => {
                                            const url = window.location.href;
                                            window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(displayTitle)}`, '_blank', 'width=600,height=400');
                                        }}
                                    >
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                                        </svg>
                                        Facebook
                                    </button>
                                    {isAdmin() && (
                                        <button
                                            className={styles.statusBtn}
                                            onClick={async () => {
                                                if (postingToStatus) return;
                                                setPostingToStatus(true);

                                                // Get first image for the status
                                                const firstImage = article.images?.[0]?.url || null;

                                                // Create status linked to this article
                                                const result = await createStatus(
                                                    article.title,
                                                    user.uid,
                                                    user.email,
                                                    firstImage, // Use article's first image
                                                    {
                                                        id: id,
                                                        title: article.title,
                                                        image: firstImage,
                                                        category: article.category
                                                    }
                                                );

                                                if (result.success) {
                                                    alert(language === 'hi' ? 'स्टेटस में जोड़ा गया! आर्टिकल से लिंक है।' : 'Added to Status! Linked to article.');
                                                }
                                                setPostingToStatus(false);
                                            }}
                                            disabled={postingToStatus}
                                        >
                                            ⚡ {postingToStatus ? '...' : (language === 'hi' ? 'स्टेटस में डालें' : 'Add to Status')}
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Top Images */}
                            {(topImages.length > 0 || autoDistributed.top.length > 0) && (
                                <div className={styles.imageBlock}>
                                    {[...topImages, ...autoDistributed.top].map((img, i) => (
                                        <figure key={i} className={styles.figure}>
                                            <img src={img.url} alt={img.caption || ''} />
                                            {img.caption && <figcaption>{img.caption}</figcaption>}
                                        </figure>
                                    ))}
                                </div>
                            )}

                            {/* First section */}
                            <div className={styles.contentBlock}>
                                {leftImages.length > 0 && (
                                    <div className={styles.floatLeft}>
                                        <img src={leftImages[0].url} alt={leftImages[0].caption || ''} />
                                    </div>
                                )}
                                {paragraphs.slice(0, contentThird).map((p, i) => (
                                    <p key={i}>{p}</p>
                                ))}
                            </div>

                            {/* Article Middle Ads */}
                            {middleAds.length > 0 && (
                                <div className={styles.adBanner}>
                                    <span className={styles.adLabel}>{language === 'hi' ? 'विज्ञापन' : 'Advertisement'}</span>
                                    {middleAds.map(ad => (
                                        <AdBanner
                                            key={ad.id}
                                            imageUrl={ad.imageUrl}
                                            linkUrl={ad.linkUrl}
                                            label={language === 'hi' ? 'विज्ञापन' : 'Advertisement'}
                                        />
                                    ))}
                                </div>
                            )}

                            {!middleAds.length && (
                                <div className={styles.adBanner}>
                                    <span className={styles.adLabel}>{language === 'hi' ? 'विज्ञापन' : 'Advertisement'}</span>
                                    <div className={styles.adPlaceholder}>728 × 90</div>
                                </div>
                            )}

                            {/* Center Images */}
                            {(centerImages.length > 0 || autoDistributed.middle.length > 0) && (
                                <div className={styles.imageBlock}>
                                    {[...centerImages, ...autoDistributed.middle].map((img, i) => (
                                        <figure key={i} className={styles.figure}>
                                            <img src={img.url} alt={img.caption || ''} />
                                            {img.caption && <figcaption>{img.caption}</figcaption>}
                                        </figure>
                                    ))}
                                </div>
                            )}

                            {/* Middle section */}
                            <div className={styles.contentBlock}>
                                {rightImages.length > 0 && (
                                    <div className={styles.floatRight}>
                                        <img src={rightImages[0].url} alt={rightImages[0].caption || ''} />
                                    </div>
                                )}
                                {paragraphs.slice(contentThird, contentThird * 2).map((p, i) => (
                                    <p key={i}>{p}</p>
                                ))}
                            </div>

                            {/* Bottom Images */}
                            {(bottomImages.length > 0 || autoDistributed.bottom.length > 0) && (
                                <div className={styles.imageBlock}>
                                    {[...bottomImages, ...autoDistributed.bottom].map((img, i) => (
                                        <figure key={i} className={styles.figure}>
                                            <img src={img.url} alt={img.caption || ''} />
                                            {img.caption && <figcaption>{img.caption}</figcaption>}
                                        </figure>
                                    ))}
                                </div>
                            )}

                            {/* Last section */}
                            <div className={styles.contentBlock}>
                                {paragraphs.slice(contentThird * 2).map((p, i) => (
                                    <p key={i}>{p}</p>
                                ))}
                            </div>

                            {/* Article Bottom Ads */}
                            {bottomAds.length > 0 && (
                                <div className={styles.adBanner}>
                                    <span className={styles.adLabel}>{language === 'hi' ? 'विज्ञापन' : 'Advertisement'}</span>
                                    {bottomAds.map(ad => (
                                        <AdBanner
                                            key={ad.id}
                                            imageUrl={ad.imageUrl}
                                            linkUrl={ad.linkUrl}
                                            label={language === 'hi' ? 'विज्ञापन' : 'Advertisement'}
                                        />
                                    ))}
                                </div>
                            )}

                            {/* Gallery */}
                            {galleryImages.length > 0 && (
                                <div className={styles.gallery}>
                                    <h3>{language === 'hi' ? 'फोटो गैलरी' : 'Photo Gallery'}</h3>
                                    <div className={styles.galleryGrid}>
                                        {galleryImages.map((img, i) => (
                                            <figure key={i}>
                                                <img src={img.url} alt={img.caption || ''} />
                                            </figure>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Tags */}
                            <div className={styles.tags}>
                                <span className={styles.tag}>{article.category}</span>
                                <span className={styles.tag}>{language === 'hi' ? 'ट्रेंडिंग' : 'Trending'}</span>
                            </div>

                            {!article.is_published && (
                                <div className={styles.draftBanner}>
                                    ⚠️ {language === 'hi' ? 'यह लेख ड्राफ्ट है' : 'This is a DRAFT'}
                                </div>
                            )}
                        </article>

                        {/* Sidebar */}
                        <aside className={styles.sidebar}>
                            <div className={styles.sidebarAd}>
                                <span className={styles.adLabel}>{language === 'hi' ? 'विज्ञापन' : 'Advertisement'}</span>
                                {sidebarAds.length > 0 ? (
                                    sidebarAds.map(ad => (
                                        <AdBanner
                                            key={ad.id}
                                            imageUrl={ad.imageUrl}
                                            linkUrl={ad.linkUrl}
                                            label={language === 'hi' ? 'विज्ञापन' : 'Advertisement'}
                                        />
                                    ))
                                ) : (
                                    <div className={styles.adPlaceholderVertical}>300 × 600</div>
                                )}
                            </div>

                            <div className={styles.newsletter}>
                                <h3>{t('stayUpdated')}</h3>
                                <p>{t('newsletter')}</p>
                                <input type="email" placeholder={t('yourEmail')} />
                                <button>{t('subscribe')}</button>
                            </div>
                        </aside>
                    </div>
                </div>
            </main>
        </>
    );
}
