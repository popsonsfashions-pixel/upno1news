import { useState } from 'react';
import { api } from '@/lib/api';
import styles from './Auth.module.css';

export default function TwoFactorSetup({ onComplete, onCancel }) {
    const [step, setStep] = useState('initial'); // initial, qr, success
    const [secretData, setSecretData] = useState(null);
    const [code, setCode] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const startSetup = async () => {
        setLoading(true);
        setError('');
        try {
            const data = await api.setup2FA();
            setSecretData(data);
            setStep('qr');
        } catch (err) {
            setError(err.message || 'Failed to start 2FA setup');
        } finally {
            setLoading(false);
        }
    };

    const verifyAndEnable = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            await api.enable2FA(code);
            setStep('success');
            if (onComplete) onComplete();
        } catch (err) {
            setError(err.message || 'Invalid code');
        } finally {
            setLoading(false);
        }
    };

    if (step === 'initial') {
        return (
            <div className={styles.twoFactorContainer}>
                <h3>Enable Two-Factor Authentication</h3>
                <p>Protect your account with an extra layer of security using an authenticator app.</p>

                {error && <div className={styles.error}>{error}</div>}

                <div className={styles.actions}>
                    <button
                        className={styles.primaryBtn}
                        onClick={startSetup}
                        disabled={loading}
                    >
                        {loading ? 'Starting...' : 'Start Setup'}
                    </button>
                    <button className={styles.cancelBtn} onClick={onCancel}>
                        Cancel
                    </button>
                </div>
            </div>
        );
    }

    if (step === 'qr') {
        return (
            <div className={styles.twoFactorContainer}>
                <h3>Scan QR Code</h3>
                <p>1. Open your authenticator app (e.g., Google Authenticator, Authy).</p>
                <p>2. Scan the QR code below:</p>

                <div className={styles.qrCode}>
                    {secretData?.qr_code && (
                        <img
                            src={`data:image/png;base64,${secretData.qr_code}`}
                            alt="2FA QR Code"
                        />
                    )}
                </div>

                <p className={styles.secretText}>
                    Can't scan? Enter this code manually: <strong>{secretData?.secret}</strong>
                </p>

                <form onSubmit={verifyAndEnable} className={styles.verifyForm}>
                    <p>3. Enter the 6-digit code from the app:</p>
                    <input
                        type="text"
                        value={code}
                        onChange={(e) => setCode(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
                        placeholder="000000"
                        className={styles.codeInput}
                        maxLength={6}
                        required
                    />

                    {error && <div className={styles.error}>{error}</div>}

                    <div className={styles.actions}>
                        <button
                            type="submit"
                            className={styles.primaryBtn}
                            disabled={loading || code.length !== 6}
                        >
                            {loading ? 'Verifying...' : 'Verify & Enable'}
                        </button>
                        <button
                            type="button"
                            className={styles.cancelBtn}
                            onClick={onCancel}
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        );
    }

    if (step === 'success') {
        return (
            <div className={styles.twoFactorContainer}>
                <div className={styles.successIcon}>✓</div>
                <h3>2FA Enabled!</h3>
                <p>Your account is now secure. You will need to enter a code from your authenticator app when you log in.</p>
                <button className={styles.primaryBtn} onClick={onComplete}>
                    Done
                </button>
            </div>
        );
    }
}
