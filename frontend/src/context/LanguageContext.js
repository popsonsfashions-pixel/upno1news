"use client";

import { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext();

// Translations
const translations = {
    en: {
        // Header
        signIn: "Sign In",
        search: "Search news, topics...",
        trending: "Trending",

        // Navigation
        uttarPradesh: "Uttar Pradesh",
        bollywood: "Bollywood",
        cricket: "Cricket",
        finance: "Finance",
        world: "World",

        // Common
        liveUpdates: "Live Updates",
        latestNews: "Latest News",
        featured: "Featured",
        breakingNews: "Breaking News",
        readMore: "Read More",
        minsAgo: "mins ago",
        hoursAgo: "hours ago",
        daysAgo: "days ago",
        justNow: "Just now",

        // Article
        publishedOn: "Published on",
        byAuthor: "By",
        share: "Share",
        save: "Save",

        // Admin
        adminPanel: "Admin Panel",
        createArticle: "Create Article",
        publish: "Publish",
        unpublish: "Unpublish",
        delete: "Delete",
        placement: "Placement",

        // Admin - Extras
        adminSubtitle: "Manage articles and homepage placement",
        accessDenied: "Access Denied",
        adminRequired: "Admin access required.",
        loading: "Loading...",
        confirmDelete: "Delete this article?",
        errorPrefix: "Error: ",
        total: "Total",
        statusPublished: "Published",
        statusDraft: "Draft",
        drafts: "Drafts",
        allArticles: "All Articles",
        noArticles: "No articles yet.",
        createFirstArticle: "Create First Article",

        // Placements Short (for badges/summary)
        hero: "Hero",
        featured: "Featured",
        trending: "Trending",
        breaking: "Breaking",
        normal: "Normal",

        // Auth
        login: "Login",
        register: "Register",
        email: "Email",
        password: "Password",
        fullName: "Full Name",
        signOut: "Sign Out",

        // Footer
        stayUpdated: "Stay Updated",
        newsletter: "Get breaking news delivered to your inbox",
        subscribe: "Subscribe",
        yourEmail: "Your email",
    },
    hi: {
        // Header
        signIn: "लॉगिन",
        search: "समाचार खोजें...",
        trending: "ट्रेंडिंग",

        // Navigation
        uttarPradesh: "उत्तर प्रदेश",
        bollywood: "बॉलीवुड",
        cricket: "क्रिकेट",
        finance: "वित्त",
        world: "विश्व",

        // Common
        liveUpdates: "लाइव अपडेट",
        latestNews: "ताज़ा खबर",
        featured: "विशेष",
        breakingNews: "ब्रेकिंग न्यूज़",
        readMore: "और पढ़ें",
        minsAgo: "मिनट पहले",
        hoursAgo: "घंटे पहले",
        daysAgo: "दिन पहले",
        justNow: "अभी",

        // Article
        publishedOn: "प्रकाशित",
        byAuthor: "द्वारा",
        share: "शेयर",
        save: "सहेजें",

        // Admin
        adminPanel: "एडमिन पैनल",
        createArticle: "लेख बनाएं",
        publish: "प्रकाशित करें",
        unpublish: "अप्रकाशित करें",
        delete: "हटाएं",
        placement: "स्थान",

        // Admin - Extras
        adminSubtitle: "लेख और होमपेज प्लेसमेंट प्रबंधित करें",
        accessDenied: "प्रवेश अस्वीकृत",
        adminRequired: "एडमिन एक्सेस आवश्यक है।",
        loading: "लोड हो रहा है...",
        confirmDelete: "क्या आप इस लेख को हटाना चाहते हैं?",
        errorPrefix: "त्रुटि: ",
        total: "कुल",
        statusPublished: "प्रकाशित",
        statusDraft: "ड्राफ्ट",
        drafts: "ड्राफ्ट",
        allArticles: "सभी लेख",
        noArticles: "कोई लेख नहीं।",
        createFirstArticle: "पहला लेख बनाएं",

        // Placements Short (for badges/summary)
        hero: "हीरो",
        featured: "विशेष",
        trending: "ट्रेंडिंग",
        breaking: "ब्रेकिंग",
        normal: "सामान्य",

        // Auth
        login: "लॉगिन",
        register: "रजिस्टर",
        email: "ईमेल",
        password: "पासवर्ड",
        fullName: "पूरा नाम",
        signOut: "लॉगआउट",

        // Footer
        stayUpdated: "अपडेट रहें",
        newsletter: "ताज़ा खबरें अपने इनबॉक्स में पाएं",
        subscribe: "सब्सक्राइब",
        yourEmail: "आपका ईमेल",
    }
};

export function LanguageProvider({ children }) {
    const [language, setLanguage] = useState('hi'); // Default Hindi

    useEffect(() => {
        // Load saved language preference
        const saved = localStorage.getItem('language');
        if (saved && (saved === 'en' || saved === 'hi')) {
            setLanguage(saved);
        }
    }, []);

    const switchLanguage = (lang) => {
        setLanguage(lang);
        localStorage.setItem('language', lang);
    };

    const t = (key) => {
        return translations[language]?.[key] || translations['en'][key] || key;
    };

    return (
        <LanguageContext.Provider value={{ language, switchLanguage, t, translations }}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useLanguage() {
    const context = useContext(LanguageContext);
    if (!context) {
        throw new Error('useLanguage must be used within LanguageProvider');
    }
    return context;
}
