"use client";

import { useState, useMemo, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { createArticle, useArticle, updateArticle } from '@/hooks/useFirestore';
import { useLanguage } from '@/context/LanguageContext';
import Header from '@/components/Header/Header';
import ImageUploader from '@/components/ImageUploader/ImageUploader';
import { menuCategories } from '@/data/sampleNews';
import styles from './write.module.css';

function WritePageContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const articleId = searchParams.get('id'); // Get article ID from URL

    const { user, userData, loading, canWrite } = useAuth();
    const { language, t } = useLanguage();

    // Fetch article data if editing
    const { article, loading: articleLoading } = useArticle(articleId);

    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');

    // Category state
    const [category, setCategory] = useState(menuCategories[0].name);
    const [subcategory, setSubcategory] = useState('');

    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [images, setImages] = useState([]);

    // Get subcategories for current category
    const subOptions = useMemo(() => {
        const cat = menuCategories.find(c => c.name === category);
        if (!cat) return [];
        let subs = [];
        if (cat.submenu) subs = [...subs, ...cat.submenu];
        if (cat.submenu2) subs = [...subs, ...cat.submenu2];
        return subs;
    }, [category]);

    // Load article data when editing
    useEffect(() => {
        if (article) {
            setTitle(article.title || '');
            setContent(article.content || '');
            setCategory(article.category || menuCategories[0].name);
            setSubcategory(article.subcategory || '');
            // Load images with unique IDs for the UI
            if (article.images && article.images.length > 0) {
                setImages(article.images.map((img, index) => ({
                    ...img,
                    id: img.id || Date.now() + index
                })));
            }
        }
    }, [article]);

    if (loading) {
        return (
            <>
                <Header />
                <main className={styles.main}>
                    <div className="container">
                        <div className={styles.loading}>{t('loading')}</div>
                    </div>
                </main>
            </>
        );
    }

    if (!user || !canWrite()) {
        return (
            <>
                <Header />
                <main className={styles.main}>
                    <div className="container">
                        <div className={styles.accessDenied}>
                            <h1>{t('accessDeniedTitle')}</h1>
                            <p>{t('reporterAdminRequired')}</p>
                        </div>
                    </div>
                </main>
            </>
        );
    }

    const handleImageAdd = (image) => {
        setImages([...images, { ...image, id: Date.now() }]);
    };

    const removeImage = (id) => {
        setImages(images.filter(img => img.id !== id));
    };

    const updateImagePosition = (id, newPosition) => {
        setImages(images.map(img =>
            img.id === id ? { ...img, position: newPosition } : img
        ));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSubmitting(true);

        try {
            const articleData = {
                title,
                content,
                category,
                subcategory,
                images: images.map(({ id, ...rest }) => rest),
            };

            let result;
            if (articleId) {
                // Update existing article
                result = await updateArticle(articleId, articleData);
            } else {
                // Create new article
                result = await createArticle(articleData, user.uid, user.email);
            }

            if (result.success) {
                setSuccess(true);
                setTimeout(() => router.push('/admin'), 2000);
            } else {
                setError(result.error || t('errorOccurred'));
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <>
            <Header />
            <main className={styles.main}>
                <div className="container">
                    <div className={styles.writeCard}>
                        <h1 className={styles.title}>
                            {articleId ? (language === 'hi' ? 'लेख संपादित करें' : 'Edit Article') : t('writeNewArticle')}
                        </h1>
                        <p className={styles.subtitle}>
                            {articleId
                                ? (language === 'hi' ? 'अपने लेख को अपडेट करें' : 'Update your article')
                                : t('createEngagingArticles')
                            }
                        </p>

                        {error && <div className={styles.error}>{error}</div>}
                        {success && (
                            <div className={styles.success}>
                                {t('articleCreatedSuccess')}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className={styles.form}>
                            <div className={styles.inputGroup}>
                                <label>{t('title')} *</label>
                                <input
                                    type="text"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder={t('enterCompellingHeadline')}
                                    required
                                    minLength={5}
                                />
                            </div>

                            <div className={styles.row}>
                                <div className={styles.inputGroup}>
                                    <label>{t('category')} *</label>
                                    <select
                                        value={category}
                                        onChange={(e) => {
                                            setCategory(e.target.value);
                                            setSubcategory(''); // Reset subcategory
                                        }}
                                    >
                                        {menuCategories.map(cat => (
                                            <option key={cat.name} value={cat.name}>
                                                {cat.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {subOptions.length > 0 && (
                                    <div className={styles.inputGroup}>
                                        <label>{t('subcategory')} ({t('optional')})</label>
                                        <select
                                            value={subcategory}
                                            onChange={(e) => setSubcategory(e.target.value)}
                                        >
                                            <option value="">-- {t('select')} --</option>
                                            {subOptions.map(sub => (
                                                <option key={sub.name} value={sub.name}>
                                                    {sub.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                )}
                            </div>

                            {/* Image Upload Section */}
                            <div className={styles.imageSection}>
                                <h3 className={styles.sectionTitle}>📷 {t('uploadImages')}</h3>
                                <p className={styles.sectionHint}>
                                    {t('uploadImagesDirectly')}
                                </p>

                                <ImageUploader onImageAdd={handleImageAdd} disabled={submitting} />

                                {/* Uploaded Images List */}
                                {images.length > 0 && (
                                    <div className={styles.imageList}>
                                        <h4>{t('uploadedImages')} ({images.length})</h4>
                                        {images.map((img) => (
                                            <div key={img.id} className={styles.imageItem}>
                                                <img src={img.url} alt={img.caption || 'Uploaded'} />
                                                <div className={styles.imageInfo}>
                                                    <select
                                                        value={img.position}
                                                        onChange={(e) => updateImagePosition(img.id, e.target.value)}
                                                        className={styles.positionDropdown}
                                                    >
                                                        <option value="auto">{t('auto')}</option>
                                                        <option value="hero">{t('hero')}</option>
                                                        <option value="top">{t('top')}</option>
                                                        <option value="left">{t('left')}</option>
                                                        <option value="right">{t('right')}</option>
                                                        <option value="center">{t('center')}</option>
                                                        <option value="bottom">{t('bottom')}</option>
                                                        <option value="gallery">{t('gallery')}</option>
                                                    </select>
                                                    {img.caption && <span className={styles.caption}>{img.caption}</span>}
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => removeImage(img.id)}
                                                    className={styles.removeBtn}
                                                >
                                                    ✕
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className={styles.inputGroup}>
                                <label>{t('content')} *</label>
                                <textarea
                                    value={content}
                                    onChange={(e) => setContent(e.target.value)}
                                    placeholder={t('writeArticleContent')}
                                    rows={15}
                                    required
                                    minLength={50}
                                />
                            </div>

                            <button
                                type="submit"
                                className={styles.submitBtn}
                                disabled={submitting || (articleId && articleLoading)}
                            >
                                {submitting
                                    ? (articleId ? (language === 'hi' ? 'अपडेट हो रहा है...' : 'Updating...') : t('creating'))
                                    : (articleId ? (language === 'hi' ? 'लेख अपडेट करें' : 'Update Article') : t('createArticle'))
                                }
                            </button>
                        </form>
                    </div>
                </div>
            </main>
        </>
    );
}

export default function WritePage() {
    return (
        <Suspense fallback={
            <>
                <Header />
                <main className={styles.main}>
                    <div className="container">
                        <div className={styles.loading}>Loading...</div>
                    </div>
                </main>
            </>
        }>
            <WritePageContent />
        </Suspense>
    );
}
