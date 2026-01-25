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
    const FEED_URL = 'https://news.google.com/rss/headlines/section/topic/ENTERTAINMENT.HI_IN?hl=hi&gl=IN&ceid=IN:hi';

    try {
        const feed = await parser.parseURL(FEED_URL);
        console.log("Total items:", feed.items.length);
        if (feed.items.length > 0) {
            const item = feed.items[0];
            console.log("Keys:", Object.keys(item));
            console.log("Description:", item.description);
            console.log("Content:", item.content);
            console.log("Media Content:", item.mediaContent);
            console.log("Enclosure:", item.enclosure);
        }
    } catch (e) {
        console.error("Error:", e);
    }
}

inspectFeed();
