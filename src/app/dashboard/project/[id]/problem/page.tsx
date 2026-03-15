'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useProject } from '@/hooks/useProject';
import type { ProblemData } from '@/lib/types';

const DEFAULT_DATA: ProblemData = {
    pain_frequency: 'weekly',
    urgency_level: 'important',
    alternative_availability: 'few_poor',
    problem_specificity: 'somewhat_vague',
    problem_statement: '',
};

export default function ProblemPage() {
    const params = useParams();
    const router = useRouter();
    const projectId = params.id as string;
    const { sections, saveSection, saving } = useProject(projectId);

    const [data, setData] = useState<ProblemData>(DEFAULT_DATA);
    const [loaded, setLoaded] = useState(false);
    const debounceRef = useRef<NodeJS.Timeout>(undefined);

    useEffect(() => {
        const existing = sections.find((s) => s.section_key === 'problem');
        if (existing) {
            setData({ ...DEFAULT_DATA, ...(existing.data as Partial<ProblemData>) });
        }
        setLoaded(true);
    }, [sections]);

    const update = useCallback(
        (field: keyof ProblemData, value: ProblemData[keyof ProblemData]) => {
            setData((prev) => {
                const updated = { ...prev, [field]: value } as ProblemData;
                // Debounced auto-save
                if (debounceRef.current) clearTimeout(debounceRef.current);
                debounceRef.current = setTimeout(() => {
                    saveSection('problem', updated, null, false);
                }, 1000);
                return updated;
            });
        },
        [saveSection]
    );

    const handleComplete = async () => {
        // Calculate a rough score (scoring engine does the real work on the dashboard)
        await saveSection('problem', data, null, true);
        router.push(`/dashboard/project/${projectId}/segment`);
    };

    const isComplete =
        data.pain_frequency &&
        data.urgency_level &&
        data.alternative_availability &&
        data.problem_specificity &&
        data.problem_statement.trim().length > 10;

    if (!loaded) return null;

    return (
        <div className="section-page page-enter">
            <div className="section-page-header">
                <h2>Problem Clarity</h2>
                <p>
                    Define the problem your startup solves. The clearer and more specific,
                    the higher your viability score.
                </p>
            </div>

            <div className="section-form">
                <div className="form-group">
                    <label className="form-label">Problem Statement</label>
                    <textarea
                        className="form-textarea"
                        value={data.problem_statement}
                        onChange={(e) => update('problem_statement', e.target.value)}
                        placeholder="Describe the core problem you're solving in 2-3 sentences. Be specific about who experiences this problem and what the current impact is."
                        rows={4}
                    />
                    <span className="form-hint">
                        Be specific. Avoid vague statements like &quot;people need a better way to...&quot;
                    </span>
                </div>

                <div className="form-group">
                    <label className="form-label">How often do target users experience this problem?</label>
                    <select
                        className="form-select"
                        value={data.pain_frequency}
                        onChange={(e) => update('pain_frequency', e.target.value)}
                    >
                        <option value="daily">Daily — this is a constant pain point</option>
                        <option value="weekly">Weekly — comes up regularly</option>
                        <option value="monthly">Monthly — occasional frustration</option>
                        <option value="rare">Rare — happens infrequently</option>
                    </select>
                </div>

                <div className="form-group">
                    <label className="form-label">How urgent is solving this for your target user?</label>
                    <select
                        className="form-select"
                        value={data.urgency_level}
                        onChange={(e) => update('urgency_level', e.target.value)}
                    >
                        <option value="critical">Critical — actively blocking their goals</option>
                        <option value="important">Important — they want it solved, but can wait</option>
                        <option value="nice_to_have">Nice-to-have — they&apos;d appreciate it, not urgent</option>
                    </select>
                </div>

                <div className="form-group">
                    <label className="form-label">How many alternatives exist today?</label>
                    <select
                        className="form-select"
                        value={data.alternative_availability}
                        onChange={(e) => update('alternative_availability', e.target.value)}
                    >
                        <option value="none">None — no real solution exists</option>
                        <option value="few_poor">Few poor options — workarounds or bad tools</option>
                        <option value="many">Many good options — competitive market</option>
                    </select>
                </div>

                <div className="form-group">
                    <label className="form-label">How specific is your problem definition?</label>
                    <select
                        className="form-select"
                        value={data.problem_specificity}
                        onChange={(e) => update('problem_specificity', e.target.value)}
                    >
                        <option value="clearly_defined">Clearly defined — I can pinpoint exactly who and what</option>
                        <option value="somewhat_vague">Somewhat vague — I have a direction but it&apos;s broad</option>
                        <option value="very_broad">Very broad — applies to many problems at once</option>
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
                    Continue to Target Segment
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="9 18 15 12 9 6" />
                    </svg>
                </button>
            </div>
        </div>
    );
}
