'use client';

import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/lib/auth';
import { getProjects, createProject, getProjectCompletion } from '@/lib/store';
import ProjectCard from '@/components/ProjectCard';
import type { Project } from '@/lib/types';

interface ProjectWithCompletion extends Project {
    completedSections: number;
}

export default function DashboardPage() {
    const { user } = useAuth();
    const [projects, setProjects] = useState<ProjectWithCompletion[]>([]);
    const [loading, setLoading] = useState(true);
    const [showNew, setShowNew] = useState(false);
    const [newName, setNewName] = useState('');
    const [newDesc, setNewDesc] = useState('');
    const [creating, setCreating] = useState(false);

    const loadProjects = useCallback(async () => {
        if (!user) return;
        try {
            const projs = await getProjects(user.id);
            const withCompletion = await Promise.all(
                projs.map(async (p) => {
                    const comp = await getProjectCompletion(p.id);
                    return { ...p, completedSections: comp.completed };
                })
            );
            setProjects(withCompletion);
        } catch {
            // handle silently
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        if (!user) return;
        loadProjects();
    }, [user, loadProjects]);

    const handleCreate = async () => {
        if (!user || !newName.trim()) return;
        setCreating(true);
        try {
            await createProject(user.id, newName.trim(), newDesc.trim() || undefined);
            setNewName('');
            setNewDesc('');
            setShowNew(false);
            await loadProjects();
        } catch {
            // handle
        } finally {
            setCreating(false);
        }
    };

    if (loading) {
        return (
            <div>
                <div className="page-header">
                    <h1>Your Projects</h1>
                    <p>Validate startup ideas with structured analysis</p>
                </div>
                <div className="projects-grid">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="skeleton" style={{ height: 180, borderRadius: 'var(--radius-lg)' }} />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div>
            <div className="page-header">
                <h1>Your Projects</h1>
                <p>Validate startup ideas with structured analysis</p>
            </div>

            <div className="projects-grid">
                {projects.map((project) => (
                    <ProjectCard
                        key={project.id}
                        project={project}
                        completedSections={project.completedSections}
                    />
                ))}

                {showNew ? (
                    <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                        <div className="form-group">
                            <label className="form-label">Project Name</label>
                            <input
                                className="form-input"
                                value={newName}
                                onChange={(e) => setNewName(e.target.value)}
                                placeholder="My Startup Idea"
                                autoFocus
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Description (optional)</label>
                            <textarea
                                className="form-textarea"
                                value={newDesc}
                                onChange={(e) => setNewDesc(e.target.value)}
                                placeholder="Brief description of your idea..."
                                rows={3}
                            />
                        </div>
                        <div className="flex gap-3">
                            <button
                                className="btn btn-primary"
                                onClick={handleCreate}
                                disabled={!newName.trim() || creating}
                            >
                                {creating ? 'Creating...' : 'Create Project'}
                            </button>
                            <button
                                className="btn btn-secondary"
                                onClick={() => setShowNew(false)}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                ) : (
                    <div
                        className="new-project-card"
                        onClick={() => setShowNew(true)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => e.key === 'Enter' && setShowNew(true)}
                    >
                        <div className="new-project-inner">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="12" y1="5" x2="12" y2="19" />
                                <line x1="5" y1="12" x2="19" y2="12" />
                            </svg>
                            <div className="text-sm">New Project</div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
