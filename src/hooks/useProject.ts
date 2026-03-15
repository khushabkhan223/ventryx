'use client';

import { useState, useEffect, useCallback } from 'react';
import { getProject, getSections, upsertSection, getProjectCompletion } from '@/lib/store';
import type { Project, Section, SectionKey, SectionData } from '@/lib/types';

interface UseProjectReturn {
    project: Project | null;
    sections: Section[];
    completion: Record<SectionKey, boolean>;
    completedCount: number;
    loading: boolean;
    saving: boolean;
    error: string | null;
    saveSection: (
        sectionKey: SectionKey,
        data: SectionData,
        score: number | null,
        completed: boolean
    ) => Promise<void>;
    refresh: () => Promise<void>;
}

export function useProject(projectId: string): UseProjectReturn {
    const [project, setProject] = useState<Project | null>(null);
    const [sections, setSections] = useState<Section[]>([]);
    const [completion, setCompletion] = useState<Record<SectionKey, boolean>>({
        problem: false,
        segment: false,
        pricing: false,
        revenue: false,
        competitive: false,
        experiment: false,
    });
    const [completedCount, setCompletedCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const refresh = useCallback(async () => {
        try {
            const [proj, sects, comp] = await Promise.all([
                getProject(projectId),
                getSections(projectId),
                getProjectCompletion(projectId),
            ]);
            setProject(proj);
            setSections(sects);
            setCompletion(comp.sections);
            setCompletedCount(comp.completed);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load project');
        }
    }, [projectId]);

    useEffect(() => {
        setLoading(true);
        refresh().finally(() => setLoading(false));
    }, [refresh]);

    const saveSection = useCallback(
        async (
            sectionKey: SectionKey,
            data: SectionData,
            score: number | null,
            completed: boolean
        ) => {
            setSaving(true);
            try {
                await upsertSection(projectId, sectionKey, data, score, completed);
                await refresh();
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to save');
            } finally {
                setSaving(false);
            }
        },
        [projectId, refresh]
    );

    return {
        project,
        sections,
        completion,
        completedCount,
        loading,
        saving,
        error,
        saveSection,
        refresh,
    };
}
