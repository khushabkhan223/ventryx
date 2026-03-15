import { supabase } from './supabase';
import type { Project, Section, SectionKey, SectionData } from './types';

// ---- Projects ----

export async function getProjects(userId: string): Promise<Project[]> {
    const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false });

    if (error) throw new Error(error.message);
    return data as Project[];
}

export async function getProject(projectId: string): Promise<Project | null> {
    const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('id', projectId)
        .single();

    if (error) return null;
    return data as Project;
}

export async function createProject(
    userId: string,
    name: string,
    description?: string
): Promise<Project> {
    const { data, error } = await supabase
        .from('projects')
        .insert({ user_id: userId, name, description: description || null })
        .select()
        .single();

    if (error) throw new Error(error.message);
    return data as Project;
}

export async function deleteProject(projectId: string): Promise<void> {
    const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', projectId);

    if (error) throw new Error(error.message);
}

// ---- Sections ----

export async function getSections(projectId: string): Promise<Section[]> {
    const { data, error } = await supabase
        .from('sections')
        .select('*')
        .eq('project_id', projectId)
        .order('updated_at', { ascending: true });

    if (error) throw new Error(error.message);
    return data as Section[];
}

export async function getSection(
    projectId: string,
    sectionKey: SectionKey
): Promise<Section | null> {
    const { data, error } = await supabase
        .from('sections')
        .select('*')
        .eq('project_id', projectId)
        .eq('section_key', sectionKey)
        .single();

    if (error) return null;
    return data as Section;
}

export async function upsertSection(
    projectId: string,
    sectionKey: SectionKey,
    sectionData: SectionData,
    score: number | null,
    completed: boolean
): Promise<Section> {
    const { data, error } = await supabase
        .from('sections')
        .upsert(
            {
                project_id: projectId,
                section_key: sectionKey,
                data: sectionData as unknown as Record<string, unknown>,
                score,
                completed,
                updated_at: new Date().toISOString(),
            },
            { onConflict: 'project_id,section_key' }
        )
        .select()
        .single();

    if (error) throw new Error(error.message);

    // Also update the parent project's updated_at
    await supabase
        .from('projects')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', projectId);

    return data as Section;
}

export async function getProjectCompletion(
    projectId: string
): Promise<{ total: number; completed: number; sections: Record<SectionKey, boolean> }> {
    const sections = await getSections(projectId);
    const sectionMap: Record<string, boolean> = {};
    for (const s of sections) {
        sectionMap[s.section_key] = s.completed;
    }

    return {
        total: 6,
        completed: sections.filter((s) => s.completed).length,
        sections: {
            problem: sectionMap['problem'] ?? false,
            segment: sectionMap['segment'] ?? false,
            pricing: sectionMap['pricing'] ?? false,
            revenue: sectionMap['revenue'] ?? false,
            competitive: sectionMap['competitive'] ?? false,
            experiment: sectionMap['experiment'] ?? false,
        },
    };
}
