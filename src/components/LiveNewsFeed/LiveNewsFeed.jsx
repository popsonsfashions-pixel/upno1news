"use client";

import { useArticles } from '@/hooks/useFirestore';
import NewsCard from '@/components/NewsCard/NewsCard';
import styles from './LiveNewsFeed.module.css';

/**
 * Real-time news feed from Firestore
 * Falls back to sample data if no Firestore articles exist
 */
export default function LiveNewsFeed({
    title = "Live News",
    variant = "list",
    limit = 10,
    showEmpty = true
}) {
    const { articles, loading, error } = useArticles({ publishedOnly: true });

    if (loading) {
        return (
            <section className={styles.feed}>
                <div className="section-header">
                    <h2 className="section-title">{title}</h2>
                </div>
                <div className={styles.loading}>
                    <div className={styles.spinner}></div>
                    <p>Loading live news...</p>
                </div>
            </section>
        );
    }

    if (error) {
        return (
            <section className={styles.feed}>
                <div className="section-header">
                    <h2 className="section-title">{title}</h2>
                </div>
                <div className={styles.error}>
                    <p>Unable to load news. Please try again later.</p>
                </div>
            </section>
        );
    }

    if (articles.length === 0 && !showEmpty) {
        return null;
    }

    return (
        <section className={styles.feed}>
            <div className="section-header">
                <h2 className="section-title">
                    <span className={styles.liveIndicator}></span>
                    {title}
                </h2>
            </div>

            {articles.length === 0 ? (
                <div className={styles.empty}>
                    <p>No articles published yet.</p>
                    <p className={styles.hint}>
                        Create and publish articles to see them here in real-time!
                    </p>
                </div>
            ) : (
                <div className={styles.newsWrap}>
                    {articles.slice(0, limit).map((article) => {
                        // Get first image from images array, or use placeholder
                        const firstImage = article.images?.[0]?.url ||
                            article.image ||
                            `https://picsum.photos/seed/${article.id}/400/250`;

                        return (
                            <NewsCard
                                key={article.id}
                                variant={variant}
                                title={article.title}
                                excerpt={article.content?.substring(0, 150) + '...'}
                                image={firstImage}
                                category={article.category || "News"}
                                time={formatTimeAgo(article.created_at)}
                                href={`/article/${article.id}`}
                            />
                        );
                    })}
                </div>
            )}
        </section>
    );
}

function formatTimeAgo(date) {
    if (!date) return 'Just now';

    const now = new Date();
    const then = date instanceof Date ? date : new Date(date);
    const seconds = Math.floor((now - then) / 1000);

    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)} mins ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
    return `${Math.floor(seconds / 86400)} days ago`;
}
