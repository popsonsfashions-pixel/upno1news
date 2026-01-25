// Native fetch (Node 18+)

async function translate(text, sl, tl) {
    // Note: clients5 uses a different format, usually for single sentences, but let's try.
    // clients5.google.com/translate_a/t?client=dict-chrome-ex&sl=en&tl=hi&dt=t&q=...
    const url = `https://clients5.google.com/translate_a/t?client=dict-chrome-ex&sl=${sl}&tl=${tl}&dt=t&q=${encodeURIComponent(text)}`;

    try {
        const res = await fetch(url);

        if (!res.ok) {
            console.error(`Status: ${res.status} ${res.statusText}`);
            return;
        }

        const data = await res.json();
        // clients5 returns array of strings or array of arrays? 
        // usually ["Translated text"]
        console.log(`Success! Data:`, JSON.stringify(data));
    } catch (e) {
        console.error(`Error:`, e.message);
    }
}

(async () => {
    await translate("Hello world", 'en', 'hi');
})();
