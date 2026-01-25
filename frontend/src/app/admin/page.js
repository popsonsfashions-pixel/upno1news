"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { useArticles, publishArticle, unpublishArticle, deleteArticle, updateArticle, useAds, createAd, updateAd, deleteAd } from '@/hooks/useFirestore';
import Header from '@/components/Header/Header';
import ImageUploader from '@/components/ImageUploader/ImageUploader';
import styles from './admin.module.css';

const PLACEMENT_OPTIONS = {
    en: [
        { value: 'normal', label: 'Normal', color: '#666' },
        { value: 'hero', label: '⭐ Hero (Main Feature)', color: '#e02020' },
        { value: 'featured', label: '🔥 Featured', color: '#ff6b00' },
        { value: 'trending', label: '📈 Trending Sidebar', color: '#1a73e8' },
        { value: 'breaking', label: '🔴 Breaking News', color: '#dc2626' },
        { value: 'header', label: '📢 Header Top', color: '#fbbc05' },
        { value: 'article_middle', label: '📝 Article Middle', color: '#34a853' },
        { value: 'article_bottom', label: '📄 Article Bottom', color: '#4285f4' },
        { value: 'footer', label: '🏢 Footer', color: '#7b1fa2' },
    ],
    hi: [
        { value: 'normal', label: 'सामान्य', color: '#666' },
        { value: 'hero', label: '⭐ हीरो (मुख्य)', color: '#e02020' },
        { value: 'featured', label: '🔥 विशेष', color: '#ff6b00' },
        { value: 'trending', label: '📈 ट्रेंडिंग', color: '#1a73e8' },
        { value: 'breaking', label: '🔴 ब्रेकिंग न्यूज़', color: '#dc2626' },
        { value: 'header', label: '📢 हेडर टॉप', color: '#fbbc05' },
        { value: 'article_middle', label: '📝 लेख के बीच में', color: '#34a853' },
        { value: 'article_bottom', label: '📄 लेख के नीचे', color: '#4285f4' },
        { value: 'footer', label: '🏢 फुटर', color: '#7b1fa2' },
    ]
};

export default function AdminPage() {
    const { user, userData, loading, isAdmin } = useAuth();
    const { language, t } = useLanguage();
    const { articles, loading: articlesLoading, error } = useArticles({ publishedOnly: false });
    const { ads, loading: adsLoading } = useAds();

    const [activeTab, setActiveTab] = (typeof window !== 'undefined') ? useState('articles') : ['articles', () => { }];
    const [isAddingAd, setIsAddingAd] = useState(false);
    const [editingAd, setEditingAd] = useState(null);
    const [adFormData, setAdFormData] = useState({ imageUrl: '', linkUrl: '', position: 'sidebar', target: 'all', active: true });

    const placementOptions = PLACEMENT_OPTIONS[language] || PLACEMENT_OPTIONS.en;

    if (loading) {
        return (
            <>
                <Header />
                <main className={styles.main}>
                    <div className="container">
                        <div className={styles.loading}>
                            {t('loading')}
                        </div>
                    </div>
                </main>
            </>
        );
    }

    if (!user || !isAdmin()) {
        return (
            <>
                <Header />
                <main className={styles.main}>
                    <div className="container">
                        <div className={styles.accessDenied}>
                            <h1>{t('accessDenied')}</h1>
                            <p>{t('adminRequired')}</p>
                        </div>
                    </div>
                </main>
            </>
        );
    }

    const handlePublish = async (articleId) => {
        const result = await publishArticle(articleId);
        if (!result.success) alert(t('failedPrefix') + result.error);
    };

    const handleUnpublish = async (articleId) => {
        const result = await unpublishArticle(articleId);
        if (!result.success) alert(t('failedPrefix') + result.error);
    };

    const handleDelete = async (articleId) => {
        if (confirm(t('confirmDelete'))) {
            const result = await deleteArticle(articleId);
            if (!result.success) alert(t('failedPrefix') + result.error);
        }
    };

    const togglePlacement = async (article, placementValue) => {
        // Get current placements (handle legacy single string)
        let currentPlacements = article.placements || [];
        if (!article.placements && article.placement) {
            currentPlacements = [article.placement];
        }

        let newPlacements;
        if (currentPlacements.includes(placementValue)) {
            // Remove
            newPlacements = currentPlacements.filter(p => p !== placementValue);
        } else {
            // Add (if normal is selected, maybe clear others? Or just treat normal as 'no specific placement')
            // If 'normal' is selected, we usually just clear everything else or just have it valid. 
            // Actually, based on existing logic, 'normal' isn't a special tag in the new system, just lack of tags. 
            // But let's keep it as a value if user explicitly selects it, or maybe 'normal' just means 'no other tags'.
            // Let's treat 'normal' as 'clear all' effectively, or just remove 'normal' if adding others.

            if (placementValue === 'normal') {
                newPlacements = ['normal'];
            } else {
                newPlacements = [...currentPlacements.filter(p => p !== 'normal'), placementValue];
            }
        }

        // If empty, default to 'normal' or empty array? Let's use ['normal'] to be consistent with legacy, or just empty. 
        // Logic in useArticles usually defaults placement='normal' if missing. 
        if (newPlacements.length === 0) newPlacements = ['normal'];

        const result = await updateArticle(article.id, { placements: newPlacements });
        if (!result.success) alert(t('failedPrefix') + result.error);
    };

    const hasPlacement = (article, placement) => {
        const list = article.placements || (article.placement ? [article.placement] : []);
        return list.includes(placement);
    };

    const heroArticles = articles.filter(a => a.is_published && hasPlacement(a, 'hero'));
    const featuredArticles = articles.filter(a => a.is_published && hasPlacement(a, 'featured'));
    const trendingArticles = articles.filter(a => a.is_published && hasPlacement(a, 'trending'));
    const breakingArticles = articles.filter(a => a.is_published && hasPlacement(a, 'breaking'));

    const handleAdSubmit = async (e) => {
        e.preventDefault();
        let result;
        if (editingAd) {
            result = await updateAd(editingAd.id, adFormData);
        } else {
            result = await createAd(adFormData);
        }

        if (result.success) {
            setIsAddingAd(false);
            setEditingAd(null);
            setAdFormData({ imageUrl: '', linkUrl: '', position: 'sidebar', target: 'all', active: true });
        } else {
            alert("Failed: " + result.error);
        }
    };

    const handleAdDelete = async (adId) => {
        if (confirm("Delete this advertisement?")) {
            await deleteAd(adId);
        }
    };

    const toggleAdStatus = async (ad) => {
        await updateAd(ad.id, { active: !ad.active });
    };

    return (
        <>
            <Header />
            <main className={styles.main}>
                <div className="container">
                    <div className={styles.adminCard}>
                        <div className={styles.header}>
                            <div>
                                <h1 className={styles.title}>{t('adminPanel')}</h1>
                                <p className={styles.subtitle}>
                                    {t('adminSubtitle')}
                                </p>
                            </div>
                            <div className={styles.headerActions}>
                                <button
                                    onClick={async () => {
                                        if (confirm("Sync latest Bollywood news from Google?")) {
                                            const res = await fetch('/api/cron/bollywood');
                                            const data = await res.json();
                                            alert(data.message || "Sync Complete");
                                            window.location.reload();
                                        }
                                    }}
                                    className={styles.syncBtn}
                                    style={{
                                        marginRight: '10px',
                                        padding: '8px 16px',
                                        borderRadius: '4px',
                                        border: '1px solid #1a73e8',
                                        background: 'transparent',
                                        color: '#1a73e8',
                                        cursor: 'pointer',
                                        fontWeight: '600'
                                    }}
                                >
                                    🔄 {language === 'hi' ? 'सिंक करें' : 'Sync News'}
                                </button>
                                <Link href="/write" className={styles.createBtn}>
                                    + {t('createArticle')}
                                </Link>
                            </div>
                        </div>

                        {/* Placement Summary */}
                        <div className={styles.placementSummary}>
                            <div className={styles.placementCard} style={{ borderColor: '#e02020' }}>
                                <span className={styles.placementCount}>{heroArticles.length}</span>
                                <span className={styles.placementLabel}>{t('hero')}</span>
                            </div>
                            <div className={styles.placementCard} style={{ borderColor: '#ff6b00' }}>
                                <span className={styles.placementCount}>{featuredArticles.length}</span>
                                <span className={styles.placementLabel}>{t('featured')}</span>
                            </div>
                            <div className={styles.placementCard} style={{ borderColor: '#1a73e8' }}>
                                <span className={styles.placementCount}>{trendingArticles.length}</span>
                                <span className={styles.placementLabel}>{t('trending')}</span>
                            </div>
                            <div className={styles.placementCard} style={{ borderColor: '#dc2626' }}>
                                <span className={styles.placementCount}>{breakingArticles.length}</span>
                                <span className={styles.placementLabel}>{t('breaking')}</span>
                            </div>
                        </div>

                        <div className={styles.tabs} style={{ display: 'flex', gap: '20px', marginBottom: '30px', borderBottom: '1px solid #ddd' }}>
                            <button
                                onClick={() => setActiveTab('articles')}
                                style={{
                                    padding: '10px 20px',
                                    border: 'none',
                                    background: 'none',
                                    cursor: 'pointer',
                                    fontWeight: activeTab === 'articles' ? '700' : '400',
                                    borderBottom: activeTab === 'articles' ? '3px solid #1a73e8' : 'none',
                                    color: activeTab === 'articles' ? '#1a73e8' : '#666'
                                }}
                            >
                                {language === 'hi' ? 'लेख' : 'Articles'}
                            </button>
                            <button
                                onClick={() => setActiveTab('ads')}
                                style={{
                                    padding: '10px 20px',
                                    border: 'none',
                                    background: 'none',
                                    cursor: 'pointer',
                                    fontWeight: activeTab === 'ads' ? '700' : '400',
                                    borderBottom: activeTab === 'ads' ? '3px solid #1a73e8' : 'none',
                                    color: activeTab === 'ads' ? '#1a73e8' : '#666'
                                }}
                            >
                                {language === 'hi' ? 'विज्ञापन' : 'Ads'}
                            </button>
                        </div>

                        {activeTab === 'articles' ? (
                            <>
                                <div className={styles.stats}>
                                    <div className={styles.stat}>
                                        <span className={styles.statNumber}>{articles.length}</span>
                                        <span className={styles.statLabel}>{t('total')}</span>
                                    </div>
                                    <div className={styles.stat}>
                                        <span className={styles.statNumber}>
                                            {articles.filter(a => a.is_published).length}
                                        </span>
                                        <span className={styles.statLabel}>{t('statusPublished')}</span>
                                    </div>
                                    <div className={styles.stat}>
                                        <span className={styles.statNumber}>
                                            {articles.filter(a => !a.is_published).length}
                                        </span>
                                        <span className={styles.statLabel}>{t('drafts')}</span>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className={styles.stats}>
                                <div className={styles.stat}>
                                    <span className={styles.statNumber}>{ads.length}</span>
                                    <span className={styles.statLabel}>{language === 'hi' ? 'कुल विज्ञापन' : 'Total Ads'}</span>
                                </div>
                                <div className={styles.stat}>
                                    <span className={styles.statNumber}>
                                        {ads.filter(a => a.active).length}
                                    </span>
                                    <span className={styles.statLabel}>{language === 'hi' ? 'सक्रिय' : 'Active'}</span>
                                </div>
                            </div>
                        )}

                        {activeTab === 'ads' && (
                            <div className={styles.adMap} style={{ background: '#f0f4f8', padding: '20px', borderRadius: '12px', marginBottom: '30px', border: '1px solid #d1d9e6' }}>
                                <h3 style={{ margin: '0 0 15px 0', fontSize: '1.1rem', color: '#2c3e50', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    🗺️ {language === 'hi' ? 'विज्ञापन स्थान मानचित्र' : 'Ad Placements Map'}
                                </h3>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '12px' }}>
                                    {[
                                        { id: 'header', label: 'Header Top' },
                                        { id: 'sidebar', label: 'Sidebar (Global)' },
                                        { id: 'article_middle', label: 'Article Middle' },
                                        { id: 'article_bottom', label: 'Article Bottom' },
                                        { id: 'footer', label: 'Footer' }
                                    ].map(spot => {
                                        const spotAds = ads.filter(a => a.position === spot.id && a.active);
                                        return (
                                            <div key={spot.id} style={{
                                                background: 'white',
                                                padding: '12px',
                                                borderRadius: '8px',
                                                border: '1px solid #e2e8f0',
                                                boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
                                            }}>
                                                <div style={{ fontWeight: '600', fontSize: '0.9rem', marginBottom: '4px' }}>{spot.label}</div>
                                                <div style={{ fontSize: '0.8rem', color: spotAds.length > 0 ? '#34a853' : '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: spotAds.length > 0 ? '#34a853' : '#94a3b8' }}></span>
                                                    {spotAds.length > 0 ? `${spotAds.length} Active Ads` : 'No Active Ads'}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {activeTab === 'articles' ? (
                            <>
                                <h2 className={styles.sectionTitle}>
                                    {t('allArticles')}
                                </h2>

                                {error && (
                                    <div className={styles.error}>{t('errorPrefix')} {error}</div>
                                )}

                                {articlesLoading ? (
                                    <div className={styles.loading}>{t('loading')}</div>
                                ) : articles.length === 0 ? (
                                    <div className={styles.empty}>
                                        <p>📝 {t('noArticles')}</p>
                                        <Link href="/write" className={styles.emptyBtn}>
                                            {t('createFirstArticle')}
                                        </Link>
                                    </div>
                                ) : (
                                    <div className={styles.articleList}>
                                        {articles.map((article) => (
                                            <div key={article.id} className={styles.articleItem}>
                                                <div className={styles.articleInfo}>
                                                    <h3>{article.title}</h3>
                                                    <p>
                                                        {article.author_email} • {article.created_at?.toLocaleDateString?.(language === 'hi' ? 'hi-IN' : 'en-US')}
                                                    </p>
                                                    <div className={styles.articleBadges}>
                                                        <span className={article.is_published ? styles.published : styles.draft}>
                                                            {article.is_published
                                                                ? `✓ ${t('statusPublished')}`
                                                                : `○ ${t('statusDraft')}`
                                                            }
                                                        </span>
                                                        {(article.placements || (article.placement ? [article.placement] : [])).map(pVal => {
                                                            if (pVal === 'normal') return null;
                                                            const opt = PLACEMENT_OPTIONS.en.find(p => p.value === pVal);
                                                            if (!opt) return null;
                                                            return (
                                                                <span
                                                                    key={pVal}
                                                                    className={styles.placementBadge}
                                                                    style={{
                                                                        background: (opt.color || '#666') + '20',
                                                                        color: opt.color || '#666',
                                                                        marginRight: '4px'
                                                                    }}
                                                                >
                                                                    {t(pVal)}
                                                                </span>
                                                            );
                                                        })}
                                                    </div>
                                                </div>

                                                <div className={styles.articleControls}>
                                                    <div className={styles.placementControl}>
                                                        <label>{t('placement')}:</label>
                                                        <div className={styles.placementOptions}>
                                                            {placementOptions.filter(opt => opt.value !== 'normal').map(opt => {
                                                                const currentPlacements = article.placements || (article.placement ? [article.placement] : []);
                                                                const isChecked = currentPlacements.includes(opt.value);
                                                                return (
                                                                    <label key={opt.value} className={styles.checkboxLabel} style={{ display: 'block', margin: '2px 0', fontSize: '0.9rem', cursor: 'pointer' }}>
                                                                        <input
                                                                            type="checkbox"
                                                                            checked={isChecked}
                                                                            onChange={() => togglePlacement(article, opt.value)}
                                                                            style={{ marginRight: '6px' }}
                                                                        />
                                                                        {opt.label}
                                                                    </label>
                                                                );
                                                            })}
                                                        </div>
                                                    </div>

                                                    <div className={styles.articleActions}>
                                                        {article.is_published ? (
                                                            <button onClick={() => handleUnpublish(article.id)} className={styles.unpublishBtn}>
                                                                {t('unpublish')}
                                                            </button>
                                                        ) : (
                                                            <button onClick={() => handlePublish(article.id)} className={styles.publishBtn}>
                                                                {t('publish')}
                                                            </button>
                                                        )}
                                                        <button onClick={() => handleDelete(article.id)} className={styles.deleteBtn}>
                                                            {t('delete')}
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className={styles.adsManagement}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                                    <h2 className={styles.sectionTitle} style={{ margin: 0 }}>
                                        {language === 'hi' ? 'विज्ञापनों का प्रबंधन करें' : 'Manage Advertisements'}
                                    </h2>
                                    <button
                                        onClick={() => {
                                            setIsAddingAd(true);
                                            setEditingAd(null);
                                            setAdFormData({ imageUrl: '', linkUrl: '', position: 'sidebar', target: 'all', active: true });
                                        }}
                                        className={styles.createBtn}
                                    >
                                        + {language === 'hi' ? 'नया विज्ञापन' : 'New Ad'}
                                    </button>
                                </div>

                                {(isAddingAd || editingAd) && (
                                    <div className={styles.adFormCard} style={{ background: '#f9f9f9', padding: '20px', borderRadius: '8px', marginBottom: '30px', border: '1px solid #ddd' }}>
                                        <h3>{editingAd ? (language === 'hi' ? 'विज्ञापन संपादित करें' : 'Edit Ad') : (language === 'hi' ? 'नया विज्ञापन जोड़ें' : 'Add New Ad')}</h3>
                                        <form onSubmit={handleAdSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                            <div>
                                                <label style={{ display: 'block', marginBottom: '5px' }}>{language === 'hi' ? 'छवि' : 'Image'}</label>
                                                <div style={{ marginBottom: '10px' }}>
                                                    <ImageUploader
                                                        onImageAdd={(img) => setAdFormData({ ...adFormData, imageUrl: img.url })}
                                                        disabled={loading}
                                                    />
                                                </div>
                                                <input
                                                    type="text"
                                                    placeholder={language === 'hi' ? 'छवि URL दर्ज करें' : 'Or enter Image URL'}
                                                    value={adFormData.imageUrl}
                                                    onChange={(e) => setAdFormData({ ...adFormData, imageUrl: e.target.value })}
                                                    required
                                                    style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc', marginTop: '10px' }}
                                                />
                                            </div>
                                            <div>
                                                <label style={{ display: 'block', marginBottom: '5px' }}>{language === 'hi' ? 'लक्ष्य पृष्ठ' : 'Target Page'}</label>
                                                <select
                                                    value={adFormData.target}
                                                    onChange={(e) => setAdFormData({ ...adFormData, target: e.target.value })}
                                                    style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                                                >
                                                    <option value="all">All Pages</option>
                                                    <option value="homepage">Homepage Only</option>
                                                    <option value="articles">Articles Only</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label style={{ display: 'block', marginBottom: '5px' }}>{language === 'hi' ? 'लिंक URL' : 'Link URL'}</label>
                                                <input
                                                    type="text"
                                                    value={adFormData.linkUrl}
                                                    onChange={(e) => setAdFormData({ ...adFormData, linkUrl: e.target.value })}
                                                    required
                                                    style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                                                />
                                            </div>
                                            <div>
                                                <label style={{ display: 'block', marginBottom: '5px' }}>{language === 'hi' ? 'स्थान' : 'Position'}</label>
                                                <select
                                                    value={adFormData.position}
                                                    onChange={(e) => setAdFormData({ ...adFormData, position: e.target.value })}
                                                    style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                                                >
                                                    <option value="sidebar">Sidebar</option>
                                                    <option value="header">Header</option>
                                                    <option value="article_middle">Article Middle</option>
                                                </select>
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                <input
                                                    type="checkbox"
                                                    id="active"
                                                    checked={adFormData.active}
                                                    onChange={(e) => setAdFormData({ ...adFormData, active: e.target.checked })}
                                                />
                                                <label htmlFor="active">{language === 'hi' ? 'सक्रिय' : 'Active'}</label>
                                            </div>
                                            <div style={{ display: 'flex', gap: '10px' }}>
                                                <button type="submit" className={styles.publishBtn}>{language === 'hi' ? 'सहेजें' : 'Save'}</button>
                                                <button type="button" onClick={() => { setIsAddingAd(false); setEditingAd(null); }} className={styles.unpublishBtn}>{language === 'hi' ? 'रद्द करें' : 'Cancel'}</button>
                                            </div>
                                        </form>
                                    </div>
                                )}

                                {adsLoading ? (
                                    <div className={styles.loading}>{t('loading')}</div>
                                ) : (
                                    <div className={styles.articleList}>
                                        {ads.map((ad) => (
                                            <div key={ad.id} className={styles.articleItem} style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                                                <div style={{ width: '100px', height: '60px', overflow: 'hidden', borderRadius: '4px', flexShrink: 0 }}>
                                                    <img src={ad.imageUrl} alt="Ad" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                </div>
                                                <div className={styles.articleInfo} style={{ flex: 1 }}>
                                                    <h4 style={{ margin: '0 0 5px 0' }}>{ad.linkUrl}</h4>
                                                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                                        <span className={ad.active ? styles.published : styles.draft}>
                                                            {ad.active ? 'Active' : 'Inactive'}
                                                        </span>
                                                        <span style={{ fontSize: '0.75rem', color: '#666', background: '#eee', padding: '2px 8px', borderRadius: '12px' }}>
                                                            {ad.position || 'sidebar'}
                                                        </span>
                                                        <span style={{ fontSize: '0.75rem', color: '#1a73e8', background: 'rgba(26, 115, 232, 0.1)', padding: '2px 8px', borderRadius: '12px' }}>
                                                            Target: {ad.target || 'all'}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className={styles.articleActions}>
                                                    <button onClick={() => toggleAdStatus(ad)} className={styles.unpublishBtn} style={{ fontSize: '0.8rem' }}>
                                                        {ad.active ? 'Deactivate' : 'Activate'}
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            setEditingAd(ad);
                                                            setAdFormData({
                                                                imageUrl: ad.imageUrl,
                                                                linkUrl: ad.linkUrl,
                                                                position: ad.position || 'sidebar',
                                                                target: ad.target || 'all',
                                                                active: ad.active
                                                            });
                                                            window.scrollTo({ top: 0, behavior: 'smooth' });
                                                        }}
                                                        className={styles.syncBtn} // Reusing style
                                                        style={{ fontSize: '0.8rem', marginRight: '5px' }}
                                                    >
                                                        Edit
                                                    </button>
                                                    <button onClick={() => handleAdDelete(ad.id)} className={styles.deleteBtn} style={{ fontSize: '0.8rem' }}>
                                                        Delete
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </>
    );
}
