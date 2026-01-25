// Native fetch (Node 18+)

// Generate long text
const longText = "This is a sentence. ".repeat(100);

async function translatePost(text, sl, tl) {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${sl}&tl=${tl}&dt=t`;
    // POST body: q=...
    const body = new URLSearchParams();
    body.append('q', text);

    try {
        const res = await fetch(url, {
            method: 'POST',
            body: body,
            // Headers usually strictly needed for URL encoded forms
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });

        if (!res.ok) {
            console.error(`Status: ${res.status} ${res.statusText}`);
            const txt = await res.text();
            console.error(txt);
            return;
        }

        const data = await res.json();
        const translated = data[0].map(item => item[0]).join('');
        console.log(`Success! POST worked.`);
    } catch (e) {
        console.error(`Error:`, e.message);
    }
}

(async () => {
    await translatePost(longText, 'auto', 'en');
})();
