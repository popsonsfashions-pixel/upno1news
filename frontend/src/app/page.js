"use client";

import Header from '@/components/Header/Header';
import StatusSection from '@/components/StatusSection/StatusSection';
import { useArticles } from '@/hooks/useFirestore';
import { useLanguage } from '@/context/LanguageContext';
import NewsCard from '@/components/NewsCard/NewsCard';
import TranslatedText from '@/components/TranslatedText';
import AdBanner from '@/components/AdBanner/AdBanner';
import { useAds } from '@/hooks/useFirestore';
import styles from './page.module.css';

export default function Home() {
  const { articles, loading } = useArticles({ publishedOnly: true });
  const { language, t } = useLanguage();
  const { ads } = useAds({ activeOnly: true });

  const sidebarAds = ads.filter(ad =>
    (ad.position === 'sidebar' || !ad.position) &&
    (ad.target === 'homepage' || ad.target === 'all' || !ad.target)
  );

  // Filter by placement
  const hasPlacement = (article, placement) => {
    const list = article.placements || (article.placement ? [article.placement] : []);
    return list.includes(placement);
  };

  const heroArticles = articles.filter(a => hasPlacement(a, 'hero'));
  const breakingArticles = articles.filter(a => hasPlacement(a, 'breaking'));
  const featuredArticles = articles.filter(a => hasPlacement(a, 'featured'));
  const trendingArticles = articles.filter(a => hasPlacement(a, 'trending'));

  // Normal articles: exclude those that are ONLY in special homepage sections? 
  // Or just include everything that isn't explicitly just a special placement?
  // Traditionally 'normal' meant no special placement. 
  // If an article is 'hero', it might also be 'normal' list worthy? 
  // Let's stick to the previous logic: if it has NO special placement, it's normal.
  // Or if it explicitly has 'normal' or empty placements.
  // Latest News: Show ALL articles except Bollywood (as per user request)
  const normalArticles = articles.filter(a => a.category !== 'Bollywood');

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
              {language === 'hi' ? 'लोड हो रहा है...' : 'Loading news...'}
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
          {/* Breaking News Ticker */}
          {breakingArticles.length > 0 && (
            <div className={styles.breakingNews}>
              <div className={styles.breakingScroll}>
                <span className={styles.breakingLabel}>
                  🔴 {t('breakingNews')}
                </span>
                {breakingArticles.map(article => (
                  <a key={article.id} href={`/article/${article.id}`}>
                    <TranslatedText text={article.title} />
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Status Section */}
          <StatusSection />

          {/* Hero Section */}
          {heroArticles.length > 0 && (
            <section className={styles.heroSection}>
              <div className={styles.heroMain}>
                <NewsCard
                  variant="hero"
                  isMain={true}
                  title={heroArticles[0].title}
                  excerpt={heroArticles[0].content?.substring(0, 200) + '...'}
                  image={getFirstImage(heroArticles[0])}
                  category={heroArticles[0].category}
                  time={formatTimeAgo(heroArticles[0].created_at)}
                  href={`/article/${heroArticles[0].id}`}
                />
              </div>
              {heroArticles.length > 1 && (
                <div className={styles.heroSide}>
                  {heroArticles.slice(1, 3).map(article => (
                    <NewsCard
                      key={article.id}
                      variant="hero"
                      title={article.title}
                      image={getFirstImage(article)}
                      category={article.category}
                      time={formatTimeAgo(article.created_at)}
                      href={`/article/${article.id}`}
                    />
                  ))}
                </div>
              )}
            </section>
          )}

          {/* Main Layout */}
          <div className={styles.mainLayout}>
            <div className={styles.content}>
              {/* Featured Section */}
              {featuredArticles.length > 0 && (
                <section className={styles.section}>
                  <h2 className={styles.sectionTitle}>
                    <span className={styles.fireIcon}>🔥</span> {t('featured')}
                  </h2>
                  <div className={styles.featuredGrid}>
                    {featuredArticles.map(article => (
                      <NewsCard
                        key={article.id}
                        variant="list"
                        title={article.title}
                        excerpt={article.content?.substring(0, 100) + '...'}
                        image={getFirstImage(article)}
                        category={article.category}
                        time={formatTimeAgo(article.created_at)}
                        href={`/article/${article.id}`}
                      />
                    ))}
                  </div>
                </section>
              )}

              {/* Latest News */}
              <section className={styles.section}>
                <h2 className={styles.sectionTitle}>
                  <span className={styles.liveIndicator}></span> {t('latestNews')}
                </h2>
                {normalArticles.length === 0 && heroArticles.length === 0 && featuredArticles.length === 0 ? (
                  <div className={styles.empty}>
                    <p>{language === 'hi' ? 'अभी तक कोई समाचार प्रकाशित नहीं हुआ।' : 'No articles published yet.'}</p>
                    <p>{language === 'hi' ? 'समाचार बनाएं और प्रकाशित करें!' : 'Create and publish articles to see them here!'}</p>
                  </div>
                ) : (
                  <div className={styles.newsList}>
                    {normalArticles.map(article => (
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

            {/* Sidebar */}
            <aside className={styles.sidebar}>
              {/* Trending */}
              {trendingArticles.length > 0 && (
                <div className={styles.sidebarSection}>
                  <h3 className={styles.sidebarTitle}>
                    📈 {language === 'hi' ? 'ट्रेंडिंग' : 'Trending'}
                  </h3>
                  <div className={styles.trendingList}>
                    {trendingArticles.map((article, index) => (
                      <a key={article.id} href={`/article/${article.id}`} className={styles.trendingItem}>
                        <span className={styles.trendingNum}>{index + 1}</span>
                        <span className={styles.trendingTitle}>
                          <TranslatedText text={article.title} />
                        </span>
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Newsletter */}
              <div className={styles.newsletter}>
                <h3>{t('stayUpdated')}</h3>
                <p>{t('newsletter')}</p>
                <input type="email" placeholder={t('yourEmail')} />
                <button>{t('subscribe')}</button>
              </div>

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
            </aside>
          </div>
        </div>
      </main>
    </>
  );
}
