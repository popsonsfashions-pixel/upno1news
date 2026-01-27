import NewsCard from '../NewsCard/NewsCard';
import AdBanner from '../AdBanner/AdBanner';
import { useAds } from '@/hooks/useFirestore';
import { useLanguage } from '@/context/LanguageContext';
import styles from './Sidebar.module.css';

export default function Sidebar({ news, title = "Trending Now", target = "all" }) {
    const { language } = useLanguage();
    const { ads } = useAds({ activeOnly: true });

    const sidebarAds = ads.filter(ad =>
        (ad.position === 'sidebar' || !ad.position) &&
        (ad.target === 'all' || ad.target === target || !ad.target)
    );
    return (
        <aside className={styles.sidebar}>
            {/* Trending Section */}
            <div className={styles.sidebarSection}>
                <div className={styles.sidebarHeader}>
                    <h3 className={styles.sidebarTitle}>{title}</h3>
                </div>

                {news && news.map((item) => (
                    <NewsCard
                        key={item.id}
                        variant="sidebar"
                        title={item.title}
                        image={item.image}
                        category={item.category}
                        time={item.time}
                        href={`/article/${item.id}`}
                    />
                ))}
            </div>

            {/* Dynamic Sidebar Ads */}
            {sidebarAds.map(ad => (
                <AdBanner
                    key={ad.id}
                    imageUrl={ad.imageUrl}
                    linkUrl={ad.linkUrl}
                    label={language === 'hi' ? 'विज्ञापन' : 'Advertisement'}
                />
            ))}

            {!sidebarAds.length && (
                <div className={styles.adPlaceholder}>
                    <div className={styles.adLabel}>Advertisement</div>
                    <div className={styles.adBox}>300 × 250</div>
                </div>
            )}

            {/* Newsletter Signup */}
            <div className={styles.newsletter}>
                <h4 className={styles.newsletterTitle}>Stay Updated</h4>
                <p className={styles.newsletterDesc}>
                    Get the latest news delivered to your inbox daily.
                </p>
                <form className={styles.newsletterForm}>
                    <input
                        type="email"
                        placeholder="Enter your email"
                        className={styles.newsletterInput}
                    />
                    <button type="submit" className={styles.newsletterBtn}>
                        Subscribe
                    </button>
                </form>
            </div>
        </aside>
    );
}
