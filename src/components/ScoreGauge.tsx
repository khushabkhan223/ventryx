'use client';

import { useEffect, useRef } from 'react';

interface ScoreGaugeProps {
    score: number; // 0-100
    size?: number;
    label?: string;
}

export default function ScoreGauge({ score, size = 200, label }: ScoreGaugeProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const animRef = useRef<number>(0);

    const getColor = (s: number) => {
        if (s >= 70) return '#22c55e';
        if (s >= 40) return '#f59e0b';
        return '#ef4444';
    };

    const getLabel = (s: number) => {
        if (s >= 70) return 'Strong';
        if (s >= 40) return 'Moderate';
        return 'Weak';
    };

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const dpr = window.devicePixelRatio || 1;
        canvas.width = size * dpr;
        canvas.height = size * dpr;
        ctx.scale(dpr, dpr);

        const cx = size / 2;
        const cy = size / 2;
        const radius = size / 2 - 16;
        const lineWidth = 10;
        const startAngle = 0.75 * Math.PI;
        const totalAngle = 1.5 * Math.PI;

        let currentScore = 0;
        const targetScore = score;

        const draw = () => {
            ctx.clearRect(0, 0, size, size);

            // Background arc
            ctx.beginPath();
            ctx.arc(cx, cy, radius, startAngle, startAngle + totalAngle);
            ctx.strokeStyle = '#252a3a';
            ctx.lineWidth = lineWidth;
            ctx.lineCap = 'round';
            ctx.stroke();

            // Score arc
            const scoreAngle = (currentScore / 100) * totalAngle;
            if (scoreAngle > 0) {
                ctx.beginPath();
                ctx.arc(cx, cy, radius, startAngle, startAngle + scoreAngle);
                ctx.strokeStyle = getColor(currentScore);
                ctx.lineWidth = lineWidth;
                ctx.lineCap = 'round';
                ctx.stroke();
            }

            // Score text
            ctx.fillStyle = '#e8eaf0';
            ctx.font = `800 ${size * 0.22}px Inter, sans-serif`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(Math.round(currentScore).toString(), cx, cy - 8);

            // Label
            ctx.fillStyle = '#8b92a8';
            ctx.font = `500 ${size * 0.07}px Inter, sans-serif`;
            ctx.fillText(label ?? getLabel(currentScore), cx, cy + size * 0.14);
        };

        const animate = () => {
            if (currentScore < targetScore) {
                currentScore = Math.min(currentScore + 1.5, targetScore);
                draw();
                animRef.current = requestAnimationFrame(animate);
            } else {
                currentScore = targetScore;
                draw();
            }
        };

        animate();

        return () => {
            if (animRef.current) cancelAnimationFrame(animRef.current);
        };
    }, [score, size, label]);

    return (
        <canvas
            ref={canvasRef}
            style={{ width: size, height: size }}
        />
    );
}
