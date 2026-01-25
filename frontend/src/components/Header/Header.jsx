"use client";

import { useState } from 'react';
import Link from 'next/link';
import styles from './Header.module.css';
import UserMenu from '@/components/Auth/UserMenu';
import { useLanguage } from '@/context/LanguageContext';
import { useAds } from '@/hooks/useFirestore';
import AdBanner from '@/components/AdBanner/AdBanner';
import { menuCategories, trendingTopics } from '@/data/sampleNews';

export default function Header() {
    const [activeMenu, setActiveMenu] = useState(null);
    const { language, t } = useLanguage();
    const { ads } = useAds({ activeOnly: true });

    const headerAds = ads.filter(ad => ad.position === 'header');

    return (
        <header className={styles.header}>
            {/* Top Bar */}
            <div className="container">
                <div className={styles.topBar}>
                    <div className={styles.topBarLinks}>
                        <Link href="/e-paper">E-Paper</Link>
                        <Link href="/videos">Videos</Link>
                        <Link href="/photos">Photos</Link>
                    </div>
                    <div className={styles.topBarRight}>
                        {/* Language Switcher Removed */}
                        <span className={styles.date}>
                            {new Date().toLocaleDateString(language === 'hi' ? 'hi-IN' : 'en-IN', {
                                weekday: 'long',
                                day: 'numeric',
                                month: 'long',
                                year: 'numeric'
                            })}
                        </span>
                    </div>
                </div>

                {/* Main Header */}
                <div className={styles.mainHeader}>
                    <Link href="/" className={styles.logo}>
                        <img src="/logo.png" alt="UP News No. 1" className={styles.logoImg} />
                    </Link>

                    <div className={styles.searchBar}>
                        <svg className={styles.searchIcon} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="11" cy="11" r="8" />
                            <path d="m21 21-4.35-4.35" />
                        </svg>
                        <input type="text" placeholder={t('search')} />
                    </div>

                    <div className={styles.headerActions}>
                        <UserMenu />
                    </div>
                </div>

                {/* Header Ads */}
                {headerAds.length > 0 && (
                    <div className={styles.headerAds}>
                        {headerAds.map(ad => (
                            <AdBanner
                                key={ad.id}
                                imageUrl={ad.imageUrl}
                                linkUrl={ad.linkUrl}
                                label={language === 'hi' ? 'विज्ञापन' : 'Advertisement'}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Navigation */}
            <div className={styles.navWrapper}>
                <div className="container">
                    <nav className={styles.nav}>
                        {menuCategories.map((category) => (
                            <div
                                key={category.name}
                                className={styles.navItem}
                                onMouseEnter={() => setActiveMenu(category.name)}
                                onMouseLeave={() => setActiveMenu(null)}
                            >
                                <Link href={category.href} className={styles.navLink}>
                                    {language === 'hi' && category.nameHi ? category.nameHi : category.name}
                                    <span className={styles.navArrow}>▼</span>
                                </Link>

                                {category.submenu && activeMenu === category.name && (
                                    <div className={`${styles.megaMenu} ${category.name === 'Uttar Pradesh' ? styles.upMenu : ''}`}>
                                        <div className={styles.megaMenuGrid}>
                                            <div className={styles.megaMenuColumn}>
                                                <h4>{language === 'hi' ? 'जिले' : 'Districts'}</h4>
                                                <ul>
                                                    {category.submenu.slice(0, 15).map((item) => (
                                                        <li key={item.name}>
                                                            <Link href={item.href}>
                                                                {language === 'hi' && item.nameHi ? item.nameHi : item.name}
                                                            </Link>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                            {category.submenu.length > 15 && (
                                                <div className={styles.megaMenuColumn}>
                                                    <h4>&nbsp;</h4>
                                                    <ul>
                                                        {category.submenu.slice(15, 30).map((item) => (
                                                            <li key={item.name}>
                                                                <Link href={item.href}>
                                                                    {language === 'hi' && item.nameHi ? item.nameHi : item.name}
                                                                </Link>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}
                                            {category.submenu2 && (
                                                <>
                                                    <div className={styles.megaMenuColumn}>
                                                        <h4>&nbsp;</h4>
                                                        <ul>
                                                            {category.submenu2.slice(0, 15).map((item) => (
                                                                <li key={item.name}>
                                                                    <Link href={item.href}>
                                                                        {language === 'hi' && item.nameHi ? item.nameHi : item.name}
                                                                    </Link>
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                    <div className={styles.megaMenuColumn}>
                                                        <h4>&nbsp;</h4>
                                                        <ul>
                                                            {category.submenu2.slice(15, 30).map((item) => (
                                                                <li key={item.name}>
                                                                    <Link href={item.href}>
                                                                        {language === 'hi' && item.nameHi ? item.nameHi : item.name}
                                                                    </Link>
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                    <div className={styles.megaMenuColumn}>
                                                        <h4>&nbsp;</h4>
                                                        <ul>
                                                            {category.submenu2.slice(30).map((item) => (
                                                                <li key={item.name}>
                                                                    <Link href={item.href}>
                                                                        {language === 'hi' && item.nameHi ? item.nameHi : item.name}
                                                                    </Link>
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </nav>
                </div>
            </div>


        </header>
    );
}
