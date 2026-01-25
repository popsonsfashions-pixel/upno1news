// Native fetch (Node 18+)

async function translate(text, sl, tl) {
    const url = `https://translate.googleapis.com/translate_a/single?client=webapp&sl=${sl}&tl=${tl}&dt=t&q=${encodeURIComponent(text)}`;
    try {
        const res = await fetch(url);
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
