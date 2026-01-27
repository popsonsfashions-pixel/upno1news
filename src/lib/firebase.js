/**
 * Firebase configuration for the frontend
 * Project: upno1news-d584b
 */
import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyCxP2PAJHdfQyRAoESy9o6qJyp-UUB-4yw",
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "upno1news-d584b.firebaseapp.com",
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "upno1news-d584b",
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "upno1news-d584b.firebasestorage.app",
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "1014752521761",
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:1014752521761:web:cb1828b86faa30309b3d60",
    measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "G-F2W2J37QHW"
};

// Initialize Firebase (prevent multiple initializations in Next.js)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

// Firebase Auth instance
export const auth = getAuth(app);

// Firestore instance
export const db = getFirestore(app);

// Storage instance
export const storage = getStorage(app);

export default app;
