"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/context/LanguageContext';
import { upDistricts } from '@/data/sampleNews';
import styles from './LocationSelector.module.css';

export default function LocationSelector() {
    const [isOpen, setIsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const { language } = useLanguage();
    const router = useRouter();

    // Prevent scrolling when modal is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'auto';
        }
        return () => {
            document.body.style.overflow = 'auto';
        };
    }, [isOpen]);

    const filteredDistricts = upDistricts.filter(district => {
        const query = searchQuery.toLowerCase();
        return (
            district.name.toLowerCase().includes(query) ||
            (district.nameHi && district.nameHi.includes(query))
        );
    });

    const handleSelect = (district) => {
        const slug = district.name.toLowerCase().replace(/\s+/g, '-');
        setIsOpen(false);
        setSearchQuery('');
        router.push(`/uttar-pradesh/${slug}`);
    };

    return (
        <div className={styles.container}>
            <button 
                className={styles.locationBtn} 
                onClick={() => setIsOpen(true)}
                aria-label="Select City"
            >
                <svg className={styles.icon} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                    <circle cx="12" cy="10" r="3" />
                </svg>
                <span>{language === 'hi' ? 'शहर चुनें' : 'City'}</span>
            </button>

            <div className={`${styles.modalOverlay} ${isOpen ? styles.open : ''}`} onClick={() => setIsOpen(false)}>
                <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
                    <div className={styles.modalHeader}>
                        <h3>{language === 'hi' ? 'अपना शहर चुनें' : 'Select your City'}</h3>
                        <button className={styles.closeBtn} onClick={() => setIsOpen(false)}>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <line x1="18" y1="6" x2="6" y2="18" />
                                <line x1="6" y1="6" x2="18" y2="18" />
                            </svg>
                        </button>
                    </div>
                    
                    <div className={styles.searchWrapper}>
                        <input
                            type="text"
                            placeholder={language === 'hi' ? 'शहर खोजें...' : 'Search city...'}
                            className={styles.searchInput}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            // Auto focus when modal opens
                            ref={input => input && isOpen && input.focus()}
                        />
                    </div>

                    <div className={styles.districtsGrid}>
                        {filteredDistricts.length > 0 ? (
                            filteredDistricts.map(district => (
                                <button
                                    key={district.name}
                                    className={styles.districtBtn}
                                    onClick={() => handleSelect(district)}
                                >
                                    {language === 'hi' && district.nameHi ? district.nameHi : district.name}
                                </button>
                            ))
                        ) : (
                            <p style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '20px', color: 'var(--text-secondary)' }}>
                                {language === 'hi' ? 'कोई शहर नहीं मिला' : 'No city found'}
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
