import { auth } from './firebase';

// Helper to get base URL (handles SSR on Vercel)
const getBaseUrl = () => {
    // If we are on the client (browser), return the relative path or configured URL
    if (typeof window !== 'undefined') {
        return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    }

    // If we are on the server (SSR) in Vercel
    if (process.env.VERCEL_URL) {
        // NEXT_PUBLIC_API_URL is likely "/api", so we prepend the Vercel domain
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || '/api';
        // Handle case where API_URL is already absolute
        if (apiUrl.startsWith('http')) return apiUrl;

        return `https://${process.env.VERCEL_URL}${apiUrl}`;
    }

    // Default fallback (local server)
    return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
};

const API_BASE_URL = getBaseUrl();

// Helper to get current user token
const getAuthToken = async () => {
    const user = auth.currentUser;
    if (user) {
        return await user.getIdToken();
    }
    return null;
};

// Generic fetch wrapper
const apiRequest = async (endpoint, options = {}) => {
    const token = await getAuthToken();

    const headers = {
        'Content-Type': 'application/json',
        ...options.headers,
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers,
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || 'API request failed');
    }

    return await response.json();
};

export const api = {
    // 2FA Endpoints
    setup2FA: () => apiRequest('/auth/2fa/setup', { method: 'POST' }),

    enable2FA: (code) => apiRequest('/auth/2fa/enable', {
        method: 'POST',
        body: JSON.stringify({ code })
    }),

    verify2FA: (code) => apiRequest('/auth/2fa/verify', {
        method: 'POST',
        body: JSON.stringify({ code })
    }),

    // Articles
    getArticles: () => apiRequest('/articles'),
    searchArticles: (query) => apiRequest(`/articles?q=${encodeURIComponent(query)}`),
};
