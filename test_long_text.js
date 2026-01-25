// Native fetch (Node 18+)

// Generate long text (approx 5000 chars)
const longText = "This is a sentence. ".repeat(300) + " नमस्ते भारत";

async function translate(text, sl, tl) {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${sl}&tl=${tl}&dt=t&q=${encodeURIComponent(text)}`;
    try {
        console.log(`URL Length: ${url.length}`);
        const res = await fetch(url);
        if (!res.ok) {
            console.error(`Status: ${res.status} ${res.statusText}`);
            return;
        }
        const data = await res.json();
        // data[0] is array of [[trans, orig], [trans, orig], ...]
        const translated = data[0].map(item => item[0]).join('');
        console.log(`Success! Output length: ${translated.length}`);
    } catch (e) {
        console.error(`Error:`, e.message);
    }
}

(async () => {
    await translate(longText, 'auto', 'en');
})();
