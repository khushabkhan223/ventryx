'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/lib/supabase';

export default function UpgradePage() {
    const { isPro, user, refreshProfile } = useAuth();
    const [processing, setProcessing] = useState(false);
    const [success, setSuccess] = useState(false);

    // Mock card state
    const [cardNumber, setCardNumber] = useState('');
    const [expiry, setExpiry] = useState('');
    const [cvc, setCvc] = useState('');

    const handleUpgrade = async () => {
        setProcessing(true);

        // Simulate payment processing
        await new Promise((r) => setTimeout(r, 2000));

        // Update profile to Pro
        if (user) {
            await supabase
                .from('profiles')
                .update({ is_pro: true })
                .eq('id', user.id);
            await refreshProfile();
        }

        setProcessing(false);
        setSuccess(true);
    };

    if (success || isPro) {
        return (
            <div className="page-enter" style={{ textAlign: 'center', paddingTop: 'var(--space-8)' }}>
                <div
                    style={{
                        width: 64,
                        height: 64,
                        borderRadius: '50%',
                        background: 'var(--success-subtle)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto var(--space-5)',
                    }}
                >
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--success)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                    </svg>
                </div>
                <h1>You&apos;re on Pro</h1>
                <p className="text-secondary" style={{ marginTop: 'var(--space-3)', maxWidth: 400, margin: 'var(--space-3) auto' }}>
                    You now have access to PDF report exports, unlimited projects, and
                    all premium features.
                </p>
                <a href="/dashboard" className="btn btn-primary" style={{ marginTop: 'var(--space-5)', display: 'inline-flex' }}>
                    Back to Dashboard
                </a>
            </div>
        );
    }

    const features = {
        free: [
            { text: 'Up to 3 projects', included: true },
            { text: 'All 6 validation sections', included: true },
            { text: 'Viability Index scoring', included: true },
            { text: 'Risk flags & drilldown', included: true },
            { text: 'Revenue projections', included: true },
            { text: 'PDF report export', included: false },
            { text: 'AI-powered refinement', included: false },
            { text: 'Unlimited projects', included: false },
        ],
        pro: [
            { text: 'Unlimited projects', included: true },
            { text: 'All 6 validation sections', included: true },
            { text: 'Viability Index scoring', included: true },
            { text: 'Risk flags & drilldown', included: true },
            { text: 'Revenue projections', included: true },
            { text: 'PDF report export', included: true },
            { text: 'AI-powered refinement', included: true },
            { text: 'Priority support', included: true },
        ],
    };

    return (
        <div className="page-enter">
            <div style={{ textAlign: 'center', marginBottom: 'var(--space-7)' }}>
                <h1>Upgrade to Pro</h1>
                <p className="text-secondary" style={{ marginTop: 'var(--space-2)' }}>
                    Unlock the full power of Ventryx for serious founders
                </p>
            </div>

            <div className="pricing-grid">
                {/* Free Plan */}
                <div className="pricing-card">
                    <h3>Free</h3>
                    <div className="pricing-price">
                        $0 <span>/month</span>
                    </div>
                    <p className="text-sm text-secondary">For exploring and testing ideas</p>
                    <ul className="pricing-features">
                        {features.free.map((f, i) => (
                            <li key={i} className={`pricing-feature ${f.included ? 'included' : 'excluded'}`}>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    {f.included ? (
                                        <polyline points="20 6 9 17 4 12" />
                                    ) : (
                                        <>
                                            <line x1="18" y1="6" x2="6" y2="18" />
                                            <line x1="6" y1="6" x2="18" y2="18" />
                                        </>
                                    )}
                                </svg>
                                {f.text}
                            </li>
                        ))}
                    </ul>
                    <button className="btn btn-secondary" style={{ width: '100%' }} disabled>
                        Current Plan
                    </button>
                </div>

                {/* Pro Plan */}
                <div className="pricing-card recommended">
                    <div className="pricing-card-badge">Recommended</div>
                    <h3>Pro</h3>
                    <div className="pricing-price">
                        $29 <span>/month</span>
                    </div>
                    <p className="text-sm text-secondary">For serious founders validating ideas</p>
                    <ul className="pricing-features">
                        {features.pro.map((f, i) => (
                            <li key={i} className={`pricing-feature ${f.included ? 'included' : 'excluded'}`}>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="20 6 9 17 4 12" />
                                </svg>
                                {f.text}
                            </li>
                        ))}
                    </ul>

                    {/* Mock payment form */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', marginBottom: 'var(--space-4)' }}>
                        <input
                            className="form-input"
                            placeholder="Card number"
                            value={cardNumber}
                            onChange={(e) => setCardNumber(e.target.value)}
                            maxLength={19}
                        />
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }}>
                            <input
                                className="form-input"
                                placeholder="MM/YY"
                                value={expiry}
                                onChange={(e) => setExpiry(e.target.value)}
                                maxLength={5}
                            />
                            <input
                                className="form-input"
                                placeholder="CVC"
                                value={cvc}
                                onChange={(e) => setCvc(e.target.value)}
                                maxLength={4}
                            />
                        </div>
                    </div>

                    <button
                        className="btn btn-primary btn-lg"
                        style={{ width: '100%' }}
                        onClick={handleUpgrade}
                        disabled={processing}
                    >
                        {processing ? (
                            <>
                                <span className="spinner" />
                                Processing...
                            </>
                        ) : (
                            'Upgrade to Pro — $29/mo'
                        )}
                    </button>
                    <div className="text-xs text-tertiary" style={{ textAlign: 'center', marginTop: 'var(--space-3)' }}>
                        Cancel anytime &middot; 7-day money-back guarantee &middot; Secure checkout
                    </div>
                </div>
            </div>
        </div>
    );
}
