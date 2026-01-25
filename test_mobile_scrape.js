// Native fetch (Node 18+)
const fs = require('fs');

async function translate(text, sl, tl) {
    const url = `https://translate.google.com/m?sl=${sl}&tl=${tl}&q=${encodeURIComponent(text)}`;
    try {
        const res = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1'
            }
        });
        if (!res.ok) {
            console.error(`Status: ${res.status} ${res.statusText}`);
            return;
        }
        const html = await res.text();
        console.log(`Length: ${html.length}`);
        fs.writeFileSync('scrape_debug.html', html);
        console.log("Saved to scrape_debug.html");
    } catch (e) {
        console.error(`Error:`, e.message);
    }
}

(async () => {
    await translate("Hello", 'en', 'hi');
})();
