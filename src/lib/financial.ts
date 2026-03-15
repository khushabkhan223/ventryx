/* ========================================
   Ventryx — Cohort-Based Financial Model
   ======================================== */

import type {
    CohortParams, MonthlyData, CohortResult, SensitivityResult,
    ScenarioParams, AdvancedFinancialResult, SensitivityHeatmapCell, ScenarioLabel
} from './types';

// ---- Interpretation Helpers ----

export function getLtvCacLabel(ratio: number): string {
    if (ratio < 1.0) return 'Unsustainable';
    if (ratio < 3.0) return 'Fragile';
    if (ratio < 5.0) return 'Healthy';
    return 'Strong';
}

export function getLtvCacClassification(ratio: number): 'unsustainable' | 'fragile' | 'healthy' | 'strong' {
    if (ratio < 1.0) return 'unsustainable';
    if (ratio < 3.0) return 'fragile';
    if (ratio < 5.0) return 'healthy';
    return 'strong';
}

export function getCapitalEfficiencyLabel(score: number): string {
    if (score < 0.8) return 'Capital destructive';
    if (score < 1.2) return 'Neutral efficiency';
    if (score < 2.0) return 'Moderate efficiency';
    return 'Strong capital efficiency';
}

// ---- Scenario Auto-Adjustments ----

export function applyScenarioAdjustments(
    baseParams: Omit<ScenarioParams, 'label'>,
    label: ScenarioLabel
): Omit<ScenarioParams, 'label'> {
    if (label === 'base') return { ...baseParams };

    const mod = label === 'conservative' ? -0.2 : 0.2;
    return {
        ...baseParams,
        monthlyTraffic: Math.max(1, Math.round(baseParams.monthlyTraffic * (1 + mod))),
        conversionRate: Math.max(0.01, parseFloat((baseParams.conversionRate * (1 + mod)).toFixed(2))),
        churnRate: Math.max(0.1, parseFloat((baseParams.churnRate * (1 - mod)).toFixed(2))),
    };
}

/**
 * Simulate cohort-based revenue over N months.
 * Each month spawns a new subscriber cohort: traffic × conversionRate
 * Each cohort decays month-over-month by churnRate (compounding)
 * Total revenue at month n = sum of all surviving cohort subscribers × price
 */
export function simulateCohorts(params: CohortParams, months: number = 24): CohortResult {
    const { monthlyTraffic, conversionRate, churnRate, pricePerMonth, cac, fixedCosts } = params;

    const cohorts: number[] = []; // each entry = surviving subscribers from that cohort's birth month
    const monthly: MonthlyData[] = [];

    let cumulativeRevenue = 0;
    let cumulativeCosts = 0;
    let breakEvenMonth: number | null = null;

    for (let m = 1; m <= months; m++) {
        // New cohort this month
        const newCustomers = Math.round(monthlyTraffic * (conversionRate / 100));
        cohorts.push(newCustomers);

        // Decay all existing cohorts (except the new one just added)
        for (let i = 0; i < cohorts.length - 1; i++) {
            cohorts[i] = cohorts[i] * (1 - churnRate / 100);
        }

        // Total active customers = sum of all surviving cohorts
        const totalCustomers = Math.round(cohorts.reduce((sum, c) => sum + c, 0));
        const revenue = totalCustomers * pricePerMonth;
        const acquisitionCost = newCustomers * cac;
        const totalCosts = acquisitionCost + fixedCosts;

        cumulativeRevenue += revenue;
        cumulativeCosts += totalCosts;

        const profit = cumulativeRevenue - cumulativeCosts;

        if (breakEvenMonth === null && profit >= 0 && m > 1) {
            breakEvenMonth = m;
        }

        monthly.push({
            month: m,
            newCustomers,
            totalCustomers,
            revenue: Math.round(revenue),
            cumulativeRevenue: Math.round(cumulativeRevenue),
            costs: Math.round(totalCosts),
            cumulativeCosts: Math.round(cumulativeCosts),
            profit: Math.round(profit),
        });
    }

    // LTV calculation: average revenue per customer over their lifetime
    // Lifetime in months = 1 / (churnRate/100), revenue per month = pricePerMonth
    const lifetimeMonths = churnRate > 0 ? 1 / (churnRate / 100) : months;
    const ltv = Math.round(pricePerMonth * lifetimeMonths);
    const ltvCacRatio = cac > 0 ? parseFloat((ltv / cac).toFixed(1)) : 999;

    // Burn risk
    let burnRisk: 'low' | 'moderate' | 'high';
    if (churnRate <= 3) burnRisk = 'low';
    else if (churnRate <= 8) burnRisk = 'moderate';
    else burnRisk = 'high';

    return {
        monthly,
        cumulative: monthly.map((m) => m.cumulativeRevenue),
        breakEvenMonth,
        ltv,
        cac,
        ltvCacRatio,
        burnRisk,
    };
}

/**
 * Run sensitivity analysis: base, optimistic (+modifier), pessimistic (-modifier).
 * Modifier is a fraction, e.g. 0.2 for ±20%
 */
export function runSensitivity(
    params: CohortParams,
    modifier: number = 0.2,
    months: number = 24
): SensitivityResult {
    const base = simulateCohorts(params, months);

    const optimisticParams: CohortParams = {
        ...params,
        monthlyTraffic: Math.round(params.monthlyTraffic * (1 + modifier)),
        conversionRate: parseFloat((params.conversionRate * (1 + modifier)).toFixed(2)),
        churnRate: parseFloat((params.churnRate * (1 - modifier)).toFixed(2)), // lower churn is better
    };

    const pessimisticParams: CohortParams = {
        ...params,
        monthlyTraffic: Math.round(params.monthlyTraffic * (1 - modifier)),
        conversionRate: parseFloat((params.conversionRate * (1 - modifier)).toFixed(2)),
        churnRate: parseFloat((params.churnRate * (1 + modifier)).toFixed(2)), // higher churn is worse
    };

    const optimistic = simulateCohorts(optimisticParams, months);
    const pessimistic = simulateCohorts(pessimisticParams, months);

    return { base, optimistic, pessimistic };
}

// ---- Pro: Advanced Financial Simulation ----

/**
 * Month-by-month financial simulation with capital & runway tracking.
 * Runway detection: exact month where cumulative burn > initial capital.
 * If break-even occurs before depletion, runway is null (sustainable).
 */
export function simulateAdvancedFinancials(
    params: ScenarioParams | (CohortParams & { buildCost?: number; monthlyOperatingCosts?: number; monthlyMarketingBudget?: number; teamCost?: number; initialCapital?: number }),
    months: number = 24
): AdvancedFinancialResult {
    const {
        monthlyTraffic, conversionRate, churnRate, pricePerMonth, cac,
        fixedCosts,
    } = params;

    const buildCost = ('buildCost' in params ? params.buildCost : 0) || 0;
    const monthlyOperatingCosts = ('monthlyOperatingCosts' in params ? params.monthlyOperatingCosts : 0) || 0;
    const monthlyMarketingBudget = ('monthlyMarketingBudget' in params ? params.monthlyMarketingBudget : 0) || 0;
    const teamCost = ('teamCost' in params ? params.teamCost : 0) || 0;
    const initialCapital = ('initialCapital' in params ? params.initialCapital : 0) || 0;

    const cohorts: number[] = [];
    const monthlyRevenue: number[] = [];
    const monthlyBurn: number[] = [];
    const netCashFlow: number[] = [];
    const cumulativeRevenue: number[] = [];
    const cumulativeBurn: number[] = [];
    const totalCustomersByMonth: number[] = [];

    let cumRev = 0;
    let cumBurn = buildCost; // Build cost counted upfront
    let breakEvenMonth: number | null = null;
    let runwayMonths: number | null = null;
    let runwayDetected = false;

    for (let m = 1; m <= months; m++) {
        const newCustomers = Math.round(monthlyTraffic * (conversionRate / 100));
        cohorts.push(newCustomers);

        for (let i = 0; i < cohorts.length - 1; i++) {
            cohorts[i] = cohorts[i] * (1 - churnRate / 100);
        }

        const totalCustomers = Math.round(cohorts.reduce((sum, c) => sum + c, 0));
        const revenue = totalCustomers * pricePerMonth;
        const acquisitionCost = newCustomers * cac;
        const burn = acquisitionCost + fixedCosts + monthlyOperatingCosts + monthlyMarketingBudget + teamCost;

        cumRev += revenue;
        cumBurn += burn;

        monthlyRevenue.push(Math.round(revenue));
        monthlyBurn.push(Math.round(burn));
        netCashFlow.push(Math.round(revenue - burn));
        cumulativeRevenue.push(Math.round(cumRev));
        cumulativeBurn.push(Math.round(cumBurn));
        totalCustomersByMonth.push(totalCustomers);

        // Break-even: cumulative revenue >= cumulative burn
        if (breakEvenMonth === null && cumRev >= cumBurn && m > 1) {
            breakEvenMonth = m;
        }

        // Runway: exact month where cumulative burn exceeds initial capital
        if (!runwayDetected && initialCapital > 0 && cumBurn > initialCapital) {
            runwayMonths = m;
            runwayDetected = true;
        }
    }

    // If break-even occurs before capital depletion, capital is sustainable
    if (breakEvenMonth !== null && (runwayMonths === null || breakEvenMonth < runwayMonths)) {
        runwayMonths = null; // Sustainable — break-even reached before capital depleted
    }

    // LTV & LTV:CAC
    const lifetimeMonths = churnRate > 0 ? 1 / (churnRate / 100) : months;
    const ltv = Math.round(pricePerMonth * lifetimeMonths);
    const ltvCacRatio = cac > 0 ? parseFloat((ltv / cac).toFixed(1)) : 999;

    // Burn risk
    let burnRisk: 'low' | 'moderate' | 'high';
    if (churnRate <= 3) burnRisk = 'low';
    else if (churnRate <= 8) burnRisk = 'moderate';
    else burnRisk = 'high';

    // Capital efficiency: cumulative revenue ÷ cumulative burn at month 12
    const month12Index = Math.min(11, months - 1);
    const efficiencyDenominator = cumulativeBurn[month12Index] || 1;
    const capitalEfficiencyScore = parseFloat(
        (cumulativeRevenue[month12Index] / efficiencyDenominator).toFixed(2)
    );

    // Capital required to survive until break-even
    const capitalRequired = breakEvenMonth !== null
        ? cumulativeBurn[breakEvenMonth - 1]
        : cumulativeBurn[months - 1];

    return {
        monthlyRevenue,
        monthlyBurn,
        netCashFlow,
        cumulativeRevenue,
        cumulativeBurn,
        breakEvenMonth,
        runwayMonths,
        capitalRequired: Math.round(capitalRequired),
        ltv,
        cac,
        ltvCacRatio,
        ltvCacLabel: getLtvCacLabel(ltvCacRatio),
        burnRisk,
        capitalEfficiencyScore,
        capitalEfficiencyLabel: getCapitalEfficiencyLabel(capitalEfficiencyScore),
        totalCustomersByMonth,
    };
}

// ---- Pro: Sensitivity Heatmap ----

const HEATMAP_CONVERSION_TIERS = [0.5, 1, 2, 3, 5];
const HEATMAP_CHURN_TIERS = [2, 4, 6, 8, 12];

/**
 * Generate a 2D sensitivity heatmap for LTV:CAC across conversion × churn tiers.
 * Guarded against NaN and divide-by-zero.
 */
export function generateSensitivityHeatmap(
    baseParams: CohortParams
): { cells: SensitivityHeatmapCell[][]; conversionTiers: number[]; churnTiers: number[] } {
    const cells: SensitivityHeatmapCell[][] = [];

    for (const churn of HEATMAP_CHURN_TIERS) {
        const row: SensitivityHeatmapCell[] = [];
        for (const conv of HEATMAP_CONVERSION_TIERS) {
            const lifetimeMonths = churn > 0 ? 1 / (churn / 100) : 24;
            const ltv = baseParams.pricePerMonth * lifetimeMonths;
            const safeCac = baseParams.cac > 0 ? baseParams.cac : 1;
            const ratio = parseFloat((ltv / safeCac).toFixed(1));
            const safeRatio = isFinite(ratio) && !isNaN(ratio) ? ratio : 0;

            row.push({
                conversionRate: conv,
                churnRate: churn,
                ltvCacRatio: safeRatio,
                classification: getLtvCacClassification(safeRatio),
            });
        }
        cells.push(row);
    }

    return { cells, conversionTiers: HEATMAP_CONVERSION_TIERS, churnTiers: HEATMAP_CHURN_TIERS };
}
