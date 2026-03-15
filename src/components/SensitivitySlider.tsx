'use client';

interface SensitivitySliderProps {
    label: string;
    value: number; // modifier e.g. 0 = base, -0.2 to 0.2
    onChange: (value: number) => void;
    unit?: string;
}

export default function SensitivitySlider({
    label,
    value,
    onChange,
    unit = '%',
}: SensitivitySliderProps) {
    const displayValue = Math.round(value * 100);

    return (
        <div className="sensitivity-slider">
            <div className="sensitivity-slider-header">
                <span className="text-secondary">{label}</span>
                <span
                    style={{
                        color:
                            displayValue > 0
                                ? 'var(--success)'
                                : displayValue < 0
                                    ? 'var(--danger)'
                                    : 'var(--text-secondary)',
                        fontWeight: 600,
                    }}
                >
                    {displayValue > 0 ? '+' : ''}
                    {displayValue}{unit}
                </span>
            </div>
            <input
                type="range"
                min={-20}
                max={20}
                value={displayValue}
                onChange={(e) => onChange(parseInt(e.target.value) / 100)}
            />
        </div>
    );
}
