"use client";

import { useState } from 'react';
import { useAuth, ROLES } from '@/context/AuthContext';
import Header from '@/components/Header/Header';
import TwoFactorSetup from '@/components/Auth/TwoFactorSetup';
import styles from './profile.module.css';

export default function ProfilePage() {
    const { user, userData, loading, signOut } = useAuth();
    const [showSetup2FA, setShowSetup2FA] = useState(false);

    if (loading) {
        return (
            <>
                <Header />
                <main className={styles.main}>
                    <div className="container">
                        <div className={styles.loading}>Loading...</div>
                    </div>
                </main>
            </>
        );
    }

    if (!user) {
        return (
            <>
                <Header />
                <main className={styles.main}>
                    <div className="container">
                        <div className={styles.notLoggedIn}>
                            <h1>Please Sign In</h1>
                            <p>You need to be logged in to view your profile.</p>
                        </div>
                    </div>
                </main>
            </>
        );
    }

    const canSetup2FA = (userData?.role === ROLES.ADMIN || userData?.role === ROLES.REPORTER);

    return (
        <>
            <Header />
            <main className={styles.main}>
                <div className="container">
                    <div className={styles.profileCard}>
                        {showSetup2FA ? (
                            <TwoFactorSetup
                                onComplete={() => {
                                    setShowSetup2FA(false);
                                    // Optionally refresh user data here
                                    window.location.reload();
                                }}
                                onCancel={() => setShowSetup2FA(false)}
                            />
                        ) : (
                            <>
                                <div className={styles.avatar}>
                                    {userData?.full_name?.charAt(0) || user.email?.charAt(0) || 'U'}
                                </div>

                                <h1 className={styles.name}>
                                    {userData?.full_name || 'User'}
                                </h1>

                                <span className={styles.role}>
                                    {userData?.role?.toUpperCase() || 'READER'}
                                </span>

                                <div className={styles.info}>
                                    <div className={styles.infoRow}>
                                        <label>Email</label>
                                        <span>{user.email}</span>
                                    </div>

                                    <div className={styles.infoRow}>
                                        <label>User ID</label>
                                        <span className={styles.userId}>{user.uid}</span>
                                    </div>

                                    <div className={styles.infoRow}>
                                        <label>Account Status</label>
                                        <span className={styles.active}>
                                            {userData?.is_active ? '✓ Active' : 'Inactive'}
                                        </span>
                                    </div>

                                    <div className={styles.infoRow}>
                                        <label>Member Since</label>
                                        <span>
                                            {userData?.created_at?.toDate?.()?.toLocaleDateString() || 'Recently joined'}
                                        </span>
                                    </div>

                                    {canSetup2FA && (
                                        <div className={styles.securitySection}>
                                            <h3>Security</h3>
                                            <div className={styles.infoRow}>
                                                <label>Two-Factor Auth</label>
                                                <span>
                                                    {userData?.two_factor_enabled ? (
                                                        <span className={styles.active}>✓ Enabled</span>
                                                    ) : (
                                                        <button
                                                            className={styles.enableBtn}
                                                            onClick={() => setShowSetup2FA(true)}
                                                        >
                                                            Enable 2FA
                                                        </button>
                                                    )}
                                                </span>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <button className={styles.signOutBtn} onClick={signOut}>
                                    Sign Out
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </main>
        </>
    );
}
