"use client";

import { useParams } from 'next/navigation';
import NewsCard from '@/components/NewsCard/NewsCard';
import AdBanner from '@/components/AdBanner/AdBanner';
import { useArticles, useAds } from '@/hooks/useFirestore';
import styles from '../page.module.css'; // Reuse home styles or create new? Reuse for consistency.
import Link from 'next/link';

export default function CategoryPage() {
    const params = useParams();
    const { language, t } = useLanguage();

    // safe check for params
    if (!params?.category) return null;

    const categorySlug = params.category;

    // Convert slug to Title Case (e.g. 'uttar-pradesh' -> 'Uttar Pradesh')
    // This assumes DB categories match this format.
    const categoryName = categorySlug
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');

    // Special case mapping if needed?
    // DB likely stores "Bollywood" as "Bollywood", "Uttar Pradesh" as "Uttar Pradesh".
    // "World" -> "World".

    const { articles, loading } = useArticles({
        publishedOnly: true,
        category: categoryName
    });

    const { ads } = useAds({ activeOnly: true });

    const sidebarAds = ads.filter(ad =>
        (ad.position === 'sidebar' || !ad.position) &&
        (ad.target === 'all' || !ad.target)
    );

    const formatTimeAgo = (date) => {
        if (!date) return t('justNow');
        const now = new Date();
        const then = date instanceof Date ? date : new Date(date);
        const seconds = Math.floor((now - then) / 1000);
        if (seconds < 60) return t('justNow');
        if (seconds < 3600) return `${Math.floor(seconds / 60)} ${t('minsAgo')}`;
        if (seconds < 86400) return `${Math.floor(seconds / 3600)} ${t('hoursAgo')}`;
        return `${Math.floor(seconds / 86400)} ${t('daysAgo')}`;
    };

    const getFirstImage = (article) => {
        return article.images?.[0]?.url || `https://picsum.photos/seed/${article.id}/800/400`;
    };

    if (loading) {
        return (
            <>
                <Header />
                <main className={styles.main}>
                    <div className="container">
                        <div className={styles.loading}>
                            <div className={styles.spinner}></div>
                            {t('loading')}
                        </div>
                    </div>
                </main>
            </>
        );
    }

    return (
        <>
            <Header />
            <main className={styles.main}>
                <div className="container">
                    <div className={styles.mainLayout}>
                        <div className={styles.content}>
                            <section className={styles.section}>
                                <div className={styles.breadcrumb}>
                                    <Link href="/">{t('home')}</Link> / <span>{categoryName}</span>
                                </div>

                                <h1 className={styles.pageTitle}>
                                    {language === 'hi' ? mapCategoryToHindi(categoryName) : categoryName}
                                </h1>

                                {articles.length === 0 ? (
                                    <div className={styles.empty}>
                                        <p>{t('noArticles')}</p>
                                    </div>
                                ) : (
                                    <div className={styles.newsList}>
                                        {articles.map(article => (
                                            <NewsCard
                                                key={article.id}
                                                variant="list"
                                                title={article.title}
                                                excerpt={article.content?.substring(0, 150) + '...'}
                                                image={getFirstImage(article)}
                                                category={article.category}
                                                time={formatTimeAgo(article.created_at)}
                                                href={`/article/${article.id}`}
                                            />
                                        ))}
                                    </div>
                                )}
                            </section>
                        </div>

                        <aside className={styles.sidebar}>
                            {/* Sidebar Ads */}
                            {sidebarAds.map(ad => (
                                <AdBanner
                                    key={ad.id}
                                    imageUrl={ad.imageUrl}
                                    linkUrl={ad.linkUrl}
                                    label={language === 'hi' ? 'विज्ञापन' : 'Advertisement'}
                                />
                            ))}

                            {!sidebarAds.length && (
                                <div className={styles.adBox}>
                                    <span>{language === 'hi' ? 'विज्ञापन' : 'Advertisement'}</span>
                                    <div className={styles.adPlaceholder}>300 × 250</div>
                                </div>
                            )}

                            {/* Newsletter */}
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

// Simple helper for display title (could be moved to translation util)
function mapCategoryToHindi(cat) {
    const map = {
        'Bollywood': 'बॉलीवुड',
        'Uttar Pradesh': 'उत्तर प्रदेश',
        'Cricket': 'क्रिकेट',
        'Finance': 'वित्त',
        'World': 'विश्व',
        'Politics': 'राजनीति',
        'Sports': 'खेल'
    };
    return map[cat] || cat;
}
