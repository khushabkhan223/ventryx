/* ========================================
   Ventryx — Scenario CRUD (Supabase)
   Pro-only, server-side enforcement
   ======================================== */

import { supabase } from './supabase';
import type { Scenario, ScenarioLabel, ScenarioParams } from './types';

const VALID_LABELS: ScenarioLabel[] = ['base', 'conservative', 'aggressive'];

/**
 * Fetch all scenarios for a project. Returns empty array if Free user.
 */
export async function getScenarios(projectId: string): Promise<Scenario[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
        .from('scenarios')
        .select('*')
        .eq('project_id', projectId)
        .order('label');

    if (error) {
        console.error('Failed to fetch scenarios:', error.message);
        return [];
    }

    return (data ?? []) as Scenario[];
}

/**
 * Upsert a scenario. Uses UNIQUE(project_id, label) constraint.
 * Validates label is one of the 3 allowed values.
 */
export async function saveScenario(
    projectId: string,
    label: ScenarioLabel,
    params: Omit<ScenarioParams, 'label'>
): Promise<{ error: string | null }> {
    if (!VALID_LABELS.includes(label)) {
        return { error: `Invalid scenario label: ${label}` };
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: 'Not authenticated' };

    const { error } = await supabase
        .from('scenarios')
        .upsert(
            {
                project_id: projectId,
                label,
                params,
                updated_at: new Date().toISOString(),
            },
            { onConflict: 'project_id,label' }
        );

    if (error) {
        return { error: error.message };
    }

    return { error: null };
}

/**
 * Delete a scenario by project ID and label.
 */
export async function deleteScenario(
    projectId: string,
    label: ScenarioLabel
): Promise<{ error: string | null }> {
    if (!VALID_LABELS.includes(label)) {
        return { error: `Invalid scenario label: ${label}` };
    }

    const { error } = await supabase
        .from('scenarios')
        .delete()
        .eq('project_id', projectId)
        .eq('label', label);

    if (error) {
        return { error: error.message };
    }

    return { error: null };
}
