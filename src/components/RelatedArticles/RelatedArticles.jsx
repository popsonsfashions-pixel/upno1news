"use client";

import { useArticles } from '@/hooks/useFirestore';
import { useLanguage } from '@/context/LanguageContext';
import TranslatedText from '@/components/TranslatedText';
import Link from 'next/link';
import styles from './RelatedArticles.module.css';

export default function RelatedArticles({ currentArticleId, category }) {
  const { language, t } = useLanguage();
  
  // Fetch articles from the same category
  const { articles, loading } = useArticles({ 
    publishedOnly: true, 
    category: category,
    maxResults: 6 // Fetch a few more to filter current one
  });

  if (loading) {
    return (
      <section className={styles.relatedSection}>
        <div className={styles.skeletonTitle}></div>
        <div className={styles.loading}>
          {[1, 2, 3].map(i => (
            <div key={i} className={styles.skeletonCard}>
              <div className={styles.skeletonImage}></div>
              <div className={styles.skeletonText} style={{ width: '40%' }}></div>
              <div className={styles.skeletonText}></div>
              <div className={styles.skeletonText} style={{ width: '80%' }}></div>
            </div>
          ))}
        </div>
      </section> section>
    );
  }

  // Filter out the current article and limit to 3 or 4
  const relatedArticles = articles
    .filter(article => article.id !== currentArticleId)
    .slice(0, 3);

  if (relatedArticles.length === 0) {
    return null; // Don't show the section if nothing found
  }

  return (
    <section className={styles.relatedSection}>
      <h2 className={styles.sectionTitle}>
        <span className={styles.fireIcon}>📑</span> 
        {language === 'hi' ? 'संबंधित खबरें' : 'Related News'}
      </h2>
      <div className={styles.grid}>
        {relatedArticles.map(article => (
          <Link 
            key={article.id} 
            href={`/article/${article.id}`} 
            className={styles.card}
          >
            <div className={styles.imageWrapper}>
              <img 
                src={article.images?.[0]?.url || `https://picsum.photos/seed/${article.id}/800/400`} 
                alt={article.title} 
                className={styles.image}
              />
            </div>
            <div className={styles.content}>
              <span className={styles.category}>{article.category}</span>
              <h3 className={styles.title}>
                <TranslatedText text={article.title} />
              </h3>
              <span className={styles.date}>
                {article.created_at?.toLocaleDateString?.(language === 'hi' ? 'hi-IN' : 'en-IN', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric'
                })}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
