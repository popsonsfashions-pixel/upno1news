// Native fetch (Node 18+)

async function translate(text, sl, tl) {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${sl}&tl=${tl}&dt=t&q=${encodeURIComponent(text)}`;
    try {
        const res = await fetch(url);
        const data = await res.json();
        const translated = data[0].map(item => item[0]).join('');
        console.log(`[sl=${sl}] Input: "${text}" => Output: "${translated}"`);
    } catch (e) {
        console.error(`Error sl=${sl}:`, e.message);
    }
}

(async () => {
    console.log("--- Mixed Script ---");
    const t1 = "ये है mera घर"; // "This is my house" (Hindi + Hinglish)
    await translate(t1, 'auto', 'en');
    await translate(t1, 'hi', 'en');

    console.log("\n--- Mostly English ---");
    const t2 = "This is my घर"; // "This is my house"
    await translate(t2, 'auto', 'en');
    await translate(t2, 'hi', 'en');

    console.log("\n--- Hinglish ---");
    const t3 = "mera naam vashu hai"; // "My name is Vashu"
    await translate(t3, 'auto', 'en'); // Won't trigger in app as !hasHindi, but checking API behavior
    await translate(t3, 'hi', 'en');
})();
