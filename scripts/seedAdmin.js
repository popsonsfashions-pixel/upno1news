/**
 * Seed script to create demo admin account
 * Run this in the browser console at http://localhost:3000
 * Or use: node --experimental-modules scripts/seedAdmin.mjs
 */

// Copy and paste this in the browser console at http://localhost:3000:

/*
// BROWSER CONSOLE VERSION - Copy everything below:

import { createUserWithEmailAndPassword, updateProfile } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
import { doc, setDoc, serverTimestamp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

// This uses your app's already-initialized Firebase
const auth = window.__FIREBASE_AUTH__;
const db = window.__FIREBASE_DB__;

async function createAdmin() {
  const email = 'admin@timesnow.com';
  const password = 'admin123456';
  const fullName = 'Admin User';
  
  const { user } = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(user, { displayName: fullName });
  await setDoc(doc(db, 'users', user.uid), {
    email,
    full_name: fullName,
    role: 'admin',
    is_active: true,
    created_at: serverTimestamp()
  });
  
  console.log('✅ Admin account created!', user.uid);
}

createAdmin();
*/

// ============================================
// MANUAL STEPS (Recommended):
// ============================================
// 
// 1. Go to http://localhost:3000
// 2. Click "Sign In" button in the header
// 3. Click "Sign up" link
// 4. Enter:
//    - Full Name: Admin User
//    - Email: admin@timesnow.com
//    - Password: admin123456
//    - Account Type: Admin
// 5. Click "Create Account"
//
// ============================================

console.log(`
╔════════════════════════════════════════════════════════════╗
║                  DEMO ADMIN ACCOUNT                         ║
╠════════════════════════════════════════════════════════════╣
║  Email:    admin@timesnow.com                               ║
║  Password: admin123456                                      ║
║  Role:     Admin                                            ║
╠════════════════════════════════════════════════════════════╣
║  Create via UI:                                             ║
║  1. Go to http://localhost:3000                             ║
║  2. Click "Sign In" → "Sign up"                             ║
║  3. Fill form with above details                            ║
║  4. Select "Admin" role                                     ║
║  5. Click "Create Account"                                  ║
╚════════════════════════════════════════════════════════════╝
`);
