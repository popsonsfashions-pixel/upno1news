"use client";

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { createArticle } from '@/hooks/useFirestore';
import Header from '@/components/Header/Header';
import ImageUploader from '@/components/ImageUploader/ImageUploader';
import { menuCategories } from '@/data/sampleNews';
import styles from './write.module.css';

export default function WritePage() {
    const router = useRouter();
    const { user, userData, loading, canWrite } = useAuth();
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

    if (loading) {
        return (
            <>
                <Header />
                <main className={styles.main}>
                    <div className="container">
                        <div className={styles.loading}>Loading...</div>
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
                            <h1>Access Denied</h1>
                            <p>You need to be a Reporter or Admin to write articles.</p>
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

            const result = await createArticle(articleData, user.uid, user.email);

            if (result.success) {
                setSuccess(true);
                setTimeout(() => router.push('/admin'), 2000);
            } else {
                setError(result.error || 'Failed to create article');
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
                        <h1 className={styles.title}>Write New Article</h1>
                        <p className={styles.subtitle}>
                            Create engaging articles with images. Admins can publish after review.
                        </p>

                        {error && <div className={styles.error}>{error}</div>}
                        {success && (
                            <div className={styles.success}>
                                ✓ Article created! Redirecting to admin...
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className={styles.form}>
                            <div className={styles.inputGroup}>
                                <label>Title *</label>
                                <input
                                    type="text"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder="Enter compelling headline..."
                                    required
                                    minLength={5}
                                />
                            </div>

                            <div className={styles.row}>
                                <div className={styles.inputGroup}>
                                    <label>Category *</label>
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
                                        <label>Subcategory (Optional)</label>
                                        <select
                                            value={subcategory}
                                            onChange={(e) => setSubcategory(e.target.value)}
                                        >
                                            <option value="">-- Select --</option>
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
                                <h3 className={styles.sectionTitle}>📷 Upload Images</h3>
                                <p className={styles.sectionHint}>
                                    Upload images directly. Choose position for each image.
                                </p>

                                <ImageUploader onImageAdd={handleImageAdd} disabled={submitting} />

                                {/* Uploaded Images List */}
                                {images.length > 0 && (
                                    <div className={styles.imageList}>
                                        <h4>Uploaded Images ({images.length})</h4>
                                        {images.map((img) => (
                                            <div key={img.id} className={styles.imageItem}>
                                                <img src={img.url} alt={img.caption || 'Uploaded'} />
                                                <div className={styles.imageInfo}>
                                                    <select
                                                        value={img.position}
                                                        onChange={(e) => updateImagePosition(img.id, e.target.value)}
                                                        className={styles.positionDropdown}
                                                    >
                                                        <option value="auto">Auto</option>
                                                        <option value="hero">Hero</option>
                                                        <option value="top">Top</option>
                                                        <option value="left">Left</option>
                                                        <option value="right">Right</option>
                                                        <option value="center">Center</option>
                                                        <option value="bottom">Bottom</option>
                                                        <option value="gallery">Gallery</option>
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
                                <label>Content *</label>
                                <textarea
                                    value={content}
                                    onChange={(e) => setContent(e.target.value)}
                                    placeholder="Write your article content here...

You can write multiple paragraphs. Press Enter twice to create a new paragraph."
                                    rows={15}
                                    required
                                    minLength={50}
                                />
                            </div>

                            <button
                                type="submit"
                                className={styles.submitBtn}
                                disabled={submitting}
                            >
                                {submitting ? 'Creating...' : 'Create Article'}
                            </button>
                        </form>
                    </div>
                </div>
            </main>
        </>
    );
}
