import * as math from 'mathjs';
import jStat from 'jstat';

/**
 * Calculate total portfolio value
 * @param {Array} holdings - Array of holdings with currentPrice and shares
 * @returns {number} - Total portfolio value
 */
export function calculatePortfolioValue(holdings) {
    return holdings.reduce((total, holding) => {
        return total + (holding.currentPrice || 0) * (holding.shares || 0);
    }, 0);
}

/**
 * Calculate total cost basis of portfolio
 * @param {Array} holdings - Array of holdings
 * @returns {number} - Total cost basis
 */
export function calculateCostBasis(holdings) {
    return holdings.reduce((total, holding) => {
        return total + (holding.purchasePrice || 0) * (holding.shares || 0);
    }, 0);
}

/**
 * Calculate total and percentage gain/loss
 * @param {Array} holdings - Array of holdings
 * @returns {Object} - { totalGain, percentageGain }
 */
export function calculateGainLoss(holdings) {
    const currentValue = calculatePortfolioValue(holdings);
    const costBasis = calculateCostBasis(holdings);

    const totalGain = currentValue - costBasis;
    const percentageGain = costBasis > 0 ? (totalGain / costBasis) * 100 : 0;

    return {
        totalGain: Math.round(totalGain * 100) / 100,
        percentageGain: Math.round(percentageGain * 100) / 100,
    };
}

/**
 * Calculate portfolio volatility (standard deviation of returns)
 * @param {Array<number>} returns - Array of daily returns
 * @returns {number} - Annualized volatility as a percentage
 */
export function calculateVolatility(returns) {
    if (!returns || returns.length < 2) {
        return 0;
    }

    const stdDev = math.std(returns);
    // Annualize: multiply by sqrt(252 trading days)
    const annualizedVol = stdDev * Math.sqrt(252) * 100;

    return Math.round(annualizedVol * 100) / 100;
}

/**
 * Calculate weighted portfolio volatility based on holdings
 * @param {Array} holdings - Holdings with historicalReturns
 * @returns {number} - Portfolio volatility percentage
 */
export function calculatePortfolioVolatility(holdings) {
    if (!holdings || holdings.length === 0) {
        return 0;
    }

    // Calculate total portfolio value
    const totalValue = calculatePortfolioValue(holdings);
    if (totalValue === 0) return 0;

    // Calculate individual volatilities and weights
    const holdingsWithVol = holdings.map(holding => {
        const value = (holding.currentPrice || 0) * (holding.shares || 0);
        const weight = value / totalValue;
        const volatility = holding.volatility || 20; // Default 20% if not calculated
        return { weight, volatility };
    });

    // Simplified portfolio volatility (assumes uncorrelated assets)
    // Sum of (weight^2 * vol^2), then sqrt
    // For a more accurate calculation, we'd need correlation matrix
    const varianceSum = holdingsWithVol.reduce((sum, h) => {
        return sum + Math.pow(h.weight, 2) * Math.pow(h.volatility, 2);
    }, 0);

    // Add cross-correlation term (assume average correlation of 0.5)
    const corrTerm = holdingsWithVol.reduce((sum, h1, i) => {
        return sum + holdingsWithVol.slice(i + 1).reduce((inner, h2) => {
            return inner + 2 * h1.weight * h2.weight * h1.volatility * h2.volatility * 0.5;
        }, 0);
    }, 0);

    const portfolioVol = Math.sqrt(varianceSum + corrTerm);

    return Math.round(portfolioVol * 100) / 100;
}

/**
 * Get risk level based on volatility
 * @param {number} volatility - Portfolio volatility percentage
 * @returns {Object} - { level: 'low'|'medium'|'high', label, color }
 */
export function getRiskLevel(volatility) {
    if (volatility < 10) {
        return { level: 'low', label: 'Low Risk', color: '#10b981' };
    } else if (volatility < 20) {
        return { level: 'medium', label: 'Medium Risk', color: '#f59e0b' };
    } else {
        return { level: 'high', label: 'High Risk', color: '#ef4444' };
    }
}

/**
 * Calculate asset allocation by holding
 * @param {Array} holdings - Array of holdings
 * @returns {Array} - Array of { symbol, value, percentage, color }
 */
export function calculateAssetAllocation(holdings) {
    const totalValue = calculatePortfolioValue(holdings);

    if (totalValue === 0) {
        return [];
    }

    // Color palette for pie chart
    const colors = [
        '#6366f1', // Indigo
        '#8b5cf6', // Violet
        '#a855f7', // Purple
        '#d946ef', // Fuchsia
        '#ec4899', // Pink
        '#f43f5e', // Rose
        '#f97316', // Orange
        '#eab308', // Yellow
        '#22c55e', // Green
        '#14b8a6', // Teal
        '#06b6d4', // Cyan
        '#3b82f6', // Blue
    ];

    return holdings.map((holding, index) => {
        const value = (holding.currentPrice || 0) * (holding.shares || 0);
        const percentage = (value / totalValue) * 100;

        return {
            symbol: holding.symbol,
            value: Math.round(value * 100) / 100,
            percentage: Math.round(percentage * 100) / 100,
            color: colors[index % colors.length],
        };
    }).sort((a, b) => b.value - a.value);
}

/**
 * Calculate Sharpe Ratio (simplified, assuming risk-free rate of 4%)
 * @param {Array<number>} returns - Daily returns
 * @param {number} riskFreeRate - Annual risk-free rate (default 0.04)
 * @returns {number} - Sharpe ratio
 */
export function calculateSharpeRatio(returns, riskFreeRate = 0.04) {
    if (!returns || returns.length < 2) {
        return 0;
    }

    const meanReturn = math.mean(returns) * 252; // Annualize
    const stdDev = math.std(returns) * Math.sqrt(252); // Annualize

    if (stdDev === 0) return 0;

    const sharpe = (meanReturn - riskFreeRate) / stdDev;

    return Math.round(sharpe * 100) / 100;
}

/**
 * Calculate Value at Risk (VaR) at 95% confidence
 * @param {number} portfolioValue - Current portfolio value
 * @param {number} volatility - Portfolio volatility (as decimal)
 * @param {number} confidence - Confidence level (default 0.95)
 * @param {number} days - Time horizon in days (default 1)
 * @returns {number} - VaR amount (potential loss)
 */
export function calculateVaR(portfolioValue, volatility, confidence = 0.95, days = 1) {
    // z-score for confidence level
    const zScore = jStat.normal.inv(1 - confidence, 0, 1);

    // VaR = Portfolio Value * z-score * volatility * sqrt(days)
    const var95 = portfolioValue * Math.abs(zScore) * (volatility / 100) * Math.sqrt(days);

    return Math.round(var95 * 100) / 100;
}

/**
 * Format currency for display
 * @param {number} value - Value to format
 * @returns {string} - Formatted currency string
 */
export function formatCurrency(value) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(value);
}

/**
 * Format percentage for display
 * @param {number} value - Value to format
 * @param {boolean} includeSign - Include + sign for positive values
 * @returns {string} - Formatted percentage string
 */
export function formatPercentage(value, includeSign = false) {
    const sign = includeSign && value > 0 ? '+' : '';
    return `${sign}${value.toFixed(2)}%`;
}

// ============================================
// PROFESSIONAL-GRADE FINANCIAL METRICS
// ============================================

/**
 * Calculate CAGR (Compound Annual Growth Rate)
 * The true annualized return accounting for compounding
 * @param {number} startValue - Initial investment value
 * @param {number} endValue - Final investment value
 * @param {number} years - Number of years
 * @returns {number} - CAGR as percentage
 */
export function calculateCAGR(startValue, endValue, years) {
    if (startValue <= 0 || years <= 0) return 0;
    const cagr = (Math.pow(endValue / startValue, 1 / years) - 1) * 100;
    return Math.round(cagr * 100) / 100;
}

/**
 * Calculate Sortino Ratio - Risk-adjusted return using downside deviation
 * Better than Sharpe as it only penalizes harmful volatility
 * @param {Array<number>} returns - Daily/monthly returns
 * @param {number} riskFreeRate - Annual risk-free rate (default 5.25% Fed Funds 2024)
 * @param {number} targetReturn - Minimum acceptable return (default 0)
 * @returns {number} - Sortino ratio
 */
export function calculateSortinoRatio(returns, riskFreeRate = 0.0525, targetReturn = 0) {
    if (!returns || returns.length < 2) return 0;

    const meanReturn = math.mean(returns) * 252; // Annualize daily returns
    const targetDaily = targetReturn / 252;

    // Only consider returns below target (downside)
    const downsideReturns = returns.filter(r => r < targetDaily);

    if (downsideReturns.length === 0) return 3; // Cap at 3 if no downside

    // Calculate downside deviation
    const downsideVariance = downsideReturns.reduce((sum, r) =>
        sum + Math.pow(r - targetDaily, 2), 0) / downsideReturns.length;
    const downsideDeviation = Math.sqrt(downsideVariance) * Math.sqrt(252);

    if (downsideDeviation === 0) return 3;

    const sortino = (meanReturn - riskFreeRate) / downsideDeviation;
    return Math.round(sortino * 100) / 100;
}

/**
 * Calculate CVaR (Conditional Value at Risk) / Expected Shortfall
 * Average loss when VaR is breached - essential for tail risk
 * @param {number} portfolioValue - Current portfolio value
 * @param {Array<number>} returns - Historical returns
 * @param {number} confidence - Confidence level (default 0.95)
 * @returns {Object} - { var95, cvar95, percentLoss }
 */
export function calculateCVaR(portfolioValue, returns, confidence = 0.95) {
    if (!returns || returns.length < 10) {
        return { var95: 0, cvar95: 0, percentLoss: 0 };
    }

    // Sort returns ascending (worst to best)
    const sortedReturns = [...returns].sort((a, b) => a - b);

    // VaR index (e.g., for 95% confidence, look at worst 5%)
    const varIndex = Math.floor(sortedReturns.length * (1 - confidence));
    const varReturn = sortedReturns[varIndex];

    // CVaR = average of returns worse than VaR
    const tailReturns = sortedReturns.slice(0, varIndex + 1);
    const cvarReturn = tailReturns.reduce((a, b) => a + b, 0) / tailReturns.length;

    // Convert to dollar amounts (daily)
    const var95 = Math.abs(varReturn) * portfolioValue;
    const cvar95 = Math.abs(cvarReturn) * portfolioValue;

    return {
        var95: Math.round(var95 * 100) / 100,
        cvar95: Math.round(cvar95 * 100) / 100,
        percentLoss: Math.round(Math.abs(cvarReturn) * 10000) / 100
    };
}

/**
 * Calculate Maximum Drawdown
 * Worst peak-to-trough decline - critical for understanding risk
 * @param {Array<number>} values - Time series of portfolio values
 * @returns {Object} - { maxDrawdown, peakValue, troughValue, recoveryDays }
 */
export function calculateMaxDrawdown(values) {
    if (!values || values.length < 2) {
        return { maxDrawdown: 0, maxDrawdownPercent: 0, peakValue: 0, troughValue: 0 };
    }

    let peak = values[0];
    let maxDrawdown = 0;
    let maxDrawdownPercent = 0;
    let peakValue = values[0];
    let troughValue = values[0];
    let peakIndex = 0;
    let troughIndex = 0;

    for (let i = 1; i < values.length; i++) {
        if (values[i] > peak) {
            peak = values[i];
            peakIndex = i;
        }

        const drawdown = peak - values[i];
        const drawdownPercent = (drawdown / peak) * 100;

        if (drawdownPercent > maxDrawdownPercent) {
            maxDrawdown = drawdown;
            maxDrawdownPercent = drawdownPercent;
            peakValue = peak;
            troughValue = values[i];
            troughIndex = i;
        }
    }

    return {
        maxDrawdown: Math.round(maxDrawdown * 100) / 100,
        maxDrawdownPercent: Math.round(maxDrawdownPercent * 100) / 100,
        peakValue: Math.round(peakValue * 100) / 100,
        troughValue: Math.round(troughValue * 100) / 100,
        drawdownDays: troughIndex - peakIndex
    };
}

/**
 * Calculate Calmar Ratio
 * Return per unit of maximum drawdown risk
 * @param {number} cagr - Compound annual growth rate
 * @param {number} maxDrawdownPercent - Maximum drawdown as percentage
 * @returns {number} - Calmar ratio
 */
export function calculateCalmarRatio(cagr, maxDrawdownPercent) {
    if (maxDrawdownPercent <= 0) return 0;
    const calmar = cagr / maxDrawdownPercent;
    return Math.round(calmar * 100) / 100;
}

/**
 * Calculate Beta - Portfolio sensitivity to market
 * @param {Array<number>} portfolioReturns - Portfolio daily returns
 * @param {Array<number>} marketReturns - Market (S&P 500) daily returns
 * @returns {number} - Beta coefficient
 */
export function calculateBeta(portfolioReturns, marketReturns) {
    if (!portfolioReturns || !marketReturns || portfolioReturns.length < 30) {
        return 1; // Default to market beta
    }

    const n = Math.min(portfolioReturns.length, marketReturns.length);
    const pReturns = portfolioReturns.slice(0, n);
    const mReturns = marketReturns.slice(0, n);

    const pMean = math.mean(pReturns);
    const mMean = math.mean(mReturns);

    let covariance = 0;
    let marketVariance = 0;

    for (let i = 0; i < n; i++) {
        covariance += (pReturns[i] - pMean) * (mReturns[i] - mMean);
        marketVariance += Math.pow(mReturns[i] - mMean, 2);
    }

    covariance /= n;
    marketVariance /= n;

    if (marketVariance === 0) return 1;

    const beta = covariance / marketVariance;
    return Math.round(beta * 100) / 100;
}

/**
 * Calculate Alpha (Jensen's Alpha)
 * Excess return above CAPM expected return
 * @param {number} portfolioReturn - Annual portfolio return
 * @param {number} marketReturn - Annual market return  
 * @param {number} beta - Portfolio beta
 * @param {number} riskFreeRate - Risk-free rate
 * @returns {number} - Alpha as percentage
 */
export function calculateAlpha(portfolioReturn, marketReturn, beta, riskFreeRate = 0.0525) {
    const expectedReturn = riskFreeRate + beta * (marketReturn - riskFreeRate);
    const alpha = (portfolioReturn - expectedReturn) * 100;
    return Math.round(alpha * 100) / 100;
}

/**
 * Calculate Skewness - Asymmetry of return distribution
 * Negative skew = more downside risk (common in markets)
 * @param {Array<number>} returns - Array of returns
 * @returns {number} - Skewness coefficient
 */
export function calculateSkewness(returns) {
    if (!returns || returns.length < 3) return 0;

    const n = returns.length;
    const mean = math.mean(returns);
    const stdDev = math.std(returns);

    if (stdDev === 0) return 0;

    const sumCubed = returns.reduce((sum, r) => sum + Math.pow((r - mean) / stdDev, 3), 0);
    const skewness = (n / ((n - 1) * (n - 2))) * sumCubed;

    return Math.round(skewness * 100) / 100;
}

/**
 * Calculate Kurtosis - Fat tails in distribution
 * High kurtosis = more extreme events than normal distribution
 * @param {Array<number>} returns - Array of returns
 * @returns {number} - Excess kurtosis (0 = normal distribution)
 */
export function calculateKurtosis(returns) {
    if (!returns || returns.length < 4) return 0;

    const n = returns.length;
    const mean = math.mean(returns);
    const stdDev = math.std(returns);

    if (stdDev === 0) return 0;

    const sumQuartic = returns.reduce((sum, r) => sum + Math.pow((r - mean) / stdDev, 4), 0);
    const kurtosis = ((n * (n + 1)) / ((n - 1) * (n - 2) * (n - 3))) * sumQuartic;
    const excessKurtosis = kurtosis - (3 * (n - 1) * (n - 1)) / ((n - 2) * (n - 3));

    return Math.round(excessKurtosis * 100) / 100;
}

/**
 * Generate comprehensive portfolio analytics
 * @param {Array} holdings - Portfolio holdings
 * @param {Array<number>} historicalValues - Historical portfolio values
 * @returns {Object} - Complete analytics dashboard
 */
export function generatePortfolioAnalytics(holdings, historicalValues = []) {
    const portfolioValue = calculatePortfolioValue(holdings);
    const costBasis = calculateCostBasis(holdings);
    const volatility = calculatePortfolioVolatility(holdings);

    // Calculate returns from historical values
    const returns = [];
    for (let i = 1; i < historicalValues.length; i++) {
        returns.push((historicalValues[i] - historicalValues[i - 1]) / historicalValues[i - 1]);
    }

    const gainLoss = calculateGainLoss(holdings);
    const years = historicalValues.length / 252 || 1; // Approximate years from daily data
    const cagr = calculateCAGR(costBasis, portfolioValue, years);
    const drawdown = calculateMaxDrawdown(historicalValues);

    return {
        value: {
            current: portfolioValue,
            costBasis: costBasis,
            gain: gainLoss.totalGain,
            gainPercent: gainLoss.percentageGain
        },
        performance: {
            cagr: cagr,
            sharpe: calculateSharpeRatio(returns),
            sortino: calculateSortinoRatio(returns),
            calmar: calculateCalmarRatio(cagr, drawdown.maxDrawdownPercent)
        },
        risk: {
            volatility: volatility,
            var95: calculateVaR(portfolioValue, volatility),
            cvar: calculateCVaR(portfolioValue, returns),
            maxDrawdown: drawdown.maxDrawdownPercent,
            beta: 1, // Would need market data
            skewness: calculateSkewness(returns),
            kurtosis: calculateKurtosis(returns)
        },
        riskLevel: getRiskLevel(volatility)
    };
}

