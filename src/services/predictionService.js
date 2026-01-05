/**
 * ML Prediction Service
 * Statistical models for portfolio predictions
 * 
 * DISCLAIMER: These are simplified statistical models, NOT true ML.
 * For educational/entertainment purposes only. Not financial advice.
 */

/**
 * Predict future returns using Monte Carlo + historical patterns
 */
export function predictReturns({
    holdings,
    historicalReturns = [],
    forecastDays = 30,
    simulations = 1000
}) {
    if (!holdings || holdings.length === 0) {
        return null;
    }

    const totalValue = holdings.reduce((sum, h) => sum + h.currentPrice * h.shares, 0);

    // Estimate daily volatility (simplified)
    const avgVolatility = 0.015; // ~1.5% daily
    const avgDrift = 0.0003; // Small positive drift

    const results = [];

    // Run Monte Carlo simulations
    for (let sim = 0; sim < simulations; sim++) {
        let value = totalValue;
        for (let day = 0; day < forecastDays; day++) {
            const randomReturn = avgDrift + avgVolatility * gaussianRandom();
            value *= (1 + randomReturn);
        }
        results.push(value);
    }

    results.sort((a, b) => a - b);

    // Calculate percentiles
    const p5 = results[Math.floor(simulations * 0.05)];
    const p25 = results[Math.floor(simulations * 0.25)];
    const p50 = results[Math.floor(simulations * 0.50)];
    const p75 = results[Math.floor(simulations * 0.75)];
    const p95 = results[Math.floor(simulations * 0.95)];

    // Expected return
    const expectedValue = results.reduce((a, b) => a + b, 0) / simulations;
    const expectedReturn = ((expectedValue - totalValue) / totalValue) * 100;

    return {
        currentValue: totalValue,
        forecastDays,
        predictions: {
            pessimistic: { value: p5, return: ((p5 - totalValue) / totalValue) * 100 },
            conservative: { value: p25, return: ((p25 - totalValue) / totalValue) * 100 },
            expected: { value: p50, return: ((p50 - totalValue) / totalValue) * 100 },
            optimistic: { value: p75, return: ((p75 - totalValue) / totalValue) * 100 },
            bullish: { value: p95, return: ((p95 - totalValue) / totalValue) * 100 }
        },
        confidence: {
            low: p5,
            high: p95,
            range: ((p95 - p5) / totalValue) * 100
        },
        expectedReturn,
        riskLevel: getRiskLevel(avgVolatility * Math.sqrt(forecastDays))
    };
}

/**
 * Detect anomalies in portfolio holdings
 */
export function detectAnomalies(holdings) {
    if (!holdings || holdings.length === 0) return [];

    const anomalies = [];
    const totalValue = holdings.reduce((sum, h) => sum + h.currentPrice * h.shares, 0);

    holdings.forEach(h => {
        const value = h.currentPrice * h.shares;
        const weight = (value / totalValue) * 100;
        const gainLoss = ((h.currentPrice - h.purchasePrice) / h.purchasePrice) * 100;

        // Concentration anomaly
        if (weight > 40) {
            anomalies.push({
                type: 'concentration',
                severity: 'high',
                symbol: h.symbol,
                message: `${h.symbol} represents ${weight.toFixed(1)}% of portfolio - extreme concentration risk`,
                recommendation: 'Consider diversifying to reduce single-stock risk'
            });
        } else if (weight > 25) {
            anomalies.push({
                type: 'concentration',
                severity: 'medium',
                symbol: h.symbol,
                message: `${h.symbol} at ${weight.toFixed(1)}% - high concentration`,
                recommendation: 'Monitor position size, consider trimming'
            });
        }

        // Gain anomaly (might want to harvest)
        if (gainLoss > 100) {
            anomalies.push({
                type: 'gain',
                severity: 'info',
                symbol: h.symbol,
                message: `${h.symbol} is up ${gainLoss.toFixed(1)}% - significant unrealized gain`,
                recommendation: 'Consider rebalancing or tax-gain harvesting if applicable'
            });
        }

        // Loss anomaly
        if (gainLoss < -30) {
            anomalies.push({
                type: 'loss',
                severity: 'warning',
                symbol: h.symbol,
                message: `${h.symbol} is down ${Math.abs(gainLoss).toFixed(1)}% - significant loss`,
                recommendation: 'Review thesis; consider tax-loss harvesting opportunity'
            });
        }
    });

    // Diversification anomaly
    if (holdings.length < 5) {
        anomalies.push({
            type: 'diversification',
            severity: 'medium',
            symbol: null,
            message: `Only ${holdings.length} holdings - limited diversification`,
            recommendation: 'Consider adding positions in different sectors'
        });
    }

    return anomalies;
}

/**
 * Predict risk metrics
 */
export function predictRisk(holdings, timeHorizon = 'month') {
    if (!holdings || holdings.length === 0) return null;

    const totalValue = holdings.reduce((sum, h) => sum + h.currentPrice * h.shares, 0);

    // Simplified risk calculations
    const dailyVol = 0.015;
    const periods = timeHorizon === 'day' ? 1 : timeHorizon === 'week' ? 5 : 21;
    const periodVol = dailyVol * Math.sqrt(periods);

    // Value at Risk (95% confidence)
    const var95 = totalValue * periodVol * 1.65;

    // Expected Shortfall (CVaR)
    const cvar = var95 * 1.4;

    // Maximum predicted drawdown
    const maxDrawdown = periodVol * 2.5;

    return {
        timeHorizon,
        volatility: (periodVol * 100).toFixed(2),
        var95: {
            percent: (var95 / totalValue * 100).toFixed(2),
            amount: var95
        },
        cvar: {
            percent: (cvar / totalValue * 100).toFixed(2),
            amount: cvar
        },
        maxDrawdown: (maxDrawdown * 100).toFixed(1),
        beta: estimateBeta(holdings),
        riskScore: Math.min(100, Math.round(periodVol * 100 * 10))
    };
}

/**
 * Suggest predictive rebalancing
 */
export function suggestRebalancing(holdings, targetRisk = 'moderate') {
    if (!holdings || holdings.length === 0) return [];

    const suggestions = [];
    const totalValue = holdings.reduce((sum, h) => sum + h.currentPrice * h.shares, 0);

    // Target weights based on risk profile
    const maxWeight = targetRisk === 'conservative' ? 15 : targetRisk === 'moderate' ? 25 : 35;

    holdings.forEach(h => {
        const weight = ((h.currentPrice * h.shares) / totalValue) * 100;

        if (weight > maxWeight) {
            const excess = weight - maxWeight;
            suggestions.push({
                action: 'reduce',
                symbol: h.symbol,
                currentWeight: weight.toFixed(1),
                targetWeight: maxWeight.toFixed(1),
                changePercent: -excess.toFixed(1),
                reason: `Exceeds ${targetRisk} risk target of ${maxWeight}%`
            });
        }
    });

    return suggestions;
}

// Helper functions
function gaussianRandom() {
    let u = 0, v = 0;
    while (u === 0) u = Math.random();
    while (v === 0) v = Math.random();
    return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
}

function getRiskLevel(volatility) {
    if (volatility < 0.05) return { level: 'Low', color: 'var(--color-success)' };
    if (volatility < 0.10) return { level: 'Moderate', color: 'var(--color-warning)' };
    if (volatility < 0.15) return { level: 'High', color: 'var(--color-danger)' };
    return { level: 'Very High', color: 'var(--color-danger)' };
}

function estimateBeta(holdings) {
    // Simplified beta estimation based on sectors
    const sectorBetas = {
        tech: 1.3, finance: 1.1, healthcare: 0.8, energy: 1.2,
        consumer: 0.9, utilities: 0.5, industrial: 1.0
    };

    const totalValue = holdings.reduce((sum, h) => sum + h.currentPrice * h.shares, 0);
    let weightedBeta = 0;

    holdings.forEach(h => {
        const weight = (h.currentPrice * h.shares) / totalValue;
        const sector = h.sector || 'tech';
        weightedBeta += weight * (sectorBetas[sector] || 1.0);
    });

    return weightedBeta.toFixed(2);
}
