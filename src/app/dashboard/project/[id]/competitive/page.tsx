'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useProject } from '@/hooks/useProject';
import type { CompetitiveData } from '@/lib/types';

const DEFAULT_DATA: CompetitiveData = {
    competitor_count: '1_3',
    switching_cost: 'moderate',
    differentiation_clarity: 'somewhat_different',
    key_differentiator: '',
};

export default function CompetitivePage() {
    const params = useParams();
    const router = useRouter();
    const projectId = params.id as string;
    const { sections, completion, saveSection, saving } = useProject(projectId);

    const [data, setData] = useState<CompetitiveData>(DEFAULT_DATA);
    const [loaded, setLoaded] = useState(false);
    const debounceRef = useRef<NodeJS.Timeout>(undefined);

    const isUnlocked = completion.revenue;

    useEffect(() => {
        const existing = sections.find((s) => s.section_key === 'competitive');
        if (existing) {
            setData({ ...DEFAULT_DATA, ...(existing.data as Partial<CompetitiveData>) });
        }
        setLoaded(true);
    }, [sections]);

    const update = useCallback(
        (field: keyof CompetitiveData, value: CompetitiveData[keyof CompetitiveData]) => {
            setData((prev) => {
                const updated = { ...prev, [field]: value } as CompetitiveData;
                if (debounceRef.current) clearTimeout(debounceRef.current);
                debounceRef.current = setTimeout(() => {
                    saveSection('competitive', updated, null, false);
                }, 1000);
                return updated;
            });
        },
        [saveSection]
    );

    const handleComplete = async () => {
        await saveSection('competitive', data, null, true);
        router.push(`/dashboard/project/${projectId}/experiment`);
    };

    const isComplete =
        data.competitor_count &&
        data.switching_cost &&
        data.differentiation_clarity &&
        data.key_differentiator.trim().length > 5;

    if (!loaded) return null;

    if (!isUnlocked) {
        return (
            <div className="section-page page-enter">
                <div className="section-page-header">
                    <h2>Competitive Position</h2>
                    <p className="text-secondary">Complete the Revenue Projections section first.</p>
                </div>
                <button className="btn btn-secondary" onClick={() => router.push(`/dashboard/project/${projectId}/revenue`)}>
                    Go to Revenue
                </button>
            </div>
        );
    }

    return (
        <div className="section-page page-enter">
            <div className="section-page-header">
                <h2>Competitive Position</h2>
                <p>Assess the competitive landscape and your differentiation.</p>
            </div>

            <div className="section-form">
                <div className="form-group">
                    <label className="form-label">What is your key differentiator?</label>
                    <textarea
                        className="form-textarea"
                        value={data.key_differentiator}
                        onChange={(e) => update('key_differentiator', e.target.value)}
                        placeholder="What specifically makes your solution different from existing options? Focus on what matters to customers."
                        rows={3}
                    />
                </div>

                <div className="form-group">
                    <label className="form-label">Number of direct competitors</label>
                    <select
                        className="form-select"
                        value={data.competitor_count}
                        onChange={(e) => update('competitor_count', e.target.value)}
                    >
                        <option value="0">None — no direct competitors</option>
                        <option value="1_3">1-3 competitors</option>
                        <option value="4_10">4-10 competitors</option>
                        <option value="10_plus">10+ competitors</option>
                    </select>
                </div>

                <div className="form-group">
                    <label className="form-label">If a customer uses a competitor, how hard is it to switch to you?</label>
                    <select
                        className="form-select"
                        value={data.switching_cost}
                        onChange={(e) => update('switching_cost', e.target.value)}
                    >
                        <option value="high">High — significant effort, data migration, training</option>
                        <option value="moderate">Moderate — some friction but manageable</option>
                        <option value="low">Low — easy to switch</option>
                        <option value="none">None — zero friction to switch</option>
                    </select>
                </div>

                <div className="form-group">
                    <label className="form-label">How clearly differentiated is your product?</label>
                    <select
                        className="form-select"
                        value={data.differentiation_clarity}
                        onChange={(e) => update('differentiation_clarity', e.target.value)}
                    >
                        <option value="unique">Unique — clearly different approach or technology</option>
                        <option value="somewhat_different">Somewhat different — similar but with improvements</option>
                        <option value="similar">Similar — hard to distinguish from competitors</option>
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
                    Continue to Validation Plan
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="9 18 15 12 9 6" />
                    </svg>
                </button>
            </div>
        </div>
    );
}
