// Native fetch (Node 18+)

async function testApi() {
    try {
        const res = await fetch('http://localhost:3000/api/translate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                text: "Hello world",
                targetLang: "hi",
                sourceLang: "en"
            })
        });

        if (!res.ok) {
            console.error(`API Error: ${res.status} ${res.statusText}`);
            const text = await res.text();
            console.error(text);
            return;
        }

        const data = await res.json();
        console.log("API Success:", data);
    } catch (e) {
        console.error("Fetch failed:", e.message);
    }
}

testApi();
