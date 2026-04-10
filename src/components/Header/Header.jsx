"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import styles from './Header.module.css';
import LocationSelector from '@/components/LocationSelector/LocationSelector';
import UserMenu from '@/components/Auth/UserMenu';
import { useLanguage } from '@/context/LanguageContext';
import { useAds } from '@/hooks/useFirestore';
import AdBanner from '@/components/AdBanner/AdBanner';
import { menuCategories, trendingTopics } from '@/data/sampleNews';

export default function Header() {
    const [activeMenu, setActiveMenu] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const router = useRouter();
    const pathname = usePathname();

    // Close mobile menu on path switch
    useEffect(() => {
        setIsMobileMenuOpen(false);
    }, [pathname]);

    const { language, t } = useLanguage();
    const { ads } = useAds({ activeOnly: true });

    const headerAds = ads.filter(ad => ad.position === 'header');

    const handleMenuClick = (e, categoryName) => {
        // If it's a touch device or we want click-to-toggle behavior
        if (window.innerWidth <= 1024) {
            e.preventDefault(); // Prevent navigation on first click
            if (activeMenu === categoryName) {
                setActiveMenu(null);
            } else {
                setActiveMenu(categoryName);
            }
        }
    };

    return (
        <header className={styles.header}>
            <div className="container">

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
                        <input
                            type="text"
                            placeholder={t('search')}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && searchQuery.trim()) {
                                    router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
                                }
                            }}
                        />
                    </div>

                    <div className={styles.headerActions}>
                        <LocationSelector />
                        
                        <button 
                            className={styles.hamburgerBtn}
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            aria-label="Toggle menu"
                        >
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                {isMobileMenuOpen ? (
                                    <>
                                        <line x1="18" y1="6" x2="6" y2="18"></line>
                                        <line x1="6" y1="6" x2="18" y2="18"></line>
                                    </>
                                ) : (
                                    <>
                                        <line x1="3" y1="12" x2="21" y2="12"></line>
                                        <line x1="3" y1="6" x2="21" y2="6"></line>
                                        <line x1="3" y1="18" x2="21" y2="18"></line>
                                    </>
                                )}
                            </svg>
                        </button>
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

            {/* Desktop & Mobile Sidebar Navigation */}
            <div 
                className={`${styles.navOverlay} ${isMobileMenuOpen ? styles.open : ''}`} 
                onClick={() => setIsMobileMenuOpen(false)}
            ></div>
            <div className={`${styles.navWrapper} ${isMobileMenuOpen ? styles.open : ''}`}>
                <div className="container">
                    <nav className={styles.nav}>
                        <div className={styles.navItem}>
                            <Link href="/" className={styles.navLink}>
                                {language === 'hi' ? 'होम' : 'Home'}
                            </Link>
                        </div>
                        {menuCategories.map((category) => (
                            <div
                                key={category.name}
                                className={styles.navItem}
                                onMouseEnter={() => setActiveMenu(category.name)}
                                onMouseLeave={() => setActiveMenu(null)}
                            >
                                <Link
                                    href={category.href}
                                    className={`${styles.navLink} ${activeMenu === category.name ? styles.active : ''}`}
                                    onClick={(e) => (category.submenu || category.submenu2) && handleMenuClick(e, category.name)}
                                >
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
