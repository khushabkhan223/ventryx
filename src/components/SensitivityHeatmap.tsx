'use client';

import type { SensitivityHeatmapCell } from '@/lib/types';

interface SensitivityHeatmapProps {
    cells: SensitivityHeatmapCell[][];
    conversionTiers: number[];
    churnTiers: number[];
}

const COLORS: Record<string, string> = {
    unsustainable: '#ef4444',
    fragile: '#f59e0b',
    healthy: '#22c55e',
    strong: '#3b82f6',
};

const BG_COLORS: Record<string, string> = {
    unsustainable: 'rgba(239, 68, 68, 0.15)',
    fragile: 'rgba(245, 158, 11, 0.15)',
    healthy: 'rgba(34, 197, 94, 0.15)',
    strong: 'rgba(59, 130, 246, 0.15)',
};

export default function SensitivityHeatmap({ cells, conversionTiers, churnTiers }: SensitivityHeatmapProps) {
    return (
        <div className="card" style={{ padding: 'var(--space-5)' }}>
            <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 600, marginBottom: 'var(--space-1)' }}>
                Sensitivity Matrix — LTV:CAC
            </h3>
            <p className="text-sm text-secondary" style={{ marginBottom: 'var(--space-4)' }}>
                How LTV:CAC ratio changes across conversion rate and churn combinations
            </p>

            <div style={{ overflowX: 'auto' }}>
                <table className="heatmap-table">
                    <thead>
                        <tr>
                            <th className="heatmap-corner">
                                <span className="heatmap-axis-label">Churn ↓ / Conv →</span>
                            </th>
                            {conversionTiers.map((conv) => (
                                <th key={conv} className="heatmap-header">{conv}%</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {cells.map((row, ri) => (
                            <tr key={churnTiers[ri]}>
                                <td className="heatmap-row-label">{churnTiers[ri]}%</td>
                                {row.map((cell, ci) => (
                                    <td
                                        key={ci}
                                        className="heatmap-cell"
                                        style={{
                                            backgroundColor: BG_COLORS[cell.classification],
                                            color: COLORS[cell.classification],
                                        }}
                                        title={`Conversion: ${cell.conversionRate}%, Churn: ${cell.churnRate}%, LTV:CAC: ${cell.ltvCacRatio}×`}
                                    >
                                        {cell.ltvCacRatio}×
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="heatmap-legend">
                {(['unsustainable', 'fragile', 'healthy', 'strong'] as const).map((cls) => (
                    <div key={cls} className="heatmap-legend-item">
                        <span
                            className="heatmap-legend-dot"
                            style={{ backgroundColor: COLORS[cls] }}
                        />
                        <span className="text-xs text-secondary" style={{ textTransform: 'capitalize' }}>
                            {cls === 'unsustainable' ? '<1× Unsustainable' :
                                cls === 'fragile' ? '1–3× Fragile' :
                                    cls === 'healthy' ? '3–5× Healthy' : '>5× Strong'}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}
