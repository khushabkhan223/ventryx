'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useProject } from '@/hooks/useProject';
import type { RevenueData } from '@/lib/types';

const DEFAULT_DATA: RevenueData = {
    monthly_traffic: 0,
    conversion_rate: 0,
    churn_rate: 0,
    customer_acquisition_cost: 0,
    fixed_costs: 0,
};

export default function RevenuePage() {
    const params = useParams();
    const router = useRouter();
    const projectId = params.id as string;
    const { sections, completion, saveSection, saving } = useProject(projectId);

    const [data, setData] = useState<RevenueData>(DEFAULT_DATA);
    const [loaded, setLoaded] = useState(false);
    const debounceRef = useRef<NodeJS.Timeout>(undefined);

    const isUnlocked = completion.pricing;

    useEffect(() => {
        const existing = sections.find((s) => s.section_key === 'revenue');
        if (existing) {
            setData({ ...DEFAULT_DATA, ...(existing.data as Partial<RevenueData>) });
        }
        setLoaded(true);
    }, [sections]);

    const update = useCallback(
        (field: keyof RevenueData, value: number) => {
            setData((prev) => {
                const updated = { ...prev, [field]: value } as RevenueData;
                if (debounceRef.current) clearTimeout(debounceRef.current);
                debounceRef.current = setTimeout(() => {
                    saveSection('revenue', updated, null, false);
                }, 1000);
                return updated;
            });
        },
        [saveSection]
    );

    const handleComplete = async () => {
        await saveSection('revenue', data, null, true);
        router.push(`/dashboard/project/${projectId}/competitive`);
    };

    const isComplete =
        data.monthly_traffic > 0 &&
        data.conversion_rate > 0 &&
        data.churn_rate > 0 &&
        data.customer_acquisition_cost > 0;

    if (!loaded) return null;

    if (!isUnlocked) {
        return (
            <div className="section-page page-enter">
                <div className="section-page-header">
                    <h2>Revenue Projections</h2>
                    <p className="text-secondary">Complete the Pricing Hypothesis section first.</p>
                </div>
                <button className="btn btn-secondary" onClick={() => router.push(`/dashboard/project/${projectId}/pricing`)}>
                    Go to Pricing
                </button>
            </div>
        );
    }

    return (
        <div className="section-page page-enter">
            <div className="section-page-header">
                <h2>Revenue Projections</h2>
                <p>
                    Provide your acquisition and retention estimates. These feed into the
                    cohort-based financial model on the results dashboard.
                </p>
            </div>

            <div className="section-form">
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-5)' }}>
                    <div className="form-group">
                        <label className="form-label">Expected Monthly Website Traffic</label>
                        <input
                            type="number"
                            className="form-input"
                            value={data.monthly_traffic || ''}
                            onChange={(e) => update('monthly_traffic', Number(e.target.value))}
                            placeholder="5000"
                            min={0}
                        />
                        <span className="form-hint">Unique visitors per month</span>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Visitor-to-Customer Conversion Rate (%)</label>
                        <input
                            type="number"
                            className="form-input"
                            value={data.conversion_rate || ''}
                            onChange={(e) => update('conversion_rate', Number(e.target.value))}
                            placeholder="2.5"
                            min={0}
                            max={100}
                            step={0.1}
                        />
                        <span className="form-hint">Typical SaaS: 1-5%</span>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Monthly Churn Rate (%)</label>
                        <input
                            type="number"
                            className="form-input"
                            value={data.churn_rate || ''}
                            onChange={(e) => update('churn_rate', Number(e.target.value))}
                            placeholder="5"
                            min={0}
                            max={100}
                            step={0.1}
                        />
                        <span className="form-hint">% of customers lost per month. Low &lt;3%, High &gt;8%</span>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Customer Acquisition Cost ($)</label>
                        <input
                            type="number"
                            className="form-input"
                            value={data.customer_acquisition_cost || ''}
                            onChange={(e) => update('customer_acquisition_cost', Number(e.target.value))}
                            placeholder="50"
                            min={0}
                        />
                        <span className="form-hint">Cost to acquire one paying customer</span>
                    </div>
                </div>

                <div className="form-group">
                    <label className="form-label">Monthly Fixed Costs ($)</label>
                    <input
                        type="number"
                        className="form-input"
                        value={data.fixed_costs || ''}
                        onChange={(e) => update('fixed_costs', Number(e.target.value))}
                        placeholder="2000"
                        min={0}
                    />
                    <span className="form-hint">
                        Server, tools, salaries — costs you pay regardless of customer count
                    </span>
                </div>
            </div>

            <div className="section-footer">
                <span className="text-sm text-secondary">
                    {saving ? 'Saving...' : 'Auto-saved'}
                </span>
                <button
                    className="btn btn-primary"
                    onClick={handleComplete}
                    disabled={!isComplete || saving}
                >
                    Continue to Competitive
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="9 18 15 12 9 6" />
                    </svg>
                </button>
            </div>
        </div>
    );
}
