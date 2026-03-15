'use client';

import { useState } from 'react';
import type { ExecutiveMemoPayload } from '@/lib/types';

interface ExecutiveMemoProps {
    payload: ExecutiveMemoPayload | null;
    isPro: boolean;
}

export default function ExecutiveMemo({ payload, isPro }: ExecutiveMemoProps) {
    const [memo, setMemo] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleGenerate = async () => {
        if (!payload || !isPro) return;
        setLoading(true);
        setError(null);
        setMemo(null);

        try {
            const res = await fetch('/api/ai/executive-memo', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error || 'Failed to generate memo');
            } else {
                setMemo(data.memo);
            }
        } catch {
            setError('Network error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="card" style={{ padding: 'var(--space-5)' }} id="executive-memo-section">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-4)' }}>
                <div>
                    <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 600, margin: 0 }}>
                        Executive Decision Memo
                    </h3>
                    <p className="text-sm text-secondary" style={{ marginTop: 'var(--space-1)' }}>
                        AI-generated analysis based on your computed financial data
                    </p>
                </div>
                <button
                    className="btn btn-primary btn-sm"
                    onClick={handleGenerate}
                    disabled={loading || !payload || !isPro}
                >
                    {loading ? 'Generating...' : memo ? 'Regenerate' : 'Generate Memo'}
                </button>
            </div>

            {loading && (
                <div className="memo-loading">
                    <div className="skeleton" style={{ height: 16, width: '80%', marginBottom: 'var(--space-3)' }} />
                    <div className="skeleton" style={{ height: 16, width: '60%', marginBottom: 'var(--space-3)' }} />
                    <div className="skeleton" style={{ height: 16, width: '70%', marginBottom: 'var(--space-3)' }} />
                    <div className="skeleton" style={{ height: 16, width: '50%' }} />
                    <p className="text-sm text-secondary" style={{ marginTop: 'var(--space-4)', textAlign: 'center' }}>
                        Analyzing financial data and generating executive assessment...
                    </p>
                </div>
            )}

            {error && (
                <div className="memo-error" style={{
                    padding: 'var(--space-4)',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                    border: '1px solid rgba(239, 68, 68, 0.2)',
                    color: '#ef4444',
                }}>
                    {error}
                </div>
            )}

            {memo && !loading && (
                <div className="executive-memo-content" id="executive-memo-text">
                    {memo.split('\n').map((line, i) => {
                        if (line.startsWith('## ')) {
                            return (
                                <h4 key={i} style={{
                                    fontSize: 'var(--text-sm)',
                                    fontWeight: 600,
                                    color: 'var(--text-primary)',
                                    marginTop: i > 0 ? 'var(--space-5)' : 0,
                                    marginBottom: 'var(--space-2)',
                                    letterSpacing: '0.01em',
                                }}>
                                    {line.replace('## ', '')}
                                </h4>
                            );
                        }
                        if (line.trim() === '') return <br key={i} />;
                        return (
                            <p key={i} style={{
                                fontSize: 'var(--text-sm)',
                                lineHeight: 1.7,
                                color: 'var(--text-secondary)',
                                marginBottom: 'var(--space-2)',
                            }}>
                                {line}
                            </p>
                        );
                    })}
                </div>
            )}

            {!memo && !loading && !error && (
                <div style={{
                    textAlign: 'center',
                    padding: 'var(--space-6)',
                    color: 'var(--text-tertiary)',
                }}>
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ margin: '0 auto var(--space-3)' }}>
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                        <polyline points="14 2 14 8 20 8" />
                        <line x1="16" y1="13" x2="8" y2="13" />
                        <line x1="16" y1="17" x2="8" y2="17" />
                        <polyline points="10 9 9 9 8 9" />
                    </svg>
                    <p className="text-sm">Click &quot;Generate Memo&quot; to create an executive assessment based on your validation data.</p>
                </div>
            )}
        </div>
    );
}
