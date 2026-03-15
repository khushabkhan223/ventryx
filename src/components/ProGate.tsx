'use client';

import { useSubscription } from '@/hooks/useSubscription';

interface ProGateProps {
    children: React.ReactNode;
    label?: string;
}

/**
 * Wraps Pro-only content with a blur overlay and upgrade CTA for Free users.
 * Uses structural layout (not display:none) — content exists but is non-interactive.
 */
export default function ProGate({ children, label = 'Professional Mode Feature' }: ProGateProps) {
    const { isPro } = useSubscription();

    if (isPro) return <>{children}</>;

    return (
        <div className="pro-gate">
            <div className="pro-gate-content">
                {children}
            </div>
            <div className="pro-gate-overlay">
                <div className="pro-gate-badge">{label}</div>
                <p className="pro-gate-text">
                    Upgrade to Pro for advanced financial simulation and executive analysis.
                </p>
                <a href="/upgrade" className="btn btn-primary btn-sm">
                    Upgrade to Pro
                </a>
            </div>
        </div>
    );
}
