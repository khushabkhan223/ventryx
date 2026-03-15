/* ========================================
   Ventryx — Multi-Factor Scoring Engine
   Every score is derived from structured inputs
   ======================================== */

import type {
    ProblemData,
    SegmentData,
    PricingData,
    CompetitiveData,
    CategoryScore,
    FactorScore,
    RiskFlag,
    ScoringResult,
    CohortResult,
} from './types';

// ---- Value Maps ----
const PAIN_FREQUENCY_MAP: Record<string, { value: number; reasoning: string }> = {
    daily: { value: 100, reasoning: 'Pain frequency is daily — strong indicator of recurring need' },
    weekly: { value: 70, reasoning: 'Pain frequency is weekly — moderate recurring need' },
    monthly: { value: 40, reasoning: 'Pain frequency is monthly — infrequent need reduces urgency' },
    rare: { value: 15, reasoning: 'Pain frequency is rare — weak signal for sustained demand' },
};

const URGENCY_MAP: Record<string, { value: number; reasoning: string }> = {
    critical: { value: 100, reasoning: 'Urgency is critical — users are actively seeking solutions' },
    important: { value: 60, reasoning: 'Urgency is important but not critical — users may delay solving' },
    nice_to_have: { value: 25, reasoning: 'This is a nice-to-have — low purchase motivation' },
};

const ALTERNATIVE_MAP: Record<string, { value: number; reasoning: string }> = {
    none: { value: 100, reasoning: 'No alternatives exist — strong opportunity for first mover' },
    few_poor: { value: 65, reasoning: 'Few poor alternatives — room for a better solution' },
    many: { value: 20, reasoning: 'Many alternatives available — highly competitive space' },
};

const SPECIFICITY_MAP: Record<string, { value: number; reasoning: string }> = {
    clearly_defined: { value: 100, reasoning: 'Problem is clearly defined — focused solution is possible' },
    somewhat_vague: { value: 50, reasoning: 'Problem is somewhat vague — may need sharper framing' },
    very_broad: { value: 15, reasoning: 'Problem is very broad — hard to build a focused product' },
};

const AUDIENCE_MAP: Record<string, { value: number; reasoning: string }> = {
    micro: { value: 30, reasoning: 'Micro audience (<1K) — limited scale potential' },
    niche: { value: 70, reasoning: 'Niche audience (1K-100K) — good for focused product' },
    mass: { value: 100, reasoning: 'Mass audience (100K+) — large market potential' },
};

const DISTRIBUTION_MAP: Record<string, { value: number; reasoning: string }> = {
    clear_channel: { value: 100, reasoning: 'Clear distribution channel — reliable path to customers' },
    some_ideas: { value: 50, reasoning: 'Some distribution ideas — needs validation' },
    no_plan: { value: 10, reasoning: 'No distribution plan — serious risk to customer acquisition' },
};

const CHANNEL_MAP: Record<string, { value: number; reasoning: string }> = {
    proven: { value: 100, reasoning: 'Channel is proven — low acquisition risk' },
    unproven: { value: 50, reasoning: 'Channel is unproven — needs testing' },
    speculative: { value: 15, reasoning: 'Channel is speculative — high risk of wasted spend' },
};

const VALUE_JUSTIFICATION_MAP: Record<string, { value: number; reasoning: string }> = {
    strong: { value: 100, reasoning: 'Strong value justification — clear ROI or impact for customer' },
    moderate: { value: 55, reasoning: 'Moderate value justification — value proposition not fully compelling' },
    weak: { value: 15, reasoning: 'Weak value justification — customers unlikely to see enough value' },
};

const WILLINGNESS_MAP: Record<string, { value: number; reasoning: string }> = {
    validated: { value: 100, reasoning: 'Willingness to pay is validated — strong buying signal' },
    assumed: { value: 50, reasoning: 'Willingness to pay is assumed — needs evidence' },
    guessed: { value: 15, reasoning: 'Willingness to pay is guessed — high pricing risk' },
};

const PRICE_VALUE_MAP: Record<string, { value: number; reasoning: string }> = {
    under_priced: { value: 60, reasoning: 'Potentially under-priced — may be leaving money on the table' },
    fair: { value: 100, reasoning: 'Fair price-to-value ratio — balanced positioning' },
    over_priced: { value: 25, reasoning: 'Over-priced relative to perceived value — conversion risk' },
};

const COMPETITOR_MAP: Record<string, { value: number; reasoning: string }> = {
    '0': { value: 100, reasoning: 'No direct competitors — blue ocean opportunity' },
    '1_3': { value: 75, reasoning: '1-3 competitors — manageable competitive landscape' },
    '4_10': { value: 40, reasoning: '4-10 competitors — crowded market, differentiation critical' },
    '10_plus': { value: 15, reasoning: '10+ competitors — extremely competitive, moat required' },
};

const SWITCHING_MAP: Record<string, { value: number; reasoning: string }> = {
    high: { value: 100, reasoning: 'High switching costs — strong customer retention potential' },
    moderate: { value: 65, reasoning: 'Moderate switching costs — some retention advantage' },
    low: { value: 35, reasoning: 'Low switching costs — customers can easily leave' },
    none: { value: 10, reasoning: 'No switching costs — zero retention moat' },
};

const DIFFERENTIATION_MAP: Record<string, { value: number; reasoning: string }> = {
    unique: { value: 100, reasoning: 'Unique positioning — clear competitive advantage' },
    somewhat_different: { value: 55, reasoning: 'Somewhat different — competitive edge needs sharpening' },
    similar: { value: 15, reasoning: 'Similar to competitors — hard to win customers' },
};

// ---- Category Scorers ----

function scoreProblem(data: ProblemData): CategoryScore {
    const factors: FactorScore[] = [
        {
            name: 'Pain Frequency',
            value: PAIN_FREQUENCY_MAP[data.pain_frequency]?.value ?? 0,
            reasoning: PAIN_FREQUENCY_MAP[data.pain_frequency]?.reasoning ?? '',
        },
        {
            name: 'Urgency Level',
            value: URGENCY_MAP[data.urgency_level]?.value ?? 0,
            reasoning: URGENCY_MAP[data.urgency_level]?.reasoning ?? '',
        },
        {
            name: 'Alternative Availability',
            value: ALTERNATIVE_MAP[data.alternative_availability]?.value ?? 0,
            reasoning: ALTERNATIVE_MAP[data.alternative_availability]?.reasoning ?? '',
        },
        {
            name: 'Problem Specificity',
            value: SPECIFICITY_MAP[data.problem_specificity]?.value ?? 0,
            reasoning: SPECIFICITY_MAP[data.problem_specificity]?.reasoning ?? '',
        },
    ];

    const weights = [0.35, 0.3, 0.2, 0.15];
    const score = Math.round(
        factors.reduce((sum, f, i) => sum + f.value * weights[i], 0)
    );

    return { score, factors };
}

function scoreMarket(data: SegmentData): CategoryScore {
    const factors: FactorScore[] = [
        {
            name: 'Audience Size',
            value: AUDIENCE_MAP[data.audience_size_tier]?.value ?? 0,
            reasoning: AUDIENCE_MAP[data.audience_size_tier]?.reasoning ?? '',
        },
        {
            name: 'Distribution Clarity',
            value: DISTRIBUTION_MAP[data.distribution_clarity]?.value ?? 0,
            reasoning: DISTRIBUTION_MAP[data.distribution_clarity]?.reasoning ?? '',
        },
        {
            name: 'Channel Realism',
            value: CHANNEL_MAP[data.channel_realism]?.value ?? 0,
            reasoning: CHANNEL_MAP[data.channel_realism]?.reasoning ?? '',
        },
    ];

    const weights = [0.3, 0.35, 0.35];
    const score = Math.round(
        factors.reduce((sum, f, i) => sum + f.value * weights[i], 0)
    );

    return { score, factors };
}

function scoreFinancial(cohortResult: CohortResult): CategoryScore {
    // LTV:CAC ratio band
    const ltvCac = cohortResult.ltvCacRatio;
    let ltvCacScore: { value: number; reasoning: string };
    if (ltvCac >= 5) ltvCacScore = { value: 100, reasoning: `LTV:CAC ratio is ${ltvCac.toFixed(1)}× — excellent unit economics` };
    else if (ltvCac >= 3) ltvCacScore = { value: 80, reasoning: `LTV:CAC ratio is ${ltvCac.toFixed(1)}× — healthy unit economics` };
    else if (ltvCac >= 1) ltvCacScore = { value: 45, reasoning: `LTV:CAC ratio is ${ltvCac.toFixed(1)}× — barely sustainable` };
    else ltvCacScore = { value: 10, reasoning: `LTV:CAC ratio is ${ltvCac.toFixed(1)}× — losing money per customer` };

    // Break-even timeline
    const beMonth = cohortResult.breakEvenMonth;
    let breakEvenScore: { value: number; reasoning: string };
    if (beMonth !== null && beMonth <= 6) breakEvenScore = { value: 100, reasoning: `Break-even in ${beMonth} months — fast payback` };
    else if (beMonth !== null && beMonth <= 12) breakEvenScore = { value: 70, reasoning: `Break-even in ${beMonth} months — reasonable timeline` };
    else if (beMonth !== null && beMonth <= 24) breakEvenScore = { value: 35, reasoning: `Break-even in ${beMonth} months — requires patience` };
    else breakEvenScore = { value: 10, reasoning: 'Break-even beyond 24 months or not achievable — high capital risk' };

    // Churn risk — derived from burnRisk proxy
    let churnScore: { value: number; reasoning: string };
    if (cohortResult.burnRisk === 'low') churnScore = { value: 90, reasoning: 'Low churn risk — strong retention expected' };
    else if (cohortResult.burnRisk === 'moderate') churnScore = { value: 55, reasoning: 'Moderate churn risk — retention needs active work' };
    else churnScore = { value: 15, reasoning: 'High churn risk — customer lifetime is short' };

    const factors: FactorScore[] = [
        { name: 'LTV:CAC Ratio', ...ltvCacScore },
        { name: 'Break-Even Timeline', ...breakEvenScore },
        { name: 'Churn Risk', ...churnScore },
    ];

    const weights = [0.4, 0.3, 0.3];
    const score = Math.round(
        factors.reduce((sum, f, i) => sum + f.value * weights[i], 0)
    );

    return { score, factors };
}

function scorePricing(data: PricingData): CategoryScore {
    const factors: FactorScore[] = [
        {
            name: 'Value Justification',
            value: VALUE_JUSTIFICATION_MAP[data.value_justification]?.value ?? 0,
            reasoning: VALUE_JUSTIFICATION_MAP[data.value_justification]?.reasoning ?? '',
        },
        {
            name: 'Willingness Signal',
            value: WILLINGNESS_MAP[data.willingness_signal]?.value ?? 0,
            reasoning: WILLINGNESS_MAP[data.willingness_signal]?.reasoning ?? '',
        },
        {
            name: 'Price-to-Value Ratio',
            value: PRICE_VALUE_MAP[data.price_value_ratio]?.value ?? 0,
            reasoning: PRICE_VALUE_MAP[data.price_value_ratio]?.reasoning ?? '',
        },
    ];

    const weights = [0.4, 0.35, 0.25];
    const score = Math.round(
        factors.reduce((sum, f, i) => sum + f.value * weights[i], 0)
    );

    return { score, factors };
}

function scoreCompetitive(data: CompetitiveData): CategoryScore {
    const factors: FactorScore[] = [
        {
            name: 'Competitor Count',
            value: COMPETITOR_MAP[data.competitor_count]?.value ?? 0,
            reasoning: COMPETITOR_MAP[data.competitor_count]?.reasoning ?? '',
        },
        {
            name: 'Switching Cost',
            value: SWITCHING_MAP[data.switching_cost]?.value ?? 0,
            reasoning: SWITCHING_MAP[data.switching_cost]?.reasoning ?? '',
        },
        {
            name: 'Differentiation',
            value: DIFFERENTIATION_MAP[data.differentiation_clarity]?.value ?? 0,
            reasoning: DIFFERENTIATION_MAP[data.differentiation_clarity]?.reasoning ?? '',
        },
    ];

    const weights = [0.25, 0.35, 0.4];
    const score = Math.round(
        factors.reduce((sum, f, i) => sum + f.value * weights[i], 0)
    );

    return { score, factors };
}

// ---- Risk Flag Generator ----

function generateRiskFlags(categories: ScoringResult['categories']): RiskFlag[] {
    const flags: RiskFlag[] = [];

    const entries = Object.entries(categories) as [string, CategoryScore][];
    for (const [, cat] of entries) {
        for (const factor of cat.factors) {
            if (factor.value <= 20) {
                flags.push({
                    severity: 'high',
                    message: `${factor.name}: ${factor.reasoning}`,
                });
            } else if (factor.value <= 40) {
                flags.push({
                    severity: 'moderate',
                    message: `${factor.name}: ${factor.reasoning}`,
                });
            }
        }
    }

    // Overall category flags
    for (const [_key, cat] of entries) {
        if (cat.score < 30) {
            const label = _key.replace(/([A-Z])/g, ' $1').trim();
            flags.push({
                severity: 'high',
                message: `${label} score is critically low (${cat.score}/100)`,
            });
        }
    }

    return flags.sort((a, b) => {
        const order = { high: 0, moderate: 1, low: 2 };
        return order[a.severity] - order[b.severity];
    });
}

// ---- Main Scoring Function ----

export function calculateScores(
    problemData: ProblemData,
    segmentData: SegmentData,
    pricingData: PricingData,
    competitiveData: CompetitiveData,
    cohortResult: CohortResult
): ScoringResult {
    const categories = {
        problemStrength: scoreProblem(problemData),
        marketViability: scoreMarket(segmentData),
        financialFeasibility: scoreFinancial(cohortResult),
        pricingConfidence: scorePricing(pricingData),
        competitiveRisk: scoreCompetitive(competitiveData),
    };

    // Weighted viability index
    const categoryWeights = {
        problemStrength: 0.25,
        marketViability: 0.2,
        financialFeasibility: 0.25,
        pricingConfidence: 0.15,
        competitiveRisk: 0.15,
    };

    const viabilityIndex = Math.round(
        Object.entries(categories).reduce(
            (sum, [key, cat]) =>
                sum + cat.score * (categoryWeights[key as keyof typeof categoryWeights] ?? 0),
            0
        )
    );

    // Find weakest and strongest
    const sorted = Object.entries(categories).sort(
        (a, b) => a[1].score - b[1].score
    );

    const weakest = sorted[0];
    const strongest = sorted[sorted.length - 1];

    const riskFlags = generateRiskFlags(categories);

    let recommendation: 'Proceed' | 'Validate Further' | 'Rework Idea';
    if (viabilityIndex >= 70) recommendation = 'Proceed';
    else if (viabilityIndex >= 40) recommendation = 'Validate Further';
    else recommendation = 'Rework Idea';

    return {
        viabilityIndex,
        categories,
        weakestAssumption: {
            category: weakest[0],
            score: weakest[1].score,
            factors: weakest[1].factors,
        },
        strongestAssumption: {
            category: strongest[0],
            score: strongest[1].score,
            factors: strongest[1].factors,
        },
        riskFlags,
        recommendation,
    };
}
