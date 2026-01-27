import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import styles from './Auth.module.css';

export default function TwoFactorVerify({ onSuccess, onCancel }) {
    const [code, setCode] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { verify2FA } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        const result = await verify2FA(code);

        if (result.success) {
            onSuccess();
        } else {
            setError(result.error || 'Invalid code');
            setLoading(false);
        }
    };

    return (
        <div className={styles.twoFactorContainer}>
            <div className={styles.shieldIcon}>🔒</div>
            <h3>Two-Factor Authentication</h3>
            <p>Enter the 6-digit code from your authenticator app.</p>

            <form onSubmit={handleSubmit} className={styles.verifyForm}>
                <input
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
                    placeholder="000000"
                    className={styles.codeInput}
                    maxLength={6}
                    autoFocus
                    required
                />

                {error && <div className={styles.error}>{error}</div>}

                <div className={styles.actions}>
                    <button
                        type="submit"
                        className={styles.submitBtn} // Reusing submitBtn style
                        disabled={loading || code.length !== 6}
                    >
                        {loading ? 'Verifying...' : 'Verify'}
                    </button>
                    <button
                        type="button"
                        className={styles.cancelBtn}
                        onClick={onCancel}
                        disabled={loading}
                    >
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    );
}
