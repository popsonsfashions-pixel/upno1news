"use client";

import Link from 'next/link';
import { useAds } from '@/hooks/useFirestore';
import { useLanguage } from '@/context/LanguageContext';
import AdBanner from '@/components/AdBanner/AdBanner';
import UserMenu from '@/components/Auth/UserMenu';
import styles from './Footer.module.css';

export default function Footer() {
    const { language, t } = useLanguage();
    const { ads } = useAds({ activeOnly: true });

    const footerAds = ads.filter(ad => ad.position === 'footer' && (ad.target === 'all' || !ad.target));

    return (
        <footer className={styles.footer}>
            <div className="container">
                {/* Footer Ads */}
                {footerAds.length > 0 && (
                    <div className={styles.footerAds}>
                        {footerAds.map(ad => (
                            <AdBanner
                                key={ad.id}
                                imageUrl={ad.imageUrl}
                                linkUrl={ad.linkUrl}
                                label={language === 'hi' ? 'विज्ञापन' : 'Advertisement'}
                            />
                        ))}
                    </div>
                )}

                <div className={styles.footerContent}>
                    <div className={styles.footerInfo}>
                        <img src="/logo.png" alt="UP News No. 1" className={styles.footerLogo} />
                        <p className={styles.footerDesc}>
                            {language === 'hi'
                                ? 'उत्तर प्रदेश की ताज़ा खबरें, फिल्म, खेल और व्यापार की दुनिया से जुड़ी हर खबर।'
                                : 'Get the latest news from Uttar Pradesh, Bollywood, Cricket, Finance and World.'
                            }
                        </p>
                    </div>

                    <div className={styles.footerLinks}>
                        <div className={styles.linkGroup}>
                            <h4>{language === 'hi' ? 'कैटेगरी' : 'Categories'}</h4>
                            <Link href="/Uttar Pradesh">Uttar Pradesh</Link>
                            <Link href="/Entertainment">Entertainment</Link>
                            <Link href="/Sports">Sports</Link>
                            <Link href="/Business">Business</Link>
                        </div>
                    </div>
                </div>

                <div className={styles.footerBottom}>
                    <div className={styles.footerAuth}>
                        <UserMenu />
                    </div>
                    <p>&copy; {new Date().getFullYear()} UP News No.1. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
}
