/**
 * Correlation Service
 * Calculate correlations between portfolio holdings
 */

import { fetchHistoricalPrices } from './apiService';

/**
 * Calculate Pearson correlation coefficient between two arrays
 */
function pearsonCorrelation(x, y) {
    const n = Math.min(x.length, y.length);
    if (n < 2) return 0;

    // Use same length
    const xSlice = x.slice(0, n);
    const ySlice = y.slice(0, n);

    const sumX = xSlice.reduce((a, b) => a + b, 0);
    const sumY = ySlice.reduce((a, b) => a + b, 0);
    const sumXY = xSlice.reduce((acc, xi, i) => acc + xi * ySlice[i], 0);
    const sumX2 = xSlice.reduce((acc, xi) => acc + xi * xi, 0);
    const sumY2 = ySlice.reduce((acc, yi) => acc + yi * yi, 0);

    const numerator = n * sumXY - sumX * sumY;
    const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));

    if (denominator === 0) return 0;

    return numerator / denominator;
}

/**
 * Calculate correlation matrix for portfolio holdings
 * @param {Array} holdings - Array of holdings with symbol property
 * @returns {Promise<Object>} - Correlation matrix and diversification score
 */
export async function calculateCorrelationMatrix(holdings) {
    if (!holdings || holdings.length < 2) {
        return {
            matrix: [],
            symbols: [],
            diversificationScore: 0,
            error: 'Need at least 2 holdings for correlation'
        };
    }

    const symbols = holdings.map(h => h.symbol);
    const n = symbols.length;

    // Fetch historical returns for all holdings
    const returnsMap = {};

    for (const symbol of symbols) {
        try {
            const returns = await fetchHistoricalPrices(symbol, 252); // 1 year
            returnsMap[symbol] = returns;
        } catch (err) {
            console.error(`Error fetching data for ${symbol}:`, err);
            returnsMap[symbol] = [];
        }
    }

    // Build correlation matrix
    const matrix = [];

    for (let i = 0; i < n; i++) {
        const row = [];
        for (let j = 0; j < n; j++) {
            if (i === j) {
                row.push(1); // Self-correlation is 1
            } else {
                const xi = returnsMap[symbols[i]];
                const xj = returnsMap[symbols[j]];

                if (xi.length === 0 || xj.length === 0) {
                    row.push(0); // No data
                } else {
                    const corr = pearsonCorrelation(xi, xj);
                    row.push(Math.round(corr * 100) / 100);
                }
            }
        }
        matrix.push(row);
    }

    // Calculate diversification score
    // Lower average correlation = better diversification
    let totalCorr = 0;
    let count = 0;

    for (let i = 0; i < n; i++) {
        for (let j = i + 1; j < n; j++) {
            totalCorr += Math.abs(matrix[i][j]);
            count++;
        }
    }

    const avgCorr = count > 0 ? totalCorr / count : 0;
    // Score: 0-100, where lower correlation = higher score
    const diversificationScore = Math.round((1 - avgCorr) * 100);

    return {
        matrix,
        symbols,
        diversificationScore,
        avgCorrelation: Math.round(avgCorr * 100) / 100
    };
}

/**
 * Get color for correlation value
 * @param {number} value - Correlation value (-1 to 1)
 * @returns {string} - HSL color string
 */
export function getCorrelationColor(value) {
    // Strong negative = green, zero = neutral, strong positive = red
    if (value >= 0.7) return 'hsl(0, 70%, 45%)';      // Strong positive - red
    if (value >= 0.4) return 'hsl(30, 70%, 50%)';     // Moderate positive - orange
    if (value >= 0.1) return 'hsl(50, 60%, 55%)';     // Weak positive - yellow
    if (value >= -0.1) return 'hsl(220, 20%, 55%)';   // Near zero - gray
    if (value >= -0.4) return 'hsl(170, 50%, 45%)';   // Weak negative - teal
    if (value >= -0.7) return 'hsl(140, 60%, 45%)';   // Moderate negative - green
    return 'hsl(120, 70%, 35%)';                       // Strong negative - dark green
}

/**
 * Get diversification rating
 */
export function getDiversificationRating(score) {
    if (score >= 80) return { label: 'Excellent', color: 'var(--color-success)' };
    if (score >= 60) return { label: 'Good', color: 'var(--color-success)' };
    if (score >= 40) return { label: 'Fair', color: 'var(--color-warning)' };
    if (score >= 20) return { label: 'Poor', color: 'var(--color-warning)' };
    return { label: 'Very Poor', color: 'var(--color-danger)' };
}
