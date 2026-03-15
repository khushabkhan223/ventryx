'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useProject } from '@/hooks/useProject';
import type { SegmentData } from '@/lib/types';

const DEFAULT_DATA: SegmentData = {
    audience_size_tier: 'niche',
    distribution_clarity: 'some_ideas',
    channel_realism: 'unproven',
    target_description: '',
};

export default function SegmentPage() {
    const params = useParams();
    const router = useRouter();
    const projectId = params.id as string;
    const { sections, completion, saveSection, saving } = useProject(projectId);

    const [data, setData] = useState<SegmentData>(DEFAULT_DATA);
    const [loaded, setLoaded] = useState(false);
    const debounceRef = useRef<NodeJS.Timeout>(undefined);

    // Check prerequisite
    const isUnlocked = completion.problem;

    useEffect(() => {
        const existing = sections.find((s) => s.section_key === 'segment');
        if (existing) {
            setData({ ...DEFAULT_DATA, ...(existing.data as Partial<SegmentData>) });
        }
        setLoaded(true);
    }, [sections]);

    const update = useCallback(
        (field: keyof SegmentData, value: SegmentData[keyof SegmentData]) => {
            setData((prev) => {
                const updated = { ...prev, [field]: value } as SegmentData;
                if (debounceRef.current) clearTimeout(debounceRef.current);
                debounceRef.current = setTimeout(() => {
                    saveSection('segment', updated, null, false);
                }, 1000);
                return updated;
            });
        },
        [saveSection]
    );

    const handleComplete = async () => {
        await saveSection('segment', data, null, true);
        router.push(`/dashboard/project/${projectId}/pricing`);
    };

    const isComplete =
        data.audience_size_tier &&
        data.distribution_clarity &&
        data.channel_realism &&
        data.target_description.trim().length > 10;

    if (!loaded) return null;

    if (!isUnlocked) {
        return (
            <div className="section-page page-enter">
                <div className="section-page-header">
                    <h2>Target Segment</h2>
                    <p className="text-secondary">Complete the Problem Clarity section first to unlock this step.</p>
                </div>
                <button className="btn btn-secondary" onClick={() => router.push(`/dashboard/project/${projectId}/problem`)}>
                    Go to Problem Clarity
                </button>
            </div>
        );
    }

    return (
        <div className="section-page page-enter">
            <div className="section-page-header">
                <h2>Target Segment</h2>
                <p>Define who you&apos;re building for and how you&apos;ll reach them.</p>
            </div>

            <div className="section-form">
                <div className="form-group">
                    <label className="form-label">Describe your target segment</label>
                    <textarea
                        className="form-textarea"
                        value={data.target_description}
                        onChange={(e) => update('target_description', e.target.value)}
                        placeholder="Who exactly is your ideal customer? Be specific about demographics, role, industry, and behavior patterns."
                        rows={4}
                    />
                </div>

                <div className="form-group">
                    <label className="form-label">Estimated audience size</label>
                    <select
                        className="form-select"
                        value={data.audience_size_tier}
                        onChange={(e) => update('audience_size_tier', e.target.value)}
                    >
                        <option value="micro">Micro (&lt;1,000 potential customers)</option>
                        <option value="niche">Niche (1,000 - 100,000 potential customers)</option>
                        <option value="mass">Mass (100,000+ potential customers)</option>
                    </select>
                </div>

                <div className="form-group">
                    <label className="form-label">How clear is your distribution channel?</label>
                    <select
                        className="form-select"
                        value={data.distribution_clarity}
                        onChange={(e) => update('distribution_clarity', e.target.value)}
                    >
                        <option value="clear_channel">Clear channel — I know exactly where to find them</option>
                        <option value="some_ideas">Some ideas — I have theories to test</option>
                        <option value="no_plan">No plan — I haven&apos;t figured this out yet</option>
                    </select>
                </div>

                <div className="form-group">
                    <label className="form-label">How proven is this acquisition channel?</label>
                    <select
                        className="form-select"
                        value={data.channel_realism}
                        onChange={(e) => update('channel_realism', e.target.value)}
                    >
                        <option value="proven">Proven — others have successfully used this channel</option>
                        <option value="unproven">Unproven — plausible but not validated</option>
                        <option value="speculative">Speculative — mostly guesswork</option>
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
                    Continue to Pricing
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="9 18 15 12 9 6" />
                    </svg>
                </button>
            </div>
        </div>
    );
}
