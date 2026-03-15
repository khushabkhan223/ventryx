'use client';

import { Line } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Filler,
    Tooltip,
    Legend,
} from 'chart.js';
import type { SensitivityResult } from '@/lib/types';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Filler,
    Tooltip,
    Legend
);

interface RevenueChartProps {
    sensitivity: SensitivityResult;
}

export default function RevenueChart({ sensitivity }: RevenueChartProps) {
    const { base, pessimistic } = sensitivity;
    const labels = base.monthly.map((m) => `M${m.month}`);

    const data = {
        labels,
        datasets: [
            {
                label: 'Base Case',
                data: base.monthly.map((m) => m.cumulativeRevenue),
                borderColor: '#3b82f6',
                backgroundColor: 'rgba(59, 130, 246, 0.08)',
                fill: true,
                tension: 0.3,
                pointRadius: 0,
                pointHoverRadius: 4,
                borderWidth: 2,
            },
            {
                label: 'Worst Case',
                data: pessimistic.monthly.map((m) => m.cumulativeRevenue),
                borderColor: '#ef4444',
                backgroundColor: 'rgba(239, 68, 68, 0.05)',
                fill: true,
                tension: 0.3,
                pointRadius: 0,
                pointHoverRadius: 4,
                borderWidth: 2,
                borderDash: [6, 3],
            },
            {
                label: 'Cumulative Costs (Base)',
                data: base.monthly.map((m) => m.cumulativeCosts),
                borderColor: '#f59e0b',
                backgroundColor: 'transparent',
                tension: 0.3,
                pointRadius: 0,
                pointHoverRadius: 4,
                borderWidth: 1.5,
                borderDash: [4, 4],
            },
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
            mode: 'index' as const,
            intersect: false,
        },
        scales: {
            x: {
                grid: { color: '#1a1e2e' },
                ticks: { color: '#5a6178', font: { size: 10 } },
            },
            y: {
                grid: { color: '#1a1e2e' },
                ticks: {
                    color: '#5a6178',
                    font: { size: 10 },
                    callback: (val: number | string) => {
                        const num = typeof val === 'string' ? parseFloat(val) : val;
                        if (num >= 1000000) return `$${(num / 1000000).toFixed(1)}M`;
                        if (num >= 1000) return `$${(num / 1000).toFixed(0)}K`;
                        return `$${num}`;
                    },
                },
            },
        },
        plugins: {
            legend: {
                position: 'bottom' as const,
                labels: {
                    color: '#8b92a8',
                    padding: 16,
                    usePointStyle: true,
                    pointStyleWidth: 8,
                    font: { size: 11 },
                },
            },
            tooltip: {
                backgroundColor: '#1a1e2e',
                titleColor: '#e8eaf0',
                bodyColor: '#8b92a8',
                borderColor: '#252a3a',
                borderWidth: 1,
                padding: 12,
                callbacks: {
                    label: (ctx: unknown) => {
                        const item = ctx as { dataset: { label?: string }; parsed: { y: number | null } };
                        const value = item.parsed.y ?? 0;
                        const formatted = value >= 1000
                            ? `$${(value / 1000).toFixed(1)}K`
                            : `$${value}`;
                        return `${item.dataset.label}: ${formatted}`;
                    },
                },
            },
        },
    };

    return (
        <div style={{ position: 'relative' }}>
            <div className="chart-container" style={{ height: 320 }}>
                <Line data={data} options={options} />
            </div>
            {base.breakEvenMonth && (
                <div
                    className="text-xs"
                    style={{
                        textAlign: 'center',
                        marginTop: 'var(--space-2)',
                        color: 'var(--success)',
                    }}
                >
                    Break-even projected at month {base.breakEvenMonth}
                </div>
            )}
        </div>
    );
}
