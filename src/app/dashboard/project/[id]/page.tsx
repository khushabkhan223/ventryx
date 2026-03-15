'use client';

import { useState, useMemo, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { useProject } from '@/hooks/useProject';
import { useSubscription } from '@/hooks/useSubscription';
import { calculateScores } from '@/lib/scoring';
import {
    runSensitivity,
    simulateAdvancedFinancials,
    generateSensitivityHeatmap,
    applyScenarioAdjustments,
} from '@/lib/financial';
import ScoreGauge from '@/components/ScoreGauge';
import RadarChart from '@/components/RadarChart';
import RevenueChart from '@/components/RevenueChart';
import RiskMeter from '@/components/RiskMeter';
import SensitivitySlider from '@/components/SensitivitySlider';
import WeakestDrilldown from '@/components/WeakestDrilldown';
import UpgradeModal from '@/components/UpgradeModal';
import Tooltip from '@/components/Tooltip';
import ProGate from '@/components/ProGate';
import AdvancedCostPanel from '@/components/AdvancedCostPanel';
import ScenarioManager from '@/components/ScenarioManager';
import SensitivityHeatmap from '@/components/SensitivityHeatmap';
import ExecutiveMemo from '@/components/ExecutiveMemo';
import type {
    ProblemData,
    SegmentData,
    PricingData,
    RevenueData,
    CompetitiveData,
    AdvancedCostInputs,
    ScenarioLabel,
    ExecutiveMemoPayload,
} from '@/lib/types';

const CATEGORY_DISPLAY: Record<string, string> = {
    problemStrength: 'Problem Strength',
    marketViability: 'Market Viability',
    financialFeasibility: 'Financial Feasibility',
    pricingConfidence: 'Pricing Confidence',
    competitiveRisk: 'Competitive Risk',
};

const CATEGORY_WEIGHTS: Record<string, string> = {
    problemStrength: '25%',
    marketViability: '20%',
    financialFeasibility: '25%',
    pricingConfidence: '15%',
    competitiveRisk: '15%',
};

const DEFAULT_COSTS: AdvancedCostInputs = {
    buildCost: 0,
    monthlyOperatingCosts: 0,
    monthlyMarketingBudget: 0,
    teamCost: 0,
    initialCapital: 0,
};

export default function ProjectResultsPage() {
    const params = useParams();
    const projectId = params.id as string;
    const { project, sections, completedCount, loading } = useProject(projectId);
    const { isPro } = useSubscription();

    const [showUpgrade, setShowUpgrade] = useState(false);
    const [trafficMod, setTrafficMod] = useState(0);
    const [conversionMod, setConversionMod] = useState(0);
    const [churnMod, setChurnMod] = useState(0);

    // Pro state
    const [advancedCosts, setAdvancedCosts] = useState<AdvancedCostInputs>(DEFAULT_COSTS);
    const [activeScenario, setActiveScenario] = useState<ScenarioLabel>('base');

    // Extract section data
    const sectionData = useMemo(() => {
        const map: Record<string, Record<string, unknown>> = {};
        for (const s of sections) {
            map[s.section_key] = s.data;
        }
        return map;
    }, [sections]);

    const problemData = sectionData['problem'] as unknown as ProblemData | undefined;
    const segmentData = sectionData['segment'] as unknown as SegmentData | undefined;
    const pricingData = sectionData['pricing'] as unknown as PricingData | undefined;
    const revenueData = sectionData['revenue'] as unknown as RevenueData | undefined;
    const competitiveData = sectionData['competitive'] as unknown as CompetitiveData | undefined;

    // Financial model with sensitivity
    const sensitivity = useMemo(() => {
        if (!revenueData || !pricingData) return null;

        const avgModifier = Math.max(
            Math.abs(trafficMod),
            Math.abs(conversionMod),
            Math.abs(churnMod)
        ) || 0.2;

        return runSensitivity(
            {
                monthlyTraffic: Math.round(
                    (revenueData.monthly_traffic || 1000) * (1 + trafficMod)
                ),
                conversionRate: parseFloat(
                    ((revenueData.conversion_rate || 2) * (1 + conversionMod)).toFixed(2)
                ),
                churnRate: parseFloat(
                    ((revenueData.churn_rate || 5) * (1 - churnMod)).toFixed(2) // negative mod = higher churn
                ),
                pricePerMonth: pricingData.price_point || 29,
                cac: revenueData.customer_acquisition_cost || 50,
                fixedCosts: revenueData.fixed_costs || 2000,
            },
            avgModifier
        );
    }, [revenueData, pricingData, trafficMod, conversionMod, churnMod]);

    // Pro: Advanced financials with scenario engine
    const advancedResult = useMemo(() => {
        if (!revenueData || !pricingData) return null;

        const baseParams = {
            monthlyTraffic: revenueData.monthly_traffic || 1000,
            conversionRate: revenueData.conversion_rate || 2,
            churnRate: revenueData.churn_rate || 5,
            pricePerMonth: pricingData.price_point || 29,
            cac: revenueData.customer_acquisition_cost || 50,
            fixedCosts: revenueData.fixed_costs || 2000,
            ...advancedCosts,
        };

        const adjusted = applyScenarioAdjustments(baseParams, activeScenario);
        return simulateAdvancedFinancials({ ...adjusted, label: activeScenario });
    }, [revenueData, pricingData, advancedCosts, activeScenario]);

    // Pro: Sensitivity heatmap
    const heatmapData = useMemo(() => {
        if (!revenueData || !pricingData) return null;
        return generateSensitivityHeatmap({
            monthlyTraffic: revenueData.monthly_traffic || 1000,
            conversionRate: revenueData.conversion_rate || 2,
            churnRate: revenueData.churn_rate || 5,
            pricePerMonth: pricingData.price_point || 29,
            cac: revenueData.customer_acquisition_cost || 50,
            fixedCosts: revenueData.fixed_costs || 2000,
        });
    }, [revenueData, pricingData]);

    // Scoring — must come before memoPayload
    const scoringResult = useMemo(() => {
        if (!problemData || !segmentData || !pricingData || !competitiveData || !sensitivity) {
            return null;
        }
        return calculateScores(
            problemData,
            segmentData,
            pricingData,
            competitiveData,
            sensitivity.base
        );
    }, [problemData, segmentData, pricingData, competitiveData, sensitivity]);

    // Pro: Executive memo payload
    const memoPayload = useMemo((): ExecutiveMemoPayload | null => {
        if (!scoringResult || !advancedResult) return null;
        return {
            viabilityIndex: scoringResult.viabilityIndex,
            categoryScores: Object.fromEntries(
                Object.entries(scoringResult.categories).map(([k, v]) => [CATEGORY_DISPLAY[k] || k, v.score])
            ),
            riskFlags: scoringResult.riskFlags,
            weakestAssumption: {
                category: scoringResult.weakestAssumption.category,
                score: scoringResult.weakestAssumption.score,
            },
            strongestAssumption: {
                category: scoringResult.strongestAssumption.category,
                score: scoringResult.strongestAssumption.score,
            },
            breakEvenMonth: advancedResult.breakEvenMonth,
            runwayMonths: advancedResult.runwayMonths,
            ltvCacRatio: advancedResult.ltvCacRatio,
            ltvCacLabel: advancedResult.ltvCacLabel,
            churnRate: revenueData?.churn_rate || 5,
            capitalRequired: advancedResult.capitalRequired,
            capitalEfficiencyScore: advancedResult.capitalEfficiencyScore,
            capitalEfficiencyLabel: advancedResult.capitalEfficiencyLabel,
            scenarioSummary: (['base', 'conservative', 'aggressive'] as const).map((label) => {
                const p = applyScenarioAdjustments(
                    {
                        monthlyTraffic: revenueData?.monthly_traffic || 1000,
                        conversionRate: revenueData?.conversion_rate || 2,
                        churnRate: revenueData?.churn_rate || 5,
                        pricePerMonth: pricingData?.price_point || 29,
                        cac: revenueData?.customer_acquisition_cost || 50,
                        fixedCosts: revenueData?.fixed_costs || 2000,
                        ...advancedCosts,
                    },
                    label
                );
                const r = simulateAdvancedFinancials({ ...p, label });
                return {
                    label,
                    breakEvenMonth: r.breakEvenMonth,
                    runwayMonths: r.runwayMonths,
                    ltvCacRatio: r.ltvCacRatio,
                };
            }),
        };
    }, [scoringResult, advancedResult, revenueData, pricingData, advancedCosts]);


    const handleExport = useCallback(async () => {
        if (!isPro) {
            setShowUpgrade(true);
            return;
        }

        // Dynamic import html2pdf.js
        const html2pdf = (await import('html2pdf.js')).default;
        const element = document.getElementById('viability-report');
        if (!element) return;

        html2pdf()
            .set({
                margin: [15, 15, 20, 15],
                filename: `${project?.name ?? 'ventryx'}-validation-report.pdf`,
                image: { type: 'jpeg', quality: 0.98 },
                html2canvas: { scale: 2, backgroundColor: '#0b0e14', useCORS: true },
                jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
            })
            .from(element)
            .save();
    }, [isPro, project]);

    if (loading) {
        return (
            <div className="page-enter">
                <div className="page-header">
                    <div className="skeleton" style={{ height: 32, width: 300, marginBottom: 'var(--space-3)' }} />
                    <div className="skeleton" style={{ height: 16, width: 200 }} />
                </div>
                <div className="skeleton" style={{ height: 400, borderRadius: 'var(--radius-lg)' }} />
            </div>
        );
    }

    if (completedCount < 6) {
        return (
            <div className="page-enter" style={{ textAlign: 'center', paddingTop: 'var(--space-8)' }}>
                <h2>Validation In Progress</h2>
                <p className="text-secondary" style={{ marginTop: 'var(--space-3)', marginBottom: 'var(--space-6)' }}>
                    Complete all 6 sections to see your full results dashboard.
                </p>
                <div className="flex justify-center gap-4">
                    <span className="text-lg" style={{ fontWeight: 700 }}>
                        {completedCount}/6
                    </span>
                    <span className="text-secondary">sections completed</span>
                </div>
                <div
                    style={{
                        display: 'flex',
                        gap: 'var(--space-2)',
                        justifyContent: 'center',
                        marginTop: 'var(--space-4)',
                    }}
                >
                    {Array.from({ length: 6 }, (_, i) => (
                        <div
                            key={i}
                            style={{
                                width: 40,
                                height: 4,
                                borderRadius: 2,
                                background: i < completedCount ? 'var(--accent)' : 'var(--border)',
                            }}
                        />
                    ))}
                </div>
            </div>
        );
    }

    if (!scoringResult || !sensitivity) {
        return (
            <div className="page-enter" style={{ textAlign: 'center', paddingTop: 'var(--space-8)' }}>
                <h2>Unable to calculate scores</h2>
                <p className="text-secondary">Some section data may be missing. Please review all sections.</p>
            </div>
        );
    }

    return (
        <div className="page-enter" id="viability-report">
            {/* PDF Header — only visible in PDF export */}
            <div className="pdf-header">
                <div className="pdf-header-brand">Ventryx</div>
                <div className="pdf-header-subtitle">Startup Validation Report</div>
                {isPro && <div className="pdf-header-pro">Professional Analysis</div>}
            </div>

            {/* Professional Mode Label */}
            {isPro && (
                <div className="pro-mode-label">
                    Professional Mode
                </div>
            )}

            {/* Hero */}
            <div className="viability-hero">
                <ScoreGauge score={scoringResult.viabilityIndex} size={220} />
                <h1 style={{ marginTop: 'var(--space-4)' }}>Viability Index</h1>
                <div style={{ marginTop: 'var(--space-3)' }}>
                    <span
                        className={`badge ${scoringResult.recommendation === 'Proceed'
                            ? 'badge-success'
                            : scoringResult.recommendation === 'Validate Further'
                                ? 'badge-warning'
                                : 'badge-danger'
                            }`}
                        style={{ fontSize: 'var(--text-sm)', padding: 'var(--space-2) var(--space-4)' }}
                    >
                        {scoringResult.recommendation}
                    </span>
                </div>
                <p className="text-secondary" style={{ marginTop: 'var(--space-3)', maxWidth: 600, margin: 'var(--space-3) auto 0' }}>
                    {scoringResult.recommendation === 'Proceed'
                        ? 'Your idea shows strong fundamentals. Focus on execution and speed to market.'
                        : scoringResult.recommendation === 'Validate Further'
                            ? 'Promising signals, but key assumptions need validation before committing resources.'
                            : 'Significant risks identified. Consider pivoting or addressing the weakest areas first.'}
                </p>
            </div>

            {/* Categories: Radar + Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-6)', marginTop: 'var(--space-6)' }}>
                <div className="card">
                    <h3 style={{ marginBottom: 'var(--space-4)' }}>Category Breakdown</h3>
                    <RadarChart
                        scores={{
                            problemStrength: scoringResult.categories.problemStrength.score,
                            marketViability: scoringResult.categories.marketViability.score,
                            financialFeasibility: scoringResult.categories.financialFeasibility.score,
                            pricingConfidence: scoringResult.categories.pricingConfidence.score,
                            competitiveRisk: scoringResult.categories.competitiveRisk.score,
                        }}
                    />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                    {Object.entries(scoringResult.categories).map(([key, cat]) => (
                        <div key={key} className="category-card">
                            <div className="category-card-header">
                                <div>
                                    <h4>{CATEGORY_DISPLAY[key]}</h4>
                                    <span className="text-xs text-tertiary">Weight: {CATEGORY_WEIGHTS[key]}</span>
                                </div>
                                <span
                                    className="category-score"
                                    style={{
                                        color:
                                            cat.score >= 70
                                                ? 'var(--success)'
                                                : cat.score >= 40
                                                    ? 'var(--warning)'
                                                    : 'var(--danger)',
                                    }}
                                >
                                    {cat.score}
                                </span>
                            </div>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
                                {cat.factors.map((f) => (
                                    <Tooltip key={f.name} content={f.reasoning}>
                                        <span
                                            className={`badge ${f.value >= 70
                                                ? 'badge-success'
                                                : f.value >= 40
                                                    ? 'badge-warning'
                                                    : 'badge-danger'
                                                }`}
                                        >
                                            {f.name}: {f.value}
                                        </span>
                                    </Tooltip>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Risk Flags */}
            {scoringResult.riskFlags.length > 0 && (
                <div className="card" style={{ marginTop: 'var(--space-6)' }}>
                    <h3 style={{ marginBottom: 'var(--space-4)' }}>Risk Flags</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                        {scoringResult.riskFlags.map((flag, i) => (
                            <div key={i} className={`risk-flag severity-${flag.severity}`}>
                                <div className="risk-flag-icon" />
                                <span>{flag.message}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Financial */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 'var(--space-6)', marginTop: 'var(--space-6)' }}>
                <div className="card">
                    <h3 style={{ marginBottom: 'var(--space-4)' }}>Revenue Projection</h3>
                    <RevenueChart sensitivity={sensitivity} />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
                    <div className="card">
                        <h4 style={{ marginBottom: 'var(--space-4)' }}>Risk Assessment</h4>
                        <RiskMeter
                            ltvCacRatio={sensitivity.base.ltvCacRatio}
                            burnRisk={sensitivity.base.burnRisk}
                        />
                    </div>

                    <div className="card">
                        <h4 style={{ marginBottom: 'var(--space-4)' }}>Scenario Controls</h4>
                        <div className="sensitivity-controls">
                            <SensitivitySlider
                                label="Traffic"
                                value={trafficMod}
                                onChange={setTrafficMod}
                            />
                            <SensitivitySlider
                                label="Conversion"
                                value={conversionMod}
                                onChange={setConversionMod}
                            />
                            <SensitivitySlider
                                label="Retention"
                                value={churnMod}
                                onChange={setChurnMod}
                            />
                        </div>
                    </div>

                    <div className="card" style={{ textAlign: 'center' }}>
                        <div className="flex gap-5 justify-center">
                            <div>
                                <span className="text-xs text-secondary">LTV</span>
                                <span className="text-lg" style={{ display: 'block', fontWeight: 700 }}>
                                    ${sensitivity.base.ltv}
                                </span>
                            </div>
                            <div>
                                <span className="text-xs text-secondary">CAC</span>
                                <span className="text-lg" style={{ display: 'block', fontWeight: 700 }}>
                                    ${sensitivity.base.cac}
                                </span>
                            </div>
                            <div>
                                <span className="text-xs text-secondary">Break-Even</span>
                                <span className="text-lg" style={{ display: 'block', fontWeight: 700 }}>
                                    {sensitivity.base.breakEvenMonth
                                        ? `Month ${sensitivity.base.breakEvenMonth}`
                                        : 'N/A'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Drilldown */}
            <div style={{ marginTop: 'var(--space-6)' }}>
                <WeakestDrilldown result={scoringResult} />
            </div>

            {/* ====== PRO SECTION ====== */}
            <div style={{ marginTop: 'var(--space-8)' }} className="pdf-page-break">
                <ProGate label="Advanced Financial Simulation">
                    {/* Advanced Cost Panel */}
                    <AdvancedCostPanel costs={advancedCosts} onChange={setAdvancedCosts} />

                    {/* Scenario Manager */}
                    <div style={{ marginTop: 'var(--space-5)' }}>
                        <ScenarioManager
                            projectId={projectId}
                            activeScenario={activeScenario}
                            onScenarioChange={setActiveScenario}
                            baseParams={{
                                monthlyTraffic: revenueData?.monthly_traffic || 1000,
                                conversionRate: revenueData?.conversion_rate || 2,
                                churnRate: revenueData?.churn_rate || 5,
                                pricePerMonth: pricingData?.price_point || 29,
                                cac: revenueData?.customer_acquisition_cost || 50,
                                fixedCosts: revenueData?.fixed_costs || 2000,
                                ...advancedCosts,
                            }}
                            isPro={isPro}
                        />
                    </div>

                    {/* Advanced Financial Metrics */}
                    {advancedResult && (
                        <div className="card" style={{ marginTop: 'var(--space-5)', padding: 'var(--space-5)' }}>
                            <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 600, marginBottom: 'var(--space-4)' }}>
                                Capital & Runway Analysis
                            </h3>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 'var(--space-4)' }}>
                                <div className="metric-card">
                                    <span className="text-xs text-secondary">Break-Even</span>
                                    <span className="metric-value">
                                        {advancedResult.breakEvenMonth ? `Month ${advancedResult.breakEvenMonth}` : 'N/A'}
                                    </span>
                                </div>
                                <div className="metric-card">
                                    <span className="text-xs text-secondary">Runway</span>
                                    <Tooltip content={advancedResult.runwayMonths ? 'Capital depleted before break-even' : 'Break-even reached before capital depletion'}>
                                        <span className="metric-value" style={{
                                            color: advancedResult.runwayMonths ? 'var(--danger)' : 'var(--success)'
                                        }}>
                                            {advancedResult.runwayMonths ? `Month ${advancedResult.runwayMonths}` : 'Sustainable'}
                                        </span>
                                    </Tooltip>
                                </div>
                                <div className="metric-card">
                                    <span className="text-xs text-secondary">Capital Required</span>
                                    <span className="metric-value">
                                        ${advancedResult.capitalRequired.toLocaleString()}
                                    </span>
                                </div>
                                <div className="metric-card">
                                    <Tooltip content={advancedResult.capitalEfficiencyLabel}>
                                        <span className="text-xs text-secondary">Capital Efficiency</span>
                                    </Tooltip>
                                    <span className="metric-value" style={{
                                        color: advancedResult.capitalEfficiencyScore >= 1.2 ? 'var(--success)'
                                            : advancedResult.capitalEfficiencyScore >= 0.8 ? 'var(--warning)'
                                                : 'var(--danger)'
                                    }}>
                                        {advancedResult.capitalEfficiencyScore}x
                                    </span>
                                    <span className="text-xs text-tertiary">{advancedResult.capitalEfficiencyLabel}</span>
                                </div>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--space-4)', marginTop: 'var(--space-4)' }}>
                                <div className="metric-card">
                                    <span className="text-xs text-secondary">LTV:CAC Ratio</span>
                                    <span className="metric-value">{advancedResult.ltvCacRatio}x</span>
                                    <span className="text-xs text-tertiary">{advancedResult.ltvCacLabel}</span>
                                </div>
                                <div className="metric-card">
                                    <span className="text-xs text-secondary">LTV</span>
                                    <span className="metric-value">${advancedResult.ltv}</span>
                                </div>
                                <div className="metric-card">
                                    <span className="text-xs text-secondary">Burn Risk</span>
                                    <span className="metric-value" style={{
                                        color: advancedResult.burnRisk === 'low' ? 'var(--success)'
                                            : advancedResult.burnRisk === 'moderate' ? 'var(--warning)'
                                                : 'var(--danger)'
                                    }}>
                                        {advancedResult.burnRisk.charAt(0).toUpperCase() + advancedResult.burnRisk.slice(1)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}
                </ProGate>

                {/* Sensitivity Heatmap */}
                <div style={{ marginTop: 'var(--space-5)' }}>
                    <ProGate label="Sensitivity Analysis">
                        {heatmapData && (
                            <SensitivityHeatmap
                                cells={heatmapData.cells}
                                conversionTiers={heatmapData.conversionTiers}
                                churnTiers={heatmapData.churnTiers}
                            />
                        )}
                    </ProGate>
                </div>

                {/* Executive Memo */}
                <div style={{ marginTop: 'var(--space-5)' }} className="pdf-page-break">
                    <ProGate label="Executive Decision Memo">
                        <ExecutiveMemo payload={memoPayload} isPro={isPro} />
                    </ProGate>
                </div>
            </div>

            {/* Export */}
            <div style={{ marginTop: 'var(--space-6)', textAlign: 'center' }}>
                <button className="btn btn-primary btn-lg" onClick={handleExport}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                        <polyline points="7 10 12 15 17 10" />
                        <line x1="12" y1="15" x2="12" y2="3" />
                    </svg>
                    Download Validation Report
                    {!isPro && <span className="badge badge-accent" style={{ marginLeft: 'var(--space-2)' }}>PRO</span>}
                </button>
            </div>

            {/* PDF Footer — only visible in PDF export */}
            <div className="pdf-footer">
                Generated by Ventryx — Professional Startup Validation System
            </div>

            <UpgradeModal isOpen={showUpgrade} onClose={() => setShowUpgrade(false)} />
        </div>
    );
}
