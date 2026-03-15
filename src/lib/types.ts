/* ========================================
   Ventryx — Type Definitions
   ======================================== */

// ---- Section Keys ----
export type SectionKey =
    | 'problem'
    | 'segment'
    | 'pricing'
    | 'revenue'
    | 'competitive'
    | 'experiment';

export const SECTION_ORDER: SectionKey[] = [
    'problem',
    'segment',
    'pricing',
    'revenue',
    'competitive',
    'experiment',
];

export const SECTION_LABELS: Record<SectionKey, string> = {
    problem: 'Problem Clarity',
    segment: 'Target Segment',
    pricing: 'Pricing Hypothesis',
    revenue: 'Revenue Projections',
    competitive: 'Competitive Position',
    experiment: 'Validation Plan',
};

// ---- Database Models ----
export interface Profile {
    id: string;
    full_name: string;
    is_pro: boolean;
    stripe_customer_id: string | null;
    created_at: string;
}

export interface Project {
    id: string;
    user_id: string;
    name: string;
    description: string | null;
    created_at: string;
    updated_at: string;
}

export interface Section {
    id: string;
    project_id: string;
    section_key: SectionKey;
    data: Record<string, unknown>;
    score: number | null;
    completed: boolean;
    updated_at: string;
}

// ---- Problem Section ----
export type PainFrequency = 'daily' | 'weekly' | 'monthly' | 'rare';
export type UrgencyLevel = 'critical' | 'important' | 'nice_to_have';
export type AlternativeAvailability = 'none' | 'few_poor' | 'many';
export type ProblemSpecificity = 'clearly_defined' | 'somewhat_vague' | 'very_broad';

export interface ProblemData {
    pain_frequency: PainFrequency;
    urgency_level: UrgencyLevel;
    alternative_availability: AlternativeAvailability;
    problem_specificity: ProblemSpecificity;
    problem_statement: string;
}

// ---- Segment Section ----
export type AudienceSizeTier = 'micro' | 'niche' | 'mass';
export type DistributionClarity = 'clear_channel' | 'some_ideas' | 'no_plan';
export type ChannelRealism = 'proven' | 'unproven' | 'speculative';

export interface SegmentData {
    audience_size_tier: AudienceSizeTier;
    distribution_clarity: DistributionClarity;
    channel_realism: ChannelRealism;
    target_description: string;
}

// ---- Pricing Section ----
export type ValueJustification = 'strong' | 'moderate' | 'weak';
export type WillingnessSignal = 'validated' | 'assumed' | 'guessed';
export type PriceValueRatio = 'under_priced' | 'fair' | 'over_priced';

export interface PricingData {
    value_justification: ValueJustification;
    willingness_signal: WillingnessSignal;
    price_value_ratio: PriceValueRatio;
    price_point: number;
    pricing_model: string;
}

// ---- Revenue Section ----
export interface RevenueData {
    monthly_traffic: number;
    conversion_rate: number;
    churn_rate: number;
    customer_acquisition_cost: number;
    fixed_costs: number;
}

// ---- Competitive Section ----
export type CompetitorCount = '0' | '1_3' | '4_10' | '10_plus';
export type SwitchingCost = 'high' | 'moderate' | 'low' | 'none';
export type DifferentiationClarity = 'unique' | 'somewhat_different' | 'similar';

export interface CompetitiveData {
    competitor_count: CompetitorCount;
    switching_cost: SwitchingCost;
    differentiation_clarity: DifferentiationClarity;
    key_differentiator: string;
}

// ---- Experiment Section ----
export interface ExperimentData {
    experiment_type: string;
    hypothesis: string;
    success_metric: string;
    timeline_days: number;
    budget: number;
}

// ---- Section Data Union ----
export type SectionData =
    | ProblemData
    | SegmentData
    | PricingData
    | RevenueData
    | CompetitiveData
    | ExperimentData;

// ---- Scoring ----
export interface FactorScore {
    name: string;
    value: number;
    reasoning: string;
}

export interface CategoryScore {
    score: number;
    factors: FactorScore[];
}

export interface RiskFlag {
    severity: 'high' | 'moderate' | 'low';
    message: string;
}

export interface ScoringResult {
    viabilityIndex: number;
    categories: {
        problemStrength: CategoryScore;
        marketViability: CategoryScore;
        financialFeasibility: CategoryScore;
        pricingConfidence: CategoryScore;
        competitiveRisk: CategoryScore;
    };
    weakestAssumption: {
        category: string;
        score: number;
        factors: FactorScore[];
    };
    strongestAssumption: {
        category: string;
        score: number;
        factors: FactorScore[];
    };
    riskFlags: RiskFlag[];
    recommendation: 'Proceed' | 'Validate Further' | 'Rework Idea';
}

// ---- Financial Model ----
export interface CohortParams {
    monthlyTraffic: number;
    conversionRate: number;
    churnRate: number;
    pricePerMonth: number;
    cac: number;
    fixedCosts: number;
}

export interface MonthlyData {
    month: number;
    newCustomers: number;
    totalCustomers: number;
    revenue: number;
    cumulativeRevenue: number;
    costs: number;
    cumulativeCosts: number;
    profit: number;
}

export interface CohortResult {
    monthly: MonthlyData[];
    cumulative: number[];
    breakEvenMonth: number | null;
    ltv: number;
    cac: number;
    ltvCacRatio: number;
    burnRisk: 'low' | 'moderate' | 'high';
}

export interface SensitivityResult {
    base: CohortResult;
    optimistic: CohortResult;
    pessimistic: CohortResult;
}

// ---- AI ----
export interface AIRefineRequest {
    section: SectionKey;
    input: string;
    context?: string;
}

export interface AIRefineResponse {
    refinement: string;
    suggestions: string[];
}

// ---- Pro: Advanced Financial Model ----
export interface AdvancedCostInputs {
    buildCost: number;
    monthlyOperatingCosts: number;
    monthlyMarketingBudget: number;
    teamCost: number;
    initialCapital: number;
}

export type ScenarioLabel = 'base' | 'conservative' | 'aggressive';

export interface ScenarioParams extends CohortParams, AdvancedCostInputs {
    label: ScenarioLabel;
}

export interface AdvancedFinancialResult {
    monthlyRevenue: number[];
    monthlyBurn: number[];
    netCashFlow: number[];
    cumulativeRevenue: number[];
    cumulativeBurn: number[];
    breakEvenMonth: number | null;
    runwayMonths: number | null;
    capitalRequired: number;
    ltv: number;
    cac: number;
    ltvCacRatio: number;
    ltvCacLabel: string;
    burnRisk: 'low' | 'moderate' | 'high';
    capitalEfficiencyScore: number;
    capitalEfficiencyLabel: string;
    totalCustomersByMonth: number[];
}

export interface SensitivityHeatmapCell {
    conversionRate: number;
    churnRate: number;
    ltvCacRatio: number;
    classification: 'unsustainable' | 'fragile' | 'healthy' | 'strong';
}

export interface ExecutiveMemoPayload {
    viabilityIndex: number;
    categoryScores: Record<string, number>;
    riskFlags: RiskFlag[];
    weakestAssumption: { category: string; score: number };
    strongestAssumption: { category: string; score: number };
    breakEvenMonth: number | null;
    runwayMonths: number | null;
    ltvCacRatio: number;
    ltvCacLabel: string;
    churnRate: number;
    capitalRequired: number;
    capitalEfficiencyScore: number;
    capitalEfficiencyLabel: string;
    scenarioSummary: {
        label: ScenarioLabel;
        breakEvenMonth: number | null;
        runwayMonths: number | null;
        ltvCacRatio: number;
    }[];
}

export interface ExecutiveMemoSection {
    title: string;
    content: string;
}

// ---- Pro: Scenario DB Model ----
export interface Scenario {
    id: string;
    project_id: string;
    label: ScenarioLabel;
    params: Omit<ScenarioParams, 'label'>;
    created_at: string;
    updated_at: string;
}
