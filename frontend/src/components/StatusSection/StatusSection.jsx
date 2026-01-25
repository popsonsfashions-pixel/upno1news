"use client";

import { useState, useRef, useEffect } from 'react';
import { useStatuses, createStatus, deleteStatus } from '@/hooks/useFirestore';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import styles from './StatusSection.module.css';

// ImgBB API for image uploads
const IMGBB_API_KEY = 'c6040a5b60210fb0bfa945798d1c5a20';

// Auto-advance interval in ms (10 seconds)
const AUTO_ADVANCE_INTERVAL = 10000;

export default function StatusSection() {
    const { statuses, loading } = useStatuses();
    const { user, isAdmin } = useAuth();
    const { language } = useLanguage();
    const [activeStatusIndex, setActiveStatusIndex] = useState(null);
    const [showPostModal, setShowPostModal] = useState(false);
    const [newTitle, setNewTitle] = useState('');
    const [selectedImage, setSelectedImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [posting, setPosting] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    const fileInputRef = useRef(null);
    const progressIntervalRef = useRef(null);

    // Get active status from index
    const activeStatus = activeStatusIndex !== null ? statuses[activeStatusIndex] : null;

    // Auto-advance effect
    useEffect(() => {
        if (activeStatusIndex === null) {
            setProgress(0);
            return;
        }

        // Reset progress
        setProgress(0);

        // Progress animation (update every 100ms for smooth animation)
        const startTime = Date.now();
        progressIntervalRef.current = setInterval(() => {
            const elapsed = Date.now() - startTime;
            const newProgress = Math.min((elapsed / AUTO_ADVANCE_INTERVAL) * 100, 100);
            setProgress(newProgress);

            // Auto-advance to next status
            if (elapsed >= AUTO_ADVANCE_INTERVAL) {
                goToNextStatus();
            }
        }, 100);

        return () => {
            if (progressIntervalRef.current) {
                clearInterval(progressIntervalRef.current);
            }
        };
    }, [activeStatusIndex, statuses.length]);

    const openStatus = (index) => {
        setActiveStatusIndex(index);
    };

    const closeStatus = () => {
        setActiveStatusIndex(null);
        setProgress(0);
        if (progressIntervalRef.current) {
            clearInterval(progressIntervalRef.current);
        }
    };

    const goToNextStatus = () => {
        if (activeStatusIndex !== null && statuses.length > 0) {
            const nextIndex = (activeStatusIndex + 1) % statuses.length;
            if (nextIndex === 0) {
                // Loop completed, close the viewer
                closeStatus();
            } else {
                setActiveStatusIndex(nextIndex);
            }
        }
    };

    const goToPrevStatus = () => {
        if (activeStatusIndex !== null && statuses.length > 0) {
            const prevIndex = activeStatusIndex === 0 ? statuses.length - 1 : activeStatusIndex - 1;
            setActiveStatusIndex(prevIndex);
        }
    };

    const handleImageSelect = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            alert(language === 'hi' ? 'केवल इमेज फ़ाइल चुनें' : 'Please select an image file');
            return;
        }

        if (file.size > 32 * 1024 * 1024) {
            alert(language === 'hi' ? 'फ़ाइल बहुत बड़ी है (अधिकतम 32MB)' : 'File too large (max 32MB)');
            return;
        }

        setSelectedImage(file);

        // Create preview
        const reader = new FileReader();
        reader.onload = (e) => setImagePreview(e.target.result);
        reader.readAsDataURL(file);
    };

    const uploadToImgBB = async (file) => {
        const base64 = await new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
        });

        const formData = new FormData();
        formData.append('image', base64.split(',')[1]);
        formData.append('name', file.name);

        const response = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, {
            method: 'POST',
            body: formData,
        });

        const data = await response.json();
        if (!data.success) {
            throw new Error(data.error?.message || 'Upload failed');
        }

        return data.data.display_url;
    };

    const handlePost = async (e) => {
        e.preventDefault();
        if ((!newTitle.trim() && !selectedImage) || !user) return;

        setPosting(true);
        let imageUrl = null;

        try {
            // Upload image if selected
            if (selectedImage) {
                setUploading(true);
                imageUrl = await uploadToImgBB(selectedImage);
                setUploading(false);
            }

            const result = await createStatus(
                newTitle.trim() || (language === 'hi' ? '📷 नई तस्वीर' : '📷 New Photo'),
                user.uid,
                user.email,
                imageUrl
            );

            if (result.success) {
                setNewTitle('');
                setSelectedImage(null);
                setImagePreview(null);
                setShowPostModal(false);
            }
        } catch (err) {
            console.error('Post error:', err);
            alert(language === 'hi' ? 'पोस्ट करने में त्रुटि' : 'Error posting status');
        }

        setPosting(false);
        setUploading(false);
    };

    const removeImage = () => {
        setSelectedImage(null);
        setImagePreview(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleShare = async (status, platform) => {
        const text = status.title;
        const url = window.location.origin;
        const fullText = `${text} - ${url}`;

        const shareUrls = {
            whatsapp: `https://api.whatsapp.com/send?text=${encodeURIComponent(fullText)}`,
            facebook: `https://www.facebook.com/sharer/sharer.php?quote=${encodeURIComponent(text)}&u=${encodeURIComponent(url)}`,
            twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
            copy: null
        };

        if (platform === 'copy') {
            try {
                await navigator.clipboard.writeText(fullText);
                alert(language === 'hi' ? 'कॉपी हो गया!' : 'Copied to clipboard!');
            } catch (err) {
                console.error('Copy failed:', err);
            }
        } else if (shareUrls[platform]) {
            window.open(shareUrls[platform], '_blank', 'width=600,height=400');
        }
    };

    const handleDelete = async (statusId) => {
        if (confirm(language === 'hi' ? 'क्या आप इसे हटाना चाहते हैं?' : 'Delete this status?')) {
            await deleteStatus(statusId);
            setActiveStatus(null);
        }
    };

    const formatTimeAgo = (date) => {
        const now = new Date();
        const seconds = Math.floor((now - date) / 1000);
        if (seconds < 60) return language === 'hi' ? 'अभी' : 'Just now';
        if (seconds < 3600) return `${Math.floor(seconds / 60)} ${language === 'hi' ? 'मि.' : 'm ago'}`;
        if (seconds < 86400) return `${Math.floor(seconds / 3600)} ${language === 'hi' ? 'घं.' : 'h ago'}`;
        return `${Math.floor(seconds / 86400)} ${language === 'hi' ? 'दिन' : 'd ago'}`;
    };

    const getGradient = (index) => {
        const gradients = [
            'linear-gradient(135deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)',
            'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
            'linear-gradient(135deg, #fc4a1a 0%, #f7b733 100%)',
            'linear-gradient(135deg, #6a11cb 0%, #2575fc 100%)',
        ];
        return gradients[index % gradients.length];
    };

    if (loading && statuses.length === 0 && !isAdmin()) {
        return null;
    }

    return (
        <>
            <section className={styles.statusSection}>
                <div className={styles.storiesContainer}>
                    {/* Admin Add Story Button */}
                    {isAdmin() && (
                        <button
                            className={styles.addStory}
                            onClick={() => setShowPostModal(true)}
                        >
                            <div className={styles.addStoryCircle}>
                                <span className={styles.plusIcon}>+</span>
                            </div>
                            <span className={styles.storyLabel}>
                                {language === 'hi' ? 'जोड़ें' : 'Add'}
                            </span>
                        </button>
                    )}

                    {/* Story Circles */}
                    {statuses.map((status, index) => (
                        <button
                            key={status.id}
                            className={styles.storyItem}
                            onClick={() => openStatus(index)}
                        >
                            <div
                                className={styles.storyRing}
                                style={{ background: getGradient(index) }}
                            >
                                <div className={styles.storyAvatar}>
                                    {status.imageUrl ? (
                                        <img src={status.imageUrl} alt="" className={styles.storyThumb} />
                                    ) : (
                                        <span className={styles.storyIcon}>📰</span>
                                    )}
                                </div>
                            </div>
                            <span className={styles.storyLabel}>
                                {formatTimeAgo(status.created_at)}
                            </span>
                        </button>
                    ))}

                    {statuses.length === 0 && !isAdmin() && (
                        <p className={styles.empty}>
                            {language === 'hi' ? 'कोई स्टेटस नहीं' : 'No status updates'}
                        </p>
                    )}
                </div>
            </section>

            {/* Post Modal */}
            {showPostModal && (
                <div className={styles.modalOverlay} onClick={() => setShowPostModal(false)}>
                    <div className={styles.modal} onClick={e => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <h3>{language === 'hi' ? 'नया स्टेटस' : 'New Status'}</h3>
                            <button onClick={() => setShowPostModal(false)} className={styles.closeBtn}>×</button>
                        </div>
                        <form onSubmit={handlePost} className={styles.postForm}>
                            {/* Image Upload Area */}
                            <div className={styles.imageUploadArea}>
                                {imagePreview ? (
                                    <div className={styles.imagePreviewContainer}>
                                        <img src={imagePreview} alt="Preview" className={styles.imagePreview} />
                                        <button type="button" onClick={removeImage} className={styles.removeImageBtn}>×</button>
                                    </div>
                                ) : (
                                    <label className={styles.imageUploadLabel}>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleImageSelect}
                                            ref={fileInputRef}
                                            className={styles.hiddenInput}
                                        />
                                        <div className={styles.uploadPrompt}>
                                            <span className={styles.uploadIcon}>📷</span>
                                            <span>{language === 'hi' ? 'फोटो जोड़ें' : 'Add Photo'}</span>
                                        </div>
                                    </label>
                                )}
                            </div>

                            <textarea
                                value={newTitle}
                                onChange={(e) => setNewTitle(e.target.value)}
                                placeholder={language === 'hi' ? 'कैप्शन लिखें (वैकल्पिक)...' : 'Write a caption (optional)...'}
                                className={styles.textarea}
                                maxLength={280}
                            />
                            <div className={styles.modalActions}>
                                <span className={styles.charCount}>{newTitle.length}/280</span>
                                <button
                                    type="submit"
                                    className={styles.postBtn}
                                    disabled={(!newTitle.trim() && !selectedImage) || posting}
                                >
                                    {uploading ? (language === 'hi' ? 'अपलोड हो रहा...' : 'Uploading...') :
                                        posting ? '...' : (language === 'hi' ? 'पोस्ट करें' : 'Post')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* View Status Modal */}
            {activeStatus && (
                <div className={styles.statusOverlay} onClick={closeStatus}>
                    <div className={styles.statusViewer} onClick={e => e.stopPropagation()}>
                        {/* Progress Bar */}
                        <div className={styles.progressContainer}>
                            {statuses.map((_, idx) => (
                                <div key={idx} className={styles.progressSegment}>
                                    <div
                                        className={styles.progressFill}
                                        style={{
                                            width: idx < activeStatusIndex ? '100%' :
                                                idx === activeStatusIndex ? `${progress}%` : '0%'
                                        }}
                                    />
                                </div>
                            ))}
                        </div>

                        <div className={styles.statusHeader}>
                            <div className={styles.statusInfo}>
                                <div className={styles.statusAvatarSmall}>📰</div>
                                <div>
                                    <span className={styles.statusAuthor}>UP News No.1</span>
                                    <span className={styles.statusTime}>{formatTimeAgo(activeStatus.created_at)}</span>
                                </div>
                            </div>
                            <button onClick={closeStatus} className={styles.closeBtn}>×</button>
                        </div>

                        {/* Navigation Areas */}
                        <div className={styles.navAreas}>
                            <div className={styles.navLeft} onClick={goToPrevStatus} />
                            <div className={styles.navRight} onClick={goToNextStatus} />
                        </div>

                        {/* Navigation Arrows */}
                        {activeStatusIndex > 0 && (
                            <button className={styles.navArrowLeft} onClick={goToPrevStatus}>
                                ‹
                            </button>
                        )}
                        {activeStatusIndex < statuses.length - 1 && (
                            <button className={styles.navArrowRight} onClick={goToNextStatus}>
                                ›
                            </button>
                        )}

                        <div
                            className={styles.statusContent}
                            style={activeStatus.imageUrl ? { padding: 0, background: '#000' } : {}}
                        >
                            {activeStatus.imageUrl ? (
                                <img src={activeStatus.imageUrl} alt="" className={styles.statusImage} />
                            ) : null}
                            {activeStatus.title && (
                                <p className={`${styles.statusText} ${activeStatus.imageUrl ? styles.statusTextOverlay : ''}`}>
                                    {activeStatus.title}
                                </p>
                            )}
                        </div>

                        <div className={styles.statusActions}>
                            <div className={styles.shareButtons}>
                                <button onClick={() => handleShare(activeStatus, 'whatsapp')} className={styles.shareWhatsapp}>
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                                    </svg>
                                </button>
                                <button onClick={() => handleShare(activeStatus, 'facebook')} className={styles.shareFacebook}>
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                                    </svg>
                                </button>
                                <button onClick={() => handleShare(activeStatus, 'twitter')} className={styles.shareTwitter}>
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                                    </svg>
                                </button>
                                <button onClick={() => handleShare(activeStatus, 'copy')} className={styles.shareCopy}>
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                                    </svg>
                                </button>
                            </div>

                            <div className={styles.actionButtons}>
                                {/* Read Article Link for linked statuses */}
                                {activeStatus.articleId && (
                                    <a
                                        href={`/article/${activeStatus.articleId}`}
                                        className={styles.readArticleBtn}
                                        onClick={() => setActiveStatus(null)}
                                    >
                                        📖 {language === 'hi' ? 'पूरा पढ़ें' : 'Read Article'}
                                    </a>
                                )}

                                {isAdmin() && (
                                    <button
                                        onClick={() => handleDelete(activeStatus.id)}
                                        className={styles.deleteBtn}
                                    >
                                        {language === 'hi' ? 'हटाएं' : 'Delete'}
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
