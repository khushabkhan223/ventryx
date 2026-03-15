'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useProject } from '@/hooks/useProject';
import type { ExperimentData } from '@/lib/types';

const DEFAULT_DATA: ExperimentData = {
    experiment_type: '',
    hypothesis: '',
    success_metric: '',
    timeline_days: 14,
    budget: 0,
};

export default function ExperimentPage() {
    const params = useParams();
    const router = useRouter();
    const projectId = params.id as string;
    const { sections, completion, saveSection, saving } = useProject(projectId);

    const [data, setData] = useState<ExperimentData>(DEFAULT_DATA);
    const [loaded, setLoaded] = useState(false);
    const debounceRef = useRef<NodeJS.Timeout>(undefined);

    const isUnlocked = completion.competitive;

    useEffect(() => {
        const existing = sections.find((s) => s.section_key === 'experiment');
        if (existing) {
            setData({ ...DEFAULT_DATA, ...(existing.data as Partial<ExperimentData>) });
        }
        setLoaded(true);
    }, [sections]);

    const update = useCallback(
        (field: keyof ExperimentData, value: ExperimentData[keyof ExperimentData]) => {
            setData((prev) => {
                const updated = { ...prev, [field]: value } as ExperimentData;
                if (debounceRef.current) clearTimeout(debounceRef.current);
                debounceRef.current = setTimeout(() => {
                    saveSection('experiment', updated, null, false);
                }, 1000);
                return updated;
            });
        },
        [saveSection]
    );

    const handleComplete = async () => {
        await saveSection('experiment', data, null, true);
        router.push(`/dashboard/project/${projectId}`);
    };

    const isComplete =
        data.experiment_type.trim().length > 0 &&
        data.hypothesis.trim().length > 10 &&
        data.success_metric.trim().length > 5 &&
        data.timeline_days > 0;

    if (!loaded) return null;

    if (!isUnlocked) {
        return (
            <div className="section-page page-enter">
                <div className="section-page-header">
                    <h2>Validation Plan</h2>
                    <p className="text-secondary">Complete the Competitive Position section first.</p>
                </div>
                <button className="btn btn-secondary" onClick={() => router.push(`/dashboard/project/${projectId}/competitive`)}>
                    Go to Competitive
                </button>
            </div>
        );
    }

    return (
        <div className="section-page page-enter">
            <div className="section-page-header">
                <h2>Validation Plan</h2>
                <p>
                    Design a low-cost experiment to test your riskiest assumption before
                    investing significant resources.
                </p>
            </div>

            <div className="section-form">
                <div className="form-group">
                    <label className="form-label">Experiment Type</label>
                    <select
                        className="form-select"
                        value={data.experiment_type}
                        onChange={(e) => update('experiment_type', e.target.value)}
                    >
                        <option value="">Select an experiment type...</option>
                        <option value="landing_page">Landing Page Test — gauge interest via signups</option>
                        <option value="customer_interviews">Customer Interviews — talk to 10+ potential users</option>
                        <option value="paid_ad_test">Paid Ad Test — run 48-hour targeted ads</option>
                        <option value="prototype_test">Prototype Test — build MVP and measure engagement</option>
                        <option value="concierge_mvp">Concierge MVP — manually deliver the service</option>
                        <option value="pre_sale">Pre-Sale — sell before building</option>
                        <option value="survey">Survey — quantitative validation with 50+ responses</option>
                        <option value="other">Other</option>
                    </select>
                </div>

                <div className="form-group">
                    <label className="form-label">What hypothesis are you testing?</label>
                    <textarea
                        className="form-textarea"
                        value={data.hypothesis}
                        onChange={(e) => update('hypothesis', e.target.value)}
                        placeholder="We believe that [target users] will [take action] because [reason]. We'll know this is true when [success metric]."
                        rows={3}
                    />
                    <span className="form-hint">
                        Frame as: &quot;We believe [X] will happen because [Y].&quot;
                    </span>
                </div>

                <div className="form-group">
                    <label className="form-label">Success Metric</label>
                    <input
                        className="form-input"
                        value={data.success_metric}
                        onChange={(e) => update('success_metric', e.target.value)}
                        placeholder="e.g., 50 email signups, 5% conversion rate, 8/10 interview validation"
                    />
                    <span className="form-hint">
                        A specific, measurable number that proves or disproves your hypothesis
                    </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-5)' }}>
                    <div className="form-group">
                        <label className="form-label">Timeline (days)</label>
                        <input
                            type="number"
                            className="form-input"
                            value={data.timeline_days}
                            onChange={(e) => update('timeline_days', Number(e.target.value))}
                            min={1}
                            max={90}
                        />
                        <span className="form-hint">Recommended: 7-14 days</span>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Budget ($)</label>
                        <input
                            type="number"
                            className="form-input"
                            value={data.budget || ''}
                            onChange={(e) => update('budget', Number(e.target.value))}
                            placeholder="200"
                            min={0}
                        />
                        <span className="form-hint">Keep it low: $0-500</span>
                    </div>
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
                    View Results Dashboard
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="9 18 15 12 9 6" />
                    </svg>
                </button>
            </div>
        </div>
    );
}
