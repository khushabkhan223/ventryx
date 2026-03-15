'use client';

import { Radar } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    RadialLinearScale,
    PointElement,
    LineElement,
    Filler,
    Tooltip,
} from 'chart.js';

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip);

interface RadarChartProps {
    scores: {
        problemStrength: number;
        marketViability: number;
        financialFeasibility: number;
        pricingConfidence: number;
        competitiveRisk: number;
    };
}

export default function RadarChart({ scores }: RadarChartProps) {
    const data = {
        labels: ['Problem', 'Market', 'Financial', 'Pricing', 'Competitive'],
        datasets: [
            {
                label: 'Score',
                data: [
                    scores.problemStrength,
                    scores.marketViability,
                    scores.financialFeasibility,
                    scores.pricingConfidence,
                    scores.competitiveRisk,
                ],
                backgroundColor: 'rgba(59, 130, 246, 0.15)',
                borderColor: '#3b82f6',
                borderWidth: 2,
                pointBackgroundColor: '#3b82f6',
                pointBorderColor: '#12151e',
                pointBorderWidth: 2,
                pointRadius: 5,
            },
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: true,
        scales: {
            r: {
                beginAtZero: true,
                max: 100,
                ticks: {
                    stepSize: 25,
                    color: '#5a6178',
                    backdropColor: 'transparent',
                    font: { size: 10 },
                },
                grid: {
                    color: '#252a3a',
                },
                angleLines: {
                    color: '#252a3a',
                },
                pointLabels: {
                    color: '#8b92a8',
                    font: { size: 12, weight: 500 },
                },
            },
        },
        plugins: {
            tooltip: {
                backgroundColor: '#1a1e2e',
                titleColor: '#e8eaf0',
                bodyColor: '#8b92a8',
                borderColor: '#252a3a',
                borderWidth: 1,
                padding: 12,
            },
        },
    };

    return (
        <div className="chart-container" style={{ maxWidth: 400, margin: '0 auto' }}>
            <Radar data={data} options={options} />
        </div>
    );
}
