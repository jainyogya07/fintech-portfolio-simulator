/**
 * Type Definitions for Portfolio Simulator
 */

// ============================================
// Portfolio Types
// ============================================

export interface Holding {
    symbol: string;
    shares: number;
    purchasePrice: number;
    currentPrice: number;
    volatility?: number;
    beta?: number;
    historicalReturns?: number[];
}

export interface Portfolio {
    holdings: Holding[];
    totalValue: number;
    costBasis: number;
    gainLoss: GainLoss;
}

export interface GainLoss {
    totalGain: number;
    percentageGain: number;
}

// ============================================
// Risk Metrics Types
// ============================================

export interface RiskMetrics {
    volatility: number;
    var95: number;
    cvar: CVaRResult;
    maxDrawdown: number;
    beta: number;
    sharpe: number;
    sortino: number;
}

export interface CVaRResult {
    var95: number;
    cvar95: number;
    percentLoss: number;
}

export interface MaxDrawdownResult {
    maxDrawdown: number;
    maxDrawdownPercent: number;
    peakValue: number;
    troughValue: number;
    drawdownDays: number;
}

export interface RiskLevel {
    level: 'low' | 'medium' | 'high';
    label: string;
    color: string;
}

// ============================================
// Monte Carlo Types
// ============================================

export interface MonteCarloParams {
    portfolioValue: number;
    volatility: number;
    years: number;
    numSimulations?: number;
    expectedReturn?: number;
    useFatTails?: boolean;
    degreesOfFreedom?: number;
}

export interface MonteCarloResult {
    chartData: PercentileDataPoint[];
    percentiles: Percentiles;
    statistics: Statistics;
    probabilities: Probability[];
    extremeStats: ExtremeStats;
    params: MonteCarloParams;
}

export interface PercentileDataPoint {
    year: number;
    p10: number;
    p25: number;
    p50: number;
    p75: number;
    p90: number;
}

export interface Percentiles {
    p10: number[];
    p25: number[];
    p50: number[];
    p75: number[];
    p90: number[];
}

export interface Statistics {
    mean: number;
    median: number;
    stdDev: number;
    min: number;
    max: number;
}

export interface Probability {
    threshold: number;
    probability: number;
}

export interface ExtremeStats {
    crashProbability: number;
    boomProbability: number;
    lossProbability: number;
}

// ============================================
// Retirement Types
// ============================================

export interface RetirementInputs {
    currentAge: number;
    retirementAge: number;
    currentSavings: number;
    monthlyContribution: number;
    expectedReturn?: number;
    inflationRate?: number;
    desiredAnnualIncome: number;
    lifeExpectancy?: number;
}

export interface RetirementProjection {
    yearsUntilRetirement: number;
    savingsAtRetirement: number;
    requiredSavings: number;
    shortfall: number;
    surplus: number;
    isOnTrack: boolean;
    monthlyShortfall: number;
    requiredMonthlyContribution: number;
    additionalMonthlyNeeded: number;
    projectedMonthlyIncome: number;
    projectedAnnualIncome: number;
    projectedIncomeToday: number;
    desiredMonthlyIncome: number;
    replacementRatio: number;
    estimatedSocialSecurity: number;
    currentEquityAllocation: number;
    retirementEquityAllocation: number;
    safeWithdrawalRate: number;
    assumptions: RetirementAssumptions;
}

export interface RetirementAssumptions {
    expectedReturn: number;
    inflationRate: number;
    withdrawalRate: number;
    yearsInRetirement: number;
    glidePath: string;
}

export interface RetirementSimulationResult {
    successRate: number;
    failureRate: number;
    medianRetirementBalance: number;
    percentile10: number;
    percentile25: number;
    percentile75: number;
    percentile90: number;
    medianFinalBalance: number;
    averageYearsIfFailed: number;
    simulations: number;
}

export interface RetirementRating {
    label: 'Excellent' | 'Good' | 'Fair' | 'At Risk' | 'High Risk';
    color: string;
    emoji: string;
}

// ============================================
// Goal Types
// ============================================

export interface Goal {
    id: string;
    name: string;
    target: number;
    current: number;
    deadline?: string;
    priority: 'low' | 'medium' | 'high';
    category?: string;
}

// ============================================
// Currency Types
// ============================================

export type CurrencyCode = 'USD' | 'EUR' | 'GBP' | 'JPY' | 'INR' | 'CAD' | 'AUD';

export interface CurrencyRate {
    code: CurrencyCode;
    rate: number;
    symbol: string;
}

// ============================================
// Alert Types
// ============================================

export interface PriceAlert {
    id: string;
    symbol: string;
    type: 'above' | 'below';
    price: number;
    triggered: boolean;
    createdAt: string;
}

// ============================================
// API Types
// ============================================

export interface StockQuote {
    symbol: string;
    price: number;
    change: number;
    changePercent: number;
    volume: number;
    timestamp: string;
}

export interface HistoricalData {
    date: string;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
}
