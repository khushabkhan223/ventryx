'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useProject } from '@/hooks/useProject';
import type { PricingData } from '@/lib/types';

const DEFAULT_DATA: PricingData = {
    value_justification: 'moderate',
    willingness_signal: 'assumed',
    price_value_ratio: 'fair',
    price_point: 0,
    pricing_model: '',
};

export default function PricingPage() {
    const params = useParams();
    const router = useRouter();
    const projectId = params.id as string;
    const { sections, completion, saveSection, saving } = useProject(projectId);

    const [data, setData] = useState<PricingData>(DEFAULT_DATA);
    const [loaded, setLoaded] = useState(false);
    const debounceRef = useRef<NodeJS.Timeout>(undefined);

    const isUnlocked = completion.segment;

    useEffect(() => {
        const existing = sections.find((s) => s.section_key === 'pricing');
        if (existing) {
            setData({ ...DEFAULT_DATA, ...(existing.data as Partial<PricingData>) });
        }
        setLoaded(true);
    }, [sections]);

    const update = useCallback(
        (field: keyof PricingData, value: PricingData[keyof PricingData]) => {
            setData((prev) => {
                const updated = { ...prev, [field]: value } as PricingData;
                if (debounceRef.current) clearTimeout(debounceRef.current);
                debounceRef.current = setTimeout(() => {
                    saveSection('pricing', updated, null, false);
                }, 1000);
                return updated;
            });
        },
        [saveSection]
    );

    const handleComplete = async () => {
        await saveSection('pricing', data, null, true);
        router.push(`/dashboard/project/${projectId}/revenue`);
    };

    const isComplete =
        data.value_justification &&
        data.willingness_signal &&
        data.price_value_ratio &&
        data.price_point > 0 &&
        data.pricing_model.trim().length > 0;

    if (!loaded) return null;

    if (!isUnlocked) {
        return (
            <div className="section-page page-enter">
                <div className="section-page-header">
                    <h2>Pricing Hypothesis</h2>
                    <p className="text-secondary">Complete the Target Segment section first.</p>
                </div>
                <button className="btn btn-secondary" onClick={() => router.push(`/dashboard/project/${projectId}/segment`)}>
                    Go to Target Segment
                </button>
            </div>
        );
    }

    return (
        <div className="section-page page-enter">
            <div className="section-page-header">
                <h2>Pricing Hypothesis</h2>
                <p>Define your pricing strategy and validate the economics.</p>
            </div>

            <div className="section-form">
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-5)' }}>
                    <div className="form-group">
                        <label className="form-label">Price Point ($/month)</label>
                        <input
                            type="number"
                            className="form-input"
                            value={data.price_point || ''}
                            onChange={(e) => update('price_point', Number(e.target.value))}
                            placeholder="29"
                            min={0}
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Pricing Model</label>
                        <input
                            className="form-input"
                            value={data.pricing_model}
                            onChange={(e) => update('pricing_model', e.target.value)}
                            placeholder="e.g., Monthly SaaS, Usage-based, Freemium"
                        />
                    </div>
                </div>

                <div className="form-group">
                    <label className="form-label">How clearly can you justify this price to customers?</label>
                    <select
                        className="form-select"
                        value={data.value_justification}
                        onChange={(e) => update('value_justification', e.target.value)}
                    >
                        <option value="strong">Strong — clear ROI or measurable value</option>
                        <option value="moderate">Moderate — value exists but hard to quantify</option>
                        <option value="weak">Weak — value proposition is unclear</option>
                    </select>
                </div>

                <div className="form-group">
                    <label className="form-label">How have you validated willingness to pay?</label>
                    <select
                        className="form-select"
                        value={data.willingness_signal}
                        onChange={(e) => update('willingness_signal', e.target.value)}
                    >
                        <option value="validated">Validated — people have expressed or shown willingness</option>
                        <option value="assumed">Assumed — based on comparable products</option>
                        <option value="guessed">Guessed — no evidence yet</option>
                    </select>
                </div>

                <div className="form-group">
                    <label className="form-label">Price relative to perceived value</label>
                    <select
                        className="form-select"
                        value={data.price_value_ratio}
                        onChange={(e) => update('price_value_ratio', e.target.value)}
                    >
                        <option value="under_priced">Under-priced — could charge more</option>
                        <option value="fair">Fair — balanced price-to-value</option>
                        <option value="over_priced">Over-priced — may deter customers</option>
                    </select>
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
                    Continue to Revenue
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="9 18 15 12 9 6" />
                    </svg>
                </button>
            </div>
        </div>
    );
}
