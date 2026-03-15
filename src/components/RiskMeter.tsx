'use client';

interface RiskMeterProps {
    ltvCacRatio: number;
    burnRisk: 'low' | 'moderate' | 'high';
}

export default function RiskMeter({ ltvCacRatio, burnRisk }: RiskMeterProps) {
    // Position the marker on a 0-100 scale
    // 0 = high risk, 100 = low risk
    let position: number;
    if (ltvCacRatio >= 5) position = 90;
    else if (ltvCacRatio >= 3) position = 70;
    else if (ltvCacRatio >= 1) position = 40;
    else position = 15;

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-2)' }}>
                <span className="text-xs text-secondary">High Risk</span>
                <span className="text-xs text-secondary">Low Risk</span>
            </div>

            <div
                style={{
                    position: 'relative',
                    height: 12,
                    borderRadius: 6,
                    background: 'linear-gradient(to right, #ef4444 0%, #f59e0b 40%, #22c55e 80%, #22c55e 100%)',
                    overflow: 'visible',
                }}
            >
                <div
                    style={{
                        position: 'absolute',
                        left: `${position}%`,
                        top: '50%',
                        transform: 'translate(-50%, -50%)',
                        width: 20,
                        height: 20,
                        borderRadius: '50%',
                        background: '#e8eaf0',
                        border: '3px solid #0b0e14',
                        boxShadow: '0 0 0 1px #252a3a',
                        transition: 'left 0.5s ease',
                    }}
                />
            </div>

            <div
                className="flex justify-between items-center"
                style={{ marginTop: 'var(--space-3)' }}
            >
                <div>
                    <span className="text-sm text-secondary">LTV:CAC Ratio</span>
                    <span
                        className="text-lg"
                        style={{
                            display: 'block',
                            fontWeight: 700,
                            color:
                                ltvCacRatio >= 3
                                    ? 'var(--success)'
                                    : ltvCacRatio >= 1
                                        ? 'var(--warning)'
                                        : 'var(--danger)',
                        }}
                    >
                        {ltvCacRatio}x
                    </span>
                </div>
                <span
                    className={`badge badge-${burnRisk === 'low' ? 'success' : burnRisk === 'moderate' ? 'warning' : 'danger'
                        }`}
                >
                    {burnRisk.charAt(0).toUpperCase() + burnRisk.slice(1)} Burn Risk
                </span>
            </div>
        </div>
    );
}
