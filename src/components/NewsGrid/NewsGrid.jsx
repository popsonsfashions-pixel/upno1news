import NewsCard from '../NewsCard/NewsCard';
import styles from './NewsGrid.module.css';

export default function NewsGrid({ news, title = "Latest News" }) {
    if (!news || news.length === 0) return null;

    return (
        <section className={styles.newsGrid}>
            <div className="section-header">
                <h2 className="section-title">{title}</h2>
            </div>

            <div className={styles.newsWrap}>
                {news.map((item) => (
                    <NewsCard
                        key={item.id}
                        variant="list"
                        title={item.title}
                        excerpt={item.excerpt}
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
