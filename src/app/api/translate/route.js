import { NextResponse } from 'next/server';

const clients = ['gtx', 'dict-chrome-ex'];

export async function POST(request) {
    try {
        const { text, targetLang, sourceLang = 'auto' } = await request.json();

        if (!text) {
            return NextResponse.json({ error: 'Text is required' }, { status: 400 });
        }

        let lastError = null;

        for (const client of clients) {
            try {
                const url = `https://translate.googleapis.com/translate_a/single?client=${client}&sl=${sourceLang}&tl=${targetLang}&dt=t`;

                // console.log(`[Translate API] Trying client=${client}...`);

                const body = new URLSearchParams();
                body.append('q', text);

                const response = await fetch(url, {
                    method: 'POST',
                    body: body,
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                        // Randomize User-Agent slightly or use a standard one
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
                    }
                });

                if (!response.ok) {
                    throw new Error(`Status ${response.status}`);
                }

                const data = await response.json();
                const translatedText = data[0].map(item => item[0]).join('');

                // console.log(`[Translate API] Success with ${client}`);
                return NextResponse.json({ translatedText });

            } catch (error) {
                console.error(`[Translate API] Error with ${client}:`, error.message);
                lastError = error;
                // Continue to next client
            }
        }

        // Fallback to Mobile Scraping
        console.log(`[Translate API] Clients failed, trying scraping fallback...`);
        const scrapedText = await scrapeGoogleTranslate(text, sourceLang, targetLang);
        if (scrapedText) {
            console.log(`[Translate API] Scrape Success: ${scrapedText.substring(0, 50)}...`);
            return NextResponse.json({ translatedText: scrapedText });
        }

        return NextResponse.json({ error: 'Translation failed after retries' }, { status: 500 });

    } catch (error) {
        console.error('Translation API error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

async function scrapeGoogleTranslate(text, sl, tl) {
    try {
        const url = `https://translate.google.com/m?sl=${sl}&tl=${tl}&q=${encodeURIComponent(text)}`;
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1'
            }
        });

        if (!response.ok) return null;

        const html = await response.text();
        const regex = /<div class="result-container">(.*?)<\/div>/;
        const match = html.match(regex);

        if (match && match[1]) {
            return match[1];
        }
        return null;
    } catch (e) {
        console.error("Scrape error:", e);
        return null;
    }
}
