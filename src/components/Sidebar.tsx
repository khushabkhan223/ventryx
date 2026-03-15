'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { SECTION_LABELS, SECTION_ORDER, type SectionKey } from '@/lib/types';

interface SidebarProps {
    projectId?: string;
    completion?: Record<SectionKey, boolean>;
}

export default function Sidebar({ projectId, completion }: SidebarProps) {
    const pathname = usePathname();
    const { profile, logout, isPro } = useAuth();

    const isActive = (path: string) => pathname === path;

    return (
        <aside className="app-sidebar">
            <div className="sidebar-header">
                <Link href="/dashboard" className="sidebar-logo">
                    Ventryx
                </Link>
            </div>

            <nav className="sidebar-nav">
                <Link
                    href="/dashboard"
                    className={`sidebar-link ${isActive('/dashboard') ? 'active' : ''}`}
                >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="3" width="7" height="9" />
                        <rect x="14" y="3" width="7" height="5" />
                        <rect x="14" y="12" width="7" height="9" />
                        <rect x="3" y="16" width="7" height="5" />
                    </svg>
                    Projects
                </Link>

                {projectId && (
                    <>
                        <div className="sidebar-section-title">Validation Sections</div>
                        {SECTION_ORDER.map((key) => {
                            const sectionPath = `/dashboard/project/${projectId}/${key}`;
                            const isCompleted = completion?.[key] ?? false;
                            const isCurrent = pathname === sectionPath;

                            return (
                                <Link
                                    key={key}
                                    href={sectionPath}
                                    className={`sidebar-link ${isCurrent ? 'active' : ''}`}
                                >
                                    <span className="section-step">
                                        <span
                                            className={`section-step-dot ${isCompleted ? 'completed' : isCurrent ? 'active' : ''
                                                }`}
                                        />
                                    </span>
                                    {SECTION_LABELS[key]}
                                </Link>
                            );
                        })}

                        <div style={{ marginTop: 'var(--space-2)' }}>
                            <Link
                                href={`/dashboard/project/${projectId}`}
                                className={`sidebar-link ${isActive(`/dashboard/project/${projectId}`) ? 'active' : ''
                                    }`}
                            >
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                                </svg>
                                Results Dashboard
                            </Link>
                        </div>
                    </>
                )}
            </nav>

            <div className="sidebar-footer">
                {!isPro && (
                    <Link href="/upgrade" className="btn btn-secondary btn-sm" style={{ width: '100%', marginBottom: 'var(--space-3)' }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                        </svg>
                        Upgrade to Pro
                    </Link>
                )}
                {isPro && (
                    <span className="sidebar-pro-label">
                        Professional Mode
                    </span>
                )}

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span className="text-sm text-secondary" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {profile?.full_name ?? 'User'}
                    </span>
                    <button onClick={logout} className="btn btn-ghost btn-sm">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                            <polyline points="16 17 21 12 16 7" />
                            <line x1="21" y1="12" x2="9" y2="12" />
                        </svg>
                    </button>
                </div>
            </div>
        </aside>
    );
}
