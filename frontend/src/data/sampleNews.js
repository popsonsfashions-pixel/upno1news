/**
 * Navigation menu data
 */

// All 75 districts of Uttar Pradesh
export const upDistricts = [
    { name: "Agra", nameHi: "आगरा" },
    { name: "Aligarh", nameHi: "अलीगढ़" },
    { name: "Ambedkar Nagar", nameHi: "अंबेडकर नगर" },
    { name: "Amethi", nameHi: "अमेठी" },
    { name: "Amroha", nameHi: "अमरोहा" },
    { name: "Auraiya", nameHi: "औरैया" },
    { name: "Ayodhya", nameHi: "अयोध्या" },
    { name: "Azamgarh", nameHi: "आज़मगढ़" },
    { name: "Baghpat", nameHi: "बागपत" },
    { name: "Bahraich", nameHi: "बहराइच" },
    { name: "Ballia", nameHi: "बलिया" },
    { name: "Balrampur", nameHi: "बलरामपुर" },
    { name: "Banda", nameHi: "बांदा" },
    { name: "Barabanki", nameHi: "बाराबंकी" },
    { name: "Bareilly", nameHi: "बरेली" },
    { name: "Basti", nameHi: "बस्ती" },
    { name: "Bhadohi", nameHi: "भदोही" },
    { name: "Bijnor", nameHi: "बिजनौर" },
    { name: "Budaun", nameHi: "बदायूं" },
    { name: "Bulandshahr", nameHi: "बुलंदशहर" },
    { name: "Chandauli", nameHi: "चंदौली" },
    { name: "Chitrakoot", nameHi: "चित्रकूट" },
    { name: "Deoria", nameHi: "देवरिया" },
    { name: "Etah", nameHi: "एटा" },
    { name: "Etawah", nameHi: "इटावा" },
    { name: "Farrukhabad", nameHi: "फर्रुखाबाद" },
    { name: "Fatehpur", nameHi: "फतेहपुर" },
    { name: "Firozabad", nameHi: "फिरोजाबाद" },
    { name: "Gautam Buddha Nagar", nameHi: "गौतम बुद्ध नगर" },
    { name: "Ghaziabad", nameHi: "गाजियाबाद" },
    { name: "Ghazipur", nameHi: "गाजीपुर" },
    { name: "Gonda", nameHi: "गोंडा" },
    { name: "Gorakhpur", nameHi: "गोरखपुर" },
    { name: "Hamirpur", nameHi: "हमीरपुर" },
    { name: "Hapur", nameHi: "हापुड़" },
    { name: "Hardoi", nameHi: "हरदोई" },
    { name: "Hathras", nameHi: "हाथरस" },
    { name: "Jalaun", nameHi: "जालौन" },
    { name: "Jaunpur", nameHi: "जौनपुर" },
    { name: "Jhansi", nameHi: "झांसी" },
    { name: "Kannauj", nameHi: "कन्नौज" },
    { name: "Kanpur Dehat", nameHi: "कानपुर देहात" },
    { name: "Kanpur Nagar", nameHi: "कानपुर नगर" },
    { name: "Kasganj", nameHi: "कासगंज" },
    { name: "Kaushambi", nameHi: "कौशाम्बी" },
    { name: "Kheri", nameHi: "लखीमपुर खीरी" },
    { name: "Kushinagar", nameHi: "कुशीनगर" },
    { name: "Lalitpur", nameHi: "लalitपुर" },
    { name: "Lucknow", nameHi: "लखनऊ" },
    { name: "Maharajganj", nameHi: "महाराजगंज" },
    { name: "Mahoba", nameHi: "महोबा" },
    { name: "Mainpuri", nameHi: "मैनपुरी" },
    { name: "Mathura", nameHi: "मथुरा" },
    { name: "Mau", nameHi: "मऊ" },
    { name: "Meerut", nameHi: "मेरठ" },
    { name: "Mirzapur", nameHi: "मिर्जापुर" },
    { name: "Moradabad", nameHi: "मुरादाबाद" },
    { name: "Muzaffarnagar", nameHi: "मुजफ्फरनगर" },
    { name: "Pilibhit", nameHi: "पीलीभीत" },
    { name: "Pratapgarh", nameHi: "प्रतापगढ़" },
    { name: "Prayagraj", nameHi: "प्रयागराज" },
    { name: "Raebareli", nameHi: "रायबरेली" },
    { name: "Rampur", nameHi: "रामपुर" },
    { name: "Saharanpur", nameHi: "सहारनपुर" },
    { name: "Sambhal", nameHi: "संभल" },
    { name: "Sant Kabir Nagar", nameHi: "संत कबीर नगर" },
    { name: "Shahjahanpur", nameHi: "शाहजहांपुर" },
    { name: "Shamli", nameHi: "शामली" },
    { name: "Shravasti", nameHi: "श्रावस्ती" },
    { name: "Siddharthnagar", nameHi: "सिद्धार्थनगर" },
    { name: "Sitapur", nameHi: "सीतापुर" },
    { name: "Sonbhadra", nameHi: "सोनभद्र" },
    { name: "Sultanpur", nameHi: "सुल्तानपुर" },
    { name: "Unnao", nameHi: "उन्नाव" },
    { name: "Varanasi", nameHi: "वाराणसी" }
];

// Main navigation categories
export const menuCategories = [
    {
        name: "Uttar Pradesh",
        nameHi: "उत्तर प्रदेश",
        href: "/uttar-pradesh",
        submenu: upDistricts.slice(0, 30).map(district => ({
            name: district.name,
            nameHi: district.nameHi,
            href: `/uttar-pradesh/${district.name.toLowerCase().replace(/\s+/g, '-')}`
        })),
        submenu2: upDistricts.slice(30).map(district => ({
            name: district.name,
            nameHi: district.nameHi,
            href: `/uttar-pradesh/${district.name.toLowerCase().replace(/\s+/g, '-')}`
        }))
    },
    {
        name: "Bollywood",
        nameHi: "बॉलीवुड",
        href: "/bollywood",
        submenu: [
            { name: "Latest News", nameHi: "ताज़ा खबर", href: "/bollywood/news" },
            { name: "Movies", nameHi: "फिल्में", href: "/bollywood/movies" },
            { name: "Celebrities", nameHi: "सेलेब्रिटी", href: "/bollywood/celebrities" },
            { name: "Reviews", nameHi: "समीक्षा", href: "/bollywood/reviews" },
            { name: "OTT", nameHi: "ओटीटी", href: "/bollywood/ott" },
            { name: "Music", nameHi: "संगीत", href: "/bollywood/music" }
        ]
    },
    {
        name: "Cricket",
        nameHi: "क्रिकेट",
        href: "/cricket",
        submenu: [
            { name: "Live Scores", nameHi: "लाइव स्कोर", href: "/cricket/live" },
            { name: "IPL 2026", nameHi: "आईपीएल 2026", href: "/cricket/ipl" },
            { name: "Team India", nameHi: "टीम इंडिया", href: "/cricket/india" },
            { name: "World Cup", nameHi: "विश्व कप", href: "/cricket/world-cup" },
            { name: "Players", nameHi: "खिलाड़ी", href: "/cricket/players" },
            { name: "Stats", nameHi: "आंकड़े", href: "/cricket/stats" }
        ]
    },
    {
        name: "Finance",
        nameHi: "वित्त",
        href: "/finance",
        submenu: [
            { name: "Stock Market", nameHi: "शेयर बाजार", href: "/finance/stocks" },
            { name: "Mutual Funds", nameHi: "म्यूचुअल फंड", href: "/finance/mutual-funds" },
            { name: "Banking", nameHi: "बैंकिंग", href: "/finance/banking" },
            { name: "Tax", nameHi: "कर", href: "/finance/tax" },
            { name: "Insurance", nameHi: "बीमा", href: "/finance/insurance" },
            { name: "Crypto", nameHi: "क्रिप्टो", href: "/finance/crypto" }
        ]
    },
    {
        name: "World",
        nameHi: "विश्व",
        href: "/world",
        submenu: [
            { name: "USA", nameHi: "अमेरिका", href: "/world/usa" },
            { name: "UK", nameHi: "ब्रिटेन", href: "/world/uk" },
            { name: "China", nameHi: "चीन", href: "/world/china" },
            { name: "Pakistan", nameHi: "पाकिस्तान", href: "/world/pakistan" },
            { name: "Middle East", nameHi: "मध्य पूर्व", href: "/world/middle-east" },
            { name: "Europe", nameHi: "यूरोप", href: "/world/europe" }
        ]
    }
];

export const trendingTopics = [
    "UP News",
    "Lucknow",
    "IPL 2026",
    "Bollywood",
    "Stock Market",
    "Weather",
    "Cricket",
    "Election"
];
