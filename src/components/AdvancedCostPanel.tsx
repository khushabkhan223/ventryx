'use client';

import type { AdvancedCostInputs } from '@/lib/types';

interface AdvancedCostPanelProps {
    costs: AdvancedCostInputs;
    onChange: (costs: AdvancedCostInputs) => void;
}

export default function AdvancedCostPanel({ costs, onChange }: AdvancedCostPanelProps) {
    const update = (field: keyof AdvancedCostInputs, value: number) => {
        onChange({ ...costs, [field]: value });
    };

    return (
        <div className="card" style={{ padding: 'var(--space-5)' }}>
            <h3 style={{ marginBottom: 'var(--space-4)', fontSize: 'var(--text-base)', fontWeight: 600 }}>
                Advanced Cost Structure
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
                <div className="form-group">
                    <label className="form-label">One-Time Build Cost ($)</label>
                    <input
                        type="number"
                        className="form-input"
                        value={costs.buildCost || ''}
                        onChange={(e) => update('buildCost', Number(e.target.value))}
                        placeholder="15000"
                        min={0}
                    />
                    <span className="form-hint">MVP development, design, infrastructure setup</span>
                </div>
                <div className="form-group">
                    <label className="form-label">Monthly Operating Costs ($)</label>
                    <input
                        type="number"
                        className="form-input"
                        value={costs.monthlyOperatingCosts || ''}
                        onChange={(e) => update('monthlyOperatingCosts', Number(e.target.value))}
                        placeholder="500"
                        min={0}
                    />
                    <span className="form-hint">Hosting, SaaS tools, subscriptions</span>
                </div>
                <div className="form-group">
                    <label className="form-label">Monthly Marketing Budget ($)</label>
                    <input
                        type="number"
                        className="form-input"
                        value={costs.monthlyMarketingBudget || ''}
                        onChange={(e) => update('monthlyMarketingBudget', Number(e.target.value))}
                        placeholder="1000"
                        min={0}
                    />
                    <span className="form-hint">Paid ads, content, partnerships</span>
                </div>
                <div className="form-group">
                    <label className="form-label">Monthly Team Cost ($)</label>
                    <input
                        type="number"
                        className="form-input"
                        value={costs.teamCost || ''}
                        onChange={(e) => update('teamCost', Number(e.target.value))}
                        placeholder="0"
                        min={0}
                    />
                    <span className="form-hint">Salaries, contractors (0 if solo founder)</span>
                </div>
            </div>
            <div className="form-group" style={{ marginTop: 'var(--space-4)' }}>
                <label className="form-label">Initial Available Capital ($)</label>
                <input
                    type="number"
                    className="form-input"
                    value={costs.initialCapital || ''}
                    onChange={(e) => update('initialCapital', Number(e.target.value))}
                    placeholder="50000"
                    min={0}
                    style={{ maxWidth: 'calc(50% - var(--space-2))' }}
                />
                <span className="form-hint">Total runway capital available for this venture</span>
            </div>
        </div>
    );
}
