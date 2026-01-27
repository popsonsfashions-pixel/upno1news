import NewsCard from '../NewsCard/NewsCard';
import styles from './HeroSection.module.css';

export default function HeroSection({ news }) {
    if (!news || news.length === 0) return null;

    const [mainNews, ...otherNews] = news;

    return (
        <section className={styles.heroSection}>
            <div className={styles.heroGrid}>
                {/* Main Hero Card */}
                <div className={styles.heroMain}>
                    <NewsCard
                        variant="hero"
                        isMain={true}
                        title={mainNews.title}
                        excerpt={mainNews.excerpt}
                        image={mainNews.image}
                        category={mainNews.category}
                        time={mainNews.time}
                        isLive={mainNews.isLive}
                        href={`/article/${mainNews.id}`}
                    />
                </div>

                {/* Secondary Hero Cards */}
                {otherNews.slice(0, 4).map((item) => (
                    <NewsCard
                        key={item.id}
                        variant="hero"
                        title={item.title}
                        image={item.image}
                        category={item.category}
                        time={item.time}
                        href={`/article/${item.id}`}
                    />
                ))}
            </div>
        </section>
    );
}
