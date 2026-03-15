'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';

export default function SignupPage() {
    const router = useRouter();
    const { signup } = useAuth();
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const { error: signupError } = await signup(email, password, fullName);
        if (signupError) {
            setError(signupError);
            setLoading(false);
        } else {
            window.location.href = '/dashboard';
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-card page-enter">
                <div className="auth-header">
                    <h1>Create your account</h1>
                    <p>Start validating your startup ideas with data</p>
                </div>

                <form className="auth-form" onSubmit={handleSubmit}>
                    {error && (
                        <div className="risk-flag severity-high">
                            <div className="risk-flag-icon" />
                            {error}
                        </div>
                    )}

                    <div className="form-group">
                        <label className="form-label" htmlFor="fullName">
                            Full Name
                        </label>
                        <input
                            id="fullName"
                            type="text"
                            className="form-input"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            placeholder="Jane Smith"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label" htmlFor="email">
                            Email
                        </label>
                        <input
                            id="email"
                            type="email"
                            className="form-input"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="you@example.com"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label" htmlFor="password">
                            Password
                        </label>
                        <input
                            id="password"
                            type="password"
                            className="form-input"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            required
                            minLength={6}
                        />
                        <span className="form-hint">Minimum 6 characters</span>
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary btn-lg"
                        disabled={loading}
                        style={{ width: '100%' }}
                    >
                        {loading ? (
                            <>
                                <span className="spinner" />
                                Creating account...
                            </>
                        ) : (
                            'Create account'
                        )}
                    </button>
                </form>

                <div className="auth-divider">
                    Already have an account?{' '}
                    <a href="/login">Sign in</a>
                </div>
            </div>
        </div>
    );
}
