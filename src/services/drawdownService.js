/**
 * Drawdown Analysis Service
 * Calculate historical drawdown and recovery metrics
 */

import { fetchHistoricalPrices } from './apiService';

/**
 * Calculate drawdown series from price/value data
 * @param {Array<number>} values - Time series of values
 * @returns {Object} - Drawdown data
 */
export function calculateDrawdownSeries(values) {
    if (!values || values.length < 2) {
        return {
            drawdowns: [],
            maxDrawdown: 0,
            maxDrawdownIndex: 0,
            recoveryPeriods: []
        };
    }

    const drawdowns = [];
    let runningMax = values[0];
    let maxDrawdown = 0;
    let maxDrawdownIndex = 0;

    for (let i = 0; i < values.length; i++) {
        if (values[i] > runningMax) {
            runningMax = values[i];
        }

        const drawdown = ((runningMax - values[i]) / runningMax) * 100;
        drawdowns.push(drawdown);

        if (drawdown > maxDrawdown) {
            maxDrawdown = drawdown;
            maxDrawdownIndex = i;
        }
    }

    // Identify recovery periods (from peak to trough to recovery)
    const recoveryPeriods = identifyRecoveryPeriods(values, drawdowns);

    return {
        drawdowns,
        maxDrawdown: Math.round(maxDrawdown * 100) / 100,
        maxDrawdownIndex,
        recoveryPeriods
    };
}

/**
 * Identify major drawdown and recovery periods
 */
function identifyRecoveryPeriods(values, drawdowns) {
    const periods = [];
    let inDrawdown = false;
    let peakIndex = 0;
    let troughIndex = 0;
    let peakValue = values[0];
    let troughValue = values[0];

    const significantDrawdown = 5; // 5% threshold

    for (let i = 1; i < values.length; i++) {
        if (!inDrawdown && drawdowns[i] >= significantDrawdown) {
            // Start of a significant drawdown
            inDrawdown = true;
            peakIndex = i - 1;
            peakValue = Math.max(...values.slice(0, i));
            troughIndex = i;
            troughValue = values[i];
        } else if (inDrawdown) {
            if (values[i] < troughValue) {
                troughIndex = i;
                troughValue = values[i];
            }

            // Check if recovered
            if (values[i] >= peakValue) {
                periods.push({
                    peakIndex,
                    troughIndex,
                    recoveryIndex: i,
                    peakValue,
                    troughValue,
                    drawdownPercent: ((peakValue - troughValue) / peakValue) * 100,
                    declineDays: troughIndex - peakIndex,
                    recoveryDays: i - troughIndex
                });
                inDrawdown = false;
            }
        }
    }

    // If still in drawdown at end
    if (inDrawdown) {
        periods.push({
            peakIndex,
            troughIndex,
            recoveryIndex: null,
            peakValue,
            troughValue,
            drawdownPercent: ((peakValue - troughValue) / peakValue) * 100,
            declineDays: troughIndex - peakIndex,
            recoveryDays: null // Not recovered
        });
    }

    return periods;
}

/**
 * Calculate portfolio-level drawdown from holdings
 * @param {Array} holdings - Portfolio holdings
 * @returns {Promise<Object>} - Drawdown analysis
 */
export async function calculatePortfolioDrawdown(holdings) {
    if (!holdings || holdings.length === 0) {
        return {
            chartData: [],
            maxDrawdown: 0,
            currentDrawdown: 0,
            recoveryPeriods: [],
            error: 'No holdings'
        };
    }

    try {
        // Get historical data for each holding
        const historicalData = {};
        const numDays = 252; // 1 year

        for (const holding of holdings) {
            const returns = await fetchHistoricalPrices(holding.symbol, numDays);
            historicalData[holding.symbol] = returns;
        }

        // Reconstruct portfolio value over time
        // Simplified: use weighted average of returns
        const totalValue = holdings.reduce((sum, h) => sum + h.currentPrice * h.shares, 0);
        const weights = {};

        for (const holding of holdings) {
            weights[holding.symbol] = (holding.currentPrice * holding.shares) / totalValue;
        }

        // Get minimum length across all holdings
        const minLength = Math.min(
            ...Object.values(historicalData).map(arr => arr.length).filter(len => len > 0)
        );

        if (minLength < 2) {
            return {
                chartData: [],
                maxDrawdown: 0,
                currentDrawdown: 0,
                recoveryPeriods: [],
                error: 'Insufficient historical data'
            };
        }

        // Calculate portfolio value at each point using returns
        const portfolioValues = [totalValue];

        for (let i = 0; i < minLength; i++) {
            let dayReturn = 0;
            for (const symbol of Object.keys(historicalData)) {
                const returns = historicalData[symbol];
                if (returns[i] !== undefined) {
                    dayReturn += weights[symbol] * returns[i];
                }
            }

            // Apply return to previous value
            const newValue = portfolioValues[portfolioValues.length - 1] * (1 + dayReturn);
            portfolioValues.push(newValue);
        }

        // Reverse so oldest is first
        portfolioValues.reverse();

        // Calculate drawdown series
        const analysis = calculateDrawdownSeries(portfolioValues);

        // Prepare chart data
        const chartData = portfolioValues.map((value, index) => ({
            day: index,
            value: Math.round(value * 100) / 100,
            drawdown: analysis.drawdowns[index] || 0
        }));

        // Current drawdown is the last value
        const currentDrawdown = analysis.drawdowns[analysis.drawdowns.length - 1] || 0;

        return {
            chartData,
            maxDrawdown: analysis.maxDrawdown,
            currentDrawdown: Math.round(currentDrawdown * 100) / 100,
            recoveryPeriods: analysis.recoveryPeriods,
            maxDrawdownIndex: analysis.maxDrawdownIndex
        };
    } catch (err) {
        console.error('Error calculating drawdown:', err);
        return {
            chartData: [],
            maxDrawdown: 0,
            currentDrawdown: 0,
            recoveryPeriods: [],
            error: err.message
        };
    }
}

/**
 * Get drawdown severity rating
 */
export function getDrawdownSeverity(drawdownPercent) {
    if (drawdownPercent >= 40) return { label: 'Severe', color: 'var(--color-danger)' };
    if (drawdownPercent >= 25) return { label: 'Major', color: 'var(--color-danger)' };
    if (drawdownPercent >= 15) return { label: 'Moderate', color: 'var(--color-warning)' };
    if (drawdownPercent >= 5) return { label: 'Minor', color: 'var(--color-warning)' };
    return { label: 'Minimal', color: 'var(--color-success)' };
}
