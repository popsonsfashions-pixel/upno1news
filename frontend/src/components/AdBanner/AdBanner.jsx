import styles from './AdBanner.module.css';

export default function AdBanner({ imageUrl, linkUrl, label = "Advertisement", width = "100%", height = "auto" }) {
    if (!imageUrl) return null;

    return (
        <div className={styles.adContainer} style={{ width, height }}>
            <span className={styles.adLabel}>{label}</span>
            <a href={linkUrl} target="_blank" rel="noopener noreferrer" className={styles.adLink}>
                <img src={imageUrl} alt={label} className={styles.adImage} />
            </a>
        </div>
    );
}
