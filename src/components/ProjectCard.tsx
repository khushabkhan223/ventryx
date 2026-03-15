'use client';

import { useRouter } from 'next/navigation';
import type { Project } from '@/lib/types';

interface ProjectCardProps {
    project: Project;
    completedSections: number;
}

export default function ProjectCard({ project, completedSections }: ProjectCardProps) {
    const router = useRouter();
    const dots = Array.from({ length: 6 }, (_, i) => i < completedSections);

    const timeAgo = (dateStr: string) => {
        const diff = Date.now() - new Date(dateStr).getTime();
        const days = Math.floor(diff / 86400000);
        if (days === 0) return 'Today';
        if (days === 1) return 'Yesterday';
        if (days < 7) return `${days} days ago`;
        if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
        return `${Math.floor(days / 30)} months ago`;
    };

    return (
        <div
            className="card project-card"
            onClick={() => {
                const dest = completedSections === 6
                    ? `/dashboard/project/${project.id}`
                    : `/dashboard/project/${project.id}/problem`;
                router.push(dest);
            }}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
                if (e.key === 'Enter') {
                    router.push(`/dashboard/project/${project.id}/problem`);
                }
            }}
        >
            <div className="project-card-header">
                <span className="project-card-name">{project.name}</span>
                <span className="project-card-date">{timeAgo(project.updated_at)}</span>
            </div>

            {project.description && (
                <p className="project-card-desc">{project.description}</p>
            )}

            <div className="project-card-progress">
                {dots.map((filled, i) => (
                    <div
                        key={i}
                        className={`project-card-progress-dot ${filled ? 'filled' : ''}`}
                    />
                ))}
            </div>
            <span className="text-xs text-secondary" style={{ marginTop: 'var(--space-2)', display: 'block' }}>
                {completedSections}/6 sections
            </span>
        </div>
    );
}
