'use client';

import { useState, useEffect, useCallback } from 'react';
import type { ScenarioLabel, AdvancedCostInputs, CohortParams } from '@/lib/types';
import { saveScenario, getScenarios } from '@/lib/store-scenarios';

interface ScenarioManagerProps {
    projectId: string;
    activeScenario: ScenarioLabel;
    onScenarioChange: (label: ScenarioLabel) => void;
    baseParams: CohortParams & AdvancedCostInputs;
    isPro: boolean;
}

const LABELS: ScenarioLabel[] = ['base', 'conservative', 'aggressive'];

const LABEL_DISPLAY: Record<ScenarioLabel, string> = {
    base: 'Base',
    conservative: 'Conservative',
    aggressive: 'Aggressive',
};

const LABEL_DESCRIPTION: Record<ScenarioLabel, string> = {
    base: 'Your current input parameters',
    conservative: '-20% traffic, -20% conversion, +20% churn',
    aggressive: '+20% traffic, +20% conversion, -20% churn',
};

export default function ScenarioManager({
    projectId,
    activeScenario,
    onScenarioChange,
    baseParams,
    isPro,
}: ScenarioManagerProps) {
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState<Record<ScenarioLabel, boolean>>({
        base: false,
        conservative: false,
        aggressive: false,
    });

    // Load saved state on mount
    useEffect(() => {
        if (!isPro) return;
        getScenarios(projectId).then((scenarios) => {
            const map: Record<ScenarioLabel, boolean> = { base: false, conservative: false, aggressive: false };
            for (const s of scenarios) {
                if (LABELS.includes(s.label)) {
                    map[s.label] = true;
                }
            }
            setSaved(map);
        });
    }, [projectId, isPro]);

    const handleSave = useCallback(async () => {
        if (!isPro) return;
        setSaving(true);
        const { error } = await saveScenario(projectId, activeScenario, baseParams);
        if (!error) {
            setSaved((prev) => ({ ...prev, [activeScenario]: true }));
        }
        setSaving(false);
    }, [projectId, activeScenario, baseParams, isPro]);

    return (
        <div className="card" style={{ padding: 'var(--space-5)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-4)' }}>
                <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 600, margin: 0 }}>
                    Scenario Analysis
                </h3>
                <button
                    className="btn btn-secondary btn-sm"
                    onClick={handleSave}
                    disabled={saving}
                >
                    {saving ? 'Saving...' : saved[activeScenario] ? 'Update Scenario' : 'Save Scenario'}
                </button>
            </div>

            <div className="scenario-tabs">
                {LABELS.map((label) => (
                    <button
                        key={label}
                        className={`scenario-tab ${activeScenario === label ? 'active' : ''}`}
                        onClick={() => onScenarioChange(label)}
                    >
                        <span className="scenario-tab-label">{LABEL_DISPLAY[label]}</span>
                        <span className="scenario-tab-desc">{LABEL_DESCRIPTION[label]}</span>
                        {saved[label] && (
                            <span className="scenario-saved-dot" title="Saved" />
                        )}
                    </button>
                ))}
            </div>
        </div>
    );
}
