'use client';

import { ReactNode, useState } from 'react';

interface TooltipProps {
    content: string;
    children: ReactNode;
}

export default function Tooltip({ content, children }: TooltipProps) {
    const [visible, setVisible] = useState(false);

    return (
        <div
            className="tooltip-wrapper"
            onMouseEnter={() => setVisible(true)}
            onMouseLeave={() => setVisible(false)}
        >
            <span className="tooltip-trigger">{children}</span>
            <div
                className="tooltip-content"
                style={{ opacity: visible ? 1 : 0 }}
            >
                {content}
            </div>
        </div>
    );
}
