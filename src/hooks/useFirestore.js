/**
 * Firestore hooks for real-time data
 */
import { useState, useEffect } from 'react';
import {
    collection,
    query,
    where,
    orderBy,
    onSnapshot,
    doc,
    addDoc,
    updateDoc,
    deleteDoc,
    serverTimestamp,
    getDocs,
    limit
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

/**
 * Hook to get real-time articles
 */
export function useArticles({ publishedOnly = true, authorId = null, category = null, subcategory = null, maxResults = 25 } = {}) {
    const [articles, setArticles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        try {
            const articlesRef = collection(db, 'articles');

            // Build constraints
            const constraints = [];

            if (publishedOnly) {
                constraints.push(where('is_published', '==', true));
            }

            if (authorId) {
                constraints.push(where('author_id', '==', authorId));
            }

            if (category) {
                constraints.push(where('category', '==', category));
            }

            if (subcategory) {
                constraints.push(where('subcategory', '==', subcategory));
            }

            // Add limit to improve performance
            if (maxResults) {
                constraints.push(limit(maxResults));
            }

            // Create query
            const q = query(articlesRef, ...constraints);

            const unsubscribe = onSnapshot(q,
                (snapshot) => {
                    const articlesData = snapshot.docs.map(doc => ({
                        id: doc.id,
                        ...doc.data(),
                        created_at: doc.data().created_at?.toDate?.() || new Date(),
                        updated_at: doc.data().updated_at?.toDate?.() || new Date(),
                    }));

                    // Sort by created_at client-side to avoid index issues
                    articlesData.sort((a, b) => b.created_at - a.created_at);

                    setArticles(articlesData);
                    setLoading(false);
                    setError(null);
                },
                (err) => {
                    console.error('Firestore error:', err);
                    setError(err.message);
                    setLoading(false);
                }
            );

            return () => unsubscribe();
        } catch (err) {
            console.error('Setup error:', err);
            setError(err.message);
            setLoading(false);
        }
    }, [publishedOnly, authorId, maxResults]);

    return { articles, loading, error };
}

/**
 * Hook to get a single article
 */
export function useArticle(articleId) {
    const [article, setArticle] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!articleId) {
            setLoading(false);
            return;
        }

        const unsubscribe = onSnapshot(
            doc(db, 'articles', articleId),
            (doc) => {
                if (doc.exists()) {
                    setArticle({
                        id: doc.id,
                        ...doc.data(),
                        created_at: doc.data().created_at?.toDate?.() || new Date(),
                        updated_at: doc.data().updated_at?.toDate?.() || new Date(),
                    });
                } else {
                    setArticle(null);
                }
                setLoading(false);
            },
            (err) => {
                console.error('Error fetching article:', err);
                setError(err.message);
                setLoading(false);
            }
        );

        return () => unsubscribe();
    }, [articleId]);

    return { article, loading, error };
}

/**
 * Create a new article
 */
export async function createArticle(data, userId, userEmail) {
    try {
        const docRef = await addDoc(collection(db, 'articles'), {
            title: data.title,
            content: data.content,
            category: data.category || 'News',
            subcategory: data.subcategory || null,
            images: data.images || [],
            is_published: false,
            author_id: userId,
            author_email: userEmail,
            created_at: serverTimestamp(),
            updated_at: serverTimestamp(),
        });
        // Article created successfully
        return { success: true, articleId: docRef.id };
    } catch (error) {
        console.error('Error creating article:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Update an article
 */
export async function updateArticle(articleId, data) {
    try {
        await updateDoc(doc(db, 'articles', articleId), {
            ...data,
            updated_at: serverTimestamp(),
        });
        return { success: true };
    } catch (error) {
        console.error('Error updating article:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Delete an article
 */
export async function deleteArticle(articleId) {
    try {
        await deleteDoc(doc(db, 'articles', articleId));
        return { success: true };
    } catch (error) {
        console.error('Error deleting article:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Publish an article
 */
export async function publishArticle(articleId) {
    return updateArticle(articleId, { is_published: true });
}

/**
 * Unpublish an article
 */
export async function unpublishArticle(articleId) {
    return updateArticle(articleId, { is_published: false });
}

/**
 * Hook to get real-time advertisements
 */
export function useAds({ activeOnly = false } = {}) {
    const [ads, setAds] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        try {
            const adsRef = collection(db, 'ads');
            const constraints = [];

            if (activeOnly) {
                constraints.push(where('active', '==', true));
            }

            // Limit ads for performance
            constraints.push(limit(10));

            const q = query(adsRef, ...constraints);

            const unsubscribe = onSnapshot(q,
                (snapshot) => {
                    const adsData = snapshot.docs.map(doc => ({
                        id: doc.id,
                        ...doc.data(),
                        created_at: doc.data().created_at?.toDate?.() || new Date(),
                    }));

                    setAds(adsData);
                    setLoading(false);
                },
                (err) => {
                    console.error('Firestore ads error:', err);
                    setError(err.message);
                    setLoading(false);
                }
            );

            return () => unsubscribe();
        } catch (err) {
            console.error('Ads setup error:', err);
            setError(err.message);
            setLoading(false);
        }
    }, [activeOnly]);

    return { ads, loading, error };
}

/**
 * Hook to get a single ad
 */
export function useAd(adId) {
    const [ad, setAd] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!adId) {
            setLoading(false);
            return;
        }

        const unsubscribe = onSnapshot(
            doc(db, 'ads', adId),
            (doc) => {
                if (doc.exists()) {
                    setAd({ id: doc.id, ...doc.data() });
                } else {
                    setAd(null);
                }
                setLoading(false);
            },
            (err) => {
                setError(err.message);
                setLoading(false);
            }
        );

        return () => unsubscribe();
    }, [adId]);

    return { ad, loading, error };
}

/**
 * Create a new advertisement
 */
export async function createAd(data) {
    try {
        const docRef = await addDoc(collection(db, 'ads'), {
            ...data,
            active: data.active ?? true,
            created_at: serverTimestamp(),
            updated_at: serverTimestamp(),
        });
        return { success: true, id: docRef.id };
    } catch (error) {
        console.error('Error creating ad:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Update an advertisement
 */
export async function updateAd(adId, data) {
    try {
        await updateDoc(doc(db, 'ads', adId), {
            ...data,
            updated_at: serverTimestamp(),
        });
        return { success: true };
    } catch (error) {
        console.error('Error updating ad:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Delete an advertisement
 */
export async function deleteAd(adId) {
    try {
        await deleteDoc(doc(db, 'ads', adId));
        return { success: true };
    } catch (error) {
        console.error('Error deleting ad:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Hook to get real-time statuses
 */
export function useStatuses() {
    const [statuses, setStatuses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        try {
            const statusesRef = collection(db, 'statuses');
            const q = query(statusesRef, limit(15));

            const unsubscribe = onSnapshot(q,
                (snapshot) => {
                    const statusesData = snapshot.docs.map(doc => ({
                        id: doc.id,
                        ...doc.data(),
                        created_at: doc.data().created_at?.toDate?.() || new Date(),
                    }));

                    // Sort by created_at (newest first)
                    statusesData.sort((a, b) => b.created_at - a.created_at);

                    setStatuses(statusesData);
                    setLoading(false);
                },
                (err) => {
                    console.error('Firestore statuses error:', err);
                    setError(err.message);
                    setLoading(false);
                }
            );

            return () => unsubscribe();
        } catch (err) {
            console.error('Statuses setup error:', err);
            setError(err.message);
            setLoading(false);
        }
    }, []);

    return { statuses, loading, error };
}

/**
 * Create a new status
 * @param {string} title - Status text
 * @param {string} userId - Author user ID
 * @param {string} userEmail - Author email
 * @param {string|null} imageUrl - Optional image URL
 * @param {Object|null} articleData - Optional linked article { id, title, image, category }
 */
export async function createStatus(title, userId, userEmail, imageUrl = null, articleData = null) {
    try {
        const statusData = {
            title,
            author_id: userId,
            author_email: userEmail,
            created_at: serverTimestamp(),
        };

        if (imageUrl) {
            statusData.imageUrl = imageUrl;
        }

        // Link to article if provided
        if (articleData) {
            statusData.articleId = articleData.id;
            statusData.articleTitle = articleData.title;
            statusData.articleImage = articleData.image || null;
            statusData.articleCategory = articleData.category || 'News';
        }

        const docRef = await addDoc(collection(db, 'statuses'), statusData);
        return { success: true, id: docRef.id };
    } catch (error) {
        console.error('Error creating status:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Delete a status
 */
export async function deleteStatus(statusId) {
    try {
        await deleteDoc(doc(db, 'statuses', statusId));
        return { success: true };
    } catch (error) {
        console.error('Error deleting status:', error);
        return { success: false, error: error.message };
    }
}
