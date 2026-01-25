// Native fetch (Node 18+)

async function testSync() {
    try {
        console.log("Triggering Bollywood Sync...");
        const res = await fetch('http://localhost:3000/api/cron/bollywood');

        if (!res.ok) {
            console.error(`Sync Error: ${res.status} ${res.statusText}`);
            const text = await res.text();
            console.error(text);
            return;
        }

        const data = await res.json();
        console.log("Sync Result:", JSON.stringify(data, null, 2));

        const fs = require('fs').promises;
        await fs.writeFile('sync_log.json', JSON.stringify(data, null, 2));
    } catch (e) {
        console.error("Fetch failed:", e.message);
    }
}

testSync();
