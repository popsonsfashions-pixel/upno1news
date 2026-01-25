"use client";

import { useParams } from 'next/navigation';
import Header from '@/components/Header/Header';
import { useArticles } from '@/hooks/useFirestore';
import { useLanguage } from '@/context/LanguageContext';
import NewsCard from '@/components/NewsCard/NewsCard';
import styles from '../page.module.css';
import Link from 'next/link';

export default function DynamicCategoryPage() {
    const params = useParams();
    const { language, t } = useLanguage();

    // params.slug will be an array like ['bollywood'] or ['bollywood', 'movies']
    const slug = params?.slug || [];
    if (slug.length === 0) return null;

    const categorySlug = slug[0];
    const subcategorySlug = slug[1] || null;

    // Helper to format slug to DB name
    const formatName = (s) => {
        if (!s) return null;
        return s
            .split('-')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    };

    const categoryName = formatName(categorySlug);
    const subcategoryName = formatName(subcategorySlug);

    const { articles, loading } = useArticles({
        publishedOnly: true,
        category: categoryName,
        subcategory: subcategoryName
    });

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
                    <div className={styles.content}>
                        <section className={styles.section}>
                            <div className={styles.breadcrumb}>
                                <Link href="/">{t('home')}</Link> /
                                <Link href={`/${categorySlug}`}>{categoryName}</Link>
                                {subcategoryName && (
                                    <> / <span>{subcategoryName}</span></>
                                )}
                            </div>

                            <h1 className={styles.pageTitle}>
                                {language === 'hi' ? mapToHindi(subcategoryName || categoryName) : (subcategoryName || categoryName)}
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
                                            image={article.images?.[0]?.url || `https://picsum.photos/seed/${article.id}/800/400`}
                                            category={article.category}
                                            time={formatTimeAgo(article.created_at)}
                                            href={`/article/${article.id}`}
                                        />
                                    ))}
                                </div>
                            )}
                        </section>
                    </div>
                </div>
            </main>
        </>
    );
}

function mapToHindi(text) {
    const map = {
        'Bollywood': 'बॉलीवुड',
        'Uttar Pradesh': 'उत्तर प्रदेश',
        'Cricket': 'क्रिकेट',
        'Finance': 'वित्त',
        'World': 'विश्व',
        'Politics': 'राजनीति',
        'Sports': 'खेल',
        'News': 'ताज़ा खबर',
        'Movies': 'फिल्में',
        'Celebrities': 'सेलेब्रिटी',
        'Reviews': 'समीक्षा',
        'Ott': 'ओटीटी',
        'Music': 'संगीत',
        'Ipl 2026': 'आईपीएल 2026'
    };
    return map[text] || text;
}
