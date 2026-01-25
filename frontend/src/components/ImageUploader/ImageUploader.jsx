"use client";

import { useState, useRef } from 'react';
import styles from './ImageUploader.module.css';

// ImgBB Free API
const IMGBB_API_KEY = 'c6040a5b60210fb0bfa945798d1c5a20';

/**
 * Image Uploader Component - Supports multiple images
 */
export default function ImageUploader({ onImageAdd, disabled = false }) {
    const [uploading, setUploading] = useState(false);
    const [uploadQueue, setUploadQueue] = useState([]);
    const [progress, setProgress] = useState(0);
    const [error, setError] = useState('');
    const [defaultPosition, setDefaultPosition] = useState('auto');
    const fileInputRef = useRef(null);

    // Handle multiple file selection
    const handleFileSelect = async (e) => {
        const files = Array.from(e.target.files || []);
        if (files.length === 0) return;

        // Validate files
        const validFiles = files.filter(file => {
            if (!file.type.startsWith('image/')) {
                setError(`${file.name} is not an image`);
                return false;
            }
            if (file.size > 32 * 1024 * 1024) {
                setError(`${file.name} is too large (max 32MB)`);
                return false;
            }
            return true;
        });

        if (validFiles.length === 0) return;

        setError('');
        setUploading(true);
        setUploadQueue(validFiles.map(f => ({ name: f.name, status: 'pending' })));

        // Upload each file
        for (let i = 0; i < validFiles.length; i++) {
            const file = validFiles[i];
            setUploadQueue(prev => prev.map((item, idx) =>
                idx === i ? { ...item, status: 'uploading' } : item
            ));
            setProgress(Math.round(((i) / validFiles.length) * 100));

            try {
                const imageUrl = await uploadToImgBB(file);

                // Add image
                onImageAdd({
                    url: imageUrl.display_url,
                    position: defaultPosition,
                    caption: '',
                    thumbnail: imageUrl.thumb?.url,
                });

                setUploadQueue(prev => prev.map((item, idx) =>
                    idx === i ? { ...item, status: 'done' } : item
                ));
            } catch (err) {
                setUploadQueue(prev => prev.map((item, idx) =>
                    idx === i ? { ...item, status: 'error', error: err.message } : item
                ));
            }
        }

        setProgress(100);
        setTimeout(() => {
            setUploading(false);
            setUploadQueue([]);
            setProgress(0);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }, 1000);
    };

    // Upload single file to ImgBB
    const uploadToImgBB = async (file) => {
        const base64 = await fileToBase64(file);

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

        return data.data;
    };

    const fileToBase64 = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result);
            reader.onerror = (error) => reject(error);
        });
    };

    // Handle drag and drop
    const handleDrop = (e) => {
        e.preventDefault();
        if (e.dataTransfer.files?.length > 0) {
            handleFileSelect({ target: { files: e.dataTransfer.files } });
        }
    };

    const handleDragOver = (e) => {
        e.preventDefault();
    };

    return (
        <div className={styles.uploader}>
            {/* Upload Area */}
            <div
                className={styles.uploadArea}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
            >
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileSelect}
                    accept="image/*"
                    multiple
                    disabled={disabled || uploading}
                    className={styles.fileInput}
                    id="image-upload"
                />
                <label htmlFor="image-upload" className={styles.uploadLabel}>
                    {uploading ? (
                        <div className={styles.uploadingState}>
                            <div className={styles.progressBar}>
                                <div className={styles.progressFill} style={{ width: `${progress}%` }}></div>
                            </div>
                            <span>Uploading {uploadQueue.filter(q => q.status === 'done').length}/{uploadQueue.length} images...</span>
                            <div className={styles.uploadQueue}>
                                {uploadQueue.map((item, i) => (
                                    <div key={i} className={`${styles.queueItem} ${styles[item.status]}`}>
                                        {item.status === 'uploading' && '⏳'}
                                        {item.status === 'done' && '✓'}
                                        {item.status === 'error' && '✗'}
                                        {item.status === 'pending' && '○'}
                                        {' '}{item.name}
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className={styles.emptyState}>
                            <span className={styles.uploadIcon}>📷</span>
                            <span className={styles.uploadText}>Click to upload or drag & drop</span>
                            <span className={styles.uploadHint}>Select multiple images • JPG, PNG, GIF, WebP • Max 32MB each</span>
                        </div>
                    )}
                </label>
            </div>

            {/* Default Position for batch uploads */}
            <div className={styles.defaultOptions}>
                <label>Default position for new images:</label>
                <select
                    value={defaultPosition}
                    onChange={(e) => setDefaultPosition(e.target.value)}
                    disabled={uploading}
                >
                    <option value="auto">Auto (Smart Placement)</option>
                    <option value="hero">Hero (Full Width Top)</option>
                    <option value="top">Top</option>
                    <option value="left">Left (Text Wrap)</option>
                    <option value="right">Right (Text Wrap)</option>
                    <option value="center">Center</option>
                    <option value="bottom">Bottom</option>
                    <option value="gallery">Gallery</option>
                </select>
            </div>

            {error && <div className={styles.error}>{error}</div>}

            <div className={styles.info}>
                <span>🆓 Free hosting via ImgBB • Select multiple images at once • Images stored permanently</span>
            </div>
        </div>
    );
}
