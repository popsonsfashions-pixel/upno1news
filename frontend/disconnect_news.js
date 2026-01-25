// Native fetch not needed, but we need firebase
// We can use the firebase client SDK from node if we use "type": "module" or require.
// But our project uses ES modules in src. 
// Let's make a simple script that uses the admin SDK if available? We don't have service account key file easily.
// We can use the client SDK with the config. 

const { initializeApp } = require('firebase/app');
const { getFirestore, collection, query, where, getDocs, deleteDoc, orderBy, limit } = require('firebase/firestore');

const firebaseConfig = {
    apiKey: "AIzaSyCxP2PAJHdfQyRAoESy9o6qJyp-UUB-4yw",
    authDomain: "upno1news-d584b.firebaseapp.com",
    projectId: "upno1news-d584b",
    storageBucket: "upno1news-d584b.firebasestorage.app",
    messagingSenderId: "1014752521761",
    appId: "1:1014752521761:web:cb1828b86faa30309b3d60",
    measurementId: "G-F2W2J37QHW"
};

// Polyfill XMLHttpRequest for Firebase (if needed in Node) but v9 might use fetch?
// Node 18 has fetch.
// We need to set up a node environment.
// Ideally usage of 'firebase-admin' is best for node scripts.
// But let's try strict client SDK usage.

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function deleteRecent() {
    try {
        const articlesRef = collection(db, 'articles');
        const q = query(
            articlesRef,
            where("category", "==", "Bollywood"),
            limit(100) // Clear all in one go
        );

        const snapshot = await getDocs(q);
        console.log(`Found ${snapshot.size} articles to delete.`);

        for (const doc of snapshot.docs) {
            console.log(`Deleting: ${doc.data().title}`);
            await deleteDoc(doc.ref);
        }
        console.log("Deletion Complete.");
    } catch (e) {
        console.error("Error:", e);
    }
}

deleteRecent();
