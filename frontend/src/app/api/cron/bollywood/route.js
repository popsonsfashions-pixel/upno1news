import { NextResponse } from 'next/server';
import Parser from 'rss-parser';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, addDoc, updateDoc, Timestamp } from 'firebase/firestore';
import { JSDOM } from 'jsdom';
import { Readability } from '@mozilla/readability';

export async function GET() {
    try {
        const parser = new Parser();
        const FEED_URL = 'https://news.google.com/rss/headlines/section/topic/ENTERTAINMENT.HI_IN?hl=hi&gl=IN&ceid=IN:hi';

        const feed = await parser.parseURL(FEED_URL);
        const articlesRef = collection(db, 'articles');
        let addedCount = 0;

        const logs = [];
        const log = (msg) => { console.log(msg); logs.push(msg); };

        const itemsToProcess = feed.items.slice(0, 15); // Check 15 items in depth

        for (const item of itemsToProcess) {
            const q = query(articlesRef, where("title", "==", item.title));
            const querySnapshot = await getDocs(q);

            if (!querySnapshot.empty) {
                continue;
            }

            log(`Processing: ${item.title}`);

            // Decode Redirect (Robust Regex)
            let realUrl = item.link;
            try {
                const decoded = await decodeGoogleNewsUrl(item.link);
                if (decoded && decoded !== item.link) {
                    realUrl = decoded;
                    log(`Decoded: ${realUrl}`);
                }
            } catch (e) {
                log(`Decode Failed: ${e.message}`);
            }

            // Scrape
            let articleData = null;
            try {
                articleData = await fetchFullArticle(realUrl);
            } catch (err) {
                log(`Scrape Error (${realUrl}): ${err.message}`);
            }

            // Allow shorter content (500 chars) if it's substantial enough logic-wise.
            const minLength = 500;

            if (!articleData || !articleData.textContent || articleData.textContent.length < minLength) {
                log(`Skipping: Too short (${articleData?.textContent?.length || 0} chars)`);
                continue;
            }

            // Image
            let imageUrl = articleData.image;
            if (!imageUrl) {
                imageUrl = await fetchOgImage(realUrl);
            }
            if (!imageUrl) {
                imageUrl = "https://placehold.co/600x400?text=Bollywood+News";
            }

            const newArticle = {
                title: item.title,
                content: articleData.content,
                fullText: articleData.textContent,
                original_link: realUrl,
                source: articleData.siteName || 'Google News (Bollywood)',
                category: 'Bollywood',
                placements: ['normal'],
                is_published: true,
                created_at: Timestamp.now(),
                author_email: 'bot@ukno1news.com',
                images: [{
                    url: imageUrl,
                    position: 'featured',
                    caption: item.title
                }]
            };

            await addDoc(articlesRef, newArticle);
            addedCount++;
        }

        return NextResponse.json({
            success: true,
            message: `Synced ${addedCount} articles`,
            logs: logs
        });

    } catch (error) {
        console.error('Sync Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

async function decodeGoogleNewsUrl(googleUrl) {
    try {
        const res = await fetch(googleUrl, {
            redirect: 'follow',
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36' }
        });

        if (res.url && !res.url.includes('news.google.com') && !res.url.includes('consent.google.com')) {
            return res.url;
        }

        const text = await res.text();
        const urlRegex = /(https?:\/\/[^"'\s<>\\]+)/g;
        const matches = text.match(urlRegex) || [];

        for (const url of matches) {
            if (!url.includes('google.com') && !url.includes('gstatic.com') && !url.includes('w3.org') && !url.includes('schema.org')) {
                return url; // First external URL
            }
        }
        return googleUrl;
    } catch (e) {
        return googleUrl;
    }
}

async function fetchFullArticle(url) {
    try {
        const res = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
            },
            redirect: 'follow'
        });

        if (!res.ok) return null;
        const html = await res.text();
        const doc = new JSDOM(html, { url });
        const reader = new Readability(doc.window.document);
        return reader.parse();
    } catch (e) {
        throw e;
    }
}

async function fetchOgImage(url) {
    try {
        const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36' } });
        if (!res.ok) return null;
        const html = await res.text();
        const match = html.match(/<meta\s+property=["']og:image["']\s+content=["']([^"']+)["']/i);
        return (match && match[1]) ? match[1] : null;
    } catch { return null; }
}
