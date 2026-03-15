'use client';

import type { ScoringResult } from '@/lib/types';

// ---- Drilldown Content Map ----
interface DrilldownContent {
    nextSteps: string[];
    experiment: string;
    estimatedCost: string;
    estimatedTimeline: string;
}

const DRILLDOWN_MAP: Record<string, Record<string, DrilldownContent>> = {
    problemStrength: {
        'Pain Frequency': {
            nextSteps: [
                'Conduct 10 customer interviews focused on how often they encounter this problem',
                'Track problem occurrence in a target community for 2 weeks',
                'Survey 50+ potential users asking them to rank problem frequency',
            ],
            experiment: 'Run a 1-week diary study with 5-10 target users to track actual problem frequency',
            estimatedCost: '$0-100',
            estimatedTimeline: '7-10 days',
        },
        'Urgency Level': {
            nextSteps: [
                'Ask potential users: "What happens if this problem stays unsolved for 6 months?"',
                'Look for existing willingness-to-pay signals (forums, reviews, complaints)',
                'Test urgency with a landing page offering an immediate vs. waitlist option',
            ],
            experiment: 'Create a fake-door test to measure urgency: offer "solve now" vs "learn more"',
            estimatedCost: '$50-200',
            estimatedTimeline: '3-5 days',
        },
        default: {
            nextSteps: [
                'Refine your problem statement with more specific language',
                'Interview 5 potential users to validate the problem exists',
                'Research existing solutions to understand current alternatives',
            ],
            experiment: 'Run a problem validation survey with 50+ respondents',
            estimatedCost: '$0-50',
            estimatedTimeline: '5-7 days',
        },
    },
    marketViability: {
        'Distribution Clarity': {
            nextSteps: [
                'Identify 3 specific channels where your target users already congregate',
                'Talk to founders in adjacent spaces about their best acquisition channels',
                'Analyze competitor traffic sources using free tools (SimilarWeb, social media)',
            ],
            experiment: 'Run a 48-hour paid ad test on 2 different platforms targeting your niche',
            estimatedCost: '$100-300',
            estimatedTimeline: '3-5 days',
        },
        'Channel Realism': {
            nextSteps: [
                'Research case studies of similar products and their distribution strategies',
                'Test a small budget ($50-100) on your primary channel hypothesis',
                'Reach out to 5 communities where your target users spend time',
            ],
            experiment: 'Spend $100 on your best-guess channel and measure cost per click and signup',
            estimatedCost: '$100-200',
            estimatedTimeline: '3-5 days',
        },
        default: {
            nextSteps: [
                'Define your ideal customer profile with more specificity',
                'Validate audience size with market research tools',
                'Identify the top 3 places your audience spends time online',
            ],
            experiment: 'Post in 3 online communities and measure interest/engagement',
            estimatedCost: '$0-50',
            estimatedTimeline: '5-7 days',
        },
    },
    financialFeasibility: {
        default: {
            nextSteps: [
                'Reduce CAC by testing organic acquisition channels before paid',
                'Increase LTV by improving retention through better onboarding',
                'Validate price sensitivity by testing 2-3 price points',
            ],
            experiment: 'Run a 2-week acquisition experiment comparing organic vs. paid channels',
            estimatedCost: '$100-300',
            estimatedTimeline: '10-14 days',
        },
    },
    pricingConfidence: {
        default: {
            nextSteps: [
                'Run a Van Westendorp price sensitivity analysis with 30+ respondents',
                'Test willingness-to-pay with a pre-sale or crowdfunding campaign',
                'Compare your pricing against 3 closest competitor alternatives',
            ],
            experiment: 'Create a landing page with 2-3 pricing tiers and measure conversion by tier',
            estimatedCost: '$50-200',
            estimatedTimeline: '5-7 days',
        },
    },
    competitiveRisk: {
        'Differentiation': {
            nextSteps: [
                'Document your unique value proposition in one clear sentence',
                'Ask 5 potential users to compare your idea vs. existing solutions',
                'Identify one feature or angle that no competitor addresses well',
            ],
            experiment: 'Show 10 target users your concept alongside competitors and record preferences',
            estimatedCost: '$0-100',
            estimatedTimeline: '3-5 days',
        },
        default: {
            nextSteps: [
                'Create a competitive matrix with feature/price comparisons',
                'Identify gaps in competitor offerings through user reviews',
                'Focus on a specific niche underserved by current solutions',
            ],
            experiment: 'Analyze 50+ competitor reviews to identify common complaints and unmet needs',
            estimatedCost: '$0',
            estimatedTimeline: '3-5 days',
        },
    },
};

function getDrilldown(category: string, factorName: string): DrilldownContent {
    const categoryMap = DRILLDOWN_MAP[category] ?? DRILLDOWN_MAP['problemStrength'];
    return categoryMap?.[factorName] ?? categoryMap?.['default'] ?? {
        nextSteps: [
            'Validate this assumption with customer interviews',
            'Research comparable products for benchmarks',
            'Run a small experiment to gather data',
        ],
        experiment: 'Conduct 5-10 customer interviews focused on this area',
        estimatedCost: '$0-100',
        estimatedTimeline: '5-7 days',
    };
}

interface WeakestDrilldownProps {
    result: ScoringResult;
}

const CATEGORY_DISPLAY: Record<string, string> = {
    problemStrength: 'Problem Strength',
    marketViability: 'Market Viability',
    financialFeasibility: 'Financial Feasibility',
    pricingConfidence: 'Pricing Confidence',
    competitiveRisk: 'Competitive Risk',
};

export default function WeakestDrilldown({ result }: WeakestDrilldownProps) {
    const { weakestAssumption } = result;
    const weakestFactor = [...weakestAssumption.factors].sort(
        (a, b) => a.value - b.value
    )[0];

    const drilldown = getDrilldown(
        weakestAssumption.category,
        weakestFactor?.name ?? 'default'
    );

    const displayCategory =
        CATEGORY_DISPLAY[weakestAssumption.category] ?? weakestAssumption.category;

    return (
        <div className="drilldown-panel">
            <div className="drilldown-header">
                <div>
                    <h3>Your Weakest Assumption</h3>
                    <div className="flex items-center gap-3" style={{ marginTop: 'var(--space-2)' }}>
                        <span style={{ fontSize: 'var(--text-lg)', fontWeight: 700, color: 'var(--danger)' }}>
                            {displayCategory}
                        </span>
                        <span className="badge badge-danger">{weakestAssumption.score}/100</span>
                    </div>
                </div>
            </div>

            {weakestFactor && (
                <div
                    style={{
                        padding: 'var(--space-4)',
                        background: 'var(--bg-primary)',
                        borderRadius: 'var(--radius-md)',
                        marginBottom: 'var(--space-5)',
                    }}
                >
                    <span className="text-sm text-secondary">Lowest factor:</span>
                    <span
                        className="text-sm"
                        style={{ display: 'block', marginTop: 'var(--space-1)', color: 'var(--text-primary)' }}
                    >
                        {weakestFactor.reasoning}
                    </span>
                </div>
            )}

            <h4 style={{ marginBottom: 'var(--space-4)' }}>3 Concrete Next Steps</h4>
            <div className="drilldown-steps">
                {drilldown.nextSteps.map((step, i) => (
                    <div key={i} className="drilldown-step">
                        <span className="drilldown-step-number">{i + 1}</span>
                        <span className="text-sm">{step}</span>
                    </div>
                ))}
            </div>

            <div
                className="card"
                style={{
                    marginTop: 'var(--space-5)',
                    background: 'var(--accent-subtle)',
                    borderColor: 'var(--accent-border)',
                }}
            >
                <h4 style={{ color: 'var(--accent)', marginBottom: 'var(--space-2)' }}>
                    Suggested Low-Cost Experiment
                </h4>
                <p className="text-sm" style={{ marginBottom: 'var(--space-3)' }}>
                    {drilldown.experiment}
                </p>
                <div className="flex gap-5">
                    <div>
                        <span className="text-xs text-secondary">Estimated Cost</span>
                        <span className="text-sm" style={{ display: 'block', fontWeight: 600 }}>
                            {drilldown.estimatedCost}
                        </span>
                    </div>
                    <div>
                        <span className="text-xs text-secondary">Timeline</span>
                        <span className="text-sm" style={{ display: 'block', fontWeight: 600 }}>
                            {drilldown.estimatedTimeline}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}
