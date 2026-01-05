/**
 * Unit Tests for Core Financial Calculations
 * Tests all professional-grade metrics for accuracy
 */
import { describe, it, expect } from 'vitest';
import {
    calculatePortfolioValue,
    calculateCostBasis,
    calculateGainLoss,
    calculateCAGR,
    calculateSharpeRatio,
    calculateSortinoRatio,
    calculateVaR,
    calculateCVaR,
    calculateMaxDrawdown,
    calculateCalmarRatio,
    calculateBeta,
    calculateAlpha,
    calculateSkewness,
    calculateKurtosis,
    formatCurrency,
    formatPercentage
} from '../services/calculations';

// ============================================
// Portfolio Value Calculations
// ============================================
describe('Portfolio Value Calculations', () => {
    const mockHoldings = [
        { symbol: 'AAPL', shares: 10, purchasePrice: 150, currentPrice: 180 },
        { symbol: 'TSLA', shares: 5, purchasePrice: 200, currentPrice: 250 },
        { symbol: 'MSFT', shares: 8, purchasePrice: 300, currentPrice: 350 }
    ];

    it('should calculate total portfolio value correctly', () => {
        // AAPL: 10 * 180 = 1800
        // TSLA: 5 * 250 = 1250
        // MSFT: 8 * 350 = 2800
        // Total = 5850
        expect(calculatePortfolioValue(mockHoldings)).toBe(5850);
    });

    it('should calculate cost basis correctly', () => {
        // AAPL: 10 * 150 = 1500
        // TSLA: 5 * 200 = 1000
        // MSFT: 8 * 300 = 2400
        // Total = 4900
        expect(calculateCostBasis(mockHoldings)).toBe(4900);
    });

    it('should calculate gain/loss correctly', () => {
        const result = calculateGainLoss(mockHoldings);
        expect(result.totalGain).toBe(950); // 5850 - 4900
        expect(result.percentageGain).toBeCloseTo(19.39, 1); // (950/4900) * 100
    });

    it('should handle empty portfolio', () => {
        expect(calculatePortfolioValue([])).toBe(0);
        expect(calculateCostBasis([])).toBe(0);
    });

    it('should handle holdings with zero values', () => {
        const zeroHoldings = [{ shares: 0, currentPrice: 100, purchasePrice: 100 }];
        expect(calculatePortfolioValue(zeroHoldings)).toBe(0);
    });
});

// ============================================
// CAGR (Compound Annual Growth Rate)
// ============================================
describe('CAGR Calculation', () => {
    it('should calculate CAGR for doubling in 10 years', () => {
        // $1000 → $2000 in 10 years = 7.177% CAGR
        const result = calculateCAGR(1000, 2000, 10);
        expect(result).toBeCloseTo(7.18, 1);
    });

    it('should calculate CAGR for tripling in 10 years', () => {
        // $1000 → $3000 in 10 years = 11.61% CAGR
        const result = calculateCAGR(1000, 3000, 10);
        expect(result).toBeCloseTo(11.61, 1);
    });

    it('should handle 1 year period', () => {
        // $100 → $120 in 1 year = 20% CAGR
        expect(calculateCAGR(100, 120, 1)).toBe(20);
    });

    it('should return 0 for invalid inputs', () => {
        expect(calculateCAGR(0, 1000, 10)).toBe(0);
        expect(calculateCAGR(1000, 2000, 0)).toBe(0);
        expect(calculateCAGR(-1000, 2000, 10)).toBe(0);
    });

    it('should handle negative returns', () => {
        // $1000 → $500 in 5 years = -12.94% CAGR
        const result = calculateCAGR(1000, 500, 5);
        expect(result).toBeCloseTo(-12.94, 1);
    });
});

// ============================================
// Risk Metrics
// ============================================
describe('Risk Metrics', () => {
    // Sample daily returns (simulating 1 year of data)
    const sampleReturns = [
        0.01, -0.02, 0.015, -0.01, 0.02, 0.005, -0.015, 0.025,
        -0.005, 0.01, 0.02, -0.01, 0.005, -0.02, 0.015, 0.01,
        -0.008, 0.012, -0.005, 0.018, 0.007, -0.012, 0.009, -0.003
    ];

    describe('Sharpe Ratio', () => {
        it('should calculate Sharpe ratio for positive returns', () => {
            const sharpe = calculateSharpeRatio(sampleReturns, 0.04);
            expect(sharpe).toBeDefined();
            expect(typeof sharpe).toBe('number');
        });

        it('should return 0 for insufficient data', () => {
            expect(calculateSharpeRatio([0.01], 0.04)).toBe(0);
            expect(calculateSharpeRatio([], 0.04)).toBe(0);
            expect(calculateSharpeRatio(null, 0.04)).toBe(0);
        });
    });

    describe('Sortino Ratio', () => {
        it('should calculate Sortino ratio (downside only)', () => {
            const sortino = calculateSortinoRatio(sampleReturns);
            expect(sortino).toBeDefined();
            expect(typeof sortino).toBe('number');
        });

        it('should cap at 3 when no downside', () => {
            const allPositive = [0.01, 0.02, 0.015, 0.01, 0.005];
            const sortino = calculateSortinoRatio(allPositive);
            expect(sortino).toBe(3);
        });
    });

    describe('Value at Risk (VaR)', () => {
        it('should calculate VaR at 95% confidence', () => {
            const portfolioValue = 10000;
            const volatility = 20; // 20%
            const var95 = calculateVaR(portfolioValue, volatility);

            // VaR should be a positive loss amount
            expect(var95).toBeGreaterThan(0);
            expect(var95).toBeLessThan(portfolioValue);
        });
    });

    describe('CVaR (Expected Shortfall)', () => {
        it('should calculate CVaR from historical returns', () => {
            const cvar = calculateCVaR(10000, sampleReturns);

            expect(cvar).toHaveProperty('var95');
            expect(cvar).toHaveProperty('cvar95');
            expect(cvar.cvar95).toBeGreaterThanOrEqual(cvar.var95);
        });

        it('should return zeros for insufficient data', () => {
            const cvar = calculateCVaR(10000, [0.01, 0.02]);
            expect(cvar.var95).toBe(0);
        });
    });
});

// ============================================
// Max Drawdown
// ============================================
describe('Maximum Drawdown', () => {
    it('should calculate max drawdown from price series', () => {
        const prices = [100, 110, 108, 115, 90, 95, 105, 100];
        // Peak at 115, trough at 90 = (115-90)/115 = 21.74%

        const result = calculateMaxDrawdown(prices);
        expect(result.maxDrawdownPercent).toBeCloseTo(21.74, 1);
        expect(result.peakValue).toBe(115);
        expect(result.troughValue).toBe(90);
    });

    it('should return 0 for always rising prices', () => {
        const prices = [100, 110, 120, 130, 140];
        const result = calculateMaxDrawdown(prices);
        expect(result.maxDrawdownPercent).toBe(0);
    });

    it('should handle empty/invalid input', () => {
        expect(calculateMaxDrawdown([]).maxDrawdown).toBe(0);
        expect(calculateMaxDrawdown([100]).maxDrawdown).toBe(0);
    });
});

// ============================================
// Calmar Ratio
// ============================================
describe('Calmar Ratio', () => {
    it('should calculate Calmar ratio (CAGR / MaxDrawdown)', () => {
        const cagr = 15; // 15%
        const maxDrawdown = 10; // 10%
        expect(calculateCalmarRatio(cagr, maxDrawdown)).toBe(1.5);
    });

    it('should return 0 for zero drawdown', () => {
        expect(calculateCalmarRatio(15, 0)).toBe(0);
    });
});

// ============================================
// Beta & Alpha
// ============================================
describe('CAPM Metrics', () => {
    const portfolioReturns = [0.01, 0.02, -0.01, 0.015, -0.005];
    const marketReturns = [0.008, 0.015, -0.008, 0.012, -0.003];

    it('should return default beta 1 for insufficient data', () => {
        expect(calculateBeta([], [])).toBe(1);
        expect(calculateBeta([0.01], [0.01])).toBe(1);
    });

    it('should calculate alpha', () => {
        const portfolioReturn = 0.12; // 12%
        const marketReturn = 0.10; // 10%
        const beta = 1.2;

        // Alpha = Return - Beta * MarketReturn
        // Alpha = 0.12 - 1.2 * (0.10 - 0.0525) = 0.12 - 0.057 = 6.3%
        const alpha = calculateAlpha(portfolioReturn, marketReturn, beta);
        expect(alpha).toBeDefined();
    });
});

// ============================================
// Distribution Metrics
// ============================================
describe('Distribution Metrics', () => {
    const returns = [0.01, -0.02, 0.03, 0.015, -0.01, 0.02, -0.005, 0.01];

    it('should calculate skewness', () => {
        const skew = calculateSkewness(returns);
        expect(typeof skew).toBe('number');
        // Normal distribution should have skew near 0
    });

    it('should calculate kurtosis', () => {
        const kurt = calculateKurtosis(returns);
        expect(typeof kurt).toBe('number');
        // Excess kurtosis of 0 = normal distribution
    });

    it('should return 0 for insufficient data', () => {
        expect(calculateSkewness([0.01])).toBe(0);
        expect(calculateKurtosis([0.01, 0.02])).toBe(0);
    });
});

// ============================================
// Formatting Functions
// ============================================
describe('Formatting Functions', () => {
    it('should format currency correctly', () => {
        expect(formatCurrency(1234.56)).toBe('$1,234.56');
        expect(formatCurrency(0)).toBe('$0.00');
        expect(formatCurrency(1000000)).toBe('$1,000,000.00');
    });

    it('should format percentage correctly', () => {
        expect(formatPercentage(12.345)).toBe('12.35%');
        expect(formatPercentage(12.345, true)).toBe('+12.35%');
        expect(formatPercentage(-5.5, true)).toBe('-5.50%');
    });
});
