const Parser = require('rss-parser');

async function inspectFeed() {
    const parser = new Parser({
        customFields: {
            item: [
                ['media:content', 'mediaContent'],
                ['media:thumbnail', 'mediaThumbnail'],
                ['description', 'description'],
                ['content', 'content'],
                ['content:encoded', 'contentEncoded']
            ]
        }
    });
    const FEED_URL = 'https://news.google.com/rss/search?q=Bollywood&hl=hi&gl=IN&ceid=IN:hi';

    try {
        const feed = await parser.parseURL(FEED_URL);
        console.log("Total items:", feed.items.length);
        if (feed.items.length > 0) {
            console.log("First Item Structure:", JSON.stringify(feed.items[0], null, 2));
        }
    } catch (e) {
        console.error("Error:", e);
    }
}

inspectFeed();
