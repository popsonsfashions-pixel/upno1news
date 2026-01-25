// Native fetch (Node 18+)

async function translate(text, sl, tl) {
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${sl}|${tl}`;

    try {
        const res = await fetch(url);
        const data = await res.json();
        console.log(`Input: "${text}" => Output: "${data.responseData.translatedText}"`);
        console.log("Match quality:", data.responseData.match);
    } catch (e) {
        console.error(`Error:`, e.message);
    }
}

(async () => {
    await translate("The quick brown fox jumps over the lazy dog", 'en', 'hi');
})();
