"use client";

import { useState } from 'react';
import { useAuth, ROLES } from '@/context/AuthContext';
import styles from './Auth.module.css';

import TwoFactorVerify from './TwoFactorVerify';

export default function AuthModal({ isOpen, onClose, initialMode = 'login' }) {
    const [mode, setMode] = useState(initialMode);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [show2FA, setShow2FA] = useState(false);

    // Form fields
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [role, setRole] = useState(ROLES.READER);

    const { signIn, signUp } = useAuth();

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            if (mode === 'login') {
                const result = await signIn(email, password);
                if (result.success) {
                    if (result.requires2FA) {
                        setShow2FA(true);
                    } else {
                        onClose();
                        resetForm();
                    }
                } else {
                    setError(result.error || 'Login failed');
                }
            } else {
                const result = await signUp(email, password, fullName, role);
                if (result.success) {
                    onClose();
                    resetForm();
                } else {
                    setError(result.error || 'Registration failed');
                }
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setEmail('');
        setPassword('');
        setFullName('');
        setRole(ROLES.READER);
        setError('');
        setShow2FA(false);
    };

    const switchMode = () => {
        setMode(mode === 'login' ? 'register' : 'login');
        setError('');
        setShow2FA(false);
    };

    const handle2FASuccess = () => {
        onClose();
        resetForm();
    };

    return (
        <div className={styles.authModal} onClick={onClose}>
            <div className={styles.authCard} onClick={(e) => e.stopPropagation()}>
                <button className={styles.closeBtn} onClick={onClose}>×</button>

                {show2FA ? (
                    <TwoFactorVerify
                        onSuccess={handle2FASuccess}
                        onCancel={() => setShow2FA(false)}
                    />
                ) : (
                    <>
                        <h2 className={styles.title}>
                            {mode === 'login' ? 'Welcome Back' : 'Create Account'}
                        </h2>
                        <p className={styles.subtitle}>
                            {mode === 'login'
                                ? 'Sign in to continue to TimesNow'
                                : 'Join TimesNow to get personalized news'}
                        </p>

                        {error && <div className={styles.error}>{error}</div>}

                        <form className={styles.form} onSubmit={handleSubmit}>
                            {mode === 'register' && (
                                <div className={styles.inputGroup}>
                                    <label className={styles.label}>Full Name</label>
                                    <input
                                        type="text"
                                        className={styles.input}
                                        value={fullName}
                                        onChange={(e) => setFullName(e.target.value)}
                                        placeholder="John Doe"
                                        required
                                    />
                                </div>
                            )}

                            <div className={styles.inputGroup}>
                                <label className={styles.label}>Email</label>
                                <input
                                    type="email"
                                    className={styles.input}
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="you@example.com"
                                    required
                                />
                            </div>

                            <div className={styles.inputGroup}>
                                <label className={styles.label}>Password</label>
                                <input
                                    type="password"
                                    className={styles.input}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    minLength={6}
                                    required
                                />
                            </div>

                            {mode === 'register' && (
                                <div className={styles.inputGroup}>
                                    <label className={styles.label}>Account Type</label>
                                    <select
                                        className={styles.select}
                                        value={role}
                                        onChange={(e) => setRole(e.target.value)}
                                    >
                                        <option value={ROLES.READER}>Reader</option>
                                        <option value={ROLES.REPORTER}>Reporter</option>
                                        <option value={ROLES.ADMIN}>Admin</option>
                                    </select>
                                </div>
                            )}

                            <button
                                type="submit"
                                className={styles.submitBtn}
                                disabled={loading}
                            >
                                {loading
                                    ? 'Please wait...'
                                    : mode === 'login' ? 'Sign In' : 'Create Account'}
                            </button>
                        </form>

                        <p className={styles.switchText}>
                            {mode === 'login' ? (
                                <>
                                    Don't have an account?{' '}
                                    <span className={styles.switchLink} onClick={switchMode}>
                                        Sign up
                                    </span>
                                </>
                            ) : (
                                <>
                                    Already have an account?{' '}
                                    <span className={styles.switchLink} onClick={switchMode}>
                                        Sign in
                                    </span>
                                </>
                            )}
                        </p>
                    </>
                )}
            </div>
        </div>
    );
}
