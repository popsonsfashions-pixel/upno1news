"use client";

import { createContext, useContext, useEffect, useState } from 'react';
import {
    onAuthStateChanged,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut as firebaseSignOut,
    updateProfile
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { api } from '@/lib/api';

// Auth context
const AuthContext = createContext({});

// User roles
export const ROLES = {
    ADMIN: 'admin',
    REPORTER: 'reporter',
    READER: 'reader'
};

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [is2FAVerified, setIs2FAVerified] = useState(false);

    // Listen to auth state changes
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            if (firebaseUser) {
                setUser(firebaseUser);

                // Fetch additional user data from Firestore
                try {
                    const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
                    if (userDoc.exists()) {
                        const data = userDoc.data();
                        setUserData(data);

                        // Check 2FA status on initial load
                        if (data.two_factor_enabled && (data.role === ROLES.ADMIN || data.role === ROLES.REPORTER)) {
                            // On page refresh, we might need to re-verify or persist the verification state.
                            // For simplicity, we'll require re-verification or assume false initially.
                            // To persist, we'd need a cookie or localStorage.
                            // Let's assume re-verification is safer for now.
                            setIs2FAVerified(false);
                        } else {
                            setIs2FAVerified(true);
                        }
                    }
                } catch (error) {
                    console.error('Error fetching user data:', error);
                }
            } else {
                setUser(null);
                setUserData(null);
                setIs2FAVerified(false);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    // Sign up with email and password
    const signUp = async (email, password, fullName, role = ROLES.READER) => {
        try {
            const { user: firebaseUser } = await createUserWithEmailAndPassword(auth, email, password);

            // Update display name
            await updateProfile(firebaseUser, { displayName: fullName });

            // Create user document in Firestore
            await setDoc(doc(db, 'users', firebaseUser.uid), {
                email,
                full_name: fullName,
                role,
                is_active: true,
                two_factor_enabled: false,
                created_at: serverTimestamp()
            });

            setUserData({ email, full_name: fullName, role, is_active: true, two_factor_enabled: false });
            setIs2FAVerified(true);

            return { success: true, user: firebaseUser };
        } catch (error) {
            console.error('Sign up error:', error);
            return { success: false, error: error.message };
        }
    };

    const verify2FA = async (code) => {
        try {
            const result = await api.verify2FA(code);
            // Backend now returns a new access token after successful 2FA verification
            if (result.valid && result.access_token) {
                // Store the new token in the user's Firebase token for consistency
                // Or handle token storage as per your app's architecture
                setIs2FAVerified(true);
            }
            return { success: true };
        } catch (error) {
            console.error('2FA verification error:', error);
            return { success: false, error: error.message };
        }
    };

    // Sign in with email and password
    const signIn = async (email, password) => {
        try {
            const { user: firebaseUser } = await signInWithEmailAndPassword(auth, email, password);

            // Fetch user data
            const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
            let currentData = null;
            if (userDoc.exists()) {
                currentData = userDoc.data();
                setUserData(currentData);
            }

            // Check if 2FA is required
            // TEMPORARILY DISABLED - uncomment to re-enable 2FA
            // if (currentData?.two_factor_enabled && (currentData.role === ROLES.ADMIN || currentData.role === ROLES.REPORTER)) {
            //     setIs2FAVerified(false);
            //     return { success: true, requires2FA: true, user: firebaseUser };
            // }

            // If not required, mark as verified
            setIs2FAVerified(true);
            return { success: true, user: firebaseUser };
        } catch (error) {
            console.error('Sign in error:', error);
            return { success: false, error: error.message };
        }
    };

    // Sign out
    const signOut = async () => {
        try {
            await firebaseSignOut(auth);
            setUser(null);
            setUserData(null);
            setIs2FAVerified(false);
            return { success: true };
        } catch (error) {
            console.error('Sign out error:', error);
            return { success: false, error: error.message };
        }
    };

    // Check if user has specific role
    const hasRole = (requiredRoles) => {
        if (!userData || !is2FAVerified) return false;
        if (Array.isArray(requiredRoles)) {
            return requiredRoles.includes(userData.role);
        }
        return userData.role === requiredRoles;
    };

    // Check if user is admin
    const isAdmin = () => hasRole(ROLES.ADMIN);

    // Check if user can write (admin or reporter)
    const canWrite = () => hasRole([ROLES.ADMIN, ROLES.REPORTER]);

    const value = {
        user,
        userData,
        loading,
        signUp,
        signIn,
        signOut,
        hasRole,
        isAdmin,
        canWrite,
        is2FAVerified,
        verify2FA,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
