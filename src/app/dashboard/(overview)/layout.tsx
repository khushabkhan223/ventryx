'use client';

import Sidebar from '@/components/Sidebar';

export default function OverviewLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="app-layout">
            <Sidebar />
            <main className="app-content page-enter">{children}</main>
        </div>
    );
}
