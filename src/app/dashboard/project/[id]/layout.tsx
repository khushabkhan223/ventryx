'use client';

import { type ReactNode } from 'react';
import { useParams } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import { useProject } from '@/hooks/useProject';

export default function ProjectLayout({ children }: { children: ReactNode }) {
    const params = useParams();
    const projectId = params.id as string;
    const { completion } = useProject(projectId);

    return (
        <div className="app-layout">
            <Sidebar projectId={projectId} completion={completion} />
            <main className="app-content page-enter">{children}</main>
        </div>
    );
}
