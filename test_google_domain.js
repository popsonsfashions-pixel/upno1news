// Native fetch (Node 18+)

async function translate(text, sl, tl) {
    const url = `https://translate.google.com/translate_a/single?client=gtx&sl=${sl}&tl=${tl}&dt=t`;
    // POST body: q=...
    const body = new URLSearchParams();
    body.append('q', text);

    try {
        const res = await fetch(url, {
            method: 'POST',
            body: body,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            }
        });

        if (!res.ok) {
            console.error(`Status: ${res.status} ${res.statusText}`);
            return;
        }

        const data = await res.json();
        const translated = data[0].map(item => item[0]).join('');
        console.log(`Success! Output: ${translated}`);
    } catch (e) {
        console.error(`Error:`, e.message);
    }
}

(async () => {
    await translate("Hello world", 'en', 'hi');
})();
