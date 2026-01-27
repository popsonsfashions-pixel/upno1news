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
        edit: "Edit",
        placement: "Placement",

        // Admin - Extras
        adminSubtitle: "Manage articles and homepage placement",
        accessDenied: "Access Denied",
        adminRequired: "Admin or Reporter access required.",
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

        // Edit Article
        editArticle: "Edit Article",
        updateArticle: "Update Article",
        updating: "Updating...",
        articleUpdatedSuccess: "✓ Article updated successfully!",
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
        edit: "संपादित करें",
        placement: "स्थान",

        // Admin - Extras
        adminSubtitle: "लेख और होमपेज प्लेसमेंट प्रबंधित करें",
        accessDenied: "प्रवेश अस्वीकृत",
        adminRequired: "एडमिन या रिपोर्टर एक्सेस आवश्यक है।",
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

        // NEW TRANSLATIONS - Forms & Validation
        title: "शीर्षक",
        content: "सामग्री",
        category: "श्रेणी",
        subcategory: "उपश्रेणी",
        optional: "वैकल्पिक",
        required: "आवश्यक",
        select: "चुनें",

        // Writer/Reporter Panel
        writeNewArticle: "नया लेख लिखें",
        createEngagingArticles: "रोचक लेख बनाएं। एडमिन समीक्षा के बाद प्रकाशित करेंगे।",
        enterCompellingHeadline: "आकर्षक शीर्षक दर्ज करें...",
        writeArticleContent: "अपना लेख यहाँ लिखें...\n\nआप कई पैराग्राफ लिख सकते हैं। नया पैराग्राफ बनाने के लिए दो बार Enter दबाएं।",
        uploadImages: "छवियाँ अपलोड करें",
        uploadImagesDirectly: "छवियाँ सीधे अपलोड करें। प्रत्येक छवि के लिए स्थान चुनें।",
        uploadedImages: "अपलोड की गई छवियाँ",
        creating: "बना रहे हैं...",
        articleCreatedSuccess: "✓ लेख बनाया गया! एडमिन पर रीडायरेक्ट कर रहे हैं...",

        // Access Control
        accessDeniedTitle: "प्रवेश अस्वीकृत",
        reporterAdminRequired: "लेख लिखने के लिए आपको रिपोर्टर या एडमिन होना आवश्यक है।",

        // Auth Messages
        loginFailed: "लॉगिन विफल",
        registrationFailed: "पंजीकरण विफल",
        emailPasswordRequired: "ईमेल और पासवर्ड आवश्यक हैं",
        invalidCredentials: "अमान्य प्रमाण-पत्र",
        alreadyHaveAccount: "पहले से खाता है?",
        dontHaveAccount: "खाता नहीं है?",
        loginHere: "यहाँ लॉगिन करें",
        registerHere: "यहाँ रजिस्टर करें",

        // Article Actions
        editArticle: "लेख संपादित करें",
        deleteArticle: "लेख हटाएं",
        articleDeleted: "लेख हटा दिया गया",
        confirmDeleteArticle: "क्या आप वाकई इस लेख को हटाना चाहते हैं?",
        articleNotFound: "लेख नहीं मिला",
        articleDoesNotExist: "यह लेख मौजूद नहीं है।",
        backToHome: "होम पर वापस जाएं",

        // Image Positions
        auto: "स्वचालित",
        top: "शीर्ष",
        left: "बाएं",
        right: "दाएं",
        center: "केंद्र",
        bottom: "नीचे",
        gallery: "गैलरी",
        caption: "कैप्शन",
        remove: "हटाएं",

        // Statuses
        published: "प्रकाशित",
        draft: "ड्राफ्ट",
        pending: "लंबित",

        // Profile
        myProfile: "मेरी प्रोफ़ाइल",
        settings: "सेटिंग्स",
        profile: "प्रोफ़ाइल",

        // Common Actions
        create: "बनाएं",
        update: "अपडेट करें",
        cancel: "रद्द करें",
        close: "बंद करें",
        submit: "सबमिट करें",
        edit: "संपादित करें",

        // Error Messages
        errorOccurred: "एक त्रुटि हुई",
        pleaseTryAgain: "कृपया पुनः प्रयास करें",
        loadingArticle: "लेख लोड हो रहा है...",

        // Edit Article
        editArticle: "लेख संपादित करें",
        updateArticle: "लेख अपडेट करें",
        updating: "अपडेट हो रहा है...",
        articleUpdatedSuccess: "✓ लेख सफलतापूर्वक अपडेट किया गया!",
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
