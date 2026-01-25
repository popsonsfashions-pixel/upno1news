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
    console.log("--- English content with sl=hi ---");
    // Scenario: User sets source to Hindi, but text is English. GT should hopefully output English.
    await translate("This is a pure english sentence.", 'hi', 'en');

    console.log("\n--- Mixed content with sl=hi ---");
    // Scenario: Mixed sentences.
    await translate("This is english. यह हिंदी है. Back to english.", 'hi', 'en');

    console.log("\n--- 'Hinglish' with sl=hi ---");
    // Scenario: English words in Hindi grammar
    await translate("Aaj ka weather bahut cool hai", 'hi', 'en');
})();
